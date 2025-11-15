import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

import styles from "./MealPlanNew.module.css";
import { messages as i18nMessages } from "../../i18n/messages";

interface Meal {
  id: string;
  name: string;
  image: string;
  category: 'Breakfast' | 'Lunch' | 'Snack' | 'Dinner';
  steps: string;
}

interface DayMeals {
  day: string;
  date: string;
  steps: string;
  breakfast?: Meal;
  lunch?: Meal;
  snack?: Meal;
  dinner?: Meal;
}

const WEEKLY_MEALS: DayMeals[] = [
  {
    day: 'Sunday',
    date: '1 Sep',
    steps: '3 Step',
    breakfast: {
      id: '1',
      name: 'Scrambled Eggs with Spinach & Whole Grain Toast',
      image: '/images/meal-plan/scrambled-eggs.jpg',
      category: 'Breakfast',
      steps: '3 Step'
    },
    lunch: {
      id: '2',
      name: 'Grilled Chicken Wrap with Avocado and Spinach',
      image: '/images/meal-plan/chicken-wrap.jpg',
      category: 'Lunch',
      steps: '4 Step'
    },
    snack: {
      id: '3',
      name: 'Greek Yogurt with Mixed Berries and Almonds',
      image: '/images/meal-plan/smoothie.jpg',
      category: 'Snack',
      steps: '2 Step'
    },
    dinner: {
      id: '4',
      name: 'Baked Salmon with Steamed Broccoli and Sweet Potatoes',
      image: '/images/meal-plan/grilled-salmon.jpg',
      category: 'Dinner',
      steps: '5 Step'
    }
  },
  {
    day: 'Monday',
    date: '2 Sep',
    steps: '4 Step',
    breakfast: {
      id: '5',
      name: 'Avocado Toast with Poached Egg',
      image: '/images/meal-plan/avocado-toast.jpg',
      category: 'Breakfast',
      steps: '3 Step'
    },
    lunch: {
      id: '6',
      name: 'Quinoa Salad with Roasted Vegetables and Feta',
      image: '/images/meal-plan/quinoa-bowl.jpg',
      category: 'Lunch',
      steps: '5 Step'
    },
    snack: {
      id: '7',
      name: 'Apple Slices with Peanut Butter',
      image: '/images/meal-plan/smoothie.jpg',
      category: 'Snack',
      steps: '2 Step'
    },
    dinner: {
      id: '8',
      name: 'Grilled Turkey Breast with Asparagus and Brown Rice',
      image: '/images/meal-plan/chicken-wrap.jpg',
      category: 'Dinner',
      steps: '6 Step'
    }
  },
  {
    day: 'Tuesday',
    date: '3 Sep',
    steps: '5 Step',
    breakfast: {
      id: '9',
      name: 'Blueberry Protein Smoothie',
      image: '/images/meal-plan/smoothie.jpg',
      category: 'Breakfast',
      steps: '2 Step'
    },
    lunch: {
      id: '10',
      name: 'Greek Salad with Feta and Olives',
      image: '/images/meal-plan/greek-salad.jpg',
      category: 'Lunch',
      steps: '3 Step'
    },
    snack: {
      id: '11',
      name: 'Hummus with Carrot Sticks',
      image: '/images/meal-plan/quinoa-bowl.jpg',
      category: 'Snack',
      steps: '2 Step'
    },
    dinner: {
      id: '12',
      name: 'Baked Chicken Breast with Black Beans and Avocado',
      image: '/images/meal-plan/chicken-wrap.jpg',
      category: 'Dinner',
      steps: '5 Step'
    }
  },
  {
    day: 'Wednesday',
    date: '4 Sep',
    steps: '6 Step',
    breakfast: {
      id: '13',
      name: 'Oatmeal with Almond Butter and Berries',
      image: '/images/meal-plan/oatmeal.jpg',
      category: 'Breakfast',
      steps: '3 Step'
    },
    lunch: {
      id: '14',
      name: 'Veggie Stir-Fry with Tofu and Brown Rice',
      image: '/images/meal-plan/quinoa-bowl.jpg',
      category: 'Lunch',
      steps: '5 Step'
    },
    snack: {
      id: '15',
      name: 'Almonds and a Banana',
      image: '/images/meal-plan/smoothie.jpg',
      category: 'Snack',
      steps: '1 Step'
    },
    dinner: {
      id: '16',
      name: 'Grilled Shrimp Tacos with Mango Salsa',
      image: '/images/meal-plan/tacos.jpg',
      category: 'Dinner',
      steps: '6 Step'
    }
  },
  {
    day: 'Thursday',
    date: '5 Sep',
    steps: '7 Step',
    breakfast: {
      id: '17',
      name: 'Greek Yogurt with Granola and Honey',
      image: '/images/meal-plan/oatmeal.jpg',
      category: 'Breakfast',
      steps: '2 Step'
    },
    lunch: {
      id: '18',
      name: 'Baked Chicken Breast with Quinoa and Kale',
      image: '/images/meal-plan/chicken-wrap.jpg',
      category: 'Lunch',
      steps: '5 Step'
    },
    snack: {
      id: '19',
      name: 'Cottage Cheese with Pineapple',
      image: '/images/meal-plan/smoothie.jpg',
      category: 'Snack',
      steps: '1 Step'
    },
    dinner: {
      id: '20',
      name: 'Lemon Garlic Tilapia with Roasted Brussels Sprouts',
      image: '/images/meal-plan/grilled-salmon.jpg',
      category: 'Dinner',
      steps: '5 Step'
    }
  },
  {
    day: 'Friday',
    date: '6 Sep',
    steps: '8 Step',
    breakfast: {
      id: '21',
      name: 'Smoothie Bowl with Mixed Fruits and Granola',
      image: '/images/meal-plan/smoothie.jpg',
      category: 'Breakfast',
      steps: '3 Step'
    },
    lunch: {
      id: '22',
      name: 'Tuna Salad with Spinach and Chickpeas',
      image: '/images/meal-plan/greek-salad.jpg',
      category: 'Lunch',
      steps: '4 Step'
    },
    snack: {
      id: '23',
      name: 'Dark Chocolate and Walnuts',
      image: '/images/meal-plan/oatmeal.jpg',
      category: 'Snack',
      steps: '1 Step'
    },
    dinner: {
      id: '24',
      name: 'Grilled Chicken with Sweet Potato and Green Beans',
      image: '/images/meal-plan/chicken-wrap.jpg',
      category: 'Dinner',
      steps: '6 Step'
    }
  },
  {
    day: 'Saturday',
    date: '7 Sep',
    steps: '9 Step',
    breakfast: {
      id: '25',
      name: 'Chia Pudding with Strawberries',
      image: '/images/meal-plan/oatmeal.jpg',
      category: 'Breakfast',
      steps: '2 Step'
    },
    lunch: {
      id: '26',
      name: 'Mediterranean Couscous Salad with Grilled Vegetables',
      image: '/images/meal-plan/quinoa-bowl.jpg',
      category: 'Lunch',
      steps: '5 Step'
    },
    snack: {
      id: '27',
      name: 'Trail Mix with Dried Fruit and Seeds',
      image: '/images/meal-plan/smoothie.jpg',
      category: 'Snack',
      steps: '1 Step'
    },
    dinner: {
      id: '28',
      name: 'Baked Tilapia with Lentils and Avocado',
      image: '/images/meal-plan/grilled-salmon.jpg',
      category: 'Dinner',
      steps: '5 Step'
    }
  }
];

