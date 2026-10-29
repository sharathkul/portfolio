"use client";

import { useEffect, useId, useRef } from "react";
import styles from "./HeroAtmosphere.module.css";

type Props = { reducedMotion: boolean };

export default function HeroAtmosphere({ reducedMotion }: Props) {
  const element = useRef<HTMLDivElement>(null);
  const id = `hero-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  useEffect(() => {
    const backdrop = element.current;
    const hero = backdrop?.closest("section");
    if (!backdrop || !hero) return;

    let frame = 0;
    let pointerX = 0;
    let pointerY = 0;
    const reset = () => {
      backdrop.style.setProperty("--hero-lift", "0px");
      backdrop.style.setProperty("--hero-turn", "0deg");
      backdrop.style.setProperty("--hero-pointer-x", "0px");
      backdrop.style.setProperty("--hero-pointer-y", "0px");
    };

    reset();
    if (reducedMotion) return;

    const render = () => {
      frame = 0;
      if (document.hidden) return;
      const bounds = hero.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, -bounds.top / Math.max(1, bounds.height)));
      backdrop.style.setProperty("--hero-lift", `${progress * 54}px`);
      backdrop.style.setProperty("--hero-turn", `${progress * -7}deg`);
      backdrop.style.setProperty("--hero-pointer-x", `${pointerX * 8}px`);
      backdrop.style.setProperty("--hero-pointer-y", `${pointerY * 6}px`);
    };
    const request = () => {
      if (!frame && !document.hidden) frame = window.requestAnimationFrame(render);
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const bounds = hero.getBoundingClientRect();
      pointerX = (event.clientX - bounds.left) / bounds.width - 0.5;
      pointerY = (event.clientY - bounds.top) / bounds.height - 0.5;
      request();
    };
    const leave = () => {
      pointerX = 0;
      pointerY = 0;
      request();
    };
    const observer = new ResizeObserver(request);
    observer.observe(hero);
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request, { passive: true });
    hero.addEventListener("pointermove", move, { passive: true });
    hero.addEventListener("pointerleave", leave);
    document.addEventListener("visibilitychange", request);
    request();

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
      hero.removeEventListener("pointermove", move);
      hero.removeEventListener("pointerleave", leave);
      document.removeEventListener("visibilitychange", request);
      reset();
    };
  }, [reducedMotion]);

  return (
    <div ref={element} className={styles.atmosphere} aria-hidden="true">
      <div className={styles.portraitField}>
        <svg className={styles.sculpture} viewBox="0 0 720 760" fill="none" focusable="false">
          <defs>
            <linearGradient id={`${id}-porcelain`} x1="116" y1="127" x2="456" y2="519" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFFFFF" />
              <stop offset=".35" stopColor="#EDF0F6" />
              <stop offset=".74" stopColor="#D7E0EF" />
              <stop offset="1" stopColor="#F4F2EC" />
            </linearGradient>
            <linearGradient id={`${id}-edge`} x1="76" y1="343" x2="505" y2="183" gradientUnits="userSpaceOnUse">
              <stop stopColor="#B4C3DC" />
              <stop offset=".45" stopColor="#D2DDEC" />
              <stop offset="1" stopColor="#A5B9DF" />
            </linearGradient>
            <linearGradient id={`${id}-blue`} x1="112" y1="525" x2="141" y2="447" gradientUnits="userSpaceOnUse">
              <stop stopColor="#3156CE" />
              <stop offset="1" stopColor="#7590DF" />
            </linearGradient>
            <linearGradient id={`${id}-glass`} x1="505" y1="167" x2="579" y2="252" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFFFFF" stopOpacity=".92" />
              <stop offset="1" stopColor="#D5DFF1" stopOpacity=".7" />
            </linearGradient>
            <linearGradient id={`${id}-tile`} x1="91" y1="600" x2="196" y2="663" gradientUnits="userSpaceOnUse">
              <stop stopColor="#E8EEF9" />
              <stop offset="1" stopColor="#BDCDE9" />
            </linearGradient>
          </defs>

          <g className={styles.arch}>
            <path d="M124 537C58 463 44 375 75 288C109 192 191 128 292 122C389 116 477 162 519 244L486 262C449 190 373 151 294 158C209 165 143 220 116 300C93 369 104 449 151 511Z" fill={`url(#${id}-edge)`} opacity=".65" transform="translate(1 10)" />
            <path d="M124 537C58 463 44 375 75 288C109 192 191 128 292 122C389 116 477 162 519 244L486 262C449 190 373 151 294 158C209 165 143 220 116 300C93 369 104 449 151 511Z" fill={`url(#${id}-porcelain)`} />
            <path d="M125 532C62 460 49 373 80 290C113 198 192 135 292 128C386 122 470 168 511 243" stroke="white" strokeOpacity=".8" strokeWidth="1.8" />
            <path d="M124 537C102 512 86 486 77 457L111 445C120 470 133 492 151 511Z" fill={`url(#${id}-blue)`} />
            <path d="M124 537L125 546L151 521L151 511Z" fill="#2849AD" opacity=".8" />
          </g>

          <g className={styles.upperTile}>
            <path d="m514 171 58 19-13 68-58-19Z" fill="#C0CEE4" fillOpacity=".68" transform="translate(3 7)" />
            <path d="m514 171 58 19-13 68-58-19Z" fill={`url(#${id}-glass)`} stroke="#FFFFFF" strokeWidth="1.4" />
            <path d="m519 178 45 15-2 10-45-15Z" fill="#F8FAFC" fillOpacity=".7" />
            <path d="m530 206 16 5-4 20-16-5Z" fill="#3156CE" fillOpacity=".38" />
          </g>

          <g className={styles.lowerTile}>
            <path d="m101 599 91 18-28 42-91-18Z" fill="#A6BADD" fillOpacity=".42" transform="translate(0 8)" />
            <path d="m101 599 91 18-28 42-91-18Z" fill={`url(#${id}-tile)`} stroke="#F9FBFE" strokeWidth="1.6" />
            <path d="m98 611 65 13-16 23-65-13Z" fill="#F4F6FA" fillOpacity=".62" />
          </g>

          <g className={styles.nodes}>
            <path d="M73 218c0-7 6-12 13-12s13 5 13 12-6 12-13 12-13-5-13-12Z" fill="#C2CFE7" />
            <ellipse cx="85" cy="215" rx="12" ry="10" fill="#F6F8FB" />
            <path d="m541 511 12-6 13 8-12 6Z" fill="#8099CD" fillOpacity=".65" />
            <path d="m541 511 13 8v12l-13-8Z" fill="#B3C4E1" />
            <path d="m554 519 12-6v12l-12 6Z" fill="#DCE5F3" />
          </g>
        </svg>
      </div>
      <svg className={styles.cornerDetail} viewBox="0 0 160 160" fill="none" focusable="false">
        <path d="M30 118C5 80 25 30 68 23C111 16 144 53 130 91" stroke="#DAE3F3" strokeWidth="13" />
        <path d="M30 118C5 80 25 30 68 23C111 16 144 53 130 91" stroke="#FFFFFF" strokeOpacity=".75" strokeWidth="1.4" transform="translate(-2 -4)" />
        <path d="M130 91c-3 9-9 16-16 22" stroke="#3156CE" strokeOpacity=".32" strokeWidth="13" />
      </svg>
    </div>
  );
}
