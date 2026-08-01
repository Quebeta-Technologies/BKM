import React, { useRef, useState } from "react";
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

const EASE = "cubic-bezier(0.2,0.8,0.3,1)";

function DraggablePola({ photo, index, onLift, zIndex }) {
  const [pos, setPos]           = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [lifted, setLifted]     = useState(false);
  const [hovered, setHovered]   = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [hearts, setHearts]     = useState([]);
  const startRef   = useRef(null);
  const heartIdRef = useRef(0);

  const onStart = (e) => {
    e.preventDefault();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    startRef.current = { mx: cx - pos.x, my: cy - pos.y };
    setDragging(true);
    setLifted(true);
    onLift(index);
  };

  const onMove = (e) => {
    if (!dragging || !startRef.current) return;
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    setPos({ x: cx - startRef.current.mx, y: cy - startRef.current.my });
  };

  const onEnd = () => {
    setDragging(false);
    setTimeout(() => setLifted(false), 350);
  };

  const onHoverEnter = () => {
    setHovered(true);
    const id = heartIdRef.current++;
    setHearts(h => [...h, id]);
    setTimeout(() => setHearts(h => h.filter(x => x !== id)), 1000);
  };

  const tilt  = dragging ? 0 : hovered ? photo.tilt * 0.3 : photo.tilt;
  const scale = dragging ? 1.1 : hovered ? 1.06 : 1;

  const revealDelay = (index * 90) + "ms";

  const boxShadow = lifted
    ? "0 40px 80px -10px rgba(240,143,168,0.55), 0 0 0 1px rgba(244,199,123,0.35), 0 0 40px rgba(240,143,168,0.15)"
    : hovered
      ? "0 24px 60px -8px rgba(240,143,168,0.35), 0 0 0 1px rgba(244,199,123,0.2), 0 0 20px rgba(240,143,168,0.1)"
      : "0 6px 28px rgba(0,0,0,0.45)";

  return (
    <div style={{
      animation         : "polaReveal 0.6s ease " + revealDelay + " both",
    }}>
      <figure
        onMouseDown={onStart}
        onMouseMove={onMove}
        onMouseUp={onEnd}
        onMouseLeave={() => { onEnd(); setHovered(false); }}
        onMouseEnter={onHoverEnter}
        onTouchStart={onStart}
        onTouchMove={onMove}
        onTouchEnd={onEnd}
        style={{
          position      : "relative",
          transform     : "translate(" + pos.x + "px," + pos.y + "px) rotate(" + tilt + "deg) scale(" + scale + ")",
          transition    : dragging ? "box-shadow 0.15s" : "transform 0.4s " + EASE + ", box-shadow 0.4s ease",
          boxShadow     : boxShadow,
          zIndex        : zIndex,
          cursor        : dragging ? "grabbing" : "grab",
          userSelect    : "none",
          background    : "#f5f0e8",
          borderRadius  : 3,
          padding       : "10px 10px 44px",
          width         : "100%",
          margin        : 0,
        }}
      >
        {/* pink top edge glow on hover */}
        {hovered && (
          <div style={{
            position     : "absolute",
            top          : 0, left: 0, right: 0,
            height       : 3,
            background   : "linear-gradient(90deg,#F08FA8,#F4C77B,#C3A6F0)",
            borderRadius : "3px 3px 0 0",
            pointerEvents: "none",
            animation    : "fadeIn 0.2s ease",
          }} />
        )}

        {/* photo area */}
        <div style={{
          width          : "100%",
          aspectRatio    : "1 / 1.05",
          background     : photo.src ? "#2a1040" : "linear-gradient(145deg,#2a1040,#3a1858)",
          overflow       : "hidden",
          position       : "relative",
          display        : "flex",
          alignItems     : "center",
          justifyContent : "center",
        }}>
          {photo.src ? (
            <>
              <img
                src={photo.src}
                alt={photo.caption}
                loading="lazy"
                draggable={false}
                onLoad={() => setImgLoaded(true)}
                style={{
                  width:"100%", height:"100%",
                  objectFit:"cover", display:"block",
                  opacity: imgLoaded ? 1 : 0,
                  transition: "opacity 0.5s",
                }}
              />
              {!imgLoaded && (
                <span style={{
                  position:"absolute",
                  fontSize:"1.5rem",
                  color:"rgba(240,143,168,0.3)",
                }}>♥</span>
              )}
            </>
          ) : (
            <div style={{
              display:"flex", flexDirection:"column",
              alignItems:"center", gap:6,
            }}>
              <span style={{
                fontSize      : "1.8rem",
                color         : hovered ? "rgba(240,143,168,0.65)" : "rgba(240,143,168,0.3)",
                animation     : "heartBeatSoft 2s ease-in-out infinite",
                animationDelay: (index * 0.3) + "s",
                transition    : "color 0.3s",
                filter        : hovered ? "drop-shadow(0 0 8px rgba(240,143,168,0.6))" : "none",
              }}>♥</span>
              <span style={{
                fontSize      : "0.45rem",
                letterSpacing : "0.2em",
                textTransform : "uppercase",
                color         : hovered ? "rgba(240,143,168,0.5)" : "rgba(240,143,168,0.2)",
                fontFamily    : "Jost, sans-serif",
                transition    : "color 0.3s",
              }}>photo here</span>
            </div>
          )}

          {/* shimmer overlay on hover */}
          {hovered && (
            <div style={{
              position     : "absolute", inset: 0,
              background   : "linear-gradient(135deg,rgba(255,255,255,0.08),transparent 55%)",
              pointerEvents: "none",
              animation    : "fadeIn 0.2s ease",
            }} />
          )}
        </div>

        {/* caption */}
        <figcaption style={{
          fontFamily  : "Parisienne, cursive",
          fontSize    : "clamp(0.85rem,2vw,1rem)",
          color       : hovered ? "#7a4090" : "#4a3060",
          textAlign   : "center",
          marginTop   : 10,
          lineHeight  : 1.3,
          transition  : "color 0.3s ease",
          textShadow  : hovered ? "0 0 12px rgba(195,166,240,0.3)" : "none",
        }}>
          {photo.caption}
        </figcaption>

        {/* hover: index number */}
        {hovered && (
          <div style={{
            position     : "absolute",
            top          : 6, left: 8,
            fontSize     : "0.45rem",
            letterSpacing: "0.2em",
            color        : "rgba(244,199,123,0.7)",
            fontFamily   : "Jost, sans-serif",
            animation    : "fadeIn 0.25s ease",
          }}>
            {"0" + (index + 1)}
          </div>
        )}

        {/* floating hearts on hover */}
        {hearts.map(id => (
          <div key={id} aria-hidden="true" style={{
            position     : "absolute",
            top          : "35%",
            left         : (30 + Math.random() * 40) + "%",
            fontSize     : "0.85rem",
            color        : ["#F08FA8","#F4C77B","#C3A6F0"][id % 3],
            pointerEvents: "none",
            animation    : "polaHeart 1s ease-out forwards",
            zIndex       : 5,
            filter       : "drop-shadow(0 0 4px currentColor)",
          }}>
            {["♥","✦","♡"][id % 3]}
          </div>
        ))}
      </figure>
    </div>
  );
}

