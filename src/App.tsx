// src/App.tsx

import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/dashboard/Dashboard";
import Calendar from "./pages/calendar/Calendar";
import FoodDiary from "./pages/foodDiary/FoodDiary";
import Progress from "./pages/progress/Progress";
import MealPlan from "./pages/mealPlan/MealPlan";
import GroceryList from "./pages/groceryList/GroceryList";
import Messages from "./pages/messages/Messages";
import HealthyMenu from "./pages/healthyMenu/HealthyMenu";
import Exercises from "./pages/exercies/Exercises";
import HealthInsights from "./pages/healthInsights/HealthInsights";
import Settings from "./pages/settings/Settings";
function App() {
  return (
    <Layout>
      {" "}
      {/* Bây giờ 'Layout' đã nhận 'children' một cách chính xác */}
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/calendar" element={<Calendar />} />
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
