import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import api from "../../services/api";
import { ApiResponse, Product, Category } from "../../types/api";

interface ProductFormState {
  name: string;
  description: string;
  price: string;
  costPrice: string;
  discountPercent: string;
  discountStartDate: string;
  discountEndDate: string;
  quantity: string;
  categoryId: string;
  image: string;
  status: string;
  isFeatured: boolean;
}

const emptyForm: ProductFormState = {
  name: "",
  description: "",
  price: "",
  costPrice: "",
  discountPercent: "",
  discountStartDate: "",
  discountEndDate: "",
  quantity: "",
  categoryId: "",
  image: "",
  status: "Active",
  isFeatured: false,
};

function toDateInputValue(value?: string | null) {
  return value ? value.slice(0, 10) : "";
}

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

function formatDate(value: string) {
  return new Date(value).toLocaleDateString();
}

function InventorySection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductFormState>(emptyForm);
  const [uploading, setUploading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        api.get<ApiResponse<Product[]>>("/products"),
        api.get<ApiResponse<Category[]>>("/categories"),
      ]);
      setProducts(productsRes.data.data || []);
      setCategories(categoriesRes.data.data || []);
    } catch (error) {
      toast.error("Error loading inventory.");
      console.error("Error loading inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddForm = () => {
    setEditingId(null);
    setForm({ ...emptyForm, categoryId: categories[0] ? String(categories[0].id) : "" });
    setShowForm(true);
  };

  const openEditForm = (product: Product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      costPrice: String(product.costPrice ?? 0),
      discountPercent: product.discountPercent ? String(product.discountPercent) : "",
      discountStartDate: toDateInputValue(product.discountStartDate),
      discountEndDate: toDateInputValue(product.discountEndDate),
      quantity: String(product.quantity),
      categoryId: String(product.categoryId),
      image: product.image,
      status: product.status || "Active",
      isFeatured: product.isFeatured,
    });
    setShowForm(true);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Only JPEG, PNG, WEBP, or GIF images are allowed.");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      toast.error("Image must be 5MB or smaller.");
      e.target.value = "";
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await api.post<ApiResponse<{ url: string }>>("/products/upload-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const url = response.data.data?.url;
      if (url) {
        setForm((prev) => ({ ...prev, image: url }));
      }
    } catch (error) {
      toast.error("Error uploading image.");
      console.error("Error uploading image:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      costPrice: Number(form.costPrice),
      discountPercent: form.discountPercent ? Number(form.discountPercent) : 0,
      discountStartDate: form.discountStartDate || null,
      discountEndDate: form.discountEndDate || null,
      quantity: Number(form.quantity),
      categoryId: Number(form.categoryId),
      image: form.image,
      status: form.status,
      isFeatured: form.isFeatured,
    };

    try {
      if (editingId) {
        await api.put(`/products/update/${editingId}`, payload);
        toast.success("Product updated successfully!");
      } else {
        await api.post("/products/add", payload);
        toast.success("Product added successfully!");
      }
      setShowForm(false);
      fetchData();
    } catch (error) {
      toast.error("Error saving product.");
      console.error("Error saving product:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await api.delete(`/products/delete/${id}`);
      toast.success("Product deleted successfully!");
      fetchData();
    } catch (error) {
      toast.error("Error deleting product.");
      console.error("Error deleting product:", error);
    }
  };

  if (loading) {
    return <p className="text-brown-1000">Loading inventory...</p>;
  }

  return (
    <div className="d-flex flex-column gap-4">
      <div className="d-flex align-items-center justify-content-between">
        <h2 className="fs-4 fw-bold text-heading-black">Inventory ({products.length})</h2>
        <Button
          onClick={openAddForm}
          className="bg-heading-black text-white border-0 fw-semibold"
          style={{ padding: "0.625rem 1.25rem", borderRadius: "0.5rem" }}
        >
          + Add Product
        </Button>
      </div>

      <div className="bg-white rounded-4 border border-brown-600" style={{ overflowX: "auto" }}>
        <Table responsive className="mb-0 text-start" style={{ fontSize: "0.875rem" }}>
          <thead className="bg-brown-300 text-brown-1000">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Cost</th>
              <th className="px-4 py-3">Discount</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-top border-brown-600">
                <td className="px-4 py-3 fw-medium text-heading-black">{p.name}</td>
                <td className="px-4 py-3">{p.categoryName}</td>
                <td className="px-4 py-3">${p.price.toFixed(2)}</td>
                <td className="px-4 py-3">${(p.costPrice ?? 0).toFixed(2)}</td>
                <td className="px-4 py-3">
                  {p.discountPercent > 0 && p.discountStartDate && p.discountEndDate ? (
                    <span className={p.isDiscountActive ? "text-orange-500 fw-semibold" : "text-brown-1000"}>
                      {p.discountPercent}% ({formatDate(p.discountStartDate)}–{formatDate(p.discountEndDate)})
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3">{p.quantity}</td>
                <td className="px-4 py-3">{p.status}</td>
                <td className="px-4 py-3">
                  <div className="d-flex gap-3">
                    <Button
                      variant="link"
                      onClick={() => openEditForm(p)}
                      className="text-orange-500 p-0"
                      style={{ textDecoration: "none" }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="link"
                      onClick={() => handleDelete(p.id)}
                      className="text-red p-0"
                      style={{ textDecoration: "none" }}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <Modal show={showForm} onHide={() => setShowForm(false)} centered scrollable>
        <Modal.Header closeButton>
          <Modal.Title className="fs-5 fw-bold text-heading-black">
            {editingId ? "Edit Product" : "Add Product"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body className="d-flex flex-column gap-3">
            <Form.Group>
              <Form.Control
                required
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="border-brown-600"
                style={{ borderRadius: "0.5rem" }}
              />
            </Form.Group>
            <Form.Group>
              <Form.Control
                as="textarea"
                required
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="border-brown-600"
                style={{ borderRadius: "0.5rem" }}
              />
            </Form.Group>

            <Row className="g-3">
              <Col xs={6}>
                <Form.Control
                  required
                  type="number"
                  step="0.01"
                  placeholder="Price"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="border-brown-600"
                  style={{ borderRadius: "0.5rem" }}
                />
              </Col>
              <Col xs={6}>
                <Form.Control
                  required
                  type="number"
                  step="0.01"
                  placeholder="Cost Price"
                  value={form.costPrice}
                  onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
                  className="border-brown-600"
                  style={{ borderRadius: "0.5rem" }}
                />
              </Col>
            </Row>

            <Row className="g-3">
              <Col xs={6}>
                <Form.Control
                  required
                  type="number"
                  placeholder="Quantity"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  className="border-brown-600"
                  style={{ borderRadius: "0.5rem" }}
                />
              </Col>
              <Col xs={6}>
                <Form.Select
                  required
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  className="border-brown-600"
                  style={{ borderRadius: "0.5rem" }}
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Form.Select>
              </Col>
            </Row>

            <div className="d-flex flex-column gap-2">
              <Form.Label className="fs-6 fw-semibold text-brown-1000 mb-0">Discount (optional)</Form.Label>
              <Row className="g-3">
                <Col xs={4}>
                  <Form.Control
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="Discount %"
                    value={form.discountPercent}
                    onChange={(e) => setForm({ ...form, discountPercent: e.target.value })}
                    className="border-brown-600"
                    style={{ borderRadius: "0.5rem" }}
                  />
                </Col>
                <Col xs={4}>
                  <Form.Control
                    type="date"
                    value={form.discountStartDate}
                    onChange={(e) => setForm({ ...form, discountStartDate: e.target.value })}
                    className="border-brown-600"
                    style={{ borderRadius: "0.5rem" }}
                  />
                </Col>
                <Col xs={4}>
                  <Form.Control
                    type="date"
                    value={form.discountEndDate}
                    onChange={(e) => setForm({ ...form, discountEndDate: e.target.value })}
                    className="border-brown-600"
                    style={{ borderRadius: "0.5rem" }}
                  />
                </Col>
              </Row>
            </div>

            <div className="d-flex flex-column gap-2">
              <Form.Label className="fs-6 fw-semibold text-brown-1000 mb-0">Product Image</Form.Label>
              <div className="d-flex align-items-center gap-3">
                {form.image && (
                  <img
                    src={form.image}
                    alt="Preview"
                    className="rounded border border-brown-600"
                    style={{ width: "4rem", height: "4rem", objectFit: "cover" }}
                  />
                )}
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="flex-grow-1"
                  style={{ fontSize: "0.875rem" }}
                />
              </div>
              {uploading && <p className="fs-6 text-brown-1000 mb-0">Uploading...</p>}
            </div>

            <Row className="g-3 align-items-center">
              <Col xs={6}>
                <Form.Select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="border-brown-600"
                  style={{ borderRadius: "0.5rem" }}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </Form.Select>
              </Col>
              <Col xs={6}>
                <Form.Check
                  type="checkbox"
                  id="isFeatured"
                  label="Featured"
                  checked={form.isFeatured}
                  onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                  className="text-brown-1000"
                />
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer className="gap-3">
            <Button
              type="button"
              onClick={() => setShowForm(false)}
              className="bg-brown-300 text-heading-black border-0 fw-semibold flex-grow-1"
              style={{ padding: "0.625rem 0", borderRadius: "0.5rem" }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={uploading || !form.image}
              className="bg-heading-black text-white border-0 fw-semibold flex-grow-1"
              style={{ padding: "0.625rem 0", borderRadius: "0.5rem" }}
            >
              Save
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

export default InventorySection;
