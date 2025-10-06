"""
Service Client for User Service
Handles inter-service communication using Consul service discovery
"""
import aiohttp
import asyncio
import json
from typing import Dict, Any, Optional, List
from app.utils.consul import consul_service
from app.core.config import settings
from app.core.logger import logger


class ServiceClient:
    """HTTP client for inter-service communication with service discovery"""
    
    def __init__(self):
        self.timeout = aiohttp.ClientTimeout(total=30)
        self.headers = {
            'Content-Type': 'application/json',
            'User-Agent': 'user-service/1.0'
        }
    
    async def _make_service_request(
        self,
        service_name: str,
        endpoint: str,
        method: str = 'GET',
        data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Make HTTP request to a discovered service
        
        Args:
            service_name: Name of the service to call
            endpoint: API endpoint to call
            method: HTTP method (GET, POST, etc.)
            data: Request body data
            
        Returns:
            Response data as dictionary
            
        Raises:
            Exception: If service discovery or request fails
        """
        try:
            # Discover the service
            service_info = consul_service.get_service(service_name)
            if not service_info:
                raise Exception(f"Service {service_name} not found in Consul")
            
            # Build URL
            url = f"http://{service_info['address']}:{service_info['port']}{endpoint}"
            logger.info(f"Making {method} request to {service_name}: {url}")
            
            # Prepare request data
            json_data = None
            if data and method.upper() in ['POST', 'PUT', 'PATCH']:
                json_data = data
            
            # Make the request
            async with aiohttp.ClientSession(timeout=self.timeout) as session:
                async with session.request(
                    method.upper(),
                    url,
                    headers=self.headers,
                    json=json_data
                ) as response:
                    
                    if response.status >= 400:
                        error_text = await response.text()
                        raise Exception(f"HTTP {response.status}: {error_text}")
                    
                    # Try to parse JSON response
                    try:
                        return await response.json()
                    except:
                        # If not JSON, return text
                        text_response = await response.text()
                        return {"response": text_response}
                    
        except Exception as e:
            logger.error(f"Service call to {service_name} failed: {e}")
            raise
    
    async def validate_auth_token(self, token: str) -> Dict[str, Any]:
        """
        Validate authentication token with login service
        
        Args:
            token: JWT token to validate
            
        Returns:
            Validation result with user info
        """
        try:
            logger.info("Validating auth token with login-service")
            
            result = await self._make_service_request(
                'login-service',
                '/auth/validate',
                'POST',
                {'token': token}
            )
            
            return {
                'valid': result.get('valid', False),
                'user_id': result.get('user_id'),
                'email': result.get('email')
            }
            
        except Exception as e:
            logger.error(f"Auth token validation failed: {e}")
            return {'valid': False}
    
    async def notify_order_service(self, user_id: str, event: str, data: Dict[str, Any]) -> bool:
        """
        Notify order service about user-related events
        
        Args:
            user_id: User ID
            event: Event type (user_updated, user_deleted, etc.)
            data: Event data
            
        Returns:
            True if notification successful, False otherwise
        """
        try:
            logger.info(f"Notifying order-service about {event} for user {user_id}")
            
            await self._make_service_request(
                'order-service',
                '/notifications/user-event',
                'POST',
                {
                    'user_id': user_id,
                    'event': event,
                    'data': data,
                    'timestamp': settings.get_current_timestamp()
                }
            )
            
            logger.info("Order service notification sent successfully")
            return True
            
        except Exception as e:
            # Don't fail the operation if notification fails
            logger.warning(f"Failed to notify order service: {e}")
            return False
    
    async def check_service_health(self, service_name: str) -> bool:
        """
        Check if a service is healthy
        
        Args:
            service_name: Name of the service to check
            
        Returns:
            True if service is healthy, False otherwise
        """
        try:
            await self._make_service_request(service_name, '/health', 'GET')
            return True
        except:
            return False
    
    async def get_available_services(self) -> List[str]:
        """
        Get list of available and healthy services
        
        Returns:
            List of service names that are available
        """
        try:
            services = ['login-service', 'order-service']
            available_services = []
            
            for service in services:
                is_healthy = await self.check_service_health(service)
                if is_healthy:
                    available_services.append(service)
            
            logger.info(f"Available services: {available_services}")
            return available_services
            
        except Exception as e:
            logger.error(f"Failed to check available services: {e}")
            return []
    
    async def get_user_orders(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Get user's orders from order service
        
        Args:
            user_id: User ID
            
        Returns:
            List of user's orders
        """
        try:
            logger.info(f"Getting orders for user {user_id} from order-service")
            
            result = await self._make_service_request(
                'order-service',
                f'/order/user/{user_id}',
                'GET'
            )
            
            return result.get('orders', [])
            
        except Exception as e:
            logger.error(f"Failed to get user orders: {e}")
            return []


# Global service client instance
service_client = ServiceClient()