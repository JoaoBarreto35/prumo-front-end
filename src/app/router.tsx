import {
    createBrowserRouter,
    Navigate,
    type RouteObject,
  } from "react-router";
  
  import { AdminLayout } from "../layouts/AdminLayout";
  import { AppLayout } from "../layouts/AppLayout";
  import { PublicLayout } from "../layouts/PublicLayout";
  import { NotFoundPage } from "../pages/NotFound";
  import { PlaceholderPage } from "../pages/Placeholder";
  
  const routes: RouteObject[] = [
    {
      path: "/",
      element: <Navigate to="/home" replace />,
    },
  
    {
      element: <PublicLayout />,
      children: [
        {
          path: "/login",
          element: (
            <PlaceholderPage
              title="Entrar no Prumo"
              description="Acesse sua conta para continuar."
            />
          ),
        },
        {
          path: "/register",
          element: (
            <PlaceholderPage
              title="Solicitar acesso"
              description="Crie sua solicitação de acesso ao Prumo."
            />
          ),
        },
        {
          path: "/access-pending",
          element: (
            <PlaceholderPage
              title="Acesso em análise"
              description="Sua solicitação ainda está aguardando aprovação."
            />
          ),
        },
        {
          path: "/access-rejected",
          element: (
            <PlaceholderPage
              title="Acesso não aprovado"
              description="Sua solicitação não foi aprovada."
            />
          ),
        },
        {
          path: "/access-suspended",
          element: (
            <PlaceholderPage
              title="Acesso suspenso"
              description="Seu acesso está temporariamente indisponível."
            />
          ),
        },
        {
          path: "/change-temporary-password",
          element: (
            <PlaceholderPage
              title="Criar nova senha"
              description="Defina uma senha pessoal para continuar."
            />
          ),
        },
      ],
    },
  
    {
      element: <AppLayout />,
      children: [
        {
          path: "/home",
          element: (
            <PlaceholderPage
              title="Home"
              description="Sua visão financeira do mês."
            />
          ),
        },
        {
          path: "/calendar",
          element: (
            <PlaceholderPage
              title="Calendário"
              description="Acompanhe receitas, despesas e pendências por data."
            />
          ),
        },
        {
          path: "/transactions",
          element: (
            <PlaceholderPage
              title="Movimentações"
              description="Pesquise e gerencie seu histórico financeiro."
            />
          ),
        },
        {
          path: "/transactions/new",
          element: (
            <PlaceholderPage
              title="Nova movimentação"
              description="Registre uma receita ou despesa."
            />
          ),
        },
        {
          path: "/transactions/:transactionId/edit",
          element: (
            <PlaceholderPage
              title="Editar movimentação"
              description="Atualize os dados da movimentação."
            />
          ),
        },
        {
          path: "/closings",
          element: (
            <PlaceholderPage
              title="Fechamentos"
              description="Consulte e atualize seus fechamentos mensais."
            />
          ),
        },
        {
          path: "/closings/new",
          element: (
            <PlaceholderPage
              title="Novo fechamento"
              description="Revise o período antes de concluir o mês."
            />
          ),
        },
        {
          path: "/closings/:closingId",
          element: (
            <PlaceholderPage
              title="Detalhes do fechamento"
              description="Consulte os dados registrados neste fechamento."
            />
          ),
        },
        {
          path: "/accounts",
          element: (
            <PlaceholderPage
              title="Contas"
              description="Organize suas formas de pagamento e recebimento."
            />
          ),
        },
        {
          path: "/accounts/new",
          element: (
            <PlaceholderPage
              title="Nova conta"
              description="Cadastre uma nova conta financeira."
            />
          ),
        },
        {
          path: "/accounts/:accountId/edit",
          element: (
            <PlaceholderPage
              title="Editar conta"
              description="Atualize a configuração da conta."
            />
          ),
        },
        {
          path: "/categories",
          element: (
            <PlaceholderPage
              title="Categorias"
              description="Organize a classificação das suas movimentações."
            />
          ),
        },
        {
          path: "/categories/new",
          element: (
            <PlaceholderPage
              title="Nova categoria"
              description="Crie uma categoria personalizada."
            />
          ),
        },
        {
          path: "/categories/:categoryId/edit",
          element: (
            <PlaceholderPage
              title="Editar categoria"
              description="Atualize a categoria selecionada."
            />
          ),
        },
        {
          path: "/lume",
          element: (
            <PlaceholderPage
              title="Lume"
              description="Converse com seu assistente financeiro."
            />
          ),
        },
        {
          path: "/lume/:conversationId",
          element: (
            <PlaceholderPage
              title="Conversa com o Lume"
              description="Continue sua conversa financeira."
            />
          ),
        },
        {
          path: "/settings",
          element: <Navigate to="/settings/profile" replace />,
        },
        {
          path: "/settings/profile",
          element: (
            <PlaceholderPage
              title="Perfil"
              description="Gerencie suas informações pessoais."
            />
          ),
        },
        {
          path: "/settings/preferences",
          element: (
            <PlaceholderPage
              title="Preferências"
              description="Configure o comportamento padrão do Prumo."
            />
          ),
        },
        {
          path: "/settings/security",
          element: (
            <PlaceholderPage
              title="Segurança"
              description="Gerencie senha, sessões e dispositivos."
            />
          ),
        },
        {
          path: "/settings/appearance",
          element: (
            <PlaceholderPage
              title="Aparência"
              description="Escolha como o Prumo será exibido."
            />
          ),
        },
  
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
            {
              path: "users/:userId",
              element: (
                <PlaceholderPage
                  title="Detalhes do usuário"
                  description="Consulte e gerencie o acesso deste usuário."
                />
              ),
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