import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Package, Server, Activity, Database, Shield } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import { cn } from '../utils/cn';

interface ServiceHealth {
  name: string;
  status: 'healthy' | 'unhealthy' | 'unknown';
  endpoint: string;
  icon: React.ComponentType<{ className?: string }>;
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [services, setServices] = useState<ServiceHealth[]>([
    { name: 'Login Service', status: 'unknown', endpoint: '/health', icon: Shield },
    { name: 'User Service', status: 'unknown', endpoint: '/health', icon: Users },
    { name: 'Order Service', status: 'unknown', endpoint: '/health', icon: Package },
  ]);

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate('/login');
    }

    // Check service health
    checkServicesHealth();
  }, [navigate]);

  const checkServicesHealth = async () => {
    const healthChecks = [
      { name: 'Login Service', endpoint: 'http://localhost:8081/health', icon: Shield },
      { name: 'User Service', endpoint: 'http://localhost:8000/health', icon: Users },
      { name: 'Order Service', endpoint: 'http://localhost:3000/health', icon: Package },
    ];

    const updatedServices = await Promise.all(
      healthChecks.map(async (service) => {
        try {
          const response = await fetch(service.endpoint);
          return {
            ...service,
            status: response.ok ? 'healthy' as const : 'unhealthy' as const,
            endpoint: service.endpoint
          };
        } catch (error) {
          return {
            ...service,
            status: 'unhealthy' as const,
            endpoint: service.endpoint
          };
        }
      })
    );

    setServices(updatedServices);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-success-600 bg-success-100';
      case 'unhealthy': return 'text-error-600 bg-error-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'healthy': return 'Healthy';
      case 'unhealthy': return 'Unhealthy';
      default: return 'Unknown';
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user.username}</p>
        </div>
      </div>

      {/* Welcome Card */}
      <Card elevation="medium" className="bg-gradient-to-r from-primary-600 to-primary-700 text-white border-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Welcome to Microservices Dashboard</h2>
            <p className="text-primary-100 mb-4">Monitor and manage your microservices ecosystem</p>
            <Button
              onClick={() => navigate('/customers')}
              variant="secondary"
              size="lg"
              className="bg-white text-primary-700 hover:bg-gray-100"
            >
              Get Started
            </Button>
          </div>
          <div className="hidden lg:block">
            <div className="bg-white bg-opacity-10 rounded-2xl p-4">
              <Server className="w-16 h-16 text-white" />
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/customers"
          className="group"
        >
          <Card elevation="medium" className="group-hover:shadow-apple-md transition-all duration-200 group-hover:-translate-y-1">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-xl p-3 mr-4">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  Customer Management
                </h3>
                <p className="text-gray-600 text-sm">Create and search customers</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link
          to="/orders"
          className="group"
        >
          <Card elevation="medium" className="group-hover:shadow-apple-md transition-all duration-200 group-hover:-translate-y-1">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-xl p-3 mr-4">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                  Order Management
                </h3>
                <p className="text-gray-600 text-sm">Create, update, and track orders</p>
              </div>
            </div>
          </Card>
        </Link>

        <button
          onClick={checkServicesHealth}
          className="group text-left"
        >
          <Card elevation="medium" className="group-hover:shadow-apple-md transition-all duration-200 group-hover:-translate-y-1">
            <div className="flex items-center">
              <div className="bg-purple-100 rounded-xl p-3 mr-4">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                  Refresh Status
                </h3>
                <p className="text-gray-600 text-sm">Check microservices health</p>
              </div>
            </div>
          </Card>
        </button>
      </div>

      {/* Service Status */}
      <Card elevation="medium">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Database className="w-6 h-6 text-gray-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Microservices Status</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <div
                  key={index}
                  className="bg-gray-50 rounded-xl p-4 border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <Icon className="w-5 h-5 text-gray-600 mr-2" />
                      <h3 className="font-medium text-gray-900">{service.name}</h3>
                    </div>
                    <span
                      className={cn(
                        'px-3 py-1 rounded-full text-xs font-medium',
                        getStatusColor(service.status)
                      )}
                    >
                      {getStatusText(service.status)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-mono">{service.endpoint}</p>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* User Info */}
      <Card elevation="medium">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">User Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-sm font-medium text-gray-500">User ID:</span>
            <p className="text-gray-900 font-mono text-sm">{user.id}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Username:</span>
            <p className="text-gray-900">{user.username}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Email:</span>
            <p className="text-gray-900">{user.email}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Created:</span>
            <p className="text-gray-900">{new Date(user.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DashboardPage;