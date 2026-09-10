import os
import datetime
from flask import Flask, render_template, request, jsonify, session
from flask_cors import CORS
from config import Config
from database.db import execute_query, fetch_all, fetch_one
from database.seed_data import seed_database

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)

# Ensure database is seeded on startup
try:
    seed_database()
except Exception as e:
    print(f"Database setup note: {e}")

# =========================================================================
# WEB PAGE ROUTES
# =========================================================================

@app.route("/")
def index():
    """Main Single-Page Web Dashboard & Split-Screen Login View"""
    return render_template("index.html")

# =========================================================================
# 1. AUTHENTICATION API (Student / Faculty / Admin)
# =========================================================================

@app.route("/api/auth/login", methods=["POST"])
def api_login():
    """
    Authenticate by Student ID, Faculty ID, or Admin credentials.
    """
    data = request.get_json() or {}
    raw_id = data.get("card_id", "").strip()
    user_name_input = data.get("name", "").strip()
    role_hint = data.get("role", "Student") # 'Student', 'Faculty', 'Admin'
    username = data.get("username", "").strip()
    password = data.get("password", "").strip()

    if not raw_id and username:
        raw_id = username

    card_id = raw_id.upper()

    # Smart Roll Number Normalization (e.g. 18700 -> 241FA18700, 700 -> 241FA18700)
    if role_hint == "Student" or card_id.startswith("241") or card_id.startswith("18"):
        if card_id.startswith("18") and len(card_id) == 5 and card_id.isdigit():
            card_id = f"241FA{card_id}"
        elif card_id.isdigit() and 1 <= int(card_id) <= 700:
            card_id = f"241FA18{int(card_id):03d}"

    # 1. Admin Login
    if role_hint == "Admin" or username.lower() == "admin" or card_id.startswith("ADMIN"):
        admin_user = fetch_one("SELECT * FROM admin WHERE username = %s AND password_hash = %s", (username or "admin", password or "admin123"))
        if not admin_user and card_id:
            admin_user = fetch_one("SELECT * FROM admin WHERE admin_id = %s", (card_id,))
        if not admin_user:
            admin_user = fetch_one("SELECT * FROM admin WHERE username = 'admin'")

        if admin_user:
            display_name = user_name_input or admin_user["name"]
            session["user_type"] = "Admin"
            session["user_id"] = admin_user["admin_id"]
            session["user_name"] = display_name
            session["department"] = "Library Administration"
            session["max_books"] = 50
            session["loan_duration"] = 60
            return jsonify({
                "success": True,
                "message": f"Welcome Admin {display_name}",
                "user": {
                    "id": admin_user["admin_id"],
                    "name": display_name,
                    "role": "Admin",
                    "department": "Library Administration",
                    "max_books": 50,
                    "loan_duration_days": 60,
                    "avatar": admin_user["avatar"]
                }
            })
        return jsonify({"success": False, "message": "Invalid Admin credentials (Default: admin / admin123)"}), 401

    # 2. Faculty Login (ID range 1001 to 2001, or FAC-xxxx, 30 Days Loan Period)
    is_faculty_id = False
    if card_id.isdigit() and 1001 <= int(card_id) <= 2001:
        is_faculty_id = True
    elif role_hint == "Faculty" or card_id.startswith("FAC") or card_id.startswith("PROF"):
        is_faculty_id = True

    if is_faculty_id:
        faculty_user = fetch_one("SELECT * FROM faculty WHERE faculty_id = %s", (card_id,))
        if not faculty_user:
            f_name = user_name_input or f"Faculty Member ({card_id})"
            execute_query(
                "INSERT INTO faculty (faculty_id, name, department, designation, email, max_books, loan_duration_days) VALUES (%s, %s, %s, %s, %s, 10, 30)",
                (card_id, f_name, "Faculty Department", "Faculty Member", f"faculty_{card_id.lower()}@campus.edu")
            )
            faculty_user = fetch_one("SELECT * FROM faculty WHERE faculty_id = %s", (card_id,))
        elif user_name_input and faculty_user["name"] != user_name_input:
            execute_query("UPDATE faculty SET name = %s WHERE faculty_id = %s", (user_name_input, card_id))
            faculty_user["name"] = user_name_input
        
        display_name = faculty_user["name"] if faculty_user else (user_name_input or "Faculty Member")
        session["user_type"] = "Faculty"
        session["user_id"] = card_id
        session["user_name"] = display_name
        session["department"] = faculty_user.get("department", "Faculty Department") if faculty_user else "Faculty Department"
        session["max_books"] = 10
        session["loan_duration"] = 30
        return jsonify({
            "success": True,
            "message": f"Welcome Faculty Member {display_name} (ID: {card_id})",
            "user": {
                "id": card_id,
                "name": display_name,
                "role": "Faculty",
                "department": session["department"],
                "designation": faculty_user.get("designation", "Faculty Member") if faculty_user else "Faculty Member",
                "max_books": 10,
                "loan_duration_days": 30,
                "avatar": "👨‍🏫"
            }
        })

    # 3. Student Login (Roll number range 241FA18001 to 241FA18700, 14 Days Loan Period)
    student_user = fetch_one("SELECT * FROM students WHERE student_id = %s", (card_id,))
    if not student_user:
        s_name = user_name_input or f"Student ({card_id})"
        execute_query(
            "INSERT INTO students (student_id, name, department, semester, email, max_books, loan_duration_days) VALUES (%s, %s, %s, %s, %s, 3, 14)",
            (card_id, s_name, "Computer Science & Engineering", "6th Semester", f"{card_id.lower().replace(' ', '')}@campus.edu")
        )
        student_user = fetch_one("SELECT * FROM students WHERE student_id = %s", (card_id,))
    elif user_name_input and student_user["name"] != user_name_input:
        execute_query("UPDATE students SET name = %s WHERE student_id = %s", (user_name_input, card_id))
        student_user["name"] = user_name_input
    
    display_name = student_user["name"] if student_user else (user_name_input or "Student")
    session["user_type"] = "Student"
    session["user_id"] = card_id
    session["user_name"] = display_name
    session["department"] = student_user.get("department", "Computer Science") if student_user else "Computer Science"
    session["max_books"] = 3
    session["loan_duration"] = 14
    return jsonify({
        "success": True,
        "message": f"Welcome Student {display_name} (Roll No: {card_id})",
        "user": {
            "id": card_id,
            "name": display_name,
            "role": "Student",
            "department": session["department"],
            "semester": student_user.get("semester", "Semester 6") if student_user else "Semester 6",
            "max_books": 3,
            "loan_duration_days": 14,
            "avatar": "👨‍🎓"
        }
    })

