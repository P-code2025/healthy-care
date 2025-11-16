// Backend API + Proxy Server for CLOVA Studio + App data

import "dotenv/config";
import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import cookieParser from "cookie-parser";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import { PrismaClient } from "../node_modules/@prisma/client/index.js";
import { getImage, hasImage } from "./imageCache.js";

const app = express();
const PORT = process.env.PORT || 3001;
const prisma = new PrismaClient();

const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET || "dev-access-secret";
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || "dev-refresh-secret";
const ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || "30m";
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";
const REFRESH_COOKIE_NAME = "refreshToken";
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 1000 * 60 * 60 * 24 * 7,
};
const DEFAULT_USER_ID = Number(process.env.DEFAULT_USER_ID || 1);
const ALLOW_GUEST_MODE = process.env.ALLOW_GUEST_MODE !== "false";

// CLOVA Studio credentials from environment variables
const CLOVA_API_KEY = process.env.CLOVA_API_KEY;
const CLOVA_API_URL =
  process.env.CLOVA_API_URL ||
  "https://clovastudio.stream.ntruss.com/v3/chat-completions/HCX-005";

if (!CLOVA_API_KEY) {
  console.error("❌ ERROR: CLOVA_API_KEY not found in .env file!");
  process.exit(1);
}

// Middleware
const allowedOrigins =
  process.env.CORS_ORIGINS?.split(",") || ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"];
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());

const attachUserIfPresent = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return next();
  try {
    req.user = jwt.verify(token, ACCESS_TOKEN_SECRET);
  } catch {
    // ignore invalid tokens for optional routes
  }
  next();
};

app.use(attachUserIfPresent);

const cleanup = async () => {
  await prisma.$disconnect();
  process.exit(0);
};

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);

const mapUser = (user) => ({
  user_id: user.id,
  email: user.email,
  password_hash: user.passwordHash,
  name: user.name,
  age: user.age,
  gender: user.gender,
  height_cm: user.heightCm,
  weight_kg: user.weightKg,
  goal: user.goal,
  activity_level: user.activityLevel,
  exercise_preferences: user.exercisePreferences || {},
});

const mapFoodLog = (log) => ({
  log_id: log.id,
  user_id: log.userId,
  eaten_at: log.eatenAt.toISOString(),
  meal_type: log.mealType,
  food_name: log.foodName,
  calories: log.calories,
  protein_g: log.proteinGrams,
  carbs_g: log.carbsGrams,
  fat_g: log.fatGrams,
  health_consideration: log.healthConsideration,
  is_corrected: log.isCorrected,
  amount: log.amount,
  sugar: log.sugarGrams,
  status: log.status,
  thoughts: log.thoughts,
});

const mapWorkoutLog = (log) => ({
  log_id: log.id,
  user_id: log.userId,
  completed_at: log.completedAt.toISOString(),
  exercise_name: log.exerciseName,
  duration_minutes: log.durationMinutes,
  calories_burned_estimated: log.caloriesBurnedEstimated,
  is_ai_suggested: log.isAiSuggested,
});

const mapSuggestion = (suggestion) => ({
  suggestion_id: suggestion.id,
  user_id: suggestion.userId,
  generated_at: suggestion.generatedAt.toISOString(),
  type: suggestion.type,
  is_applied: suggestion.isApplied,
  content_details: suggestion.contentDetails,
});

const mapCalendarEvent = (event) => ({
  id: event.id,
  userId: event.userId,
  title: event.title,
  eventDate: event.eventDate.toISOString(),
  timeSlot: event.timeSlot,
  category: event.category,
  location: event.location,
  note: event.note,
  linkedModule: event.linkedModule,
});

const parseDateOnly = (dateStr) => {
  const [year, month, day] = dateStr.split("-").map(Number);
  if (!year || !month || !day) {
    throw new Error("Invalid date value");
  }
  return new Date(Date.UTC(year, month - 1, day));
};

const createTokens = (user) => {
  const payload = { id: user.id, email: user.email };
  const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_EXPIRES_IN,
  });
  const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_EXPIRES_IN,
  });
  return { accessToken, refreshToken };
};

