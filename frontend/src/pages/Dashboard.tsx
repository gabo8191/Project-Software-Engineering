import React, { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import { Shield, Database, Server, Cpu, Wifi } from 'lucide-react';
import Card from '../components/ui/Card';
import { userService, User } from '../services/userService';
import { orderService } from '../services/orderService';
import { Order } from '../types';

const Dashboard: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [customers, setCustomers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [serviceStatus, setServiceStatus] = useState({
    loginService: 'checking' as 'healthy' | 'warning' | 'error' | 'checking',
    userService: 'checking' as 'healthy' | 'warning' | 'error' | 'checking',
    orderService: 'checking' as 'healthy' | 'warning' | 'error' | 'checking',
    apiGateway: 'checking' as 'healthy' | 'warning' | 'error' | 'checking'
  });

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const checkServiceHealth = async () => {
    // Set all services to checking state
    setServiceStatus(prev => ({
      ...prev,
      loginService: 'checking',
      userService: 'checking',
      orderService: 'checking',
      apiGateway: 'checking'
    }));

    const statusUpdates: any = {};

    // Check login service through API Gateway
    try {
      const response = await fetch('http://localhost:8090/login/health', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });
      statusUpdates.loginService = response.ok ? 'healthy' : 'error';
    } catch (error) {
      console.error('Error checking loginService:', error);
      statusUpdates.loginService = 'error';
    }

    // Check user service through API Gateway  
    try {
      const response = await fetch('http://localhost:8090/customer/health', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });
      statusUpdates.userService = response.ok ? 'healthy' : 'error';
    } catch (error) {
      console.error('Error checking userService:', error);
      statusUpdates.userService = 'error';
    }

    // Check order service through API Gateway
    try {
      const response = await fetch('http://localhost:8090/order/health', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });
      statusUpdates.orderService = response.ok ? 'healthy' : 'error';
    } catch (error) {
      console.error('Error checking orderService:', error);
      statusUpdates.orderService = 'error';
    }

    // Check API Gateway (Traefik) - Test if it's routing correctly
    try {
      // Instead of checking Traefik directly, test if it's routing properly
      // by making a simple request through it
      const response = await fetch('http://localhost:8090/customer/customers', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });
      // If we can get data through the gateway, it's working
      statusUpdates.apiGateway = response.ok ? 'healthy' : 'error';
    } catch (error) {
      console.error('Error checking API Gateway routing:', error);
      statusUpdates.apiGateway = 'error';
    }

    setServiceStatus(prev => ({ ...prev, ...statusUpdates }));
  };

  const loadDashboardData = async () => {
    try {
      // Load data and check service health in parallel
      const [usersResponse, ordersData] = await Promise.all([
        userService.getAllUsers().catch(() => ({ success: false, users: [] })), // Fallback to empty response
        orderService.getAllOrders().catch(() => []), // Fallback to empty array if fails
      ]);
      
      setCustomers(usersResponse.users || []);
      setOrders(ordersData);
      
      // Check service health after data load
      await checkServiceHealth();
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  useEffect(() => {
    loadDashboardData();
    
    // Set up periodic health checks every 30 seconds
    const healthCheckInterval = setInterval(checkServiceHealth, 30000);
    
    return () => clearInterval(healthCheckInterval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      
      <div className="3xl:ml-64">
        <Header onMenuClick={toggleSidebar} />
        
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Estado del Sistema
              </h1>
              <p className="text-gray-600">
                Monitoreo en tiempo real de todos los microservicios
              </p>
            </div>

            {/* System Overview Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
              {/* Login Service */}
              <Card className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Shield size={24} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">Login Service</h3>
                    <p className="text-sm text-gray-600">Autenticación (Go)</p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    serviceStatus.loginService === 'healthy' ? 'bg-green-100 text-green-800' :
                    serviceStatus.loginService === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    serviceStatus.loginService === 'checking' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {serviceStatus.loginService === 'healthy' ? '✓ Operativo' :
                     serviceStatus.loginService === 'warning' ? '⚠ Advertencia' :
                     serviceStatus.loginService === 'checking' ? '⏳ Verificando...' : '✗ Error'}
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <p className="mb-2">Endpoints: /login/* | Puerto: 8081</p>
                  <p>Redis | JWT Authentication</p>
                </div>
              </Card>

              {/* User Service */}
              <Card className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Database size={24} className="text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">User Service</h3>
                    <p className="text-sm text-gray-600">Clientes (Python/FastAPI)</p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    serviceStatus.userService === 'healthy' ? 'bg-green-100 text-green-800' :
                    serviceStatus.userService === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    serviceStatus.userService === 'checking' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {serviceStatus.userService === 'healthy' ? '✓ Operativo' :
                     serviceStatus.userService === 'warning' ? '⚠ Advertencia' :
                     serviceStatus.userService === 'checking' ? '⏳ Verificando...' : '✗ Error'}
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <p className="mb-2">Endpoints: /customer/* | Puerto: 8000</p>
                  <p>PostgreSQL | {customers.length} clientes registrados</p>
                </div>
              </Card>

              {/* Order Service */}
              <Card className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Server size={24} className="text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">Order Service</h3>
                    <p className="text-sm text-gray-600">Pedidos (Node.js)</p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    serviceStatus.orderService === 'healthy' ? 'bg-green-100 text-green-800' :
                    serviceStatus.orderService === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    serviceStatus.orderService === 'checking' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {serviceStatus.orderService === 'healthy' ? '✓ Operativo' :
                     serviceStatus.orderService === 'warning' ? '⚠ Advertencia' :
                     serviceStatus.orderService === 'checking' ? '⏳ Verificando...' : '✗ Error'}
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <p className="mb-2">Endpoints: /order/* | Puerto: 3000</p>
                  <p>MongoDB + Consul | {orders.length} pedidos totales</p>
                </div>
              </Card>
            </div>

            {/* Infrastructure Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* API Gateway */}
              <Card className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Wifi size={24} className="text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">API Gateway</h3>
                    <p className="text-sm text-gray-600">Traefik - Puerto 8090</p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    serviceStatus.apiGateway === 'healthy' ? 'bg-green-100 text-green-800' :
                    serviceStatus.apiGateway === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    serviceStatus.apiGateway === 'checking' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {serviceStatus.apiGateway === 'healthy' ? '✓ Operativo' :
                     serviceStatus.apiGateway === 'warning' ? '⚠ Advertencia' :
                     serviceStatus.apiGateway === 'checking' ? '⏳ Verificando...' : '✗ Error'}
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <p className="mb-2">Proxy reverso | Load balancing | CORS</p>
                  <p>Ruteo automático a todos los microservicios</p>
                </div>
              </Card>

              {/* Infrastructure */}
              <Card className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Cpu size={24} className="text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">Infraestructura</h3>
                    <p className="text-sm text-gray-600">Bases de datos y Service Discovery</p>
                  </div>
                  <div className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ✓ Operativo
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <p className="mb-2">Consul | PostgreSQL | MongoDB | Redis</p>
                  <p>Docker Compose | Service Discovery</p>
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;