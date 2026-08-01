import React, { useRef, useState, useEffect, useCallback } from "react";
import Reveal from "../components/Reveal.jsx";
import { REASONS } from "../data.js";

/* ══════════════════════════════════════════════════════════
   REASONS — "Letters I never sent but always meant"
   
   Experience:
   1. Sealed envelope sits center screen, glowing
   2. Click it → envelope flap opens with wax seal crack
   3. Letter slides out → reason revealed with typewriter effect
   4. Floating heart/petal particles surround it
   5. "Read another" → letter slides back in, new one comes out
   6. After 5 reveals → special "you are my reason" moment
   7. Counter shows how many she's opened
══════════════════════════════════════════════════════════ */

/* ── floating ambient particles ───────────────────────── */
const PARTICLES = Array.from({ length: 30 }, (_, i) => ({
  id    : i,
  glyph : ["♥","✦","✿","❀","♡","·","★"][i % 7],
  color : ["#F08FA8","#F4C77B","#C3A6F0","#FBD5DE","#fff","#FFB3C6"][i % 6],
  left  : `${Math.random() * 100}%`,
  top   : `${Math.random() * 100}%`,
  size  : 0.5 + Math.random() * 1,
  dur   : 6 + Math.random() * 10,
  delay : Math.random() * 8,
  drift : (Math.random() - 0.5) * 80,
}));

function AmbientParticles() {
  return (
    <div aria-hidden="true" style={{
      position:"absolute", inset:0,
      overflow:"hidden", pointerEvents:"none",
    }}>
      {PARTICLES.map(p => (
        <div key={p.id} style={{
          position : "absolute",
          left     : p.left,
          top      : p.top,
          fontSize : `${p.size}rem`,
          color    : p.color,
          opacity  : 0,
          animation: `ambFloat ${p.dur}s ease-in-out ${p.delay}s infinite`,
          "--drift": `${p.drift}px`,
          filter   : `drop-shadow(0 0 4px ${p.color}88)`,
        }}>{p.glyph}</div>
      ))}
    </div>
  );
}

/* ── typewriter hook ───────────────────────────────────── */
function useTypewriter(text, speed = 28, active = true) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!active) return;
    setDisplayed("");
    setDone(false);
    if (!text) return;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { clearInterval(interval); setDone(true); }
    }, speed);
    return () => clearInterval(interval);
  }, [text, active, speed]);

  return [displayed, done];
}

/* ── wax seal SVG ──────────────────────────────────────── */
function WaxSeal({ cracked, onClick }) {
  return (
    <div onClick={onClick} style={{
      position      : "absolute",
      bottom        : -18,
      left          : "50%",
      transform     : "translateX(-50%)",
      width         : 52,
      height        : 52,
      cursor        : "pointer",
      zIndex        : 10,
      transition    : "transform 0.3s",
      filter        : cracked
        ? "drop-shadow(0 0 8px rgba(240,143,168,0.3))"
        : "drop-shadow(0 0 12px rgba(240,143,168,0.7))",
    }}>
      <svg viewBox="0 0 52 52" width="52" height="52">
        <circle cx="26" cy="26" r="24"
          fill={cracked ? "#3a1a2a" : "#8E3D63"}
          stroke={cracked ? "#4a2a3a" : "#F08FA8"}
          strokeWidth="1.5"
        />
        {!cracked && (
          <text x="26" y="31" textAnchor="middle"
            fontSize="18" fill="#FBD5DE" fontFamily="Parisienne, cursive">
            ♥
          </text>
        )}
        {cracked && (
          <>
            <line x1="26" y1="10" x2="22" y2="26" stroke="#F08FA8" strokeWidth="0.8" opacity="0.6"/>
            <line x1="26" y1="10" x2="30" y2="26" stroke="#F08FA8" strokeWidth="0.8" opacity="0.6"/>
            <line x1="14" y1="20" x2="26" y2="26" stroke="#F08FA8" strokeWidth="0.8" opacity="0.4"/>
            <line x1="38" y1="20" x2="26" y2="26" stroke="#F08FA8" strokeWidth="0.8" opacity="0.4"/>
            <circle cx="26" cy="26" r="4" fill="#F08FA850"/>
          </>
        )}
      </svg>
    </div>
  );
}

