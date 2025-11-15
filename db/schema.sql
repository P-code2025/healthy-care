-- Lệnh SQL để tạo Bảng Giáo án (Thư viện bài tập)
CREATE TABLE Workouts (
    Id VARCHAR(50) PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Description TEXT,
    VideoUrl VARCHAR(512),
    ThumbnailUrl VARCHAR(512),
    
    -- Lưu mảng dưới dạng JSON string (ví dụ: '["Full Body", "Cardio"]')
    MuscleGroups TEXT, 
    
    Difficulty VARCHAR(20) CHECK (Difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
    Duration INT, -- Thời lượng (phút)
    Calories INT, -- Calo (kcal)
    Sets INT,
    Reps VARCHAR(100),
    Rest VARCHAR(100),
    Weight VARCHAR(100)
);