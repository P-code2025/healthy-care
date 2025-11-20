// CLOVA Studio API Service for Food Recognition
// Using HCX-005 Vision Model

import type { FoodEntry } from "../lib/types";
import { foodDiaryApi, mapFoodLogToEntry, type FoodEntryInput } from "./foodDiaryApi";

// Load API key from environment variable
const CLOVA_API_KEY = import.meta.env.VITE_CLOVA_API_KEY;
const CLOVA_API_URL = 'https://clovastudio.stream.ntruss.com/v3/chat-completions/HCX-005';

// Validate API key is configured
if (!CLOVA_API_KEY && !import.meta.env.DEV) {
  console.warn('⚠️ CLOVA_API_KEY is not configured. AI food recognition will use demo mode.');
}

// Configuration
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true'; // Use env variable to control demo mode
const USE_PROXY = true;  // Must be true when calling from browser
const PROXY_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'; // Backend proxy server

// Constants
const MAX_IMAGE_SIZE_MB = 5;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
const AI_SIMULATION_MIN_DELAY = 1500;
const AI_SIMULATION_MAX_DELAY = 2500;

const getMealTypeForDate = (date: Date): FoodEntry["mealType"] => {
  const hour = date.getHours();
  if (hour >= 5 && hour < 11) return "Breakfast";
  if (hour >= 11 && hour < 15) return "Lunch";
  if (hour >= 18 && hour < 22) return "Dinner";
  return "Snack";
};

const formatLocalTime = (date: Date) =>
  date
    .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })
    .replace(".", ":");

export interface FoodRecognitionResult {
  foodName: string;
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fats: number; // grams
  portionSize: string;
  confidence: number; // 0-1
}

// Mock food database for demo
const MOCK_FOODS = [
  { foodName: 'Phở bò', calories: 180, protein: 12.5, carbs: 25, fats: 3.2, confidence: 0.88 },
  { foodName: 'Cơm tấm sườn', calories: 420, protein: 28, carbs: 52, fats: 12, confidence: 0.92 },
  { foodName: 'Bánh mì thịt', calories: 360, protein: 18, carbs: 45, fats: 14, confidence: 0.85 },
  { foodName: 'Bún chả', calories: 310, protein: 22, carbs: 38, fats: 8.5, confidence: 0.80 },
  { foodName: 'Gỏi cuốn tôm', calories: 95, protein: 8, carbs: 12, fats: 2.5, confidence: 0.87 },
  { foodName: 'Cơm gà xối mỡ', calories: 385, protein: 31, carbs: 42, fats: 10, confidence: 0.90 },
  { foodName: 'Salad rau trộn', calories: 65, protein: 3, carbs: 8, fats: 2.8, confidence: 0.75 },
  { foodName: 'Bún bò Huế', calories: 330, protein: 20, carbs: 40, fats: 9, confidence: 0.83 },
]

export interface APIError {
  status: number;
  message: string;
}

/**
 * Convert image file to base64 string (without data URL prefix)
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Remove data URL prefix (data:image/jpeg;base64,)
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Recognize food from image using CLOVA Studio HCX-005
 */
