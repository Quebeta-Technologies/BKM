import React from "react";

/** The little hearts that float up wherever she taps. */
export default function Hearts({ hearts }) {
  return (
    <>
      {hearts.map((h) => (
        <span
          key={h.id}
          className="fh"
          aria-hidden="true"
          style={{
            left: h.x,
            top: h.y,
            fontSize: h.size,
            color: h.glyph === "\u2726" ? "var(--gold)" : "var(--rose)",
            animationDelay: `${h.delay}s`,
            "--dx": `${h.dx}px`,
            "--rot": `${h.rot}deg`,
          }}
        >
          {h.glyph}
        </span>
      ))}
    </>
  );
}
