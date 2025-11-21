import { useState } from 'react';
import styles from './DashboardNew.module.css';

interface MealItem {
  id: string;
  name: string;
  image: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: string;
  status: 'Breakfast' | 'Lunch' | 'Snack' | 'Dinner';
}

interface Exercise {
  id: string;
  name: string;
  icon: string;
  calories: number;
  duration: string;
  status: 'Beginner' | 'Intermediate' | 'Advanced';
}

interface Activity {
  id: string;
  time: string;
  text: string;
  user: string;
  type: 'achievement' | 'update' | 'meal';
}

const TODAYS_MEALS: MealItem[] = [
  {
    id: '1',
    name: 'Scrambled Eggs with Spinach & Whole Grain Toast',
    image: '/images/meal-plan/scrambled-eggs.jpg',
    calories: 300,
    protein: 25,
    carbs: 30,
    fat: 12,
    time: '8:00 AM',
    status: 'Breakfast'
  },
  {
    id: '2',
    name: 'Grilled Chicken Salad with Avocado and Quinoa',
    image: '/images/meal-plan/grilled-salmon.jpg',
    calories: 450,
    protein: 35,
    carbs: 25,
    fat: 20,
    time: '1:00 PM',
    status: 'Lunch'
  },
  {
    id: '3',
    name: 'Greek Yogurt with Mixed Berries and Almonds',
    image: '/images/grocery/greek-yogurt.jpg',
    calories: 200,
    protein: 15,
    carbs: 18,
    fat: 8,
    time: '4:00 PM',
    status: 'Snack'
  },
  {
    id: '4',
    name: 'Grilled Salmon with Sweet Potato and Green Beans',
    image: '/images/meal-plan/grilled-salmon.jpg',
    calories: 500,
    protein: 40,
    carbs: 35,
    fat: 18,
    time: '7:00 PM',
    status: 'Dinner'
  }
];

const RECOMMENDED_MENU: MealItem[] = [
  {
    id: '5',
    name: 'Oatmeal with Almond Butter and Berries',
    image: '/images/meal-plan/oatmeal.jpg',
    calories: 280,
    protein: 12,
    carbs: 40,
    fat: 10,
    time: '',
    status: 'Breakfast'
  },
  {
    id: '6',
    name: 'Grilled Chicken Wrap with Avocado and Spinach',
    image: '/images/meal-plan/chicken-wrap.jpg',
    calories: 420,
    protein: 35,
    carbs: 30,
    fat: 18,
    time: '',
    status: 'Lunch'
  }
];

const RECOMMENDED_EXERCISES: Exercise[] = [
  {
    id: '1',
    name: 'Brisk Walking',
    icon: '≡ƒÜ╢',
    calories: 200,
    duration: '30min',
    status: 'Beginner'
  },
  {
    id: '2',
    name: 'Bodyweight Squats',
    icon: '≡ƒÅï∩╕Å',
    calories: 150,
    duration: '20 min',
    status: 'Intermediate'
  },
  {
    id: '3',
    name: 'Dumbbell Squat',
    icon: '≡ƒÆ¬',
    calories: 180,
    duration: '25 min',
    status: 'Advanced'
  }
];

const RECENT_ACTIVITIES: Activity[] = [
  {
    id: '1',
    time: '10 AM',
    text: 'Notification sent: Congratulations! You\'ve reached 75% of your cardio endurance goal.',
    user: 'System',
    type: 'achievement'
  },
  {
    id: '2',
    time: '9 AM',
    text: 'Liesha Matthew completed her 3rd stretching routine in flexibility endurance training.',
    user: 'Liesha Matthew',
    type: 'update'
  },
  {
    id: '3',
    time: '8 AM',
    text: 'Carllo gramps updated - "I\'ll km morning! Ready to start the day with an endurance improvement."',
    user: 'Carllo Gramps',
    type: 'update'
  },
  {
    id: '4',
    time: '7 AM',
    text: 'Liesha Matthew logged her lunch meal: Grilled Chicken Wrap with Avocado and Spinach - 420 kcal.',
    user: 'Liesha Matthew',
    type: 'meal'
  }
];

