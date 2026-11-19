"use client";

import { useEffect, useRef } from "react";
import { cornerTip, foldAngle, paperActionProgress, paperNames, paperPose, paperRig as rig, paperWorld, type PaperPoint, type PaperPose } from "./paperMotion";

const ink = "#2f4567", slate = "#61738b";
const c = rig.corner * 100, w = rig.width * 100, rear = c - rig.depth * 100;

function project([x, y, z]: PaperPoint) {
  return { x: -8 + 84 * (x + .29 * z), y: -4 + 84 * (-.13 * x - .69 * y + .74 * z) };
}

function pageMatrix(index: number, pose: PaperPose) {
  const at = (x: number, z: number) => project(paperWorld(index, pose, [x, 0, z]));
  const a = at(0, 0), u = at(.01, 0), v = at(0, .01);
  return `matrix(${[u.x - a.x, u.y - a.y, v.x - a.x, v.y - a.y, a.x, a.y].map(n => n.toFixed(5)).join(" ")})`;
}

function dogEar(pose: PaperPose, fold: number) {
  const points: PaperPoint[] = [[0, 0, 0], cornerTip(fold), [rig.corner, 0, rig.corner]];
  return points.map(v => {
    const p = project(paperWorld(0, pose, v));
    return p.x.toFixed(3) + "," + p.y.toFixed(3);
  }).join(" ");
}

function Sheet({ index }: { index: number }) {
  const cut = index === 0;
  const path = `M0 ${rear}H${w}V${c}H${cut ? c : 0}${cut ? "L0 0" : ""}Z`;
  const pose = paperPose(index, 0);
  return <g data-paper-leaf={paperNames[index]} data-x={pose.x} data-z={pose.z} data-turn={pose.turn}
    transform={pageMatrix(index, pose)}>
    <path d={path} fill="#8292a4" transform="translate(0 3)" />
    <rect x={w - 2} y={rear + 14 + index * 55} width="16" height="30" rx="2" fill={[ink, "#8393a5", "#526680"][index]} />
    <path d={path} fill={index === 2 ? "#eeeee9" : "#fbfaf5"} stroke="#8e9ba7" strokeWidth="1.4" />
    <path d={`M18 ${rear+22}h47m62 0h19`} stroke={slate} strokeWidth="3.2" />
    <g transform={`translate(81 ${rear+78})`}>
      {index === 0 ? <path fill={ink} d="M-8-30H8V-8H30V8H8V30H-8V8H-30V-8H-8Z" />
        : index === 1 ? <path d="M-36-17h72m-72 17h81m-81 17h45" stroke={ink} strokeWidth="7" />
        : <g fill="none" stroke={ink} strokeWidth="4">
          <circle r="28" /><path d="M9-14C-12-21-16-3-1 0C17 4 10 22-11 14M0-20v40" />
        </g>}
    </g>
    <path d={`M23 ${rear+136}h112m-112 13h82m24 52h34`} stroke="#8999a8" strokeWidth="2.5" />
    {cut && <path d={`M0 0L${c} ${c}`} stroke={slate} strokeWidth="2.2" />}
  </g>;
}

export default function PaperRelayFallback() {
  const ref = useRef<SVGGElement>(null);
  useEffect(() => {
    const group = ref.current;
    const slot = group?.closest<HTMLElement>("[data-story-art]");
    const drawing = group?.closest<HTMLElement>("[data-plate-drawing]");
    const svg = group?.ownerSVGElement;
    if (!group || !slot || !drawing || !svg) return;
    const leaves = paperNames.map(name => group.querySelector<SVGGElement>(`[data-paper-leaf="${name}"]`)!);
    const ear = group.querySelector<SVGPolygonElement>("[data-paper-curl]")!;
    let previous = Number.NaN;
    const animate = (input: number) => {
      const progress = paperActionProgress(input);
      if (!Number.isFinite(progress) || progress === previous) return;
      previous = progress;
      leaves.forEach((leaf, index) => {
        const pose = paperPose(index, progress);
        const matrix = pageMatrix(index, pose);
        if (leaf.getAttribute("transform") === matrix) return;
        leaf.setAttribute("transform", matrix);
        leaf.dataset.x = String(pose.x);
        leaf.dataset.z = String(pose.z);
        leaf.dataset.turn = String(pose.turn);
      });
      const angle = foldAngle(progress);
      ear.dataset.fold = String(angle);
      ear.setAttribute("points", dogEar(paperPose(0, progress), angle));
    };
    const onProgress = (event: Event) => animate((event as CustomEvent<number>).detail);
    const measure = () => {
      const width = drawing.clientWidth, height = drawing.clientHeight;
      if (!width || !height) return;
      const box = svg.viewBox.baseVal;
      const scale = Math.min(width / box.width, height / box.height);
      const points = [rig.triggerSurface, rig.alignedSurface, rig.trackExitWaypoint].map(world => {
        const p = project(world);
        return { x: .5 + (p.x - box.x - box.width / 2) * scale / width,
          y: .5 + (p.y - box.y - box.height / 2) * scale / height };
      });
      const serialized = JSON.stringify(points);
      if (slot.dataset.paperFallbackProjection !== serialized) {
        slot.dataset.paperFallbackProjection = serialized;
        slot.dispatchEvent(new CustomEvent("thread:paper-layout", { bubbles: true }));
      }
    };
    const observer = new ResizeObserver(measure);
    observer.observe(drawing);
    slot.addEventListener("thread:paper-progress", onProgress);
    measure();
    animate(Number(slot.dataset.paperProgress ?? 0));
    return () => {
      observer.disconnect();
      slot.removeEventListener("thread:paper-progress", onProgress);
      delete slot.dataset.paperFallbackProjection;
    };
  }, []);
  return <g ref={ref} data-paper-fallback="" pointerEvents="none" strokeLinejoin="round" fill="none">
    {[2, 1, 0].map(i => <Sheet key={i} index={i} />)}
    <polygon data-paper-curl="" data-fold={foldAngle(0)} points={dogEar(paperPose(0, 0), foldAngle(0))}
      fill={slate} stroke="#435973" strokeWidth="1.4" />
  </g>;
}
