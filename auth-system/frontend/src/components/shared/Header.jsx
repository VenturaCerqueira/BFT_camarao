import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';

const Header = ({ user, title = "Sistema de Controle de Camarão" }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="bg-gradient-to-r from-white via-orange-50 to-white shadow-lg border-b border-orange-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <img src="/FAZENDA DE CAMARÕES.png" alt="Logo" className="w-6 h-6 rounded-full" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{title}</h1>
                <p className="text-xs text-orange-600 font-medium">Fazenda de Camarões</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* User Info */}
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{user?.username || 'Usuário'}</p>
                <p className="text-xs text-gray-500">Online</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full flex items-center justify-center shadow-md">
                <UserCircleIcon className="w-6 h-6 text-white" />
              </div>
            </div>

            {/* Notifications */}
            <button className="relative p-2 text-gray-600 hover:text-orange-600 transition-colors duration-200 rounded-lg hover:bg-orange-50">
              <BellIcon className="w-6 h-6" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
