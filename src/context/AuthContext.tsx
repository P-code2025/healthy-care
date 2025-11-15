// src/context/AuthContext.tsx
import { createContext, useContext, useState, type ReactNode } from "react";

interface AuthState {
  isLoggedIn: boolean;
  isOnboarded: boolean;
  user?: any;
}

interface AuthContextValue extends AuthState {
  login: () => void;
  logout: () => void;
  finishOnboarding: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // ĐỌC TRỰC TIẾP TỪ localStorage KHI KHỞI TẠO
  const [state, setState] = useState<AuthState>(() => {
    const logged = localStorage.getItem("isLoggedIn") === "true";
    const onboarded = localStorage.getItem("isOnboarded") === "true";
    return { isLoggedIn: logged, isOnboarded: onboarded };
  });

  const login = () => {
    localStorage.setItem("isLoggedIn", "true");
    setState((s) => ({ ...s, isLoggedIn: true }));
  };

  const logout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("isOnboarded");
    localStorage.removeItem("userProfile");
    setState({ isLoggedIn: false, isOnboarded: false });
  };

  const finishOnboarding = () => {
    localStorage.setItem("isOnboarded", "true");
    setState((s) => ({ ...s, isOnboarded: true }));
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, finishOnboarding }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};