import React, { useState } from 'react';
import Layout from './layout/Layout';
import UsersPage from './pages/UsersPage';
import ContentPage from './pages/ContentPage';
import StatisticsPage from './pages/StatisticsPage';
import LoginPage from './pages/LoginPage';
import { UserProvider } from './contexts/UserContext';

// Main App Component with Authentication and Routing
const App = () => {
  const [currentPage, setCurrentPage] = useState('statistics');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
    setCurrentPage('statistics'); // Login sonrası statistics sayfasına yönlendir
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setCurrentPage('statistics');
  };

  const renderPage = () => {
    switch(currentPage) {
      case 'statistics':
        return <StatisticsPage />;
      case 'content':
        return <ContentPage />;
      case 'users':
        return <UsersPage />;
      default:
        return <StatisticsPage />;
    }
  };

  // Eğer kullanıcı giriş yapmamışsa login sayfasını göster
  if (!isAuthenticated) {
    return (
      <UserProvider>
        <LoginPage onLogin={handleLogin} />
      </UserProvider>
    );
  }

  // Kullanıcı giriş yaptıysa ana uygulamayı göster
  return (
    <UserProvider>
      <Layout 
        activeItem={currentPage}
        setActiveItem={setCurrentPage}
        user={user}
        onLogout={handleLogout}
      >
        {renderPage()}
      </Layout>
    </UserProvider>
  );
};

export default App;