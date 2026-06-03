"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Unit conversion helper
const CONVERSION_RATES: Record<string, Record<string, number>> = {
  g: { kg: 0.001, g: 1 },
  kg: { g: 1000, kg: 1 },
  mL: { L: 0.001, mL: 1 },
  L: { mL: 1000, L: 1 },
  count: { count: 1 }
};

export default function QuotationsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [orderUnit, setOrderUnit] = useState("");
  const [orderQuantity, setOrderQuantity] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [customerName, setCustomerName] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      const token = localStorage.getItem("token");
      if (!token) return router.push("/");
      const res = await fetch("/api/products", { headers: { "Authorization": `Bearer ${token}` } });
      if (res.ok) setProducts(await res.json());
    };
    fetchProducts();
  }, [router]);

  const selectedProduct = products.find(p => p.id === selectedProductId);

  const calculateItemPrice = (product: any, qty: number, unit: string) => {
    if (!product || !qty || !unit) return 0;
    const conversionFactor = CONVERSION_RATES[unit]?.[product.baseUnit] || 1;
    // e.g. Order 1 kg, Product in g. conversionFactor = 1000. Qty = 1. Total Base Units = 1000. Price = 1000 * unitPrice.
    const totalBaseUnits = qty * conversionFactor;
    return totalBaseUnits * Number(product.unitPrice);
  };

  const handleAddItem = () => {
    if (!selectedProduct || !orderQuantity || !orderUnit) return;
    const qty = Number(orderQuantity);
    const totalPrice = calculateItemPrice(selectedProduct, qty, orderUnit);
    
    setItems([...items, {
      productId: selectedProduct.id,
      name: selectedProduct.name,
      quantity: qty,
      unit: orderUnit,
      unitPrice: Number(selectedProduct.unitPrice),
      totalPrice,
      baseUnit: selectedProduct.baseUnit
    }]);
    
    setSelectedProductId("");
    setOrderQuantity("");
  };

  const handleCreateQuotation = async () => {
    if (items.length === 0 || !customerName) return alert("Add items and customer name");
    
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ customerName, items })
      });
      if (res.ok) {
        alert("Quotation generated!");
        setItems([]);
        setCustomerName("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <div className="page-container">
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 className="heading-primary" style={{ marginBottom: 0, fontSize: "2rem" }}>Quotation Builder</h1>
        <button className="btn-secondary" onClick={() => router.push("/dashboard")}>Back to Dashboard</button>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
        {/* Builder Side */}
        <div className="glass-card">
          <h2 style={{ color: "var(--text-primary)", marginBottom: "1rem" }}>Add Product to Quote</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <select className="input-premium" value={selectedProductId} onChange={e => {
              setSelectedProductId(e.target.value);
              const p = products.find(prod => prod.id === e.target.value);
              if (p) setOrderUnit(p.baseUnit); // default unit
            }}>
              <option value="">Select a product...</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name} (Base: {p.baseUnit}, ₹{p.unitPrice})</option>)}
            </select>

            {selectedProduct && (
              <>
                <div style={{ display: "flex", gap: "1rem" }}>
                  <input className="input-premium" type="number" placeholder="Quantity" value={orderQuantity} onChange={e => setOrderQuantity(e.target.value)} />
                  <select className="input-premium" value={orderUnit} onChange={e => setOrderUnit(e.target.value)}>
                    {selectedProduct.baseUnit === 'g' || selectedProduct.baseUnit === 'kg' ? (
                      <><option value="g">Grams</option><option value="kg">Kilograms</option></>
                    ) : selectedProduct.baseUnit === 'mL' || selectedProduct.baseUnit === 'L' ? (
                      <><option value="mL">Milliliters</option><option value="L">Liters</option></>
                    ) : (
                      <option value="count">Count</option>
                    )}
                  </select>
                </div>
                
                <div style={{ color: "var(--accent-primary)", fontWeight: "bold" }}>
                  Estimated Price: ₹{calculateItemPrice(selectedProduct, Number(orderQuantity) || 0, orderUnit).toFixed(2)}
                </div>
                
                <button className="btn-primary" onClick={handleAddItem}>Add to Quote</button>
              </>
            )}
          </div>
        </div>

        {/* Output Side */}
        <div className="glass-card">
          <h2 style={{ color: "var(--text-primary)", marginBottom: "1rem" }}>Current Quotation</h2>
          <input className="input-premium" placeholder="Customer Name" value={customerName} onChange={e => setCustomerName(e.target.value)} style={{ marginBottom: "1rem" }} />
          
          <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse", marginBottom: "2rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-light)" }}>
                <th style={{ padding: "0.5rem" }}>Product</th>
                <th style={{ padding: "0.5rem" }}>Qty (Unit)</th>
                <th style={{ padding: "0.5rem" }}>Total (₹)</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <td style={{ padding: "0.5rem" }}>{item.name}</td>
                  <td style={{ padding: "0.5rem" }}>{item.quantity} {item.unit}</td>
                  <td style={{ padding: "0.5rem" }}>₹{item.totalPrice.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "1.25rem", fontWeight: "bold" }}>Total: ₹{totalAmount.toFixed(2)}</span>
            <button className="btn-primary" onClick={handleCreateQuotation}>Generate Quote</button>
          </div>
        </div>
      </div>
    </div>
  );
}
