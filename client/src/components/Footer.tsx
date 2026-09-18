import React from "react";
import { Link } from "react-router-dom";
import LogoMark from "./LogoMark";
import { EmailIcon, UpworkIcon } from "./icons/ContactIcons";

const UPWORK_URL = "https://www.upwork.com/freelancers/~010b3233d2aaa30d80?mp_source=share";

const footerLinkClass = "footer-link text-neutral-text-gray font-dm-sans fs-6 text-decoration-none d-block mb-3";
const footerDisabledClass = "text-neutral-text-gray font-dm-sans fs-6 d-block mb-3";
const footerDisabledStyle: React.CSSProperties = { cursor: "default", opacity: 0.6 };

const Footer: React.FC = () => {
  return (
    <section className="d-flex justify-content-center align-items-center w-100 px-4 px-lg-5 py-5 bg-brown-600">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-5 w-100" style={{ maxWidth: "1220px" }}>
        {/* Logo + copyright */}
        <div className="d-flex flex-column align-items-start gap-3 flex-shrink-0">
          <div className="d-flex align-items-center gap-2">
            <LogoMark className="logo-mark--footer" />
            <h1 className="text-black font-dm-sans fs-2 fw-bolder">
              Furnitech
            </h1>
          </div>
          <h2 className="fs-6 font-dm-sans fw-normal text-neutral-text-gray" style={{ maxWidth: "280px" }}>
            Furnitech brings quality, affordable furniture and home decor to your doorstep — making it simple to create a space you love.
          </h2>
        </div>

        {/* Footer links */}
        <div className="d-flex flex-wrap align-items-start gap-5">
          {/* Product */}
          <div className="d-flex flex-column align-items-start gap-3">
            <h1 className="text-black font-dm-sans fs-5 fw-semibold">Product</h1>
            <div>
              <span className={footerDisabledClass} style={footerDisabledStyle}>Categories</span>
              <span className={footerDisabledClass} style={footerDisabledStyle}>Reviews</span>
              <span className={footerDisabledClass} style={footerDisabledStyle}>New Colections</span>
            </div>
          </div>

          {/* Company */}
          <div className="d-flex flex-column align-items-start gap-3">
            <h1 className="text-black font-dm-sans fs-5 fw-semibold">Company</h1>
            <div>
              <Link to="/about" className={footerLinkClass}>About</Link>
              <Link to="/contact" className={footerLinkClass}>Contact Us</Link>
            </div>
          </div>

          {/* Support */}
          <div className="d-flex flex-column align-items-start gap-3">
            <h1 className="text-black font-dm-sans fs-5 fw-semibold">Support</h1>
            <div>
              <span className={footerDisabledClass} style={footerDisabledStyle}>Help center</span>
              <span className={footerDisabledClass} style={footerDisabledStyle}>Chat support</span>
            </div>
          </div>

          {/* Get in touch */}
          <div className="d-flex flex-column align-items-start gap-3">
            <h1 className="text-black font-dm-sans fs-5 fw-bold">Get in Touch</h1>
            <div className="d-flex flex-column align-items-start gap-3">
              <a
                href="mailto:ngvhuy.ityu@gmail.com"
                className="footer-social d-flex align-items-center gap-2 text-decoration-none"
                aria-label="Email ngvhuy.ityu@gmail.com"
              >
                <span className="footer-social-icon"><EmailIcon className="icon-social" /></span>
                <span className="footer-social-label text-neutral-text-gray font-dm-sans fs-6">Email</span>
              </a>
              <a
                href={UPWORK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social d-flex align-items-center gap-2 text-decoration-none"
                aria-label="Upwork profile (opens in a new tab)"
              >
                <span className="footer-social-icon"><UpworkIcon className="icon-social" /></span>
                <span className="footer-social-label text-neutral-text-gray font-dm-sans fs-6">Upwork</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Footer;
