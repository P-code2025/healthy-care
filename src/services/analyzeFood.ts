import { ClovaXClient } from '../api/clovax/client';
import type { AnalysisResult } from '../lib/types';

export async function analyzeFood(
  imageData: string,
  overrideName?: string,
  overrideAmount?: string
): Promise<{ analysis: AnalysisResult; error?: string }> {
  try {
    const client = new ClovaXClient("HCX-005");

    const userPrompt = overrideName || overrideAmount
      ? `Analyze "${overrideName || 'this food'}" with amount "${overrideAmount || 'standard'}". Return JSON only.`
      : "Analyze this food image and return JSON only.";

    const messages: any[] = [
      {
        role: "system",
        content: [
          {
            type: "text",
            text: `You are a nutrition assistant. Analyze the food in the image and return ONLY a valid JSON object with this exact format:

{
  "foodName": "string",
  "amount": "string (e.g. 1 phần, 200g)",
  "calories": number,
  "protein": number,
  "carbs": number,
  "fat": number,
  "sugar": number
}

RULES:
- Return ONLY raw JSON, no code blocks, no markdown, no extra text.
- All nutritional values (calories, protein, carbs, fat, sugar) MUST be numbers (e.g. 120, not "120", not "120g").
- If unsure, use 0.
- Example: {"foodName":"rice","amount":"1 bowl","calories":200,"protein":4,"carbs":45,"fat":1,"sugar":0}

Return JSON only.`
          },
        ],
      },
      {
        role: "user",
        content: [
          { type: "image_url", imageUrl: null, dataUri: { data: imageData } },
          { type: "text", text: userPrompt },
        ],
      },
    ];

    const request = {
      messages,
      topP: 0.8,
      temperature: 0.5,
      repetitionPenalty: 1.1,
      maxTokens: 800,
    };

    const response = await client.createChatCompletion(request);
    const assistantMessage = response.result.message;

    let analysisText = "";
    if (typeof assistantMessage.content === "string") {
      analysisText = assistantMessage.content;
    } else if (Array.isArray(assistantMessage.content)) {
      analysisText = assistantMessage.content
        .filter((part: any) => part.type === "text" && part.text)
        .map((part: any) => part.text)
        .join("\n");
    }

    // LÀM SẠCH DỮ LIỆU
    analysisText = analysisText
      .trim()
      .replace(/```json|```/g, '')
      .replace(/,\s*}/g, '}')
      .replace(/,\s*]/g, ']')
      .replace(/(\w+):\s*(\d+(?:\.\d+)?)g?\b/g, (match, key, num) => {
        if (['calories', 'protein', 'carbs', 'fat', 'sugar'].includes(key)) {
          return `${key}: ${parseFloat(num)}`;
        }
        return match;
      });

    let parsed: any;
    try {
      parsed = JSON.parse(analysisText);
    } catch (e) {
      console.error("Parse failed:", analysisText);
      return {
        analysis: {
          foodName: "Không nhận diện",
          amount: "",
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          sugar: 0,
        },
        error: "AI trả về định dạng không hợp lệ",
      };
    }

    const fallback: AnalysisResult = {
      foodName: String(parsed.foodName || "Không xác định").trim(),
      amount: String(parsed.amount || "").trim(),
      calories: Math.round(Number(parsed.calories) || 0),
      protein: Math.round(Number(parsed.protein) || 0),
      carbs: Math.round(Number(parsed.carbs) || 0),
      fat: Math.round(Number(parsed.fat) || 0),
      sugar: Math.round(Number(parsed.sugar) || 0),
    };

    return { analysis: fallback };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return {
      analysis: {
        foodName: "Lỗi phân tích",
        amount: "",
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        sugar: 0,
      },
      error: errorMessage,
    };
  }
}