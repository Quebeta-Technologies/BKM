import React, { useRef, useState, useCallback } from "react";
import Reveal from "../components/Reveal.jsx";
import { PHOTOS } from "../data.js";

const FLOATERS = Array.from({ length: 16 }, (_, i) => ({
  glyph : ["♥","✦","✿","♡","❀"][i % 5],
  color : ["#F08FA8","#F4C77B","#C3A6F0","#FBD5DE"][i % 4],
  left  : (5 + Math.random() * 90) + "%",
  top   : (5 + Math.random() * 90) + "%",
  size  : 0.5 + Math.random() * 0.7,
  dur   : 7 + Math.random() * 10,
  delay : Math.random() * 8,
  drift : (Math.random() - 0.5) * 60,
}));

const EASE_OUT  = "cubic-bezier(0.0, 0.0, 0.2, 1)";
const EASE_BACK = "cubic-bezier(0.34, 1.56, 0.64, 1)";
const EASE_IN   = "cubic-bezier(0.4, 0.0, 1.0, 0.6)";

/* ── card photo + caption ─────────────────────────────── */
function CardInner({ photo, dim }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <>
      <div style={{
        width:"100%", aspectRatio:"1/1.05",
        background: photo.src ? "#2a1040" : "linear-gradient(145deg,#2a1040,#3a1858)",
        overflow:"hidden", position:"relative",
        display:"flex", alignItems:"center", justifyContent:"center",
        opacity: dim ? 0.55 : 1,
        transition: "opacity 0.5s ease",
      }}>
        {photo.src ? (
          <>
            <img src={photo.src} alt={photo.caption} loading="lazy"
              onLoad={() => setLoaded(true)}
              style={{ width:"100%", height:"100%", objectFit:"cover",
                opacity: loaded ? 1 : 0, transition:"opacity 0.5s" }} />
            {!loaded && <span style={{ position:"absolute", fontSize:"1.5rem", color:"rgba(240,143,168,0.3)" }}>♥</span>}
          </>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
            <span style={{
              fontSize:"2rem",
              color: dim ? "rgba(240,143,168,0.18)" : "rgba(240,143,168,0.55)",
              animation: dim ? "none" : "heartBeatSoft 2s ease-in-out infinite",
              filter: dim ? "none" : "drop-shadow(0 0 10px rgba(240,143,168,0.5))",
              transition:"all 0.5s ease",
            }}>♥</span>
            {!dim && (
              <span style={{
                fontSize:"0.42rem", letterSpacing:"0.22em", textTransform:"uppercase",
                color:"rgba(240,143,168,0.28)", fontFamily:"Jost,sans-serif",
              }}>photo here</span>
            )}
          </div>
        )}
      </div>
      <figcaption style={{
        fontFamily:"Parisienne,cursive", fontSize:"1.05rem",
        color: dim ? "rgba(74,48,96,0.4)" : "#4a3060",
        textAlign:"center", marginTop:10, lineHeight:1.3,
        transition:"all 0.5s ease",
      }}>
        {photo.caption}
      </figcaption>
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   MOBILE STACKED DECK
   3-phase animation:
   phase "idle"     → cards at rest positions
   phase "out"      → front flies out (350ms)
   phase "in"       → new front springs in (400ms)

   Back cards smoothly interpolate through all phases.
═══════════════════════════════════════════════════════ */
function StackedDeck({ photos }) {
  const [current, setCurrent]   = useState(0);
  const [phase, setPhase]       = useState("idle");   // idle | out | in
  const [dir, setDir]           = useState(1);
  const [hearts, setHearts]     = useState([]);
  const heartId    = useRef(0);
  const touchStart = useRef(null);
  const total = photos.length;

  const go = useCallback((direction) => {
    if (phase !== "idle") return;
    setDir(direction);

    // spawn hearts
    const id = heartId.current++;
    setHearts(h => [...h, id]);
    setTimeout(() => setHearts(h => h.filter(x => x !== id)), 900);

    // Phase 1: fling front card out
    setPhase("out");

    // After front is gone, update index (no transition flash — back cards
    // have already been animating toward their new positions)
    setTimeout(() => {
      setCurrent(c => (c + direction + total) % total);
      // Phase 2: new card starts from offset, springs in
      setPhase("in");
      // Phase 3: back to idle
      setTimeout(() => setPhase("idle"), 420);
    }, 320);
  }, [phase, total]);

  const onTouchStart = e => { touchStart.current = e.touches[0].clientX; };
  const onTouchEnd   = e => {
    if (touchStart.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStart.current;
    touchStart.current = null;
    if (Math.abs(dx) > 44) go(dx < 0 ? 1 : -1);
  };

  const next1 = (current + 1) % total;
  const next2 = (current + 2) % total;

  // ── per-phase styles for each layer ──────────────────

  /* FRONT CARD */
  const frontTransform = {
    idle : "rotate(" + (photos[current].tilt * 0.5) + "deg) scale(1) translateY(0px)",
    out  : "translateX(" + (dir * 80) + "%) rotate(" + (dir * 12) + "deg) scale(0.88) translateY(16px)",
    in   : "rotate(" + (photos[current].tilt * 0.5) + "deg) scale(1) translateY(0px)",
  }[phase];

  const frontTransition = {
    idle : "transform 0.42s " + EASE_BACK,
    out  : "transform 0.32s " + EASE_IN,
    in   : "transform 0.42s " + EASE_BACK,
  }[phase];

  /* When phase=in, card starts from the opposite side — we use a key trick:
     setCurrent changes current, React remounts the inner content,
     but we want the card DIV itself to come from the left/right edge.
     We do this by setting an initial translateX via the "in" phase. */
  const frontInitialOffset = phase === "in"
    ? "translateX(" + (-dir * 60) + "px) rotate(" + (photos[current].tilt * 0.5) + "deg) scale(0.92) translateY(10px)"
    : null;

  /* MIDDLE CARD (card 2) */
  const midTransform = {
    idle : "rotate(4deg) scale(0.93) translateY(-7px)",
    out  : "rotate(" + (photos[next1].tilt * 0.4) + "deg) scale(0.99) translateY(-1px)",
    in   : "rotate(" + (photos[next1].tilt * 0.4) + "deg) scale(0.99) translateY(-1px)",
  }[phase];

  /* BACK CARD (card 3) */
  const backTransform = {
    idle : "rotate(-6deg) scale(0.86) translateY(-14px)",
    out  : "rotate(2deg) scale(0.93) translateY(-7px)",
    in   : "rotate(2deg) scale(0.93) translateY(-7px)",
  }[phase];

  const backMidTransition = "transform 0.36s " + EASE_OUT;

  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:24 }}>

      {/* stack container */}
      {/* outer clip — prevents flung card from affecting page layout */}
      <div style={{
        width:"min(330px, 90vw)",
        margin:"0 auto",
        overflow:"hidden",
        padding:"20px 20px 8px",
        isolation:"isolate",
      }}>
      <div
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{
          position:"relative",
          width:"100%",
          height:"min(390px, 110vw)",
        }}
      >

        {/* ── CARD 3 (back) ── */}
        <div style={{
          position:"absolute", inset:0,
          background:"#f5f0e8", borderRadius:3,
          padding:"10px 10px 44px",
          transform: backTransform,
          transition: backMidTransition,
          boxShadow:"0 2px 12px rgba(0,0,0,0.18)",
          overflow:"hidden",
          pointerEvents:"none",

        }}>
          <CardInner photo={photos[next2]} dim />
        </div>

        {/* ── CARD 2 (middle) ── */}
        <div style={{
          position:"absolute", inset:0,
          background:"#f5f0e8", borderRadius:3,
          padding:"10px 10px 44px",
          transform: midTransform,
          transition: backMidTransition,
          boxShadow:"0 5px 24px rgba(0,0,0,0.24)",
          overflow:"hidden",
          zIndex:1,
          pointerEvents:"none",

        }}>
          <CardInner photo={photos[next1]} dim={phase === "idle"} />
        </div>

        {/* ── CARD 1 (front) ── */}
        <div
          onClick={() => go(1)}
          style={{
            position:"absolute", inset:0,
            background:"#f5f0e8", borderRadius:3,
            padding:"10px 10px 44px",
            transform: phase === "in" && frontInitialOffset
              ? frontInitialOffset
              : frontTransform,
            transition: frontTransition,
            boxShadow: phase === "out"
              ? "0 4px 16px rgba(0,0,0,0.2)"
              : "0 16px 56px -8px rgba(240,143,168,0.42), 0 0 0 1px rgba(244,199,123,0.2)",
            cursor: phase === "idle" ? "pointer" : "default",
            zIndex:2,
            overflow:"hidden",
  
          }}
        >
          {/* gradient top stripe */}
          <div style={{
            position:"absolute", top:0, left:0, right:0, height:3,
            background:"linear-gradient(90deg,#F08FA8,#F4C77B,#C3A6F0)",
            borderRadius:"3px 3px 0 0",
          }} />

          <CardInner photo={photos[current]} dim={false} />

          {/* counter */}
          <div style={{
            position:"absolute", bottom:14, right:14,
            fontSize:"0.5rem", letterSpacing:"0.25em",
            color:"rgba(244,199,123,0.65)", fontFamily:"Jost,sans-serif",
          }}>
            {String(current + 1).padStart(2,"0")} / {String(total).padStart(2,"0")}
          </div>

          {/* first card hint */}
          {current === 0 && phase === "idle" && (
            <div style={{
              position:"absolute", bottom:14, left:0, right:0,
              textAlign:"center", fontSize:"0.5rem", letterSpacing:"0.18em",
              color:"rgba(240,143,168,0.6)", fontFamily:"Jost,sans-serif",
              animation:"hintFade 2s ease-in-out infinite",
            }}>
              tap to reveal next ♥
            </div>
          )}

          {/* burst hearts */}
          {hearts.map(id => (
            <div key={id} style={{
              position:"absolute", top:"38%",
              left:(20 + Math.random() * 60) + "%",
              fontSize:"1rem",
              color:["#F08FA8","#F4C77B","#C3A6F0"][id % 3],
              pointerEvents:"none",
              animation:"polaHeart 0.9s ease-out forwards",
              zIndex:10,
            }}>
              {["♥","✦","♡"][id % 3]}
            </div>
          ))}
        </div>
      </div>
      </div>{/* end clip wrapper */}

      {/* dot nav */}
      <div style={{
        display:"flex", gap:7, justifyContent:"center",
        flexWrap:"wrap", maxWidth:240,
      }}>
        {photos.map((_, i) => (
          <div key={i}
            onClick={() => { if (phase === "idle") go(i > current ? 1 : -1); }}
            style={{
              width      : i === current ? 22 : 7,
              height     : 7, borderRadius:4,
              background : i === current
                ? "linear-gradient(90deg,#F08FA8,#C3A6F0)"
                : i < current ? "rgba(240,143,168,0.4)" : "rgba(255,255,255,0.15)",
              transition : "all 0.4s " + EASE_BACK,
              cursor     : "pointer",
            }}
          />
        ))}
      </div>

      <p style={{
        fontSize:"0.58rem", letterSpacing:"0.22em",
        color:"rgba(240,143,168,0.65)", fontFamily:"Jost,sans-serif",
        textAlign:"center", animation:"hintFade 2.5s ease-in-out infinite",
      }}>
        tap card or swipe left / right ✦
      </p>
    </div>
  );
}

