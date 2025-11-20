// src/services/groceryListGenerator.ts

interface Meal {
    id: string;
    name: string;
    category: 'Breakfast' | 'Lunch' | 'Snack' | 'Dinner';
}

interface DayMeals {
    day: string;
    date: string;
    breakfast?: Meal;
    lunch?: Meal;
    snack?: Meal;
    dinner?: Meal;
}

export interface GroceryItem {
    id: string;
    name: string;
    image: string;
    category: 'Grains' | 'Protein' | 'Fruits' | 'Veggies' | 'Dairy' | 'Others';
    quantity: number;
    unit: string;
    calories: number;
    cost: number;
    actual: number;
    status: 'Purchased' | 'Pending';
}

// Ingredient extraction patterns for common meal ingredients
const INGREDIENT_PATTERNS: Record<string, GroceryItem> = {
    // Grains keywords
    'oats': {
        id: '', name: 'Oats', image: '/images/grocery/oats.jpg', category: 'Grains',
        quantity: 500, unit: 'gr', calories: 1900, cost: 10.00, actual: 1.5, status: 'Pending'
    },
    'oatmeal': {
        id: '', name: 'Oats', image: '/images/grocery/oats.jpg', category: 'Grains',
        quantity: 500, unit: 'gr', calories: 1900, cost: 10.00, actual: 1.5, status: 'Pending'
    },
    'quinoa': {
        id: '', name: 'Quinoa', image: '/images/grocery/quinoa.jpg', category: 'Grains',
        quantity: 500, unit: 'gr', calories: 1900, cost: 11.00, actual: 1.1, status: 'Pending'
    },
    'rice': {
        id: '', name: 'Brown Rice', image: '/images/grocery/brown-rice.jpg', category: 'Grains',
        quantity: 500, unit: 'gr', calories: 1800, cost: 10.00, actual: 1.4, status: 'Pending'
    },
    'toast': {
        id: '', name: 'Whole Grain Bread', image: '/images/grocery/bread.jpg', category: 'Grains',
        quantity: 1, unit: 'loaf', calories: 1200, cost: 5.00, actual: 1.0, status: 'Pending'
    },
    'wrap': {
        id: '', name: 'Whole Wheat Wraps', image: '/images/grocery/wraps.jpg', category: 'Grains',
        quantity: 8, unit: 'pieces', calories: 800, cost: 6.00, actual: 1.0, status: 'Pending'
    },
    'tacos': {
        id: '', name: 'Corn Tortillas', image: '/images/grocery/tortillas.jpg', category: 'Grains',
        quantity: 12, unit: 'pieces', calories: 720, cost: 4.50, actual: 1.0, status: 'Pending'
    },

    // Protein keywords
    'chicken': {
        id: '', name: 'Chicken Breast', image: '/images/grocery/chicken.jpg', category: 'Protein',
        quantity: 1, unit: 'kg', calories: 1650, cost: 18.00, actual: 1.8, status: 'Pending'
    },
    'turkey': {
        id: '', name: 'Turkey Breast', image: '/images/grocery/turkey.jpg', category: 'Protein',
        quantity: 1, unit: 'kg', calories: 1350, cost: 20.00, actual: 1.9, status: 'Pending'
    },
    'salmon': {
        id: '', name: 'Salmon Fillets', image: '/images/grocery/salmon.jpg', category: 'Protein',
        quantity: 500, unit: 'gr', calories: 900, cost: 25.00, actual: 2.0, status: 'Pending'
    },
    'tilapia': {
        id: '', name: 'Tilapia Fillets', image: '/images/grocery/tilapia.jpg', category: 'Protein',
        quantity: 500, unit: 'gr', calories: 550, cost: 15.00, actual: 1.5, status: 'Pending'
    },
    'shrimp': {
        id: '', name: 'Shrimp', image: '/images/grocery/shrimp.jpg', category: 'Protein',
        quantity: 500, unit: 'gr', calories: 500, cost: 22.00, actual: 1.8, status: 'Pending'
    },
    'tuna': {
        id: '', name: 'Canned Tuna', image: '/images/grocery/tuna.jpg', category: 'Protein',
        quantity: 4, unit: 'cans', calories: 400, cost: 12.00, actual: 1.3, status: 'Pending'
    },
    'eggs': {
        id: '', name: 'Eggs', image: '/images/grocery/eggs.jpg', category: 'Protein',
        quantity: 12, unit: 'units', calories: 840, cost: 8.00, actual: 1.2, status: 'Pending'
    },
    'tofu': {
        id: '', name: 'Firm Tofu', image: '/images/grocery/tofu.jpg', category: 'Protein',
        quantity: 400, unit: 'gr', calories: 320, cost: 7.00, actual: 1.1, status: 'Pending'
    },

    // Fruits keywords
    'avocado': {
        id: '', name: 'Avocado', image: '/images/grocery/avocado.jpg', category: 'Fruits',
        quantity: 3, unit: 'units', calories: 720, cost: 9.00, actual: 1.2, status: 'Pending'
    },
    'berries': {
        id: '', name: 'Mixed Berries', image: '/images/grocery/berries.jpg', category: 'Fruits',
        quantity: 250, unit: 'gr', calories: 120, cost: 7.50, actual: 1.4, status: 'Pending'
    },
    'banana': {
        id: '', name: 'Bananas', image: '/images/grocery/bananas.jpg', category: 'Fruits',
        quantity: 6, unit: 'units', calories: 540, cost: 5.00, actual: 1.0, status: 'Pending'
    },
    'apple': {
        id: '', name: 'Apples', image: '/images/grocery/apples.jpg', category: 'Fruits',
        quantity: 6, unit: 'units', calories: 480, cost: 6.00, actual: 1.1, status: 'Pending'
    },
    'strawberries': {
        id: '', name: 'Strawberries', image: '/images/grocery/strawberries.jpg', category: 'Fruits',
        quantity: 250, unit: 'gr', calories: 80, cost: 6.50, actual: 1.2, status: 'Pending'
    },
    'mango': {
        id: '', name: 'Mangos', image: '/images/grocery/mango.jpg', category: 'Fruits',
        quantity: 2, unit: 'units', calories: 300, cost: 7.00, actual: 1.3, status: 'Pending'
    },
    'pineapple': {
        id: '', name: 'Pineapple', image: '/images/grocery/pineapple.jpg', category: 'Fruits',
        quantity: 1, unit: 'unit', calories: 450, cost: 8.00, actual: 1.4, status: 'Pending'
    },

    // Veggies keywords
    'spinach': {
        id: '', name: 'Spinach', image: '/images/grocery/spinach.jpg', category: 'Veggies',
        quantity: 300, unit: 'gr', calories: 69, cost: 6.00, actual: 1.3, status: 'Pending'
    },
    'broccoli': {
        id: '', name: 'Broccoli', image: '/images/grocery/broccoli.jpg', category: 'Veggies',
        quantity: 500, unit: 'gr', calories: 175, cost: 5.50, actual: 1.2, status: 'Pending'
    },
    'asparagus': {
        id: '', name: 'Asparagus', image: '/images/grocery/asparagus.jpg', category: 'Veggies',
        quantity: 300, unit: 'gr', calories: 60, cost: 7.00, actual: 1.5, status: 'Pending'
    },
    'sweet potato': {
        id: '', name: 'Sweet Potatoes', image: '/images/grocery/sweet-potatoes.jpg', category: 'Veggies',
        quantity: 2, unit: 'units', calories: 360, cost: 5.50, actual: 1.1, status: 'Pending'
    },
    'kale': {
        id: '', name: 'Kale', image: '/images/grocery/kale.jpg', category: 'Veggies',
        quantity: 200, unit: 'gr', calories: 100, cost: 5.00, actual: 1.2, status: 'Pending'
    },
    'brussels sprouts': {
        id: '', name: 'Brussels Sprouts', image: '/images/grocery/brussels-sprouts.jpg', category: 'Veggies',
        quantity: 300, unit: 'gr', calories: 129, cost: 6.50, actual: 1.4, status: 'Pending'
    },
    'green beans': {
        id: '', name: 'Green Beans', image: '/images/grocery/green-beans.jpg', category: 'Veggies',
        quantity: 300, unit: 'gr', calories: 93, cost: 5.00, actual: 1.1, status: 'Pending'
    },
    'carrot': {
        id: '', name: 'Carrots', image: '/images/grocery/carrots.jpg', category: 'Veggies',
        quantity: 500, unit: 'gr', calories: 205, cost: 4.00, actual: 1.0, status: 'Pending'
    },

    // Dairy keywords
    'yogurt': {
        id: '', name: 'Greek Yogurt', image: '/images/grocery/greek-yogurt.jpg', category: 'Dairy',
        quantity: 1, unit: 'tub', calories: 600, cost: 8.50, actual: 1.4, status: 'Pending'
    },
    'cheese': {
        id: '', name: 'Feta Cheese', image: '/images/grocery/feta-cheese.jpg', category: 'Dairy',
        quantity: 200, unit: 'gr', calories: 540, cost: 7.00, actual: 1.3, status: 'Pending'
    },
    'cottage cheese': {
        id: '', name: 'Cottage Cheese', image: '/images/grocery/cottage-cheese.jpg', category: 'Dairy',
        quantity: 400, unit: 'gr', calories: 400, cost: 6.50, actual: 1.2, status: 'Pending'
    },

    // Others keywords  
    'almond butter': {
        id: '', name: 'Almond Butter', image: '/images/grocery/almond-butter.jpg', category: 'Others',
        quantity: 1, unit: 'jar', calories: 1600, cost: 12.50, actual: 1.5, status: 'Pending'
    },
    'peanut butter': {
        id: '', name: 'Peanut Butter', image: '/images/grocery/peanut-butter.jpg', category: 'Others',
        quantity: 1, unit: 'jar', calories: 1500, cost: 10.00, actual: 1.3, status: 'Pending'
    },
    'almonds': {
        id: '', name: 'Almonds', image: '/images/grocery/almonds.jpg', category: 'Others',
        quantity: 200, unit: 'gr', calories: 1160, cost: 11.00, actual: 1.4, status: 'Pending'
    },
    'walnuts': {
        id: '', name: 'Walnuts', image: '/images/grocery/walnuts.jpg', category: 'Others',
        quantity: 200, unit: 'gr', calories: 1310, cost: 12.00, actual: 1.5, status: 'Pending'
    },
    'hummus': {
        id: '', name: 'Hummus', image: '/images/grocery/hummus.jpg', category: 'Others',
        quantity: 300, unit: 'gr', calories: 810, cost: 7.50, actual: 1.2, status: 'Pending'
    },
    'honey': {
        id: '', name: 'Honey', image: '/images/grocery/honey.jpg', category: 'Others',
        quantity: 1, unit: 'jar', calories: 1280, cost: 9.00, actual: 1.3, status: 'Pending'
    },
    'olives': {
        id: '', name: 'Olives', image: '/images/grocery/olives.jpg', category: 'Others',
        quantity: 200, unit: 'gr', calories: 230, cost: 6.00, actual: 1.1, status: 'Pending'
    },
    'beans': {
        id: '', name: 'Black Beans', image: '/images/grocery/black-beans.jpg', category: 'Protein',
        quantity: 2, unit: 'cans', calories: 680, cost: 5.00, actual: 1.0, status: 'Pending'
    },
    'lentils': {
        id: '', name: 'Lentils', image: '/images/grocery/lentils.jpg', category: 'Protein',
        quantity: 500, unit: 'gr', calories: 1750, cost: 8.00, actual: 1.2, status: 'Pending'
    },
    'chickpeas': {
        id: '', name: 'Chickpeas', image: '/images/grocery/chickpeas.jpg', category: 'Protein',
        quantity: 2, unit: 'cans', calories: 820, cost: 6.00, actual: 1.1, status: 'Pending'
    },
};

