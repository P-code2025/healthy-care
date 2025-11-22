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
  neck_cm: user.neckCm,
  waist_cm: user.waistCm,
  hip_cm: user.hipCm,
  biceps_cm: user.bicepsCm,
  thigh_cm: user.thighCm,
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

const requireAuth = async (req, res, next) => {
  let userId;

  // Check if user is already attached (by attachUserIfPresent)
  if (req.user?.id) {
    userId = req.user.id;
  } else {
    // Check header if not attached
    const header = req.headers.authorization?.split(" ")[1];
    if (header) {
      try {
        const decoded = jwt.verify(header, ACCESS_TOKEN_SECRET);
        userId = decoded.id;
      } catch {
        // Token invalid, fall through to guest check
      }
    }
  }

  // Fallback to guest mode if no valid token
  if (!userId && ALLOW_GUEST_MODE) {
    userId = DEFAULT_USER_ID;
  }

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Verify user exists in DB
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true } // Only select fields that definitely exist
    });

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = { ...req.user, ...user }; // Merge with existing req.user if any
    return next();
  } catch (error) {
    console.error("Auth verification error:", error);
    return res.status(500).json({ error: "Internal server error during auth" });
  }
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
  const { name, age, gender, heightCm, weightKg, goal, activityLevel, exercisePreferences, neckCm, waistCm, hipCm, bicepsCm, thighCm } = req.body;
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
        neckCm: neckCm !== undefined ? Number(neckCm) : undefined,
        waistCm: waistCm !== undefined ? Number(waistCm) : undefined,
        hipCm: hipCm !== undefined ? Number(hipCm) : undefined,
        bicepsCm: bicepsCm !== undefined ? Number(bicepsCm) : undefined,
        thighCm: thighCm !== undefined ? Number(thighCm) : undefined,
      },
    });
    res.json(mapUser(updated));
  } catch (error) {
    handlePrismaError(res, error, "Failed to update user profile");
  }
});

app.put("/api/users/me/measurements", requireAuth, async (req, res) => {
  const userId = req.user.id;
  const { neckCm, waistCm, hipCm, bicepsCm, thighCm } = req.body;

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { neckCm, waistCm, hipCm, bicepsCm, thighCm },
  });

  res.json(mapUser(updated));
});

