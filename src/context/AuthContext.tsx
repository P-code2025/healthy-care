import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api } from "../services/api";
import type { User } from "../services/api";
import { http } from "../services/http";

export interface AuthContextValue {
  user: User | null;
  isLoggedIn: boolean;
  isOnboarded: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: Record<string, any>) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const mapAuthResponse = (data: any): User | null => {
  if (data?.accessToken && data?.refreshToken) {
    http.setTokens(data.accessToken, data.refreshToken);
  }
  const user = data?.user as User | undefined;
  return user ?? null;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = http.onUnauthorized(() => {
      setUser(null);
    });

    const bootstrap = async () => {
      if (!http.getAccessToken()) {
        setLoading(false);
        return;
      }
      try {
        const profile = await api.getCurrentUser();
        setUser(profile);
      } catch (error) {
        http.clearTokens();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    const data = await http.request("/api/auth/login", {
      method: "POST",
      json: { email, password },
      skipAuth: true,
    });
    const profile = mapAuthResponse(data);
    // Clear old user data from localStorage
    localStorage.removeItem('userProfile');
    setUser(profile);
  };

  const register = async (payload: Record<string, any>) => {
    const data = await http.request("/api/auth/register", {
      method: "POST",
      json: payload,
      skipAuth: true,
    });
    const profile = mapAuthResponse(data);
    // Clear old user data from localStorage
    localStorage.removeItem('userProfile');
    setUser(profile);
  };

  const logout = async () => {
    try {
      await http.request("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore errors on logout
    } finally {
      http.clearTokens();
      // Clear all user data from localStorage
      localStorage.removeItem('userProfile');
      localStorage.clear();
      setUser(null);
    }
  };

  const refreshUser = async (): Promise<User | null> => {
    try {
      const profile = await api.getCurrentUser();
      setUser(profile);
      return profile;
    } catch (error) {
      console.error("Failed to refresh user:", error);
      return null;
    }
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoggedIn: Boolean(user),
      isOnboarded: Boolean(user?.weight_kg && user?.height_cm),
      loading,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
