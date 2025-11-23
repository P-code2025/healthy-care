import type { User } from "../services/api";

const GOAL_PATTERN = /(-?\d+(?:[.,]\d+)?)/;

export const parseGoalWeight = (goal?: string | null): number => {
  if (!goal) return 0;
  const match = goal.match(GOAL_PATTERN);
  if (!match) return 0;
  const normalized = match[1].replace(",", ".");
  const value = parseFloat(normalized);
  return Number.isFinite(value) && value > 0 ? value : 0;
};

const formatWeightValue = (value: number) => {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded)
    ? rounded.toString()
    : rounded.toFixed(1).replace(/\.0$/, "");
};

export const formatGoalWeight = (goalWeight: number): string | undefined => {
  if (!Number.isFinite(goalWeight) || goalWeight <= 0) return undefined;
  return `Reach ${formatWeightValue(goalWeight)}kg`;
};

export const getGoalWeightFromUser = (
  user?: Pick<User, "goal" | "weight_kg"> | null
): number => {
  if (!user) return 0;
  const parsed = parseGoalWeight(user.goal);
  if (parsed > 0) return parsed;
  return user.weight_kg || 0;
};

export type GoalIntent = "lose" | "maintain" | "gain";

export const determineGoalIntent = (
  weight: number,
  goalWeight: number
): GoalIntent => {
  if (!Number.isFinite(weight) || !Number.isFinite(goalWeight) || goalWeight <= 0) {
    return "maintain";
  }
  if (goalWeight < weight - 0.1) return "lose";
  if (goalWeight > weight + 0.1) return "gain";
  return "maintain";
};
