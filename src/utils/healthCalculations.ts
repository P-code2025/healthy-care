export const calculateBMI = (weightKg: number, heightCm: number): number => {
  if (!weightKg || !heightCm || heightCm === 0) return 0;
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
};

export const getBMICategory = (bmi: number): { category: string; color: string; message: string } => {
  if (bmi < 18.5) return { category: 'Underweight', color: '#60a5fa', message: 'Underweight' };
  if (bmi < 25) return { category: 'Normal', color: '#34d399', message: 'Normal' };
  if (bmi < 30) return { category: 'Overweight', color: '#fbbf24', message: 'Overweight' };
  return { category: 'Obese', color: '#f87171', message: 'Obese' };
};

const calculateBMR = (weight: number, height: number, age: number, gender: 'Male' | 'Female'): number => {
  if (gender === 'Male') {
    return 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age;
  }
  return 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age;
};

const getActivityMultiplier = (workoutDays: number): number => {
  if (workoutDays === 0) return 1.2;
  if (workoutDays <= 2) return 1.375;
  if (workoutDays <= 4) return 1.55;
  if (workoutDays <= 6) return 1.725;
  return 1.9;
};

export const calculateTDEE = (profile: {
  weight: number;
  height: number;
  age: number;
  gender: 'Male' | 'Female';
  workoutDays: number;
}): number => {
  const bmr = calculateBMR(profile.weight, profile.height, profile.age, profile.gender);
  return Math.round(bmr * getActivityMultiplier(profile.workoutDays));
};

export const calculateCalorieGoal = (profile: {
  weight: number;
  height: number;
  age: number;
  gender: 'Male' | 'Female';
  goal: 'lose' | 'maintain' | 'gain';
  workoutDays: number;
  aggressive?: boolean; 
}): number => {
  if (!profile.age || !profile.weight || !profile.height) {
    return 2200; 
  }

  const tdee = calculateTDEE(profile);

  if (profile.goal === 'lose') {
    const deficit = profile.aggressive ? 750 : 500; 
    return Math.max(1500, Math.round(tdee - deficit)); 
  }
  if (profile.goal === 'gain') {
    return Math.round(tdee + 500);
  }
  return tdee; 
};

export const determineGoalType = (currentWeight: number, targetWeight: number): 'lose' | 'maintain' | 'gain' => {
    const diff = targetWeight - currentWeight;
    if (diff < -2) return 'lose';
    if (diff > 2) return 'gain';
    return 'maintain';
};