const attachRefreshCookie = (res, refreshToken) => {
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, REFRESH_COOKIE_OPTIONS);
};

const sendAuthResponse = (res, user) => {
  const tokens = createTokens(user);
  attachRefreshCookie(res, tokens.refreshToken);
  res.json({
    user: mapUser(user),
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  });
};

const requireAuth = (req, res, next) => {
  if (req.user?.id) return next();
  const header = req.headers.authorization?.split(" ")[1];
  if (header) {
    try {
      req.user = jwt.verify(header, ACCESS_TOKEN_SECRET);
      return next();
    } catch {
      if (!ALLOW_GUEST_MODE) {
        return res.status(401).json({ error: "Invalid token" });
      }
    }
  }
  if (ALLOW_GUEST_MODE) {
    req.user = { id: DEFAULT_USER_ID };
    return next();
  }
  return res.status(401).json({ error: "Unauthorized" });
};

const getUserIdOrFallback = (req) =>
  req.user?.id ||
  Number(req.query.userId || req.body?.userId) ||
  DEFAULT_USER_ID;

const ensureUserIdentity = (req, res) => {
  if (req.user?.id) return req.user.id;
  if (ALLOW_GUEST_MODE) return DEFAULT_USER_ID;
  res.status(401).json({ error: "Unauthorized" });
  return null;
};

const handlePrismaError = (res, error, message) => {
  console.error(message, error);
  res.status(500).json({ error: message });
};

const buildAiContext = async (userId) => {
  const [user, meals, feedback] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        age: true,
        gender: true,
        heightCm: true,
        weightKg: true,
        goal: true,
        activityLevel: true,
        exercisePreferences: true,
      },
    }),
    prisma.foodLog.findMany({
      where: { userId },
      orderBy: { eatenAt: "desc" },
      take: 5,
      select: {
        id: true,
        eatenAt: true,
        mealType: true,
        foodName: true,
        calories: true,
        proteinGrams: true,
        carbsGrams: true,
        fatGrams: true,
        status: true,
      },
    }),
    prisma.aiFeedback.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        planSummary: true,
        planPayload: true,
        rating: true,
        comment: true,
        createdAt: true,
      },
    }),
  ]);

  return {
    user,
    meals,
    feedback,
  };
};

// ========== BASIC ROUTES ==========
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "API Proxy is running" });
});

app.get("/temp-image/:imageId", (req, res) => {
  const { imageId } = req.params;
  if (!hasImage(imageId)) {
    return res.status(404).json({ error: "Image not found" });
  }
  const base64Image = getImage(imageId);
  const buffer = Buffer.from(base64Image, "base64");
  res.set("Content-Type", "image/jpeg");
  res.send(buffer);
});

// ========== AUTH ROUTES ==========
app.post(
  "/api/auth/register",
  body("email").isEmail().withMessage("Valid email required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name, age, gender, height, weight, goal, activityLevel } =
      req.body;
    try {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return res.status(409).json({ error: "Email already registered" });
      }
      const passwordHash = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          name,
          age: age ? Number(age) : null,
          gender: gender || null,
          heightCm: height ? Number(height) : null,
          weightKg: weight ? Number(weight) : null,
          goal: goal || null,
          activityLevel: activityLevel || null,
        },
      });
      sendAuthResponse(res, user);
    } catch (error) {
      handlePrismaError(res, error, "Failed to register user");
    }
  }
);

app.post(
  "/api/auth/login",
  body("email").isEmail(),
  body("password").isLength({ min: 6 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return res.status(401).json({ error: "Invalid credentials" });

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) return res.status(401).json({ error: "Invalid credentials" });

      sendAuthResponse(res, user);
    } catch (error) {
      handlePrismaError(res, error, "Failed to login");
    }
  }
);

app.post("/api/auth/refresh", async (req, res) => {
  const token =
    req.body?.refreshToken || req.cookies?.[REFRESH_COOKIE_NAME] || null;
  if (!token) return res.status(401).json({ error: "Missing refresh token" });

  try {
    const payload = jwt.verify(token, REFRESH_TOKEN_SECRET);
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) return res.status(401).json({ error: "Invalid refresh token" });
    sendAuthResponse(res, user);
  } catch (error) {
    console.error("Refresh token error", error);
    res.status(401).json({ error: "Invalid refresh token" });
  }
});

