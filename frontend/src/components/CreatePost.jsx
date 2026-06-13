import api from "../api/axios";
import toast from "react-hot-toast";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import s from "./CreatePost.module.css";

export default function CreatePost({ onPostCreated }) {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const { user } = useAuth();
  const fileRef = useRef(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!image) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(image);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [image]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !image) {
      toast.error("Add text or an image");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();

      formData.append("content", content);

      if (image) {
        formData.append("file", image);
      }

      await api.post("/api/posts", formData);

      toast.success("Posted!");
      setContent("");
      setImage(null);
      if (fileRef.current) {
        fileRef.current.value = "";
      }

      onPostCreated();
    } catch {
      toast.error("Could not create post");
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleSubmit(e);
  };

  return (
    <div className={s.card}>
      <div className={s.top}>
        <div className={s.avatar}>
          {user.profilePicture ?
            <img src={user.profilePicture} alt={user.username} />
          : user.username[0].toUpperCase()}
        </div>{" "}
        <textarea
          className={s.textarea}
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKey}
          rows={3}
          maxLength={500}
        />
      </div>

      {image && (
        <div className={s.previewContainer}>
          <img src={previewUrl} alt="preview" className={s.previewImage} />

          <button
            type="button"
            className={s.removeImage}
            onClick={() => {
              setImage(null);

              if (fileRef.current) {
                fileRef.current.value = "";
              }
            }}
          >
            ✕
          </button>
        </div>
      )}

      <div className={s.footer}>
        <span className={s.hint}>Ctrl+Enter to post</span>
        <div className={s.right}>
          <span
            className={`${s.counter} ${content.length > 450 ? s.warn : ""}`}
          >
            {content.length}/500
          </span>
          <label
            className={s.imageBtn}
            style={{ pointerEvents: loading ? "none" : "auto" }}
          >
            📷{" "}
            {image ?
              image.name.length > 15 ?
                image.name.slice(0, 15) + "..."
              : image.name
            : "Add Photo"}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const file = e.target.files[0];

                if (!file) return;

                if (!file.type.startsWith("image/")) {
                  toast.error("Only images allowed");
                  return;
                }

                if (file.size > 5 * 1024 * 1024) {
                  toast.error("Image must be under 5MB");
                  return;
                }

                setImage(file);
              }}
            />
          </label>

          <button
            className={s.postBtn}
            onClick={handleSubmit}
            disabled={loading || (!content.trim() && !image)}
          >
            {loading ? "Posting..." : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
}
