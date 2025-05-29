import React, { useEffect, useState } from "react";
import { Post } from "../Komponen/Post";
import { FaFileImage } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
import { TweetDetail } from "./TweetDetail";
import { postWithAuth, fetchWithAuth } from "../../utils/api"; // Import helper
import { api } from "../../utils/api"; // Import api config
import gambar from "../../uploads/default-profile.png";


interface DecodedToken {
  userId: string;
}


export const HomePage = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [postContent, setPostContent] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [showTweetModal, setShowTweetModal] = useState(false);
  const [selectedTweetId, setSelectedTweetId] = useState<string | null>(null);

  interface PostType {
    tweet_id: string;
    content: string;
    image_path?: string;
    likeCount: number;
    replyCount: number;
    createdAt: string;
    user: {
      user_id: string;
      name: string;
      username: string;
      profilePicture: string;
    };
  }

  const [posts, setPosts] = useState<PostType[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode<DecodedToken>(token);
      setUserId(decoded.userId);
    }
  }, []);

  useEffect(() => {
    if (!userId) return;
    const fetchUser = async () => {
      try {
        const res = await fetchWithAuth(`/users/${userId}`);
        const data = await res.json();
        setUserData(data);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
  }, [userId]);

  const addTweet = async () => {
    try {
      const formData = new FormData();
      formData.append("user_id", userId || "");
      formData.append("content", postContent || "");
      if (imageFile) formData.append("image", imageFile);

      const response = await postWithAuth("/posts", formData, true);
      if (response.ok) {
        setPostContent("");
        setImageFile(null);
        await fetchPosts(); // Refresh daftar post setelah nambah
      }
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await fetchWithAuth("/posts");
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const handleOpenTweetModal = (tweet_id: string) => {
    setSelectedTweetId(tweet_id);
    setShowTweetModal(true);
  };

  useEffect(() => {
    fetchPosts();
  }, []);



  return (
    <div style={{ maxWidth: "100%", margin: "0" }}>
      <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
        <img
          src={api.getProfilePicture(userData?.user?.profilePicture || "uploads\\default-profile.png") || gambar}
          alt="profile"
          style={{
            width: "50px",
            height: "40px",
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />
        <input
          type="text"
          placeholder="What's happening?"
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            background: "black",
            border: "none",
            borderBottom: "2px solid white",
            fontSize: "16px",
          }}
        />
        <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "10px" }}>
          <input
            type="file"
            id="image-upload"
            style={{ display: "none" }}
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setImageFile(file);
            }}
          />
          <label htmlFor="image-upload" style={{ cursor: "pointer", color: "white" }}>
            <FaFileImage size={24} />
          </label>
          <button
            onClick={addTweet}
            type="button"
            className="post-button"
            style={{
              background: "white",
              color: "black",
              fontWeight: "bold",
              padding: "6px 16px",
              borderRadius: "20px",
              border: "none",
              cursor: "pointer",
            }}
          >
            Post
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {posts.map((post) => (
          <Post
            key={post.tweet_id}
            tweet_id={post.tweet_id}
            name={post.user?.name || "Unknown"}
            handle={`${post.user?.username || "unknown"}`}
            content={post.content}
            image_path={post.image_path || ""}
            profilePicture={api.getProfilePicture(post.user?.profilePicture || "uploads\\default-profile.png")}
            user_id={post.user?.user_id || ""}
            likeCount={Number(post.likeCount) || 0}
            replyCount={Number(post.replyCount) || 0}
            createdAt={post.createdAt}
            onOpenDetail={handleOpenTweetModal}
          />
        ))}

        {/* tweet modal */}
        {showTweetModal && selectedTweetId && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.8)",
              zIndex: 3000,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
            onClick={() => setShowTweetModal(false)}
          >
            <div
              style={{
                background: "#222",
                borderRadius: 12,
                padding: 24,
                minWidth: 700,
                maxHeight: "100vh",
                overflowY: "auto",
                position: "relative",
              }}
              onClick={(e) => e.stopPropagation()}
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
                  cursor: "pointer",
                }}
                onClick={() => setShowTweetModal(false)}
              >
                ×
              </button>
              <TweetDetail tweet_id={selectedTweetId} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
