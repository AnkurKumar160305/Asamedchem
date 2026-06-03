"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { convertToBaseUnit, calculatePrice, getCompatibleUnits } from "@/lib/units";

export default function QuotationsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [orderUnit, setOrderUnit] = useState("");
  const [orderQuantity, setOrderQuantity] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [notes, setNotes] = useState("");
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      const token = localStorage.getItem("token");
      if (!token) return router.push("/");
      const url = search ? `/api/products?search=${encodeURIComponent(search)}` : "/api/products";
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setProducts(await res.json());
    };
    fetchProducts();
  }, [router, search]);

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  const calcItemPrice = (product: any, qty: number, unit: string) => {
    if (!product || !qty || !unit) return 0;
    return calculatePrice(qty, unit, Number(product.pricePerBaseUnit));
  };

  const handleAddItem = () => {
    if (!selectedProduct || !orderQuantity || !orderUnit) return;
    const qty = Number(orderQuantity);
    const totalPrice = calcItemPrice(selectedProduct, qty, orderUnit);
    const convertedQty = convertToBaseUnit(qty, orderUnit);

    setItems([
      ...items,
      {
        productId: selectedProduct.id,
        name: selectedProduct.name,
        quantity: qty,
        unit: orderUnit,
        convertedQuantity: convertedQty,
        pricePerBaseUnit: Number(selectedProduct.pricePerBaseUnit),
        totalPrice,
        baseUnit: selectedProduct.baseUnit,
      },
    ]);

    setSelectedProductId("");
    setOrderQuantity("");
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const tax = subtotal * 0.18;
  const total = subtotal + tax;

  const handleCreateQuotation = async () => {
    if (!customerName.trim()) return alert("Please enter a Customer Name!");
    if (items.length === 0) return alert("Please add at least one product!");

    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ customerName, notes, items }),
      });
      if (res.ok) {
        alert("Quotation submitted successfully! Go to Order Management to review.");
        setItems([]);
        setCustomerName("");
        setNotes("");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to create quotation.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePlaceOrderNow = async () => {
    if (!customerName.trim()) return alert("Please enter a Customer Name!");
    if (items.length === 0) return alert("Please add at least one product!");

    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ directOrder: true, customerName, notes, items }),
      });
      if (res.ok) {
        alert("Order placed successfully! Stock has been reserved and you can track it in Order Management.");
        setItems([]);
        setCustomerName("");
        setNotes("");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to place order.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <motion.div className="page-container" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
      <motion.header initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 className="heading-primary" style={{ marginBottom: 0, fontSize: "2rem" }}>Quotation Builder</h1>
        <button className="btn-secondary" onClick={() => router.push("/dashboard")}>Back to Dashboard</button>
      </motion.header>

      {/* Step 1: Customer */}
      <div className="glass-card" style={{ marginBottom: "2rem" }}>
        <h2 style={{ color: "var(--text-primary)", marginBottom: "0.75rem" }}>Step 1: Customer Details</h2>
        <div style={{ display: "flex", gap: "1rem" }}>
          <input className="input-premium" placeholder="Customer Name *" value={customerName} onChange={(e) => setCustomerName(e.target.value)} style={{ flex: 1 }} />
          <input className="input-premium" placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} style={{ flex: 1 }} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
        {/* Step 2: Product Selection */}
        <div className="glass-card">
          <h2 style={{ color: "var(--text-primary)", marginBottom: "1rem" }}>Step 2: Select Products</h2>
          <input className="input-premium" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ marginBottom: "1rem" }} />
          
          <select className="input-premium" value={selectedProductId} onChange={(e) => {
            setSelectedProductId(e.target.value);
            const p = products.find((prod) => prod.id === e.target.value);
            if (p) setOrderUnit(p.baseUnit);
          }} style={{ marginBottom: "1rem" }}>
            <option value="">Select a product...</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} [{p.sku}] — ₹{p.pricePerBaseUnit}/{p.baseUnit} — Stock: {p.stockQuantity} {p.baseUnit}
              </option>
            ))}
          </select>

          {selectedProduct && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", gap: "1rem" }}>
                <input className="input-premium" type="number" step="any" placeholder="Quantity" value={orderQuantity} onChange={(e) => setOrderQuantity(e.target.value)} />
                <select className="input-premium" value={orderUnit} onChange={(e) => setOrderUnit(e.target.value)}>
                  {getCompatibleUnits(selectedProduct.baseUnit).map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
              
              <div style={{ padding: "0.75rem", background: "rgba(59, 130, 246, 0.1)", borderRadius: "var(--border-radius-sm)" }}>
                <div style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                  Converted: {convertToBaseUnit(Number(orderQuantity) || 0, orderUnit).toFixed(2)} {selectedProduct.baseUnit}
                </div>
                <div style={{ color: "var(--accent-primary)", fontWeight: "bold", fontSize: "1.1rem" }}>
                  Price: ₹{calcItemPrice(selectedProduct, Number(orderQuantity) || 0, orderUnit).toFixed(2)}
                </div>
              </div>
              
              <button className="btn-primary" onClick={handleAddItem}>+ Add to Quote</button>
            </div>
          )}
        </div>

        {/* Step 3: Review */}
        <div className="glass-card">
          <h2 style={{ color: "var(--text-primary)", marginBottom: "1rem" }}>Step 3: Review & Submit</h2>

          {items.length === 0 ? (
            <p style={{ color: "var(--text-secondary)" }}>No items added yet.</p>
          ) : (
            <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse", marginBottom: "1rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <th style={{ padding: "0.5rem", color: "var(--text-secondary)" }}>Product</th>
                  <th style={{ padding: "0.5rem", color: "var(--text-secondary)" }}>Qty</th>
                  <th style={{ padding: "0.5rem", color: "var(--text-secondary)" }}>Base Qty</th>
                  <th style={{ padding: "0.5rem", color: "var(--text-secondary)" }}>Total</th>
                  <th style={{ padding: "0.5rem" }}></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--border-light)" }}>
                    <td style={{ padding: "0.5rem" }}>{item.name}</td>
                    <td style={{ padding: "0.5rem" }}>{item.quantity} {item.unit}</td>
                    <td style={{ padding: "0.5rem", color: "var(--text-secondary)", fontSize: "0.85rem" }}>{item.convertedQuantity} {item.baseUnit}</td>
                    <td style={{ padding: "0.5rem" }}>₹{item.totalPrice.toFixed(2)}</td>
                    <td style={{ padding: "0.5rem" }}>
                      <button onClick={() => handleRemoveItem(i)} style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer" }}>✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span style={{ color: "var(--text-secondary)" }}>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span style={{ color: "var(--text-secondary)" }}>GST (18%)</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem", fontWeight: 700, fontSize: "1.2rem" }}>
              <span>Total</span>
              <span style={{ color: "var(--accent-primary)" }}>₹{total.toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <button className="btn-primary" style={{ flex: 1, minWidth: "160px" }} onClick={handleCreateQuotation}>
                Submit Quotation
              </button>
              <button className="btn-secondary" style={{ flex: 1, minWidth: "160px" }} onClick={handlePlaceOrderNow}>
                Place Order Now
              </button>
            </div>
            <p style={{ marginTop: "0.75rem", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
              Direct order placement creates an approved quotation and reserves stock immediately.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
