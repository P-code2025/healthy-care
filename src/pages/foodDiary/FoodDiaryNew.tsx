import React, { useState, useEffect, useMemo } from 'react';
import styles from './FoodDiaryNew.module.css';
import { analyzeFood } from '../../services/analyzeFood';
import type { AnalysisResult } from '../../lib/types';
import { toast } from 'react-toastify';
import { compressImage } from '../../utils/imageUtils';
import { detectBarcodeWithQuagga } from '../../utils/barcodeUtils';
import { FaWalking, FaRunning, FaDumbbell, FaSwimmer, FaBicycle } from 'react-icons/fa';

interface FoodEntry {
  id: string;
  date: string;
  time: string;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  foodName: string;
  amount: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sugar: number;
  status: 'Energized' | 'Quite Satisfied' | 'Satisfied' | 'Guilty' | 'Uncomfortable';
  thoughts?: string;
}

const getDateRange = (period: string): { start: string; end: string } => {
  const now = new Date();
  const end = now.toISOString().split('T')[0];
  let start = end;

  if (period === 'Today') {
    start = end;
  } else if (period === 'This Week') {
    const day = now.getDay();
    const diff = day === 0 ? 6 : day - 1;
    const monday = new Date(now);
    monday.setDate(now.getDate() - diff);
    start = monday.toISOString().split('T')[0];
  } else if (period === 'Last Week') {
    const day = now.getDay();
    const diff = day === 0 ? 13 : day + 6;
    const lastMonday = new Date(now);
    lastMonday.setDate(now.getDate() - diff);
    const lastSunday = new Date(lastMonday);
    lastSunday.setDate(lastMonday.getDate() + 6);
    start = lastMonday.toISOString().split('T')[0];
  } else if (period === 'This Month') {
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    start = firstDay.toISOString().split('T')[0];
  }

  return { start, end };
};

const FOOD_ENTRIES: FoodEntry[] = [
  {
    id: '1',
    date: '2028-08-01',
    time: '7:00 AM',
    mealType: 'Breakfast',
    foodName: 'Scrambled Eggs with Spinach & Whole Grain Toast',
    amount: '2 Slices',
    calories: 300,
    protein: 25,
    carbs: 20,
    fat: 12,
    sugar: 3,
    status: 'Energized',
    thoughts: ''
  },
  // {
  //   id: '2',
  //   date: '2028-08-01',
  //   time: '12:00 PM',
  //   mealType: 'Lunch',
  //   foodName: 'Grilled Chicken Wrap with Quinoa Salad',
  //   amount: '1 Wrap',
  //   calories: 450,
  //   protein: 40,
  //   carbs: 30,
  //   fat: 18,
  //   sugar: 4,
  //   status: 'Quite Satisfied',
  //   thoughts: ''
  // },
  // {
  //   id: '3',
  //   date: '2028-08-01',
  //   time: '3:00 PM',
  //   mealType: 'Snack',
  //   foodName: 'Greek Yogurt with Mixed Berries',
  //   amount: '1 Cup',
  //   calories: 200,
  //   protein: 18,
  //   carbs: 12,
  //   fat: 10,
  //   sugar: 14,
  //   status: 'Quite Satisfied',
  //   thoughts: ''
  // },
  // {
  //   id: '4',
  //   date: '2028-08-01',
  //   time: '7:00 PM',
  //   mealType: 'Dinner',
  //   foodName: 'Cheeseburger and Fries',
  //   amount: '1 Serving',
  //   calories: 700,
  //   protein: 30,
  //   carbs: 35,
  //   fat: 35,
  //   sugar: 5,
  //   status: 'Guilty',
  //   thoughts: ''
  // },
  // {
  //   id: '5',
  //   date: '2028-08-02',
  //   time: '8:02 AM',
  //   mealType: 'Breakfast',
  //   foodName: 'Avocado Toast with Poached Egg',
  //   amount: '2 Slices',
  //   calories: 350,
  //   protein: 30,
  //   carbs: 14,
  //   fat: 18,
  //   sugar: 5,
  //   status: 'Satisfied',
  //   thoughts: ''
  // },
  // {
  //   id: '6',
  //   date: '2028-08-02',
  //   time: '1:15 PM',
  //   mealType: 'Lunch',
  //   foodName: 'Quinoa Salad with Roasted Veggies & Feta',
  //   amount: '1 Bowl',
  //   calories: 450,
  //   protein: 50,
  //   carbs: 15,
  //   fat: 12,
  //   sugar: 6,
  //   status: 'Quite Satisfied',
  //   thoughts: ''
  // },
  // {
  //   id: '7',
  //   date: '2028-08-02',
  //   time: '7:12 PM',
  //   mealType: 'Snack',
  //   foodName: 'Apple Slices with Peanut Butter',
  //   amount: '1 Apple',
  //   calories: 200,
  //   protein: 30,
  //   carbs: 6,
  //   fat: 10,
  //   sugar: 18,
  //   status: 'Energized',
  //   thoughts: ''
  // },
  // {
  //   id: '8',
  //   date: '2028-08-03',
  //   time: '7:00 PM',
  //   mealType: 'Dinner',
  //   foodName: 'Pasta Alfredo with Garlic Bread',
  //   amount: '1 Plate',
  //   calories: 650,
  //   protein: 80,
  //   carbs: 20,
  //   fat: 30,
  //   sugar: 4,
  //   status: 'Uncomfortable',
  //   thoughts: ''
  // },
  // {
  //   id: '9',
  //   date: '2028-08-03',
  //   time: '8:00 AM',
  //   mealType: 'Breakfast',
  //   foodName: 'Blueberry Protein Smoothie',
  //   amount: '1 Glass',
  //   calories: 300,
  //   protein: 50,
  //   carbs: 20,
  //   fat: 10,
  //   sugar: 24,
  //   status: 'Energized',
  //   thoughts: ''
  // },
  // {
  //   id: '10',
  //   date: '2028-08-03',
  //   time: '1:00 PM',
  //   mealType: 'Lunch',
  //   foodName: 'Greek Salad with Feta and Olives',
  //   amount: '1 Bowl',
  //   calories: 400,
  //   protein: 40,
  //   carbs: 12,
  //   fat: 20,
  //   sugar: 4,
  //   status: 'Satisfied',
  //   thoughts: ''
  // },
  // {
  //   id: '11',
  //   date: '2028-08-03',
  //   time: '6:00 PM',
  //   mealType: 'Snack',
  //   foodName: 'Hummus with Carrot Sticks',
  //   amount: '1 Serving',
  //   calories: 180,
  //   protein: 20,
  //   carbs: 8,
  //   fat: 7,
  //   sugar: 2,
  //   status: 'Quite Satisfied',
  //   thoughts: ''
  // },
  // {
  //   id: '12',
  //   date: '2028-08-03',
  //   time: '7:02 PM',
  //   mealType: 'Dinner',
  //   foodName: 'Chocolate Cake and Ice Cream',
  //   amount: '1 Slice/scoop',
  //   calories: 600,
  //   protein: 70,
  //   carbs: 8,
  //   fat: 20,
  //   sugar: 50,
  //   status: 'Guilty',
  //   thoughts: ''
  // },
];

