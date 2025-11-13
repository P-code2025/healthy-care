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

function normalizeAIPlan(data: any): AIExercisePlan {
  return {
    summary: String(data.summary || "Kế hoạch tập luyện hôm nay").trim(),
    intensity: ['nhẹ', 'vừa', 'nặng'].includes(data.intensity) ? data.intensity : 'vừa',
    exercises: Array.isArray(data.exercises)
      ? data.exercises.slice(0, 4).map((ex: any) => ({
          name: String(ex.name || "Bài tập").trim(),
          duration: String(ex.duration || "20 phút").trim(),
          reason: String(ex.reason || "Tăng cường sức khỏe").trim(),
        }))
      : [],
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

export async function generateAIExercisePlan(
  dailyIntake: number,
  user: any,
  availablePlans: string[]
): Promise<AIExercisePlan> {
  const client = new ClovaXClient("HCX-005");

  const bmi = user.weight && user.height
    ? (user.weight / ((user.height / 100) ** 2)).toFixed(1)
    : 'không rõ';

  const bmr = user.gender === 'Nam'
    ? 88.362 + (13.397 * (user.weight || 70)) + (4.799 * (user.height || 170)) - (5.677 * (user.age || 30))
    : 447.593 + (9.247 * (user.weight || 55)) + (3.098 * (user.height || 160)) - (4.330 * (user.age || 30));

  const tdee = Math.round(bmr * 1.55);
  const goalText = user.goal === 'lose' ? 'giảm cân' : 'duy trì';

  const prompt = `
Tạo kế hoạch tập luyện hôm nay. Dùng đúng tên bài tập có sẵn.

THÔNG TIN: ${user.gender}, ${user.age} tuổi, ${user.weight}kg, ${user.height}cm, BMI ${bmi}, mục tiêu ${goalText}, nạp ${dailyIntake}kcal, TDEE ${tdee}kcal.

BÀI TẬP CÓ SẴN:
${availablePlans.slice(0, 10).map(p => `• ${p}`).join('\n')}

TRẢ VỀ CHỈ JSON (không markdown, không giải thích):
{
  "summary": "Tóm tắt ngắn gọn",
  "intensity": "nhẹ" hoặc "vừa" hoặc "nặng",
  "exercises": [
    {"name": "Tên bài", "duration": "20 phút", "reason": "Lý do ngắn"}
  ],
  "totalBurnEstimate": "300-400 kcal",
  "advice": "Lời khuyên ngắn"
}
`.trim();

  // DÙNG KIỂU TỪ client.ts → KHÔNG XUNG ĐỘT
  const messages: ClientClovaMessage[] = [
    {
      role: "system",
      content: [{
        type: "text",
        text: `TRẢ VỀ CHỈ JSON THUẦN. KHÔNG \`\`\`json. KHÔNG GIẢI THÍCH.
Đảm bảo JSON hợp lệ, đầy đủ. Cường độ chỉ: nhẹ, vừa, nặng.`
      }]
    },
    {
      role: "user",
      content: [{ type: "text", text: prompt }]
    }
  ];

  try {
    // TẠO REQUEST ĐẦY ĐỦ TỪ client.createRequest()
    const request = client.createRequest(messages);

    // GHI ĐÈ CHỈ NHỮNG TRƯỜNG CẦN THIẾT
    request.maxTokens = 1500;     // ĐỦ CHO KẾ HOẠCH
    request.temperature = 0.3;
    request.topP = 0.8;

    const response = await client.createChatCompletion(request);
    const rawText = extractText(response.result.message.content);

    console.log("Raw AI Response:", rawText);

    const cleaned = rawText
      .replace(/```json|```/g, '')
      .replace(/[\r\n]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const fixedJSON = autoFixJSON(cleaned);
    console.log("Fixed JSON:", fixedJSON);

    let parsed: any;
    try {
      parsed = JSON.parse(fixedJSON);
    } catch (e) {
      console.error("JSON Parse Failed:", e);
      return createFallbackPlan();
    }

    return normalizeAIPlan(parsed);

  } catch (error) {
    console.error("Clova AI Error:", error);
    return createFallbackPlan();
  }
}