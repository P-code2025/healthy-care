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


## Food image dataset refresh checklist

Use this whenever you need to repopulate the realistic meal dataset (photos + Prisma records):

1. **Download curated food photos + manifest**
   ```powershell
   cd D:/Codespace/NAVER/healthy-care
   npm run assets:food-images
   ```
   - Pulls 21 deterministic images into `public/images/food-diary`.
   - Generates/overwrites `public/images/food-diary/manifest.json` containing filenames + attribution. Safe to run multiple times; existing files are replaced.

2. **Apply Prisma schema updates (imageUrl/imageAttribution)**
   ```powershell
   cd D:/Codespace/NAVER/healthy-care
   npm run prisma:migrate
   ```
   - Ensures the `FoodLog` table exposes `imageUrl` and `imageAttribution` columns used by the UI/API.
   - Use `-- --name your_label` if you are adding new migrations.

3. **Reseed database with enriched food logs**
   ```powershell
   cd D:/Codespace/NAVER/healthy-care
   npm run db:seed
   ```
   - Imports the updated `db.json` sample data where each log references a local `/images/food-diary/...` path plus attribution text.
   - Rerun after editing `db.json` to confirm the app reflects new meals.

4. **Verify in the Food Diary UI**
   - Start the dev server (`npm run dev`).
   - Open `http://localhost:5173/food-diary` (route name may differ if protected behind auth).
   - Check that the “Photo” column shows thumbnails; click one to confirm the full-size modal and attribution text render correctly.

5. **Troubleshooting notes**
   - `npm run build` currently fails because of existing TypeScript errors in unrelated files (`src/api/clovax/client.ts`, `src/components/Header.tsx`, `src/pages/exercies/ExercisesNew.tsx`, onboarding steps, etc.). Fix those before expecting a clean production build.
   - If thumbnails don’t appear, confirm the manifest entry path (should start with `/images/food-diary/`) matches what `db.json` stores in `image_url`.

