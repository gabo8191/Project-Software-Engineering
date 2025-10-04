import React, { useState } from 'react';
import { Package, User, Plus, Minus, Trash2 } from 'lucide-react';
import Modal from '../../shared/components/Modal';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Card from '../../components/Card';

interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}

interface OrderFormData {
  customerID: number;
  items: OrderItem[];
}

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: OrderFormData) => Promise<boolean>;
}

const NewOrderModal: React.FC<NewOrderModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<OrderFormData>({
    customerID: 0,
    items: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newItem, setNewItem] = useState({
    productName: '',
    quantity: 1,
    price: 0,
  });

  const resetForm = () => {
    setFormData({
      customerID: 0,
      items: [],
    });
    setNewItem({
      productName: '',
      quantity: 1,
      price: 0,
    });
    setErrors({});
  };

  const handleCustomerIDChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setFormData({ ...formData, customerID: value });
    
    if (errors.customerID) {
      setErrors({ ...errors, customerID: '' });
    }
  };

  const handleNewItemChange = (field: string, value: string | number) => {
    setNewItem({ ...newItem, [field]: value });
  };

  const addItem = () => {
    if (!newItem.productName.trim() || newItem.quantity <= 0 || newItem.price <= 0) {
      return;
    }

    const item: OrderItem = {
      productId: Date.now(), // Temporary ID
      productName: newItem.productName.trim(),
      quantity: newItem.quantity,
      price: newItem.price,
    };

    setFormData({
      ...formData,
      items: [...formData.items, item],
    });

    setNewItem({
      productName: '',
      quantity: 1,
      price: 0,
    });
  };

  const updateItemQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) return;

    const updatedItems = [...formData.items];
    updatedItems[index].quantity = quantity;
    setFormData({ ...formData, items: updatedItems });
  };

  const removeItem = (index: number) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: updatedItems });
  };

  const calculateTotal = () => {
    return formData.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.customerID) {
      newErrors.customerID = 'El ID del cliente es requerido';
    }

    if (formData.items.length === 0) {
      newErrors.items = 'Agrega al menos un producto al pedido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await onSave(formData);
      if (success) {
        handleClose();
      }
    } catch (error: any) {
      console.error('Error creating order:', error);
      setErrors({ 
        submit: 'Error al crear el pedido. Por favor, inténtalo de nuevo.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Nuevo Pedido" size="xl">
      <form onSubmit={handleSubmit}>
        {errors.submit && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {errors.submit}
          </div>
        )}

        <div className="space-y-6">
          {/* Customer Selection */}
          <div>
            <Input
              label="ID del Cliente"
              type="number"
              value={formData.customerID || ''}
              onChange={handleCustomerIDChange}
              error={errors.customerID}
              icon={<User size={18} />}
              required
              placeholder="Ingresa el ID del cliente"
            />
          </div>

          {/* Add New Item Section */}
          <Card className="p-4 bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Agregar Producto</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Input
                  label="Nombre del Producto"
                  value={newItem.productName}
                  onChange={(e) => handleNewItemChange('productName', e.target.value)}
                  placeholder="Nombre del producto"
                />
              </div>
              <div>
                <Input
                  label="Cantidad"
                  type="number"
                  value={newItem.quantity}
                  onChange={(e) => handleNewItemChange('quantity', parseInt(e.target.value) || 1)}
                  min="1"
                />
              </div>
              <div>
                <Input
                  label="Precio"
                  type="number"
                  step="0.01"
                  value={newItem.price}
                  onChange={(e) => handleNewItemChange('price', parseFloat(e.target.value) || 0)}
                  min="0"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="mt-4">
              <Button
                type="button"
                onClick={addItem}
                variant="outline"
                icon={<Plus size={16} />}
                disabled={!newItem.productName.trim() || newItem.quantity <= 0 || newItem.price <= 0}
              >
                Agregar Producto
              </Button>
            </div>
          </Card>

          {/* Items List */}
          {formData.items.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Productos en el Pedido</h3>
              {errors.items && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {errors.items}
                </div>
              )}
              <div className="space-y-2">
                {formData.items.map((item, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.productName}</h4>
                        <p className="text-sm text-gray-500">
                          Precio unitario: ${item.price.toFixed(2)}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => updateItemQuantity(index, item.quantity - 1)}
                            className="p-1 rounded text-gray-500 hover:bg-gray-100"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateItemQuantity(index, item.quantity + 1)}
                            className="p-1 rounded text-gray-500 hover:bg-gray-100"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="p-1 rounded text-red-500 hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
                
                {/* Total */}
                <Card className="p-4 bg-primary-50 border-primary-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total del Pedido:</span>
                    <span className="text-xl font-bold text-primary-600">
                      ${calculateTotal().toFixed(2)}
                    </span>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting || formData.items.length === 0}
            className={isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
            icon={<Package size={16} />}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Creando Pedido...
              </>
            ) : (
              'Crear Pedido'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default NewOrderModal;