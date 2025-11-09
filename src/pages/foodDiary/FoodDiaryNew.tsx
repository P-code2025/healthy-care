import React, { useState, useEffect } from 'react';
import styles from './FoodDiaryNew.module.css';
import { analyzeFood } from '../../services/analyzeFood';
import type { AnalysisResult } from '../../lib/types';
import { toast } from 'react-toastify';
import { compressImage } from '../../utils/imageUtils';
import { detectBarcodeWithQuagga } from '../../utils/barcodeUtils';

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

    return {
      foodName: p.product_name_vi || p.product_name || p.brands || 'Sản phẩm',
      amount: `${servingSize} (${p.quantity || '1 chai'})`,
      calories,
      protein,
      carbs,
      fat,
      sugar,
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

  const filteredEntries = foodEntries.filter(entry =>
    entry.foodName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Food Diary</h1>
      </div>

      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard} style={{ background: 'linear-gradient(135deg, #D4F4DD 0%, #A7E9AF 100%)' }}>
          <div className={styles.kpiIcon}>🔥</div>
          <div className={styles.kpiContent}>
            <div className={styles.kpiValue}>{totalCalories.toLocaleString()}</div>
            <div className={styles.kpiUnit}>kcal</div>
          </div>
          <div className={styles.kpiLabel}>
            <span className={styles.kpiChange}>+1,438% in last week</span>
          </div>
        </div>

        <div className={styles.kpiCard} style={{ background: 'linear-gradient(135deg, #FFE5B4 0%, #FFD89B 100%)' }}>
          <div className={styles.kpiIcon}>🍚</div>
          <div className={styles.kpiContent}>
            <div className={styles.kpiValue}>{totalCarbs}</div>
            <div className={styles.kpiUnit}>gr</div>
          </div>
          <div className={styles.kpiLabel}>
            <span className={styles.kpiChange}>+1,308% in last week</span>
          </div>
        </div>

        <div className={styles.kpiCard} style={{ background: 'linear-gradient(135deg, #FFD4A3 0%, #FFB84D 100%)' }}>
          <div className={styles.kpiIcon}>💪</div>
          <div className={styles.kpiContent}>
            <div className={styles.kpiValue}>{totalProtein}</div>
            <div className={styles.kpiUnit}>gr</div>
          </div>
          <div className={styles.kpiLabel}>
            <span className={styles.kpiChange}>+3,696% in last week</span>
          </div>
        </div>

        <div className={styles.kpiCard} style={{ background: 'linear-gradient(135deg, #FFE5CC 0%, #FFCCA3 100%)' }}>
          <div className={styles.kpiIcon}>🥑</div>
          <div className={styles.kpiContent}>
            <div className={styles.kpiValue}>{totalFat}</div>
            <div className={styles.kpiUnit}>gr</div>
          </div>
          <div className={styles.kpiLabel}>
            <span className={styles.kpiChange}>+4,838% in last week</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM18 18l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Search menu"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <button className={styles.filterBtn}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Filter
        </button>

        <select
          className={styles.customSelect}
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
        >
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
                <input name="amount" type="text" value={analysisResult.amount} onChange={e => setAnalysisResult(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="Ví dụ: 1 chén, 200g" />
              </label>

              <div className={styles.macroGrid}>
                {(['calories', 'protein', 'carbs', 'fat', 'sugar'] as const).map(key => (
                  <label key={key}>
                    {key.charAt(0).toUpperCase() + key.slice(1)} {key === 'calories' ? '(kcal)' : '(g)'}
                    <input name={key} type="number" value={analysisResult[key]} onChange={e => setAnalysisResult(prev => ({ ...prev, [key]: Number(e.target.value) }))} />
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



      {/* Table */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>
                <input type="checkbox" className={styles.checkbox} />
              </th>
              <th>Date & Time <span className={styles.sortIcon}>↕</span></th>
              <th>Category <span className={styles.sortIcon}>↕</span></th>
              <th>Menu <span className={styles.sortIcon}>↕</span></th>
              <th>Amount <span className={styles.sortIcon}>↕</span></th>
              <th>Cals <span className={styles.sortIcon}>↕</span></th>
              <th>Macronutrients (Protein/Carbs/Fat)</th>
              <th>Sugar <span className={styles.sortIcon}>↕</span></th>
              <th>Thoughts</th>
            </tr>
          </thead>
          <tbody>
            {filteredEntries.map((entry) => (
              <tr key={entry.id} className={styles.tableRow}>
                <td>
                  <input type="checkbox" className={styles.checkbox} />
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
                <td className={styles.calories}>{entry.calories} kcal</td>
                <td>
                  <div className={styles.macros}>
                    <span className={styles.macro}>{entry.protein} gr</span>
                    <span className={styles.macro}>{entry.carbs} gr</span>
                    <span className={styles.macro}>{entry.fat} gr</span>
                  </div>
                </td>
                <td className={styles.sugar}>{entry.sugar} gr</td>
                <td>
                  <span
                    className={styles.statusBadge}
                    style={{ backgroundColor: getStatusBadgeColor(entry.status) }}
                  >
                    😊 {entry.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className={styles.pagination}>
        <div className={styles.paginationInfo}>
          Showing <select className={styles.perPageSelect}>
            <option>10</option>
            <option>25</option>
            <option>50</option>
          </select> out of 84
        </div>
        <div className={styles.paginationControls}>
          <button className={styles.pageBtn}>1</button>
          <button className={styles.pageBtn}>2</button>
          <button className={styles.pageBtn}>3</button>
          <button className={styles.pageBtn}>...</button>
          <button className={styles.pageBtn}>7</button>
          <button className={styles.pageBtn}>›</button>
        </div>
      </div>

      {/* Promotional Banner */}
      <div className={styles.promoBanner}>
        <div className={styles.promoContent}>
          <div className={styles.promoVeggies}>🥬</div>
          <div className={styles.promoText}>
            <p className={styles.promoTitle}>Start your health journey</p>
            <p className={styles.promoSubtitle}>with a <strong>FREE 1-month</strong></p>
            <p className={styles.promoSubtitle}>access to Nutrigo</p>
          </div>
        </div>
        <button className={styles.claimBtn}>Claim Now!</button>
      </div>
    </div>
  );
}