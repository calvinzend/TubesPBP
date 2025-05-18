import { CiHeart } from "react-icons/ci";
import { FaRegComment } from "react-icons/fa";
import { useEffect, useState } from "react";
import {jwtDecode} from "jwt-decode";

interface PostProps {
  tweet_id: string;
  name: string;
  handle: string;
  content: string;
  image_path: string;
  profilePicture: string;
  user?: {
    name: string;
    username: string;
    profilePicture: string;
  };
}

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

export const Post = ({ tweet_id, name, handle, content, image_path,profilePicture }: PostProps) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [likes, setLikes] = useState<number>(0);
  const [liked, setLiked] = useState<boolean>(false);
  const [replies, setReplies] = useState<ReplyType[]>([]);
  const [replyContent, setReplyContent] = useState<string>("");
  const [replyImage, setReplyImage] = useState<File | null>(null);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode<{ userId: string }>(token);
      setUserId(decoded.userId);
    }
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchUser = async () => {
      try {
        const response = await fetch(`http://localhost:3000/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, [userId]);

   const fetchReply = async () => {
      try {
        const response = await fetch(`http://localhost:3000/posts/${tweet_id}/replies`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await response.json();
        const nestedReplies = buildNestedReplies(data.replies || []);
        setReplies(nestedReplies);
      } catch (error) {
        console.error("Error fetching replies:", error);
      }
    };


  useEffect(() => {
    if (!tweet_id) return;

    const fetchLikes = async () => {
      try {
        const response = await fetch(`http://localhost:3000/likes/${tweet_id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await response.json();
        setLikes(data.likes || 0);
      } catch (error) {
        console.error("Error fetching likes:", error);
      }
    };

   

    fetchLikes();
    fetchReply();
  }, [tweet_id]);

  
  const buildNestedReplies = (replies: ReplyType[]): ReplyType[] => {
  const replyMap = new Map<string, ReplyType>();
  const roots: ReplyType[] = [];

  // Init mapping
  replies.forEach(reply => {
    reply.replies = [];
    replyMap.set(reply.reply_id, reply);
  });

  replies.forEach(reply => {
    if (reply.replyToId && replyMap.has(reply.replyToId)) {
      replyMap.get(reply.replyToId)?.replies?.push(reply);
    } else {
      roots.push(reply); // top-level reply
    }
  });

  return roots;
};



  const handleLike = async () => {
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
        setLikes((prevLikes) => (liked ? prevLikes - 1 : prevLikes + 1));
        setLiked((prevLiked) => !prevLiked);
      } else {
        console.error("Error liking the post:", await response.text());
      }
    } catch (error) {
      console.error("Error in handleLike:", error);
    }
  };

  const handleReply = async (e: React.FormEvent, parentId: string | null = null) => {
  e.preventDefault();
  
  if (!replyContent.trim() && !replyImage) return;
  if (!userId) return;

  const formData = new FormData();
  formData.append("user_id", userId);
  formData.append("parent_id", parentId || tweet_id);
  if (replyContent.trim()) formData.append("content", replyContent);
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
      const newReply = await response.json();
      if (parentId) {
        // Jika ini reply dari reply, update replies yang sesuai
        setReplies(prevReplies => 
          prevReplies.map(reply => 
            reply.reply_id === parentId 
              ? { ...reply, replies: [...(reply.replies || []), newReply.reply] } 
              : reply
          )
        );
      } else {
        // Jika ini reply langsung ke tweet
        setReplies(prevReplies => [...prevReplies, newReply.reply]);
      }
      setReplyContent("");
      setReplyImage(null);
      setActiveReplyId(null); // Reset active reply
      fetchReply(); // Fetch updated replies
    }
  } catch (error) {
    console.error("Error posting reply:", error);
  }
};

  const formattedLikes = likes > 1000 ? `${(likes / 1000).toFixed(1)}k` : likes;

   const toggleReplyForm = () => {
    setShowReplyForm(!showReplyForm);
  };


  const Reply = ({ reply, depth = 0 }: { reply: ReplyType; depth?: number }) => {
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
            <Reply key={nestedReply.reply_id} reply={nestedReply} depth={depth + 1} />
          ))}
        </div>
      );
    };

  

  return (
    <div style={{ padding: "20px", borderBottom: "1px solid #ccc" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
        <img
          src={profilePicture || "default-profile.png"}
          alt="profile"
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            objectFit: "cover",
            marginRight: "12px",
          }}
        />
        <div>
          <div style={{ fontWeight: 600 }}>{name}</div>
          <div style={{ color: "#555", fontSize: "14px" }}>{handle}</div>
        </div>
      </div>

      {/* Content */}
      <div
        style={{ fontSize: "16px", lineHeight: "1.5", marginBottom: "12px", marginLeft: "60px" }}
      >
        {content}
      </div>

      {/* Image */}
      {image_path && (
        <img
          src={image_path}
          alt="post"
          style={{
            width: "100%",
            maxWidth: "600px",
            height: "auto",
            borderRadius: "8px",
            marginBottom: "12px",
          }}
        />
      )}

      {/* Actions: Like and Comment */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "24px",
          color: "#666",
          marginLeft: "60px",
          marginBottom: "12px",
        }}
      >
        <span 
          style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "6px",
            cursor: "pointer" 
          }}
          onClick={toggleReplyForm} 
        >
          <FaRegComment size={18} />
          <span style={{ fontSize: "14px" }}>Reply</span>
        </span>
        <span
          onClick={handleLike}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            cursor: "pointer",
          }}
        >
          <CiHeart size={20} color={liked ? "red" : "gray"} />
          <span style={{ fontSize: "14px" }}>{formattedLikes}</span>
        </span>
      </div>

      
      {/* Reply Form */}
      {showReplyForm && (
      <form
        onSubmit={handleReply}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          marginLeft: "60px",
          marginBottom: "16px",
        }}
      >
        <textarea
          value={replyContent}
          onChange={(e) => setReplyContent(e.target.value)}
          placeholder="Write a reply..."
          rows={3}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontSize: "14px",
            resize: "none",
            color: "#000",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files && setReplyImage(e.target.files[0])}
          />
          <button
            type="submit"
            style={{
              padding: "8px 16px",
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

        {replyImage && (
          <img
            src={URL.createObjectURL(replyImage)}
            alt="Preview"
            style={{
              marginTop: "10px",
              width: "120px",
              height: "120px",
              objectFit: "cover",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          />
        )}
      </form>
      )}


      {/* Replies */}
     <div style={{ marginLeft: "60px" }}>
        {replies
          .filter((reply) => reply.user && !reply.replyToId)
          .map((reply) => (
            <Reply key={reply.reply_id} reply={reply} />
        ))}
    </div>
    </div>
  );
};


