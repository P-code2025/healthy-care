// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

import Layout from "./components/Layout";
import DashboardNew from "./pages/dashboard/DashboardNew";
import Calendar from "./pages/calendar/Calendar";
import FoodDiaryNew from "./pages/foodDiary/FoodDiaryNew";
import ProgressNew from "./pages/progress/ProgressNew";
import MealPlanNew from "./pages/mealPlan/MealPlanNew";
import GroceryListNew from "./pages/groceryList/GroceryListNew";
import Messages from "./pages/messages/Messages";
import HealthyMenu from "./pages/healthyMenu/HealthyMenu";
import ExercisesNew from "./pages/exercies/ExercisesNew";
import HealthInsightsNew from "./pages/healthInsights/HealthInsightsNew";
import HealthInsightDetail from "./pages/healthInsights/HealthInsightDetail";
import Settings from "./pages/settings/Settings";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Onboarding from "./pages/onboarding/Onboarding";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <AuthProvider>
      <ToastContainer position="top-right" />
      <Routes>
        {/* ---------- PUBLIC ---------- */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ---------- PROTECTED ---------- */}
        <Route element={<ProtectedRoute />}>
          {/* ---------- ONBOARDING ---------- */}
          <Route path="/onboarding" element={<Onboarding />} />
          
          <Route element={<Layout />}>
            <Route path="/" element={<DashboardNew />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/healthy-menu" element={<HealthyMenu />} />
            <Route path="/meal-plan" element={<MealPlanNew />} />
            <Route path="/grocery-list" element={<GroceryListNew />} />
            <Route path="/food-diary" element={<FoodDiaryNew />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/progress" element={<ProgressNew />} />
            <Route path="/exercises" element={<ExercisesNew />} />
            <Route path="/health-insights" element={<HealthInsightsNew />} />
            <Route path="/health-insights/:id" element={<HealthInsightDetail />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;