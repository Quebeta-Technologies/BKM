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

/* ── Voice note player inside easter egg ─────── */
function EggVoiceNote() {
  const audioRef  = useRef(null);
  const rafRef    = useRef(null);
  const [playing, setPlaying]   = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [loaded, setLoaded]     = useState(false);
  const [error, setError]       = useState(false);

  /* put your voice note file in public/audio/ */
  const SRC = "/audio/love.mp3"; /* ← change filename to match your file */

  useEffect(() => {
    const audio = new Audio(SRC);
    audio.preload = "auto";
    audioRef.current = audio;

    audio.addEventListener("canplaythrough", () => setLoaded(true));
    audio.addEventListener("error", () => setError(true));
    audio.addEventListener("ended", () => {
      setPlaying(false);
      setProgress(0);
      setCurrentTime("0:00");
      cancelAnimationFrame(rafRef.current);
    });

    /* auto-play after a short delay so the animation settles first */
    const t = setTimeout(() => {
      audio.play().then(() => {
        setPlaying(true);
        tick(audio);
      }).catch(() => {/* autoplay blocked — she'll tap play */});
    }, 200);

    return () => {
      clearTimeout(t);
      audio.pause();
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const fmt = (s) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return m + ":" + String(sec).padStart(2, "0");
  };

  const tick = (audio) => {
    if (!audio) return;
    const pct = audio.duration ? audio.currentTime / audio.duration : 0;
    setProgress(pct);
    setCurrentTime(fmt(audio.currentTime));
    if (!audio.paused) rafRef.current = requestAnimationFrame(() => tick(audio));
  };

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
      cancelAnimationFrame(rafRef.current);
    } else {
      audio.play().then(() => {
        setPlaying(true);
        tick(audio);
      }).catch(() => setError(true));
    }
  };

  const seek = (e) => {
    const audio = audioRef.current;
    if (!audio?.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = pct * audio.duration;
    setProgress(pct);
    setCurrentTime(fmt(audio.currentTime));
  };

  const BAR_COUNT = 24;
  const barHeights = useRef(
    Array.from({ length: BAR_COUNT }, () => 0.2 + Math.random() * 0.8)
  );

  if (error) return null;

  return (
    <div style={{
      display        : "flex",
      alignItems     : "center",
      gap            : 12,
      background     : "rgba(255,255,255,0.07)",
      border         : "1px solid rgba(240,143,168,0.3)",
      borderRadius   : 40,
      padding        : "12px 18px",
      backdropFilter : "blur(12px)",
      marginTop      : 20,
      animation      : "eggVoiceFade 0.6s ease 0.5s both",
      minWidth       : 220,
      maxWidth       : 280,
    }}>
      {/* play/pause */}
      <button onClick={toggle} style={{
        width          : 40,
        height         : 40,
        borderRadius   : "50%",
        border         : "none",
        background     : "linear-gradient(135deg,rgba(240,143,168,0.4),rgba(195,166,240,0.3))",
        color          : "#fff",
        cursor         : "pointer",
        display        : "flex",
        alignItems     : "center",
        justifyContent : "center",
        fontSize       : "0.9rem",
        flexShrink     : 0,
        boxShadow      : playing ? "0 0 16px rgba(240,143,168,0.6)" : "none",
        transition     : "box-shadow 0.3s",
      }}>
        {playing ? "⏸" : "▶"}
      </button>

      {/* waveform */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", gap:3 }}>
        <div onClick={seek} style={{
          display    : "flex",
          alignItems : "center",
          gap        : 2,
          height     : 28,
          cursor     : "pointer",
        }}>
          {barHeights.current.map((h, i) => {
            const barPct = i / BAR_COUNT;
            const isPast = barPct <= progress;
            const isNear = Math.abs(barPct - progress) < 0.08;
            return (
              <div key={i} style={{
                flex           : 1,
                height         : (h * 100) + "%",
                borderRadius   : 2,
                background     : isPast ? "#F08FA8" : "rgba(255,255,255,0.2)",
                transition     : "background 0.1s",
                transform      : (playing && isNear) ? "scaleY(1.5)" : "scaleY(1)",
                transformOrigin: "center",
              }}/>
            );
          })}
        </div>
        <div style={{
          display        : "flex",
          justifyContent : "space-between",
          fontSize       : "0.55rem",
          color          : "rgba(255,255,255,0.45)",
          fontFamily     : "Jost, sans-serif",
          letterSpacing  : "0.05em",
        }}>
          <span>{playing ? currentTime : "0:00"}</span>
          <span style={{ color:"rgba(240,143,168,0.7)", fontSize:"0.5rem" }}>
            {loaded ? "for her ♥" : "loading…"}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Easter egg overlay ──────────────────────── */
function LoveExplosion({ onDone }) {
  const pieces = Array.from({ length: 60 }, (_, i) => ({
    id    : i,
    x     : Math.random() * 100,
    y     : Math.random() * 100,
    size  : 16 + Math.random() * 32,
    dur   : 1.2 + Math.random() * 1.4,
    delay : Math.random() * 0.8,
    glyph : ["♥","♡","❤","💕","✦","★","✿"][Math.floor(Math.random() * 7)],
    color : ["#F08FA8","#F4C77B","#C3A6F0","#FBD5DE","#fff"][Math.floor(Math.random() * 5)],
  }));

  useEffect(() => {
    // Auto-close after 4s — enough for 2s voice note + animation
    const t = setTimeout(onDone, 4000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      onClick={onDone}
      style={{
        position       : "fixed",
        inset          : 0,
        zIndex         : 200,
        display        : "flex",
        alignItems     : "center",
        justifyContent : "center",
        flexDirection  : "column",
        pointerEvents  : "auto",
        animation      : "eggFade 4s ease forwards",
        cursor         : "pointer",
      }}
    >
      <style>{`
        @keyframes eggVoiceFade {
          from { opacity:0; transform:translateY(10px) scale(0.95); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
      `}</style>

      {/* floating pieces */}
      {pieces.map(p => (
        <span key={p.id} style={{
          position  : "absolute",
          left      : p.x + "%",
          top       : p.y + "%",
          fontSize  : p.size,
          color     : p.color,
          animation : "eggPiece " + p.dur + "s ease-out " + p.delay + "s both",
          "--ex"    : ((Math.random() - 0.5) * 200) + "px",
          "--ey"    : ((Math.random() - 0.5) * 200) + "px",
          pointerEvents:"none",
        }}>{p.glyph}</span>
      ))}

      {/* centre content */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position      : "relative",
          zIndex        : 5,
          textAlign     : "center",
          animation     : "eggMsg 3.8s ease forwards",
          display       : "flex",
          flexDirection : "column",
          alignItems    : "center",
          padding       : "0 24px",
        }}
      >
        <p style={{
          fontFamily : "Parisienne, cursive",
          fontSize   : "clamp(2.5rem,8vw,5rem)",
          color      : "#F08FA8",
          textShadow : "0 0 40px rgba(240,143,168,0.8), 0 0 80px rgba(240,143,168,0.4)",
          lineHeight : 1.1,
          marginBottom: 8,
        }}>
          I love you
        </p>
        <p style={{
          fontFamily   : "Jost, sans-serif",
          fontSize     : "0.72rem",
          letterSpacing: "0.4em",
          textTransform: "uppercase",
          color        : "#F4C77B",
          marginBottom : 4,
          opacity      : 0.9,
        }}>
          more than you know
        </p>

        {/* voice note */}
        <EggVoiceNote />

        {/* tap to close hint */}
        <p style={{
          marginTop    : 18,
          fontSize     : "0.55rem",
          letterSpacing: "0.25em",
          color        : "rgba(255,255,255,0.25)",
          fontFamily   : "Jost, sans-serif",
          textTransform: "uppercase",
          animation    : "eggVoiceFade 0.6s ease 1.5s both",
        }}>
          tap anywhere to close
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN APP
══════════════════════════════════════════════ */
export default function App() {
  const [unlocked, setUnlocked] = useState(!LOCK.enabled);
  const [letter, setLetter]     = useState(null);
  const [hearts, setHearts]     = useState([]);
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
        if (delta > 40 && Date.now() - lastShake > 3000) {
          lastShake = Date.now();
          setEasterEgg(true);
        }
      }
      lastAcc = { x: a.x, y: a.y, z: a.z };
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("devicemotion", onShake);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("devicemotion", onShake);
    };
  }, [unlocked]);

  const burst = useCallback((x, y, count = 5) => {
    if (prefersReducedMotion()) return;
    const made = Array.from({ length: count }, () => ({
      id    : ++nextId.current, x, y,
      glyph : GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
      dx    : (Math.random() - 0.5) * 200,
      rot   : (Math.random() - 0.5) * 90,
      size  : 14 + Math.random() * 22,
      delay : Math.random() * 0.3,
    }));
    setHearts(h => [...h, ...made]);
    const ids = new Set(made.map(m => m.id));
    setTimeout(() => setHearts(h => h.filter(m => !ids.has(m.id))), 3000);
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
        <div style={{
          position     : "fixed", left:14, bottom:14, zIndex:50,
          fontSize     : "0.58rem", letterSpacing:"0.22em",
          textTransform: "uppercase",
          color        : "rgba(195,166,240,0.28)",
          pointerEvents: "none", fontFamily:"Jost, sans-serif",
        }}>
          shift+L ♥
        </div>
      )}
    </div>
  );
}