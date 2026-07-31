import React from "react";
import Reveal from "../components/Reveal.jsx";
import { LETTERS } from "../data.js";

export default function Letters({ onOpen }) {
  return (
    <section className="px-6 py-24 md:py-32 max-w-5xl mx-auto">
      <Reveal className="text-center">
        <p className="eyebrow mb-6">Chapter three</p>
        <h2 className="display text-4xl md:text-6xl mb-4">Letters, sealed for you</h2>
        <p className="soft max-w-md mx-auto text-sm md:text-base">
          Open one now. Save the rest for when you need them.
        </p>
      </Reveal>

      <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
        {LETTERS.map((letter, i) => (
          <Reveal key={letter.id} delay={i * 120}>
            <div
              className="env"
              style={{ aspectRatio: "1.5 / 1" }}
              tabIndex={0}
              role="button"
              aria-label={`Open the letter: ${letter.seal}`}
              onClick={() => onOpen(letter)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onOpen(letter);
                }
              }}
            >
              <div className="flap" />
              <div className="seal">&#9829;</div>
              <div className="env-cap">{letter.seal}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