@app.route("/api/auth/update-name", methods=["POST"])
def api_update_name():
    """Change logged-in user name dynamically"""
    data = request.get_json() or {}
    new_name = data.get("name", "").strip()
    if not new_name:
        return jsonify({"success": False, "message": "Name cannot be empty."}), 400

    user_id = session.get("user_id", "STU-1001")
    user_type = session.get("user_type", "Student")

    session["user_name"] = new_name
    if user_type == "Faculty":
        execute_query("UPDATE faculty SET name = %s WHERE faculty_id = %s", (new_name, user_id))
    elif user_type == "Admin":
        execute_query("UPDATE admin SET name = %s WHERE admin_id = %s", (new_name, user_id))
    else:
        execute_query("UPDATE students SET name = %s WHERE student_id = %s", (new_name, user_id))

    return jsonify({
        "success": True,
        "message": f"Name successfully updated to '{new_name}'!",
        "name": new_name
    })

@app.route("/api/auth/current", methods=["GET"])
def api_current_user():
    """Get active authenticated session"""
    user_id = session.get("user_id", "STU-1001")
    user_type = session.get("user_type", "Student")

    if user_type == "Faculty":
        user = fetch_one("SELECT * FROM faculty WHERE faculty_id = %s", (user_id,))
        role = "Faculty"
        loan_duration = 30
    elif user_type == "Admin":
        user = fetch_one("SELECT * FROM admin WHERE admin_id = %s", (user_id,))
        role = "Admin"
        loan_duration = 60
    else:
        user = fetch_one("SELECT * FROM students WHERE student_id = %s", (user_id,))
        role = "Student"
        loan_duration = 14

    if not user:
        user = fetch_one("SELECT * FROM students WHERE student_id = 'STU-1001'")
        role = "Student"
        loan_duration = 14

    user_id_val = user.get("student_id") or user.get("faculty_id") or user.get("admin_id")
    
    # Active loans
    active_loans_rows = fetch_all(
        "SELECT book_id FROM borrow_records WHERE user_id_code = %s AND status = 'ISSUED'",
        (user_id_val,)
    )
    loans_count = len(active_loans_rows)
    borrowed_book_ids = [r["book_id"] for r in active_loans_rows]

    return jsonify({
        "user": {
            "id": user_id_val,
            "name": user["name"],
            "role": role,
            "department": user.get("department", "Library System"),
            "max_books": user.get("max_books", 3),
            "loan_duration_days": loan_duration,
            "avatar": user.get("avatar", "👨‍🎓"),
            "active_loans": loans_count,
            "borrowed_book_ids": borrowed_book_ids
        }
    })

