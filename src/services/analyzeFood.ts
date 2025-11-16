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
    const res = await http.request('/api/recognize-food', {
      method: 'POST',
      json: { base64Image: imageData, overrideName, overrideAmount },
    });

    const data = res.data;
    const amount = overrideAmount || data.amount || '100g';

    const analysis: AnalysisResult = {
      foodName: (overrideName || data.foodName || 'Unknown').trim(),
      amount,
      calories: data.calories || 0,
      protein: data.protein || 0,
      carbs: data.carbs || 0,
      fat: data.fat || 0,
      sugar: data.sugar || 0,
      base100g: data.base100g,
      baseAmount: data.base100g ? 100 : undefined,
    };

    return { analysis };
  } catch (error) {
    return {
      analysis: { ...EMPTY_ANALYSIS },
      error: error instanceof Error ? error.message : 'Analysis failed',
    };
  }
}
