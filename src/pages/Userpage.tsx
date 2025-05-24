import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Post } from "../Komponen/Post";
import { jwtDecode } from "jwt-decode";

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

  const handleResize = () => setIsMobile(window.innerWidth <= 768);
  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!updatedUser) {
      setIsFormValid(false);
      return;
    }

    const { username, name, email, bio, password } = updatedUser;
    // Cek semua field sudah diisi (bisa disesuaikan)
    if (
      username?.trim() &&
      name?.trim() &&
      email?.trim() &&
      bio?.trim() &&
      password?.trim()
    ) {
      setIsFormValid(false);
    } else {
      setIsFormValid(true);
    }
  }, [updatedUser]);

  // Ambil token dan user ID
  useEffect(() => {
    const token = localStorage.getItem("token");
    const fetchUser = async (targetUserId: string) => {
      try {
        const response = await fetch(`http://localhost:3000/users/${targetUserId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setUserData(data.user); // user object
        setFollowersCount(data.followersCount || 0);
        setFollowingCount(data.followingCount || 0);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    if (token) {
      const decoded = jwtDecode<DecodedToken>(token);
      setLoggedInUserId(decoded.userId);
      const targetUserId = paramUserId ?? decoded.userId;
      setUserId(targetUserId);

      // Fetch user data regardless of param
      fetchUser(targetUserId);
    }
  }, [paramUserId]);

  // Fetch user data (hanya kalau pakai param)
  useEffect(() => {
    if (!paramUserId) return;
    const fetchUser = async () => {
      try {
        const response = await fetch(`http://localhost:3000/users/${paramUserId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await response.json();
        setUserData(data.user);
        setFollowersCount(data.followersCount || 0);
        setFollowingCount(data.followingCount || 0);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
  }, [paramUserId]);

  // Fetch user posts
  useEffect(() => {
    const targetId = paramUserId ?? loggedInUserId;
    if (!targetId) return;

    const fetchPosts = async () => {
      try {
        const response = await fetch(`http://localhost:3000/posts/user/${targetId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await response.json();
        setUserPosts(data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchPosts();
  }, [paramUserId, loggedInUserId]);

  useEffect(() => {
    if (!userId || !loggedInUserId) return;
    const checkFollowing = async () => {
      const response = await fetch(`http://localhost:3000/followers/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
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

  const updateUser = async () => {
    try {
      const response = await fetch(`http://localhost:3000/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(updatedUser),
      });
      if (!response.ok) throw new Error("Failed to update user");
      const data = await response.json();
      setUserData(data);
      setShowModal(false);
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const likePost = async (tweetId: string) => {
    try {
      const response = await fetch(`http://localhost:3000/like/${tweetId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to like post");
      const data = await response.json();
      setUserPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === tweetId ? { ...post, likes: data.likes } : post
        )
      );
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const fetchFollowers = async () => {
    try {
      const response = await fetch(`http://localhost:3000/followers/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      setFollowers(data.followers || []);
      // Check if logged-in user is in followers
      const found = (data.followers || []).some(
        (f: any) => f.follower?.user_id === loggedInUserId
      );
      setIsFollowing(found);
      setShowFollowersModal(true);
    } catch (error) {
      console.error("Error fetching followers:", error);
    }
  };

  const fetchFollowing = async () => {
    try {
      const response = await fetch(`http://localhost:3000/following/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      setFollowing(data.following || []);
      setShowFollowingModal(true);
    } catch (error) {
      console.error("Error fetching following:", error);
    }
  };

  const handleFollow = async () => {
    try {
      const response = await fetch(`http://localhost:3000/follow/${userId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      setFollowersCount(data.followersCount || 0);
      setIsFollowing(data.isFollowing);
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

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
            alignItems: isMobile ? "center" : "center",
            textAlign: isMobile ? "center" : "left",
          }}
        >
          <img
            src={userData.profilePicture || "default-profile.png"}
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
              profilePicture={userData.profilePicture || "default-profile.png"}
              user_id={userData.user_id}
              likeCount={Number(post.likeCount) || 0}
              replyCount={Number(post.replyCount) || 0}
              createdAt={post.createdAt || ""}
            />
          ))
        ) : (
          <p style={{ textAlign: "center", color: "#aaa" }}>Belum ada postingan.</p>
        )}
      </div>
      {/* Followers Modal */}
      {
        showFollowersModal && (
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
            onClick={() => setShowFollowersModal(false)}
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
              }}
              onClick={e => e.stopPropagation()}
            >
              <h3>Followers</h3>
              {followers.length === 0 ? (
                <p>No followers yet.</p>
              ) : (
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {followers.map(f => (
                    <li key={f.follower?.user_id || f.user_id} style={{ marginBottom: "10px", display: "flex", alignItems: "center" }}>
                      <img
                        src={f.follower?.profilePicture || "default-profile.png"}
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
              <button
                style={{
                  marginTop: "15px",
                  background: "#fff",
                  color: "#000",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  cursor: "pointer",
                }}
                onClick={() => setShowFollowersModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        )
      }
      {/* Following Modal */}
      {
        showFollowingModal && (
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
            onClick={() => setShowFollowingModal(false)}
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
              }}
              onClick={e => e.stopPropagation()}
            >
              <h3>Following</h3>
              {following.length === 0 ? (
                <p>Not following anyone yet.</p>
              ) : (
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {following.map(f => (
                    <li key={f.following?.user_id || f.following_id} style={{ marginBottom: "10px", display: "flex", alignItems: "center" }}>
                      <img
                        src={f.following?.profilePicture || "default-profile.png"}
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
              <button
                style={{
                  marginTop: "15px",
                  background: "#fff",
                  color: "#000",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  cursor: "pointer",
                }}
                onClick={() => setShowFollowingModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        )
      }
      {/* Edit Modal */}
      {
        showModal && loggedInUserId === userId && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                backgroundColor: "#1e1e1e",
                padding: "30px",
                borderRadius: "20px",
                width: "100%",
                maxWidth: "400px",
                color: "white",
                textAlign: "center",
              }}
            >
              <h2>Edit Profile</h2>
              <input
                type="text"
                placeholder="Username"
                defaultValue={userData.username}
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

              <div
                style={{
                  marginTop: "20px",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "10px",
                }}
              >
                <button
                  onClick={() => setShowModal(false)}
                  style={buttonStyle("#555", "white")}
                >
                  Cancel
                </button>
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
            </div>
          </div>
        )
      }
    </div >
  );
};

// Style helpers
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
