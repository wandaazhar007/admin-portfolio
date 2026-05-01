import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faArrowRightFromBracket
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../hooks/useAuth";

type TopbarProps = {
  onMenuClick: () => void;
};

export default function Topbar({ onMenuClick }: TopbarProps) {
  const { user, logout } = useAuth();

  return (
    <header className="topbar">
      <div className="topbarLeft">
        <button
          className="menuBtn"
          onClick={onMenuClick}
          aria-label="Open sidebar menu"
        >
          <FontAwesomeIcon icon={faBars} />
        </button>

        <div className="topbarTitleWrap">
          <h1>Admin Dashboard</h1>
          <p>Manage works, blogs, and categories</p>
        </div>
      </div>

      <div className="topbarRight">
        <div className="topbarUser">
          <span className="topbarUserLabel">Signed in as</span>
          <strong>{user?.email ?? "Admin"}</strong>
        </div>

        <button className="logoutBtn" onClick={logout}>
          <FontAwesomeIcon icon={faArrowRightFromBracket} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}