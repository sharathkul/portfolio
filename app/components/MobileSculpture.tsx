"use client";

import { useEffect, useRef } from "react";
import styles from "./MobileStoryArt.module.css";

type Chapter = "operations" | "building" | "clients";
type Sculpture = {
  resize: (width: number, height: number) => void;
  update: (progress: number, reducedMotion: boolean) => void;
  dispose: () => void;
};
type ProgressEvent = CustomEvent<{ progress: number; reducedMotion: boolean }>;

export default function MobileSculpture({ chapter, onReady }: { chapter: Chapter; onReady: (ready: boolean) => void }) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const surface = canvas.current;
    const slot = surface?.closest<HTMLElement>("[data-story-art]");
    if (!surface || !slot) return;
    const media = window.matchMedia("(max-width: 760px)");
    let sculpture: Sculpture | undefined;
    let disposed = false;
    let loading = false;
    let contextLost = false;
    let ready = false;
    let visible = false;
    let width = 0;
    let height = 0;
    let progress = Number(slot.style.getPropertyValue("--scene-progress") || 1);
    let reducedMotion = !!slot.closest(".motion-reduced");

    const fallback = () => {
      sculpture?.dispose();
      sculpture = undefined;
      ready = false;
      onReady(false);
      slot.dataset.sculptureStatus = "fallback";
    };
    const paint = () => {
      if (!sculpture || !visible || !media.matches || document.hidden || contextLost) return;
      try {
        sculpture.update(progress, reducedMotion);
        if (!ready) {
          ready = true;
          slot.dataset.sculptureStatus = "ready";
          onReady(true);
        }
      } catch { fallback(); }
    };
    const load = async () => {
      if (disposed || sculpture || loading || contextLost || !visible || !media.matches || !width || !height) return;
      loading = true;
      try {
        const { createMobileSculpture } = await import("./createMobileSculpture");
        if (disposed || !visible || !media.matches) return;
        sculpture = createMobileSculpture(surface, chapter);
        sculpture.resize(width, height);
        paint();
      } catch {
        // Keep the complete, animated SVG available on devices without WebGL.
        fallback();
      } finally {
        loading = false;
      }
    };
    const onProgress = (event: Event) => {
      const detail = (event as ProgressEvent).detail;
      progress = detail.progress;
      reducedMotion = detail.reducedMotion;
      paint();
    };
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) {
        void load();
        paint();
      }
    }, { rootMargin: "200px 0px" });
    const resize = new ResizeObserver(([entry]) => {
      width = entry.contentRect.width;
      height = entry.contentRect.height;
      if (sculpture && width && height) {
        sculpture.resize(width, height);
        paint();
      } else void load();
    });
    const mode = () => {
      if (media.matches) void load();
      else {
        sculpture?.dispose();
        sculpture = undefined;
        ready = false;
        onReady(false);
      }
    };
    const lost = (event: Event) => {
      event.preventDefault();
      contextLost = true;
      fallback();
    };
    const restored = () => {
      contextLost = false;
      void load();
    };
    slot.addEventListener("scene:progress", onProgress);
    surface.addEventListener("webglcontextlost", lost);
    surface.addEventListener("webglcontextrestored", restored);
    document.addEventListener("visibilitychange", paint);
    media.addEventListener("change", mode);
    intersection.observe(slot);
    resize.observe(slot);

    return () => {
      disposed = true;
      intersection.disconnect();
      resize.disconnect();
      slot.removeEventListener("scene:progress", onProgress);
      surface.removeEventListener("webglcontextlost", lost);
      surface.removeEventListener("webglcontextrestored", restored);
      document.removeEventListener("visibilitychange", paint);
      media.removeEventListener("change", mode);
      sculpture?.dispose();
    };
  }, [chapter, onReady]);

  return <canvas ref={canvas} className={styles.sculpture} data-scene-canvas aria-hidden="true" />;
}
