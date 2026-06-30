import {
  createBrowserRouter,
  Navigate,
  type RouteObject,
} from "react-router";

import { AdminRoute } from "../components/AdminRoute";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { PublicOnlyRoute } from "../components/PublicOnlyRoute";
import { AdminLayout } from "../layouts/AdminLayout";
import { AppLayout } from "../layouts/AppLayout";
import { PublicLayout } from "../layouts/PublicLayout";
import { AccessStatusPage } from "../pages/AccessStatus";
import { LoginPage } from "../pages/Login";
import { NotFoundPage } from "../pages/NotFound";
import { PlaceholderPage } from "../pages/Placeholder";
import { RegisterPage } from "../pages/Register";
import { AccountsPage } from "../pages/Accounts";
import { CategoriesPage } from "../pages/Categories";
import { TransactionsPage } from "../pages/Transactions";
import { NewTransactionPage } from "../pages/NewTransaction";
import { HomePage } from "../pages/Home";
import { EditTransactionPage } from '../pages/EditTransaction';
import { TransactionDetailsPage } from '../pages/TransactionDetails';
import { CalendarPage } from '../pages/Calendar';
import { PlanningPage } from "../pages/Planning";
import { ReportsPage } from "../pages/Reports";
import { LumePage } from "../pages/Lume";
import { NotificationsPage } from "../pages/Notifications";
import { SettingsPage } from "../pages/Settings";
import { ChangeTemporaryPasswordPage } from "../pages/ChangeTemporaryPassword";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Navigate to="/home" replace />,
  },
  {
    element: <PublicOnlyRoute />,
    children: [
      {
        element: <PublicLayout />,
        children: [
          {
            path: "/login",
            element: <LoginPage />,
          },
          {
            path: "/register",
            element: <RegisterPage />,
          },
        ],
      },
    ],
  },
  {
    element: <PublicLayout />,
    children: [
      {
        path: "/access-pending",
        element: (
          <AccessStatusPage
            title="Solicitação enviada"
            description="Seu acesso está aguardando aprovação manual. Depois de aprovado, você poderá entrar normalmente."
          />
        ),
      },
      {
        path: "/access-rejected",
        element: (
          <AccessStatusPage
            title="Acesso não aprovado"
            description="Sua solicitação de acesso não foi aprovada."
            symbol="×"
          />
        ),
      },
      {
        path: "/access-suspended",
        element: (
          <AccessStatusPage
            title="Acesso suspenso"
            description="Seu acesso está temporariamente suspenso."
            symbol="!"
          />
        ),
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/change-temporary-password",
        element: <ChangeTemporaryPasswordPage />,
      },
      {
        element: <AppLayout />,
        children: [
          {
            path: "/home",
            element: <HomePage />,
          },
          {
            path: "/calendar",
            element: <CalendarPage />,
          },
          {
            path: "/reports",
            element: <ReportsPage />,
          },
          {
            path: "/planning",
            element: <PlanningPage />,
          },
          {
            path: "/transactions",
            element: <TransactionsPage />,
          },
          {
            path: "/transactions/new",
            element: <NewTransactionPage />,
          },
          {
            path: "/transactions/:transactionId/edit",
            element: <EditTransactionPage />,
          },
          {
            path: "/transactions/:transactionId",
            element: <TransactionDetailsPage />,
          },
          {
            path: "/closings",
            element: (
              <PlaceholderPage
                title="Fechamentos"
                description="Gerencie os fechamentos mensais."
              />
            ),
          },
          {
            path: "/accounts",
            element: <AccountsPage />,
          },
          {
            path: "/categories",
            element: <CategoriesPage />,
          },
          {
            path: "/lume",
            element: <LumePage />,
          },
          {
            path: "/notifications",
            element: <NotificationsPage />,
          },
          {
            path: "/settings",
            element: <Navigate to="/settings/profile" replace />,
          },
          {
            path: "/settings/profile",
            element: <SettingsPage />,
          },
          {
            path: "/settings/preferences",
            element: <SettingsPage />,
          },
          {
            path: "/settings/security",
            element: <SettingsPage />,
          },
          {
            path: "/settings/appearance",
            element: <SettingsPage />,
          },
          
          {
            element: <AdminRoute />,
            children: [
              {
                path: "/admin",
                element: <AdminLayout />,
                children: [
                  {
                    index: true,
                    element: <Navigate to="/admin/users" replace />,
                  },
                  {
                    path: "users",
                    element: (
                      <PlaceholderPage
                        title="Usuários"
                        description="Gerencie solicitações e acessos."
                      />
                    ),
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
];

export const router = createBrowserRouter(routes);
