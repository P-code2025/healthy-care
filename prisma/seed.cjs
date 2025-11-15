/* eslint-disable no-console */
const { PrismaClient, CalendarCategory, CalendarModule, SuggestionType } = require("@prisma/client");
const path = require("node:path");
const fs = require("node:fs");

const prisma = new PrismaClient();

const calendarSeeds = [
  {
    user_id: 1,
    title: "Breakfast planning",
    event_date: "2028-09-17",
    time_slot: "07:30",
    category: CalendarCategory.meal,
    location: "Home kitchen",
    note: "Use today's meal plan suggestions",
    linked_module: CalendarModule.meal_plan,
  },
  {
    user_id: 1,
    title: "HIIT workout",
    event_date: "2028-09-17",
    time_slot: "18:00",
    category: CalendarCategory.activity,
    location: "Home gym",
    note: "Follow AI workout plan",
    linked_module: CalendarModule.exercises,
  },
  {
    user_id: 2,
    title: "Check messages with coach",
    event_date: "2028-09-18",
    time_slot: "09:00",
    category: CalendarCategory.appointment,
    location: "App inbox",
    note: "Reply to nutritionist feedback",
    linked_module: CalendarModule.messages,
  },
];

async function seed() {
  const dataPath = path.join(__dirname, "..", "db.json");
  const seedData = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

  console.log("Resetting database…");
  await prisma.aiSuggestion.deleteMany();
  await prisma.workoutLog.deleteMany();
  await prisma.foodLog.deleteMany();
  await prisma.calendarEvent.deleteMany();
  await prisma.user.deleteMany();

  console.log("Inserting users…");
  const userIdMap = new Map();
  for (const user of seedData.users) {
    const created = await prisma.user.create({
      data: {
        email: user.email,
        passwordHash: user.password_hash,
        age: user.age,
        gender: user.gender,
        heightCm: user.height_cm,
        weightKg: user.weight_kg,
        goal: user.goal,
        activityLevel: user.activity_level,
        exercisePreferences: user.exercise_preferences,
      },
    });
    userIdMap.set(user.user_id, created.id);
  }

  console.log("Inserting food logs…");
  for (const log of seedData.food_log) {
    const userId = userIdMap.get(log.user_id);
    if (!userId) continue;
    await prisma.foodLog.create({
      data: {
        userId,
        eatenAt: new Date(log.eaten_at),
        mealType: log.meal_type,
        foodName: log.food_name,
        calories: Math.round(log.calories),
        proteinGrams: Number(log.protein_g),
        carbsGrams: Number(log.carbs_g),
        fatGrams: Number(log.fat_g),
        healthConsideration: log.health_consideration,
        isCorrected: Boolean(log.is_corrected),
        amount: log.amount || null,
        sugarGrams:
          log.sugar !== undefined ? Number(log.sugar) : null,
        status: log.status || null,
        thoughts: log.thoughts || null,
      },
    });
  }

  console.log("Inserting workout logs…");
  for (const log of seedData.workout_log) {
    const userId = userIdMap.get(log.user_id);
    if (!userId) continue;
    await prisma.workoutLog.create({
      data: {
        userId,
        completedAt: new Date(log.completed_at),
        exerciseName: log.exercise_name,
        durationMinutes: log.duration_minutes,
        caloriesBurnedEstimated: log.calories_burned_estimated,
        isAiSuggested: Boolean(log.is_ai_suggested),
      },
    });
  }

  console.log("Inserting AI suggestions…");
  for (const suggestion of seedData.ai_suggestions) {
    const userId = userIdMap.get(suggestion.user_id);
    if (!userId) continue;
    const type =
      suggestion.type === "nutrition" ? SuggestionType.nutrition : SuggestionType.workout;
    await prisma.aiSuggestion.create({
      data: {
        userId,
        generatedAt: new Date(suggestion.generated_at),
        type,
        isApplied: Boolean(suggestion.is_applied),
        contentDetails: suggestion.content_details,
      },
    });
  }

  console.log("Inserting calendar events…");
  for (const event of calendarSeeds) {
    const userId = userIdMap.get(event.user_id);
    if (!userId) continue;
    await prisma.calendarEvent.create({
      data: {
        userId,
        title: event.title,
        eventDate: new Date(event.event_date),
        timeSlot: event.time_slot,
        category: event.category,
        location: event.location,
        note: event.note,
        linkedModule: event.linked_module,
      },
    });
  }

  console.log("Database seed completed.");
}

seed()
  .catch((err) => {
    console.error("Seed error", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
