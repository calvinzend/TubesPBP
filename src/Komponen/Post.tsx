import { CiHeart } from "react-icons/ci";
import { FaRegComment } from "react-icons/fa";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useParams } from "react-router-dom";

interface PostProps {
  tweet_id: string;
  name: string;
  handle: string;
  content: string;
  image_path: string;
}
  
export const Post = ({ tweet_id,name, handle, content,  image_path}: PostProps) => {

  const [userId, setUserId] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [likes, setLikes] = useState<number>(0); 
  const [liked, setLiked] = useState<boolean>(false);
  
    useEffect(() => {
      const token = localStorage.getItem("token");
      if (token) {
        const decoded = jwtDecode<{ userId: string }>(token); // Fixed decoding
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
    }, [tweet_id, userId]);


    const handleLike = async () => {
      try {
        const response = await fetch(`http://localhost:3000/like/${tweet_id}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_id:userId }),
        });
  
        if (response.ok) {
          // Update the like count and liked status
          setLikes((prevLikes) => (liked ? prevLikes - 1 : prevLikes + 1));
          setLiked((prevLiked) => !prevLiked);
        } else {
          console.error("Error liking the post:", await response.text());
        }
        console.log("Liked status:", liked);
      } catch (error) {
        console.error("Error in handleLike:", error);
      }
    };

    const formattedLikes = likes > 1000 ? `${(likes / 1000).toFixed(1)}k` : likes;

      return (
        <div style={{ paddingTop: "16px", marginBottom: "10px" }}>
          <hr style={{ width: "100%", border: "1px solid white", margin: "10px 0" }} />
    
          {/* Header: Avatar + Name + Handle */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <img
              src={image_path}
              alt="profile"
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: "white", 
                objectFit: "cover",
              }}
            />
            <div>
              <strong>{name}</strong>{" "}
              <span style={{ color: "gray", fontSize: "14px" }}>{handle}</span>
            </div>
          </div>
    
          <div
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              marginTop: "2px",
              marginLeft: "52px", 
            }}
          >
            {content}
          </div>
    
          <div
            style={{
              display: "flex",
              gap: "20px",
              color: "gray",
              marginTop: "8px",
              marginLeft: "52px",
            }}
          >
          <span><FaRegComment  size={20}/></span>
          <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            cursor: "pointer",
          }}
          onClick={handleLike}
        >
          <CiHeart size={20} color={liked ? "red" : "gray"} /> {formattedLikes}
        </span>

          </div>
        </div>
      );
    };
    