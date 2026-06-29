import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import api from "../../services/api";
import { ApiResponse, MonthlyProfit } from "../../types/api";
import { exportToExcel, exportToPdf } from "../../utils/exportReport";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function monthLabel(year: number, month: number) {
  return `${MONTH_NAMES[month - 1]} ${year}`;
}

function ProfitStatsSection() {
  const [data, setData] = useState<MonthlyProfit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get<ApiResponse<MonthlyProfit[]>>("/admin/dashboard/profit-by-month");
        setData(response.data.data || []);
      } catch (error) {
        console.error("Error loading profit stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const chartData = data.map((m) => ({
    month: monthLabel(m.year, m.month),
    Revenue: m.revenue,
    Cost: m.cost,
    Profit: m.profit,
  }));

  const handleExportExcel = () => {
    exportToExcel(
      data.map((m) => ({
        Month: monthLabel(m.year, m.month),
        Revenue: m.revenue,
        Cost: m.cost,
        Profit: m.profit,
        Orders: m.ordersCount,
      })),
      "profit-by-month"
    );
  };

  const handleExportPdf = () => {
    exportToPdf(
      ["Month", "Revenue", "Cost", "Profit", "Orders"],
      data.map((m) => [
        monthLabel(m.year, m.month),
        m.revenue.toFixed(2),
        m.cost.toFixed(2),
        m.profit.toFixed(2),
        m.ordersCount,
      ]),
      "Profit by Month",
      "profit-by-month"
    );
  };

  if (loading) {
    return <p className="text-brown-1000">Loading profit statistics...</p>;
  }

  return (
    <div className="d-flex flex-column gap-4">
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
        <h2 className="fs-4 fw-bold text-heading-black">Profit by Month</h2>
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

      {data.length === 0 ? (
        <p className="text-brown-1000">No orders yet to compute profit statistics.</p>
      ) : (
        <>
          <Card className="border border-brown-600 rounded-4" style={{ height: "360px" }}>
            <Card.Body style={{ height: "100%" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Revenue" fill="#948A74" />
                  <Bar dataKey="Cost" fill="#D74800" />
                  <Bar dataKey="Profit" fill="#FF7029" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>

          <div className="bg-white rounded-4 border border-brown-600" style={{ overflowX: "auto" }}>
            <Table responsive className="mb-0 text-start" style={{ fontSize: "0.875rem" }}>
              <thead className="bg-brown-300 text-brown-1000">
                <tr>
                  <th className="px-4 py-3">Month</th>
                  <th className="px-4 py-3">Revenue</th>
                  <th className="px-4 py-3">Cost</th>
                  <th className="px-4 py-3">Profit</th>
                  <th className="px-4 py-3">Orders</th>
                </tr>
              </thead>
              <tbody>
                {data.map((m) => (
                  <tr key={`${m.year}-${m.month}`} className="border-top border-brown-600">
                    <td className="px-4 py-3 fw-medium text-heading-black">{monthLabel(m.year, m.month)}</td>
                    <td className="px-4 py-3">${m.revenue.toFixed(2)}</td>
                    <td className="px-4 py-3">${m.cost.toFixed(2)}</td>
                    <td className="px-4 py-3 fw-semibold text-orange-500">${m.profit.toFixed(2)}</td>
                    <td className="px-4 py-3">{m.ordersCount}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}

export default ProfitStatsSection;
