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
  rating: number;
  reviews: number;
  healthScore: number;
  steps: number;
  isFeatured?: boolean;
  isPopular?: boolean;
  isRecommended?: boolean;
}

const CATEGORIES = ['All', 'Breakfast', 'Lunch', 'Snack', 'Dinner'];

const RECIPES: Recipe[] = [
  // Featured Menu
  {
    id: 'featured-1',
    name: 'Grilled Turkey Breast with Steamed Asparagus and Brown Rice',
    image: '/images/healthy-menu/grilled-turkey-breast.jpg',
    category: 'Lunch',
    calories: 450,
    protein: 82,
    carbs: 32,
    fat: 4,
    time: 10,
    difficulty: 'Medium',
    rating: 4.8,
    reviews: 125,
    healthScore: 9,
    steps: 4,
    isFeatured: true,
    ingredients: [
      '200g turkey breast',
      'Fresh asparagus',
      'Brown rice',
      'Olive oil',
      'Garlic',
      'Lemon'
    ],
    instructions: [
      'Season and grill turkey breast',
      'Steam asparagus until tender',
      'Cook brown rice',
      'Plate and serve'
    ]
  },
  // Popular Menu
  {
    id: 'popular-1',
    name: 'Greek Salad with Feta and Olives',
    image: '/images/healthy-menu/greek-salad.jpg',
    category: 'Lunch',
    calories: 450,
    protein: 15,
    carbs: 25,
    fat: 32,
    time: 15,
    difficulty: 'Easy',
    rating: 4.9,
    reviews: 89,
    healthScore: 8,
    steps: 3,
    isPopular: true,
    ingredients: [
      'Mixed greens',
      'Feta cheese',
      'Olives',
      'Tomatoes',
      'Cucumber',
      'Olive oil'
    ],
    instructions: [
      'Chop all vegetables',
      'Mix with feta and olives',
      'Drizzle with olive oil dressing'
    ]
  },
  {
    id: 'popular-2',
    name: 'Blueberry Protein Smoothie',
    image: '/images/healthy-menu/blueberry-smoothie.jpg',
    category: 'Breakfast',
    calories: 40,
    protein: 35,
    carbs: 28,
    fat: 12,
    time: 5,
    difficulty: 'Easy',
    rating: 4.5,
    reviews: 156,
    healthScore: 9,
    steps: 2,
    isPopular: true,
    ingredients: [
      'Blueberries',
      'Protein powder',
      'Almond milk',
      'Banana',
      'Honey'
    ],
    instructions: [
      'Blend all ingredients',
      'Serve immediately'
    ]
  },
  {
    id: 'popular-3',
    name: 'Grilled Salmon with Lemon and Asparagus',
    image: '/images/healthy-menu/grilled-salmon.jpg',
    category: 'Dinner',
    calories: 520,
    protein: 45,
    carbs: 18,
    fat: 28,
    time: 25,
    difficulty: 'Medium',
    rating: 4.9,
    reviews: 203,
    healthScore: 9,
    steps: 4,
    isPopular: true,
    ingredients: [
      '200g salmon fillet',
      'Asparagus',
      'Lemon',
      'Olive oil',
      'Garlic',
      'Herbs'
    ],
    instructions: [
      'Season salmon',
      'Grill for 6-8 minutes',
      'Steam asparagus',
      'Serve with lemon'
    ]
  },
  // Recommended Menu
  {
    id: 'recommended-1',
    name: 'Oatmeal with Almond Butter and Berries',
    image: '/images/healthy-menu/oatmeal.jpg',
    category: 'Breakfast',
    calories: 350,
    protein: 12,
    carbs: 55,
    fat: 10,
    time: 10,
    difficulty: 'Easy',
    rating: 4.7,
    reviews: 98,
    healthScore: 8,
    steps: 3,
    isRecommended: true,
    ingredients: [
      'Oatmeal',
      'Almond butter',
      'Mixed berries',
      'Honey',
      'Almond milk'
    ],
    instructions: [
      'Cook oatmeal',
      'Top with almond butter and berries',
      'Drizzle with honey'
    ]
  },
  {
    id: 'recommended-2',
    name: 'Grilled Chicken Wrap with Avocado and Spinach',
    image: '/images/healthy-menu/chicken-wrap.jpg',
    category: 'Lunch',
    calories: 450,
    protein: 38,
    carbs: 42,
    fat: 15,
    time: 20,
    difficulty: 'Easy',
    rating: 4.6,
    reviews: 142,
    healthScore: 8,
    steps: 4,
    isRecommended: true,
    ingredients: [
      'Chicken breast',
      'Whole wheat wrap',
      'Avocado',
      'Spinach',
      'Tomatoes'
    ],
    instructions: [
      'Grill chicken',
      'Slice avocado',
      'Assemble wrap',
      'Roll and serve'
    ]
  },
  {
    id: 'recommended-3',
    name: 'Quinoa Salad with Roasted Vegetables and Feta',
    image: '/images/healthy-menu/quinoa-salad.jpg',
    category: 'Dinner',
    calories: 400,
    protein: 16,
    carbs: 52,
    fat: 14,
    time: 30,
    difficulty: 'Medium',
    rating: 4.8,
    reviews: 87,
    healthScore: 9,
    steps: 5,
    isRecommended: true,
    ingredients: [
      'Quinoa',
      'Bell peppers',
      'Zucchini',
      'Feta cheese',
      'Olive oil',
      'Herbs'
    ],
    instructions: [
      'Cook quinoa',
      'Roast vegetables',
      'Mix together',
      'Add feta',
      'Season and serve'
    ]
  },
  // All Menu Items
  {
    id: 'all-1',
    name: 'Avocado Toast with Poached Egg',
    image: '/images/healthy-menu/avocado-toast.jpg',
    category: 'Breakfast',
    calories: 350,
    protein: 16,
    carbs: 32,
    fat: 18,
    time: 12,
    difficulty: 'Easy',
    rating: 4.8,
    reviews: 234,
    healthScore: 9,
    steps: 4,
    ingredients: [
      'Whole grain bread',
      'Avocado',
      'Eggs',
      'Cherry tomatoes',
      'Lemon'
    ],
    instructions: [
      'Toast bread',
      'Mash avocado',
      'Poach eggs',
      'Assemble'
    ]
  },
  {
    id: 'all-2',
    name: 'Grilled Shrimp Tacos with Mango Salsa',
    image: '/images/healthy-menu/shrimp-tacos.jpg',
    category: 'Lunch',
    calories: 380,
    protein: 32,
    carbs: 42,
    fat: 12,
    time: 25,
    difficulty: 'Medium',
    rating: 4.7,
    reviews: 189,
    healthScore: 8,
    steps: 5,
    ingredients: [
      'Shrimp',
      'Corn tortillas',
      'Mango',
      'Cilantro',
      'Lime'
    ],
    instructions: [
      'Grill shrimp',
      'Make salsa',
      'Warm tortillas',
      'Assemble tacos',
      'Serve'
    ]
  },
  {
    id: 'all-3',
    name: 'Baked Chicken Breast with Quinoa and Kale',
    image: '/images/healthy-menu/baked-chicken.jpg',
    category: 'Dinner',
    calories: 480,
    protein: 52,
    carbs: 40,
    fat: 10,
    time: 35,
    difficulty: 'Medium',
    rating: 4.9,
    reviews: 312,
    healthScore: 9,
    steps: 5,
    ingredients: [
      'Chicken breast',
      'Quinoa',
      'Kale',
      'Garlic',
      'Olive oil'
    ],
    instructions: [
      'Season chicken',
      'Bake at 375°F',
      'Cook quinoa',
      'Sauté kale',
      'Plate together'
    ]
  }
];


