"use client";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="page-container footer-inner">
        <div>
          © {new Date().getFullYear()} AlcheFlow — Built for labs & supply teams.
        </div>
        <div className="footer-links">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Contact</a>
        </div>
      </div>
    </footer>
  );
}
