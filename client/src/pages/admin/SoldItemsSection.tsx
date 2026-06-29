import React, { useState, useEffect } from "react";
import Table from "react-bootstrap/Table";
import api from "../../services/api";
import { ApiResponse, SoldItem } from "../../types/api";

function SoldItemsSection() {
  const [items, setItems] = useState<SoldItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await api.get<ApiResponse<SoldItem[]>>("/admin/dashboard/sold-items");
        setItems(response.data.data || []);
      } catch (error) {
        console.error("Error loading sold items:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  if (loading) {
    return <p className="text-brown-1000">Loading sold items...</p>;
  }

  return (
    <div className="d-flex flex-column gap-4">
      <h2 className="fs-4 fw-bold text-heading-black">Sold Items ({items.length})</h2>
      <div className="bg-white rounded-4 border border-brown-600" style={{ overflowX: "auto" }}>
        <Table responsive className="mb-0 text-start" style={{ fontSize: "0.875rem" }}>
          <thead className="bg-brown-300 text-brown-1000">
            <tr>
              <th className="px-4 py-3">Order #</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3">Unit Price</th>
              <th className="px-4 py-3">Line Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={`${item.orderId}-${item.productId}-${index}`} className="border-top border-brown-600">
                <td className="px-4 py-3">#{item.orderId}</td>
                <td className="px-4 py-3">{new Date(item.orderDate).toLocaleDateString()}</td>
                <td className="px-4 py-3 fw-medium text-heading-black">{item.productName}</td>
                <td className="px-4 py-3">{item.customerName || "—"}</td>
                <td className="px-4 py-3">{item.quantity}</td>
                <td className="px-4 py-3">${item.unitPrice.toFixed(2)}</td>
                <td className="px-4 py-3">${item.lineTotal.toFixed(2)}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-4 text-center text-brown-1000">
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

export default SoldItemsSection;
