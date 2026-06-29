import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { ApiResponse, BestSeller } from "../../types/api";
import { exportToExcel, exportToPdf } from "../../utils/exportReport";

function BestSellersSection() {
  const [data, setData] = useState<BestSeller[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get<ApiResponse<BestSeller[]>>("/admin/dashboard/best-sellers");
        setData(response.data.data || []);
      } catch (error) {
        console.error("Error loading best sellers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleExportExcel = () => {
    exportToExcel(
      data.map((b) => ({
        Product: b.productName,
        "Quantity Sold": b.quantitySold,
        Revenue: b.revenue,
        Profit: b.profit,
      })),
      "best-sellers"
    );
  };

  const handleExportPdf = () => {
    exportToPdf(
      ["Product", "Quantity Sold", "Revenue", "Profit"],
      data.map((b) => [b.productName, b.quantitySold, b.revenue.toFixed(2), b.profit.toFixed(2)]),
      "Best Sellers",
      "best-sellers"
    );
  };

  if (loading) {
    return <p className="text-brown-1000">Loading best sellers...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-bold text-heading-black">Best Sellers</h2>
        <div className="flex gap-3">
          <button
            onClick={handleExportExcel}
            className="bg-brown-300 text-heading-black px-4 py-2 rounded-lg font-semibold hover:bg-orange-500 hover:text-white transition-colors duration-200"
          >
            Export Excel
          </button>
          <button
            onClick={handleExportPdf}
            className="bg-brown-300 text-heading-black px-4 py-2 rounded-lg font-semibold hover:bg-orange-500 hover:text-white transition-colors duration-200"
          >
            Export PDF
          </button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-2xl border border-brown-600">
        <table className="w-full text-left text-sm">
          <thead className="bg-brown-300 text-brown-1000">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Quantity Sold</th>
              <th className="px-4 py-3">Revenue</th>
              <th className="px-4 py-3">Profit</th>
            </tr>
          </thead>
          <tbody>
            {data.map((b, index) => (
              <tr key={b.productId} className="border-t border-brown-600">
                <td className="px-4 py-3">{index + 1}</td>
                <td className="px-4 py-3 font-medium text-heading-black">{b.productName}</td>
                <td className="px-4 py-3">{b.quantitySold}</td>
                <td className="px-4 py-3">${b.revenue.toFixed(2)}</td>
                <td className="px-4 py-3 font-semibold text-orange-500">${b.profit.toFixed(2)}</td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-brown-1000">
                  No sales yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default BestSellersSection;
