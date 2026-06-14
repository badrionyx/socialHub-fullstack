import { useState, useEffect } from "react";
import api from "../api/axios";
import PostCard from "../components/PostCard";
import CreatePost from "../components/CreatePost";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import s from "./Feed.module.css";

export default function Feed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/posts");
      setPosts(res.data);
    } catch {
      toast.error("Could not load posts");
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadPosts();
  }, []);

  // Re-fetch posts when user logs in/out
  useEffect(() => {
    if (user) {
      loadPosts();
    }
  }, [user?.userId]);

  return (
    <div className={s.layout}>
      {/* Left sidebar spacer */}
      <aside className={s.sidebar} />

      {/* Main feed */}
      <main className={s.feed}>
        <CreatePost onPostCreated={loadPosts} />

        {loading ?
          <div className={s.loading}>
            {[1, 2, 3].map((i) => (
              <div key={i} className={s.skeleton} />
            ))}
          </div>
        : posts.length === 0 ?
          <div className={s.empty}>
            <div className={s.emptyIcon}>✦</div>
            <h3>Nothing here yet</h3>
            <p>Be the first to post something!</p>
          </div>
        : posts.map((post, i) => (
            <div key={post.id} style={{ animationDelay: `${i * 0.04}s` }}>
              <PostCard post={post} onRefresh={loadPosts} />
            </div>
          ))
        }
      </main>

      {/* Right sidebar spacer */}
      <aside className={s.sidebar} />
    </div>
  );
}
