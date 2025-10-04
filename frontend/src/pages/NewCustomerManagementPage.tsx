import React, { useState } from 'react';
import { Users, Plus, Search, UserPlus } from 'lucide-react';
import { useCustomers, Customer } from '../hooks/useCustomers';
import { useToast } from '../shared/context/ToastContext';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import Spinner from '../shared/components/Spinner';
import CustomersTable from '../components/tables/CustomersTable';
import NewCustomerModal from '../components/modals/NewCustomerModal';
import EditCustomerModal from '../components/modals/EditCustomerModal';

const CustomerManagementPage: React.FC = () => {
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const [isEditCustomerModalOpen, setIsEditCustomerModalOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);

  const customersData = useCustomers();
  const toast = useToast();

  const handleEditCustomer = (customer: Customer) => {
    setCustomerToEdit(customer);
    setIsEditCustomerModalOpen(true);
  };

  const handleDeleteCustomer = (customerId: number) => {
    customersData.deleteCustomer(customerId);
  };

  const renderLoadingState = () => (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-600">Cargando clientes...</p>
      </div>
    </div>
  );

  const renderEmptyState = () => (
    <Card className="text-center py-12">
      <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Users size={32} className="text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No hay clientes registrados
      </h3>
      <p className="text-gray-500 mb-6">
        Comienza agregando tu primer cliente al sistema.
      </p>
      <Button
        onClick={() => setIsNewCustomerModalOpen(true)}
        icon={<Plus size={20} />}
        iconPosition="left"
      >
        Agregar Primer Cliente
      </Button>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary-100 rounded-xl">
            <Users className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Gestión de Clientes
            </h1>
            <p className="text-sm text-gray-500">
              {customersData.totalCustomers > 0 
                ? `${customersData.totalCustomers} cliente${customersData.totalCustomers !== 1 ? 's' : ''} registrado${customersData.totalCustomers !== 1 ? 's' : ''}`
                : 'Administra los clientes del sistema'
              }
            </p>
          </div>
        </div>

        <div className="mt-4 sm:mt-0">
          <Button
            onClick={() => setIsNewCustomerModalOpen(true)}
            icon={<UserPlus size={20} />}
            iconPosition="left"
          >
            Nuevo Cliente
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar clientes por nombre o email..."
              value={customersData.searchTerm}
              onChange={(e) => customersData.handleSearchChange(e.target.value)}
              icon={<Search size={20} />}
              className="w-full"
            />
          </div>
          {customersData.searchTerm && (
            <Button 
              variant="outline" 
              onClick={() => customersData.handleSearchChange('')}
              size="md"
            >
              Limpiar
            </Button>
          )}
        </div>
      </Card>

      {/* Content */}
      <Card className="p-6">
        {customersData.isLoading ? 
          renderLoadingState() :
          customersData.customers.length === 0 ? 
            renderEmptyState() :
            <CustomersTable
              customers={customersData.customers}
              currentPage={customersData.currentPage}
              totalPages={customersData.totalPages}
              sortConfig={customersData.sortConfig}
              processingCustomerId={customersData.processingCustomerId}
              onSort={customersData.handleSort}
              onEdit={handleEditCustomer}
              onDelete={handleDeleteCustomer}
              onPageChange={customersData.handlePageChange}
              formatDate={customersData.formatDate}
            />
        }
      </Card>

      {/* Modals */}
      <NewCustomerModal
        isOpen={isNewCustomerModalOpen}
        onClose={() => setIsNewCustomerModalOpen(false)}
        onSave={async (customerData) => {
          const success = await customersData.addCustomer(customerData);
          if (success) {
            setIsNewCustomerModalOpen(false);
            toast.showSuccess('Cliente creado', 'El cliente se ha creado exitosamente.');
          } else {
            toast.showError('Error', 'No se pudo crear el cliente. Inténtalo de nuevo.');
          }
          return success;
        }}
      />

      {customerToEdit && (
        <EditCustomerModal
          isOpen={isEditCustomerModalOpen}
          customer={customerToEdit}
          onClose={() => {
            setIsEditCustomerModalOpen(false);
            setCustomerToEdit(null);
          }}
          onSave={async (customerData) => {
            const success = await customersData.updateCustomer(customerToEdit.id, customerData);
            if (success) {
              setIsEditCustomerModalOpen(false);
              setCustomerToEdit(null);
              toast.showSuccess('Cliente actualizado', 'Los cambios se han guardado exitosamente.');
            } else {
              toast.showError('Error', 'No se pudieron guardar los cambios. Inténtalo de nuevo.');
            }
            return success;
          }}
        />
      )}
    </div>
  );
};

export default CustomerManagementPage;