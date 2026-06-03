"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getCompatibleUnits } from "@/lib/units";

export default function CatalogPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [unitFilter, setUnitFilter] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      const token = localStorage.getItem("token");
      if (!token) return router.push("/");
      let url = "/api/products?";
      if (search) url += `search=${encodeURIComponent(search)}&`;
      if (categoryFilter) url += `category=${encodeURIComponent(categoryFilter)}&`;
      if (unitFilter) url += `unit=${encodeURIComponent(unitFilter)}&`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setProducts(await res.json());
    };
    fetchProducts();
  }, [search, categoryFilter, unitFilter, router]);

  const categories = [...new Set(products.map((p) => p.category))];

  return (
    <div className="page-container">
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 className="heading-primary" style={{ marginBottom: 0, fontSize: "2rem" }}>Product Catalog</h1>
        <button className="btn-secondary" onClick={() => router.push("/dashboard")}>Back to Dashboard</button>
      </header>

      {/* Filters */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" }}>
        <input className="input-premium" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ flex: 2 }} />
        <select className="input-premium" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={{ flex: 1 }}>
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="input-premium" value={unitFilter} onChange={(e) => setUnitFilter(e.target.value)} style={{ flex: 1 }}>
          <option value="">All Units</option>
          <option value="g">Weight (g/kg)</option>
          <option value="mL">Volume (mL/L)</option>
          <option value="count">Count</option>
        </select>
      </div>

      {/* Product Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.5rem" }}>
        {products.map((product) => {
          const compatibleUnits = getCompatibleUnits(product.baseUnit);
          const isLow = Number(product.stockQuantity) <= Number(product.reorderLevel);
          return (
            <div key={product.id} className="glass-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "0.5rem" }}>
                  <h3 style={{ fontSize: "1.1rem" }}>{product.name}</h3>
                  <span style={{
                    padding: "0.15rem 0.5rem", borderRadius: "1rem", fontSize: "0.75rem", fontWeight: 600,
                    backgroundColor: isLow ? "var(--danger)" : "var(--success)", color: "#000"
                  }}>
                    {isLow ? "Low Stock" : "In Stock"}
                  </span>
                </div>
                <p style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>{product.sku}</p>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "0.75rem" }}>{product.description || "No description"}</p>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>Category</span>
                  <span style={{ fontWeight: 600 }}>{product.category}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>Price</span>
                  <span style={{ fontWeight: 600, color: "var(--accent-primary)" }}>₹{product.pricePerBaseUnit} / {product.baseUnit}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>Available Stock</span>
                  <span style={{ fontWeight: 600 }}>{product.stockQuantity} {product.baseUnit}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>Units</span>
                  <span style={{ fontWeight: 600 }}>{compatibleUnits.join(", ")}</span>
                </div>
              </div>
              <button className="btn-primary" style={{ marginTop: "1rem", width: "100%" }} onClick={() => router.push("/quotations")}>
                Add to Quotation
              </button>
            </div>
          );
        })}
      </div>

      {products.length === 0 && (
        <div className="glass-card" style={{ textAlign: "center" }}>
          <p style={{ color: "var(--text-secondary)" }}>No products match your search criteria.</p>
        </div>
      )}
    </div>
  );
}
