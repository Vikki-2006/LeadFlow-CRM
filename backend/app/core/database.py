from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import OperationalError
from app.core.config import settings

db_url = settings.DATABASE_URL
engine = None

if not db_url.startswith("sqlite"):
    try:
        # Perform a quick check connection
        temp_engine = create_engine(db_url, pool_pre_ping=True)
        # Attempt connection connection test
        with temp_engine.connect() as conn:
            pass
        engine = temp_engine
    except OperationalError:
        print("WARNING: PostgreSQL target database is unreachable. Falling back to SQLite ('sqlite:///./leadflow.db') for local testing.")
        db_url = "sqlite:///./leadflow.db"

if engine is None:
    if db_url.startswith("sqlite"):
        engine = create_engine(
            db_url, connect_args={"check_same_thread": False}
        )
    else:
        engine = create_engine(db_url, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
