"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("SELLER");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";

    try {
      const payload = isLogin ? { email, password } : { name, email, password, role };
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Failed to ${isLogin ? "login" : "register"}`);
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (type: "admin" | "seller") => {
    setIsLogin(true);
    if (type === "admin") {
      setEmail("admin@aasamedchem.com");
      setPassword("Password@123");
    } else {
      setEmail("seller@aasamedchem.com");
      setPassword("Password@123");
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "2rem" }}>
      <div className="glass-card" style={{ maxWidth: "420px", width: "100%", textAlign: "center" }}>
        <h1 className="heading-primary" style={{ fontSize: "2rem", marginBottom: "0.25rem" }}>AasaMedChem</h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", fontSize: "0.875rem" }}>
          Smart Inventory & Quotation Management
        </p>
        <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
          {isLogin ? "Sign in to your account" : "Create a new account"}
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {!isLogin && (
            <input
              type="text"
              className="input-premium"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}
          <input
            type="email"
            className="input-premium"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="input-premium"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {!isLogin && (
            <select
              className="input-premium"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{ appearance: "none", cursor: "pointer" }}
            >
              <option value="SELLER">Seller</option>
              <option value="BUYER">Buyer</option>
              <option value="ADMIN">Admin</option>
            </select>
          )}

          {error && <div style={{ color: "var(--danger)", fontSize: "0.875rem", textAlign: "left" }}>{error}</div>}

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: "0.5rem" }}>
            {loading ? "Processing..." : isLogin ? "Sign In" : "Register"}
          </button>
        </form>

        {/* Demo credentials */}
        {isLogin && (
          <div style={{ marginTop: "1.5rem", padding: "1rem", borderRadius: "var(--border-radius-sm)", background: "rgba(59, 130, 246, 0.1)" }}>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem", marginBottom: "0.75rem" }}>Quick Login (Demo Credentials)</p>
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
              <button className="btn-secondary" style={{ padding: "0.3rem 0.75rem", fontSize: "0.8rem" }} onClick={() => fillDemo("admin")}>
                Admin Login
              </button>
              <button className="btn-secondary" style={{ padding: "0.3rem 0.75rem", fontSize: "0.8rem" }} onClick={() => fillDemo("seller")}>
                Seller Login
              </button>
            </div>
          </div>
        )}

        <div style={{ marginTop: "1.5rem", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => { setIsLogin(!isLogin); setError(""); }}
            style={{
              background: "none", border: "none", color: "var(--accent-primary)",
              cursor: "pointer", fontWeight: 600, textDecoration: "underline",
            }}
          >
            {isLogin ? "Register here" : "Sign in here"}
          </button>
        </div>
      </div>
    </div>
  );
}
