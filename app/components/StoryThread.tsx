"use client";

import { useEffect, useRef } from "react";
import { measurePlate, type Projection, type Stroke } from "./plateThread";

const outsideSegments = [0, 1, 2, 3, 4] as const;

export default function StoryThread({ reducedMotion }: { reducedMotion: boolean }) {
  const svg = useRef<SVGSVGElement>(null);
  const paused = useRef(reducedMotion);
  const refresh = useRef<() => void>(() => {});

  useEffect(() => {
    paused.current = reducedMotion;
    refresh.current();
  }, [reducedMotion]);

  useEffect(() => {
    const host = svg.current;
    const story = host?.closest("main");
    if (!host || !story) return;
    const art = Array.from(story.querySelectorAll<HTMLElement>("[data-story-art]"));
    const segments = Array.from(host.querySelectorAll<SVGGElement>("g"));
    const terminal = host.querySelector<SVGCircleElement>("[data-thread-terminal]");
    const plates = new Map<HTMLElement, ReturnType<typeof measurePlate>>();
    let strokes: Stroke[] = [];
    let frame = 0;
    let layoutFrame = 0;
    let viewportHeight = window.innerHeight;
    let storyTop = 0;
    let disposed = false;

    function render() {
      frame = 0;
      if (disposed || document.hidden) return;
      const marker = window.scrollY + viewportHeight * .72 - storyTop;
      for (const stroke of strokes) {
        const amount = paused.current ? 1 : Math.max(0, Math.min(1, (marker - stroke.start) / Math.max(1, stroke.end - stroke.start)));
        const offset = (1 - amount).toFixed(5);
        stroke.paths.forEach(path => {
          if (path.style.strokeDashoffset !== offset) path.style.strokeDashoffset = offset;
        });
      }
    }
    function request() {
      if (!frame && !disposed && !document.hidden) frame = requestAnimationFrame(render);
    }
    refresh.current = request;

    const measure = () => {
      layoutFrame = 0;
      const bounds = story.getBoundingClientRect();
      const origin = story.querySelector("[data-connector-origin]")?.getBoundingClientRect();
      const intro = story.querySelector(".introduction-copy")?.getBoundingClientRect();
      const portrait = story.querySelector(".portrait-composition")?.getBoundingClientRect();
      const mobile = bounds.width <= 960;
      const drawing = story.querySelector(`[data-journey-drawing="${mobile ? "mobile" : "desktop"}"]`);
      const entry = drawing?.querySelector("[data-thread-port='entry']")?.getBoundingClientRect();
      const exit = drawing?.querySelector("[data-thread-port='exit']")?.getBoundingClientRect();
      const contact = story.querySelector("#contact")?.getBoundingClientRect();
      if (!origin || !portrait || !intro || !entry || !exit || !contact || art.length !== 3) return;
      storyTop = bounds.top + window.scrollY;
      viewportHeight = window.innerHeight;
      const left = mobile ? 14 : Math.max(24, bounds.width * .035);
      const right = bounds.width - left;
      const first = { x: origin.left - bounds.left + origin.width / 2, y: origin.top - bounds.top + origin.height / 2 };
      const bend = mobile ? Math.min(first.y + 30, intro.top - bounds.top - 14) : Math.max(first.y + 36, portrait.bottom - bounds.top + 18);
      let rail = left;
      let previousBottom = 0;
      let startY = first.y;
      let d = `M${first.x} ${first.y} C${first.x - 28} ${first.y + 12} ${rail} ${bend - 18} ${rail} ${bend}`;
      strokes = [];
      function switchRail(next: number) {
        if (next === rail) return;
        const y = previousBottom - 48;
        d += ` L${rail} ${y - 20} C${rail} ${y + 36} ${next} ${y - 36} ${next} ${y + 20}`;
        rail = next;
      }
      function finishOutside(index: number, end: number) {
        const paths = segments[index].querySelectorAll("path");
        paths.forEach(path => path.setAttribute("d", d));
        strokes.push({ paths: [paths[1]], start: startY, end });
      }
      for (const [index, element] of art.entries()) {
        const rect = element.getBoundingClientRect();
        const x = rect.left - bounds.left;
        const y = rect.top - bounds.top;
        const fromLeft = mobile || x + rect.width / 2 < bounds.width / 2;
        const plate = measurePlate(element, fromLeft);
        plates.set(element, plate);
        plate.draw(element.dataset.threadProjection ? JSON.parse(element.dataset.threadProjection) : null);
        switchRail(fromLeft ? left : right);
        const edge = x + plate.entry.x;
        const entryY = y + plate.entry.y;
        const exitY = y + plate.exit.y;
        const corner = Math.min(Math.abs(edge - rail) * .65, mobile ? 24 : 65);
        d += ` L${rail} ${entryY - corner} Q${rail} ${entryY} ${edge} ${entryY}`;
        finishOutside(index, entryY);
        strokes.push({ paths: plate.paths, start: entryY, end: exitY });
        d = `M${edge} ${exitY} Q${rail} ${exitY} ${rail} ${exitY + corner}`;
        startY = exitY;
        previousBottom = element.closest("section")!.getBoundingClientRect().bottom - bounds.top;
      }
      switchRail(left);
      const mapEntryX = entry.left - bounds.left + entry.width / 2;
      const mapEntryY = entry.top - bounds.top + entry.height / 2;
      d += ` L${rail} ${mapEntryY - 28} Q${rail} ${mapEntryY} ${mapEntryX} ${mapEntryY}`;
      finishOutside(3, mapEntryY);

      // The map carries the line between its two pins. Pick it up at Delivery
      // and stay outside the form all the way down to the closing actions.
      const mapExitX = exit.left - bounds.left + exit.width / 2;
      const mapExitY = exit.top - bounds.top + exit.height / 2;
      const endX = Math.min(right, contact.right - bounds.left + (mobile ? 6 : 16));
      const endY = contact.bottom - bounds.top - 22;
      const corner = Math.min(38, Math.max(0, right - endX));
      startY = mapExitY;
      d = `M${mapExitX} ${mapExitY} Q${right} ${mapExitY} ${right} ${mapExitY + 32}`;
      d += ` V${endY - corner} Q${right} ${endY} ${right - corner} ${endY} H${endX}`;
      const finalScrollMarker = document.documentElement.scrollHeight - viewportHeight * .28 - storyTop;
      finishOutside(4, Math.min(endY, finalScrollMarker));
      terminal?.setAttribute("cx", String(endX));
      terminal?.setAttribute("cy", String(endY));
      host.setAttribute("viewBox", `0 0 ${bounds.width} ${bounds.height}`);
      host.style.opacity = "1";
      render();
    };
    const scheduleMeasure = () => {
      if (!layoutFrame && !disposed) layoutFrame = requestAnimationFrame(measure);
    };
    const projection = (event: Event) => {
      plates.get(event.target as HTMLElement)?.draw((event as CustomEvent<Projection>).detail);
    };
    const fallback = (event: Event) => {
      const element = event.target as HTMLElement;
      if (!element.dataset.threadProjection) plates.get(element)?.draw(null);
    };
    story.addEventListener("thread:projection", projection);
    art.forEach(element => element.addEventListener("scene:progress", fallback));
    const observer = new ResizeObserver(scheduleMeasure);
    observer.observe(story);
    story.querySelectorAll("[data-story-art], [data-plate-drawing], .story-part, .portrait-composition, .introduction-copy, [data-journey-map], #contact")
      .forEach(element => observer.observe(element));
    window.addEventListener("resize", scheduleMeasure, { passive: true });
    window.addEventListener("scroll", request, { passive: true });
    document.addEventListener("visibilitychange", request);
    document.fonts.ready.then(scheduleMeasure);
    scheduleMeasure();

    return () => {
      disposed = true;
      refresh.current = () => {};
      cancelAnimationFrame(frame);
      cancelAnimationFrame(layoutFrame);
      observer.disconnect();
      story.removeEventListener("thread:projection", projection);
      art.forEach(element => element.removeEventListener("scene:progress", fallback));
      window.removeEventListener("resize", scheduleMeasure);
      window.removeEventListener("scroll", request);
      document.removeEventListener("visibilitychange", request);
    };
  }, []);

  return (
    <svg ref={svg} className="story-thread" fill="none" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      {outsideSegments.map(index => <g key={index} data-thread-outside={index}>
        <path className="story-thread-base" pathLength={1} />
        <path className="story-thread-drawn" pathLength={1} />
      </g>)}
      <circle data-thread-terminal r="3.5" stroke="var(--accent)" strokeWidth="1.5" fill="var(--paper)" />
    </svg>
  );
}
