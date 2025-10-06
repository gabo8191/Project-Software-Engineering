import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Activity, 
  Users, 
  Package, 
  X
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const SidebarLink: React.FC<{
  to: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}> = ({ to, icon, label, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <Link
      to={to}
      onClick={handleClick}
      className={cn(
        'flex items-center px-4 py-3 rounded-xl text-gray-600 transition-colors',
        isActive 
          ? 'bg-primary-50 text-primary-700' 
          : 'hover:bg-gray-100'
      )}
    >
      <span className={cn('mr-3', isActive ? 'text-primary-600' : 'text-gray-500')}>{icon}</span>
      <span className="font-medium">{label}</span>
      {isActive && <div className="w-1 h-6 bg-primary-600 rounded-full ml-auto"></div>}
    </Link>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const handleLinkClick = () => {
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 3xl:hidden"
          onClick={onClose}
        ></div>
      )}
      
      <aside 
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          '3xl:translate-x-0 3xl:z-0'
        )}
      >
        <div className="h-16 px-4 flex items-center justify-between border-b border-gray-200">
          <div className="flex items-center">
            <Package className="h-6 w-6 text-primary-600" />
            <span className="ml-2 text-xl font-semibold text-gray-900">OrderFlow</span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 3xl:hidden"
          >
            <X size={20} />
          </button>
        </div>
        
        <nav className="p-4 space-y-1">
          <SidebarLink 
            to="/dashboard" 
            icon={<Activity size={20} />} 
            label="Salud del Sistema" 
            onClick={handleLinkClick} 
          />
          <SidebarLink 
            to="/customers" 
            icon={<Users size={20} />} 
            label="Clientes" 
            onClick={handleLinkClick} 
          />
          <SidebarLink 
            to="/orders" 
            icon={<Package size={20} />} 
            label="Pedidos" 
            onClick={handleLinkClick} 
          />
        </nav>
        
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-primary-50 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-primary-900 mb-2">
              Sistema de Gestión
            </h4>
            <p className="text-xs text-primary-700">
              Administra pedidos y clientes de manera eficiente
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;