export default function DashboardNew() {
  const [currentDate] = useState(new Date());
  const currentMonth = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Calendar data
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const days = getDaysInMonth();
  const today = currentDate.getDate();

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>

        {/* Stats Overview */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #D4F4DD 0%, #A7E9AF 100%)' }}>
              ΓÜû∩╕Å
            </div>
            <div className={styles.statContent}>
              <div className={styles.statLabel}>Weight</div>
              <div className={styles.statValue}>78 kg</div>
            </div>
            <div className={styles.miniChart}>
              {[40, 60, 30, 80, 50, 70, 60].map((height, i) => (
                <div key={i} className={styles.miniBar} style={{ height: `${height}%` }}></div>
              ))}
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #FFE5B4 0%, #FFD89B 100%)' }}>
              ≡ƒæú
            </div>
            <div className={styles.statContent}>
              <div className={styles.statLabel}>Steps</div>
              <div className={styles.statValue}>8,000</div>
            </div>
            <div className={styles.miniChart}>
              {[50, 70, 40, 90, 60, 80, 70].map((height, i) => (
                <div key={i} className={styles.miniBar} style={{ height: `${height}%`, background: '#FFD89B' }}></div>
              ))}
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)' }}>
              ≡ƒÿ┤
            </div>
            <div className={styles.statContent}>
              <div className={styles.statLabel}>Sleep</div>
              <div className={styles.statValue}>6.5 hrs</div>
            </div>
            <div className={styles.miniChart}>
              {[60, 50, 70, 80, 60, 90, 75].map((height, i) => (
                <div key={i} className={styles.miniBar} style={{ height: `${height}%`, background: '#BAE6FD' }}></div>
              ))}
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #FFD4A3 0%, #FFB84D 100%)' }}>
              ≡ƒÆº
            </div>
            <div className={styles.statContent}>
              <div className={styles.statLabel}>Water Intake</div>
              <div className={styles.statValue}>1.5 L</div>
            </div>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: '75%', background: '#FFB84D' }}></div>
            </div>
            <div className={styles.progressLabel}>1,312 mL</div>
          </div>
        </div>

        {/* Charts Row */}
        <div className={styles.chartsRow}>
          {/* Weight Data */}
          <div className={styles.chartCard}>
            <div className={styles.cardHeader}>
              <h3>Weight Data</h3>
              <button className={styles.menuBtn}>Γï»</button>
            </div>
            <div className={styles.donutChartContainer}>
              <svg viewBox="0 0 200 200" className={styles.donutChart}>
                <circle cx="100" cy="100" r="70" fill="none" stroke="#FFE5B4" strokeWidth="28"/>
                <circle cx="100" cy="100" r="70" fill="none" stroke="#FFB84D" strokeWidth="28" 
                  strokeDasharray="308 440" strokeDashoffset="0" transform="rotate(-90 100 100)"/>
                <text x="100" y="95" textAnchor="middle" fontSize="36" fontWeight="700" fill="#1a1a1a">78</text>
                <text x="100" y="115" textAnchor="middle" fontSize="14" fill="#6B7280">kg</text>
              </svg>
              <div className={styles.donutLegend}>
                <div className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: '#FFB84D' }}></span>
                  <span>Progress</span>
                </div>
                <div className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: '#FFE5B4' }}></span>
                  <span>85 kg left</span>
                </div>
              </div>
            </div>
            <p className={styles.chartNote}>
              Progress is progress, no matter how slow. Keep going, you're getting closer to your goal every day.
            </p>
          </div>

          {/* Calories Intake */}
          <div className={styles.chartCard}>
            <div className={styles.cardHeader}>
              <h3>Calories Intake</h3>
              <button className={styles.menuBtn}>Γï»</button>
            </div>
            <div className={styles.caloriesChart}>
              <div className={styles.caloriesDonut}>
                <svg viewBox="0 0 200 200">
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#F3F4F6" strokeWidth="24"/>
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#FFB84D" strokeWidth="24"
                    strokeDasharray="377 503" strokeDashoffset="0" transform="rotate(-90 100 100)"/>
                  <text x="100" y="95" textAnchor="middle" fontSize="32" fontWeight="700" fill="#1a1a1a">1240</text>
                  <text x="100" y="115" textAnchor="middle" fontSize="14" fill="#6B7280">kcal</text>
                </svg>
              </div>
              <div className={styles.caloriesBreakdown}>
                <div className={styles.breakdownItem}>
                  <div className={styles.breakdownLabel}>
                    <span className={styles.breakdownDot} style={{ background: '#FFB84D' }}></span>
                    <span>Carbohydrates</span>
                  </div>
                  <div className={styles.breakdownBar}>
                    <div className={styles.breakdownFill} style={{ width: '37%', background: '#FFB84D' }}></div>
                  </div>
                  <span className={styles.breakdownValue}>120 mg</span>
                  <span className={styles.breakdownPercent}>37%</span>
                </div>
                <div className={styles.breakdownItem}>
                  <div className={styles.breakdownLabel}>
                    <span className={styles.breakdownDot} style={{ background: '#A7E9AF' }}></span>
                    <span>Proteins</span>
                  </div>
                  <div className={styles.breakdownBar}>
                    <div className={styles.breakdownFill} style={{ width: '53%', background: '#A7E9AF' }}></div>
                  </div>
                  <span className={styles.breakdownValue}>70 mg</span>
                  <span className={styles.breakdownPercent}>53%</span>
                </div>
                <div className={styles.breakdownItem}>
                  <div className={styles.breakdownLabel}>
                    <span className={styles.breakdownDot} style={{ background: '#FFD89B' }}></span>
                    <span>Fats</span>
                  </div>
                  <div className={styles.breakdownBar}>
                    <div className={styles.breakdownFill} style={{ width: '45%', background: '#FFD89B' }}></div>
                  </div>
                  <span className={styles.breakdownValue}>20 mg</span>
                  <span className={styles.breakdownPercent}>45%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Workout Progress */}
        <div className={styles.workoutSection}>
          <div className={styles.sectionHeader}>
            <h3>Workout Progress</h3>
            <button className={styles.viewAllBtn}>This Week ΓÇ║</button>
          </div>
          <div className={styles.workoutGrid}>
            <div className={styles.workoutCard} style={{ background: 'linear-gradient(135deg, #D4F4DD 0%, #A7E9AF 100%)' }}>
              <div className={styles.workoutIcon}>≡ƒÅâ</div>
              <div className={styles.workoutInfo}>
                <div className={styles.workoutName}>Running 5 km</div>
                <div className={styles.workoutStats}>75% Unit ΓÇó Cardio</div>
              </div>
            </div>
            <div className={styles.workoutCard} style={{ background: 'linear-gradient(135deg, #FFE5B4 0%, #FFD89B 100%)' }}>
              <div className={styles.workoutIcon}>≡ƒÜ┤</div>
              <div className={styles.workoutInfo}>
                <div className={styles.workoutName}>Squatting 10kg</div>
                <div className={styles.workoutStats}>60% Unit ΓÇó Strength</div>
              </div>
            </div>
            <div className={styles.workoutCard} style={{ background: 'linear-gradient(135deg, #FFD4A3 0%, #FFB84D 100%)' }}>
              <div className={styles.workoutIcon}>≡ƒñ╕</div>
              <div className={styles.workoutInfo}>
                <div className={styles.workoutName}>Stretching 10 hads</div>
                <div className={styles.workoutStats}>50% Unit ΓÇó Flexibility</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Menu */}
        <div className={styles.recommendedSection}>
          <div className={styles.sectionHeader}>
            <h3>Recommended Menu</h3>
            <button className={styles.viewAllBtn}>See All ΓÇ║</button>
          </div>
          <div className={styles.menuGrid}>
            {RECOMMENDED_MENU.map(meal => (
              <div key={meal.id} className={styles.menuCard}>
                <div className={styles.menuImage}>
                  <img src={meal.image} alt={meal.name} />
                  <span className={styles.menuBadge} style={{
                    background: meal.status === 'Breakfast' ? '#D4F4DD' : '#FFE5B4'
                  }}>
                    {meal.status}
                  </span>
                </div>
                <div className={styles.menuContent}>
                  <div className={styles.menuCalories}>
                    <span className={styles.caloriesIcon}>≡ƒöÑ</span>
                    {meal.calories} kcal
                  </div>
                  <h4 className={styles.menuTitle}>{meal.name}</h4>
                  <div className={styles.menuMacros}>
                    High in fiber and antioxidants, promoting digestive health and reducing inflammation...
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Exercises */}
        <div className={styles.recommendedSection}>
          <div className={styles.sectionHeader}>
            <h3>Recommended Exercises</h3>
            <button className={styles.viewAllBtn}>See All ΓÇ║</button>
          </div>
          <div className={styles.exercisesGrid}>
            {RECOMMENDED_EXERCISES.map(exercise => (
              <div key={exercise.id} className={styles.exerciseCard}>
                <div className={styles.exerciseIcon}>{exercise.icon}</div>
                <div className={styles.exerciseContent}>
                  <h4 className={styles.exerciseName}>{exercise.name}</h4>
                  <div className={styles.exerciseStats}>
                    <span>≡ƒöÑ {exercise.calories} kcal</span>
                    <span>ΓÅ▒∩╕Å {exercise.duration}</span>
                  </div>
                  <span className={`${styles.exerciseBadge} ${styles[exercise.status.toLowerCase()]}`}>
                    {exercise.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Right Sidebar */}
      <div className={styles.rightSidebar}>
        {/* Calendar Widget */}
        <div className={styles.calendarWidget}>
          <div className={styles.calendarHeader}>
            <h3>{currentMonth}</h3>
            <div className={styles.calendarNav}>
              <button>ΓÇ╣</button>
              <button>ΓÇ║</button>
            </div>
          </div>
          <div className={styles.calendarGrid}>
            <div className={styles.weekdays}>
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                <div key={i} className={styles.weekday}>{day}</div>
              ))}
            </div>
            <div className={styles.calendarDays}>
              {days.map((day, i) => (
                <div 
                  key={i} 
                  className={`${styles.calendarDay} ${day === today ? styles.today : ''} ${day === 5 ? styles.selected : ''}`}
                >
                  {day || ''}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Today's Meals */}
        <div className={styles.sidebarSection}>
          <h3 className={styles.sidebarTitle}>September 2025</h3>
          <div className={styles.mealsList}>
            {TODAYS_MEALS.map(meal => (
              <div key={meal.id} className={styles.mealItem}>
                <div className={styles.mealImage}>
                  <img src={meal.image} alt={meal.name} />
                </div>
                <div className={styles.mealInfo}>
                  <span className={styles.mealBadge} style={{
                    background: meal.status === 'Breakfast' ? '#D4F4DD' :
                              meal.status === 'Lunch' ? '#FFE5B4' :
                              meal.status === 'Snack' ? '#FFD4A3' : '#BAE6FD'
                  }}>
                    {meal.status}
                  </span>
                  <span className={styles.mealCalories}>≡ƒöÑ {meal.calories} kcal</span>
                  <h4 className={styles.mealName}>{meal.name}</h4>
                  <div className={styles.mealMacros}>
                    {meal.protein}g Protein ΓÇó {meal.carbs}g Carbs ΓÇó {meal.fat}g Fat
                  </div>
                </div>
                <button className={styles.expandBtn}>ΓÇ║</button>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className={styles.sidebarSection}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sidebarTitle}>Recent Activity</h3>
            <button className={styles.menuBtn}>Γï»</button>
          </div>
          <div className={styles.activityList}>
            {RECENT_ACTIVITIES.map(activity => (
              <div key={activity.id} className={styles.activityItem}>
                <div className={styles.activityIcon} style={{
                  background: activity.type === 'achievement' ? '#D4F4DD' :
                            activity.type === 'meal' ? '#FFE5B4' : '#E0F2FE'
                }}>
                  {activity.type === 'achievement' ? 'Γ£ô' :
                   activity.type === 'meal' ? '≡ƒì╜∩╕Å' : '≡ƒæñ'}
                </div>
                <div className={styles.activityContent}>
                  <div className={styles.activityTime}>{activity.time}</div>
                  <div className={styles.activityText}>{activity.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
