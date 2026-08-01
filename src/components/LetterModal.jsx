import React, { useEffect } from "react";
import { YOUR_SIGNOFF } from "../data.js";

export default function LetterModal({ letter, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999,
        background: "rgba(4, 2, 12, 0.92)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        animation: "fade 0.35s both",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={letter.title}
        style={{
          width: "100%",
          maxWidth: 660,
          maxHeight: "90vh",
          overflowY: "auto",
          background: "linear-gradient(180deg, #FDF7EC, #F6EBD8)",
          backgroundImage: "linear-gradient(180deg, #FDF7EC, #F6EBD8), repeating-linear-gradient(0deg, transparent, transparent 31px, rgba(42,32,54,0.06) 32px)",
          borderRadius: 6,
          boxShadow: "0 40px 100px -20px rgba(0,0,0,0.95), 0 0 0 1px rgba(244,199,123,0.15)",
          padding: "clamp(28px, 5vw, 56px)",
          animation: "rise 0.5s cubic-bezier(0.2,0.9,0.3,1) both",
          position: "relative",
        }}
      >
        {/* Decorative lines like real paper */}
        <div style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 31px, rgba(42,32,54,0.055) 32px)",
          borderRadius: 6,
          pointerEvents: "none",
        }} />

        {/* Red margin line like a real letter */}
        <div style={{
          position: "absolute",
          left: 52,
          top: 0,
          bottom: 0,
          width: 1,
          background: "rgba(185,62,98,0.18)",
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative" }}>
          {/* Seal label */}
          <p style={{
            fontSize: "0.65rem",
            letterSpacing: "0.42em",
            textTransform: "uppercase",
            fontWeight: 400,
            color: "#A8763C",
            opacity: 0.9,
            marginBottom: 20,
          }}>
            {letter.seal}
          </p>

          {/* Title */}
          <h3 style={{
            fontFamily: "Cormorant Garamond, Georgia, serif",
            fontWeight: 300,
            fontSize: "clamp(1.6rem, 4vw, 2.4rem)",
            lineHeight: 1.1,
            color: "#2A2036",
            marginBottom: 28,
          }}>
            {letter.title}
          </h3>

          {/* Divider */}
          <div style={{
            display: "flex", alignItems: "center", gap: 12,
            marginBottom: 28, opacity: 0.4,
          }}>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,transparent,#A8763C)" }} />
            <span style={{ color: "#A8763C", fontSize: "0.6rem" }}>✦</span>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,#A8763C,transparent)" }} />
          </div>

          {/* Body paragraphs */}
          {letter.body.map((para, i) => (
            <p key={i} style={{
              fontFamily: "Jost, sans-serif",
              fontWeight: 300,
              fontSize: "1rem",
              lineHeight: 1.88,
              color: "#2A2036",
              marginBottom: "1rem",
            }}>
              {para}
            </p>
          ))}

          {/* Sign off */}
          <p style={{
            fontFamily: "Parisienne, cursive",
            fontSize: "2rem",
            color: "#B93E62",
            marginTop: 32,
            marginBottom: 28,
          }}>
            {YOUR_SIGNOFF}
          </p>

          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              fontSize: "0.68rem",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              padding: "12px 26px",
              borderRadius: 3,
              border: "1px solid rgba(138,90,43,0.4)",
              color: "#8A5A2B",
              background: "transparent",
              cursor: "pointer",
              transition: "background 0.3s, color 0.3s",
              fontFamily: "Jost, sans-serif",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "#8A5A2B";
              e.target.style.color = "#FDF7EC";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "transparent";
              e.target.style.color = "#8A5A2B";
            }}
          >
            Close the letter
          </button>
        </div>
      </div>
    </div>
  );
}