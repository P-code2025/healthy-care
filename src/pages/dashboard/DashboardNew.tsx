import { useState, useEffect, useMemo } from 'react';
import styles from './DashboardNew.module.css';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isToday, startOfMonth, endOfMonth } from 'date-fns';
import { api, type User } from '../../services/api';
import weightIcon from '../../assets/weight-svgrepo-com.svg';
import bmiIcon from '../../assets/watch-svgrepo-com.svg';
import calorieIcon from '../../assets/carrot-svgrepo-com.svg';
import exerciseIcon from '../../assets/sneakers-svgrepo-com.svg';
import morningIcon from '../../assets/sun-svgrepo-com.svg';
import afternoonIcon from '../../assets/sun-behind-cloud-svgrepo-com.svg';
import eveningIcon from '../../assets/moon-stars-svgrepo-com.svg';
import snackIcon from '../../assets/muesli-svgrepo-com.svg';
import { Plus } from 'lucide-react';

interface CalendarWidgetProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

const CalendarWidget: React.FC<CalendarWidgetProps> = ({ selectedDate, onDateChange }) => {
  const [viewDate, setViewDate] = useState(new Date());

  const goPrevMonth = () => setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1));
  const goNextMonth = () => setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1));

  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  return (
    <div className={styles.calendarWidget}>
      <div className={styles.calendarHeader}>
        <h3>{format(viewDate, 'MMMM yyyy')}</h3>
        <div className={styles.calendarNav}>
          <button onClick={goPrevMonth}>‹</button>
          <button onClick={goNextMonth}>›</button>
        </div>
      </div>

      <div className={styles.calendarGrid}>
        <div className={styles.weekdays}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
            <div key={index} className={styles.weekday}>{day}</div>
          ))}
        </div>

        <div className={styles.calendarDays}>
          {days.map(date => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const isCurrentMonth = date.getMonth() === viewDate.getMonth();
            const isToday = dateStr === format(new Date(), 'yyyy-MM-dd');
            const isSelected = dateStr === selectedDate;

            return (
              <div
                key={dateStr}
                className={`${styles.calendarDay}
                  ${!isCurrentMonth ? styles.notCurrentMonth : ''}
                  ${isToday ? styles.today : ''}
                  ${isSelected ? styles.selected : ''}
                `}
                onClick={() => isCurrentMonth && onDateChange(dateStr)}
                style={{ cursor: isCurrentMonth ? 'pointer' : 'default' }}
              >
                {isCurrentMonth ? date.getDate() : ''}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};


interface MealItem {
  id: string;
  name: string;
  image?: string;
  imageAttribution?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: string;
  status: 'Breakfast' | 'Lunch' | 'Snack' | 'Dinner';
}

interface DailyStats {
  date: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  calories_burned: number;
}

interface FoodLog {
  log_id: number;
  food_name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  meal_type: string;
  eaten_at: string;
  imageUrl?: string;
}

interface WorkoutLog {
  log_id: number;
  exercise_name: string;
  calories_burned_estimated: number;
  completed_at: string;
}

export default function DashboardNew() {
  const [user, setUser] = useState<User | null>(null);
  const [todayStats, setTodayStats] = useState<DailyStats | null>(null);
  const [todayMeals, setTodayMeals] = useState<MealItem[]>([]);
  const [recentWorkouts, setRecentWorkouts] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const today = format(new Date(), 'yyyy-MM-dd');
  const now = new Date();

  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const startDate = startOfWeek(firstDayOfMonth, { weekStartsOn: 0 });
  const endDate = endOfWeek(lastDayOfMonth, { weekStartsOn: 0 });

  const days = eachDayOfInterval({ start: startDate, end: endDate })
    .map(date => {
      const day = date.getDate();
      const month = date.getMonth();
      return month === now.getMonth() ? day : null;
    });

  const SafeMealImage = ({ src, alt }: { src?: string; alt: string }) => {


    return (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={styles.menuImageImg}
      />
    );
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [userRes, statsRes, mealsRes, workoutRes] = await Promise.all([
          api.getCurrentUser(),
          api.getDailyStatistics(selectedDate),
          api.getFoodLog().then((logs: FoodLog[]) =>
            logs.filter(log => format(new Date(log.eaten_at), 'yyyy-MM-dd') === selectedDate)
          ),
          api.getWorkoutLog().then((allLogs: WorkoutLog[]) => {
            const logsForDate = allLogs
              .filter(log => {
                const logDate = format(new Date(log.completed_at), 'yyyy-MM-dd');
                return logDate === selectedDate;
              })
              .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())
              .slice(0, 5);
            return logsForDate;
          }),
        ]);

        setUser(userRes);
        setTodayStats(statsRes);
        setRecentWorkouts(workoutRes);

        const mappedMeals: MealItem[] = mealsRes.map(log => ({
          id: String(log.log_id),
          name: log.food_name,
          image: log.imageUrl || '/images/meal/default-meal.jpg',
          calories: log.calories,
          protein: Math.round(log.protein_g),
          carbs: Math.round(log.carbs_g),
          fat: Math.round(log.fat_g),
          time: format(new Date(log.eaten_at), 'h:mm a'),
          status: log.meal_type as any,
        }));

        mappedMeals.sort((a, b) => a.time.localeCompare(b.time));
        setTodayMeals(mappedMeals);
      } catch (err) {
        console.error('Lỗi load dữ liệu:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [selectedDate]);

  const bmi = user?.weight_kg && user?.height_cm
    ? Number((user.weight_kg / ((user.height_cm / 100) ** 2)).toFixed(1))
    : 0;

  const tdee = useMemo(() => {
    if (!user?.weight_kg || !user?.height_cm || !user?.age || !user?.gender) return 2500;

    const weight = user.weight_kg;
    const height = user.height_cm;
    const age = user.age || 25;
    const gender = user.gender || 'male';

    const bmr = gender === 'male'
      ? 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
      : 447.593 + (9.247 * weight) + (3.098 * height) - (4.33 * age);

    return Math.round(bmr * 1.55);
  }, [user]);

  const calorieIntakePercent = todayStats?.total_calories
    ? Math.min(100, Math.round((todayStats.total_calories / tdee) * 100))
    : 0;

  const macroCalories = {
    protein: (todayStats?.total_protein || 0) * 4,
    carbs: (todayStats?.total_carbs || 0) * 4,
    fat: (todayStats?.total_fat || 0) * 9,
  };
  const totalEatenCalories = macroCalories.protein + macroCalories.carbs + macroCalories.fat;

  const proteinPct = totalEatenCalories ? (macroCalories.protein / totalEatenCalories) * 100 : 0;
  const carbsPct = totalEatenCalories ? (macroCalories.carbs / totalEatenCalories) * 100 : 0;
  const fatPct = totalEatenCalories ? (macroCalories.fat / totalEatenCalories) * 100 : 0;

  const circumference = 2 * Math.PI * 80;

  if (loading) {
    return (
      <div className={styles.container}>
        <div className="flex items-center justify-center h-screen">
          <div className="text-xl">Đang tải dữ liệu cá nhân...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div
              className={styles.statIcon}
            >
              <img className={styles.statIcon} src={weightIcon} alt="weight" />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statLabel}>Weight </div>
              <div className={styles.statValue}>{user?.weight_kg || '--'} kg</div>
            </div>
            <div className={styles.miniChart}>
              {[60, 70, 65, 78, 76, 78, 77].map((h, i) => (
                <div key={i} className={styles.miniBar} style={{ height: `${h}%` }}></div>
              ))}
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <img className={styles.statIcon} src={bmiIcon} alt="bmi" />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statLabel}>BMI</div>
              <div className={styles.statValue}>{bmi || '--'}</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <img className={styles.statIcon} src={calorieIcon} alt="calories" />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statLabel}>Calories Today</div>
              <div className={styles.statValue}>{todayStats?.total_calories || 0}</div>
            </div>
          </div>
        </div>

        <div className={styles.chartsRow}>
          <div className={styles.chartCard}>
            <div className={styles.cardHeader}>
              <h3>Weight Progress</h3>
            </div>
            <div className={styles.donutChartContainer}>
              <svg viewBox="0 0 200 200" className={styles.donutChart}>
                <circle cx="100" cy="100" r="70" fill="none" stroke="#F3F4F6" strokeWidth="28" />
                <circle cx="100" cy="100" r="70" fill="none" stroke="#10b981" strokeWidth="28"
                  strokeDasharray={`${(user?.weight_kg || 80) * 4.4} 440`}
                  transform="rotate(-90 100 100)" />
                <text x="100" y="95" textAnchor="middle" fontSize="36" fontWeight="700" fill="#1a1a1a">
                  {user?.weight_kg || '--'}
                </text>
                <text x="100" y="115" textAnchor="middle" fontSize="14" fill="#6B7280">kg</text>
              </svg>
            </div>
            <p className={styles.chartNote}>
              {user?.goal === 'lose_weight' ? 'You are on a weight loss journey. Keep it up!' : 'Never give up! Keep going!'}
            </p>
          </div>

          <div className={styles.chartCard}>
            <div className={styles.cardHeader}>
              <h3>Nutrition Distribution Today</h3>
              <div className="text-sm text-gray-500">
                TDEE: <strong>{tdee}</strong> kcal
              </div>
            </div>

            <div className={styles.caloriesChart}>
              <div className={styles.caloriesDonut}>
                <svg viewBox="0 0 200 200" className={styles.macroDonut}>
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#F3F4F6" strokeWidth="36" />

                  <circle
                    cx="100" cy="100" r="80"
                    fill="none" stroke="#FCA5A5" strokeWidth="36"
                    strokeDasharray={`${(fatPct / 100) * circumference} ${circumference}`}
                    strokeDashoffset={0}
                    transform="rotate(-90 100 100)"
                    className={styles.macroRing}
                  />

                  <circle
                    cx="100" cy="100" r="80"
                    fill="none" stroke="#FFB84D" strokeWidth="36"
                    strokeDasharray={`${(carbsPct / 100) * circumference} ${circumference}`}
                    strokeDashoffset={-(fatPct / 100) * circumference}
                    transform="rotate(-90 100 100)"
                    className={styles.macroRing}
                  />

                  <circle
                    cx="100" cy="100" r="80"
                    fill="none" stroke="#10b981" strokeWidth="36"
                    strokeDasharray={`${(proteinPct / 100) * circumference} ${circumference}`}
                    strokeDashoffset={-((fatPct + carbsPct) / 100) * circumference}
                    transform="rotate(-90 100 100)"
                    className={styles.macroRing}
                  />

                  <text x="100" y="85" textAnchor="middle" fontSize="32" fontWeight="700" fill="#1a1a1a">
                    {todayStats?.total_calories || 0}
                  </text>
                  <text x="100" y="110" textAnchor="middle" fontSize="13" fill="#6B7280">
                    {calorieIntakePercent}% of TDEE
                  </text>
                </svg>
              </div>

              <div className={styles.caloriesBreakdown}>
                <div className={styles.breakdownItem}>
                  <div className={styles.breakdownLabel}>
                    <span className={styles.breakdownDot} style={{ background: '#10b981' }}></span>
                    <span>Protein</span>
                  </div>
                  <div className={styles.breakdownBar}>
                    <div className={styles.breakdownFill} style={{ width: `${Math.min(100, (todayStats?.total_protein || 0) / 2)}%`, background: '#10b981' }}></div>
                  </div>
                  <span className={styles.breakdownValue}>{Math.round(todayStats?.total_protein || 0)}g</span>
                </div>

                <div className={styles.breakdownItem}>
                  <div className={styles.breakdownLabel}>
                    <span className={styles.breakdownDot} style={{ background: '#FFB84D' }}></span>
                    <span>Carbs</span>
                  </div>
                  <div className={styles.breakdownBar}>
                    <div className={styles.breakdownFill} style={{ width: `${Math.min(100, (todayStats?.total_carbs || 0) / 4)}%`, background: '#FFB84D' }}></div>
                  </div>
                  <span className={styles.breakdownValue}>{Math.round(todayStats?.total_carbs || 0)}g</span>
                </div>

                <div className={styles.breakdownItem}>
                  <div className={styles.breakdownLabel}>
                    <span className={styles.breakdownDot} style={{ background: '#FCA5A5' }}></span>
                    <span>Fat</span>
                  </div>
                  <div className={styles.breakdownBar}>
                    <div className={styles.breakdownFill} style={{ width: `${Math.min(100, (todayStats?.total_fat || 0) / 1)}%`, background: '#FCA5A5' }}></div>
                  </div>
                  <span className={styles.breakdownValue}>{Math.round(todayStats?.total_fat || 0)}g </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.workoutSection}>
          <div className={styles.sectionHeader}>
            <h3>Recent Workouts</h3>
          </div>
          <div className={styles.workoutGrid}>
            {recentWorkouts.length > 0 ? (
              recentWorkouts.map(w => (
                <div key={w.log_id} className={styles.workoutCard} style={{ background: 'linear-gradient(135deg, #D4F4DD 0%, #A7E9AF 100%)' }}>
                  <img className={styles.statIcon} src={exerciseIcon} alt="exercise" />
                  <div className={styles.workoutInfo}>
                    <div className={styles.workoutName}>{w.exercise_name}</div>
                    <div className={styles.workoutStats}>Burn {w.calories_burned_estimated} kcal</div>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.emptyStateCard}>
                <p className="text-lg font-medium text-gray-700 mt-4">No exercises today</p>
                <p className="text-sm text-gray-500 mb-6">Start your workout journey now!</p>
                <a href="/exercises" className={styles.primaryButton}>
                  <Plus className="w-5 h-5" />
                  Add your first exercise
                </a>
              </div>
            )}
          </div>
        </div>

        <div className={styles.recommendedSection}>
          <div className={styles.sectionHeader}>
            <h3>Today's Meals</h3>
          </div>
          <div className={styles.mealsGrid}>
            {todayMeals.length > 0 ? (
              todayMeals.map((meal) => (
                <div key={meal.id} className={styles.mealCardModern}>
                  <div className={styles.mealCardHeader}>
                    <div className={styles.mealTypeBadge} data-type={meal.status}>
                      <span>
                        {meal.status === 'Breakfast' && <img className={styles.mealIcon} src={morningIcon} alt="Breakfast" />}
                        {meal.status === 'Lunch' && <img className={styles.mealIcon} src={afternoonIcon} alt="Lunch" />}
                        {meal.status === 'Snack' && <img className={styles.mealIcon} src={snackIcon} alt="Snack" />}
                        {meal.status === 'Dinner' && <img className={styles.mealIcon} src={eveningIcon} alt="Dinner" />}
                      </span>
                      <span>{meal.status}</span>
                    </div>
                    <div className={styles.mealTime}>{meal.time}</div>
                  </div>

                  <div className={styles.mealCardBody}>
                    <h4 className={styles.mealName}>{meal.name}</h4>
                    <div className={styles.mealCaloriesBig}>
                      {meal.calories.toLocaleString()} kcal
                    </div>
                  </div>

                  <div className={styles.mealMacrosGrid}>
                    <div className={styles.macroItem}>
                      <span className={styles.macroLabel}>Protein</span>
                      <span className={styles.macroValueProtein}>{meal.protein}g</span>
                    </div>
                    <div className={styles.macroItem}>
                      <span className={styles.macroLabel}>Carbs</span>
                      <span className={styles.macroValueCarbs}>{meal.carbs}g</span>
                    </div>
                    <div className={styles.macroItem}>
                      <span className={styles.macroLabel}>Fat</span>
                      <span className={styles.macroValueFat}>{meal.fat}g</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.emptyStateCard}>
                <p className="text-lg font-medium text-gray-700 mt-4">No exercises today</p>
                <p className="text-sm text-gray-500 mb-6">Track your nutrition to reach your goals faster!</p>
                <a href="/food-diary" className={styles.primaryButton}>
                  <Plus className="w-5 h-5" />
                  Log your first meal
                </a>
              </div>
            )}
          </div>
        </div>

      </div>

      <div className={styles.rightSidebar}>
        <CalendarWidget selectedDate={selectedDate} onDateChange={setSelectedDate} />

        <div className={styles.sidebarSection}>
          <h3 className={styles.sidebarTitle}>Today's Meals</h3>
          <div className={styles.mealsListModern}>
            {todayMeals.length > 0 ? (
              todayMeals.map((meal) => (
                <div key={meal.id} className={styles.mealItemModern}>
                  <div data-type={meal.status}>
                    {meal.status === 'Breakfast' && <img className={styles.mealIconSmall} src={morningIcon} alt="Breakfast" />}
                    {meal.status === 'Lunch' && <img className={styles.mealIconSmall} src={afternoonIcon} alt="Lunch" />}
                    {meal.status === 'Snack' && <img className={styles.mealIconSmall} src={snackIcon} alt="Snack" />}
                    {meal.status === 'Dinner' && <img className={styles.mealIconSmall} src={eveningIcon} alt="Dinner" />}
                  </div>
                  <div className={styles.mealInfoCompact}>
                    <div className={styles.mealHeaderLine}>
                      <span className={styles.mealNameCompact}>{meal.name}</span>
                      <span className={styles.mealTimeSmall}>{meal.time}</span>
                    </div>
                    <div className={styles.mealMacrosCompact}>
                      <span>P {meal.protein}g</span>
                      <span>C {meal.carbs}g</span>
                      <span>F {meal.fat}g</span>
                      <span className={styles.caloriesSmall}>• {meal.calories} kcal</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8 text-sm">No meals yet today</p>
            )}
          </div>
        </div>

        <div className={styles.sidebarSection}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sidebarTitle}>Recent Activity</h3>
          </div>
          <div className={styles.activityList}>
            {recentWorkouts.map(w => (
              <div key={w.log_id} className={styles.activityItem}>
                <div className={styles.activityIcon} style={{ background: '#D4F4DD' }}>✓</div>
                <div className={styles.activityContent}>
                  <div className={styles.activityTime}>
                    {format(new Date(w.completed_at), 'h:mm a')}
                  </div>
                  <div className={styles.activityText}>
                    Completed: {w.exercise_name} – burned {w.calories_burned_estimated} kcal
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}