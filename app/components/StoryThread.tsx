"use client";

import { useEffect, useRef } from "react";
import { measurePlate, type Projection } from "./plateThread";
import { inkTrack } from "./threadInk";
import ThreadOrb from "./ThreadOrb";

const outsideSegments = [0, 1, 2, 3, 4] as const;

export default function StoryThread({ reducedMotion }: { reducedMotion: boolean }) {
  const svg = useRef<SVGSVGElement>(null);
  const orbLayer = useRef<SVGSVGElement>(null);
  const paused = useRef(reducedMotion);
  const refresh = useRef<() => void>(() => {});

  useEffect(() => {
    paused.current = reducedMotion;
    refresh.current();
  }, [reducedMotion]);

  useEffect(() => {
    const host = svg.current;
    const story = host?.closest("main");
    const layer = orbLayer.current;
    const orb = layer?.querySelector<SVGGElement>("[data-thread-orb]");
    const map = story?.querySelector<HTMLElement>("[data-journey-map]");
    if (!host || !story || !layer || !orb || !map) return;
    const art = Array.from(story.querySelectorAll<HTMLElement>("[data-story-art]"));
    const segments = Array.from(host.querySelectorAll<SVGGElement>("[data-thread-outside]"));
    const terminal = host.querySelector<SVGCircleElement>("[data-thread-terminal]");
    const plates = new Map<HTMLElement, ReturnType<typeof measurePlate>>();
    let strokes: ReturnType<typeof inkTrack>[] = [];
    const bridge = art.find(element => element.dataset.scene === "building");
    let bridgeStroke: ReturnType<typeof inkTrack> | undefined;
    let mapStart = 0;
    let mapEnd = 1;
    let originY = 0;
    let frame = 0;
    let layoutFrame = 0;
    let viewportHeight = window.innerHeight;
    let storyTop = 0;
    let disposed = false;

    function render() {
      frame = 0;
      if (disposed || document.hidden || !strokes.length || !orb || !map) return;
      const scroll = Math.max(0, window.scrollY - storyTop);
      const focus = viewportHeight * .54;
      const marker = scroll + focus + (originY - focus) * Math.max(0, 1 - scroll / (viewportHeight * .8));
      let showOrb = false;
      strokes.forEach((stroke, i) => {
        const amount = paused.current ? 1 : Math.max(0, Math.min(1, (marker - stroke.start) / Math.max(1, stroke.end - stroke.start)));
        const active = !paused.current && (marker >= stroke.start || i === 0) && (marker < stroke.end || i === strokes.length - 1);
        if (stroke === bridgeStroke && bridge && bridge.dataset.bridgeProgress !== String(amount)) {
          bridge.dataset.bridgeProgress = String(amount);
          bridge.dispatchEvent(new CustomEvent("thread:bridge-progress", { detail: amount }));
        }
        stroke.paint(amount, active ? orb : null);
        if (active) showOrb = true;
      });
      orb.setAttribute("visibility", showOrb ? "visible" : "hidden");
      const mapProgress = Math.max(0, Math.min(1, (marker - mapStart) / Math.max(1, mapEnd - mapStart)));
      const progressText = mapProgress.toFixed(6);
      if (map.dataset.threadMapProgress !== progressText || map.dataset.threadMapReduced !== String(paused.current)) {
        map.dataset.threadMapProgress = progressText;
        map.dataset.threadMapReduced = String(paused.current);
        map.dispatchEvent(new CustomEvent("thread:map-progress", { detail: { progress: mapProgress, reducedMotion: paused.current } }));
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
      originY = first.y;
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
        strokes.push(inkTrack(paths[1], startY, end, 0, 0, true));
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
        const middle = (entryY + exitY) / 2;
        const handoff = Math.min(viewportHeight * .36, 270);
        const start = element === bridge ? middle - handoff : entryY;
        const end = element === bridge ? middle + handoff : exitY;
        if (element === bridge) {
          // Chapter navigation should bring the reader in before the first
          // impact, even when the phone layout places the art above the title.
          const chapter = element.closest("section")!;
          const chapterTop = chapter.getBoundingClientRect().top - bounds.top;
          const scrollAtApproach = start + (end - start) * .16 - viewportHeight * .54;
          chapter.style.scrollMarginTop = `${Math.max(0, chapterTop - scrollAtApproach)}px`;
        }
        const corner = Math.min(Math.abs(edge - rail) * .65, mobile ? 24 : 65);
        d += ` L${rail} ${entryY - corner} Q${rail} ${entryY} ${edge} ${entryY}`;
        finishOutside(index, start);
        const stroke = inkTrack(plate.ink, start, end, x, y, false, plate.fraction);
        if (element === bridge) bridgeStroke = stroke;
        strokes.push(stroke);
        d = `M${edge} ${exitY} Q${rail} ${exitY} ${rail} ${exitY + corner}`;
        startY = end;
        previousBottom = element.closest("section")!.getBoundingClientRect().bottom - bounds.top;
      }
      switchRail(left);
      const mapEntryX = entry.left - bounds.left + entry.width / 2;
      const mapEntryY = entry.top - bounds.top + entry.height / 2;
      d += ` L${rail} ${mapEntryY - 28} Q${rail} ${mapEntryY} ${mapEntryX} ${mapEntryY}`;
      const mapBox = drawing!.getBoundingClientRect();
      mapStart = Math.max(startY + 1, mapBox.top - bounds.top + mapBox.height * .08);
      mapEnd = Math.max(mapStart + 1, mapBox.bottom - bounds.top - mapBox.height * .09);
      finishOutside(3, mapStart);

      // The map carries the line between its two pins. Pick it up at Delivery
      // and stay outside the form all the way down to the closing actions.
      const mapExitX = exit.left - bounds.left + exit.width / 2;
      const mapExitY = exit.top - bounds.top + exit.height / 2;
      const endX = Math.min(right, contact.right - bounds.left + (mobile ? 6 : 16));
      const endY = contact.bottom - bounds.top - 22;
      const corner = Math.min(38, Math.max(0, right - endX));
      startY = mapEnd;
      d = `M${mapExitX} ${mapExitY} Q${right} ${mapExitY} ${right} ${mapExitY + 32}`;
      d += ` V${endY - corner} Q${right} ${endY} ${right - corner} ${endY} H${endX}`;
      const finalScrollMarker = document.documentElement.scrollHeight - viewportHeight * .46 - storyTop;
      finishOutside(4, Math.min(endY, finalScrollMarker));
      terminal?.setAttribute("cx", String(endX));
      terminal?.setAttribute("cy", String(endY));
      host.setAttribute("viewBox", `0 0 ${bounds.width} ${bounds.height}`);
      layer.setAttribute("viewBox", `0 0 ${bounds.width} ${bounds.height}`);
      host.style.opacity = "1";
      render();
    };
    const scheduleMeasure = () => {
      if (!layoutFrame && !disposed) layoutFrame = requestAnimationFrame(measure);
    };
    const projection = (event: Event) => {
      plates.get(event.target as HTMLElement)?.draw((event as CustomEvent<Projection>).detail);
      request();
    };
    const fallback = (event: Event) => {
      const element = event.target as HTMLElement;
      if (!element.dataset.threadProjection) {
        plates.get(element)?.draw(null);
        request();
      }
    };
    const bridgeLayout = () => {
      if (!bridge) return;
      plates.get(bridge)?.draw(bridge.dataset.threadProjection ? JSON.parse(bridge.dataset.threadProjection) : null);
      request();
    };
    bridge?.addEventListener("thread:bridge-layout", bridgeLayout);
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
      bridge?.removeEventListener("thread:bridge-layout", bridgeLayout);
      art.forEach(element => element.removeEventListener("scene:progress", fallback));
      window.removeEventListener("resize", scheduleMeasure);
      window.removeEventListener("scroll", request);
      document.removeEventListener("visibilitychange", request);
    };
  }, []);

  return (
    <>
      <svg ref={svg} className="story-thread" fill="none" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        {outsideSegments.map(index => <g key={index} data-thread-outside={index}>
          <path className="story-thread-base" />
          <path className="story-thread-drawn" />
        </g>)}
        <circle data-thread-terminal r="3.5" stroke="var(--accent)" strokeWidth="1.5" fill="var(--paper)" />
      </svg>
      <svg ref={orbLayer} className="story-thread-orb-layer" fill="none" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <ThreadOrb />
      </svg>
    </>
  );
}
