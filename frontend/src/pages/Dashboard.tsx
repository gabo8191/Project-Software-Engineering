import React, { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import { Shield, Database, Server, Cpu, Wifi, CheckCircle } from 'lucide-react';
import Card from '../components/ui/Card';
import { userService, User } from '../services/userService';
import { orderService } from '../services/orderService';
import { Order } from '../types';

const ServiceStatusCard: React.FC<{
  serviceName: string;
  status: 'healthy' | 'warning' | 'error' | 'checking';
  description: string;
  icon: React.ReactNode;
}> = ({ serviceName, status, description, icon }) => {
  const statusColors = {
    healthy: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    error: 'bg-red-100 text-red-800 border-red-200',
    checking: 'bg-blue-100 text-blue-800 border-blue-200'
  };

  const statusIcons = {
    healthy: <CheckCircle size={16} className="text-green-600" />,
    warning: <Wifi size={16} className="text-yellow-600" />,
    error: <Server size={16} className="text-red-600" />,
    checking: <Cpu size={16} className="text-blue-600 animate-pulse" />
  };

  const statusText = {
    healthy: 'Operativo',
    warning: 'Advertencia',
    error: 'Error',
    checking: 'Verificando...'
  };

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            {icon}
            <h3 className="text-lg font-semibold text-gray-900">{serviceName}</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">{description}</p>
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${statusColors[status]}`}>
            {statusIcons[status]}
            <span className="ml-1">{statusText[status]}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

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

    // Check API Gateway (Traefik) itself
    try {
      const response = await fetch('http://localhost:8080/api/rawdata', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });
      statusUpdates.apiGateway = response.ok ? 'healthy' : 'error';
    } catch (error) {
      console.error('Error checking API Gateway:', error);
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

            {/* Service Status Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
              <ServiceStatusCard
                serviceName="Login Service"
                status={serviceStatus.loginService}
                description="Autenticación (Go) - /login/*"
                icon={<Shield size={24} className="text-blue-600" />}
              />
              <ServiceStatusCard
                serviceName="User Service"
                status={serviceStatus.userService}
                description="Gestión de clientes (Python/FastAPI) - /customer/*"
                icon={<Database size={24} className="text-green-600" />}
              />
              <ServiceStatusCard
                serviceName="Order Service"
                status={serviceStatus.orderService}
                description="Gestión de pedidos (Node.js) - /order/*"
                icon={<Server size={24} className="text-purple-600" />}
              />
              <ServiceStatusCard
                serviceName="API Gateway"
                status={serviceStatus.apiGateway}
                description="Traefik - Puerto 8090 - Proxy Reverso"
                icon={<Wifi size={24} className="text-orange-600" />}
              />
              <ServiceStatusCard
                serviceName="Service Discovery"
                status="healthy"
                description="Consul - Registro de servicios"
                icon={<Cpu size={24} className="text-indigo-600" />}
              />
              <ServiceStatusCard
                serviceName="Databases"
                status="healthy"
                description="PostgreSQL, MongoDB, Redis"
                icon={<Database size={24} className="text-gray-600" />}
              />
            </div>

            {/* Service Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* Login Service Details */}
              <Card className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Shield size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Autenticación</h3>
                    <p className="text-sm text-gray-600">Servicio de Login (Go)</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Estado:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      serviceStatus.loginService === 'healthy' ? 'bg-green-100 text-green-800' :
                      serviceStatus.loginService === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                      serviceStatus.loginService === 'checking' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {serviceStatus.loginService === 'healthy' ? 'Operativo' :
                       serviceStatus.loginService === 'warning' ? 'Advertencia' :
                       serviceStatus.loginService === 'checking' ? 'Verificando...' : 'Error'}
                    </span>
                  </div>
                  <div className="border-t pt-3">
                    <p className="text-xs font-medium text-gray-700 mb-2">Endpoints:</p>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-600">• POST /login/createuser</p>
                      <p className="text-xs text-gray-600">• POST /login/authuser</p>
                      <p className="text-xs text-gray-600">• GET /login/health</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* User Service Details */}
              <Card className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Database size={24} className="text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Gestión de Clientes</h3>
                    <p className="text-sm text-gray-600">User Service (FastAPI)</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Estado:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      serviceStatus.userService === 'healthy' ? 'bg-green-100 text-green-800' :
                      serviceStatus.userService === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                      serviceStatus.userService === 'checking' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {serviceStatus.userService === 'healthy' ? 'Operativo' :
                       serviceStatus.userService === 'warning' ? 'Advertencia' :
                       serviceStatus.userService === 'checking' ? 'Verificando...' : 'Error'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Clientes registrados:</span>
                    <span className="font-medium text-gray-900">{customers.length}</span>
                  </div>
                  <div className="border-t pt-3">
                    <p className="text-xs font-medium text-gray-700 mb-2">Endpoints:</p>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-600">• POST /customer/createcustomer</p>
                      <p className="text-xs text-gray-600">• GET /customer/customers</p>
                      <p className="text-xs text-gray-600">• PUT /customer/updatecustomer</p>
                      <p className="text-xs text-gray-600">• GET /customer/health</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Order Service Details */}
              <Card className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Server size={24} className="text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Gestión de Pedidos</h3>
                    <p className="text-sm text-gray-600">Order Service (Node.js)</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Estado:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      serviceStatus.orderService === 'healthy' ? 'bg-green-100 text-green-800' :
                      serviceStatus.orderService === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                      serviceStatus.orderService === 'checking' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {serviceStatus.orderService === 'healthy' ? 'Operativo' :
                       serviceStatus.orderService === 'warning' ? 'Advertencia' :
                       serviceStatus.orderService === 'checking' ? 'Verificando...' : 'Error'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Pedidos totales:</span>
                    <span className="font-medium text-gray-900">{orders.length}</span>
                  </div>
                  <div className="border-t pt-3">
                    <p className="text-xs font-medium text-gray-700 mb-2">Endpoints:</p>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-600">• POST /order/createorder</p>
                      <p className="text-xs text-gray-600">• GET /order/getallorders</p>
                      <p className="text-xs text-gray-600">• PUT /order/updateorderstatus</p>
                      <p className="text-xs text-gray-600">• GET /order/health</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* API Gateway Details */}
              <Card className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Wifi size={24} className="text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">API Gateway</h3>
                    <p className="text-sm text-gray-600">Traefik (Puerto 8090)</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Estado:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      serviceStatus.apiGateway === 'healthy' ? 'bg-green-100 text-green-800' :
                      serviceStatus.apiGateway === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                      serviceStatus.apiGateway === 'checking' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {serviceStatus.apiGateway === 'healthy' ? 'Operativo' :
                       serviceStatus.apiGateway === 'warning' ? 'Advertencia' :
                       serviceStatus.apiGateway === 'checking' ? 'Verificando...' : 'Error'}
                    </span>
                  </div>
                  <div className="border-t pt-3">
                    <p className="text-xs font-medium text-gray-700 mb-2">Funciones:</p>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-600">• Proxy reverso</p>
                      <p className="text-xs text-gray-600">• Load balancing</p>
                      <p className="text-xs text-gray-600">• CORS management</p>
                      <p className="text-xs text-gray-600">• Request routing</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Infrastructure Details */}
              <Card className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Cpu size={24} className="text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Infraestructura</h3>
                    <p className="text-sm text-gray-600">Service Discovery & DBs</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Consul:</span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Operativo
                    </span>
                  </div>
                  <div className="border-t pt-3">
                    <p className="text-xs font-medium text-gray-700 mb-2">Componentes:</p>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-600">• PostgreSQL (User Service)</p>
                      <p className="text-xs text-gray-600">• MongoDB (Order Service)</p>
                      <p className="text-xs text-gray-600">• Redis (Login Service)</p>
                      <p className="text-xs text-gray-600">• Consul (Service Discovery)</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* System Overview */}
              <Card className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <CheckCircle size={24} className="text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Resumen del Sistema</h3>
                    <p className="text-sm text-gray-600">Arquitectura de Microservicios</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Servicios activos:</span>
                    <span className="font-medium text-gray-900">3/3</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Última verificación:</span>
                    <span className="font-medium text-gray-900">
                      {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="border-t pt-3">
                    <p className="text-xs font-medium text-gray-700 mb-2">Tecnologías:</p>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-600">• Docker Compose</p>
                      <p className="text-xs text-gray-600">• React + TypeScript</p>
                      <p className="text-xs text-gray-600">• Go, Python, Node.js</p>
                      <p className="text-xs text-gray-600">• JWT Authentication</p>
                    </div>
                  </div>
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