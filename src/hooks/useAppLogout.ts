import {
  useCallback,
  useState,
} from "react";
import {
  useNavigate,
} from "react-router";

import {
  useAuth,
} from "../contexts/AuthContext";


export function useAppLogout() {
  const navigate =
    useNavigate();

  const {
    logout,
  } = useAuth();

  const [
    isLoggingOut,
    setIsLoggingOut,
  ] = useState(false);


  const performLogout =
    useCallback(async () => {
      if (isLoggingOut) {
        return;
      }

      setIsLoggingOut(true);

      try {
        await logout();
      } catch {
        // O AuthContext limpa os tokens no finally.
        // Mesmo se a API estiver indisponível,
        // o logout local deve continuar.
      } finally {
        navigate(
          "/login",
          {
            replace: true,
          },
        );
      }
    }, [
      isLoggingOut,
      logout,
      navigate,
    ]);


  return {
    isLoggingOut,
    performLogout,
  };
}
