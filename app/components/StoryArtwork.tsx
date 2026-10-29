"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import styles from "./StoryArtwork.module.css";

type Props = { active: number; reducedMotion: boolean };

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** Two aligned illustrations make the change in the work visible. */
export default function StoryArtwork({ active, reducedMotion }: Props) {
  const camera = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = camera.current;
    if (!element) return;
    const reset = () => {
      element.style.setProperty("--art-scroll", "0px");
      element.style.setProperty("--art-drift", "0px");
      element.style.setProperty("--art-tilt-x", "0deg");
      element.style.setProperty("--art-tilt-y", "0deg");
      element.style.setProperty("--art-roll", "0deg");
      element.style.setProperty("--art-depth", "1");
    };
    reset();
    if (reducedMotion || active >= 4) return;

    let frame = 0;
    let disposed = false;
    let mobile = window.innerWidth <= 760;
    let targetScroll = 0;
    let scroll = 0;
    let targetX = 0;
    let targetY = 0;
    let x = 0;
    let y = 0;
    const section = document.querySelectorAll<HTMLElement>("#story > section")[active];

    const render = () => {
      frame = 0;
      if (disposed || document.hidden) return;
      scroll += (targetScroll - scroll) * 0.09;
      x += (targetX - x) * 0.065;
      y += (targetY - y) * 0.065;
      element.style.setProperty("--art-scroll", `${(scroll * (mobile ? 12 : 28)).toFixed(2)}px`);
      element.style.setProperty("--art-drift", `${(x * 10).toFixed(2)}px`);
      element.style.setProperty("--art-tilt-x", `${(-y * 3).toFixed(2)}deg`);
      element.style.setProperty("--art-tilt-y", `${(x * 4).toFixed(2)}deg`);
      element.style.setProperty("--art-roll", `${(scroll * 1.5).toFixed(2)}deg`);
      element.style.setProperty("--art-depth", `${(1 + Math.abs(scroll) * 0.018).toFixed(4)}`);
      if (Math.abs(targetScroll - scroll) > 0.0005 || Math.abs(targetX - x) > 0.0005 || Math.abs(targetY - y) > 0.0005)
        frame = requestAnimationFrame(render);
    };
    const request = () => {
      if (!frame && !disposed && !document.hidden) frame = requestAnimationFrame(render);
    };
    const onScroll = () => {
      if (section) {
        const bounds = section.getBoundingClientRect();
        targetScroll = clamp((bounds.top + bounds.height * 0.5 - window.innerHeight * 0.5) / window.innerHeight, -1, 1);
      }
      request();
    };
    const onPointer = (event: PointerEvent) => {
      if (mobile || event.pointerType !== "mouse") return;
      targetX = clamp(event.clientX / window.innerWidth - 0.5, -0.5, 0.5);
      targetY = clamp(event.clientY / window.innerHeight - 0.5, -0.5, 0.5);
      request();
    };
    const onLeave = () => {
      targetX = 0;
      targetY = 0;
      request();
    };
    const onResize = () => {
      mobile = window.innerWidth <= 760;
      if (mobile) {
        targetX = 0;
        targetY = 0;
      }
      onScroll();
    };
    const onVisibility = () => {
      if (document.hidden && frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      } else onScroll();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("pointermove", onPointer, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);
    onScroll();
    return () => {
      disposed = true;
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointer);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      reset();
    };
  }, [active, reducedMotion]);

  return (
    <div className={styles.scene} data-active={active} data-reduced-motion={reducedMotion} aria-hidden="true">
      <div className={styles.position}>
        <div ref={camera} className={styles.camera}>
          <div className={styles.plate}>
            <Image src="/visuals/connected-work.png" alt="" fill preload sizes="(max-width: 760px) 120vw, (max-width: 1700px) 65vw, 1100px" className={`${styles.image} ${styles.connected}`} />
            <Image src="/visuals/fragmented-work.png" alt="" fill loading="eager" sizes="(max-width: 760px) 120vw, (max-width: 1700px) 65vw, 1100px" className={`${styles.image} ${styles.fragmented}`} />
          </div>
        </div>
      </div>
    </div>
  );
}
