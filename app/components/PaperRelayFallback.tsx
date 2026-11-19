"use client";

import { useEffect, useRef } from "react";
import { paperAngles, paperRig as rig } from "./paperMotion";

type Point = { x: number; y: number };
type World = readonly [number, number, number];
const leaves = ["care", "information", "billing"] as const;
const ink = "#2d4268";
const stock = "#fcfaf3";
const pageWidth = 100;
const pageHeight = 140;
const page = "M0 0H82L100 18V140H0Z";

// Look down from the feeder side. The marked face is visible both upright
// and lying flat, and the original rightward travel is clear on a phone.
function project([x, y, z]: World): Point {
  return { x: -5 + 85 * (x + .64 * z), y: 61 + 85 * (-.17 * x - .90 * y + .44 * z) };
}

function affine(origin: Point, u: Point, v: Point) {
  return `matrix(${[u.x - origin.x, u.y - origin.y, v.x - origin.x, v.y - origin.y, origin.x, origin.y]
    .map(n => n.toFixed(5)).join(" ")})`;
}

function faceMatrix(pivot: number, angle: number, depth: number) {
  const sin = Math.sin(angle);
  const cos = Math.cos(angle);
  const at = (u: number, v: number) => {
    const h = rig.reach * (1 - v / pageHeight);
    return project([pivot + depth * cos + h * sin, rig.hingeY + h * cos - depth * sin, rig.width * (u / pageWidth - .5)]);
  };
  return affine(at(0, 0), at(1, 0), at(0, 1));
}

function plinth(pivot: number, level: number, width: number) {
  const offsets = [-.028, .020, -.008, 0];
  const x = pivot + offsets[level];
  const y = .09 + .049 * level;
  const z = offsets[3 - level];
  const at = (u: number, v: number) => project([x - .034 + u * width / 125, y, z - rig.width * .55 + v * rig.width * 1.1 / 100]);
  return affine(at(0, 0), at(1, 0), at(0, 1));
}

function crease(pivot: number) {
  const front = project([pivot - .043, .255, -rig.width / 2]);
  const back = project([pivot - .043, .255, rig.width / 2]);
  return `M${front.x} ${front.y}L${back.x} ${back.y}`;
}

function Mark({ kind }: { kind: typeof leaves[number] }) {
  if (kind === "care") {
    return <path fill={ink} d="M42 47H57V64H74V79H57V96H42V79H25V64H42Z" />;
  }
  if (kind === "information") {
    return <>
      <path fill={ink} d="M18 49H70V56H18Z" />
      <path d="M19 70H80M19 80H73M19 90H58" fill="none" stroke="#71849a" strokeWidth="2.8" />
    </>;
  }
  return <g fill="none" stroke={ink}>
    <circle cx="50" cy="72" r="26" strokeWidth="4" />
    <path d="M59 59C41 52 34 68 49 72C70 75 61 94 42 85M51 53V92" strokeWidth="4.1" />
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
    const hinges = leaves.map((name, i) => ({
      face: group.querySelector<SVGGElement>(`[data-paper-leaf="${name}"]`)!,
      backing: group.querySelector<SVGGElement>(`[data-paper-backing="${name}"]`)!,
      angle: Number.NaN,
      pivot: rig.pivots[i],
    }));
    const animate = (p: number) => {
      if (!Number.isFinite(p)) return;
      paperAngles(p).forEach((angle, i) => {
        const hinge = hinges[i];
        if (angle === hinge.angle) return;
        hinge.angle = angle;
        hinge.face.dataset.angle = angle.toFixed(6);
        hinge.face.setAttribute("transform", faceMatrix(hinge.pivot, angle, -rig.halfThickness));
        hinge.backing.setAttribute("transform", faceMatrix(hinge.pivot, angle, rig.halfThickness));
      });
    };
    const onProgress = (event: Event) => animate((event as CustomEvent<number>).detail);
    const measure = () => {
      const width = drawing.clientWidth, height = drawing.clientHeight;
      if (!width || !height) return;
      const box = svg.viewBox.baseVal;
      const scale = Math.min(width / box.width, height / box.height);
      const points = [rig.triggerSurface, rig.trackExitWaypoint].map(world => {
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

  return <g ref={ref} data-paper-fallback="" fill="none" strokeLinejoin="round" strokeLinecap="round" pointerEvents="none">
    {rig.pivots.map((pivot, index) => <g key={pivot}>
      {[0, 1, 2, 3].map(i => <g key={i} transform={plinth(pivot, i, index === 2 ? 1.71 : 1.405)}>
        <rect x="1.5" y="2" width="125" height="100" rx="2.4" fill={i ? "#bec5cc" : "#adb7c2"} />
        <rect width="125" height="100" rx="2.4" fill={i === 3 ? "#f1efe7" : "#f6f4ed"} stroke="#aeb8c3" strokeWidth=".95" />
        {i === 3 && <path d="M12 86H42M12 91H32" stroke="#adb8c4" strokeWidth="1.6" />}
      </g>)}
      <path d={crease(pivot)} stroke="#617389" strokeWidth="3" />
    </g>)}
    {[2, 1, 0].map(i => {
      const name = leaves[i], pivot = rig.pivots[i];
      return <g key={name}>
        <g data-paper-backing={name} transform={faceMatrix(pivot, 0, rig.halfThickness)}>
          <path d={page} fill="#60728a" stroke="#415675" strokeWidth="1.15" />
        </g>
        <g data-paper-leaf={name} data-angle="0" transform={faceMatrix(pivot, 0, -rig.halfThickness)}>
          <path d={page} fill={stock} stroke="#4a607a" strokeWidth="1.25" />
          <path d="M82 0L100 18H83Z" fill={ink} />
          <path d="M13 17H34" stroke="#97a5b2" strokeWidth="2.1" />
          <g transform="translate(0 -10)"><Mark kind={name} /></g>
          <path d="M16 115H65M16 122H50" stroke="#97a4b2" strokeWidth="1.6" />
        </g>
      </g>;
    })}
  </g>;
}