export default function HealthyMenu() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [sortBy, setSortBy] = useState<'calories' | 'rating' | 'time'>('calories');

  const featuredRecipe = RECIPES.find(r => r.isFeatured);
  const popularRecipes = RECIPES.filter(r => r.isPopular);
  const recommendedRecipes = RECIPES.filter(r => r.isRecommended);

  const filteredRecipes = RECIPES.filter(recipe => {
    const matchesCategory = selectedCategory === 'All' || recipe.category === selectedCategory;
    const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch && !recipe.isFeatured && !recipe.isPopular && !recipe.isRecommended;
  });

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      'Breakfast': '#FFE5B4',
      'Lunch': '#FFE066',
      'Dinner': '#FFB347',
      'Snack': '#DDA0DD'
    };
    return colors[category] || '#E0E0E0';
  };

  const getHealthScoreBar = (score: number) => {
    return Array(10).fill(0).map((_, i) => (
      <div
        key={i}
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '2px',
          backgroundColor: i < score ? '#FF6B6B' : '#E0E0E0'
        }}
      />
    ));
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Healthy Menu</h1>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.searchBox}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM18 18l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              placeholder="Search menu"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className={styles.addButton}>
            <span>+</span> Add Menu
          </button>
        </div>
      </div>

      {/* Featured Menu */}
      {featuredRecipe && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Featured Menu</h2>
            <button className={styles.moreButton}>•••</button>
          </div>
          <div className={styles.featuredCard}>
            <div className={styles.featuredImage}>
              {featuredRecipe.image.startsWith('/') ? (
                <img src={featuredRecipe.image} alt={featuredRecipe.name} />
              ) : (
                <span className={styles.featuredEmoji}>{featuredRecipe.image}</span>
              )}
            </div>
            <div className={styles.featuredContent}>
              <h3 className={styles.featuredTitle}>{featuredRecipe.name}</h3>
              <div className={styles.featuredMeta}>
                <div className={styles.metaItem}>
                  <span className={styles.metaIcon}>⭐</span>
                  <span>{featuredRecipe.rating}/5 ({featuredRecipe.reviews} reviews)</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Difficulty:</span>
                  <span className={styles.metaDifficulty}>{featuredRecipe.difficulty}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaIcon}>⏱️</span>
                  <span>{featuredRecipe.time} minutes</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaIcon}>📋</span>
                  <span>{featuredRecipe.steps} steps</span>
                </div>
              </div>
              <button className={styles.addToMealButton}>Add to Meal Plan</button>
            </div>
            <div className={styles.featuredStats}>
              <div className={styles.statBox} style={{ backgroundColor: '#D4F4DD' }}>
                <div className={styles.statLabel}>Calories</div>
                <div className={styles.statValue}>{featuredRecipe.calories} kcal</div>
              </div>
              <div className={styles.statBox} style={{ backgroundColor: '#FFF4CC' }}>
                <div className={styles.statLabel}>Protein</div>
                <div className={styles.statValue}>{featuredRecipe.protein} gr</div>
              </div>
              <div className={styles.statBox} style={{ backgroundColor: '#FFE5CC' }}>
                <div className={styles.statLabel}>Carb</div>
                <div className={styles.statValue}>{featuredRecipe.carbs} gr</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Popular Menu */}
      {popularRecipes.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Popular Menu</h2>
            <button className={styles.moreButton}>•••</button>
          </div>
          <div className={styles.popularGrid}>
            {popularRecipes.map((recipe) => (
              <div key={recipe.id} className={styles.popularCard}>
                <div className={styles.popularImage}>
                  {recipe.image.startsWith('/') ? (
                    <img src={recipe.image} alt={recipe.name} />
                  ) : (
                    <span className={styles.popularEmoji}>{recipe.image}</span>
                  )}
                </div>
                <div className={styles.popularContent}>
                  <h3 className={styles.popularTitle}>{recipe.name}</h3>
                  <div className={styles.popularRating}>
                    <span>⭐ {recipe.rating}</span>
                  </div>
                  <div className={styles.popularCategory} style={{ backgroundColor: getCategoryBadge(recipe.category) }}>
                    {recipe.category}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recommended Menu */}
      {recommendedRecipes.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recommended Menu</h2>
            <button className={styles.moreButton}>•••</button>
          </div>
          <div className={styles.recommendedGrid}>
            {recommendedRecipes.map((recipe) => (
              <div key={recipe.id} className={styles.recommendedCard}>
                <div className={styles.recommendedImage}>
                  {recipe.image.startsWith('/') ? (
                    <img src={recipe.image} alt={recipe.name} />
                  ) : (
                    <span className={styles.recommendedEmoji}>{recipe.image}</span>
                  )}
                </div>
                <div className={styles.recommendedContent}>
                  <h3 className={styles.recommendedTitle}>{recipe.name}</h3>
                  <div className={styles.recommendedMeta}>
                    <span className={styles.caloriesTag}>
                      <span className={styles.calorieIcon}>🔥</span>
                      {recipe.calories} kcal
                    </span>
                    <span className={styles.nutritionTag}>
                      <span className={styles.nutritionIcon}>🥗</span>
                      {recipe.carbs}g
                    </span>
                    <span className={styles.nutritionTag}>
                      <span className={styles.nutritionIcon}>💪</span>
                      {recipe.protein}g
                    </span>
                    <span className={styles.nutritionTag}>
                      <span className={styles.nutritionIcon}>🧈</span>
                      {recipe.fat}g
                    </span>
                  </div>
                </div>
                <button className={styles.recommendedAddButton}>+</button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* All Menu */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>All Menu</h2>
          <div className={styles.menuControls}>
            <button 
              className={styles.iconButton}
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="2" y="2" width="6" height="6" stroke="currentColor" strokeWidth="1.5"/>
                <rect x="12" y="2" width="6" height="6" stroke="currentColor" strokeWidth="1.5"/>
                <rect x="2" y="12" width="6" height="6" stroke="currentColor" strokeWidth="1.5"/>
                <rect x="12" y="12" width="6" height="6" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </button>
            <button className={styles.iconButton}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M2 6h16M2 10h16M2 14h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
            <button className={styles.moreButton}>•••</button>
          </div>
        </div>

        <div className={styles.filterControls}>
          <button className={styles.filterButton}>
            <span>⚙️</span> Filter
          </button>
          <div className={styles.categoryTabs}>
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`${styles.categoryTab} ${
                  selectedCategory === category ? styles.active : ''
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          <select 
            className={styles.sortSelect}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
          >
            <option value="calories">Calories</option>
            <option value="rating">Rating</option>
            <option value="time">Time</option>
          </select>
        </div>

        <div className={styles.allMenuList}>
          {filteredRecipes.map((recipe) => (
            <div key={recipe.id} className={styles.menuListItem}>
              <div className={styles.menuListImage}>
                {recipe.image.startsWith('/') ? (
                  <img src={recipe.image} alt={recipe.name} />
                ) : (
                  <span className={styles.menuListEmoji}>{recipe.image}</span>
                )}
                <div className={styles.categoryBadge} style={{ backgroundColor: getCategoryBadge(recipe.category) }}>
                  {recipe.category}
                </div>
                <div className={styles.difficultyBadge}>
                  {recipe.difficulty === 'Easy' && '⚡ Easy'}
                  {recipe.difficulty === 'Medium' && '🔵 Medium'}
                  {recipe.difficulty === 'Hard' && '🔴 Hard'}
                </div>
              </div>
              
              <div className={styles.menuListContent}>
                <div className={styles.menuListLeft}>
                  <h3 className={styles.menuListTitle}>{recipe.name}</h3>
                  <div className={styles.menuListMeta}>
                    <span className={styles.metaText}>
                      <span className={styles.calorieIcon}>🔥</span> {recipe.calories} kcal
                    </span>
                    <span className={styles.metaText}>
                      <span className={styles.metaIcon}>🥗</span> {recipe.carbs}g carbs
                    </span>
                    <span className={styles.metaText}>
                      <span className={styles.metaIcon}>💪</span> {recipe.protein}g protein
                    </span>
                    <span className={styles.metaText}>
                      <span className={styles.metaIcon}>🧈</span> {recipe.fat}g fats
                    </span>
                  </div>
                </div>

                <div className={styles.menuListRight}>
                  <div className={styles.healthScore}>
                    <span className={styles.healthScoreLabel}>Health Score:</span>
                    <div className={styles.healthScoreBar}>
                      {getHealthScoreBar(recipe.healthScore)}
                    </div>
                    <span className={styles.healthScoreValue}>{recipe.healthScore}/10</span>
                  </div>
                  <button className={styles.addToMealButtonSmall}>Add to Meal Plan</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

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
