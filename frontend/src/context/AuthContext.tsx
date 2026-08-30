import { createContext, ReactNode, useContext, useState } from "react";

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
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // TODO: implement actual API calls in later batches
  const login = async (_email: string, _password: string) => {
    // placeholder
  };

  const logout = async () => {
    // placeholder
    setUser(null);
  };

  const refreshUser = async () => {
    // placeholder
    setIsLoading(false);
  };

  // Simulate initial loading completion
  setTimeout(() => setIsLoading(false), 0);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, logout, refreshUser }}
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