/* ── envelope component ────────────────────────────────── */
function Envelope({ opened, onClick }) {
  return (
    <div
      onClick={!opened ? onClick : undefined}
      style={{
        position  : "relative",
        width     : "min(340px, 85vw)",
        cursor    : opened ? "default" : "pointer",
        margin    : "0 auto",
        filter    : opened ? "none" : "drop-shadow(0 0 30px rgba(240,143,168,0.35))",
        transition: "filter 0.5s",
        animation : opened ? "none" : "envBreath 3s ease-in-out infinite",
      }}
    >
      {/* envelope body */}
      <div style={{
        width        : "100%",
        paddingTop   : "66%",
        position     : "relative",
        background   : "linear-gradient(160deg, #1e0f30 0%, #2a1040 100%)",
        borderRadius : 8,
        border       : "1px solid rgba(240,143,168,0.3)",
        overflow     : "visible",
        boxShadow    : "inset 0 0 40px rgba(0,0,0,0.4)",
      }}>
        {/* inner envelope lines */}
        <div style={{
          position:"absolute", inset:0, borderRadius:8, overflow:"hidden",
        }}>
          {/* bottom triangle fold */}
          <div style={{
            position  : "absolute",
            bottom    : 0, left: 0, right: 0,
            height    : "55%",
            background: "linear-gradient(160deg,#28103c,#1a0828)",
            clipPath  : "polygon(0% 100%, 50% 0%, 100% 100%)",
            borderTop : "1px solid rgba(240,143,168,0.15)",
          }}/>
          {/* left fold */}
          <div style={{
            position  : "absolute",
            left:0, top:0, bottom:0,
            width     : "51%",
            background: "rgba(255,255,255,0.02)",
            clipPath  : "polygon(0 0, 100% 50%, 0 100%)",
          }}/>
          {/* right fold */}
          <div style={{
            position  : "absolute",
            right:0, top:0, bottom:0,
            width     : "51%",
            background: "rgba(0,0,0,0.08)",
            clipPath  : "polygon(100% 0, 0% 50%, 100% 100%)",
          }}/>
        </div>

        {/* top flap */}
        <div style={{
          position        : "absolute",
          top             : 0, left: -1, right: -1,
          height          : "55%",
          background      : opened
            ? "linear-gradient(180deg,#2a1040,#1e0f30)"
            : "linear-gradient(160deg,#321248,#22093a)",
          clipPath        : "polygon(0 0, 50% 75%, 100% 0)",
          borderBottom    : "1px solid rgba(240,143,168,0.15)",
          transformOrigin : "top center",
          transform       : opened ? "rotateX(180deg)" : "rotateX(0deg)",
          transition      : "transform 0.6s cubic-bezier(.4,0,.2,1)",
          zIndex          : 3,
        }}/>

        {/* "click to open" hint */}
        {!opened && (
          <div style={{
            position      : "absolute",
            inset         : 0,
            display       : "flex",
            alignItems    : "center",
            justifyContent: "center",
            paddingTop    : "10%",
            zIndex        : 4,
          }}>
            <p style={{
              fontSize     : "0.6rem",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color        : "rgba(240,143,168,0.5)",
              fontFamily   : "Jost, sans-serif",
              animation    : "hintPulse 2s ease-in-out infinite",
            }}>
              open me ♥
            </p>
          </div>
        )}
      </div>

      {/* wax seal */}
      <WaxSeal cracked={opened} onClick={!opened ? onClick : undefined}/>
    </div>
  );
}