/* ── Desktop draggable polaroid ───────────────────────── */
function DraggablePola({ photo, index, onLift, zIndex }) {
  const [pos, setPos]             = useState({ x:0, y:0 });
  const [dragging, setDragging]   = useState(false);
  const [lifted, setLifted]       = useState(false);
  const [hovered, setHovered]     = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [hearts, setHearts]       = useState([]);
  const startRef   = useRef(null);
  const heartIdRef = useRef(0);

  const onStart = (e) => {
    e.preventDefault();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    startRef.current = { mx: cx - pos.x, my: cy - pos.y };
    setDragging(true); setLifted(true); onLift(index);
  };
  const onMove = (e) => {
    if (!dragging || !startRef.current) return;
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    setPos({ x: cx - startRef.current.mx, y: cy - startRef.current.my });
  };
  const onEnd = () => { setDragging(false); setTimeout(() => setLifted(false), 350); };
  const onHoverEnter = () => {
    setHovered(true);
    const id = heartIdRef.current++;
    setHearts(h => [...h, id]);
    setTimeout(() => setHearts(h => h.filter(x => x !== id)), 1000);
  };

  const tilt  = dragging ? 0 : hovered ? photo.tilt * 0.3 : photo.tilt;
  const scale = dragging ? 1.1 : hovered ? 1.06 : 1;
  const boxShadow = lifted
    ? "0 40px 80px -10px rgba(240,143,168,0.55), 0 0 0 1px rgba(244,199,123,0.35)"
    : hovered
      ? "0 24px 60px -8px rgba(240,143,168,0.35), 0 0 0 1px rgba(244,199,123,0.2)"
      : "0 6px 28px rgba(0,0,0,0.45)";

  return (
    <div style={{ animation:"polaReveal 0.6s ease " + (index * 90) + "ms both" }}>
      <figure
        onMouseDown={onStart} onMouseMove={onMove}
        onMouseUp={onEnd} onMouseLeave={() => { onEnd(); setHovered(false); }}
        onMouseEnter={onHoverEnter}
        onTouchStart={onStart} onTouchMove={onMove} onTouchEnd={onEnd}
        style={{
          position:"relative",
          transform:"translate(" + pos.x + "px," + pos.y + "px) rotate(" + tilt + "deg) scale(" + scale + ")",
          transition: dragging ? "box-shadow 0.15s" : "transform 0.4s " + EASE_BACK + ", box-shadow 0.4s ease",
          boxShadow, zIndex, cursor: dragging ? "grabbing" : "grab",
          userSelect:"none", background:"#f5f0e8", borderRadius:3,
          padding:"10px 10px 44px", width:"100%", margin:0,

        }}
      >
        {hovered && (
          <div style={{
            position:"absolute", top:0, left:0, right:0, height:3,
            background:"linear-gradient(90deg,#F08FA8,#F4C77B,#C3A6F0)",
            borderRadius:"3px 3px 0 0", pointerEvents:"none",
          }} />
        )}
        <div style={{
          width:"100%", aspectRatio:"1/1.05",
          background: photo.src ? "#2a1040" : "linear-gradient(145deg,#2a1040,#3a1858)",
          overflow:"hidden", position:"relative",
          display:"flex", alignItems:"center", justifyContent:"center",
        }}>
          {photo.src ? (
            <>
              <img src={photo.src} alt={photo.caption} loading="lazy" draggable={false}
                onLoad={() => setImgLoaded(true)}
                style={{ width:"100%", height:"100%", objectFit:"cover", display:"block",
                  opacity:imgLoaded ? 1 : 0, transition:"opacity 0.5s" }} />
              {!imgLoaded && <span style={{ position:"absolute", fontSize:"1.5rem", color:"rgba(240,143,168,0.3)" }}>♥</span>}
            </>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
              <span style={{
                fontSize:"1.8rem",
                color: hovered ? "rgba(240,143,168,0.65)" : "rgba(240,143,168,0.3)",
                animation:"heartBeatSoft 2s ease-in-out infinite",
                animationDelay:(index * 0.3) + "s",
                transition:"color 0.3s",
                filter: hovered ? "drop-shadow(0 0 8px rgba(240,143,168,0.6))" : "none",
              }}>♥</span>
              <span style={{
                fontSize:"0.45rem", letterSpacing:"0.2em", textTransform:"uppercase",
                color: hovered ? "rgba(240,143,168,0.5)" : "rgba(240,143,168,0.2)",
                fontFamily:"Jost,sans-serif", transition:"color 0.3s",
              }}>photo here</span>
            </div>
          )}
          {hovered && (
            <div style={{
              position:"absolute", inset:0,
              background:"linear-gradient(135deg,rgba(255,255,255,0.07),transparent 55%)",
              pointerEvents:"none",
            }} />
          )}
        </div>
        <figcaption style={{
          fontFamily:"Parisienne,cursive", fontSize:"clamp(0.85rem,2vw,1rem)",
          color: hovered ? "#7a4090" : "#4a3060",
          textAlign:"center", marginTop:10, lineHeight:1.3,
          transition:"color 0.3s ease",
          textShadow: hovered ? "0 0 12px rgba(195,166,240,0.3)" : "none",
        }}>
          {photo.caption}
        </figcaption>
        {hovered && (
          <div style={{
            position:"absolute", top:6, left:8,
            fontSize:"0.45rem", letterSpacing:"0.2em",
            color:"rgba(244,199,123,0.7)", fontFamily:"Jost,sans-serif",
          }}>{"0" + (index + 1)}</div>
        )}
        {hearts.map(id => (
          <div key={id} aria-hidden="true" style={{
            position:"absolute", top:"35%",
            left:(30 + Math.random() * 40) + "%",
            fontSize:"0.85rem", color:["#F08FA8","#F4C77B","#C3A6F0"][id % 3],
            pointerEvents:"none", animation:"polaHeart 1s ease-out forwards",
            zIndex:5,
          }}>{["♥","✦","♡"][id % 3]}</div>
        ))}
      </figure>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN
══════════════════════════════════════════════ */
export default function Moments() {
  const [zIndices, setZIndices] = useState(() => PHOTOS.map((_, i) => i + 1));
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);
  const maxZ = useRef(PHOTOS.length + 1);

  React.useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  const handleLift = (index) => {
    const next = [...zIndices];
    next[index] = ++maxZ.current;
    setZIndices(next);
  };

  return (
    <section style={{ padding:"4rem 1.25rem 3rem", maxWidth:1100, margin:"0 auto", position:"relative", isolation:"isolate" }}>

      <style>{`
        @keyframes polaReveal {
          from { opacity:0; transform:translateY(28px) scale(0.93); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes heartBeatSoft {
          0%,100% { transform:scale(1); }
          50%     { transform:scale(1.22); }
        }
        @keyframes polaHeart {
          0%   { opacity:1; transform:translateY(0) scale(1); }
          100% { opacity:0; transform:translateY(-50px) scale(0.4); }
        }
        @keyframes ambDrift {
          0%   { opacity:0; transform:translateY(0) translateX(0); }
          10%  { opacity:0.5; }
          85%  { opacity:0.3; }
          100% { opacity:0; transform:translateY(-50px) translateX(var(--drift)); }
        }
        @keyframes hintFade {
          0%,100% { opacity:0.4; }
          50%     { opacity:0.9; }
        }
      `}</style>

      {/* ambient floaters */}
      <div aria-hidden="true" style={{ position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none",zIndex:0 }}>
        {FLOATERS.map((f, i) => (
          <div key={i} style={{
            position:"absolute", left:f.left, top:f.top,
            fontSize:f.size + "rem", color:f.color, opacity:0,
            animation:"ambDrift " + f.dur + "s ease-in-out " + f.delay + "s infinite",
            "--drift":f.drift + "px",
            filter:"drop-shadow(0 0 4px " + f.color + "66)",
          }}>{f.glyph}</div>
        ))}
      </div>

      {/* heading */}
      <Reveal className="text-center" style={{ position:"relative", zIndex:1 }}>
        <p className="eyebrow mb-4" style={{ letterSpacing:"0.38em" }}>Chapter five</p>
        <h2 className="display mb-3" style={{ fontSize:"clamp(2rem,5vw,3.5rem)" }}>Moments I kept</h2>
        <p className="soft text-sm max-w-md mx-auto" style={{ opacity:0.7 }}>The camera roll I'd save first.</p>
        <p style={{
          fontSize:"0.62rem", letterSpacing:"0.22em",
          color:"rgba(240,143,168,0.65)", marginTop:8,
          fontFamily:"Jost,sans-serif",
          animation:"hintFade 2.5s ease-in-out infinite",
        }}>
          {isMobile ? "✦ tap to flip through them ✦" : "✦ pick them up · move them around ✦"}
        </p>
      </Reveal>

      {/* content */}
      <div style={{ marginTop:36, position:"relative", zIndex:1 }}>
        {isMobile ? (
          <StackedDeck photos={PHOTOS} />
        ) : (
          <div style={{
            display:"grid",
            gridTemplateColumns:"repeat(auto-fill, minmax(155px, 1fr))",
            gap:24, userSelect:"none",
          }}>
            {PHOTOS.map((p, i) => (
              <DraggablePola key={i} photo={p} index={i} onLift={handleLift} zIndex={zIndices[i]} />
            ))}
          </div>
        )}
      </div>

      {!isMobile && (
        <p style={{
          textAlign:"center", marginTop:32,
          fontSize:"0.6rem", letterSpacing:"0.25em", textTransform:"uppercase",
          color:"rgba(195,166,240,0.5)", fontFamily:"Jost,sans-serif",
          position:"relative", zIndex:1,
        }}>
          {PHOTOS.length} frames · every one of them counts
        </p>
      )}
    </section>
  );
}