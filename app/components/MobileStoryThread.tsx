"use client";

import { useEffect, useRef } from "react";

export default function MobileStoryThread({ reducedMotion }: { reducedMotion: boolean }) {
  const svg = useRef<SVGSVGElement>(null);
  const base = useRef<SVGPathElement>(null);
  const thread = useRef<SVGPathElement>(null);
  const paused = useRef(reducedMotion);
  const refresh = useRef<() => void>(() => {});

  useEffect(() => {
    paused.current = reducedMotion;
    refresh.current();
  }, [reducedMotion]);

  useEffect(() => {
    const host = svg.current;
    const line = thread.current;
    const story = host?.closest("main");
    if (!host || !line || !story) return;
    const media = window.matchMedia("(max-width: 760px)");
    let frame = 0;
    let measureFrame = 0;
    let disposed = false;
    let width = 0;
    let viewportHeight = window.innerHeight;
    let start = 0;
    let end = 1;
    let length = 1;

    const render = () => {
      frame = 0;
      if (disposed || !media.matches || document.hidden) return;
      const progress = paused.current ? 1 : Math.min(1, Math.max(0,
        (window.scrollY + viewportHeight * .72 - start) / Math.max(1, end - start),
      ));
      line.style.strokeDashoffset = `${(1 - progress) * length}`;
    };
    const request = () => {
      if (!frame && !disposed && media.matches && !document.hidden) frame = requestAnimationFrame(render);
    };
    refresh.current = request;

    const measure = () => {
      measureFrame = 0;
      if (disposed || !media.matches) return;
      const bounds = story.getBoundingClientRect();
      const scroll = window.scrollY;
      const origin = story.querySelector("[data-connector-origin]")?.getBoundingClientRect();
      const introCopy = story.querySelector(".introduction-copy")?.getBoundingClientRect();
      const art = Array.from(story.querySelectorAll<HTMLElement>("[data-story-art]"))
        .map(element => element.getBoundingClientRect());
      const map = story.querySelector("[data-journey-map] [role='group']")?.getBoundingClientRect();
      if (!origin || !introCopy || art.length !== 3 || !map) return;
      width = bounds.width;
      viewportHeight = window.innerHeight;
      // The rail lives outside the reading column. Every turn is confined
      // to a reserved illustration area, including the final map approach.
      const rail = Math.max(14, art[0].left - bounds.left - 22);
      const first = { x: origin.left - bounds.left + origin.width / 2, y: origin.top - bounds.top + origin.height / 2 };
      const bend = Math.min(first.y + 30, introCopy.top - bounds.top - 14);
      let d = `M${first.x} ${first.y} C${first.x - 28} ${first.y + 12} ${rail} ${bend - 18} ${rail} ${bend}`;
      for (const box of art) {
        const top = box.top - bounds.top;
        const bottom = box.bottom - bounds.top;
        const x = box.left - bounds.left + box.width / 2;
        const y = top + box.height / 2;
        const curve = Math.min(70, box.height * .3);
        d += ` L${rail} ${top + 12} C${rail} ${y - curve} ${x} ${y - curve} ${x} ${y}`;
        d += ` C${x} ${y + curve} ${rail} ${y + curve} ${rail} ${bottom - 12}`;
      }
      const ending = { x: map.left - bounds.left + map.width * 82 / 350, y: map.top - bounds.top + map.height * 35 / 550 };
      d += ` L${rail} ${ending.y - 28} Q${rail} ${ending.y} ${ending.x} ${ending.y}`;
      base.current?.setAttribute("d", d);
      line.setAttribute("d", d);
      host.setAttribute("viewBox", `0 0 ${width} ${bounds.height}`);
      length = line.getTotalLength();
      line.style.strokeDasharray = `${length}`;
      start = bounds.top + scroll + first.y;
      end = bounds.top + scroll + ending.y;
      host.style.opacity = "1";
      request();
    };
    const scheduleMeasure = () => {
      if (!measureFrame && !disposed) measureFrame = requestAnimationFrame(measure);
    };
    const resize = () => {
      // Ignore browser-toolbar height changes. Actual layout changes are
      // observed below, so touch scrolling never repositions the artwork.
      if (Math.abs(story.getBoundingClientRect().width - width) > 1) scheduleMeasure();
    };
    const observer = new ResizeObserver(scheduleMeasure);
    observer.observe(story);
    story.querySelectorAll("[data-story-art], .portrait-composition, .introduction-copy, [data-journey-map]")
      .forEach(element => observer.observe(element));
    media.addEventListener("change", scheduleMeasure);
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("scroll", request, { passive: true });
    document.addEventListener("visibilitychange", request);
    document.fonts.ready.then(() => { if (!disposed) scheduleMeasure(); });
    scheduleMeasure();

    return () => {
      disposed = true;
      refresh.current = () => {};
      cancelAnimationFrame(frame);
      cancelAnimationFrame(measureFrame);
      observer.disconnect();
      media.removeEventListener("change", scheduleMeasure);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", request);
      document.removeEventListener("visibilitychange", request);
    };
  }, []);

  return (
    <svg ref={svg} className="mobile-story-thread" fill="none" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path ref={base} className="mobile-thread-base" />
      <path ref={thread} className="mobile-thread-drawn" />
    </svg>
  );
}
