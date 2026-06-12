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
  const searchRef = useRef(null);

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

  useEffect(() => {
    const h = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target))
        setShowResults(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <nav className={s.nav}>
      <Link to="/" className={s.logo}>
        <span className={s.logoIcon}>◈</span>
        <span>SocialHub</span>
      </Link>

      <div className={s.searchWrap} ref={searchRef}>
        <span className={s.searchIcon}>⌕</span>
        <input
          className={s.searchInput}
          placeholder="Search people..."
          value={query}
          onChange={handleSearch}
          onFocus={() => results.length > 0 && setShowResults(true)}
        />
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

      <div className={s.right}>
        {/* ── Dark / Light toggle ── */}
        <button
          className={s.themeToggle}
          onClick={toggle}
          title={dark ? "Light mode" : "Dark mode"}
        >
          <span className={s.themeIcon}>{dark ? "☀️" : "🌙"}</span>
        </button>

        <Link to={`/profile/${user.userId}`} className={s.profileBtn}>
          <div className={s.navAvatar}>{user.username[0].toUpperCase()}</div>
          <span className={s.navUsername}>{user.username}</span>
        </Link>

        <button
          className={s.logoutBtn}
          onClick={() => {
            logout();
            toast.success("See you soon!");
            navigate("/login");
          }}
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}
