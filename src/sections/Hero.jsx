import React, { useEffect, useState } from "react";
import Reveal from "../components/Reveal.jsx";
import { HER_NAME, START, START_LABEL } from "../data.js";

export default function Hero() {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);

  const ms = now - new Date(START).getTime();
  const units = [
    [Math.floor(ms / 86400000), "days"],
    [Math.floor(ms / 3600000) % 24, "hours"],
    [Math.floor(ms / 60000) % 60, "minutes"],
    [Math.floor(ms / 1000) % 60, "seconds"],
  ];

  return (
    <header className="min-h-screen flex flex-col items-center justify-center text-center px-6 py-24">
      <Reveal>
        <p className="eyebrow mb-8">
          Girlfriend&rsquo;s Day &nbsp;&middot;&nbsp; for one girl in particular
        </p>
      </Reveal>

      <Reveal delay={220}>
        <h1 className="display text-5xl md:text-7xl lg:text-8xl mb-4">
          Happy Girlfriend&rsquo;s Day,
        </h1>
      </Reveal>

      <Reveal delay={420}>
        <p className="script rose text-5xl md:text-7xl mb-10">{HER_NAME}</p>
      </Reveal>

      <Reveal delay={620}>
        <p className="soft max-w-lg mx-auto text-base md:text-lg leading-relaxed mb-14">
          I couldn&rsquo;t fit it in a message. I couldn&rsquo;t fit it in a card.
          So I built you the whole sky instead. Scroll slowly &mdash; it&rsquo;s all for you.
        </p>
      </Reveal>

      <Reveal delay={820}>
        <p className="eyebrow mb-5">We have been us for</p>
        <div className="tick">
          {units.map(([value, label]) => (
            <div key={label}>
              <span>{String(value).padStart(2, "0")}</span>
              <em>{label}</em>
            </div>
          ))}
        </div>
        <p className="soft text-xs mt-5 tracking-widest opacity-60">{START_LABEL}</p>
      </Reveal>

      <Reveal delay={1100}>
        <div className="mt-16 gold text-2xl beat" aria-hidden="true">
          &#9829;
        </div>
      </Reveal>
    </header>
  );
}
