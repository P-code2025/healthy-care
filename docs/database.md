## PostgreSQL setup

1. **Start PostgreSQL locally**  
   - Native: install PostgreSQL ≥ 14 and create a database named `healthy_care`.  
   - Docker:  
     ```bash
     docker run --name healthy-care-db \
       -e POSTGRES_PASSWORD=postgres \
       -e POSTGRES_USER=postgres \
       -e POSTGRES_DB=healthy_care \
       -p 5432:5432 -d postgres:16
     ```

2. **Configure environment variable**  
   - Copy `.env.example` → `.env` and edit `DATABASE_URL`.
   - Format: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public`.

3. **Install dependencies (already in package.json)**  
   ```bash
   npm install
   ```

4. **Run Prisma migrate & seed**  
   ```bash
   npm run prisma:migrate -- --name init
   npm run db:seed
   ```

   These commands will:
   - create/update tables defined in `prisma/schema.prisma`
   - import the sample data stored in `db.json` into PostgreSQL

5. **Generate the Prisma Client (optional when not running migrate)**  
   ```bash
   npm run prisma:generate
   ```

6. **Use inside the app**  
   - Import the client where you need server-side data access:  
     ```ts
     import { PrismaClient } from "@prisma/client";
     const prisma = new PrismaClient();
     ```
   - Example query to fetch food logs with relations:  
     ```ts
     const logs = await prisma.foodLog.findMany({
       where: { userId },
       include: { user: true },
       orderBy: { eatenAt: "desc" },
     });
     ```

## Schema overview

| Model            | Purpose                                                                    |
|------------------|----------------------------------------------------------------------------|
| `User`           | Core profile (email, biometric info, activity level, exercise prefs).      |
| `CalendarEvent`  | Events created from the calendar UI, including linked module references.   |
| `FoodLog`        | Entries from Food Diary / AI recognition (macros + notes).                 |
| `WorkoutLog`     | Exercise history (duration, calories, AI suggested flag).                  |
| `AiSuggestion`   | Nutrition/workout advice returned by the AI services (JSON payload stored).|
| `AiFeedback`     | Stores user ratings/comments plus the serialized AI plan payload for feedback loops.|

Enums:  
- `CalendarCategory`: `meal`, `activity`, `appointment`.  
- `CalendarModule`: `meal_plan`, `exercises`, `food_diary`, `messages`.  
- `SuggestionType`: `nutrition`, `workout`.

Every table has timestamps so you can build timelines or analytics easily. Add more fields or relations by editing `prisma/schema.prisma` and running a new migration.***

