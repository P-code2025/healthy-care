import { useState, useEffect, useMemo } from 'react';
import {
  Play,
  Heart,
  Clock,
  Flame,
  Search,
  X,
  Loader2,
  Plus,
} from 'lucide-react';
import styles from './ExercisesNew.module.css';
import YouTubePlayer from '../../components/YouTubePlayer';
import { SAMPLE_WORKOUT_PLANS, type WorkoutPlan } from './workoutPlans';
import { generateAIExercisePlan, type AIExercisePlan } from '../../services/aiExercisePlan';
import type { FoodEntry } from '../../lib/types';
import { foodDiaryApi, mapFoodLogToEntry } from '../../services/foodDiaryApi';
import { useAuth } from '../../context/AuthContext';
import { determineGoalIntent, getGoalWeightFromUser } from '../../utils/profile';
import { saveWorkoutLog, getProgressStats } from '../../services/progressTracker';
import { toast } from 'react-toastify';
import { logWorkout } from '../../services/api/workoutApi';
import { api } from '../../services/api';

const TABS = ['All', 'Personalized', 'Saved', 'History'] as const;
type TabType = typeof TABS[number];
type LocalProfile = {
  age: number;
  gender: string;
  height: number;
  weight: number;
  goalWeight: number;
  workoutPreference: string[];
};

