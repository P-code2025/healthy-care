// src/pages/exercies/workoutPlans.ts

/**
 * INTERFACE CHUẨN HUẤN LUYỆN VIÊN
 */
export interface ExerciseInPlan {
  exerciseId: string;
  name: string;
  sets: number;
  reps: string; // VD: "12 reps" | "45s"
  rest: string; // VD: "60s"
  videoUrl: string;
  // Các thông số chuyên sâu (optional)
  tempo?: string; // Nhịp độ (VD: 3-0-1-0)
  rpe?: string; // Mức độ gắng sức (1-10)
  tips?: string; // Lời khuyên kỹ thuật
}

export interface WorkoutPlan {
  id: string;
  title: string;
  description?: string;
  duration: number;
  calories: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  goal: "Strength" | "Fat Loss" | "Endurance" | "Flexibility" | "Mobility";
  thumbnail: string;
  videoUrl?: string;
  exercises: ExerciseInPlan[];
  progress?: number;
  isSaved: boolean;
  tags?: string[];
}

// === DỮ LIỆU GIÁO ÁN CHI TIẾT (ĐÃ CẬP NHẬT) ===
export const SAMPLE_WORKOUT_PLANS: WorkoutPlan[] = [
  // -------------------------------------------------------
  // 1. NHÓM KHỞI ĐỘNG & PHỤC HỒI (YOGA/STRETCH)
  // -------------------------------------------------------
  {
    id: "YOGA_MORNING_FLOW",
    title: "Morning Yoga Flow",
    description:
      "Đánh thức cơ thể, tăng linh hoạt với chuỗi Vinyasa nhẹ nhàng. Tập trung vào cột sống và hông.",
    duration: 20,
    calories: 120,
    difficulty: "Beginner",
    goal: "Flexibility",
    thumbnail: "https://img.youtube.com/vi/Pv6NrM7fqHY/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/watch?v=4TLHLNX65-4",
    isSaved: true,
    tags: ["Yoga", "Recovery", "Morning"],
    exercises: [
      {
        exerciseId: "yg_01",
        name: "[Warm-up] Child's Pose (Tư thế em bé)",
        sets: 1,
        reps: "2 phút",
        rest: "0s",
        rpe: "1/10",
        tips: "Mở rộng đầu gối, ép ngực xuống sàn, hít thở sâu bằng bụng để thư giãn thắt lưng.",
        videoUrl: "",
      },
      {
        exerciseId: "yg_02",
        name: "[Warm-up] Cat-Cow Stretch",
        sets: 2,
        reps: "10 lần",
        rest: "0s",
        tempo: "Slow",
        rpe: "2/10",
        tips: "Hít vào khi võng lưng ngước nhìn lên, thở ra khi cong lưng cuộn tròn.",
        videoUrl: "",
      },
      {
        exerciseId: "vinyasa",
        name: "[Main] Chuỗi Vinyasa Flow",
        sets: 3,
        reps: "Flow",
        rest: "30s",
        rpe: "4/10",
        tips: "Di chuyển chậm rãi: Plank -> Chaturanga -> Upward Dog -> Downward Dog.",
        videoUrl: "https://www.youtube.com/watch?v=4TLHLNX65-4",
      },
      {
        exerciseId: "yg_04",
        name: "[Cool-down] Forward Fold (Gập người)",
        sets: 1,
        reps: "2 phút",
        rest: "0s",
        rpe: "2/10",
        tips: "Thả lỏng cổ và vai hoàn toàn. Có thể trùng nhẹ gối nếu căng gân kheo.",
        videoUrl: "",
      },
    ],
  },
  {
    id: "FULL_BODY_STRETCH",
    title: "Full Body Stretch",
    description:
      "Giãn cơ toàn thân sau tập hoặc vào ngày nghỉ để giảm đau mỏi.",
    duration: 15,
    calories: 60,
    difficulty: "Beginner",
    goal: "Flexibility",
    thumbnail: "https://img.youtube.com/vi/i6TzP2COtow/maxresdefault.jpg",
    videoUrl: "https://youtu.be/i6TzP2COtow?si=aBvStrwshQpYj0vv",
    isSaved: false,
    tags: ["Stretching", "Recovery"],
    exercises: [
      {
        exerciseId: "str_01",
        name: "Neck & Shoulder Rolls",
        sets: 1,
        reps: "2 phút",
        rest: "0s",
        rpe: "1/10",
        tips: "Xoay cổ nhẹ nhàng, không ngửa cổ quá sâu ra sau.",
        videoUrl: "",
      },
      {
        exerciseId: "str_02",
        name: "Standing Quad Stretch",
        sets: 2,
        reps: "30s/chân",
        rest: "0s",
        rpe: "3/10",
        tips: "Giữ thăng bằng hoặc bám vào tường. Kéo gót chân chạm mông.",
        videoUrl: "",
      },
      {
        exerciseId: "str_03",
        name: "Hamstring Stretch",
        sets: 2,
        reps: "30s/chân",
        rest: "0s",
        rpe: "3/10",
        tips: "Gập người từ hông, giữ lưng thẳng đến khi cảm thấy căng đùi sau.",
        videoUrl: "",
      },
      {
        exerciseId: "stretch_routine",
        name: "Deep Squat Hold (Giãn hông)",
        sets: 1,
        reps: "60s",
        rest: "0s",
        videoUrl: "https://www.youtube.com/watch?v=Eogrw-I5-A8",
        tips: "Ngồi xổm sâu, dùng khuỷu tay đẩy nhẹ hai đầu gối ra ngoài.",
      },
    ],
  },

  // -------------------------------------------------------
  // 2. NHÓM SỨC MẠNH (STRENGTH/GYM)
  // -------------------------------------------------------
  {
    id: "FULL_BODY_STRENGTH",
    title: "Full Body Strength",
    description:
      "Phát triển sức mạnh toàn diện với tạ đơn. Bài tập chia theo nhóm cơ lớn.",
    duration: 45,
    calories: 320,
    difficulty: "Intermediate",
    goal: "Strength",
    thumbnail: "https://img.youtube.com/vi/aclHkVaku9U/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/watch?v=_jGebGZnYrU",
    isSaved: false,
    tags: ["Dumbbells", "Compound"],
    exercises: [
      {
        exerciseId: "warmup_01",
        name: "[Warm-up] Arm Circles & Air Squats",
        sets: 2,
        reps: "20 reps",
        rest: "0s",
        rpe: "3/10",
        tips: "Làm nóng khớp vai và khớp gối trước khi vào bài chính.",
        videoUrl: "",
      },
      {
        exerciseId: "squat",
        name: "[Main] Dumbbell Goblet Squats",
        sets: 4,
        reps: "12",
        rest: "90s",
        tempo: "3-1-1-0", // Xuống 3s, Giữ 1s, Lên 1s
        rpe: "8/10",
        tips: "Giữ lưng thẳng, xuống sâu cho đến khi đùi song song sàn. Gồng bụng chặt.",
        videoUrl: "",
      },
      {
        exerciseId: "rdl",
        name: "[Main] Dumbbell RDL",
        sets: 4,
        reps: "12",
        rest: "90s",
        tempo: "3-0-1-0",
        rpe: "8/10",
        tips: "Đẩy hông ra sau tối đa, cảm nhận căng đùi sau. Không cong lưng dưới.",
        videoUrl: "",
      },
      {
        exerciseId: "press",
        name: "[Main] Shoulder Press",
        sets: 3,
        reps: "10-12",
        rest: "60s",
        tempo: "2-0-1-0",
        rpe: "8.5/10",
        tips: "Không ngả lưng quá nhiều. Đẩy tạ thẳng qua đầu, khóa tay ở đỉnh.",
        videoUrl: "",
      },
      {
        exerciseId: "row",
        name: "[Main] Bent-over Row",
        sets: 3,
        reps: "12",
        rest: "60s",
        tempo: "2-0-1-1",
        rpe: "8/10",
        tips: "Kéo tạ về phía hông, ép chặt hai bả vai lại với nhau.",
        videoUrl: "",
      },
      {
        exerciseId: "pushup",
        name: "[Finisher] Push-ups",
        sets: 3,
        reps: "Failure", // Tập đến khi không nổi nữa
        rest: "60s",
        rpe: "9/10",
        tips: "Thân người thẳng như tấm ván. Hạ ngực gần chạm sàn.",
        videoUrl: "",
      },
    ],
  },
  {
    id: "UPPER_BODY_POWER",
    title: "Upper Body Power",
    description: "Tối ưu sức mạnh thân trên (Ngực, Lưng, Vai, Tay).",
    duration: 25,
    calories: 280,
    difficulty: "Advanced",
    goal: "Strength",
    thumbnail: "https://img.youtube.com/vi/IODxDxX7oi4/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/watch?v=c6w8ZyEioZM",
    isSaved: false,
    tags: ["Upper Body", "Power"],
    exercises: [
      {
        exerciseId: "push_heavy",
        name: "[Push] Dumbbell Floor Press",
        sets: 4,
        reps: "8-10",
        rest: "90s",
        tempo: "2-1-1-0",
        rpe: "8.5/10",
        tips: "Hạ khuỷu tay chạm sàn nhẹ rồi đẩy mạnh lên. Tập trung vào ngực.",
        videoUrl: "",
      },
      {
        exerciseId: "pull_heavy",
        name: "[Pull] One Arm Row",
        sets: 4,
        reps: "10/side",
        rest: "90s",
        tempo: "2-0-1-0",
        rpe: "8.5/10",
        tips: "Dùng ghế hoặc vật tựa để giữ lưng thẳng. Không xoay người khi kéo.",
        videoUrl: "",
      },
      {
        exerciseId: "push_iso",
        name: "[Push] Lateral Raises (Bay vai)",
        sets: 3,
        reps: "15",
        rest: "45s",
        tempo: "2-0-2-0",
        rpe: "9/10",
        tips: "Dẫn động bằng khuỷu tay. Không nhún vai khi nâng tạ.",
        videoUrl: "",
      },
      {
        exerciseId: "pull_iso",
        name: "[Pull] Bicep Curls",
        sets: 3,
        reps: "15",
        rest: "45s",
        tempo: "2-0-2-0",
        rpe: "9/10",
        tips: "Giữ cố định khuỷu tay sát thân người. Chỉ di chuyển cẳng tay.",
        videoUrl: "",
      },
    ],
  },

  // -------------------------------------------------------
  // 3. NHÓM ĐỐT MỠ & TIM MẠCH (HIIT/CARDIO)
  // -------------------------------------------------------
  {
    id: "HIIT_FAT_LOSS",
    title: "HIIT Fat Loss - No Repeat",
    description:
      "Bài tập cường độ cao không lặp lại, tối đa hóa đốt mỡ trong thời gian ngắn.",
    duration: 20,
    calories: 350,
    difficulty: "Intermediate",
    goal: "Fat Loss",
    thumbnail: "https://img.youtube.com/vi/Pv6NrM7fqHY/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/watch?v=zJKtwow2oBc",
    isSaved: true,
    tags: ["HIIT", "Cardio", "No Equipment"],
    exercises: [
      {
        exerciseId: "h0",
        name: "[Warm-up] Jog in Place (Chạy tại chỗ)",
        sets: 1,
        reps: "60s",
        rest: "10s",
        rpe: "4/10",
        tips: "Chạy nhẹ nhàng, hít thở đều để làm nóng cơ thể.",
        videoUrl: "",
      },
      {
        exerciseId: "h1",
        name: "Jumping Jacks",
        sets: 1,
        reps: "45s",
        rest: "15s",
        tempo: "Fast",
        rpe: "7/10",
        tips: "Tiếp đất nhẹ nhàng bằng mũi chân. Tay vung hết biên độ.",
        videoUrl: "",
      },
      {
        exerciseId: "h2",
        name: "Mountain Climbers",
        sets: 1,
        reps: "45s",
        rest: "15s",
        tempo: "Fast",
        rpe: "8/10",
        tips: "Giữ vai thẳng hàng cổ tay. Siết bụng, kéo gối liên tục.",
        videoUrl: "",
      },
      {
        exerciseId: "h3",
        name: "Burpees",
        sets: 1,
        reps: "45s",
        rest: "15s",
        tempo: "Explosive",
        rpe: "9.5/10",
        tips: "Bài tập quan trọng nhất. Cố gắng không nghỉ giữa hiệp. Tiếp đất bằng cả bàn chân.",
        videoUrl: "",
      },
      {
        exerciseId: "h4",
        name: "High Knees (Chạy nâng cao đùi)",
        sets: 1,
        reps: "45s",
        rest: "15s",
        tempo: "Max Speed",
        rpe: "9/10",
        tips: "Nâng đùi vuông góc với thân người. Đánh tay mạnh.",
        videoUrl: "",
      },
      {
        exerciseId: "h_cool",
        name: "[Cool-down] Walk & Deep Breath",
        sets: 1,
        reps: "60s",
        rest: "0s",
        rpe: "2/10",
        tips: "Đi bộ nhẹ nhàng, hít sâu bằng mũi thở ra bằng miệng để hạ nhịp tim.",
        videoUrl: "",
      },
    ],
  },
  {
    id: "PLYO_HIIT",
    title: "Plyometric HIIT",
    description:
      "Tăng sức mạnh bùng nổ và đốt calo cực nhanh với các bài bật nhảy.",
    duration: 25,
    calories: 430,
    difficulty: "Advanced",
    goal: "Fat Loss",
    thumbnail: "https://img.youtube.com/vi/x84r0G2gYII/maxresdefault.jpg",
    videoUrl: "https://youtu.be/x84r0G2gYII?si=AR6_Oc_8uoQt18mC",
    isSaved: false,
    tags: ["Plyometric", "Jump", "Advanced"],
    exercises: [
      {
        exerciseId: "p_warm",
        name: "[Warm-up] Butt Kicks & High Knees",
        sets: 2,
        reps: "30s each",
        rest: "0s",
        rpe: "5/10",
        tips: "Khởi động kỹ khớp cổ chân và gối trước khi bật nhảy.",
        videoUrl: "",
      },
      {
        exerciseId: "p1",
        name: "Jump Squats",
        sets: 3,
        reps: "30s",
        rest: "30s",
        tempo: "Explosive",
        rpe: "9/10",
        tips: "Xuống hít sâu, bật mạnh thở ra. Tiếp đất bằng mũi chân rồi chuyển sang gót.",
        videoUrl: "",
      },
      {
        exerciseId: "p2",
        name: "Lunge Jumps",
        sets: 3,
        reps: "30s",
        rest: "30s",
        tempo: "Explosive",
        rpe: "9.5/10",
        tips: "Giữ thăng bằng, đổi chân nhanh trên không. Rất mỏi đùi nhưng hãy cố gắng.",
        videoUrl: "",
      },
      {
        exerciseId: "p3",
        name: "Skaters (Nhảy trượt băng)",
        sets: 3,
        reps: "45s",
        rest: "15s",
        tempo: "Side-to-side",
        rpe: "8/10",
        tips: "Nhảy sang ngang xa nhất có thể. Chân sau đưa chéo về phía sau.",
        videoUrl: "",
      },
    ],
  },

  // -------------------------------------------------------
  // 4. NHÓM CƠ LÕI (CORE/ABS)
  // -------------------------------------------------------
  {
    id: "PLANK_BEGINNER",
    title: "Planks For Beginners",
    description: "Xây dựng cơ lõi vững chắc với các biến thể Plank cơ bản.",
    duration: 15,
    calories: 100,
    difficulty: "Beginner",
    goal: "Strength",
    thumbnail: "https://img.youtube.com/vi/ASdvN_XEl_c/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/watch?v=ASdvN_XEl_c",
    isSaved: false,
    tags: ["Core", "Abs"],
    exercises: [
      {
        exerciseId: "plank_std",
        name: "Standard Plank",
        sets: 2,
        reps: "30s",
        rest: "30s",
        rpe: "7/10",
        tips: "Giữ lưng thẳng, không võng lưng. Gồng mông và bụng.",
        videoUrl: "",
      },
      {
        exerciseId: "plank_side",
        name: "Side Plank (Trái/Phải)",
        sets: 2,
        reps: "20s/side",
        rest: "30s",
        rpe: "7/10",
        tips: "Đẩy hông lên cao, cơ thể tạo thành đường thẳng.",
        videoUrl: "",
      },
      {
        exerciseId: "bird_dog",
        name: "Bird-Dog",
        sets: 2,
        reps: "10 reps/side",
        rest: "30s",
        tempo: "Controlled",
        rpe: "5/10",
        tips: "Giơ tay trái chân phải, giữ thăng bằng 2s rồi đổi bên.",
        videoUrl: "",
      },
    ],
  },
  {
    id: "CORE_CRUSHER",
    title: "Core & Abs Crusher",
    description: "Thử thách săn chắc vùng bụng và giảm mỡ thừa.",
    duration: 15,
    calories: 150,
    difficulty: "Intermediate",
    goal: "Strength",
    thumbnail: "https://img.youtube.com/vi/MiGCfVrA388/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/watch?v=MiGCfVrA388",
    isSaved: false,
    tags: ["Abs", "Six Pack"],
    exercises: [
      {
        exerciseId: "c1",
        name: "Crunches (Gập bụng)",
        sets: 3,
        reps: "20",
        rest: "15s",
        tempo: "1-0-1-0",
        rpe: "6/10",
        tips: "Chỉ nhấc vai khỏi sàn, ép chặt bụng thở hết hơi ra.",
        videoUrl: "",
      },
      {
        exerciseId: "c2",
        name: "Leg Raises (Nâng chân)",
        sets: 3,
        reps: "15",
        rest: "15s",
        tempo: "2-0-2-0",
        rpe: "8/10",
        tips: "Giữ thắt lưng dán chặt xuống sàn. Hạ chân chậm để kiểm soát.",
        videoUrl: "",
      },
      {
        exerciseId: "c3",
        name: "Russian Twists",
        sets: 3,
        reps: "40 (20/side)",
        rest: "15s",
        tempo: "Fast",
        rpe: "7/10",
        tips: "Ngả người ra sau 45 độ, xoay vai sang hai bên. Mắt nhìn theo tay.",
        videoUrl: "",
      },
      {
        exerciseId: "c_stretch",
        name: "[Cool-down] Cobra Stretch",
        sets: 1,
        reps: "45s",
        rest: "0s",
        rpe: "2/10",
        tips: "Nằm sấp, chống tay đẩy ngực lên để giãn cơ bụng.",
        videoUrl: "",
      },
    ],
  },
];
