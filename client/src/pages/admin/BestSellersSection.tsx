import React, { useState, useEffect, useCallback } from "react";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import api from "../../services/api";
import DashboardErrorState from "../../components/admin/DashboardErrorState";
import { ApiResponse, BestSeller } from "../../types/api";
import { exportToExcel, exportToPdf } from "../../utils/exportReport";

function BestSellersSection() {
  const [data, setData] = useState<BestSeller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<ApiResponse<BestSeller[]>>("/admin/dashboard/best-sellers");
      setData(response.data.data || []);
    } catch (error) {
      console.error("Error loading best sellers:", error);
      setError("Couldn't load best sellers. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  if (error) {
    return <DashboardErrorState message={error} onRetry={fetchData} />;
  }

  return (
    <div className="d-flex flex-column gap-4">
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
        <h2 className="fs-4 fw-bold text-heading-black">Best Sellers</h2>
        <div className="d-flex gap-3">
          <Button
            onClick={handleExportExcel}
            className="bg-brown-300 text-heading-black border-0 fw-semibold"
            style={{ padding: "0.5rem 1rem", borderRadius: "0.5rem" }}
          >
            Export Excel
          </Button>
          <Button
            onClick={handleExportPdf}
            className="bg-brown-300 text-heading-black border-0 fw-semibold"
            style={{ padding: "0.5rem 1rem", borderRadius: "0.5rem" }}
          >
            Export PDF
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-4 border border-brown-600" style={{ overflowX: "auto" }}>
        <Table responsive className="mb-0 text-start" style={{ fontSize: "0.875rem" }}>
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
              <tr key={b.productId} className="border-top border-brown-600">
                <td className="px-4 py-3">{index + 1}</td>
                <td className="px-4 py-3 fw-medium text-heading-black">{b.productName}</td>
                <td className="px-4 py-3">{b.quantitySold}</td>
                <td className="px-4 py-3">${b.revenue.toFixed(2)}</td>
                <td className="px-4 py-3 fw-semibold text-orange-500">${b.profit.toFixed(2)}</td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-4 text-center text-brown-1000">
                  No sales yet.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
}

export default BestSellersSection;
