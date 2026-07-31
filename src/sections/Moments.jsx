import React from "react";
import Reveal from "../components/Reveal.jsx";
import { PHOTOS } from "../data.js";

export default function Moments() {
  const hasPhotos = PHOTOS.some((p) => p.src);

  return (
    <section className="px-6 py-24 md:py-32 max-w-6xl mx-auto">
      <Reveal className="text-center">
        <p className="eyebrow mb-6">Chapter five</p>
        <h2 className="display text-4xl md:text-6xl mb-4">Moments I kept</h2>
        <p className="soft max-w-md mx-auto text-sm md:text-base">
          The camera roll I&rsquo;d save first.
        </p>
      </Reveal>

      <div className="mt-14 grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-10">
        {PHOTOS.map((p, i) => (
          <Reveal key={i} delay={i * 90}>
            <figure className="pola" style={{ transform: `rotate(${p.tilt}deg)` }}>
              <div className="ph">
                {p.src ? (
                  <img src={p.src} alt={p.caption} loading="lazy" />
                ) : (
                  <span style={{ color: "rgba(251,213,222,.5)", fontSize: 30 }}>&#9829;</span>
                )}
              </div>
              <figcaption>{p.caption}</figcaption>
            </figure>
          </Reveal>
        ))}
      </div>

      {!hasPhotos && (
        <Reveal>
          <p className="soft text-center text-xs mt-10 opacity-50 tracking-widest">
            (photos go in public/photos, then into the PHOTOS list in src/data.js)
          </p>
        </Reveal>
      )}
    </section>
  );
}