export default function Moments() {
  const [zIndices, setZIndices] = useState(() => PHOTOS.map((_, i) => i + 1));
  const maxZ = useRef(PHOTOS.length + 1);

  const handleLift = (index) => {
    const next = [...zIndices];
    next[index] = ++maxZ.current;
    setZIndices(next);
  };

  return (
    <section style={{
      padding  : "4rem 1.25rem 3rem",
      maxWidth : 1100,
      margin   : "0 auto",
      position : "relative",
    }}>

      <style>{`
        @keyframes polaReveal {
          from { opacity:0; transform:translateY(28px) scale(0.93); }
          to   { opacity:1; transform:translateY(0)    scale(1); }
        }
        @keyframes heartBeatSoft {
          0%,100% { transform:scale(1);    }
          50%     { transform:scale(1.22); }
        }
        @keyframes polaHeart {
          0%   { opacity:1; transform:translateY(0)    scale(1);   }
          100% { opacity:0; transform:translateY(-44px) scale(0.4); }
        }
        @keyframes ambDrift {
          0%   { opacity:0;   transform:translateY(0)    translateX(0); }
          10%  { opacity:0.5; }
          85%  { opacity:0.3; }
          100% { opacity:0;   transform:translateY(-50px) translateX(var(--drift)); }
        }
        @keyframes fadeIn {
          from { opacity:0; }
          to   { opacity:1; }
        }
        @keyframes hintFade {
          0%,100% { opacity:0.45; }
          50%     { opacity:0.8; }
        }
      `}</style>

      {/* ambient floaters */}
      <div aria-hidden="true" style={{
        position:"absolute", inset:0,
        overflow:"hidden", pointerEvents:"none", zIndex:0,
      }}>
        {FLOATERS.map((f, i) => (
          <div key={i} style={{
            position : "absolute",
            left     : f.left, top: f.top,
            fontSize : f.size + "rem",
            color    : f.color,
            opacity  : 0,
            animation: "ambDrift " + f.dur + "s ease-in-out " + f.delay + "s infinite",
            "--drift": f.drift + "px",
            filter   : "drop-shadow(0 0 4px " + f.color + "66)",
          }}>{f.glyph}</div>
        ))}
      </div>

      {/* heading */}
      <Reveal className="text-center" style={{ position:"relative", zIndex:1 }}>
        <p className="eyebrow mb-4" style={{ letterSpacing:"0.38em" }}>Chapter five</p>
        <h2 className="display mb-3" style={{ fontSize:"clamp(2rem,5vw,3.5rem)" }}>
          Moments I kept
        </h2>
        <p className="soft text-sm max-w-md mx-auto" style={{ opacity:0.7 }}>
          The camera roll I'd save first.
        </p>
        <p style={{
          fontSize     : "0.62rem",
          letterSpacing: "0.22em",
          color        : "rgba(240,143,168,0.65)",
          marginTop    : 8,
          fontFamily   : "Jost, sans-serif",
          animation    : "hintFade 2.5s ease-in-out infinite",
        }}>
          ✦ pick them up · move them around ✦
        </p>
      </Reveal>

      {/* grid */}
      <div style={{
        marginTop           : 36,
        display             : "grid",
        gridTemplateColumns : "repeat(auto-fill, minmax(155px, 1fr))",
        gap                 : 24,
        userSelect          : "none",
        position            : "relative",
        zIndex              : 1,
      }}>
        {PHOTOS.map((p, i) => (
          <DraggablePola
            key={i}
            photo={p}
            index={i}
            onLift={handleLift}
            zIndex={zIndices[i]}
          />
        ))}
      </div>

      {/* footer note */}
      <p style={{
        textAlign    : "center",
        marginTop    : 32,
        fontSize     : "0.6rem",
        letterSpacing: "0.25em",
        textTransform: "uppercase",
        color        : "rgba(195,166,240,0.5)",
        fontFamily   : "Jost, sans-serif",
        position     : "relative",
        zIndex       : 1,
      }}>
        {PHOTOS.length} frames · every one of them counts
      </p>
    </section>
  );
}