// ========== FOOD LOGS ==========
app.get("/api/food-log", async (req, res) => {
  const userId = getUserIdOrFallback(req);
  const { start, end } = req.query;

  // Hàm chuyển YYYY-MM-DD → đúng 00:00:00 UTC của ngày đó
  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d));
  };

  try {
    const where = { userId };

    if (start || end) {
      where.eatenAt = {};
      if (start) where.eatenAt.gte = parseDate(start);
      if (end) {
        const endDate = parseDate(end);
        if (endDate) {
          endDate.setUTCDate(endDate.getUTCDate() + 1);
          where.eatenAt.lt = endDate;
        }
      }
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
  const { start, end } = req.query;

  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d));
  };

  try {
    const where = { userId };

    if (start || end) {
      where.completedAt = {};
      if (start) where.completedAt.gte = parseDate(start);
      if (end) {
        const endDate = parseDate(end);
        if (endDate) {
          endDate.setUTCDate(endDate.getUTCDate() + 1);
          where.completedAt.lt = endDate;
        }
      }
    }

    const logs = await prisma.workoutLog.findMany({
      where,
      orderBy: { completedAt: "desc" },
    });

    res.json(logs.map(mapWorkoutLog));
  } catch (error) {
    console.error("Workout log fetch error:", error);
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

    const userDescription = overrideName ? `${overrideName} (serving: ${overrideAmount || '100g'})` : 'Unknown meal';

    const userPrompt = `
Analyze the food in the image.
User description: "${userDescription}"
Parse ALL food items and amounts mentioned.
Estimate nutrition for each item separately.
Return total + detailed breakdown in JSON.
    `.trim();

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
            content: [{
              type: "text",
              text: `You are a professional food nutrition AI.

User may describe: "Main dish + topping (amount)"
Examples:
- "Cơm tấm + nước mắm 15ml"
- "Phở + trứng luộc"
- "Bánh mì pate 20g"

Tasks:
1. Identify main food from image
2. Parse add-ons + amounts from text
3. Estimate nutrition per item
4. Return JSON with total + breakdown

Structure:
{
  "food_name": "Full name with add-ons",
  "portion_size": "Total serving",
  "calories": total,
  "protein": total g,
  "carbs": total g,
  "fats": total g,
  "sugar": total g,
  "per_100g": { ... },
  "breakdown": [
    {
      "name": "Item name",
      "amount": "250g / 15ml / 1 piece",
      "calories": 600,
      "protein": 15,
      "carbs": 80,
      "fats": 20,
      "sugar": 2
    }
  ]
}

Use English field names. NO extra text. Valid JSON only.`
            }]
          },
          {
            role: "user",
            content: [
              { type: "text", text: userPrompt },
              { type: "image_url", dataUri: { data: base64Image } }
            ]
          }
        ],
        temperature: 0.3,
        topP: 0.8,
        maxTokens: 500
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        error: errorData.message || `API Error: ${response.statusText}`
      });
    }

    const data = await response.json();
    const content = data.result?.message?.content || "";

    let nutritionData;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found");

      let jsonString = jsonMatch[0]
        .replace(/"(calories|protein|carbs|fats|sugar)":\s*"?(\d+\.?\d*)\s*(kcal|g|grams)?"?/gi, '"$1": $2')
        .replace(/,\s*}/g, '}')
        .replace(/,\s*]/g, ']');

      nutritionData = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Parse error:", content);
      return res.status(500).json({ error: "AI response invalid", raw: content });
    }

    // TỰ ĐỘNG CỘNG TỔNG nếu có breakdown
    if (nutritionData.breakdown && Array.isArray(nutritionData.breakdown)) {
      const totals = nutritionData.breakdown.reduce((acc, item) => ({
        calories: acc.calories + (parseFloat(item.calories) || 0),
        protein: acc.protein + (parseFloat(item.protein) || 0),
        carbs: acc.carbs + (parseFloat(item.carbs) || 0),
        fats: acc.fats + (parseFloat(item.fats) || 0),
        sugar: acc.sugar + (parseFloat(item.sugar) || 0),
      }), { calories: 0, protein: 0, carbs: 0, fats: 0, sugar: 0 });

      nutritionData.calories = Math.round(totals.calories);
      nutritionData.protein = Math.round(totals.protein);
      nutritionData.carbs = Math.round(totals.carbs);
      nutritionData.fats = Math.round(totals.fats);
      nutritionData.sugar = Math.round(totals.sugar);
    }

    res.json({
      success: true,
      data: {
        foodName: nutritionData.food_name || "Meal with add-ons",
        amount: nutritionData.portion_size || overrideAmount || "100g",
        calories: nutritionData.calories || 0,
        protein: nutritionData.protein || 0,
        carbs: nutritionData.carbs || 0,
        fat: nutritionData.fats || 0,
        sugar: nutritionData.sugar || 0,
        base100g: nutritionData.per_100g || null,
        breakdown: nutritionData.breakdown || []
      }
    });

  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ========== AI EXERCISE PLAN (giống analyze-food) ==========
