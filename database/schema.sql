-- =========================================================================
-- Smart Library Book Locator & Management System - MySQL Database Schema
-- Compatible with MySQL 8.0+ / MariaDB / SQLite
-- =========================================================================

CREATE DATABASE IF NOT EXISTS smart_library_db;
USE smart_library_db;

-- 1. STUDENTS TABLE
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    department VARCHAR(100) NOT NULL,
    semester VARCHAR(50) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(30),
    max_books INT DEFAULT 3,
    loan_duration_days INT DEFAULT 14,
    avatar VARCHAR(255) DEFAULT '👨‍🎓',
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. FACULTY TABLE
CREATE TABLE IF NOT EXISTS faculty (
    id INT AUTO_INCREMENT PRIMARY KEY,
    faculty_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    department VARCHAR(100) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(30),
    max_books INT DEFAULT 10,
    loan_duration_days INT DEFAULT 30,
    avatar VARCHAR(255) DEFAULT '👨‍🏫',
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. ADMIN TABLE
CREATE TABLE IF NOT EXISTS admin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id VARCHAR(50) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(150) NOT NULL,
    role VARCHAR(50) DEFAULT 'Chief Librarian',
    avatar VARCHAR(255) DEFAULT '📚',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. FLOORS TABLE (4 Floors)
CREATE TABLE IF NOT EXISTS floors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    floor_number VARCHAR(50) NOT NULL UNIQUE, -- 'Ground Floor', 'First Floor', 'Second Floor', 'Third Floor'
    wing_name VARCHAR(150) NOT NULL,
    description TEXT,
    total_racks INT DEFAULT 100
);

-- 5. RACKS TABLE (Racks 1 to 100 on each floor)
CREATE TABLE IF NOT EXISTS racks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rack_number INT NOT NULL, -- 1 to 100
    floor_id INT NOT NULL,
    aisle_number INT NOT NULL,
    side VARCHAR(10) DEFAULT 'Left',
    description VARCHAR(255),
    FOREIGN KEY (floor_id) REFERENCES floors(id) ON DELETE CASCADE,
    UNIQUE(floor_id, rack_number)
);

-- 6. SHELVES TABLE (Shelf 1 to Shelf 5)
CREATE TABLE IF NOT EXISTS shelves (
    id INT AUTO_INCREMENT PRIMARY KEY,
    shelf_code VARCHAR(20) NOT NULL, -- 'Shelf 1', 'Shelf 2', 'Shelf 3', 'Shelf 4', 'Shelf 5' (or '1', '2', '3', '4', '5')
    shelf_level_name VARCHAR(100) NOT NULL,
    height_meters VARCHAR(20),
    description VARCHAR(255)
);

-- 7. CATEGORIES TABLE (15 Categories)
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(50) DEFAULT '📚',
    color VARCHAR(30) DEFAULT '#2563eb',
    floor_id INT,
    default_racks VARCHAR(100),
    description TEXT,
    FOREIGN KEY (floor_id) REFERENCES floors(id) ON DELETE SET NULL
);

-- 8. SUBCATEGORIES TABLE (Complete Subjects)
CREATE TABLE IF NOT EXISTS subcategories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    UNIQUE(category_id, name)
);

-- 9. BOOKS TABLE
CREATE TABLE IF NOT EXISTS books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    book_code VARCHAR(50) NOT NULL UNIQUE, -- e.g. 'PY-016', 'CS-001'
    title VARCHAR(255) NOT NULL,
    author VARCHAR(200) NOT NULL,
    isbn VARCHAR(50) NOT NULL,
    edition VARCHAR(50) DEFAULT '1st Edition',
    category_id INT NOT NULL,
    subcategory_id INT NOT NULL,
    floor_id INT NOT NULL,
    rack_id INT NOT NULL,
    shelf_id INT NOT NULL,
    total_copies INT NOT NULL DEFAULT 5,
    available_copies INT NOT NULL DEFAULT 5,
    rating DECIMAL(2,1) DEFAULT 4.8,
    cover_color VARCHAR(100) DEFAULT '#2563eb',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    FOREIGN KEY (subcategory_id) REFERENCES subcategories(id) ON DELETE CASCADE,
    FOREIGN KEY (floor_id) REFERENCES floors(id) ON DELETE CASCADE,
    FOREIGN KEY (rack_id) REFERENCES racks(id) ON DELETE CASCADE,
    FOREIGN KEY (shelf_id) REFERENCES shelves(id) ON DELETE CASCADE
);

-- 10. LIBRARY STUDY ENTRIES (No seat reservation, direct free entry)
CREATE TABLE IF NOT EXISTS library_study_entries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pass_code VARCHAR(50) NOT NULL UNIQUE,
    user_type VARCHAR(20) NOT NULL, -- 'Student' or 'Faculty'
    user_id_code VARCHAR(50) NOT NULL,
    user_name VARCHAR(150) NOT NULL,
    department VARCHAR(100),
    entry_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'ACTIVE' -- 'ACTIVE', 'COMPLETED'
);

-- 11. BORROW RECORDS TABLE
CREATE TABLE IF NOT EXISTS borrow_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    book_id INT NOT NULL,
    book_code VARCHAR(50) NOT NULL,
    book_title VARCHAR(255) NOT NULL,
    user_type VARCHAR(20) NOT NULL, -- 'Student' or 'Faculty'
    user_id_code VARCHAR(50) NOT NULL,
    user_name VARCHAR(150) NOT NULL,
    department VARCHAR(100),
    borrow_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'ISSUED', -- 'ISSUED', 'RETURNED', 'OVERDUE'
    renewal_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

-- 12. RETURN RECORDS TABLE
CREATE TABLE IF NOT EXISTS return_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    borrow_record_id INT NOT NULL,
    book_id INT NOT NULL,
    user_id_code VARCHAR(50) NOT NULL,
    user_name VARCHAR(150) NOT NULL,
    return_date DATE NOT NULL,
    fine_amount DECIMAL(10,2) DEFAULT 0.00,
    remarks VARCHAR(255) DEFAULT 'Returned in good condition',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (borrow_record_id) REFERENCES borrow_records(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);
