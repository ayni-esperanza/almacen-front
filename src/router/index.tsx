import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { LoginPage } from "../pages/LoginPage";
import { DashboardPage } from "../pages/DashboardPage";
import { InventoryPage } from "../pages/InventoryPage";
import { MovementsPage } from "../pages/MovementsPage";
import { EquipmentPage } from "../pages/EquipmentPage";
import { UsersPage } from "../pages/UsersPage";
import { ReportsPage } from "../pages/ReportsPage";
import ProvidersPage from "../pages/ProvidersPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { useAuth } from "../shared/hooks/useAuth";

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <LoginPage />,
    },
    {
      path: "/login",
      element: <LoginPage />,
    },
    {
      path: "/dashboard",
      element: (
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      ),
      children: [
        {
          index: true,
          element: <InventoryPage />,
        },
        {
          path: "inventory",
          element: <InventoryPage />,
        },
        {
          path: "movements",
          element: <MovementsPage />,
        },
        {
          path: "equipment",
          element: <EquipmentPage />,
        },
        {
          path: "users",
          element: <UsersPage />,
        },
        {
          path: "reports",
          element: <ReportsPage />,
        },
        {
          path: "providers",
          element: <ProvidersPage />,
        },
      ],
    },
  ],
  {
    basename: "/almacen", // Base path para subdirectorio
  }
);

export const AppRouter = () => {
  const { user } = useAuth();

  // Usar el ID del usuario como key para forzar remontaje cuando cambie de usuario
  // Esto limpia todo el estado de los componentes sin recargar la página
  return <RouterProvider router={router} key={user?.id || "no-user"} />;
};
