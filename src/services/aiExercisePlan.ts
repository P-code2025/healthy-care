// src/services/aiExercisePlan.ts
import { ClovaXClient } from '../api/clovax/client';

// DÙNG ClovaMessage TỪ client.ts → KHÔNG XUNG ĐỘT
import type { ClovaMessage as ClientClovaMessage } from '../api/clovax/client';

export interface AIExercisePlan {
  summary: string;
  intensity: 'nhẹ' | 'vừa' | 'nặng';
  exercises: { name: string; duration: string; reason: string }[];
  totalBurnEstimate: string;
  advice: string;
}

function extractText(content: any): string {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content.map((part: any) => part.text || '').join('');
  }
  return '';
}

function normalizeAIPlan(data: any, availablePlans: string[]): AIExercisePlan {
  if (!data || typeof data !== 'object') return createFallbackPlan();

  const exercises = Array.isArray(data.exercises)
    ? data.exercises
        .filter((ex: any) => ex.name && availablePlans.includes(ex.name))
        .slice(0, 4)
        .map((ex: any) => ({
          name: String(ex.name).trim(),
          duration: String(ex.duration || "20 phút").trim(),
          reason: String(ex.reason || "Cải thiện sức khỏe").trim(),
        }))
    : [];

  return {
    summary: String(data.summary || "Kế hoạch tập luyện hôm nay").trim(),
    intensity: ['nhẹ', 'vừa', 'nặng'].includes(data.intensity) ? data.intensity : 'vừa',
    exercises,
    totalBurnEstimate: String(data.totalBurnEstimate || "300-400 kcal").trim(),
    advice: String(data.advice || "Tập đều đặn").trim(),
  };
}

function autoFixJSON(input: string): string {
  let json = input.trim().replace(/```json|```/g, '');
  const start = json.indexOf('{');
  const end = json.lastIndexOf('}') + 1;
  if (start === -1 || end === 0) return '{}';
  json = json.slice(start, end);

  let brace = 0, bracket = 0;
  for (const c of json) {
    if (c === '{') brace++;
    if (c === '}') brace--;
    if (c === '[') bracket++;
    if (c === ']') bracket--;
  }
  json += '}'.repeat(Math.max(0, brace));
  json += ']'.repeat(Math.max(0, bracket));

  return json.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
}

function createFallbackPlan(): AIExercisePlan {
  return {
    summary: "Gợi ý mặc định: Tập nhẹ để duy trì sức khỏe",
    intensity: "nhẹ",
    exercises: [
      { name: "Morning Yoga Flow", duration: "20 phút", reason: "Giãn cơ, thư giãn" },
      { name: "Đi bộ nhanh", duration: "30 phút", reason: "Đốt calo nhẹ nhàng" }
    ],
    totalBurnEstimate: "250 kcal",
    advice: "Uống đủ nước, khởi động trước khi tập."
  };
}

type CacheType = 'daily' | 'query';

