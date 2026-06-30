import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import api from "../../services/api";
import { ApiResponse, AppSettings } from "../../types/api";

function SettingsSection() {
  const [taxRatePercent, setTaxRatePercent] = useState("");
  const [shippingFee, setShippingFee] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get<ApiResponse<AppSettings>>("/settings");
      const data = res.data.data;
      if (data) {
        setTaxRatePercent(String(data.taxRate * 100));
        setShippingFee(String(data.shippingFee));
      }
    } catch (error) {
      toast.error("Error loading settings.");
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/settings", {
        taxRate: Number(taxRatePercent) / 100,
        shippingFee: Number(shippingFee),
      });
      toast.success("Settings updated successfully!");
      fetchSettings();
    } catch (error) {
      toast.error("Error saving settings.");
      console.error("Error saving settings:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-brown-1000">Loading settings...</p>;
  }

  return (
    <div className="d-flex flex-column gap-4">
      <h2 className="fs-4 fw-bold text-heading-black">Store Settings</h2>
      <div className="bg-white rounded-4 border border-brown-600 p-4" style={{ maxWidth: 480 }}>
        <Form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
          <Form.Group>
            <Form.Label className="fw-semibold text-brown-1000">Tax Rate (%)</Form.Label>
            <Form.Control
              required
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={taxRatePercent}
              onChange={(e) => setTaxRatePercent(e.target.value)}
              className="border-brown-600"
              style={{ borderRadius: "0.5rem" }}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label className="fw-semibold text-brown-1000">Shipping Fee ($)</Form.Label>
            <Form.Control
              required
              type="number"
              step="0.01"
              min="0"
              value={shippingFee}
              onChange={(e) => setShippingFee(e.target.value)}
              className="border-brown-600"
              style={{ borderRadius: "0.5rem" }}
            />
          </Form.Group>
          <Button
            type="submit"
            disabled={saving}
            className="bg-heading-black text-white border-0 fw-semibold"
            style={{ padding: "0.625rem 1.25rem", borderRadius: "0.5rem" }}
          >
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </Form>
      </div>
    </div>
  );
}

export default SettingsSection;
