import { useState, useEffect } from 'react';
import styles from './DashboardNew.module.css';
import { api } from '../../services/api';
import type { DailyStatistics } from '../../services/api';
import ProgressChart from './ProgressChart';
import GoalTracker from './GoalTracker';
import StreakBadge from './StreakBadge';
import TrendIndicator from './TrendIndicator';
import { SkeletonStatCard, SkeletonList } from '../../components/Skeleton';
import { EmptyActivities } from '../../components/EmptyState';

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

const MOCK_WEEKLY_DATA = [
  { date: 'Mon', calories: 2100, steps: 8000, workoutMinutes: 45 },
  { date: 'Tue', calories: 1950, steps: 10500, workoutMinutes: 60 },
  { date: 'Wed', calories: 2200, steps: 7500, workoutMinutes: 30 },
  { date: 'Thu', calories: 1800, steps: 9000, workoutMinutes: 50 },
  { date: 'Fri', calories: 2400, steps: 6000, workoutMinutes: 20 },
  { date: 'Sat', calories: 2000, steps: 12000, workoutMinutes: 90 },
  { date: 'Sun', calories: 1900, steps: 4000, workoutMinutes: 0 },
];

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
    icon: '🚶',
    calories: 200,
    duration: '30min',
    status: 'Beginner'
  },
  {
    id: '2',
    name: 'Bodyweight Squats',
    icon: '🏋️',
    calories: 150,
    duration: '20 min',
    status: 'Intermediate'
  },
  {
    id: '3',
    name: 'Dumbbell Squat',
    icon: '💪',
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
  const [dailyStats, setDailyStats] = useState<DailyStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0];
        const [stats, profile] = await Promise.all([
          api.getDailyStatistics(dateStr),
          api.getCurrentUser()
        ]);
        if (import.meta.env.DEV) {
          console.log('📊 Dashboard data:', { stats, profile });
        }
        setDailyStats(stats);
        setUserProfile(profile);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

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

  const goals = [
    {
      id: '1',
      label: 'Calories',
      current: dailyStats?.total_calories || 0,
      target: 2000,
      unit: 'kcal',
      icon: '🔥',
      color: '#FFB84D',
      bgColor: '#FFF5E5'
    },
    {
      id: '2',
      label: 'Steps',
      current: 8050, // Mock data for now
      target: 10000,
      unit: 'steps',
      icon: '👟',
      color: '#A7E9AF',
      bgColor: '#E8F5E9'
    },
    {
      id: '3',
      label: 'Exercise',
      current: dailyStats?.exercise_duration || 0,
      target: 60,
      unit: 'min',
      icon: '⏱️',
      color: '#BAE6FD',
      bgColor: '#E3F2FD'
    }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>

        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.pageTitle}>Dashboard</h1>
            <p className={styles.pageSubtitle}>Welcome back, {userProfile?.name || 'User'}!</p>
          </div>
          <StreakBadge streak={5} />
        </div>

        {/* Stats Overview */}
        <div className={styles.statsGrid}>
          {loading ? (
            <>
              <SkeletonStatCard />
              <SkeletonStatCard />
              <SkeletonStatCard />
              <SkeletonStatCard />
            </>
          ) : (
            <>
              <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #D4F4DD 0%, #A7E9AF 100%)' }}>
                  ⚖️
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statLabel}>Weight</div>
                  <div className={styles.statValue}>
                    {userProfile?.weight_kg ? `${userProfile.weight_kg} kg` : 'N/A'}
                  </div>
                  <TrendIndicator current={userProfile?.weight_kg} previous={userProfile?.weight_kg + 1.5} inverse />
                </div>
                <div className={styles.miniChart}>
                  {[40, 60, 30, 80, 50, 70, 60].map((height, i) => (
                    <div key={i} className={styles.miniBar} style={{ height: `${height}%` }}></div>
                  ))}
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #FFE5B4 0%, #FFD89B 100%)' }}>
                  👣
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statLabel}>Exercise</div>
                  <div className={styles.statValue}>
                    {dailyStats ? `${dailyStats.workouts_count} workouts` : '0 workouts'}
                  </div>
                  <TrendIndicator current={dailyStats?.workouts_count || 0} previous={2} />
                </div>
                <div className={styles.miniChart}>
                  {[50, 70, 40, 90, 60, 80, 70].map((height, i) => (
                    <div key={i} className={styles.miniBar} style={{ height: `${height}%`, background: '#FFD89B' }}></div>
                  ))}
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)' }}>
                  ⏱️
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statLabel}>Exercise Time</div>
                  <div className={styles.statValue}>
                    {dailyStats ? `${dailyStats.exercise_duration} min` : '0 min'}
                  </div>
                  <TrendIndicator current={dailyStats?.exercise_duration || 0} previous={45} />
                </div>
                <div className={styles.miniChart}>
                  {[60, 50, 70, 80, 60, 90, 75].map((height, i) => (
                    <div key={i} className={styles.miniBar} style={{ height: `${height}%`, background: '#BAE6FD' }}></div>
                  ))}
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #FFD4A3 0%, #FFB84D 100%)' }}>
                  🍽️
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statLabel}>Meals Today</div>
                  <div className={styles.statValue}>
                    {dailyStats ? `${dailyStats.meals_count} meals` : '0 meals'}
                  </div>
                </div>
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{
                    width: dailyStats ? `${Math.min((dailyStats.meals_count / 4) * 100, 100)}%` : '0%',
                    background: '#FFB84D'
                  }}></div>
                </div>
                <div className={styles.progressLabel}>{dailyStats?.meals_count || 0} / 4 meals</div>
              </div>
            </>
          )}
        </div>

        {/* Charts Row */}
        <div className={styles.chartsRow}>
          <div className={styles.chartSection}>
            <ProgressChart data={MOCK_WEEKLY_DATA} />
          </div>
          <div className={styles.goalsSection}>
            <GoalTracker goals={goals} />
          </div>
        </div>

        {/* Workout Progress */}
        <div className={styles.workoutSection}>
          <div className={styles.sectionHeader}>
            <h3>Workout Progress</h3>
            <button className={styles.viewAllBtn}>This Week ›</button>
          </div>
          <div className={styles.workoutGrid}>
            <div className={styles.workoutCard} style={{ background: 'linear-gradient(135deg, #D4F4DD 0%, #A7E9AF 100%)' }}>
              <div className={styles.workoutIcon}>🏃</div>
              <div className={styles.workoutInfo}>
                <div className={styles.workoutName}>Running 5 km</div>
                <div className={styles.workoutStats}>75% Unit • Cardio</div>
              </div>
            </div>
            <div className={styles.workoutCard} style={{ background: 'linear-gradient(135deg, #FFE5B4 0%, #FFD89B 100%)' }}>
              <div className={styles.workoutIcon}>🚴</div>
              <div className={styles.workoutInfo}>
                <div className={styles.workoutName}>Squatting 10kg</div>
                <div className={styles.workoutStats}>60% Unit • Strength</div>
              </div>
            </div>
            <div className={styles.workoutCard} style={{ background: 'linear-gradient(135deg, #FFD4A3 0%, #FFB84D 100%)' }}>
              <div className={styles.workoutIcon}>🤸</div>
              <div className={styles.workoutInfo}>
                <div className={styles.workoutName}>Stretching 10 hads</div>
                <div className={styles.workoutStats}>50% Unit • Flexibility</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Menu */}
        <div className={styles.recommendedSection}>
          <div className={styles.sectionHeader}>
            <h3>Recommended Menu</h3>
            <button className={styles.viewAllBtn}>See All ›</button>
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
                    <span className={styles.caloriesIcon}>🔥</span>
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
            <button className={styles.viewAllBtn}>See All ›</button>
          </div>
          <div className={styles.exercisesGrid}>
            {RECOMMENDED_EXERCISES.map(exercise => (
              <div key={exercise.id} className={styles.exerciseCard}>
                <div className={styles.exerciseIcon}>{exercise.icon}</div>
                <div className={styles.exerciseContent}>
                  <h4 className={styles.exerciseName}>{exercise.name}</h4>
                  <div className={styles.exerciseStats}>
                    <span>🔥 {exercise.calories} kcal</span>
                    <span>⏱️ {exercise.duration}</span>
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
              <button>‹</button>
              <button>›</button>
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
                  <span className={styles.mealCalories}>🔥 {meal.calories} kcal</span>
                  <h4 className={styles.mealName}>{meal.name}</h4>
                  <div className={styles.mealMacros}>
                    {meal.protein}g Protein • {meal.carbs}g Carbs • {meal.fat}g Fat
                  </div>
                </div>
                <button className={styles.expandBtn}>›</button>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className={styles.sidebarSection}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sidebarTitle}>Recent Activity</h3>
            <button className={styles.menuBtn}>⋯</button>
          </div>
          <div className={styles.activityList}>
            {RECENT_ACTIVITIES.map(activity => (
              <div key={activity.id} className={styles.activityItem}>
                <div className={styles.activityIcon} style={{
                  background: activity.type === 'achievement' ? '#D4F4DD' :
                    activity.type === 'meal' ? '#FFE5B4' : '#E0F2FE'
                }}>
                  {activity.type === 'achievement' ? '✓' :
                    activity.type === 'meal' ? '🍽️' : '👤'}
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
