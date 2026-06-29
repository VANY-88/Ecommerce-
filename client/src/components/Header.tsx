import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Button from "./Button";
import { SessionUser } from "../types/api";

interface HeaderProps {
  user: SessionUser | null;
  onLogout: () => void;
}

const PersonIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 50 50" fill="currentColor">
    <path d="M25 25C23.9 25 22.9583 24.6083 22.175 23.825C21.3917 23.0417 21 22.1 21 21C21 19.9 21.3917 18.9583 22.175 18.175C22.9583 17.3917 23.9 17 25 17C26.1 17 27.0417 17.3917 27.825 18.175C28.6083 18.9583 29 19.9 29 21C29 22.1 28.6083 23.0417 27.825 23.825C27.0417 24.6083 26.1 25 25 25ZM17 33V30.2C17 29.6333 17.1458 29.1125 17.4375 28.6375C17.7292 28.1625 18.1167 27.8 18.6 27.55C19.6333 27.0333 20.6833 26.6458 21.75 26.3875C22.8167 26.1292 23.9 26 25 26C26.1 26 27.1833 26.1292 28.25 26.3875C29.3167 26.6458 30.3667 27.0333 31.4 27.55C31.8833 27.8 32.2708 28.1625 32.5625 28.6375C32.8542 29.1125 33 29.6333 33 30.2V33H17ZM19 31H31V30.2C31 30.0167 30.9542 29.85 30.8625 29.7C30.7708 29.55 30.65 29.4333 30.5 29.35C29.6 28.9 28.6917 28.5625 27.775 28.3375C26.8583 28.1125 25.9333 28 25 28C24.0667 28 23.1417 28.1125 22.225 28.3375C21.3083 28.5625 20.4 28.9 19.5 29.35C19.35 29.4333 19.2292 29.55 19.1375 29.7C19.0458 29.85 19 30.0167 19 30.2V31ZM25 23C25.55 23 26.0208 22.8042 26.4125 22.4125C26.8042 22.0208 27 21.55 27 21C27 20.45 26.8042 19.9792 26.4125 19.5875C26.0208 19.1958 25.55 19 25 19C24.45 19 23.9792 19.1958 23.5875 19.5875C23.1958 19.9792 23 20.45 23 21C23 21.55 23.1958 22.0208 23.5875 22.4125C23.9792 22.8042 24.45 23 25 23Z" />
  </svg>
);

const ShoppingIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 50 50" fill="currentColor">
    <path d="M20 35C19.45 35 18.9792 34.8042 18.5875 34.4125C18.1958 34.0208 18 33.55 18 33C18 32.45 18.1958 31.9792 18.5875 31.5875C18.9792 31.1958 19.45 31 20 31C20.55 31 21.0208 31.1958 21.4125 31.5875C21.8042 31.9792 22 32.45 22 33C22 33.55 21.8042 34.0208 21.4125 34.4125C21.0208 34.8042 20.55 35 20 35ZM30 35C29.45 35 28.9792 34.8042 28.5875 34.4125C28.1958 34.0208 28 33.55 28 33C28 32.45 28.1958 31.9792 28.5875 31.5875C28.9792 31.1958 29.45 31 30 31C30.55 31 31.0208 31.1958 31.4125 31.5875C31.8042 31.9792 32 32.45 32 33C32 33.55 31.8042 34.0208 31.4125 34.4125C31.0208 34.8042 30.55 35 30 35ZM19.15 19L21.55 24H28.55L31.3 19H19.15ZM18.2 17H32.95C33.3333 17 33.625 17.1708 33.825 17.5125C34.025 17.8542 34.0333 18.2 33.85 18.55L30.3 24.95C30.1167 25.2833 29.8708 25.5417 29.5625 25.725C29.2542 25.9083 28.9167 26 28.55 26H21.1L20 28H32V30H20C19.25 30 18.6833 29.6708 18.3 29.0125C17.9167 28.3542 17.9 27.7 18.25 27.05L19.6 24.6L16 17H14V15H17.25L18.2 17Z" />
  </svg>
);

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handlePersonIconClick = () => {
    if (user) {
      navigate("/profile");
    } else {
      navigate("/login");
    }
    setMenuOpen(false);
  };

  const handleCartClick = () => {
    navigate("/cart");
    setMenuOpen(false);
  };

  const handleAboutClick = () => {
    navigate("/about");
    setMenuOpen(false);
  };

  const handleBlogClick = () => {
    navigate("/blog");
    setMenuOpen(false);
  };

  const handleProductsClick = () => {
    navigate("/products");
    setMenuOpen(false);
  };

  const handleDashboardClick = () => {
    navigate("/admin/dashboard");
    setMenuOpen(false);
  };

  const homeHref = user?.role === "Admin" ? "/admin/dashboard" : "/";

  return (
    <Navbar
      expand="md"
      expanded={menuOpen}
      onToggle={setMenuOpen}
      className="px-4 px-lg-5 py-3 navbar-brand-transition bg-transparent"
    >
      <Navbar.Brand href={homeHref} className="d-flex align-items-center flex-shrink-0">
        <img src="./assets/Cir.svg" alt="Logo" style={{ width: "2.25rem", height: "2.25rem" }} loading="lazy" decoding="async" />
        <span className="ms-3 text-black font-dm-sans fs-4 fw-bolder">Furnitech</span>
      </Navbar.Brand>

      <Navbar.Toggle aria-label="Toggle menu" />

      <Navbar.Collapse>
        <Nav className="mx-auto gap-3 gap-lg-4 fw-bold font-dm-sans text-brown-1000">
          <Nav.Link href={homeHref} className="nav-link-brand">Home</Nav.Link>
          {user?.role !== "Admin" && (
            <Nav.Link onClick={handleProductsClick} className="nav-link-brand">Products</Nav.Link>
          )}
          <Nav.Link onClick={handleBlogClick} className="nav-link-brand">Blogs</Nav.Link>
          <Nav.Link onClick={handleAboutClick} className="nav-link-brand">About Us</Nav.Link>
          {user?.role === "Admin" && (
            <Nav.Link onClick={handleDashboardClick} className="nav-link-brand">Dashboard</Nav.Link>
          )}
        </Nav>
        <div className="d-flex align-items-center gap-3 gap-lg-4 mt-3 mt-md-0">
          <Nav.Link onClick={handlePersonIconClick} aria-label="Account" className="icon-circle-btn p-0">
            <PersonIcon className="icon-sm" />
          </Nav.Link>
          {user?.role !== "Admin" && (
            <Nav.Link onClick={handleCartClick} aria-label="Cart" className="icon-circle-btn p-0">
              <ShoppingIcon className="icon-sm" />
            </Nav.Link>
          )}
          {user && (
            <Button text="Log Out" onClick={onLogout} className="px-4 py-2 w-auto-important" />
          )}
        </div>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default Header;
