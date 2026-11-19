"use client";

import { useEffect, useRef } from "react";
import type { SculptureChapter, SculptureInteraction, StorySculpture as Sculpture, ThreadProjection } from "./createStorySculpture";
import styles from "./StoryArt.module.css";

type ProgressEvent = CustomEvent<{ progress: number; reducedMotion: boolean; interaction?: SculptureInteraction }>;

export default function StorySculpture({ chapter, onReady, className = "" }: { chapter: SculptureChapter; onReady: (ready: boolean) => void; className?: string }) {
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
    let progress = Number(slot.style.getPropertyValue("--scene-progress") || 1);
    let interaction = { x: 0, y: 0 };
    let reducedMotion = !!slot.closest(".motion-reduced");
    const mechanism = { building: "bridge", clients: "practice", operations: null }[chapter];
    const progressKey = mechanism + "Progress";
    const projectionKey = mechanism + "Projection";
    const progressEvent = "thread:" + mechanism + "-progress";
    let previousProjection: string | undefined;
    let previousMechanismProjection: string | undefined;
    let mechanismProgress = mechanism ? Number(slot.dataset[progressKey] || 0) : 0;

    const shareMechanismProjection = (points: ThreadProjection | null) => {
      if (!mechanism) return;
      const next = points ? JSON.stringify(points) : undefined;
      if (next === previousMechanismProjection) return;
      previousMechanismProjection = next;
      if (next) slot.dataset[projectionKey] = next;
      else delete slot.dataset[projectionKey];
      slot.dispatchEvent(new CustomEvent("thread:" + mechanism + "-layout", { bubbles: true, detail: points }));
    };

    const shareProjection = (points: ThreadProjection | null) => {
      const next = points ? JSON.stringify(points) : undefined;
      if (next === previousProjection) return;
      previousProjection = next;
      if (next) slot.dataset.threadProjection = next;
      else delete slot.dataset.threadProjection;
      slot.dispatchEvent(new CustomEvent("thread:projection", { bubbles: true, detail: points }));
    };

    const fallback = () => {
      sculpture?.dispose();
      sculpture = undefined;
      ready = false;
      surface.dataset.ready = "false";
      onReady(false);
      slot.dataset.sculptureStatus = "fallback";
      shareMechanismProjection(null);
      shareProjection(null);
    };
    const paint = () => {
      if (!sculpture || !visible || document.hidden || contextLost) return;
      try {
        sculpture.update(progress, reducedMotion, interaction, mechanismProgress);
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
        sculpture = createStorySculpture(surface, chapter, shareProjection, shareMechanismProjection);
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
    const onMechanismProgress = (event: Event) => {
      const next = (event as CustomEvent<number>).detail;
      if (!Number.isFinite(next) || next === mechanismProgress) return;
      mechanismProgress = next;
      if (!ready || !visible || contextLost || document.hidden) return;
      try { sculpture?.updateMechanism(mechanismProgress, reducedMotion); }
      catch { fallback(); }
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
    if (mechanism) slot.addEventListener(progressEvent, onMechanismProgress);
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
      if (mechanism) slot.removeEventListener(progressEvent, onMechanismProgress);
      surface.removeEventListener("webglcontextlost", lost);
      surface.removeEventListener("webglcontextrestored", restored);
      document.removeEventListener("visibilitychange", paint);
      sculpture?.dispose();
      shareMechanismProjection(null);
      shareProjection(null);
    };
  }, [chapter, onReady]);

  return <canvas ref={canvas} className={`${styles.sculpture} ${className}`} data-scene-canvas data-ready="false" aria-hidden="true" />;
}
