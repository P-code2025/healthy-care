// src/components/MealPlanNew.tsx
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import styles from "./MealPlanNew.module.css";
import { generateAIMealPlan } from "../../services/aiMealPlan";

interface Meal {
  name: string;
  calories: number;
  protein: number;
  image: string;
}

interface DayPlan {
  day: string;        // "Monday", "Tuesday"...
  date: string;       // "17 Nov"
  breakfast?: Meal;
  lunch?: Meal;
  snack?: Meal;
  dinner?: Meal;
}

const DAY_NAME_VN: Record<string, string> = {
  Monday: "Thứ Hai",
  Tuesday: "Thứ Ba",
  Wednesday: "Thứ Tư",
  Thursday: "Thứ Năm",
  Friday: "Thứ Sáu",
  Saturday: "Thứ Bảy",
  Sunday: "Chủ Nhật",
};

export default function MealPlanNew() {
  const [plan, setPlan] = useState<DayPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [allergies, setAllergies] = useState("");
  const [preferences, setPreferences] = useState("");

  // Load plan từ cache hoặc tạo mới
  const loadMealPlan = async () => {
    setLoading(true);
    try {
      const data = await generateAIMealPlan(
        allergies.split(",").map(s => s.trim()).filter(Boolean),
        preferences.trim()
      );
      console.log("AI Meal Plan response:", data);

      if (data?.days?.length === 7) {
        setPlan(data.days);
        toast.success("Kế hoạch ăn uống đã được tạo bởi AI – chuẩn hơn cả bác sĩ dinh dưỡng!");
      } else {
        console.warn("AI trả về dữ liệu không đúng định dạng:", data);
        toast.error("AI tạm thời bận, đang dùng thực đơn mẫu Việt Nam ngon tuyệt!");
        setPlan(FALLBACK_PLAN);
      }
    } catch (err) {
      console.error(err);
      toast.error("Không thể tạo bằng AI, đang dùng kế hoạch mẫu Việt Nam siêu ngon!");
      setPlan(FALLBACK_PLAN);
    } finally {
      setLoading(false);
      setShowForm(false);
    }
  };

  // Fallback đẹp khi AI lỗi
  const FALLBACK_PLAN: DayPlan[] = [
    { day: "Monday", date: "17 Nov", breakfast: { name: "Phở bò ít mỡ + rau thơm", calories: 480, protein: 35, image: "/images/meal-plan/pho-bo.jpg" }, lunch: { name: "Cơm tấm sườn nướng + trứng", calories: 680, protein: 42, image: "/images/meal-plan/com-tam.jpg" }, snack: { name: "Sữa chua + chuối", calories: 180, protein: 12, image: "/images/meal-plan/yogurt.jpg" }, dinner: { name: "Cá kho tộ + canh chua", calories: 550, protein: 45, image: "/images/meal-plan/ca-kho.jpg" } },
    { day: "Tuesday", date: "18 Nov", breakfast: { name: "Bánh mì trứng + pate", calories: 520, protein: 28, image: "/images/meal-plan/banh-mi.jpg" }, lunch: { name: "Bún bò Huế", calories: 720, protein: 48, image: "/images/meal-plan/bun-bo.jpg" }, snack: { name: "Sinh tố bơ", calories: 220, protein: 5, image: "/images/meal-plan/smoothie.jpg" }, dinner: { name: "Gà nướng + salad", calories: 580, protein: 52, image: "/images/meal-plan/ga-nuong.jpg" } },
    { day: "Wednesday", date: "19 Nov", breakfast: { name: "Bánh cuốn thịt", calories: 460, protein: 30, image: "/images/meal-plan/banh-cuon.jpg" }, lunch: { name: "Cơm chiên dương châu", calories: 680, protein: 38, image: "/images/meal-plan/com-chien.jpg" }, snack: { name: "Hạt điều + táo", calories: 200, protein: 6, image: "/images/meal-plan/nuts.jpg" }, dinner: { name: "Bò lúc lắc + khoai lang", calories: 620, protein: 50, image: "/images/meal-plan/bo-luc-lac.jpg" } },
    { day: "Thursday", date: "20 Nov", breakfast: { name: "Hủ tiếu nam vang", calories: 550, protein: 32, image: "/images/meal-plan/hu-tieu.jpg" }, lunch: { name: "Cơm gà xối mỡ", calories: 740, protein: 44, image: "/images/meal-plan/com-ga.jpg" }, snack: { name: "Chè ba màu", calories: 240, protein: 4, image: "/images/meal-plan/che.jpg" }, dinner: { name: "Cá hấp + salad ức gà", calories: 560, protein: 55, image: "/images/meal-plan/ca-hap.jpg" } },
    { day: "Friday", date: "21 Nov", breakfast: { name: "Xôi gà", calories: 580, protein: 35, image: "/images/meal-plan/xoi-ga.jpg" }, lunch: { name: "Bánh xèo tôm thịt", calories: 700, protein: 40, image: "/images/meal-plan/banh-xeo.jpg" }, snack: { name: "Kem tươi dâu", calories: 190, protein: 5, image: "/images/meal-plan/ice-cream.jpg" }, dinner: { name: "Tôm hấp bia + salad", calories: 530, protein: 48, image: "/images/meal-plan/tom-hap.jpg" } },
    { day: "Saturday", date: "22 Nov", breakfast: { name: "Bún riêu cua", calories: 510, protein: 38, image: "/images/meal-plan/bun-rieu.jpg" }, lunch: { name: "Cơm niêu cá kho", calories: 680, protein: 45, image: "/images/meal-plan/com-nieu.jpg" }, snack: { name: "Trà sữa trân châu", calories: 280, protein: 6, image: "/images/meal-plan/tra-sua.jpg" }, dinner: { name: "Lẩu Thái chay", calories: 480, protein: 30, image: "/images/meal-plan/lau-thai.jpg" } },
    { day: "Sunday", date: "23 Nov", breakfast: { name: "Cháo gà", calories: 420, protein: 32, image: "/images/meal-plan/chao-ga.jpg" }, lunch: { name: "Cơm tấm ba rọi", calories: 720, protein: 40, image: "/images/meal-plan/com-tam.jpg" }, snack: { name: "Bánh flan + cà phê", calories: 220, protein: 8, image: "/images/meal-plan/flan.jpg" }, dinner: { name: "Thịt kho tàu + dưa chua", calories: 620, protein: 48, image: "/images/meal-plan/thit-kho.jpg" } },
  ];

  useEffect(() => {
    setPlan(FALLBACK_PLAN);
  }, []);

  const getMealColor = (type: string) => {
    const colors = {
      breakfast: "linear-gradient(135deg, #D4F4DD 0%, #A7E9AF 100%)",
      lunch: "linear-gradient(135deg, #FFE5B4 0%, #FFD89B 100%)",
      snack: "linear-gradient(135deg, #FFE5CC 0%, #FFCCA3 100%)",
      dinner: "linear-gradient(135deg, #FFD4A3 0%, #FFB84D 100%)",
    };
    return colors[type as keyof typeof colors] || colors.dinner;
  };

  const handleComingSoon = () => toast.info("Tính năng đang phát triển");

  return (
    <div className={styles.container}>
      {/* Header + Nút AI */}
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Kế hoạch ăn uống 7 ngày</h1>
        <button
          className={styles.aiBtn}
          onClick={() => setShowForm(true)}
          disabled={loading}
        >
          {loading ? "AI đang tạo..." : "Tạo kế hoạch bằng AI"}
        </button>
      </div>

      {/* Modal nhập dị ứng & sở thích */}
      {showForm && (
        <div className={styles.modalOverlay} onClick={() => !loading && setShowForm(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h2>AI tạo thực đơn riêng cho bạn</h2>
            <p>Chỉ 3 giây – chuẩn hơn cả chuyên gia dinh dưỡng!</p>

            <div className={styles.formGroup}>
              <label>Dị ứng (cách nhau bằng dấu phẩy)</label>
              <input
                placeholder="tôm, sữa, lạc, đậu phộng..."
                value={allergies}
                onChange={e => setAllergies(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Sở thích / Không thích</label>
              <input
                placeholder="thích ăn gà, không rau muống, ăn chay thứ 4..."
                value={preferences}
                onChange={e => setPreferences(e.target.value)}
              />
            </div>

            <div className={styles.modalActions}>
              <button onClick={() => setShowForm(false)} disabled={loading}>Hủy</button>
              <button className={styles.primaryBtn} onClick={loadMealPlan} disabled={loading}>
                {loading ? "Đang tạo..." : "Tạo ngay"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header các bữa */}
      <div className={styles.mealHeaders}>
        <div className={styles.dayColumn}></div>
        <div className={styles.mealHeader} style={{ background: getMealColor("breakfast") }}>Bữa sáng</div>
        <div className={styles.mealHeader} style={{ background: getMealColor("lunch") }}>Bữa trưa</div>
        <div className={styles.mealHeader} style={{ background: getMealColor("snack") }}>Bữa xế</div>
        <div className={styles.mealHeader} style={{ background: getMealColor("dinner") }}>Bữa tối</div>
      </div>

      {/* Bảng 7 ngày */}
      <div className={styles.weeklyPlan}>
        {plan.map((day, i) => (
          <div key={i} className={styles.dayRow}>
            <div className={styles.dayInfo}>
              <div className={styles.dayName}>{DAY_NAME_VN[day.day] || day.day}</div>
              <div className={styles.dayDate}>{day.date}</div>
            </div>

            {(["breakfast", "lunch", "snack", "dinner"] as const).map(mealType => {
              const meal = day[mealType];
              return (
                <div key={mealType} className={styles.mealCard} style={{ background: getMealColor(mealType) }}>
                  {meal ? (
                    <>
                      <div className={styles.mealImage}>
                        <img src={meal.image} alt={meal.name} />
                        <button className={styles.checkBtn} onClick={handleComingSoon}>
                          Check
                        </button>
                      </div>
                      <div className={styles.mealInfo}>
                        <h3 className={styles.mealName}>{meal.name}</h3>
                        <p className={styles.nutrition}>
                          {meal.calories} kcal • {meal.protein}g protein
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className={styles.emptyMeal}>Chưa có món</div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}