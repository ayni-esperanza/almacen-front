import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Header } from "../shared/components/Header";
import { DashboardTabs } from "../shared/components/DashboardTabs";
import { useAuth } from "../shared/hooks/useAuth";

export const DashboardPage = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-950 dark:to-slate-900">
      <div className="flex-shrink-0">
        <Header onLogout={handleLogout} />
      </div>

      <div className="flex-1 overflow-auto">
        <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="overflow-hidden bg-white shadow-xl rounded-2xl dark:bg-slate-900 dark:border dark:border-slate-700">
            <div className="sticky top-0 z-40 bg-white dark:bg-slate-900">
              <DashboardTabs currentPath={location.pathname} />
            </div>

            <div className="p-8 bg-white dark:bg-slate-900">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
