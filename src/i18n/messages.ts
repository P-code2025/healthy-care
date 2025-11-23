export const messages = {
  common: {
    loadingUser: "Loading your profile...",
    goBack: "Go back",
    saving: "Saving...",
    saveChanges: "Save changes",
  },
  onboarding: {
    verificationError:
      "Error: Unable to verify the saved information. Please try again.",
    saveError: "We couldn't save your information. Please try again.",
  },
  settings: {
    saveSuccess: "Profile saved successfully!",
    saveError: "Failed to save your changes.",
  },
  errors: {
    default: "Something went wrong. Please try again.",
    diaryLoad: "Couldn't load today's diary entries.",
    imageAnalysis: "We couldn't analyze that photo. Please try again.",
    workoutPlan: "Unable to generate a workout plan. Please try again later.",
    incompleteProfile:
      "Please provide your profile details for accurate recommendations.",
  },
  aiChat: {
    headerTitle: "AI Expert",
    headerSubtitle: "Meal analysis & personalized workouts",
    welcomeTitle: "Hi! I'm your AI coach",
    welcomeSubtitle: "Share a meal photo or ask for a workout plan.",
    inputPlaceholder: "Ask about calories, workouts, etc.",
    sendLabel: "Send",
    analyzingImage: "Analyzing your meal photo...",
    analysisFailed: "Không thể nhận diện đồ ăn",
    diarySaveSuccess: "Saved to Food Diary!",
    defaultHelper:
      "I can analyze your meals or create a training plan. Snap a picture or ask me!",
    missingProfilePrompt:
      "Please enter your personal details so I can personalize the workout.",
    todayCaloriesSummary:
      "You've consumed **{calories} kcal** today ({diff} kcal compared to the goal of {goal} kcal).",
    todayCaloriesAdviceAbove:
      "You're already above your goal. Consider adding a gentle walk or stretching session.",
    todayCaloriesAdviceBelow:
      "You still have room for a small snack like yogurt or a smoothie.",
    profileFormTitle: "Personal details",
    profileAgePlaceholder: "Age",
    profileWeightPlaceholder: "Weight (kg)",
    profileHeightPlaceholder: "Height (cm)",
    profileGenderLabel: "Gender",
    profileGenderMale: "Male",
    profileGenderFemale: "Female",
    profileGoalLabel: "Goal",
    profileGoalLose: "Lose weight",
    profileGoalMaintain: "Maintain weight",
    profileGoalGain: "Gain muscle",
    profileWorkoutDaysPlaceholder: "Workouts per week",
    profileSaveCta: "Save",
    exercisePlanTitle: "Workout plan ({intensity})",
    exerciseBurnLabel: "Estimated burn",
    caloriesDefaultReply:
      "I can analyze meals or suggest workouts. Share a photo or ask a question.",
    workoutPlanTitle: "Today's workout plan ({intensity})",
    workoutPlanAdvicePrefix: "Coach note:",
  },
  mealPlan: {
    searchPlaceholder: "Search meals, plans, etc.",
    filterLabel: "Filter",
    addMenuCta: "Add Menu",
    notImplemented: "Coming soon!",
    noResults: "No meals match your search.",
    weekLabel: "Select week",
    promoTitle: "Start your health journey",
    promoSubtitle: "Enjoy a FREE 1-month access to NutriAI",
    claimCta: "Claim now",
    checkButton: "Cook",
    promoBadge: "VEG",
    navPrev: "Prev",
    navNext: "Next",
  },
};

export type Messages = typeof messages;
