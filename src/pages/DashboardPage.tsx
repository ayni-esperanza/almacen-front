import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Header } from '../shared/components/Header';
import { DashboardTabs } from '../shared/components/DashboardTabs';
import { useAuth } from '../shared/hooks/useAuth';
import { generateExitReport } from '../features/reports/utils/pdfGenerator';
import { salidas } from '../features/inventory/data/mockData';

export const DashboardPage = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleGenerateReport = () => {
    generateExitReport(salidas);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header onLogout={handleLogout} onGenerateReport={handleGenerateReport} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <DashboardTabs currentPath={location.pathname} />
          
          <div className="p-8">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};
