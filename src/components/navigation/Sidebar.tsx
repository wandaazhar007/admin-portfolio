import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine,
  faFolderOpen,
  faPenToSquare,
  faLayerGroup,
  faXmark
} from "@fortawesome/free-solid-svg-icons";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`}>
      <div className="sidebarHeader">
        <div>
          <p className="sidebarEyebrow">Portfolio Admin</p>
          <h2>Wanda Azhar</h2>
        </div>

        <button
          className="sidebarCloseBtn"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>
      </div>

      <nav className="sidebarNav">
        <NavLink to="/dashboard" onClick={onClose}>
          <FontAwesomeIcon icon={faChartLine} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/works" onClick={onClose}>
          <FontAwesomeIcon icon={faFolderOpen} />
          <span>Works</span>
        </NavLink>

        <NavLink to="/blogs" onClick={onClose}>
          <FontAwesomeIcon icon={faPenToSquare} />
          <span>Blogs</span>
        </NavLink>

        <NavLink to="/categories" onClick={onClose}>
          <FontAwesomeIcon icon={faLayerGroup} />
          <span>Categories</span>
        </NavLink>
      </nav>
    </aside>
  );
}