import { useState } from "react";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";


interface ReplyType {
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

export const Reply = ({ reply, tweet_id, userId, setReplies, depth = 0 }: ReplyProps) => {
    const { id } = useParams();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [localReplyContent, setLocalReplyContent] = useState("");
  const [localReplyImage, setLocalReplyImage] = useState<File | null>(null);

  const handleLocalReply = async (e: React.FormEvent, parentId: string) => {
    e.preventDefault();

    if (!localReplyContent.trim() && !localReplyImage) return;
    if (!userId) return;

    const formData = new FormData();
    formData.append("user_id", userId);
    formData.append("parent_id", parentId);
    if (localReplyContent.trim()) formData.append("content", localReplyContent);
    if (localReplyImage) formData.append("image_path", localReplyImage);

    try {
      const response = await fetch(`http://localhost:3000/posts/${tweet_id}/replies`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      if (response.ok) {
        const newReply = await response.json();
        setReplies(prevReplies => 
          prevReplies.map(r => 
            r.reply_id === parentId 
              ? { ...r, replies: [...(r.replies || []), newReply.reply] } 
              : r
          )
        );
        setLocalReplyContent("");
        setLocalReplyImage(null);
        setShowReplyForm(false);
      }
    } catch (error) {
      console.error("Error posting reply:", error);
    }
  };

  return (
    <div
      style={{ 
        marginLeft: depth * 20 + 'px',
        borderLeft: depth > 0 ? '1px solid #444' : 'none',
        paddingLeft: depth > 0 ? '10px' : '0'
      }}
    >
      <div style={{ display: "flex", gap: "12px", marginBottom: "14px", alignItems: "flex-start" }}>
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
            <div style={{ fontSize: "14px", color: "#fff", marginBottom: "6px" }}>
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
                marginBottom: "6px"
              }}
            />
          )}
          
          <button 
            onClick={() => setShowReplyForm(!showReplyForm)}
            style={{
              background: 'none',
              border: 'none',
              color: '#1da1f2',
              cursor: 'pointer',
              fontSize: '14px',
              padding: 0
            }}
          >
            Reply
          </button>
          
          {showReplyForm && (
            <form onSubmit={(e) => handleLocalReply(e, reply.reply_id)} style={{ marginTop: '10px' }}>
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
                  marginBottom: "8px"
                }}
              />
              <div style={{ display: "flex", gap: "10px" }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files && setLocalReplyImage(e.target.files[0])}
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
        </div>
      </div>
      
      {/* Render nested replies */}
      {reply.replies?.map((nestedReply) => (
        <Reply key={nestedReply.reply_id} reply={nestedReply} tweet_id={tweet_id} userId={userId} setReplies={setReplies} depth={depth + 1} />
      ))}
    </div>
  );
};
export default Reply;