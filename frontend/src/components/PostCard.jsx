import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import s from './PostCard.module.css';

export default function PostCard({ post, onRefresh }) {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComment, setLoadingComment] = useState(false);

  const handleLike = async () => {
    try {
      post.likedByMe
        ? await api.delete(`/api/likes/${post.id}`)
        : await api.post(`/api/likes/${post.id}`);
      onRefresh();
    } catch { toast.error('Could not update like'); }
  };

  const toggleComments = async () => {
    if (showComments) { setShowComments(false); return; }
    try {
      const res = await api.get(`/api/comments/${post.id}`);
      setComments(res.data);
      setShowComments(true);
    } catch { toast.error('Could not load comments'); }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setLoadingComment(true);
    try {
      await api.post(`/api/comments/${post.id}`, { content: newComment });
      setNewComment('');
      const res = await api.get(`/api/comments/${post.id}`);
      setComments(res.data);
      onRefresh();
    } catch { toast.error('Could not post comment'); }
    finally { setLoadingComment(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await api.delete(`/api/posts/${post.id}`);
      toast.success('Post deleted');
      onRefresh();
    } catch { toast.error('Could not delete post'); }
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr);
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <div className={`${s.card} fade-up`}>
      <div className={s.header}>
        <Link to={`/profile/${post.userId}`} className={s.author}>
          <div className={s.avatar}>
            {post.profilePicture
              ? <img src={`http://localhost:8080/uploads/${post.profilePicture}`} alt="" />
              : post.username[0].toUpperCase()
            }
          </div>
          <div>
            <div className={s.username}>{post.username}</div>
            <div className={s.time}>{timeAgo(post.createdAt)}</div>
          </div>
        </Link>
        {user.userId === post.userId && (
          <button className={s.deleteBtn} onClick={handleDelete} title="Delete post">
            ✕
          </button>
        )}
      </div>

      <p className={s.content}>{post.content}</p>

      {post.imageUrl && (
        <img src={post.imageUrl} alt="" className={s.postImage} />
      )}

      <div className={s.actions}>
        <button
          className={`${s.actionBtn} ${post.likedByMe ? s.liked : ''}`}
          onClick={handleLike}
        >
          <span className={s.actionIcon}>{post.likedByMe ? '♥' : '♡'}</span>
          <span>{post.likeCount}</span>
        </button>

        <button
          className={`${s.actionBtn} ${showComments ? s.active : ''}`}
          onClick={toggleComments}
        >
          <span className={s.actionIcon}>◎</span>
          <span>{post.commentCount}</span>
        </button>
      </div>

      {showComments && (
        <div className={s.commentsSection}>
          {comments.length === 0
            ? <p className={s.noComments}>No comments yet. Be first!</p>
            : comments.map(c => (
              <div key={c.id} className={s.comment}>
                <div className={s.commentAvatar}>{c.username[0].toUpperCase()}</div>
                <div className={s.commentBody}>
                  <span className={s.commentUser}>{c.username}</span>
                  <span className={s.commentText}>{c.content}</span>
                </div>
              </div>
            ))
          }
          <form onSubmit={handleComment} className={s.commentForm}>
            <input
              className={s.commentInput}
              placeholder="Write a comment..."
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
            />
            <button type="submit" className={s.commentSend} disabled={loadingComment}>
              {loadingComment ? '...' : '↑'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
