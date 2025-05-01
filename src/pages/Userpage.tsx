import React, { useState, useEffect } from "react";
import { Post } from "../Komponen/Post";
import {jwtDecode} from "jwt-decode";

interface DecodedToken {
  userId: string;
  exp: number;
  iat: number;
}

export const UserPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const handleResize = () => {
    setIsMobile(window.innerWidth <= 768);
  };

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  const handleEditClick = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  const [userPosts, setUserPosts] = useState<any[]>([]);

  useEffect(() => {
    if (!userId) return;

    const fetchPosts = async () => {
      try {
        const response = await fetch(`http://localhost:3000/posts/user/${userId}`, {
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
  }, [userId]);


  const [updatedUser, setUpdatedUser] = useState<any>(null);

  const updateUser = async () =>{
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
    } catch (error) {
      console.error("Error updating user:", error);
    }
  } 

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
        prevPosts.map((post) => (post.id === tweetId ? { ...post, likes: data.likes } : post))
      );
    } catch (error) {
      console.error("Error liking post:", error);
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
          <p>{userData.profile_picture}</p>
          <div>
            <div style={{ fontSize: "20px", fontWeight: "bold" }}>{userData.name}</div>
            <div style={{ color: "#ccc" }}>@{userData.username}</div>
            <div style={{ marginTop: "8px" }}>
              <span style={{ marginRight: "20px" }}>200 following</span>
              <span>200 followers</span>
            </div>
            <div style={{ marginTop: "8px", fontSize: "12px" }}>
              {userData.bio}
            </div>
            <div style={{ marginTop: "20px" }}>
              <button
                style={{
                  backgroundColor: "#fff",
                  color: "#000",
                  border: "none",
                  borderRadius: "30px",
                  padding: "8px 20px",
                  fontSize: "16px",
                  cursor: "pointer",
                  width: isMobile ? "100%" : "auto",
                }}
              >
                Follow
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={handleEditClick}
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
      </div>

      {/* Post Section */}
      <div style={{ marginTop: "40px" }}>
        {userPosts.length > 0 ? (
          userPosts.map((post) => (
            <Post
              key={post.id} // penting buat React
              name={userData.name}
              handle={`@${userData.username}`}
              content={post.content}
              likes={post.likes || "0"}
              image_path={userData.profilePicture || "default-profile.png"}
            />
          ))
        ) : (
          <p style={{ textAlign: "center", color: "#aaa" }}>Belum ada postingan.</p>
        )}
      </div>

      {/* Edit Modal */}
      {showModal && (
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
              style={{
                width: "100%",
                padding: "10px",
                marginBottom: "10px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                backgroundColor: "#2e2e2e",
                color: "white",
              }}
            />
            <input
                type="text"
                placeholder="Name"
                defaultValue={userData.name}
                onChange={(e) =>
                  setUpdatedUser((prev: any) => ({ ...prev, name: e.target.value }))
                }
                style={{
                  width: "100%",
                  padding: "10px",
                marginBottom: "10px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  backgroundColor: "#2e2e2e",
                  color: "white",
                }}
              />
              <input
                type="password"
                placeholder="Password"
                onChange={(e) =>
                  setUpdatedUser((prev: any) => ({ ...prev, password: e.target.value }))
                }
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                marginBottom: "10px",

                  border: "1px solid #ccc",
                  backgroundColor: "#2e2e2e",
                  color: "white",
                }}
              />
              <input
                type="email"
                placeholder="Email"
                defaultValue={userData.email}
                onChange={(e) =>
                  setUpdatedUser((prev: any) => ({ ...prev, email: e.target.value }))
                }
                style={{
                  width: "100%",
                  padding: "10px",
                marginBottom: "10px",

                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  backgroundColor: "#2e2e2e",
                  color: "white",
                }}
              />
              <input
                type="text"
                placeholder="Bio"
                defaultValue={userData.bio}
                onChange={(e) =>
                  setUpdatedUser((prev: any) => ({ ...prev, bio: e.target.value }))
                }
                style={{
                  width: "100%",
                  padding: "10px",
                marginBottom: "10px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  backgroundColor: "#2e2e2e",
                  color: "white",
                }}
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
                onClick={handleClose}
                style={{
                  padding: "10px 20px",
                  borderRadius: "10px",
                  border: "none",
                  backgroundColor: "#555",
                  color: "white",
                  cursor: "pointer",
                  flex: 1,
                }}
              >
                Cancel
              </button>
              <button
                style={{
                  padding: "10px 20px",
                  borderRadius: "10px",
                  border: "none",
                  backgroundColor: "white",
                  color: "black",
                  fontWeight: "bold",
                  cursor: "pointer",
                  flex: 1,
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
