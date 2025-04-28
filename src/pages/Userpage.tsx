import React, { useState, useEffect } from "react";
import { Post } from "../Komponen/Post";

export const UserPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [userData, setUserData] = useState<any>(null); // State untuk user data

  const handleResize = () => {
    setIsMobile(window.innerWidth <= 768);
  };

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // Fetch user data
    const fetchUser = async () => {
      try {
        const response = await fetch("http://localhost:3000/users/f3dce0fb-aa54-448d-95c3-d604eb960bea");
        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
  }, []);

  const handleEditClick = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  if (!userData) {
    return <div style={{ color: "white", textAlign: "center" }}>Error...</div>;
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
        <Post
          name={userData.name}
          handle={`@${userData.username}`}
          content="Semangat banget belajar React!"
          likes="100000"
          image_path={userData.profilePicture || "default-profile.png"}
        />
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
              width: "90%",
              maxWidth: "400px",
              color: "white",
              textAlign: "center",
            }}
          >
            <h2>Edit Profile</h2>
            <input
              type="text"
              placeholder="Name"
              defaultValue={userData.name}
              style={{
                marginTop: "20px",
                padding: "10px",
                width: "100%",
                borderRadius: "10px",
                border: "1px solid #555",
                backgroundColor: "#333",
                color: "white",
              }}
            />
            <input
              type="text"
              placeholder="Bio"
              defaultValue={userData.bio}
              style={{
                marginTop: "20px",
                padding: "10px",
                width: "100%",
                borderRadius: "10px",
                border: "1px solid #555",
                backgroundColor: "#333",
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