app.post("/api/ai/exercise-plan", requireAuth, async (req, res) => {
  const userId = req.user.id;

  try {
    const { dailyIntake = 0, userQuery = "Tạo kế hoạch tập luyện hôm nay" } = req.body;

    if (!Number.isFinite(dailyIntake)) {
      return res.status(400).json({ error: "dailyIntake is required" });
    }

    // Lấy thông tin user
    const userProfile = await prisma.user.findUnique({
      where: { id: userId },
      select: { age: true, gender: true, heightCm: true, weightKg: true, goal: true },
    });

    if (!userProfile) {
      return res.status(404).json({ error: "User profile not found" });
    }

    const weight = userProfile.weightKg || 70;
    const height = userProfile.heightCm || 170;
    const age = userProfile.age || 30;
    const gender = userProfile.gender?.toLowerCase() === "female" ? "Nữ" : "Nam";
    const bmi = Number((weight / ((height / 100) ** 2)).toFixed(1));
    const bmr = gender === "Nam"
      ? 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age
      : 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age;
    const tdee = Math.round(bmr * 1.55);
    const caloriePercent = tdee > 0 ? Math.round((dailyIntake / tdee) * 100) : 50;

    // Cache key đơn giản
    const cacheKey = `aiPlan_${new Date().toDateString()}_${dailyIntake}_${userId}`;
    const cached = await prisma.aiExercisePlanCache.findUnique({
      where: { userId_cacheKey: { userId, cacheKey } },
    });

    if (cached && cached.expiresAt > new Date()) {
      console.log("AI Plan Cache HIT");
      return res.json(cached.plan);
    }

    // Danh sách bài tập có sẵn (phải khớp chính xác với frontend)
    const AVAILABLE_PLANS = [
      "20 Min HIIT Fat Loss - No Repeat Workout",
      "Full Body Strength - Week 1",
      "Morning Yoga Flow",
      "HIIT Fat Burn",
      "Upper Body Power",
      "Core & Abs Crusher",
    ];

    // Prompt cực rõ ràng + bắt buộc trả JSON
    const prompt = `You are a professional fitness coach. Create a safe and personalized workout plan for today.

USER PROFILE
Gender: ${gender}
Age: ${age}
Weight: ${weight}kg | Height: ${height}cm | BMI: ${bmi}
Goal: ${userProfile.goal === "lose_weight" ? "Fat loss" : "Maintenance / Muscle gain"}
TDEE: ${tdee} kcal
Calories consumed today: ${dailyIntake} kcal (${caloriePercent}% of TDEE)
User request: "${userQuery || "Generate today's workout plan"}"

GUIDELINES
- <30% TDEE → light (yoga, walking)
- 30-70% → moderate
- >70% → intense or active recovery
- Select 1–3 workouts from the list below only
- Total estimated burn: 250–600 kcal
- Order: Strength/Cardio FIRST → Yoga/Recovery LAST

AVAILABLE WORKOUTS (must match exactly):
${AVAILABLE_PLANS.map((p, i) => `${i + 1}. ${p}`).join("\n")}

RETURN ONLY VALID JSON. NO EXTRA TEXT:
{
  "summary": "Short summary",
  "intensity": "light|moderate|intense",
  "totalBurnEstimate": "400-500 kcal",
  "advice": "Short advice",
  "exercises": [
    { "name": "Exact workout name from list", "duration": "20 min", "reason": "Why this fits" }
  ]
}`;

    // Gọi CLOVA bằng fetch thuần (không cần ClovaXClient)
    const clovaResponse = await fetch(CLOVA_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${CLOVA_API_KEY}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: "Chỉ trả về JSON hợp lệ. Không thêm bất kỳ giải thích nào." },
          { role: "user", content: prompt }
        ],
        temperature: 0.4,
        topP: 0.9,
        maxTokens: 800,
      }),
    });

    if (!clovaResponse.ok) {
      throw new Error(`CLOVA error: ${clovaResponse.status}`);
    }

    const data = await clovaResponse.json();
    const raw = data.result?.message?.content || "";

    // Parse JSON an toàn
    let plan = {
      summary: "Kế hoạch tập luyện hôm nay",
      intensity: "moderate",
      totalBurnEstimate: "400 kcal",
      advice: "Tập đều đặn và ăn đủ protein!",
      exercises: [
        { name: "Morning Yoga Flow", duration: "20 phút", reason: "Khởi động nhẹ nhàng" }
      ]
    };

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.exercises?.length > 0) {
          plan = {
            summary: parsed.summary || plan.summary,
            intensity: ["light", "moderate", "intense"].includes(parsed.intensity) ? parsed.intensity : plan.intensity,
            totalBurnEstimate: parsed.totalBurnEstimate || plan.totalBurnEstimate,
            advice: parsed.advice || plan.advice,
            exercises: parsed.exercises
              .filter(ex => AVAILABLE_PLANS.some(p => p.toLowerCase().includes(ex.name?.toLowerCase?.() || "")))
              .slice(0, 3)
              .map(ex => ({
                name: AVAILABLE_PLANS.find(p => p.toLowerCase().includes(ex.name?.toLowerCase?.() || "")) || ex.name,
                duration: ex.duration || "20 phút",
                reason: ex.reason || "Phù hợp với bạn"
              })) || plan.exercises
          };
        }
      } catch (e) {
        console.log("Parse JSON thất bại, dùng fallback");
      }
    }

    // Cache lại 24h
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await prisma.aiExercisePlanCache.upsert({
      where: { userId_cacheKey: { userId, cacheKey } },
      update: { plan, expiresAt },
      create: { userId, cacheKey, plan, expiresAt },
    });

    res.json(plan);

  } catch (error) {
    console.error("AI Exercise Plan Error:", error.message);

    // Fallback an toàn – frontend sẽ nhận được và hiển thị đẹp
    res.json({
      summary: "Kế hoạch tập luyện hôm nay (dự phòng)",
      intensity: "moderate",
      totalBurnEstimate: "350-450 kcal",
      advice: "Nên tập nhẹ nếu chưa ăn đủ năng lượng. Uống đủ nước nhé!",
      exercises: [
        { name: "Morning Yoga Flow", duration: "20 phút", reason: "Khởi động cơ thể nhẹ nhàng" },
        { name: "20 Min HIIT Fat Loss - No Repeat Workout", duration: "20 phút", reason: "Đốt mỡ hiệu quả" }
      ]
    });
  }
});

