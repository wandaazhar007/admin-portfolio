export type BlogImage = {
  fileName: string;
  path: string;
  url: string;
} | null;

export type Blog = {
  uuid: string;
  legacyId: number | null;
  title: string;
  slug: string;
  desc: string;
  categoryUuid: string;
  categoryName: string;
  categorySlug: string;
  link: string;
  author: string;
  license: string;
  image: BlogImage;
  normalizedTitle: string;
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

export type BlogsListResponse = {
  success: boolean;
  message: string;
  data: {
    items: Blog[];
    nextCursor: string | null;
  };
};

export type BlogDetailResponse = {
  success: boolean;
  message: string;
  data: Blog;
};

export type BlogPayload = {
  title: string;
  desc: string;
  categoryUuid: string;
  link: string;
  author: string;
  license: string;
  isPublished: boolean;
  image?: BlogImage;
};