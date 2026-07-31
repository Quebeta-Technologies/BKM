import React, { useEffect, useRef, useState } from "react";
import { LOCK, HER_NAME } from "../data.js";
import { normalise } from "../lib/utils.js";

export default function Lock({ onUnlock }) {
  const [value, setValue] = useState("");
  const [wrong, setWrong] = useState(0);
  const [shake, setShake] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);
  const input = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => input.current?.focus(), 900);
    return () => clearTimeout(t);
  }, []);

  const submit = (e) => {
    e.preventDefault();
    if (!value.trim()) return;

    if (normalise(value) === normalise(LOCK.password)) {
      setLeaving(true);
      onUnlock();
      setTimeout(() => setGone(true), 1200);
    } else {
      setWrong((w) => w + 1);
      setShake(true);
      setValue("");
      setTimeout(() => setShake(false), 500);
    }
  };

  if (gone) return null;

  const message =
    wrong === 0
      ? null
      : LOCK.wrongMessages[Math.min(wrong - 1, LOCK.wrongMessages.length - 1)];

  return (
    <div className={`lock ${leaving ? "leaving" : ""}`}>
      <div className="px-6 text-center" style={{ maxWidth: 420, width: "100%" }}>
        <div className="keyhole">&#9825;</div>

        <p className="eyebrow mb-6">This one is not for everyone</p>

        <h1 className="display text-4xl md:text-5xl mb-3">
          Hello,{" "}
          <span className="script rose" style={{ fontSize: "1.15em" }}>
            {HER_NAME}
          </span>
        </h1>

        <p className="soft text-sm leading-relaxed mb-10">
          I made something for you and locked it, because it&rsquo;s yours and
          nobody else&rsquo;s. You already know the answer.
        </p>

        <p className="gold text-sm mb-5" style={{ letterSpacing: "0.04em" }}>
          {LOCK.question}
        </p>

        <form onSubmit={submit} className={shake ? "shake" : ""}>
          <input
            ref={input}
            className="key-in"
            type="text"
            inputMode="text"
            autoComplete="off"
            spellCheck="false"
            placeholder={LOCK.hint}
            aria-label={LOCK.question}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <button className="btn mt-8" type="submit">
            Let me in
          </button>
        </form>

        <p
          className="script rose mt-8"
          style={{ fontSize: "1.4rem", minHeight: 34, opacity: message ? 1 : 0 }}
        >
          {message || "\u00A0"}
        </p>
      </div>
    </div>
  );
}