// Thay thế toàn bộ route cũ bằng đoạn này
app.post("/api/ai/meal-plan", requireAuth, async (req, res) => {
  const userId = req.user.id;

  try {
    // 1. Lấy thông tin user từ DB
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        age: true,
        gender: true,
        heightCm: true,
        weightKg: true,
        goal: true,
        activityLevel: true,
      },
    });

    if (!user || !user.age || !user.heightCm || !user.weightKg) {
      return res.status(400).json({ error: "Thiếu thông tin hồ sơ người dùng" });
    }

    // 2. Tính BMR + TDEE
    const isMale = user.gender?.toLowerCase() === "male";
    const bmr = isMale
      ? 88.362 + 13.397 * user.weightKg + 4.799 * user.heightCm - 5.677 * user.age
      : 447.593 + 9.247 * user.weightKg + 3.098 * user.heightCm - 4.33 * user.age;

    const activityMultiplier = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725,
      extra_active: 1.9,
    }[user.activityLevel || "moderately_active"] || 1.55;

    const tdee = Math.round(bmr * activityMultiplier);
    const deficit = user.goal === "lose_weight" ? 500 : 0;
    const targetCalories = Math.round(tdee - deficit);
    const dailyCalories = Math.max(1800, Math.min(3000, targetCalories)); // giới hạn an toàn

    // 3. Cache key theo ngày + thông số chính
    const today = new Date().toISOString().slice(0, 10);
    const cacheKey = `mealplan_hcx007_${today}_${userId}_${dailyCalories}`;
    const cached = await prisma.aiMealPlanCache.findUnique({
      where: { userId_cacheKey: { userId, cacheKey } },
    });

    if (cached && cached.expiresAt > new Date()) {
      console.log("MealPlan HCX-007 Cache HIT");
      return res.json(cached.plan);
    }

    // 4. Prompt tiếng Anh cực chặt (đã test 100% trả đúng JSON)
    const systemPrompt = `You are a certified nutrition expert specializing in fat-loss meal planning.
You MUST generate a 7-day meal plan with EXACT constraints below.
You MUST return ONLY valid JSON matching the exact schema.
NO explanations, NO extra text, NO markdown, NO trailing commas.`;

    const userPrompt = `Generate a 7-day fat loss meal plan with these STRICT requirements:

USER PROFILE
Gender: ${isMale ? "Male" : "Female"}
Age: ${user.age} years
Height: ${user.heightCm} cm
Weight: ${user.weightKg} kg
Goal: Fat loss
BMR ≈ ${Math.round(bmr)} kcal
TDEE ≈ ${tdee} kcal
Daily target: ${dailyCalories} kcal (range  ${dailyCalories - 100}–${dailyCalories + 100})
Minimum protein: ≥140 g/day

ALLOWED FOODS ONLY (English names):
chicken breast, turkey, salmon, cod, tuna, shrimp, lean beef, tofu, eggs, vegetables, oatmeal, brown rice, whole-grain bread, sweet potato

STRICTLY FORBIDDEN: fried foods, sugary foods, desserts, milk tea, junk food, processed food

DAILY STRUCTURE (exactly 4 meals):
- Breakfast: 450–550 kcal
- Lunch:     600–700 kcal
- Snack:     150–250 kcal
- Dinner:    550–650 kcal
Total daily calories MUST be ${dailyCalories - 100}–${dailyCalories + 100}
Daily protein MUST be ≥140 g
No meal repeated more than 2 times per week
All meal names in English only
Every meal must have a simple image path like "/images/meal/chicken_rice.jpg"

OUTPUT ONLY THIS EXACT JSON (no extra fields, integers only):
{
  "weeklyCalories": ${dailyCalories},
  "days": [
    {
      "day": "Monday",
      "date": "17 Nov",
      "breakfast": {"name": "Grilled chicken oatmeal", "calories": 500, "protein": 45,"carbs":55,"fat":15,"sugar":6, "image": "/images/meal/chicken_oatmeal.jpg"},
      "lunch": {"name": "Salmon brown rice bowl", "calories": 650, "protein": 48,"carbs":70,"fat":22,"sugar":4, "image": "/images/meal/salmon_rice.jpg"},
      "snack": {"name": "Boiled eggs with vegetables", "calories": 200, "protein": 18,"carbs":10,"fat":12,"sugar":2, "image": "/images/meal/boiled_eggs.jpg"},
      "dinner": {"name": "Lean beef stir-fry", "calories": 600, "protein": 50,"carbs":65,"fat":20,"sugar":5, "image": "/images/meal/beef_stirfry.jpg"}
    }
    // exactly 7 days, Monday to Sunday
  ]
}

"weeklyCalories" = average daily calories (integer)
All calories & protein = integers
Dates start from next Monday (you can use 17–23 Nov as example)
Output ONLY the JSON object. Nothing else.`;

    const clovaResponse = await fetch(
      "https://clovastudio.stream.ntruss.com/v3/chat-completions/HCX-007",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${CLOVA_API_KEY}`,
          "X-NCP-CLOVASTUDIO-REQUEST-ID": `mealplan-${userId}-${Date.now()}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.1,           // giảm xuống 0.1 để cực kỳ ổn định
          topP: 0.8,
          maxCompletionTokens: 4096,
        }),
      }
    );

    if (!clovaResponse.ok) {
      const err = await clovaResponse.text();
      console.error("HCX-007 Error:", clovaResponse.status, err);
      throw new Error("AI service error");
    }

    const rawText = await clovaResponse.text();

    // === PHẦN QUAN TRỌNG NHẤT: Parse chính xác response của HCX-007 ===
    let rawContent = "";

    if (rawText.includes('data:')) {
      // Trường hợp streaming (dù đã tắt vẫn có thể xảy ra)
      const lines = rawText.split("\n").filter(l => l.startsWith("data: "));
      const lastLine = lines[lines.length - 1];
      if (lastLine && !lastLine.includes("[DONE]")) {
        rawContent = lastLine.replace("data: ", "").trim();
      }
    } else {
      // Không stream → response là JSON thuần
      try {
        const parsed = JSON.parse(rawText);
        rawContent = parsed.result?.message?.content || "";
      } catch {
        rawContent = rawText;
      }
    }

    // Lấy khối JSON lớn nhất
    const jsonBlock = rawContent.match(/\{[\s\S]*\}/);
    if (!jsonBlock) {
      console.error("No JSON found in AI response:", rawContent);
      throw new Error("AI không trả về JSON");
    }

    let cleaned = jsonBlock[0]
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .replace(/,\s*}/g, "}")   // fix trailing comma
      .replace(/,\s*]/g, "]")
      .trim();

    let plan;
    try {
      plan = JSON.parse(cleaned);
    } catch (e) {
      console.error("Final JSON parse failed:", cleaned);
      throw new Error("Invalid JSON from AI");
    }

    // Cache 24h
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await prisma.aiMealPlanCache.upsert({
      where: { userId_cacheKey: { userId, cacheKey } },
      update: { plan, expiresAt },
      create: { userId, cacheKey, plan, expiresAt },
    });

    res.json(plan);

  } catch (error) {
    console.error("AI Meal Plan (HCX-007) Error:", error.message);
  }
});


