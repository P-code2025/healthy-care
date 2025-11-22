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
  // ==================== BREAKFAST (8 món) ====================
  {
    id: 'breakfast-1',
    name: 'Oatmeal with Almond Butter, Banana & Chia Seeds',
    image: '/images/recipes/breakfast/Oatmeal.jpg',
    category: 'Breakfast',
    calories: 380,
    protein: 15,
    carbs: 52,
    fat: 12,
    time: 10,
    difficulty: 'Easy',
    rating: 4.8,
    reviews: 342,
    healthScore: 9,
    steps: 4,
    isFeatured: true,
    ingredients: [
      '50g rolled oats',
      '200ml almond milk',
      '1 tbsp almond butter',
      '1 banana',
      '1 tsp chia seeds',
      'Cinnamon'
    ],
    instructions: [
      'Cook oats with almond milk until creamy',
      'Top with sliced banana',
      'Add almond butter & chia seeds',
      'Sprinkle cinnamon'
    ]
  },
  {
    id: 'breakfast-2',
    name: 'Greek Yogurt Parfait with Berries & Granola',
    image: '/images/recipes/breakfast/yogurt-parfait.jpg',
    category: 'Breakfast',
    calories: 320,
    protein: 22,
    carbs: 38,
    fat: 10,
    time: 5,
    difficulty: 'Easy',
    rating: 4.9,
    reviews: 289,
    healthScore: 9,
    steps: 3,
    ingredients: [
      '200g Greek yogurt (0% fat)',
      'Mixed berries',
      '30g low-sugar granola',
      '1 tsp honey'
    ],
    instructions: [
      'Layer yogurt in glass',
      'Add berries and granola',
      'Drizzle with honey'
    ]
  },
  {
    id: 'breakfast-3',
    name: 'Avocado Toast with Poached Eggs & Cherry Tomatoes',
    image: '/images/recipes/breakfast/avocado-toast.jpg',
    category: 'Breakfast',
    calories: 410,
    protein: 18,
    carbs: 35,
    fat: 22,
    time: 15,
    difficulty: 'Easy',
    rating: 4.7,
    reviews: 456,
    healthScore: 9,
    steps: 5,
    ingredients: [
      '2 slices whole grain bread',
      '1 ripe avocado',
      '2 eggs',
      'Cherry tomatoes',
      'Lemon juice, salt, pepper'
    ],
    instructions: [
      'Toast bread',
      'Mash avocado with lemon & salt',
      'Poach eggs',
      'Top toast with avocado, egg, tomatoes',
      'Season'
    ]
  },
  {
    id: 'breakfast-4',
    name: 'Spinach & Mushroom Egg White Omelette',
    image: '/images/recipes/breakfast/egg-omelette.jpg',
    category: 'Breakfast',
    calories: 280,
    protein: 28,
    carbs: 12,
    fat: 14,
    time: 12,
    difficulty: 'Easy',
    rating: 4.6,
    reviews: 201,
    healthScore: 9,
    steps: 4,
    ingredients: [
      '6 egg whites',
      'Handful spinach',
      '100g mushrooms',
      '1 tsp olive oil',
      'Herbs'
    ],
    instructions: [
      'Sauté mushrooms in olive oil',
      'Add spinach until wilted',
      'Pour in egg whites',
      'Cook until set, fold'
    ]
  },
  {
    id: 'breakfast-5',
    name: 'Protein Pancakes with Fresh Fruit',
    image: '/images/recipes/breakfast/protein-pancakes.jpg',
    category: 'Breakfast',
    calories: 390,
    protein: 25,
    carbs: 48,
    fat: 10,
    time: 15,
    difficulty: 'Medium',
    rating: 4.8,
    reviews: 378,
    healthScore: 8,
    steps: 5,
    ingredients: [
      '1 scoop protein powder',
      '1 banana',
      '50g oats',
      '2 egg whites',
      'Berries & honey'
    ],
    instructions: [
      'Blend all ingredients',
      'Cook on non-stick pan',
      'Stack pancakes',
      'Top with berries & honey',
      'Serve warm'
    ]
  },
  {
    id: 'breakfast-6',
    name: 'Chia Seed Pudding with Mango & Coconut',
    image: '/images/recipes/breakfast/chia-pudding.webp',
    category: 'Breakfast',
    calories: 310,
    protein: 12,
    carbs: 42,
    fat: 14,
    time: 10,
    difficulty: 'Easy',
    rating: 4.7,
    reviews: 167,
    healthScore: 9,
    steps: 3,
    ingredients: [
      '3 tbsp chia seeds',
      '200ml coconut milk',
      'Fresh mango',
      'Shredded coconut'
    ],
    instructions: [
      'Mix chia with coconut milk',
      'Let sit 4+ hours or overnight',
      'Top with mango & coconut'
    ]
  },
  {
    id: 'breakfast-7',
    name: 'Smoked Salmon & Whole Grain Bagel',
    image: '/images/recipes/breakfast/salmon-bagel.avif',
    category: 'Breakfast',
    calories: 420,
    protein: 28,
    carbs: 45,
    fat: 16,
    time: 8,
    difficulty: 'Easy',
    rating: 4.9,
    reviews: 298,
    healthScore: 8,
    steps: 3,
    ingredients: [
      'Whole grain bagel',
      '100g smoked salmon',
      'Cream cheese (light)',
      'Capers, red onion'
    ],
    instructions: [
      'Toast bagel',
      'Spread cream cheese',
      'Add salmon, capers, onion'
    ]
  },
  {
    id: 'breakfast-8',
    name: 'Green Smoothie Bowl',
    image: '/images/recipes/breakfast/green-smoothie.webp',
    category: 'Breakfast',
    calories: 360,
    protein: 20,
    carbs: 48,
    fat: 12,
    time: 7,
    difficulty: 'Easy',
    rating: 4.6,
    reviews: 312,
    healthScore: 9,
    steps: 3,
    ingredients: [
      'Spinach, banana, protein powder',
      'Almond milk',
      'Toppings: kiwi, seeds, coconut'
    ],
    instructions: [
      'Blend all base ingredients',
      'Pour into bowl',
      'Add toppings'
    ]
  },

  // ==================== LUNCH (8 món) ====================
  {
    id: 'lunch-1',
    name: 'Grilled Turkey Breast with Quinoa & Roasted Veggies',
    image: '/images/recipes/lunch/turkey-quinoa.webp',
    category: 'Lunch',
    calories: 480,
    protein: 42,
    carbs: 45,
    fat: 16,
    time: 25,
    difficulty: 'Medium',
    rating: 4.9,
    reviews: 412,
    healthScore: 9,
    steps: 5,
    isFeatured: true,
    ingredients: [
      '180g turkey breast',
      '100g quinoa',
      'Broccoli, bell pepper, zucchini',
      'Olive oil, herbs'
    ],
    instructions: [
      'Season and grill turkey',
      'Cook quinoa',
      'Roast vegetables',
      'Plate together',
      'Drizzle olive oil'
    ]
  },
  {
    id: 'lunch-2',
    name: 'Tuna & White Bean Salad',
    image: '/images/recipes/lunch/tuna-bean.jpg',
    category: 'Lunch',
    calories: 450,
    protein: 38,
    carbs: 40,
    fat: 18,
    time: 15,
    difficulty: 'Easy',
    rating: 4.8,
    reviews: 267,
    healthScore: 9,
    steps: 4,
    ingredients: [
      '1 can tuna in water',
      '1 can white beans',
      'Cherry tomatoes, cucumber',
      'Lemon, olive oil'
    ],
    instructions: [
      'Drain tuna and beans',
      'Chop vegetables',
      'Mix all',
      'Dress with lemon & oil'
    ]
  },
  {
    id: 'lunch-3',
    name: 'Chicken & Sweet Potato Bowl',
    image: '/images/recipes/lunch/chicken-sweetpotato.jpg',
    category: 'Lunch',
    calories: 520,
    protein: 40,
    carbs: 52,
    fat: 15,
    time: 30,
    difficulty: 'Medium',
    rating: 4.7,
    reviews: 389,
    healthScore: 9,
    steps: 5,
    ingredients: [
      '150g chicken breast',
      '1 medium sweet potato',
      'Kale, avocado',
      'Tahini dressing'
    ],
    instructions: [
      'Bake sweet potato',
      'Grill chicken',
      'Sauté kale',
      'Assemble bowl',
      'Drizzle tahini'
    ]
  },
  {
    id: 'lunch-4',
    name: 'Lentil & Vegetable Soup',
    image: '/images/recipes/lunch/lentil-soup.webp',
    category: 'Lunch',
    calories: 380,
    protein: 22,
    carbs: 55,
    fat: 8,
    time: 35,
    difficulty: 'Medium',
    rating: 4.6,
    reviews: 198,
    healthScore: 9,
    steps: 6,
    ingredients: [
      '100g green lentils',
      'Carrot, celery, onion',
      'Garlic, tomato paste',
      'Vegetable broth'
    ],
    instructions: [
      'Sauté vegetables',
      'Add lentils and broth',
      'Simmer 25 mins',
      'Season and serve'
    ]
  },
  {
    id: 'lunch-5',
    name: 'Grilled Salmon with Asparagus & Brown Rice',
    image: '/images/recipes/lunch/salmon-asparagus.jpg',
    category: 'Lunch',
    calories: 510,
    protein: 45,
    carbs: 42,
    fat: 22,
    time: 25,
    difficulty: 'Medium',
    rating: 4.9,
    reviews: 501,
    healthScore: 10,
    steps: 4,
    ingredients: [
      '180g salmon',
      'Asparagus',
      '100g brown rice',
      'Lemon, garlic'
    ],
    instructions: [
      'Cook brown rice',
      'Grill salmon',
      'Steam asparagus',
      'Serve with lemon'
    ]
  },
  {
    id: 'lunch-6',
    name: 'Chickpea & Avocado Wrap',
    image: '/images/recipes/lunch/chickpea-wrap.avif',
    category: 'Lunch',
    calories: 460,
    protein: 18,
    carbs: 58,
    fat: 20,
    time: 15,
    difficulty: 'Easy',
    rating: 4.7,
    reviews: 234,
    healthScore: 8,
    steps: 4,
    ingredients: [
      'Whole wheat wrap',
      '1 can chickpeas',
      'Avocado, spinach',
      'Hummus'
    ],
    instructions: [
      'Mash chickpeas',
      'Spread hummus',
      'Add avocado & spinach',
      'Roll and cut'
    ]
  },
  {
    id: 'lunch-7',
    name: 'Beef Stir-Fry with Broccoli & Brown Rice',
    image: '/images/recipes/lunch/beef-stirfry.jpeg',
    category: 'Lunch',
    calories: 530,
    protein: 40,
    carbs: 48,
    fat: 18,
    time: 20,
    difficulty: 'Medium',
    rating: 4.8,
    reviews: 312,
    healthScore: 9,
    steps: 5,
    ingredients: [
      '150g lean beef',
      'Broccoli',
      'Brown rice',
      'Soy sauce, garlic'
    ],
    instructions: [
      'Cook rice',
      'Stir-fry beef',
      'Add broccoli',
      'Season with soy',
      'Serve over rice'
    ]
  },
  {
    id: 'lunch-8',
    name: 'Mediterranean Quinoa Bowl',
    image: '/images/recipes/lunch/mediterranean-bowl.jpg',
    category: 'Lunch',
    calories: 470,
    protein: 20,
    carbs: 55,
    fat: 22,
    time: 25,
    difficulty: 'Medium',
    rating: 4.8,
    reviews: 267,
    healthScore: 9,
    steps: 5,
    ingredients: [
      '100g quinoa',
      'Feta, olives, cucumber',
      'Cherry tomatoes',
      'Olive oil dressing'
    ],
    instructions: [
      'Cook quinoa',
      'Chop vegetables',
      'Mix all',
      'Add feta & olives',
      'Dress with oil'
    ]
  },

  // ==================== SNACK (8 món) ====================
  {
    id: 'snack-1',
    name: 'Apple with Almond Butter',
    image: '/images/recipes/snack/apple-almond.jpg',
    category: 'Snack',
    calories: 200,
    protein: 5,
    carbs: 25,
    fat: 12,
    time: 2,
    difficulty: 'Easy',
    rating: 4.9,
    reviews: 567,
    healthScore: 9,
    steps: 2,
    ingredients: [
      '1 apple',
      '2 tbsp almond butter'
    ],
    instructions: [
      'Slice apple',
      'Spread almond butter'
    ]
  },
  {
    id: 'snack-2',
    name: 'Greek Yogurt with Honey & Walnuts',
    image: '/images/recipes/snack/yogurt-honey.jpg',
    category: 'Snack',
    calories: 180,
    protein: 15,
    carbs: 18,
    fat: 8,
    time: 3,
    difficulty: 'Easy',
    rating: 4.8,
    reviews: 432,
    healthScore: 9,
    steps: 3,
    ingredients: [
      '150g Greek yogurt',
      '1 tsp honey',
      '5 walnuts'
    ],
    instructions: [
      'Scoop yogurt',
      'Drizzle honey',
      'Top with walnuts'
    ]
  },
  {
    id: 'snack-3',
    name: 'Protein Energy Balls',
    image: '/images/recipes/snack/energy-balls.jpg',
    category: 'Snack',
    calories: 220,
    protein: 12,
    carbs: 20,
    fat: 10,
    time: 10,
    difficulty: 'Easy',
    rating: 4.7,
    reviews: 389,
    healthScore: 8,
    steps: 4,
    ingredients: [
      'Oats, protein powder',
      'Peanut butter, honey',
      'Dark chocolate chips'
    ],
    instructions: [
      'Mix all ingredients',
      'Roll into balls',
      'Chill 30 mins',
      'Enjoy'
    ]
  },
  {
    id: 'snack-4',
    name: 'Carrot Sticks with Hummus',
    image: '/images/recipes/snack/carrot-hummus.webp',
    category: 'Snack',
    calories: 160,
    protein: 6,
    carbs: 22,
    fat: 8,
    time: 5,
    difficulty: 'Easy',
    rating: 4.6,
    reviews: 298,
    healthScore: 9,
    steps: 2,
    ingredients: [
      '2 carrots',
      '3 tbsp hummus'
    ],
    instructions: [
      'Cut carrots into sticks',
      'Serve with hummus'
    ]
  },
  {
    id: 'snack-5',
    name: 'Cottage Cheese with Pineapple',
    image: '/images/recipes/snack/cottage-pineapple.jpg',
    category: 'Snack',
    calories: 190,
    protein: 18,
    carbs: 20,
    fat: 4,
    time: 3,
    difficulty: 'Easy',
    rating: 4.7,
    reviews: 256,
    healthScore: 9,
    steps: 2,
    ingredients: [
      '150g low-fat cottage cheese',
      'Fresh pineapple chunks'
    ],
    instructions: [
      'Scoop cottage cheese',
      'Top with pineapple'
    ]
  },
  {
    id: 'snack-6',
    name: 'Handful of Mixed Nuts',
    image: '/images/recipes/snack/mixed-nuts.jpg',
    category: 'Snack',
    calories: 180,
    protein: 5,
    carbs: 6,
    fat: 16,
    time: 1,
    difficulty: 'Easy',
    rating: 4.5,
    reviews: 412,
    healthScore: 8,
    steps: 1,
    ingredients: [
      '30g almonds, walnuts, cashews'
    ],
    instructions: [
      'Grab and eat!'
    ]
  },
  {
    id: 'snack-7',
    name: 'Rice Cake with Avocado & Egg',
    image: '/images/recipes/snack/rice-cake.jpg',
    category: 'Snack',
    calories: 210,
    protein: 10,
    carbs: 22,
    fat: 12,
    time: 8,
    difficulty: 'Easy',
    rating: 4.6,
    reviews: 334,
    healthScore: 9,
    steps: 3,
    ingredients: [
      '1 rice cake',
      '½ avocado',
      '1 boiled egg'
    ],
    instructions: [
      'Mash avocado',
      'Spread on rice cake',
      'Top with sliced egg'
    ]
  },
  {
    id: 'snack-8',
    name: 'Berry Protein Shake',
    image: '/images/recipes/snack/berry-shake.jpg',
    category: 'Snack',
    calories: 240,
    protein: 25,
    carbs: 28,
    fat: 4,
    time: 5,
    difficulty: 'Easy',
    rating: 4.8,
    reviews: 501,
    healthScore: 9,
    steps: 2,
    ingredients: [
      '1 scoop protein powder',
      'Mixed berries',
      'Almond milk'
    ],
    instructions: [
      'Blend all',
      'Drink!'
    ]
  },

  // ==================== DINNER (8 món) ====================
  {
    id: 'dinner-1',
    name: 'Baked Cod with Sweet Potato & Green Beans',
    image: '/images/recipes/dinner/baked-cod.avif',
    category: 'Dinner',
    calories: 460,
    protein: 40,
    carbs: 45,
    fat: 12,
    time: 30,
    difficulty: 'Medium',
    rating: 4.9,
    reviews: 423,
    healthScore: 10,
    steps: 5,
    isFeatured: true,
    ingredients: [
      '180g cod fillet',
      '1 sweet potato',
      'Green beans',
      'Lemon, garlic'
    ],
    instructions: [
      'Bake sweet potato',
      'Season and bake cod',
      'Steam green beans',
      'Plate with lemon',
      'Serve'
    ]
  },
  {
    id: 'dinner-2',
    name: 'Turkey Meatballs with Zucchini Noodles',
    image: '/images/recipes/dinner/turkey-meatballs.jpg',
    category: 'Dinner',
    calories: 420,
    protein: 38,
    carbs: 18,
    fat: 22,
    time: 25,
    difficulty: 'Medium',
    rating: 4.8,
    reviews: 356,
    healthScore: 9,
    steps: 5,
    ingredients: [
      '400g ground turkey',
      'Zucchini',
      'Marinara sauce (low sugar)',
      'Herbs'
    ],
    instructions: [
      'Make turkey meatballs',
      'Bake 20 mins',
      'Spiralize zucchini',
      'Warm sauce',
      'Combine'
    ]
  },
  {
    id: 'dinner-3',
    name: 'Grilled Chicken with Cauliflower Rice',
    image: '/images/recipes/dinner/chicken-cauliflower.webp',
    category: 'Dinner',
    calories: 480,
    protein: 45,
    carbs: 20,
    fat: 24,
    time: 20,
    difficulty: 'Easy',
    rating: 4.7,
    reviews: 389,
    healthScore: 9,
    steps: 4,
    ingredients: [
      '180g chicken breast',
      'Cauliflower rice',
      'Broccoli',
      'Olive oil'
    ],
    instructions: [
      'Grill chicken',
      'Sauté cauliflower rice',
      'Steam broccoli',
      'Serve'
    ]
  },
  {
    id: 'dinner-4',
    name: 'Shrimp Stir-Fry with Mixed Vegetables',
    image: '/images/recipes/dinner/shrimp-stirfry.jpg',
    category: 'Dinner',
    calories: 450,
    protein: 35,
    carbs: 38,
    fat: 18,
    time: 15,
    difficulty: 'Easy',
    rating: 4.8,
    reviews: 298,
    healthScore: 9,
    steps: 4,
    ingredients: [
      '200g shrimp',
      'Bell peppers, broccoli, carrot',
      'Soy sauce, garlic'
    ],
    instructions: [
      'Stir-fry vegetables',
      'Add shrimp',
      'Season',
      'Serve hot'
    ]
  },
  {
    id: 'dinner-5',
    name: 'Stuffed Bell Peppers with Ground Turkey',
    image: '/images/recipes/dinner/stuffed-peppers.webp',
    category: 'Dinner',
    calories: 510,
    protein: 40,
    carbs: 45,
    fat: 20,
    time: 40,
    difficulty: 'Medium',
    rating: 4.9,
    reviews: 412,
    healthScore: 9,
    steps: 6,
    ingredients: [
      '4 bell peppers',
      '400g ground turkey',
      'Quinoa, tomato sauce',
      'Cheese (optional)'
    ],
    instructions: [
      'Cook quinoa',
      'Brown turkey',
      'Mix with sauce',
      'Stuff peppers',
      'Bake 30 mins',
      'Top with cheese'
    ]
  },
  {
    id: 'dinner-6',
    name: 'Tofu & Vegetable Curry',
    image: '/images/recipes/dinner/tofu-curry.webp',
    category: 'Dinner',
    calories: 430,
    protein: 22,
    carbs: 48,
    fat: 18,
    time: 30,
    difficulty: 'Medium',
    rating: 4.7,
    reviews: 234,
    healthScore: 9,
    steps: 5,
    ingredients: [
      '200g firm tofu',
      'Coconut milk (light)',
      'Mixed vegetables',
      'Curry paste'
    ],
    instructions: [
      'Cube tofu',
      'Sauté vegetables',
      'Add curry paste',
      'Pour coconut milk',
      'Simmer'
    ]
  },
  {
    id: 'dinner-7',
    name: 'Baked Chicken Thighs with Brussels Sprouts',
    image: '/images/recipes/dinner/chicken-brussels.jpg',
    category: 'Dinner',
    calories: 520,
    protein: 42,
    carbs: 28,
    fat: 28,
    time: 35,
    difficulty: 'Medium',
    rating: 4.8,
    reviews: 301,
    healthScore: 9,
    steps: 4,
    ingredients: [
      '4 chicken thighs (skinless)',
      'Brussels sprouts',
      'Olive oil, balsamic'
    ],
    instructions: [
      'Season chicken',
      'Roast with sprouts',
      'Drizzle balsamic',
      'Bake 30 mins'
    ]
  },
  {
    id: 'dinner-8',
    name: 'Salmon & Lentil Salad',
    image: '/images/recipes/dinner/salmon-lentil.jpg',
    category: 'Dinner',
    calories: 500,
    protein: 45,
    carbs: 40,
    fat: 22,
    time: 25,
    difficulty: 'Medium',
    rating: 4.9,
    reviews: 456,
    healthScore: 10,
    steps: 5,
    ingredients: [
      '180g baked salmon',
      '100g cooked lentils',
      'Arugula, cucumber',
      'Lemon vinaigrette'
    ],
    instructions: [
      'Bake salmon',
      'Cook lentils',
      'Mix greens',
      'Flake salmon on top',
      'Dress'
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
        </div>
      </div>

      {/* Featured Menu */}
      {featuredRecipe && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Featured Menu</h2>
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
              </div>
            ))}
          </div>
        </section>
      )}

      {/* All Menu */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>All Menu</h2>
        </div>

        <div className={styles.filterControls}>
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
