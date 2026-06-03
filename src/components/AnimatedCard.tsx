"use client";
import { ReactNode } from "react";
import { motion } from "framer-motion";

export default function AnimatedCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -6, boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`glass-card ${className}`}
    >
      {children}
    </motion.div>
  );
}
