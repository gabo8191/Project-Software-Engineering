"""
Configuration settings for the User Service
"""
import os
from typing import Optional


class Settings:
    """Application settings"""
    
    # Database configuration
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql://postgres_user:postgres_password_123@postgres:5432/customerdb"
    )
    
    # Service configuration
    SERVICE_NAME: str = os.getenv("SERVICE_NAME", "user-service")
    SERVICE_PORT: int = int(os.getenv("SERVICE_PORT", "8000"))
    SERVICE_HOST: str = os.getenv("SERVICE_HOST", "0.0.0.0")
    
    # Consul configuration
    CONSUL_HOST: str = os.getenv("CONSUL_HOST", "consul")
    CONSUL_PORT: int = int(os.getenv("CONSUL_PORT", "8500"))
    
    # API configuration
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "User Service"
    VERSION: str = "1.0.0"
    
    # CORS settings
    ALLOWED_ORIGINS: list = [
        "http://localhost",
        "http://localhost:80",
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:8080",
        "http://localhost:8081",
    ]
    
    # Health check settings
    HEALTH_CHECK_INTERVAL: int = 30  # seconds
    
    # Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    
    @property
    def consul_url(self) -> str:
        """Get Consul URL"""
        return f"http://{self.CONSUL_HOST}:{self.CONSUL_PORT}"
    
    @property
    def service_url(self) -> str:
        """Get service URL for Consul registration"""
        return f"http://{self.SERVICE_HOST}:{self.SERVICE_PORT}"


# Global settings instance
settings = Settings()

