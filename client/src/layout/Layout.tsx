import React from "react";
import { Outlet } from "react-router-dom";
import Footer from "../components/Footer";

const Layout: React.FC = () => {
  return (
    <div className="layout">
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
