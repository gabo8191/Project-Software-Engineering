"""
Health check endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db, check_database_connection
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

# Create router
router = APIRouter()


@router.get("/health")
async def health_check():
    """
    Basic health check endpoint
    Returns service status
    """
    try:
        logger.info("Health check requested")
        return {
            "status": "healthy",
            "service": settings.SERVICE_NAME,
            "version": settings.VERSION,
            "message": "User Service is running"
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Service unhealthy"
        )


@router.get("/ready")
async def readiness_check(db: Session = Depends(get_db)):
    """
    Readiness check endpoint
    Verifies that the service is ready to accept requests
    Checks database connectivity
    """
    try:
        logger.info("Readiness check requested")
        
        # Check database connection
        db_healthy = check_database_connection()
        
        if db_healthy:
            logger.info("Service is ready")
            return {
                "status": "ready",
                "service": settings.SERVICE_NAME,
                "database": "connected",
                "message": "Service is ready to accept requests"
            }
        else:
            logger.warning("Service not ready - database connection failed")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Service not ready - database connection failed"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Readiness check failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Service not ready"
        )


@router.get("/live")
async def liveness_check():
    """
    Liveness check endpoint
    Verifies that the service is alive and running
    """
    try:
        logger.info("Liveness check requested")
        return {
            "status": "alive",
            "service": settings.SERVICE_NAME,
            "message": "Service is alive and running"
        }
    except Exception as e:
        logger.error(f"Liveness check failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Service not alive"
        )

