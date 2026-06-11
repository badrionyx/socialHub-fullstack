import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import PostCard from '../components/PostCard';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import s from './Profile.module.css';

export default function Profile() {
  const { userId } = useParams();
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [profileUser, setProfileUser] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const isOwn = user.userId === parseInt(userId);

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
    } catch { toast.error('Could not load profile'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadProfile(); }, [userId]);

  const handleFollow = async () => {
    try {
      isFollowing
        ? await api.delete(`/api/follows/${userId}`)
        : await api.post(`/api/follows/${userId}`);
      loadProfile();
    } catch { toast.error('Could not update follow'); }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    setUploading(true);
    try {
      await api.post('/api/users/upload-picture', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Photo updated!');
      loadProfile();
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  // Get profile picture from first post or use default
  const profilePic = posts[0]?.profilePicture;
  const displayName = posts[0]?.username || `User ${userId}`;
  const initial = displayName[0]?.toUpperCase();

  if (loading) return (
    <div className={s.loadingPage}>
      <div className={s.loadingDot} />
    </div>
  );

  return (
    <div className={s.page}>
      {/* Profile Hero Card */}
      <div className={s.heroCard}>
        {/* Background gradient strip */}
        <div className={s.heroBg} />

        <div className={s.heroContent}>
          {/* Avatar */}
          <div className={s.avatarWrap}>
            <div className={s.avatar}>
              {profilePic
                ? <img src={`http://localhost:8080/uploads/${profilePic}`} alt="" />
                : <span>{initial}</span>
              }
            </div>
            {isOwn && (
              <label className={s.uploadOverlay} title="Change photo">
                {uploading ? '⟳' : '✎'}
                <input
                  type="file" accept="image/*"
                  onChange={handleUpload}
                  style={{ display: 'none' }}
                />
              </label>
            )}
          </div>

          {/* Name & follow */}
          <div className={s.heroInfo}>
            <h2 className={s.displayName}>{displayName}</h2>

            {!isOwn && (
              <button
                className={`${s.followBtn} ${isFollowing ? s.following : ''}`}
                onClick={handleFollow}
              >
                {isFollowing ? 'Following ✓' : '+ Follow'}
              </button>
            )}
          </div>

          {/* Stats */}
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

      {/* Posts section */}
      <div className={s.postsSection}>
        <h3 className={s.postsHeading}>
          <span className={s.postsHeadingDot} />
          Posts
        </h3>

        {posts.length === 0 ? (
          <div className={s.empty}>
            <div className={s.emptyIcon}>✦</div>
            <p>No posts yet</p>
          </div>
        ) : (
          posts.map(post => (
            <PostCard key={post.id} post={post} onRefresh={loadProfile} />
          ))
        )}
      </div>
    </div>
  );
}
