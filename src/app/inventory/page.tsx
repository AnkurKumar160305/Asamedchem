"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockProduct, setStockProduct] = useState<any>(null);
  const [stockType, setStockType] = useState("STOCK_IN");
  const [stockQty, setStockQty] = useState("");
  const [stockNotes, setStockNotes] = useState("");
  const [search, setSearch] = useState("");
  const [newProduct, setNewProduct] = useState({
    name: "", category: "", description: "", baseUnit: "g",
    stockQuantity: "", pricePerBaseUnit: "", reorderLevel: "10"
  });
  const router = useRouter();

  const fetchProducts = async () => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/");
    try {
      const url = search ? `/api/products?search=${encodeURIComponent(search)}` : "/api/products";
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setProducts(await res.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, [search, router]);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        ...newProduct,
        stockQuantity: Number(newProduct.stockQuantity),
        pricePerBaseUnit: Number(newProduct.pricePerBaseUnit),
        reorderLevel: Number(newProduct.reorderLevel),
      }),
    });
    if (res.ok) {
      setShowModal(false);
      setNewProduct({ name: "", category: "", description: "", baseUnit: "g", stockQuantity: "", pricePerBaseUnit: "", reorderLevel: "10" });
      fetchProducts();
    } else {
      const data = await res.json();
      alert(data.error || "Failed to add product.");
    }
  };

  const handleStockAdjust = async () => {
    if (!stockProduct || !stockQty) return;
    const token = localStorage.getItem("token");
    const currentStock = Number(stockProduct.stockQuantity);
    const qty = Number(stockQty);
    const newStock = stockType === "STOCK_IN" ? currentStock + qty : Math.max(0, currentStock - qty);

    await fetch(`/api/products/${stockProduct.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...stockProduct, stockQuantity: newStock }),
    });
    setShowStockModal(false);
    setStockQty("");
    setStockNotes("");
    fetchProducts();
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    const token = localStorage.getItem("token");
    await fetch(`/api/products/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchProducts();
  };

  const unitLabels: Record<string, string> = { g: "per gram", mL: "per mL", count: "per unit" };

  return (
    <div className="page-container">
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 className="heading-primary" style={{ marginBottom: 0, fontSize: "2rem" }}>Inventory Management</h1>
        <button className="btn-secondary" onClick={() => router.push("/dashboard")}>Back to Dashboard</button>
      </header>

      {/* Search Bar */}
      <div style={{ marginBottom: "1.5rem", display: "flex", gap: "1rem" }}>
        <input
          className="input-premium"
          placeholder="Search by name, SKU, or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1 }}
        />
        <button className="btn-primary" onClick={() => setShowModal(true)}>+ Add Product</button>
      </div>

      {/* Add Product Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 50 }}>
          <div className="glass-card" style={{ width: "480px", maxHeight: "90vh", overflowY: "auto" }}>
            <h2 style={{ marginBottom: "1rem" }}>Add New Product</h2>
            <form onSubmit={handleAddProduct} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <input className="input-premium" placeholder="Product Name *" required value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} />
              <input className="input-premium" placeholder="Category *" required value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })} />
              <textarea className="input-premium" placeholder="Description" value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} style={{ minHeight: "80px", resize: "vertical" }} />
              <div>
                <label style={{ color: "var(--text-secondary)", fontSize: "0.85rem", display: "block", marginBottom: "0.25rem" }}>Base Unit (storage unit)</label>
                <select className="input-premium" value={newProduct.baseUnit} onChange={e => setNewProduct({ ...newProduct, baseUnit: e.target.value })}>
                  <option value="g">Grams (g) — weight stored in grams</option>
                  <option value="kg">Kilograms (kg) — converted to grams internally</option>
                  <option value="mL">Milliliters (mL) — volume stored in mL</option>
                  <option value="L">Liters (L) — converted to mL internally</option>
                  <option value="count">Count (units)</option>
                </select>
              </div>
              <input className="input-premium" type="number" step="any" placeholder="Initial Stock Quantity *" required value={newProduct.stockQuantity} onChange={e => setNewProduct({ ...newProduct, stockQuantity: e.target.value })} />
              <input className="input-premium" type="number" step="any" placeholder="Price per unit (₹) *" required value={newProduct.pricePerBaseUnit} onChange={e => setNewProduct({ ...newProduct, pricePerBaseUnit: e.target.value })} />
              <input className="input-premium" type="number" step="any" placeholder="Reorder Level" value={newProduct.reorderLevel} onChange={e => setNewProduct({ ...newProduct, reorderLevel: e.target.value })} />
              <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Save Product</button>
                <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {showStockModal && stockProduct && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 50 }}>
          <div className="glass-card" style={{ width: "400px" }}>
            <h2 style={{ marginBottom: "1rem" }}>Adjust Stock: {stockProduct.name}</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>Current: {stockProduct.stockQuantity} {stockProduct.baseUnit}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <select className="input-premium" value={stockType} onChange={e => setStockType(e.target.value)}>
                <option value="STOCK_IN">Stock In (+)</option>
                <option value="STOCK_OUT">Stock Out (−)</option>
              </select>
              <input className="input-premium" type="number" step="any" placeholder="Quantity" value={stockQty} onChange={e => setStockQty(e.target.value)} />
              <input className="input-premium" placeholder="Notes (optional)" value={stockNotes} onChange={e => setStockNotes(e.target.value)} />
              <div style={{ display: "flex", gap: "1rem" }}>
                <button className="btn-primary" style={{ flex: 1 }} onClick={handleStockAdjust}>Confirm</button>
                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowStockModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="glass-card">
        {loading ? <p>Loading inventory...</p> : products.length === 0 ? (
          <p style={{ color: "var(--text-secondary)" }}>No products found. Add one to get started!</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <th style={{ padding: "0.75rem", color: "var(--text-secondary)" }}>SKU</th>
                  <th style={{ padding: "0.75rem", color: "var(--text-secondary)" }}>Name</th>
                  <th style={{ padding: "0.75rem", color: "var(--text-secondary)" }}>Category</th>
                  <th style={{ padding: "0.75rem", color: "var(--text-secondary)" }}>Stock</th>
                  <th style={{ padding: "0.75rem", color: "var(--text-secondary)" }}>Price (₹)</th>
                  <th style={{ padding: "0.75rem", color: "var(--text-secondary)" }}>Status</th>
                  <th style={{ padding: "0.75rem", color: "var(--text-secondary)" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const isLow = Number(product.stockQuantity) <= Number(product.reorderLevel);
                  return (
                    <tr key={product.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                      <td style={{ padding: "0.75rem", fontFamily: "monospace", fontSize: "0.85rem" }}>{product.sku}</td>
                      <td style={{ padding: "0.75rem" }}>
                        <div>{product.name}</div>
                        {product.description && <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{product.description}</div>}
                      </td>
                      <td style={{ padding: "0.75rem" }}>{product.category}</td>
                      <td style={{ padding: "0.75rem", color: isLow ? "var(--danger)" : "inherit" }}>
                        {product.stockQuantity} {product.baseUnit}
                        {isLow && <span style={{ fontSize: "0.75rem", display: "block", color: "var(--danger)" }}>⚠ Low</span>}
                      </td>
                      <td style={{ padding: "0.75rem" }}>₹{product.pricePerBaseUnit} {unitLabels[product.baseUnit] || ""}</td>
                      <td style={{ padding: "0.75rem" }}>{product.status}</td>
                      <td style={{ padding: "0.75rem" }}>
                        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                          <button className="btn-secondary" style={{ padding: "0.2rem 0.5rem", fontSize: "0.8rem" }}
                            onClick={() => { setStockProduct(product); setShowStockModal(true); }}>
                            Adjust Stock
                          </button>
                          <button className="btn-secondary" style={{ padding: "0.2rem 0.5rem", fontSize: "0.8rem", borderColor: "var(--danger)", color: "var(--danger)" }}
                            onClick={() => handleDeleteProduct(product.id)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
