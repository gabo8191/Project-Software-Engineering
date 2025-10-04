import React, { useState } from 'react';
import { Menu, BellRing, User, LogOut, Server } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface PortalHeaderProps {
  toggleSidebar: () => void;
}

const PortalHeader: React.FC<PortalHeaderProps> = ({ toggleSidebar }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const toggleUserMenu = () => {
    setShowUserMenu(prev => !prev);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-4 h-16 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          className="p-2 mr-4 text-gray-700 rounded-lg hover:bg-gray-100 3xl:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu size={24} />
        </button>
        
        <Link to="/dashboard" className="flex items-center">
          <Server className="h-8 w-8 text-primary-600" />
          <span className="ml-2 text-xl font-semibold text-gray-900">Microservices Portal</span>
        </Link>
      </div>

      <div className="flex items-center space-x-4">
        <button 
          className="p-2 text-gray-700 rounded-full hover:bg-gray-100" 
          aria-label="Notifications"
        >
          <BellRing size={20} />
        </button>
        
        <div className="relative">
          <button
            onClick={toggleUserMenu}
            className="p-2 text-gray-700 rounded-full hover:bg-gray-100 flex items-center space-x-2"
            aria-label="User menu"
          >
            <User size={20} />
          </button>
          
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-apple-md border border-gray-100 py-1 z-50">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <LogOut size={16} className="mr-3" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default PortalHeader;