app.post("/api/auth/logout", (req, res) => {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    ...REFRESH_COOKIE_OPTIONS,
    maxAge: 0,
  });
  res.status(204).send();
});

// ========== USER PROFILE ==========
app.get("/api/users/me", requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(mapUser(user));
  } catch (error) {
    handlePrismaError(res, error, "Failed to fetch profile");
  }
});

app.put("/api/users/me", requireAuth, async (req, res) => {
  const userId = req.user.id;
  const { name, age, gender, heightCm, weightKg, goal, activityLevel, exercisePreferences } = req.body;
  try {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        age: age !== undefined ? Number(age) : undefined,
        gender,
        heightCm: heightCm !== undefined ? Number(heightCm) : undefined,
        weightKg: weightKg !== undefined ? Number(weightKg) : undefined,
        goal,
        activityLevel,
        exercisePreferences: exercisePreferences !== undefined ? exercisePreferences : undefined,
      },
    });
    res.json(mapUser(updated));
  } catch (error) {
    handlePrismaError(res, error, "Failed to update user profile");
  }
});

// ========== FOOD LOGS ==========
app.get("/api/food-log", async (req, res) => {
  const userId = getUserIdOrFallback(req);
  const { start, end } = req.query;
  try {
    const where = { userId };
    if (start || end) {
      where.eatenAt = {};
      if (start) where.eatenAt.gte = new Date(start);
      if (end) where.eatenAt.lte = new Date(end);
    }

    const logs = await prisma.foodLog.findMany({
      where,
      orderBy: { eatenAt: "desc" },
    });
    res.json(logs.map(mapFoodLog));
  } catch (error) {
    handlePrismaError(res, error, "Failed to fetch food logs");
  }
});

app.post("/api/food-log", requireAuth, async (req, res) => {
  const userId = ensureUserIdentity(req, res);
  if (!userId) return;
  const {
    eatenAt,
    mealType,
    foodName,
    calories,
    protein,
    carbs,
    fat,
    healthConsideration,
    isCorrected,
    amount,
    sugar,
    status,
    thoughts,
  } = req.body;
  try {
    const created = await prisma.foodLog.create({
      data: {
        userId,
        eatenAt: eatenAt ? new Date(eatenAt) : new Date(),
        mealType: mealType || "Meal",
        foodName: foodName || "Food Item",
        calories: Number(calories) || 0,
        proteinGrams: Number(protein) || 0,
        carbsGrams: Number(carbs) || 0,
        fatGrams: Number(fat) || 0,
        healthConsideration: healthConsideration || null,
        isCorrected: Boolean(isCorrected),
        amount: amount || null,
        sugarGrams: sugar !== undefined ? Number(sugar) : null,
        status: status || null,
        thoughts: thoughts || null,
      },
    });
    res.status(201).json(mapFoodLog(created));
  } catch (error) {
    handlePrismaError(res, error, "Failed to create food log");
  }
});

app.put("/api/food-log/:id", requireAuth, async (req, res) => {
  const userId = ensureUserIdentity(req, res);
  if (!userId) return;
  const id = Number(req.params.id);
  const {
    eatenAt,
    mealType,
    foodName,
    calories,
    protein,
    carbs,
    fat,
    healthConsideration,
    isCorrected,
    amount,
    sugar,
    status,
    thoughts,
  } = req.body;
  try {
    const updated = await prisma.foodLog.update({
      where: { id, userId },
      data: {
        eatenAt: eatenAt ? new Date(eatenAt) : undefined,
        mealType,
        foodName,
        calories: calories !== undefined ? Number(calories) : undefined,
        proteinGrams: protein !== undefined ? Number(protein) : undefined,
        carbsGrams: carbs !== undefined ? Number(carbs) : undefined,
        fatGrams: fat !== undefined ? Number(fat) : undefined,
        healthConsideration,
        isCorrected:
          typeof isCorrected === "boolean" ? isCorrected : undefined,
        amount,
        sugarGrams: sugar !== undefined ? Number(sugar) : undefined,
        status,
        thoughts,
      },
    });
    res.json(mapFoodLog(updated));
  } catch (error) {
    handlePrismaError(res, error, "Failed to update food log");
  }
});

