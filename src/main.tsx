import {
  StrictMode,
} from "react";
import {
  createRoot,
} from "react-dom/client";
import {
  RouterProvider,
} from "react-router/dom";

import {
  router,
} from "./app/router";
import {
  AppErrorBoundary,
} from "./components/AppErrorBoundary";
import {
  NetworkStatus,
} from "./components/NetworkStatus";
import {
  ToastProvider,
} from "./components/ToastProvider";
import {
  AuthProvider,
} from "./contexts/AuthContext";
import {
  ThemeProvider,
} from "./contexts/ThemeContext";

import "./styles/global.css";
import "./styles/release.css";


const rootElement =
  document.getElementById(
    "root",
  );

if (!rootElement) {
  throw new Error(
    "Root element was not found.",
  );
}


createRoot(
  rootElement,
).render(
  <StrictMode>
    <AppErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <NetworkStatus />

            <RouterProvider
              router={router}
            />
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </AppErrorBoundary>
  </StrictMode>,
);
