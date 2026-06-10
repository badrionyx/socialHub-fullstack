import { useState, useEffect } from "react";
import api from "../api/axios";
import PostCard from "../components/PostCard";
import CreatePost from "../components/CreatePost";
import toast from "react-hot-toast";

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPosts = async () => {
    try {
      const response = await api.get("/api/posts");

      setPosts(response.data);
    } catch (error) {
      toast.error("Could not load posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  if (loading) {
    return <div style={styles.center}>Loading posts...</div>;
  }

  return (
    <div style={styles.container}>
      <CreatePost onPostCreated={loadPosts} />
      {}

      {posts.length === 0 ?
        <div style={styles.empty}>No posts yet. Be the first to post! 🎉</div>
      : posts.map((post) => (
          <PostCard key={post.id} post={post} onRefresh={loadPosts} />
        ))
      }
    </div>
  );
}

const styles = {
  container: { maxWidth: "600px", margin: "2rem auto", padding: "0 1rem" },
  center: { textAlign: "center", marginTop: "3rem", color: "#666" },
  empty: {
    textAlign: "center",
    padding: "3rem",
    color: "#999",
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
};
