"""
SQLAlchemy models for Customer entity
"""
from sqlalchemy import Column, String, DateTime
from sqlalchemy.sql import func
from datetime import datetime

# Import the shared Base from database config
from app.core.database import Base


class Customer(Base):
    """
    Customer model representing the customer table in PostgreSQL
    """
    __tablename__ = "customer"

    document = Column(String(50), primary_key=True, nullable=False)
    firstname = Column(String(100), nullable=False)
    lastname = Column(String(100), nullable=False)
    address = Column(String(500), nullable=False)
    phone = Column(String(20), nullable=False)
    email = Column(String(100), nullable=False, unique=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<Customer(document='{self.document}', firstname='{self.firstname}', lastname='{self.lastname}')>"

