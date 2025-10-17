import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Header } from '../shared/components/Header';
import { DashboardTabs } from '../shared/components/DashboardTabs';
import { useAuth } from '../shared/hooks/useAuth';

export const DashboardPage = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-950 dark:to-slate-900">
      <Header onLogout={handleLogout} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden dark:bg-slate-900 dark:border dark:border-slate-700">
          <DashboardTabs currentPath={location.pathname} />
          
          <div className="p-8 bg-white dark:bg-slate-900">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};
