import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { loginRequest, logoutRequest, meRequest } from "../api/auth";

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "STUDENT" | "ACADEMIC" | "ADMIN";
  departmentId: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  csrfToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      const me = await meRequest();
      setUser(me);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await loginRequest(email, password);
    setUser(response.user);
    setCsrfToken(response.csrfToken);
  };

  const logout = async () => {
    if (csrfToken) {
      await logoutRequest(csrfToken);
    }
    setUser(null);
    setCsrfToken(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, csrfToken, login, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
}
