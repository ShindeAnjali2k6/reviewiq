import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
from db.models import Base

load_dotenv()
logger = logging.getLogger(__name__)


def get_engine():
    """Create database engine from DATABASE_URL in .env"""
    db_url = os.getenv("DATABASE_URL", "sqlite:///reviewiq.db")
    logger.info(f"Connecting to database...")
    return create_engine(db_url, echo=False)


def init_db():
    """Create all tables if they don't exist yet."""
    engine = get_engine()
    Base.metadata.create_all(engine)
    logger.info("Database tables created successfully.")
    return engine


def get_session(engine):
    """Return a database session factory."""
    Session = sessionmaker(bind=engine)
    return Session()