/* ── letter card ───────────────────────────────────────── */
function LetterCard({ reason, index, total, visible, onNext, onPrev, burst, openCount }) {
  const [text, done] = useTypewriter(reason, 22, visible);
  const [hovNext, setHovNext] = useState(false);
  const [hovPrev, setHovPrev] = useState(false);

  const isSpecial = openCount > 0 && openCount % 5 === 0;

  return (
    <div style={{
      position      : "relative",
      width         : "min(480px, 92vw)",
      margin        : "0 auto",
      animation     : visible ? "letterRise 0.7s cubic-bezier(.2,.8,.3,1) both" : "letterSink 0.4s ease-in both",
    }}>
      {/* paper texture card */}
      <div style={{
        background   : "linear-gradient(145deg,rgba(255,255,255,0.065),rgba(255,255,255,0.025))",
        border       : "1px solid rgba(240,143,168,0.2)",
        borderRadius : 4,
        padding      : "44px 40px 36px",
        position     : "relative",
        backdropFilter: "blur(12px)",
        boxShadow    : "0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(240,143,168,0.06), inset 0 1px 0 rgba(255,255,255,0.08)",
        overflow     : "hidden",
      }}>
        {/* paper lines */}
        {Array.from({length:8}).map((_,i)=>(
          <div key={i} style={{
            position  : "absolute",
            left      : 40, right: 40,
            top       : 80 + i * 36,
            height    : 1,
            background: "rgba(255,255,255,0.04)",
          }}/>
        ))}

        {/* top decorative line */}
        <div style={{
          position  : "absolute",
          top       : 20, left: 40, right: 40,
          height    : 1,
          background: "linear-gradient(90deg,transparent,rgba(240,143,168,0.4),transparent)",
        }}/>

        {/* number */}
        <p style={{
          fontSize     : "0.55rem",
          letterSpacing: "0.45em",
          textTransform: "uppercase",
          color        : "var(--gold)",
          fontFamily   : "Jost, sans-serif",
          marginBottom : 20,
          opacity      : 0.7,
        }}>
          reason no. {String(index + 1).padStart(2,"0")}
          <span style={{ opacity:0.35, marginLeft:8 }}>/ {total}</span>
        </p>

        {/* the reason text */}
        <div style={{ minHeight:90, position:"relative" }}>
          <p style={{
            fontFamily : "Cormorant Garamond, serif",
            fontSize   : "clamp(1.3rem,3vw,1.85rem)",
            fontWeight : 300,
            color      : "var(--cream)",
            lineHeight : 1.55,
            fontStyle  : "italic",
          }}>
            "{text}
            {!done && (
              <span style={{
                display    : "inline-block",
                width      : 2,
                height     : "1em",
                background : "#F08FA8",
                marginLeft : 2,
                verticalAlign: "text-bottom",
                animation  : "cursorBlink 0.8s ease-in-out infinite",
              }}/>
            )}
            "
          </p>
        </div>

        {/* bottom decorative */}
        {done && (
          <div style={{
            marginTop  : 24,
            display    : "flex",
            alignItems : "center",
            gap        : 12,
            animation  : "fadeIn 0.5s ease 0.2s both",
          }}>
            <div style={{
              flex:1, height:1,
              background:"linear-gradient(90deg,transparent,rgba(244,199,123,0.3))",
            }}/>
            <span style={{ color:"var(--gold)", fontSize:"0.7rem", opacity:0.6 }}>✦</span>
            <div style={{
              flex:1, height:1,
              background:"linear-gradient(90deg,rgba(244,199,123,0.3),transparent)",
            }}/>
          </div>
        )}

        {/* special moment overlay every 5 cards */}
        {isSpecial && done && (
          <div style={{
            position      : "absolute",
            inset         : 0,
            display       : "flex",
            alignItems    : "center",
            justifyContent: "center",
            background    : "rgba(8,4,20,0.85)",
            borderRadius  : 4,
            animation     : "fadeIn 0.5s ease 0.8s both",
            flexDirection : "column",
            gap           : 12,
          }}>
            <p style={{
              fontFamily : "Parisienne, cursive",
              fontSize   : "2rem",
              color      : "#F08FA8",
              textShadow : "0 0 30px rgba(240,143,168,0.8)",
              animation  : "specialPulse 2s ease-in-out infinite",
            }}>you are every reason ♥</p>
            <p style={{
              fontSize   : "0.65rem",
              letterSpacing:"0.3em",
              color      : "rgba(255,255,255,0.4)",
              fontFamily : "Jost, sans-serif",
              textTransform:"uppercase",
            }}>keep going →</p>
          </div>
        )}
      </div>

      {/* navigation */}
      {done && (
        <div style={{
          display       : "flex",
          alignItems    : "center",
          justifyContent: "center",
          gap           : 12,
          marginTop     : 24,
          animation     : "fadeIn 0.4s ease 0.3s both",
        }}>
          <button
            onMouseEnter={() => setHovPrev(true)}
            onMouseLeave={() => setHovPrev(false)}
            onClick={(e) => { onPrev(); burst && burst(e.clientX, e.clientY, 5); }}
            style={{
              width        : 44,
              height       : 44,
              borderRadius : "50%",
              border       : `1px solid rgba(244,199,123,${hovPrev ? 0.6 : 0.25})`,
              background   : hovPrev ? "rgba(244,199,123,0.1)" : "transparent",
              color        : "var(--gold)",
              cursor       : "pointer",
              fontSize     : "1rem",
              transition   : "all 0.25s",
              transform    : hovPrev ? "scale(1.1)" : "scale(1)",
            }}
          >←</button>

          <button
            onMouseEnter={() => setHovNext(true)}
            onMouseLeave={() => setHovNext(false)}
            onClick={(e) => { onNext(); burst && burst(e.clientX, e.clientY, 8); }}
            style={{
              padding      : "13px 28px",
              borderRadius : 30,
              border       : `1px solid rgba(240,143,168,${hovNext ? 0.7 : 0.35})`,
              background   : hovNext
                ? "linear-gradient(135deg,rgba(240,143,168,0.25),rgba(195,166,240,0.15))"
                : "rgba(240,143,168,0.07)",
              color        : "var(--cream)",
              cursor       : "pointer",
              fontFamily   : "Jost, sans-serif",
              fontSize     : "0.68rem",
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              transition   : "all 0.3s cubic-bezier(.2,.8,.3,1)",
              transform    : hovNext ? "translateY(-2px)" : "none",
              boxShadow    : hovNext ? "0 8px 24px rgba(240,143,168,0.2)" : "none",
            }}
          >
            next reason ♥
          </button>

          <button
            onMouseEnter={() => setHovNext(true)}
            onMouseLeave={() => setHovNext(false)}
            onClick={(e) => { onNext(); burst && burst(e.clientX, e.clientY, 5); }}
            style={{
              width        : 44,
              height       : 44,
              borderRadius : "50%",
              border       : `1px solid rgba(244,199,123,${hovNext ? 0.6 : 0.25})`,
              background   : hovNext ? "rgba(244,199,123,0.1)" : "transparent",
              color        : "var(--gold)",
              cursor       : "pointer",
              fontSize     : "1rem",
              transition   : "all 0.25s",
              transform    : hovNext ? "scale(1.1)" : "scale(1)",
            }}
          >→</button>
        </div>
      )}
    </div>
  );
}

