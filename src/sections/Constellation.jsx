import React, { useEffect, useRef, useState } from "react";
import Reveal from "../components/Reveal.jsx";
import useReveal from "../lib/useReveal.js";
import { MILESTONES } from "../data.js";
import { fmtDate, shortDate, daysBetween } from "../lib/utils.js";

/* ─── smooth bezier path through all points ─── */
function buildPath(points) {
  if (points.length < 2) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i], b = points[i + 1];
    const cx = (a.x + b.x) / 2;
    d += ` Q ${cx} ${a.y}, ${cx} ${(a.y + b.y) / 2} T ${b.x} ${b.y}`;
  }
  return d;
}

/* ─── sparkle burst on star click ──────────── */
function Sparkles({ x, y, active }) {
  const [parts, setParts] = useState([]);
  useEffect(() => {
    if (!active) return;
    const p = Array.from({ length: 16 }, (_, i) => ({
      id    : i,
      angle : (i / 16) * Math.PI * 2,
      dist  : 24 + Math.random() * 44,
      size  : 1.5 + Math.random() * 2.5,
      dur   : 0.4 + Math.random() * 0.5,
      color : ["#F4C77B","#F08FA8","#C3A6F0","#fff"][i % 4],
    }));
    setParts(p);
    const t = setTimeout(() => setParts([]), 1100);
    return () => clearTimeout(t);
  }, [active]);

  return (
    <>
      {parts.map((p) => (
        <circle key={p.id} cx={x} cy={y} r={p.size} fill={p.color}
          style={{
            animation   : `sparkOut ${p.dur}s ease-out forwards`,
            "--tx"      : `${Math.cos(p.angle) * p.dist}px`,
            "--ty"      : `${Math.sin(p.angle) * p.dist}px`,
          }}
        />
      ))}
    </>
  );
}

/* ─── floating ambient stars behind SVG ─────── */
const BG_STARS = Array.from({ length: 20 }, (_, i) => ({
  cx  : 20 + Math.random() * 760,
  cy  : 20 + Math.random() * 380,
  r   : 0.6 + Math.random() * 1.2,
  dur : 2.5 + Math.random() * 3,
  del : Math.random() * 3,
}));

/* ─── photo slot component ───────────────────── */
function PhotoSlot({ src, alt, style }) {
  const [loaded, setLoaded] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position     : "relative",
        borderRadius : 16,
        overflow     : "hidden",
        border       : `1px solid rgba(240,143,168,${hovered ? 0.6 : 0.2})`,
        boxShadow    : hovered
          ? "0 0 0 1px rgba(240,143,168,0.3), 0 12px 40px rgba(240,143,168,0.2), 0 0 60px rgba(240,143,168,0.1)"
          : "0 4px 20px rgba(0,0,0,0.3)",
        transform    : hovered ? "scale(1.03) rotate(-0.5deg)" : "scale(1) rotate(0deg)",
        transition   : "all 0.4s cubic-bezier(.2,.8,.3,1)",
        background   : "rgba(255,255,255,0.03)",
        ...style,
      }}
    >
      {src ? (
        <>
          <img
            src={src} alt={alt}
            onLoad={() => setLoaded(true)}
            style={{
              width:"100%", height:"100%",
              objectFit:"cover",
              opacity: loaded ? 1 : 0,
              transition:"opacity 0.5s ease",
              display:"block",
            }}
          />
          {!loaded && <PhotoPlaceholder />}
        </>
      ) : (
        <PhotoPlaceholder label={alt} />
      )}

      {/* pink shimmer on hover */}
      {hovered && (
        <div style={{
          position:"absolute", inset:0,
          background:"linear-gradient(135deg,rgba(240,143,168,0.08),transparent 60%)",
          pointerEvents:"none",
        }}/>
      )}
    </div>
  );
}