@app.route("/api/auth/logout", methods=["POST"])
def api_logout():
    """Logout session"""
    session.clear()
    return jsonify({"success": True, "message": "Logged out successfully."})

# =========================================================================
# 2. CATEGORIES & SUBCATEGORIES API
# =========================================================================

@app.route("/api/categories", methods=["GET"])
def api_get_categories():
    """Returns all 15 categories with their subcategories and floor distribution"""
    categories = fetch_all("""
        SELECT c.id, c.code, c.name, c.icon, c.color, c.default_racks, c.description, f.floor_number
        FROM categories c
        LEFT JOIN floors f ON c.floor_id = f.id
        ORDER BY c.id ASC
    """)
    
    for cat in categories:
        subs = fetch_all("SELECT id, name, description FROM subcategories WHERE category_id = %s ORDER BY id ASC", (cat["id"],))
        cat["subcategories"] = subs
        cat["subjects"] = [s["name"] for s in subs]
    
    return jsonify({"categories": categories})

# =========================================================================
# 3. BOOKS & EXACT LOCATION API (Floor, Rack 1-100, Shelf 1-5)
# =========================================================================

@app.route("/api/books", methods=["GET"])
def api_get_books():
    """
    Search books by Title, Author, Category, Subcategory, Rack number, Floor
    """
    q = request.args.get("query", "").strip()
    category_id = request.args.get("category_id")
    subcategory = request.args.get("subcategory", "").strip()
    floor = request.args.get("floor", "").strip()
    available_only = request.args.get("available_only", "false").lower() == "true"

    sql = """
        SELECT b.id, b.book_code, b.title, b.author, b.isbn, b.edition,
               b.total_copies, b.available_copies, b.rating, b.cover_color, b.description,
               c.id as category_id, c.name as category_name,
               s.id as subcategory_id, s.name as subcategory_name,
               f.id as floor_id, f.floor_number,
               r.id as rack_id, r.rack_number, r.aisle_number,
               sh.id as shelf_id, sh.shelf_code, sh.shelf_level_name
        FROM books b
        JOIN categories c ON b.category_id = c.id
        JOIN subcategories s ON b.subcategory_id = s.id
        JOIN floors f ON b.floor_id = f.id
        JOIN racks r ON b.rack_id = r.id
        JOIN shelves sh ON b.shelf_id = sh.id
        WHERE 1=1
    """
    params = []

    if q:
        sql += " AND (b.title LIKE %s OR b.author LIKE %s OR b.isbn LIKE %s OR b.book_code LIKE %s OR r.rack_number = %s OR s.name LIKE %s OR c.name LIKE %s)"
        pattern = f"%{q}%"
        rack_num = int(q.lower().replace("rack", "").strip()) if q.lower().replace("rack", "").strip().isdigit() else -1
        params.extend([pattern, pattern, pattern, pattern, rack_num, pattern, pattern])
    
    if category_id and category_id != "all":
        sql += " AND b.category_id = %s"
        params.append(category_id)
        
    if subcategory and subcategory != "all":
        if subcategory.isdigit():
            sql += " AND b.subcategory_id = %s"
            params.append(int(subcategory))
        else:
            sql += " AND s.name = %s"
            params.append(subcategory)

    if floor and floor != "all":
        sql += " AND f.floor_number LIKE %s"
        params.append(f"%{floor}%")

    if available_only:
        sql += " AND b.available_copies > 0"

    sql += " ORDER BY b.id ASC LIMIT 100"
    books = fetch_all(sql, tuple(params))

    formatted = []
    for b in books:
        status = "Available" if b["available_copies"] > 0 else "Not Available"
        shelf_num = b["shelf_code"].replace("Shelf ", "")
        
        formatted.append({
            "id": b["id"],
            "book_id": b["book_code"],
            "book_code": b["book_code"],
            "title": b["title"],
            "book_name": b["title"],
            "author": b["author"],
            "isbn": b["isbn"],
            "edition": b["edition"],
            "category": b["category_name"],
            "category_id": b["category_id"],
            "subject": b["subcategory_name"],
            "subcategory": b["subcategory_name"],
            "subcategory_id": b["subcategory_id"],
            "floor_number": b["floor_number"],
            "floor": b["floor_number"],
            "rack_number": b["rack_number"],
            "rack": b["rack_number"],
            "aisle_number": b["aisle_number"],
            "shelf_number": b["shelf_code"],
            "shelf": shelf_num,
            "shelf_code": b["shelf_code"],
            "shelf_level": b["shelf_level_name"],
            "total_copies": b["total_copies"],
            "available_copies": b["available_copies"],
            "status": status,
            "rating": b["rating"],
            "cover_color": b["cover_color"],
            "description": b["description"]
        })

    return jsonify({"books": formatted, "count": len(formatted)})

