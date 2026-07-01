import type {
  Category,
  CategoryCreateInput,
  CategoryUpdateInput,
  StructureImpact,
  StructureOperationResult,
} from "../types/finance";
import { apiRequest } from "./api";


export const categoryService = {
  list(): Promise<Category[]> {
    return apiRequest<Category[]>(
      "/categories",
    );
  },

  create(
    data: CategoryCreateInput,
  ): Promise<Category> {
    return apiRequest<Category>(
      "/categories",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
  },

  update(
    categoryId: string,
    data: CategoryUpdateInput,
  ): Promise<Category> {
    return apiRequest<Category>(
      `/categories/${categoryId}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
    );
  },

  impact(
    categoryId: string,
  ): Promise<StructureImpact> {
    return apiRequest<StructureImpact>(
      `/categories/${categoryId}/impact`,
    );
  },

  activate(
    categoryId: string,
  ): Promise<Category> {
    return apiRequest<Category>(
      `/categories/${categoryId}/activate`,
      {
        method: "POST",
      },
    );
  },

  archive(
    categoryId: string,
  ): Promise<Category> {
    return apiRequest<Category>(
      `/categories/${categoryId}/archive`,
      {
        method: "POST",
      },
    );
  },

  transfer(
    categoryId: string,
    targetCategoryId: string | null,
    clearCategory: boolean,
    confirmClosedMonths: boolean,
  ): Promise<StructureOperationResult> {
    return apiRequest<
      StructureOperationResult
    >(
      `/categories/${categoryId}/transfer`,
      {
        method: "POST",
        body: JSON.stringify({
          target_category_id:
            targetCategoryId,
          clear_category:
            clearCategory,
          confirm_closed_months:
            confirmClosedMonths,
        }),
      },
    );
  },

  remove(
    categoryId: string,
    targetCategoryId: string | null,
    clearCategory: boolean,
    confirmClosedMonths: boolean,
  ): Promise<StructureOperationResult> {
    return apiRequest<
      StructureOperationResult
    >(
      `/categories/${categoryId}/delete`,
      {
        method: "POST",
        body: JSON.stringify({
          target_category_id:
            targetCategoryId,
          clear_category:
            clearCategory,
          confirm_closed_months:
            confirmClosedMonths,
          confirm_delete: true,
        }),
      },
    );
  },
};
