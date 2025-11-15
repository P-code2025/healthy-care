// Backend Proxy Server for CLOVA Studio API
// This fixes CORS issues when calling from browser

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import { PrismaClient } from '@prisma/client';
import { saveImageTemporarily, getImage, hasImage } from './imageCache.js';

const app = express();
const PORT = process.env.PORT || 3001;
const prisma = new PrismaClient();

// CLOVA Studio credentials from environment variables
const CLOVA_API_KEY = process.env.CLOVA_API_KEY;
const CLOVA_API_URL = process.env.CLOVA_API_URL || 'https://clovastudio.stream.ntruss.com/v3/chat-completions/HCX-005';

if (!CLOVA_API_KEY) {
  console.error('❌ ERROR: CLOVA_API_KEY not found in .env file!');
  process.exit(1);
}

if (!CLOVA_API_KEY) {
  console.error('❌ ERROR: CLOVA_API_KEY not found in .env file!');
  process.exit(1);
}

// Middleware
const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173'];
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json({ limit: '50mb' })); // Support large base64 images

const cleanup = async () => {
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

const mapUser = (user) => ({
  user_id: user.id,
  email: user.email,
  password_hash: user.passwordHash,
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
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) {
    throw new Error('Invalid date value');
  }
  return new Date(Date.UTC(year, month - 1, day));
};

const ensureCalendarPayload = (payload) => {
  const { title, date, time, category } = payload;
  if (!title || !date || !time || !category) {
    throw new Error('Missing required calendar fields');
  }
};

app.get('/api/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { id: 'asc' },
    });
    res.json(users.map(mapUser));
  } catch (error) {
    console.error('Users endpoint error', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.get('/api/food-log', async (req, res) => {
  try {
    const logs = await prisma.foodLog.findMany({
      orderBy: { eatenAt: 'desc' },
    });
    res.json(logs.map(mapFoodLog));
  } catch (error) {
    console.error('Food log endpoint error', error);
    res.status(500).json({ error: 'Failed to fetch food logs' });
  }
});

app.get('/api/workout-log', async (req, res) => {
  try {
    const logs = await prisma.workoutLog.findMany({
      orderBy: { completedAt: 'desc' },
    });
    res.json(logs.map(mapWorkoutLog));
  } catch (error) {
    console.error('Workout log endpoint error', error);
    res.status(500).json({ error: 'Failed to fetch workout logs' });
  }
});

app.get('/api/ai-suggestions', async (req, res) => {
  try {
    const suggestions = await prisma.aiSuggestion.findMany({
      orderBy: { generatedAt: 'desc' },
    });
    res.json(suggestions.map(mapSuggestion));
  } catch (error) {
    console.error('AI suggestions endpoint error', error);
    res.status(500).json({ error: 'Failed to fetch AI suggestions' });
  }
});

app.get('/api/calendar-events', async (req, res) => {
  try {
    const userId = Number(req.query.userId) || 1;
    const events = await prisma.calendarEvent.findMany({
      where: { userId },
      orderBy: [{ eventDate: 'asc' }, { timeSlot: 'asc' }],
    });
    res.json(events.map(mapCalendarEvent));
  } catch (error) {
    console.error('Calendar list error', error);
    res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
});

app.post('/api/calendar-events', async (req, res) => {
  try {
    const userId = Number(req.body.userId) || 1;
    ensureCalendarPayload(req.body);
    const created = await prisma.calendarEvent.create({
      data: {
        userId,
        title: req.body.title,
        eventDate: parseDateOnly(req.body.date),
        timeSlot: req.body.time,
        category: req.body.category,
        location: req.body.location,
        note: req.body.note,
        linkedModule: req.body.linkedModule,
      },
    });
    res.status(201).json(mapCalendarEvent(created));
  } catch (error) {
    console.error('Calendar create error', error);
    res.status(400).json({ error: error.message || 'Failed to create calendar event' });
  }
});

app.put('/api/calendar-events/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const userId = Number(req.body.userId) || 1;
    ensureCalendarPayload(req.body);
    const updated = await prisma.calendarEvent.update({
      where: { id, userId },
      data: {
        title: req.body.title,
        eventDate: parseDateOnly(req.body.date),
        timeSlot: req.body.time,
        category: req.body.category,
        location: req.body.location,
        note: req.body.note,
        linkedModule: req.body.linkedModule,
      },
    });
    res.json(mapCalendarEvent(updated));
  } catch (error) {
    console.error('Calendar update error', error);
    res.status(400).json({ error: error.message || 'Failed to update calendar event' });
  }
});

app.delete('/api/calendar-events/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.calendarEvent.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error('Calendar delete error', error);
    res.status(400).json({ error: error.message || 'Failed to delete calendar event' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'API Proxy is running' });
});

