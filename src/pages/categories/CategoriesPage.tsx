//src/pages/categories/CategoriesPage.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../lib/api";
import type { Category, CategoriesListResponse } from "../../types/category";
import styles from "./CategoriesPage.module.scss";

const SKELETON_ROWS = 6;
const MIN_LOADING_MS = 700;
const SEARCH_LOADING_MS = 350;

type DeleteModalState = {
  open: boolean;
  uuid: string;
  name: string;
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [uiLoading, setUiLoading] = useState(false);
  const [deleteLoadingUuid, setDeleteLoadingUuid] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({
    open: false,
    uuid: "",
    name: ""
  });

  const searchTimeoutRef = useRef<number | null>(null);

  const filteredCategories = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return categories;

    return categories.filter((category) => {
      return (
        category.name.toLowerCase().includes(keyword) ||
        category.slug.toLowerCase().includes(keyword) ||
        category.uuid.toLowerCase().includes(keyword)
      );
    });
  }, [categories, search]);

  const isTableLoading = loading || uiLoading;

  const fetchCategories = async () => {
    setLoading(true);
    setErrorMessage("");

    const startTime = Date.now();

    try {
      const response = await api.get<CategoriesListResponse>("/categories");
      setCategories(response.data.data);
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed to load categories.");
      setCategories([]);
    } finally {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, MIN_LOADING_MS - elapsed);

      window.setTimeout(() => {
        setLoading(false);
      }, remaining);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);

    if (searchTimeoutRef.current) {
      window.clearTimeout(searchTimeoutRef.current);
    }

    setUiLoading(true);

    searchTimeoutRef.current = window.setTimeout(() => {
      setUiLoading(false);
    }, SEARCH_LOADING_MS);
  };

  const openDeleteModal = (uuid: string, name: string) => {
    setDeleteModal({
      open: true,
      uuid,
      name
    });
  };

  const closeDeleteModal = () => {
    if (deleteLoadingUuid) return;

    setDeleteModal({
      open: false,
      uuid: "",
      name: ""
    });
  };

  const handleDelete = async () => {
    if (!deleteModal.uuid) return;

    try {
      setDeleteLoadingUuid(deleteModal.uuid);
      await api.delete(`/categories/${deleteModal.uuid}`);
      setCategories((prev) => prev.filter((item) => item.uuid !== deleteModal.uuid));
      closeDeleteModal();
    } catch (error) {
      console.error(error);
      alert("Failed to delete category.");
    } finally {
      setDeleteLoadingUuid(null);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        window.clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <section className="adminSection">
        <div className={styles.pageHeader}>
          <div>
            <p className={styles.pageEyebrow}>Content Management</p>
            <h1>Categories</h1>
            <p className={styles.pageDescription}>
              Manage blog and content categories used across the portfolio.
            </p>
          </div>

          <Link to="/categories/create" className={styles.addButton}>
            + Add Category
          </Link>
        </div>

        <div className={styles.card}>
          <div className={styles.toolbar}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search categories..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>

          {errorMessage ? <p className="formErrorText">{errorMessage}</p> : null}

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Slug</th>
                  <th className={styles.hideOnMobile}>UUID</th>
                  <th className={styles.actionsCol}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {isTableLoading
                  ? Array.from({ length: SKELETON_ROWS }).map((_, index) => (
                    <tr key={index}>
                      <td>
                        <div className={`${styles.tableSkeleton} ${styles.w18} ${styles.h4}`}></div>
                      </td>
                      <td>
                        <div className={`${styles.tableSkeleton} ${styles.w14} ${styles.h4}`}></div>
                      </td>
                      <td className={styles.hideOnMobile}>
                        <div className={`${styles.tableSkeleton} ${styles.w24} ${styles.h4}`}></div>
                      </td>
                      <td>
                        <div className={styles.tableActions}>
                          <div className={`${styles.tableSkeleton} ${styles.w8} ${styles.h4}`}></div>
                          <div className={`${styles.tableSkeleton} ${styles.w10} ${styles.h4}`}></div>
                        </div>
                      </td>
                    </tr>
                  ))
                  : filteredCategories.map((category) => (
                    <tr key={category.uuid}>
                      <td>{category.name}</td>
                      <td>{category.slug}</td>
                      <td className={`${styles.cellMuted} ${styles.hideOnMobile}`}>
                        {category.uuid}
                      </td>
                      <td>
                        <div className={styles.tableActions}>
                          <Link
                            to={`/categories/${category.uuid}/edit`}
                            className={`${styles.tableActionBtn} ${styles.edit}`}
                          >
                            Edit
                          </Link>

                          <button
                            type="button"
                            className={`${styles.tableActionBtn} ${styles.danger}`}
                            onClick={() => openDeleteModal(category.uuid, category.name)}
                            disabled={deleteLoadingUuid === category.uuid}
                          >
                            {deleteLoadingUuid === category.uuid ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>

            {!isTableLoading && filteredCategories.length === 0 ? (
              <div className={styles.emptyState}>
                <h3>No categories found</h3>
                <p>Try a different keyword or add a new category.</p>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {deleteModal.open ? (
        <div className={styles.confirmModalOverlay} onClick={closeDeleteModal}>
          <div
            className={styles.confirmModal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.confirmModalBadge}>Delete Category</div>

            <h3>Are you sure?</h3>
            <p>
              You are about to delete <strong>{deleteModal.name}</strong>. This action
              cannot be undone.
            </p>

            <div className={styles.confirmModalActions}>
              <button
                type="button"
                className="secondaryActionBtn"
                onClick={closeDeleteModal}
                disabled={Boolean(deleteLoadingUuid)}
              >
                Cancel
              </button>

              <button
                type="button"
                className={`${styles.tableActionBtn} ${styles.danger} ${styles.confirmDeleteBtn}`}
                onClick={handleDelete}
                disabled={Boolean(deleteLoadingUuid)}
              >
                {deleteLoadingUuid ? (
                  <span className="btnLoadingWrap">
                    <span className="btnSpinner dangerSpinner"></span>
                    Deleting...
                  </span>
                ) : (
                  "Yes, Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}