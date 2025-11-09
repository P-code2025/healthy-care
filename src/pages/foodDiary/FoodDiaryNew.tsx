import React, { useState, useEffect } from 'react';
import styles from './FoodDiaryNew.module.css';
import { analyzeFood } from '../../services/analyzeFood';
import type { AnalysisResult } from '../../lib/types';

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
  }, [analysisResult, selectedImage, isDirty, lastAnalyzedImage]);

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
          className={styles.periodSelect}
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
        <div className={styles.modalOverlay}>
          <div className={styles.modalContainer}>
            <h2 className={styles.modalTitle}>🍽️ Thêm bữa ăn mới</h2>

            <form
              className={styles.modalForm}
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;

                const newEntry: FoodEntry = {
                  id: (foodEntries.length + 1).toString(),
                  date: new Date().toISOString().split('T')[0],
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  mealType: form.mealType.value as FoodEntry['mealType'],
                  foodName: analysisResult.foodName || form.foodName.value,
                  amount: analysisResult.amount || form.amount.value,
                  calories: analysisResult.calories || Number(form.calories.value),
                  protein: analysisResult.protein || Number(form.protein.value),
                  carbs: analysisResult.carbs || Number(form.carbs.value),
                  fat: analysisResult.fat || Number(form.fat.value),
                  sugar: analysisResult.sugar || Number(form.sugar.value),
                  status: form.status.value as FoodEntry['status'],
                  thoughts: form.thoughts.value || '',
                };

                setFoodEntries(prev => [...prev, newEntry]);
                setShowModal(false);
                setAnalysisResult({
                  foodName: '',
                  amount: '',
                  calories: 0,
                  protein: 0,
                  carbs: 0,
                  fat: 0,
                  sugar: 0,
                });
              }}
            >
              <label>
                Loại bữa ăn
                <select name="mealType" required>
                  <option>Breakfast</option>
                  <option>Lunch</option>
                  <option>Dinner</option>
                  <option>Snack</option>
                </select>
              </label>

              <label>
                Tên món ăn
                <input
                  type="text"
                  name="foodName"
                  placeholder="Tên món ăn"
                  value={analysisResult.foodName}
                  onChange={(e) => {
                    setAnalysisResult(prev => ({ ...prev, foodName: e.target.value }));
                    setIsDirty(true); // Đánh dấu đã sửa
                  }}
                  required
                />
              </label>

              <label>
                Khối lượng
                <input
                  type="text"
                  name="amount"
                  placeholder="Ví dụ: 1 chén, 200g"
                  value={analysisResult.amount}
                  onChange={(e) => {
                    setAnalysisResult(prev => ({ ...prev, amount: e.target.value }));
                    setIsDirty(true); // Đánh dấu đã sửa
                  }}
                />
              </label>

              <div className={styles.macroGroup}>
                <label className={styles.macroLabel}>
                  Calories (kcal)
                  <input
                    type="number"
                    name="calories"
                    value={analysisResult.calories}
                    onChange={(e) => {
                      const newVal = Number(e.target.value);
                      setAnalysisResult(prev => ({ ...prev, calories: newVal }));
                      // Nếu người dùng sửa calories → không cần gọi AI
                    }}
                  />
                </label>
                <label className={styles.macroLabel}>
                  Protein (g)
                  <input
                    type="number"
                    name="protein"
                    value={analysisResult.protein}
                    onChange={(e) => setAnalysisResult(prev => ({ ...prev, protein: Number(e.target.value) }))}
                  />
                </label>

                <label className={styles.macroLabel}>
                  Carbs (g)
                  <input
                    type="number"
                    name="carbs"
                    value={analysisResult.carbs}
                    onChange={(e) => setAnalysisResult(prev => ({ ...prev, carbs: Number(e.target.value) }))}
                  />
                </label>

                <label className={styles.macroLabel}>
                  Fat (g)
                  <input
                    type="number"
                    name="fat"
                    value={analysisResult.fat}
                    onChange={(e) => setAnalysisResult(prev => ({ ...prev, fat: Number(e.target.value) }))}
                  />
                </label>

                <label className={styles.macroLabel}>
                  Sugar (g)
                  <input
                    type="number"
                    name="sugar"
                    value={analysisResult.sugar}
                    onChange={(e) => setAnalysisResult(prev => ({ ...prev, sugar: Number(e.target.value) }))}
                  />
                </label>
              </div>

              <label>
                Cảm xúc sau bữa ăn
                <select name="status">
                  <option>Energized</option>
                  <option>Quite Satisfied</option>
                  <option>Satisfied</option>
                  <option>Guilty</option>
                  <option>Uncomfortable</option>
                </select>
              </label>

              <label>
                Ghi chú
                <textarea
                  name="thoughts"
                  placeholder="Ví dụ: Ăn ngon, hơi no quá..."
                />
              </label>

              <label className={styles.imageUpload}>
                Ảnh món ăn
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setImageFile(file);
                      const reader = new FileReader();
                      reader.onloadend = async () => {
                        const base64 = reader.result as string;
                        setSelectedImage(base64);

                        setLoading(true);
                        try {
                          const result = await analyzeFood(base64);
                          if (result.error) {
                            setError(result.error);
                          } else {
                            // result.analysis là object → đúng kiểu!
                            setAnalysisResult(result.analysis);
                          }
                        } catch (err) {
                          setError('Lỗi khi phân tích ảnh');
                        } finally {
                          setLoading(false);
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>

              {selectedImage && (
                <img src={selectedImage} alt="Preview" className={styles.imagePreview} />
              )}

              {loading && <p>Đang nhận diện món ăn...</p>}
              {error && <p style={{ color: "red" }}>{error}</p>}

              <div className={styles.modalButtons}>
                <button type="submit" className={styles.addMealBtn}>
                  + Thêm bữa ăn
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setAnalysisResult({ foodName: '', amount: '', calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0 });
                    setSelectedImage(null);
                    setImageFile(null);
                    setError(null);
                    setIsDirty(false);
                    setLastAnalyzedImage(null);
                  }}
                  className={styles.closeModalBtn}
                >
                  Đóng
                </button>
              </div>
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