app.delete("/api/food-log/:id", requireAuth, async (req, res) => {
  const userId = ensureUserIdentity(req, res);
  if (!userId) return;
  const id = Number(req.params.id);
  try {
    await prisma.foodLog.delete({ where: { id, userId } });
    res.status(204).send();
  } catch (error) {
    handlePrismaError(res, error, "Failed to delete food log");
  }
});

app.post("/api/food-log/batch-delete", requireAuth, async (req, res) => {
  const userId = ensureUserIdentity(req, res);
  if (!userId) return;
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: "ids must be a non-empty array" });
  }
  try {
    const result = await prisma.foodLog.deleteMany({
      where: {
        id: { in: ids.map(Number) },
        userId,
      },
    });
    res.json({ deleted: result.count });
  } catch (error) {
    handlePrismaError(res, error, "Failed to batch delete food logs");
  }
});

// ========== WORKOUT LOGS ==========
app.get("/api/workout-log", async (req, res) => {
  const userId = getUserIdOrFallback(req);
  try {
    const logs = await prisma.workoutLog.findMany({
      where: { userId },
      orderBy: { completedAt: "desc" },
    });
    res.json(logs.map(mapWorkoutLog));
  } catch (error) {
    handlePrismaError(res, error, "Failed to fetch workout logs");
  }
});

app.post("/api/workout-log", requireAuth, async (req, res) => {
  const userId = ensureUserIdentity(req, res);
  if (!userId) return;
  const {
    completedAt,
    exerciseName,
    durationMinutes,
    caloriesBurnedEstimated,
    isAiSuggested,
  } = req.body;
  try {
    const created = await prisma.workoutLog.create({
      data: {
        userId,
        completedAt: completedAt ? new Date(completedAt) : new Date(),
        exerciseName: exerciseName || "Workout",
        durationMinutes: Number(durationMinutes) || 0,
        caloriesBurnedEstimated: Number(caloriesBurnedEstimated) || 0,
        isAiSuggested: Boolean(isAiSuggested),
      },
    });
    res.status(201).json(mapWorkoutLog(created));
  } catch (error) {
    handlePrismaError(res, error, "Failed to create workout log");
  }
});

app.put("/api/workout-log/:id", requireAuth, async (req, res) => {
  const userId = ensureUserIdentity(req, res);
  if (!userId) return;
  const id = Number(req.params.id);
  const {
    completedAt,
    exerciseName,
    durationMinutes,
    caloriesBurnedEstimated,
    isAiSuggested,
  } = req.body;
  try {
    const updated = await prisma.workoutLog.update({
      where: { id, userId },
      data: {
        completedAt: completedAt ? new Date(completedAt) : undefined,
        exerciseName,
        durationMinutes:
          durationMinutes !== undefined ? Number(durationMinutes) : undefined,
        caloriesBurnedEstimated:
          caloriesBurnedEstimated !== undefined
            ? Number(caloriesBurnedEstimated)
            : undefined,
        isAiSuggested:
          typeof isAiSuggested === "boolean" ? isAiSuggested : undefined,
      },
    });
    res.json(mapWorkoutLog(updated));
  } catch (error) {
    handlePrismaError(res, error, "Failed to update workout log");
  }
});

app.delete("/api/workout-log/:id", requireAuth, async (req, res) => {
  const userId = ensureUserIdentity(req, res);
  if (!userId) return;
  const id = Number(req.params.id);
  try {
    await prisma.workoutLog.delete({ where: { id, userId } });
    res.status(204).send();
  } catch (error) {
    handlePrismaError(res, error, "Failed to delete workout log");
  }
});

// ========== AI SUGGESTIONS ==========
app.get("/api/ai-suggestions", async (req, res) => {
  const userId = getUserIdOrFallback(req);
  try {
    const suggestions = await prisma.aiSuggestion.findMany({
      where: { userId },
      orderBy: { generatedAt: "desc" },
    });
    res.json(suggestions.map(mapSuggestion));
  } catch (error) {
    handlePrismaError(res, error, "Failed to fetch AI suggestions");
  }
});

