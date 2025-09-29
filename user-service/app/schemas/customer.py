"""
Pydantic schemas for Customer DTOs
"""
from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
from datetime import datetime


class CustomerBaseDTO(BaseModel):
    """Base DTO for Customer with common fields"""
    document: str = Field(..., min_length=1, max_length=50, description="Document ID")
    firstname: str = Field(..., min_length=1, max_length=100, description="First name")
    lastname: str = Field(..., min_length=1, max_length=100, description="Last name")
    address: str = Field(..., min_length=1, max_length=500, description="Address")
    phone: str = Field(..., min_length=1, max_length=20, description="Phone number")
    email: EmailStr = Field(..., description="Email address")

    @validator('document')
    def validate_document(cls, v):
        if not v.strip():
            raise ValueError('Document cannot be empty')
        return v.strip()

    @validator('firstname', 'lastname')
    def validate_names(cls, v):
        if not v.strip():
            raise ValueError('Name cannot be empty')
        return v.strip().title()

    @validator('address')
    def validate_address(cls, v):
        if not v.strip():
            raise ValueError('Address cannot be empty')
        return v.strip()

    @validator('phone')
    def validate_phone(cls, v):
        if not v.strip():
            raise ValueError('Phone cannot be empty')
        # Basic phone validation - can be enhanced
        phone = v.strip()
        if len(phone) < 7:
            raise ValueError('Phone number too short')
        return phone


class CustomerCreateDTO(CustomerBaseDTO):
    """DTO for creating a new customer"""
    pass


class CustomerUpdateDTO(BaseModel):
    """DTO for updating a customer - all fields optional"""
    firstname: Optional[str] = Field(None, min_length=1, max_length=100)
    lastname: Optional[str] = Field(None, min_length=1, max_length=100)
    address: Optional[str] = Field(None, min_length=1, max_length=500)
    phone: Optional[str] = Field(None, min_length=1, max_length=20)
    email: Optional[EmailStr] = None

    @validator('firstname', 'lastname')
    def validate_names(cls, v):
        if v is not None and not v.strip():
            raise ValueError('Name cannot be empty')
        return v.strip().title() if v else v

    @validator('address')
    def validate_address(cls, v):
        if v is not None and not v.strip():
            raise ValueError('Address cannot be empty')
        return v.strip() if v else v

    @validator('phone')
    def validate_phone(cls, v):
        if v is not None:
            if not v.strip():
                raise ValueError('Phone cannot be empty')
            phone = v.strip()
            if len(phone) < 7:
                raise ValueError('Phone number too short')
            return phone
        return v


class CustomerResponseDTO(CustomerBaseDTO):
    """DTO for customer response"""
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CustomerCreateResponseDTO(BaseModel):
    """DTO for customer creation response"""
    createCustomerValid: bool = Field(..., description="Whether customer creation was successful")


class CustomerUpdateResponseDTO(BaseModel):
    """DTO for customer update response"""
    updateCustomerValid: bool = Field(..., description="Whether customer update was successful")


class CustomerFindResponseDTO(BaseModel):
    """DTO for customer find response - matches the required API format"""
    document: str
    firstname: str
    lastname: str
    address: str
    phone: str
    email: str

