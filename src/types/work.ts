export type WorkImage = {
  fileName: string;
  path: string;
  url: string;
} | null;

export type Work = {
  uuid: string;
  legacyId: number | null;
  slug: string;
  name: string;
  desc: string;
  preview: string;
  github: string;
  tags: string[];
  license: string;
  type: string;
  image: WorkImage;
  normalizedName: string;
  isPublished: boolean;
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
  updatedAt: {
    _seconds: number;
    _nanoseconds: number;
  };
};

export type WorksListResponse = {
  success: boolean;
  message: string;
  data: {
    items: Work[];
    nextCursor: string | null;
  };
};

export type WorkDetailResponse = {
  success: boolean;
  message: string;
  data: Work;
};

export type WorkPayload = {
  name: string;
  desc: string;
  preview: string;
  github: string;
  tags: string[];
  license: string;
  type: string;
  isPublished: boolean;
  image?: WorkImage;
};