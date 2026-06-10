import { useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";

export default function CreatePost({ onPostCreated }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error("Write something first!");
      return;
      // trim() : removes spaces from both ends
      // '   '.trim() = '' → empty → stop here
    }

    setLoading(true);
    try {
      await api.post("/api/posts", { content, imageUrl: null });

      toast.success("Post created!");
      setContent("");

      onPostCreated();
    } catch (error) {
      toast.error("Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.card}>
      <form onSubmit={handleSubmit}>
        <textarea
          style={styles.textarea}
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          maxLength={500}
        />

        <div style={styles.footer}>
          <span style={styles.counter}>{content.length}/500</span>
          {}

          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? "Posting..." : "Post"}
          </button>
        </div>
      </form>
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
  textarea: {
    width: "100%",
    border: "1px solid #eee",
    borderRadius: "8px",
    padding: "0.75rem",
    fontSize: "1rem",
    resize: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "0.75rem",
  },
  counter: { color: "#999", fontSize: "0.85rem" },
  button: {
    padding: "0.5rem 1.5rem",
    backgroundColor: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
};