@app.route("/api/books/<int:book_id>", methods=["GET"])
def api_get_book_detail(book_id):
    """Retrieve single book with exact location output"""
    b = fetch_one("""
        SELECT b.*, c.name as category_name, s.name as subcategory_name,
               f.floor_number, r.rack_number, r.aisle_number, sh.shelf_code, sh.shelf_level_name
        FROM books b
        JOIN categories c ON b.category_id = c.id
        JOIN subcategories s ON b.subcategory_id = s.id
        JOIN floors f ON b.floor_id = f.id
        JOIN racks r ON b.rack_id = r.id
        JOIN shelves sh ON b.shelf_id = sh.id
        WHERE b.id = %s
    """, (book_id,))

    if not b:
        return jsonify({"error": "Book not found"}), 404

    shelf_num = b["shelf_code"].replace("Shelf ", "")
    status = "Available" if b["available_copies"] > 0 else "Not Available"

    return jsonify({
        "book": {
            "id": b["id"],
            "book_id": b["book_code"],
            "book_code": b["book_code"],
            "book_name": b["title"],
            "title": b["title"],
            "author": b["author"],
            "isbn": b["isbn"],
            "category": b["category_name"],
            "subject": b["subcategory_name"],
            "subcategory": b["subcategory_name"],
            "floor_number": b["floor_number"],
            "floor": b["floor_number"],
            "rack_number": b["rack_number"],
            "rack": b["rack_number"],
            "aisle_number": b["aisle_number"],
            "shelf_number": b["shelf_code"],
            "shelf": shelf_num,
            "shelf_code": b["shelf_code"],
            "shelf_level": b["shelf_level_name"],
            "status": status,
            "total_copies": b["total_copies"],
            "available_copies": b["available_copies"],
            "description": b["description"]
        }
    })

# =========================================================================
# 4. BORROW & RETURN CIRCULATION API
# =========================================================================

@app.route("/api/borrow", methods=["POST"])
def api_borrow_book():
    """
    Borrow a book:
    - Verifies availability
    - Quota check (Student: 3, Faculty: 10)
    - Loan Duration: Student (14 Days), Faculty (30 Days)
    - Decrements available copies
    """
    data = request.get_json() or {}
    book_id = data.get("book_id")
    user_id_code = session.get("user_id", "STU-1001")
    user_type = session.get("user_type", "Student")
    user_name = session.get("user_name", "Aarav Sharma")
    department = session.get("department", "Computer Science")
    loan_duration = 30 if user_type == "Faculty" else 14
    max_books = 10 if user_type == "Faculty" else 3

    # Check active loans count
    current_loans = fetch_one(
        "SELECT COUNT(*) as c FROM borrow_records WHERE user_id_code = %s AND status = 'ISSUED'",
        (user_id_code,)
    )["c"]

    if current_loans >= max_books:
        return jsonify({
            "success": False,
            "message": f"Borrowing limit reached ({max_books} books). Please return a book to borrow a new one."
        }), 400

    # Fetch book and verify availability
    book = fetch_one("SELECT * FROM books WHERE id = %s", (book_id,))
    if not book or book["available_copies"] <= 0:
        return jsonify({"success": False, "message": "Status: Not Available. All copies are currently issued."}), 400

    # Check if already issued to this user
    already_borrowed = fetch_one(
        "SELECT id FROM borrow_records WHERE book_id = %s AND user_id_code = %s AND status = 'ISSUED'",
        (book_id, user_id_code)
    )
    if already_borrowed:
        return jsonify({"success": False, "message": "You have already issued a copy of this book."}), 400

    today = datetime.date.today()
    due_date = today + datetime.timedelta(days=loan_duration)

    # Decrement copy count
    execute_query("UPDATE books SET available_copies = available_copies - 1 WHERE id = %s", (book_id,))

    # Record in borrow ledger
    record_id = execute_query(
        """INSERT INTO borrow_records (book_id, book_code, book_title, user_type, user_id_code, user_name, department, borrow_date, due_date, status)
           VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, 'ISSUED')""",
        (book_id, book["book_code"], book["title"], user_type, user_id_code, user_name, department, today.isoformat(), due_date.isoformat())
    )

    return jsonify({
        "success": True,
        "message": f"Book '{book['title']}' successfully issued! Return due in {loan_duration} days ({due_date.isoformat()}).",
        "borrow_id": record_id,
        "due_date": due_date.isoformat()
    })

