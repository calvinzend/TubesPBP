import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback, useRef } from "react";
import { Post } from "../Komponen/Post";
import { Reply } from "../Komponen/Reply";
import { ReplyType } from "../types/types";
import { fetchWithAuth, putWithAuth, deleteWithAuth, api } from "../../utils/api";
import { getProfilePicture } from "../../utils/profilePic";

export const TweetDetail = ({ tweet_id: propTweetId }: { tweet_id?: string }) => {
  const params = useParams<{ tweet_id: string }>();
  const tweet_id = propTweetId || params.tweet_id;
  const [tweet, setTweet] = useState<any>(null);
  const [replies, setReplies] = useState<ReplyType[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const fetchThread = useCallback(async () => {
    const res = await fetchWithAuth(`/posts/${tweet_id}/thread`);
    const data = await res.json();
    setTweet(data.tweet);
    setReplies(data.replies || []);
  }, [tweet_id]);

  useEffect(() => {
    if (tweet_id) fetchThread();
  }, [tweet_id, fetchThread]);

  // Tutup menu jika klik di luar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  // Handler untuk hapus post
  const handleDelete = async () => {
    if (!window.confirm("Delete this post beserta semua reply-nya?")) return;
    await deleteWithAuth(`/posts/${tweet_id}`);
    navigate("/");
  };

  // Handler untuk mulai edit
  const handleEdit = () => {
    setEditContent(tweet.content);
    setIsEditing(true);
  };

  // Handler submit edit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("content", editContent);
    await putWithAuth(`/posts/${tweet_id}`, formData, true);
    setIsEditing(false);
    fetchThread();
  };

  if (!tweet) return <div style={{ color: "#fff" }}>Loading...</div>;

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", color: "#fff", position: "relative" }}>
      {/* Titik tiga menu */}
      {!isEditing && (
        <div style={{ position: "absolute", right: 10, top: 10, zIndex: 2 }}>
          <button
            onClick={() => setShowMenu((v) => !v)}
            style={{
              background: "none",
              border: "none",
              fontSize: 24,
              color: "#fff",
              cursor: "pointer",
              padding: 0,
              lineHeight: 1,
            }}
            aria-label="More"
          >
            &#8942;
          </button>
          {showMenu && (
            <div
              ref={menuRef}
              style={{
                position: "absolute",
                right: 0,
                top: 30,
                background: "#222",
                border: "1px solid #444",
                borderRadius: 6,
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                minWidth: 100,
                zIndex: 10,
              }}
            >
              <button
                onClick={() => {
                  setShowMenu(false);
                  handleEdit();
                }}
                style={{
                  display: "block",
                  width: "100%",
                  background: "none",
                  border: "none",
                  color: "#fff",
                  padding: "10px 16px",
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                Edit
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  handleDelete();
                }}
                style={{
                  display: "block",
                  width: "100%",
                  background: "none",
                  border: "none",
                  color: "red",
                  padding: "10px 16px",
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      )}

      {/* Edit UI */}
      {isEditing ? (
        <form onSubmit={handleEditSubmit} style={{ marginBottom: 20 }}>
          <textarea
            value={editContent}
            onChange={e => setEditContent(e.target.value)}
            rows={4}
            style={{ width: "100%", marginBottom: 10, color: "#000" }}
          />
          <div>
            <button
              type="submit"
              style={{
                background: "#1da1f2",
                color: "#fff",
                border: "none",
                borderRadius: 5,
                padding: "8px 20px",
                fontWeight: 600,
                cursor: "pointer",
                marginRight: 8,
                boxShadow: "0 1px 2px rgba(0,0,0,0.07)"
              }}
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              style={{
                background: "#e6ecf0",
                color: "#222",
                border: "none",
                borderRadius: 5,
                padding: "8px 20px",
                fontWeight: 600,
                cursor: "pointer",
                marginLeft: 8,
                boxShadow: "0 1px 2px rgba(0,0,0,0.07)"
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <Post
          tweet_id={tweet.tweet_id}
          name={tweet.user?.name || "Unknown"}
          handle={tweet.user?.username || "unknown"}
          content={tweet.content}
          image_path={tweet.image_path}
          profilePicture={getProfilePicture(tweet.user?.profilePicture)}
          user_id={tweet.user?.user_id}
          likeCount={Number(tweet.likeCount) || 0}
          replyCount={Number(tweet.replyCount) || 0}
          createdAt={tweet.createdAt}
          refreshThread={fetchThread}
        />
      )}

      {/* Replies */}
      <h3 style={{ marginLeft: 20, padding: "20px 0 20px 0" }}>Replies</h3>
      <div style={{ marginLeft: 20 }}>
        {replies.length > 0 ? (
          replies.map((reply) => (
            <Reply
              key={reply.tweet_id}
              reply={reply}
              tweet_id={reply.tweet_id}
              userId={tweet.user?.user_id}
              setReplies={setReplies}
              depth={0}
              refreshThread={fetchThread}
            />
          ))
        ) : (
          <div style={{ color: "#aaa" }}>No replies yet.</div>
        )}
      </div>
    </div>
  );
};