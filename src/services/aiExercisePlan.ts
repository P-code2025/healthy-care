import { ClovaXClient } from "../api/clovax/client";
import type { ClovaMessage as ClientClovaMessage } from "../api/clovax/client";
import { http } from "./http";

export interface AIExercisePlan {
  summary: string;
  intensity: "light" | "moderate" | "intense";
  exercises: { name: string; duration: string; reason: string }[];
  totalBurnEstimate: string;
  advice: string;
}

interface AiContextPayload {
  user: {
    age: number | null;
    gender: string | null;
    heightCm: number | null;
    weightKg: number | null;
    goal: string | null;
    activityLevel: string | null;
    exercisePreferences: Record<string, boolean> | null;
  } | null;
  meals: Array<{
    eatenAt: string;
    mealType: string;
    foodName: string | null;
    calories: number | null;
  }>;
  feedback: Array<{
    planSummary: string | null;
    rating: number | null;
    comment: string | null;
    createdAt: string;
  }>;
}

interface RawExercisePlan {
  summary?: string;
  intensity?: string;
  totalBurnEstimate?: string;
  advice?: string;
  exercises?: Array<{
    name?: string;
    duration?: string;
    reason?: string;
  }>;
}

interface ExercisePlanUser {
  age?: number;
  gender?: string;
  height?: number;
  weight?: number;
  goal?: string;
  goalWeight?: number;
  foodEntries?: Array<{ foodName?: string; amount?: string }>;
  workoutPreference?: string[];
}

const MIN_BURN_KCAL = 250;
const MAX_BURN_KCAL = 600;
const CONTEXT_CACHE_TTL = 1000 * 60 * 5;

let aiContextCache:
  | {
    data: AiContextPayload | null;
    expiresAt: number;
  }
  | null = null;

const INTENSITY_ALIASES: Record<string, AIExercisePlan["intensity"]> = {
  light: "light",
  "nh?": "light",
  low: "light",
  easy: "light",
  gentle: "light",
  moderate: "moderate",
  "v?a": "moderate",
  medium: "moderate",
  balanced: "moderate",
  intense: "intense",
  "n?ng": "intense",
  hard: "intense",
  vigorous: "intense",
};

const normalizeIntensity = (value: unknown): AIExercisePlan["intensity"] => {
  const key = String(value ?? "").trim().toLowerCase();
  return (
    INTENSITY_ALIASES[key] ||
    (key.includes("light")
      ? "light"
      : key.includes("intense") || key.includes("hard")
        ? "intense"
        : "moderate")
  );
};

const fetchAiContext = async (): Promise<AiContextPayload | null> => {
  if (aiContextCache && aiContextCache.expiresAt > Date.now()) {
    return aiContextCache.data;
  }
  try {
    const data = (await http.request("/api/ai/context")) as AiContextPayload;
    aiContextCache = { data, expiresAt: Date.now() + CONTEXT_CACHE_TTL };
    return data;
  } catch (error) {
    console.warn("Failed to fetch AI context", error);
    aiContextCache = { data: null, expiresAt: Date.now() + 60_000 };
    return null;
  }
};

const formatPreferenceMap = (
  prefs?: Record<string, boolean> | null
): string => {
  if (!prefs) return "not specified";
  const enabled = Object.entries(prefs)
    .filter(([, value]) => Boolean(value))
    .map(([key]) => key.replace(/_/g, " "));
  return enabled.length ? enabled.join(", ") : "not specified";
};

const describeRecentMealContext = (
  meals?: AiContextPayload["meals"]
): string => {
  if (!meals || meals.length === 0) return "no recent meals captured";
  return meals
    .slice(0, 3)
    .map(
      (meal) =>
        `${meal.mealType}: ${meal.foodName || "Meal"} (${meal.calories ?? "unknown"
        } kcal)`
    )
    .join(" | ");
};

const summarizeFeedback = (
  entries?: AiContextPayload["feedback"]
): string => {
  if (!entries || entries.length === 0) {
    return "no ratings yet";
  }
  const count = entries.length;
  const avg =
    entries.reduce((sum, entry) => sum + (entry.rating ?? 0), 0) / count;
  const latestComment = entries.find((entry) => entry.comment)?.comment;
  return `${avg.toFixed(1)}/5 avg from last ${count} ratings${latestComment ? `; latest note: "${latestComment}"` : ""
    }`;
};

