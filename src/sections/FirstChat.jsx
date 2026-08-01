import React, { useEffect, useRef, useState, useCallback } from "react";
import Reveal from "../components/Reveal.jsx";
import useReveal from "../lib/useReveal.js";
import { HER_NAME, START } from "../data.js";
import { daysBetween } from "../lib/utils.js";

/* ─────────────────────────────────────────────────────────────
   PASTE YOUR REAL MESSAGES HERE
   from: "her" = Rimi's messages (left, dark)
   from: "me"  = your messages  (right, purple)
   type: "text" | "voice"
   For voice notes: set src to the path of your audio file
   e.g. src: "/audio/voice1.mp3"
   and set dur to the duration string e.g. "0:47"
───────────────────────────────────────────────────────────── */
const CHAT = [
  { from: "her", type: "text", text: "Hey 👋 I hope this isn't weird... I've been meaning to message you all day.", t: "9:14 pm" },
  { from: "me",  type: "text", text: "not weird at all 😊 I was kind of hoping you would", t: "9:16 pm" },
  { from: "me",  type: "text", text: "Okay good. I had a whole backup plan if you'd said it was weird.", t: "9:16 pm" },
  { from: "her", type: "text", text: "now I need to hear the backup plan", t: "9:17 pm" },
  { from: "me",  type: "text", text: "Absolutely not. Ask me again in a year.", t: "9:17 pm" },
  { from: "her", type: "text", text: "a year 🤨 confident", t: "9:18 pm" },
  /* ── VOICE NOTE 1 — replace src with your actual file path ── */
  { from: "her", type: "voice", src: "/audio/voice1.mp3", dur: "0:47", t: "9:22 pm" },
  { from: "me",  type: "text", text: "okay. okay I'm smiling. this is your fault", t: "9:31 pm" },
  /* ── VOICE NOTE 2 — replace src with your actual file path ── */
  { from: "her", type: "voice", src: "/audio/voice2.mp3", dur: "1:12", t: "9:44 pm" },
  { from: "me",  type: "text", text: "you can't just say things like that and expect me to be normal about it", t: "9:51 pm" },
];

const REACTIONS = ["❤️", "😍", "🥺", "💕", "😊", "✨", "🫶"];

