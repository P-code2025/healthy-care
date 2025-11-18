import { useState, useEffect, useMemo } from "react";
import {
  Play,
  Heart,
  Clock,
  Flame,
  Search,
  X,
  Loader2,
  Dumbbell, // [MỚI] Icon cho phần chi tiết bài tập
} from "lucide-react";
import styles from "./ExercisesNew.module.css";
import YouTubePlayer from "../../components/YouTubePlayer";
import { SAMPLE_WORKOUT_PLANS, type WorkoutPlan } from "./workoutPlans";
import {
  generateAIExercisePlanFromAPI,
  type AIExercisePlan,
} from "../../services/aiExercisePlan";
import type { FoodEntry } from "../../lib/types";
import { foodDiaryApi, mapFoodLogToEntry } from "../../services/foodDiaryApi";
import { useAuth } from "../../context/AuthContext";
import {
  determineGoalIntent,
  getGoalWeightFromUser,
} from "../../utils/profile";

const TABS = ["All", "Personalized", "Saved", "History"] as const;
type TabType = (typeof TABS)[number];

interface ExerciseUserProfile {
  age: number;
  gender: "Nam" | "Nữ" | string;
  weight: number;
  height: number;
  goalWeight: number;
  goal: "lose" | "maintain" | "gain";
  workoutPreference?: string[];
}

