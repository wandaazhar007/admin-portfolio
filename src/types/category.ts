export type Category = {
  uuid: string;
  legacyId: number | null;
  name: string;
  slug: string;
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
  updatedAt: {
    _seconds: number;
    _nanoseconds: number;
  };
};

export type CategoriesListResponse = {
  success: boolean;
  message: string;
  data: Category[];
};

export type CategoryDetailResponse = {
  success: boolean;
  message: string;
  data: Category;
};

export type CategoryPayload = {
  name: string;
};