app.post(
  "/api/ai-suggestions/:id/apply",
  requireAuth,
  async (req, res) => {
    const userId = ensureUserIdentity(req, res);
    if (!userId) return;
    const id = Number(req.params.id);
    try {
      const updated = await prisma.aiSuggestion.update({
        where: { id, userId },
        data: { isApplied: true },
      });
      res.json(mapSuggestion(updated));
    } catch (error) {
      handlePrismaError(res, error, "Failed to update suggestion");
    }
  }
);

// ========== CALENDAR ==========
app.get("/api/calendar-events", async (req, res) => {
  const userId = getUserIdOrFallback(req);
  const { start, end, category, linkedModule } = req.query;
  
  const where = { userId };
  if (start || end) {
    where.eventDate = {};
    if (start) where.eventDate.gte = new Date(start);
    if (end) where.eventDate.lte = new Date(end);
  }
  if (category) where.category = category;
  if (linkedModule) where.linkedModule = linkedModule;

  try {
    const events = await prisma.calendarEvent.findMany({
      where,
      orderBy: { eventDate: "asc" },
    });
    res.json(events.map(mapCalendarEvent));
  } catch (error) {
    handlePrismaError(res, error, "Failed to fetch calendar events");
  }
});

app.post("/api/calendar-events", requireAuth, async (req, res) => {
  const userId = ensureUserIdentity(req, res);
  if (!userId) return;
  try {
    const { title, date, time, category, location, note, linkedModule } =
      req.body;
    if (!title || !date || !time || !category) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const created = await prisma.calendarEvent.create({
      data: {
        userId,
        title,
        eventDate: parseDateOnly(date),
        timeSlot: time,
        category,
        location: location || null,
        note: note || null,
        linkedModule: linkedModule || null,
      },
    });
    res.status(201).json(mapCalendarEvent(created));
  } catch (error) {
    handlePrismaError(res, error, "Failed to create calendar event");
  }
});

app.put("/api/calendar-events/:id", requireAuth, async (req, res) => {
  const userId = ensureUserIdentity(req, res);
  if (!userId) return;
  const id = Number(req.params.id);
  try {
    const existing = await prisma.calendarEvent.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return res.status(404).json({ error: "Event not found" });
    }

    const { title, date, time, category, location, note, linkedModule } =
      req.body;
    const updated = await prisma.calendarEvent.update({
      where: { id },
      data: {
        title,
        eventDate: date ? parseDateOnly(date) : undefined,
        timeSlot: time,
        category,
        location,
        note,
        linkedModule: linkedModule || null,
      },
    });
    res.json(mapCalendarEvent(updated));
  } catch (error) {
    handlePrismaError(res, error, "Failed to update calendar event");
  }
});

app.delete("/api/calendar-events/:id", requireAuth, async (req, res) => {
  const userId = ensureUserIdentity(req, res);
  if (!userId) return;
  const id = Number(req.params.id);
  try {
    const existing = await prisma.calendarEvent.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return res.status(404).json({ error: "Event not found" });
    }
    await prisma.calendarEvent.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    handlePrismaError(res, error, "Failed to delete calendar event");
  }
});

// ========== STATISTICS ==========
app.get("/api/statistics/daily", async (req, res) => {
  const userId = getUserIdOrFallback(req);
  const { date } = req.query;
  
  try {
    if (!date) {
      return res.status(400).json({ error: "Date parameter is required (format: YYYY-MM-DD)" });
    }

    const targetDate = parseDateOnly(date);
    const nextDay = new Date(targetDate);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);

    // Aggregate food logs
    const foodStats = await prisma.foodLog.aggregate({
      where: {
        userId,
        eatenAt: {
          gte: targetDate,
          lt: nextDay,
        },
      },
      _sum: {
        calories: true,
        proteinGrams: true,
        carbsGrams: true,
        fatGrams: true,
      },
      _count: true,
    });

    // Aggregate workout logs
    const workoutStats = await prisma.workoutLog.aggregate({
      where: {
        userId,
        completedAt: {
          gte: targetDate,
          lt: nextDay,
        },
      },
      _sum: {
        caloriesBurnedEstimated: true,
        durationMinutes: true,
      },
      _count: true,
    });

    res.json({
      date: date,
      total_calories: foodStats._sum.calories || 0,
      total_protein: foodStats._sum.proteinGrams || 0,
      total_carbs: foodStats._sum.carbsGrams || 0,
      total_fat: foodStats._sum.fatGrams || 0,
      calories_burned: workoutStats._sum.caloriesBurnedEstimated || 0,
      exercise_duration: workoutStats._sum.durationMinutes || 0,
      meals_count: foodStats._count || 0,
      workouts_count: workoutStats._count || 0,
    });
  } catch (error) {
    handlePrismaError(res, error, "Failed to fetch daily statistics");
  }
});

