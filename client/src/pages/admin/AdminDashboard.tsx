import React, { useState } from "react";
import InventorySection from "./InventorySection";
import SoldItemsSection from "./SoldItemsSection";
import ProfitStatsSection from "./ProfitStatsSection";
import BestSellersSection from "./BestSellersSection";

const TABS = ["Inventory", "Sold Items", "Profit Stats", "Best Sellers"] as const;
type Tab = (typeof TABS)[number];

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("Inventory");

  return (
    <div className="min-h-screen bg-brown-500 pt-28 pb-16 px-4 md:px-10 lg:px-20">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-display-3 font-bold text-heading-black">Admin Dashboard</h1>

        <div className="flex flex-wrap border-b border-brown-600">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 md:px-6 py-3 text-base font-semibold -mb-px border-b-2 transition-all duration-200 ${
                activeTab === tab
                  ? "border-orange-500 text-orange-500"
                  : "border-transparent text-brown-1000 hover:text-heading-black hover:border-brown-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "Inventory" && <InventorySection />}
        {activeTab === "Sold Items" && <SoldItemsSection />}
        {activeTab === "Profit Stats" && <ProfitStatsSection />}
        {activeTab === "Best Sellers" && <BestSellersSection />}
      </div>
    </div>
  );
}

export default AdminDashboard;
