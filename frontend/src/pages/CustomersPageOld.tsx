import React, { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import { Plus, Search, Edit, Trash2, UserPlus } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { userService, User } from '../services/userService';

const CustomersPage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [formLoading, setFormLoading] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('👥 Loading users from user-service...');
      
      // Get all users from user-service
      const response = await userService.getAllUsers();
      if (response.success && response.users) {
        console.log('✅ Users loaded successfully:', response.users);
        setCustomers(response.users);
      } else {
        setError(response.message || 'Error loading users');
      }
    } catch (error: any) {
      console.error('❌ Error loading users:', error);
      setError('Error loading users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      setError(null);
      
      console.log('👥 Creating user in user-service...');
      
      const userData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address
      };
      
      const response = await userService.createUser(userData);
      
      if (response.success) {
        console.log('✅ User created successfully');
        
        // Reset form and close modal
        setFormData({
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          address: ''
        });
        setShowCreateModal(false);
        
        // Reload users
        await loadCustomers();
      } else {
        setError(response.message || 'Error creating user');
      }
    } catch (error: any) {
      console.error('❌ Error creating user:', error);
      setError(error.message || 'Error creating user');
    } finally {
      setFormLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCustomers = customers.filter(customer =>
    customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      
      <div className="3xl:ml-64">
        <Header onMenuClick={toggleSidebar} />
        
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Clientes</h1>
                <p className="text-gray-600">Gestiona tu base de clientes</p>
              </div>
              <Button 
                onClick={() => setShowCreateModal(true)}
                className="mt-4 sm:mt-0"
              >
                <Plus size={20} className="mr-2" />
                Nuevo Cliente
              </Button>
            </div>

            {/* Search and Filters */}
            <Card className="p-6 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Buscar clientes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    icon={<Search size={20} />}
                  />
                </div>
              </div>
            </Card>

            {/* Error Message */}
            {error && (
              <Card className="mb-6 border-red-200 bg-red-50">
                <div className="p-4">
                  <div className="flex items-center">
                    <UserPlus className="h-5 w-5 text-red-500 mr-2" />
                    <p className="text-red-700">{error}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={loadCustomers}
                      className="ml-auto text-red-600 border-red-300 hover:bg-red-100"
                    >
                      Reintentar
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Info Message for Empty State */}
            {!loading && !error && customers.length === 0 && (
              <Card className="mb-6 border-blue-200 bg-blue-50">
                <div className="p-6 text-center">
                  <UserPlus className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    No hay clientes registrados
                  </h3>
                  <p className="text-blue-700 mb-4">
                    Comienza agregando tu primer cliente al sistema.
                  </p>
                  <Button 
                    onClick={() => setShowCreateModal(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus size={20} className="mr-2" />
                    Crear Primer Cliente
                  </Button>
                </div>
              </Card>
            )}

            {/* Customers Table */}
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-6 font-semibold text-gray-900">Cliente</th>
                      <th className="text-left py-3 px-6 font-semibold text-gray-900">Email</th>
                      <th className="text-left py-3 px-6 font-semibold text-gray-900">Teléfono</th>
                      <th className="text-left py-3 px-6 font-semibold text-gray-900">Dirección</th>
                      <th className="text-left py-3 px-6 font-semibold text-gray-900">Fecha</th>
                      <th className="text-left py-3 px-6 font-semibold text-gray-900">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-gray-500">
                          Cargando clientes...
                        </td>
                      </tr>
                    ) : filteredCustomers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-gray-500">
                          No se encontraron clientes
                        </td>
                      </tr>
                    ) : (
                      filteredCustomers.map((customer) => (
                        <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-6">
                            <div>
                              <p className="font-medium text-gray-900">
                                {customer.firstName} {customer.lastName}
                              </p>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-gray-600">{customer.email}</td>
                          <td className="py-4 px-6 text-gray-600">{customer.phone}</td>
                          <td className="py-4 px-6 text-gray-600">{customer.address}</td>
                          <td className="py-4 px-6 text-gray-600">
                            {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                <Edit size={16} />
                              </Button>
                              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </main>
      </div>

      {/* Create Customer Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Nuevo Cliente</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-4">
              <Input
                label="Documento ID"
                type="text"
                placeholder="Ej: 12345678"
                value={formData.document}
                onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                required
              />
              
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Nombre"
                  type="text"
                  value={formData.firstname}
                  onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
                  required
                />
                <Input
                  label="Apellido"
                  type="text"
                  value={formData.lastname}
                  onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                  required
                />
              </div>
              
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              
              <Input
                label="Teléfono"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
              
              <Input
                label="Dirección"
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />

              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  isLoading={formLoading}
                  className="flex-1"
                >
                  <UserPlus size={20} className="mr-2" />
                  Crear Cliente
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersPage;