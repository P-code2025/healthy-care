// src/App.tsx

import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/dashboard/Dashboard";
import FoodDiary from "./pages/foodDiary/FoodDiary";
import Progress from "./pages/progress/Progress";
import MealPlan from "./pages/mealPlan/MealPlan";
import GroceryList from "./pages/groceryList/GroceryList";
import Messages from "./pages/Messages";

const Calendar = () => (
  <h1 className="text-3xl font-bold text-dark-text">Calendar Page</h1>
);
const HealthyMenu = () => (
  <h1 className="text-3xl font-bold text-dark-text">Healthy Menu Page</h1>
);

const Exercises = () => (
  <h1 className="text-3xl font-bold text-dark-text">Exercises Page</h1>
);
const HealthInsights = () => (
  <h1 className="text-3xl font-bold text-dark-text">Health Insights Page</h1>
);
const Settings = () => (
  <h1 className="text-3xl font-bold text-dark-text">Settings Page</h1>
);
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
