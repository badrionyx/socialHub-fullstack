import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import PostCard from "../components/PostCard";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import s from "./Profile.module.css";

export default function Profile() {
  const { userId } = useParams();
  const { user } = useAuth();

  const [posts, setPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const isOwn = user.userId === parseInt(userId);

  const loadProfile = async () => {
    try {
      const [postsRes, followersRes, followingRes, userRes] = await Promise.all(
        [
          api.get(`/api/posts/user/${userId}`),
          api.get(`/api/follows/${userId}/followers`),
          api.get(`/api/follows/${userId}/following`),
          api.get(`/api/users/${userId}`),
        ],
      );
      setPosts(postsRes.data);
      setFollowers(followersRes.data);
      setFollowing(followingRes.data);
      setProfileData(userRes.data);
      setIsFollowing(followersRes.data.includes(user.username));
    } catch (err) {
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
      isFollowing ?
        await api.delete(`/api/follows/${userId}`)
      : await api.post(`/api/follows/${userId}`);
      loadProfile();
    } catch {
      toast.error("Could not update follow");
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);

    try {
      const res = await api.post("/api/users/upload-picture", formData);

      setProfileData(res.data);
      toast.success("Profile picture updated!");
    } catch (err) {
      console.error(err);

      toast.error(
        err.response?.data?.message || err.response?.data || "Upload failed",
      );
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const displayName = profileData?.username || `User ${userId}`;
  const profilePic = profileData?.profilePicture;
  const initial = displayName[0]?.toUpperCase();
  const picUrl = profilePic || null;
  if (loading)
    return (
      <div className={s.loadingPage}>
        <div className={s.spinner} />
      </div>
    );

  return (
    <div className={s.page}>
      {/* ── Profile Hero Card ── */}
      <div className={s.heroCard}>
        <div className={s.heroBg} />

        <div className={s.heroContent}>
          {/* Avatar with upload */}
          <div className={s.avatarWrap}>
            <div className={s.avatar}>
              {picUrl ?
                <img src={picUrl} alt={displayName} />
              : <span>{initial}</span>}
              {uploading && (
                <div className={s.uploadingOverlay}>
                  <div className={s.miniSpinner} />
                </div>
              )}
            </div>

            {isOwn && (
              <label className={s.uploadBtn} title="Change profile picture">
                {uploading ? "⟳" : "📷"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleUpload}
                  style={{ display: "none" }}
                  disabled={uploading}
                />
              </label>
            )}
          </div>

          {/* Name */}
          <h2 className={s.displayName}>{displayName}</h2>
          {profileData?.bio && <p className={s.bio}>{profileData.bio}</p>}

          {/* Follow button */}
          {!isOwn && (
            <button
              className={`${s.followBtn} ${isFollowing ? s.following : ""}`}
              onClick={handleFollow}
            >
              {isFollowing ? "✓ Following" : "+ Follow"}
            </button>
          )}

          <div className={s.stats}>
            <div className={s.stat}>
              <span className={s.statNum}>{posts.length}</span>
              <span className={s.statLabel}>Posts</span>
            </div>
            <div className={s.statDivider} />
            <div className={s.stat}>
              <span className={s.statNum}>{followers.length}</span>
              <span className={s.statLabel}>Followers</span>
            </div>
            <div className={s.statDivider} />
            <div className={s.stat}>
              <span className={s.statNum}>{following.length}</span>
              <span className={s.statLabel}>Following</span>
            </div>
          </div>
        </div>
      </div>

      <div className={s.postsSection}>
        <h3 className={s.postsHeading}>
          <span className={s.dot} /> Posts
        </h3>

        {posts.length === 0 ?
          <div className={s.empty}>
            <span className={s.emptyIcon}>✦</span>
            <p>No posts yet</p>
          </div>
        : posts.map((post) => (
            <PostCard key={post.id} post={post} onRefresh={loadProfile} />
          ))
        }
      </div>
    </div>
  );
}
