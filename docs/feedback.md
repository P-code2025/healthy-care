# AI Feedback and Evaluation

## Feedback Loop
- Use POST /api/ai-feedback to capture { planSummary, planPayload, rating, comment } after a user reviews a plan.
- The backend stores these ratings in the AiFeedback table so prompts can include real sentiment.
- GET /api/ai-feedback?limit=20 lets QA inspect recent feedback for audit purposes.

## Enhanced Data Source
- GET /api/ai/context aggregates the profile (age, gender, biometrics, goals), latest food diary entries, and recent feedback.
- The planner and evaluation scripts consume this endpoint to avoid duplicating aggregation logic on the client.
- Food analysis still prefers Open Food Facts (barcode), only falling back to AI recognition when a lookup fails.

## Continuous Evaluation
- Run 
pm run ai:eval to execute scripts/ai-eval.ts, which replays predefined scenarios (low-cal, maintenance, high energy) through the planner.
- Each run produces eports/ai-eval/run-<timestamp>.json containing the plan plus warnings (out-of-range burn, unexpected intensity, etc.).
- Attach the script to CI or manual QA to catch prompt regressions before shipping.
