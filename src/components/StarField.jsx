import React, { useMemo } from "react";

export default function StarField({ count = 130 }) {
  const stars = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * 1.8 + 0.6,
        delay: Math.random() * 4,
      })),
    [count]
  );

  return (
    <div className="stars" aria-hidden="true">
      {stars.map((s, i) => (
        <b
          key={i}
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
