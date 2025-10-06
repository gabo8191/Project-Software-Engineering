import React, { useState } from 'react';
import { Menu, Bell, User, LogOut, Package } from 'lucide-react';
import Button from '../ui/Button';
import { useAuth } from '../../stores/useAuth';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-30">
      <div className="flex items-center min-w-0">
        <Button
          variant="outline"
          size="sm"
          onClick={onMenuClick}
          className="3xl:hidden mr-3 flex-shrink-0"
        >
          <Menu size={20} />
        </Button>
        
        <div className="flex items-center min-w-0">
          <Package className="h-6 w-6 text-primary-600 flex-shrink-0" />
          <span className="ml-2 text-lg font-semibold text-gray-900 truncate">OrderFlow</span>
        </div>
      </div>

      <div className="flex items-center space-x-2 flex-shrink-0">
        {/* Notifications */}
        <Button variant="outline" size="sm" className="relative hidden sm:flex">
          <Bell size={18} />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
        </Button>

        {/* User Menu */}
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2 max-w-[160px]"
          >
            <div className="w-7 h-7 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
              <User size={14} className="text-white" />
            </div>
            <span className="hidden md:block text-gray-700 font-medium text-sm truncate">
              {user?.username || 'admin'}
            </span>
          </Button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
              <div className="px-3 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.username || 'admin'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email || 'admin@orderflow.com'}
                </p>
              </div>
              
              <button
                onClick={handleLogout}
                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
              >
                <LogOut size={14} className="mr-2" />
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;