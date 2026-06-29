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
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-bold text-heading-black">Profit by Month</h2>
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

      {data.length === 0 ? (
        <p className="text-brown-1000">No orders yet to compute profit statistics.</p>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-brown-600 p-4 h-[360px]">
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
          </div>

          <div className="overflow-x-auto bg-white rounded-2xl border border-brown-600">
            <table className="w-full text-left text-sm">
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
                  <tr key={`${m.year}-${m.month}`} className="border-t border-brown-600">
                    <td className="px-4 py-3 font-medium text-heading-black">{monthLabel(m.year, m.month)}</td>
                    <td className="px-4 py-3">${m.revenue.toFixed(2)}</td>
                    <td className="px-4 py-3">${m.cost.toFixed(2)}</td>
                    <td className="px-4 py-3 font-semibold text-orange-500">${m.profit.toFixed(2)}</td>
                    <td className="px-4 py-3">{m.ordersCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default ProfitStatsSection;
