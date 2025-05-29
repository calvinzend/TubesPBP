import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Post } from "../Komponen/Post";
import { jwtDecode } from "jwt-decode";
import { TweetDetail } from "./TweetDetail";
import { api } from "../../utils/api";
import gambar from "../../uploads/default-profile.png";


interface DecodedToken {
  userId: string;
  exp: number;
  iat: number;
}

export const UserPage = () => {
  const { id: paramUserId } = useParams<{ id: string }>();
  const [loggedInUserId, setLoggedInUserId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [updatedUser, setUpdatedUser] = useState<any>(null);
  const [isFormValid, setIsFormValid] = useState(false);
  const [followers, setFollowers] = useState<any[]>([]);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [following, setFollowing] = useState<any[]>([]);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showTweetModal, setShowTweetModal] = useState(false);
  const [selectedTweetId, setSelectedTweetId] = useState<string | null>(null);

  // Responsive
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Form validation
  useEffect(() => {
    if (!updatedUser) {
      setIsFormValid(false);
      return;
    }
    const { username, name, email, bio } = updatedUser;
    setIsFormValid(!!(username?.trim() && name?.trim() && email?.trim() && bio?.trim()));
  }, [updatedUser]);

  // Ambil token dan user ID
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode<DecodedToken>(token);
      setLoggedInUserId(decoded.userId);
      const targetUserId = paramUserId ?? decoded.userId;
      setUserId(targetUserId);
      fetchUser(targetUserId, token);
    }
  }, [paramUserId]);

  // Fetch user data
  const fetchUser = async (targetUserId: string, token: string) => {
    try {
      const response = await fetch(`${api.base}/users/${targetUserId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setUserData(data.user);
      setFollowersCount(data.followersCount || 0);
      setFollowingCount(data.followingCount || 0);
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  // Fetch user posts
  useEffect(() => {
    const targetId = paramUserId ?? loggedInUserId;
    if (!targetId) return;
    const fetchPosts = async () => {
      try {
        const response = await fetch(`${api.base}/posts/user/${targetId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await response.json();
        setUserPosts(data.posts || []);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };
    fetchPosts();
  }, [paramUserId, loggedInUserId]);

  // Cek following
  useEffect(() => {
    if (!userId || !loggedInUserId) return;
    const checkFollowing = async () => {
      const response = await fetch(`${api.base}/followers/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await response.json();
      setFollowersCount(data.followers?.length || 0);
      const found = (data.followers || []).some(
        (f: any) => f.follower?.user_id === loggedInUserId
      );
      setIsFollowing(found);
    };
    checkFollowing();
  }, [userId, loggedInUserId]);

  // Modal handlers
  const handleOpenTweetModal = (tweet_id: string) => {
    setSelectedTweetId(tweet_id);
    setShowTweetModal(true);
  };

  // Edit user
  const updateUser = async () => {
    try {
      const response = await fetch(`${api.base}/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(updatedUser),
      });
      if (!response.ok) throw new Error("Failed to update user");
      setShowModal(false);

      // Refresh user data after update
      const token = localStorage.getItem("token");
      if (token && userId) {
        fetchUser(userId, token);
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  // Follow
  const handleFollow = async () => {
    try {
      const response = await fetch(`${api.base}/follow/${userId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await response.json();
      setFollowersCount(data.followersCount || 0);
      setIsFollowing(data.isFollowing);
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  // Followers modal
  const fetchFollowers = async () => {
    try {
      const response = await fetch(`${api.base}/followers/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await response.json();
      setFollowers(data.followers || []);
      const found = (data.followers || []).some(
        (f: any) => f.follower?.user_id === loggedInUserId
      );
      setIsFollowing(found);
      setShowFollowersModal(true);
    } catch (error) {
      console.error("Error fetching followers:", error);
    }
  };

  // Following modal
  const fetchFollowing = async () => {
    try {
      const response = await fetch(`${api.base}/following/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await response.json();
      setFollowing(data.following || []);
      setShowFollowingModal(true);
    } catch (error) {
      console.error("Error fetching following:", error);
    }
  };

  useEffect(() => {
    if (showModal && userData) {
      setUpdatedUser({
        username: userData.username,
        name: userData.name,
        email: userData.email,
        bio: userData.bio,
        password: "",
        oldPassword: "",
      });
    }
  }, [showModal, userData]);

  if (!userData) {
    return <div style={{ color: "white", textAlign: "center" }}>Loading...</div>;
  }

  return (
    <div
      style={{
        backgroundColor: "black",
        color: "white",
        padding: isMobile ? "10px" : "20px",
        minHeight: "100vh",
      }}
    >
      {/* Profile Header */}
      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between",
          alignItems: isMobile ? "center" : "start",
          gap: isMobile ? "20px" : "0px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: "20px",
            alignItems: "center",
            textAlign: isMobile ? "center" : "left",
          }}
        >
          <img
            src={api.getProfilePicture(userData.profilePicture || "uploads\\default-profile.png") || gambar}
            alt="profile"
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              backgroundColor: "white",
              objectFit: "cover",
            }}
          />
          <div>
            <div style={{ fontSize: "20px", fontWeight: "bold" }}>{userData.name}</div>
            <div style={{ color: "#ccc" }}>@{userData.username}</div>
            <div style={{ marginTop: "8px" }}>
              <span style={{ marginRight: "20px", cursor: "pointer" }} onClick={fetchFollowing}>
                {followingCount} following
              </span>
              <span style={{ cursor: "pointer", marginRight: "20px" }} onClick={fetchFollowers}>
                {followersCount} followers
              </span>
            </div>
            <div style={{ marginTop: "8px", fontSize: "12px" }}>{userData.bio}</div>
            <div style={{ marginTop: "20px" }}>
              {loggedInUserId !== userId && (
                <div style={{ marginTop: "20px" }}>
                  <button
                    onClick={handleFollow}
                    style={{
                      backgroundColor: isFollowing ? "#1da1f2" : "#fff",
                      color: isFollowing ? "#fff" : "#000",
                      border: "none",
                      borderRadius: "30px",
                      padding: "8px 20px",
                      fontSize: "16px",
                      cursor: "pointer",
                      width: isMobile ? "100%" : "auto",
                    }}
                  >
                    {isFollowing ? "Followed" : "Follow"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {loggedInUserId === userId && (
          <button
            onClick={() => setShowModal(true)}
            style={{
              backgroundColor: "#333",
              color: "white",
              border: "none",
              borderRadius: "30px",
              padding: "8px 20px",
              fontSize: "16px",
              cursor: "pointer",
              width: isMobile ? "100%" : "auto",
            }}
          >
            Edit Profile
          </button>
        )}
      </div>

      {/* Post Section */}
      <div style={{ marginTop: "40px" }}>
        {userPosts.length > 0 ? (
          userPosts.map((post) => (
            <Post
              key={post.tweet_id}
              tweet_id={post.tweet_id}
              name={userData.name}
              handle={`${userData.username}`}
              content={post.content}
              image_path={post.image_path || ""}
              profilePicture={api.getProfilePicture(userData.profilePicture)}
              user_id={userData.user_id}
              likeCount={Number(post.likeCount) || 0}
              replyCount={Number(post.replyCount) || 0}
              createdAt={post.createdAt || ""}
              onOpenDetail={handleOpenTweetModal}
            />
          ))
        ) : (
          <p style={{ textAlign: "center", color: "#aaa" }}>Belum ada postingan.</p>
        )}
      </div>

      {/* Followers Modal */}
      {showFollowersModal && (
        <Modal onClose={() => setShowFollowersModal(false)} title="Followers">
          {followers.length === 0 ? (
            <p>No followers yet.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {followers.map(f => (
                <li key={f.follower?.user_id || f.user_id} style={{ marginBottom: "10px", display: "flex", alignItems: "center" }}>
                  <img
                    src={api.getProfilePicture(f.follower?.profilePicture || "uploads\\default-profile.png")}
                    alt="profile"
                    style={{ width: "40px", height: "40px", borderRadius: "50%", marginRight: "10px" }}
                  />
                  <span>
                    <strong>{f.follower?.name}</strong>{" "}
                    <Link
                      to={`/userpage/${f.follower?.user_id}`}
                      style={{ color: "#1da1f2", fontSize: 14, textDecoration: "none" }}
                      onClick={() => setShowFollowersModal(false)}
                    >
                      @{f.follower?.username}
                    </Link>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Modal>
      )}

      {/* Following Modal */}
      {showFollowingModal && (
        <Modal onClose={() => setShowFollowingModal(false)} title="Following">
          {following.length === 0 ? (
            <p>Not following anyone yet.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {following.map(f => (
                <li key={f.following?.user_id || f.following_id} style={{ marginBottom: "10px", display: "flex", alignItems: "center" }}>
                  <img
                    src={api.getProfilePicture(f.following?.profilePicture)}
                    alt="profile"
                    style={{ width: "40px", height: "40px", borderRadius: "50%", marginRight: "10px" }}
                  />
                  <span>
                    <strong>{f.following?.name}</strong>{" "}
                    <Link
                      to={`/userpage/${f.following?.user_id}`}
                      style={{ color: "#1da1f2", fontSize: 14, textDecoration: "none" }}
                      onClick={() => setShowFollowingModal(false)}
                    >
                      @{f.following?.username}
                    </Link>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Modal>
      )}

      {/* Edit Modal */}
      {showModal && loggedInUserId === userId && (
        <Modal onClose={() => setShowModal(false)} title="Edit Profile">
          <input
            type="text"
            placeholder="Username"
            value={updatedUser?.username || ""}
            onChange={(e) =>
              setUpdatedUser((prev: any) => ({ ...prev, username: e.target.value }))
            }
            style={inputStyle}
          />
          <input
            type="text"
            placeholder="Name"
            defaultValue={userData.name}
            onChange={(e) =>
              setUpdatedUser((prev: any) => ({ ...prev, name: e.target.value }))
            }
            style={inputStyle}
          />
          <input
            type="email"
            placeholder="Email"
            defaultValue={userData.email}
            onChange={(e) =>
              setUpdatedUser((prev: any) => ({ ...prev, email: e.target.value }))
            }
            style={inputStyle}
          />
          <input
            type="text"
            placeholder="Bio"
            defaultValue={userData.bio}
            onChange={(e) =>
              setUpdatedUser((prev: any) => ({ ...prev, bio: e.target.value }))
            }
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Old Password"
            onChange={(e) =>
              setUpdatedUser((prev: any) => ({ ...prev, oldPassword: e.target.value }))
            }
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Password"
            onChange={(e) =>
              setUpdatedUser((prev: any) => ({ ...prev, password: e.target.value }))
            }
            style={inputStyle}
          />
          <div style={{ marginTop: "20px", display: "flex", justifyContent: "space-between", gap: "10px" }}>
            <button onClick={() => setShowModal(false)} style={buttonStyle("#555", "white")}>Cancel</button>
            <button
              onClick={updateUser}
              disabled={!isFormValid}
              style={{
                ...buttonStyle("white", "black"),
                opacity: isFormValid ? 1 : 0.5,
                cursor: isFormValid ? "pointer" : "not-allowed",
              }}
            >
              Save
            </button>
          </div>
        </Modal>
      )}

      {/* Tweet Detail Modal */}
      {showTweetModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 3000,
          }}
          onClick={() => setShowTweetModal(false)}
        >
          <div
            style={{
              backgroundColor: "#121212",
              padding: "20px",
              borderRadius: "10px",
              width: "90%",
              maxWidth: "600px",
              color: "white",
              position: "relative",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowTweetModal(false)}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "none",
                border: "none",
                color: "white",
                fontSize: "18px",
                cursor: "pointer",
              }}
            >
              &times;
            </button>
            {selectedTweetId && (
              <TweetDetail tweet_id={selectedTweetId} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Modal component for reuse
const Modal: React.FC<{ onClose: () => void; title: string; children: React.ReactNode }> = ({
  onClose,
  title,
  children,
}) => (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.7)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 2000,
    }}
    onClick={onClose}
  >
    <div
      style={{
        backgroundColor: "#222",
        padding: "20px",
        borderRadius: "10px",
        minWidth: "300px",
        maxHeight: "70vh",
        overflowY: "auto",
        color: "white",
        position: "relative",
      }}
      onClick={e => e.stopPropagation()}
    >
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          background: "none",
          border: "none",
          color: "white",
          fontSize: "18px",
          cursor: "pointer",
        }}
      >
        &times;
      </button>
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      {children}
    </div>
  </div>
);

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px",
  marginBottom: "10px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  backgroundColor: "#2e2e2e",
  color: "white",
};

const buttonStyle = (bg: string, color: string): React.CSSProperties => ({
  padding: "10px 20px",
  borderRadius: "10px",
  border: "none",
  backgroundColor: bg,
  color,
  fontWeight: "bold",
  cursor: "pointer",
  flex: 1,
});
