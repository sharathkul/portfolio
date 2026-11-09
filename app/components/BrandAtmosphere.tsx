"use client";

import { useEffect, useRef } from "react";
import styles from "./BrandAtmosphere.module.css";

export default function BrandAtmosphere({ reducedMotion }: { reducedMotion: boolean }) {
  const element = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const backdrop = element.current;
    if (!backdrop) return;

    let frame = 0;
    let attached = false;
    let viewportWidth = window.innerWidth;
    let viewportHeight = window.innerHeight;
    let pointerX = 0;
    let pointerY = 0;
    const desktop = window.matchMedia("(min-width: 961px) and (hover: hover) and (pointer: fine)");

    const paint = () => {
      frame = 0;
      if (document.hidden) return;
      backdrop.style.setProperty("--brand-pointer-x", pointerX.toFixed(4));
      backdrop.style.setProperty("--brand-pointer-y", pointerY.toFixed(4));
    };
    const request = () => {
      if (!frame && attached && !document.hidden) frame = requestAnimationFrame(paint);
    };
    const reset = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      pointerX = 0;
      pointerY = 0;
      backdrop.style.setProperty("--brand-pointer-x", "0");
      backdrop.style.setProperty("--brand-pointer-y", "0");
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      pointerX = Math.min(.5, Math.max(-.5, event.clientX / Math.max(1, viewportWidth) - .5));
      pointerY = Math.min(.5, Math.max(-.5, event.clientY / Math.max(1, viewportHeight) - .5));
      request();
    };
    const leave = (event: PointerEvent) => {
      if (event.relatedTarget === null) reset();
    };
    const resize = () => {
      viewportWidth = window.innerWidth;
      viewportHeight = window.innerHeight;
      reset();
    };
    const visibility = () => {
      // Keep the same neutral pose when a tab is hidden and restored.
      reset();
    };
    const detach = () => {
      if (attached) {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerout", leave);
        window.removeEventListener("blur", reset);
        window.removeEventListener("resize", resize);
        document.removeEventListener("visibilitychange", visibility);
      }
      attached = false;
      backdrop.dataset.brandMotion = "idle";
      reset();
    };
    const configure = () => {
      detach();
      if (reducedMotion || !desktop.matches) return;
      viewportWidth = window.innerWidth;
      viewportHeight = window.innerHeight;
      attached = true;
      backdrop.dataset.brandMotion = "active";
      window.addEventListener("pointermove", move, { passive: true });
      window.addEventListener("pointerout", leave, { passive: true });
      window.addEventListener("blur", reset);
      window.addEventListener("resize", resize, { passive: true });
      document.addEventListener("visibilitychange", visibility);
    };

    configure();
    desktop.addEventListener("change", configure);
    return () => {
      desktop.removeEventListener("change", configure);
      detach();
    };
  }, [reducedMotion]);

  return (
    <div ref={element} className={styles.atmosphere} data-brand-atmosphere data-brand-motion="idle" aria-hidden="true">
      <div className={styles.space}>
        <div className={`${styles.frame} ${styles.left}`}>
          <span className={styles.edge} />
          <span className={styles.face} />
          <span className={styles.rim} />
        </div>
        <div className={`${styles.frame} ${styles.right}`}>
          <span className={styles.edge} />
          <span className={styles.face} />
          <span className={styles.rim} />
        </div>
      </div>
    </div>
  );
}
