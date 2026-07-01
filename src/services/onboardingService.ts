import type {
  OnboardingDraft,
  OnboardingMessage,
  OnboardingState,
  OnboardingStepKey,
} from "../types/onboarding";
import { apiRequest } from "./api";


export const onboardingService = {
  get():
    Promise<OnboardingState> {
    return apiRequest<
      OnboardingState
    >("/onboarding");
  },

  saveProgress(
    currentStep: number,
    completedSteps:
      OnboardingStepKey[],
    draft: OnboardingDraft,
  ): Promise<OnboardingState> {
    return apiRequest<
      OnboardingState
    >(
      "/onboarding/progress",
      {
        method: "PUT",
        body: JSON.stringify({
          current_step:
            currentStep,
          completed_steps:
            completedSteps,
          draft,
        }),
      },
    );
  },

  complete():
    Promise<OnboardingMessage> {
    return apiRequest<
      OnboardingMessage
    >(
      "/onboarding/complete",
      {
        method: "POST",
      },
    );
  },

  skip():
    Promise<OnboardingMessage> {
    return apiRequest<
      OnboardingMessage
    >(
      "/onboarding/skip",
      {
        method: "POST",
      },
    );
  },

  restart():
    Promise<OnboardingMessage> {
    return apiRequest<
      OnboardingMessage
    >(
      "/onboarding/restart",
      {
        method: "POST",
      },
    );
  },
};
