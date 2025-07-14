import React from 'react';
import { Menu, X, Activity, LogOut } from 'lucide-react';
import { MENU_ITEMS } from '../utils/constants';
import useSidebar from '../hooks/useSidebar';

// Sidebar Component
const Sidebar = ({ isOpen, setIsOpen, activeItem, handleMenuClick, user, onLogout }) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-50
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:shadow-none lg:border-r lg:border-gray-200
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-[#0079a9] to-[#58dd91] rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-800">HealthAdmin</span>
          </div>
          
          {/* Close button for mobile */}
          <button 
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 rounded-xl
                  transition-all duration-200 text-left group
                  ${isActive 
                    ? 'bg-gradient-to-r from-[#0079a9] to-[#58dd91] text-white shadow-lg scale-105' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-[#0079a9] hover:scale-102'
                  }
                `}
              >
                <Icon className={`
                  w-5 h-5 transition-transform duration-200
                  ${isActive ? 'scale-110' : 'group-hover:scale-110'}
                `} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="bg-gradient-to-r from-[#0079a9]/10 to-[#58dd91]/10 rounded-xl p-4 border border-[#0079a9]/20 mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#0079a9] to-[#58dd91] rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {user?.name || 'Admin User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email || 'Sistem Yöneticisi'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors duration-200"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Çıkış Yap</span>
          </button>
        </div>
      </aside>
    </>
  );
};

// Header Component
const Header = ({ sidebarOpen, setSidebarOpen, user }) => {
  return (
    <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="h-full flex items-center justify-between px-6">
        
        {/* Left side */}
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
          
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        </div>
        
        {/* Right side */}
        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-[#0079a9]/10 to-[#58dd91]/10 px-3 py-2 rounded-full">
            <div className="w-2 h-2 bg-[#58dd91] rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700">Sistem Aktif</span>
          </div>
          
          {/* User Info - Desktop */}
          <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
            <span>Hoş geldiniz,</span>
            <span className="font-medium text-gray-800">{user?.name || 'Admin'}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

// Main Layout Component
const Layout = ({ children, activeItem, setActiveItem, user, onLogout }) => {
  const { isOpen, handleMenuClick, close, open } = useSidebar();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      
      {/* Sidebar */}
      <Sidebar 
        isOpen={isOpen} 
        setIsOpen={close}
        activeItem={activeItem}
        handleMenuClick={(itemId) => {
          handleMenuClick(itemId);
          setActiveItem(itemId);
        }}
        user={user}
        onLogout={onLogout}
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
        
        {/* Header */}
        <Header 
          sidebarOpen={isOpen} 
          setSidebarOpen={open}
          user={user}
        />
        
        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
        
      </div>
    </div>
  );
};

export default Layout;