import React from "react";
import useReveal from "../lib/useReveal.js";

export default function Reveal({ children, delay = 0, className = "" }) {
  const [ref, on] = useReveal();
  return (
    <div
      ref={ref}
      className={`rv ${on ? "on" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
