import type { AnalysisResult } from '../lib/types';
import { http } from './http';

interface RecognizeFoodResponse {
  foodName?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  portionSize?: string;
}

const EMPTY_ANALYSIS: AnalysisResult = {
  foodName: 'Không xác định',
  amount: '',
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  sugar: 0,
};

const computeBase100g = (analysis: AnalysisResult) => {
  const amountMatch = analysis.amount.match(/(\d+(\.\d+)?)/);
  const baseAmount = amountMatch ? parseFloat(amountMatch[0]) : 100;
  const ratio = baseAmount ? 100 / baseAmount : 1;
  return {
    baseAmount,
    values: {
      calories: Math.round(analysis.calories * ratio),
      protein: Math.round(analysis.protein * ratio),
      carbs: Math.round(analysis.carbs * ratio),
      fat: Math.round(analysis.fat * ratio),
      sugar: Math.round(analysis.sugar * ratio),
    },
  };
};

export async function analyzeFood(
  imageData: string,
  overrideName?: string,
  overrideAmount?: string
): Promise<{ analysis: AnalysisResult; error?: string }> {
  try {
    const result = await http.request<{ data?: RecognizeFoodResponse }>('/api/recognize-food', {
      method: 'POST',
      json: {
        base64Image: imageData,
        overrideName,
        overrideAmount,
      },
    });

    const payload = (result?.data ?? result) as RecognizeFoodResponse;
    const amount = overrideAmount || payload.portionSize || '100g';

    const analysis: AnalysisResult = {
      foodName: (overrideName || payload.foodName || EMPTY_ANALYSIS.foodName).trim(),
      amount,
      calories: Math.round(payload.calories || 0),
      protein: Math.round(payload.protein || 0),
      carbs: Math.round(payload.carbs || 0),
      fat: Math.round(payload.fats || 0),
      sugar: 0,
    };

    const { baseAmount, values } = computeBase100g(analysis);
    analysis.baseAmount = baseAmount;
    analysis.base100g = values;

    return { analysis };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Không thể phân tích món ăn';
    return {
      analysis: { ...EMPTY_ANALYSIS },
      error: message,
    };
  }
}
