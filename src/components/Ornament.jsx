import React from "react";

export default function Ornament() {
  return (
    <div className="hr-orn" aria-hidden="true" style={{ margin: "0.4rem 0" }}>
      <s />
      <span className="rose" style={{ fontSize: "0.65rem" }}>✦</span>
      <s className="r" />
    </div>
  );
}