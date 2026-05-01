import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "../components/navigation/Sidebar";
import Topbar from "../components/navigation/Topbar";
import "../styles/globals.scss";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="adminLayout">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="adminMain">
        <Topbar onMenuClick={() => setSidebarOpen((prev) => !prev)} />
        <div className="adminContent">
          <Outlet />
        </div>
      </div>

      {sidebarOpen ? (
        <button
          className="sidebarOverlay"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar overlay"
        />
      ) : null}
    </div>
  );
}