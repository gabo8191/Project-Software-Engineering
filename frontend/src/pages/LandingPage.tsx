import React from 'react';
import { Package } from 'lucide-react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col">
      <header className="bg-white shadow-sm border-b border-gray-200 px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <Package className="h-8 w-8 text-primary-600" />
          <span className="ml-2 text-xl font-semibold text-gray-900">OrderFlow</span>
        </Link>
      </header>

      <main className="flex-grow flex items-center justify-center px-6 md:px-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-semibold text-gray-900 tracking-tight">
            Bienvenido a OrderFlow
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
            Sistema de gestión de pedidos y clientes para empresas a nivel nacional.
          </p>
          <div className="mt-10">
            <Link 
              to="/dashboard"
              className="inline-block bg-primary-600 text-white px-8 py-3 rounded-xl text-lg font-medium hover:bg-primary-700 transition-colors transform hover:scale-105"
            >
              Ver Dashboard
            </Link>
          </div>
        </div>
      </main>

      <footer className="py-8 px-6 md:px-10 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center">
            <Package className="h-6 w-6 text-primary-600" />
            <span className="ml-2 text-lg font-semibold text-gray-900">OrderFlow</span>
          </div>
          <div className="mt-4 md:mt-0 text-sm text-gray-600">
            &copy; {new Date().getFullYear()} OrderFlow. Sistema de Gestión de Pedidos.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;