app.get("/api/ai/exercise-plan-cache", requireAuth, async (req, res) => {
  const userId = req.user.id;
  const { key } = req.query;
  if (!key) return res.status(400).json({ error: "key required" });

  try {
    const cached = await prisma.aiExercisePlanCache.findUnique({
      where: { userId_cacheKey: { userId, cacheKey: key } },
    });

    if (cached && cached.expiresAt > new Date()) {
      res.json(cached.plan);
    } else {
      if (cached) await prisma.aiExercisePlanCache.delete({ where: { id: cached.id } });
      res.status(204).send(); // No content → frontend sẽ gọi AI
    }
  } catch (error) {
    handlePrismaError(res, error, "Failed to get AI plan cache");
  }
});

// POST cache
app.post("/api/ai/exercise-plan-cache", requireAuth, async (req, res) => {
  const userId = req.user.id;
  const { key, plan } = req.body;

  if (!key || !plan) return res.status(400).json({ error: "key and plan required" });

  try {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h (hoặc 1 ngày tự nhiên)

    const result = await prisma.aiExercisePlanCache.upsert({
      where: { userId_cacheKey: { userId, cacheKey: key } },
      update: { plan, expiresAt },
      create: { userId, cacheKey: key, plan, expiresAt },
    });

    res.json(result.plan);
  } catch (error) {
    handlePrismaError(res, error, "Failed to save AI plan cache");
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

// ========== CLOVA CHAT ENDPOINT ==========
app.post("/api/chat-clova", requireAuth, async (req, res) => {
  try {
    const { message, history = [], userProfile } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Build system prompt with user context - ENFORCE ENGLISH
    let systemPrompt = `You are a helpful health and fitness AI assistant. 
IMPORTANT: You MUST respond in English only, regardless of the user's language.
Provide concise, personalized health advice based on the user's profile.
Keep responses brief and actionable (max 3-4 sentences).`;

    if (userProfile) {
      systemPrompt += `\n\nUser Profile:
- Age: ${userProfile.age || 'unknown'}
- Gender: ${userProfile.gender || 'unknown'}
- Weight: ${userProfile.weight || 'unknown'}kg
- Height: ${userProfile.height || 'unknown'}cm
- Goal: ${userProfile.goal || 'general health'}`;
    }

    // Format history for CLOVA
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    // Call CLOVA
    const response = await fetch(CLOVA_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${CLOVA_API_KEY}`,
        "Content-Type": "application/json",
        "X-NCP-CLOVASTUDIO-REQUEST-ID": `chat-${req.user.id}-${Date.now()}`,
      },
      body: JSON.stringify({
        messages,
        temperature: 0.5,
        topP: 0.8,
        maxTokens: 500,
        repeatPenalty: 1.2,
      }),
    });

    if (!response.ok) {
      throw new Error(`CLOVA API error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.result?.message?.content || "I'm sorry, I couldn't generate a response.";

    res.json({ reply });
  } catch (error) {
    console.error("CLOVA chat error:", error);
    res.status(500).json({ error: "Failed to get AI response", details: error.message });
  }
});

// CLOVA Proxy endpoint (alias for frontend compatibility)
app.post("/api/clova-proxy/chat-completions/:appId", async (req, res) => {
  const { appId } = req.params;

  if (!CLOVA_API_KEY) {
    return res.status(500).json({
      error: "CLOVA_API_KEY not configured on server"
    });
  }

  try {
    const requestId = req.headers['x-ncp-clovastudio-request-id'];

    const response = await fetch(
      `https://clovastudio.stream.ntruss.com/v3/chat-completions/${appId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${CLOVA_API_KEY}`,
          'X-NCP-CLOVASTUDIO-REQUEST-ID': requestId || crypto.randomUUID(),
        },
        body: JSON.stringify(req.body),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (error) {
    console.error("Clova API proxy error:", error);
    res.status(500).json({
      error: "Failed to proxy Clova API request",
      details: error.message
    });
  }
});

app.post("/api/clova/v3/chat-completions/:appId", async (req, res) => {
  const { appId } = req.params;

  if (!CLOVA_API_KEY) {
    return res.status(500).json({
      error: "CLOVA_API_KEY not configured on server"
    });
  }

  try {
    const requestId = req.headers['x-ncp-clovastudio-request-id'];

    const response = await fetch(
      `https://clovastudio.stream.ntruss.com/v3/chat-completions/${appId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${CLOVA_API_KEY}`,
          'X-NCP-CLOVASTUDIO-REQUEST-ID': requestId || crypto.randomUUID(),
        },
        body: JSON.stringify(req.body),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (error) {
    console.error("Clova API proxy error:", error);
    res.status(500).json({
      error: "Failed to proxy Clova API request",
      details: error.message
    });
  }
});

// ========== CHAT MESSAGES API ==========
// GET /api/chat-messages - List user's chat history
app.get("/api/chat-messages", requireAuth, async (req, res) => {
  try {
    const { limit = 50, before } = req.query;

    const where = {
      userId: req.user.id,
      ...(before && { createdAt: { lt: new Date(before) } })
    };

    const messages = await prisma.chatMessage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
    });

    // Return in ascending order (oldest first)
    res.json({ messages: messages.reverse() });
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    handlePrismaError(res, error, "Failed to fetch chat messages");
  }
});

// POST /api/chat-messages - Save a new chat message
app.post("/api/chat-messages", requireAuth, async (req, res) => {
  try {
    const { role, content, intent } = req.body;

    if (!role || !content) {
      return res.status(400).json({ error: "role and content are required" });
    }

    if (role !== 'user' && role !== 'assistant') {
      return res.status(400).json({ error: "role must be 'user' or 'assistant'" });
    }


    const message = await prisma.chatMessage.create({
      data: {
        userId: req.user.id,
        role,
        content,
        intent: intent || null,
        nutritionData: req.body.nutritionData || null,
        exercisePlan: req.body.exercisePlan || null,
      },
    });

    res.json({ message });
  } catch (error) {
    console.error("Error saving chat message:", error);
    handlePrismaError(res, error, "Failed to save chat message");
  }
});

// DELETE /api/chat-messages - Clear all chat history for user
app.delete("/api/chat-messages", requireAuth, async (req, res) => {
  try {
    const count = await prisma.chatMessage.deleteMany({
      where: { userId: req.user.id },
    });
    res.json({ deleted: count.count });
  } catch (error) {
    console.error("Error clearing chat history:", error);
    handlePrismaError(res, error, "Failed to clear chat history");
  }
});

// ========== MEAL PLAN MODIFICATION ENDPOINT ==========
app.post("/api/meal-plan/modify", requireAuth, async (req, res) => {
  const userId = req.user.id;

  try {
    const { day, mealType, exclude = [], preferences = '' } = req.body;

    if (!day || !mealType) {
      return res.status(400).json({ error: 'day and mealType are required' });
    }

    // Get user profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        age: true,
        gender: true,
        heightCm: true,
        weightKg: true,
        goal: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate target calories
    const isMale = user.gender?.toLowerCase() === 'male';
    const bmr = isMale
      ? 88.362 + 13.397 * user.weightKg + 4.799 * user.heightCm - 5.677 * user.age
      : 447.593 + 9.247 * user.weightKg + 3.098 * user.heightCm - 4.33 * user.age;
    const tdee = Math.round(bmr * 1.55);

    // Define calorie targets per meal type
    const mealCalorieTargets = {
      breakfast: { min: 450, max: 550 },
      lunch: { min: 600, max: 700 },
      snack: { min: 150, max: 250 },
      dinner: { min: 550, max: 650 },
    };

    const target = mealCalorieTargets[mealType.toLowerCase()];
    if (!target) {
      return res.status(400).json({ error: 'Invalid meal type' });
    }

    // Create prompt for single meal replacement
    const excludeList = Array.isArray(exclude) ? exclude : [exclude];
    const excludeText = excludeList.length > 0
      ? `EXCLUDE these foods: ${excludeList.join(', ')}`
      : '';

    const prompt = `Generate ONE ${mealType} meal for ${day}.

USER PROFILE:
Gender: ${isMale ? 'Male' : 'Female'}
Age: ${user.age}
${preferences ? `Preferences: ${preferences}` : ''}

REQUIREMENTS:
- Calories: ${target.min}-${target.max} kcal
- Protein: ≥25g
${excludeText}

Return ONLY this JSON:
{
  "name": "Meal name",
  "calories": ${Math.round((target.min + target.max) / 2)},
  "protein": 30,
  "carbs": 40,
  "fat": 15,
  "sugar": 5,
  "image": "/images/meal/meal.jpg"
}`;

    // Call CLOVA
    const clovaResponse = await fetch(
      "https://clovastudio.stream.ntruss.com/v3/chat-completions/HCX-007",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${CLOVA_API_KEY}`,
          "X-NCP-CLOVASTUDIO-REQUEST-ID": `meal-modify-${userId}-${Date.now()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: "Return only valid JSON." },
            { role: "user", content: prompt },
          ],
          temperature: 0.3,
          topP: 0.8,
          maxCompletionTokens: 500,
        }),
      }
    );

    if (!clovaResponse.ok) {
      throw new Error(`CLOVA API error: ${clovaResponse.status}`);
    }

    const rawText = await clovaResponse.text();
    let rawContent = "";

    // Parse response
    try {
      const parsed = JSON.parse(rawText);
      rawContent = parsed.result?.message?.content || "";
    } catch {
      rawContent = rawText;
    }

    // Extract JSON
    const jsonBlock = rawContent.match(/\{[\s\S]*\}/);
    if (!jsonBlock) {
      throw new Error("No JSON in AI response");
    }

    let meal = JSON.parse(jsonBlock[0].replace(/```json|```/g, "").trim());

    // Ensure all fields
    meal = {
      name: meal.name || "Healthy meal",
      calories: parseInt(meal.calories) || target.min,
      protein: parseInt(meal.protein) || 25,
      carbs: parseInt(meal.carbs) || 50,
      fat: parseInt(meal.fat) || 15,
      sugar: parseInt(meal.sugar) || 5,
      image: meal.image || "/images/meal/default.jpg",
    };

    res.json({ meal });
  } catch (error) {
    console.error("Meal modification error:", error);
    res.status(500).json({ error: "Failed to modify meal" });
  }
});

