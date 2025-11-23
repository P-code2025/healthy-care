// src/components/ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { messages } from "../i18n/messages";

export const ProtectedRoute = () => {
  const { isLoggedIn, isOnboarded, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        {messages.common.loadingUser}
      </div>
    );
  }

  if (!isLoggedIn) return <Navigate to="/login" replace />;
  
  // Skip onboarding check if already on onboarding page
  if (!isOnboarded && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
};
