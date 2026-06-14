import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import s from "./PostCard.module.css";

// DOUBLE-CONSTRAINT AVATAR: Prevents exploding images
const UserAvatar = ({ src, username, size = 42 }) => {
  const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(username || "U")}&background=6366f1&color=fff`;

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        minWidth: `${size}px`,
        maxWidth: `${size}px`,
        minHeight: `${size}px`,
        maxHeight: `${size}px`,
        borderRadius: "50%",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg3)",
        flexShrink: 0,
        border: "1px solid var(--border)",
      }}
    >
      <img
        src={src || fallback}
        alt=""
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
        onError={(e) => {
          if (e.target.src !== fallback) {
            e.target.src = fallback;
          }
        }}
      />
    </div>
  );
};

export default function PostCard({ post = {}, onRefresh }) {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComment, setLoadingComment] = useState(false);

  const handleLike = async () => {
    if (!user) return toast.error("Please login to like");
    try {
      post.likedByMe ?
        await api.delete(`/api/likes/${post.id}`)
      : await api.post(`/api/likes/${post.id}`);
      onRefresh();
    } catch {
      toast.error("Could not update like");
    }
  };

  const toggleComments = async () => {
    if (showComments) {
      setShowComments(false);
      return;
    }
    try {
      const res = await api.get(`/api/comments/${post.id}`);
      setComments(res.data || []);
      setShowComments(true);
    } catch {
      toast.error("Could not load comments");
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!user) return toast.error("Please login to comment");
    if (!newComment.trim()) return;
    setLoadingComment(true);
    try {
      await api.post(`/api/comments/${post.id}`, { content: newComment });
      setNewComment("");
      const res = await api.get(`/api/comments/${post.id}`);
      setComments(res.data || []);
      onRefresh();
    } catch {
      toast.error("Could not post comment");
    } finally {
      setLoadingComment(false);
    }
  };

  const handleDelete = async () => {
    if (!user || user.userId !== post.userId) return;
    if (!window.confirm("Delete this post?")) return;
    try {
      await api.delete(`/api/posts/${post.id}`);
      toast.success("Post deleted");
      onRefresh();
    } catch {
      toast.error("Could not delete post");
    }
  };

  const timeAgo = (dateStr) => {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr);
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <div className={`${s.card} fade-up`}>
      <div className={s.header}>
        <Link to={`/profile/${post.userId}`} className={s.author}>
          <UserAvatar
            src={post.profilePicture}
            username={post.username}
            size={42}
          />
          <div>
            <div className={s.username}>{post.username || "Anonymous"}</div>
            <div className={s.time}>{timeAgo(post.createdAt)}</div>
          </div>
        </Link>
        {user && user.userId === post.userId && (
          <button className={s.deleteBtn} onClick={handleDelete}>
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
          className={`${s.actionBtn} ${post.likedByMe ? s.liked : ""}`}
          onClick={handleLike}
        >
          <svg
            className={s.actionIcon}
            viewBox="0 0 24 24"
            fill={post.likedByMe ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <span>{post.likeCount || 0}</span>
        </button>

        <button
          className={`${s.actionBtn} ${showComments ? s.active : ""}`}
          onClick={toggleComments}
        >
          <svg
            className={s.actionIcon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
          <span>{post.commentCount || 0}</span>
        </button>
      </div>

      {showComments && (
        <div className={s.commentsSection}>
          {(comments || []).length === 0 ?
            <p className={s.noComments}>No comments yet.</p>
          : comments.map((c) => (
              <div key={c.id} className={s.comment}>
                <UserAvatar
                  src={c.profilePicture}
                  username={c.username}
                  size={28}
                />
                <div className={s.commentBody}>
                  <span className={s.commentUser}>{c.username}</span>
                  <p className={s.commentText}>{c.content}</p>
                  <span className={s.commentTime}>{timeAgo(c.createdAt)}</span>
                </div>
              </div>
            ))
          }
          {user ?
            <form className={s.commentForm} onSubmit={handleComment}>
              <input
                className={s.commentInput}
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={loadingComment}
              />
              <button
                className={s.commentSend}
                disabled={loadingComment || !newComment.trim()}
              >
                {loadingComment ? "..." : "→"}
              </button>
            </form>
          : <p className={s.noComments} style={{ marginTop: "10px" }}>
              Login to comment
            </p>
          }
        </div>
      )}
    </div>
  );
}