app.get("/api/statistics/weekly", async (req, res) => {
  const userId = getUserIdOrFallback(req);
  const { startDate, endDate } = req.query;

  try {
    if (!startDate || !endDate) {
      return res.status(400).json({ error: "startDate and endDate parameters are required (format: YYYY-MM-DD)" });
    }

    const start = parseDateOnly(startDate);
    const end = parseDateOnly(endDate);
    end.setUTCDate(end.getUTCDate() + 1); // Include end date

    // Get all food logs in range
    const foodLogs = await prisma.foodLog.findMany({
      where: {
        userId,
        eatenAt: { gte: start, lt: end },
      },
      select: {
        eatenAt: true,
        calories: true,
        proteinGrams: true,
        carbsGrams: true,
        fatGrams: true,
      },
    });

    // Get all workout logs in range
    const workoutLogs = await prisma.workoutLog.findMany({
      where: {
        userId,
        completedAt: { gte: start, lt: end },
      },
      select: {
        completedAt: true,
        caloriesBurnedEstimated: true,
        durationMinutes: true,
      },
    });

    // Group by date
    const dailyData = {};
    
    foodLogs.forEach(log => {
      const dateKey = log.eatenAt.toISOString().split('T')[0];
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = {
          date: dateKey,
          total_calories: 0,
          total_protein: 0,
          total_carbs: 0,
          total_fat: 0,
          calories_burned: 0,
          exercise_duration: 0,
          meals_count: 0,
          workouts_count: 0,
        };
      }
      dailyData[dateKey].total_calories += log.calories;
      dailyData[dateKey].total_protein += log.proteinGrams;
      dailyData[dateKey].total_carbs += log.carbsGrams;
      dailyData[dateKey].total_fat += log.fatGrams;
      dailyData[dateKey].meals_count += 1;
    });

    workoutLogs.forEach(log => {
      const dateKey = log.completedAt.toISOString().split('T')[0];
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = {
          date: dateKey,
          total_calories: 0,
          total_protein: 0,
          total_carbs: 0,
          total_fat: 0,
          calories_burned: 0,
          exercise_duration: 0,
          meals_count: 0,
          workouts_count: 0,
        };
      }
      dailyData[dateKey].calories_burned += log.caloriesBurnedEstimated;
      dailyData[dateKey].exercise_duration += log.durationMinutes;
      dailyData[dateKey].workouts_count += 1;
    });

    // Convert to array and sort by date
    const weeklyStats = Object.values(dailyData).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );

    res.json(weeklyStats);
  } catch (error) {
    handlePrismaError(res, error, "Failed to fetch weekly statistics");
  }
});

