import { useState } from "react";
import styles from "./ExercisesNew.module.css";
import ExerciseCard from "./components/ExerciseCard";
// [ĐÃ XÓA] Dòng import icons (LuClock, LuFlame, LuSignal) đã bị xóa khỏi đây

// [ĐÃ SỬA] Thêm "export" để file ExerciseCard.tsx có thể import
export interface Exercise {
  id: string;
  name: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  muscleGroups: string[];
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  duration: number;
  sets: number;
  reps: string;
  rest: string;
  weight: string;
  calories: number;
  status: "Completed" | "In Progress" | "Not Started" | "Skipped";
}

// Dán vào file: src/pages/exercies/ExercisesNew.tsx (thay thế mảng cũ)

const PROFESSIONAL_WORKOUT_PLANS: Exercise[] = [
  // === CẤP ĐỘ 1: NHẸ NHÀNG (BEGINNER) ===
  {
    id: "YOGA_BEGINNER_01",
    name: "Morning Yoga Flow (20 Min)",
    description:
      "Một bài tập yoga buổi sáng nhẹ nhàng (20 phút) để khởi động ngày mới, tập trung vào hơi thở và sự linh hoạt.",
    videoUrl: "https://www.youtube.com/watch?v=4TLHLNX65-4",
    thumbnailUrl: "https://i.ytimg.com/vi/e-3S1M0YyvE/maxresdefault.jpg",
    muscleGroups: ["Full Body", "Flexibility", "Mindfulness"],
    difficulty: "Beginner",
    duration: 20,
    sets: 1,
    reps: "20 phút",
    rest: "N/A",
    weight: "Bodyweight",
    calories: 80,
    status: "Not Started",
  },
  {
    id: "PLANK_BEGINNER_01",
    name: "Planks For Beginners",
    description:
      "Hướng dẫn bài tập plank cơ bản cho người mới bắt đầu để xây dựng sức mạnh cốt lõi (core).",
    videoUrl: "https://www.youtube.com/watch?v=ASdvN_XEl_c",
    thumbnailUrl: "https://i.ytimg.com/vi/bNcB0sSC7i0/maxresdefault.jpg",
    muscleGroups: ["Core", "Abs"],
    difficulty: "Beginner",
    duration: 15,
    sets: 3,
    reps: "30 giây",
    rest: "30 giây",
    weight: "Bodyweight",
    calories: 150,
    status: "Not Started",
  },
  {
    id: "BEGINNER_ABS_01",
    name: "10 Min Beginner Abs",
    description:
      "Bài tập bụng 10 phút cho người mới bắt đầu, không cần dụng cụ, tập ngay trên sàn.",
    videoUrl: "https://www.youtube.com/watch?v=s27_b914-pg",
    thumbnailUrl: "https://i.ytimg.com/vi/s27_b914-pg/maxresdefault.jpg",
    muscleGroups: ["Core", "Abs"],
    difficulty: "Beginner",
    duration: 10,
    sets: 1,
    reps: "45s tập / 15s nghỉ",
    rest: "15 giây",
    weight: "Bodyweight",
    calories: 100,
    status: "Not Started",
  },
  {
    id: "FULL_BODY_STRETCH_01",
    name: "Full Body Stretch (15 Min)",
    description:
      "Bài tập giãn cơ toàn thân 15 phút, tuyệt vời cho phục hồi sau tập hoặc giảm căng thẳng.",
    videoUrl: "https://www.youtube.com/watch?v=Eogrw-I5-A8",
    thumbnailUrl: "https://i.ytimg.com/vi/Eogrw-I5-A8/maxresdefault.jpg",
    muscleGroups: ["Full Body", "Flexibility"],
    difficulty: "Beginner",
    duration: 15,
    sets: 1,
    reps: "15 phút",
    rest: "N/A",
    weight: "Bodyweight",
    calories: 50,
    status: "Not Started",
  },

  // === CẤP ĐỘ 2: TRUNG BÌNH (INTERMEDIATE) / ĐỐT CALO ===
  {
    id: "HIIT_FAT_LOSS_20",
    name: "20 Min HIIT Fat Loss - No Repeat Workout",
    description:
      "Bài tập HIIT 20 phút toàn thân cường độ cao để đốt mỡ. Không lặp lại bài tập, không cần dụng cụ.",
    videoUrl: "https://www.youtube.com/watch?v=zJKtwow2oBc",
    thumbnailUrl: "https://i.ytimg.com/vi/CBd8-34gq4A/maxresdefault.jpg",
    muscleGroups: ["Full Body", "Cardio"],
    difficulty: "Intermediate",
    duration: 20,
    sets: 1,
    reps: "45s tập / 15s nghỉ",
    rest: "15 giây",
    weight: "Bodyweight",
    calories: 350,
    status: "Not Started",
  },
  {
    id: "FULL_BODY_STRENGTH_01",
    name: "Full Body Strength - Week 1",
    description:
      "Ngày 1 của chuỗi 28 ngày tập sức mạnh toàn thân với tạ dumbbell. Bao gồm các bài tập kết hợp.",
    videoUrl: "https://www.youtube.com/watch?v=_jGebGZnYrU",
    thumbnailUrl: "https://i.ytimg.com/vi/pD3-yE-E0eE/maxresdefault.jpg",
    muscleGroups: ["Full Body", "Strength"],
    difficulty: "Intermediate",
    duration: 45,
    sets: 4,
    reps: "Xem video",
    rest: "Xem video",
    weight: "Dumbbells",
    calories: 320,
    status: "Not Started", // Anh có thể đổi lại thành "In Progress" để test
  },
  {
    id: "HIIT_FAT_BURN_01",
    name: "HIIT Fat Burn (HIIT x Cardio)",
    description: "Bài tập HIIT x Cardio kết hợp để đốt mỡ toàn thân hiệu quả.",
    videoUrl: "https://www.youtube.com/watch?v=YfIVllyojnQ",
    thumbnailUrl: "https://i.ytimg.com/vi/ypl8-v0-I-k/maxresdefault.jpg",
    muscleGroups: ["Full Body", "Cardio"],
    difficulty: "Intermediate",
    duration: 25,
    sets: 1,
    reps: "45s tập / 15s nghỉ",
    rest: "15 giây",
    weight: "Bodyweight",
    calories: 400,
    status: "Not Started",
  },
  {
    id: "DUMBBELL_HIIT_01",
    name: "30 Min Dumbbell HIIT",
    description:
      "Bài tập HIIT 30 phút sử dụng tạ dumbbell để tăng cường sức mạnh và đốt calo cùng lúc.",
    videoUrl: "https://www.youtube.com/watch?v=1oD_bVf_UqY",
    thumbnailUrl: "https://i.ytimg.com/vi/1oD_bVf_UqY/maxresdefault.jpg",
    muscleGroups: ["Full Body", "Cardio", "Strength"],
    difficulty: "Intermediate",
    duration: 30,
    sets: 3,
    reps: "40s tập / 20s nghỉ",
    rest: "20 giây",
    weight: "Dumbbells",
    calories: 380,
    status: "Not Started",
  },
  {
    id: "CORE_CRUSHER_01",
    name: "Core & Abs Crusher (15 Min)",
    description:
      "Tập trung 'nghiền nát' cơ bụng và cơ lõi của bạn trong 15 phút.",
    videoUrl: "https://www.youtube.com/watch?v=MiGCfVrA388",
    thumbnailUrl: "https://i.ytimg.com/vi/bNcB0sSC7i0/maxresdefault.jpg", // Dùng lại ảnh plank
    muscleGroups: ["Core", "Abs"],
    difficulty: "Intermediate",
    duration: 15,
    sets: 1,
    reps: "45s tập / 15s nghỉ",
    rest: "15 giây",
    weight: "Bodyweight",
    calories: 150,
    status: "Not Started",
  },

  // === CẤP ĐỘ 3: NẶNG (ADVANCED) / NHÓM CƠ ===
  {
    id: "UPPER_BODY_POWER_01",
    name: "Upper Body Power",
    description:
      "Tập trung vào sức mạnh phần thân trên (Đẩy, Kéo) và vai. Sử dụng trọng lượng cơ thể.",
    videoUrl: "https://www.youtube.com/watch?v=c6w8ZyEioZM",
    thumbnailUrl: "https://i.ytimg.com/vi/fKYrLv3Qj2E/maxresdefault.jpg",
    muscleGroups: ["Upper Body", "Chest", "Back", "Shoulders"],
    difficulty: "Advanced",
    duration: 25,
    sets: 4,
    reps: "30s tập / 15s nghỉ",
    rest: "15 giây",
    weight: "Bodyweight",
    calories: 280,
    status: "Not Started", // Anh có thể đổi lại thành "Completed" để test
  },
  {
    id: "LEG_DAY_MASS_01",
    name: "Dumbbell Legs Workout for Muscle",
    description:
      "Bài tập 35 phút tập trung vào xây dựng cơ bắp cho phần thân dưới, bao gồm đùi và mông.",
    videoUrl: "https://www.youtube.com/watch?v=ueNGcoH3o7M",
    thumbnailUrl: "https://i.ytimg.com/vi/ueNGcoH3o7M/maxresdefault.jpg",
    muscleGroups: ["Legs", "Glutes", "Quads", "Hamstrings"],
    difficulty: "Advanced",
    duration: 35,
    sets: 3,
    reps: "8-12 reps",
    rest: "60-90 giây",
    weight: "Dumbbells",
    calories: 420,
    status: "Not Started",
  },
  {
    id: "CHEST_BACK_SUPERSET_01",
    name: "Chest & Back Superset Workout",
    description:
      "Tối đa hóa hiệu quả tập luyện với các superset (cặp bài tập) cho ngực và lưng.",
    videoUrl: "https://www.youtube.com/watch?v=GGVqVAm9I2g",
    thumbnailUrl: "https://i.ytimg.com/vi/GGVqVAm9I2g/maxresdefault.jpg",
    muscleGroups: ["Chest", "Back", "Upper Body"],
    difficulty: "Advanced",
    duration: 40,
    sets: 3,
    reps: "10-12 reps",
    rest: "90 giây (giữa superset)",
    weight: "Dumbbells/Cables",
    calories: 450,
    status: "Not Started",
  },
  {
    id: "SHOULDER_ARM_01",
    name: "Shoulder & Arm Builder (30 Min)",
    description:
      "Tập trung xây dựng cơ bắp cho vai, bắp tay trước và bắp tay sau.",
    videoUrl: "https://www.youtube.com/watch?v=pYcpY20QaE8",
    thumbnailUrl: "https://i.ytimg.com/vi/pYcpY20QaE8/maxresdefault.jpg",
    muscleGroups: ["Shoulders", "Arms", "Upper Body"],
    difficulty: "Intermediate",
    duration: 30,
    sets: 4,
    reps: "10-15 reps",
    rest: "60 giây",
    weight: "Dumbbells",
    calories: 290,
    status: "Not Started",
  },
  {
    id: "PLYOMETRIC_HIIT_01",
    name: "Explosive Plyometric HIIT",
    description:
      "Bài tập 25 phút tập trung vào sức mạnh bùng nổ (plyometric) để cải thiện tốc độ và đốt mỡ.",
    videoUrl: "https://www.youtube.com/watch?v=s_dHT-EogIU",
    thumbnailUrl: "https://i.ytimg.com/vi/s_dHT-EogIU/maxresdefault.jpg",
    muscleGroups: ["Full Body", "Cardio", "Legs"],
    difficulty: "Advanced",
    duration: 25,
    sets: 1,
    reps: "30s tập / 15s nghỉ",
    rest: "15 giây",
    weight: "Bodyweight",
    calories: 430,
    status: "Not Started",
  },
  {
    id: "ADVANCED_CORE_01",
    name: "Advanced Core & Abs (20 Min)",
    description:
      "Thử thách cơ lõi của bạn với bài tập bụng nâng cao 20 phút không nghỉ.",
    videoUrl: "https://www.youtube.com/watch?v=4dGYBYM-n0M",
    thumbnailUrl: "https://i.ytimg.com/vi/4dGYBYM-n0M/maxresdefault.jpg",
    muscleGroups: ["Core", "Abs"],
    difficulty: "Advanced",
    duration: 20,
    sets: 1,
    reps: "50s tập / 10s nghỉ",
    rest: "10 giây",
    weight: "Bodyweight",
    calories: 250,
    status: "Not Started",
  },
  {
    id: "FULL_BODY_DUMBBELL_01",
    name: "Advanced Full Body Dumbbell",
    description:
      "Một bài tập toàn thân nâng cao kéo dài 45 phút, chỉ sử dụng tạ dumbbell.",
    videoUrl: "https://www.youtube.com/watch?v=Jb-t-_S1SjM",
    thumbnailUrl: "https://i.ytimg.com/vi/Jb-t-_S1SjM/maxresdefault.jpg",
    muscleGroups: ["Full Body", "Strength"],
    difficulty: "Advanced",
    duration: 45,
    sets: 4,
    reps: "10 reps",
    rest: "60 giây",
    weight: "Dumbbells",
    calories: 500,
    status: "Not Started",
  },
];