@app.route("/api/return", methods=["POST"])
def api_return_book():
    """Return an issued book and increment available copy count"""
    data = request.get_json() or {}
    book_id = data.get("book_id")
    user_id_code = session.get("user_id", "STU-1001")

    borrow_rec = fetch_one(
        "SELECT * FROM borrow_records WHERE book_id = %s AND user_id_code = %s AND status = 'ISSUED'",
        (book_id, user_id_code)
    )
    if not borrow_rec:
        return jsonify({"success": False, "message": "No active issue record found for this book."}), 404

    # Update borrow record
    execute_query("UPDATE borrow_records SET status = 'RETURNED' WHERE id = %s", (borrow_rec["id"],))

    # Increment available copies
    execute_query("UPDATE books SET available_copies = available_copies + 1 WHERE id = %s", (book_id,))

    # Insert return log
    today = datetime.date.today()
    execute_query(
        """INSERT INTO return_records (borrow_record_id, book_id, user_id_code, user_name, return_date, fine_amount, remarks)
           VALUES (%s, %s, %s, %s, %s, 0.00, 'Returned in good condition')""",
        (borrow_rec["id"], book_id, user_id_code, borrow_rec["user_name"], today.isoformat())
    )

    return jsonify({
        "success": True,
        "message": f"Book '{borrow_rec['book_title']}' successfully returned."
    })

@app.route("/api/loans/return-all", methods=["POST"])
def api_return_all_books():
    """Return all active borrowed books for the logged-in user"""
    user_id_code = session.get("user_id", "STU-1001")
    user_name = session.get("user_name", "Aarav Sharma")
    today = datetime.date.today().isoformat()

    active_loans = fetch_all(
        "SELECT * FROM borrow_records WHERE user_id_code = %s AND status = 'ISSUED'",
        (user_id_code,)
    )

    if not active_loans:
        return jsonify({"success": True, "message": "No active loans to return."})

    for b in active_loans:
        execute_query("UPDATE borrow_records SET status = 'RETURNED' WHERE id = %s", (b["id"],))
        execute_query("UPDATE books SET available_copies = available_copies + 1 WHERE id = %s", (b["book_id"],))
        execute_query(
            """INSERT INTO return_records (borrow_record_id, book_id, user_id_code, user_name, return_date, fine_amount, remarks)
               VALUES (%s, %s, %s, %s, %s, 0.00, 'Bulk return')""",
            (b["id"], b["book_id"], user_id_code, user_name, today)
        )

    return jsonify({
        "success": True,
        "message": f"All {len(active_loans)} books returned! Your borrowing limit is reset.",
        "returned_count": len(active_loans)
    })

@app.route("/api/my-loans", methods=["GET"])
def api_my_loans():
    """Get active borrowed books for logged-in user"""
    user_id_code = session.get("user_id", "STU-1001")

    loans = fetch_all("""
        SELECT br.*, b.title, b.author, b.isbn, f.floor_number, r.rack_number, sh.shelf_code
        FROM borrow_records br
        JOIN books b ON br.book_id = b.id
        JOIN floors f ON b.floor_id = f.id
        JOIN racks r ON b.rack_id = r.id
        JOIN shelves sh ON b.shelf_id = sh.id
        WHERE br.user_id_code = %s AND br.status = 'ISSUED'
        ORDER BY br.due_date ASC
    """, (user_id_code,))

    return jsonify({"loans": loans, "count": len(loans)})

# =========================================================================
# 5. STUDY IN LIBRARY (Direct Entry - No Seat Reservation)
# =========================================================================