export async function generateAIExercisePlan(
  dailyIntake: number,
  user: any,
  availablePlans: string[],
  userQuery: string = "Tạo kế hoạch tập luyện hôm nay",
  cacheType: CacheType = 'query'
): Promise<AIExercisePlan> {
  const client = new ClovaXClient("HCX-005");

  // === TÍNH TOÁN ===
  const bmi = user.weight && user.height
    ? (user.weight / ((user.height / 100) ** 2)).toFixed(1)
    : 'không rõ';
  const bmr = user.gender === 'Nam'
    ? 88.362 + (13.397 * user.weight) + (4.799 * user.height) - (5.677 * user.age)
    : 447.593 + (9.247 * user.weight) + (3.098 * user.height) - (4.33 * user.age);
  const tdee = Math.round(bmr * 1.55);
  const goalText = user.goal === 'lose' ? 'giảm cân' : 'duy trì';
  const foodSummary = user.foodEntries?.map((e:any) => `${e.foodName} (${e.amount})`).join(', ') || 'Chưa có';

  // === CACHE CHỈ CHO DAILY, KHÔNG CHO QUERY ===
  let cached: string | null = null;
  if (cacheType === 'daily') {
    const profileKey = `${user.age}_${user.gender}_${user.weight}_${user.height}_${user.goalWeight}`;
    const cacheKey = `aiPlan_daily_${new Date().toDateString()}_${dailyIntake}_${profileKey.substring(0, 50)}`;
    cached = localStorage.getItem(cacheKey);
    if (cached) {
      console.log("DÙNG CACHE DAILY:", cacheKey);
      return JSON.parse(cached);
    }
  }
  // → cacheType 'query' → KHÔNG CACHE → luôn gọi AI mới

  // === PROMPT MỚI – KHÔNG CÓ JSON MẪU, CHỈ CẤU TRÚC ===
  const prompt = `
Bạn là huấn luyện viên AI chuyên nghiệp, an toàn, thông minh.

=== THÔNG TIN NGƯỜI DÙNG ===
- Giới tính: ${user.gender}
- Tuổi: ${user.age}
- Cân nặng: ${user.weight} kg
- Chiều cao: ${user.height} cm
- BMI: ${bmi}
- Mục tiêu: ${goalText}
- TDEE: ${tdee} kcal
- ĐÃ NẠP: ${dailyIntake} kcal (${Math.round(dailyIntake / tdee * 100)}% TDEE)
- Thực đơn: ${foodSummary}
- Sở thích tập: ${user.workoutPreference?.join(', ') || 'Không có'}
- Câu hỏi: "${userQuery}"

=== QUY TẮC BẮT BUỘC ===
1. Nếu người dùng nói: đau, mỏi, mệt, đuối, tập nhẹ → cường độ "nhẹ", ưu tiên Yoga, Mobility, Đi bộ, Stretching
2. Nếu không → dựa vào % calo:
   • < 30% → "nhẹ" + cảnh báo ăn thêm
   • 30–70% → "vừa"
   • > 70% → "nặng" hoặc "phục hồi"
3. Chọn 1–3 bài từ danh sách dưới đây
4. Tổng đốt: 250–600 kcal
5. Reason: cụ thể, liên hệ thực tế
6. Summary: ngắn gọn, có tên, tình trạng

=== DANH SÁCH BÀI TẬP ===
${availablePlans.map(p => `• ${p}`).join('\n')}

=== TRẢ VỀ CHỈ JSON THUẦN (KHÔNG \`\`\`json) ===
{
  "summary": "string",
  "intensity": "nhẹ|vừa|nặng",
  "exercises": [{"name": "string", "duration": "string", "reason": "string"}],
  "totalBurnEstimate": "string",
  "advice": "string"
}
`.trim();

  const messages: ClientClovaMessage[] = [
    { role: "system", content: [{ type: "text", text: "TRẢ VỀ CHỈ JSON THUẦN. KHÔNG GIẢI THÍCH." }] },
    { role: "user", content: [{ type: "text", text: prompt }] }
  ];

  try {
    const request = client.createRequest(messages);
    request.maxTokens = 1500;
    request.temperature = 0.3;
    request.topP = 0.8;

    const response = await client.createChatCompletion(request);
    const rawText = extractText(response.result.message.content);
    console.log("Raw AI:", rawText);

    const cleaned = rawText.replace(/```json|```/g, '').trim();
    const fixedJSON = autoFixJSON(cleaned);
    let parsed: any;

    try {
      parsed = JSON.parse(fixedJSON);
    } catch (e) {
      console.error("JSON lỗi:", e);
      const fallback = createFallbackPlan();
      if (cacheType === 'daily') localStorage.setItem(`aiPlan_daily_${new Date().toDateString()}`, JSON.stringify(fallback));
      return fallback;
    }

    // === NORMALIZE MỞ RỘNG – KHÔNG LỌC GẮT ===
    const normalizeAIPlan = (data: any): AIExercisePlan => {
      if (!data || typeof data !== 'object') return createFallbackPlan();

      const exercises = Array.isArray(data.exercises)
        ? data.exercises
            .filter((ex: any) => ex.name)
            .map((ex: any) => {
              // Tìm bài gần nhất trong availablePlans
              const matched = availablePlans.find(p =>
                p.toLowerCase().includes(ex.name.toLowerCase()) ||
                ex.name.toLowerCase().includes(p.toLowerCase())
              );
              return {
                name: matched || ex.name,
                duration: String(ex.duration || "20 phút").trim(),
                reason: String(ex.reason || "Cải thiện sức khỏe").trim(),
              };
            })
            .slice(0, 3)
        : [];

      return {
        summary: String(data.summary || "Kế hoạch tập luyện hôm nay").trim(),
        intensity: ['nhẹ', 'vừa', 'nặng'].includes(data.intensity) ? data.intensity : 'vừa',
        exercises,
        totalBurnEstimate: String(data.totalBurnEstimate || "300-400 kcal").trim(),
        advice: String(data.advice || "Tập đều đặn").trim(),
      };
    };

    const normalized = normalizeAIPlan(parsed);

    // Chỉ cache daily
    if (cacheType === 'daily') {
      const profileKey = `${user.age}_${user.gender}_${user.weight}_${user.height}_${user.goalWeight}`;
      const cacheKey = `aiPlan_daily_${new Date().toDateString()}_${dailyIntake}_${profileKey.substring(0, 50)}`;
      localStorage.setItem(cacheKey, JSON.stringify(normalized));
    }

    return normalized;

  } catch (error) {
    console.error("AI Error:", error);
    const fallback = createFallbackPlan();
    if (cacheType === 'daily') {
      localStorage.setItem(`aiPlan_daily_${new Date().toDateString()}`, JSON.stringify(fallback));
    }
    return fallback;
  }
}