export default function ExercisesNew() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("Personalized");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<WorkoutPlan | null>(null);
  const [savedPlans, setSavedPlans] = useState<Set<string>>(
    new Set(["pro_fatloss_01"])
  );

  // Sử dụng dữ liệu giáo án từ workoutPlans.ts
  const [plans, setPlans] = useState<WorkoutPlan[]>(SAMPLE_WORKOUT_PLANS);
  const [userProfile, setUserProfile] = useState<ExerciseUserProfile | null>(
    null
  );
  const [dailyCalories, setDailyCalories] = useState(0);
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);

  // AI State
  const [aiPlan, setAiPlan] = useState<AIExercisePlan>(() => {
    return {
      summary: "AI is preparing a personalized plan for you...",
      intensity: "moderate",
      exercises: [],
      totalBurnEstimate: "0 kcal",
      advice: "Please hold on for a moment.",
    };
  });
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  // Load profile from auth context
  useEffect(() => {
    if (!user) return;
    const normalizedGender =
      user.gender?.toLowerCase() === "male"
        ? "Nam"
        : user.gender?.toLowerCase() === "female"
        ? "Nữ"
        : user.gender || "Nam";
    const weight = user.weight_kg || 0;
    const goalWeight = getGoalWeightFromUser(user);
    setUserProfile({
      age: user.age || 0,
      gender: normalizedGender,
      weight,
      height: user.height_cm || 0,
      goalWeight,
      goal: determineGoalIntent(weight, goalWeight),
      workoutPreference: [],
    });
  }, [user]);

  // Load today's food entries
  useEffect(() => {
    const getTodayVN = (): string => {
      return new Date().toLocaleDateString("sv", {
        timeZone: "Asia/Ho_Chi_Minh",
      });
    };

    const today = getTodayVN();

    const loadEntries = async () => {
      try {
        const logs = await foodDiaryApi.list({ start: today, end: today });
        setFoodEntries(logs.map(mapFoodLogToEntry));
      } catch (err) {
        console.error("Failed to load food diary for exercises", err);
      }
    };

    loadEntries();

    const interval = setInterval(() => {
      if (getTodayVN() !== today) {
        loadEntries();
      }
      loadEntries();
    }, 30_000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const total = foodEntries.reduce((sum, entry) => sum + entry.calories, 0);
    setDailyCalories(total);
  }, [foodEntries]);

  // Tính BMI + TDEE
  const analysis = useMemo(() => {
    if (!userProfile || dailyCalories === 0) return null;

    const { weight, height, age, gender, goalWeight } = userProfile;
    if (!weight || !height || !age || !gender) return null;

    const bmi = weight / (height / 100) ** 2;
    const bmr =
      gender === "Nam"
        ? 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age
        : 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age;

    const tdee = Math.round(bmr * 1.55);
    const targetDeficit = goalWeight < weight ? 500 : 0;
    const recommendedBurn = Math.max(0, dailyCalories - tdee + targetDeficit);
    const deficitPct = Math.min(
      100,
      Math.round((recommendedBurn / tdee) * 100)
    );

    return {
      bmi: bmi.toFixed(1),
      tdee,
      recommendedBurn: Math.round(recommendedBurn),
      deficitPct,
    };
  }, [userProfile, dailyCalories]);

  useEffect(() => {
    if (activeTab !== "Personalized" || !analysis || !userProfile) return;

    const fetchAI = async () => {
      setIsLoadingAI(true);
      try {
        const result = await generateAIExercisePlanFromAPI(
          dailyCalories,
          "Generate today's workout plan based on my food intake and profile."
        );
        setAiPlan(result);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingAI(false);
      }
    };

    fetchAI();
  }, [activeTab, analysis, userProfile, dailyCalories]);

  // Filter plans
  const filteredPlans = useMemo(() => {
    let filtered = plans;

    if (activeTab === "Saved") {
      filtered = filtered.filter((p) => savedPlans.has(p.id));
    } else if (activeTab === "Personalized") {
      if (aiPlan && aiPlan.exercises.length > 0) {
        const matchedPlans = plans.filter((p) => {
          return aiPlan.exercises.some((ex) => {
            const exName = ex.name.toLowerCase();
            const planTitle = p.title.toLowerCase();
            return planTitle.includes(exName) || exName.includes(planTitle);
          });
        });

        filtered = matchedPlans.length > 0 ? matchedPlans : [plans[0]];
      } else {
        filtered = plans;
      }
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(q) || p.goal.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [plans, activeTab, searchQuery, savedPlans, aiPlan]);

  const toggleSave = (id: string) => {
    setSavedPlans((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
    setPlans((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isSaved: !p.isSaved } : p))
    );
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "Beginner":
        return "bg-green-100 text-green-700";
      case "Intermediate":
        return "bg-yellow-100 text-yellow-700";
      case "Advanced":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
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
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`${styles.tab} ${
              activeTab === tab ? styles.activeTab : ""
            }`}
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
          placeholder="Search workouts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* ==================== AI PERSONALIZED BANNER ==================== */}
      {activeTab === "Personalized" && analysis && (
        <div className={styles.aiBanner}>
          {/* Header */}
          <div className={styles.aiHeader}>
            <div className={styles.aiAvatar}>AI</div>
            <h3 className={styles.aiTitle}>Personal AI Trainer</h3>
          </div>

          {/* Stats */}
          <div className={styles.aiStats}>
            <div className={styles.aiStat}>
              <strong>{dailyCalories}</strong> kcal consumed
            </div>
            <div className={styles.aiStat}>
              <strong>{analysis.tdee}</strong> kcal TDEE
            </div>
            <div className={styles.aiStat}>
              <strong>{analysis.bmi}</strong> BMI
              <span
                className={styles.bmiStatus}
                style={{
                  color: Number(analysis.bmi) > 25 ? "#dc2626" : "#10b981",
                }}
              >
                {Number(analysis.bmi) > 25
                  ? "Need to lose weight"
                  : "Maintaining well"}
              </span>
            </div>
          </div>

          {/* Progress */}
          <div className={styles.aiProgress}>
            <div className={styles.aiProgressLabel}>
              Burn <strong>{analysis.recommendedBurn} kcal</strong> to balance
            </div>
            <div className={styles.aiProgressBar}>
              <div
                className={styles.aiProgressFill}
                style={{ width: `${analysis.deficitPct}%` }}
              />
            </div>
          </div>

          {/* LOADING */}
          {isLoadingAI && (
            <div className="flex items-center gap-2 text-emerald-600 mt-3">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>AI is generating a personalized plan...</span>
            </div>
          )}

          {/* AI PLAN */}
          {!isLoadingAI && aiPlan && aiPlan.exercises.length > 0 && (
            <div className={styles.aiSuggestionCard}>
              <div className={styles.aiSuggestionInfo}>
                <p className="font-medium text-emerald-700">{aiPlan.summary}</p>
                <p className="text-sm mt-1">
                  <strong>Intensity:</strong> {aiPlan.intensity} •{" "}
                  <strong>Estimated Burn:</strong> {aiPlan.totalBurnEstimate}
                </p>
                <div className="mt-2 space-y-1">
                  {aiPlan.exercises.map((ex, i) => (
                    <div key={i} className="text-sm">
                      <strong>{ex.name}</strong> – {ex.duration}
                      <br />
                      <span className="text-xs text-gray-500">
                        → {ex.reason}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs italic text-emerald-600 mt-2">
                  {aiPlan.advice}
                </p>
              </div>
              <button
                onClick={() => {
                  const matched = plans.find((p) =>
                    aiPlan.exercises.some(
                      (ex) =>
                        p.title.toLowerCase().includes(ex.name.toLowerCase()) ||
                        ex.name.toLowerCase().includes(p.title.toLowerCase())
                    )
                  );
                  setSelectedPlan(matched || plans[0]);
                }}
                className={styles.aiStartBtn}
              >
                Start Now
              </button>
            </div>
          )}
        </div>
      )}

      {/* ==================== PLAN GRID ==================== */}
      <div className={styles.grid}>
        {filteredPlans.map((plan) => (
          <div
            key={plan.id}
            className={styles.card}
            onClick={() => setSelectedPlan(plan)}
          >
            <div className={styles.thumbnailWrapper}>
              <img
                src={plan.thumbnail}
                alt={plan.title}
                className={styles.thumbnail}
              />
              <div className={styles.playOverlay}>
                <Play className="w-8 h-8 text-white" />
              </div>
              {plan.progress !== undefined && (
                <div className={styles.progressBadge}>
                  {plan.progress}/{plan.exercises.length} completed
                </div>
              )}
            </div>
            <div className={styles.cardBody}>
              <h3 className={styles.cardTitle}>{plan.title}</h3>
              <div className={styles.cardMeta}>
                <span className={styles.metaItem}>
                  <Clock className="w-4 h-4" /> {plan.duration} min
                </span>
                <span className={styles.metaItem}>
                  <Flame className="w-4 h-4" /> {plan.calories} kcal
                </span>
                <span
                  className={`${styles.difficulty} ${getDifficultyColor(
                    plan.difficulty
                  )}`}
                  style={{
                    backgroundColor:
                      plan.difficulty === "Beginner"
                        ? "#dcfce7"
                        : plan.difficulty === "Intermediate"
                        ? "#fef9c3"
                        : "#fee2e2",
                    color:
                      plan.difficulty === "Beginner"
                        ? "#166534"
                        : plan.difficulty === "Intermediate"
                        ? "#854d0e"
                        : "#991b1b",
                  }}
                >
                  {plan.difficulty}
                </span>
              </div>

              {/* [MỚI] Hiển thị Tags trên Card */}
              {plan.tags && (
                <div className="flex gap-1 mt-2 flex-wrap">
                  {plan.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className={styles.cardActions}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSave(plan.id);
                  }}
                  className={`${styles.saveBtn} ${
                    savedPlans.has(plan.id) ? styles.saved : ""
                  }`}
                >
                  <Heart
                    className={`w-5 h-5 ${
                      savedPlans.has(plan.id) ? "fill-red-500" : ""
                    }`}
                  />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPlan(plan);
                  }}
                  className={styles.startBtnSmall}
                >
                  Start
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ==================== PLAN DETAIL MODAL ==================== */}
      {selectedPlan && (
        <div
          className={styles.modalOverlay}
          onClick={() => setSelectedPlan(null)}
        >
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "800px",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <button
              className={styles.workoutCloseBtn}
              onClick={() => setSelectedPlan(null)}
            >
              <X className="w-6 h-6" />
            </button>

            {/* Video Player */}
            {selectedPlan.videoUrl && (
              <div className={styles.videoWrapper}>
                <YouTubePlayer
                  videoId={
                    selectedPlan.videoUrl.includes("v=")
                      ? selectedPlan.videoUrl.split("v=")[1]
                      : ""
                  }
                  autoplay={false}
                  muted={true}
                />
              </div>
            )}

            <div className={styles.modalContent}>
              {/* Title & Meta */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "start",
                }}
              >
                <h2
                  className={styles.modalTitle}
                  style={{ fontSize: "24px", marginBottom: "8px" }}
                >
                  {selectedPlan.title}
                </h2>
              </div>

              <div
                className={styles.modalMeta}
                style={{ marginBottom: "16px" }}
              >
                <span>⏱️ {selectedPlan.duration} phút</span>
                <span>🔥 {selectedPlan.calories} kcal</span>
                <span
                  className={getDifficultyColor(selectedPlan.difficulty)}
                  style={{
                    padding: "2px 10px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: "600",
                    backgroundColor: "#f3f4f6",
                    color: "#374151",
                  }}
                >
                  {selectedPlan.difficulty}
                </span>
              </div>

              <p
                style={{
                  marginBottom: "24px",
                  color: "#374151",
                  lineHeight: "1.6",
                }}
              >
                {selectedPlan.description}
              </p>

              <h3
                className={styles.sectionTitle}
                style={{
                  borderBottom: "2px solid #E5E7EB",
                  paddingBottom: "8px",
                  marginBottom: "16px",
                }}
              >
                Chi tiết buổi tập (Coach Breakdown)
              </h3>

              {/* === [MỚI] DANH SÁCH BÀI TẬP CHI TIẾT === */}
              <div className={styles.exerciseList}>
                {selectedPlan.exercises.map((ex, i) => (
                  <div
                    key={i}
                    className={styles.exerciseItem}
                    style={{
                      alignItems: "flex-start",
                      marginBottom: "12px",
                      backgroundColor: "#fff",
                      border: "1px solid #E5E7EB",
                      padding: "16px",
                      borderRadius: "12px",
                    }}
                  >
                    {/* Số thứ tự */}
                    <div className={styles.exerciseHeader}>
                      <span
                        className={styles.exerciseIndex}
                        style={{
                          background: "#10B981",
                          color: "white",
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "12px",
                          fontWeight: "bold",
                        }}
                      >
                        {i + 1}
                      </span>
                    </div>

                    {/* Nội dung chi tiết */}
                    <div style={{ flex: 1, marginLeft: "16px" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          flexWrap: "wrap",
                          gap: "8px",
                        }}
                      >
                        <span
                          className={styles.exerciseName}
                          style={{
                            fontSize: "16px",
                            fontWeight: "600",
                            color: "#111827",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          {ex.name}
                        </span>

                        {/* Thông số Sets/Reps */}
                        <div style={{ textAlign: "right", minWidth: "100px" }}>
                          <div
                            style={{
                              fontWeight: "700",
                              color: "#10B981",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "flex-end",
                              gap: "4px",
                            }}
                          >
                            <Dumbbell className="w-4 h-4" />
                            {ex.sets} sets × {ex.reps}
                          </div>
                          <div style={{ fontSize: "12px", color: "#6B7280" }}>
                            Nghỉ: {ex.rest}
                          </div>
                        </div>
                      </div>

                      {/* --- [MỚI] THÔNG SỐ CHUYÊN NGHIỆP: TEMPO & RPE --- */}
                      {(ex.tempo || ex.rpe) && (
                        <div
                          style={{
                            display: "flex",
                            gap: "12px",
                            fontSize: "12px",
                            fontFamily: "monospace",
                            color: "#4B5563",
                            marginTop: "8px",
                            background: "#F3F4F6",
                            padding: "6px 10px",
                            borderRadius: "6px",
                            width: "fit-content",
                            border: "1px solid #E5E7EB",
                          }}
                        >
                          {ex.tempo && (
                            <span title="Nhịp độ: Xuống - Giữ - Lên - Nghỉ">
                              ⏱ Tempo:{" "}
                              <strong style={{ color: "#000" }}>
                                {ex.tempo}
                              </strong>
                            </span>
                          )}
                          {ex.rpe && (
                            <span title="Mức độ gắng sức (1-10)">
                              🔥 RPE:{" "}
                              <strong style={{ color: "#DC2626" }}>
                                {ex.rpe}
                              </strong>
                            </span>
                          )}
                        </div>
                      )}

                      {/* --- [MỚI] COACH TIPS --- */}
                      {ex.tips && (
                        <div
                          style={{
                            marginTop: "10px",
                            padding: "10px 12px",
                            backgroundColor: "#ECFDF5", // Xanh mint nhạt
                            borderLeft: "4px solid #10B981", // Viền xanh lá đậm
                            borderRadius: "0 4px 4px 0",
                            fontSize: "13px",
                            color: "#064E3B",
                            fontStyle: "italic",
                            lineHeight: "1.5",
                          }}
                        >
                          <span
                            style={{
                              fontWeight: "700",
                              marginRight: "6px",
                              fontStyle: "normal",
                            }}
                          >
                            💡 Coach Tip:
                          </span>
                          {ex.tips}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button className={styles.startWorkoutBtn}>
                Bắt đầu buổi tập
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