// Serve temporary images
app.get('/temp-image/:imageId', (req, res) => {
  const { imageId } = req.params;
  
  if (!hasImage(imageId)) {
    return res.status(404).json({ error: 'Image not found' });
  }
  
  const base64Image = getImage(imageId);
  const buffer = Buffer.from(base64Image, 'base64');
  
  res.set('Content-Type', 'image/jpeg');
  res.send(buffer);
});

// Proxy endpoint for food recognition
app.post('/api/recognize-food', async (req, res) => {
  try {
    const { base64Image } = req.body;

    if (!base64Image) {
      return res.status(400).json({ 
        error: 'Missing base64Image in request body' 
      });
    }

    console.log('📸 Receiving food image for AI analysis...');
    console.log(`📦 Image size: ${(base64Image.length / 1024).toFixed(2)} KB`);

    // Call CLOVA Studio API with base64 dataUri
    console.log('🤖 Calling CLOVA Studio API with base64 data...');
    
    const response = await fetch(CLOVA_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLOVA_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-NCP-CLOVASTUDIO-REQUEST-ID': `food-recognition-${Date.now()}`,
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: [
              {
                type: 'text',
                text: `You are a professional nutritionist AI assistant. Analyze food images and provide detailed nutritional information.

IMPORTANT: Return ONLY a valid JSON object with this exact structure (no markdown, no explanations):
{
  "food_name": "tên món ăn bằng tiếng Việt",
  "calories": số calories (kcal) cho 100g,
  "protein": số protein (grams) cho 100g,
  "carbs": số carbs (grams) cho 100g,
  "fats": số fats (grams) cho 100g,
  "portion_size": "100g",
  "confidence": độ tin cậy từ 0.0 đến 1.0
}

Example:
{"food_name":"Cơm gà chiên","calories":165,"protein":31,"carbs":12,"fats":3.6,"portion_size":"100g","confidence":0.85}`,
              },
            ],
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Hãy phân tích món ăn trong ảnh này và trả về thông tin dinh dưỡng theo format JSON đã cho.',
              },
              {
                type: 'image_url',
                dataUri: {
                  data: base64Image,
                },
              },
            ],
          },
        ],
        topP: 0.8,
        topK: 0,
        maxTokens: 500,
        temperature: 0.3,
        repetitionPenalty: 1.1,
        stop: [],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ CLOVA API Error:', response.status, errorData);
      
      return res.status(response.status).json({
        error: errorData.message || `API Error: ${response.statusText}`,
        status: response.status,
      });
    }

    const data = await response.json();
    console.log('✅ CLOVA API Response received');

    // Extract content from response
    const content = data.result?.message?.content || '';
    
    // Parse JSON from response
    let nutritionData;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        nutritionData = JSON.parse(jsonMatch[0]);
      } else {
        nutritionData = JSON.parse(content);
      }
    } catch (parseError) {
      console.error('❌ Failed to parse AI response:', content);
      return res.status(500).json({
        error: 'AI không thể phân tích được món ăn',
        raw_content: content,
      });
    }

    console.log('🍜 Food recognized:', nutritionData.food_name);

    // Return formatted result
    res.json({
      success: true,
      data: {
        foodName: nutritionData.food_name || 'Món ăn không xác định',
        calories: parseFloat(nutritionData.calories) || 0,
        protein: parseFloat(nutritionData.protein) || 0,
        carbs: parseFloat(nutritionData.carbs) || 0,
        fats: parseFloat(nutritionData.fats) || 0,
        portionSize: nutritionData.portion_size || '100g',
        confidence: parseFloat(nutritionData.confidence) || 0.5,
      },
      usage: data.result?.usage,
    });

  } catch (error) {
    console.error('❌ Server error:', error);
    res.status(500).json({
      error: error.message || 'Internal server error',
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`
🚀 API Proxy Server is running!
📡 URL: http://localhost:${PORT}
🔗 Health check: http://localhost:${PORT}/health
📸 Food recognition: POST http://localhost:${PORT}/api/recognize-food

💡 Don't forget to update DEMO_MODE to false in aiService.ts
  `);
});
