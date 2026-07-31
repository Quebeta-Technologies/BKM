import React, { useEffect, useRef, useState } from "react";
import { HER_NAME, START, START_LABEL } from "../data.js";

function Typewriter({ text }) {
  const [shown, setShown] = useState(0);
  const [blink, setBlink] = useState(true);
  useEffect(() => {
    if (shown < text.length) {
      const t = setTimeout(() => setShown((n) => n + 1), 80);
      return () => clearTimeout(t);
    }
    const t = setInterval(() => setBlink((b) => !b), 530);
    return () => clearInterval(t);
  }, [shown, text]);
  return (
    <span>
      {text.slice(0, shown)}
      <span style={{ opacity: blink ? 1 : 0, color: "var(--rose)" }}>|</span>
    </span>
  );
}

export default function Hero() {
  const [now, setNow] = useState(() => Date.now());
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [ready, setReady] = useState(false);
  const heroRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    const onMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMouse({ x, y });
    };
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const ms = now - new Date(START).getTime();
  const units = [
    [Math.floor(ms / 86400000), "days"],
    [Math.floor(ms / 3600000) % 24, "hours"],
    [Math.floor(ms / 60000) % 60, "minutes"],
    [Math.floor(ms / 1000) % 60, "seconds"],
  ];

  const scrollToNext = () => {
    window.scrollBy({ top: window.innerHeight, behavior: "smooth" });
  };

  return (
    <header
      ref={heroRef}
      className="min-h-screen flex flex-col items-center justify-center text-center px-6 py-24 relative overflow-hidden"
      style={{ perspective: 1000 }}
    >
      {[
        { size: 320, left: "10%", top: "15%", color: "#4A2A6B", delay: 0, depth: 0.04 },
        { size: 220, right: "8%", top: "30%", color: "#8E3D63", delay: 1.5, depth: 0.07 },
        { size: 180, left: "30%", bottom: "20%", color: "#2E3A7A", delay: 0.8, depth: 0.05 },
        { size: 140, right: "25%", bottom: "35%", color: "#6B2A8E", delay: 2, depth: 0.09 },
      ].map((orb, i) => (
        <div
          key={i}
          aria-hidden="true"
          style={{
            position: "absolute",
            width: orb.size,
            height: orb.size,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${orb.color}, transparent 70%)`,
            left: orb.left,
            right: orb.right,
            top: orb.top,
            bottom: orb.bottom,
            filter: "blur(60px)",
            opacity: 0.6,
            transform: `translate(${mouse.x * orb.depth * 100}px, ${mouse.y * orb.depth * 100}px)`,
            transition: "transform 0.3s ease-out",
            animation: `drift${(i % 2) + 1} ${24 + i * 4}s ease-in-out infinite`,
            animationDelay: `${orb.delay}s`,
            pointerEvents: "none",
          }}
        />
      ))}

      <div
        style={{
          transform: `rotateX(${mouse.y * -3}deg) rotateY(${mouse.x * 3}deg)`,
          transformStyle: "preserve-3d",
          opacity: ready ? 1 : 0,
          transition: "opacity 1.2s ease, transform 0.25s ease-out",
        }}
      >
        <p
          className="eyebrow mb-8"
          style={{
            opacity: ready ? 0.85 : 0,
            transform: ready ? "none" : "translateY(20px)",
            transition: "all 1s ease 0.2s",
          }}
        >
          Girlfriend&rsquo;s Day &nbsp;&middot;&nbsp; for one girl in particular
        </p>

        <h1
          className="display mb-4"
          style={{
            fontSize: "clamp(2.4rem, 7vw, 5.5rem)",
            opacity: ready ? 1 : 0,
            transform: ready ? "none" : "translateY(24px)",
            transition: "all 1s ease 0.45s",
          }}
        >
          Happy Girlfriend&rsquo;s Day,
        </h1>

        <p
          className="script rose mb-10"
          style={{
            fontSize: "clamp(2.8rem, 8vw, 6rem)",
            opacity: ready ? 1 : 0,
            transform: ready ? "none" : "translateY(24px)",
            transition: "all 1s ease 0.7s",
          }}
        >
          {ready && <Typewriter text={HER_NAME} />}
        </p>

        <p
          className="soft max-w-lg mx-auto text-base md:text-lg leading-relaxed mb-14"
          style={{
            opacity: ready ? 1 : 0,
            transform: ready ? "none" : "translateY(20px)",
            transition: "all 1s ease 1s",
          }}
        >
          I couldn&rsquo;t fit it in a message. I couldn&rsquo;t fit it in a
          card. So I built you the whole sky instead. Scroll slowly &mdash;
          it&rsquo;s all for you.
        </p>

        <div
          style={{
            opacity: ready ? 1 : 0,
            transform: ready ? "none" : "translateY(20px)",
            transition: "all 1s ease 1.3s",
          }}
        >
          <p className="eyebrow mb-5">We have been us for</p>
          <div className="tick">
            {units.map(([value, label]) => (
              <div key={label} style={{ position: "relative", overflow: "hidden" }}>
                <span key={value} style={{ display: "block", animation: "tickFlip 0.3s ease" }}>
                  {String(value).padStart(2, "0")}
                </span>
                <em>{label}</em>
              </div>
            ))}
          </div>
          <p className="soft text-xs mt-5 tracking-widest opacity-60">{START_LABEL}</p>
        </div>
      </div>

      <button
        onClick={scrollToNext}
        aria-label="Scroll down"
        style={{
          position: "absolute",
          bottom: 36,
          left: "50%",
          transform: "translateX(-50%)",
          background: "none",
          border: "none",
          cursor: "pointer",
          animation: "bounceArrow 2s ease-in-out infinite",
          opacity: scrollY > 80 ? 0 : 0.7,
          transition: "opacity 0.4s",
        }}
      >
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path d="M6 10 L14 18 L22 10" stroke="#F4C77B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </header>
  );
}