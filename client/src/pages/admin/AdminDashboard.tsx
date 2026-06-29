import React, { useState } from "react";
import Nav from "react-bootstrap/Nav";
import InventorySection from "./InventorySection";
import SoldItemsSection from "./SoldItemsSection";
import ProfitStatsSection from "./ProfitStatsSection";
import BestSellersSection from "./BestSellersSection";

const TABS = ["Inventory", "Sold Items", "Profit Stats", "Best Sellers"] as const;
type Tab = (typeof TABS)[number];

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("Inventory");

  return (
    <div
      className="bg-brown-500 px-3 px-md-5 px-lg-5"
      style={{ minHeight: "100vh", paddingBottom: "4rem" }}
    >
      <div className="mx-auto d-flex flex-column gap-4" style={{ maxWidth: "72rem" }}>
        <h1 className="fs-display-3 fw-bold text-heading-black">Admin Dashboard</h1>

        <Nav variant="tabs" className="border-bottom border-brown-600 flex-wrap">
          {TABS.map((tab) => (
            <Nav.Item key={tab}>
              <Nav.Link
                active={activeTab === tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 px-md-4 py-2 fw-semibold ${
                  activeTab === tab ? "text-orange-500 border-orange-500" : "text-brown-1000"
                }`}
                style={{
                  borderColor: activeTab === tab ? undefined : "transparent",
                  borderBottomWidth: "2px",
                }}
              >
                {tab}
              </Nav.Link>
            </Nav.Item>
          ))}
        </Nav>

        {activeTab === "Inventory" && <InventorySection />}
        {activeTab === "Sold Items" && <SoldItemsSection />}
        {activeTab === "Profit Stats" && <ProfitStatsSection />}
        {activeTab === "Best Sellers" && <BestSellersSection />}
      </div>
    </div>
  );
}

export default AdminDashboard;
