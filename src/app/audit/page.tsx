"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchLogs = async () => {
      const token = localStorage.getItem("token");
      if (!token) return router.push("/");
      const res = await fetch("/api/audit", { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setLogs(await res.json());
      setLoading(false);
    };
    fetchLogs();
  }, [router]);

  const actionColors: Record<string, string> = {
    USER_LOGIN: "#22c55e",
    USER_REGISTER: "#3b82f6",
    PRODUCT_CREATED: "#8b5cf6",
    PRODUCT_UPDATED: "#f59e0b",
    PRODUCT_DELETED: "#ef4444",
    QUOTATION_CREATED: "#06b6d4",
    QUOTATION_STATUS_UPDATED: "#f59e0b",
    ORDER_CREATED: "#22c55e",
    ORDER_STATUS_UPDATED: "#8b5cf6",
  };

  return (
    <div className="page-container">
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 className="heading-primary" style={{ marginBottom: 0, fontSize: "2rem" }}>📋 Audit Logs</h1>
        <button className="btn-secondary" onClick={() => router.push("/dashboard")}>Back to Dashboard</button>
      </header>

      <div className="glass-card">
        {loading ? <p>Loading...</p> : logs.length === 0 ? (
          <p style={{ color: "var(--text-secondary)" }}>No audit logs found.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <th style={{ padding: "0.75rem", color: "var(--text-secondary)" }}>Timestamp</th>
                  <th style={{ padding: "0.75rem", color: "var(--text-secondary)" }}>User</th>
                  <th style={{ padding: "0.75rem", color: "var(--text-secondary)" }}>Action</th>
                  <th style={{ padding: "0.75rem", color: "var(--text-secondary)" }}>Entity</th>
                  <th style={{ padding: "0.75rem", color: "var(--text-secondary)" }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                    <td style={{ padding: "0.75rem", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td style={{ padding: "0.75rem" }}>{log.user?.name || log.user?.email}</td>
                    <td style={{ padding: "0.75rem" }}>
                      <span style={{
                        padding: "0.2rem 0.5rem", borderRadius: "0.5rem", fontSize: "0.8rem", fontWeight: 600,
                        backgroundColor: actionColors[log.action] || "#94a3b8", color: "#000",
                      }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ padding: "0.75rem", fontSize: "0.85rem" }}>{log.entity || "—"}</td>
                    <td style={{ padding: "0.75rem", fontSize: "0.8rem", color: "var(--text-secondary)", maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {log.newData || log.oldData || log.details || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
