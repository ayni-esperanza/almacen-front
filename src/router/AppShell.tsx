import { Outlet } from "react-router-dom";
import { useAuth } from "../shared/hooks/useAuth";
import { LoadingScreenPage } from "../pages/LoadingScreenPage";

export const AppShell = () => {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingScreenPage autoNavigate={false} />;
  }

  return <Outlet />;
};
