"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [notifCount, setNotifCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!token || !userData) return router.push("/");
    setUser(JSON.parse(userData));

    fetch("/api/stats", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json()).then(setStats).catch(console.error);

    fetch("/api/notifications", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json()).then((d) => setNotifCount(d.unreadCount || 0)).catch(console.error);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  const handleExport = (type: string) => {
    const token = localStorage.getItem("token");
    window.open(`/api/export?type=${type}&token=${token}`, "_blank");
  };

  if (!user) return null;

  return (
    <div className="page-container">
      {/* Header */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 className="heading-primary" style={{ marginBottom: "0.25rem", fontSize: "2rem" }}>AasaMedChem Dashboard</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            Welcome, <strong>{user.name || user.email}</strong> — Role: <strong>{user.role}</strong>
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <button className="btn-secondary" onClick={() => router.push("/notifications")} style={{ position: "relative" }}>
            🔔 Notifications
            {notifCount > 0 && (
              <span style={{ position: "absolute", top: "-6px", right: "-6px", backgroundColor: "var(--danger)", color: "#fff", borderRadius: "50%", width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 700 }}>
                {notifCount}
              </span>
            )}
          </button>
          <button className="btn-secondary" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      {/* Stats Cards */}
      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.5rem", marginBottom: "2rem" }}>
          <div className="glass-card" style={{ textAlign: "center" }}>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "0.5rem" }}>Total Products</p>
            <p style={{ fontSize: "2rem", fontWeight: 700, color: "var(--accent-primary)" }}>{stats.totalProducts}</p>
          </div>
          <div className="glass-card" style={{ textAlign: "center" }}>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "0.5rem" }}>Inventory Value</p>
            <p style={{ fontSize: "2rem", fontWeight: 700, color: "var(--success)" }}>₹{stats.inventoryValue?.toFixed(2)}</p>
          </div>
          <div className="glass-card" style={{ textAlign: "center" }}>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "0.5rem" }}>Total Orders</p>
            <p style={{ fontSize: "2rem", fontWeight: 700, color: "var(--accent-primary)" }}>{stats.totalOrders}</p>
          </div>
          <div className="glass-card" style={{ textAlign: "center" }}>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "0.5rem" }}>Total Quotations</p>
            <p style={{ fontSize: "2rem", fontWeight: 700, color: "var(--warning)" }}>{stats.totalQuotations}</p>
          </div>
        </div>
      )}

      {/* Navigation Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem", marginBottom: "2rem" }}>
        {user.role === "ADMIN" && (
          <div className="glass-card" style={{ cursor: "pointer" }} onClick={() => router.push("/inventory")}>
            <h3 style={{ marginBottom: "0.5rem" }}>📦 Inventory</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>Manage products, stock levels, and unit pricing.</p>
            <button className="btn-primary" style={{ marginTop: "1rem", width: "100%" }}>Manage Inventory</button>
          </div>
        )}
        <div className="glass-card" style={{ cursor: "pointer" }} onClick={() => router.push("/quotations")}>
          <h3 style={{ marginBottom: "0.5rem" }}>📝 Quotations</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            {user.role === "ADMIN" ? "Review and approve quotation requests." : "Build and submit quotations for customers."}
          </p>
          <button className="btn-primary" style={{ marginTop: "1rem", width: "100%" }}>
            {user.role === "ADMIN" ? "Review Quotations" : "Quotation Builder"}
          </button>
        </div>
        <div className="glass-card" style={{ cursor: "pointer" }} onClick={() => router.push("/orders")}>
          <h3 style={{ marginBottom: "0.5rem" }}>🛒 Orders</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>Track orders, shipments, and fulfillment status.</p>
          <button className="btn-primary" style={{ marginTop: "1rem", width: "100%" }}>View Orders</button>
        </div>
        {user.role === "SELLER" && (
          <div className="glass-card" style={{ cursor: "pointer" }} onClick={() => router.push("/catalog")}>
            <h3 style={{ marginBottom: "0.5rem" }}>🔍 Product Catalog</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>Browse, search and filter available products.</p>
            <button className="btn-primary" style={{ marginTop: "1rem", width: "100%" }}>Browse Products</button>
          </div>
        )}
        {user.role === "ADMIN" && (
          <>
            <div className="glass-card" style={{ cursor: "pointer" }} onClick={() => router.push("/audit")}>
              <h3 style={{ marginBottom: "0.5rem" }}>📋 Audit Logs</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>Track all system actions, user logins, and data changes.</p>
              <button className="btn-primary" style={{ marginTop: "1rem", width: "100%" }}>View Audit Trail</button>
            </div>
            <div className="glass-card">
              <h3 style={{ marginBottom: "0.5rem" }}>📤 CSV Export</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "1rem" }}>Export data as CSV files for reporting.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <button className="btn-secondary" style={{ fontSize: "0.85rem" }} onClick={() => handleExport("products")}>Export Products</button>
                <button className="btn-secondary" style={{ fontSize: "0.85rem" }} onClick={() => handleExport("orders")}>Export Orders</button>
                <button className="btn-secondary" style={{ fontSize: "0.85rem" }} onClick={() => handleExport("quotations")}>Export Quotations</button>
                <button className="btn-secondary" style={{ fontSize: "0.85rem" }} onClick={() => handleExport("inventory")}>Export Inventory</button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Low Stock Alerts */}
      {stats && stats.lowStockProducts?.length > 0 && user.role === "ADMIN" && (
        <div className="glass-card" style={{ borderLeft: "4px solid var(--danger)", marginBottom: "2rem" }}>
          <h3 style={{ color: "var(--danger)", marginBottom: "1rem" }}>⚠️ Low Stock Alerts</h3>
          <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-light)" }}>
                <th style={{ padding: "0.5rem", color: "var(--text-secondary)" }}>Product</th>
                <th style={{ padding: "0.5rem", color: "var(--text-secondary)" }}>Current Stock</th>
                <th style={{ padding: "0.5rem", color: "var(--text-secondary)" }}>Reorder Level</th>
              </tr>
            </thead>
            <tbody>
              {stats.lowStockProducts.map((p: any) => (
                <tr key={p.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <td style={{ padding: "0.5rem" }}>{p.name}</td>
                  <td style={{ padding: "0.5rem", color: "var(--danger)" }}>{p.stockQuantity} {p.baseUnit}</td>
                  <td style={{ padding: "0.5rem" }}>{p.reorderLevel} {p.baseUnit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Recent Activity */}
      {stats && stats.recentActivity?.length > 0 && user.role === "ADMIN" && (
        <div className="glass-card">
          <h3 style={{ marginBottom: "1rem" }}>📋 Recent Activity</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {stats.recentActivity.map((log: any) => (
              <div key={log.id} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-light)", paddingBottom: "0.5rem" }}>
                <div>
                  <span style={{ fontWeight: 600 }}>{log.action}</span>
                  <span style={{ color: "var(--text-secondary)", marginLeft: "0.5rem", fontSize: "0.85rem" }}>
                    by {log.user?.name || log.user?.email}
                  </span>
                </div>
                <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
