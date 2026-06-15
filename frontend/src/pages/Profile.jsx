import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import PostCard from "../components/PostCard";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import s from "./Profile.module.css";

export default function Profile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const [posts, setPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [bioDraft, setBioDraft] = useState("");
  const [savingBio, setSavingBio] = useState(false);
  const [listModal, setListModal] = useState(null); // 'followers' | 'following' | null
  const [listEntries, setListEntries] = useState([]);
  const [listLoading, setListLoading] = useState(false);

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
      if (isOwn) {
        updateUser({ profilePicture: res.data?.profilePicture });
      }
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

  const handleSaveBio = async () => {
    const trimmed = bioDraft.trim();
    setSavingBio(true);
    try {
      const res = await api.put(`/api/users/${userId}`, { bio: trimmed });
      const updated = res.data || {};
      setProfileData((prev) => ({
        ...prev,
        ...updated,
        bio: updated.bio ?? trimmed,
      }));
      if (isOwn) {
        updateUser({ bio: updated.bio ?? trimmed });
      }
      setEditingBio(false);
      toast.success("Bio updated!");
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || err.response?.data || "Could not update bio",
      );
    } finally {
      setSavingBio(false);
    }
  };

  const openListModal = async (type) => {
    setListModal(type);
    setListLoading(true);
    const usernames = type === "followers" ? followers : following;

    try {
      const entries = await Promise.all(
        usernames.map(async (item) => {
          // Support either plain username strings or richer objects
          if (typeof item === "object" && item !== null) {
            return {
              id: item.id ?? item.userId,
              username: item.username,
              profilePicture: item.profilePicture,
            };
          }
          // item is a username string — try to resolve extra details
          try {
            const res = await api.get(
              `/api/users/search?q=${encodeURIComponent(item)}`,
            );
            const match = (res.data || []).find(
              (u) => u.username === item,
            );
            return {
              id: match?.id,
              username: item,
              profilePicture: match?.profilePicture,
            };
          } catch {
            return { id: undefined, username: item, profilePicture: undefined };
          }
        }),
      );
      setListEntries(entries);
    } catch {
      setListEntries(usernames.map((u) => ({ username: u })));
    } finally {
      setListLoading(false);
    }
  };

  const closeListModal = () => {
    setListModal(null);
    setListEntries([]);
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
              {picUrl && (
                <img
                  src={picUrl}
                  alt={displayName}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.nextElementSibling.style.display =
                      "flex";
                  }}
                />
              )}
              <span
                className={s.avatarFallback}
                style={{ display: picUrl ? "none" : "flex" }}
              >
                {initial}
              </span>
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

          {/* Bio */}
          {editingBio ?
            <div className={s.bioEdit}>
              <textarea
                className={s.bioInput}
                value={bioDraft}
                onChange={(e) => setBioDraft(e.target.value)}
                placeholder="Tell people a bit about yourself..."
                maxLength={160}
                rows={3}
                autoFocus
              />
              <div className={s.bioMeta}>
                <span className={s.bioCount}>{bioDraft.length}/160</span>
                <div className={s.bioActions}>
                  <button
                    className={s.bioCancelBtn}
                    onClick={() => setEditingBio(false)}
                    disabled={savingBio}
                  >
                    Cancel
                  </button>
                  <button
                    className={s.bioSaveBtn}
                    onClick={handleSaveBio}
                    disabled={savingBio}
                  >
                    {savingBio ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            </div>
          : <div className={s.bioRow}>
              {profileData?.bio ?
                <p className={s.bio}>{profileData.bio}</p>
              : isOwn && <p className={s.bioEmpty}>Add a bio</p>}
              {isOwn && (
                <button
                  className={s.bioEditBtn}
                  onClick={() => {
                    setBioDraft(profileData?.bio || "");
                    setEditingBio(true);
                  }}
                  title="Edit bio"
                  aria-label="Edit bio"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                  </svg>
                </button>
              )}
            </div>
          }

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
            <button
              className={`${s.stat} ${s.statClickable}`}
              onClick={() => openListModal("followers")}
              disabled={followers.length === 0}
            >
              <span className={s.statNum}>{followers.length}</span>
              <span className={s.statLabel}>Followers</span>
            </button>
            <div className={s.statDivider} />
            <button
              className={`${s.stat} ${s.statClickable}`}
              onClick={() => openListModal("following")}
              disabled={following.length === 0}
            >
              <span className={s.statNum}>{following.length}</span>
              <span className={s.statLabel}>Following</span>
            </button>
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

      {/* ── Followers / Following Modal ── */}
      {listModal && (
        <div className={s.modalOverlay} onClick={closeListModal}>
          <div className={s.modal} onClick={(e) => e.stopPropagation()}>
            <div className={s.modalHeader}>
              <h3>{listModal === "followers" ? "Followers" : "Following"}</h3>
              <button
                className={s.modalClose}
                onClick={closeListModal}
                aria-label="Close"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className={s.modalBody}>
              {listLoading ?
                <div className={s.modalLoading}>
                  <div className={s.spinner} />
                </div>
              : listEntries.length === 0 ?
                <p className={s.modalEmpty}>
                  {listModal === "followers" ?
                    "No followers yet"
                  : "Not following anyone yet"}
                </p>
              : listEntries.map((entry, i) => (
                  <div
                    key={`${entry.username}-${i}`}
                    className={`${s.modalItem} ${entry.id ? s.modalItemClickable : ""}`}
                    onClick={() => {
                      if (entry.id) {
                        closeListModal();
                        navigate(`/profile/${entry.id}`);
                      }
                    }}
                  >
                    <div className={s.modalAvatar}>
                      {entry.profilePicture ?
                        <img src={entry.profilePicture} alt="" />
                      : <span>{entry.username[0]?.toUpperCase()}</span>}
                    </div>
                    <span className={s.modalUsername}>{entry.username}</span>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
