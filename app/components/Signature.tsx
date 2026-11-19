"use client";

import { useEffect, useRef } from "react";
import ThreadOrb from "./ThreadOrb";
import styles from "./Signature.module.css";

const signature = [
  "M70 18 C57 16 43 21 36 30 C26 44 39 47 50 49",
  "C65 52 69 59 58 68 C48 77 28 82 22 75 C17 68 24 58 36 57",
  "C52 55 69 61 81 52 C91 45 101 28 98 25 C93 21 83 53 76 74",
  "C80 64 86 55 94 49 C101 42 111 35 119 30 C126 26 130 26 124 32",
  "C117 40 103 47 94 49 C103 46 108 59 115 65 C128 75 143 62 160 62",
].join(" ");

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const ease = (t: number) => t * t * (3 - 2 * t);

export default function Signature({ reducedMotion }: { reducedMotion: boolean }) {
  const wrapper = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = wrapper.current;
    if (!root) return;
    const ink = root.querySelector<SVGPathElement>("[data-signature-ink]")!;
    const nib = root.querySelector<SVGGElement>("[data-signature-nib]")!;
    const bead = nib.querySelector<SVGGElement>("[data-thread-orb]")!;
    const glint = bead.querySelector<SVGGElement>("[data-orb-glint]")!;
    const button = root.querySelector<HTMLButtonElement>("button")!;
    const length = ink.getTotalLength();
    let scrollProgress = clamp(Number(root.dataset.signatureProgress) || 0);
    let frame = 0;

    function paint(progress: number) {
      const point = ink.getPointAtLength(progress * length);
      ink.style.strokeDashoffset = String(1 - progress);
      ink.style.visibility = progress > 0 ? "visible" : "hidden";
      nib.setAttribute("transform", `translate(${point.x} ${point.y})`);
      bead.setAttribute("visibility", progress > 0 || frame ? "visible" : "hidden");
      glint.setAttribute("transform", `rotate(${(length * progress * 1.5) % 360})`);
      root.dataset.signatureInk = progress.toFixed(5);
    }

    function rest() {
      cancelAnimationFrame(frame);
      frame = 0;
      delete root.dataset.signatureReplaying;
      button.removeAttribute("aria-disabled");
      button.hidden = reducedMotion || scrollProgress < 1;
      paint(reducedMotion ? 1 : scrollProgress);
    }

    function followScroll(event: Event) {
      const value = (event as CustomEvent<number>).detail;
      if (!Number.isFinite(value)) return;
      const next = clamp(value);
      if (next === scrollProgress) return;
      scrollProgress = next;
      rest();
    }

    function replay() {
      if (frame || reducedMotion || scrollProgress < 1) return;
      const start = performance.now();
      root.dataset.signatureReplaying = "true";
      button.setAttribute("aria-disabled", "true");
      function write(now: number) {
        const ms = now - start;
        if (ms >= 2050) { rest(); return; }
        // A quick rewind, a beat at the entry, then a slower pen stroke.
        paint(ms < 680 ? 1 - ease(clamp(ms / 680)) : ease(clamp((ms - 780) / 1270)));
        frame = requestAnimationFrame(write);
      }
      frame = requestAnimationFrame(write);
    }

    const resize = new ResizeObserver(([entry]) => {
      // The leading bead is 17.8 CSS pixels along the incoming page thread.
      // Keep that physical size through the handoff on small screens.
      const scale = entry.contentRect.width / 180;
      if (scale > 0) bead.setAttribute("transform", `scale(${1 / scale})`);
    });
    resize.observe(root);
    const visibility = () => { if (document.hidden && frame) rest(); };
    const intersection = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting && frame) rest();
    });
    intersection.observe(root);
    root.addEventListener("thread:signature-progress", followScroll);
    document.addEventListener("visibilitychange", visibility);
    button.addEventListener("click", replay);
    rest();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      intersection.disconnect();
      delete root.dataset.signatureReplaying;
      root.removeEventListener("thread:signature-progress", followScroll);
      document.removeEventListener("visibilitychange", visibility);
      button.removeEventListener("click", replay);
    };
  }, [reducedMotion]);

  return <div id="signature" ref={wrapper} className={styles.signature} data-signature="">
    <svg viewBox="0 0 180 96" className={styles.drawing} role="img" aria-label="Sharath Kulkarni’s initials, SK, drawn by the thread">
      <circle data-signature-entry="" cx="70" cy="18" r=".1" fill="none" />
      <path data-signature-ink="" d={signature} pathLength="1" strokeDasharray="1 1"
        fill="none" stroke="var(--thread-ink)" strokeWidth="2.85" strokeLinecap="round" strokeLinejoin="round" />
      <g data-signature-nib="" transform="translate(160 62)"><ThreadOrb /></g>
    </svg>
    <button type="button" className={styles.replay} hidden data-signature-replay=""
      aria-label="Sign SK again" title="Sign SK again">
      <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" fill="none"
        stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3.4 6.1A5 5 0 1 1 4.3 12M3.2 2.7v3.8H7" />
      </svg>
    </button>
  </div>;
}
