"use client";

import { useEffect, useRef } from "react";

export default function StoryThread({ reducedMotion }: { reducedMotion: boolean }) {
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
      if (disposed || document.hidden) return;
      const progress = paused.current ? 1 : Math.min(1, Math.max(0,
        (window.scrollY + viewportHeight * .72 - start) / Math.max(1, end - start),
      ));
      line.style.strokeDashoffset = `${(1 - progress) * length}`;
    };
    const request = () => {
      if (!frame && !disposed && !document.hidden) frame = requestAnimationFrame(render);
    };
    refresh.current = request;

    const measure = () => {
      measureFrame = 0;
      if (disposed) return;
      const bounds = story.getBoundingClientRect();
      const scroll = window.scrollY;
      const origin = story.querySelector("[data-connector-origin]")?.getBoundingClientRect();
      const introCopy = story.querySelector(".introduction-copy")?.getBoundingClientRect();
      const portrait = story.querySelector(".portrait-composition")?.getBoundingClientRect();
      const art = Array.from(story.querySelectorAll<HTMLElement>("[data-story-art]"))
        .map(element => ({ box: element.getBoundingClientRect(), section: element.closest("section")!.getBoundingClientRect() }));
      const map = story.querySelector("[data-journey-map] [role='group']")?.getBoundingClientRect();
      if (!origin || !introCopy || !portrait || art.length !== 3 || !map) return;
      width = bounds.width;
      viewportHeight = window.innerHeight;
      const mobile = width <= 960;
      const left = mobile ? Math.max(14, art[0].box.left - bounds.left - 22) : Math.max(24, width * .035);
      const right = width - left;
      const first = { x: origin.left - bounds.left + origin.width / 2, y: origin.top - bounds.top + origin.height / 2 };
      const bend = mobile ? Math.min(first.y + 30, introCopy.top - bounds.top - 14) : Math.max(first.y + 36, portrait.bottom - bounds.top + 18);
      let rail = left;
      let previousSectionBottom = 0;
      let d = `M${first.x} ${first.y} C${first.x - 28} ${first.y + 12} ${rail} ${bend - 18} ${rail} ${bend}`;

      // A side change happens in the empty corridor below the entire row.
      // Neither an expanded paragraph nor a taller image can enter it.
      const switchRail = (next: number, corridor: number) => {
        if (next === rail) return;
        d += ` L${rail} ${corridor - 20} C${rail} ${corridor + 36} ${next} ${corridor - 36} ${next} ${corridor + 20}`;
        rail = next;
      };
      for (const item of art) {
        const box = item.box;
        const top = box.top - bounds.top;
        const bottom = box.bottom - bounds.top;
        const x = box.left - bounds.left + box.width / 2;
        const y = top + box.height / 2;
        const side = mobile || x < width / 2 ? left : right;
        if (side !== rail) switchRail(side, previousSectionBottom - 48);
        const curve = Math.min(mobile ? 70 : 150, box.height * .3);
        d += ` L${rail} ${top + 12} C${rail} ${y - curve} ${x} ${y - curve} ${x} ${y}`;
        d += ` C${x} ${y + curve} ${rail} ${y + curve} ${rail} ${bottom - 12}`;
        previousSectionBottom = item.section.bottom - bounds.top;
      }
      switchRail(left, previousSectionBottom - 48);
      const ending = {
        x: map.left - bounds.left + map.width * (mobile ? 82 / 350 : 70 / 1100),
        y: map.top - bounds.top + map.height * (mobile ? 35 / 550 : 200 / 390),
      };
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
      if (Math.abs(window.innerWidth - width) > 1) scheduleMeasure();
    };
    const observer = new ResizeObserver(scheduleMeasure);
    observer.observe(story);
    story.querySelectorAll("[data-story-art], .story-part, .portrait-composition, .introduction-copy, [data-journey-map]")
      .forEach(element => observer.observe(element));
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
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", request);
      document.removeEventListener("visibilitychange", request);
    };
  }, []);

  return (
    <svg ref={svg} className="story-thread" fill="none" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path ref={base} className="story-thread-base" />
      <path ref={thread} className="story-thread-drawn" />
    </svg>
  );
}
