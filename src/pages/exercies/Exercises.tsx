import { useState } from 'react';
import styles from './Exercises.module.css';

interface Exercise {
  id: string;
  name: string;
  category: string;
  icon: string;
  duration: number;
  calories: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  equipment: string;
  description: string;
  sets?: number;
  reps?: number;
  video?: string;
}

const CATEGORIES = ['All', 'Cardio', 'Strength', 'Flexibility', 'HIIT', 'Yoga', 'Sports'];

const EXERCISES: Exercise[] = [
  {
    id: '1',
    name: 'Running',
    category: 'Cardio',
    icon: '🏃',
    duration: 30,
    calories: 280,
    difficulty: 'Beginner',
    equipment: 'None',
    description: 'A great cardiovascular exercise that burns calories and improves endurance.'
  },
  {
    id: '2',
    name: 'Push-ups',
    category: 'Strength',
    icon: '💪',
    duration: 15,
    calories: 120,
    difficulty: 'Beginner',
    equipment: 'None',
    description: 'Classic upper body exercise targeting chest, shoulders, and triceps.',
    sets: 3,
    reps: 15
  },
  {
    id: '3',
    name: 'Yoga Flow',
    category: 'Yoga',
    icon: '🧘',
    duration: 45,
    calories: 180,
    difficulty: 'Beginner',
    equipment: 'Yoga Mat',
    description: 'Gentle flowing movements to improve flexibility and reduce stress.'
  },
  {
    id: '4',
    name: 'Weight Lifting',
    category: 'Strength',
    icon: '🏋️',
    duration: 60,
    calories: 350,
    difficulty: 'Intermediate',
    equipment: 'Dumbbells',
    description: 'Build muscle and increase strength with progressive resistance training.',
    sets: 4,
    reps: 12
  },
  {
    id: '5',
    name: 'HIIT Workout',
    category: 'HIIT',
    icon: '⚡',
    duration: 20,
    calories: 320,
    difficulty: 'Advanced',
    equipment: 'None',
    description: 'High-intensity interval training for maximum calorie burn in minimal time.'
  },
  {
    id: '6',
    name: 'Cycling',
    category: 'Cardio',
    icon: '🚴',
    duration: 45,
    calories: 400,
    difficulty: 'Intermediate',
    equipment: 'Bicycle',
    description: 'Low-impact cardio exercise that strengthens legs and improves stamina.'
  },
  {
    id: '7',
    name: 'Swimming',
    category: 'Cardio',
    icon: '🏊',
    duration: 30,
    calories: 350,
    difficulty: 'Intermediate',
    equipment: 'Pool',
    description: 'Full-body workout that is easy on joints and great for cardiovascular health.'
  },
  {
    id: '8',
    name: 'Squats',
    category: 'Strength',
    icon: '🦵',
    duration: 20,
    calories: 180,
    difficulty: 'Beginner',
    equipment: 'None',
    description: 'Essential lower body exercise for building leg and glute strength.',
    sets: 3,
    reps: 20
  },
  {
    id: '9',
    name: 'Stretching',
    category: 'Flexibility',
    icon: '🤸',
    duration: 15,
    calories: 60,
    difficulty: 'Beginner',
    equipment: 'None',
    description: 'Improve flexibility and prevent injury with gentle stretching exercises.'
  },
  {
    id: '10',
    name: 'Boxing',
    category: 'Sports',
    icon: '🥊',
    duration: 40,
    calories: 450,
    difficulty: 'Advanced',
    equipment: 'Boxing Gloves',
    description: 'High-intensity workout combining cardio and strength training.'
  },
  {
    id: '11',
    name: 'Pilates',
    category: 'Flexibility',
    icon: '🧘‍♀️',
    duration: 50,
    calories: 240,
    difficulty: 'Intermediate',
    equipment: 'Mat',
    description: 'Core-focused exercise system that improves posture and body awareness.'
  },
  {
    id: '12',
    name: 'Jump Rope',
    category: 'Cardio',
    icon: '🪢',
    duration: 15,
    calories: 200,
    difficulty: 'Beginner',
    equipment: 'Jump Rope',
    description: 'Simple yet effective cardio exercise that improves coordination.'
  }
];

export default function Exercises() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');

  const filteredExercises = EXERCISES.filter(exercise => {
    const matchesCategory = selectedCategory === 'All' || exercise.category === selectedCategory;
    const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = selectedDifficulty === 'All' || exercise.difficulty === selectedDifficulty;
    return matchesCategory && matchesSearch && matchesDifficulty;
  });

  const totalCalories = filteredExercises.reduce((sum, ex) => sum + ex.calories, 0);
  const totalDuration = filteredExercises.reduce((sum, ex) => sum + ex.duration, 0);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Exercise Library</h2>
          <p className={styles.subtitle}>Find the perfect workout for your fitness goals</p>
        </div>
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{filteredExercises.length}</span>
            <span className={styles.statLabel}>Exercises</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{totalDuration}</span>
            <span className={styles.statLabel}>Total Min</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{totalCalories}</span>
            <span className={styles.statLabel}>Total Cal</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Search exercises..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Difficulty:</label>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className={styles.select}
          >
            <option value="All">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
      </div>

      <div className={styles.categories}>
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`${styles.categoryButton} ${
              selectedCategory === category ? styles.active : ''
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Exercise Grid */}
      <div className={styles.exercisesGrid}>
        {filteredExercises.map((exercise) => (
          <div key={exercise.id} className={styles.exerciseCard}>
            <div className={styles.exerciseHeader}>
              <span className={styles.exerciseIcon}>{exercise.icon}</span>
              <div className={styles.difficultyBadge} data-difficulty={exercise.difficulty.toLowerCase()}>
                {exercise.difficulty}
              </div>
            </div>

            <h3 className={styles.exerciseName}>{exercise.name}</h3>
            <p className={styles.exerciseDescription}>{exercise.description}</p>

            <div className={styles.exerciseStats}>
              <div className={styles.exerciseStat}>
                <span className={styles.exerciseStatIcon}>⏱️</span>
                <span className={styles.exerciseStatValue}>{exercise.duration} min</span>
              </div>
              <div className={styles.exerciseStat}>
                <span className={styles.exerciseStatIcon}>🔥</span>
                <span className={styles.exerciseStatValue}>{exercise.calories} cal</span>
              </div>
              <div className={styles.exerciseStat}>
                <span className={styles.exerciseStatIcon}>🎯</span>
                <span className={styles.exerciseStatValue}>{exercise.equipment}</span>
              </div>
            </div>

            {(exercise.sets && exercise.reps) && (
              <div className={styles.exerciseDetails}>
                <span className={styles.detail}>{exercise.sets} sets</span>
                <span className={styles.detailDivider}>•</span>
                <span className={styles.detail}>{exercise.reps} reps</span>
              </div>
            )}

            <div className={styles.exerciseActions}>
              <button className={styles.primaryButton}>Start Workout</button>
              <button className={styles.secondaryButton}>📋</button>
            </div>
          </div>
        ))}
      </div>

      {filteredExercises.length === 0 && (
        <div className={styles.noResults}>
          <span className={styles.noResultsIcon}>💪</span>
          <p className={styles.noResultsText}>No exercises found</p>
          <p className={styles.noResultsSubtext}>Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
}
