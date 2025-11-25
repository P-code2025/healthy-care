# Nutrigo - AI-Powered Smart Health Assistant

> **NAVER AI HACKATHON 2025** - Team PTIT Chiến

## 🏆 Team Members

| Name | GitHub | Role |
|------|--------|------|
| **Đỗ Quốc Dũng** | [@Doquocdung1609](https://github.com/Doquocdung1609) | Backend Developer - Node.js/Express backend, Clova AI integration, PostgreSQL schema design, AI data pipeline |
| **Nguyễn Hà My** | [@nghmyyy](https://github.com/nghmyyy) | Frontend Developer - Responsive UI in ReactJS, reusable components, user flows optimization |
| **Phạm Nhật Khánh** | [@nichikei](https://github.com/nichikei) | Backend Developer - REST APIs, Clova AI services integration, database optimization |
| **Nguyễn Thành Phú** | [@P-code2025](https://github.com/P-code2025) | Frontend Developer - ReactJS layouts, core UI components, user interaction features |

## 📋 About Nutrigo

Nutrigo is an AI-powered smart health assistant that helps users maintain a healthy lifestyle through intelligent automation and personalized recommendations.

### Core Capabilities
- 📸 **Meal Recognition** - Automatically recognizes meals from photos and analyzes nutritional values
- 🍽️ **Personalized Meal Plans** - Generates customized 7-day meal plans based on individual goals and body data
- 💪 **Workout Plans** - Creates tailored exercise routines aligned with fitness objectives
- 📊 **Activity Tracking** - Monitors daily health activities and progress
- 🤖 **AI Health Assistant** - Provides real-time health advice and answers through conversational AI
- 🎯 **Goal Management** - Supports effective weight management and fitness goal achievement

## ✨ Key Features

### 🤖 AI-Powered Intelligence
- **CLOVA HyperCLOVA X Integration** - Advanced meal planning with HCX-007 model
- **Smart Food Recognition** - Automatic nutrition analysis from food images using CLOVA OCR
- **Context-Aware Chat** - Intelligent health consultations with personalized advice
- **Adaptive Recommendations** - Dynamic meal and exercise suggestions based on user progress

### 📊 Comprehensive Health Tracking
- **Food Diary** - Detailed nutrition logging with macro tracking (calories, protein, carbs, fat, sugar)
- **Exercise Library** - 50+ professional workout videos categorized by difficulty and muscle groups
- **Progress Dashboard** - Visual analytics for weight, body measurements, and goal achievement
- **Calendar Integration** - Unified view of meals, workouts, and health appointments

### 💪 User-Centric Design
- Modern, responsive UI optimized for all devices
- Smooth animations and intuitive navigation
- Real-time data synchronization
- Offline-capable with localStorage caching
- Multi-language support (English/Vietnamese)

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for blazing-fast development
- **React Router** for seamless navigation
- **Recharts** for interactive data visualization
- **React Toastify** for user notifications
- **date-fns** for date manipulation

### Backend
- **Node.js** with Express framework
- **PostgreSQL** for robust data storage
- **Prisma ORM** for type-safe database access
- **JWT** for secure authentication
- **bcrypt** for password hashing

### AI Integration
- **CLOVA HyperCLOVA X (HCX-007)** - Advanced meal planning and health recommendations
- **CLOVA Studio** - Conversational AI for health assistant
- **CLOVA OCR** - Food image recognition and nutrition analysis

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- NAVER CLOVA API credentials

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-team/nutrigo.git
cd nutrigo
```

2. **Install dependencies**
```bash
# Frontend dependencies
npm install

# Backend dependencies
cd server
npm install
```

3. **Configure environment variables**

Create `.env` in `/server`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/nutrigo"
JWT_SECRET="your-secret-key"
CLOVA_API_KEY="your-clova-api-key"
CLOVA_API_URL="https://clovastudio.stream.ntruss.com/v3/chat-completions/HCX-007"
```

4. **Setup database**
```bash
cd server
npx prisma migrate dev
npx prisma generate
```

5. **Run the application**
```bash
# Terminal 1: Backend
cd server
npm start

# Terminal 2: Frontend
npm run dev
```

Access at `http://localhost:5173`

## 📱 Feature Highlights

### AI Meal Planning
- Personalized 7-day meal plans
- Considers health goals, dietary restrictions, and allergies
- Automatic calorie and macro calculation
- Daily nutrition targets based on user profile

### Smart Food Diary
- Photo-based meal logging with AI recognition
- Automatic nutrition calculation
- Visual macro tracking charts
- Historical data analysis

### Exercise Management
- Video-guided workout library
- Progress tracking and favorites
- Difficulty-based filtering
- Muscle group categorization

### Health Analytics
- Weight and body measurement trends
- Visual progress charts
- Goal achievement monitoring
- Photo comparison timeline

## 🔐 Security Features

- JWT-based authentication
- Secure password hashing with bcrypt
- SQL injection protection via Prisma ORM
- CORS configuration
- Input validation and sanitization

## 📄 License

Developed for NAVER AI HACKATHON 2025

## 🙏 Acknowledgments

- **NAVER Cloud Platform** for CLOVA AI services
- **NAVER AI HACKATHON 2025** organizing committee
- Open-source community and contributors

---

**Team PTIT Chiến** - NAVER AI HACKATHON 2025

*Empowering healthier lifestyles through AI innovation*
