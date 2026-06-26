import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import api from "../api/axios";
import toast from "react-hot-toast";
import s from "./Navbar.module.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const searchRef = useRef(null);
  const mobileInputRef = useRef(null);

  const handleSearch = async (e) => {
    const v = e.target.value;
    setQuery(v);
    if (v.trim().length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }
    try {
      const res = await api.get(`/api/users/search?q=${v}`);
      setResults(res.data);
      setShowResults(true);
    } catch {}
  };

  const goToProfile = (id) => {
    setQuery("");
    setResults([]);
    setShowResults(false);
    navigate(`/profile/${id}`);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
    toast.success("See you soon!");
    navigate("/login");
  };

  useEffect(() => {
    const h = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
        setMobileSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    if (mobileSearchOpen && mobileInputRef.current) {
      mobileInputRef.current.focus();
    }
  }, [mobileSearchOpen]);

  // Inline styles kept as named objects (single-brace usage in JSX)
  const avatarFallbackStyle = { display: user.profilePicture ? "none" : "flex" };
  const overlayStyle = {
    position: "fixed",
    inset: 0,
    background: "rgba(0, 0, 0, 0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: 16,
  };
  const modalStyle = {
    background: dark ? "#1e1f22" : "#ffffff",
    color: dark ? "#f5f5f5" : "#111111",
    width: "100%",
    maxWidth: 320,
    borderRadius: 14,
    padding: 24,
    boxShadow: "0 12px 40px rgba(0, 0, 0, 0.3)",
    textAlign: "center",
  };
  const titleStyle = { margin: "0 0 8px", fontSize: 18 };
  const textStyle = { margin: "0 0 20px", fontSize: 14, opacity: 0.8 };
  const actionsStyle = { display: "flex", gap: 10, justifyContent: "center" };
  const cancelBtnStyle = {
    flex: 1,
    padding: "10px 16px",
    borderRadius: 8,
    border: dark ? "1px solid #3a3b3f" : "1px solid #d0d0d0",
    background: "transparent",
    color: "inherit",
    fontSize: 14,
    cursor: "pointer",
  };
  const confirmBtnStyle = {
    flex: 1,
    padding: "10px 16px",
    borderRadius: 8,
    border: "none",
    background: "#e0245e",
    color: "#ffffff",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  };

  return (
    <nav className={s.nav}>
      <Link to="/" className={s.logo}>
        <span className={s.logoIcon}>◈</span>
        <span>SocialHub</span>
      </Link>

      <div
        className={`${s.searchWrap} ${mobileSearchOpen ? s.searchActive : ""}`}
        ref={searchRef}
      >
        <svg
          className={s.searchIcon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          ref={mobileInputRef}
          className={s.searchInput}
          placeholder="Search people..."
          value={query}
          onChange={handleSearch}
          onFocus={() => results.length > 0 && setShowResults(true)}
        />
        {mobileSearchOpen && (
          <button
            className={s.searchClose}
            onClick={() => {
              setMobileSearchOpen(false);
              setQuery("");
              setResults([]);
              setShowResults(false);
            }}
            aria-label="Close search"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
        {showResults && (
          <div className={s.dropdown}>
            {results.length === 0 ?
              <div className={s.noResult}>No users found</div>
            : results.map((u) => (
                <div
                  key={u.id}
                  className={s.dropItem}
                  onClick={() => goToProfile(u.id)}
                >
                  <div className={s.dropAvatar}>
                    {u.username[0].toUpperCase()}
                  </div>
                  <div>
                    <div className={s.dropName}>{u.username}</div>
                    <div className={s.dropSub}>{u.email}</div>
                  </div>
                </div>
              ))
            }
          </div>
        )}
      </div>

      <div className={`${s.right} ${mobileSearchOpen ? s.hideOnSearch : ""}`}>
        {/* Mobile search toggle */}
        <button
          className={s.searchToggle}
          onClick={() => setMobileSearchOpen(true)}
          aria-label="Search"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>

        {/* Dark / Light toggle */}
        <button
          className={s.themeToggle}
          onClick={toggle}
          title={dark ? "Light mode" : "Dark mode"}
        >
          <span className={s.themeIcon}>{dark ? "☀️" : "🌙"}</span>
        </button>

        <Link to={`/profile/${user.userId}`} className={s.profileBtn}>
          <div className={s.navAvatar}>
            {user.profilePicture && (
              <img
                src={user.profilePicture}
                alt={user.username}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.nextElementSibling.style.display = "flex";
                }}
              />
            )}
            <span className={s.avatarFallback} style={avatarFallbackStyle}>
              {user.username[0].toUpperCase()}
            </span>
          </div>{" "}
          <span className={s.navUsername}>{user.username}</span>
        </Link>

        <button
          className={s.logoutBtn}
          onClick={() => setShowLogoutConfirm(true)}
          aria-label="Sign out"
          title="Sign out"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
            <line x1="12" y1="2" x2="12" y2="12" />
          </svg>
        </button>
      </div>

      {showLogoutConfirm && (
        <div
          onClick={() => setShowLogoutConfirm(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Confirm sign out"
          style={overlayStyle}
        >
          <div onClick={(e) => e.stopPropagation()} style={modalStyle}>
            <h3 style={titleStyle}>Sign out?</h3>
            <p style={textStyle}>
              Are you sure you want to sign out of SocialHub?
            </p>
            <div style={actionsStyle}>
              <button onClick={() => setShowLogoutConfirm(false)} style={cancelBtnStyle}>
                Cancel
              </button>
              <button onClick={confirmLogout} style={confirmBtnStyle}>
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}