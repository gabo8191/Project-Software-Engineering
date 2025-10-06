import React, { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import { Plus, Search, Eye, Edit, Trash2, Package } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { orderService } from '../services/orderService';
import { customerService } from '../services/customerService';
import { Order } from '../types';

const OrdersPage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    customerId: '',
    status: 'Received' as const
  });
  const [formLoading, setFormLoading] = useState(false);

  // Estados para CRUD modales
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editStatus, setEditStatus] = useState<'Received' | 'In progress' | 'Sended'>('Received');

  // Estados para customer selection
  const [customers, setCustomers] = useState<any[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const ordersData = await orderService.getAllOrders();
      
      console.log('📦 Orders data:', ordersData);
      
      setOrders(ordersData);
    } catch (error) {
      console.error('Error loading orders:', error);
      setError('Error al cargar los pedidos. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoadingCustomers(true);
      console.log('🔍 Loading customers from user-service...');
      
      // Get all customers from user-service
      const response = await customerService.getAllCustomers();
      console.log('✅ Customers loaded:', response);
      
      setCustomers(response || []);
    } catch (error) {
      console.error('❌ Error loading customers:', error);
      setError('Error al cargar la lista de clientes');
    } finally {
      setLoadingCustomers(false);
    }
  };

  // Load customers when create modal opens
  useEffect(() => {
    if (showCreateModal) {
      loadCustomers();
    }
  }, [showCreateModal]);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCustomerId) {
      setError('Por favor selecciona un cliente');
      return;
    }
    
    try {
      setFormLoading(true);
      setError(null);
      
      console.log('📦 Creating order with selected customer:', selectedCustomerId);
      
      // Create order with user validation using our enhanced service
      const createOrderRequest = {
        customerId: selectedCustomerId, // Use selected customer ID
        items: [], // Start with empty items array
        totalAmount: 0, // Start with zero amount
        status: formData.status
      };
      
      const response = await orderService.createOrder(createOrderRequest);
      
      console.log('✅ Order created successfully:', response);
      
      // Reset form and close modal
      setFormData({
        customerId: '',
        status: 'Received'
      });
      setSelectedCustomerId('');
      setShowCreateModal(false);
      
      // Reload orders to show the new one
      await loadOrders();
      
    } catch (error: any) {
      console.error('❌ Error creating order:', error);
      setError(error.message || 'Error creating order');
    } finally {
      setFormLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'sended':
        return 'bg-green-100 text-green-800';
      case 'processing':
      case 'in progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
      case 'received':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'Completado';
      case 'sended':
        return 'Enviado';
      case 'processing':
        return 'En Proceso';
      case 'in progress':
        return 'En Proceso';
      case 'pending':
        return 'Pendiente';
      case 'received':
        return 'Recibido';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status || 'Sin Estado';
    }
  };

  const filteredOrders = orders.filter(order => {
    const searchLower = searchTerm.toLowerCase();
    return (
      order.customer?.firstName?.toLowerCase().includes(searchLower) ||
      order.customer?.lastName?.toLowerCase().includes(searchLower) ||
      order.customer?.email?.toLowerCase().includes(searchLower) ||
      order._id?.toLowerCase().includes(searchLower) ||
      order.orderID?.toLowerCase().includes(searchLower) ||
      order.customerId?.toLowerCase().includes(searchLower) ||
      order.customerID?.toLowerCase().includes(searchLower) ||
      order.status?.toLowerCase().includes(searchLower)
    );
  });

  // 👁️ Funciones CRUD
  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowViewModal(true);
  };

  const handleEditOrder = (order: Order) => {
    setSelectedOrder(order);
    setEditStatus(order.status as 'Received' | 'In progress' | 'Sended');
    setShowEditModal(true);
  };

  const handleDeleteOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowDeleteModal(true);
  };

  const confirmUpdateOrder = async () => {
    if (!selectedOrder) return;
    
    try {
      setFormLoading(true);
      setError(null);
      
      await orderService.updateOrderStatus({
        orderID: selectedOrder.orderID || selectedOrder._id,
        status: editStatus
      });
      
      setShowEditModal(false);
      setSelectedOrder(null);
      await loadOrders(); // Recargar órdenes
      
    } catch (error: any) {
      console.error('❌ Error updating order:', error);
      setError(error.message || 'Error al actualizar la orden');
    } finally {
      setFormLoading(false);
    }
  };

  const confirmDeleteOrder = async () => {
    if (!selectedOrder) return;
    
    try {
      setFormLoading(true);
      setError(null);
      
      await orderService.deleteOrder(selectedOrder.orderID || selectedOrder._id);
      
      setShowDeleteModal(false);
      setSelectedOrder(null);
      await loadOrders(); // Recargar órdenes
      
    } catch (error: any) {
      console.error('❌ Error deleting order:', error);
      setError(error.message || 'Error al eliminar la orden');
    } finally {
      setFormLoading(false);
    }
  };

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
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Pedidos</h1>
                <p className="text-gray-600">Gestiona todos los pedidos del sistema</p>
              </div>
              <Button 
                onClick={() => setShowCreateModal(true)}
                className="mt-4 sm:mt-0"
              >
                <Plus size={20} className="mr-2" />
                Nuevo Pedido
              </Button>
            </div>

            {/* Search and Filters */}
            <Card className="p-6 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Buscar pedidos..."
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
                    <Package className="h-5 w-5 text-red-500 mr-2" />
                    <p className="text-red-700">{error}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={loadOrders}
                      className="ml-auto text-red-600 border-red-300 hover:bg-red-100"
                    >
                      Reintentar
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Orders Table */}
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-6 font-semibold text-gray-900">ID Pedido</th>
                      <th className="text-left py-3 px-6 font-semibold text-gray-900">Cliente ID</th>
                      <th className="text-left py-3 px-6 font-semibold text-gray-900">Estado</th>
                      <th className="text-left py-3 px-6 font-semibold text-gray-900">Fecha Creación</th>
                      <th className="text-left py-3 px-6 font-semibold text-gray-900">Última Actualización</th>
                      <th className="text-left py-3 px-6 font-semibold text-gray-900">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-gray-500">
                          Cargando pedidos...
                        </td>
                      </tr>
                    ) : filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-gray-500">
                          No se encontraron pedidos
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => (
                        <tr key={order._id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-6">
                            <p className="font-medium text-blue-600">
                              {order.orderID || `#${order._id?.slice(-6) || 'N/A'}`}
                            </p>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center">
                              <Package className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="font-mono text-sm text-gray-900">
                                {order.customerID || order.customerId || 'N/A'}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {getStatusText(order.status)}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-gray-600">
                            <div>
                              <p className="text-sm">
                                {order.createdAt ? 
                                  new Date(order.createdAt).toLocaleDateString('es-ES') : 
                                  'N/A'
                                }
                              </p>
                              <p className="text-xs text-gray-400">
                                {order.createdAt ? 
                                  new Date(order.createdAt).toLocaleTimeString('es-ES') : 
                                  ''
                                }
                              </p>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-gray-600">
                            <div>
                              <p className="text-sm">
                                {order.updatedAt ? 
                                  new Date(order.updatedAt).toLocaleDateString('es-ES') : 
                                  'N/A'
                                }
                              </p>
                              <p className="text-xs text-gray-400">
                                {order.updatedAt ? 
                                  new Date(order.updatedAt).toLocaleTimeString('es-ES') : 
                                  ''
                                }
                              </p>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleViewOrder(order)}
                                title="Ver detalles"
                              >
                                <Eye size={16} />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEditOrder(order)}
                                title="Editar estado"
                              >
                                <Edit size={16} />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleDeleteOrder(order)}
                                title="Eliminar orden"
                              >
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

      {/* Create Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Nuevo Pedido</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-6">
              {/* Customer Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seleccionar Cliente
                </label>
                {loadingCustomers ? (
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                    Cargando clientes...
                  </div>
                ) : (
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  >
                    <option value="">Selecciona un cliente</option>
                    {customers.map((customer) => (
                      <option key={customer.document} value={customer.document}>
                        {customer.firstname} {customer.lastname} ({customer.email})
                      </option>
                    ))}
                  </select>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {customers.length > 0 
                    ? `${customers.length} cliente(s) disponible(s)` 
                    : 'No hay clientes disponibles'
                  }
                </p>
              </div>

              {/* Status Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado del Pedido
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="Received">Recibido</option>
                  <option value="In progress">En Proceso</option>
                  <option value="Sended">Enviado</option>
                </select>
              </div>

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
                  <Package size={20} className="mr-2" />
                  Crear Pedido
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 👁️ View Order Modal */}
      {showViewModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Detalles de la Orden</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order ID</label>
                  <p className="text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded">
                    {selectedOrder.orderID || selectedOrder._id}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer ID</label>
                  <p className="text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded">
                    {selectedOrder.customerID || selectedOrder.customerId}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                  {getStatusText(selectedOrder.status)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Creación</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {selectedOrder.createdAt ? 
                      new Date(selectedOrder.createdAt).toLocaleString('es-ES') : 
                      'N/A'
                    }
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Última Actualización</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {selectedOrder.updatedAt ? 
                      new Date(selectedOrder.updatedAt).toLocaleString('es-ES') : 
                      'N/A'
                    }
                  </p>
                </div>
              </div>

              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Items</label>
                  <div className="bg-gray-50 p-3 rounded space-y-2">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{item.productName} (x{item.quantity})</span>
                        <span>${item.price}</span>
                      </div>
                    ))}
                    {selectedOrder.totalAmount && (
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between font-semibold">
                          <span>Total:</span>
                          <span>${selectedOrder.totalAmount}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6">
              <Button
                onClick={() => setShowViewModal(false)}
                variant="outline"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ✏️ Edit Order Modal */}
      {showEditModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Editar Estado</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order ID</label>
                <p className="text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded">
                  {selectedOrder.orderID || selectedOrder._id}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nuevo Estado</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as 'Received' | 'In progress' | 'Sended')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Received">Recibido</option>
                  <option value="In progress">En Proceso</option>
                  <option value="Sended">Enviado</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowEditModal(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={confirmUpdateOrder}
                isLoading={formLoading}
                className="flex-1"
              >
                Actualizar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 🗑️ Delete Order Modal */}
      {showDeleteModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Eliminar Orden</h2>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <p className="text-gray-900 font-medium mb-2">
                  ¿Estás seguro de que quieres eliminar esta orden?
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Order ID: <span className="font-mono">{selectedOrder.orderID || selectedOrder._id}</span>
                </p>
                <p className="text-sm text-red-600">
                  Esta acción no se puede deshacer.
                </p>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={confirmDeleteOrder}
                isLoading={formLoading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;