import { useEffect, useState, useCallback } from "react";

const ScissorsCursor = () => {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [cutting, setCutting] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    if (!mq.matches) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    setVisible(true);
    document.body.style.cursor = "none";

    const onMove = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    const onDown = () => { setCutting(true); setTimeout(() => setCutting(false), 300); };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onDown);
    return () => {
      document.body.style.cursor = "";
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="pointer-events-none fixed z-[9999] -translate-x-1/2 -translate-y-1/2"
      style={{ left: pos.x, top: pos.y }}
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        className={`transition-transform duration-150 ${cutting ? "scale-110" : ""}`}
      >
        {/* Blade 1 */}
        <g
          className="origin-center"
          style={{
            transform: cutting ? "rotate(-15deg)" : "rotate(0deg)",
            transition: "transform 150ms ease-out",
            transformOrigin: "12px 12px",
          }}
        >
          <circle cx="6" cy="18" r="2.5" stroke="hsl(42, 58%, 54%)" strokeWidth="1.5" fill="none" />
          <line x1="7.5" y1="16.5" x2="16" y2="4" stroke="hsl(42, 58%, 54%)" strokeWidth="1.5" strokeLinecap="round" />
        </g>
        {/* Blade 2 */}
        <g
          className="origin-center"
          style={{
            transform: cutting ? "rotate(15deg)" : "rotate(0deg)",
            transition: "transform 150ms ease-out",
            transformOrigin: "12px 12px",
          }}
        >
          <circle cx="18" cy="18" r="2.5" stroke="hsl(42, 58%, 54%)" strokeWidth="1.5" fill="none" />
          <line x1="16.5" y1="16.5" x2="8" y2="4" stroke="hsl(42, 58%, 54%)" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
};

export default ScissorsCursor;
