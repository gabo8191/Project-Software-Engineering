import React, { useState } from 'react';
import { Mail, User, Phone, MapPin } from 'lucide-react';
import Modal from '../../shared/components/Modal';
import Button from '../../components/Button';
import Input from '../../components/Input';

interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface NewCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CustomerFormData) => Promise<boolean>;
}

const NewCustomerModal: React.FC<NewCustomerModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<CustomerFormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
    });
    setErrors({});
  };

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
        handleClose();
      }
    } catch (error: any) {
      console.error('Error creating customer:', error);
      setErrors({ 
        submit: 'Error al crear el cliente. Por favor, inténtalo de nuevo.' 
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
    <Modal isOpen={isOpen} onClose={handleClose} title="Nuevo Cliente" size="lg">
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
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
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
                Creando...
              </>
            ) : (
              'Crear Cliente'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default NewCustomerModal;