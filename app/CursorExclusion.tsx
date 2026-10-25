"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const SIZE = 40;
const COLOR = "#e6c3ff";

const GLOW =
  "0 0 15px 2px rgba(230,195,255,0.5), 0 0 24px 6px rgba(212,77,240,0.25)";

const HIDE_SCALE = 0.4;
const PRESS_SCALE = 0.8;

const CLICKABLE = [
  "a",
  "button",
  '[role="button"]',
  '[role="link"]',
  '[role="tab"]',
  '[role="menuitem"]',
  "input",
  "textarea",
  "select",
  "label",
  "summary",
  "[onclick]",
  "[data-cursor='hover']",
].join(",");

/**
 * Detect interactive elements, including nested icons and custom cards.
 */
function isClickable(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;

  if (target.closest(CLICKABLE)) return true;

  // Walk ancestors to find custom cursor:pointer elements.
  let element: Element | null = target;

  while (element && element !== document.documentElement) {
    if (getComputedStyle(element).cursor === "pointer") {
      return true;
    }

    element = element.parentElement;
  }

  return false;
}

export default function CursorExclusion() {
  const ref = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  // Hydration-safe: enable only after mounting.
  useEffect(() => {
    const media = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    );

    const update = () => setEnabled(media.matches);

    update();
    media.addEventListener("change", update);

    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const el = ref.current;
    if (!el) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    let smooth = !reducedMotion.matches;

    const onMotionPreferenceChange = () => {
      smooth = !reducedMotion.matches;
      kick();
    };

    reducedMotion.addEventListener(
      "change",
      onMotionPreferenceChange,
    );

    let tx = -SIZE * 2;
    let ty = -SIZE * 2;
    let x = tx;
    let y = ty;

    let scale = 1;
    let targetScale = 1;

    let hovering = false;
    let pressed = false;
    let seen = false;
    let outside = false;

    let raf = 0;
    let lastFrameTime = 0;
    let lastTarget: EventTarget | null = null;

    const apply = () => {
      el.style.transform =
        `translate3d(${x - SIZE / 2}px, ${y - SIZE / 2}px, 0) ` +
        `scale(${scale})`;
    };

    const tick = (time: number) => {
      raf = 0;

      if (document.hidden) {
        lastFrameTime = 0;
        return;
      }

      const dt = lastFrameTime
        ? Math.min(time - lastFrameTime, 32)
        : 16.667;

      lastFrameTime = time;

      const positionAlpha = smooth
        ? 1 - Math.pow(0.8, dt / 16.667)
        : 1;

      const scaleAlpha = smooth
        ? 1 - Math.pow(0.82, dt / 16.667)
        : 1;

      x += (tx - x) * positionAlpha;
      y += (ty - y) * positionAlpha;
      scale += (targetScale - scale) * scaleAlpha;

      const settled =
        Math.abs(tx - x) < 0.1 &&
        Math.abs(ty - y) < 0.1 &&
        Math.abs(targetScale - scale) < 0.005;

      if (settled) {
        // Snap to exact targets and let the animation sleep.
        x = tx;
        y = ty;
        scale = targetScale;
      }

      apply();

      if (settled) {
        lastFrameTime = 0;
      } else {
        raf = requestAnimationFrame(tick);
      }
    };

    function kick() {
      if (!raf && !document.hidden) {
        raf = requestAnimationFrame(tick);
      }
    }

    const refresh = () => {
      el.style.opacity =
        seen && !outside && !hovering ? "1" : "0";

      targetScale =
        (hovering ? HIDE_SCALE : 1) *
        (pressed ? PRESS_SCALE : 1);

      kick();
    };

    const updateHover = (target: EventTarget | null) => {
      lastTarget = target;
      hovering = isClickable(target);
    };

    const onMove = (e: PointerEvent) => {
      // Only track a real mouse, not touch or pen input.
      if (e.pointerType !== "mouse") return;

      tx = e.clientX;
      ty = e.clientY;
      outside = false;

      if (!seen) {
        seen = true;
        x = tx;
        y = ty;
        apply();
      }

      // Re-check when the actual event target changes.
      if (e.target !== lastTarget) {
        updateHover(e.target);
      }

      refresh();
    };

    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;

      pressed = true;
      refresh();
    };

    const onUp = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;

      pressed = false;
      refresh();
    };

    const onCancel = () => {
      pressed = false;
      refresh();
    };

    const onLeave = () => {
      outside = true;
      pressed = false;
      refresh();
    };

    const onEnter = () => {
      outside = false;
      refresh();
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        if (raf) cancelAnimationFrame(raf);

        raf = 0;
        lastFrameTime = 0;
        pressed = false;
        outside = true;
        refresh();
      } else {
        outside = true;
        refresh();
      }
    };

    window.addEventListener("pointermove", onMove, {
      passive: true,
    });

    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);

    document.documentElement.addEventListener(
      "mouseleave",
      onLeave,
    );

    document.documentElement.addEventListener(
      "mouseenter",
      onEnter,
    );

    document.addEventListener(
      "visibilitychange",
      onVisibilityChange,
    );

    return () => {
      if (raf) cancelAnimationFrame(raf);

      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);

      document.documentElement.removeEventListener(
        "mouseleave",
        onLeave,
      );

      document.documentElement.removeEventListener(
        "mouseenter",
        onEnter,
      );

      document.removeEventListener(
        "visibilitychange",
        onVisibilityChange,
      );

      reducedMotion.removeEventListener(
        "change",
        onMotionPreferenceChange,
      );
    };
  }, [enabled]);

  if (!enabled) return null;

  return createPortal(
    <div
      ref={ref}
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: SIZE,
        height: SIZE,
        borderRadius: "50%",
        backgroundColor: COLOR,
        boxShadow: GLOW,
        mixBlendMode: "exclusion",
        pointerEvents: "none",
        zIndex: 9999,
        opacity: 0,
        transform: "translate3d(-100px, -100px, 0) scale(1)",
        transition: "opacity 140ms ease",
        willChange: "transform",
      }}
    />,
    document.body,
  );
}