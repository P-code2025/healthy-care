// src/pages/ExercisesNew.tsx
import { useState, useEffect, useMemo } from 'react';
import {
  Play,
  Heart,
  Clock,
  Flame,
  Search,
  X,
  Loader2,
} from 'lucide-react';
import styles from './ExercisesNew.module.css';
import YouTubePlayer from '../../components/YouTubePlayer';
import { SAMPLE_WORKOUT_PLANS, type WorkoutPlan } from './workoutPlans';
import { generateAIExercisePlan, type AIExercisePlan } from '../../services/aiExercisePlan';

const TABS = ['Tất cả', 'Cá nhân hóa', 'Đã lưu', 'Lịch sử'] as const;
type TabType = typeof TABS[number];

export default function ExercisesNew() {
  const [activeTab, setActiveTab] = useState<TabType>('Cá nhân hóa');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<WorkoutPlan | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [savedPlans, setSavedPlans] = useState<Set<string>>(new Set(['2', '5']));
  const [plans, setPlans] = useState<WorkoutPlan[]>(SAMPLE_WORKOUT_PLANS);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [dailyCalories, setDailyCalories] = useState(0);

  // AI State
  const [aiPlan, setAiPlan] = useState<AIExercisePlan>(() => {
  // Tạo fallback ngay khi khởi tạo
  return {
    summary: "AI đang chuẩn bị kế hoạch cho bạn...",
    intensity: 'vừa',
    exercises: [],
    totalBurnEstimate: "0 kcal",
    advice: "Vui lòng đợi trong giây lát."
  };
});
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  // Load profile
  useEffect(() => {
    const profile = localStorage.getItem('userProfile');
    const savedCal = localStorage.getItem('dailyCalories');
    const calDate = localStorage.getItem('dailyCalorieDate');
    const today = new Date().toISOString().split('T')[0];

    if (profile) setUserProfile(JSON.parse(profile));
    if (savedCal && calDate === today) {
      setDailyCalories(parseInt(savedCal));
    }
  }, []);

  // Tính BMI + TDEE
  const analysis = useMemo(() => {
    if (!userProfile || dailyCalories === 0) return null;

    const { weight, height, age, gender, goalWeight } = userProfile;
    if (!weight || !height || !age || !gender) return null;

    const bmi = weight / ((height / 100) ** 2);
    const bmr = gender === 'Nam'
      ? 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age
      : 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age;

    const tdee = Math.round(bmr * 1.55);
    const targetDeficit = goalWeight < weight ? 500 : 0;
    const recommendedBurn = Math.max(0, dailyCalories - tdee + targetDeficit);
    const deficitPct = Math.min(100, Math.round((recommendedBurn / tdee) * 100));

    return {
      bmi: bmi.toFixed(1),
      tdee,
      recommendedBurn: Math.round(recommendedBurn),
      deficitPct,
    };
  }, [userProfile, dailyCalories]);

  // GỌI CLOVA AI + CACHE 1 NGÀY
  useEffect(() => {
    if (activeTab !== 'Cá nhân hóa' || !analysis || !userProfile) return;

    const cacheKey = `aiPlan_${new Date().toDateString()}`;
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      setAiPlan(JSON.parse(cached));
      return;
    }

    const fetchAI = async () => {
  setIsLoadingAI(true);

  const availablePlanNames = SAMPLE_WORKOUT_PLANS.map(p => p.title);

  const result = await generateAIExercisePlan(dailyCalories, {
    age: userProfile.age,
    gender: userProfile.gender,
    weight: userProfile.weight,
    height: userProfile.height,
    goalWeight: userProfile.goalWeight,
    goal: userProfile.goalWeight < userProfile.weight ? 'lose' : 'maintain',
    activityLevel: 'moderate',
    workoutPreference: userProfile.workoutPreference || []
  }, availablePlanNames);

  // result LUÔN là AIExercisePlan → không cần kiểm tra
  setAiPlan(result);
  localStorage.setItem(cacheKey, JSON.stringify(result));

  setIsLoadingAI(false);
};

    fetchAI();
  }, [activeTab, analysis, userProfile, dailyCalories]);

  // Filter plans
  const filteredPlans = useMemo(() => {
    let filtered = plans;

    if (activeTab === 'Đã lưu') {
      filtered = filtered.filter(p => savedPlans.has(p.id));
    } else if (activeTab === 'Cá nhân hóa') {
  if (aiPlan && aiPlan.exercises.length > 0) {
    // LẤY TẤT CẢ PLAN KHỚP VỚI BẤT KỲ BÀI TẬP NÀO
    const matchedPlans = plans.filter(p =>
      aiPlan.exercises.some(ex =>
        p.title.toLowerCase().includes(ex.name.toLowerCase()) ||
        ex.name.toLowerCase().includes(p.title.toLowerCase())
      )
    );

    // Nếu không có plan nào khớp → dùng fallback
    filtered = matchedPlans.length > 0 ? matchedPlans : plans.slice(0, 1);
  } else {
    filtered = plans.slice(0, 1);
  }
}

    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.goal.toLowerCase().includes(searchQuery.toLowerCase())
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

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Workout Plans</h1>
      </div>

      {/* Tabs */}
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

      {/* Search */}
      <div className={styles.searchBox}>
        <Search className="w-5 h-5 text-gray-500" />
        <input
          type="text"
          placeholder="Tìm giáo án, mục tiêu..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* ==================== AI PERSONALIZED BANNER ==================== */}
      {activeTab === 'Cá nhân hóa' && analysis && (
        <div className={styles.aiBanner}>
          {/* Header */}
          <div className={styles.aiHeader}>
            <div className={styles.aiAvatar}>AI</div>
            <h3 className={styles.aiTitle}>Huấn luyện viên cá nhân</h3>
          </div>

          {/* Stats */}
          <div className={styles.aiStats}>
            <div className={styles.aiStat}><strong>{dailyCalories}</strong> kcal nạp</div>
            <div className={styles.aiStat}><strong>{analysis.tdee}</strong> kcal TDEE</div>
            <div className={styles.aiStat}>
              <strong>{analysis.bmi}</strong> BMI
              <span className={styles.bmiStatus} style={{
                color: Number(analysis.bmi) > 25 ? '#dc2626' : '#10b981'
              }}>
                {Number(analysis.bmi) > 25 ? 'Cần giảm cân' : 'Duy trì tốt'}
              </span>
            </div>
          </div>

          {/* Progress */}
          <div className={styles.aiProgress}>
            <div className={styles.aiProgressLabel}>
              Đốt <strong>{analysis.recommendedBurn} kcal</strong> để cân bằng
            </div>
            <div className={styles.aiProgressBar}>
              <div className={styles.aiProgressFill} style={{ width: `${analysis.deficitPct}%` }} />
            </div>
          </div>

          {/* LOADING */}
    {isLoadingAI && (
      <div className="flex items-center gap-2 text-emerald-600 mt-3">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>AI đang tạo kế hoạch cá nhân hóa...</span>
      </div>
    )}

    {/* AI PLAN - HIỆN SAU KHI CÓ KẾT QUẢ */}
    {!isLoadingAI && (
      <div className={styles.aiSuggestionCard}>
        <div className={styles.aiSuggestionInfo}>
          <p className="font-medium text-emerald-700">{aiPlan.summary}</p>
          <p className="text-sm mt-1">
            <strong>Cường độ:</strong> {aiPlan.intensity} • <strong>Đốt ước tính:</strong> {aiPlan.totalBurnEstimate}
          </p>
          <div className="mt-2 space-y-1">
            {aiPlan.exercises.map((ex, i) => (
              <div key={i} className="text-sm">
                <strong>{ex.name}</strong> – {ex.duration}
                <br />
                <span className="text-xs text-gray-500">→ {ex.reason}</span>
              </div>
            ))}
          </div>
          <p className="text-xs italic text-emerald-600 mt-2">{aiPlan.advice}</p>
        </div>
        <button
          onClick={() => {
            const matched = plans.find(p =>
              aiPlan.exercises.some(ex =>
                p.title.toLowerCase().includes(ex.name.toLowerCase()) ||
                ex.name.toLowerCase().includes(p.title.toLowerCase())
              )
            );
            setSelectedPlan(matched || plans[0]);
          }}
          className={styles.aiStartBtn}
        >
          Bắt đầu ngay
        </button>
      </div>
          )}
        </div>
      )}

      {/* ==================== PLAN GRID ==================== */}
      <div className={styles.grid}>
        {filteredPlans.map(plan => (
          <div key={plan.id} className={styles.card} onClick={() => setSelectedPlan(plan)}>
            <div className={styles.thumbnailWrapper}>
              <img src={plan.thumbnail} alt={plan.title} className={styles.thumbnail} />
              <div className={styles.playOverlay}><Play className="w-8 h-8 text-white" /></div>
              {plan.progress !== undefined && (
                <div className={styles.progressBadge}>
                  {plan.progress}/{plan.exercises.length} hoàn thành
                </div>
              )}
            </div>
            <div className={styles.cardBody}>
              <h3 className={styles.cardTitle}>{plan.title}</h3>
              <div className={styles.cardMeta}>
                <span className={styles.metaItem}><Clock className="w-4 h-4" /> {plan.duration} phút</span>
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
                  Bắt đầu
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ==================== PLAN DETAIL MODAL ==================== */}
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
                <span>{selectedPlan.duration} phút</span>
                <span>{selectedPlan.calories} kcal</span>
                <span className={getDifficultyColor(selectedPlan.difficulty)}>{selectedPlan.difficulty}</span>
              </div>
              <h3 className={styles.sectionTitle}>Danh sách bài tập</h3>
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
              <button className={styles.startWorkoutBtn}>Bắt đầu buổi tập</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}