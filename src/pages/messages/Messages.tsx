// src/pages/messages/Messages.tsx
import { useEffect, useRef, useState } from "react";
import { Camera, Dumbbell } from "lucide-react";
import { toast } from "react-toastify";

import styles from "./Messages.module.css";
import { useAuth } from "../../context/AuthContext";
import type { AnalysisResult, FoodEntry } from "../../lib/types";
import {
  foodDiaryApi,
  mapFoodLogToEntry,
  type FoodEntryInput,
} from "../../services/foodDiaryApi";
import { analyzeFood } from "../../services/analyzeFood";
import {
  generateAIExercisePlanFromAPI,
  type AIExercisePlan,
} from "../../services/aiExercisePlan";
import { messages as i18nMessages } from "../../i18n/messages";

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
  isLoading?: boolean;
  nutritionData?: AnalysisResult;
  exercisePlan?: AIExercisePlan;
}

interface UserProfile {
  age: number;
  weight: number;
  height: number;
  gender: "Male" | "Female";
  goal: "lose" | "maintain" | "gain";
  workoutDays: number;
}

const AI_AVATAR = "AI";
const DEFAULT_PROFILE: UserProfile = {
  age: 0,
  weight: 0,
  height: 0,
  gender: "Male",
  goal: "maintain",
  workoutDays: 3,
};

const formatTimestamp = () =>
  new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

const titleCase = (text: string) =>
  text ? text.charAt(0).toUpperCase() + text.slice(1) : text;

