# AI Feedback and Evaluation

## Feedback Loop

Use the /api/ai-feedback endpoint to capture user votes/comments for each generated plan. The client stores the plan metadata (intensity, exercises, calories), then posts { planId, rating, comment }. The backend appends the entry to Prisma's AiFeedback table (plan identifier + optional foreign key to the generated plan).

## Enhanced Data Source

The AI summarizer now combines: (1) the latest food diary entries via oodDiaryApi.list, (2) onboarding profile (gender, age, goal weight), and (3) recent plan history. To enrich recognition accuracy, the food-analysis flow first tries Open Food Facts (barcode), then falls back to the AI recognizer, and cross-references the meals library before saving.

## Continuous Evaluation

A nightly job (see scripts/ai-eval.ts) replays a fixed set of benchmark contexts (low-cal day, injury, vegan, high performance) and stores the outputs in i_evaluation_runs. The dashboard shows completion rate, average intensity, and out-of-range burn warnings. Use 
pm run ai:eval locally to reproduce the suite and inspect JSON artifacts in eports/ai-eval.