export default function MealPlanNew() {
  const [selectedWeek, setSelectedWeek] = useState("Week 2");
  const currentMonth = "September 2028";
  const [searchQuery, setSearchQuery] = useState("");

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredMeals = useMemo(() => {
    if (!normalizedQuery) return WEEKLY_MEALS;
    return WEEKLY_MEALS.filter((dayMeals) => {
      const haystack = [
        dayMeals.day,
        dayMeals.date,
        dayMeals.breakfast?.name,
        dayMeals.lunch?.name,
        dayMeals.snack?.name,
        dayMeals.dinner?.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [normalizedQuery]);

  useEffect(() => {
    if (normalizedQuery && filteredMeals.length === 0) {
      toast.info(i18nMessages.mealPlan.noResults);
    }
  }, [normalizedQuery, filteredMeals.length]);

  const getMealCardColor = (category: string) => {
    const colors: Record<string, string> = {
      'Breakfast': 'linear-gradient(135deg, #D4F4DD 0%, #A7E9AF 100%)',
      'Lunch': 'linear-gradient(135deg, #FFE5B4 0%, #FFD89B 100%)',
      'Snack': 'linear-gradient(135deg, #FFE5CC 0%, #FFCCA3 100%)',
      'Dinner': 'linear-gradient(135deg, #FFD4A3 0%, #FFB84D 100%)'
    };
    return colors[category] || 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)';
  };

  const handleComingSoon = () =>
    toast.info(i18nMessages.mealPlan.notImplemented);

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.navBtn} aria-label="Previous month" onClick={handleComingSoon}>
            {i18nMessages.mealPlan.navPrev}
          </button>
          <button className={styles.navBtn} aria-label="Next month" onClick={handleComingSoon}>
            {i18nMessages.mealPlan.navNext}
          </button>
          <h1 className={styles.pageTitle}>{currentMonth}</h1>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.searchBox}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM18 18l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              placeholder={i18nMessages.mealPlan.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className={styles.filterBtn} onClick={handleComingSoon}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            {i18nMessages.mealPlan.filterLabel}
          </button>
          <button className={styles.addButton} onClick={handleComingSoon}>
            <span>+</span> {i18nMessages.mealPlan.addMenuCta}
          </button>
        </div>
      </div>

      {/* Week Selector */}
      <div className={styles.weekSelector}>
        <select
          className={styles.weekSelect}
          value={selectedWeek}
          onChange={(e) => setSelectedWeek(e.target.value)}
          aria-label={i18nMessages.mealPlan.weekLabel}
        >
          <option>Week 1</option>
          <option>Week 2</option>
          <option>Week 3</option>
          <option>Week 4</option>
        </select>
      </div>

      {/* Meal Type Headers */}
      <div className={styles.mealHeaders}>
        <div className={styles.dayColumn}></div>
        <div className={styles.mealHeader} style={{ background: 'linear-gradient(135deg, #D4F4DD 0%, #A7E9AF 100%)' }}>
          Breakfast
        </div>
        <div className={styles.mealHeader} style={{ background: 'linear-gradient(135deg, #FFE5B4 0%, #FFD89B 100%)' }}>
          Lunch
        </div>
        <div className={styles.mealHeader} style={{ background: 'linear-gradient(135deg, #FFD4A3 0%, #FFB84D 100%)' }}>
          Snack
        </div>
        <div className={styles.mealHeader} style={{ background: 'linear-gradient(135deg, #F5F5DC 0%, #E8E8D0 100%)' }}>
          Dinner
        </div>
      </div>

      {/* Weekly Meal Plan */}
      <div className={styles.weeklyPlan}>
        {filteredMeals.map((dayMeals, index) => (
          <div key={index} className={styles.dayRow}>
            {/* Day Info */}
            <div className={styles.dayInfo}>
              <div className={styles.dayName}>{dayMeals.day}</div>
              <div className={styles.daySteps}>{dayMeals.steps}</div>
            </div>

            {/* Breakfast */}
            <div className={styles.mealCard} style={{ background: getMealCardColor('Breakfast') }}>
              {dayMeals.breakfast && (
                <>
                  <div className={styles.mealImage}>
                    <img src={dayMeals.breakfast.image} alt={dayMeals.breakfast.name} />
                    <button className={styles.checkBtn} onClick={handleComingSoon}>
                      {i18nMessages.mealPlan.checkButton}
                    </button>
                  </div>
                  <div className={styles.mealInfo}>
                    <h3 className={styles.mealName}>{dayMeals.breakfast.name}</h3>
                  </div>
                </>
              )}
            </div>

            {/* Lunch */}
            <div className={styles.mealCard} style={{ background: getMealCardColor('Lunch') }}>
              {dayMeals.lunch && (
                <>
                  <div className={styles.mealImage}>
                    <img src={dayMeals.lunch.image} alt={dayMeals.lunch.name} />
                    <button className={styles.checkBtn} onClick={handleComingSoon}>
                      {i18nMessages.mealPlan.checkButton}
                    </button>
                  </div>
                  <div className={styles.mealInfo}>
                    <h3 className={styles.mealName}>{dayMeals.lunch.name}</h3>
                  </div>
                </>
              )}
            </div>

            {/* Snack */}
            <div className={styles.mealCard} style={{ background: getMealCardColor('Snack') }}>
              {dayMeals.snack && (
                <>
                  <div className={styles.mealImage}>
                    <img src={dayMeals.snack.image} alt={dayMeals.snack.name} />
                    <button className={styles.checkBtn} onClick={handleComingSoon}>
                      {i18nMessages.mealPlan.checkButton}
                    </button>
                  </div>
                  <div className={styles.mealInfo}>
                    <h3 className={styles.mealName}>{dayMeals.snack.name}</h3>
                  </div>
                </>
              )}
            </div>

            {/* Dinner */}
            <div className={styles.mealCard} style={{ background: getMealCardColor('Dinner') }}>
              {dayMeals.dinner && (
                <>
                  <div className={styles.mealImage}>
                    <img src={dayMeals.dinner.image} alt={dayMeals.dinner.name} />
                    <button className={styles.checkBtn} onClick={handleComingSoon}>
                      {i18nMessages.mealPlan.checkButton}
                    </button>
                  </div>
                  <div className={styles.mealInfo}>
                    <h3 className={styles.mealName}>{dayMeals.dinner.name}</h3>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Promotional Banner */}
      <div className={styles.promoBanner}>
        <div className={styles.promoContent}>
          <div className={styles.promoVeggies}>{i18nMessages.mealPlan.promoBadge}</div>
          <div className={styles.promoText}>
            <p className={styles.promoTitle}>{i18nMessages.mealPlan.promoTitle}</p>
            <p className={styles.promoSubtitle}>{i18nMessages.mealPlan.promoSubtitle}</p>
          </div>
        </div>
        <button className={styles.claimBtn} onClick={handleComingSoon}>
          {i18nMessages.mealPlan.claimCta}
        </button>
      </div>
    </div>
  );
}




