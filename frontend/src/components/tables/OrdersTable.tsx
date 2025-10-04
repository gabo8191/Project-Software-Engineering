import React from 'react';
import { Package, Eye, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { Order } from '../../hooks/useOrders';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Table from '../../shared/components/Table';
import Pagination from '../../shared/components/Pagination';

interface OrdersTableProps {
  orders: Order[];
  currentPage: number;
  totalPages: number;
  sortConfig: { field: string; direction: 'asc' | 'desc' };
  processingOrderId: string | null;
  onSort: (field: string) => void;
  onPageChange: (page: number) => void;
  onUpdateStatus: (orderId: string, status: Order['status']) => void;
  formatDate: (date: string) => string;
  formatCurrency: (amount: number) => string;
  getStatusColor: (status: Order['status']) => string;
  getStatusText: (status: Order['status']) => string;
}

const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  currentPage,
  totalPages,
  sortConfig,
  processingOrderId,
  onSort,
  onPageChange,
  onUpdateStatus,
  formatDate,
  formatCurrency,
  getStatusColor,
  getStatusText,
}) => {
  const columns = [
    {
      header: 'ID Pedido',
      sortKey: 'id',
      isSortable: true,
      renderCell: (order: Order) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
              <Package size={20} className="text-primary-600" />
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">#{order.id}</div>
            <div className="text-sm text-gray-500">Cliente: {order.customerID}</div>
          </div>
        </div>
      ),
      cellClassName: 'whitespace-normal',
    },
    {
      header: 'Items',
      renderCell: (order: Order) => (
        <div className="space-y-1">
          <div className="text-sm font-medium text-gray-900">
            {order.items.length} item(s)
          </div>
          <div className="text-sm text-gray-500 max-w-xs truncate">
            {order.items.map(item => item.productName).join(', ')}
          </div>
        </div>
      ),
      cellClassName: 'whitespace-normal',
    },
    {
      header: 'Total',
      sortKey: 'totalAmount',
      isSortable: true,
      renderCell: (order: Order) => (
        <div className="text-sm font-semibold text-gray-900">
          {formatCurrency(order.totalAmount)}
        </div>
      ),
    },
    {
      header: 'Estado',
      sortKey: 'status',
      isSortable: true,
      renderCell: (order: Order) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
          {getStatusText(order.status)}
        </span>
      ),
    },
    {
      header: 'Fecha',
      sortKey: 'createdAt',
      isSortable: true,
      renderCell: (order: Order) => (
        <div className="text-sm text-gray-900">
          {formatDate(order.createdAt)}
        </div>
      ),
    },
    {
      header: 'Acciones',
      headerClassName: 'text-center',
      renderCell: (order: Order) => (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            icon={<Eye size={16} />}
          >
            Ver
          </Button>
          
          {order.status === 'pending' && (
            <Button
              variant="ghost"
              size="sm"
              icon={<RefreshCw size={16} />}
              onClick={() => onUpdateStatus(order.id, 'processing')}
              disabled={processingOrderId === order.id}
              className="text-blue-600 hover:text-blue-700"
            >
              Procesar
            </Button>
          )}
          
          {order.status === 'processing' && (
            <Button
              variant="ghost"
              size="sm"
              icon={<CheckCircle size={16} />}
              onClick={() => onUpdateStatus(order.id, 'completed')}
              disabled={processingOrderId === order.id}
              className="text-green-600 hover:text-green-700"
            >
              Completar
            </Button>
          )}
          
          {(order.status === 'pending' || order.status === 'processing') && (
            <Button
              variant="ghost"
              size="sm"
              icon={<XCircle size={16} />}
              onClick={() => onUpdateStatus(order.id, 'cancelled')}
              disabled={processingOrderId === order.id}
              className="text-red-600 hover:text-red-700"
            >
              Cancelar
            </Button>
          )}
        </div>
      ),
      cellClassName: 'text-center',
    },
  ];

  const renderMobileCard = (order: Order) => (
    <Card className="p-4">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 h-10 w-10">
          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
            <Package size={20} className="text-primary-600" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900">
              Pedido #{order.id}
            </h3>
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
              {getStatusText(order.status)}
            </span>
          </div>
          
          <div className="mt-2 space-y-1">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Cliente: </span>
              {order.customerID}
            </div>
            
            <div className="text-sm text-gray-600">
              <span className="font-medium">Items: </span>
              {order.items.length} productos
            </div>
            
            <div className="text-sm text-gray-600 max-w-xs">
              {order.items.map(item => item.productName).join(', ')}
            </div>
            
            <div className="text-sm font-semibold text-gray-900">
              <span className="font-medium">Total: </span>
              {formatCurrency(order.totalAmount)}
            </div>
            
            <div className="text-sm text-gray-500">
              <Clock size={14} className="inline mr-1" />
              {formatDate(order.createdAt)}
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex flex-wrap gap-2 pt-3 border-t border-gray-100">
        <Button
          variant="outline"
          size="sm"
          icon={<Eye size={16} />}
        >
          Ver Detalles
        </Button>
        
        {order.status === 'pending' && (
          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCw size={16} />}
            onClick={() => onUpdateStatus(order.id, 'processing')}
            disabled={processingOrderId === order.id}
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            Procesar
          </Button>
        )}
        
        {order.status === 'processing' && (
          <Button
            variant="outline"
            size="sm"
            icon={<CheckCircle size={16} />}
            onClick={() => onUpdateStatus(order.id, 'completed')}
            disabled={processingOrderId === order.id}
            className="text-green-600 border-green-200 hover:bg-green-50"
          >
            Completar
          </Button>
        )}
        
        {(order.status === 'pending' || order.status === 'processing') && (
          <Button
            variant="outline"
            size="sm"
            icon={<XCircle size={16} />}
            onClick={() => onUpdateStatus(order.id, 'cancelled')}
            disabled={processingOrderId === order.id}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            Cancelar
          </Button>
        )}
      </div>
    </Card>
  );

  return (
    <>
      <Table
        columns={columns}
        data={orders}
        rowKeyExtractor={(order) => order.id}
        currentSortConfig={sortConfig}
        onSort={onSort}
        renderMobileCard={renderMobileCard}
        mobileBreakpoint="lg"
      />
      
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </>
  );
};

export default OrdersTable;