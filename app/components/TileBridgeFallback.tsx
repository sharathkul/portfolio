"use client";

import { useEffect, useRef } from "react";
import { halfThickness as half, hingeSpacing as spacing, tileAngles, tileReach as reach } from "./tileBridgeMotion";

type Point = { x: number; y: number };

// Orthographic projection into the Building illustration's 510 by 360 viewBox.
// These leaves use the same dimensions, pivot clearance and action as the model.
const halfWidth = .23;
const pin = .125;
const clearance = .12;
const deck = pin + half;

function project(x: number, y: number, z = 0): Point {
  return { x: -222 + 90 * (x - .53 * z), y: 50 + 90 * (.24 * x - 1.06 * y + .34 * z) };
}

function polygon(...points: Point[]) {
  return points.map(p => `${p.x.toFixed(3)},${p.y.toFixed(3)}`).join(" ");
}

function leaf(x: number, angle: number) {
  const sin = Math.sin(angle), cos = Math.cos(angle);
  const at = (t: number, h: number, z: number) =>
    project(x + t * cos + h * sin, pin + h * cos - t * sin, z);
  const facing = .562 * cos > .467 * sin ? half : -half;
  return {
    face: polygon(at(facing, clearance, -halfWidth), at(facing, reach, -halfWidth),
      at(facing, reach, halfWidth), at(facing, clearance, halfWidth)),
    edge: polygon(at(-half, clearance, halfWidth), at(-half, reach, halfWidth),
      at(half, reach, halfWidth), at(half, clearance, halfWidth)),
    cap: polygon(at(-half, reach, -halfWidth), at(half, reach, -halfWidth),
      at(half, reach, halfWidth), at(-half, reach, halfWidth)),
    score: polygon(at(facing, reach * .76, -.14), at(facing, reach * .76, .14)),
  };
}

const end = spacing + reach;
function bank(left: number, right: number) {
  return polygon(project(left, deck, -.27), project(right, deck, -.27),
    project(right, deck, .27), project(left, deck, .27));
}

const contacts = [
  project(-half, pin + .23, .055),
  project(clearance, deck),
  project(end, deck),
  { x: -44, y: 62 },
];

export default function TileBridgeFallback() {
  const root = useRef<SVGGElement>(null);
  useEffect(() => {
    const group = root.current;
    const svg = group?.ownerSVGElement;
    const slot = group?.closest<HTMLElement>("[data-story-art]");
    const drawing = group?.closest<HTMLElement>("[data-plate-drawing]");
    if (!group || !slot || !drawing || !svg) return;

    const leaves = Array.from(group.querySelectorAll<SVGGElement>("[data-fallback-leaf]")).map(node => ({
      index: node.dataset.fallbackLeaf === "first" ? 0 : 1,
      face: node.querySelector("polygon[data-face]")!,
      edge: node.querySelector("polygon[data-edge]")!,
      cap: node.querySelector("polygon[data-cap]")!,
      score: node.querySelector("polyline")!,
    }));
    let previous: [number, number] = [0, 0];
    function paint(progress: number) {
      const angles = tileAngles(progress);
      leaves.forEach(elements => {
        const { index } = elements;
        if (previous[index] === angles[index]) return;
        const shape = leaf(index * spacing, angles[index]);
        for (const part of ["face", "edge", "cap", "score"] as const) {
          elements[part].setAttribute("points", shape[part]);
        }
      });
      previous = angles;
    }
    const move = (event: Event) => paint((event as CustomEvent<number>).detail);
    const measure = () => {
      // The original illustration is centered with preserveAspectRatio="xMidYMid meet".
      const width = drawing.clientWidth, height = drawing.clientHeight;
      if (!width || !height) return;
      const scale = Math.min(width / svg.viewBox.baseVal.width, height / svg.viewBox.baseVal.height);
      const projection = JSON.stringify(contacts.map(({ x, y }) => ({
        x: .5 + x * scale / width, y: .5 + y * scale / height,
      })));
      if (projection !== slot.dataset.bridgeFallbackProjection) {
        slot.dataset.bridgeFallbackProjection = projection;
        slot.dispatchEvent(new CustomEvent("thread:bridge-layout", { bubbles: true }));
      }
    };
    const observer = new ResizeObserver(measure);
    observer.observe(drawing);
    slot.addEventListener("thread:bridge-progress", move);
    measure();
    paint(Number(slot.dataset.bridgeProgress ?? 0));
    return () => {
      observer.disconnect();
      slot.removeEventListener("thread:bridge-progress", move);
      delete slot.dataset.bridgeFallbackProjection;
    };
  }, []);

  return (
    <g ref={root} data-tile-bridge-fallback="" pointerEvents="none" strokeLinejoin="round">
      <polygon points={polygon(project(0, .01, -.23), project(end, .01, -.23),
        project(end, .01, .23), project(0, .01, .23))} fill="#dae0e4" />
      <polygon points={bank(-.16, clearance)} fill="#afbbc7" stroke="#899aaa" strokeWidth="1" />
      <polygon points={bank(end, end + .19)} fill="#c3ccd3" stroke="#9babb7" strokeWidth="1" />
      {[spacing, 0].map(x => {
        const shape = leaf(x, 0);
        const axle = project(x, pin, halfWidth + .022);
        return <g key={x} data-fallback-leaf={x === 0 ? "first" : "second"}>
          <polygon data-face="" points={shape.face} fill={x ? "#8294a7" : "#384e6d"} />
          <polygon data-cap="" points={shape.cap} fill={x ? "#bac8d4" : "#798fa9"} />
          <polygon data-edge="" points={shape.edge} fill={x ? "#5b7086" : "#24354d"} />
          <polyline points={shape.score} fill="none" stroke="#d2dbe1" strokeWidth="1.7" />
          <ellipse cx={axle.x} cy={axle.y} rx="2.9" ry="2.45" fill="#bcc8d1" stroke="#73859a" strokeWidth="1" />
        </g>;
      })}
    </g>
  );
}
