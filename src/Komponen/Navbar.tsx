import { Link } from "react-router";
import { FaSquareXTwitter } from "react-icons/fa6";
import { FaHome } from "react-icons/fa";
import { IoMdSearch } from "react-icons/io";
import { FaRegUserCircle } from "react-icons/fa";
import { SlLogout } from "react-icons/sl";

import "./Navbar.css";

export const Navbar = () => {
  return (
    <nav className="navbar">
        <div style={{ display: "flex", flexDirection: "column", gap: "40px",position: "fixed", alignItems: "center", justifyContent: "center", top: "50%", transform: "translateY(-50%)" }}>
            <Link to="/" className="logo"><FaSquareXTwitter size={40} /></Link>
            <Link to="/" className="logo"><FaHome size={40} /></Link>
            <Link to="/search" className="logo"><IoMdSearch size={40} /></Link>
            <Link to="/userpage" className="logo"><FaRegUserCircle size={40} /></Link>
            <Link to="/login" className="logo"><SlLogout size={40} /></Link>
        </div>
     
    </nav>
  );
};