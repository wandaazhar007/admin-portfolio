import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../lib/api";
import type { Work, WorksListResponse } from "../../types/work";
import styles from "./WorksPage.module.scss";

const SKELETON_ROWS = 6;
const MIN_LOADING_MS = 700;
const SEARCH_LOADING_MS = 350;

type DeleteModalState = {
  open: boolean;
  uuid: string;
  name: string;
};

export default function WorksPage() {
  const [works, setWorks] = useState<Work[]>([]);
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

  const filteredWorks = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return works;

    return works.filter((work) => {
      return (
        work.name.toLowerCase().includes(keyword) ||
        work.desc.toLowerCase().includes(keyword) ||
        work.type.toLowerCase().includes(keyword) ||
        work.tags.join(" ").toLowerCase().includes(keyword) ||
        work.slug.toLowerCase().includes(keyword)
      );
    });
  }, [works, search]);

  const isTableLoading = loading || uiLoading;

  const fetchWorks = async () => {
    setLoading(true);
    setErrorMessage("");

    const startTime = Date.now();

    try {
      const response = await api.get<WorksListResponse>("/works", {
        params: {
          limit: 100
        }
      });

      setWorks(response.data.data.items);
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed to load works.");
      setWorks([]);
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
      await api.delete(`/works/${deleteModal.uuid}`);
      setWorks((prev) => prev.filter((item) => item.uuid !== deleteModal.uuid));
      closeDeleteModal();
    } catch (error) {
      console.error(error);
      alert("Failed to delete work.");
    } finally {
      setDeleteLoadingUuid(null);
    }
  };

  useEffect(() => {
    fetchWorks();
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
            <p className={styles.pageEyebrow}>Portfolio Management</p>
            <h1>Works</h1>
            <p className={styles.pageDescription}>
              Manage portfolio projects, preview links, repository links, tags, and publish status.
            </p>
          </div>

          <Link to="/works/create" className={styles.addButton}>
            + Add Work
          </Link>
        </div>

        <div className={styles.card}>
          <div className={styles.toolbar}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search works..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>

          {errorMessage ? <p className={styles.errorText}>{errorMessage}</p> : null}

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Project</th>
                  <th className={styles.hideOnTablet}>Type</th>
                  <th className={styles.hideOnMobile}>Tags</th>
                  <th>Status</th>
                  <th className={styles.actionsCol}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {isTableLoading
                  ? Array.from({ length: SKELETON_ROWS }).map((_, index) => (
                    <tr key={index}>
                      <td>
                        <div className={`${styles.tableSkeleton} ${styles.w24} ${styles.h4}`}></div>
                      </td>
                      <td className={styles.hideOnTablet}>
                        <div className={`${styles.tableSkeleton} ${styles.w14} ${styles.h4}`}></div>
                      </td>
                      <td className={styles.hideOnMobile}>
                        <div className={`${styles.tableSkeleton} ${styles.w18} ${styles.h4}`}></div>
                      </td>
                      <td>
                        <div className={`${styles.tableSkeleton} ${styles.w10} ${styles.h4}`}></div>
                      </td>
                      <td>
                        <div className={styles.tableActions}>
                          <div className={`${styles.tableSkeleton} ${styles.w8} ${styles.h4}`}></div>
                          <div className={`${styles.tableSkeleton} ${styles.w10} ${styles.h4}`}></div>
                        </div>
                      </td>
                    </tr>
                  ))
                  : filteredWorks.map((work) => (
                    <tr key={work.uuid}>
                      <td>
                        <div className={styles.titleCell}>
                          <strong>{work.name}</strong>
                          <span>{work.slug}</span>
                        </div>
                      </td>
                      <td className={styles.hideOnTablet}>{work.type}</td>
                      <td className={styles.hideOnMobile}>
                        <div className={styles.tagsWrap}>
                          {(work.tags || []).slice(0, 3).map((tag) => (
                            <span key={tag} className={styles.tagBadge}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <span
                          className={`${styles.statusBadge} ${work.isPublished ? styles.published : styles.draft
                            }`}
                        >
                          {work.isPublished ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td>
                        <div className={styles.tableActions}>
                          <Link
                            to={`/works/${work.uuid}/edit`}
                            className={`${styles.tableActionBtn} ${styles.edit}`}
                          >
                            Edit
                          </Link>

                          <button
                            type="button"
                            className={`${styles.tableActionBtn} ${styles.danger}`}
                            onClick={() => openDeleteModal(work.uuid, work.name)}
                            disabled={deleteLoadingUuid === work.uuid}
                          >
                            {deleteLoadingUuid === work.uuid ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>

            {!isTableLoading && filteredWorks.length === 0 ? (
              <div className={styles.emptyState}>
                <h3>No works found</h3>
                <p>Try a different keyword or add a new portfolio project.</p>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {deleteModal.open ? (
        <div className={styles.confirmModalOverlay} onClick={closeDeleteModal}>
          <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.confirmModalBadge}>Delete Work</div>

            <h3>Are you sure?</h3>
            <p>
              You are about to delete <strong>{deleteModal.name}</strong>. This action
              cannot be undone.
            </p>

            <div className={styles.confirmModalActions}>
              <button
                type="button"
                className={styles.secondaryButton}
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
                  <span className={styles.btnLoadingWrap}>
                    <span className={styles.btnSpinner}></span>
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