function PhotoPlaceholder({ label }) {
  return (
    <div style={{
      width:"100%", height:"100%",
      display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      gap:8,
      background:"linear-gradient(145deg,rgba(240,143,168,0.06),rgba(195,166,240,0.06))",
      minHeight:140,
    }}>
      <div style={{
        fontSize:"1.8rem",
        animation:"photoIconFloat 3s ease-in-out infinite",
        filter:"drop-shadow(0 0 8px rgba(240,143,168,0.5))",
      }}>📷</div>
      {label && (
        <p style={{
          fontSize:"0.58rem", letterSpacing:"0.22em",
          textTransform:"uppercase",
          color:"rgba(240,143,168,0.5)",
          textAlign:"center", padding:"0 12px",
          fontFamily:"Jost,sans-serif",
        }}>{label}</p>
      )}
    </div>
  );
}

/* ─── memo card (detail panel) ───────────────── */
function MemoCard({ milestone, gap, photos }) {
  const [imgIdx, setImgIdx] = useState(0);
  const hasPhotos = photos && photos.length > 0;

  // reset on milestone change
  useEffect(() => setImgIdx(0), [milestone.id]);

  return (
    <div style={{
      display        : "grid",
      gridTemplateColumns: "1fr",
      gap            : 0,
      background     : "rgba(255,255,255,0.025)",
      border         : "1px solid rgba(240,143,168,0.15)",
      borderRadius   : 20,
      overflow       : "hidden",
      backdropFilter : "blur(16px)",
      animation      : "memoFadeIn 0.45s cubic-bezier(.2,.8,.3,1)",
      boxShadow      : "0 8px 48px rgba(0,0,0,0.35), 0 0 0 1px rgba(240,143,168,0.08)",
    }}>

      {/* top accent line */}
      <div style={{
        height:"2px",
        background:"linear-gradient(90deg,transparent,rgba(240,143,168,0.6) 30%,rgba(195,166,240,0.6) 70%,transparent)",
      }}/>

      <div style={{
        display:"grid",
        gridTemplateColumns: "1fr auto",
        gap:0,
      }}>
        {/* left — text content */}
        <div style={{ padding:"28px 32px" }}>
          <p style={{
            fontSize:"0.55rem", letterSpacing:"0.38em",
            textTransform:"uppercase",
            color:"var(--gold)", opacity:0.8,
            fontFamily:"Jost,sans-serif",
            marginBottom:6,
            display:"flex", alignItems:"center", gap:8, flexWrap:"wrap",
          }}>
            <span>{milestone.where}</span>
            {gap !== null && (
              <>
                <span style={{ opacity:0.4 }}>·</span>
                <span style={{ color:"rgba(195,166,240,0.8)" }}>{gap} days later</span>
              </>
            )}
          </p>

          <h3 style={{
            fontFamily  : "Cormorant Garamond, serif",
            fontSize    : "clamp(1.5rem,3vw,2.2rem)",
            fontWeight  : 400,
            color       : "var(--cream)",
            marginBottom: 4,
            lineHeight  : 1.2,
          }}>
            {milestone.label}
          </h3>

          <p style={{
            fontFamily  : "Parisienne, cursive",
            fontSize    : "1.3rem",
            color       : "var(--rose)",
            marginBottom: 18,
            textShadow  : "0 0 16px rgba(240,143,168,0.4)",
          }}>
            {fmtDate(milestone.date)}
          </p>

          {/* emoji icon for the milestone */}
          <div style={{
            fontSize:"1.6rem", marginBottom:14,
            filter:"drop-shadow(0 0 8px rgba(240,143,168,0.4))",
          }}>
            {milestone.emoji || "✦"}
          </div>

          <p style={{
            color       : "rgba(220,210,230,0.8)",
            fontSize    : "0.9rem",
            lineHeight  : 1.75,
            maxWidth    : 480,
            fontFamily  : "Jost, sans-serif",
            fontWeight  : 300,
          }}>
            {milestone.text}
          </p>
        </div>

        {/* right — photo stack */}
        <div style={{
          width       : "clamp(160px,28vw,260px)",
          padding     : "24px 24px 24px 0",
          display     : "flex",
          flexDirection:"column",
          gap         : 10,
          alignItems  : "center",
          justifyContent:"center",
        }}>
          {/* main photo */}
          <PhotoSlot
            src={milestone.photos?.[imgIdx]}
            alt={milestone.label}
            style={{ width:"100%", aspectRatio:"4/5" }}
          />

          {/* thumbnail row if multiple photos */}
          {milestone.photos?.length > 1 && (
            <div style={{ display:"flex", gap:6, justifyContent:"center" }}>
              {milestone.photos.map((src, i) => (
                <div
                  key={i}
                  onClick={() => setImgIdx(i)}
                  style={{
                    width:28, height:28, borderRadius:6,
                    overflow:"hidden", cursor:"pointer",
                    border:`1px solid rgba(240,143,168,${i===imgIdx?0.8:0.25})`,
                    opacity: i === imgIdx ? 1 : 0.5,
                    transition:"all 0.2s",
                  }}
                >
                  <img src={src} style={{ width:"100%",height:"100%",objectFit:"cover" }}/>
                </div>
              ))}
            </div>
          )}

          {/* placeholder hint */}
          {!milestone.photos?.length && (
            <p style={{
              fontSize:"0.55rem", letterSpacing:"0.2em",
              textTransform:"uppercase",
              color:"rgba(240,143,168,0.35)",
              textAlign:"center",
              fontFamily:"Jost,sans-serif",
            }}>
              add photos in data.js
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── main component ─────────────────────────── */
export default function Constellation() {
  const [ref, on]       = useReveal(0.15);
  const [selected, setSelected] = useState(MILESTONES[0].id);
  const [sparked, setSparked]   = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const pathRef = useRef(null);
  const [pathLen, setPathLen] = useState(0);

  const index  = MILESTONES.findIndex((m) => m.id === selected);
  const active = MILESTONES[index];
  const gap    = index > 0 ? daysBetween(MILESTONES[index - 1].date, active.date) : null;
  const last   = MILESTONES[MILESTONES.length - 1];

  // measure path length for draw-on animation
  useEffect(() => {
    if (pathRef.current) setPathLen(pathRef.current.getTotalLength());
  }, []);

  const select = (id) => {
    setSelected(id);
    setSparked(id);
    setTimeout(() => setSparked(null), 1100);
  };

  const pathD = buildPath(MILESTONES);

  return (
    <section style={{ padding:"4rem 1.5rem 3rem", maxWidth:940, margin:"0 auto" }}>

      <style>{`
        @keyframes photoIconFloat {
          0%,100% { transform:translateY(0) rotate(-5deg); }
          50%      { transform:translateY(-6px) rotate(5deg); }
        }
        @keyframes memoFadeIn {
          from { opacity:0; transform:translateY(14px) scale(0.98); }
          to   { opacity:1; transform:translateY(0)    scale(1); }
        }
        @keyframes pathDraw {
          from { stroke-dashoffset:var(--pl); }
          to   { stroke-dashoffset:0; }
        }
        @keyframes starPulseRing {
          0%   { r:14; opacity:0.6; }
          100% { r:30; opacity:0; }
        }
        @keyframes sparkOut {
          0%   { transform:translate(0,0) scale(1); opacity:1; }
          100% { transform:translate(var(--tx),var(--ty)) scale(0); opacity:0; }
        }
        @keyframes bgStarBlink {
          0%,100% { opacity:0.15; }
          50%     { opacity:0.7; }
        }
        @keyframes tailPulse {
          0%,100% { opacity:0.3; }
          50%     { opacity:0.7; }
        }
        @keyframes starHoverPop {
          0%   { transform:scale(1); }
          50%  { transform:scale(1.35); }
          100% { transform:scale(1.15); }
        }
        @keyframes chapterReveal {
          from { opacity:0; letter-spacing:0.6em; }
          to   { opacity:1; letter-spacing:0.28em; }
        }
      `}</style>

      {/* heading */}
      <Reveal className="text-center">
        <p className="eyebrow mb-4" style={{
          animation:"chapterReveal 1s ease both",
        }}>Chapter one</p>
        <h2 className="display mb-3" style={{ fontSize:"clamp(2rem,5vw,3.5rem)" }}>
          The constellation of us
        </h2>
        <p className="soft max-w-sm mx-auto text-sm leading-relaxed mb-1" style={{ opacity:0.7 }}>
          {MILESTONES.length} moments. {MILESTONES.length} stars.&nbsp;
          <span style={{ color:"var(--rose)" }}>Touch one to remember.</span>
        </p>
      </Reveal>

      {/* SVG constellation */}
      <div
        ref={ref}
        className={`cons ${on ? "on" : ""}`}
        style={{
          marginTop:36, position:"relative",
          border:"none", outline:"none", background:"transparent",
        }}
      >
        <svg
          viewBox="0 0 800 420"
          className="w-full"
          role="group"
          aria-label="Constellation of our milestone dates"
          style={{ display:"block", overflow:"visible", border:"none", outline:"none" }}
        >
          <defs>
            <linearGradient id="lineGrad" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%"   stopColor="#F08FA8" stopOpacity=".5" />
              <stop offset="50%"  stopColor="#F4C77B" stopOpacity=".9" />
              <stop offset="100%" stopColor="#C3A6F0" stopOpacity=".6" />
            </linearGradient>
            <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="3" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="starGlow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="5" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          {/* ambient background stars */}
          {BG_STARS.map((s, i) => (
            <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill="#fff"
              style={{ animation:`bgStarBlink ${s.dur}s ease-in-out ${s.del}s infinite` }}
            />
          ))}

          {/* draw-on path (ghost — no stroke, just for length) */}
          <path
            ref={pathRef}
            d={pathD}
            fill="none" stroke="transparent" strokeWidth="0"
            aria-hidden="true"
          />

          {/* glow behind the line */}
          <path
            d={pathD}
            fill="none"
            stroke="rgba(240,143,168,0.12)"
            strokeWidth="10"
            strokeLinecap="round"
          />

          {/* main animated line */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#lineGrad)"
            strokeWidth="1.5"
            strokeLinecap="round"
            style={pathLen > 0 ? {
              strokeDasharray  : pathLen,
              strokeDashoffset : pathLen,
              "--pl"           : pathLen,
              animation        : on
                ? "pathDraw 2.2s cubic-bezier(.4,0,.2,1) 0.3s forwards"
                : "none",
            } : {}}
          />

          {/* tail beyond last star */}
          <path
            d={`M ${last.x} ${last.y} C ${last.x+30} ${last.y+28}, ${last.x+55} ${last.y+53}, ${last.x+72} ${last.y+78}`}
            fill="none" stroke="#C3A6F0" strokeOpacity=".3"
            strokeWidth="1" strokeDasharray="3 7"
            style={{ animation:"tailPulse 3s ease-in-out infinite" }}
          />
          <circle cx={last.x+76} cy={last.y+86} r="3.5" fill="#C3A6F0"
            style={{ animation:"tailPulse 2s ease-in-out infinite" }}
          />
          <text x={last.x+76} y={last.y+112}
            textAnchor="middle" className="star-lab" opacity=".45"
            style={{ fontStyle:"italic" }}>
            and everything after
          </text>

          {/* milestone stars */}
          {MILESTONES.map((m, mi) => {
            const isSel  = m.id === selected;
            const isHov  = m.id === hoveredId;
            const above  = m.y < 200;

            return (
              <g
                key={m.id}
                className="star-hit"
                tabIndex={0}
                role="button"
                aria-pressed={isSel}
                aria-label={`${m.label}, ${fmtDate(m.date)}`}
                onClick={() => select(m.id)}
                onMouseEnter={() => setHoveredId(m.id)}
                onMouseLeave={() => setHoveredId(null)}
                onKeyDown={(e) =>
                  (e.key==="Enter"||e.key===" ") && (e.preventDefault(), select(m.id))
                }
                style={{ outline:"none", cursor:"pointer" }}
              >
                {/* large invisible hit area */}
                <circle cx={m.x} cy={m.y} r="42" fill="transparent"/>

                {/* outer pulse ring — selected */}
                {isSel && (
                  <>
                    <circle cx={m.x} cy={m.y} r="18"
                      fill="none" stroke="#F08FA8" strokeOpacity=".4" strokeWidth="1"
                      style={{ animation:"starPulseRing 1.8s ease-out infinite" }}
                    />
                    <circle cx={m.x} cy={m.y} r="18"
                      fill="none" stroke="#F08FA8" strokeOpacity=".25" strokeWidth="1"
                      style={{ animation:"starPulseRing 1.8s ease-out 0.6s infinite" }}
                    />
                  </>
                )}

                {/* hover ring */}
                {isHov && !isSel && (
                  <circle cx={m.x} cy={m.y} r="14"
                    fill="none" stroke="#F4C77B" strokeOpacity=".4" strokeWidth="1"
                    style={{ animation:"starPulseRing 1.2s ease-out infinite" }}
                  />
                )}

                {/* halo */}
                <circle cx={m.x} cy={m.y}
                  r={isSel ? 16 : isHov ? 13 : 10}
                  fill={isSel ? "#F08FA8" : "#F4C77B"}
                  opacity={isSel ? 0.18 : isHov ? 0.12 : 0.06}
                  style={{ transition:"all 0.3s" }}
                />

                {/* star body */}
                {isSel ? (
                  <>
                    <circle cx={m.x} cy={m.y} r="18" fill="#F08FA8" opacity="0.06"/>
                    <circle cx={m.x} cy={m.y} r="13" fill="#F08FA8" opacity="0.09"/>
                    <circle cx={m.x} cy={m.y} r="9"  fill="#FFB8CC" opacity="0.2"/>
                    <circle cx={m.x} cy={m.y} r="8"  fill="#FFE9EF" opacity="1"
                      filter="url(#starGlow)"
                    />
                  </>
                ) : (
                  <circle cx={m.x} cy={m.y}
                    r={isHov ? 6 : 4.5}
                    fill={isHov ? "#F08FA8" : "#F4C77B"}
                    filter="url(#glow)"
                    style={{ transition:"all 0.25s" }}
                  />
                )}

                {/* milestone number badge */}
                <text x={m.x + 14} y={m.y - 14}
                  fontSize="7" fill="rgba(244,199,123,0.55)"
                  fontFamily="Jost,sans-serif" letterSpacing="0.05em">
                  {String(mi + 1).padStart(2, "0")}
                </text>

                <Sparkles x={m.x} y={m.y} active={sparked === m.id}/>

                {/* label + date */}
                <text x={m.x} y={above ? m.y - 34 : m.y + 44}
                  textAnchor="middle" className="star-lab"
                  opacity={isSel || isHov ? 1 : 0.55}
                  style={{ transition:"opacity 0.2s", fontWeight: isSel ? 600 : 400 }}
                >
                  {m.label}
                </text>
                <text x={m.x} y={above ? m.y - 19 : m.y + 29}
                  textAnchor="middle" className="star-date"
                  opacity={isSel || isHov ? 0.9 : 0.44}
                  style={{ transition:"opacity 0.2s" }}
                >
                  {shortDate(m.date)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* detail card */}
      <div style={{ marginTop:24 }} key={selected}>
        <MemoCard milestone={active} gap={gap}/>
      </div>

      {/* dot nav */}
      <div style={{
        display:"flex", justifyContent:"center", gap:10, marginTop:20,
      }}>
        {MILESTONES.map((m) => (
          <button
            key={m.id}
            onClick={() => select(m.id)}
            title={m.label}
            style={{
              width       : m.id === selected ? 24 : 8,
              height      : 8,
              borderRadius: 4,
              background  : m.id === selected
                ? "linear-gradient(90deg,#F08FA8,#C3A6F0)"
                : "rgba(255,255,255,0.18)",
              border      : "none",
              cursor      : "pointer",
              transition  : "all 0.35s cubic-bezier(.2,.8,.3,1)",
              padding     : 0,
            }}
          />
        ))}
      </div>
    </section>
  );
}