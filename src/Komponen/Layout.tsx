import { Outlet } from "react-router";
import { Navbar } from "../Komponen/Navbar";

export const Layout = () => {
  return (
    <div style={{ display: "flex", minHeight: "100vh"}}>
      <Navbar />
      <main style={{ flex: 1, color: "white", padding: "20px", background: "black" }}>
        <Outlet />
      </main>
    </div>
  );
};
