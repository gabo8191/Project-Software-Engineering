import React, { useState } from 'react';
import { Package, Plus, Search, ShoppingCart } from 'lucide-react';
import { useOrders, Order } from '../hooks/useOrders';
import { useToast } from '../shared/context/ToastContext';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import Spinner from '../shared/components/Spinner';
import OrdersTable from '../components/tables/OrdersTable';
import NewOrderModal from '../components/modals/NewOrderModal';

const OrderManagementPage: React.FC = () => {
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const ordersData = useOrders();
  const toast = useToast();

  const handleUpdateOrderStatus = (orderId: string, status: Order['status']) => {
    ordersData.updateOrderStatus(orderId, status);
  };

  const renderLoadingState = () => (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-600">Cargando pedidos...</p>
      </div>
    </div>
  );

  const renderEmptyState = () => (
    <Card className="text-center py-12">
      <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Package size={32} className="text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No hay pedidos registrados
      </h3>
      <p className="text-gray-500 mb-6">
        Los pedidos aparecerán aquí una vez que sean creados.
      </p>
      <Button
        onClick={() => setIsNewOrderModalOpen(true)}
        icon={<Plus size={20} />}
        iconPosition="left"
      >
        Crear Primer Pedido
      </Button>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary-100 rounded-xl">
            <Package className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Gestión de Pedidos
            </h1>
            <p className="text-sm text-gray-500">
              {ordersData.totalOrders > 0 
                ? `${ordersData.totalOrders} pedido${ordersData.totalOrders !== 1 ? 's' : ''} registrado${ordersData.totalOrders !== 1 ? 's' : ''}`
                : 'Administra los pedidos del sistema'
              }
            </p>
          </div>
        </div>

        <div className="mt-4 sm:mt-0">
          <Button
            onClick={() => setIsNewOrderModalOpen(true)}
            icon={<ShoppingCart size={20} />}
            iconPosition="left"
          >
            Nuevo Pedido
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar pedidos por ID o cliente..."
              value={ordersData.searchTerm}
              onChange={(e) => ordersData.handleSearchChange(e.target.value)}
              icon={<Search size={20} />}
              className="w-full"
            />
          </div>
          {ordersData.searchTerm && (
            <Button 
              variant="outline" 
              onClick={() => ordersData.handleSearchChange('')}
              size="md"
            >
              Limpiar
            </Button>
          )}
        </div>

        {/* Status Filter Pills */}
        <div className="flex flex-wrap gap-2 mt-4">
          <Button 
            variant="outline" 
            size="sm"
            className="text-yellow-700 border-yellow-300 hover:bg-yellow-50"
          >
            Pendientes
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="text-blue-700 border-blue-300 hover:bg-blue-50"
          >
            En Proceso
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="text-green-700 border-green-300 hover:bg-green-50"
          >
            Completados
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="text-red-700 border-red-300 hover:bg-red-50"
          >
            Cancelados
          </Button>
        </div>
      </Card>

      {/* Content */}
      <Card className="p-6">
        {ordersData.isLoading ? 
          renderLoadingState() :
          ordersData.orders.length === 0 ? 
            renderEmptyState() :
            <OrdersTable
              orders={ordersData.orders}
              currentPage={ordersData.currentPage}
              totalPages={ordersData.totalPages}
              sortConfig={ordersData.sortConfig}
              processingOrderId={ordersData.processingOrderId}
              onSort={ordersData.handleSort}
              onPageChange={ordersData.handlePageChange}
              onUpdateStatus={handleUpdateOrderStatus}
              formatDate={ordersData.formatDate}
              formatCurrency={ordersData.formatCurrency}
              getStatusColor={ordersData.getStatusColor}
              getStatusText={ordersData.getStatusText}
            />
        }
      </Card>

      {/* New Order Modal */}
      <NewOrderModal
        isOpen={isNewOrderModalOpen}
        onClose={() => setIsNewOrderModalOpen(false)}
        onSave={async (orderData) => {
          const totalAmount = orderData.items.reduce((total, item) => total + (item.quantity * item.price), 0);
          const orderToCreate = {
            ...orderData,
            totalAmount,
            status: 'pending' as const,
          };
          const success = await ordersData.addOrder(orderToCreate);
          if (success) {
            setIsNewOrderModalOpen(false);
            toast.showSuccess('Pedido creado', 'El pedido se ha creado exitosamente.');
          } else {
            toast.showError('Error', 'No se pudo crear el pedido. Inténtalo de nuevo.');
          }
          return success;
        }}
      />

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-2xl w-full mx-4 p-6">
            <h2 className="text-lg font-semibold mb-4">
              Detalles del Pedido #{selectedOrder.id}
            </h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Estado</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${ordersData.getStatusColor(selectedOrder.status)}`}>
                    {ordersData.getStatusText(selectedOrder.status)}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total</label>
                  <p className="text-lg font-semibold">{ordersData.formatCurrency(selectedOrder.totalAmount)}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Items del Pedido</label>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium">{item.productName}</span>
                        <span className="text-gray-500 ml-2">x{item.quantity}</span>
                      </div>
                      <span className="font-medium">{ordersData.formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setSelectedOrder(null)}
              >
                Cerrar
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default OrderManagementPage;