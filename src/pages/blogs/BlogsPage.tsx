import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../lib/api";
import type { Blog, BlogsListResponse } from "../../types/blog";
import styles from "./BlogsPage.module.scss";

const SKELETON_ROWS = 6;
const MIN_LOADING_MS = 700;
const SEARCH_LOADING_MS = 350;

type DeleteModalState = {
  open: boolean;
  uuid: string;
  title: string;
};

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [uiLoading, setUiLoading] = useState(false);
  const [deleteLoadingUuid, setDeleteLoadingUuid] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({
    open: false,
    uuid: "",
    title: ""
  });

  const searchTimeoutRef = useRef<number | null>(null);

  const filteredBlogs = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return blogs;

    return blogs.filter((blog) => {
      return (
        blog.title.toLowerCase().includes(keyword) ||
        blog.desc.toLowerCase().includes(keyword) ||
        blog.author.toLowerCase().includes(keyword) ||
        blog.categoryName.toLowerCase().includes(keyword) ||
        blog.slug.toLowerCase().includes(keyword)
      );
    });
  }, [blogs, search]);

  const isTableLoading = loading || uiLoading;

  const fetchBlogs = async () => {
    setLoading(true);
    setErrorMessage("");

    const startTime = Date.now();

    try {
      const response = await api.get<BlogsListResponse>("/blogs", {
        params: {
          limit: 100
        }
      });

      setBlogs(response.data.data.items);
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed to load blogs.");
      setBlogs([]);
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

  const openDeleteModal = (uuid: string, title: string) => {
    setDeleteModal({
      open: true,
      uuid,
      title
    });
  };

  const closeDeleteModal = () => {
    if (deleteLoadingUuid) return;

    setDeleteModal({
      open: false,
      uuid: "",
      title: ""
    });
  };

  const handleDelete = async () => {
    if (!deleteModal.uuid) return;

    try {
      setDeleteLoadingUuid(deleteModal.uuid);
      await api.delete(`/blogs/${deleteModal.uuid}`);
      setBlogs((prev) => prev.filter((item) => item.uuid !== deleteModal.uuid));
      closeDeleteModal();
    } catch (error) {
      console.error(error);
      alert("Failed to delete blog.");
    } finally {
      setDeleteLoadingUuid(null);
    }
  };

  useEffect(() => {
    fetchBlogs();
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
            <h1>Blogs</h1>
            <p className={styles.pageDescription}>
              Manage blog articles, metadata, links, categories, and publishing status.
            </p>
          </div>

          <Link to="/blogs/create" className={styles.addButton}>
            + Add Blog
          </Link>
        </div>

        <div className={styles.card}>
          <div className={styles.toolbar}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search blogs..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>

          {errorMessage ? <p className={styles.errorText}>{errorMessage}</p> : null}

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Title</th>
                  <th className={styles.hideOnMobile}>Category</th>
                  <th className={styles.hideOnTablet}>Author</th>
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
                      <td className={styles.hideOnMobile}>
                        <div className={`${styles.tableSkeleton} ${styles.w14} ${styles.h4}`}></div>
                      </td>
                      <td className={styles.hideOnTablet}>
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
                  : filteredBlogs.map((blog) => (
                    <tr key={blog.uuid}>
                      <td>
                        <div className={styles.titleCell}>
                          <strong>{blog.title}</strong>
                          <span>{blog.slug}</span>
                        </div>
                      </td>
                      <td className={styles.hideOnMobile}>{blog.categoryName}</td>
                      <td className={styles.hideOnTablet}>{blog.author}</td>
                      <td>
                        <span
                          className={`${styles.statusBadge} ${blog.isPublished ? styles.published : styles.draft
                            }`}
                        >
                          {blog.isPublished ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td>
                        <div className={styles.tableActions}>
                          <Link
                            to={`/blogs/${blog.uuid}/edit`}
                            className={`${styles.tableActionBtn} ${styles.edit}`}
                          >
                            Edit
                          </Link>

                          <button
                            type="button"
                            className={`${styles.tableActionBtn} ${styles.danger}`}
                            onClick={() => openDeleteModal(blog.uuid, blog.title)}
                            disabled={deleteLoadingUuid === blog.uuid}
                          >
                            {deleteLoadingUuid === blog.uuid ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>

            {!isTableLoading && filteredBlogs.length === 0 ? (
              <div className={styles.emptyState}>
                <h3>No blogs found</h3>
                <p>Try a different keyword or add a new blog.</p>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {deleteModal.open ? (
        <div className={styles.confirmModalOverlay} onClick={closeDeleteModal}>
          <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.confirmModalBadge}>Delete Blog</div>

            <h3>Are you sure?</h3>
            <p>
              You are about to delete <strong>{deleteModal.title}</strong>. This action
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