import { useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import s from './CreatePost.module.css';

export default function CreatePost({ onPostCreated }) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) { toast.error('Write something first!'); return; }
    setLoading(true);
    try {
      await api.post('/api/posts', { content, imageUrl: null });
      toast.success('Posted!');
      setContent('');
      onPostCreated();
    } catch { toast.error('Could not create post'); }
    finally { setLoading(false); }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmit(e);
  };

  return (
    <div className={s.card}>
      <div className={s.top}>
        <div className={s.avatar}>{user.username[0].toUpperCase()}</div>
        <textarea
          className={s.textarea}
          placeholder="What's on your mind?"
          value={content}
          onChange={e => setContent(e.target.value)}
          onKeyDown={handleKey}
          rows={3}
          maxLength={500}
        />
      </div>
      <div className={s.footer}>
        <span className={s.hint}>Ctrl+Enter to post</span>
        <div className={s.right}>
          <span className={`${s.counter} ${content.length > 450 ? s.warn : ''}`}>
            {content.length}/500
          </span>
          <button
            className={s.postBtn}
            onClick={handleSubmit}
            disabled={loading || !content.trim()}
          >
            {loading ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>
    </div>
  );
}