export const recognizeFoodFromImage = async (
  imageFile: File
): Promise<FoodRecognitionResult> => {
  try {
    // Validate file
    if (!imageFile.type.startsWith('image/')) {
      throw new Error('File phải là ảnh (JPG, PNG, etc.)');
    }

    // Validate file size
    if (imageFile.size > MAX_IMAGE_SIZE_BYTES) {
      throw new Error(`Kích thước ảnh không được vượt quá ${MAX_IMAGE_SIZE_MB}MB`);
    }

    // DEMO MODE: Return mock data for testing
    if (DEMO_MODE) {
      if (import.meta.env.DEV) {
        console.log('🤖 [DEMO MODE] Simulating AI food recognition...');
      }

      // Simulate API delay
      const delay = AI_SIMULATION_MIN_DELAY + Math.random() * (AI_SIMULATION_MAX_DELAY - AI_SIMULATION_MIN_DELAY);
      await new Promise(resolve => setTimeout(resolve, delay));

      // Random food from mock database
      const randomFood = MOCK_FOODS[Math.floor(Math.random() * MOCK_FOODS.length)];

      return {
        ...randomFood,
        portionSize: '100g',
      };
    }

    // Convert to base64 (without data URL prefix)
    const base64Image = await fileToBase64(imageFile);

    // Use proxy server to avoid CORS issues
    if (USE_PROXY) {
      if (import.meta.env.DEV) {
        console.log('🔄 Calling backend proxy for AI recognition...');
      }

      const response = await fetch(`${PROXY_URL}/api/recognize-food`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          base64Image: base64Image,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API Error: ${response.statusText}`);
      }

      const result = await response.json();
      if (import.meta.env.DEV) {
        console.log('✅ Food recognized:', result.data.foodName);
      }

      return result.data;
    }

    // Call CLOVA Studio API
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
                type: 'image_url',
                dataUri: {
                  data: base64Image,
                },
              },
              {
                type: 'text',
                text: 'Hãy phân tích món ăn trong ảnh này và trả về thông tin dinh dưỡng theo format JSON đã cho.',
              },
            ],
          },
        ],
        topP: 0.8,
        topK: 0,
        maxTokens: 500,
        temperature: 0.3, // Lower for more consistent JSON
        repetitionPenalty: 1.1,
        stop: [],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw {
        status: response.status,
        message: errorData.message || `API Error: ${response.statusText}`,
      } as APIError;
    }

    const data = await response.json();

    // Parse AI response
    const content = data.result?.message?.content || '';

    // Try to extract JSON from response
    let nutritionData;
    try {
      // Remove markdown code blocks if present
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        nutritionData = JSON.parse(jsonMatch[0]);
      } else {
        nutritionData = JSON.parse(content);
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('AI không thể phân tích được món ăn. Vui lòng thử lại hoặc nhập thủ công.');
    }

    // Validate and return result
    return {
      foodName: nutritionData.food_name || 'Món ăn không xác định',
      calories: parseFloat(nutritionData.calories) || 0,
      protein: parseFloat(nutritionData.protein) || 0,
      carbs: parseFloat(nutritionData.carbs) || 0,
      fats: parseFloat(nutritionData.fats) || 0,
      portionSize: nutritionData.portion_size || '100g',
      confidence: parseFloat(nutritionData.confidence) || 0.5,
    };
  } catch (error: any) {
    console.error('Food recognition error:', error);

    if (error.status) {
      // API error
      const apiError = error as APIError;
      if (apiError.status === 401) {
        throw new Error('API key không hợp lệ');
      } else if (apiError.status === 429) {
        throw new Error('Đã vượt quá giới hạn request. Vui lòng thử lại sau vài phút');
      } else if (apiError.status >= 500) {
        throw new Error('Lỗi server. Vui lòng thử lại sau');
      }
      throw new Error(apiError.message);
    }

    // Other errors
    throw error;
  }
};

/**
 * Calculate nutrition for custom portion size
 */
export const calculateNutrition = (
  baseNutrition: FoodRecognitionResult,
  grams: number
): FoodRecognitionResult => {
  const multiplier = grams / 100; // Base is per 100g

  return {
    ...baseNutrition,
    calories: Math.round(baseNutrition.calories * multiplier),
    protein: Math.round(baseNutrition.protein * multiplier * 10) / 10,
    carbs: Math.round(baseNutrition.carbs * multiplier * 10) / 10,
    fats: Math.round(baseNutrition.fats * multiplier * 10) / 10,
    portionSize: `${grams}g`,
  };
};

/**
 * Format nutrition info for display
 */
export const formatNutritionInfo = (nutrition: FoodRecognitionResult): string => {
  const confidencePercent = Math.round(nutrition.confidence * 100);

  return `🍽️ **${nutrition.foodName}**

📊 Thông tin dinh dưỡng (${nutrition.portionSize}):
• Calories: ${nutrition.calories} kcal
• Protein: ${nutrition.protein}g
• Carbs: ${nutrition.carbs}g
• Fats: ${nutrition.fats}g

Độ chính xác: ${confidencePercent}%`;
};

/**
 * Save food log to database
 */
export const saveFoodLog = async (
  nutrition: FoodRecognitionResult,
  imageUrl?: string
): Promise<void> => {
  try {
    const now = new Date();
    const entry: FoodEntryInput = {
      date: now.toISOString().split("T")[0],
      time: formatLocalTime(now),
      mealType: getMealTypeForDate(now),
      foodName: nutrition.foodName || "Recognized meal",
      amount: nutrition.portionSize || "100g",
      calories: Math.round(nutrition.calories),
      protein: Math.round(nutrition.protein),
      carbs: Math.round(nutrition.carbs),
      fat: Math.round(nutrition.fats),
      sugar: 0,
      status: "Satisfied",
      thoughts: imageUrl ? "Captured via AI vision" : "",
      imageUrl: imageUrl || undefined,
      imageAttribution: imageUrl ? "AI capture" : undefined,
    };

    await foodDiaryApi.create(entry);
  } catch (error) {
    console.error('Error saving food log:', error);
    throw new Error('Unable to save meal information');
  }
};

/**
 * Get food logs history
 */
export const getFoodLogsHistory = async (): Promise<FoodEntry[]> => {
  try {
    const logs = await foodDiaryApi.list();
    return logs.map(mapFoodLogToEntry);
  } catch (error) {
    console.error('Failed to fetch food logs history', error);
    return [];
  }
};

