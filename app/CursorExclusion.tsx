/** Custom cursor — a small lavender circle with an "exclusion" blend.
 *
 * Text and shapes under the circle are colour-inverted (white letters turn
 * dark green), while the circle itself reads as lavender on dark backgrounds.
 * The system cursor stays visible. Over anything clickable (links, buttons,
 * inputs, anything with cursor:pointer) the circle shrinks away and hides so
 * the normal pointer takes over, then returns when you leave it.
 *
 * Hydration-safe: renders nothing on the server and on the first client
 * render. Only enabled for devices with a real mouse (hover + fine pointer),
 * so touch screens never see it. Position is written straight to the DOM
 * (no React re-renders) and the animation loop sleeps when the cursor stops.
 * Reduced motion: follows the pointer exactly, with no easing.
 */
"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const SIZE = 40; // px — circle diameter
const COLOR = "#e6c3ff"; // lavender: dark bg stays lavender, white text inverts to dark green
// Soft glow: lavender core halo + wider magenta haze. Tweak the blur/alpha to taste.
const GLOW = "0 0 15px 2px rgba(230,195,255,0.55), 0 0 26px 8px rgba(212,77,240,0.35)";
const HIDE_SCALE = 0.4; // how far it shrinks while fading out over clickable things
const PRESS_SCALE = 0.8;

const CLICKABLE =
  'a, button, [role="button"], [role="link"], [role="tab"], [role="menuitem"], input, textarea, select, label, summary, [onclick], [data-cursor="hover"]';

const isClickable = (t: EventTarget | null) => {
  if (!(t instanceof Element)) return false;
  if (t.closest(CLICKABLE)) return true;
  // catches clickable cards/divs styled with cursor-pointer
  return getComputedStyle(t).cursor === "pointer";
};

export default function CursorExclusion() {
  const ref = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  // Decide after mount so server and first client render match.
  useEffect(() => {
    setEnabled(window.matchMedia("(hover: hover) and (pointer: fine)").matches);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;

    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let tx = -100;
    let ty = -100;
    let x = tx;
    let y = ty;
    let scale = 1;
    let targetScale = 1;
    let hovering = false; // over something clickable
    let pressed = false;
    let seen = false; // pointer has moved at least once
    let outside = false; // pointer left the window
    let raf = 0;

    const apply = () => {
      el.style.transform = `translate3d(${x - SIZE / 2}px, ${y - SIZE / 2}px, 0) scale(${scale})`;
    };

    const tick = () => {
      raf = 0;
      if (smooth) {
        x += (tx - x) * 0.2;
        y += (ty - y) * 0.2;
        scale += (targetScale - scale) * 0.18;
      } else {
        x = tx;
        y = ty;
        scale = targetScale;
      }
      apply();
      const settled =
        Math.abs(tx - x) < 0.1 && Math.abs(ty - y) < 0.1 && Math.abs(targetScale - scale) < 0.005;
      if (!settled) raf = requestAnimationFrame(tick);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const refresh = () => {
      el.style.opacity = seen && !outside && !hovering ? "1" : "0";
      targetScale = (hovering ? HIDE_SCALE : 1) * (pressed ? PRESS_SCALE : 1);
      kick();
    };

    let lastTarget: EventTarget | null = null;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      tx = e.clientX;
      ty = e.clientY;
      outside = false;
      if (!seen) {
        // first movement: appear in place instead of flying in from the corner
        seen = true;
        x = tx;
        y = ty;
      }
      if (e.target !== lastTarget) {
        lastTarget = e.target;
        hovering = isClickable(e.target);
      }
      refresh();
    };
    const onDown = () => {
      pressed = true;
      refresh();
    };
    const onUp = () => {
      pressed = false;
      refresh();
    };
    const onLeave = () => {
      outside = true;
      refresh();
    };
    const onEnter = () => {
      outside = false;
      refresh();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.documentElement.addEventListener("mouseleave", onLeave);
    document.documentElement.addEventListener("mouseenter", onEnter);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.documentElement.removeEventListener("mouseenter", onEnter);
    };
  }, [enabled]);

  if (!enabled) return null;

  // Portal to <body> so the blend always sees the whole page, wherever this
  // component is placed (a parent with transform/opacity/isolation would
  // otherwise trap the blend and make the circle look like a flat colour).
  return createPortal(
    <div
      ref={ref}
      aria-hidden
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: SIZE,
        height: SIZE,
        borderRadius: "9999px",
        backgroundColor: COLOR,
        boxShadow: GLOW,
        mixBlendMode: "exclusion",
        pointerEvents: "none",
        zIndex: 9999,
        opacity: 0,
        transform: "translate3d(-100px, -100px, 0)",
        transition: "opacity 160ms ease",
        willChange: "transform",
      }}
    />,
    document.body,
  );
}