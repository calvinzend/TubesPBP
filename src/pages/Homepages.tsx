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
  const [postContent, setPostContent] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  

  // Define the PostType interface
  interface PostType {
    tweet_id: string;
    content: string;
    image_path?: string;
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
      const formData = new FormData();
      formData.append("user_id", userId || "");
      formData.append("content", postContent || ""); 

      if (imageFile) {
        formData.append("image", imageFile); 
      }

    const response = await fetch(`http://localhost:3000/posts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (response.ok) {
      setPosts((prevPosts) => [data, ...prevPosts]);
      setPostContent("");      // Kosongkan input teks
      setImageFile(null);      // Reset file upload
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
         console.log("Posts data:", data);
        setPosts(data);
        console.log("Fetched posts:", data); // Debugging line
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
            if (file) {
              setImageFile(file);
            }
          }}
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
          tweet_id={post.tweet_id}
          name={post.user?.name || "Unknown"}
          handle={`${post.user?.username || "unknown"}`}
          content={post.content}
          image_path={post.image_path || ""}
          profilePicture={post.user?.profilePicture || ""}
          user_id={post.user?.user_id || ""}
        />
      ))}

      </div>
      
    </div>
  );
};


