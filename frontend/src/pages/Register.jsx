import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import s from './Auth.module.css';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/auth/register', form);
      toast.success('Account created! Please sign in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className={s.page}>
      <div className={s.glow} />
      <div className={s.card}>
        <div className={s.brand}>
          <span className={s.brandIcon}>◈</span>
          <span className={s.brandName}>SocialHub</span>
        </div>
        <h1 className={s.title}>Create account</h1>
        <p className={s.sub}>Join the community today</p>

        <form onSubmit={handleSubmit} className={s.form}>
          <div className={s.field}>
            <label className={s.label}>Username</label>
            <input
              className={s.input}
              name="username" placeholder="yourname"
              value={form.username} onChange={handleChange} required
            />
          </div>
          <div className={s.field}>
            <label className={s.label}>Email</label>
            <input
              className={s.input}
              name="email" type="email"
              placeholder="you@example.com"
              value={form.email} onChange={handleChange} required
            />
          </div>
          <div className={s.field}>
            <label className={s.label}>Password</label>
            <input
              className={s.input}
              name="password" type="password"
              placeholder="Min. 6 characters"
              value={form.password} onChange={handleChange} required
            />
          </div>
          <button className={s.btn} type="submit" disabled={loading}>
            {loading ? <span className={s.spinner} /> : 'Create account'}
          </button>
        </form>

        <p className={s.switch}>
          Already have an account? <Link to="/login" className={s.link}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
