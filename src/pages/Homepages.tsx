import React from "react";
import { Post } from "../Komponen/Post";
import { FaFileImage } from "react-icons/fa";
import { useEffect,useState } from "react";
import {jwtDecode} from "jwt-decode";

interface DecodedToken {
  userId: string;
}


export const HomePage = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [postContent, setPostContent] = useState<{ content: string; image_path?: string }>({
    content: "",
  });
  

  // Define the PostType interface
  interface PostType {
    id: string;
    content: string;
    image_path?: string;
    User: {
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


    const addTweet = async () => {
      try {
        const response = await fetch(`http://localhost:3000/posts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            user_id: userId,
            content: postContent.content,
            image_path: postContent.image_path || "",
          }),
        });
    
        const data = await response.json();
    
        if (response.ok) {
          setPosts((prevPosts) => [data, ...prevPosts]);
          alert("Post created successfully!");
          fetchPosts();
        }
      } catch (error) {
        console.error("Error creating post:", error);
      }
    };

    const fetchPosts = async () => {
      try {
        const response = await fetch(`http://localhost:3000/posts`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    useEffect(() => {
      fetchPosts();
    }, []);


  

  return (
    <div style={{ maxWidth: "100%", margin: "0" }}>
         
      <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
      <img
            src= {userData?.profilePicture || "default-profile.png"}
            alt="profile"
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
        <input
          type="text"
          placeholder="What's happening?"
          style={{
            width: "100%",
            padding: "10px",
            background: "black",
            border: "none",
            borderBottom: "2px solid white",
            color: "white",
            fontSize: "16px",
          }}
          onChange={(e) =>
            setPostContent((prev: any) => ({ ...prev, content: e.target.value }))
          }
        />
        <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "10px" }}>
        <input
            type="file"
            id="image-upload"
            style={{ display: "none" }}
            accept="image/*"
            onChange={(e) =>
              setPostContent((prev: any) => ({ ...prev, image_path: e.target.value }))
            }
          />
          {/* Label acts as the button to trigger file input */}
          <label htmlFor="image-upload" style={{ cursor: "pointer", color: "white" }}>
            <FaFileImage size={24} />
          </label>
          <button 
            onClick={addTweet}
            type="button"
            className="post-button"
          style={{ background: "white", color: "black", fontWeight: "bold", padding: "6px 16px", borderRadius: "20px", border: "none", cursor: "pointer" }}>
            Post
          </button>
        </div>
      </div>


      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {posts.map((post) => (
          <Post
            name={post.User?.name || "Unknown"}
            handle={`@${post.User?.username || "unknown"}`}
            content={post.content}
            image_path={post.User?.profilePicture || "default-profile.png"}
            likes="0"
          />
        ))}

      </div>
      
    </div>
  );
};


