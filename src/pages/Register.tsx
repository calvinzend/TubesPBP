import React, { useState } from "react";
import { useNavigate } from "react-router";
import { FaSquareXTwitter } from "react-icons/fa6";

export const Register = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [image, setImage] = useState<File | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);
    formData.append("name", name);
    formData.append("email", email);
    if (image) formData.append("profilePicture", image);

    try {
      const response = await fetch("http://localhost:3000/register", {
        method: "POST",
        body: formData, // Kirim formData
      });

      if (response.ok) {
        navigate("/login");
      } else {
        const errorData = await response.json();
        console.log("Error: ", errorData);
      }
    } catch (error) {
      console.error("Terjadi kesalahan saat mengirim data: ", error);
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
          Daftar ke X
        </h2>

        <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
          <div>
            <input
              type="file"
              onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)}
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
            Daftar
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
          Sudah punya akun?{" "}
          <a
            href="/login"
            style={{ color: "#60a5fa", textDecoration: "underline", cursor: "pointer" }}
          >
            Masuk
          </a>
        </p>
      </div>
    </div>
  );
};
