import { createBrowserRouter } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import AdminLayout from "../layouts/AdminLayout";
import LoginPage from "../pages/auth/LoginPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import WorksPage from "../pages/works/WorksPage";
import CreateWorkPage from "../pages/works/CreateWorkPage";
import EditWorkPage from "../pages/works/EditWorkPage";
import BlogsPage from "../pages/blogs/BlogsPage";
import CreateBlogPage from "../pages/blogs/CreateBlogPage";
import EditBlogPage from "../pages/blogs/EditBlogPage";
import CategoriesPage from "../pages/categories/CategoriesPage";
import CreateCategoryPage from "../pages/categories/CreateCategoryPage";
import EditCategoryPage from "../pages/categories/EditCategoryPage";
import ProtectedRoute from "../components/guards/ProtectedRoute";

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      {
        path: "/login",
        element: <LoginPage />
      }
    ]
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
        element: <DashboardPage />
      },
      {
        path: "/dashboard",
        element: <DashboardPage />
      },
      {
        path: "/works",
        element: <WorksPage />
      },
      {
        path: "/works/create",
        element: <CreateWorkPage />
      },
      {
        path: "/works/:uuid/edit",
        element: <EditWorkPage />
      },
      {
        path: "/blogs",
        element: <BlogsPage />
      },
      {
        path: "/blogs/create",
        element: <CreateBlogPage />
      },
      {
        path: "/blogs/:uuid/edit",
        element: <EditBlogPage />
      },
      {
        path: "/categories",
        element: <CategoriesPage />
      },
      {
        path: "/categories/create",
        element: <CreateCategoryPage />
      },
      {
        path: "/categories/:uuid/edit",
        element: <EditCategoryPage />
      }
    ]
  }
]);