const matchPlanName = (name: string, availablePlans: string[]) => {
  if (!name) return "";
  const lower = name.toLowerCase();
  const exact = availablePlans.find((plan) => plan.toLowerCase() === lower);
  if (exact) return exact;
  const fuzzy = availablePlans.find(
    (plan) =>
      plan.toLowerCase().includes(lower) || lower.includes(plan.toLowerCase())
  );
  return fuzzy || name;
};

const clampCaloriesEstimate = (value: string): number => {
  const match = value.match(/\d+(\.\d+)?/);
  const parsed = match ? Number(match[0]) : 350;
  if (!Number.isFinite(parsed)) return 350;
  return Math.min(MAX_BURN_KCAL, Math.max(MIN_BURN_KCAL, Math.round(parsed)));
};

const sanitizeDuration = (value: string) => {
  const match = String(value || "").match(/\d+/);
  const amount = match ? match[0] : "20";
  return `${amount} minutes`;
};

const sanitizeReason = (value: string) => {
  const trimmed = String(value || "").trim();
  return trimmed || "Keeps energy balanced and supports recovery.";
};

function normalizeAIPlan(
  data: RawExercisePlan | null | undefined,
  availablePlans: string[]
): AIExercisePlan {
  if (!data || typeof data !== "object") {
    return createFallbackPlan();
  }

  const exercises = Array.isArray(data.exercises)
    ? data.exercises
      .filter((ex) => Boolean(ex?.name))
      .map((ex) => ({
        name: matchPlanName(String(ex.name), availablePlans),
        duration: String(ex.duration || "20 minutes").trim(),
        reason: String(
          ex.reason || "Supports balance between strength and mobility."
        ).trim(),
      }))
      .slice(0, 3)
    : [];

  return {
    summary: String(
      data.summary || "Personalized workout plan for today"
    ).trim(),
    intensity: normalizeIntensity(data.intensity),
    exercises,
    totalBurnEstimate: String(
      data.totalBurnEstimate || "300-400 kcal"
    ).trim(),
    advice: String(
      data.advice || "Stay hydrated and listen to your body during the session."
    ).trim(),
  };
}

const enforcePlanConstraints = (
  plan: AIExercisePlan,
  caloriePercent: number,
  availablePlans: string[]
): AIExercisePlan => {
  const exercises =
    plan.exercises.length > 0
      ? plan.exercises.map((ex) => ({
        name: matchPlanName(ex.name, availablePlans),
        duration: sanitizeDuration(ex.duration),
        reason: sanitizeReason(ex.reason),
      }))
      : createFallbackPlan().exercises;

  let intensity = plan.intensity;
  if (caloriePercent < 30) {
    intensity = "light";
  } else if (caloriePercent > 85) {
    intensity = "intense";
  } else if (caloriePercent > 70 && intensity === "light") {
    intensity = "moderate";
  }

  const totalBurn = clampCaloriesEstimate(plan.totalBurnEstimate);

  return {
    summary:
      plan.summary || "Personalized workout plan designed for today.",
    intensity,
    exercises,
    totalBurnEstimate: `${totalBurn} kcal`,
    advice:
      plan.advice ||
      "Stay hydrated and adjust the pace if you feel fatigued.",
  };
};

function extractText(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((part) =>
        typeof part === "object" && part !== null && "text" in part
          ? String((part as { text?: string }).text || "")
          : ""
      )
      .join("");
  }
  return "";
}

function autoFixJSON(input: string): string {
  let json = input.trim().replace(/```json|```/g, "");
  const start = json.indexOf("{");
  const end = json.lastIndexOf("}") + 1;
  if (start === -1 || end === 0) return "{}";
  json = json.slice(start, end);

  let brace = 0,
    bracket = 0;
  for (const c of json) {
    if (c === "{") brace++;
    if (c === "}") brace--;
    if (c === "[") bracket++;
    if (c === "]") bracket--;
  }
  json += "}".repeat(Math.max(0, brace));
  json += "]".repeat(Math.max(0, bracket));

  return json.replace(/,\s*}/g, "}").replace(/,\s*]/g, "]");
}

