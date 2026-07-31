import React, { useState } from "react";
import Reveal from "../components/Reveal.jsx";
import Ornament from "../components/Ornament.jsx";
import { FINALE, YOUR_SIGNOFF, START } from "../data.js";

export default function Finale({ burst }) {
  const [presses, setPresses] = useState(0);

  const press = (e) => {
    setPresses((n) => n + 1);
    burst(e.clientX, e.clientY, 14);
  };

  const line =
    presses === 0
      ? "\u00A0"
      : FINALE.buttonLines[Math.min(presses - 1, FINALE.buttonLines.length - 1)];

  const since = new Date(START).toLocaleDateString("en-GB").replace(/\//g, ".");

  return (
    <section className="px-6 py-24 md:py-36 max-w-3xl mx-auto text-center">
      <Reveal>
        <p className="eyebrow mb-8">The last page</p>
        <h2 className="display text-4xl md:text-6xl leading-tight mb-10">
          {FINALE.heading.map((l, i) => (
            <React.Fragment key={i}>
              {l}
              {i < FINALE.heading.length - 1 && <br />}
            </React.Fragment>
          ))}
        </h2>
      </Reveal>

      <Reveal delay={160}>
        <div className="soft leading-relaxed text-sm md:text-base max-w-xl mx-auto">
          {FINALE.paragraphs.map((p, i) => (
            <p key={i} className="mb-5">
              {p}
            </p>
          ))}
          <p className="rose">{FINALE.closing}</p>
        </div>
      </Reveal>

      <Reveal delay={300}>
        <Ornament />
        <button className="btn" onClick={press}>
          {presses === 0 ? "Press if you love me too" : "Press it again"}
        </button>

        <p className="script rose text-3xl md:text-4xl mt-8" style={{ minHeight: 48 }}>
          {line}
        </p>

        {presses > 0 && (
          <p className="soft text-xs tracking-widest opacity-60">
            {presses} {presses === 1 ? "heart" : "hearts"} and counting
          </p>
        )}
      </Reveal>

      <Reveal delay={420}>
        <p className="script text-4xl md:text-5xl mt-20 gold">{YOUR_SIGNOFF}</p>
        <p className="eyebrow mt-8 opacity-60">
          built by hand &middot; one message at a time &middot; since {since}
        </p>
      </Reveal>
    </section>
  );
}
