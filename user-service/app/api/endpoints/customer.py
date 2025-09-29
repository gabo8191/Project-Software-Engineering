"""
Customer API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import logging

from app.core.database import get_db
from app.crud.customer import customer_crud
from app.schemas.customer import (
    CustomerCreateDTO,
    CustomerCreateResponseDTO,
    CustomerUpdateDTO,
    CustomerUpdateResponseDTO,
    CustomerFindResponseDTO,
    CustomerResponseDTO
)

logger = logging.getLogger(__name__)

# Create router
router = APIRouter()


@router.post("/createcustomer", response_model=CustomerCreateResponseDTO)
async def create_customer(
    customer: CustomerCreateDTO,
    db: Session = Depends(get_db)
):
    """
    Create a new customer
    
    Args:
        customer: Customer data to create
        db: Database session
        
    Returns:
        Customer creation response
    """
    try:
        logger.info(f"Creating customer with document: {customer.document}")
        
        # Create customer using CRUD
        created_customer = customer_crud.create_customer(db, customer)
        
        if created_customer:
            logger.info(f"Customer created successfully: {customer.document}")
            return CustomerCreateResponseDTO(createCustomerValid=True)
        else:
            logger.warning(f"Failed to create customer: {customer.document}")
            return CustomerCreateResponseDTO(createCustomerValid=False)
            
    except Exception as e:
        logger.error(f"Error in create_customer endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.get("/findcustomerbyid", response_model=CustomerFindResponseDTO)
async def find_customer_by_id(
    customerid: str,
    db: Session = Depends(get_db)
):
    """
    Find customer by document ID
    
    Args:
        customerid: Customer document ID
        db: Database session
        
    Returns:
        Customer information
    """
    try:
        logger.info(f"Finding customer with ID: {customerid}")
        
        # Get customer using CRUD
        customer = customer_crud.get_customer_by_id(db, customerid)
        
        if not customer:
            logger.warning(f"Customer not found: {customerid}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Customer with ID {customerid} not found"
            )
        
        logger.info(f"Customer found: {customerid}")
        return CustomerFindResponseDTO(
            document=customer.document,
            firstname=customer.firstname,
            lastname=customer.lastname,
            address=customer.address,
            phone=customer.phone,
            email=customer.email
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in find_customer_by_id endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.put("/updatecustomer", response_model=CustomerUpdateResponseDTO)
async def update_customer(
    customer: CustomerUpdateDTO,
    customerid: str,
    db: Session = Depends(get_db)
):
    """
    Update customer information
    
    Args:
        customer: Updated customer data
        customerid: Customer document ID
        db: Database session
        
    Returns:
        Customer update response
    """
    try:
        logger.info(f"Updating customer with ID: {customerid}")
        
        # Update customer using CRUD
        updated_customer = customer_crud.update_customer(db, customerid, customer)
        
        if updated_customer:
            logger.info(f"Customer updated successfully: {customerid}")
            return CustomerUpdateResponseDTO(updateCustomerValid=True)
        else:
            logger.warning(f"Failed to update customer: {customerid}")
            return CustomerUpdateResponseDTO(updateCustomerValid=False)
            
    except Exception as e:
        logger.error(f"Error in update_customer endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.delete("/deletecustomer/{customerid}")
async def delete_customer(
    customerid: str,
    db: Session = Depends(get_db)
):
    """
    Delete customer by document ID
    
    Args:
        customerid: Customer document ID
        db: Database session
        
    Returns:
        Deletion confirmation
    """
    try:
        logger.info(f"Deleting customer with ID: {customerid}")
        
        # Delete customer using CRUD
        deleted = customer_crud.delete_customer(db, customerid)
        
        if deleted:
            logger.info(f"Customer deleted successfully: {customerid}")
            return {"message": f"Customer {customerid} deleted successfully"}
        else:
            logger.warning(f"Failed to delete customer: {customerid}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Customer with ID {customerid} not found"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in delete_customer endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.get("/customers", response_model=List[CustomerResponseDTO])
async def get_all_customers(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Get all customers with pagination
    
    Args:
        skip: Number of records to skip
        limit: Maximum number of records to return
        db: Database session
        
    Returns:
        List of customers
    """
    try:
        logger.info(f"Getting all customers (skip={skip}, limit={limit})")
        
        customers = customer_crud.get_all_customers(db, skip=skip, limit=limit)
        
        logger.info(f"Retrieved {len(customers)} customers")
        return customers
        
    except Exception as e:
        logger.error(f"Error in get_all_customers endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.get("/customerbyemail/{email}", response_model=CustomerResponseDTO)
async def get_customer_by_email(
    email: str,
    db: Session = Depends(get_db)
):
    """
    Get customer by email
    
    Args:
        email: Customer email
        db: Database session
        
    Returns:
        Customer information
    """
    try:
        logger.info(f"Finding customer by email: {email}")
        
        customer = customer_crud.get_customer_by_email(db, email)
        
        if not customer:
            logger.warning(f"Customer not found by email: {email}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Customer with email {email} not found"
            )
        
        logger.info(f"Customer found by email: {email}")
        return customer
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_customer_by_email endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

