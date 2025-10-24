import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  CubeIcon,
  BeakerIcon,
  TruckIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  UserIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

const Sidebar = ({ currentPage = '' }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: HomeIcon,
      description: 'Visão geral do sistema'
    },
    {
      name: 'Cadastrar Tanque',
      path: '/tank-registration',
      icon: CubeIcon,
      description: 'Gerenciar tanques'
    },
    {
      name: 'Qualidade da Água',
      path: '/water-quality-registration',
      icon: BeakerIcon,
      description: 'Monitorar parâmetros'
    },
    {
      name: 'Cadastrar Camarão',
      path: '/shrimp-registration',
      icon: UserIcon,
      description: 'Dados biológicos'
    },
    {
      name: 'Alimentação',
      path: '/feeding-registration',
      icon: TruckIcon,
      description: 'Controle de ração'
    },
    {
      name: 'Despesas',
      path: '/expense-registration',
      icon: CurrencyDollarIcon,
      description: 'Gestão financeira'
    }
  ];

  const isActive = (path) => location.pathname === path || currentPage === path;

  return (
    <div className="w-72 bg-gradient-to-b from-orange-50 via-white to-orange-50 shadow-xl min-h-screen border-r border-orange-100">
      {/* Logo Section */}
      <div className="p-6 border-b border-orange-100 bg-gradient-to-r from-orange-500 to-orange-600">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
            <img src="/FAZENDA DE CAMARÕES.png" alt="Logo" className="w-6 h-6 rounded-full" />
          </div>
          <div>
            <h2 className="text-white font-bold text-lg">BFT Camarão</h2>
            <p className="text-orange-100 text-sm">Sistema de Controle</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="p-4">
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <div key={item.path} className="relative group">
                <button
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 transform hover:scale-105 ${
                    active
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-200'
                      : 'text-gray-700 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 hover:text-orange-700 hover:shadow-md'
                  }`}
                >
                  <div className={`p-2 rounded-lg mr-3 transition-all duration-300 ${
                    active
                      ? 'bg-white bg-opacity-20'
                      : 'bg-orange-100 group-hover:bg-orange-200'
                  }`}>
                    <Icon className={`h-5 w-5 transition-all duration-300 ${
                      active
                        ? 'text-white'
                        : 'text-orange-600 group-hover:text-orange-700'
                    }`} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className={`font-semibold ${active ? 'text-white' : 'text-gray-800'}`}>
                      {item.name}
                    </div>
                    <div className={`text-xs mt-0.5 ${active ? 'text-orange-100' : 'text-gray-500'}`}>
                      {item.description}
                    </div>
                  </div>
                  {active && (
                    <div className="ml-2 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  )}
                </button>

                {/* Hover Effect */}
                {!active && (
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-500 opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300 pointer-events-none"></div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Logout Section */}
        <div className="mt-8 pt-6 border-t border-orange-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:text-red-700 hover:shadow-md transform hover:scale-105 group"
          >
            <div className="p-2 rounded-lg mr-3 bg-red-100 group-hover:bg-red-200 transition-colors duration-300">
              <ArrowRightOnRectangleIcon className="h-5 w-5 text-red-600 group-hover:text-red-700" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-semibold text-gray-800">Sair do Sistema</div>
              <div className="text-xs mt-0.5 text-gray-500">Encerrar sessão</div>
            </div>
          </button>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-orange-50 to-transparent pointer-events-none"></div>
      <div className="absolute top-20 right-4 w-1 h-16 bg-gradient-to-b from-orange-300 to-transparent rounded-full opacity-30"></div>
      <div className="absolute bottom-32 left-6 w-2 h-12 bg-gradient-to-t from-orange-400 to-transparent rounded-full opacity-20"></div>
    </div>
  );
};

export default Sidebar;
