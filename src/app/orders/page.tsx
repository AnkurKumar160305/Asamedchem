"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { generateQuotationPDF } from "@/lib/pdf";

const ORDER_STATUSES = ["PENDING", "APPROVED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (!token) return router.push("/");
    if (userData) setUser(JSON.parse(userData));

    setLoading(true);
    try {
      const [resOrders, resQuotes] = await Promise.all([
        fetch("/api/orders", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/quotations", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (resOrders.ok) setOrders(await resOrders.json());
      if (resQuotes.ok) setQuotations(await resQuotes.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [router]);

  const handleQuoteAction = async (id: string, status: string) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/quotations/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    if (res.ok) fetchData();
    else alert("Failed to update quotation status.");
  };

  const handlePlaceOrder = async (quotationId: string) => {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ quotationId }),
    });
    if (res.ok) {
      alert("Order placed successfully! Stock has been deducted.");
      fetchData();
    } else {
      const data = await res.json();
      alert(data.error || "Failed to place order.");
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    if (res.ok) fetchData();
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: "#94a3b8", SUBMITTED: "#3b82f6", APPROVED: "#22c55e",
      REJECTED: "#ef4444", PENDING: "#f59e0b", PROCESSING: "#8b5cf6",
      SHIPPED: "#06b6d4", DELIVERED: "#22c55e", CANCELLED: "#ef4444",
    };
    return colors[status] || "#94a3b8";
  };

  const getNextStatus = (current: string) => {
    const idx = ORDER_STATUSES.indexOf(current);
    if (idx >= 0 && idx < ORDER_STATUSES.length - 2) return ORDER_STATUSES[idx + 1];
    return null;
  };

  if (loading) return <div className="page-container"><p>Loading...</p></div>;

  return (
    <div className="page-container">
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 className="heading-primary" style={{ marginBottom: 0, fontSize: "2rem" }}>Order Management</h1>
        <button className="btn-secondary" onClick={() => router.push("/dashboard")}>Back to Dashboard</button>
      </header>

      {/* Quotations */}
      <div className="glass-card" style={{ marginBottom: "2rem" }}>
        <h2 style={{ color: "var(--text-primary)", marginBottom: "0.5rem" }}>Quotations</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1rem", fontSize: "0.85rem" }}>
          Flow: <strong>DRAFT</strong> → Approve → <strong>APPROVED</strong> → Place Order
        </p>
        {quotations.length === 0 ? (
          <p style={{ color: "var(--text-secondary)" }}>No quotations. Create one in the Quotation Builder.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <th style={{ padding: "0.75rem", color: "var(--text-secondary)" }}>Customer</th>
                  <th style={{ padding: "0.75rem", color: "var(--text-secondary)" }}>Items</th>
                  <th style={{ padding: "0.75rem", color: "var(--text-secondary)" }}>Subtotal</th>
                  <th style={{ padding: "0.75rem", color: "var(--text-secondary)" }}>Tax</th>
                  <th style={{ padding: "0.75rem", color: "var(--text-secondary)" }}>Total</th>
                  <th style={{ padding: "0.75rem", color: "var(--text-secondary)" }}>Status</th>
                  <th style={{ padding: "0.75rem", color: "var(--text-secondary)" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {quotations.map((q) => (
                  <tr key={q.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                    <td style={{ padding: "0.75rem" }}>
                      <div>{q.customerName}</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>by {q.user?.name || q.user?.email}</div>
                    </td>
                    <td style={{ padding: "0.75rem" }}>
                      {q.items?.map((item: any, i: number) => (
                        <div key={i} style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                          {item.product?.name} — {item.orderedQuantity} {item.orderedUnit} ({item.convertedQuantity} {item.product?.baseUnit}) — ₹{item.totalPrice}
                        </div>
                      ))}
                    </td>
                    <td style={{ padding: "0.75rem" }}>₹{q.subtotal}</td>
                    <td style={{ padding: "0.75rem" }}>₹{q.tax}</td>
                    <td style={{ padding: "0.75rem", fontWeight: 600 }}>₹{q.total}</td>
                    <td style={{ padding: "0.75rem" }}>
                      <span style={{ padding: "0.2rem 0.6rem", borderRadius: "1rem", fontSize: "0.8rem", fontWeight: 600, backgroundColor: getStatusColor(q.status), color: "#000" }}>
                        {q.status}
                      </span>
                    </td>
                    <td style={{ padding: "0.75rem" }}>
                      <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                        {q.status === "DRAFT" && user?.role === "ADMIN" && (
                          <>
                            <button className="btn-primary" style={{ padding: "0.2rem 0.6rem", fontSize: "0.8rem" }} onClick={() => handleQuoteAction(q.id, "APPROVED")}>Approve</button>
                            <button className="btn-secondary" style={{ padding: "0.2rem 0.6rem", fontSize: "0.8rem", borderColor: "var(--danger)", color: "var(--danger)" }} onClick={() => handleQuoteAction(q.id, "REJECTED")}>Reject</button>
                          </>
                        )}
                        {q.status === "APPROVED" && !orders.find((o) => o.quotationId === q.id) && (
                          <button className="btn-primary" style={{ padding: "0.2rem 0.6rem", fontSize: "0.8rem" }} onClick={() => handlePlaceOrder(q.id)}>Place Order</button>
                        )}
                        {orders.find((o) => o.quotationId === q.id) && (
                          <span style={{ color: "var(--success)", fontWeight: 600, fontSize: "0.85rem" }}>✓ Ordered</span>
                        )}
                        {q.status === "REJECTED" && (
                          <span style={{ color: "var(--danger)", fontSize: "0.85rem" }}>✗ Rejected</span>
                        )}
                        <button className="btn-secondary" style={{ padding: "0.2rem 0.6rem", fontSize: "0.8rem" }} onClick={() => generateQuotationPDF(q)}>
                          📄 PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Orders with Status Timeline */}
      <div className="glass-card">
        <h2 style={{ color: "var(--text-primary)", marginBottom: "1rem" }}>Active Orders</h2>
        {orders.length === 0 ? (
          <p style={{ color: "var(--text-secondary)" }}>No orders yet. Approve a quotation and place an order above.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {orders.map((order) => {
              const currentIdx = ORDER_STATUSES.indexOf(order.status);
              const nextStatus = getNextStatus(order.status);
              return (
                <div key={order.id} style={{ border: "1px solid var(--border-light)", borderRadius: "var(--border-radius-md)", padding: "1.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <div>
                      <span style={{ fontFamily: "monospace", fontSize: "0.85rem", color: "var(--text-secondary)" }}>#{order.id.slice(-8)}</span>
                      <span style={{ marginLeft: "1rem", fontWeight: 600 }}>{order.quotation?.customerName}</span>
                      <span style={{ marginLeft: "1rem", color: "var(--accent-primary)", fontWeight: 600 }}>₹{order.totalAmount}</span>
                    </div>
                    {user?.role === "ADMIN" && nextStatus && order.status !== "CANCELLED" && (
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button className="btn-primary" style={{ padding: "0.3rem 0.75rem", fontSize: "0.8rem" }} onClick={() => handleUpdateOrderStatus(order.id, nextStatus)}>
                          Mark {nextStatus}
                        </button>
                        {order.status !== "DELIVERED" && (
                          <button className="btn-secondary" style={{ padding: "0.3rem 0.75rem", fontSize: "0.8rem", borderColor: "var(--danger)", color: "var(--danger)" }} onClick={() => handleUpdateOrderStatus(order.id, "CANCELLED")}>
                            Cancel
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Status Timeline */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", marginBottom: "1rem" }}>
                    {ORDER_STATUSES.filter(s => s !== "CANCELLED").map((status, i) => {
                      const isActive = i <= currentIdx;
                      const isCurrent = status === order.status;
                      return (
                        <div key={status} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                          <div style={{
                            width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                            backgroundColor: isActive ? getStatusColor(status) : "var(--bg-tertiary)",
                            color: isActive ? "#000" : "var(--text-secondary)", fontWeight: 600, fontSize: "0.7rem",
                            border: isCurrent ? "2px solid #fff" : "none",
                          }}>
                            {isActive ? "✓" : i + 1}
                          </div>
                          {i < ORDER_STATUSES.length - 2 && (
                            <div style={{ flex: 1, height: "2px", backgroundColor: isActive ? getStatusColor(status) : "var(--bg-tertiary)" }} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "var(--text-secondary)" }}>
                    {ORDER_STATUSES.filter(s => s !== "CANCELLED").map((s) => <span key={s}>{s}</span>)}
                  </div>

                  {order.status === "CANCELLED" && (
                    <div style={{ marginTop: "0.5rem", padding: "0.5rem", backgroundColor: "rgba(239,68,68,0.1)", borderRadius: "var(--border-radius-sm)", color: "var(--danger)", fontWeight: 600 }}>
                      ✗ This order has been cancelled
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
