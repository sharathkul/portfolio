"use client";

import { useEffect, useRef } from "react";

type Scene = {
  element: HTMLElement;
  kind: string;
  packet: SVGElement | null;
  top: number;
  left: number;
  width: number;
  height: number;
  visible: boolean;
  progress: number;
  reducedMotion: boolean | null;
  pointer: { x: number; y: number };
  renderedPointer: { x: number; y: number };
};
const clamp = (value: number) => Math.min(1, Math.max(0, value));
const pointerClamp = (value: number) => Math.min(.5, Math.max(-.5, value));

export default function SceneMotion({ reducedMotion }: { reducedMotion: boolean }) {
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
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const scenes: Scene[] = Array.from(story.querySelectorAll<HTMLElement>("[data-scene]"))
      .map(element => ({ element, kind: element.dataset.scene ?? "", packet: element.querySelector<SVGElement>("[data-motion-part='packet']"), top: 0, left: 0, width: 1, height: 1, visible: false, progress: -1, reducedMotion: null, pointer: { x: 0, y: 0 }, renderedPointer: { x: 0, y: 0 } }));
    let frame = 0;
    let measureFrame = 0;
    let disposed = false;
    let layoutWidth = window.innerWidth;
    let viewportHeight = window.innerHeight;
    let heroTop = 0;
    let heroHeight = 1;

    const render = (all = false) => {
      frame = 0;
      if (disposed || document.hidden) return;
      const scroll = window.scrollY;
      const reduced = paused.current;
      for (const scene of scenes) {
        if (!all && !scene.visible && !reduced) continue;
        const isHero = scene.kind === "hero";
        const progress = reduced ? (isHero ? 0 : 1) : isHero
          ? clamp((scroll - heroTop) / (heroHeight * .72))
          : clamp((scroll + viewportHeight * .92 - scene.top) / (viewportHeight * .74 + scene.height));
        const interaction = reduced || !finePointer.matches ? { x: 0, y: 0 } : scene.pointer;
        if (Math.abs(progress - scene.progress) < .0005 && scene.reducedMotion === reduced
          && Math.abs(interaction.x - scene.renderedPointer.x) < .001 && Math.abs(interaction.y - scene.renderedPointer.y) < .001) continue;
        scene.progress = progress;
        scene.reducedMotion = reduced;
        scene.renderedPointer = { ...interaction };
        scene.element.style.setProperty("--scene-progress", progress.toFixed(4));
        scene.element.style.setProperty("--scene-pointer-x", interaction.x.toFixed(4));
        scene.element.style.setProperty("--scene-pointer-y", interaction.y.toFixed(4));
        scene.element.dispatchEvent(new CustomEvent("scene:progress", { detail: { progress, reducedMotion: reduced, interaction } }));
        if (isHero && atmosphere) atmosphere.style.setProperty("--hero-depth", reduced ? "0" : progress.toFixed(4));
        if (scene.packet) {
          const t = clamp((progress - .28) / .6);
          const q = 1 - t;
          const x = q * q * q * -72 + 3 * q * q * t * -11 + 3 * q * t * t * 52 + t * t * t * 105;
          const y = q * q * q * -20 + 3 * q * q * t * -104 + 3 * q * t * t * 98 + t * t * t * 24;
          scene.element.style.setProperty("--packet-opacity", (reduced ? 0 : clamp(Math.min(t * 7, (1 - t) * 7))).toFixed(4));
          scene.packet.setAttribute("transform", `translate(${x.toFixed(2)} ${y.toFixed(2)})`);
        }
      }
    };
    const request = () => {
      if (!frame && !disposed && !paused.current && !document.hidden) frame = requestAnimationFrame(() => render());
    };
    invalidate.current = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => render(true));
    };
    const measure = () => {
      measureFrame = 0;
      if (disposed) return;
      const scroll = window.scrollY;
      const bounds = scenes.map(scene => scene.element.getBoundingClientRect());
      const heroBounds = hero.getBoundingClientRect();
      viewportHeight = window.innerHeight;
      scenes.forEach((scene, index) => {
        scene.top = bounds[index].top + scroll;
        scene.left = bounds[index].left;
        scene.width = bounds[index].width;
        scene.height = bounds[index].height;
        scene.progress = -1;
      });
      heroTop = heroBounds.top + scroll;
      heroHeight = heroBounds.height;
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
    const pointerCleanup = scenes.map(scene => {
      const move = (event: PointerEvent) => {
        if (event.pointerType !== "mouse" || !finePointer.matches) return;
        scene.pointer = { x: pointerClamp((event.clientX - scene.left) / Math.max(1, scene.width) - .5), y: pointerClamp((event.clientY + window.scrollY - scene.top) / Math.max(1, scene.height) - .5) };
        request();
      };
      const leave = () => { scene.pointer = { x: 0, y: 0 }; request(); };
      scene.element.addEventListener("pointermove", move, { passive: true });
      scene.element.addEventListener("pointerleave", leave);
      return () => {
        scene.element.removeEventListener("pointermove", move);
        scene.element.removeEventListener("pointerleave", leave);
      };
    });
    const intersection = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const scene = scenes.find(item => item.element === entry.target);
        if (scene) scene.visible = entry.isIntersecting;
      });
      request();
    }, { rootMargin: "80px 0px" });
    scenes.forEach(scene => intersection.observe(scene.element));
    const observer = new ResizeObserver(scheduleMeasure);
    observer.observe(story);
    scenes.forEach(scene => observer.observe(scene.element));
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", resize, { passive: true });
    finePointer.addEventListener("change", invalidate.current);
    document.addEventListener("visibilitychange", visibility);
    document.fonts.ready.then(() => { if (!disposed) scheduleMeasure(); });
    scheduleMeasure();
    return () => {
      disposed = true;
      const pointerChange = invalidate.current;
      invalidate.current = () => {};
      cancelAnimationFrame(frame);
      cancelAnimationFrame(measureFrame);
      intersection.disconnect();
      observer.disconnect();
      pointerCleanup.forEach(cleanup => cleanup());
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", resize);
      finePointer.removeEventListener("change", pointerChange);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);

  return null;
}
