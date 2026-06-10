import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function PostCard({ post, onRefresh }) {
  const { user } = useAuth();

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComment, setLoadingComment] = useState(false);

  const handleLike = async () => {
    try {
      if (post.likedByMe) {
        await api.delete(`/api/likes/${post.id}`);
      } else {
        await api.post(`/api/likes/${post.id}`);
      }
      onRefresh();
    } catch (error) {
      toast.error("Could not update like");
    }
  };

  const loadComments = async () => {
    if (showComments) {
      setShowComments(false);
      return;
    }

    try {
      const response = await api.get(`/api/comments/${post.id}`);
      setComments(response.data);
      setShowComments(true);
    } catch (error) {
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
      const response = await api.get(`/api/comments/${post.id}`);
      setComments(response.data);
      onRefresh();
    } catch (error) {
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
    } catch (error) {
      toast.error("Could not delete post");
    }
  };

  return (
    <div style={styles.card}>
      {}
      <div style={styles.header}>
        <Link to={`/profile/${post.userId}`} style={styles.authorLink}>
          <div style={styles.avatar}>
            {post.username.charAt(0).toUpperCase()}
            {}
            {}
          </div>
          <div>
            <div style={styles.username}>{post.username}</div>
            <div style={styles.time}>
              {new Date(post.createdAt).toLocaleDateString()}
              {}
            </div>
          </div>
        </Link>

        {}
        {user.userId === post.userId && (
          <button onClick={handleDelete} style={styles.deleteBtn}>
            🗑️
          </button>
        )}
      </div>

      {}
      <p style={styles.content}>{post.content}</p>

      {post.imageUrl && (
        <img src={post.imageUrl} alt="post" style={styles.image} />
      )}

      {}
      <div style={styles.actions}>
        <button onClick={handleLike} style={styles.actionBtn}>
          {post.likedByMe ? "❤️" : "🤍"} {post.likeCount}
          {}
        </button>

        <button onClick={loadComments} style={styles.actionBtn}>
          💬 {post.commentCount}
        </button>
      </div>

      {}
      {showComments && (
        <div style={styles.commentsSection}>
          {}
          {comments.map((comment) => (
            <div key={comment.id} style={styles.comment}>
              {}
              <strong>{comment.username}: </strong>
              {comment.content}
            </div>
          ))}

          {}
          <form onSubmit={handleComment} style={styles.commentForm}>
            <input
              style={styles.commentInput}
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button
              type="submit"
              style={styles.commentBtn}
              disabled={loadingComment}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: "white",
    padding: "1.5rem",
    borderRadius: "12px",
    marginBottom: "1rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
  },
  authorLink: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    textDecoration: "none",
    color: "inherit",
  },
  avatar: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    backgroundColor: "#4f46e5",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    fontSize: "1.1rem",
  },
  username: { fontWeight: "bold", color: "#1a1a2e" },
  time: { fontSize: "0.8rem", color: "#999" },
  content: { margin: "0.5rem 0", lineHeight: "1.6", color: "#333" },
  image: { width: "100%", borderRadius: "8px", marginTop: "0.5rem" },
  actions: { display: "flex", gap: "1rem", marginTop: "1rem" },
  actionBtn: {
    background: "none",
    border: "1px solid #eee",
    padding: "0.4rem 1rem",
    borderRadius: "20px",
    cursor: "pointer",
    fontSize: "0.95rem",
  },
  deleteBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "1.1rem",
  },
  commentsSection: {
    marginTop: "1rem",
    paddingTop: "1rem",
    borderTop: "1px solid #eee",
  },
  comment: {
    padding: "0.5rem 0",
    borderBottom: "1px solid #f5f5f5",
    fontSize: "0.9rem",
  },
  commentForm: { display: "flex", gap: "0.5rem", marginTop: "0.75rem" },
  commentInput: {
    flex: 1,
    padding: "0.5rem",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "0.9rem",
  },
  commentBtn: {
    padding: "0.5rem 1rem",
    backgroundColor: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};
