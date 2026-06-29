import type {
  Category,
  CategoryCreateInput,
} from "../types/finance";
import { apiRequest } from "./api";

export const categoryService = {
  list(): Promise<Category[]> {
    return apiRequest<Category[]>("/categories");
  },

  create(data: CategoryCreateInput): Promise<Category> {
    return apiRequest<Category>("/categories", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