/* ── progress hearts ────────────────────────────────────── */
function ProgressHearts({ current, total }) {
  return (
    <div style={{
      display       : "flex",
      justifyContent: "center",
      gap           : 6,
      flexWrap      : "wrap",
      maxWidth      : 320,
      margin        : "0 auto",
    }}>
      {Array.from({length: Math.min(total, 24)}).map((_, i) => (
        <span key={i} style={{
          fontSize   : i === current ? "1rem" : "0.8rem",
          color      : i <= current ? "#F08FA8" : "rgba(255,255,255,0.35)",
          transition : "all 0.4s ease",
          transform  : i === current ? "scale(1.4)" : "scale(1)",
          filter     : i === current
            ? "drop-shadow(0 0 6px #F08FA8)"
            : i < current ? "drop-shadow(0 0 2px rgba(240,143,168,0.3))" : "none",
          display    : "inline-block",
          lineHeight : 1.4,
        }}>
          {i <= current ? "♥" : "♡"}
        </span>
      ))}
      {total > 24 && (
        <span style={{ fontSize:"0.6rem", color:"rgba(255,255,255,0.3)", alignSelf:"center" }}>
          +{total - 24} more
        </span>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════ */
export default function Reasons({ burst }) {
  const [stage, setStage]       = useState("sealed");   // sealed → opening → reading
  const [index, setIndex]       = useState(0);
  const [cardVisible, setCardVisible] = useState(true);
  const [openCount, setOpenCount] = useState(0);
  const [flutterHearts, setFlutterHearts] = useState([]);
  const touchStart = useRef(null);
  const heartId    = useRef(0);

  /* envelope click → open */
  const openEnvelope = () => {
    setStage("opening");
    setTimeout(() => setStage("reading"), 700);
    // spawn hearts from center
    spawnHearts(window.innerWidth / 2, window.innerHeight / 2, 12);
  };

  /* spawn flutter hearts */
  const spawnHearts = useCallback((x, y, count) => {
    const newHearts = Array.from({length: count}, (_, i) => ({
      id    : heartId.current++,
      x, y,
      angle : (i / count) * 360,
      color : ["#F08FA8","#F4C77B","#C3A6F0","#FBD5DE"][i % 4],
      glyph : ["♥","✦","✿","♡"][i % 4],
      size  : 0.7 + Math.random() * 0.8,
    }));
    setFlutterHearts(prev => [...prev, ...newHearts]);
    setTimeout(() => {
      setFlutterHearts(prev => prev.filter(h => !newHearts.find(n => n.id === h.id)));
    }, 1200);
  }, []);

  /* navigate */
  const go = useCallback((dir, e) => {
    setCardVisible(false);
    if (e) spawnHearts(e.clientX, e.clientY, 6);
    setTimeout(() => {
      setIndex(i => (i + dir + REASONS.length) % REASONS.length);
      setOpenCount(c => c + 1);
      setCardVisible(true);
    }, 320);
  }, [spawnHearts]);

  /* swipe */
  const handleTouchStart = e => { touchStart.current = e.touches[0].clientX; };
  const handleTouchEnd   = e => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1, null);
    touchStart.current = null;
  };

  return (
    <section style={{
      padding   : "5rem 1.25rem 5rem",
      maxWidth  : 900,
      margin    : "0 auto",
      textAlign : "center",
      position  : "relative",
    }}>
      <style>{`
        @keyframes ambFloat {
          0%   { opacity:0; transform:translateY(0) translateX(0); }
          10%  { opacity:0.6; }
          85%  { opacity:0.4; }
          100% { opacity:0; transform:translateY(-60px) translateX(var(--drift)); }
        }
        @keyframes envBreath {
          0%,100% { transform:scale(1) translateY(0); }
          50%     { transform:scale(1.02) translateY(-6px); }
        }
        @keyframes hintPulse {
          0%,100% { opacity:0.5; }
          50%     { opacity:1; }
        }
        @keyframes letterRise {
          from { opacity:0; transform:translateY(40px) scale(0.96); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes letterSink {
          from { opacity:1; transform:translateY(0) scale(1); }
          to   { opacity:0; transform:translateY(-20px) scale(0.96); }
        }
        @keyframes cursorBlink {
          0%,100% { opacity:1; }
          50%     { opacity:0; }
        }
        @keyframes fadeIn {
          from { opacity:0; }
          to   { opacity:1; }
        }
        @keyframes heartFlutter {
          0%   { opacity:1; transform:translate(0,0) scale(1) rotate(0deg); }
          100% { opacity:0; transform:translate(var(--hx),var(--hy)) scale(0.3) rotate(var(--hr)); }
        }
        @keyframes specialPulse {
          0%,100% { transform:scale(1); }
          50%     { transform:scale(1.04); }
        }
        @keyframes titleShimmer {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        @keyframes sealCrack {
          0%   { transform:translateX(-50%) scale(1) rotate(0deg); }
          30%  { transform:translateX(-50%) scale(1.2) rotate(-5deg); }
          60%  { transform:translateX(-50%) scale(0.9) rotate(3deg); }
          100% { transform:translateX(-50%) scale(1) rotate(0deg); }
        }
        @keyframes openCountBounce {
          0%,100% { transform:scale(1); }
          50%     { transform:scale(1.15); }
        }
      `}</style>

      {/* ambient particles */}
      {stage === "reading" && <AmbientParticles />}

      {/* flutter hearts on click */}
      {flutterHearts.map(h => (
        <div key={h.id} aria-hidden="true" style={{
          position  : "fixed",
          left      : h.x,
          top       : h.y,
          fontSize  : `${h.size}rem`,
          color     : h.color,
          pointerEvents:"none",
          zIndex    : 999,
          animation : "heartFlutter 1.1s ease-out forwards",
          "--hx"    : `${Math.cos(h.angle * Math.PI / 180) * (40 + Math.random() * 60)}px`,
          "--hy"    : `${Math.sin(h.angle * Math.PI / 180) * (40 + Math.random() * 60) - 30}px`,
          "--hr"    : `${(Math.random() - 0.5) * 180}deg`,
        }}>{h.glyph}</div>
      ))}

      {/* ── heading ── */}
      <Reveal>
        <p className="eyebrow mb-4" style={{ letterSpacing:"0.38em" }}>Chapter four</p>

        <h2 style={{
          fontFamily  : "Cormorant Garamond, serif",
          fontSize    : "clamp(2.2rem,5.5vw,4rem)",
          fontWeight  : 300,
          marginBottom: 16,
          background  : "linear-gradient(90deg,#F08FA8,#F4C77B,#C3A6F0,#F08FA8)",
          backgroundSize: "300% auto",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor : "transparent",
          backgroundClip: "text",
          animation   : "titleShimmer 6s linear infinite",
        }}>
          {stage === "sealed"
            ? "Letters I never sent"
            : "Reasons I love you"}
        </h2>

        <p className="soft text-sm max-w-sm mx-auto" style={{ opacity:0.65 }}>
          {stage === "sealed"
            ? "Every single one of these is true. Open it."
            : `There are ${REASONS.length} in here. There are more than ${REASONS.length} in me.`
          }
        </p>
      </Reveal>

      {/* ── sealed stage ── */}
      {(stage === "sealed" || stage === "opening") && (
        <div style={{ marginTop:52, position:"relative" }}
          onClick={stage === "sealed" ? openEnvelope : undefined}
        >
          <Envelope opened={stage === "opening"} onClick={openEnvelope}/>

          {/* decorative floating petals around envelope */}
          {["♥","✦","✿"].map((g, i) => (
            <div key={i} aria-hidden="true" style={{
              position : "absolute",
              fontSize : "1rem",
              color    : ["#F08FA8","#F4C77B","#C3A6F0"][i],
              top      : `${20 + i * 25}%`,
              left     : i === 0 ? "8%" : i === 1 ? "88%" : "5%",
              opacity  : 0.4,
              animation: `ambFloat ${6 + i * 2}s ease-in-out ${i}s infinite`,
              "--drift": `${(i - 1) * 20}px`,
              filter   : `drop-shadow(0 0 6px ${["#F08FA8","#F4C77B","#C3A6F0"][i]}88)`,
              pointerEvents:"none",
            }}>{g}</div>
          ))}

          <p style={{
            marginTop    : 48,
            fontSize     : "0.6rem",
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            color        : "rgba(240,143,168,0.45)",
            fontFamily   : "Jost, sans-serif",
            animation    : "hintPulse 2.5s ease-in-out infinite",
          }}>
            {stage === "opening" ? "opening…" : "click the envelope ♥"}
          </p>
        </div>
      )}

      {/* ── reading stage ── */}
      {stage === "reading" && (
        <div
          style={{ marginTop:44 }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <LetterCard
            reason={REASONS[index]}
            index={index}
            total={REASONS.length}
            visible={cardVisible}
            onNext={(e) => go(1, e)}
            onPrev={(e) => go(-1, e)}
            burst={burst}
            openCount={openCount}
          />

          {/* progress hearts */}
          <div style={{ marginTop:28 }}>
            <ProgressHearts current={index} total={REASONS.length}/>
          </div>

          {/* open count */}
          <p style={{
            marginTop    : 16,
            fontSize     : "0.68rem",
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color        : "#F08FA8",
            fontFamily   : "Jost, sans-serif",
            opacity      : 0.9,
            textShadow   : "0 0 12px rgba(240,143,168,0.4)",
            animation    : openCount > 0 ? "openCountBounce 0.4s ease" : "none",
          }}>
            {openCount === 0
              ? "your first one ♥"
              : `${openCount + 1} opened so far`}
          </p>

          {/* swipe hint */}
          <p style={{
            marginTop    : 8,
            fontSize     : "0.6rem",
            letterSpacing: "0.22em",
            color        : "rgba(210,200,230,0.55)",
            fontFamily   : "Jost, sans-serif",
          }}>
            swipe left or right to navigate
          </p>
        </div>
      )}
    </section>
  );
}