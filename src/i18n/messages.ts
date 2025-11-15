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
};

export type Messages = typeof messages;
