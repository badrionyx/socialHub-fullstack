import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      await api.post("/api/auth/register", form);

      toast.success("Registered successfully! Please login.");

      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create Account</h2>

        <form onSubmit={handleSubmit}>
          {}

          <input
            style={styles.input}
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
          />

          <input
            style={styles.input}
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
          />

          <input
            style={styles.input}
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
          />

          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Register"}
            {}
          </button>
        </form>

        <p style={styles.link}>
          Already have an account? <Link to="/login">Login</Link>
          {}
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#f0f2f5",
  },
  card: {
    backgroundColor: "white",
    padding: "2rem",
    borderRadius: "12px",
    width: "100%",
    maxWidth: "400px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  },
  title: { textAlign: "center", marginBottom: "1.5rem", color: "#1a1a2e" },
  input: {
    width: "100%",
    padding: "0.75rem",
    marginBottom: "1rem",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontSize: "1rem",
    boxSizing: "border-box",
  },
  button: {
    width: "100%",
    padding: "0.75rem",
    backgroundColor: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    cursor: "pointer",
  },
  link: { textAlign: "center", marginTop: "1rem" },
};
