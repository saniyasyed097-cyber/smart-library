# 📚 Smart Library Book Locator and Management System (Python Flask + MySQL)

A full-stack web application built with **HTML5, CSS3, JavaScript, Python (Flask), and MySQL** for intelligent book location, seat reservation, multi-copy borrowing tracking, and administrative library management.

---

## 🌟 Key Architecture & Features

### 1. Authentication & ID Card System
- **Student Login** (via Student ID Card e.g. `STU-1001`, `STU-1002`):
  - Database authentication
  - Borrow quota: **3 Books**
  - Loan duration: **14 Days**
- **Faculty Login** (via Faculty ID Card e.g. `FAC-5001`, `FAC-5002`):
  - Database authentication
  - Borrow quota: **10 Books**
  - Loan duration: **45 Days**
- **Admin Login** (`ADMIN-001` / `admin` & `admin123`):
  - Master catalog management, book add/edit/delete, location updates, issued/return ledgers.

---

### 2. Dashboard - Two Main Options

#### A. To Study
- Directly displays available reading seats across all 4 floors (**Ground, 1st, 2nd, 3rd Floor**).
- 1-Click reading space reservation.
- Displays: **Seat Number, Availability Status, Reservation Time, User Details (Name, ID, Department)**.
- Generates a **Digital QR Code Turnstile Pass**.

#### B. Borrow Book
- **15 Major Categories & 100+ Subcategories**:
  1. **Programming Books** (Python, Java, C, C++, C#, JavaScript, HTML, CSS, SQL, DBMS, Data Structures, Algorithms, AI, Machine Learning, Data Science, Cyber Security)
  2. **English Books** (Grammar, Vocabulary, Spoken English, Literature, Essays, Communication Skills, Dictionary)
  3. **Story Books** (Fairy Tales, Adventure, Mystery, Fantasy, Horror, Science Fiction, Moral Stories, Children's Stories)
  4. **Indian Polity** (Constitution, Parliament, Judiciary, President, Prime Minister, Fundamental Rights, Local Government)
  5. **General Knowledge (GK)** (Current Affairs, Sports, Awards, Capitals, Science & Technology, Economy, Environment)
  6. **History** (Ancient History, Medieval History, Modern History, World History, Freedom Fighters)
  7. **Science** (Physics, Chemistry, Biology, Botany, Zoology, Astronomy, Environmental Science)
  8. **Aptitude** (Quantitative Aptitude, Logical Reasoning, Verbal Ability, Data Interpretation, Arithmetic, Probability)
  9. **Novels** (Romance, Mystery, Thriller, Horror, Fantasy, Historical, Adventure)
  10. **Mathematics** (Algebra, Calculus, Geometry, Trigonometry, Statistics, Linear Algebra)
  11. **Competitive Exams** (UPSC, GATE, CAT, GRE, SSC, Banking)
  12. **Commerce** (Accounting, Economics, Finance, Marketing)
  13. **Engineering** (Civil, Mechanical, Electrical, Electronics, Robotics, IoT)
  14. **Medical** (Anatomy, Physiology, Pharmacology, Pathology, Nursing)
  15. **Magazines** (Technology, Business, Health, Sports, Current Affairs)

---

### 3. Book Details & Exact Location Output

When a user selects any book (e.g. Python), the system displays:
- **Book Name**: e.g., *Python Crash Course*
- **Author**: *Eric Matthes*
- **ISBN**: *978-1593279288*
- **Category**: *Programming Books*
- **Subcategory**: *Python*
- **Floor Number**: `1st Floor`
- **Rack Number**: `Rack 16` *(1 to 100)*
- **Shelf Number**: `Shelf C` *(Shelf A-E / 1-5)*
- **Book ID**: `PY-016`
- **Availability Status**: `Available` (or `Issued`)
- **Number of Copies**: `4 of 6 Available`
- **Interactive 2D Floor Plan**: Pulses Rack 16 with animated walking route.
- **5-Shelf Cabinet Elevation**: Highlights physical shelf tier and target book.

---

### 4. Borrowing & Return Management
- Borrowing allowed only when copies are available.
- Database records: **Borrow Date, Due Date, Borrower ID, Borrower Name**.
- Automatic quota enforcement (3 for Students, 10 for Faculty).
- Return book updates copies and records in `return_records`.

---

### 5. Admin Panel
- Add, update, delete books with Floor, Rack (1-100), Shelf (A-E), Copies.
- Add categories and subcategories.
- Manage students and faculty.
- View issued books ledger and returned audit logs.
- Library dashboard analytics.

---

### 6. Relational Database Tables
- `students`
- `faculty`
- `admin`
- `floors`
- `racks` (1 to 100)
- `shelves` (Shelf A to E / 1 to 5)
- `categories` (15 categories)
- `subcategories` (100+ subjects)
- `books`
- `seat_reservations`
- `borrow_records`
- `return_records`

---

## 🚀 How to Run the Project

### Step 1: Install Dependencies
```bash
cd C:\Users\syedj\.gemini\antigravity\scratch\smart-library-flask
pip install -r requirements.txt
```

### Step 2: Database Configuration

#### Option A: Run directly (Out-of-the-Box SQLite Auto-Fallback)
The application has built-in SQLite auto-fallback, so you can run it immediately without setting up MySQL:
```bash
python app.py
```

#### Option B: Using MySQL Server
1. Open MySQL terminal or phpMyAdmin / MySQL Workbench:
   ```sql
   CREATE DATABASE smart_library_db;
   ```
2. Import `database/schema.sql`:
   ```bash
   mysql -u root -p smart_library_db < database/schema.sql
   ```
3. Update `config.py` (or set environment variables):
   ```python
   MYSQL_HOST = "localhost"
   MYSQL_USER = "root"
   MYSQL_PASSWORD = "your_mysql_password"
   MYSQL_DB = "smart_library_db"
   ```

### Step 3: Run the Server
```bash
python app.py
```
Open your browser at: **`http://localhost:5000`**
