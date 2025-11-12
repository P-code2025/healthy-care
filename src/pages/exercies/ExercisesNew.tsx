// src/pages/ExercisesNew.tsx
import { useState, useEffect, useMemo } from 'react';
import { Play, Heart, Clock, Flame, ChevronRight, Search, Filter, X } from 'lucide-react';
import styles from './ExercisesNew.module.css';
import YouTubePlayer from '../../components/YouTubePlayer';
import { SAMPLE_WORKOUT_PLANS, type WorkoutPlan } from './workoutPlans';


const TABS = ['Tất cả', 'Cá nhân hóa', 'Đã lưu', 'Lịch sử'] as const;
type TabType = typeof TABS[number];

export default function ExercisesNew() {
  const [activeTab, setActiveTab] = useState<TabType>('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<WorkoutPlan | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [savedPlans, setSavedPlans] = useState<Set<string>>(new Set(['2', '5']));
  const [plans, setPlans] = useState<WorkoutPlan[]>(SAMPLE_WORKOUT_PLANS);

  // AI Suggestion (giả lập từ Food Diary)
  const aiSuggestedPlan = useMemo(() => {
    // Giả lập: calo ăn vào > 2500 → gợi ý HIIT
    return plans.find(p => p.id === '3');
  }, [plans]);

  // Filter plans
  const filteredPlans = useMemo(() => {
    let filtered = plans;

    if (activeTab === 'Đã lưu') {
      filtered = filtered.filter(p => savedPlans.has(p.id));
    } else if (activeTab === 'Cá nhân hóa') {
      filtered = [aiSuggestedPlan!].filter(Boolean);
    }

    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.goal.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [plans, activeTab, searchQuery, savedPlans, aiSuggestedPlan]);

  const toggleSave = (id: string) => {
    setSavedPlans(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
    setPlans(prev => prev.map(p => p.id === id ? { ...p, isSaved: !p.isSaved } : p));
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Beginner': return 'bg-green-100 text-green-700';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'Advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Workout Plans</h1>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {TABS.map(tab => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* AI Coach Banner */}
      {activeTab === 'Tất cả' && aiSuggestedPlan && (
        <div className={styles.aiBanner}>
          <div className={styles.aiContent}>
            <p className={styles.aiText}>
              Hôm nay bạn nên tập <strong>{aiSuggestedPlan.title}</strong> – {aiSuggestedPlan.duration} phút – Đốt {aiSuggestedPlan.calories}kcal
            </p>
            <button
              onClick={() => setSelectedPlan(aiSuggestedPlan)}
              className={styles.startBtn}
            >
              Bắt đầu ngay
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className={styles.searchBox}>
        <Search className="w-5 h-5 text-gray-500" />
        <input
          type="text"
          placeholder="Tìm giáo án, mục tiêu..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Grid */}
      <div className={styles.grid}>
        {filteredPlans.map(plan => (
          <div
            key={plan.id}
            className={styles.card}
            onClick={() => setSelectedPlan(plan)}
          >
            <div className={styles.thumbnailWrapper}>
              <img src={plan.thumbnail} alt={plan.title} className={styles.thumbnail} />
              <div className={styles.playOverlay}>
                <Play className="w-8 h-8 text-white" />
              </div>
              {plan.progress !== undefined && (
                <div className={styles.progressBadge}>
                  {plan.progress}/{plan.exercises.length} hoàn thành
                </div>
              )}
            </div>

            <div className={styles.cardBody}>
              <h3 className={styles.cardTitle}>{plan.title}</h3>
              <div className={styles.cardMeta}>
                <span className={styles.metaItem}>
                  <Clock className="w-4 h-4" /> {plan.duration} phút
                </span>
                <span className={styles.metaItem}>
                  <Flame className="w-4 h-4" /> {plan.calories} kcal
                </span>
                <span className={`${styles.difficulty} ${getDifficultyColor(plan.difficulty)}`}>
                  {plan.difficulty}
                </span>
              </div>

              <div className={styles.cardActions}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSave(plan.id);
                  }}
                  className={`${styles.saveBtn} ${plan.isSaved ? styles.saved : ''}`}
                >
                  <Heart className={`w-5 h-5 ${plan.isSaved ? 'fill-red-500' : ''}`} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPlan(plan);
                  }}
                  className={styles.startBtnSmall}
                >
                  Bắt đầu
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Plan Detail Modal */}
      {selectedPlan && (
        <div className={styles.modalOverlay} onClick={() => setSelectedPlan(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <button className={styles.workoutCloseBtn} onClick={() => setSelectedPlan(null)}>
              <X className="w-6 h-6" />
            </button>

            {/* Video Intro */}
            {selectedPlan.videoUrl && (
              <div className={styles.videoWrapper}>
                <YouTubePlayer videoId={selectedPlan.videoUrl.split('v=')[1]} autoplay={false} muted={true} />
              </div>
            )}

            <div className={styles.modalContent}>
              <h2 className={styles.modalTitle}>{selectedPlan.title}</h2>
              <div className={styles.modalMeta}>
                <span>{selectedPlan.duration} phút</span>
                <span>{selectedPlan.calories} kcal</span>
                <span className={getDifficultyColor(selectedPlan.difficulty)}>{selectedPlan.difficulty}</span>
              </div>

              <h3 className={styles.sectionTitle}>Danh sách bài tập</h3>
              <div className={styles.exerciseList}>
                {selectedPlan.exercises.map((ex, i) => (
                  <div key={i} className={styles.exerciseItem}>
                    <div className={styles.exerciseHeader}>
                      <span className={styles.exerciseIndex}>{i + 1}</span>
                      <span className={styles.exerciseName}>Squats</span>
                    </div>
                    <div className={styles.exerciseDetails}>
                      <span>{ex.sets} sets x {ex.reps}</span>
                      <span>Rest: {ex.rest}</span>
                    </div>
                    <button
                      onClick={() => setShowPreview(true)}
                      className={styles.playSmall}
                    >
                      <Play className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <button className={styles.startWorkoutBtn}>
                Bắt đầu buổi tập
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Preview Modal */}
      {showPreview && selectedPlan?.exercises[0]?.videoUrl && (
        <div className={styles.modalOverlay} onClick={() => setShowPreview(false)}>
          <div className={styles.videoModal}>
            <button className={styles.workoutCloseBtn} onClick={() => setShowPreview(false)}>
              <X className="w-6 h-6" />
            </button>
            <YouTubePlayer videoId={selectedPlan.exercises[0].videoUrl.split('v=')[1]} />
          </div>
        </div>
      )}
    </div>
  );
}