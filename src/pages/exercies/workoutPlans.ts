// src/data/workoutPlans.ts
export interface ExerciseInPlan {
  exerciseId: string;
  sets: number;
  name: string;
  reps: string; // "12 reps" | "30s"
  rest: string; // "60s"
  videoUrl: string;
  duration?: number; // tính từ reps
}

export interface WorkoutPlan {
  id: string;
  title: string;
  duration: number;
  calories: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  goal: 'Strength' | 'Fat Loss' | 'Endurance' | 'Flexibility';
  thumbnail: string;
  videoUrl?: string;
  exercises: ExerciseInPlan[];
  progress?: number;
  isSaved: boolean;
  tags?: string[];
}

// === SAMPLE DATA ===
export const SAMPLE_WORKOUT_PLANS: WorkoutPlan[] = [
    {
    id: "hiit-video",
    title: "20 Min HIIT Fat Loss - No Repeat Workout",
    duration: 20,
    calories: 350, // ước tính cho HIIT 20p
    difficulty: "Advanced",
    goal: "Fat Loss",
    thumbnail: "https://img.youtube.com/vi/Pv6NrM7fqHY/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/watch?v=Pv6NrM7fqHY",
    isSaved: false,
    exercises: [
      { exerciseId: "round1", name: "Round 1: Jump Squats + High Knees", sets: 1, reps: "210s", rest: "30s", videoUrl: "https://www.youtube.com/watch?v=Pv6NrM7fqHY" },
      { exerciseId: "round2", name: "Round 2: Burpees + Mountain Climbers", sets: 1, reps: "210s", rest: "30s", videoUrl: "https://www.youtube.com/watch?v=Pv6NrM7fqHY" },
      { exerciseId: "round3", name: "Round 3: Lunges + Jumping Jacks", sets: 1, reps: "210s", rest: "30s", videoUrl: "https://www.youtube.com/watch?v=Pv6NrM7fqHY" },
      { exerciseId: "round4", name: "Round 4: Push Ups + Plank Jacks", sets: 1, reps: "210s", rest: "30s", videoUrl: "https://www.youtube.com/watch?v=Pv6NrM7fqHY" },
      { exerciseId: "round5", name: "Round 5: Full Circuit Burn", sets: 1, reps: "210s", rest: "0s", videoUrl: "https://www.youtube.com/watch?v=Pv6NrM7fqHY" }, // không rest cuối
    ]
  },
  {
    id: "1",
    title: "Full Body Strength - Week 1",
    duration: 45,
    calories: 320,
    difficulty: "Intermediate",
    goal: "Strength",
    thumbnail: "https://img.youtube.com/vi/aclHkVaku9U/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/watch?v=aclHkVaku9U",
    progress: 3,
    isSaved: false,
    exercises: [
      { exerciseId: "sq", name: "Squats", sets: 4, reps: "12", rest: "60s", videoUrl: "https://www.youtube.com/watch?v=aclHkVaku9U" },
      { exerciseId: "pu", name: "Push Ups", sets: 3, reps: "15", rest: "45s", videoUrl: "https://www.youtube.com/watch?v=IODxDxX7oi4" },
      { exerciseId: "dl", name: "Deadlifts", sets: 3, reps: "10", rest: "90s", videoUrl: "https://www.youtube.com/watch?v=op9kVnSso6Q" },
    ]
  },
  {
    id: "2",
    title: "Morning Yoga Flow",
    duration: 20,
    calories: 80,
    difficulty: "Beginner",
    goal: "Flexibility",
    thumbnail: "https://i.ytimg.com/vi/LqXZ628YNj4/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/watch?v=LqXZ628YNj4",
    isSaved: true,
    exercises: [
      { exerciseId: "sun", name: "Sun Salutation", sets: 1, reps: "5 vòng", rest: "30s", videoUrl: "https://www.youtube.com/watch?v=H9qLZR2J3fU" },
    ]
  },
  {
    id: "3",
    title: "HIIT Fat Burn",
    duration: 25,
    calories: 400,
    difficulty: "Advanced",
    goal: "Fat Loss",
    thumbnail: "https://i.ytimg.com/vi/fvThwHk3DVE/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/watch?v=fvThwHk3DVE",
    isSaved: false,
    exercises: [
      { exerciseId: "burpee", name: "Burpees", sets: 4, reps: "30s", rest: "15s", videoUrl: "https://www.youtube.com/watch?v=dZgVxmf6jkA" },
    ]
  },
  {
    id: "4",
    title: "Upper Body Power",
    duration: 35,
    calories: 280,
    difficulty: "Intermediate",
    goal: "Strength",
    thumbnail: "https://img.youtube.com/vi/IODxDxX7oi4/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/watch?v=IODxDxX7oi4",
    progress: 0,
    isSaved: false,
    exercises: []
  },
  {
    id: "5",
    title: "Core & Abs Crusher",
    duration: 15,
    calories: 150,
    difficulty: "Intermediate",
    goal: "Strength",
    thumbnail: "https://img.youtube.com/vi/ASdvN_XEl_c/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/watch?v=ASdvN_XEl_c",
    isSaved: true,
    exercises: []
  },
];
