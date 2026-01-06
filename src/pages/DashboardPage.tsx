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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header fijo */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <Header onLogout={handleLogout} />
      </div>

      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="bg-white shadow-xl rounded-2xl dark:bg-slate-900 dark:border dark:border-slate-700">
          {/* Tabs fijos */}
          <div className="sticky z-40 top-[64px] bg-gray-50 dark:bg-slate-900 rounded-t-2xl">
            <DashboardTabs currentPath={location.pathname} />
          </div>

          <div
            key={location.pathname}
            className="bg-white dark:bg-slate-900 fade-section"
          >
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};