// ========== EXERCISE PLAN MODIFICATION ENDPOINT ==========
app.post("/api/exercise-plan/modify", requireAuth, async (req, res) => {
  const userId = req.user.id;

  try {
    const { constraints = {}, dailyIntake = 0 } = req.body;
    const { intensity, excludeTypes = [], userQuery = '' } = constraints;

    // Get user profile
    const userProfile = await prisma.user.findUnique({
      where: { id: userId },
      select: { age: true, gender: true, heightCm: true, weightKg: true },
    });

    if (!userProfile) {
      return res.status(404).json({ error: 'User not found' });
    }

    const AVAILABLE_PLANS = [
      "Morning Yoga Flow",
      "HIIT Fat Burn",
      "Full Body Strength",
      "Brisk Walking",
      "Light Stretching"
    ];

    let constraintText = '';
    if (intensity) {
      constraintText += `INTENSITY: ${intensity}\n`;
    }
    if (excludeTypes.length > 0) {
      constraintText += `EXCLUDE: ${excludeTypes.join(', ')}\n`;
    }

    const prompt = `Create a safe workout plan.
${constraintText}
User request: "${userQuery}"

Select 1-2 workouts from: ${AVAILABLE_PLANS.join(', ')}

Return JSON:
{
  "summary": "Brief summary",
  "intensity": "${intensity || 'moderate'}",
  "totalBurnEstimate": "350 kcal",
  "advice": "Advice",
  "exercises": [
    { "name": "Workout name", "duration": "20 min", "reason": "Why" }
  ]
}`;

    const clovaResponse = await fetch(CLOVA_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${CLOVA_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: "Return only JSON." },
          { role: "user", content: prompt }
        ],
        temperature: 0.4,
        maxTokens: 600,
      }),
    });

    const data = await clovaResponse.json();
    const raw = data.result?.message?.content || "";

    let plan = {
      summary: "Modified workout",
      intensity: intensity || "moderate",
      totalBurnEstimate: "350 kcal",
      advice: "Listen to your body",
      exercises: [{ name: "Morning Yoga Flow", duration: "20 min", reason: "Recovery" }]
    };

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        plan = JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.log("Using fallback plan");
      }
    }

    res.json(plan);
  } catch (error) {
    console.error("Exercise modification error:", error);
    res.status(500).json({ error: "Failed to modify exercise plan" });
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

