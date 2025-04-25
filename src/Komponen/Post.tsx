import { CiHeart } from "react-icons/ci";
import { FaRegComment } from "react-icons/fa";

interface PostProps {
    name: string;
    handle: string;
    content: string;
    likes: string;
  }
  
export const Post = ({ name, handle, content, likes}: PostProps) => {

    const parsedLikes = parseInt(likes, 10); // Convert likes to a number
        if(parsedLikes > 1000) {
            likes = `${(parsedLikes / 1000).toFixed(1)}k`;
        }
      return (
        <div style={{ paddingTop: "16px", marginBottom: "10px" }}>
          <hr style={{ width: "100%", border: "1px solid white", margin: "10px 0" }} />
    
          {/* Header: Avatar + Name + Handle */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <img
              src="https://assets-a1.kompasiana.com/items/album/2016/09/10/online-illustration-57d36d5e24b0bd96078b4568.jpg"
              alt="profile"
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
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
              marginTop: "8px",
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
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <CiHeart  size={20} /> {likes}
            </span>
          </div>
        </div>
      );
    };
    