export default function ExercisesNew() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('Personalized');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<WorkoutPlan | null>(null);
  const [todayWorkoutSequence, setTodayWorkoutSequence] = useState<WorkoutPlan[]>([]);
  const [savedPlans, setSavedPlans] = useState<Set<string>>(new Set(['2', '5']));
  const [plans, setPlans] = useState<WorkoutPlan[]>(SAMPLE_WORKOUT_PLANS);
  const [userProfile, setUserProfile] = useState<LocalProfile | null>(null);
  const [dailyCalories, setDailyCalories] = useState(0);
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [todayBurnedCalories, setTodayBurnedCalories] = useState(0);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customActivity, setCustomActivity] = useState({
    name: "",
    duration: 0,
    kcal: 0,
  });
  const logQuickActivity = async (name: string, duration: number, kcal: number) => {
    try {
      await saveWorkoutLog({
        date: new Date().toISOString().split('T')[0],
        workoutName: name,
        duration,
        caloriesBurned: kcal,
        exercises: [],
      });
      setTodayBurnedCalories(prev => prev + kcal);
      toast.success(`Logged: ${name} → +${kcal} kcal`);
    } catch (err) {
      toast.error("Save workout failed. Please try again.");
    }
  };


  const [aiPlan, setAiPlan] = useState<AIExercisePlan>(() => {
    return {
      summary: "AI is preparing a personalized plan for you...",
      intensity: 'moderate',
      exercises: [],
      totalBurnEstimate: "0 kcal",
      advice: "Please hold on for a moment.",
    };
  });
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  useEffect(() => {
    if (!user) return;
    const weight = user.weight_kg || 0;
    const goalWeight = getGoalWeightFromUser(user);
    setUserProfile({
      age: user.age || 0,
      gender: user.gender || 'Male',
      height: user.height_cm ?? 0,
      weight: weight,
      goalWeight: goalWeight,
      workoutPreference: Object.entries(user.exercise_preferences || {})
        .filter(([_, v]) => v)
        .map(([k, _]) => k as "yoga" | "gym" | "cardio"),
    });
  }, [user]);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const loadEntries = async () => {
      try {
        const logs = await foodDiaryApi.list({ start: today, end: today });
        setFoodEntries(logs.map(mapFoodLogToEntry));
      } catch (err) {
        console.error('Failed to load food diary for exercises', err);
      }
    };
    loadEntries();
  }, []);

  useEffect(() => {
    const loadTodayWorkouts = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const logs = await api.getWorkoutLog({ start: today, end: today });

        const totalBurned = logs.reduce((sum: number, log: any) =>
          sum + (log.calories_burned_estimated || log.caloriesBurnedEstimated || 0), 0
        );

        setTodayBurnedCalories(totalBurned);
      } catch (err) {
        console.error('Failed to load today workouts', err);
      }
    };

    loadTodayWorkouts();
  }, []);

  useEffect(() => {
    const total = foodEntries.reduce((sum, entry) => sum + entry.calories, 0);
    setDailyCalories(total);
  }, [foodEntries]);

  const analysis = useMemo(() => {
    if (!userProfile || dailyCalories === 0) return null;

    const { weight, height, age, gender, goalWeight } = userProfile;
    if (!weight || !height || !age || !gender) return null;

    const bmi = weight / ((height / 100) ** 2);
    const bmr = gender === 'male'
      ? 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age
      : 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age;

    const tdee = Math.round(bmr * 1.55);
    const isLosing = goalWeight < weight;
    const desiredDailyDeficit = isLosing ? 750 : 0;  
    const currentDeficit = tdee - dailyCalories;
    const recommendedBurn = isLosing
      ? Math.max(0, desiredDailyDeficit - currentDeficit + 200) 
      : 200; 
    const deficitPct = Math.min(100, Math.round((recommendedBurn / tdee) * 100));

    return {
      bmi: bmi.toFixed(1),
      tdee,
      recommendedBurn: Math.round(recommendedBurn),
      deficitPct,
    };
  }, [userProfile, dailyCalories]);

  useEffect(() => {
    if (activeTab !== 'Personalized' || !analysis || !userProfile) return;

    const profileKey = `${userProfile.age}_${userProfile.gender}_${userProfile.weight}_${userProfile.height}_${userProfile.goalWeight}`;
    const cacheKey = `aiPlan_daily_${new Date().toDateString()}_${dailyCalories}_${profileKey.substring(0, 50)}`;

    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      console.log("USING DAILY AI CACHE:", cacheKey);
      setAiPlan(JSON.parse(cached));
      return;
    }

    const fetchAI = async () => {
      setIsLoadingAI(true);

      const availablePlanNames = SAMPLE_WORKOUT_PLANS.map(p => p.title);

      const result = await generateAIExercisePlan(
        dailyCalories,
        {
          age: userProfile.age,
          gender: userProfile.gender,
          weight: userProfile.weight,
          height: userProfile.height,
          goalWeight: userProfile.goalWeight,
          goal: userProfile.goalWeight < userProfile.weight ? 'lose' : 'maintain',
          foodEntries,
          workoutPreference: userProfile.workoutPreference || []
        },
        availablePlanNames,
        "Generate today's workout plan",
        'daily' 
      );

      setAiPlan(result);
      localStorage.setItem(cacheKey, JSON.stringify(result));

      setIsLoadingAI(false);
    };

    fetchAI();
  }, [activeTab, analysis, userProfile, dailyCalories, foodEntries]);

  const filteredPlans = useMemo(() => {
    let filtered = plans;

    if (activeTab === 'Saved') {
      filtered = filtered.filter(p => savedPlans.has(p.id));
    }
    else if (activeTab === 'Personalized') {
      if (aiPlan && aiPlan.exercises.length > 0) {
        const matchedPlans = plans.filter(p => {
          return aiPlan.exercises.some(ex => {
            const exName = ex.name.toLowerCase();
            const planTitle = p.title.toLowerCase();
            return planTitle.includes(exName) || exName.includes(planTitle);
          });
        });
        filtered = matchedPlans.length > 0 ? matchedPlans : [plans[0]];
      } else {
        filtered = plans.slice(0, 1);
      }
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.goal.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [plans, activeTab, searchQuery, savedPlans, aiPlan]);

  const toggleSave = (id: string) => {
    setSavedPlans(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
    setPlans(prev => prev.map(p => p.id === id ? { ...p, isSaved: !p.isSaved } : p));
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Beginner': return 'bg-green-100 text-green-700';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'Advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleCompleteWorkout = async (plan: WorkoutPlan) => {
    try {
      await logWorkout({
        workoutName: plan.title,
        duration: plan.duration,
        caloriesBurned: plan.calories,
      });

      setTodayBurnedCalories(prev => prev + plan.calories);

      toast.success(`Completed "${plan.title}"! Burned ${plan.calories} kcal`, { autoClose: 4000 });

      const stats = await getProgressStats();
      toast.info(`Current streak: ${stats.currentStreak} days!`, { autoClose: 4000 });

      const currentIndex = todayWorkoutSequence.findIndex(p => p.id === plan.id);
      if (currentIndex !== -1 && currentIndex < todayWorkoutSequence.length - 1) {
        setTimeout(() => {
          setSelectedPlan(todayWorkoutSequence[currentIndex + 1]);
          toast.info(`Continue: ${todayWorkoutSequence[currentIndex + 1].title}`, { autoClose: 3000 });
        }, 1800);
      } else {
        setTimeout(() => {
          toast.success("COMPLETED TODAY'S WORKOUT! Great job!", { autoClose: 5000 });
        }, 1500);
        setTodayWorkoutSequence([]);
      }

      setSelectedPlan(null);
    } catch (error) {
      console.error('Failed to complete workout:', error);
      toast.error('Failed to save workout. Please try again!');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Workout Plans</h1>
      </div>

      <div className={styles.tabs}>
        {TABS.map(tab => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className={styles.searchBox}>
        <Search className="w-5 h-5 text-gray-500" />
        <input
          type="text"
          placeholder="Search workout plans, goals..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {activeTab === 'Personalized' && analysis && (
        <div className="space-y-6">

          <div className={styles.burnProgressBanner}>
            <div>
              <p className="text-sm opacity-90 mb-2">Total Calories Burned Today</p>
              <p className={styles.bigNumber}>{todayBurnedCalories}</p>
              <p className="text-xl mt-3 opacity-90">
                Achieved {Math.round((todayBurnedCalories / analysis.recommendedBurn) * 100)}% of fat burning goal
              </p>
            </div>
            <div className={styles.progressContainer}>
              <div
                className={styles.progressFill}
                style={{ width: `${Math.min(100, (todayBurnedCalories / analysis.recommendedBurn) * 100)}%` }}
              />
            </div>
          </div>

          <div className={styles.quickActivityCard}>
            <h3 className="text-xl font-bold mb-5 flex items-center gap-3">
              <Flame className="w-7 h-7" />
              Did you exercise outside the plan today?
            </h3>
            <div className={styles.quickActivityGrid}>
              {[
                { name: "Running 30 minutes", kcal: 300 },
                { name: "Swimming 45 minutes", kcal: 500 },
                { name: "Soccer 1 hour", kcal: 600 },
                { name: "Badminton 1 hour", kcal: 450 },
                { name: "Cycling 1 hour", kcal: 550 },
              ].map((act) => (
                <button
                  key={act.name}
                  onClick={async () => {
                    const duration = act.name.includes('30') ? 30 : act.name.includes('45') ? 45 : 60;
                    await logQuickActivity(act.name, duration, act.kcal);
                    setTodayBurnedCalories(prev => prev + act.kcal);
                    toast.success(`Đã ghi: ${act.name} → +${act.kcal} kcal`);
                  }}
                  className={styles.quickActivityBtn}
                >
                  <div>{act.name}</div>
                  <span>+{act.kcal} kcal</span>
                </button>
              ))}

              <button
                onClick={() => setShowCustomModal(true)}
                className={styles.customActivityBtn}
              >
                <Plus className="w-7 h-7" />
                Custom Input
              </button>
            </div>
          </div>

          {showCustomModal && (
            <div className={styles.customModalOverlay} onClick={() => setShowCustomModal(false)}>
              <div className={styles.customModal} onClick={e => e.stopPropagation()}>
                <div className={styles.customModalHeader}>
                  <h3>
                    <Flame className="w-8 h-8 text-orange-500" />
                    Log Free Activity
                  </h3>
                  <button onClick={() => setShowCustomModal(false)} className={styles.customModalClose}>
                    <X className="w-7 h-7" />
                  </button>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className={styles.customModalLabel}>Activity Name</label>
                    <input
                      type="text"
                      value={customActivity.name}
                      onChange={e => setCustomActivity(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Jump rope in the park"
                      className={styles.customModalInput}
                    />
                  </div>

                  <div>
                    <label className={styles.customModalLabel}>Duration (minutes)</label>
                    <input
                      type="number"
                      value={customActivity.duration || ''}
                      onChange={e => {
                        const mins = Number(e.target.value) || 0;
                        setCustomActivity(prev => ({
                          ...prev,
                          duration: mins,
                          kcal: prev.kcal === 0 ? Math.round(mins * 9) : prev.kcal
                        }));
                      }}
                      placeholder="30"
                      className={styles.customModalInput}
                    />
                  </div>

                  <div>
                    <label className={styles.customModalLabel}>
                      Estimated Burn (kcal)
                      {customActivity.duration > 0 && customActivity.kcal === 0 && (
                        <span className={styles.customModalHint}>(auto ~9 kcal/min)</span>
                      )}
                    </label>
                    <input
                      type="number"
                      value={customActivity.kcal || ''}
                      onChange={e => setCustomActivity(prev => ({ ...prev, kcal: Number(e.target.value) || 0 }))}
                      placeholder={customActivity.duration > 0 ? String(Math.round(customActivity.duration * 9)) : "250"}
                      className={styles.customModalInput}
                      style={{ fontWeight: 600, color: '#7c3aed' }}
                    />
                  </div>
                </div>

                <div className={styles.customModalActions}>
                  <button onClick={() => setShowCustomModal(false)} className={styles.customModalCancel}>
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      if (!customActivity.name.trim()) return toast.error("Enter activity name");
                      if (customActivity.duration <= 0) return toast.error("Duration must be > 0");
                      const kcal = customActivity.kcal || Math.round(customActivity.duration * 9);
                      await logQuickActivity(customActivity.name, customActivity.duration, kcal);
                      setTodayBurnedCalories(prev => prev + kcal);
                      toast.success(`Đã ghi: ${customActivity.name} → +${kcal} kcal`);
                      setShowCustomModal(false);
                      setCustomActivity({ name: "", duration: 0, kcal: 0 });
                    }}
                    className={styles.customModalSave}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className={styles.aiBanner}>
            <div className={styles.aiHeader}>
              <div className={styles.aiAvatar}>AI</div>
              <h3 className={styles.aiTitle}>Your Personal Trainer</h3>
            </div>

            <div className={styles.aiStats}>
              <div className={styles.aiStat}>
                <strong>{dailyCalories}</strong> kcal eaten
              </div>
              <div className={styles.aiStat}>
                <strong>{analysis.tdee}</strong> kcal TDEE
              </div>
              <div className={styles.aiStat}>
                <strong>{analysis.bmi}</strong> BMI
                <span className={styles.bmiStatus} style={{
                  color: Number(analysis.bmi) > 25 ? '#dc2626' : '#10b981'
                }}>
                  {Number(analysis.bmi) > 25 ? ' - Need to lose weight' : ' - Maintain well'}
                </span>
              </div>
            </div>

            <div className={styles.aiProgress}>
              <div className={styles.aiProgressLabel}>
                Need to burn <strong>{analysis.recommendedBurn} kcal</strong> to balance
              </div>
              <div className={styles.aiProgressBar}>
                <div
                  className={styles.aiProgressFill}
                  style={{ width: `${analysis.deficitPct}%` }}
                />
              </div>
            </div>

            {isLoadingAI && (
              <div className="flex items-center gap-2 text-emerald-600 mt-3">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>AI is creating a personalized plan for you...</span>
              </div>
            )}

            {!isLoadingAI && (
              <div className={styles.aiSuggestionCard}>
                <div className={styles.aiSuggestionInfo}>
                  <p className="font-medium text-emerald-700">{aiPlan.summary}</p>
                  <p className="text-sm mt-1">
                    <strong>Intensity:</strong> {aiPlan.intensity} • <strong>Estimated Burn:</strong> {aiPlan.totalBurnEstimate}
                  </p>
                  <div className="mt-3 space-y-2">
                    {aiPlan.exercises.map((ex, i) => (
                      <div key={i} className="text-sm">
                        <strong>{ex.name}</strong> – {ex.duration}
                        <br />
                        <span className="text-xs text-gray-500">→ {ex.reason}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs italic text-emerald-600 mt-3">{aiPlan.advice}</p>
                </div>

                <button
                  onClick={() => {
                    const matchedPlans = plans.filter(p =>
                      aiPlan.exercises.some(ex =>
                        p.title.toLowerCase().includes(ex.name.toLowerCase()) ||
                        ex.name.toLowerCase().includes(p.title.toLowerCase())
                      )
                    );

                    if (matchedPlans.length === 0) {
                      toast.error("No matching plans found");
                      return;
                    }

                    setTodayWorkoutSequence(matchedPlans);
                    setSelectedPlan(matchedPlans[0]);

                    toast.success(
                      `Start your workout today! You will perform ${matchedPlans.length} exercises: ${matchedPlans.map(p => p.title).join(" → ")}`,
                      { autoClose: 7000 }
                    );
                  }}
                  className={styles.aiStartBtn}
                >
                  Start Now
                </button>
              </div>
            )}
          </div>

          {dailyCalories < 0.3 * analysis.tdee && (
            <div className="bg-orange-100 text-orange-700 p-4 rounded-xl text-sm font-medium text-center">
              You have only consumed <strong>{Math.round(dailyCalories / analysis.tdee * 100)}%</strong> of your TDEE.
              Please eat more before exercising to have enough energy!
            </div>
          )}
        </div>
      )}

      <div className={styles.grid}>
        {filteredPlans.map(plan => (
          <div key={plan.id} className={styles.card} onClick={() => setSelectedPlan(plan)}>
            <div className={styles.thumbnailWrapper}>
              <img src={plan.thumbnail} alt={plan.title} className={styles.thumbnail} />
              <div className={styles.playOverlay}><Play className="w-8 h-8 text-white" /></div>
              {plan.progress !== undefined && (
                <div className={styles.progressBadge}>
                  {plan.progress}/{plan.exercises.length} completed
                </div>
              )}
            </div>
            <div className={styles.cardBody}>
              <h3 className={styles.cardTitle}>{plan.title}</h3>
              <div className={styles.cardMeta}>
                <span className={styles.metaItem}><Clock className="w-4 h-4" /> {plan.duration} minutes</span>
                <span className={styles.metaItem}><Flame className="w-4 h-4" /> {plan.calories} kcal</span>
                <span className={`${styles.difficulty} ${getDifficultyColor(plan.difficulty)}`}>
                  {plan.difficulty}
                </span>
              </div>
              <div className={styles.cardActions}>
                <button onClick={(e) => { e.stopPropagation(); toggleSave(plan.id); }} className={`${styles.saveBtn} ${plan.isSaved ? styles.saved : ''}`}>
                  <Heart className={`w-5 h-5 ${plan.isSaved ? 'fill-red-500' : ''}`} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); setSelectedPlan(plan); }} className={styles.startBtnSmall}>
                  Start
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedPlan && (
        <div className={styles.modalOverlay} onClick={() => setSelectedPlan(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <button className={styles.workoutCloseBtn} onClick={() => setSelectedPlan(null)}>
              <X className="w-6 h-6" />
            </button>
            {selectedPlan.videoUrl && (
              <div className={styles.videoWrapper}>
                <YouTubePlayer videoId={selectedPlan.videoUrl.split('v=')[1]} autoplay={false} muted={true} />
              </div>
            )}
            <div className={styles.modalContent}>
              <h2 className={styles.modalTitle}>{selectedPlan.title}</h2>
              <div className={styles.modalMeta}>
                <span>{selectedPlan.duration} minutes</span>
                <span>{selectedPlan.calories} kcal</span>
                <span className={getDifficultyColor(selectedPlan.difficulty)}>{selectedPlan.difficulty}</span>
              </div>
              <h3 className={styles.sectionTitle}>Exercise List</h3>
              <div className={styles.exerciseList}>
                {selectedPlan.exercises.map((ex, i) => (
                  <div key={i} className={styles.exerciseItem}>
                    <div className={styles.exerciseHeader}>
                      <span className={styles.exerciseIndex}>{i + 1}</span>
                      <span className={styles.exerciseName}>{ex.name}</span>
                    </div>
                    <div className={styles.exerciseDetails}>
                      <span>{ex.sets} sets × {ex.reps}</span>
                      <span>Rest: {ex.rest}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button
                className={styles.startWorkoutBtn}
                onClick={() => handleCompleteWorkout(selectedPlan)}
              >
                ✓ Complete Workout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
