//src/pages/categories/CreateCategoryPage.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../lib/api";
import type { CategoryPayload } from "../../types/category";
import styles from "./CategoryFormPage.module.scss";

type FormErrors = {
  name?: string;
};

function validateCategory(values: CategoryPayload): FormErrors {
  const errors: FormErrors = {};

  if (!values.name.trim()) {
    errors.name = "Category name is required.";
  } else if (values.name.trim().length < 2) {
    errors.name = "Category name must be at least 2 characters.";
  } else if (values.name.trim().length > 100) {
    errors.name = "Category name must be less than or equal to 100 characters.";
  }

  return errors;
}

export default function CreateCategoryPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState<CategoryPayload>({
    name: ""
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleChange = (field: keyof CategoryPayload, value: string) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateCategory(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError("");

      await api.post("/categories", {
        name: form.name.trim()
      });

      navigate("/categories");
    } catch (error: any) {
      console.error(error);
      setSubmitError(
        error?.response?.data?.message || "Failed to create category."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="adminSection">
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.pageEyebrow}>Content Management</p>
          <h1>Create Category</h1>
          <p className={styles.pageDescription}>
            Add a new category for blogs and portfolio content.
          </p>
        </div>

        <Link to="/categories" className={styles.backButton}>
          Back to Categories
        </Link>
      </div>

      <div className={styles.card}>
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.formGrid}>
            <div className={styles.formField}>
              <label htmlFor="name">Category Name</label>
              <input
                id="name"
                type="text"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className={errors.name ? styles.inputError : ""}
                placeholder="Example: Web Development"
              />
              {errors.name ? <p className={styles.errorText}>{errors.name}</p> : null}
            </div>
          </div>

          {submitError ? <p className={styles.errorText}>{submitError}</p> : null}

          <div className={styles.formActions}>
            <Link to="/categories" className={styles.secondaryButton}>
              Cancel
            </Link>

            <button type="submit" className={styles.primaryButton} disabled={submitting}>
              {submitting ? (
                <span className={styles.btnLoadingWrap}>
                  <span className={styles.btnSpinner}></span>
                  Saving...
                </span>
              ) : (
                "Save Category"
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}