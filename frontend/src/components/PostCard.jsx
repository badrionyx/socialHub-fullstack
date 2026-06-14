import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import s from "./PostCard.module.css";

export default function PostCard({ post, onRefresh }) {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComment, setLoadingComment] = useState(false);

  const handleLike = async () => {
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
      setComments(res.data);
      setShowComments(true);
    } catch {
      toast.error("Could not load comments");
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setLoadingComment(true);
    try {
      await api.post(`/api/comments/${post.id}`, { content: newComment });
      setNewComment("");
      const res = await api.get(`/api/comments/${post.id}`);
      setComments(res.data);
      onRefresh();
    } catch {
      toast.error("Could not post comment");
    } finally {
      setLoadingComment(false);
    }
  };

  const handleDelete = async () => {
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
    const diff = Date.now() - new Date(dateStr);
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  // ROBUST FIX: Ensure profile picture URL is handled correctly and has a reliable fallback
  const profilePic = post.profilePicture || post.user?.profilePicture;

  // Use a stable UI avatar service as a fallback if the real image is hidden on logout
  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(post.username || "U")}&background=random&color=fff&size=128`;

  return (
    <div className={`${s.card} fade-up`}>
      <div className={s.header}>
        <Link to={`/profile/${post.userId}`} className={s.author}>
          <div className={s.avatar}>
            <img
              src={profilePic || fallbackAvatar}
              alt={post.username}
              onError={(e) => {
                if (e.target.src !== fallbackAvatar) {
                  e.target.src = fallbackAvatar;
                }
              }}
            />
          </div>
          <div>
            <div className={s.username}>{post.username}</div>
            <div className={s.time}>{timeAgo(post.createdAt)}</div>
          </div>
        </Link>
        {user && user.userId === post.userId && (
          <button
            className={s.deleteBtn}
            onClick={handleDelete}
            title="Delete post"
          >
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
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <span>{post.likeCount}</span>
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
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
          <span>{post.commentCount}</span>
        </button>
      </div>

      {showComments && (
        <div className={s.commentsSection}>
          {comments.length === 0 ?
            <p className={s.noComments}>No comments yet. Be first!</p>
          : comments.map((c) => {
              const commentFallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(c.username || "U")}&background=random&color=fff&size=64`;
              return (
                <div key={c.id} className={s.comment}>
                  <div className={s.commentAvatar}>
                    <img
                      src={c.profilePicture || commentFallback}
                      alt={c.username}
                      onError={(e) => {
                        if (e.target.src !== commentFallback) {
                          e.target.src = commentFallback;
                        }
                      }}
                    />
                  </div>
                  <div className={s.commentBody}>
                    <span className={s.commentUser}>{c.username}</span>
                    <p className={s.commentText}>{c.content}</p>
                    <span className={s.commentTime}>
                      {timeAgo(c.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })
          }
          {user ?
            <form className={s.commentForm} onSubmit={handleComment}>
              <input
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={loadingComment}
              />
              <button disabled={loadingComment || !newComment.trim()}>
                {loadingComment ? "..." : "Post"}
              </button>
            </form>
          : <p className={s.loginPrompt}>
              Please <Link to="/login">login</Link> to comment.
            </p>
          }
        </div>
      )}
    </div>
  );
}
