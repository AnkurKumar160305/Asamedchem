"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", category: "", baseUnit: "g", stockQuantity: "", unitPrice: "" });
  const router = useRouter();

  const fetchProducts = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }
    try {
      const res = await fetch("/api/products", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) setProducts(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [router]);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newProduct,
          stockQuantity: Number(newProduct.stockQuantity),
          unitPrice: Number(newProduct.unitPrice)
        })
      });
      if (res.ok) {
        setShowModal(false);
        setNewProduct({ name: "", category: "", baseUnit: "g", stockQuantity: "", unitPrice: "" });
        fetchProducts();
      } else {
        alert("Failed to add product. Are you an ADMIN?");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-container">
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 className="heading-primary" style={{ marginBottom: 0, fontSize: "2rem" }}>Inventory Management</h1>
        <button className="btn-secondary" onClick={() => router.push("/dashboard")}>Back to Dashboard</button>
      </header>

      {showModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 50 }}>
          <div className="glass-card" style={{ width: "400px" }}>
            <h2 style={{ marginBottom: "1rem" }}>Add New Product</h2>
            <form onSubmit={handleAddProduct} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <input className="input-premium" placeholder="Product Name" required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
              <input className="input-premium" placeholder="Category" required value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} />
              <select className="input-premium" value={newProduct.baseUnit} onChange={e => setNewProduct({...newProduct, baseUnit: e.target.value})}>
                <option value="g">Grams (g)</option>
                <option value="kg">Kilograms (kg)</option>
                <option value="mL">Milliliters (mL)</option>
                <option value="L">Liters (L)</option>
                <option value="count">Count (unit)</option>
              </select>
              <input className="input-premium" type="number" step="0.01" placeholder="Initial Stock Qty" required value={newProduct.stockQuantity} onChange={e => setNewProduct({...newProduct, stockQuantity: e.target.value})} />
              <input className="input-premium" type="number" step="0.01" placeholder="Base Unit Price (₹)" required value={newProduct.unitPrice} onChange={e => setNewProduct({...newProduct, unitPrice: e.target.value})} />
              <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Save</button>
                <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="glass-card">
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
          <h2 style={{ color: "var(--text-primary)" }}>Products List</h2>
          <button className="btn-primary" onClick={() => setShowModal(true)}>Add New Product</button>
        </div>

        {loading ? (
          <p style={{ color: "var(--text-secondary)" }}>Loading inventory...</p>
        ) : products.length === 0 ? (
          <p style={{ color: "var(--text-secondary)" }}>No products found in inventory. Add one to get started!</p>
        ) : (
          <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-light)" }}>
                <th style={{ padding: "0.75rem", color: "var(--text-secondary)" }}>Name</th>
                <th style={{ padding: "0.75rem", color: "var(--text-secondary)" }}>Category</th>
                <th style={{ padding: "0.75rem", color: "var(--text-secondary)" }}>Stock Qty</th>
                <th style={{ padding: "0.75rem", color: "var(--text-secondary)" }}>Price (₹)</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <td style={{ padding: "0.75rem" }}>{product.name}</td>
                  <td style={{ padding: "0.75rem" }}>{product.category}</td>
                  <td style={{ padding: "0.75rem" }}>{product.stockQuantity} {product.baseUnit}</td>
                  <td style={{ padding: "0.75rem" }}>₹{product.unitPrice} / {product.baseUnit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