// ========== CLOVA AI FOOD RECOGNITION ==========
app.post("/api/recognize-food", requireAuth, async (req, res) => {
  try {
    const { base64Image, overrideName, overrideAmount } = req.body;
    if (!base64Image) {
      return res.status(400).json({ error: "Missing base64Image" });
    }

    let userPrompt = "Analyze this food image and return the nutritional information in JSON format.";
    if (overrideName || overrideAmount) {
      userPrompt = `The food is "${overrideName || 'unknown'}" with serving size "${overrideAmount || '100g'}". Estimate nutrition per 100g and scale to the serving size.`;
    }

    const response = await fetch(CLOVA_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CLOVA_API_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-NCP-CLOVASTUDIO-REQUEST-ID": `food-recognition-${Date.now()}`,
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: [
              {
                type: "text",
                text: `You are a professional food nutrition AI. Return ONLY a valid JSON with this structure:

{
  "food_name": "name in English (e.g. 'Korean Fried Rice Cakes with Sauce')",
  "calories": total calories for the serving,
  "protein": total protein in grams,
  "carbs": total carbs in grams,
  "fats": total fat in grams,
  "sugar": total sugar in grams (0 if unknown),
  "portion_size": "e.g. 300g, 1 bowl, 2 pieces",
  "per_100g": {
    "calories": calories per 100g,
    "protein": protein per 100g,
    "carbs": carbs per 100g,
    "fats": fat per 100g,
    "sugar": sugar per 100g
  }
}

Use English names. Be accurate. Do NOT add extra text.`,
              },
            ],
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: userPrompt,
              },
              {
                type: "image_url",
                dataUri: { data: base64Image },
              },
            ],
          },
        ],
        temperature: 0.2,
        topP: 0.8,
        maxTokens: 400,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        error: errorData.message || `API Error: ${response.statusText}`,
      });
    }

    const data = await response.json();
    const content = data.result?.message?.content || "";

    let nutritionData;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found");

      let jsonString = jsonMatch[0];

      // Clean up any unit suffixes
      jsonString = jsonString
  .replace(/"(calories|protein|carbs|fats|sugar)":\s*"?(\d+\.?\d*)\s*(kcal|g|grams)?"?/gi, '"$1": $2')
  .replace(/"(calories|protein|carbs|fats|sugar)":\s*"?(\d+\.?\d*)\s*(kcal|g|grams)?\s*"/gi, '"$1": $2')
  .replace(/,\s*}/g, '}')  
  .replace(/,\s*]/g, ']');

      nutritionData = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      return res.status(500).json({
        error: "AI could not analyze the food",
        raw_content: content,
      });
    }

    res.json({
      success: true,
      data: {
        foodName: nutritionData.food_name || "Unknown Food",
        calories: parseFloat(nutritionData.calories) || 0,
        protein: parseFloat(nutritionData.protein) || 0,
        carbs: parseFloat(nutritionData.carbs) || 0,
        fats: parseFloat(nutritionData.fats) || 0,
        portionSize: nutritionData.portion_size || "100g",
        confidence: parseFloat(nutritionData.confidence) || 0.5,
      },
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ========== AI FEEDBACK & CONTEXT ==========
app.post(
  "/api/ai-feedback",
  requireAuth,
  body("planSummary").isLength({ min: 3 }).withMessage("planSummary required"),
  body("planPayload").notEmpty().withMessage("planPayload is required"),
  body("rating").isInt({ min: 1, max: 5 }).withMessage("rating must be between 1 and 5"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const entry = await prisma.aiFeedback.create({
        data: {
          userId: req.user.id,
          planSummary: req.body.planSummary.trim(),
          planPayload: req.body.planPayload,
          rating: Number(req.body.rating),
          comment: req.body.comment?.trim() || null,
        },
      });
      res.status(201).json(entry);
    } catch (error) {
      handlePrismaError(res, error, "Failed to store AI feedback");
    }
  }
);

app.get("/api/ai-feedback", requireAuth, async (req, res) => {
  try {
    const take = Math.min(Number(req.query.limit) || 20, 100);
    const entries = await prisma.aiFeedback.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      take,
    });
    res.json(entries);
  } catch (error) {
    handlePrismaError(res, error, "Failed to fetch AI feedback");
  }
});

app.get("/api/ai/context", requireAuth, async (req, res) => {
  try {
    const context = await buildAiContext(req.user.id);
    res.json(context);
  } catch (error) {
    handlePrismaError(res, error, "Failed to build AI context");
  }
});
app.listen(PORT, () => {
  console.log(`
🚀 API Proxy Server is running!
🌐 URL: http://localhost:${PORT}
❤️ Health check: http://localhost:${PORT}/health
📅 Calendar API: /api/calendar-events
🍱 Food recognition: POST /api/recognize-food
`);
});

