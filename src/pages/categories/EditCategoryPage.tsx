//src/pages/categories/EditCategoryPage.tsx
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../lib/api";
import type {
  CategoryDetailResponse,
  CategoryPayload
} from "../../types/category";
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

export default function EditCategoryPage() {
  const navigate = useNavigate();
  const params = useParams();
  const uuid = params.uuid as string;

  const [form, setForm] = useState<CategoryPayload>({
    name: ""
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(true);
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

  const fetchCategory = async () => {
    try {
      setLoading(true);
      const response = await api.get<CategoryDetailResponse>(`/categories/${uuid}`);

      setForm({
        name: response.data.data.name
      });
    } catch (error) {
      console.error(error);
      setSubmitError("Failed to load category data.");
    } finally {
      setLoading(false);
    }
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

      await api.put(`/categories/${uuid}`, {
        name: form.name.trim()
      });

      navigate("/categories");
    } catch (error: any) {
      console.error(error);
      setSubmitError(
        error?.response?.data?.message || "Failed to update category."
      );
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchCategory();
  }, [uuid]);

  return (
    <section className="adminSection">
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.pageEyebrow}>Content Management</p>
          <h1>Edit Category</h1>
          <p className={styles.pageDescription}>
            Update the selected category name.
          </p>
        </div>

        <Link to="/categories" className={styles.backButton}>
          Back to Categories
        </Link>
      </div>

      <div className={styles.card}>
        {loading ? (
          <div className={styles.formSkeletonWrap}>
            <div className={`${styles.formSkeleton} ${styles.w18} ${styles.h4}`}></div>
            <div className={`${styles.formSkeleton} ${styles.wFull} ${styles.h6}`}></div>
            <div className={`${styles.formSkeleton} ${styles.w28} ${styles.h5}`}></div>
          </div>
        ) : (
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
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}