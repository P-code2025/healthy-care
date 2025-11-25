import fs from "fs";
import path from "path";
import { generateAIExercisePlan } from "../src/services/aiExercisePlan";

class MemoryStorage {
  private store = new Map<string, string>();

  getItem(key: string) {
    return this.store.has(key) ? this.store.get(key)! : null;
  }

  setItem(key: string, value: string) {
    this.store.set(key, String(value));
  }

  removeItem(key: string) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }
}

declare global {
  // eslint-disable-next-line no-var
  var localStorage: MemoryStorage;
}

if (typeof globalThis.localStorage === "undefined") {
  globalThis.localStorage = new MemoryStorage();
}

const AVAILABLE_PLANS = [
  "Morning Yoga Flow",
  "Brisk Walking",
  "Bodyweight Circuit",
  "Mobility Reset",
  "Low Impact HIIT",
  "Resistance Band Strength",
  "Stretch & Recover",
];

type Scenario = {
  name: string;
  dailyIntake: number;
  user: any;
  query?: string;
  expectedIntensity?: "light" | "moderate" | "intense";
};

const SCENARIOS: Scenario[] = [
  {
    name: "Low calorie recovery",
    dailyIntake: 800,
    user: {
      age: 29,
      gender: "female",
      weight: 58,
      height: 162,
      goalWeight: 56,
      goal: "lose",
      foodEntries: [],
      workoutPreference: ["yoga", "walking"],
    },
    expectedIntensity: "light",
  },
  {
    name: "Balanced maintenance",
    dailyIntake: 1800,
    user: {
      age: 35,
      gender: "male",
      weight: 78,
      height: 178,
      goalWeight: 78,
      goal: "maintain",
      foodEntries: [],
      workoutPreference: ["strength", "mobility"],
    },
    expectedIntensity: "moderate",
  },
  {
    name: "High energy push",
    dailyIntake: 2600,
    user: {
      age: 40,
      gender: "male",
      weight: 90,
      height: 185,
      goalWeight: 85,
      goal: "lose",
      foodEntries: [],
      workoutPreference: ["cycling", "hiit"],
    },
    expectedIntensity: "intense",
  },
];

const parseBurn = (estimate: string) => {
  const match = estimate.match(/\d+/);
  return match ? Number(match[0]) : 0;
};

(async () => {
  const results: Array<{ scenario: string; expectation?: string; plan: any; warnings: string[] }> = [];

  for (const scenario of SCENARIOS) {
    const plan = await generateAIExercisePlan(
      scenario.dailyIntake,
      scenario.user,
      AVAILABLE_PLANS,
      scenario.query || "Create a workout plan",
      "query"
    );

    const warnings: string[] = [];
    if (scenario.expectedIntensity && plan.intensity !== scenario.expectedIntensity) {
      warnings.push(Expected intensity  but received );
    }
    const burn = parseBurn(plan.totalBurnEstimate);
    if (burn < 250 || burn > 600) {
      warnings.push(Burn estimate  kcal outside target bounds);
    }

    results.push({
      scenario: scenario.name,
      expectation: scenario.expectedIntensity,
      plan,
      warnings,
    });

    console.log(Scenario: );
    console.log(  Summary: );
    console.log(  Intensity:  | Burn: );
    if (warnings.length) {
      warnings.forEach((w) => console.warn(  ??  ));
    }
    console.log();
  }

  const outDir = path.join(process.cwd(), "reports", "ai-eval");
  fs.mkdirSync(outDir, { recursive: true });
  const filePath = path.join(outDir, un-.json);
  fs.writeFileSync(filePath, JSON.stringify(results, null, 2));
  console.log(Evaluation written to );
})();