/* ─── Voice note player ─────────────────────────────────────── */
function VoiceNote({ src, dur, from }) {
  const audioRef    = useRef(null);
  const [playing, setPlaying]     = useState(false);
  const [progress, setProgress]   = useState(0);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [loaded, setLoaded]       = useState(false);
  const [error, setError]         = useState(false);
  const rafRef = useRef(null);

  // create audio element once
  useEffect(() => {
    const audio = new Audio(src);
    audio.preload = "metadata";
    audioRef.current = audio;

    audio.addEventListener("loadedmetadata", () => setLoaded(true));
    audio.addEventListener("error", () => setError(true));
    audio.addEventListener("ended", () => {
      setPlaying(false);
      setProgress(0);
      setCurrentTime("0:00");
      cancelAnimationFrame(rafRef.current);
    });

    return () => {
      audio.pause();
      cancelAnimationFrame(rafRef.current);
    };
  }, [src]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  const tick = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const pct = audio.duration ? audio.currentTime / audio.duration : 0;
    setProgress(pct);
    setCurrentTime(formatTime(audio.currentTime));
    if (!audio.paused) rafRef.current = requestAnimationFrame(tick);
  }, []);

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
        rafRef.current = requestAnimationFrame(tick);
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
    setCurrentTime(formatTime(audio.currentTime));
  };

  const BAR_COUNT = 28;
  // pseudo-random heights for waveform bars
  const barHeights = useRef(
    Array.from({ length: BAR_COUNT }, () => 0.2 + Math.random() * 0.8)
  );

  const isHer = from === "her";

  return (
    <div style={{
      display       : "flex",
      alignItems    : "center",
      gap           : 10,
      minWidth      : 200,
      maxWidth      : 260,
    }}>
      {/* play/pause button */}
      <button
        onClick={toggle}
        style={{
          width          : 38,
          height         : 38,
          borderRadius   : "50%",
          border         : "none",
          background     : isHer
            ? "linear-gradient(135deg,rgba(240,143,168,0.25),rgba(195,166,240,0.25))"
            : "rgba(255,255,255,0.15)",
          color          : isHer ? "#F08FA8" : "#fff",
          cursor         : "pointer",
          display        : "flex",
          alignItems     : "center",
          justifyContent : "center",
          fontSize       : "0.85rem",
          flexShrink     : 0,
          transition     : "all 0.2s",
          boxShadow      : playing ? `0 0 14px rgba(240,143,168,0.5)` : "none",
        }}
      >
        {playing ? "⏸" : "▶"}
      </button>

      {/* waveform + scrub */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", gap:4 }}>
        {/* waveform bars */}
        <div
          onClick={seek}
          style={{
            display       : "flex",
            alignItems    : "center",
            gap           : 2,
            height        : 32,
            cursor        : "pointer",
            position      : "relative",
          }}
        >
          {barHeights.current.map((h, i) => {
            const barPct = i / BAR_COUNT;
            const isPast = barPct <= progress;
            const isNear = Math.abs(barPct - progress) < 0.06;
            return (
              <div key={i} style={{
                flex           : 1,
                height         : `${h * 100}%`,
                borderRadius   : 2,
                background     : isPast
                  ? (isHer ? "#F08FA8" : "#C3A6F0")
                  : "rgba(255,255,255,0.2)",
                transition     : "background 0.1s",
                transform      : (playing && isNear) ? "scaleY(1.4)" : "scaleY(1)",
                transformOrigin: "center",
                animation      : (playing && isNear)
                  ? "barPulse 0.4s ease-in-out infinite alternate"
                  : "none",
              }}/>
            );
          })}
        </div>

        {/* time display */}
        <div style={{
          display        : "flex",
          justifyContent : "space-between",
          fontSize       : "0.6rem",
          fontFamily     : "Jost, sans-serif",
          letterSpacing  : "0.05em",
          color          : "rgba(255,255,255,0.45)",
        }}>
          <span>{playing ? currentTime : "0:00"}</span>
          <span>{error ? "unavailable" : dur}</span>
        </div>
      </div>
    </div>
  );
}

