import os

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "smart-library-secret-key-2026-secure")
    DEBUG = False  # Set to False so it runs cleanly in background without reloader issues
    PORT = int(os.getenv("PORT", 5000))
    
    # Database Configuration (MySQL settings)
    DB_TYPE = os.getenv("DB_TYPE", "mysql")  # 'mysql' or 'sqlite'
    MYSQL_HOST = os.getenv("MYSQL_HOST", "localhost")
    MYSQL_PORT = int(os.getenv("MYSQL_PORT", 3306))
    MYSQL_USER = os.getenv("MYSQL_USER", "root")
    MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "")
    MYSQL_DB = os.getenv("MYSQL_DB", "smart_library_db")
    
    # Fallback SQLite DB path
    SQLITE_DB_PATH = os.path.join(os.path.dirname(__file__), "database", "library.db")