const STATUS_OPTIONS = [
  "All Status",
  "Completed",
  "In Progress",
  "Not Started",
  "Skipped",
];

const initialNewExerciseState: Omit<Exercise, "status"> = {
  id: "",
  name: "",
  description: "",
  videoUrl: "",
  thumbnailUrl: "",
  muscleGroups: [],
  difficulty: "Beginner",
  duration: 0,
  sets: 0,
  reps: "",
  rest: "",
  weight: "",
  calories: 0,
};

export default function ExercisesNew() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [selectedWeek, setSelectedWeek] = useState("This Week");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState("All");

  const [selectedVideo, setSelectedVideo] = useState<Exercise | null>(null);
  const [favorites, setFavorites] = useState<string[]>([
    "YOGA_BEGINNER",
    "CORE_CRUSHER_10",
  ]);
  const [workouts, setWorkouts] = useState<Exercise[]>(
    PROFESSIONAL_WORKOUT_PLANS
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [newExercise, setNewExercise] = useState(initialNewExerciseState);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id]
    );
  };

  const filteredExercises = workouts.filter((exercise) => {
    const matchesSearch = exercise.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      selectedStatus === "All Status" || exercise.status === selectedStatus;
    const matchesDifficulty =
      selectedDifficulty === "All" ||
      exercise.difficulty === selectedDifficulty;
    const matchesMuscleGroup =
      selectedMuscleGroup === "All" ||
      exercise.muscleGroups.includes(selectedMuscleGroup);

    return (
      matchesSearch && matchesStatus && matchesDifficulty && matchesMuscleGroup
    );
  });

  const totalPages = Math.ceil(filteredExercises.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentExercises = filteredExercises.slice(startIndex, endIndex);

  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setNewExercise((prev) => ({
      ...prev,
      [name]:
        name === "duration" || name === "sets" || name === "calories"
          ? parseInt(value) || 0
          : name === "muscleGroups"
          ? value.split(",").map((s) => s.trim())
          : value,
    }));
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const exerciseToAdd: Exercise = {
      ...newExercise,
      status: "Not Started",
      id: newExercise.id || `custom-${Date.now()}`,
    };
    setWorkouts((prev) => [exerciseToAdd, ...prev]);
    setShowAddModal(false);
    setNewExercise(initialNewExerciseState);
  };

  // --- BẮT ĐẦU JSX ---
  return (
    <div className={styles.container}>
      {/* === Modal Xem Video === */}
      {selectedVideo && (
        <div
          className={styles.modalOverlay}
          onClick={() => setSelectedVideo(null)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>{selectedVideo.name}</h3>
            <p>{selectedVideo.description}</p>
            <div className={styles.videoWrapper}>
              <iframe
                width="100%"
                height="100%"
                src={selectedVideo.videoUrl.replace("watch?v=", "embed/")}
                title={selectedVideo.name}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <button
              onClick={() => setSelectedVideo(null)}
              className={styles.closeModalBtn}
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* === Modal Add Exercise === */}
      {showAddModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowAddModal(false)}
        >
          <form
            className={`${styles.modalContent} ${styles.addForm}`}
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleAddSubmit}
          >
            <h3>Thêm bài tập mới</h3>
            <div className={styles.formGrid}>
              {/* Cột 1 */}
              <div className={styles.formColumn}>
                <div className={styles.formGroup}>
                  <label>ID (Unique)</label>
                  <input
                    type="text"
                    name="id"
                    placeholder="VD: NEW_PUSHUP_1"
                    value={newExercise.id}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Tên bài tập (Name)</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="VD: Hít đất nâng cao"
                    value={newExercise.name}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Mô tả (Description)</label>
                  <textarea
                    name="description"
                    placeholder="Mô tả ngắn về bài tập..."
                    value={newExercise.description}
                    onChange={handleFormChange}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Link Video (videoUrl)</label>
                  <input
                    type="text"
                    name="videoUrl"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={newExercise.videoUrl}
                    onChange={handleFormChange}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Link ảnh bìa (thumbnailUrl)</label>
                  <input
                    type="text"
                    name="thumbnailUrl"
                    placeholder="https://i.ytimg.com/vi/....jpg"
                    value={newExercise.thumbnailUrl}
                    onChange={handleFormChange}
                  />
                </div>
              </div>

              {/* Cột 2 */}
              <div className={styles.formColumn}>
                <div className={styles.formGroup}>
                  <label>Nhóm cơ (phân cách bằng dấu phẩy)</label>
                  <input
                    type="text"
                    name="muscleGroups"
                    placeholder="VD: Core, Abs, Full Body"
                    value={newExercise.muscleGroups.join(", ")}
                    onChange={handleFormChange}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Độ khó (difficulty)</label>
                  <select
                    name="difficulty"
                    value={newExercise.difficulty}
                    onChange={handleFormChange}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                {/* Grid con cho các số liệu */}
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label>Thời lượng (phút)</label>
                    <input
                      type="number"
                      name="duration"
                      value={newExercise.duration}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Calo (kcal)</label>
                    <input
                      type="number"
                      name="calories"
                      value={newExercise.calories}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Số set</label>
                    <input
                      type="number"
                      name="sets"
                      value={newExercise.sets}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Số reps</label>
                    <input
                      type="text"
                      name="reps"
                      placeholder="VD: 8-12 reps"
                      value={newExercise.reps}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Nghỉ (rest)</label>
                    <input
                      type="text"
                      name="rest"
                      placeholder="VD: 60 giây"
                      value={newExercise.rest}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Tạ (weight)</label>
                    <input
                      type="text"
                      name="weight"
                      placeholder="VD: 50kg, Bodyweight"
                      value={newExercise.weight}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Nút bấm của form */}
            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.closeModalBtn}
                onClick={() => setShowAddModal(false)}
              >
                Hủy
              </button>
              <button type="submit" className={styles.startBtn}>
                Lưu bài tập
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Exercises</h1>
        <button
          className={styles.addButton}
          onClick={() => setShowAddModal(true)}
        >
          <span className={styles.addIcon}>+</span>
          Add Exercise
        </button>
      </div>

      {/* Filters Section */}
      <div className={styles.filtersSection}>
        <div className={styles.leftFilters}>
          <div className={styles.searchBox}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM18 18l-4-4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <input
              type="text"
              placeholder="Search for exercise"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className={styles.filterSelect}
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <select
            className={styles.filterSelect}
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
          >
            <option value="All">Mọi độ khó</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>

          <select
            className={styles.filterSelect}
            value={selectedMuscleGroup}
            onChange={(e) => setSelectedMuscleGroup(e.target.value)}
          >
            <option value="All">Mọi nhóm cơ</option>
            <option value="Full Body">Full Body</option>
            <option value="Core">Core</option>
            <option value="Upper Body">Upper Body</option>
            <option value="Legs">Legs</option>
          </select>

          <select
            className={styles.filterSelect}
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
          >
            <option>This Week</option>
            <option>Last Week</option>
            <option>This Month</option>
            <option>Last Month</option>
          </select>
        </div>

        <div className={styles.rightFilters}>
          <button className={styles.iconButton}>
            <span>☰</span>
            Popular
          </button>
        </div>
      </div>

      {/* Lưới các bài tập */}
      <div className={styles.workoutGrid}>
        {currentExercises.map((exercise) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            onPlayVideo={setSelectedVideo}
            isFavorite={favorites.includes(exercise.id)}
            onToggleFavorite={toggleFavorite}
          />
        ))}
      </div>

      {/* Pagination */}
      <div className={styles.pagination}>
        <div className={styles.paginationInfo}>
          Showing
          <select
            className={styles.perPageSelect}
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={10}>10</option>
            <option value={12}>12</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          out of {filteredExercises.length}
        </div>
        <div className={styles.paginationControls}>
          <button
            className={styles.pageBtn}
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            1
          </button>
          <button
            className={styles.pageBtn}
            onClick={() => setCurrentPage(2)}
            disabled={currentPage === 2 || totalPages < 2}
          >
            2
          </button>
          <button
            className={styles.pageBtn}
            onClick={() => setCurrentPage(3)}
            disabled={currentPage === 3 || totalPages < 3}
          >
            3
          </button>
          <button
            className={styles.pageBtn}
            onClick={() =>
              setCurrentPage(Math.min(currentPage + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            ›
          </button>
        </div>
      </div>

      {/* [SỬA LỖI 1] Đảm bảo Banner nằm TRONG return() */}
      <div className={styles.promoBanner}>
        <div className={styles.promoContent}>
          <div className={styles.promoVeggies}>🥬</div>
          <div className={styles.promoText}>
            <p className={styles.promoTitle}>Start your health journey</p>
            <p className={styles.promoSubtitle}>
              with a <strong>FREE 1-month</strong>
            </p>
            <p className={styles.promoSubtitle}>access to Nutrigo</p>
          </div>
        </div>
        <button className={styles.claimBtn}>Claim Now!</button>
      </div>
    </div> // <- Đóng thẻ styles.container
  ); // <- Đóng return()
} // <- Đóng function
