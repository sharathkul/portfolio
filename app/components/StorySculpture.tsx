"use client";

import { useEffect, useRef } from "react";
import styles from "./StoryArt.module.css";

type Chapter = "hero" | "operations" | "building" | "clients";
type Interaction = { x: number; y: number };
type Sculpture = {
  resize: (width: number, height: number) => void;
  update: (progress: number, reducedMotion: boolean, interaction?: Interaction) => void;
  dispose: () => void;
};
type ProgressEvent = CustomEvent<{ progress: number; reducedMotion: boolean; interaction?: Interaction }>;

export default function StorySculpture({ chapter, onReady, className = "" }: { chapter: Chapter; onReady: (ready: boolean) => void; className?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const surface = canvas.current;
    const slot = surface?.closest<HTMLElement>("[data-scene]");
    if (!surface || !slot) return;
    let sculpture: Sculpture | undefined;
    let disposed = false;
    let loading = false;
    let contextLost = false;
    let ready = false;
    let visible = false;
    let width = 0;
    let height = 0;
    let progress = Number(slot.style.getPropertyValue("--scene-progress") || (chapter === "hero" ? 0 : 1));
    let interaction = { x: 0, y: 0 };
    let reducedMotion = !!slot.closest(".motion-reduced");

    const fallback = () => {
      sculpture?.dispose();
      sculpture = undefined;
      ready = false;
      surface.dataset.ready = "false";
      onReady(false);
      slot.dataset.sculptureStatus = "fallback";
    };
    const paint = () => {
      if (!sculpture || !visible || document.hidden || contextLost) return;
      try {
        sculpture.update(progress, reducedMotion, interaction);
        if (!ready) {
          ready = true;
          surface.dataset.ready = "true";
          slot.dataset.sculptureStatus = "ready";
          onReady(true);
        }
      } catch { fallback(); }
    };
    const load = async () => {
      if (disposed || sculpture || loading || contextLost || !visible || !width || !height) return;
      loading = true;
      try {
        const { createStorySculpture } = await import("./createStorySculpture");
        if (disposed || !visible) return;
        sculpture = createStorySculpture(surface, chapter);
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
      interaction = detail.interaction ?? { x: 0, y: 0 };
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
    intersection.observe(slot);
    resize.observe(surface);

    return () => {
      disposed = true;
      intersection.disconnect();
      resize.disconnect();
      slot.removeEventListener("scene:progress", onProgress);
      surface.removeEventListener("webglcontextlost", lost);
      surface.removeEventListener("webglcontextrestored", restored);
      document.removeEventListener("visibilitychange", paint);
      sculpture?.dispose();
    };
  }, [chapter, onReady]);

  return <canvas ref={canvas} className={`${styles.sculpture} ${className}`} data-scene-canvas data-ready="false" aria-hidden="true" />;
}
