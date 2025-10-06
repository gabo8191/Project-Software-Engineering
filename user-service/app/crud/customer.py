"""
CRUD operations for Customer entity
"""
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import Optional, List
import logging

from app.models.customer import Customer
from app.schemas.customer import CustomerCreateDTO, CustomerUpdateDTO

logger = logging.getLogger(__name__)


class CustomerCRUD:
    """CRUD operations for Customer"""

    @staticmethod
    def create_customer(db: Session, customer_data) -> Optional[Customer]:
        """
        Create a new customer
        
        Args:
            db: Database session
            customer_data: Customer data to create (dict or DTO)
            
        Returns:
            Customer object if successful, None if failed
        """
        try:
            # Handle both dict and DTO input
            if isinstance(customer_data, dict):
                document = customer_data['document']
                firstname = customer_data['firstname']
                lastname = customer_data['lastname']
                address = customer_data['address']
                phone = customer_data['phone']
                email = customer_data['email']
            else:
                # DTO object
                document = customer_data.document
                firstname = customer_data.firstname
                lastname = customer_data.lastname
                address = customer_data.address
                phone = customer_data.phone
                email = customer_data.email
            
            # Check if customer already exists
            existing_customer = db.query(Customer).filter(
                Customer.document == document
            ).first()
            
            if existing_customer:
                logger.warning(f"Customer with document {document} already exists")
                return None
            
            # Check if email already exists
            existing_email = db.query(Customer).filter(
                Customer.email == email
            ).first()
            
            if existing_email:
                logger.warning(f"Customer with email {email} already exists")
                return None
            
            # Create new customer
            db_customer = Customer(
                document=document,
                firstname=firstname,
                lastname=lastname,
                address=address,
                phone=phone,
                email=email
            )
            
            db.add(db_customer)
            db.commit()
            db.refresh(db_customer)
            
            logger.info(f"Customer created successfully: {document}")
            return db_customer
            
        except IntegrityError as e:
            db.rollback()
            logger.error(f"Integrity error creating customer: {e}")
            return None
        except Exception as e:
            db.rollback()
            logger.error(f"Error creating customer: {e}")
            return None

    @staticmethod
    def get_customer_by_id(db: Session, customer_id: str) -> Optional[Customer]:
        """
        Get customer by document ID
        
        Args:
            db: Database session
            customer_id: Customer document ID
            
        Returns:
            Customer object if found, None if not found
        """
        try:
            customer = db.query(Customer).filter(Customer.document == customer_id).first()
            
            if customer:
                logger.info(f"Customer found: {customer_id}")
            else:
                logger.warning(f"Customer not found: {customer_id}")
                
            return customer
            
        except Exception as e:
            logger.error(f"Error getting customer {customer_id}: {e}")
            return None

    @staticmethod
    def update_customer(db: Session, customer_id: str, customer_data: CustomerUpdateDTO) -> Optional[Customer]:
        """
        Update customer information
        
        Args:
            db: Database session
            customer_id: Customer document ID
            customer_data: Updated customer data
            
        Returns:
            Updated Customer object if successful, None if failed
        """
        try:
            # Get existing customer
            db_customer = db.query(Customer).filter(Customer.document == customer_id).first()
            
            if not db_customer:
                logger.warning(f"Customer not found for update: {customer_id}")
                return None
            
            # Check if email is being changed and if it already exists
            if customer_data.email and customer_data.email != db_customer.email:
                existing_email = db.query(Customer).filter(
                    Customer.email == customer_data.email,
                    Customer.document != customer_id
                ).first()
                
                if existing_email:
                    logger.warning(f"Email {customer_data.email} already exists for another customer")
                    return None
            
            # Update fields
            update_data = customer_data.dict(exclude_unset=True)
            for field, value in update_data.items():
                setattr(db_customer, field, value)
            
            db.commit()
            db.refresh(db_customer)
            
            logger.info(f"Customer updated successfully: {customer_id}")
            return db_customer
            
        except IntegrityError as e:
            db.rollback()
            logger.error(f"Integrity error updating customer: {e}")
            return None
        except Exception as e:
            db.rollback()
            logger.error(f"Error updating customer {customer_id}: {e}")
            return None

    @staticmethod
    def delete_customer(db: Session, customer_id: str) -> bool:
        """
        Delete customer by document ID
        
        Args:
            db: Database session
            customer_id: Customer document ID
            
        Returns:
            True if deleted successfully, False otherwise
        """
        try:
            customer = db.query(Customer).filter(Customer.document == customer_id).first()
            
            if not customer:
                logger.warning(f"Customer not found for deletion: {customer_id}")
                return False
            
            db.delete(customer)
            db.commit()
            
            logger.info(f"Customer deleted successfully: {customer_id}")
            return True
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error deleting customer {customer_id}: {e}")
            return False

    @staticmethod
    def get_all_customers(db: Session, skip: int = 0, limit: int = 100) -> List[Customer]:
        """
        Get all customers with pagination
        
        Args:
            db: Database session
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            List of Customer objects
        """
        try:
            customers = db.query(Customer).offset(skip).limit(limit).all()
            logger.info(f"Retrieved {len(customers)} customers")
            return customers
            
        except Exception as e:
            logger.error(f"Error getting all customers: {e}")
            return []

    @staticmethod
    def get_customer_by_email(db: Session, email: str) -> Optional[Customer]:
        """
        Get customer by email
        
        Args:
            db: Database session
            email: Customer email
            
        Returns:
            Customer object if found, None if not found
        """
        try:
            customer = db.query(Customer).filter(Customer.email == email).first()
            
            if customer:
                logger.info(f"Customer found by email: {email}")
            else:
                logger.warning(f"Customer not found by email: {email}")
                
            return customer
            
        except Exception as e:
            logger.error(f"Error getting customer by email {email}: {e}")
            return None


# Create instance for use in endpoints
customer_crud = CustomerCRUD()

