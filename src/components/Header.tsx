"use client";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header compact">
      <div className="page-container header-inner">
        <div className="brand">
          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.35 }}
            className="logo"
          >
            <span className="logo-mark">AF</span>
            <span className="logo-text">AlcheFlow</span>
          </motion.div>
        </div>

        <nav className="nav is-desktop">
          <Link href="/catalog">Catalog</Link>
          <Link href="/quotations">Quotations</Link>
          <Link href="/orders">Orders</Link>
        </nav>

        <div className="actions">
          <button className="btn-secondary" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label="Toggle menu">
            ☰
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mobile-menu"
            onClick={() => setOpen(false)}
          >
            <div className="page-container">
              <nav className="nav-mobile">
                <Link href="/catalog">Catalog</Link>
                <Link href="/quotations">Quotations</Link>
                <Link href="/orders">Orders</Link>
                <Link href="/dashboard">Dashboard</Link>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