function createFallbackPlan(): AIExercisePlan {
  return {
    summary: "Default suggestion: keep things light and focus on mobility",
    intensity: "light",
    exercises: [
      {
        name: "Morning Yoga Flow",
        duration: "20 minutes",
        reason: "Loosens muscles and primes the body for the day.",
      },
      {
        name: "Brisk Walking",
        duration: "30 minutes",
        reason: "Gentle cardio to maintain calorie balance.",
      },
    ],
    totalBurnEstimate: "250 kcal",
    advice: "Hydrate well and include a 5-minute warm-up before every session.",
  };
}

type CacheType = "daily" | "query";

const DEFAULT_QUERY = "Create a safe workout plan for today";

const formatGender = (value?: string) => {
  if (!value) return "not specified";
  const lower = value.toLowerCase();
  if (lower.includes("nam") || lower.includes("male")) return "male";
  if (lower.includes("n?") || lower.includes("female")) return "female";
  return value;
};

const formatMeals = (entries?: Array<{ foodName?: string; amount?: string }>) => {
  if (!entries || entries.length === 0) return "no meals logged";
  return entries
    .slice(0, 3)
    .map(
      (entry) =>
        `${entry.foodName || "Meal"}${entry.amount ? ` (${entry.amount})` : ""}`
    )
    .join(", ");
};

