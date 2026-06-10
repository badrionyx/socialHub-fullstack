import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Navbar() {
  const { user, logout } = useAuth();

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out!");
    navigate("/login");
  };

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.logo}>
        SocialHub 🌐
      </Link>
      {}

      <div style={styles.right}>
        <Link to={`/profile/${user.userId}`} style={styles.profileLink}>
          👤 {user.username}
          {}
        </Link>

        <button onClick={handleLogout} style={styles.logoutBtn}>
          Logout
        </button>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem 2rem",
    backgroundColor: "#4f46e5",
    color: "white",
    position: "sticky",
    top: 0,
    zIndex: 100,
    // sticky : stays at top while scrolling
  },
  logo: {
    color: "white",
    textDecoration: "none",
    fontSize: "1.4rem",
    fontWeight: "bold",
  },
  right: { display: "flex", alignItems: "center", gap: "1rem" },
  profileLink: { color: "white", textDecoration: "none" },
  logoutBtn: {
    padding: "0.4rem 1rem",
    backgroundColor: "white",
    color: "#4f46e5",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};
