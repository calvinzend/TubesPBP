import { useState } from "react";

interface ReplyType {
  tweet_id: string; // <-- Add this!
  reply_id: string;
  content: string | null;
  image_path: string | null;
  replyToId: string | null;
  user: {
    name: string;
    username: string;
    profilePicture: string | null;
  };
  replies?: ReplyType[];
}

interface ReplyProps {
  reply: ReplyType;
  tweet_id: string;
  userId: string | null;
  setReplies: React.Dispatch<React.SetStateAction<ReplyType[]>>;
  depth?: number;
}

export const Reply = ({
  reply,
  tweet_id,
  userId,
  setReplies,
  depth = 0,
}: ReplyProps) => {
  const [showReplies, setShowReplies] = useState(false);
  const [nestedReplies, setNestedReplies] = useState<ReplyType[]>([]);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [localReplyContent, setLocalReplyContent] = useState("");
  const [localReplyImage, setLocalReplyImage] = useState<File | null>(null);

  // Fetch nested replies for this reply
  const fetchNestedReplies = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/posts/${reply.tweet_id}/replies`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await response.json();
      console.log("=============================");
      console.log("Fetched nested replies for", reply.tweet_id, data.replies);
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
      const response = await fetch(
        `http://localhost:3000/posts/${parent_id}/replies`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        }
      );
      if (response.ok) {
        setLocalReplyContent("");
        setLocalReplyImage(null);
        setShowReplyForm(false);
        fetchNestedReplies(); // Refresh nested replies after posting
      }
    } catch (error) {
      console.error("Error submitting reply:", error);
    }
  };

  return (
    <div
      style={{
        marginLeft: depth * 20 + "px",
        borderLeft: depth > 0 ? "1px solid #444" : "none",
        paddingLeft: depth > 0 ? "10px" : "0",
        cursor: "pointer",
        marginBottom: "10px",
      }}
      onClick={handleReplyClick}
    >
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "14px",
          alignItems: "flex-start",
        }}
      >
        <img
          src={reply.user?.profilePicture || "default-profile.png"}
          alt="profile"
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 500 }}>{reply.user?.name}</div>
          {reply.content && (
            <div
              style={{
                fontSize: "14px",
                color: "#fff",
                marginBottom: "6px",
              }}
            >
              {reply.content}
            </div>
          )}
          {reply.image_path && (
            <img
              src={reply.image_path || ""}
              alt="reply"
              style={{
                width: "120px",
                height: "120px",
                objectFit: "cover",
                borderRadius: "8px",
                border: "1px solid #ccc",
                marginBottom: "6px",
              }}
            />
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowReplyForm(!showReplyForm);
            }}
            style={{
              background: "none",
              border: "none",
              color: "#1da1f2",
              cursor: "pointer",
              fontSize: "14px",
              padding: 0,
            }}
          >
            Reply
          </button>

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
                      tweet_id={nestedReply.tweet_id} // <-- Use tweet_id, not reply_id!
                      userId={userId}
                      setReplies={setNestedReplies}
                      depth={depth + 1}
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
  );
};

export default Reply;