import os
import sys
import sqlite3

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import Config
import pymysql
from pymysql.cursors import DictCursor

def get_db_connection():
    """
    Attempts to connect to MySQL. If MySQL is unavailable,
    gracefully connects to embedded SQLite.
    """
    if Config.DB_TYPE == "mysql":
        try:
            conn = pymysql.connect(
                host=Config.MYSQL_HOST,
                port=Config.MYSQL_PORT,
                user=Config.MYSQL_USER,
                password=Config.MYSQL_PASSWORD,
                database=Config.MYSQL_DB,
                cursorclass=DictCursor,
                autocommit=True,
                charset='utf8mb4'
            )
            return conn, "mysql"
        except Exception as e:
            # Fallback to SQLite
            pass

    # SQLite fallback
    os.makedirs(os.path.dirname(Config.SQLITE_DB_PATH), exist_ok=True)
    conn = sqlite3.connect(Config.SQLITE_DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn, "sqlite"

def execute_query(query, params=()):
    """Execute an INSERT, UPDATE, DELETE query and return lastrowid"""
    conn, engine = get_db_connection()
    try:
        if engine == "mysql":
            with conn.cursor() as cursor:
                # Replace SQLite ? with %s for MySQL if needed
                mysql_query = query.replace('?', '%s')
                cursor.execute(mysql_query, params)
                return cursor.lastrowid
        else:
            cursor = conn.cursor()
            # Replace MySQL %s with ? for SQLite if needed
            sqlite_query = query.replace('%s', '?')
            cursor.execute(sqlite_query, params)
            conn.commit()
            return cursor.lastrowid
    finally:
        conn.close()

def fetch_all(query, params=()):
    """Fetch all rows as a list of dictionaries"""
    conn, engine = get_db_connection()
    try:
        if engine == "mysql":
            with conn.cursor() as cursor:
                mysql_query = query.replace('?', '%s')
                cursor.execute(mysql_query, params)
                return cursor.fetchall() or []
        else:
            cursor = conn.cursor()
            sqlite_query = query.replace('%s', '?')
            cursor.execute(sqlite_query, params)
            rows = cursor.fetchall()
            return [dict(row) for row in rows]
    finally:
        conn.close()

def fetch_one(query, params=()):
    """Fetch a single row as a dictionary"""
    conn, engine = get_db_connection()
    try:
        if engine == "mysql":
            with conn.cursor() as cursor:
                mysql_query = query.replace('?', '%s')
                cursor.execute(mysql_query, params)
                return cursor.fetchone()
        else:
            cursor = conn.cursor()
            sqlite_query = query.replace('%s', '?')
            cursor.execute(sqlite_query, params)
            row = cursor.fetchone()
            return dict(row) if row else None
    finally:
        conn.close()

def init_tables():
    """Initializes schema if tables do not exist"""
    conn, engine = get_db_connection()
    try:
        if engine == "sqlite":
            cursor = conn.cursor()
            # SQLite schema definitions
            cursor.executescript("""
            CREATE TABLE IF NOT EXISTS students (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id TEXT NOT NULL UNIQUE,
                name TEXT NOT NULL,
                department TEXT NOT NULL,
                semester TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                phone TEXT,
                max_books INTEGER DEFAULT 3,
                loan_duration_days INTEGER DEFAULT 14,
                avatar TEXT DEFAULT '👨‍🎓',
                status TEXT DEFAULT 'ACTIVE',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS faculty (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                faculty_id TEXT NOT NULL UNIQUE,
                name TEXT NOT NULL,
                department TEXT NOT NULL,
                designation TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                phone TEXT,
                max_books INTEGER DEFAULT 10,
                loan_duration_days INTEGER DEFAULT 30,
                avatar TEXT DEFAULT '👨‍🏫',
                status TEXT DEFAULT 'ACTIVE',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS admin (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                admin_id TEXT NOT NULL UNIQUE,
                username TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                name TEXT NOT NULL,
                role TEXT DEFAULT 'Chief Librarian',
                avatar TEXT DEFAULT '📚',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS floors (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                floor_number TEXT NOT NULL UNIQUE,
                wing_name TEXT NOT NULL,
                description TEXT,
                total_racks INTEGER DEFAULT 100
            );

            CREATE TABLE IF NOT EXISTS racks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                rack_number INTEGER NOT NULL,
                floor_id INTEGER NOT NULL,
                aisle_number INTEGER NOT NULL,
                side TEXT DEFAULT 'Left',
                description TEXT,
                FOREIGN KEY (floor_id) REFERENCES floors(id),
                UNIQUE(floor_id, rack_number)
            );

            CREATE TABLE IF NOT EXISTS shelves (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                shelf_code TEXT NOT NULL,
                shelf_level_name TEXT NOT NULL,
                height_meters TEXT,
                description TEXT
            );

            CREATE TABLE IF NOT EXISTS categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                code TEXT NOT NULL UNIQUE,
                name TEXT NOT NULL UNIQUE,
                icon TEXT DEFAULT '📚',
                color TEXT DEFAULT '#2563eb',
                floor_id INTEGER,
                default_racks TEXT,
                description TEXT,
                FOREIGN KEY (floor_id) REFERENCES floors(id)
            );

            CREATE TABLE IF NOT EXISTS subcategories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                category_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                description TEXT,
                FOREIGN KEY (category_id) REFERENCES categories(id),
                UNIQUE(category_id, name)
            );

            CREATE TABLE IF NOT EXISTS books (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                book_code TEXT NOT NULL UNIQUE,
                title TEXT NOT NULL,
                author TEXT NOT NULL,
                isbn TEXT NOT NULL,
                edition TEXT DEFAULT '1st Edition',
                category_id INTEGER NOT NULL,
                subcategory_id INTEGER NOT NULL,
                floor_id INTEGER NOT NULL,
                rack_id INTEGER NOT NULL,
                shelf_id INTEGER NOT NULL,
                total_copies INTEGER NOT NULL DEFAULT 5,
                available_copies INTEGER NOT NULL DEFAULT 5,
                rating REAL DEFAULT 4.8,
                cover_color TEXT DEFAULT '#2563eb',
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (category_id) REFERENCES categories(id),
                FOREIGN KEY (subcategory_id) REFERENCES subcategories(id),
                FOREIGN KEY (floor_id) REFERENCES floors(id),
                FOREIGN KEY (rack_id) REFERENCES racks(id),
                FOREIGN KEY (shelf_id) REFERENCES shelves(id)
            );

            CREATE TABLE IF NOT EXISTS library_study_entries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                pass_code TEXT NOT NULL UNIQUE,
                user_type TEXT NOT NULL,
                user_id_code TEXT NOT NULL,
                user_name TEXT NOT NULL,
                department TEXT,
                entry_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status TEXT DEFAULT 'ACTIVE'
            );

            CREATE TABLE IF NOT EXISTS borrow_records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                book_id INTEGER NOT NULL,
                book_code TEXT NOT NULL,
                book_title TEXT NOT NULL,
                user_type TEXT NOT NULL,
                user_id_code TEXT NOT NULL,
                user_name TEXT NOT NULL,
                department TEXT,
                borrow_date DATE NOT NULL,
                due_date DATE NOT NULL,
                status TEXT DEFAULT 'ISSUED',
                renewal_count INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (book_id) REFERENCES books(id)
            );

            CREATE TABLE IF NOT EXISTS return_records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                borrow_record_id INTEGER NOT NULL,
                book_id INTEGER NOT NULL,
                user_id_code TEXT NOT NULL,
                user_name TEXT NOT NULL,
                return_date DATE NOT NULL,
                fine_amount REAL DEFAULT 0.00,
                remarks TEXT DEFAULT 'Returned in good condition',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (borrow_record_id) REFERENCES borrow_records(id),
                FOREIGN KEY (book_id) REFERENCES books(id)
            );
            """)
            conn.commit()
    finally:
        conn.close()
