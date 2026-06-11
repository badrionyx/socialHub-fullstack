import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import s from "./Auth.module.css";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/api/auth/login", form);
      const { token, username, userId } = res.data;
      login({ username, userId }, token);
      toast.success(`Welcome back, ${username}!`);
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={s.page}>
      <div className={s.glow} />
      <div className={s.card}>
        <div className={s.brand}>
          <span className={s.brandIcon}>◈</span>
          <span className={s.brandName}>SocialHub</span>
        </div>
        <h1 className={s.title}>Welcome back</h1>
        <p className={s.sub}>Sign in to your account</p>

        <form onSubmit={handleSubmit} className={s.form}>
          <div className={s.field}>
            <label className={s.label}>Email</label>
            <input
              className={s.input}
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className={s.field}>
            <label className={s.label}>Password</label>
            <input
              className={s.input}
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <button className={s.btn} type="submit" disabled={loading}>
            {loading ?
              <span className={s.spinner} />
            : "Sign in"}
          </button>
        </form>

        <p className={s.switch}>
          Don't have an account?{" "}
          <Link to="/register" className={s.link}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
