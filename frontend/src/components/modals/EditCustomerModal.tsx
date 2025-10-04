import React, { useState } from 'react';
import { Mail, User, Phone, MapPin } from 'lucide-react';
import { Customer } from '../../hooks/useCustomers';
import Modal from '../../shared/components/Modal';
import Button from '../../components/Button';
import Input from '../../components/Input';

interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface EditCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer;
  onSave: (data: CustomerFormData) => Promise<boolean>;
}

const EditCustomerModal: React.FC<EditCustomerModalProps> = ({
  isOpen,
  onClose,
  customer,
  onSave,
}) => {
  const [formData, setFormData] = useState<CustomerFormData>({
    name: customer.name,
    email: customer.email,
    phone: customer.phone || '',
    address: customer.address || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof CustomerFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setFormData({ ...formData, [field]: value });
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no tiene un formato válido';
    }

    if (formData.phone && formData.phone.length < 10) {
      newErrors.phone = 'El teléfono debe tener al menos 10 dígitos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const finalData = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
    };

    setIsSubmitting(true);
    try {
      const success = await onSave(finalData);
      if (success) {
        onClose();
      }
    } catch (error: any) {
      console.error('Error updating customer:', error);
      setErrors({ 
        submit: 'Error al actualizar el cliente. Por favor, inténtalo de nuevo.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Cliente" size="lg">
      <form onSubmit={handleSubmit}>
        {errors.submit && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {errors.submit}
          </div>
        )}

        <div className="space-y-4">
          <Input
            label="Nombre Completo"
            value={formData.name}
            onChange={handleInputChange('name')}
            error={errors.name}
            icon={<User size={18} />}
            required
            placeholder="Ingresa el nombre completo del cliente"
          />

          <Input
            label="Correo Electrónico"
            type="email"
            value={formData.email}
            onChange={handleInputChange('email')}
            error={errors.email}
            icon={<Mail size={18} />}
            required
            placeholder="cliente@ejemplo.com"
          />

          <Input
            label="Teléfono"
            type="tel"
            value={formData.phone}
            onChange={handleInputChange('phone')}
            error={errors.phone}
            icon={<Phone size={18} />}
            placeholder="+57 300 123 4567"
          />

          <Input
            label="Dirección"
            value={formData.address}
            onChange={handleInputChange('address')}
            error={errors.address}
            icon={<MapPin size={18} />}
            placeholder="Calle 123 #45-67, Ciudad"
          />
        </div>

        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className={isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Guardando...
              </>
            ) : (
              'Guardar Cambios'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditCustomerModal;