import React, { useCallback, useEffect, useRef, useState } from "react";
import Lock from "./components/Lock.jsx";
import MusicToggle from "./components/MusicToggle.jsx";
import Hearts from "./components/Hearts.jsx";
import LetterModal from "./components/LetterModal.jsx";
import Aurora from "./components/Aurora.jsx";
import StarField from "./components/StarField.jsx";
import Ornament from "./components/Ornament.jsx";
import Hero from "./sections/Hero.jsx";
import Constellation from "./sections/Constellation.jsx";
import FirstChat from "./sections/FirstChat.jsx";
import Letters from "./sections/Letters.jsx";
import Reasons from "./sections/Reasons.jsx";
import Moments from "./sections/Moments.jsx";
import Finale from "./sections/Finale.jsx";
import { LOCK } from "./data.js";
import { prefersReducedMotion } from "./lib/utils.js";

const GLYPHS = ["\u2665","\u2661","\u2764","\u2726","\u2728","💜","💋"];

function LoveExplosion({ onDone }) {
  const pieces = Array.from({ length: 60 }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    size: 16 + Math.random() * 32, dur: 1.2 + Math.random() * 1.4,
    delay: Math.random() * 0.8,
    glyph: ["♥","♡","❤","💕","✦","★","✿"][Math.floor(Math.random() * 7)],
    color: ["#F08FA8","#F4C77B","#C3A6F0","#FBD5DE","#fff"][Math.floor(Math.random() * 5)],
  }));
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200,
      display: "flex", alignItems: "center", justifyContent: "center",
      pointerEvents: "none", animation: "eggFade 3.2s ease forwards" }}>
      <div style={{ position: "absolute", textAlign: "center", zIndex: 5, animation: "eggMsg 3s ease forwards" }}>
        <p style={{ fontFamily: "Parisienne, cursive", fontSize: "clamp(2.5rem,8vw,5rem)",
          color: "#F08FA8", textShadow: "0 0 40px rgba(240,143,168,0.8)" }}>I love you</p>
        <p style={{ fontFamily: "Jost, sans-serif", fontSize: "0.75rem",
          letterSpacing: "0.4em", textTransform: "uppercase", color: "#F4C77B", marginTop: 12 }}>
          more than you know
        </p>
      </div>
      {pieces.map((p) => (
        <span key={p.id} style={{
          position: "absolute", left: `${p.x}%`, top: `${p.y}%`,
          fontSize: p.size, color: p.color,
          animation: `eggPiece ${p.dur}s ease-out ${p.delay}s both`,
          "--ex": `${(Math.random() - 0.5) * 200}px`,
          "--ey": `${(Math.random() - 0.5) * 200}px`,
        }}>{p.glyph}</span>
      ))}
    </div>
  );
}

export default function App() {
  const [unlocked, setUnlocked] = useState(!LOCK.enabled);
  const [letter, setLetter] = useState(null);
  const [hearts, setHearts] = useState([]);
  const [easterEgg, setEasterEgg] = useState(false);
  const nextId = useRef(0);

  useEffect(() => {
    document.body.style.overflow = unlocked ? "" : "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [unlocked]);

  useEffect(() => {
    if (!unlocked) return;
    const onKey = (e) => { if (e.shiftKey && e.key === "L") setEasterEgg(true); };
    let lastShake = 0, lastAcc = null;
    const onShake = (e) => {
      const a = e.accelerationIncludingGravity;
      if (!a) return;
      if (lastAcc) {
        const delta = Math.abs(a.x - lastAcc.x) + Math.abs(a.y - lastAcc.y) + Math.abs(a.z - lastAcc.z);
        if (delta > 40 && Date.now() - lastShake > 3000) { lastShake = Date.now(); setEasterEgg(true); }
      }
      lastAcc = { x: a.x, y: a.y, z: a.z };
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("devicemotion", onShake);
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("devicemotion", onShake); };
  }, [unlocked]);

  const burst = useCallback((x, y, count = 5) => {
    if (prefersReducedMotion()) return;
    const made = Array.from({ length: count }, () => ({
      id: ++nextId.current, x, y,
      glyph: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
      dx: (Math.random() - 0.5) * 200,
      rot: (Math.random() - 0.5) * 90,
      size: 14 + Math.random() * 22,
      delay: Math.random() * 0.3,
    }));
    setHearts((h) => [...h, ...made]);
    const ids = new Set(made.map((m) => m.id));
    setTimeout(() => setHearts((h) => h.filter((m) => !ids.has(m.id))), 3000);
  }, []);

  const onTap = (e) => {
    if (!unlocked) return;
    if (e.target.closest && e.target.closest("button,a,input,.env,.star-hit,.paper,figure")) return;
    burst(e.clientX, e.clientY, 3);
  };

  return (
    <div onClick={onTap}>
      <Aurora /><StarField />
      <main className="wrap" aria-hidden={!unlocked}>
        <Hero /><Ornament />
        <Constellation /><Ornament />
        <FirstChat /><Ornament />
        <Letters onOpen={setLetter} /><Ornament />
        <Reasons burst={burst} /><Ornament />
        <Moments /><Ornament />
        <Finale burst={burst} />
      </main>
      {letter && <LetterModal letter={letter} onClose={() => setLetter(null)} />}
      {unlocked && <MusicToggle start={unlocked} />}
      {LOCK.enabled && <Lock onUnlock={() => setUnlocked(true)} />}
      <Hearts hearts={hearts} />
      {easterEgg && <LoveExplosion onDone={() => setEasterEgg(false)} />}
      {unlocked && (
        <div style={{ position: "fixed", left: 14, bottom: 14, zIndex: 50,
          fontSize: "0.58rem", letterSpacing: "0.22em", textTransform: "uppercase",
          color: "rgba(195,166,240,0.28)", pointerEvents: "none", fontFamily: "Jost, sans-serif" }}>
          shift+L ♥
        </div>
      )}
    </div>
  );
}