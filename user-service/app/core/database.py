"""
Database configuration and session management
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator
from sqlalchemy import text
import logging


from app.core.config import settings

# Create database engine
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=300,
    echo=False  # Set to True for SQL query logging
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create base class for models
Base = declarative_base()

# Logger
logger = logging.getLogger(__name__)


def get_db() -> Generator[Session, None, None]:
    """
    Dependency to get database session
    """
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        logger.error(f"Database session error: {e}")
        db.rollback()
        raise
    finally:
        db.close()


def create_tables():
    """
    Create all tables in the database
    """
    try:
        # Import all models to ensure they are registered
        from app.models.customer import Customer
        
        logger.info(f"Registered models in Base.metadata: {list(Base.metadata.tables.keys())}")
        
        # Create all tables
        Base.metadata.create_all(bind=engine)
        
        # Verify tables were created
        with engine.connect() as connection:
            result = connection.execute(text("SELECT tablename FROM pg_tables WHERE schemaname = 'public'"))
            existing_tables = [row[0] for row in result.fetchall()]
            logger.info(f"Tables in database after creation: {existing_tables}")
        
        logger.info("Database tables created successfully")
        
    except Exception as e:
        logger.error(f"Error creating database tables: {e}")
        raise


def check_database_connection() -> bool:
    """
    Check if database connection is working
    """
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        logger.info("Database connection successful")
        return True
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        return False

