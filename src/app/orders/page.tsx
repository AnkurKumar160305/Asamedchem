"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("token");
      if (!token) return router.push("/");
      const res = await fetch("/api/orders", { headers: { "Authorization": `Bearer ${token}` } });
      if (res.ok) setOrders(await res.json());
      setLoading(false);
    };
    fetchOrders();
  }, [router]);

  return (
    <div className="page-container">
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 className="heading-primary" style={{ marginBottom: 0, fontSize: "2rem" }}>Order Management</h1>
        <button className="btn-secondary" onClick={() => router.push("/dashboard")}>Back to Dashboard</button>
      </header>

      <div className="glass-card">
        <h2 style={{ color: "var(--text-primary)", marginBottom: "1rem" }}>Active Orders</h2>
        {loading ? <p>Loading orders...</p> : orders.length === 0 ? <p>No active orders.</p> : (
          <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-light)" }}>
                <th style={{ padding: "0.5rem" }}>Order ID</th>
                <th style={{ padding: "0.5rem" }}>Customer Name</th>
                <th style={{ padding: "0.5rem" }}>Total Amount (₹)</th>
                <th style={{ padding: "0.5rem" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <td style={{ padding: "0.5rem" }}>{order.id.slice(-8)}</td>
                  <td style={{ padding: "0.5rem" }}>{order.quote?.customerName}</td>
                  <td style={{ padding: "0.5rem" }}>₹{order.quote?.totalAmount}</td>
                  <td style={{ padding: "0.5rem" }}>
                    <span style={{ 
                      padding: "0.25rem 0.5rem", 
                      borderRadius: "1rem", 
                      fontSize: "0.875rem",
                      backgroundColor: order.status === 'PENDING' ? 'var(--warning)' : 'var(--success)',
                      color: '#000'
                    }}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
