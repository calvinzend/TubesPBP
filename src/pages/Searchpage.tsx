import React, { useEffect, useState } from "react";
import { CiSearch } from "react-icons/ci";
import { Link } from "react-router-dom";
import { api } from "../../utils/api";
import { getProfilePicture } from "../../utils/profilePic";

export const SearchPage = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleResize = () => {
    setIsMobile(window.innerWidth <= 768);
  };

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${api.base}/users/search?q=${encodeURIComponent(query)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      setResults(data.users || []);
    } catch {
      setResults([]);
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        backgroundColor: "black",
        minHeight: "100vh",
        padding: isMobile ? "16px" : "20px",
        color: "white",
      }}
    >
      <form
        onSubmit={handleSearch}
        style={{
          display: "flex",
          alignItems: "center",
          backgroundColor: "#1e1e1e",
          borderRadius: "999px",
          border: "2px solid #333",
          width: "100%",
          maxWidth: isMobile ? "100%" : "600px",
          padding: "6px 12px",
          marginBottom: 24,
        }}
      >
        <CiSearch size={22} style={{ marginRight: "10px", color: "white" }} />
        <input
          type="text"
          placeholder="Search user"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
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
          type="submit"
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
      </form>

      {loading && <div style={{ color: "#aaa" }}>Loading...</div>}
      {!loading && results.length > 0 && (
        <div style={{ maxWidth: 600 }}>
          {results.map((user) => (
            <Link
              to={`/userpage/${user.user_id}`}
              key={user.user_id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "12px 0",
                borderBottom: "1px solid #333",
                color: "white",
                textDecoration: "none",
              }}
            >
              <img
                src={getProfilePicture(user.profilePicture)}
                alt="profile"
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  objectFit: "cover",
                  background: "#222",
                }}
              />
              <div>
                <div style={{ fontWeight: 600 }}>{user.name}</div>
                <div style={{ color: "#1da1f2", fontSize: 14 }}>
                  @{user.username}
                </div>
                <div style={{ color: "#aaa", fontSize: 13 }}>{user.bio}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
      {!loading && query && results.length === 0 && (
        <div style={{ color: "#aaa", marginTop: 24 }}>No user found.</div>
      )}
    </div>
  );
};
