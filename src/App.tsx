import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import { ToastProvider } from "./hooks/useToast";
import ToastContainer from "./components/Toast";

import Layout from "./components/Layout";
import DashboardNew from "./pages/dashboard/DashboardNew";
import Calendar from "./pages/calendar/Calendar";
import FoodDiaryNew from "./pages/foodDiary/FoodDiaryNew";
import ProgressNew from "./pages/progress/ProgressNew";
import MealPlanNew from "./pages/mealPlan/MealPlanNew";
import Messages from "./pages/messages/Messages";
import HealthyMenu from "./pages/healthyMenu/HealthyMenu";
import ExercisesNew from "./pages/exercises/ExercisesNew";
import HealthInsightsNew from "./pages/healthInsights/HealthInsightsNew";
import HealthInsightDetail from "./pages/healthInsights/HealthInsightDetail";
import Settings from "./pages/settings/Settings";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import OnboardingNew from "./pages/onboarding/OnboardingNew";

import { ToastContainer as ReactToastify } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { initializeToolSystem } from "./services/toolSystemInit";

function App() {
  useEffect(() => {
    initializeToolSystem();
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <ReactToastify position="top-right" />
          <ToastContainer />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/onboarding" element={<OnboardingNew />} />

              <Route element={<Layout />}>
                <Route path="/" element={<DashboardNew />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/healthy-menu" element={<HealthyMenu />} />
                <Route path="/meal-plan" element={<MealPlanNew />} />
                <Route path="/food-diary" element={<FoodDiaryNew />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/progress" element={<ProgressNew />} />
                <Route path="/exercises" element={<ExercisesNew />} />
                <Route path="/health-insights" element={<HealthInsightsNew />} />
                <Route path="/health-insights/:id" element={<HealthInsightDetail />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;