const getMealTypeFromTime = (hour: number): FoodEntry['mealType'] => {
  if (hour >= 5 && hour < 11) return 'Breakfast';
  if (hour >= 11 && hour < 14) return 'Lunch';
  if (hour >= 18 && hour < 22) return 'Dinner';
  return 'Snack';
};

const getMealTypeBadgeColor = (mealType: string) => {
  const colors: Record<string, string> = {
    'Breakfast': '#D4F4DD',
    'Lunch': '#FFE066',
    'Dinner': '#FFB84D',
    'Snack': '#FCD34D'
  };
  return colors[mealType] || '#E5E7EB';
};

const getStatusBadgeColor = (status: string) => {
  const colors: Record<string, string> = {
    'Energized': '#D4F4DD',
    'Quite Satisfied': '#E0F2FE',
    'Satisfied': '#FEF3C7',
    'Guilty': '#FEE2E2',
    'Uncomfortable': '#F3E8FF'
  };
  return colors[status] || '#E5E7EB';
};

const getMealPrompt = (mealType: string, date: string) => {
  const today = new Date().toISOString().split('T')[0];
  const isToday = date === today;
  const day = isToday ? 'hôm nay' : 'hôm qua';
  return `Bạn muốn thêm món ăn vào buổi ${mealType.toLowerCase()} ${day}?`;
};

