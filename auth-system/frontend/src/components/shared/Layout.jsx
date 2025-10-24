import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = ({ children, currentPage = '' }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-100">
      <Header />
      <div className="flex">
        <Sidebar currentPage={currentPage} />
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
