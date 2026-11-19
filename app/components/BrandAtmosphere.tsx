"use client";

import { useEffect, useRef, useState } from "react";
import PaperRelief from "./PaperRelief";
import styles from "./BrandAtmosphere.module.css";

const chapters = [
  { id: "start", split: 0, register: 0, branches: 0, settle: 0 },
  { id: "operations", split: 1, register: 0, branches: 0, settle: 0 },
  { id: "building", split: 0, register: 1, branches: 0, settle: 0 },
  { id: "clients", split: 0, register: 1, branches: 1, settle: 0 },
  { id: "journey", split: 0, register: 1, branches: 1, settle: 1 },
] as const;

const axes = ["split", "register", "branches", "settle"] as const;
const seams = [0, 1, 2] as const;
const mainLine = "M36 144 H105 C143 144 142 101 184 101 H237 C278 101 277 147 318 147 H408 C439 147 441 117 472 117 H556 C588 117 587 144 620 144 H714";

// Print the same drawing across three sheets. Separating the sheets physically
// breaks the line. Bringing their edges together registers the drawing again.
function Drawing({ sheet }: { sheet: number }) {
  return (
    <svg className={styles.drawing} viewBox={`${sheet * 300} 0 300 240`} preserveAspectRatio="none" focusable="false">
      <path d={mainLine} className={styles.trace} />
      {sheet === 0 && <circle cx="36" cy="144" r="4" className={styles.startDot} />}
      {sheet === 2 && <g className={styles.network}>
        <path d="M714 144 C748 144 731 55 774 55 H852" pathLength="1" />
        <path d="M714 144 C750 144 745 109 788 109 H875" pathLength="1" />
        <path d="M714 144 C750 144 745 161 788 161 H850" pathLength="1" />
        <path d="M714 144 C748 144 732 207 774 207 H876" pathLength="1" />
        <g className={styles.endpoints}>
          <circle cx="852" cy="55" r="4" /><circle cx="875" cy="109" r="4" />
          <circle cx="850" cy="161" r="4" /><circle cx="876" cy="207" r="4" />
        </g>
      </g>}
    </svg>
  );
}

export default function BrandAtmosphere({ reducedMotion }: { reducedMotion: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const [relief, setRelief] = useState(false);

  useEffect(() => {
    setRelief(new URLSearchParams(window.location.search).get("backdrop") === "relief");
  }, []);

  useEffect(() => {
    const element = host.current;
    if (!element || reducedMotion) return;
    const sections = chapters.map(chapter => document.getElementById(chapter.id));
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    let width = window.innerWidth;
    let height = window.innerHeight;
    let starts: number[] = [];
    let span = 1;
    let pointerX = 0;
    let pointerY = 0;
    let lastScroll = -1;
    let frame = 0;

    function paint() {
      frame = 0;
      if (!element || document.hidden) return;
      const scroll = Math.max(0, window.scrollY);
      if (scroll !== lastScroll) {
        lastScroll = scroll;
        let current = 0;
        while (current + 1 < starts.length && scroll >= starts[current + 1]) current++;
        const next = Math.min(current + 1, chapters.length - 1);
        // Hold a finished composition while the visitor reads. Change the
        // drawing during the approach to the following section.
        const distance = starts[next] - starts[current];
        const interval = Math.max(1, Math.min(height * .88, distance));
        const t = next === current ? 0 : Math.min(1, Math.max(0, 1 - (starts[next] - scroll) / interval));
        const mix = t * t * (3 - 2 * t);
        for (const axis of axes) {
          const value = chapters[current][axis] + (chapters[next][axis] - chapters[current][axis]) * mix;
          element.style.setProperty(`--paper-${axis}`, value.toFixed(4));
        }
        element.style.setProperty("--paper-progress", Math.min(1, scroll / span).toFixed(4));
      }
      element.style.setProperty("--paper-pointer-x", pointerX.toFixed(3));
      element.style.setProperty("--paper-pointer-y", pointerY.toFixed(3));
    }

    function requestPaint() {
      if (!frame && !document.hidden) frame = window.requestAnimationFrame(paint);
    }
    function measure() {
      width = window.innerWidth;
      height = window.innerHeight;
      starts = sections.map((section, index) => index === 0 ? 0 :
        (section?.getBoundingClientRect().top ?? 0) + window.scrollY - height * .18);
      span = Math.max(1, document.documentElement.scrollHeight - height);
      lastScroll = -1;
      requestPaint();
    }
    function centerPointer() {
      pointerX = 0;
      pointerY = 0;
      requestPaint();
    }
    function point(event: PointerEvent) {
      if (!finePointer.matches || event.pointerType !== "mouse") return;
      pointerX = (event.clientX / width) * 2 - 1;
      pointerY = (event.clientY / height) * 2 - 1;
      requestPaint();
    }

    const observer = new ResizeObserver(measure);
    sections.forEach(section => { if (section) observer.observe(section); });
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", requestPaint, { passive: true });
    window.addEventListener("pointermove", point, { passive: true });
    document.documentElement.addEventListener("pointerleave", centerPointer);
    window.addEventListener("blur", centerPointer);
    document.addEventListener("visibilitychange", centerPointer);
    finePointer.addEventListener("change", centerPointer);
    measure();

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", requestPaint);
      window.removeEventListener("pointermove", point);
      document.documentElement.removeEventListener("pointerleave", centerPointer);
      window.removeEventListener("blur", centerPointer);
      document.removeEventListener("visibilitychange", centerPointer);
      finePointer.removeEventListener("change", centerPointer);
    };
  }, [reducedMotion]);

  return (
    <div ref={host} className={styles.atmosphere} data-brand-atmosphere data-finish={relief ? "pressed" : "folded"} aria-hidden="true">
      {relief && <PaperRelief />}
      <div className={styles.stage}>
        <div className={styles.spread}>
          {seams.map(sheet => (
            <div key={sheet} className={styles.leaf}>
              <Drawing sheet={sheet} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
