"""
FastAPI main application
User Service - Customer Management Microservice
"""
import logging
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

from app.core.config import settings
from app.core.database import create_tables, check_database_connection
from app.api.endpoints import customer, health
from app.utils.consul import register_with_consul, deregister_from_consul

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper()),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager
    Handles startup and shutdown events
    """
    # Startup
    logger.info("Starting User Service...")
    
    try:
        # Create database tables
        logger.info("Creating database tables...")
        create_tables()
        
        # Check database connection
        logger.info("Checking database connection...")
        if not check_database_connection():
            logger.error("Database connection failed!")
            raise Exception("Database connection failed")
        
        # Register with Consul
        logger.info("Registering with Consul...")
        await register_with_consul()
        
        logger.info("User Service started successfully!")
        
    except Exception as e:
        logger.error(f"Failed to start User Service: {e}")
        raise
    
    yield
    
    # Shutdown
    logger.info("Shutting down User Service...")
    try:
        # Deregister from Consul
        await deregister_from_consul()
        logger.info("User Service shutdown completed!")
    except Exception as e:
        logger.error(f"Error during shutdown: {e}")


# Create FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="User Service - Customer Management Microservice",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """
    Global exception handler
    """
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": "An unexpected error occurred"
        }
    )


# Include routers
app.include_router(
    health.router,
    prefix="/health",
    tags=["Health"]
)

app.include_router(
    customer.router,
    prefix="/customer",
    tags=["Customer"]
)


# Root endpoint
@app.get("/")
async def root():
    """
    Root endpoint
    """
    return {
        "service": settings.SERVICE_NAME,
        "version": settings.VERSION,
        "status": "running",
        "message": "User Service is running",
        "docs": "/docs",
        "health": "/health"
    }

# Direct health endpoint for Consul
@app.get("/health")
async def direct_health_check():
    """
    Direct health check endpoint for Consul
    """
    return {
        "status": "healthy",
        "service": settings.SERVICE_NAME,
        "version": settings.VERSION,
        "message": "User Service is running"
    }

# Service info endpoint
@app.get("/info")
async def service_info():
    """
    Service information endpoint
    """
    return {
        "service": settings.SERVICE_NAME,
        "version": settings.VERSION,
        "description": "Customer Management Microservice",
        "database": "PostgreSQL",
        "framework": "FastAPI",
        "language": "Python",
        "endpoints": {
            "create_customer": "POST /customer/createcustomer",
            "find_customer": "GET /customer/findcustomerbyid",
            "update_customer": "PUT /customer/updatecustomer",
            "delete_customer": "DELETE /customer/deletecustomer/{customerid}",
            "get_all_customers": "GET /customer/customers",
            "get_customer_by_email": "GET /customer/customerbyemail/{email}",
            "health": "GET /health/health",
            "ready": "GET /health/ready",
            "live": "GET /health/live"
        }
    }


if __name__ == "__main__":
    # Run the application
    uvicorn.run(
        "app.main:app",
        host=settings.SERVICE_HOST,
        port=settings.SERVICE_PORT,
        reload=True,
        log_level=settings.LOG_LEVEL.lower()
    )