export async function generateAIExercisePlan(
  dailyIntake: number,
  user: ExercisePlanUser,
  availablePlans: string[],
  userQuery: string = DEFAULT_QUERY,
  cacheType: CacheType = "query"
): Promise<AIExercisePlan> {
  const client = new ClovaXClient("HCX-005");

  const hasAnthropometrics = user.weight && user.height;
  const bmi = hasAnthropometrics
    ? ((user.weight ?? 0) / (((user.height ?? 0) / 100) ** 2)).toFixed(1)
    : "not enough data";
  const bmr = user.gender === "Nam"
    ? 88.362 + 13.397 * (user.weight ?? 0) + 4.799 * (user.height ?? 0) - 5.677 * (user.age ?? 0)
    : 447.593 + 9.247 * (user.weight ?? 0) + 3.098 * (user.height ?? 0) - 4.33 * (user.age ?? 0);
  const tdee = Math.round((Number.isFinite(bmr) ? bmr : 2000) * 1.55);
  const caloriePercent = tdee > 0 ? Math.round((dailyIntake / tdee) * 100) : 0;
  const goalText = user.goal === "lose" ? "fat loss" : "maintenance";
  let mealSummary = formatMeals(user.foodEntries);
  let preferenceSummary =
    user.workoutPreference && user.workoutPreference.length > 0
      ? user.workoutPreference.join(", ")
      : "not specified";
  const formattedGender = formatGender(user.gender);
  const aiContext = await fetchAiContext();
  const recentMealContext = describeRecentMealContext(aiContext?.meals);
  if (
    mealSummary === "no meals logged" &&
    recentMealContext !== "no recent meals captured"
  ) {
    mealSummary = recentMealContext;
  }
  if (
    preferenceSummary === "not specified" &&
    aiContext?.user?.exercisePreferences
  ) {
    const contextualPreferences = formatPreferenceMap(
      aiContext.user.exercisePreferences
    );
    if (contextualPreferences !== "not specified") {
      preferenceSummary = contextualPreferences;
    }
  }
  const contextBlock = aiContext
    ? `

== HISTORICAL CONTEXT ==
Recent ratings: ${summarizeFeedback(aiContext.feedback)}
Recent logged meals: ${recentMealContext}
Preference insights: ${formatPreferenceMap(aiContext.user?.exercisePreferences)}
`.trim()
    : "";

  let cached: string | null = null;
  if (cacheType === "daily") {
    const profileKey = `${user.age}_${user.gender}_${user.weight}_${user.height}_${user.goalWeight}`;
    const cacheKey = `aiPlan_daily_${new Date().toDateString()}_${dailyIntake}_${profileKey.substring(0, 50)}`;
    cached = localStorage.getItem(cacheKey);
    if (cached) {
      if (import.meta.env.DEV) {
        console.log("AI exercise cache hit:", cacheKey);
      }
      return JSON.parse(cached);
    }
  }

  const prompt = `
You are a certified strength and conditioning coach. Create an encouraging, safe workout recommendation.

== USER SNAPSHOT ==
Gender: ${formattedGender}
Age: ${user.age ?? "unknown"}
Weight: ${user.weight ?? "unknown"} kg
Height: ${user.height ?? "unknown"} cm
BMI: ${bmi}
Goal: ${goalText}
Goal weight: ${user.goalWeight ?? "not specified"} kg
TDEE: ${tdee} kcal
Calories consumed today: ${dailyIntake} kcal (${caloriePercent}% of TDEE)
Recent meals: ${mealSummary}
Workout preferences: ${preferenceSummary}
User question: "${userQuery || DEFAULT_QUERY}"
${contextBlock ? `\n${contextBlock}\n` : ""}

== GUIDELINES ==
1. Choose intensity based on calorie percent: <30% = light, 30-70% = moderate, >70% = intense/recovery.
2. If the query mentions pain, fatigue, or "easy", always choose light intensity with yoga, walking, or stretching.
3. Pick 1-3 exercises from the provided list. If you need a variation, choose the closest name from the list.
4. Keep total calories burned between 250 and 600 kcal.
5. Provide specific reasons tied to the user's goal or energy state.
6. Respond in English and return ONLY valid JSON matching the schema below.

== AVAILABLE WORKOUTS ==
${availablePlans.map((plan, index) => `${index + 1}. ${plan}`).join("\n")}

== JSON SCHEMA ==
{
  "summary": "string",
  "intensity": "light|moderate|intense",
  "totalBurnEstimate": "string",
  "advice": "string",
  "exercises": [
    { "name": "string", "duration": "string", "reason": "string" }
  ]
}`.trim();

  const messages: ClientClovaMessage[] = [
    {
      role: "system",
      content: [{ type: "text", text: "Return strictly JSON with no explanation." }],
    },
    { role: "user", content: [{ type: "text", text: prompt }] },
  ];

  try {
    const request = client.createRequest(messages);
    request.maxTokens = 1500;
    request.temperature = 0.35;
    request.topP = 0.85;

    const response = await client.createChatCompletion(request);
    const rawText = extractText(response.result.message.content);
    if (import.meta.env.DEV) {
      console.log("AI exercise response:", rawText);
    }

    const cleaned = rawText.replace(/```json|```/g, "").trim();
    const fixedJSON = autoFixJSON(cleaned);
    let parsed: RawExercisePlan | null = null;

    try {
      parsed = JSON.parse(fixedJSON) as RawExercisePlan;
    } catch (error) {
      console.error("Failed to parse AI exercise JSON:", error);
      const fallback = createFallbackPlan();
      if (cacheType === "daily") {
        localStorage.setItem(
          `aiPlan_daily_${new Date().toDateString()}`,
          JSON.stringify(fallback)
        );
      }
      return fallback;
    }

    const normalized = normalizeAIPlan(parsed, availablePlans);
    const adjusted = enforcePlanConstraints(normalized, caloriePercent, availablePlans);

    if (cacheType === "daily") {
      const profileKey = `${user.age}_${user.gender}_${user.weight}_${user.height}_${user.goalWeight}`;
      const cacheKey = `aiPlan_daily_${new Date().toDateString()}_${dailyIntake}_${profileKey.substring(0, 50)}`;
      localStorage.setItem(cacheKey, JSON.stringify(adjusted));
    }

    return adjusted;
  } catch (error) {
    console.error("AI exercise plan error:", error);
    const fallback = createFallbackPlan();
    if (cacheType === "daily") {
      localStorage.setItem(
        `aiPlan_daily_${new Date().toDateString()}`,
        JSON.stringify(fallback)
      );
    }
    return fallback;
  }
}
