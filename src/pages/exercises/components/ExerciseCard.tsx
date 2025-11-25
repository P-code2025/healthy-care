import React from "react";
// [ĐÃ SỬA] Import 'Exercise' từ file cha, nơi nó đã được "export"
import type { Exercise } from "../ExercisesNew";
import styles from "./ExerciseCard.module.css";
// [ĐÃ SỬA] Import icon chính xác: 'LuSignal' thay cho 'LuBarChart'
import { LuClock, LuFlame, LuSignal } from "react-icons/lu";

interface Props {
  exercise: Exercise;
  onPlayVideo: (exercise: Exercise) => void; // Hàm gọi khi bấm xem video
  isFavorite: boolean; // [THÊM MỚI] Trạng thái yêu thích
  onToggleFavorite: (id: string) => void; // [THÊM MỚI] Hàm xử lý yêu thích
}

const ExerciseCard: React.FC<Props> = ({
  exercise,
  onPlayVideo,
  isFavorite,
  onToggleFavorite,
}) => {
  // [THÊM MỚI] Hàm xử lý nút yêu thích (ngăn modal mở)
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Ngăn sự kiện click nổi bọt lên thẻ cha
    onToggleFavorite(exercise.id);
  };

  // [THÊM MỚI] Hàm xử lý nút Bắt đầu (ngăn modal mở)
  const handleStartClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Ngăn sự kiện click nổi bọt lên thẻ cha
    // Mở video modal
    onPlayVideo(exercise);
  };

  return (
    // [UI MỚI] Click vào thẻ cha để mở video
    <div className={styles.card} onClick={() => onPlayVideo(exercise)}>
      {/* 1. THUMBNAIL VIDEO */}
      <div className={styles.thumbnail}>
        <img src={exercise.thumbnailUrl} alt={exercise.name} />

        {/* [UI MỚI] Overlay trạng thái (giống trong ảnh) */}
        {exercise.status === "Completed" && (
          <div className={styles.completedBadge}>✓</div>
        )}
        {exercise.status === "In Progress" && (
          <div className={styles.inProgressBadge}>33% hoàn thành</div>
        )}
      </div>

      {/* 2. NỘI DUNG THẺ */}
      <div className={styles.content}>
        <h3 className={styles.title}>{exercise.name}</h3>

        {/* [UI MỚI] Info line với icons */}
        <div className={styles.info}>
          <span>
            <LuClock size={14} /> {exercise.duration} phút
          </span>
          <span>
            <LuFlame size={14} /> {exercise.calories} kcal
          </span>
          <span className={styles.difficulty}>
            {/* [ĐÃ SỬA] Dùng icon LuSignal */}
            <LuSignal size={14} /> {exercise.difficulty}
          </span>
        </div>

        {/* [UI MỚI] Khu vực nút bấm */}
        <div className={styles.actions}>
          <button
            className={`${styles.favoriteBtn} ${isFavorite ? styles.favorited : ""
              }`}
            onClick={handleFavoriteClick} // Click để yêu thích
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>

          <button className={styles.startBtn} onClick={handleStartClick}>
            Bắt đầu
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExerciseCard;
