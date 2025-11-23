import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import styles from "./MealPlanNew.module.css";
import { generateAIMealPlan } from "../../services/aiMealPlan";
import { format, addDays, startOfWeek } from "date-fns";

interface Meal {
  name: string;
  calories: number;
  protein: number;
}

interface DayPlan {
  day: string;
  date: string;
  breakfast?: Meal;
  lunch?: Meal;
  snack?: Meal;
  dinner?: Meal;
}

export default function MealPlanNew() {
  const [plan, setPlan] = useState<DayPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [allergies, setAllergies] = useState("");
  const [preferences, setPreferences] = useState("");

  const generateWeekDates = () => {
    const monday = startOfWeek(new Date(), { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(monday, i);
      return {
        day: date.toLocaleDateString("en-US", { weekday: "long" }),
        date: date.toLocaleDateString("en-US", { day: "numeric", month: "short" }),
      };
    });
  };

  const WEEK_DATES = generateWeekDates();

  const HEALTHY_FALLBACK_PLAN: DayPlan[] = [
    { ...WEEK_DATES[0], breakfast: { name: "Protein Pancakes with Berries", calories: 540, protein: 30 }, lunch: { name: "Grilled Chicken Quinoa Bowl", calories: 680, protein: 48 }, snack: { name: "Greek Yogurt + Almonds", calories: 220, protein: 18 }, dinner: { name: "Salmon & Sweet Potato", calories: 650, protein: 45 } },
    { ...WEEK_DATES[1], breakfast: { name: "Avocado Egg Toast", calories: 520, protein: 24 }, lunch: { name: "Turkey & Veggie Wrap", calories: 580, protein: 42 }, snack: { name: "Protein Shake + Banana", calories: 280, protein: 30 }, dinner: { name: "Beef Stir-Fry & Broccoli", calories: 670, protein: 52 } },
    { ...WEEK_DATES[2], breakfast: { name: "Overnight Oats & Chia", calories: 490, protein: 20 }, lunch: { name: "Tuna Chickpea Salad", calories: 640, protein: 44 }, snack: { name: "Cottage Cheese + Pineapple", calories: 190, protein: 22 }, dinner: { name: "Chicken & Roasted Veggies", calories: 660, protein: 50 } },
    { ...WEEK_DATES[3], breakfast: { name: "Spinach Feta Omelette", calories: 510, protein: 28 }, lunch: { name: "Shrimp Zucchini Noodles", calories: 560, protein: 46 }, snack: { name: "Apple + Peanut Butter", calories: 240, protein: 8 }, dinner: { name: "Tofu Veggie Stir-Fry", calories: 610, protein: 36 } },
    { ...WEEK_DATES[4], breakfast: { name: "Greek Yogurt Parfait", calories: 530, protein: 32 }, lunch: { name: "Chicken Buddha Bowl", calories: 700, protein: 50 }, snack: { name: "Carrot Sticks + Hummus", calories: 180, protein: 6 }, dinner: { name: "Grilled Cod & Asparagus", calories: 600, protein: 48 } },
    { ...WEEK_DATES[5], breakfast: { name: "Green Smoothie Bowl", calories: 500, protein: 28 }, lunch: { name: "Lentil Soup + Whole Bread", calories: 620, protein: 30 }, snack: { name: "Boiled Eggs + Cucumber", calories: 200, protein: 16 }, dinner: { name: "Turkey Meatballs Zoodles", calories: 650, protein: 52 } },
    { ...WEEK_DATES[6], breakfast: { name: "Chia Pudding & Mango", calories: 480, protein: 18 }, lunch: { name: "Salmon Poke Bowl", calories: 710, protein: 46 }, snack: { name: "Mixed Berries + Walnuts", calories: 230, protein: 5 }, dinner: { name: "Grilled Chicken Salad", calories: 670, protein: 54 } },
  ];

  const loadMealPlan = async () => {
    setLoading(true);
    try {
      const data = await generateAIMealPlan(
        allergies.split(",").map(s => s.trim()).filter(Boolean),
        preferences.trim()
      );

      if (data?.days?.length === 7) {
        const withDynamicDates = data.days.map((day: any, i: number) => ({
          ...day,
          ...WEEK_DATES[i],
        }));
        setPlan(withDynamicDates);
        toast.success("Your personalized AI meal plan is ready!");
      } else {
        toast.info("Using healthy template plan");
        setPlan(HEALTHY_FALLBACK_PLAN);
      }
    } catch (err) {
      toast.warn("AI unavailable – showing healthy plan");
      setPlan(HEALTHY_FALLBACK_PLAN);
    } finally {
      setLoading(false);
      setShowForm(false);
    }
  };

  useEffect(() => {
    setPlan(HEALTHY_FALLBACK_PLAN);
  }, []);

  const getMealColor = (type: string) => {
    const colors = {
      breakfast: "var(--breakfast-gradient)",
      lunch: "var(--lunch-gradient)",
      snack: "var(--snack-gradient)",
      dinner: "var(--dinner-gradient)",
    };
    return colors[type as keyof typeof colors] || "var(--meal-bg)";
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>7-Day Meal Plan</h1>
        <button
          className={styles.aiBtn}
          onClick={() => setShowForm(true)}
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate with AI"}
        </button>
      </div>

      {/* Beautiful Modal */}
      {showForm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <button
              className={styles.closeBtn}
              onClick={() => !loading && setShowForm(false)}
              disabled={loading}
            >
              ×
            </button>

            <div className={styles.modalHeader}>
              <h2>Personalized AI Meal Plan</h2>
              <p>Built for your body, goals & taste — in seconds</p>
            </div>

            <div className={styles.form}>
              <div className={styles.inputGroup}>
                <label>Allergies (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. peanuts, dairy, shellfish..."
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Preferences (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. high protein, vegetarian, love salmon..."
                  value={preferences}
                  onChange={(e) => setPreferences(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.cancelBtn}
                onClick={() => setShowForm(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className={styles.generateBtn}
                onClick={loadMealPlan}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className={styles.spinner}></span>
                    Creating your plan...
                  </>
                ) : (
                  <>
                    Generate Plan
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table Headers */}
      <div className={styles.tableHeader}>
        <div></div>
        <div>Breakfast</div>
        <div>Lunch</div>
        <div>Snack</div>
        <div>Dinner</div>
      </div>

      {/* Weekly Plan */}
      <div className={styles.weeklyPlan}>
        {plan.map((day, i) => (
          <div key={i} className={styles.dayRow}>
            <div className={styles.dayLabel}>
              <div className={styles.weekday}>{day.day}</div>
              <div className={styles.date}>{day.date}</div>
            </div>

            {(["breakfast", "lunch", "snack", "dinner"] as const).map((type) => {
              const meal = day[type];
              return (
                <div key={type} className={styles.mealCard} style={{ background: getMealColor(type) }}>
                  {meal ? (
                    <div className={styles.mealContent}>
                      <div className={styles.mealName}>{meal.name}</div>
                      <div className={styles.nutrition}>
                        <span className={styles.calories}>{meal.calories} kcal</span>
                        <span className={styles.protein}>• {meal.protein}g protein</span>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.empty}>—</div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}