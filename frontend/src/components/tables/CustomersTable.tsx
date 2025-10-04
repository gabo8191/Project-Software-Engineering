import React from 'react';
import { User, Edit2, Trash2, Mail, Phone } from 'lucide-react';
import { Customer } from '../../hooks/useCustomers';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Table from '../../shared/components/Table';
import Pagination from '../../shared/components/Pagination';

interface CustomersTableProps {
  customers: Customer[];
  currentPage: number;
  totalPages: number;
  sortConfig: { field: string; direction: 'asc' | 'desc' };
  processingCustomerId: number | null;
  onSort: (field: string) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customerId: number) => void;
  onPageChange: (page: number) => void;
  formatDate: (date: string) => string;
}

const CustomersTable: React.FC<CustomersTableProps> = ({
  customers,
  currentPage,
  totalPages,
  sortConfig,
  processingCustomerId,
  onSort,
  onEdit,
  onDelete,
  onPageChange,
  formatDate,
}) => {
  const columns = [
    {
      header: 'Cliente',
      sortKey: 'name',
      isSortable: true,
      renderCell: (customer: Customer) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
              <User size={20} className="text-primary-600" />
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{customer.name}</div>
            <div className="text-sm text-gray-500">ID: {customer.id}</div>
          </div>
        </div>
      ),
      cellClassName: 'whitespace-normal',
    },
    {
      header: 'Contacto',
      sortKey: 'email',
      isSortable: true,
      renderCell: (customer: Customer) => (
        <div className="space-y-1">
          <div className="flex items-center text-sm text-gray-900">
            <Mail size={14} className="mr-2 text-gray-400" />
            {customer.email}
          </div>
          {customer.phone && (
            <div className="flex items-center text-sm text-gray-500">
              <Phone size={14} className="mr-2 text-gray-400" />
              {customer.phone}
            </div>
          )}
        </div>
      ),
      cellClassName: 'whitespace-normal',
    },
    {
      header: 'Dirección',
      accessor: 'address' as keyof Customer,
      renderCell: (customer: Customer) => (
        <div className="text-sm text-gray-900 max-w-xs truncate">
          {customer.address || 'No especificada'}
        </div>
      ),
      cellClassName: 'whitespace-normal',
    },
    {
      header: 'Fecha Registro',
      sortKey: 'createdAt',
      isSortable: true,
      renderCell: (customer: Customer) => (
        <div className="text-sm text-gray-900">
          {formatDate(customer.createdAt)}
        </div>
      ),
    },
    {
      header: 'Acciones',
      headerClassName: 'text-center',
      renderCell: (customer: Customer) => (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            icon={<Edit2 size={16} />}
            onClick={() => onEdit(customer)}
          >
            Editar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={<Trash2 size={16} />}
            onClick={() => onDelete(customer.id)}
            disabled={processingCustomerId === customer.id}
            className="text-red-600 hover:text-red-700"
          >
            {processingCustomerId === customer.id ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </div>
      ),
      cellClassName: 'text-center',
    },
  ];

  const renderMobileCard = (customer: Customer) => (
    <Card className="p-4">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 h-10 w-10">
          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
            <User size={20} className="text-primary-600" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {customer.name}
            </h3>
            <span className="text-xs text-gray-500">ID: {customer.id}</span>
          </div>
          
          <div className="mt-2 space-y-1">
            <div className="flex items-center text-sm text-gray-600">
              <Mail size={14} className="mr-2 text-gray-400" />
              <span className="truncate">{customer.email}</span>
            </div>
            
            {customer.phone && (
              <div className="flex items-center text-sm text-gray-600">
                <Phone size={14} className="mr-2 text-gray-400" />
                {customer.phone}
              </div>
            )}
            
            {customer.address && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">Dirección: </span>
                {customer.address}
              </div>
            )}
            
            <div className="text-sm text-gray-500">
              <span className="font-medium">Registrado: </span>
              {formatDate(customer.createdAt)}
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex justify-end space-x-2 pt-3 border-t border-gray-100">
        <Button
          variant="outline"
          size="sm"
          icon={<Edit2 size={16} />}
          onClick={() => onEdit(customer)}
        >
          Editar
        </Button>
        <Button
          variant="outline"
          size="sm"
          icon={<Trash2 size={16} />}
          onClick={() => onDelete(customer.id)}
          disabled={processingCustomerId === customer.id}
          className="text-red-600 border-red-200 hover:bg-red-50"
        >
          {processingCustomerId === customer.id ? 'Eliminando...' : 'Eliminar'}
        </Button>
      </div>
    </Card>
  );

  return (
    <>
      <Table
        columns={columns}
        data={customers}
        rowKeyExtractor={(customer) => customer.id.toString()}
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

export default CustomersTable;