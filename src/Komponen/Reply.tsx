import { useState } from "react";
import { ReplyType } from "../types/types";
import { CiHeart } from "react-icons/ci";
import { FaRegComment } from "react-icons/fa";
import { TweetDetail } from "../pages/TweetDetail";
import { api, fetchWithAuth } from "../../utils/api";
import gambar from "../../uploads/default-profile.png";


interface ReplyProps {
  reply: ReplyType;
  tweet_id: string;
  userId: string | null;
  setReplies: React.Dispatch<React.SetStateAction<ReplyType[]>>;
  depth?: number;
  refreshThread?: () => Promise<void>;
}

export const Reply = ({
  reply,
  tweet_id,
  userId,
  setReplies,
  depth = 0,
  refreshThread,
}: ReplyProps) => {
  const [showReplies, setShowReplies] = useState(false);
  const [nestedReplies, setNestedReplies] = useState<ReplyType[]>([]);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [localReplyContent, setLocalReplyContent] = useState("");
  const [localReplyImage, setLocalReplyImage] = useState<File | null>(null);
  const [likes, setLikes] = useState<number>(reply.likeCount || 0);
  const [liked, setLiked] = useState<boolean>(false);
  const [showModal, setShowModal] = useState(false);

  // Fetch nested replies for this reply
  const fetchNestedReplies = async () => {
    try {
      const response = await fetchWithAuth(`/posts/${reply.tweet_id}/replies`);
      const data = await response.json();
      setNestedReplies(data.replies || []);
    } catch (error) {
      console.error("Error fetching nested replies:", error);
    }
  };

  // Toggle showing nested replies
  const handleReplyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowReplies((prev) => !prev);
    if (!showReplies) fetchNestedReplies();
  };

  // Handle submitting a reply to this reply
  const handleLocalReply = async (
    e: React.FormEvent,
    parent_id: string
  ) => {
    e.preventDefault();
    if (!userId || (!localReplyContent.trim() && !localReplyImage)) return;

    const formData = new FormData();
    formData.append("user_id", userId);
    formData.append("content", localReplyContent);
    if (localReplyImage) formData.append("image_path", localReplyImage);

    try {
      const response = await fetchWithAuth(`/posts/${parent_id}/replies`, {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        setLocalReplyContent("");
        setLocalReplyImage(null);
        setShowReplyForm(false);
        fetchNestedReplies(); // Refresh nested replies after posting
        if (refreshThread) await refreshThread(); // Refresh parent thread if needed
      }
    } catch (error) {
      console.error("Error submitting reply:", error);
    }
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userId) return;
    try {
      const response = await fetchWithAuth(`/like/${reply.tweet_id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        console.error("Failed to like reply:", await response.text());
      }
    } catch (error) {
      console.error("Error liking reply:", error);
    }
  };

  const formatCount = (count: number) =>
    count > 1000 ? (count / 1000).toFixed(1) + "k" : count.toString();

  // Open modal for this reply as a tweet
  const handleOpenModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowModal(true);
  };

  return (
    <>
      <div
        style={{
          marginLeft: depth * 20 + "px",
          borderLeft: depth > 0 ? "1px solid #444" : "none",
          paddingLeft: depth > 0 ? "10px" : "0",
          cursor: "pointer",
          marginBottom: "16px",
          background: showModal ? "rgba(0,0,0,0.1)" : "transparent",
        }}
        onClick={handleOpenModal}
      >
        <div
          style={{
            display: "flex",
            gap: "12px",
            alignItems: "flex-start",
          }}
        >
          <img
            src={reply.user?.profilePicture ? api.getProfilePicture(reply.user.profilePicture) : gambar}
            alt="profile"
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              objectFit: "cover",
              marginTop: 2,
            }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 500, marginBottom: 2 }}>
              {reply.user?.name}
              <span style={{ color: "#1da1f2", fontSize: 13, marginLeft: 8 }}>
                @{reply.user?.username}
              </span>
            </div>
            {reply.content && (
              <div
                style={{
                  fontSize: "14px",
                  color: "#fff",
                  marginBottom: reply.image_path ? "8px" : "12px",
                  marginTop: "4px",
                  lineHeight: 1.5,
                }}
              >
                {reply.content}
              </div>
            )}
            {reply.image_path && (
              <img
                src={api.getProfilePicture(reply.image_path)}
                alt="reply"
                style={{
                  width: "120px",
                  height: "120px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  marginBottom: "8px",
                  marginTop: "4px",
                  display: "block",
                }}
              />
            )}

            {/* Like and reply count */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                margin: "8px 0",
                color: liked ? "red" : "#666",
                cursor: "pointer",
                userSelect: "none",
              }}
            >
              <span onClick={handleLike} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <CiHeart size={20} />
                <span>{formatCount(likes)}</span>
              </span>

              <span
                onClick={e => {
                  e.stopPropagation();
                  setShowReplyForm((v) => !v);
                }}
                style={{ display: "flex", alignItems: "center", gap: 4, color: "#666" }}
              >
                <FaRegComment size={16} />
                <span>{formatCount(reply.replyCount || 0)}</span>
              </span>
            </div>

            {/* Reply form */}
            {showReplyForm && (
              <form
                onSubmit={(e) => handleLocalReply(e, reply.tweet_id)}
                style={{ marginTop: "10px" }}
              >
                <textarea
                  value={localReplyContent}
                  onChange={(e) => setLocalReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  rows={2}
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                    fontSize: "14px",
                    resize: "none",
                    color: "#000",
                    marginBottom: "8px",
                  }}
                />
                <div style={{ display: "flex", gap: "10px" }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      e.target.files && setLocalReplyImage(e.target.files[0])
                    }
                  />
                  <button
                    type="submit"
                    style={{
                      padding: "4px 12px",
                      borderRadius: "20px",
                      border: "none",
                      backgroundColor: "#007bff",
                      color: "white",
                      cursor: "pointer",
                    }}
                  >
                    Reply
                  </button>
                </div>
              </form>
            )}

            {/* Nested replies */}
            {showReplies && (
              <div>
                {nestedReplies.length > 0 ? (
                  nestedReplies
                    .filter(nestedReply => nestedReply.reply_id !== tweet_id) // Filter out self
                    .map((nestedReply) => (
                      <Reply
                        key={nestedReply.tweet_id}
                        reply={nestedReply}
                        tweet_id={nestedReply.tweet_id}
                        userId={userId}
                        setReplies={setNestedReplies}
                        depth={depth + 1}
                        refreshThread={refreshThread}
                      />
                    ))
                ) : (
                  <div style={{ color: "#aaa", marginLeft: 20 }}>
                    No replies yet.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal for opening reply as tweet */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.7)",
            zIndex: 4000,
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: "#222",
              borderRadius: 12,
              padding: 24,
              minWidth: 700,
              maxHeight: "100vh",
              overflowY: "auto",
              position: "relative"
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                background: "transparent",
                color: "#fff",
                border: "none",
                fontSize: 24,
                cursor: "pointer"
              }}
              onClick={() => setShowModal(false)}
            >
              ×
            </button>
            <TweetDetail tweet_id={reply.tweet_id} />
          </div>
        </div>
      )}
    </>
  );
};

export default Reply;