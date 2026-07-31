import React, { useState } from "react";
import Reveal from "../components/Reveal.jsx";
import { LETTERS } from "../data.js";

function Confetti({ active }) {
  if (!active) return null;
  const pieces = Array.from({ length: 32 }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 320,
    y: -(60 + Math.random() * 180),
    rot: Math.random() * 720,
    color: ["#F4C77B","#F08FA8","#C3A6F0","#FBD5DE","#fff"][Math.floor(Math.random() * 5)],
    size: 5 + Math.random() * 8,
    dur: 0.7 + Math.random() * 0.8,
    delay: Math.random() * 0.35,
    shape: Math.random() > 0.5 ? "circle" : "rect",
  }));
  return (
    <div style={{ position: "absolute", left: "50%", top: "50%", pointerEvents: "none", zIndex: 10 }}>
      {pieces.map((p) => (
        <div key={p.id} style={{
          position: "absolute",
          width: p.shape === "circle" ? p.size : p.size * 1.5,
          height: p.size,
          borderRadius: p.shape === "circle" ? "50%" : 2,
          background: p.color,
          animation: `confettiPop ${p.dur}s ease-out ${p.delay}s forwards`,
          "--cx": `${p.x}px`, "--cy": `${p.y}px`, "--cr": `${p.rot}deg`,
          opacity: 0,
        }} />
      ))}
    </div>
  );
}

export default function Letters({ onOpen }) {
  const [dragging, setDragging] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [positions, setPositions] = useState({});
  const [confetti, setConfetti] = useState(null);

  const startDrag = (e, id) => {
    e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const pos = positions[id] || { x: 0, y: 0 };
    setDragging(id);
    setDragOffset({ x: clientX - pos.x, y: clientY - pos.y });
  };

  const onDragMove = (e) => {
    if (!dragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setPositions((p) => ({ ...p, [dragging]: { x: clientX - dragOffset.x, y: clientY - dragOffset.y } }));
  };

  const endDrag = () => setDragging(null);

  const openLetter = (letter) => {
    setConfetti(letter.id);
    setTimeout(() => setConfetti(null), 1400);
    onOpen(letter);
  };

  return (
    <section style={{ padding: "3rem 1.5rem", maxWidth: 900, margin: "0 auto" }}
      onMouseMove={onDragMove} onMouseUp={endDrag}
      onTouchMove={onDragMove} onTouchEnd={endDrag}>
      <Reveal className="text-center">
        <p className="eyebrow mb-4">Chapter three</p>
        <h2 className="display mb-3" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}>
          Letters, sealed for you
        </h2>
        <p className="soft max-w-md mx-auto text-sm">
          Open one now. Save the rest for when you need them.
        </p>
        <p className="soft text-xs mt-1 opacity-50">drag them · click to open</p>
      </Reveal>

      <div style={{
        marginTop: 32,
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: 20,
      }}>
        {LETTERS.map((letter, i) => {
          const pos = positions[letter.id] || { x: 0, y: 0 };
          const isDragging = dragging === letter.id;
          return (
            <Reveal key={letter.id} delay={i * 100}>
              <div style={{ position: "relative" }}>
                <div className="env" style={{
                  aspectRatio: "1.5 / 1",
                  transform: `translate(${pos.x}px, ${pos.y}px) rotate(${isDragging ? 5 : 0}deg) ${isDragging ? "scale(1.07)" : ""}`,
                  transition: isDragging ? "none" : "transform 0.4s cubic-bezier(.2,.8,.3,1), box-shadow 0.4s",
                  boxShadow: isDragging ? "0 30px 70px -20px rgba(240,143,168,0.65)" : undefined,
                  cursor: isDragging ? "grabbing" : "grab",
                  zIndex: isDragging ? 20 : 1,
                  position: "relative",
                }}
                  tabIndex={0} role="button"
                  aria-label={`Open letter: ${letter.seal}`}
                  onMouseDown={(e) => startDrag(e, letter.id)}
                  onTouchStart={(e) => startDrag(e, letter.id)}
                  onClick={() => !isDragging && openLetter(letter)}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), openLetter(letter))}>
                  <div className="flap" />
                  <div className="seal">♥</div>
                  <div className="env-cap">{letter.seal}</div>
                </div>
                <Confetti active={confetti === letter.id} />
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}