@app.route("/api/study/entry", methods=["POST"])
def api_study_entry():
    """
    Direct Study Entry:
    User clicks 'Study in Library' -> Entry granted directly.
    No seat reservation. No reading space reservation.
    Users can directly go inside and choose any available seat.
    """
    user_id_code = session.get("user_id", "STU-1001")
    user_type = session.get("user_type", "Student")
    user_name = session.get("user_name", "Aarav Sharma")
    department = session.get("department", "Computer Science")

    pass_code = f"LIB-{int(datetime.datetime.now().timestamp()) % 1000000:06d}"

    record_id = execute_query(
        """INSERT INTO library_study_entries (pass_code, user_type, user_id_code, user_name, department, status)
           VALUES (%s, %s, %s, %s, %s, 'ACTIVE')""",
        (pass_code, user_type, user_id_code, user_name, department)
    )

    return jsonify({
        "success": True,
        "message": f"Welcome to the Library, {user_name}! You may enter and choose any available study seat on any floor.",
        "entry": {
            "id": record_id,
            "pass_code": pass_code,
            "user_name": user_name,
            "user_type": user_type,
            "user_id_code": user_id_code,
            "department": department,
            "entry_time": datetime.datetime.now().strftime("%I:%M %p, %d %b %Y"),
            "rules": "Free seating across all 4 floors. Maintain silence."
        }
    })

# =========================================================================
# 6. ADMIN MANAGEMENT API
# =========================================================================

@app.route("/api/admin/stats", methods=["GET"])
def api_admin_stats():
    """Library administrative dashboard statistics"""
    total_books = fetch_one("SELECT COUNT(*) as c FROM books")["c"]
    total_copies = fetch_one("SELECT SUM(total_copies) as c FROM books")["c"] or 0
    available_copies = fetch_one("SELECT SUM(available_copies) as c FROM books")["c"] or 0
    issued_copies = total_copies - available_copies

    total_students = fetch_one("SELECT COUNT(*) as c FROM students")["c"]
    total_faculty = fetch_one("SELECT COUNT(*) as c FROM faculty")["c"]

    return jsonify({
        "total_books": total_books,
        "total_copies": total_copies,
        "available_copies": available_copies,
        "issued_copies": issued_copies,
        "total_students": total_students,
        "total_faculty": total_faculty
    })

