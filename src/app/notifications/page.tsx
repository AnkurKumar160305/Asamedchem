"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function NotificationsPage() {
  const [data, setData] = useState<any>({ notifications: [], unreadCount: 0 });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchNotifications = async () => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/");
    setLoading(true);
    const res = await fetch("/api/notifications", { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setData(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchNotifications(); }, [router]);

  const handleMarkAllRead = async () => {
    const token = localStorage.getItem("token");
    await fetch("/api/notifications", { method: "PUT", headers: { Authorization: `Bearer ${token}` } });
    fetchNotifications();
  };

  return (
    <div className="page-container">
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 className="heading-primary" style={{ marginBottom: 0, fontSize: "2rem" }}>
            🔔 Notifications
            {data.unreadCount > 0 && (
              <span style={{ marginLeft: "0.75rem", padding: "0.2rem 0.6rem", borderRadius: "1rem", fontSize: "0.9rem", backgroundColor: "var(--danger)", color: "#fff" }}>
                {data.unreadCount} unread
              </span>
            )}
          </h1>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          {data.unreadCount > 0 && (
            <button className="btn-primary" onClick={handleMarkAllRead}>Mark All Read</button>
          )}
          <button className="btn-secondary" onClick={() => router.push("/dashboard")}>Back to Dashboard</button>
        </div>
      </header>

      <div className="glass-card">
        {loading ? (
          <p style={{ color: "var(--text-secondary)" }}>Loading...</p>
        ) : data.notifications.length === 0 ? (
          <p style={{ color: "var(--text-secondary)" }}>No notifications yet. Notifications appear when quotations are approved, orders are placed, or stock is low.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {data.notifications.map((n: any) => (
              <div key={n.id} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "1rem", borderRadius: "var(--border-radius-sm)",
                backgroundColor: n.isRead ? "transparent" : "rgba(59, 130, 246, 0.08)",
                borderLeft: n.isRead ? "3px solid transparent" : "3px solid var(--accent-primary)",
              }}>
                <div>
                  <div style={{ fontWeight: n.isRead ? 400 : 600, marginBottom: "0.25rem" }}>{n.title}</div>
                  <div style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>{n.message}</div>
                </div>
                <span style={{ color: "var(--text-secondary)", fontSize: "0.8rem", whiteSpace: "nowrap", marginLeft: "1rem" }}>
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
