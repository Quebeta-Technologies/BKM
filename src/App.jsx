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

const GLYPHS = ["\u2665", "\u2661", "\u2764", "\u2726"];

export default function App() {
  const [unlocked, setUnlocked] = useState(!LOCK.enabled);
  const [letter, setLetter] = useState(null);
  const [hearts, setHearts] = useState([]);
  const nextId = useRef(0);

  // Keep the page still behind the lock screen.
  useEffect(() => {
    document.body.style.overflow = unlocked ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [unlocked]);

  const burst = useCallback((x, y, count = 5) => {
    if (prefersReducedMotion()) return;

    const made = Array.from({ length: count }, () => ({
      id: ++nextId.current,
      x,
      y,
      glyph: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
      dx: (Math.random() - 0.5) * 160,
      rot: (Math.random() - 0.5) * 90,
      size: 14 + Math.random() * 20,
      delay: Math.random() * 0.35,
    }));

    setHearts((h) => [...h, ...made]);
    const ids = new Set(made.map((m) => m.id));
    setTimeout(() => setHearts((h) => h.filter((m) => !ids.has(m.id))), 3000);
  }, []);

  // Hearts wherever she taps — except on things that are already interactive.
  const onTap = (e) => {
    if (!unlocked) return;
    if (e.target.closest && e.target.closest("button, a, input, .env, .star-hit, .paper")) return;
    burst(e.clientX, e.clientY, 3);
  };

  return (
    <div onClick={onTap}>
      <Aurora />
      <StarField />

      <main className="wrap" aria-hidden={!unlocked}>
        <Hero />
        <Ornament />
        <Constellation />
        <Ornament />
        <FirstChat />
        <Ornament />
        <Letters onOpen={setLetter} />
        <Ornament />
        <Reasons burst={burst} />
        <Ornament />
        <Moments />
        <Ornament />
        <Finale burst={burst} />
      </main>

      {letter && <LetterModal letter={letter} onClose={() => setLetter(null)} />}

      {unlocked && <MusicToggle start={unlocked} />}

      {/* Lock stays mounted so it can fade itself out, then removes itself. */}
      {LOCK.enabled && <Lock onUnlock={() => setUnlocked(true)} />}

      <Hearts hearts={hearts} />
    </div>
  );
}