/* ─── single chat bubble ─────────────────────────────────────── */
function Bubble({ c, isNew }) {
  const [reaction, setReaction]   = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const timerRef = useRef(null);
  const isHer = c.from === "her";

  const handleTap = () => {
    setShowPicker(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setShowPicker(false), 2500);
  };

  const pick = (emoji) => {
    setReaction(emoji);
    setShowPicker(false);
  };

  return (
    <div style={{
      display        : "flex",
      justifyContent : isHer ? "flex-start" : "flex-end",
      animation      : isNew ? "bubbleIn 0.35s cubic-bezier(.2,.8,.3,1) both" : "none",
    }}>
      <div
        onClick={handleTap}
        style={{
          position       : "relative",
          maxWidth       : "82%",
          padding        : c.type === "voice" ? "10px 12px" : "10px 14px",
          borderRadius   : isHer
            ? "4px 18px 18px 18px"
            : "18px 4px 18px 18px",
          background     : isHer
            ? "rgba(255,255,255,0.07)"
            : "linear-gradient(135deg,rgba(130,80,190,0.7),rgba(100,60,160,0.7))",
          border         : `1px solid ${isHer ? "rgba(255,255,255,0.08)" : "rgba(195,166,240,0.25)"}`,
          backdropFilter : "blur(8px)",
          cursor         : "pointer",
          userSelect     : "none",
          transition     : "transform 0.15s",
        }}
        onMouseDown={e => e.currentTarget.style.transform = "scale(0.97)"}
        onMouseUp={e   => e.currentTarget.style.transform = "scale(1)"}
        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
      >
        {c.type === "voice" ? (
          <VoiceNote src={c.src} dur={c.dur} from={c.from} />
        ) : (
          <p style={{
            fontSize   : "0.88rem",
            lineHeight : 1.55,
            color      : isHer ? "rgba(235,225,250,0.92)" : "#fff",
            fontFamily : "Jost, sans-serif",
            fontWeight : 300,
          }}>
            {c.text}
          </p>
        )}

        <div style={{
          display        : "flex",
          justifyContent : "flex-end",
          marginTop      : 4,
          fontSize       : "0.55rem",
          color          : "rgba(255,255,255,0.38)",
          fontFamily     : "Jost, sans-serif",
          letterSpacing  : "0.04em",
        }}>
          {c.t}
          {!isHer && (
            <span style={{ marginLeft:4, color:"rgba(195,166,240,0.7)" }}>✓✓</span>
          )}
        </div>

        {/* reaction float */}
        {reaction && (
          <span key={reaction + Date.now()} style={{
            position     : "absolute",
            bottom       : "100%",
            right        : isHer ? "auto" : 0,
            left         : isHer ? 0 : "auto",
            fontSize     : "1.4rem",
            animation    : "reactionFloat 1.8s ease-out forwards",
            pointerEvents: "none",
            lineHeight   : 1,
          }}>
            {reaction}
          </span>
        )}

        {/* reaction picker */}
        {showPicker && (
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position     : "absolute",
              bottom       : "110%",
              left         : "50%",
              transform    : "translateX(-50%)",
              background   : "rgba(20,14,40,0.97)",
              border       : "1px solid rgba(244,199,123,0.3)",
              borderRadius : 24,
              padding      : "6px 10px",
              display      : "flex",
              gap          : 4,
              zIndex       : 20,
              animation    : "popIn 0.18s ease",
              whiteSpace   : "nowrap",
              boxShadow    : "0 8px 32px rgba(0,0,0,0.5)",
            }}
          >
            {REACTIONS.map(r => (
              <button key={r} onClick={() => pick(r)} style={{
                background:"none", border:"none",
                cursor:"pointer", fontSize:"1.15rem", padding:2,
                transition:"transform 0.15s",
              }}
                onMouseEnter={e => e.target.style.transform = "scale(1.3)"}
                onMouseLeave={e => e.target.style.transform = "scale(1)"}
              >{r}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── typing indicator ───────────────────────────────────────── */
function TypingDots() {
  return (
    <div style={{ display:"flex", justifyContent:"flex-start" }}>
      <div style={{
        padding      : "12px 16px",
        borderRadius : "4px 18px 18px 18px",
        background   : "rgba(255,255,255,0.07)",
        border       : "1px solid rgba(255,255,255,0.08)",
        display      : "flex",
        gap          : 4,
        alignItems   : "center",
      }}>
        {[0, 0.22, 0.44].map((delay, i) => (
          <div key={i} style={{
            width        : 6,
            height       : 6,
            borderRadius : "50%",
            background   : "#F08FA8",
            animation    : `typingDot 1.2s ease-in-out ${delay}s infinite`,
          }}/>
        ))}
      </div>
    </div>
  );
}

/* ─── stat pill ──────────────────────────────────────────────── */
function StatPill({ icon, value, label, color, delay }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display        : "flex",
        alignItems     : "center",
        gap            : 10,
        padding        : "12px 16px",
        borderRadius   : 12,
        background     : hov ? `${color}12` : "rgba(255,255,255,0.03)",
        border         : `1px solid ${hov ? color + "44" : "rgba(255,255,255,0.08)"}`,
        transition     : "all 0.3s cubic-bezier(.2,.8,.3,1)",
        transform      : hov ? "translateY(-2px)" : "none",
        animation      : `fadeSlideUp 0.6s ease ${delay}ms both`,
        cursor         : "default",
      }}
    >
      <span style={{ fontSize:"1.2rem", filter:`drop-shadow(0 0 6px ${color})` }}>{icon}</span>
      <div>
        <div style={{
          fontFamily:"Cormorant Garamond,serif",
          fontSize:"1.3rem", color, lineHeight:1,
          textShadow:`0 0 12px ${color}88`,
        }}>{value}</div>
        <div style={{
          fontSize:"0.58rem", letterSpacing:"0.22em",
          textTransform:"uppercase", color:"rgba(255,255,255,0.4)",
          fontFamily:"Jost,sans-serif", marginTop:2,
        }}>{label}</div>
      </div>
    </div>
  );
}

/* ─── main section ───────────────────────────────────────────── */
export default function FirstChat() {
  const [ref, on]           = useReveal(0.18);
  const [shown, setShown]   = useState(0);
  const [typing, setTyping] = useState(false);
  const [reactCount, setReactCount] = useState(0);
  const [allShown, setAllShown] = useState(false);
  const boxRef    = useRef(null);
  const touchStart = useRef(null);

  /* touch swipe → show all */
  const handleTouchStart = (e) => { touchStart.current = e.touches[0].clientX; };
  const handleTouchEnd   = (e) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(dx) > 55) { setShown(CHAT.length); setAllShown(true); }
    touchStart.current = null;
  };

  /* sequential reveal */
  useEffect(() => {
    if (!on || shown >= CHAT.length) return;
    setTyping(true);
    const delay = CHAT[shown]?.type === "voice" ? 1200 : 750;
    const a = setTimeout(() => setTyping(false), delay - 180);
    const b = setTimeout(() => {
      setShown(n => n + 1);
      if (shown + 1 >= CHAT.length) setAllShown(true);
    }, delay);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, [on, shown]);

  /* auto-scroll */
  useEffect(() => {
    if (boxRef.current)
      boxRef.current.scrollTop = boxRef.current.scrollHeight;
  }, [shown, typing]);

  const days = daysBetween(START, new Date());

  return (
    <section style={{ padding:"5rem 1.25rem 4rem", maxWidth:1040, margin:"0 auto" }}
      ref={ref}>

      <style>{`
        @keyframes bubbleIn {
          from { opacity:0; transform:translateY(10px) scale(0.95); }
          to   { opacity:1; transform:translateY(0)    scale(1); }
        }
        @keyframes typingDot {
          0%,60%,100% { transform:translateY(0);    opacity:0.4; }
          30%          { transform:translateY(-5px); opacity:1; }
        }
        @keyframes reactionFloat {
          0%   { transform:translateY(0)     scale(1);   opacity:1; }
          100% { transform:translateY(-36px) scale(0.6); opacity:0; }
        }
        @keyframes popIn {
          from { transform:translateX(-50%) scale(0.7); opacity:0; }
          to   { transform:translateX(-50%) scale(1);   opacity:1; }
        }
        @keyframes barPulse {
          from { transform:scaleY(1); }
          to   { transform:scaleY(1.5); }
        }
        @keyframes phoneGlow {
          0%,100% { box-shadow:0 0 40px rgba(240,143,168,0.12), 0 24px 64px rgba(0,0,0,0.5); }
          50%     { box-shadow:0 0 60px rgba(240,143,168,0.22), 0 24px 64px rgba(0,0,0,0.5); }
        }
        @keyframes fadeSlideUp {
          from { opacity:0; transform:translateY(18px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes onlinePulse {
          0%,100% { opacity:1; transform:scale(1); }
          50%     { opacity:0.6; transform:scale(0.8); }
        }
        @keyframes headerGlow {
          0%,100% { text-shadow:0 0 40px rgba(240,143,168,0.3); }
          50%     { text-shadow:0 0 60px rgba(240,143,168,0.55), 0 0 100px rgba(195,166,240,0.2); }
        }
        @keyframes showAllBounce {
          0%,100% { transform:translateX(0); }
          50%     { transform:translateX(4px); }
        }
      `}</style>

      {/* ── header ── */}
      <Reveal className="text-center" style={{ marginBottom:56 }}>
        <p className="eyebrow mb-4" style={{ letterSpacing:"0.35em" }}>Chapter two</p>
        <h2 className="display mb-3" style={{
          fontSize:"clamp(2.2rem,5.5vw,4rem)",
          animation:"headerGlow 4s ease-in-out infinite",
        }}>
          The night it started
        </h2>
        <p className="soft text-sm mb-1" style={{ opacity:0.6 }}>
          10 August 2025 &nbsp;·&nbsp; 9:14 pm
        </p>
        <p className="soft text-xs mt-2" style={{ opacity:0.38, letterSpacing:"0.12em" }}>
          tap any message to react &nbsp;·&nbsp; swipe to skip ahead
        </p>
      </Reveal>

      {/* ── two-column layout ── */}
      <div style={{
        display             : "grid",
        gridTemplateColumns : "1fr 1fr",
        gap                 : 48,
        alignItems          : "start",
      }}
        className="chat-grid"
      >

        {/* ── LEFT: phone mockup ── */}
        <div style={{ display:"flex", justifyContent:"center" }}>
          <div style={{
            width          : "100%",
            maxWidth       : 360,
            borderRadius   : 28,
            background     : "rgba(16,10,36,0.92)",
            border         : "1px solid rgba(240,143,168,0.18)",
            backdropFilter : "blur(20px)",
            animation      : "phoneGlow 5s ease-in-out infinite",
            overflow       : "hidden",
          }}>
            {/* status bar */}
            <div style={{
              background   : "rgba(0,0,0,0.3)",
              padding      : "8px 20px 6px",
              display      : "flex",
              justifyContent:"space-between",
              alignItems   : "center",
            }}>
              <span style={{ fontSize:"0.6rem", color:"rgba(255,255,255,0.5)", fontFamily:"Jost,sans-serif" }}>9:14</span>
              <div style={{ display:"flex", gap:4 }}>
                {["▮▮▮","●","⚡"].map((s,i)=>(
                  <span key={i} style={{ fontSize:"0.5rem", color:"rgba(255,255,255,0.4)" }}>{s}</span>
                ))}
              </div>
            </div>

            {/* chat header */}
            <div style={{
              display      : "flex",
              alignItems   : "center",
              gap          : 12,
              padding      : "12px 18px",
              borderBottom : "1px solid rgba(255,255,255,0.06)",
              background   : "rgba(255,255,255,0.02)",
            }}>
              {/* avatar */}
              <div style={{
                width          : 40,
                height         : 40,
                borderRadius   : "50%",
                background     : "linear-gradient(140deg,#F08FA8,#C3A6F0)",
                display        : "flex",
                alignItems     : "center",
                justifyContent : "center",
                fontSize       : "1.1rem",
                flexShrink     : 0,
                boxShadow      : "0 0 12px rgba(240,143,168,0.4)",
              }}>♥</div>

              <div style={{ flex:1 }}>
                <p style={{
                  fontSize   : "0.88rem",
                  color      : "#EFE7F7",
                  fontFamily : "Jost, sans-serif",
                  fontWeight : 400,
                  lineHeight : 1.2,
                }}>
                  {HER_NAME}
                </p>
                <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:2 }}>
                  <div style={{
                    width        : 6,
                    height       : 6,
                    borderRadius : "50%",
                    background   : "#4ade80",
                    animation    : "onlinePulse 2s ease-in-out infinite",
                  }}/>
                  <span style={{
                    fontSize     : "0.58rem",
                    color        : "#4ade80",
                    fontFamily   : "Jost, sans-serif",
                    letterSpacing: "0.08em",
                    opacity      : 0.8,
                  }}>online</span>
                </div>
              </div>

              {reactCount > 0 && (
                <span style={{
                  fontSize     : "0.58rem",
                  color        : "var(--rose)",
                  fontFamily   : "Jost, sans-serif",
                  animation    : "bubbleIn 0.3s ease",
                }}>
                  {reactCount} ✨
                </span>
              )}
            </div>

            {/* messages */}
            <div
              ref={boxRef}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              style={{
                height     : 380,
                overflowY  : "auto",
                padding    : "14px 14px 8px",
                display    : "flex",
                flexDirection: "column",
                gap        : 8,
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(240,143,168,0.2) transparent",
              }}
            >
              {CHAT.slice(0, shown).map((c, i) => (
                <Bubble
                  key={i} c={c}
                  isNew={i === shown - 1}
                  onReact={() => setReactCount(n => n + 1)}
                />
              ))}
              {typing && shown < CHAT.length && <TypingDots />}
            </div>

            {/* bottom bar */}
            <div style={{
              padding      : "10px 14px",
              borderTop    : "1px solid rgba(255,255,255,0.06)",
              display      : "flex",
              alignItems   : "center",
              gap          : 10,
              background   : "rgba(0,0,0,0.15)",
            }}>
              <div style={{
                flex         : 1,
                padding      : "9px 14px",
                borderRadius : 20,
                background   : "rgba(255,255,255,0.05)",
                border       : "1px solid rgba(255,255,255,0.08)",
                fontSize     : "0.75rem",
                color        : "rgba(255,255,255,0.25)",
                fontFamily   : "Jost, sans-serif",
              }}>
                Message…
              </div>
              <div style={{
                width          : 34,
                height         : 34,
                borderRadius   : "50%",
                background     : "linear-gradient(135deg,#F08FA8,#C3A6F0)",
                display        : "flex",
                alignItems     : "center",
                justifyContent : "center",
                fontSize       : "0.75rem",
                color          : "#fff",
              }}>♥</div>
            </div>

            {/* show all button */}
            {!allShown && shown < CHAT.length && (
              <button
                onClick={() => { setShown(CHAT.length); setAllShown(true); }}
                style={{
                  width        : "100%",
                  padding      : "10px",
                  background   : "rgba(240,143,168,0.08)",
                  border       : "none",
                  borderTop    : "1px solid rgba(240,143,168,0.12)",
                  color        : "rgba(240,143,168,0.7)",
                  fontSize     : "0.6rem",
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                  cursor       : "pointer",
                  fontFamily   : "Jost, sans-serif",
                  animation    : "showAllBounce 2s ease-in-out infinite",
                }}
              >
                show all messages →
              </button>
            )}
          </div>
        </div>

        {/* ── RIGHT: copy + stats ── */}
        <div style={{ paddingTop:16 }}>
          <Reveal delay={150}>
            <h3 style={{
              fontFamily   : "Cormorant Garamond, serif",
              fontSize     : "clamp(1.8rem,3.5vw,2.8rem)",
              fontWeight   : 300,
              color        : "var(--cream)",
              lineHeight   : 1.3,
              marginBottom : 20,
            }}>
              And we have not stopped<br/>
              <span style={{
                fontStyle  : "italic",
                color      : "var(--rose)",
                textShadow : "0 0 24px rgba(240,143,168,0.4)",
              }}>talking since.</span>
            </h3>
          </Reveal>

          <Reveal delay={280}>
            <p style={{
              color        : "rgba(210,200,230,0.75)",
              fontSize     : "0.92rem",
              lineHeight   : 1.8,
              marginBottom : 20,
              fontFamily   : "Jost, sans-serif",
              fontWeight   : 300,
            }}>
              That's{" "}
              <span style={{
                color      : "var(--gold)",
                fontFamily : "Cormorant Garamond, serif",
                fontSize   : "1.1em",
                textShadow : "0 0 12px rgba(244,199,123,0.4)",
              }}>
                {days.toLocaleString()} days
              </span>{" "}
              of good mornings. Of voice notes I've listened to more times than I'll admit.
            </p>

            <p style={{
              color      : "rgba(210,200,230,0.7)",
              fontSize   : "0.92rem",
              lineHeight : 1.8,
              marginBottom: 32,
              fontFamily : "Jost, sans-serif",
              fontWeight : 300,
            }}>
              People say the beginning is the best part. They're wrong. Every single week
              with you has been better than the one before it, and I've been keeping score.
            </p>
          </Reveal>

          {/* stat pills */}
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            <StatPill icon="💬" value={`${days * 12}+`}   label="messages (probably)"    color="#F08FA8" delay={0}   />
            <StatPill icon="🎙️" value="too many"           label="voice notes replayed"   color="#C3A6F0" delay={100} />
            <StatPill icon="🌙" value={`${days}`}          label="nights of good night"   color="#F4C77B" delay={200} />
            <StatPill icon="☀️" value={`${days}`}          label="mornings of good morning" color="#FBD5DE" delay={300} />
          </div>

          {/* quote */}
          <Reveal delay={500}>
            <div style={{
              marginTop  : 28,
              padding    : "16px 20px",
              borderLeft : "2px solid rgba(240,143,168,0.4)",
              background : "rgba(240,143,168,0.04)",
              borderRadius:"0 12px 12px 0",
            }}>
              <p style={{
                fontFamily : "Parisienne, cursive",
                fontSize   : "1.25rem",
                color      : "var(--rose)",
                lineHeight : 1.5,
                opacity    : 0.9,
              }}>
                "okay. okay I'm smiling. this is your fault"
              </p>
              <p style={{
                fontSize     : "0.58rem",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color        : "rgba(255,255,255,0.3)",
                fontFamily   : "Jost, sans-serif",
                marginTop    : 8,
              }}>
                — me, 9:31 pm, 10 august 2025
              </p>
            </div>
          </Reveal>
        </div>
      </div>

      {/* ── mobile: single column fix ── */}
      <style>{`
        @media (max-width: 640px) {
          .chat-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
        }
      `}</style>
    </section>
  );
}