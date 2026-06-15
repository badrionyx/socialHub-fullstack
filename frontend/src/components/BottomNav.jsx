import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import s from "./BottomNav.module.css";

export default function BottomNav() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const isHome = location.pathname === "/";
  const isProfile = location.pathname === `/profile/${user.userId}`;

  const focusComposer = () => {
    const goAndFocus = () => {
      const el = document.getElementById("create-post-textarea");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.focus();
      }
    };

    if (location.pathname !== "/") {
      navigate("/");
      // Wait for Feed to mount before scrolling/focusing
      setTimeout(goAndFocus, 150);
    } else {
      goAndFocus();
    }
  };

  return (
    <nav className={s.nav} aria-label="Bottom navigation">
      <Link
        to="/"
        className={`${s.item} ${isHome ? s.active : ""}`}
        aria-current={isHome ? "page" : undefined}
      >
        <svg
          className={s.icon}
          viewBox="0 0 24 24"
          fill={isHome ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M3 9.5 12 2l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" />
        </svg>
        <span className={s.label}>Home</span>
      </Link>

      <button
        type="button"
        className={s.item}
        onClick={focusComposer}
        aria-label="Create new post"
      >
        <svg
          className={s.icon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="16" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
        <span className={s.label}>New Post</span>
      </button>

      <Link
        to={`/profile/${user.userId}`}
        className={`${s.item} ${isProfile ? s.active : ""}`}
        aria-current={isProfile ? "page" : undefined}
      >
        <div className={`${s.avatar} ${isProfile ? s.avatarActive : ""}`}>
          {user.profilePicture && (
            <img
              src={user.profilePicture}
              alt=""
              onError={(e) => {
                e.currentTarget.style.display = "none";
                e.currentTarget.nextElementSibling.style.display = "flex";
              }}
            />
          )}
          <span
            className={s.avatarFallback}
            style={{ display: user.profilePicture ? "none" : "flex" }}
          >
            {user.username[0].toUpperCase()}
          </span>
        </div>
        <span className={s.label}>{user.username}</span>
      </Link>
    </nav>
  );
}
