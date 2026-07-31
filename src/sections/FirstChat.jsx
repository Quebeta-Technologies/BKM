import React, { useEffect, useRef, useState } from "react";
import Reveal from "../components/Reveal.jsx";
import useReveal from "../lib/useReveal.js";
import { CHAT, HER_NAME, START } from "../data.js";
import { daysBetween } from "../lib/utils.js";

const REACTIONS = ["❤️", "😍", "🥺", "💕", "😊", "✨", "🫶"];

function Bubble({ c, onReact }) {
  const [reaction, setReaction] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const timerRef = useRef(null);

  const handleTap = () => {
    setShowPicker(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setShowPicker(false), 2500);
  };

  const pick = (emoji) => {
    setReaction(emoji);
    setShowPicker(false);
    onReact && onReact();
  };

  return (
    <div
      className={`bub ${c.from}`}
      style={{ cursor: "pointer", position: "relative", userSelect: "none" }}
      onClick={handleTap}
      title="Tap to react"
    >
      {c.type === "voice" ? (
        <div className="flex items-center gap-3">
          <span className="rose">▶</span>
          <div className="wave">
            {Array.from({ length: 18 }, (_, k) => (
              <i key={k} style={{ animationDelay: `${k * 0.07}s` }} />
            ))}
          </div>
          <span className="text-xs opacity-70">{c.dur}</span>
        </div>
      ) : c.text}
      <time>{c.t}</time>

      {reaction && (
        <span
          key={reaction + Date.now()}
          style={{
            position: "absolute", bottom: "100%",
            right: c.from === "me" ? 0 : "auto",
            left: c.from === "her" ? 0 : "auto",
            fontSize: "1.4rem",
            animation: "reactionFloat 1.8s ease-out forwards",
            pointerEvents: "none",
          }}
        >{reaction}</span>
      )}

      {showPicker && (
        <div
          style={{
            position: "absolute", bottom: "110%", left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(30,22,56,0.97)",
            border: "1px solid rgba(244,199,123,0.3)",
            borderRadius: 24, padding: "6px 10px",
            display: "flex", gap: 6, zIndex: 20,
            animation: "popIn 0.2s ease", whiteSpace: "nowrap",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {REACTIONS.map((r) => (
            <button key={r} onClick={() => pick(r)}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem", padding: 2 }}>
              {r}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function FirstChat() {
  const [ref, on] = useReveal(0.25);
  const [shown, setShown] = useState(0);
  const [typing, setTyping] = useState(false);
  const [reactCount, setReactCount] = useState(0);
  const box = useRef(null);
  const touchStart = useRef(null);

  const handleTouchStart = (e) => { touchStart.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(dx) > 60 && shown < CHAT.length) setShown(CHAT.length);
    touchStart.current = null;
  };

  useEffect(() => {
    if (!on || shown >= CHAT.length) return;
    setTyping(true);
    const a = setTimeout(() => setTyping(false), 620);
    const b = setTimeout(() => setShown((n) => n + 1), 900);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, [on, shown]);

  useEffect(() => {
    if (box.current) box.current.scrollTop = box.current.scrollHeight;
  }, [shown, typing]);

  const days = daysBetween(START, new Date());

  return (
    <section className="px-6 py-24 md:py-32 max-w-5xl mx-auto" ref={ref}>
      <Reveal className="text-center">
        <p className="eyebrow mb-6">Chapter two</p>
        <h2 className="display text-4xl md:text-6xl mb-4">The night it started</h2>
        <p className="soft text-sm md:text-base">10 August 2025 &nbsp;&middot;&nbsp; 9:14 pm</p>
        <p className="soft text-xs mt-2 opacity-50">tap any message to react · swipe to skip ahead</p>
      </Reveal>

      <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <Reveal>
          <div className="phone p-4 mx-auto" style={{ maxWidth: 380 }}>
            <div className="flex items-center gap-3 px-2 pb-3 mb-2"
              style={{ borderBottom: "1px solid rgba(255,255,255,.07)" }}>
              <div className="flex items-center justify-center"
                style={{ width: 38, height: 38, borderRadius: "50%",
                  background: "linear-gradient(140deg,#F08FA8,#C3A6F0)", color: "#2A1B48" }}>♥</div>
              <div>
                <p className="text-sm" style={{ color: "#EFE7F7" }}>{HER_NAME}</p>
                <p className="text-xs gold opacity-70">online</p>
              </div>
              {reactCount > 0 && (
                <span className="ml-auto text-xs" style={{ color: "var(--rose)", opacity: 0.8 }}>
                  {reactCount} reaction{reactCount > 1 ? "s" : ""} ✨
                </span>
              )}
            </div>
            <div ref={box} className="flex flex-col gap-2 px-1"
              style={{ height: 340, overflowY: "auto" }}
              onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
              {CHAT.slice(0, shown).map((c, i) => (
                <Bubble key={i} c={c} onReact={() => setReactCount((n) => n + 1)} />
              ))}
              {typing && shown < CHAT.length && (
                <div className={`bub ${CHAT[shown].from} typing`} style={{ padding: "12px 16px" }}>
                  <i /><i style={{ animationDelay: ".2s" }} /><i style={{ animationDelay: ".4s" }} />
                </div>
              )}
            </div>
          </div>
        </Reveal>

        <Reveal delay={200}>
          <p className="display text-3xl md:text-4xl mb-6 leading-snug">
            And we have not stopped talking since.
          </p>
          <p className="soft leading-relaxed mb-6 text-sm md:text-base">
            That&rsquo;s <span className="gold">{days.toLocaleString()} days</span> of good mornings.
            Of voice notes I&rsquo;ve listened to more times than I&rsquo;ll admit.
          </p>
          <p className="soft leading-relaxed text-sm md:text-base">
            People say the beginning is the best part. They&rsquo;re wrong. Every single week
            with you has been better than the one before it, and I&rsquo;ve been keeping score.
          </p>
        </Reveal>
      </div>
    </section>
  );
}