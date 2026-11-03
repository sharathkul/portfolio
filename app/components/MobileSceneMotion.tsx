"use client";

import { useEffect, useRef } from "react";

type Scene = {
  element: HTMLElement;
  packet: SVGElement | null;
  top: number;
  height: number;
  visible: boolean;
  progress: number;
  reducedMotion: boolean | null;
};

const clamp = (value: number) => Math.min(1, Math.max(0, value));

export default function MobileSceneMotion({ reducedMotion }: { reducedMotion: boolean }) {
  const paused = useRef(reducedMotion);
  const invalidate = useRef<() => void>(() => {});

  useEffect(() => {
    paused.current = reducedMotion;
    invalidate.current();
  }, [reducedMotion]);

  useEffect(() => {
    const story = document.getElementById("story");
    const hero = document.getElementById("start");
    const atmosphere = hero?.querySelector<HTMLElement>("[data-hero-atmosphere]");
    if (!story || !hero) return;

    const media = window.matchMedia("(max-width: 760px)");
    const scenes: Scene[] = Array.from(story.querySelectorAll<HTMLElement>("[data-story-art]"))
      .map(element => ({ element, packet: element.querySelector<SVGElement>("[data-motion-part='packet']"), top: 0, height: 1, visible: false, progress: -1, reducedMotion: null }));
    let frame = 0;
    let measureFrame = 0;
    let disposed = false;
    let layoutWidth = window.innerWidth;
    let viewportHeight = window.innerHeight;
    let heroTop = 0;
    let heroHeight = 1;
    let heroVisible = true;
    let heroProgress = -1;

    const render = (all = false) => {
      frame = 0;
      if (disposed || document.hidden || !media.matches) return;
      const scroll = window.scrollY;
      const reduced = paused.current;

      for (const scene of scenes) {
        if (!all && !scene.visible && !reduced) continue;
        const progress = reduced ? 1 : clamp(
          (scroll + viewportHeight * .92 - scene.top) / (viewportHeight * .74 + scene.height),
        );
        if (Math.abs(progress - scene.progress) < .0005 && scene.reducedMotion === reduced) continue;
        scene.progress = progress;
        scene.reducedMotion = reduced;
        scene.element.style.setProperty("--scene-progress", progress.toFixed(4));
        scene.element.dispatchEvent(new CustomEvent("scene:progress", { detail: { progress, reducedMotion: reduced } }));

        if (scene.packet) {
          const t = clamp((progress - .28) / .6);
          const q = 1 - t;
          // Follow the same curve already joining the two client folders.
          const x = q * q * q * -72 + 3 * q * q * t * -11 + 3 * q * t * t * 52 + t * t * t * 105;
          const y = q * q * q * -20 + 3 * q * q * t * -104 + 3 * q * t * t * 98 + t * t * t * 24;
          const opacity = reduced ? 0 : clamp(Math.min(t * 7, (1 - t) * 7));
          scene.element.style.setProperty("--packet-opacity", opacity.toFixed(4));
          scene.packet.setAttribute("transform", `translate(${x.toFixed(2)} ${y.toFixed(2)})`);
        }
      }

      if (atmosphere && (all || heroVisible || reduced)) {
        const depth = reduced ? 0 : clamp((scroll - heroTop) / (heroHeight * .72));
        if (Math.abs(depth - heroProgress) >= .0005) {
          heroProgress = depth;
          atmosphere.style.setProperty("--hero-depth", depth.toFixed(4));
        }
      }
    };

    const request = () => {
      if (!frame && !disposed && !paused.current && media.matches && !document.hidden) {
        frame = requestAnimationFrame(() => render());
      }
    };
    invalidate.current = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => render(true));
    };

    const measure = () => {
      measureFrame = 0;
      if (disposed || !media.matches) return;
      const scroll = window.scrollY;
      // Read layout together, only after an actual layout or width change.
      const bounds = scenes.map(scene => scene.element.getBoundingClientRect());
      const heroBounds = hero.getBoundingClientRect();
      viewportHeight = window.innerHeight;
      scenes.forEach((scene, index) => {
        scene.top = bounds[index].top + scroll;
        scene.height = bounds[index].height;
        scene.progress = -1;
      });
      heroTop = heroBounds.top + scroll;
      heroHeight = heroBounds.height;
      heroProgress = -1;
      render(true);
    };
    const scheduleMeasure = () => {
      if (!measureFrame && !disposed) measureFrame = requestAnimationFrame(measure);
    };
    const resize = () => {
      if (window.innerWidth !== layoutWidth) {
        layoutWidth = window.innerWidth;
        scheduleMeasure();
      }
    };
    const visibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(frame);
        frame = 0;
      } else invalidate.current();
    };
    const intersection = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.target === hero) heroVisible = entry.isIntersecting;
        else {
          const scene = scenes.find(item => item.element === entry.target);
          if (scene) scene.visible = entry.isIntersecting;
        }
      }
      request();
    }, { rootMargin: "80px 0px" });
    scenes.forEach(scene => intersection.observe(scene.element));
    intersection.observe(hero);
    const observer = new ResizeObserver(scheduleMeasure);
    observer.observe(story);
    scenes.forEach(scene => observer.observe(scene.element));
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", resize, { passive: true });
    media.addEventListener("change", scheduleMeasure);
    document.addEventListener("visibilitychange", visibility);
    document.fonts.ready.then(() => { if (!disposed) scheduleMeasure(); });
    scheduleMeasure();

    return () => {
      disposed = true;
      invalidate.current = () => {};
      cancelAnimationFrame(frame);
      cancelAnimationFrame(measureFrame);
      intersection.disconnect();
      observer.disconnect();
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", resize);
      media.removeEventListener("change", scheduleMeasure);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);

  return null;
}
