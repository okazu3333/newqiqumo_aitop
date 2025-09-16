"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Side = "right" | "left" | "top" | "bottom";

export function HoverHelp({
  text,
  side = "right",
  maxWidth = 360,
  className = "",
}: {
  text: string;
  side?: Side;
  maxWidth?: number;
  className?: string;
}) {
  const triggerRef = useRef<HTMLSpanElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState<{ left: number; top: number } | null>(null);
  const margin = 8;

  const updatePosition = () => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    let left = rect.right + margin;
    let top = rect.top + rect.height / 2;

    if (side === "left") {
      left = rect.left - margin;
    } else if (side === "top") {
      left = rect.left + rect.width / 2;
      top = rect.top - margin;
    } else if (side === "bottom") {
      left = rect.left + rect.width / 2;
      top = rect.bottom + margin;
    }

    // Clamp within viewport with small padding
    const pad = 6;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    left = Math.max(pad, Math.min(vw - pad, left));
    top = Math.max(pad, Math.min(vh - pad, top));

    setCoords({ left, top });
  };

  useEffect(() => {
    if (!visible) return;
    updatePosition();
    const onScroll = () => updatePosition();
    const onResize = () => updatePosition();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [visible]);

  const tooltip = visible && coords
    ? createPortal(
        <div
          role="tooltip"
          style={{
            position: "fixed",
            left: coords.left,
            top: coords.top,
            maxWidth,
            transform:
              side === "right"
                ? "translateY(-50%)"
                : side === "left"
                  ? "translate(-100%, -50%)"
                  : side === "top"
                    ? "translate(-50%, -100%)"
                    : "translate(-50%, 0)",
            zIndex: 60,
            pointerEvents: "none",
          }}
          className="rounded bg-gray-900 text-white text-xs px-2.5 py-1.5 shadow-lg leading-tight break-words"
        >
          {text}
        </div>,
        document.body,
      )
    : null;

  return (
    <span className={`relative inline-block ${className}`}>
      <span
        ref={triggerRef}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        aria-label="設計意図"
        className="inline-flex items-center justify-center w-4 h-4 text-[10px] rounded-full border border-[#dcdcdc] text-[#666666] cursor-help bg-white/80"
      >
        ?
      </span>
      {tooltip}
    </span>
  );
} 