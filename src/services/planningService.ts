import { apiRequest } from "./api";
import type {
  PlanningScenario,
  PlanningScenarioInput,
} from "../types/planning";


export const planningService = {
  list(): Promise<PlanningScenario[]> {
    return apiRequest<PlanningScenario[]>(
      "/planning/scenarios",
    );
  },

  create(
    data: PlanningScenarioInput,
  ): Promise<PlanningScenario> {
    return apiRequest<PlanningScenario>(
      "/planning/scenarios",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
  },

  update(
    scenarioId: string,
    data: PlanningScenarioInput,
  ): Promise<PlanningScenario> {
    return apiRequest<PlanningScenario>(
      `/planning/scenarios/${scenarioId}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
    );
  },

  setActive(
    scenarioId: string,
    isActive: boolean,
  ): Promise<PlanningScenario> {
    return apiRequest<PlanningScenario>(
      `/planning/scenarios/${scenarioId}/active`,
      {
        method: "PATCH",
        body: JSON.stringify({
          is_active: isActive,
        }),
      },
    );
  },

  remove(
    scenarioId: string,
  ): Promise<void> {
    return apiRequest<void>(
      `/planning/scenarios/${scenarioId}`,
      {
        method: "DELETE",
      },
    );
  },
};
