import React, { useEffect, useRef, useState } from "react";
import Reveal from "../components/Reveal.jsx";
import useReveal from "../lib/useReveal.js";
import { CHAT, HER_NAME, START } from "../data.js";
import { daysBetween } from "../lib/utils.js";

export default function FirstChat() {
  const [ref, on] = useReveal(0.25);
  const [shown, setShown] = useState(0);
  const [typing, setTyping] = useState(false);
  const box = useRef(null);

  // Replay the conversation, one message at a time, typing dots and all.
  useEffect(() => {
    if (!on || shown >= CHAT.length) return;
    setTyping(true);
    const a = setTimeout(() => setTyping(false), 620);
    const b = setTimeout(() => setShown((n) => n + 1), 900);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, [on, shown]);

  useEffect(() => {
    if (box.current) box.current.scrollTop = box.current.scrollHeight;
  }, [shown, typing]);

  const days = daysBetween(START, new Date());

  return (
    <section className="px-6 py-24 md:py-32 max-w-5xl mx-auto" ref={ref}>
      <Reveal className="text-center">
        <p className="eyebrow mb-6">Chapter two</p>
        <h2 className="display text-4xl md:text-6xl mb-4">The night it started</h2>
        <p className="soft text-sm md:text-base">10 August 2025 &nbsp;&middot;&nbsp; 9:14 pm</p>
      </Reveal>

      <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <Reveal>
          <div className="phone p-4 mx-auto" style={{ maxWidth: 380 }}>
            <div
              className="flex items-center gap-3 px-2 pb-3 mb-2"
              style={{ borderBottom: "1px solid rgba(255,255,255,.07)" }}
            >
              <div
                className="flex items-center justify-center"
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  background: "linear-gradient(140deg,#F08FA8,#C3A6F0)",
                  color: "#2A1B48",
                }}
              >
                &#9829;
              </div>
              <div>
                <p className="text-sm" style={{ color: "#EFE7F7" }}>
                  {HER_NAME}
                </p>
                <p className="text-xs gold opacity-70">online</p>
              </div>
            </div>

            <div
              ref={box}
              className="flex flex-col gap-2 px-1"
              style={{ height: 340, overflowY: "auto" }}
            >
              {CHAT.slice(0, shown).map((c, i) => (
                <div key={i} className={`bub ${c.from}`}>
                  {c.type === "voice" ? (
                    <div className="flex items-center gap-3">
                      <span className="rose">&#9654;</span>
                      <div className="wave">
                        {Array.from({ length: 18 }, (_, k) => (
                          <i key={k} style={{ animationDelay: `${k * 0.07}s` }} />
                        ))}
                      </div>
                      <span className="text-xs opacity-70">{c.dur}</span>
                    </div>
                  ) : (
                    c.text
                  )}
                  <time>{c.t}</time>
                </div>
              ))}

              {typing && shown < CHAT.length && (
                <div className={`bub ${CHAT[shown].from} typing`} style={{ padding: "12px 16px" }}>
                  <i />
                  <i style={{ animationDelay: ".2s" }} />
                  <i style={{ animationDelay: ".4s" }} />
                </div>
              )}
            </div>
          </div>
        </Reveal>

        <Reveal delay={200}>
          <p className="display text-3xl md:text-4xl mb-6 leading-snug">
            And we have not stopped talking since.
          </p>
          <p className="soft leading-relaxed mb-6 text-sm md:text-base">
            That&rsquo;s <span className="gold">{days.toLocaleString()} days</span> of good
            mornings. Of voice notes I&rsquo;ve listened to more times than I&rsquo;ll admit. Of
            video calls where neither of us hangs up first. Of you falling asleep mid-sentence and
            me just watching for a while.
          </p>
          <p className="soft leading-relaxed text-sm md:text-base">
            People say the beginning is the best part. They&rsquo;re wrong. Every single week with
            you has been better than the one before it, and I&rsquo;ve been keeping score.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
