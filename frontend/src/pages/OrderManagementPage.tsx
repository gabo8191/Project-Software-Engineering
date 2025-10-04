import React, { useState } from 'react';
import { Package, Search, Plus, Edit, CheckCircle, AlertCircle, Clock, Truck } from 'lucide-react';
import Button from '../components/Button';
import { cn } from '../utils/cn';
import api from '../utils/api';
import type { 
  CreateOrderRequest, 
  CreateOrderResponse, 
  UpdateOrderStatusRequest, 
  UpdateOrderStatusResponse,
  FindOrdersByCustomerRequest,
  Order 
} from '../types/order';

const OrderManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'create' | 'update' | 'search'>('create');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Create Order Form
  const [createForm, setCreateForm] = useState<CreateOrderRequest>({
    customerid: '',
    orderID: '',
    status: 'Received'
  });

  // Update Order Form
  const [updateForm, setUpdateForm] = useState<UpdateOrderStatusRequest>({
    orderID: '',
    status: 'Received'
  });

  // Search Orders Form
  const [searchForm, setSearchForm] = useState<FindOrdersByCustomerRequest>({
    customerid: ''
  });
  const [foundOrders, setFoundOrders] = useState<Order[]>([]);

  const orderStatuses = [
    { value: 'Received', label: 'Received', icon: Package, color: 'text-blue-600' },
    { value: 'In progress', label: 'In Progress', icon: Clock, color: 'text-yellow-600' },
    { value: 'Sended', label: 'Sent', icon: Truck, color: 'text-green-600' }
  ];

  const handleCreateInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCreateForm(prev => ({ ...prev, [name]: value }));
    if (message) setMessage(null);
  };

  const handleUpdateInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUpdateForm(prev => ({ ...prev, [name]: value }));
    if (message) setMessage(null);
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchForm(prev => ({ ...prev, [name]: value }));
    if (message) setMessage(null);
  };

  const generateOrderID = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 5);
    return `ORD-${timestamp}-${random}`.toUpperCase();
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await api.post<CreateOrderResponse>('/order/createorder', createForm);
      
      if (response.data.orderCreated) {
        setMessage({ type: 'success', text: `Order ${createForm.orderID} created successfully!` });
        setCreateForm({
          customerid: '',
          orderID: '',
          status: 'Received'
        });
      } else {
        setMessage({ type: 'error', text: 'Failed to create order' });
      }
    } catch (err: any) {
      console.error('Create order error:', err);
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'An error occurred while creating order'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await api.put<UpdateOrderStatusResponse>('/order/updateorderstatus', updateForm);
      
      if (response.data.orderStatusUpdated) {
        setMessage({ type: 'success', text: `Order ${updateForm.orderID} status updated successfully!` });
        setUpdateForm({
          orderID: '',
          status: 'Received'
        });
      } else {
        setMessage({ type: 'error', text: 'Failed to update order status' });
      }
    } catch (err: any) {
      console.error('Update order error:', err);
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'An error occurred while updating order'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchOrders = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    setFoundOrders([]);

    try {
      const response = await api.get<Order[]>(`/order/findorderbycustomerid?customerid=${searchForm.customerid}`);
      setFoundOrders(response.data || []);
      setMessage({ type: 'success', text: `Found ${response.data?.length || 0} orders for customer ${searchForm.customerid}` });
    } catch (err: any) {
      console.error('Search orders error:', err);
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'No orders found for this customer'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    const statusInfo = orderStatuses.find(s => s.value === status);
    if (!statusInfo) return Package;
    const Icon = statusInfo.icon;
    return <Icon className={cn('w-5 h-5', statusInfo.color)} />;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Management</h1>
          <p className="text-gray-600">Create, update, and search orders in the system</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-micro-lg border border-gray-200 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('create')}
              className={cn(
                'flex-1 px-6 py-4 text-sm font-medium transition-colors',
                activeTab === 'create'
                  ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <Plus className="w-4 h-4 inline-block mr-2" />
              Create Order
            </button>
            <button
              onClick={() => setActiveTab('update')}
              className={cn(
                'flex-1 px-6 py-4 text-sm font-medium transition-colors',
                activeTab === 'update'
                  ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <Edit className="w-4 h-4 inline-block mr-2" />
              Update Status
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={cn(
                'flex-1 px-6 py-4 text-sm font-medium transition-colors',
                activeTab === 'search'
                  ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <Search className="w-4 h-4 inline-block mr-2" />
              Search Orders
            </button>
          </div>

          <div className="p-8">
            {/* Message Display */}
            {message && (
              <div className={cn(
                'mb-6 p-4 rounded-lg border animate-fade-in',
                message.type === 'success' 
                  ? 'bg-success-50 border-success-200 text-success-700'
                  : 'bg-error-50 border-error-200 text-error-700'
              )}>
                <div className="flex items-center">
                  {message.type === 'success' ? (
                    <CheckCircle className="w-5 h-5 mr-2" />
                  ) : (
                    <AlertCircle className="w-5 h-5 mr-2" />
                  )}
                  <span>{message.text}</span>
                </div>
              </div>
            )}

            {/* Create Order Tab */}
            {activeTab === 'create' && (
              <form onSubmit={handleCreateOrder} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Customer ID */}
                  <div>
                    <label htmlFor="customerid" className="block text-sm font-medium text-gray-700 mb-2">
                      Customer Document ID *
                    </label>
                    <input
                      id="customerid"
                      name="customerid"
                      type="text"
                      required
                      value={createForm.customerid}
                      onChange={handleCreateInputChange}
                      className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter customer document ID"
                    />
                  </div>

                  {/* Order ID */}
                  <div>
                    <label htmlFor="orderID" className="block text-sm font-medium text-gray-700 mb-2">
                      Order ID *
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="orderID"
                        name="orderID"
                        type="text"
                        required
                        value={createForm.orderID}
                        onChange={handleCreateInputChange}
                        className="flex-1 px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Enter order ID"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="md"
                        onClick={() => setCreateForm(prev => ({ ...prev, orderID: generateOrderID() }))}
                      >
                        Generate
                      </Button>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="md:col-span-2">
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                      Initial Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={createForm.status}
                      onChange={handleCreateInputChange}
                      className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      {orderStatuses.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={isLoading}
                    className="min-w-32"
                  >
                    Create Order
                  </Button>
                </div>
              </form>
            )}

            {/* Update Order Status Tab */}
            {activeTab === 'update' && (
              <form onSubmit={handleUpdateOrderStatus} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Order ID */}
                  <div>
                    <label htmlFor="update-orderID" className="block text-sm font-medium text-gray-700 mb-2">
                      Order ID *
                    </label>
                    <input
                      id="update-orderID"
                      name="orderID"
                      type="text"
                      required
                      value={updateForm.orderID}
                      onChange={handleUpdateInputChange}
                      className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter order ID to update"
                    />
                  </div>

                  {/* New Status */}
                  <div>
                    <label htmlFor="update-status" className="block text-sm font-medium text-gray-700 mb-2">
                      New Status *
                    </label>
                    <select
                      id="update-status"
                      name="status"
                      value={updateForm.status}
                      onChange={handleUpdateInputChange}
                      className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      {orderStatuses.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={isLoading}
                    className="min-w-32"
                  >
                    Update Status
                  </Button>
                </div>
              </form>
            )}

            {/* Search Orders Tab */}
            {activeTab === 'search' && (
              <div className="space-y-6">
                <form onSubmit={handleSearchOrders} className="flex gap-4">
                  <div className="flex-1">
                    <label htmlFor="search-customerid" className="block text-sm font-medium text-gray-700 mb-2">
                      Customer Document ID
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        id="search-customerid"
                        name="customerid"
                        type="text"
                        required
                        value={searchForm.customerid}
                        onChange={handleSearchInputChange}
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Enter customer document ID"
                      />
                    </div>
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      isLoading={isLoading}
                      className="min-w-32"
                    >
                      Search Orders
                    </Button>
                  </div>
                </form>

                {/* Orders List */}
                {foundOrders.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Orders Found</h3>
                    {foundOrders.map((order, index) => (
                      <div key={index} className="bg-gray-50 rounded-xl p-6 animate-fade-in">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-medium text-gray-900">{order.orderID}</h4>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(order.status)}
                            <span className="font-medium">{order.status}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <span className="text-sm font-medium text-gray-500">Customer ID:</span>
                            <p className="text-gray-900">{order.customerid}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500">Status:</span>
                            <p className="text-gray-900">{order.status}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderManagementPage;