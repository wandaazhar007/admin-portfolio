import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../lib/api";
import type { WorkImage, WorkPayload, WorkDetailResponse } from "../../types/work";
import styles from "./WorkFormPage.module.scss";

type FormErrors = {
  name?: string;
  desc?: string;
  preview?: string;
  github?: string;
  tags?: string;
  license?: string;
  type?: string;
  imageFile?: string;
};

function isValidUrl(value: string) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function parseTags(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function validateWork(values: {
  name: string;
  desc: string;
  preview: string;
  github: string;
  tagsInput: string;
  license: string;
  type: string;
  isPublished: boolean;
  imageFile: File | null;
}): FormErrors {
  const errors: FormErrors = {};

  if (!values.name.trim()) {
    errors.name = "Project name is required.";
  } else if (values.name.trim().length < 2) {
    errors.name = "Project name must be at least 2 characters.";
  }

  if (!values.desc.trim()) {
    errors.desc = "Description is required.";
  } else if (values.desc.trim().length < 10) {
    errors.desc = "Description must be at least 10 characters.";
  }

  if (values.preview.trim() && !isValidUrl(values.preview.trim())) {
    errors.preview = "Preview URL must be a valid URL.";
  }

  if (values.github.trim() && !isValidUrl(values.github.trim())) {
    errors.github = "GitHub URL must be a valid URL.";
  }

  if (values.license.trim().length > 100) {
    errors.license = "License must be less than or equal to 100 characters.";
  }

  if (!values.type.trim()) {
    errors.type = "Type is required.";
  } else if (values.type.trim().length > 100) {
    errors.type = "Type must be less than or equal to 100 characters.";
  }

  return errors;
}

export default function CreateWorkPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    desc: "",
    preview: "",
    github: "",
    tagsInput: "",
    license: "Private",
    type: "Frontend",
    isPublished: true,
    imageFile: null as File | null
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const previewImageUrl = useMemo(() => {
    if (!form.imageFile) return "";
    return URL.createObjectURL(form.imageFile);
  }, [form.imageFile]);

  const handleChange = (field: string, value: string | boolean | File | null) => {
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

  const uploadImage = async (entityId: string): Promise<WorkImage> => {
    const formData = new FormData();
    formData.append("folder", "works");
    formData.append("entityId", entityId);
    formData.append("file", form.imageFile as File);

    const response = await api.post("/uploads/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });

    return response.data.data as WorkImage;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateWork(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError("");

      const payload: WorkPayload = {
        name: form.name.trim(),
        desc: form.desc.trim(),
        preview: form.preview.trim(),
        github: form.github.trim(),
        tags: parseTags(form.tagsInput),
        license: form.license.trim() || "Private",
        type: form.type.trim(),
        isPublished: form.isPublished,
        image: null
      };

      const created = await api.post<WorkDetailResponse>("/works", payload);
      const createdWork = created.data.data;

      if (form.imageFile) {
        const uploadedImage = await uploadImage(createdWork.uuid);

        await api.put(`/works/${createdWork.uuid}`, {
          image: uploadedImage
        });
      }

      navigate("/works");
    } catch (error: any) {
      console.error(error);
      setSubmitError(error?.response?.data?.message || "Failed to create work.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="adminSection">
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.pageEyebrow}>Portfolio Management</p>
          <h1>Create Work</h1>
          <p className={styles.pageDescription}>
            Add a new portfolio project with links, tags, publish status, and image upload.
          </p>
        </div>

        <Link to="/works" className={styles.backButton}>
          Back to Works
        </Link>
      </div>

      <div className={styles.card}>
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.formGrid}>
            <div className={styles.formField}>
              <label className={styles.label} htmlFor="name">
                Project Name
              </label>
              <input
                id="name"
                type="text"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
                placeholder="Example: Classic Bakery Website"
              />
              {errors.name ? <p className={styles.errorText}>{errors.name}</p> : null}
            </div>

            <div className={styles.formField}>
              <label className={styles.label} htmlFor="type">
                Type
              </label>
              <input
                id="type"
                type="text"
                value={form.type}
                onChange={(e) => handleChange("type", e.target.value)}
                className={`${styles.input} ${errors.type ? styles.inputError : ""}`}
                placeholder="Frontend / Backend / Full Stack"
              />
              {errors.type ? <p className={styles.errorText}>{errors.type}</p> : null}
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
                placeholder="Write project description..."
              />
              {errors.desc ? <p className={styles.errorText}>{errors.desc}</p> : null}
            </div>

            <div className={styles.formField}>
              <label className={styles.label} htmlFor="preview">
                Preview URL
              </label>
              <input
                id="preview"
                type="text"
                value={form.preview}
                onChange={(e) => handleChange("preview", e.target.value)}
                className={`${styles.input} ${errors.preview ? styles.inputError : ""}`}
                placeholder="https://example.com"
              />
              {errors.preview ? <p className={styles.errorText}>{errors.preview}</p> : null}
            </div>

            <div className={styles.formField}>
              <label className={styles.label} htmlFor="github">
                GitHub URL
              </label>
              <input
                id="github"
                type="text"
                value={form.github}
                onChange={(e) => handleChange("github", e.target.value)}
                className={`${styles.input} ${errors.github ? styles.inputError : ""}`}
                placeholder="https://github.com/..."
              />
              {errors.github ? <p className={styles.errorText}>{errors.github}</p> : null}
            </div>

            <div className={styles.formField}>
              <label className={styles.label} htmlFor="tagsInput">
                Tags
              </label>
              <input
                id="tagsInput"
                type="text"
                value={form.tagsInput}
                onChange={(e) => handleChange("tagsInput", e.target.value)}
                className={`${styles.input} ${errors.tags ? styles.inputError : ""}`}
                placeholder="Next.js, TypeScript, Firebase"
              />
              <p className={styles.helperText}>Separate tags with commas.</p>
              {errors.tags ? <p className={styles.errorText}>{errors.tags}</p> : null}
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

            <div className={`${styles.formField} ${styles.fullWidth}`}>
              <label className={styles.label} htmlFor="imageFile">
                Upload Image
              </label>
              <input
                id="imageFile"
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={(e) => handleChange("imageFile", e.target.files?.[0] ?? null)}
                className={`${styles.fileInput} ${errors.imageFile ? styles.inputError : ""}`}
              />
              <p className={styles.helperText}>
                Supported: jpg, jpeg, png, webp. Max size: 5MB.
              </p>
              {errors.imageFile ? <p className={styles.errorText}>{errors.imageFile}</p> : null}

              {previewImageUrl ? (
                <div className={styles.imagePreviewWrap}>
                  <div className={styles.imagePreview}>
                    <img src={previewImageUrl} alt="Preview upload" />
                  </div>
                </div>
              ) : null}
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
            <Link to="/works" className={styles.secondaryButton}>
              Cancel
            </Link>

            <button type="submit" className={styles.primaryButton} disabled={submitting}>
              {submitting ? (
                <span className={styles.btnLoadingWrap}>
                  <span className={styles.btnSpinner}></span>
                  Saving...
                </span>
              ) : (
                "Save Work"
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}