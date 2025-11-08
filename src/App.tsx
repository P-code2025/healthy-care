// src/App.tsx

import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/dashboard/Dashboard";
import FoodDiary from "./pages/foodDiary/FoodDiary";
import Progress from "./pages/progress/Progress";
import MealPlan from "./pages/mealPlan/MealPlan";
import GroceryList from "./pages/groceryList/GroceryList";
import HealthyMenu from "./pages/healthyMenu/HealthyMenu";
import Exercises from "./pages/exercises/Exercises";

// --- SỬA LỖI Ở ĐÂY ---
import CalendarPage from "./pages/calendar/CalendarPage"; // 1. Bạn đã import đúng file này

// 2. Xóa component placeholder 'Calendar' cũ (nếu nó còn)
// const Calendar = () => (...); // XÓA DÒNG NÀY

const Messages = () => (
  <h1 className="text-3xl font-bold text-dark-text">Messages Page</h1>
);
// (Code các placeholder khác giữ nguyên...)
const HealthInsights = () => (
  <h1 className="text-3xl font-bold text-dark-text">Health Insights Page</h1>
);
const Settings = () => (
  <h1 className="text-3xl font-bold text-dark-text">Settings Page</h1>
);

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />

        {/* 3. SỬA LỖI ROUTING Ở ĐÂY */}
        {/* Dùng <CalendarPage /> (import ở trên) thay vì <Calendar /> (đã bị xóa) */}
        <Route path="/calendar" element={<CalendarPage />} />

        <Route path="/healthy-menu" element={<HealthyMenu />} />
        <Route path="/meal-plan" element={<MealPlan />} />
        <Route path="/grocery-list" element={<GroceryList />} />
        <Route path="/food-diary" element={<FoodDiary />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/exercises" element={<Exercises />} />
        <Route path="/health-insights" element={<HealthInsights />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Layout>
  );
}

export default App;
