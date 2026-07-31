import React, { useState } from "react";
import Reveal from "../components/Reveal.jsx";
import { REASONS } from "../data.js";

export default function Reasons({ burst }) {
  const [i, setI] = useState(0);
  const [drawn, setDrawn] = useState(1);

  const next = (e) => {
    let n = i;
    if (REASONS.length > 1) while (n === i) n = Math.floor(Math.random() * REASONS.length);
    setI(n);
    setDrawn((d) => d + 1);
    burst(e.clientX, e.clientY, 6);
  };

  return (
    <section className="px-6 py-24 md:py-32 max-w-3xl mx-auto text-center">
      <Reveal>
        <p className="eyebrow mb-6">Chapter four</p>
        <h2 className="display text-4xl md:text-6xl mb-4">Reasons, drawn at random</h2>
        <p className="soft max-w-md mx-auto text-sm md:text-base">
          There are {REASONS.length} in here. There are more than {REASONS.length} in me.
        </p>
      </Reveal>

      <Reveal delay={180}>
        <div className="card3d mt-12 px-8 py-14 md:px-14 md:py-20" key={i}>
          <p className="gold text-xs tracking-widest mb-6">
            NO. {String(i + 1).padStart(2, "0")}
          </p>
          <p className="display text-2xl md:text-4xl leading-snug">{REASONS[i]}</p>
        </div>

        <button className="btn mt-10" onClick={next}>
          Draw another
        </button>
        <p className="soft text-xs mt-5 opacity-60 tracking-widest">{drawn} drawn so far</p>
      </Reveal>
    </section>
  );
}
