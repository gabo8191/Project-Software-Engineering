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
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    firstname: '',
    lastname: '',
    document: '',
    address: '',
    phone: ''
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
        email: formData.email,
        firstname: formData.firstname,
        lastname: formData.lastname,
        document: formData.document,
        address: formData.address,
        phone: formData.phone
      };
      
      const response = await userService.createUser(userData);
      
      if (response.success) {
        console.log('✅ User created successfully');
        
        // Reset form and close modal
        setFormData({
          email: '',
          firstname: '',
          lastname: '',
          document: '',
          address: '',
          phone: ''
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

  const handleEditCustomer = (customer: User) => {
    setSelectedCustomer(customer);
    setFormData({
      email: customer.email,
      firstname: customer.first_name || '',
      lastname: customer.last_name || '',
      document: customer.id,
      address: '', // These fields might not be available in the current user structure
      phone: ''
    });
    setShowEditModal(true);
  };

  const handleUpdateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    try {
      setFormLoading(true);
      setError(null);
      
      console.log('🔄 Updating user in user-service...');
      
      const updateData = {
        email: formData.email,
        first_name: formData.firstname,
        last_name: formData.lastname,
      };
      
      const response = await userService.updateUser(selectedCustomer.id, updateData);
      
      if (response.success) {
        console.log('✅ User updated successfully');
        
        // Reset form and close modal
        setFormData({
          email: '',
          firstname: '',
          lastname: '',
          document: '',
          address: '',
          phone: ''
        });
        setSelectedCustomer(null);
        setShowEditModal(false);
        
        // Reload users
        await loadCustomers();
      } else {
        setError(response.message || 'Error updating user');
      }
    } catch (error: any) {
      console.error('❌ Error updating user:', error);
      setError(error.message || 'Error updating user');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteCustomer = (customer: User) => {
    setSelectedCustomer(customer);
    setShowDeleteModal(true);
  };

  const confirmDeleteCustomer = async () => {
    if (!selectedCustomer) return;

    try {
      setFormLoading(true);
      setError(null);
      
      console.log('🗑️ Deleting user in user-service...');
      
      const response = await userService.deleteUser(selectedCustomer.id);
      
      if (response.success) {
        console.log('✅ User deleted successfully');
        
        // Close modal and reset
        setSelectedCustomer(null);
        setShowDeleteModal(false);
        
        // Reload users
        await loadCustomers();
      } else {
        setError(response.message || 'Error deleting user');
      }
    } catch (error: any) {
      console.error('❌ Error deleting user:', error);
      setError(error.message || 'Error deleting user');
    } finally {
      setFormLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    (customer.first_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (customer.last_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={toggleSidebar} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
              <p className="text-gray-600 mt-2">Manage users registered in the system</p>
            </div>

            {/* Actions Bar */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2"
              >
                <Plus size={20} />
                Add User
              </Button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            {/* Users Table */}
            <Card>
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-600">Loading users...</p>
                  </div>
                ) : filteredCustomers.length === 0 ? (
                  <div className="text-center py-8">
                    <UserPlus className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchTerm ? 'Try adjusting your search criteria.' : 'Get started by creating a new user.'}
                    </p>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredCustomers.map((customer) => (
                        <tr key={customer.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                  <span className="text-blue-600 font-medium">
                                    {customer.first_name?.[0] || customer.email[0].toUpperCase()}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {customer.first_name || customer.last_name ? 
                                    `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : 
                                    customer.username || 'No name'
                                  }
                                </div>
                                <div className="text-sm text-gray-500">ID: {customer.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {customer.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              customer.is_active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {customer.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {customer.created_at ? new Date(customer.created_at).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => handleEditCustomer(customer)}
                                className="text-blue-600 hover:text-blue-800"
                                title="Edit user"
                              >
                                <Edit size={16} />
                              </button>
                              <button 
                                onClick={() => handleDeleteCustomer(customer)}
                                className="text-red-600 hover:text-red-800"
                                title="Delete user"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </Card>
          </div>
        </main>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Create New User</h2>
              
              <form onSubmit={handleCreateCustomer} className="space-y-4">
                <Input
                  label="Email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="user@example.com"
                />
                
                <Input
                  label="Document ID"
                  type="text"
                  value={formData.document}
                  onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                  placeholder="12345678 (optional - will be auto-generated)"
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    type="text"
                    value={formData.firstname}
                    onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
                    placeholder="John"
                  />
                  
                  <Input
                    label="Last Name"
                    type="text"
                    value={formData.lastname}
                    onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                    placeholder="Doe"
                  />
                </div>
                
                <Input
                  label="Address"
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="123 Main St"
                />
                
                <Input
                  label="Phone"
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="555-1234"
                />
                
                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={formLoading}
                    className="flex-1"
                  >
                    {formLoading ? 'Creating...' : 'Create User'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Edit User</h2>
              
              <form onSubmit={handleUpdateCustomer} className="space-y-4">
                <Input
                  label="Email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="user@example.com"
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    type="text"
                    value={formData.firstname}
                    onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
                    placeholder="John"
                  />
                  
                  <Input
                    label="Last Name"
                    type="text"
                    value={formData.lastname}
                    onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                    placeholder="Doe"
                  />
                </div>
                
                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedCustomer(null);
                      setFormData({
                        email: '',
                        firstname: '',
                        lastname: '',
                        document: '',
                        address: '',
                        phone: ''
                      });
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={formLoading}
                    className="flex-1"
                  >
                    {formLoading ? 'Updating...' : 'Update User'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-red-600">Delete User</h2>
              
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete user{' '}
                <span className="font-semibold">
                  {selectedCustomer.first_name && selectedCustomer.last_name
                    ? `${selectedCustomer.first_name} ${selectedCustomer.last_name}`
                    : selectedCustomer.email}
                </span>
                ? This action cannot be undone.
              </p>
              
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedCustomer(null);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={confirmDeleteCustomer}
                  disabled={formLoading}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  {formLoading ? 'Deleting...' : 'Delete User'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersPage;