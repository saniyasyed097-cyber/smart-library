import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database.db import get_db_connection, init_tables, fetch_one

def seed_database():
    init_tables()

    # Check if already seeded
    try:
        book_count = fetch_one("SELECT COUNT(*) as c FROM books")
        if book_count and book_count['c'] > 50:
            print("[INFO] Database already seeded with complete catalog.")
            return
    except Exception:
        pass

    conn, engine = get_db_connection()
    cursor = conn.cursor()

    try:
        # 1. 4 FLOORS SEED
        floors = [
            ("Ground Floor", "General Knowledge (GK) & Magazines", "Main entrance, newspaper lounge, general knowledge and periodicals wing", 100),
            ("First Floor", "Programming Books, Mathematics & Engineering", "Computing labs, coding stacks, core engineering and mathematical sciences", 100),
            ("Second Floor", "Science, Commerce & Medical", "Pure sciences, biology, medicine, commerce and finance research section", 100),
            ("Third Floor", "English, Story Books, History, Indian Polity, Competitive Exams, Novels & Aptitude", "Civil services hall, classical literature, historical archives and fiction collection", 100)
        ]
        q_floor = "INSERT OR IGNORE INTO floors (floor_number, wing_name, description, total_racks) VALUES (?, ?, ?, ?)" if engine == "sqlite" else \
                  "INSERT IGNORE INTO floors (floor_number, wing_name, description, total_racks) VALUES (%s, %s, %s, %s)"
        cursor.executemany(q_floor, floors)
        if engine == "sqlite": conn.commit()

        # Retrieve floor ids
        cursor.execute("SELECT id, floor_number FROM floors")
        floor_rows = cursor.fetchall()
        floor_map = {dict(r)['floor_number'] if engine == "sqlite" else r['floor_number']: dict(r)['id'] if engine == "sqlite" else r['id'] for r in floor_rows}

        # 2. RACKS SEED (1-100 on each floor)
        racks_data = []
        for f_name, f_id in floor_map.items():
            for r in range(1, 101):
                aisle = ((r - 1) // 10) + 1
                side = "Left" if (r % 2 == 1) else "Right"
                desc = f"Rack #{r} on {f_name} in Aisle {aisle}"
                racks_data.append((r, f_id, aisle, side, desc))

        q_rack = "INSERT OR IGNORE INTO racks (rack_number, floor_id, aisle_number, side, description) VALUES (?, ?, ?, ?, ?)" if engine == "sqlite" else \
                 "INSERT IGNORE INTO racks (rack_number, floor_id, aisle_number, side, description) VALUES (%s, %s, %s, %s, %s)"
        cursor.executemany(q_rack, racks_data)
        if engine == "sqlite": conn.commit()

        # 3. SHELVES SEED (Shelf 1 to Shelf 5)
        shelves = [
            ("Shelf 1", "Shelf 1 (Top Level)", "2.1m", "Top shelf reference tier"),
            ("Shelf 2", "Shelf 2 (Upper-Mid Level)", "1.7m", "Upper reference tier"),
            ("Shelf 3", "Shelf 3 (Eye Level)", "1.3m", "Main eye-level textbook tier"),
            ("Shelf 4", "Shelf 4 (Lower-Mid Level)", "0.9m", "Standard circulation tier"),
            ("Shelf 5", "Shelf 5 (Bottom Level)", "0.4m", "Heavy volumes and oversized publications tier")
        ]
        q_shelf = "INSERT OR IGNORE INTO shelves (shelf_code, shelf_level_name, height_meters, description) VALUES (?, ?, ?, ?)" if engine == "sqlite" else \
                  "INSERT IGNORE INTO shelves (shelf_code, shelf_level_name, height_meters, description) VALUES (%s, %s, %s, %s)"
        cursor.executemany(q_shelf, shelves)
        if engine == "sqlite": conn.commit()

        cursor.execute("SELECT id, shelf_code FROM shelves")
        shelf_rows = cursor.fetchall()
        shelf_map = {dict(r)['shelf_code'] if engine == "sqlite" else r['shelf_code']: dict(r)['id'] if engine == "sqlite" else r['id'] for r in shelf_rows}

        # 4. CATEGORIES & SUBCATEGORIES SEED
        categories_data = [
            ("PROG", "Programming Books", "💻", "#2563eb", "First Floor", "Rack 1 - 35", "Programming languages, algorithms, software design, AI, web & systems", [
                "Python", "Java", "C", "C++", "C#", "JavaScript", "PHP", "HTML", "CSS",
                "React", "Node.js", "SQL", "DBMS", "Data Structures", "Algorithms",
                "Operating Systems", "Computer Networks", "Artificial Intelligence",
                "Machine Learning", "Data Science", "Cyber Security"
            ]),
            ("MATH", "Mathematics", "📐", "#0284c7", "First Floor", "Rack 36 - 65", "Algebra, calculus, geometry, statistics, linear algebra & discrete mathematics", [
                "Algebra", "Geometry", "Trigonometry", "Calculus", "Statistics",
                "Probability", "Linear Algebra", "Discrete Mathematics"
            ]),
            ("ENGG", "Engineering", "⚙️", "#4f46e5", "First Floor", "Rack 66 - 100", "Civil, mechanical, electrical, electronics, robotics & IoT", [
                "Civil Engineering", "Mechanical Engineering", "Electrical Engineering",
                "Electronics", "Computer Science", "Artificial Intelligence", "Robotics",
                "Internet of Things (IoT)"
            ]),
            ("GK", "General Knowledge (GK)", "🌍", "#059669", "Ground Floor", "Rack 1 - 50", "Indian & world GK, current affairs, sports, geography & environment", [
                "Indian GK", "World GK", "Current Affairs", "Sports", "Awards",
                "Important Days", "Capitals and Countries", "Rivers and Dams",
                "Indian States", "Science & Technology", "Economy", "Environment"
            ]),
            ("MAG", "Magazines", "📰", "#0d9488", "Ground Floor", "Rack 51 - 100", "Periodicals, tech journals, business reviews & sports digests", [
                "Technology", "Business", "Education", "Health", "Sports",
                "Fashion", "Current Affairs"
            ]),
            ("SCI", "Science", "🔬", "#0891b2", "Second Floor", "Rack 1 - 40", "Physics, chemistry, biology, space science & astronomy", [
                "Physics", "Chemistry", "Biology", "Botany", "Zoology",
                "Environmental Science", "Space Science", "Astronomy",
                "Biotechnology", "General Science"
            ]),
            ("COMM", "Commerce", "💼", "#16a34a", "Second Floor", "Rack 41 - 70", "Accounting, finance, economics, business studies & taxation", [
                "Accounting", "Economics", "Business Studies", "Finance",
                "Taxation", "Marketing", "Human Resource Management"
            ]),
            ("MED", "Medical", "🩺", "#e11d48", "Second Floor", "Rack 71 - 100", "Anatomy, physiology, pharmacology, pathology & nursing", [
                "Anatomy", "Physiology", "Pharmacology", "Pathology",
                "Nursing", "First Aid", "Public Health"
            ]),
            ("ENG", "English Books", "📖", "#7c3aed", "Third Floor", "Rack 1 - 15", "Grammar, literature, spoken english & vocabulary", [
                "Grammar", "Vocabulary", "Spoken English", "Communication Skills",
                "Literature", "Poetry", "Essays", "Writing Skills",
                "Business English", "English Dictionary"
            ]),
            ("STORY", "Story Books", "🧚‍♂️", "#db2777", "Third Floor", "Rack 1 - 30", "Fairy tales, short stories, fantasy, moral stories & adventures", [
                "Fairy Tales", "Short Stories", "Adventure", "Mystery", "Fantasy",
                "Horror", "Science Fiction", "Historical Fiction",
                "Children's Stories", "Moral Stories"
            ]),
            ("HIST", "History", "🏛️", "#b45309", "Third Floor", "Rack 31 - 45", "Ancient, medieval & modern Indian history, world history & freedom fighters", [
                "Ancient Indian History", "Medieval Indian History", "Modern Indian History",
                "World History", "Freedom Fighters", "Indian Independence",
                "Kings and Dynasties", "Revolutions", "Historical Monuments", "Archaeology"
            ]),
            ("POLITY", "Indian Polity", "⚖️", "#d97706", "Third Floor", "Rack 46 - 60", "Constitution of India, parliament, judiciary, rights & governance", [
                "Constitution of India", "Fundamental Rights", "Fundamental Duties",
                "Directive Principles", "Parliament", "President", "Prime Minister",
                "Judiciary", "Election Commission", "Local Government", "Governance",
                "Public Administration"
            ]),
            ("COMP", "Competitive Exams", "🏆", "#dc2626", "Third Floor", "Rack 61 - 75", "UPSC, APPSC, SSC, Banking, GATE, CAT, GRE, TOEFL & IELTS", [
                "UPSC", "APPSC", "SSC", "Banking", "RRB", "GATE",
                "GRE", "TOEFL", "IELTS", "CAT"
            ]),
            ("NOV", "Novels", "📚", "#ea580c", "Third Floor", "Rack 76 - 90", "Bestselling fiction, classics, thrillers, romance & adventure", [
                "Romance", "Mystery", "Thriller", "Horror", "Fantasy",
                "Science Fiction", "Historical Novels", "Crime", "Adventure",
                "Drama", "Classic Novels", "Biography"
            ]),
            ("APT", "Aptitude", "🧠", "#4338ca", "Third Floor", "Rack 91 - 100", "Quantitative aptitude, reasoning, data interpretation & puzzles", [
                "Quantitative Aptitude", "Logical Reasoning", "Verbal Ability",
                "Non-Verbal Reasoning", "Data Interpretation", "Puzzles",
                "Analytical Reasoning", "Arithmetic", "Number System",
                "Time & Work", "Probability"
            ])
        ]

        for cat in categories_data:
            code, name, icon, color, floor_str, racks_str, desc, subs = cat
            f_id = floor_map[floor_str]
            
            q_c = "INSERT OR IGNORE INTO categories (code, name, icon, color, floor_id, default_racks, description) VALUES (?, ?, ?, ?, ?, ?, ?)" if engine == "sqlite" else \
                  "INSERT IGNORE INTO categories (code, name, icon, color, floor_id, default_racks, description) VALUES (%s, %s, %s, %s, %s, %s, %s)"
            cursor.execute(q_c, (code, name, icon, color, f_id, racks_str, desc))
            if engine == "sqlite": conn.commit()

            cursor.execute("SELECT id FROM categories WHERE code = %s" if engine == "mysql" else "SELECT id FROM categories WHERE code = ?", (code,))
            c_row = cursor.fetchone()
            cat_id = dict(c_row)['id'] if engine == "sqlite" else c_row['id']

            subs_data = [(cat_id, sub, f"Academic texts and standard reference books for {sub}") for sub in subs]
            q_s = "INSERT OR IGNORE INTO subcategories (category_id, name, description) VALUES (?, ?, ?)" if engine == "sqlite" else \
                  "INSERT IGNORE INTO subcategories (category_id, name, description) VALUES (%s, %s, %s)"
            cursor.executemany(q_s, subs_data)
            if engine == "sqlite": conn.commit()

        # 5. USER ACCOUNTS (Students: 241FA18001 to 241FA18700 [14 Days], Faculty: 1001 to 2001 [30 Days], Admin)
        students = [
            ("241FA18252", "Syed Shafiulla", "Department of Advanced Computer Science and Engineering", "6th Semester", "241fa18252@campus.edu", "+91 98765 43252", 3, 14),
            ("241FA18256", "Syad Saniya", "Department of Advanced Computer Science and Engineering", "6th Semester", "241fa18256@campus.edu", "+91 98765 43256", 3, 14),
            ("241FA18194", "Balaji Thilak Babu", "Department of Advanced Computer Science and Engineering", "6th Semester", "241fa18194@campus.edu", "+91 98765 43194", 3, 14),
            ("241FA18340", "Pavan Aditya", "Department of Advanced Computer Science and Engineering", "6th Semester", "241fa18340@campus.edu", "+91 98765 43340", 3, 14),
            ("241FA18001", "Aarav Sharma", "Computer Science & Engineering", "6th Semester", "241fa18001@campus.edu", "+91 98765 43210", 3, 14),
            ("241FA18002", "Priya Patel", "Electronics & Communication", "4th Semester", "241fa18002@campus.edu", "+91 98765 43211", 3, 14),
            ("241FA18003", "Rohan Mehta", "Mechanical Engineering", "8th Semester", "241fa18003@campus.edu", "+91 98765 43212", 3, 14),
            ("241FA18025", "Syed", "Computer Science & Engineering", "6th Semester", "241fa18025@campus.edu", "+91 98765 43225", 3, 14),
            ("241FA18700", "Vikram Reddy", "Civil Engineering", "8th Semester", "241fa18700@campus.edu", "+91 98765 43700", 3, 14),
            # Legacy fallback
            ("STU-1001", "Aarav Sharma", "Computer Science & Engineering", "6th Semester", "aarav.sharma@campus.edu", "+91 98765 43210", 3, 14)
        ]
        q_stu = "INSERT OR IGNORE INTO students (student_id, name, department, semester, email, phone, max_books, loan_duration_days) VALUES (?, ?, ?, ?, ?, ?, ?, ?)" if engine == "sqlite" else \
                "INSERT IGNORE INTO students (student_id, name, department, semester, email, phone, max_books, loan_duration_days) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)"
        cursor.executemany(q_stu, students)

        faculty = [
            ("1001", "Dr. K. S. Ramanujan", "Dept. of Computer Science", "Professor", "prof.1001@campus.edu", "+91 98765 11001", 10, 30),
            ("1002", "Prof. Ananya Sen", "Dept. of English & Humanities", "Associate Professor", "prof.1002@campus.edu", "+91 98765 11002", 10, 30),
            ("1003", "Dr. S. K. Mukherjee", "Dept. of Physics", "Professor", "prof.1003@campus.edu", "+91 98765 11003", 10, 30),
            ("1050", "Dr. Meera Deshmukh", "Dept. of Mathematics", "Professor", "prof.1050@campus.edu", "+91 98765 11050", 10, 30),
            ("2001", "Prof. Rajesh Varma", "Dept. of Electronics", "Head of Department", "prof.2001@campus.edu", "+91 98765 12001", 10, 30),
            # Legacy fallback
            ("FAC-5001", "Dr. K. S. Ramanujan", "Dept. of Computer Science", "Professor", "dr.ramanujan@campus.edu", "+91 98765 11223", 10, 30)
        ]
        q_fac = "INSERT OR IGNORE INTO faculty (faculty_id, name, department, designation, email, phone, max_books, loan_duration_days) VALUES (?, ?, ?, ?, ?, ?, ?, ?)" if engine == "sqlite" else \
                "INSERT IGNORE INTO faculty (faculty_id, name, department, designation, email, phone, max_books, loan_duration_days) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)"
        cursor.executemany(q_fac, faculty)

        admins = [
            ("ADMIN-001", "admin", "admin123", "Chief Librarian V. Murthy", "Chief Librarian")
        ]
        q_adm = "INSERT OR IGNORE INTO admin (admin_id, username, password_hash, name, role) VALUES (?, ?, ?, ?, ?)" if engine == "sqlite" else \
                "INSERT IGNORE INTO admin (admin_id, username, password_hash, name, role) VALUES (%s, %s, %s, %s, %s)"
        cursor.executemany(q_adm, admins)
        if engine == "sqlite": conn.commit()

        # 6. BOOKS SEED
        cursor.execute("SELECT id, rack_number, floor_id FROM racks")
        all_racks = cursor.fetchall()
        rack_lookup = {(dict(r)['floor_id'] if engine == "sqlite" else r['floor_id'], dict(r)['rack_number'] if engine == "sqlite" else r['rack_number']): dict(r)['id'] if engine == "sqlite" else r['id'] for r in all_racks}

        cursor.execute("SELECT s.id as sub_id, s.name as sub_name, c.id as cat_id, c.name as cat_name, c.floor_id FROM subcategories s JOIN categories c ON s.category_id = c.id")
        all_subs = cursor.fetchall()

        books_to_insert = []
        shelf_keys = ["Shelf 1", "Shelf 2", "Shelf 3", "Shelf 4", "Shelf 5"]
        author_pool = ["Reema Thareja", "Dr. R. K. Verma", "Prof. S. Mukhopadhyay", "V. Krishnamurthy", "Elena Rostova", "A. H. Thorne", "N. Subramanian", "David Sterling", "Dr. Meera Deshmukh"]

        # Landmark: Python Programming by Reema Thareja (Floor: First Floor, Rack: 16, Shelf: 3)
        prog_floor_id = floor_map["First Floor"]
        cursor.execute("SELECT id FROM categories WHERE name = 'Programming Books'")
        prog_cat_id = dict(cursor.fetchone())['id'] if engine == "sqlite" else cursor.fetchone()['id']
        cursor.execute("SELECT id FROM subcategories WHERE category_id = ? AND name = 'Python'" if engine == "sqlite" else "SELECT id FROM subcategories WHERE category_id = %s AND name = 'Python'", (prog_cat_id,))
        py_sub_id = dict(cursor.fetchone())['id'] if engine == "sqlite" else cursor.fetchone()['id']

        py_rack_id = rack_lookup.get((prog_floor_id, 16), 16)
        py_shelf_id = shelf_map.get("Shelf 3", 3)

        books_to_insert.append((
            "PY-016", "Python Programming", "Reema Thareja", "978-0199480176", "2nd Edition",
            prog_cat_id, py_sub_id, prog_floor_id, py_rack_id, py_shelf_id,
            6, 4, 4.9, "Core Python programming textbook for problem solving, object oriented design and data structures."
        ))

        book_idx = 100
        for sub in all_subs:
            sub_id = dict(sub)['sub_id'] if engine == "sqlite" else sub['sub_id']
            sub_name = dict(sub)['sub_name'] if engine == "sqlite" else sub['sub_name']
            cat_id = dict(sub)['cat_id'] if engine == "sqlite" else sub['cat_id']
            cat_name = dict(sub)['cat_name'] if engine == "sqlite" else sub['cat_name']
            f_id = dict(sub)['floor_id'] if engine == "sqlite" else sub['floor_id']

            for k in range(2):
                book_idx += 1
                assigned_rack_num = ((book_idx * 7) % 95) + 1
                assigned_shelf = shelf_keys[(book_idx + k) % len(shelf_keys)]
                r_id = rack_lookup.get((f_id, assigned_rack_num), 1)
                s_id = shelf_map.get(assigned_shelf, 3)
                
                b_code = f"{cat_name[:3].upper()}-{book_idx}"
                title = f"{sub_name} Programming & Practice" if "Programming" in cat_name else (f"Comprehensive {sub_name}" if k == 0 else f"Applied Concepts in {sub_name}")
                author = author_pool[(book_idx + k) % len(author_pool)]
                isbn = f"978-93-{300000 + book_idx}-{book_idx % 9}"
                total = 4 + (book_idx % 4)
                avail = total - (book_idx % 3)

                books_to_insert.append((
                    b_code, title, author, isbn, "Latest Edition",
                    cat_id, sub_id, f_id, r_id, s_id,
                    total, avail, 4.8, f"Standard reference textbook and curriculum guide for {sub_name}."
                ))

        q_book = "INSERT OR IGNORE INTO books (book_code, title, author, isbn, edition, category_id, subcategory_id, floor_id, rack_id, shelf_id, total_copies, available_copies, rating, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)" if engine == "sqlite" else \
                 "INSERT IGNORE INTO books (book_code, title, author, isbn, edition, category_id, subcategory_id, floor_id, rack_id, shelf_id, total_copies, available_copies, rating, description) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"
        cursor.executemany(q_book, books_to_insert)
        if engine == "sqlite": conn.commit()

        print("[SUCCESS] Fast batch seeding completed successfully.")
    finally:
        conn.close()

if __name__ == "__main__":
    seed_database()
