import React, { useState } from "react";
import { useNavigate } from "react-router";
import { FaSquareXTwitter } from "react-icons/fa6";

export const Login = () => {
  const navigate = useNavigate();
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mengirim data login ke API lokal
    const loginData = {
      usernameOrEmail,
      password,
    };

    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.token); 

        navigate("/");
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Username atau Password salah!");
      }
    } catch (error) {
      console.error("Terjadi kesalahan saat login: ", error);
      alert("Terjadi kesalahan saat login!");
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
              value={usernameOrEmail}
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
