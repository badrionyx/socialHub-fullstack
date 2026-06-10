import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import PostCard from "../components/PostCard";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Profile() {
  const { userId } = useParams();

  const { user } = useAuth();

  const [posts, setPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  const isOwnProfile = user.userId === parseInt(userId);

  const loadProfile = async () => {
    try {
      const [postsRes, followersRes, followingRes] = await Promise.all([
        api.get(`/api/posts/user/${userId}`),
        api.get(`/api/follows/${userId}/followers`),
        api.get(`/api/follows/${userId}/following`),
      ]);

      setPosts(postsRes.data);
      setFollowers(followersRes.data);
      setFollowing(followingRes.data);

      setIsFollowing(followersRes.data.includes(user.username));
    } catch (error) {
      toast.error("Could not load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await api.delete(`/api/follows/${userId}`);
      } else {
        await api.post(`/api/follows/${userId}`);
      }
      loadProfile();
    } catch (error) {
      toast.error("Could not update follow");
    }
  };

  if (loading) return <div style={styles.center}>Loading...</div>;

  return (
    <div style={styles.container}>
      {}
      <div style={styles.profileCard}>
        {}
        <div style={styles.bigAvatar}>
          {userId.charAt(0)}
          {}
        </div>

        {}
        <div style={styles.stats}>
          <div style={styles.stat}>
            <strong>{posts.length}</strong>
            <span>Posts</span>
          </div>
          <div style={styles.stat}>
            <strong>{followers.length}</strong>
            <span>Followers</span>
          </div>
          <div style={styles.stat}>
            <strong>{following.length}</strong>
            <span>Following</span>
          </div>
        </div>

        {}
        {!isOwnProfile && (
          <button
            onClick={handleFollow}
            style={{
              ...styles.followBtn,
              backgroundColor: isFollowing ? "#e5e7eb" : "#4f46e5",
              color: isFollowing ? "#333" : "white",
            }}
          >
            {isFollowing ? "Unfollow" : "Follow"}
          </button>
        )}
      </div>

      {}
      <h3 style={styles.postsTitle}>Posts</h3>
      {posts.length === 0 ?
        <div style={styles.empty}>No posts yet</div>
      : posts.map((post) => (
          <PostCard key={post.id} post={post} onRefresh={loadProfile} />
        ))
      }
    </div>
  );
}

const styles = {
  container: { maxWidth: "600px", margin: "2rem auto", padding: "0 1rem" },
  center: { textAlign: "center", marginTop: "3rem" },
  profileCard: {
    backgroundColor: "white",
    padding: "2rem",
    borderRadius: "12px",
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    marginBottom: "1.5rem",
  },
  bigAvatar: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    backgroundColor: "#4f46e5",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "2rem",
    fontWeight: "bold",
    margin: "0 auto 1rem",
  },
  stats: { display: "flex", justifyContent: "center", gap: "2rem" },
  stat: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.25rem",
  },
  followBtn: {
    marginTop: "1rem",
    padding: "0.5rem 2rem",
    border: "none",
    borderRadius: "20px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  postsTitle: { marginBottom: "1rem", color: "#1a1a2e" },
  empty: { textAlign: "center", color: "#999", padding: "2rem" },
};