export default function FoodDiaryNew() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('This Week');
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult>({
    foodName: '',
    amount: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    sugar: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>(FOOD_ENTRIES);
  const [isDirty, setIsDirty] = useState(false); // Có thay đổi foodName/amount không?
  const [lastAnalyzedImage, setLastAnalyzedImage] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMealType, setSelectedMealType] = useState<FoodEntry['mealType']>('Breakfast');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterMealType, setFilterMealType] = useState<string>('');
  const [filterCalorieRange, setFilterCalorieRange] = useState<[number, number]>([0, 5000]);
  const [filterCarbsRange, setFilterCarbsRange] = useState<[number, number]>([0, 1000]);
  const [filterProteinRange, setFilterProteinRange] = useState<[number, number]>([0, 500]);
  const [filterFatRange, setFilterFatRange] = useState<[number, number]>([0, 300]);
  const [filterSugarRange, setFilterSugarRange] = useState<[number, number]>([0, 200]);
  const [filterThoughts, setFilterThoughts] = useState('');
  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(new Set());
  const { start: periodStart, end: periodEnd } = useMemo(() => {
    return getDateRange(selectedPeriod);
  }, [selectedPeriod]);

  const filteredEntries = useMemo(() => {
    return foodEntries
      .filter(entry => {
        // 1. Period filter
        const inPeriod = entry.date >= periodStart && entry.date <= periodEnd;

        // 2. Search
        const matchesSearch = entry.foodName.toLowerCase().includes(searchQuery.toLowerCase());

        // 3. Advanced filters
        const matchesMeal = !filterMealType || entry.mealType === filterMealType;
        const matchesCal = entry.calories >= filterCalorieRange[0] && entry.calories <= filterCalorieRange[1];
        const matchesCarbs = entry.carbs >= filterCarbsRange[0] && entry.carbs <= filterCarbsRange[1];
        const matchesProtein = entry.protein >= filterProteinRange[0] && entry.protein <= filterProteinRange[1];
        const matchesFat = entry.fat >= filterFatRange[0] && entry.fat <= filterFatRange[1];
        const matchesSugar = entry.sugar >= filterSugarRange[0] && entry.sugar <= filterSugarRange[1];
        const matchesThoughts = !filterThoughts ||
          (entry.thoughts?.toLowerCase().includes(filterThoughts.toLowerCase()));

        return inPeriod && matchesSearch && matchesMeal && matchesCal &&
          matchesCarbs && matchesProtein && matchesFat && matchesSugar && matchesThoughts;
      })
      .sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`));
  }, [
    foodEntries, periodStart, periodEnd, searchQuery,
    filterMealType, filterCalorieRange, filterCarbsRange, filterProteinRange,
    filterFatRange, filterSugarRange, filterThoughts
  ]);

  const paginatedEntries = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredEntries.slice(start, start + itemsPerPage);
  }, [filteredEntries, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);

  // Tính tổng theo khoảng thời gian
  const totals = useMemo(() => {
    return filteredEntries.reduce(
      (acc, entry) => ({
        calories: acc.calories + entry.calories,
        protein: acc.protein + entry.protein,
        carbs: acc.carbs + entry.carbs,
        fat: acc.fat + entry.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [filteredEntries]);

  const recalculateFromAmount = (
    amountStr: string,
    base100g: NonNullable<AnalysisResult['base100g']>
  ) => {
    const match = amountStr.match(/(\d+(\.\d+)?)/);
    if (!match) return null;
    const amount = parseFloat(match[0]);
    const factor = amount / 100;

    return {
      calories: Math.round(base100g.calories * factor),
      protein: Math.round(base100g.protein * factor),
      carbs: Math.round(base100g.carbs * factor),
      fat: Math.round(base100g.fat * factor),
      sugar: Math.round(base100g.sugar * factor),
    };
  };

  useEffect(() => {
  // LƯU TỔNG CALO CỦA NGÀY HIỆN TẠI
  const today = new Date().toISOString().split('T')[0];
  const todayEntries = foodEntries.filter(e => e.date === today);
  const todayCalories = todayEntries.reduce((sum, e) => sum + e.calories, 0);

  localStorage.setItem('dailyCalories', todayCalories.toString());
  localStorage.setItem('dailyCalorieDate', today); // để kiểm tra ngày
}, [foodEntries]);

  useEffect(() => {
    if (!isDirty || !selectedImage || selectedImage === lastAnalyzedImage) return;

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        const result = await analyzeFood(
          selectedImage,
          analysisResult.foodName,
          analysisResult.amount
        );
        if (result.error) {
          setError(result.error);
        } else {
          setAnalysisResult(prev => ({
            ...prev,
            ...result.analysis,
            foodName: prev.foodName || result.analysis.foodName,
            amount: prev.amount || result.analysis.amount,
          }));
          setLastAnalyzedImage(selectedImage);
        }
      } catch (err) {
        setError('Lỗi khi phân tích lại');
      } finally {
        setLoading(false);
        setIsDirty(false); // Reset
      }
    }, 800); // debounce 800ms

    return () => clearTimeout(timeoutId);
    if (showModal) {
      const hour = new Date().getHours();
      setSelectedMealType(getMealTypeFromTime(hour));
    }
  }, [analysisResult, selectedImage, isDirty, lastAnalyzedImage, showModal]);

  // Lấy thông tin từ OpenFoodFacts
  const fetchBarcodeInfo = async (barcode: string) => {
    try {
      const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const data = await res.json();
      if (data.status !== 1) return null;

      const p = data.product;
      const n = p.nutriments || {};

      // LẤY DỮ LIỆU THEO THỨ TỰ ƯU TIÊN: serving → 100g → fallback
      const getNutrient = (keys: string[], defaultVal = 0) => {
        for (const key of keys) {
          if (n[key] !== undefined && n[key] !== null) return Number(n[key]);
        }
        return defaultVal;
      };

      const servingSize = p.serving_size || '100g';
      const sizeMatch = servingSize.match(/(\d+(\.\d+)?)/);
      const size = sizeMatch ? parseFloat(sizeMatch[0]) : 100;
      const factor = size / 100;


      // Ưu tiên: serving → 100g → base
      const calories = Math.round(
        getNutrient(['energy-kcal_serving']) ||
        getNutrient(['energy-kcal_100g']) * factor ||
        getNutrient(['energy-kcal']) * factor ||
        0
      );

      const protein = Math.round(
        getNutrient(['proteins_serving']) ||
        getNutrient(['proteins_100g']) * factor ||
        getNutrient(['proteins']) * factor ||
        0
      );

      const carbs = Math.round(
        getNutrient(['carbohydrates_serving']) ||
        getNutrient(['carbohydrates_100g']) * factor ||
        getNutrient(['carbohydrates']) * factor ||
        0
      );

      const fat = Math.round(
        getNutrient(['fat_serving']) ||
        getNutrient(['fat_100g']) * factor ||
        getNutrient(['fat']) * factor ||
        0
      );

      const sugar = Math.round(
        getNutrient(['sugars_serving']) ||
        getNutrient(['sugars_100g']) * factor ||
        getNutrient(['sugars']) * factor ||
        0
      );

      const base100g = {
        calories: Math.round(calories * 100 / size),
        protein: Math.round(protein * 100 / size),
        carbs: Math.round(carbs * 100 / size),
        fat: Math.round(fat * 100 / size),
        sugar: Math.round(sugar * 100 / size),
      };

      return {
        foodName: p.product_name_vi || p.product_name || p.brands || 'Sản phẩm không xác định',
        amount: `${servingSize} (${p.quantity || '100g'})`,
        calories,
        protein,
        carbs,
        fat,
        sugar,
        base100g,
        baseAmount: size,
      };
    } catch (err) {
      console.error('Lỗi fetch OpenFoodFacts:', err);
      return null;
    }
  };

  // Xử lý ảnh
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const originalBase64 = reader.result as string;
      setSelectedImage(originalBase64);
      setLoading(true);
      setError(null);

      const toastId = toast.info('Đang quét mã vạch...', { autoClose: false });

      try {
        // BƯỚC 1: QUÉT MÃ VẠCH (dùng base64 trực tiếp)
        const barcode = await detectBarcodeWithQuagga(originalBase64);

        if (barcode) {
          toast.update(toastId, { render: `Mã: ${barcode}`, type: 'info' });

          const info = await fetchBarcodeInfo(barcode);
          if (info) {
            setAnalysisResult(info);
            toast.update(toastId, {
              render: 'Nhận diện từ mã vạch!',
              type: 'success',
              autoClose: 3000,
            });
            setLoading(false);
            return;
          } else {
            toast.update(toastId, {
              render: 'Mã vạch không có trong Open Food Facts',
              type: 'warning',
              autoClose: 3000,
            });
          }
        } else {
          toast.update(toastId, { render: 'AI phân tích...', type: 'info' });
        }

        // BƯỚC 2: DÙNG AI
        const compressed = await compressImage(originalBase64, 900, 0.8);
        const result = await analyzeFood(compressed);

        if (result.error) {
          setError(result.error);
          toast.update(toastId, { render: 'Lỗi AI', type: 'error', autoClose: 3000 });
        } else {
          setAnalysisResult(result.analysis);
          toast.update(toastId, { render: 'AI phân tích xong!', type: 'success', autoClose: 3000 });
        }
      } catch (err) {
        console.error('Upload error:', err);
        toast.update(toastId, { render: 'Lỗi xử lý', type: 'error', autoClose: 3000 });
      } finally {
        setLoading(false);
      }
    };

    reader.readAsDataURL(file);
  };
  // Submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;

    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newEntry: FoodEntry = {
      id: Date.now().toString(),
      date: selectedDate,
      time,
      mealType: selectedMealType,
      foodName: analysisResult.foodName || (form.elements.namedItem('foodName') as HTMLInputElement)?.value || 'Không tên',
      amount: analysisResult.amount || (form.elements.namedItem('amount') as HTMLInputElement)?.value || '',
      calories: analysisResult.calories || Number((form.elements.namedItem('calories') as HTMLInputElement)?.value) || 0,
      protein: analysisResult.protein || Number((form.elements.namedItem('protein') as HTMLInputElement)?.value) || 0,
      carbs: analysisResult.carbs || Number((form.elements.namedItem('carbs') as HTMLInputElement)?.value) || 0,
      fat: analysisResult.fat || Number((form.elements.namedItem('fat') as HTMLInputElement)?.value) || 0,
      sugar: analysisResult.sugar || Number((form.elements.namedItem('sugar') as HTMLInputElement)?.value) || 0,
      status: (form.elements.namedItem('status') as HTMLSelectElement)?.value as FoodEntry['status'],
      thoughts: (form.elements.namedItem('thoughts') as HTMLTextAreaElement)?.value || '',
    };

    setFoodEntries(prev => [...prev, newEntry]);
    toast.success('Đã thêm món ăn!');

    // ĐÓNG MODAL + RESET FORM
    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setAnalysisResult({ foodName: '', amount: '', calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0 });
    setSelectedImage(null);
    setError(null);
  };


  // Calculate totals
  const totalCalories = foodEntries.reduce((sum, entry) => sum + entry.calories, 0);
  const totalProtein = foodEntries.reduce((sum, entry) => sum + entry.protein, 0);
  const totalCarbs = foodEntries.reduce((sum, entry) => sum + entry.carbs, 0);
  const totalFat = foodEntries.reduce((sum, entry) => sum + entry.fat, 0);


  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Food Diary</h1>
      </div>

      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        {[
          { label: 'Calories', value: totals.calories.toLocaleString(), unit: 'kcal', icon: '🔥', color: 'linear-gradient(135deg, #FFEDD5 0%, #F59E0B 100%)' },
          { label: 'Carbs', value: totals.carbs, unit: 'g', icon: '🍚', color: 'linear-gradient(135deg, #DBEAFE 0%, #3B82F6 100%)' },
          { label: 'Protein', value: totals.protein, unit: 'g', icon: '💪', color: 'linear-gradient(135deg, #DCFCE7 0%, #22C55E 100%)' },
          { label: 'Fat', value: totals.fat, unit: 'g', icon: '🥑', color: 'linear-gradient(135deg, #FDE2E2 0%, #F87171 100%)' }
        ].map((item, i) => (
          <div key={i} className={styles.kpiCard} style={{ background: item.color }}>
            <div className={styles.kpiTop}>
              <span className={styles.kpiIcon}>{item.icon}</span>
              <span className={styles.kpiLabel}>{item.label}</span>
            </div>
            <div className={styles.kpiBottom}>
              <span className={styles.kpiValue}>{item.value}</span>
              <span className={styles.kpiUnit}>{item.unit}</span>
            </div>
          </div>
        ))}
      </div>


      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM18 18l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Tìm món ăn..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <button className={styles.filterBtn} onClick={() => setShowFilterModal(true)}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Filter
        </button>
        <select
          className={styles.customSelect}
          value={selectedPeriod}
          onChange={(e) => {
            setSelectedPeriod(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option>Today</option>
          <option>This Week</option>
          <option>Last Week</option>
          <option>This Month</option>
        </select>

        <button className={styles.addButton} onClick={() => setShowModal(true)}>
          <span>+</span> Add
        </button>
      </div>

      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modalContainer} onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className={styles.modalHeader}>
              <h2>Thêm bữa ăn mới</h2>
              <button className={styles.closeBtn} onClick={() => { setShowModal(false); resetForm(); }}>
                ×
              </button>
            </div>

            {/* Meal prompt */}
            <p className={styles.mealPrompt}>{getMealPrompt(selectedMealType, selectedDate)}</p>

            {/* Image Upload */}
            <div className={styles.imageUploadWrapper}>
              <label className={styles.imageUploadLabel}>
                📷 Chọn/Chụp món ăn
                <input type="file" accept="image/*" onChange={handleImageUpload} />
              </label>

              {selectedImage && (
                <div className={styles.imagePreviewWrapper}>
                  <img src={selectedImage} alt="Preview" className={styles.imagePreview} />
                </div>
              )}
            </div>

            {/* Form */}
            <form className={styles.modalForm} onSubmit={handleSubmit}>
              <div className={styles.row}>
                <label>
                  Ngày
                  <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]} />
                </label>

                <label>
                  Buổi ăn
                  <select value={selectedMealType} className={styles.customSelect} onChange={e => setSelectedMealType(e.target.value as FoodEntry['mealType'])}>
                    <option>Breakfast</option>
                    <option>Lunch</option>
                    <option>Dinner</option>
                    <option>Snack</option>
                  </select>
                </label>
              </div>

              <label>
                Tên món ăn
                <input name="foodName" type="text" value={analysisResult.foodName} onChange={e => setAnalysisResult(prev => ({ ...prev, foodName: e.target.value }))}
                  placeholder="Tên món ăn" required />
              </label>

              <label>
                Khối lượng
                <input
                  name="amount"
                  type="text"
                  value={analysisResult.amount}
                  onChange={e => {
                    const val = e.target.value;
                    setAnalysisResult(prev => {
                      if (!prev.base100g) return { ...prev, amount: val };

                      const recalculated = recalculateFromAmount(val, prev.base100g);
                      if (!recalculated) return { ...prev, amount: val };

                      return {
                        ...prev,
                        amount: val,
                        ...recalculated,
                      };
                    });
                  }}
                  placeholder="Ví dụ: 200g, 1 bát..."
                />
              </label>

              <div className={styles.macroGrid}>
                {(['calories', 'protein', 'carbs', 'fat', 'sugar'] as const).map(key => (
                  <label key={key}>
                    {key.charAt(0).toUpperCase() + key.slice(1)} {key === 'calories' ? '(kcal)' : '(g)'}
                    <input
                      name={key}
                      type="number"
                      value={analysisResult[key]}
                      onChange={e => {
                        const value = Number(e.target.value);
                        if (isNaN(value)) return;

                        setAnalysisResult(prev => {
                          // Nếu chưa có base100g → chỉ cập nhật giá trị
                          if (!prev.base100g) {
                            return { ...prev, [key]: value };
                          }

                          // CÁC TRƯỜNG HỢP ĐẶC BIỆT
                          if (key === 'calories') {
                            const ratio = prev.calories === 0 ? 1 : value / prev.calories;
                            return {
                              ...prev,
                              calories: value,
                              protein: Math.round(prev.protein * ratio),
                              carbs: Math.round(prev.carbs * ratio),
                              fat: Math.round(prev.fat * ratio),
                              sugar: Math.round(prev.sugar * ratio),
                            };
                          }

                          if (key === 'carbs') {
                            const ratio = prev.carbs === 0 ? 1 : value / prev.carbs;
                            return {
                              ...prev,
                              carbs: value,
                              calories: Math.round(prev.calories * ratio),
                              protein: Math.round(prev.protein * ratio),
                              fat: Math.round(prev.fat * ratio),
                              sugar: Math.round(prev.sugar * ratio),
                            };
                          }

                          // Các macro còn lại (protein, fat, sugar) → chỉ cập nhật
                          return { ...prev, [key]: value };
                        });
                      }}
                    />
                  </label>
                ))}
              </div>

              <label>
                Cảm xúc
                <select name="status" defaultValue="Satisfied">
                  <option>Energized</option>
                  <option>Quite Satisfied</option>
                  <option>Satisfied</option>
                  <option>Guilty</option>
                  <option>Uncomfortable</option>
                </select>
              </label>

              <label>
                Ghi chú
                <textarea name="thoughts" placeholder="Ví dụ: Ăn ngon, hơi no..." />
              </label>

              <button type="submit" className={styles.addMealBtn}>+ Thêm bữa ăn</button>
            </form>
          </div>
        </div>
      )}

      {showFilterModal && (
        <div className={styles.modalOverlay} onClick={() => setShowFilterModal(false)}>
          <div
            className={styles.filterModalContainer}
            onClick={e => e.stopPropagation()}
          >
            <div className={styles.filterModalHeader}>
              <h2>Lọc món ăn</h2>
              <button
                className={styles.closeBtn}
                onClick={() => setShowFilterModal(false)}
              >
                ×
              </button>
            </div>

            <div className={styles.filterForm}>
              {/* Buổi ăn */}
              <label>
                Buổi ăn
                <select
                  value={filterMealType}
                  onChange={e => setFilterMealType(e.target.value)}
                  className={styles.customSelect}
                >
                  <option value="">Tất cả</option>
                  <option>Breakfast</option>
                  <option>Lunch</option>
                  <option>Dinner</option>
                  <option>Snack</option>
                </select>
              </label>

              {/* Calo */}
              <div className={styles.rangeGroup}>
                <label>Calo (kcal)</label>
                <div className={styles.rangeInputs}>
                  <input
                    type="number"
                    value={filterCalorieRange[0]}
                    onChange={e => setFilterCalorieRange([Number(e.target.value), filterCalorieRange[1]])}
                  />
                  <span>→</span>
                  <input
                    type="number"
                    value={filterCalorieRange[1]}
                    onChange={e => setFilterCalorieRange([filterCalorieRange[0], Number(e.target.value)])}
                  />
                </div>
              </div>

              {/* Carbs */}
              <div className={styles.rangeGroup}>
                <label>Carbs (g)</label>
                <div className={styles.rangeInputs}>
                  <input type="number" value={filterCarbsRange[0]} onChange={e => setFilterCarbsRange([Number(e.target.value), filterCarbsRange[1]])} />
                  <span>→</span>
                  <input type="number" value={filterCarbsRange[1]} onChange={e => setFilterCarbsRange([filterCarbsRange[0], Number(e.target.value)])} />
                </div>
              </div>

              {/* Protein */}
              <div className={styles.rangeGroup}>
                <label>Protein (g)</label>
                <div className={styles.rangeInputs}>
                  <input type="number" value={filterProteinRange[0]} onChange={e => setFilterProteinRange([Number(e.target.value), filterProteinRange[1]])} />
                  <span>→</span>
                  <input type="number" value={filterProteinRange[1]} onChange={e => setFilterProteinRange([filterProteinRange[0], Number(e.target.value)])} />
                </div>
              </div>

              {/* Fat */}
              <div className={styles.rangeGroup}>
                <label>Fat (g)</label>
                <div className={styles.rangeInputs}>
                  <input type="number" value={filterFatRange[0]} onChange={e => setFilterFatRange([Number(e.target.value), filterFatRange[1]])} />
                  <span>→</span>
                  <input type="number" value={filterFatRange[1]} onChange={e => setFilterFatRange([filterFatRange[0], Number(e.target.value)])} />
                </div>
              </div>

              {/* Sugar */}
              <div className={styles.rangeGroup}>
                <label>Sugar (g)</label>
                <div className={styles.rangeInputs}>
                  <input type="number" value={filterSugarRange[0]} onChange={e => setFilterSugarRange([Number(e.target.value), filterSugarRange[1]])} />
                  <span>→</span>
                  <input type="number" value={filterSugarRange[1]} onChange={e => setFilterSugarRange([filterSugarRange[0], Number(e.target.value)])} />
                </div>
              </div>

              {/* Ghi chú */}
              <label>
                Ghi chú (tìm từ)
                <input
                  type="text"
                  value={filterThoughts}
                  onChange={e => setFilterThoughts(e.target.value)}
                  placeholder="VD: ngon, no, mặn..."
                />
              </label>

              {/* Nút hành động */}
              <div className={styles.filterActions}>
                <button
                  type="button"
                  className={styles.clearBtn}
                  onClick={() => {
                    setFilterMealType('');
                    setFilterCalorieRange([0, 5000]);
                    setFilterCarbsRange([0, 1000]);
                    setFilterProteinRange([0, 500]);
                    setFilterFatRange([0, 300]);
                    setFilterSugarRange([0, 200]);
                    setFilterThoughts('');
                    setCurrentPage(1);
                  }}
                >
                  Xóa bộ lọc
                </button>
                <button
                  type="button"
                  className={styles.applyBtn}
                  onClick={() => {
                    setCurrentPage(1);
                    setShowFilterModal(false);
                  }}
                >
                  Áp dụng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* Table */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={selectedEntries.size === paginatedEntries.length && paginatedEntries.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedEntries(new Set(paginatedEntries.map(e => e.id)));
                    } else {
                      setSelectedEntries(new Set());
                    }
                  }}
                />
              </th>
              <th>Date & Time</th>
              <th>Meal</th>
              <th>Food</th>
              <th>Amount</th>
              <th>Calories (kcal)</th>
              <th>Protein (g)</th>
              <th>Carbs (g)</th>
              <th>Fat (g)</th>
              <th>Sugar (g)</th>
              <th>Thoughts</th>
            </tr>
          </thead>
          <tbody className={styles.tableBody}>
            {paginatedEntries.map((entry) => (
              <tr key={entry.id} className={styles.tableRow}>
                <td>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={selectedEntries.has(entry.id)}
                    onChange={(e) => {
                      const newSet = new Set(selectedEntries);
                      if (e.target.checked) {
                        newSet.add(entry.id);
                      } else {
                        newSet.delete(entry.id);
                      }
                      setSelectedEntries(newSet);
                    }}
                  />
                </td>
                <td>
                  <div className={styles.dateTime}>
                    <div className={styles.date}>{entry.date}</div>
                    <div className={styles.time}>{entry.time}</div>
                  </div>
                </td>
                <td>
                  <span
                    className={styles.mealBadge}
                    style={{ backgroundColor: getMealTypeBadgeColor(entry.mealType) }}
                  >
                    {entry.mealType}
                  </span>
                </td>
                <td>
                  <div className={styles.foodName}>{entry.foodName}</div>
                </td>
                <td className={styles.amount}>{entry.amount}</td>
                <td className={styles.calories}>{entry.calories}</td>
                <td className={styles.nutrient}>{entry.protein}</td>
                <td className={styles.nutrient}>{entry.carbs}</td>
                <td className={styles.nutrient}>{entry.fat}</td>
                <td className={styles.nutrient}>{entry.sugar}</td>
                <td>
                  <span
                    className={styles.statusBadge}
                    style={{ backgroundColor: getStatusBadgeColor(entry.status) }}
                  >
                    {entry.status}
                  </span>
                </td>
              </tr>
            ))}
            {Array.from(
    { length: itemsPerPage - paginatedEntries.length },
    (_, i) => (
      <tr key={`ghost-${i}`} className={styles.tableRow}>
        <td colSpan={11} className={styles.ghostRow}>
          &nbsp;
        </td>
      </tr>
    )
  )}
          </tbody>
        </table>
        {selectedEntries.size > 0 && (
          <div className={styles.deleteBar}>
            <span>{selectedEntries.size} món được chọn</span>
            <button
              className={styles.deleteBtn}
              onClick={() => {
                setFoodEntries(prev => prev.filter(e => !selectedEntries.has(e.id)));
                setSelectedEntries(new Set());
                toast.success(`Đã xóa ${selectedEntries.size} món ăn!`);
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m-8 0h10l-1 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L6 6Z" />
              </svg>
              Xóa
            </button>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className={styles.pagination}>
        <div className={styles.paginationInfo}>
          Hiển thị{' '}
          <select
            className={styles.perPageSelect}
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option>10</option>
            <option>25</option>
            <option>50</option>
          </select>{' '}
          trong {filteredEntries.length} mục
        </div>
        <div className={styles.paginationControls}>
          <button
            className={styles.pageBtn}
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(1)}
          >
            First
          </button>
          <button
            className={styles.pageBtn}
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
          >
            Previous
          </button>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const page = i + Math.max(1, currentPage - 2);
            if (page > totalPages) return null;
            return (
              <button
                key={page}
                className={`${styles.pageBtn} ${currentPage === page ? styles.active : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            );
          }).filter(Boolean)}

          {totalPages > 5 && currentPage < totalPages - 2 && (
            <>
              <button className={styles.pageBtn}>...</button>
              <button className={styles.pageBtn} onClick={() => setCurrentPage(totalPages)}>
                {totalPages}
              </button>
            </>
          )}

          <button
            className={styles.pageBtn}
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            Next
          </button>
          <button
            className={styles.pageBtn}
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(totalPages)}
          >
            Last
          </button>
        </div>
      </div>
      {/* Exercise Burn Banner */}
      <div className={styles.exerciseBanner}>
        <div className={styles.exerciseHeader}>
          <h3>Làm thế nào để tiêu hao {totals.calories.toLocaleString()} Kcal?</h3>
        </div>

        <div className={styles.exerciseGrid}>
          {[
            { Icon: FaWalking, label: 'Đi bộ', minutes: Math.round(totals.calories / 4.3), color: '#10B981' },
            { Icon: FaRunning, label: 'Chạy bộ', minutes: Math.round(totals.calories / 10), color: '#F59E0B' },
            { Icon: FaDumbbell, label: 'Nhảy dây', minutes: Math.round(totals.calories / 11.8), color: '#8B5CF6' },
            { Icon: FaSwimmer, label: 'Bơi lội', minutes: Math.round(totals.calories / 7.0), color: '#3B82F6' },
            { Icon: FaBicycle, label: 'Đạp xe', minutes: Math.round(totals.calories / 8.0), color: '#EF4444' },
          ].map(({ Icon, label, minutes, color }, i) => (
            <div key={i} className={styles.exerciseItem}>
              <div className={styles.exerciseIcon} style={{ color }}>
                <Icon size={28} />
              </div>
              <div className={styles.exerciseLabel}>{label}</div>
              <div className={styles.exerciseTime}>
                {minutes > 60
                  ? `${Math.floor(minutes / 60)} giờ ${minutes % 60} phút`
                  : `${minutes} phút`
                }
              </div>
            </div>
          ))}
        </div>

        <div className={styles.exerciseAction}>
          <button
            className={styles.buildWorkoutBtn}
            onClick={() => window.location.href = '/exercises'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 12l2 2 4-4" />
              <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
            </svg>
            Xây dựng bài tập
          </button>
        </div>
      </div>
    </div>
  );
}