"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
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
      const payload = isLogin ? { email, password } : { email, password, role };
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

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "2rem" }}>
      <div className="glass-card" style={{ maxWidth: "400px", width: "100%", textAlign: "center" }}>
        <h1 className="heading-primary" style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>AasaMedChem</h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
          {isLogin ? "Sign in to your account" : "Create a new account"}
        </p>
        
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <input 
              type="email" 
              className="input-premium" 
              placeholder="Email Address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <input 
              type="password" 
              className="input-premium" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          {!isLogin && (
            <div>
              <select 
                className="input-premium" 
                value={role} 
                onChange={(e) => setRole(e.target.value)}
                style={{ appearance: "none", cursor: "pointer" }}
              >
                <option value="BUYER">Buyer</option>
                <option value="SELLER">Seller</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          )}
          
          {error && <div style={{ color: "var(--danger)", fontSize: "0.875rem", textAlign: "left" }}>{error}</div>}
          
          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: "1rem" }}>
            {loading ? "Processing..." : (isLogin ? "Sign In" : "Register")}
          </button>
        </form>

        <div style={{ marginTop: "1.5rem", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(""); }}
            style={{ 
              background: "none", 
              border: "none", 
              color: "var(--accent-primary)", 
              cursor: "pointer", 
              fontWeight: 600,
              textDecoration: "underline"
            }}
          >
            {isLogin ? "Register here" : "Sign in here"}
          </button>
        </div>
      </div>
    </div>
  );
}
