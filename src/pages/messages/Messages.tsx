// src/pages/Messages.tsx
import { useState, useEffect, useRef } from 'react';
import styles from './Messages.module.css';

import { TrendingUp, TrendingDown, Camera, Dumbbell, Plus, X } from 'lucide-react';
import type { AnalysisResult } from '../../lib/types';
import { generateAIExercisePlan, type AIExercisePlan } from '../../services/aiExercisePlan';
import { analyzeFood } from '../../services/analyzeFood';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
  isLoading?: boolean;
  nutritionData?: AnalysisResult;
  exercisePlan?: AIExercisePlan;
}

interface FoodEntry {
  meal: 'breakfast' | 'lunch' | 'dinner';
  result: AnalysisResult;
  timestamp: string;
}

interface UserProfile {
  age: number;
  weight: number;
  height: number;
  gender: 'Nam' | 'Nữ';
  goal: 'lose' | 'maintain' | 'gain';
  workoutDays: number;
}

const AI_AVATAR = 'AI';
const USER_AVATAR = 'User';

export default function Messages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load data
  useEffect(() => {
    const saved = localStorage.getItem('aiChatMessages');
    const profile = localStorage.getItem('userProfile');
    if (saved) setMessages(JSON.parse(saved));
    if (profile) setUserProfile(JSON.parse(profile));
  }, []);

  // Save messages
  useEffect(() => {
    localStorage.setItem('aiChatMessages', JSON.stringify(messages));
  }, [messages]);

  // Get today's total calories
  const getTodayCalories = () => {
    const today = new Date().toISOString().split('T')[0];
    const entries: FoodEntry[] = JSON.parse(localStorage.getItem('foodEntries') || '[]');
    return entries
      .filter(e => e.timestamp.startsWith(today))
      .reduce((sum, e) => sum + e.result.calories, 0);
  };

  // Handle text input
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      content: input,
      isUser: true,
      timestamp: new Date().toLocaleTimeString('vi', { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // AI Response
    setTimeout(async () => {
      const aiResponse = await processUserQuery(input);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse.content,
        isUser: false,
        timestamp: new Date().toLocaleTimeString('vi', { hour: '2-digit', minute: '2-digit' }),
        nutritionData: aiResponse.nutritionData,
        exercisePlan: aiResponse.exercisePlan
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1000);
  };

  // Process query
  const processUserQuery = async (query: string): Promise<{ content: string; nutritionData?: AnalysisResult; exercisePlan?: AIExercisePlan }> => {
    const lower = query.toLowerCase();

    // 1. Tổng hợp calo hôm nay
    if (lower.includes('hôm nay') && lower.includes('calo')) {
      const total = getTodayCalories();
      const goal = 2000; // Có thể lấy từ profile
      const diff = total - goal;
      return {
        content: `Bạn đã nạp **${total} kcal** hôm nay (${diff > 0 ? `dư ${diff}` : `thiếu ${-diff}`} kcal so với mục tiêu ${goal} kcal).\n\n` +
                 `${diff > 0 ? 'Không nên ăn thêm. Hãy đi bộ 40 phút để bù đắp!' : 'Bạn có thể ăn thêm một bữa nhẹ (~200 kcal).'}`
      };
    }

    // 2. Tư vấn tập luyện
    if (lower.includes('tập') || lower.includes('lịch') || lower.includes('gợi ý')) {
      if (!userProfile) {
        setShowProfileForm(true);
        return { content: 'Để gợi ý bài tập phù hợp, vui lòng nhập thông tin cá nhân của bạn.' };
      }

      const dailyIntake = getTodayCalories();
      const plans = ['Morning Yoga', 'HIIT Cardio', 'Full Body Strength', 'Core & Mobility'];
      const plan = await generateAIExercisePlan(dailyIntake, userProfile, plans);

      const exerciseList = plan.exercises.map(e => `• **${e.name}** – ${e.duration}\n  _${e.reason}_`).join('\n\n');
      return {
        content: `**Kế hoạch tập hôm nay (${plan.intensity})**\n\n${exerciseList}\n\n` +
                 `**Đốt ước tính**: ${plan.totalBurnEstimate}\n\n` +
                 `_${plan.advice}_`,
        exercisePlan: plan
      };
    }

    // 3. Mặc định
    return { content: 'Tôi có thể giúp bạn phân tích bữa ăn hoặc tư vấn tập luyện. Hãy chụp ảnh món ăn hoặc hỏi về lịch tập!' };
  };

  // Handle image
  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUri = reader.result as string;

      const loadingMsg: Message = {
        id: Date.now().toString(),
        content: 'Đang phân tích ảnh món ăn...',
        isUser: false,
        timestamp: new Date().toLocaleTimeString('vi', { hour: '2-digit', minute: '2-digit' }),
        isLoading: true
      };
      setMessages(prev => [...prev, loadingMsg]);

      try {
        const { analysis } = await analyzeFood(dataUri);
        const meal = new Date().getHours() < 11 ? 'breakfast' : new Date().getHours() < 14 ? 'lunch' : 'dinner';

        // Save to localStorage
        const entry: FoodEntry = {
          meal: meal as any,
          result: analysis,
          timestamp: new Date().toISOString()
        };
        const existing: FoodEntry[] = JSON.parse(localStorage.getItem('foodEntries') || '[]');
        localStorage.setItem('foodEntries', JSON.stringify([...existing, entry]));

        const resultMsg: Message = {
          id: (Date.now() + 1).toString(),
          content: `**${analysis.foodName}** – ${analysis.amount}\n\n` +
                   `Calories: ${analysis.calories} kcal\n` +
                   `Protein: ${analysis.protein}g | Carbs: ${analysis.carbs}g | Fat: ${analysis.fat}g | Sugar: ${analysis.sugar}g\n\n` +
                   `Đã lưu vào **Food Diary**!`,
          isUser: false,
          timestamp: new Date().toLocaleTimeString('vi', { hour: '2-digit', minute: '2-digit' }),
          nutritionData: analysis
        };
        setMessages(prev => prev.filter(m => !m.isLoading).concat(resultMsg));
      } catch (err) {
        setMessages(prev => prev.filter(m => !m.isLoading).concat({
          id: Date.now().toString(),
          content: 'Lỗi phân tích ảnh. Vui lòng thử lại!',
          isUser: false,
          timestamp: new Date().toLocaleTimeString('vi', { hour: '2-digit', minute: '2-digit' })
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className={styles.container}>
      {/* Chat Area */}
      <div className={styles.chatArea}>
        <div className={styles.header}>
          <div className={styles.avatar}>{AI_AVATAR}</div>
          <div>
            <h3>AI Expert</h3>
            <p>Phân tích bữa ăn • Tư vấn tập luyện</p>
          </div>
        </div>

        <div className={styles.messages}>
          {messages.length === 0 && (
            <div className={styles.welcome}>
              <div className={styles.icon}>AI</div>
              <h3>Xin chào! Tôi là AI Expert</h3>
              <p>Chụp ảnh bữa ăn hoặc hỏi về lịch tập!</p>
            </div>
          )}
          {messages.map(msg => (
            <div key={msg.id} className={`${styles.message} ${msg.isUser ? styles.user : styles.ai}`}>
              {!msg.isUser && <div className={styles.avatar}>{AI_AVATAR}</div>}
              <div className={styles.bubble}>
                {msg.isLoading ? (
                  <div className={styles.loading}>•••</div>
                ) : (
                  <>
                    <div dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                    {msg.nutritionData && (
                      <div className={styles.nutritionCard}>
                        <div><strong>{msg.nutritionData.calories}</strong> kcal</div>
                        <div>P: {msg.nutritionData.protein}g</div>
                        <div>C: {msg.nutritionData.carbs}g</div>
                        <div>F: {msg.nutritionData.fat}g</div>
                      </div>
                    )}
                    {msg.exercisePlan && (
                      <div className={styles.exerciseCard}>
                        <div className={styles.intensity}>{msg.exercisePlan.intensity}</div>
                        {msg.exercisePlan.exercises.map((e, i) => (
                          <div key={i} className={styles.exerciseItem}>
                            <Dumbbell className="w-4 h-4" />
                            <div>
                              <div><strong>{e.name}</strong></div>
                              <div className={styles.reason}>{e.duration} – {e.reason}</div>
                            </div>
                          </div>
                        ))}
                        <div className={styles.burn}>Đốt: {msg.exercisePlan.totalBurnEstimate}</div>
                      </div>
                    )}
                  </>
                )}
                <div className={styles.time}>{msg.timestamp}</div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className={styles.message}>
              <div className={styles.avatar}>{AI_AVATAR}</div>
              <div className={styles.bubble}><div className={styles.loading}>•••</div></div>
            </div>
          )}
        </div>

        <div className={styles.inputArea}>
          <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImage} style={{ display: 'none' }} />
          <button onClick={() => fileInputRef.current?.click()} className={styles.attach}>
            <Camera className="w-5 h-5" />
          </button>
          <input
            type="text"
            placeholder="Hỏi về calo, lịch tập..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSend()}
          />
          <button onClick={handleSend} className={styles.send}>Gửi</button>
        </div>
      </div>

      {/* Profile Form */}
      {showProfileForm && (
        <div className={styles.modal} onClick={() => setShowProfileForm(false)}>
          <div className={styles.form} onClick={e => e.stopPropagation()}>
            <h3>Thông tin cá nhân</h3>
            <input placeholder="Tuổi" type="number" onChange={e => setUserProfile(p => ({ ...p!, age: +e.target.value }))} />
            <input placeholder="Cân nặng (kg)" type="number" onChange={e => setUserProfile(p => ({ ...p!, weight: +e.target.value }))} />
            <input placeholder="Chiều cao (cm)" type="number" onChange={e => setUserProfile(p => ({ ...p!, height: +e.target.value }))} />
            <select onChange={e => setUserProfile(p => ({ ...p!, gender: e.target.value as any }))}>
              <option>Giới tính</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>
            <select onChange={e => setUserProfile(p => ({ ...p!, goal: e.target.value as any }))}>
              <option>Mục tiêu</option>
              <option value="lose">Giảm cân</option>
              <option value="maintain">Duy trì</option>
              <option value="gain">Tăng cơ</option>
            </select>
            <input placeholder="Số buổi tập/tuần" type="number" onChange={e => setUserProfile(p => ({ ...p!, workoutDays: +e.target.value }))} />
            <button onClick={() => {
              localStorage.setItem('userProfile', JSON.stringify(userProfile));
              setShowProfileForm(false);
            }}>Lưu</button>
          </div>
        </div>
      )}
    </div>
  );
}