"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    
    if (!token || !userData) {
      router.push("/");
    } else {
      setUser(JSON.parse(userData));
    }
  }, [router]);

  if (!user) return <div style={{ padding: "2rem", color: "var(--text-secondary)" }}>Loading...</div>;

  return (
    <div className="page-container">
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3rem" }}>
        <h1 className="heading-primary" style={{ marginBottom: 0, fontSize: "2rem" }}>AasaMedChem</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ color: "var(--text-secondary)" }}>Welcome, {user.email} ({user.role})</span>
          <button 
            className="btn-secondary" 
            onClick={() => { localStorage.clear(); router.push("/"); }}
          >
            Logout
          </button>
        </div>
      </header>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
        
        {/* Inventory Widget */}
        <div className="glass-card">
          <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem", color: "var(--accent-primary)" }}>Inventory</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>Manage products, stock levels, and unit conversions.</p>
          <button className="btn-primary" style={{ width: "100%" }} onClick={() => router.push("/inventory")}>Manage Inventory</button>
        </div>

        {/* Quotations Widget */}
        <div className="glass-card">
          <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem", color: "var(--accent-primary)" }}>Quotations</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>Create, view, and send quotations to customers.</p>
          <button className="btn-primary" style={{ width: "100%" }} onClick={() => router.push("/quotations")}>Quotation Builder</button>
        </div>

        {/* Orders Widget */}
        <div className="glass-card">
          <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem", color: "var(--accent-primary)" }}>Orders</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>Track active orders, pending shipments, and fulfillment.</p>
          <button className="btn-primary" style={{ width: "100%" }} onClick={() => router.push("/orders")}>View Orders</button>
        </div>
        
      </div>
    </div>
  );
}
