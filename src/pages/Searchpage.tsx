import React, { useEffect, useState } from "react";
import { CiSearch } from "react-icons/ci";

export const SearchPage = () => {
  const [isMobile, setIsMobile] = useState(false);

  const handleResize = () => {
    setIsMobile(window.innerWidth <= 768);
  };

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      style={{
        backgroundColor: "black",
        minHeight: "100vh",
        padding: isMobile ? "16px" : "20px",
        color: "white",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          backgroundColor: "#1e1e1e",
          borderRadius: "999px",
          border: "2px solid #333",
          width: "100%",
          maxWidth: isMobile ? "100%" : "600px",
          padding: "6px 12px",
        }}
      >
        <CiSearch size={22} style={{ marginRight: "10px", color: "white" }} />
        <input
          type="text"
          placeholder="Search"
          style={{
            background: "transparent",
            border: "none",
            outline: "none",
            color: "white",
            fontSize: isMobile ? "14px" : "16px",
            flex: 1,
          }}
        />
        <button
          style={{
            background: "white",
            color: "black",
            fontWeight: "bold",
            padding: isMobile ? "4px 12px" : "6px 16px",
            borderRadius: "20px",
            border: "none",
            cursor: "pointer",
            marginLeft: "10px",
            fontSize: isMobile ? "12px" : "14px",
          }}
        >
          Search
        </button>
      </div>
    </div>
  );
};
