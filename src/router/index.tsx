import { Suspense, lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import AdminLayout from "../layouts/AdminLayout";
import ProtectedRoute from "../components/guards/ProtectedRoute";

const LoginPage = lazy(() => import("../pages/auth/LoginPage"));
const DashboardPage = lazy(() => import("../pages/dashboard/DashboardPage"));

const WorksPage = lazy(() => import("../pages/works/WorksPage"));
const CreateWorkPage = lazy(() => import("../pages/works/CreateWorkPage"));
const EditWorkPage = lazy(() => import("../pages/works/EditWorkPage"));

const BlogsPage = lazy(() => import("../pages/blogs/BlogsPage"));
const CreateBlogPage = lazy(() => import("../pages/blogs/CreateBlogPage"));
const EditBlogPage = lazy(() => import("../pages/blogs/EditBlogPage"));

const CategoriesPage = lazy(() => import("../pages/categories/CategoriesPage"));
const CreateCategoryPage = lazy(() => import("../pages/categories/CreateCategoryPage"));
const EditCategoryPage = lazy(() => import("../pages/categories/EditCategoryPage"));

function PageLoader() {
  return (
    <div
      style={{
        minHeight: "30vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1.6rem",
        color: "#314755",
        padding: "2rem",
      }}
    >
      Loading...
    </div>
  );
}

function withSuspense(element: React.ReactNode) {
  return <Suspense fallback={<PageLoader />}>{element}</Suspense>;
}

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      {
        path: "/login",
        element: withSuspense(<LoginPage />),
      },
    ],
  },
  {
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "/",
        element: withSuspense(<DashboardPage />),
      },
      {
        path: "/dashboard",
        element: withSuspense(<DashboardPage />),
      },
      {
        path: "/works",
        element: withSuspense(<WorksPage />),
      },
      {
        path: "/works/create",
        element: withSuspense(<CreateWorkPage />),
      },
      {
        path: "/works/:uuid/edit",
        element: withSuspense(<EditWorkPage />),
      },
      {
        path: "/blogs",
        element: withSuspense(<BlogsPage />),
      },
      {
        path: "/blogs/create",
        element: withSuspense(<CreateBlogPage />),
      },
      {
        path: "/blogs/:uuid/edit",
        element: withSuspense(<EditBlogPage />),
      },
      {
        path: "/categories",
        element: withSuspense(<CategoriesPage />),
      },
      {
        path: "/categories/create",
        element: withSuspense(<CreateCategoryPage />),
      },
      {
        path: "/categories/:uuid/edit",
        element: withSuspense(<EditCategoryPage />),
      },
    ],
  },
]);