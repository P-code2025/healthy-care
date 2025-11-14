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
let cacheKey: string;
  if (cacheType === 'daily') {
    const profileKey = `${user.age}_${user.gender}_${user.weight}_${user.height}_${user.goalWeight}`;
    cacheKey = `aiPlan_daily_${new Date().toDateString()}_${dailyIntake}_${profileKey.substring(0, 50)}`;
  } else {
    cacheKey = `aiPlan_${new Date().toDateString()}_${userQuery.substring(0, 30)}`;
  }

  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    console.log(`DÙNG CACHE [${cacheType}]:`, cacheKey);
    return JSON.parse(cached);
  }
  const bmi = user.weight && user.height
    ? (user.weight / ((user.height / 100) ** 2)).toFixed(1)
    : 'không rõ';

  const bmr = user.gender === 'Nam'
    ? 88.362 + (13.397 * (user.weight || 70)) + (4.799 * (user.height || 170)) - (5.677 * (user.age || 30))
    : 447.593 + (9.247 * (user.weight || 55)) + (3.098 * (user.height || 160)) - (4.330 * (user.age || 30));

  const tdee = Math.round(bmr * 1.55);
  const goalText = user.goal === 'lose' ? 'giảm cân' : 'duy trì';

  // PROMPT THÔNG MINH – HIỂU CÂU HỎI NGƯỜI DÙNG
  const prompt = `
Bạn là huấn luyện viên AI chuyên nghiệp, an toàn và thông minh. Tạo kế hoạch tập luyện HÔM NAY.

=== THÔNG TIN NGƯỜI DÙNG ===
- Giới tính: ${user.gender}
- Tuổi: ${user.age}
- Cân nặng: ${user.weight} kg
- Chiều cao: ${user.height} cm
- BMI: ${bmi}
- Mục tiêu: ${goalText}
- TDEE: ${tdee} kcal
- ĐÃ NẠP HÔM NAY: ${dailyIntake} kcal (${Math.round(dailyIntake / tdee * 100)}% TDEE)
- Thực đơn: ${user.foodEntries?.map((e: any) => `${e.foodName} (${e.amount})`).join(', ') || 'Chưa có'}
- Sở thích tập: ${user.workoutPreference?.join(', ') || 'Không có'}
- Câu hỏi: "${userQuery}"

=== QUY TẮC BẮT BUỘC (ƯU TIÊN CAO NHẤT) ===
1. **NẾU người dùng nói**: đau vai, mỏi vai, đau lưng, mệt, đuối, tập nhẹ, khó nâng tay...
   → TUYỆT ĐỐI KHÔNG CHỌN: HIIT, Upper Body, Strength, Power, Push-up, Pull-up
   → ƯU TIÊN: Yoga, Mobility, Core, Đi bộ, Low-impact, Stretching
   → Cường độ: "nhẹ"
   → Advice: Gợi ý nghỉ nếu cần

2. **NẾU KHÔNG có triệu chứng**:
   → Dựa vào % calo nạp:
      • < 30% TDEE → cường độ "nhẹ" + cảnh báo ăn thêm
      • 30–70% TDEE → cường độ "vừa"
      • > 70% TDEE → cường độ "nặng" hoặc "phục hồi"
   → Ưu tiên bài phù hợp với thực đơn (carb cao → cardio nhẹ; protein thấp → tránh strength)

3. **Tổng đốt**: 250–600 kcal, chia đều 2–3 bài
4. **Reason**: cụ thể, liên hệ với BMI, thực đơn, sở thích, mục tiêu
5. **Summary**: ngắn gọn, có tên người, tình trạng, mục tiêu

=== DANH SÁCH BÀI TẬP ĐƯỢC PHÉP CHỌN ===
${availablePlans.map(p => `• "${p}"`).join('\n')}

=== TRẢ VỀ CHỈ JSON THUẦN (KHÔNG \`\`\`json, KHÔNG GIẢI THÍCH) ===
{
  "summary": "Dũng, 20t, BMI 24.2, duy trì, ăn ít (452kcal), tập nhẹ",
  "intensity": "nhẹ",
  "exercises": [
    {"name": "Morning Yoga Flow", "duration": "25 phút", "reason": "Giãn cơ sau tteokbokki giàu carb, tăng linh hoạt"},
    {"name": "Brisk Walking", "duration": "30 phút", "reason": "Đốt calo nhẹ, phù hợp BMI ổn định"}
  ],
  "totalBurnEstimate": "320 kcal",
  "advice": "Ăn thêm bữa nhẹ trước tập (trái cây/sữa). Uống đủ nước. Nếu mệt, giảm thời gian."
}
`.trim();

  const messages: ClientClovaMessage[] = [
    {
      role: "system",
      content: [{
        type: "text",
        text: `TRẢ VỀ CHỈ JSON THUẦN. KHÔNG \`\`\`json. KHÔNG GIẢI THÍCH. Đảm bảo JSON hợp lệ.`
      }]
    },
    {
      role: "user",
      content: [{ type: "text", text: prompt }]
    }
  ];

  try {
    const request = client.createRequest(messages);
    request.maxTokens = 1500;
    request.temperature = 0.2;
    request.topP = 0.8;

    const response = await client.createChatCompletion(request);
    const rawText = extractText(response.result.message.content);

    console.log("Raw AI Response:", rawText);

    const cleaned = rawText
      .replace(/```json|```/g, '')
      .replace(/[\r\n]+/g, ' ')
      .trim();

    const fixedJSON = autoFixJSON(cleaned);
    console.log("Fixed JSON:", fixedJSON);

    let parsed: any;
    try {
      parsed = JSON.parse(fixedJSON);
    } catch (e) {
      console.error("JSON Parse Failed:", e);
      const fallback = createFallbackPlan();
      localStorage.setItem(cacheKey, JSON.stringify(fallback));
      return fallback;
    }

    // CHUYỂN parsed → normalized TRƯỚC return
    const normalized = normalizeAIPlan(parsed, availablePlans);

    // LƯU CACHE SAU KHI CÓ normalized
    localStorage.setItem(cacheKey, JSON.stringify(normalized));
    return normalized;

  } catch (error) {
    console.error("Clova AI Error:", error);
    const fallback = createFallbackPlan();
    localStorage.setItem(cacheKey, JSON.stringify(fallback));
    return fallback;
  }
}