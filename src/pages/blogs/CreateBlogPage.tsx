import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../lib/api";
import type { Category, CategoriesListResponse } from "../../types/category";
import type { BlogPayload } from "../../types/blog";
import styles from "./BlogFormPage.module.scss";

type FormErrors = {
  title?: string;
  desc?: string;
  categoryUuid?: string;
  link?: string;
  author?: string;
  license?: string;
  imageUrl?: string;
};

function isValidUrl(value: string) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function validateBlog(values: BlogPayload & { imageUrl: string }): FormErrors {
  const errors: FormErrors = {};

  if (!values.title.trim()) {
    errors.title = "Title is required.";
  } else if (values.title.trim().length < 2) {
    errors.title = "Title must be at least 2 characters.";
  }

  if (!values.desc.trim()) {
    errors.desc = "Description is required.";
  } else if (values.desc.trim().length < 10) {
    errors.desc = "Description must be at least 10 characters.";
  }

  if (!values.categoryUuid.trim()) {
    errors.categoryUuid = "Category is required.";
  }

  if (values.link.trim() && !isValidUrl(values.link.trim())) {
    errors.link = "Link must be a valid URL.";
  }

  if (!values.author.trim()) {
    errors.author = "Author is required.";
  } else if (values.author.trim().length < 2) {
    errors.author = "Author must be at least 2 characters.";
  }

  if (values.license.trim().length > 100) {
    errors.license = "License must be less than or equal to 100 characters.";
  }

  if (values.imageUrl.trim() && !isValidUrl(values.imageUrl.trim())) {
    errors.imageUrl = "Image URL must be a valid URL.";
  }

  return errors;
}

export default function CreateBlogPage() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [form, setForm] = useState<
    BlogPayload & {
      imageUrl: string;
    }
  >({
    title: "",
    desc: "",
    categoryUuid: "",
    link: "",
    author: "Wanda Azhar",
    license: "Private",
    isPublished: true,
    imageUrl: ""
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleChange = (field: string, value: string | boolean) => {
    setForm((prev) => ({
      ...prev,
      [field]: value
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: undefined
    }));

    setSubmitError("");
  };

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await api.get<CategoriesListResponse>("/categories");
      setCategories(response.data.data);
    } catch (error) {
      console.error(error);
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateBlog(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError("");

      await api.post("/blogs", {
        title: form.title.trim(),
        desc: form.desc.trim(),
        categoryUuid: form.categoryUuid,
        link: form.link.trim(),
        author: form.author.trim(),
        license: form.license.trim() || "Private",
        isPublished: form.isPublished,
        image: form.imageUrl.trim()
          ? {
            fileName: "",
            path: "",
            url: form.imageUrl.trim()
          }
          : null
      });

      navigate("/blogs");
    } catch (error: any) {
      console.error(error);
      setSubmitError(error?.response?.data?.message || "Failed to create blog.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <section className="adminSection">
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.pageEyebrow}>Content Management</p>
          <h1>Create Blog</h1>
          <p className={styles.pageDescription}>
            Add a new blog article with category, external link, and publish status.
          </p>
        </div>

        <Link to="/blogs" className={styles.backButton}>
          Back to Blogs
        </Link>
      </div>

      <div className={styles.card}>
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.formGrid}>
            <div className={styles.formField}>
              <label className={styles.label} htmlFor="title">
                Title
              </label>
              <input
                id="title"
                type="text"
                value={form.title}
                onChange={(e) => handleChange("title", e.target.value)}
                className={`${styles.input} ${errors.title ? styles.inputError : ""}`}
                placeholder="Example: How I Build SEO Friendly Portfolio Websites"
              />
              {errors.title ? <p className={styles.errorText}>{errors.title}</p> : null}
            </div>

            <div className={styles.formField}>
              <label className={styles.label} htmlFor="categoryUuid">
                Category
              </label>
              <select
                id="categoryUuid"
                value={form.categoryUuid}
                onChange={(e) => handleChange("categoryUuid", e.target.value)}
                className={`${styles.select} ${errors.categoryUuid ? styles.inputError : ""}`}
                disabled={loadingCategories}
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.uuid} value={category.uuid}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.categoryUuid ? (
                <p className={styles.errorText}>{errors.categoryUuid}</p>
              ) : null}
            </div>

            <div className={`${styles.formField} ${styles.fullWidth}`}>
              <label className={styles.label} htmlFor="desc">
                Description
              </label>
              <textarea
                id="desc"
                value={form.desc}
                onChange={(e) => handleChange("desc", e.target.value)}
                className={`${styles.textarea} ${errors.desc ? styles.inputError : ""}`}
                placeholder="Write blog description..."
              />
              {errors.desc ? <p className={styles.errorText}>{errors.desc}</p> : null}
            </div>

            <div className={styles.formField}>
              <label className={styles.label} htmlFor="link">
                External Link
              </label>
              <input
                id="link"
                type="text"
                value={form.link}
                onChange={(e) => handleChange("link", e.target.value)}
                className={`${styles.input} ${errors.link ? styles.inputError : ""}`}
                placeholder="https://example.com/article"
              />
              {errors.link ? <p className={styles.errorText}>{errors.link}</p> : null}
            </div>

            <div className={styles.formField}>
              <label className={styles.label} htmlFor="author">
                Author
              </label>
              <input
                id="author"
                type="text"
                value={form.author}
                onChange={(e) => handleChange("author", e.target.value)}
                className={`${styles.input} ${errors.author ? styles.inputError : ""}`}
                placeholder="Wanda Azhar"
              />
              {errors.author ? <p className={styles.errorText}>{errors.author}</p> : null}
            </div>

            <div className={styles.formField}>
              <label className={styles.label} htmlFor="license">
                License
              </label>
              <input
                id="license"
                type="text"
                value={form.license}
                onChange={(e) => handleChange("license", e.target.value)}
                className={`${styles.input} ${errors.license ? styles.inputError : ""}`}
                placeholder="Private"
              />
              {errors.license ? <p className={styles.errorText}>{errors.license}</p> : null}
            </div>

            <div className={styles.formField}>
              <label className={styles.label} htmlFor="imageUrl">
                Image URL
              </label>
              <input
                id="imageUrl"
                type="text"
                value={form.imageUrl}
                onChange={(e) => handleChange("imageUrl", e.target.value)}
                className={`${styles.input} ${errors.imageUrl ? styles.inputError : ""}`}
                placeholder="https://example.com/image.jpg"
              />
              {errors.imageUrl ? <p className={styles.errorText}>{errors.imageUrl}</p> : null}
            </div>

            <div className={`${styles.formField} ${styles.fullWidth}`}>
              <label className={styles.label}>Publish Status</label>
              <div className={styles.checkboxRow}>
                <input
                  id="isPublished"
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(e) => handleChange("isPublished", e.target.checked)}
                  className={styles.checkbox}
                />
                <label className={styles.label} htmlFor="isPublished">
                  Published
                </label>
              </div>
            </div>
          </div>

          {submitError ? <p className={styles.errorText}>{submitError}</p> : null}

          <div className={styles.formActions}>
            <Link to="/blogs" className={styles.secondaryButton}>
              Cancel
            </Link>

            <button type="submit" className={styles.primaryButton} disabled={submitting}>
              {submitting ? (
                <span className={styles.btnLoadingWrap}>
                  <span className={styles.btnSpinner}></span>
                  Saving...
                </span>
              ) : (
                "Save Blog"
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}