export default function Messages() {
  const { user } = useAuth();
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [diaryEntries, setDiaryEntries] = useState<FoodEntry[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load persisted chat history
  useEffect(() => {
    const saved = localStorage.getItem("aiChatMessages");
    if (saved) {
      try {
        setChatMessages(JSON.parse(saved));
      } catch {
        localStorage.removeItem("aiChatMessages");
      }
    }
  }, []);

  // Persist chat history
  useEffect(() => {
    localStorage.setItem("aiChatMessages", JSON.stringify(chatMessages));
  }, [chatMessages]);

  // Prepare profile defaults from the authenticated user
  useEffect(() => {
    if (!user) return;
    const genderValue = (user.gender ?? "").toLowerCase();
    const normalizedGender =
      genderValue.includes("female") || genderValue.includes("nu")
        ? "Female"
        : "Male";
    setUserProfile({
      age: user.age || DEFAULT_PROFILE.age,
      weight: user.weight_kg || DEFAULT_PROFILE.weight,
      height: user.height_cm || DEFAULT_PROFILE.height,
      gender: normalizedGender,
      goal: (user.goal as UserProfile["goal"]) || DEFAULT_PROFILE.goal,
      workoutDays: DEFAULT_PROFILE.workoutDays,
    });
  }, [user]);

  // Load today's diary entries so we can reply with calorie context
  useEffect(() => {
    const todayOnly = new Date().toISOString().split("T")[0];
    const loadEntries = async () => {
      try {
        const logs = await foodDiaryApi.list({
          start: todayOnly,
          end: todayOnly,
        });
        setDiaryEntries(logs.map(mapFoodLogToEntry));
      } catch (error) {
        console.error("Failed to load diary entries for chat assistant", error);
        toast.error(i18nMessages.errors.diaryLoad);
      }
    };

    loadEntries();
  }, []);

  const getTodayCalories = () =>
    diaryEntries.reduce((sum, entry) => sum + entry.calories, 0);

  const handleSend = async () => {
    if (!input.trim()) return;

    const outgoing: ChatMessage = {
      id: Date.now().toString(),
      content: input,
      isUser: true,
      timestamp: formatTimestamp(),
    };
    setChatMessages((prev) => [...prev, outgoing]);
    const pendingQuestion = input;
    setInput("");
    setIsTyping(true);

    setTimeout(async () => {
      const aiResponse = await processUserQuery(pendingQuestion);
      const reply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: aiResponse.content,
        isUser: false,
        timestamp: formatTimestamp(),
        nutritionData: aiResponse.nutritionData,
        exercisePlan: aiResponse.exercisePlan,
      };
      setChatMessages((prev) => [...prev, reply]);
      setIsTyping(false);
    }, 600);
  };

  const processUserQuery = async (
    query: string
  ): Promise<{
    content: string;
    nutritionData?: AnalysisResult;
    exercisePlan?: AIExercisePlan;
  }> => {
    const normalized = query.toLowerCase();
    const mentionsCalories =
      normalized.includes("calo") ||
      normalized.includes("kcal") ||
      normalized.includes("calorie");
    const mentionsToday =
      normalized.includes("hom nay") ||
      normalized.includes("hÃ´m nay") ||
      normalized.includes("today") ||
      normalized.includes("nay");

    if (mentionsCalories && mentionsToday) {
      const total = getTodayCalories();
      const goal = 2000;
      const diff = total - goal;
      const diffText = diff > 0 ? `+${diff}` : `${diff}`;
      const summary = i18nMessages.aiChat.todayCaloriesSummary
        .replace("{calories}", String(total))
        .replace("{diff}", diffText)
        .replace("{goal}", String(goal));
      const advice =
        diff > 0
          ? i18nMessages.aiChat.todayCaloriesAdviceAbove
          : i18nMessages.aiChat.todayCaloriesAdviceBelow;

      return { content: `${summary}\n\n${advice}` };
    }

        const workoutKeywords = [
      "workout",
      "exercise",
      "plan",
      "routine",
      "tap",
      "lich",
      "goi y",
      "suggest",
      "dau",
      "moi",
      "ache",
      "sore",
    ];
    const wantsWorkout = workoutKeywords.some((keyword) =>
      normalized.includes(keyword)
    );

    if (wantsWorkout) {
      if (!userProfile) {
        setShowProfileForm(true);
        toast.info(i18nMessages.errors.incompleteProfile);
        return { content: i18nMessages.aiChat.missingProfilePrompt };
      }

      try {
        const planNames = [
          "Morning Yoga Flow",
          "HIIT Cardio",
          "Full Body Strength",
          "Core & Mobility",
          "20 Min HIIT Fat Loss - No Repeat Workout",
          "HIIT Fat Burn",
          "Upper Body Power",
          "Core & Abs Crusher",
        ];

        const plan = await generateAIExercisePlanFromAPI(
          getTodayCalories(),
          "Create a personalized workout plan"
        );

        const planTitle = i18nMessages.aiChat.workoutPlanTitle.replace(
          "{intensity}",
          plan.intensity
        );
        const exerciseList = plan.exercises
          .map(
            (exercise: { name: any; duration: any; reason: any; }) =>
              `â€¢ **${exercise.name}** - ${exercise.duration}\n _${exercise.reason}_`
          )
          .join("\n\n");
        const response = `${planTitle}\n\n${exerciseList}\n\n**${i18nMessages.aiChat.exerciseBurnLabel}**: ${plan.totalBurnEstimate}\n\n_${i18nMessages.aiChat.workoutPlanAdvicePrefix} ${plan.advice}_`;

        return { content: response, exercisePlan: plan };
      } catch (error) {
        console.error("Workout plan generation failed", error);
        toast.error(i18nMessages.errors.workoutPlan);
        return { content: i18nMessages.errors.workoutPlan };
      }
    }

    return { content: i18nMessages.aiChat.defaultHelper };
  };

  const handleImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUri = reader.result as string;
      const loadingMessage: ChatMessage = {
        id: Date.now().toString(),
        content: i18nMessages.aiChat.analyzingImage,
        isUser: false,
        timestamp: formatTimestamp(),
        isLoading: true,
      };
      setChatMessages((prev) => [...prev, loadingMessage]);

      try {
        const { analysis } = await analyzeFood(dataUri);
        const now = new Date();
        const hour = now.getHours();
        const mealType =
          hour >= 5 && hour < 11
            ? "Breakfast"
            : hour >= 11 && hour < 14
            ? "Lunch"
            : hour >= 18 && hour < 22
            ? "Dinner"
            : "Snack";

        const entryPayload: FoodEntryInput = {
          date: now.toISOString().split("T")[0],
          time: now.toISOString().slice(11, 16),
          mealType,
          foodName: analysis.foodName,
          amount: analysis.amount,
          calories: analysis.calories,
          protein: analysis.protein,
          carbs: analysis.carbs,
          fat: analysis.fat,
          sugar: analysis.sugar,
          status: "Satisfied",
          thoughts: "",
        };

        const createdLog = await foodDiaryApi.create(entryPayload);
        const mappedEntry = mapFoodLogToEntry(createdLog);
        setDiaryEntries((prev) => [mappedEntry, ...prev]);

        const resultMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: `**${analysis.foodName}** - ${analysis.amount}\n\nCalories: ${analysis.calories} kcal\nProtein: ${analysis.protein} g | Carbs: ${analysis.carbs} g | Fat: ${analysis.fat} g | Sugar: ${analysis.sugar} g\n\n${i18nMessages.aiChat.diarySaveSuccess}`,
          isUser: false,
          timestamp: formatTimestamp(),
          nutritionData: analysis,
        };
        setChatMessages((prev) =>
          prev.filter((msg) => !msg.isLoading).concat(resultMessage)
        );
        toast.success(i18nMessages.aiChat.diarySaveSuccess);
      } catch (error) {
        console.error("Image analysis failed", error);
        setChatMessages((prev) =>
          prev
            .filter((msg) => !msg.isLoading)
            .concat({
              id: Date.now().toString(),
              content: i18nMessages.errors.imageAnalysis,
              isUser: false,
              timestamp: formatTimestamp(),
            })
        );
        toast.error(i18nMessages.errors.imageAnalysis);
      }
    };

    reader.readAsDataURL(file);
  };

  const profileValues = userProfile ?? DEFAULT_PROFILE;

  return (
    <div className={styles.container}>
      <div className={styles.chatArea}>
        <div className={styles.header}>
          <div className={styles.avatar}>{AI_AVATAR}</div>
          <div>
            <h3>{i18nMessages.aiChat.headerTitle}</h3>
            <p>{i18nMessages.aiChat.headerSubtitle}</p>
          </div>
        </div>

        <div className={styles.messages}>
          {chatMessages.length === 0 && (
            <div className={styles.welcome}>
              <div className={styles.icon}>{AI_AVATAR}</div>
              <h3>{i18nMessages.aiChat.welcomeTitle}</h3>
              <p>{i18nMessages.aiChat.welcomeSubtitle}</p>
            </div>
          )}

          {chatMessages.map((message) => (
            <div
              key={message.id}
              className={`${styles.message} ${
                message.isUser ? styles.user : styles.ai
              }`}
            >
              {!message.isUser && <div className={styles.avatar}>{AI_AVATAR}</div>}
              <div className={styles.bubble}>
                {message.isLoading ? (
                  <div className={styles.loading}>...</div>
                ) : (
                  <>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: message.content.replace(
                          /\*\*(.*?)\*\*/g,
                          "<strong>$1</strong>"
                        ),
                      }}
                    />
                    {message.nutritionData && (
                      <div className={styles.nutritionCard}>
                        <div>
                          <strong>{message.nutritionData.calories}</strong> kcal
                        </div>
                        <div>P: {message.nutritionData.protein}g</div>
                        <div>C: {message.nutritionData.carbs}g</div>
                        <div>F: {message.nutritionData.fat}g</div>
                      </div>
                    )}
                    {message.exercisePlan && (
                      <div className={styles.exerciseCard}>
                        <div className={styles.intensity}>
                          {titleCase(message.exercisePlan.intensity)}
                        </div>
                        {message.exercisePlan.exercises.map((exercise, index) => (
                          <div key={index} className={styles.exerciseItem}>
                            <Dumbbell className="w-4 h-4" />
                            <div>
                              <div>
                                <strong>{exercise.name}</strong>
                              </div>
                              <div className={styles.reason}>
                                {exercise.duration} - {exercise.reason}
                              </div>
                            </div>
                          </div>
                        ))}
                        <div className={styles.burn}>
                          {i18nMessages.aiChat.exerciseBurnLabel}:{" "}
                          {message.exercisePlan.totalBurnEstimate}
                        </div>
                      </div>
                    )}
                  </>
                )}
                <div className={styles.time}>{message.timestamp}</div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className={styles.message}>
              <div className={styles.avatar}>{AI_AVATAR}</div>
              <div className={styles.bubble}>
                <div className={styles.loading}>...</div>
              </div>
            </div>
          )}
        </div>

        <div className={styles.inputArea}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImage}
            style={{ display: "none" }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className={styles.attach}
            aria-label="Upload meal photo"
          >
            <Camera className="w-5 h-5" />
          </button>
          <input
            type="text"
            placeholder={i18nMessages.aiChat.inputPlaceholder}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && handleSend()}
          />
          <button onClick={handleSend} className={styles.send}>
            {i18nMessages.aiChat.sendLabel}
          </button>
        </div>
      </div>

      {showProfileForm && (
        <div className={styles.modal} onClick={() => setShowProfileForm(false)}>
          <div className={styles.form} onClick={(event) => event.stopPropagation()}>
            <h3>{i18nMessages.aiChat.profileFormTitle}</h3>
            <input
              placeholder={i18nMessages.aiChat.profileAgePlaceholder}
              type="number"
              value={profileValues.age || ""}
              onChange={(event) =>
                setUserProfile((prev) => ({
                  ...(prev ?? DEFAULT_PROFILE),
                  age: Number(event.target.value),
                }))
              }
            />
            <input
              placeholder={i18nMessages.aiChat.profileWeightPlaceholder}
              type="number"
              value={profileValues.weight || ""}
              onChange={(event) =>
                setUserProfile((prev) => ({
                  ...(prev ?? DEFAULT_PROFILE),
                  weight: Number(event.target.value),
                }))
              }
            />
            <input
              placeholder={i18nMessages.aiChat.profileHeightPlaceholder}
              type="number"
              value={profileValues.height || ""}
              onChange={(event) =>
                setUserProfile((prev) => ({
                  ...(prev ?? DEFAULT_PROFILE),
                  height: Number(event.target.value),
                }))
              }
            />
            <select
              value={profileValues.gender}
              onChange={(event) =>
                setUserProfile((prev) => ({
                  ...(prev ?? DEFAULT_PROFILE),
                  gender: event.target.value as UserProfile["gender"],
                }))
              }
            >
              <option value="Male">{i18nMessages.aiChat.profileGenderMale}</option>
              <option value="Female">
                {i18nMessages.aiChat.profileGenderFemale}
              </option>
            </select>
            <select
              value={profileValues.goal}
              onChange={(event) =>
                setUserProfile((prev) => ({
                  ...(prev ?? DEFAULT_PROFILE),
                  goal: event.target.value as UserProfile["goal"],
                }))
              }
            >
              <option value="lose">{i18nMessages.aiChat.profileGoalLose}</option>
              <option value="maintain">
                {i18nMessages.aiChat.profileGoalMaintain}
              </option>
              <option value="gain">{i18nMessages.aiChat.profileGoalGain}</option>
            </select>
            <input
              placeholder={i18nMessages.aiChat.profileWorkoutDaysPlaceholder}
              type="number"
              value={profileValues.workoutDays || ""}
              onChange={(event) =>
                setUserProfile((prev) => ({
                  ...(prev ?? DEFAULT_PROFILE),
                  workoutDays: Number(event.target.value),
                }))
              }
            />
            <button onClick={() => setShowProfileForm(false)}>
              {i18nMessages.aiChat.profileSaveCta}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