/**
 * Extract ingredients from meal names
 */
export const extractIngredientsFromMeals = (mealPlan: DayMeals[]): GroceryItem[] => {
    const ingredientsMap = new Map<string, GroceryItem>();
    let itemCounter = 1;

    // Collect all meals
    const allMeals: Meal[] = [];
    mealPlan.forEach(day => {
        if (day.breakfast) allMeals.push(day.breakfast);
        if (day.lunch) allMeals.push(day.lunch);
        if (day.snack) allMeals.push(day.snack);
        if (day.dinner) allMeals.push(day.dinner);
    });

    // Extract ingredients from each meal name
    allMeals.forEach(meal => {
        const mealNameLower = meal.name.toLowerCase();

        // Track ingredients already matched in THIS meal to prevent duplicates
        const matchedInThisMeal = new Set<string>();

        // Check each ingredient pattern
        Object.entries(INGREDIENT_PATTERNS).forEach(([keyword, template]) => {
            // Only match if keyword found AND not already matched in this meal
            if (mealNameLower.includes(keyword) && !matchedInThisMeal.has(template.name)) {
                matchedInThisMeal.add(template.name);

                const existingItem = ingredientsMap.get(template.name);

                if (existingItem) {
                    // Increase quantity if ingredient already exists across different meals
                    existingItem.quantity += template.quantity;
                } else {
                    // Add new ingredient
                    ingredientsMap.set(template.name, {
                        ...template,
                        id: `gen-${itemCounter++}`
                    });
                }
            }
        });
    });

    return Array.from(ingredientsMap.values());
};

/**
 * Generate grocery list from meal plan
 */
export const generateGroceryListFromMealPlan = (mealPlan: DayMeals[]): GroceryItem[] => {
    const items = extractIngredientsFromMeals(mealPlan);

    // Sort by category
    const categoryOrder = ['Grains', 'Protein', 'Fruits', 'Veggies', 'Dairy', 'Others'];
    items.sort((a, b) => {
        const orderA = categoryOrder.indexOf(a.category);
        const orderB = categoryOrder.indexOf(b.category);
        if (orderA !== orderB) return orderA - orderB;
        return a.name.localeCompare(b.name);
    });

    return items;
};

/**
 * Get grocery list summary
 */
export const getGroceryListSummary = (items: GroceryItem[]) => {
    const totalItems = items.length;
    const totalCost = items.reduce((sum, item) => sum + item.cost, 0);
    const totalCalories = items.reduce((sum, item) => sum + item.calories, 0);

    const byCategory = items.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return {
        totalItems,
        totalCost,
        totalCalories,
        byCategory
    };
};
