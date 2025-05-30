import React, { useState } from "react";
import { useNavigate } from "react-router";
import { FaSquareXTwitter } from "react-icons/fa6";

import { login } from "../../utils/api";

export const Login = () => {
  const navigate = useNavigate();
  const [username, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      alert("Password minimal 8 karakter!");
      return;
    }
    try {
      const data = await login(username, password);
      navigate("/");
    } catch (error: any) {
      alert(error.message || "Username atau Password salah!");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "black",
        padding: "20px",
        color: "white",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          backgroundColor: "#1f2937",
          padding: "32px",
          borderRadius: "16px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
        }}
      >
        <div
          style={{ display: "flex", justifyContent: "center", marginBottom: "24px" }}
        >
          <FaSquareXTwitter size={40} color="white" />
        </div>

        <h2
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: "32px",
            color: "white",
          }}
        >
          Masuk ke X
        </h2>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div>
            <input
              type="text"
              placeholder="Email atau Username"
              value={username}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "transparent",
                border: "none",
                borderBottom: "2px solid white",
                color: "white",
                fontSize: "16px",
                outline: "none",
              }}
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "transparent",
                border: "none",
                borderBottom: "2px solid white",
                color: "white",
                fontSize: "16px",
                outline: "none",
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              width: "100%",
              backgroundColor: "white",
              color: "black",
              fontWeight: "bold",
              padding: "12px",
              borderRadius: "9999px",
              border: "none",
              cursor: "pointer",
              fontSize: "16px",
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#d1d5db")}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "white")}
          >
            Masuk
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            fontSize: "14px",
            color: "#9ca3af",
            marginTop: "24px",
          }}
        >
          Belum punya akun?{" "}
          <a
            href="/register"
            style={{ color: "#60a5fa", textDecoration: "underline", cursor: "pointer" }}
          >
            Daftar
          </a>
        </p>
      </div>
    </div>
  );
};
