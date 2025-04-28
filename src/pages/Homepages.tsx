import React from "react";
import { Post } from "../Komponen/Post";


export const HomePage = () => {
  
  return (
    <div style={{ maxWidth: "100%", margin: "0" }}>
         
      <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
      <img
            src="https://lh3.googleusercontent.com/a/ACg8ocLihsMYXGToQWPmN1-EGICbOWTS0CfgBsyO-HG3iCGyYJffhsA=s432-c-no"
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
        />
        <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "10px" }}>
          <button style={{ background: "white", color: "black", fontWeight: "bold", padding: "6px 16px", borderRadius: "20px", border: "none", cursor: "pointer" }}>
            Post
          </button>
        </div>
      </div>


      <Post
        name="bostonmnl_"
        handle="@bostonmnl"
        content="Hallo kamu!!!!!!!!!!!!!!"
        likes="10"
        image_path="https://lh3.googleusercontent.com/a/ACg8ocLihsMYXGToQWPmN1-EGICbOWTS0CfgBsyO-HG3iCGyYJffhsA=s432-c-no"
      />
      <Post
        name="hannah_debora"
        handle="@hannahdebora"
        content="Lagi Kerjain Tubes"
        likes="10"
        image_path="https://lh3.googleusercontent.com/a/ACg8ocLihsMYXGToQWPmN1-EGICbOWTS0CfgBsyO-HG3iCGyYJffhsA=s432-c-no"
      />
      
    </div>
  );
};


