"""
Consul service discovery integration
"""
import consul
import logging
import asyncio
from typing import Optional
from app.core.config import settings

logger = logging.getLogger(__name__)


class ConsulService:
    """Consul service discovery client"""
    
    def __init__(self):
        self.consul_client = None
        self.service_id = None
        self._initialize_consul()
    
    def _initialize_consul(self):
        """Initialize Consul client"""
        try:
            self.consul_client = consul.Consul(
                host=settings.CONSUL_HOST,
                port=settings.CONSUL_PORT
            )
            logger.info(f"Consul client initialized: {settings.CONSUL_HOST}:{settings.CONSUL_PORT}")
        except Exception as e:
            logger.error(f"Failed to initialize Consul client: {e}")
            self.consul_client = None
    
    def register_service(self) -> bool:
        """
        Register this service with Consul
        
        Returns:
            True if registration successful, False otherwise
        """
        try:
            if not self.consul_client:
                logger.error("Consul client not initialized")
                return False
            
            # Service ID
            self.service_id = f"{settings.SERVICE_NAME}-{settings.SERVICE_PORT}"
            
            # Service registration data
            service_data = {
                "name": settings.SERVICE_NAME,
                "service_id": self.service_id,
                "tags": ["user", "api", "microservice", "python", "fastapi"],
                "address": "user-service",  # Container name for internal communication
                "port": settings.SERVICE_PORT,
                "check": {
                    "http": f"http://user-service:{settings.SERVICE_PORT}/health",
                    "interval": f"{settings.HEALTH_CHECK_INTERVAL}s",
                    "timeout": "10s",
                    "deregister_critical_service_after": "30s"
                }
            }

            # Register service
            result = self.consul_client.agent.service.register(**service_data)
            
            if result:
                logger.info(f"Service registered successfully: {self.service_id}")
                return True
            else:
                logger.error("Failed to register service with Consul")
                return False
                
        except Exception as e:
            logger.error(f"Error registering service with Consul: {e}")
            return False
    
    def deregister_service(self) -> bool:
        """
        Deregister this service from Consul
        
        Returns:
            True if deregistration successful, False otherwise
        """
        try:
            if not self.consul_client or not self.service_id:
                logger.warning("No service to deregister")
                return True
            
            result = self.consul_client.agent.service.deregister(self.service_id)
            
            if result:
                logger.info(f"Service deregistered successfully: {self.service_id}")
                return True
            else:
                logger.error("Failed to deregister service from Consul")
                return False
                
        except Exception as e:
            logger.error(f"Error deregistering service from Consul: {e}")
            return False
    
    def get_service(self, service_name: str) -> Optional[dict]:
        """
        Get service information from Consul
        
        Args:
            service_name: Name of the service to find
            
        Returns:
            Service information if found, None otherwise
        """
        try:
            if not self.consul_client:
                logger.error("Consul client not initialized")
                return None
            
            services = self.consul_client.health.service(service_name, passing=True)
            
            if services[1]:  # services[1] contains the service list
                service = services[1][0]
                logger.info(f"Service found: {service_name}")
                return {
                    "address": service["Service"]["Address"],
                    "port": service["Service"]["Port"],
                    "tags": service["Service"]["Tags"]
                }
            else:
                logger.warning(f"Service not found: {service_name}")
                return None
                
        except Exception as e:
            logger.error(f"Error getting service {service_name} from Consul: {e}")
            return None
    
    def get_services(self) -> list:
        """
        Get all available services from Consul
        
        Returns:
            List of available services
        """
        try:
            if not self.consul_client:
                logger.error("Consul client not initialized")
                return []
            
            services = self.consul_client.agent.services()
            
            service_list = []
            for service_id, service_info in services.items():
                service_list.append({
                    "id": service_id,
                    "name": service_info["Service"],
                    "address": service_info["Address"],
                    "port": service_info["Port"],
                    "tags": service_info["Tags"]
                })
            
            logger.info(f"Found {len(service_list)} services in Consul")
            return service_list
            
        except Exception as e:
            logger.error(f"Error getting services from Consul: {e}")
            return []
    
    def is_consul_available(self) -> bool:
        """
        Check if Consul is available
        
        Returns:
            True if Consul is available, False otherwise
        """
        try:
            if not self.consul_client:
                return False
            
            # Try to get leader information
            leader = self.consul_client.status.leader()
            return leader is not None
            
        except Exception as e:
            logger.error(f"Consul not available: {e}")
            return False


# Global Consul service instance
consul_service = ConsulService()


async def register_with_consul():
    """
    Async function to register service with Consul
    """
    try:
        logger.info("Starting Consul registration...")
        
        # Wait a bit for Consul to be ready
        await asyncio.sleep(5)
        
        # Try to register service
        max_retries = 5
        for attempt in range(max_retries):
            if consul_service.register_service():
                logger.info("Successfully registered with Consul")
                return True
            else:
                logger.warning(f"Consul registration attempt {attempt + 1} failed, retrying...")
                await asyncio.sleep(5)
        
        logger.error("Failed to register with Consul after all retries")
        return False
        
    except Exception as e:
        logger.error(f"Error in Consul registration: {e}")
        return False


async def deregister_from_consul():
    """
    Async function to deregister service from Consul
    """
    try:
        logger.info("Deregistering from Consul...")
        consul_service.deregister_service()
        logger.info("Successfully deregistered from Consul")
    except Exception as e:
        logger.error(f"Error deregistering from Consul: {e}")

