import { useState } from 'react';
import styles from './HealthyMenu.module.css';

interface Recipe {
  id: string;
  name: string;
  image: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  ingredients: string[];
  instructions: string[];
}

const CATEGORIES = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snack', 'Vegetarian', 'Low-Carb', 'High-Protein'];

const RECIPES: Recipe[] = [
  {
    id: '1',
    name: 'Grilled Chicken Salad',
    image: '🥗',
    category: 'Lunch',
    calories: 450,
    protein: 42,
    carbs: 28,
    fat: 18,
    time: 25,
    difficulty: 'Easy',
    ingredients: [
      '200g chicken breast',
      'Mixed greens',
      'Cherry tomatoes',
      'Cucumber',
      'Olive oil',
      'Lemon juice'
    ],
    instructions: [
      'Grill the chicken breast until fully cooked',
      'Chop vegetables',
      'Mix everything together',
      'Add dressing'
    ]
  },
  {
    id: '2',
    name: 'Oatmeal with Berries',
    image: '🥣',
    category: 'Breakfast',
    calories: 320,
    protein: 12,
    carbs: 55,
    fat: 8,
    time: 10,
    difficulty: 'Easy',
    ingredients: [
      '1/2 cup oatmeal',
      'Mixed berries',
      'Almond milk',
      'Honey',
      'Chia seeds'
    ],
    instructions: [
      'Cook oatmeal with almond milk',
      'Top with berries',
      'Add honey and chia seeds',
      'Serve warm'
    ]
  },
  {
    id: '3',
    name: 'Salmon with Vegetables',
    image: '🍣',
    category: 'Dinner',
    calories: 520,
    protein: 45,
    carbs: 22,
    fat: 28,
    time: 35,
    difficulty: 'Medium',
    ingredients: [
      '200g salmon fillet',
      'Broccoli',
      'Carrots',
      'Sweet potato',
      'Olive oil',
      'Garlic'
    ],
    instructions: [
      'Season salmon with salt and pepper',
      'Bake at 400°F for 15 minutes',
      'Steam vegetables',
      'Serve together'
    ]
  },
  {
    id: '4',
    name: 'Greek Yogurt Parfait',
    image: '🍨',
    category: 'Snack',
    calories: 280,
    protein: 18,
    carbs: 35,
    fat: 8,
    time: 5,
    difficulty: 'Easy',
    ingredients: [
      'Greek yogurt',
      'Granola',
      'Mixed berries',
      'Honey',
      'Almonds'
    ],
    instructions: [
      'Layer yogurt in a glass',
      'Add granola',
      'Top with berries and honey',
      'Sprinkle with almonds'
    ]
  },
  {
    id: '5',
    name: 'Quinoa Buddha Bowl',
    image: '🥙',
    category: 'Lunch',
    calories: 420,
    protein: 16,
    carbs: 48,
    fat: 18,
    time: 30,
    difficulty: 'Medium',
    ingredients: [
      'Quinoa',
      'Chickpeas',
      'Avocado',
      'Kale',
      'Tahini',
      'Lemon'
    ],
    instructions: [
      'Cook quinoa',
      'Roast chickpeas',
      'Arrange in bowl with veggies',
      'Drizzle with tahini dressing'
    ]
  },
  {
    id: '6',
    name: 'Protein Smoothie Bowl',
    image: '🍹',
    category: 'Breakfast',
    calories: 380,
    protein: 28,
    carbs: 42,
    fat: 12,
    time: 8,
    difficulty: 'Easy',
    ingredients: [
      'Protein powder',
      'Banana',
      'Spinach',
      'Almond milk',
      'Peanut butter',
      'Berries'
    ],
    instructions: [
      'Blend all ingredients',
      'Pour into bowl',
      'Top with fruits and nuts',
      'Serve immediately'
    ]
  },
  {
    id: '7',
    name: 'Chicken Stir Fry',
    image: '🍜',
    category: 'Dinner',
    calories: 460,
    protein: 38,
    carbs: 35,
    fat: 18,
    time: 20,
    difficulty: 'Medium',
    ingredients: [
      'Chicken breast',
      'Bell peppers',
      'Broccoli',
      'Soy sauce',
      'Ginger',
      'Brown rice'
    ],
    instructions: [
      'Cook rice',
      'Stir fry chicken',
      'Add vegetables',
      'Season with soy sauce'
    ]
  },
  {
    id: '8',
    name: 'Avocado Toast',
    image: '🥑',
    category: 'Breakfast',
    calories: 340,
    protein: 14,
    carbs: 38,
    fat: 16,
    time: 8,
    difficulty: 'Easy',
    ingredients: [
      'Whole grain bread',
      'Avocado',
      'Eggs',
      'Cherry tomatoes',
      'Feta cheese',
      'Lime'
    ],
    instructions: [
      'Toast bread',
      'Mash avocado with lime',
      'Cook eggs',
      'Assemble and top with tomatoes'
    ]
  }
];

export default function HealthyMenu() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRecipes = RECIPES.filter(recipe => {
    const matchesCategory = selectedCategory === 'All' || recipe.category === selectedCategory;
    const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Healthy Menu</h2>
        <p className={styles.subtitle}>Discover nutritious and delicious recipes</p>
      </div>

      {/* Search and Filter */}
      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Search recipes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
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
      </div>

      {/* Recipe Grid */}
      <div className={styles.recipesGrid}>
        {filteredRecipes.map((recipe) => (
          <div key={recipe.id} className={styles.recipeCard}>
            <div className={styles.recipeImage}>
              <span className={styles.recipeEmoji}>{recipe.image}</span>
              <div className={styles.recipeDifficulty}>
                {recipe.difficulty}
              </div>
            </div>

            <div className={styles.recipeContent}>
              <h3 className={styles.recipeName}>{recipe.name}</h3>
              
              <div className={styles.recipeStats}>
                <div className={styles.stat}>
                  <span className={styles.statIcon}>⏱️</span>
                  <span className={styles.statValue}>{recipe.time} min</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statIcon}>🔥</span>
                  <span className={styles.statValue}>{recipe.calories} cal</span>
                </div>
              </div>

              <div className={styles.macros}>
                <div className={styles.macro}>
                  <span className={styles.macroLabel}>Protein</span>
                  <span className={styles.macroValue}>{recipe.protein}g</span>
                </div>
                <div className={styles.macro}>
                  <span className={styles.macroLabel}>Carbs</span>
                  <span className={styles.macroValue}>{recipe.carbs}g</span>
                </div>
                <div className={styles.macro}>
                  <span className={styles.macroLabel}>Fat</span>
                  <span className={styles.macroValue}>{recipe.fat}g</span>
                </div>
              </div>

              <button className={styles.viewButton}>View Recipe</button>
            </div>
          </div>
        ))}
      </div>

      {filteredRecipes.length === 0 && (
        <div className={styles.noResults}>
          <span className={styles.noResultsIcon}>😕</span>
          <p className={styles.noResultsText}>No recipes found</p>
          <p className={styles.noResultsSubtext}>Try a different search or category</p>
        </div>
      )}
    </div>
  );
}
