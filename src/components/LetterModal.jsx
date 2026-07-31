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
    <div className="scrim flex items-center justify-center p-4 md:p-8" onClick={onClose}>
      <div
        className="paper w-full p-8 md:p-14"
        style={{ maxWidth: 660, maxHeight: "88vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={letter.title}
      >
        <p className="eyebrow mb-6" style={{ color: "#A8763C" }}>
          {letter.seal}
        </p>
        <h3 className="display text-3xl md:text-4xl mb-8" style={{ color: "var(--ink)" }}>
          {letter.title}
        </h3>

        {letter.body.map((para, i) => (
          <p key={i}>{para}</p>
        ))}

        <p className="script text-3xl mt-10" style={{ color: "#B93E62" }}>
          {YOUR_SIGNOFF}
        </p>

        <button
          className="btn mt-10"
          style={{ color: "#8A5A2B", borderColor: "rgba(138,90,43,.4)" }}
          onClick={onClose}
        >
          Close the letter
        </button>
      </div>
    </div>
  );
}
