import { CiHeart } from "react-icons/ci";
import { FaRegComment } from "react-icons/fa";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { Link, useNavigate } from "react-router-dom";

interface PostProps {
  tweet_id: string;
  name: string;
  handle: string;
  content: string;
  image_path: string | null;
  profilePicture: string | null;
  user_id: string;
  likeCount: number;
  replyCount: number;
  createdAt: string;
  onOpenDetail?: (tweet_id: string) => void;
  refreshThread?: () => Promise<void>; // <-- Add this line
}

export const Post = ({
  tweet_id,
  name,
  handle,
  content,
  image_path,
  profilePicture,
  user_id,
  likeCount,
  replyCount,
  createdAt,
  onOpenDetail,
}: PostProps) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [likes, setLikes] = useState<number>(likeCount);
  const [liked, setLiked] = useState<boolean>(false);
  const [replyContent, setReplyContent] = useState<string>("");
  const [replyImage, setReplyImage] = useState<File | null>(null);
  const [showReplyForm, setShowReplyForm] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode<{ userId: string }>(token);
        setUserId(decoded.userId);
      } catch {
        setUserId(null);
      }
    }
  }, []);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userId) return;
    try {
      const response = await fetch(`http://localhost:3000/like/${tweet_id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: userId }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.likes !== undefined) {
          setLikes(data.likes);
        } else {
          setLikes((prev) => (liked ? prev - 1 : prev + 1));
        }
        setLiked((prev) => !prev);
      } else {
        console.error("Failed to like post:", await response.text());
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    if (!replyContent.trim() && !replyImage) return;

    const formData = new FormData();
    formData.append("user_id", userId);
    formData.append("content", replyContent);
    if (replyImage) formData.append("image_path", replyImage);

    try {
      const response = await fetch(`http://localhost:3000/posts/${tweet_id}/replies`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      if (response.ok) {
        setReplyContent("");
        setReplyImage(null);
        setShowReplyForm(false);
      }
    } catch (error) {
      console.error("Error submitting reply:", error);
    }
  };

  const formatCount = (count: number) =>
    count > 1000 ? (count / 1000).toFixed(1) + "k" : count.toString();

  const handlePostClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest("button") ||
      target.closest("input") ||
      target.closest("textarea") ||
      target.closest("a")
    ) {
      return;
    }
    if (typeof onOpenDetail === "function") {
      onOpenDetail(tweet_id);
    }
  };

  return (
    <div
      style={{ borderBottom: "1px solid #ddd", padding: "16px 0", cursor: "pointer" }}
      onClick={handlePostClick}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <img
          src={
            profilePicture
              ? profilePicture.startsWith("http")
                ? profilePicture
                : `http://localhost:3000/${profilePicture}`
              : "http://localhost:3000/uploads/default-profile.png"
          }
          alt="profile"
          style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover" }}
        />
        <div>
          <div style={{ fontWeight: 600 }}>{name}</div>
          <Link
            to={`/userpage/${user_id}`}
            style={{ color: "#1da1f2", fontSize: 14, textDecoration: "none" }}
            onClick={e => e.stopPropagation()}
          >
            @{handle}
          </Link>
        </div>
      </div>

      <p style={{ margin: "12px 0 8px 60px", whiteSpace: "pre-wrap" }}>{content}</p>

      {image_path && (
        <img
          src={`http://localhost:3000/${image_path}`}
          alt="post image"
          style={{
            maxWidth: "100%",
            maxHeight: 400,
            borderRadius: 8,
            marginLeft: 60,
            marginBottom: 12,
            objectFit: "cover",
          }}
        />
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          marginLeft: 60,
          marginBottom: 12,
          color: liked ? "red" : "#666",
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        <span onClick={handleLike} style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <CiHeart size={24} />
          <span>{formatCount(likes)}</span>
        </span>

        <span
          onClick={e => {
            e.stopPropagation();
            setShowReplyForm((v) => !v);
          }}
          style={{ display: "flex", alignItems: "center", gap: 4, color: "#666" }}
        >
          <FaRegComment size={20} />
          <span>{formatCount(replyCount)}</span>
        </span>
      </div>

      {showReplyForm && (
        <form onSubmit={handleReplySubmit} style={{ marginLeft: 60, marginBottom: 16 }}>
          <textarea
            rows={3}
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Write your reply..."
            style={{
              width: "100%",
              padding: 8,
              borderRadius: 8,
              border: "1px solid #ccc",
              resize: "none",
              fontSize: 14,
              marginBottom: 8,
              color: "#000",
            }}
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files && setReplyImage(e.target.files[0])}
            style={{ marginBottom: 8 }}
          />
          <br />
          <button
            type="submit"
            style={{
              padding: "6px 16px",
              backgroundColor: "#1da1f2",
              color: "white",
              borderRadius: 20,
              border: "none",
              cursor: "pointer",
            }}
          >
            Reply
          </button>
        </form>
      )}
    </div>
  );
};