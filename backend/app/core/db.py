import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import logging
logging.basicConfig(level=logging.INFO)

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL",)

# 1. הוסף timeout ל-SQLite, והפעל pool_pre_ping
sqlite_connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    sqlite_connect_args = {
        "check_same_thread": False,
        "timeout": 60,          # Increased timeout to 60 seconds
    }

engine = create_engine(
    DATABASE_URL,
    connect_args=sqlite_connect_args,
    pool_pre_ping=True,
    echo=False,  # ב-prod כדאי False
    future=True
)

# 2. פרגמות ל-SQLite: WAL + busy_timeout, synchronous NORMAL (פחות נעילות)
if DATABASE_URL.startswith("sqlite"):
    @event.listens_for(engine, "connect")
    def _set_sqlite_pragma(dbapi_conn, conn_record):
        cur = dbapi_conn.cursor()
        cur.execute("PRAGMA journal_mode=WAL;")
        cur.execute("PRAGMA busy_timeout=30000;")  # 30 seconds
        cur.execute("PRAGMA synchronous=NORMAL;")
        cur.close()

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    expire_on_commit=False,   # אופציונלי: למנוע טעינה מחדש של אובייקטים אחרי commit
)

Base = declarative_base()

# ייבוא המודלים
from app.models.models import (
    User,
    UserSession,
    ArtistProfile,
    BookingRequest,
    ChatMessage,
    CalendarBlock,
    Earning,
    Notification,
)

# 3. אל תיצור טבלאות בזמן ייבוא — עשה זאת באירוע startup של FastAPI או בסקריפט init_db
def init_db():
    Base.metadata.create_all(bind=engine)

# 4. תלות ל-FastAPI: טרנזקציה קצרה + commit/rollback
def get_db():
    """
    Yields a database session and ensures it is closed.
    WARNING: SQLite is not suitable for high-concurrency production use. Use PostgreSQL/MySQL for production.
    """
    db = SessionLocal()
    logging.info("[DB] Session opened")
    try:
        yield db
        db.commit()          # סוגר טרנזקציה בהצלחה
    except Exception:
        db.rollback()        # משחרר נעילות במקרה של שגיאה
        raise
    finally:
        db.close()           # תמיד לסגור!
        logging.info("[DB] Session closed")
