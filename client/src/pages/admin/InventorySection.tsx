import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
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
      costPrice: String(product.costPrice),
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-heading-black">Inventory ({products.length})</h2>
        <button
          onClick={openAddForm}
          className="bg-heading-black text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-orange-500 transition-colors duration-200"
        >
          + Add Product
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded-2xl border border-brown-600">
        <table className="w-full text-left text-sm">
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
              <tr key={p.id} className="border-t border-brown-600">
                <td className="px-4 py-3 font-medium text-heading-black">{p.name}</td>
                <td className="px-4 py-3">{p.categoryName}</td>
                <td className="px-4 py-3">${p.price.toFixed(2)}</td>
                <td className="px-4 py-3">${p.costPrice.toFixed(2)}</td>
                <td className="px-4 py-3">
                  {p.discountPercent > 0 && p.discountStartDate && p.discountEndDate ? (
                    <span className={p.isDiscountActive ? "text-orange-500 font-semibold" : "text-brown-1000"}>
                      {p.discountPercent}% ({formatDate(p.discountStartDate)}–{formatDate(p.discountEndDate)})
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3">{p.quantity}</td>
                <td className="px-4 py-3">{p.status}</td>
                <td className="px-4 py-3 space-x-3">
                  <button onClick={() => openEditForm(p)} className="text-orange-500 hover:underline">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:underline">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-heading-black">
              {editingId ? "Edit Product" : "Add Product"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                required
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2 border border-brown-600 rounded-lg"
              />
              <textarea
                required
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-2 border border-brown-600 rounded-lg"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  required
                  type="number"
                  step="0.01"
                  placeholder="Price"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full px-4 py-2 border border-brown-600 rounded-lg"
                />
                <input
                  required
                  type="number"
                  step="0.01"
                  placeholder="Cost Price"
                  value={form.costPrice}
                  onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
                  className="w-full px-4 py-2 border border-brown-600 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  required
                  type="number"
                  placeholder="Quantity"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  className="w-full px-4 py-2 border border-brown-600 rounded-lg"
                />
                <select
                  required
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  className="w-full px-4 py-2 border border-brown-600 rounded-lg"
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-brown-1000">Discount (optional)</label>
                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="Discount %"
                    value={form.discountPercent}
                    onChange={(e) => setForm({ ...form, discountPercent: e.target.value })}
                    className="w-full px-4 py-2 border border-brown-600 rounded-lg"
                  />
                  <input
                    type="date"
                    value={form.discountStartDate}
                    onChange={(e) => setForm({ ...form, discountStartDate: e.target.value })}
                    className="w-full px-4 py-2 border border-brown-600 rounded-lg"
                  />
                  <input
                    type="date"
                    value={form.discountEndDate}
                    onChange={(e) => setForm({ ...form, discountEndDate: e.target.value })}
                    className="w-full px-4 py-2 border border-brown-600 rounded-lg"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-brown-1000">Product Image</label>
                <div className="flex items-center gap-3">
                  {form.image && (
                    <img
                      src={form.image}
                      alt="Preview"
                      className="w-16 h-16 object-cover rounded-lg border border-brown-600"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="flex-1 text-sm"
                  />
                </div>
                {uploading && <p className="text-sm text-brown-1000">Uploading...</p>}
              </div>

              <div className="grid grid-cols-2 gap-3 items-center">
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-4 py-2 border border-brown-600 rounded-lg"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
                <label className="flex items-center gap-2 text-sm text-brown-1000">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                  />
                  Featured
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={uploading || !form.image}
                  className="flex-1 bg-heading-black text-white py-2.5 rounded-lg font-semibold hover:bg-orange-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-brown-300 text-heading-black py-2.5 rounded-lg font-semibold hover:bg-brown-400 transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default InventorySection;
