export type CalendarModuleKey =
  | "meal-plan"
  | "exercises"
  | "food-diary"
  | "messages";

export type TemplateCategory = "meal" | "activity" | "appointment";

export interface CalendarTemplate {
  id: string;
  title: string;
  category: TemplateCategory;
  time: string;
  location?: string;
  note?: string;
  linkedModule: CalendarModuleKey;
}

export const MEAL_TEMPLATES: CalendarTemplate[] = [
  {
    id: "meal-breakfast",
    title: "Breakfast - Avocado Toast & Eggs",
    category: "meal",
    time: "07:30",
    location: "Home Kitchen",
    note: "Matches the recommended breakfast in Meal Plan.",
    linkedModule: "meal-plan",
  },
  {
    id: "meal-lunch",
    title: "Lunch - Grilled Chicken Wrap",
    category: "meal",
    time: "12:30",
    location: "Office Pantry",
    note: "Use groceries listed in Grocery List.",
    linkedModule: "food-diary",
  },
  {
    id: "meal-snack",
    title: "Snack - Greek Yogurt & Berries",
    category: "meal",
    time: "16:00",
    location: "Workspace",
    note: "Log nutrition in Food Diary after eating.",
    linkedModule: "food-diary",
  },
];

export const WORKOUT_TEMPLATES: CalendarTemplate[] = [
  {
    id: "activity-yoga",
    title: "Morning Yoga Flow",
    category: "activity",
    time: "06:30",
    location: "Living Room",
    note: "Warm-up routine from Workout Plans.",
    linkedModule: "exercises",
  },
  {
    id: "activity-hiit",
    title: "20 Min HIIT Fat Loss",
    category: "activity",
    time: "18:30",
    location: "Home Gym",
    note: "Follow the saved HIIT plan in Exercises.",
    linkedModule: "exercises",
  },
  {
    id: "activity-walk",
    title: "Evening Walk & Reflection",
    category: "activity",
    time: "20:00",
    location: "Neighborhood Park",
    note: "Review insights/messages afterwards.",
    linkedModule: "messages",
  },
];