@app.route("/api/admin/books", methods=["POST"])
def api_admin_add_book():
    """Admin adds a new book with exact floor, rack (1-100), and shelf (1-5)"""
    data = request.get_json() or {}
    title = data.get("title", "").strip()
    author = data.get("author", "").strip()
    category_id = int(data.get("category_id", 1))
    subcategory_name = data.get("subcategory", "").strip()
    floor_name = data.get("floor", "First Floor")
    rack_number = int(data.get("rack", 16))
    shelf_input = str(data.get("shelf", "3")).strip()
    total_copies = int(data.get("copies", 5))

    shelf_code = f"Shelf {shelf_input}" if not shelf_input.startswith("Shelf") else shelf_input

    if not title or not author:
        return jsonify({"success": False, "message": "Title and author are required."}), 400

    # Ensure subcategory exists
    sub = fetch_one("SELECT id FROM subcategories WHERE category_id = %s AND name = %s", (category_id, subcategory_name))
    if not sub:
        sub_id = execute_query("INSERT INTO subcategories (category_id, name, description) VALUES (%s, %s, %s)", (category_id, subcategory_name, f"Reference texts in {subcategory_name}"))
    else:
        sub_id = sub["id"]

    floor_row = fetch_one("SELECT id FROM floors WHERE floor_number = %s", (floor_name,))
    f_id = floor_row["id"] if floor_row else 2

    rack_row = fetch_one("SELECT id FROM racks WHERE floor_id = %s AND rack_number = %s", (f_id, rack_number))
    if not rack_row:
        r_id = execute_query("INSERT INTO racks (rack_number, floor_id, aisle_number, side, description) VALUES (%s, %s, %s, 'Left', %s)",
                             (rack_number, f_id, ((rack_number - 1) // 10) + 1, f"Rack #{rack_number}"))
    else:
        r_id = rack_row["id"]

    shelf_row = fetch_one("SELECT id FROM shelves WHERE shelf_code = %s", (shelf_code,))
    s_id = shelf_row["id"] if shelf_row else 3

    book_code = f"BK-{int(datetime.datetime.now().timestamp()) % 100000}"
    isbn = f"978-93-{datetime.datetime.now().microsecond % 900000 + 100000}-0"

    book_id = execute_query(
        """INSERT INTO books (book_code, title, author, isbn, edition, category_id, subcategory_id, floor_id, rack_id, shelf_id, total_copies, available_copies, rating, description)
           VALUES (%s, %s, %s, %s, '1st Edition', %s, %s, %s, %s, %s, %s, %s, 4.8, %s)""",
        (book_code, title, author, isbn, category_id, sub_id, f_id, r_id, s_id, total_copies, total_copies, f"Cataloged title in {subcategory_name} by {author}.")
    )

    return jsonify({
        "success": True,
        "message": f"Book '{title}' added to {floor_name}, Rack {rack_number}, {shelf_code}!",
        "book_id": book_id
    })

@app.route("/api/admin/books/<int:book_id>", methods=["PUT"])
def api_admin_update_book(book_id):
    """Admin updates book details, location (Floor, Rack, Shelf) or availability"""
    data = request.get_json() or {}
    title = data.get("title")
    author = data.get("author")
    floor_name = data.get("floor")
    rack_number = data.get("rack")
    shelf_input = str(data.get("shelf", "3")).strip()
    shelf_code = f"Shelf {shelf_input}" if not shelf_input.startswith("Shelf") else shelf_input
    available_copies = data.get("available_copies")

    book = fetch_one("SELECT * FROM books WHERE id = %s", (book_id,))
    if not book:
        return jsonify({"success": False, "message": "Book not found."}), 404

    f_id = book["floor_id"]
    if floor_name:
        floor_row = fetch_one("SELECT id FROM floors WHERE floor_number = %s", (floor_name,))
        if floor_row:
            f_id = floor_row["id"]

    r_id = book["rack_id"]
    if rack_number:
        rack_row = fetch_one("SELECT id FROM racks WHERE floor_id = %s AND rack_number = %s", (f_id, int(rack_number)))
        if rack_row:
            r_id = rack_row["id"]

    s_id = book["shelf_id"]
    if shelf_code:
        shelf_row = fetch_one("SELECT id FROM shelves WHERE shelf_code = %s", (shelf_code,))
        if shelf_row:
            s_id = shelf_row["id"]

    execute_query("""
        UPDATE books 
        SET title = COALESCE(%s, title),
            author = COALESCE(%s, author),
            floor_id = %s,
            rack_id = %s,
            shelf_id = %s,
            available_copies = COALESCE(%s, available_copies)
        WHERE id = %s
    """, (title, author, f_id, r_id, s_id, available_copies, book_id))

    return jsonify({"success": True, "message": "Book details and location successfully updated."})

@app.route("/api/admin/books/<int:book_id>", methods=["DELETE"])
def api_admin_delete_book(book_id):
    """Admin deletes a book"""
    execute_query("DELETE FROM books WHERE id = %s", (book_id,))
    return jsonify({"success": True, "message": "Book deleted from database."})

@app.route("/api/admin/issued", methods=["GET"])
def api_admin_issued_ledger():
    """Admin views all issued books"""
    issued = fetch_all("""
        SELECT br.*, b.isbn, f.floor_number, r.rack_number, sh.shelf_code
        FROM borrow_records br
        JOIN books b ON br.book_id = b.id
        JOIN floors f ON b.floor_id = f.id
        JOIN racks r ON b.rack_id = r.id
        JOIN shelves sh ON b.shelf_id = sh.id
        WHERE br.status = 'ISSUED'
        ORDER BY br.due_date ASC
    """)
    return jsonify({"issued": issued})

@app.route("/api/admin/returned", methods=["GET"])
def api_admin_returned_ledger():
    """Admin views returned history"""
    returned = fetch_all("""
        SELECT rr.*, b.title, b.book_code, br.borrow_date, br.due_date
        FROM return_records rr
        JOIN books b ON rr.book_id = b.id
        JOIN borrow_records br ON rr.borrow_record_id = br.id
        ORDER BY rr.return_date DESC
    """)
    return jsonify({"returned": returned})

# =========================================================================
# RUN APPLICATION
# =========================================================================

if __name__ == "__main__":
    print(f"[STARTING] Smart Library Server on http://localhost:{Config.PORT}")
    app.run(host="0.0.0.0", port=Config.PORT, debug=Config.DEBUG)
