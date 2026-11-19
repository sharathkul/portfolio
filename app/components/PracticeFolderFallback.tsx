"use client";

import { useEffect, useRef } from "react";
import { practiceRig as rig, samplePractice } from "./practiceMotion";

type World = [number, number, number];
type Point = { x: number; y: number };
type Pose = ReturnType<typeof samplePractice>;

const paper = "#fffaf0";
const navy = "#2e4564";
const slate = "#4b627b";
const brass = "#b19a75";
const width = rig.cardWidth;
const depth = rig.cardDepth;
const [triggerX, triggerY, triggerZ] = rig.triggerSurface;
const triggerPinX = triggerX + .105;

// The card, contact face and cord anchors share the model's coordinates.
// A fixed axonometric view keeps the return stroke visible in small drawings.
function project([x, y, z]: World): Point {
  return { x: 5 + 83 * (x - .27 * z), y: 10 + 83 * (.12 * x - .95 * y + .69 * z) };
}
function xy(point: Point) {
  return `${point.x.toFixed(3)},${point.y.toFixed(3)}`;
}
function outline(corners: World[]) {
  return corners.map(p => xy(project(p))).join(" ");
}
function surface(at: (u: number, v: number) => World) {
  const o = project(at(0, 0)), u = project(at(1, 0)), v = project(at(0, 1));
  return `matrix(${u.x-o.x} ${u.y-o.y} ${v.x-o.x} ${v.y-o.y} ${o.x} ${o.y})`;
}
function top(x: number, y: number, z: number, yaw = 0) {
  const c = Math.cos(yaw), s = Math.sin(yaw);
  return surface((u,v) => [x + u*c + v*s, y, z - u*s + v*c]);
}
function front(x: number, y: number, z: number, turn = 0) {
  const c = Math.cos(turn), s = Math.sin(turn);
  return surface((u,v) => [x + u*c + v*s, y + u*s - v*c, z]);
}

function Block({ from, to, face, wall }: { from: World; to: World; face: string; wall: string }) {
  const [l,b,k] = from, [r,t,f] = to;
  return <g strokeWidth=".65" strokeLinejoin="round">
    <polygon points={outline([[l,b,f],[r,b,f],[r,t,f],[l,t,f]])} fill={wall} stroke={wall} />
    <polygon points={outline([[r,b,f],[r,b,k],[r,t,k],[r,t,f]])} fill={wall} stroke={wall} />
    <polygon points={outline([[l,t,k],[r,t,k],[r,t,f],[l,t,f]])} fill={face} stroke={wall} />
  </g>;
}

function rockerPoint(angle: number): World {
  const [x,y,z] = rig.rockerPivot;
  return [x + 1.1 * Math.cos(angle) - .035 * Math.sin(angle),
    y + 1.1 * Math.sin(angle) + .035 * Math.cos(angle), z + .13];
}

function parts(p: Pose) {
  const [px,py,pz] = rig.rockerPivot;
  const tip = project(rockerPoint(p.rockerAngle));
  const cableEnd = project([p.guideX - .36, .47, p.guideZ + .03]);
  const left = project([-1.95, .27, 1.11]);
  const right = project([2.05, .16, 1.11]);
  const sag = 1.3 + 5.2 * (1 - p.cordTension);
  const sleeveFraction = .57 - .10 * p.cordTension;
  const sleeve = { x: left.x + (right.x - left.x) * sleeveFraction,
    y: left.y + (right.y - left.y) * sleeveFraction + 2.8 + sag * 2 * sleeveFraction * (1 - sleeveFraction) };
  return {
    card: surface((u,v) => [p.cardFrontX + (u - width) * Math.cos(p.tailLiftAngle),
      p.cardY + (width - u) * Math.sin(p.tailLiftAngle), p.cardZ - depth / 2 + v]),
    guide: top(p.guideX, .48, p.guideZ, p.guideAngle),
    rocker: front(px,py,pz,p.rockerAngle),
    trigger: front(triggerPinX, triggerY, triggerZ, -.34 * p.trigger),
    cord: `M${xy(cableEnd)} L${left.x-2},${left.y-2.8} Q${left.x-5},${left.y+3} ${left.x},${left.y+3} Q${(left.x+right.x)/2},${(left.y+right.y)/2+3+sag} ${right.x},${right.y+3} Q${right.x+4},${right.y+2} ${right.x+3},${right.y-1} L${xy(tip)}`,
    sleeve: `translate(${sleeve.x} ${sleeve.y}) rotate(7)`,
  };
}
const initial = parts(samplePractice(0));

export default function PracticeFolderFallback() {
  const root = useRef<SVGGElement>(null);
  useEffect(() => {
    const group = root.current;
    const slot = group?.closest<HTMLElement>("[data-story-art]");
    const drawing = group?.closest<HTMLElement>("[data-plate-drawing]");
    const view = group?.ownerSVGElement;
    if (!group || !slot || !view || !drawing) return;
    const fittings = Array.from(group.querySelectorAll<SVGElement>("[data-joint]")).map(node => ({
      node, joint: node.dataset.joint as keyof typeof initial,
    }));
    const paint = (p: number) => {
      const next = parts(samplePractice(p));
      for (const { node, joint } of fittings) {
        const attribute = joint === "cord" ? "d" : "transform";
        if (node.getAttribute(attribute) !== next[joint]) node.setAttribute(attribute, next[joint]);
      }
    };
    const animate = (e: Event) => paint((e as CustomEvent<number>).detail);
    const measure = () => {
      const w = drawing.clientWidth, h = drawing.clientHeight;
      if (!w || !h) return;
      const box = view.viewBox.baseVal, scale = Math.min(w / box.width, h / box.height);
      const normalized = [rig.triggerSurface, rig.trackExitWaypoint].map(where => {
        const p = project(where);
        return {x: .5 + (p.x - box.x - box.width / 2) * scale / w,
          y: .5 + (p.y - box.y - box.height / 2) * scale / h};
      });
      const json = JSON.stringify(normalized);
      if (slot.dataset.practiceFallbackProjection === json) return;
      slot.dataset.practiceFallbackProjection = json;
      slot.dispatchEvent(new CustomEvent("thread:practice-layout", {bubbles:true}));
    };
    const resize = new ResizeObserver(measure);
    resize.observe(drawing);
    slot.addEventListener("thread:practice-progress", animate);
    measure();
    paint(Number(slot.dataset.practiceProgress || 0));
    return () => {
      resize.disconnect();
      slot.removeEventListener("thread:practice-progress", animate);
      delete slot.dataset.practiceFallbackProjection;
    };
  }, []);

  return (
    <g ref={root} data-practice-fallback="" pointerEvents="none" strokeLinejoin="round" strokeLinecap="round">
      <g transform={top(.08, -.045, .18)}><ellipse cy=".04" rx="2.60" ry="1.02" fill="#687b8c" opacity=".08" /></g>
      <Block from={[-2.48,.005,-.71]} to={[2.48,.11,.96]} face="#dce1e1" wall="#abb5bc" />
      <Block from={[-2.26,.11,-.61]} to={[2.30,.15,.82]} face="#ecede7" wall="#c4cccc" />
      <g transform={top(-1.85,.157,-.49)} fill="none" stroke="#adb8bd" strokeWidth=".016">
        <path d="M0 0H3.82M0 1.14H3.82" />
      </g>
      <g data-motion-part="source-folder">
        <Block from={[-2.48,.16,-.67]} to={[-1.18,.36,.78]} face={slate} wall={navy} />
        <path transform={front(-2.47,.47,-.65)} d="M0 .15V-.53Q0-.6.07-.6H.49L.6-.49H1.24Q1.29-.49 1.29-.44V.15Z" fill={navy} />
        <Block from={[-2.45,.36,-.58]} to={[-1.29,.50,.64]} face="#dfe3df" wall="#afbac0" />
      </g>
      <g data-motion-part="client-folder">
        <Block from={ [ .69,.15,-.88]} to={[2.47,.30,.39]} face="#d5dedf" wall="#8a9ba5" />
        <path transform={front(.68,.31,-.87)} d="M0 0V-.46Q0-.53.07-.53H.97L1.09-.70H1.70Q1.78-.70 1.78-.61V0Z" fill={slate} />
        <path transform={front(2,.84,-.864)} d="M0 0H.21M.105-.1V.1" fill="none" stroke="#e7e8df" strokeWidth=".055" />
      </g>
      <g data-joint="card" data-practice-card="" transform={initial.card}>
        <path d={`M0 0H${width}V${depth}H.11L0 ${depth-.12}Z`} fill="#6a7c8d" transform="translate(.003 .032)" />
        <path d={`M0 0H${width}V${depth}H.11L0 ${depth-.12}Z`} fill={paper} stroke="#536779" strokeWidth=".020" />
        <path d={`M0 ${depth-.32}L.29 ${depth}H.11L0 ${depth-.12}Z`} fill={navy} />
        <path d="M.13 .18H.66" stroke={navy} strokeWidth=".063" />
        <path d="M.13 .36H1.08M.13 .47H.88" stroke="#aab7c2" strokeWidth=".033" />
        <path data-practice-card-tip="" d={`M${width-.18} ${depth}L${width} ${depth-.17}V${depth}Z`}
          fill="#ad865c" stroke="#806c52" strokeWidth=".014" />
      </g>
      <Block from={[-2.48,.25,.59]} to={[-1.78,.59,.73]} face="#63798d" wall="#455b73" />
      <g data-joint="guide" data-practice-guide="" transform={initial.guide}>
        <path d="M-.50-.035H.51L.62.055H-.50Z" fill="#8298a7" stroke="#304864" strokeWidth=".022" />
        <path d="M-.50.055H.62V.12H-.50Z" fill={navy} />
        <ellipse cx="-.36" cy=".037" rx=".035" ry=".047" fill={brass} />
      </g>
      <Block from={[rig.lipX,.17,rig.lipZ]} to={[rig.lipX+rig.lipWidth,.66,.85]} face={brass} wall="#796e5c" />
      <Block from={[1.12,.18,.31]} to={[2.45,.51,.44]} face="#708799" wall={slate} />
      <g data-joint="rocker" data-practice-rocker="" transform={initial.rocker}>
        <path d="M-.52-.01L-.47-.08L1.10-.06Q1.18-.06 1.17.015L1.10.06H-.44Z" fill="#9daab1" stroke="#6a7d88" strokeWidth=".018" />
        <circle r=".088" fill="#526476" /><circle r=".048" fill={brass} />
        <circle cx="1.1" cy="-.035" r=".04" fill={navy} />
      </g>
      <Block from={[triggerPinX-.085,.12,triggerZ-.19]} to={[triggerPinX+.085,.38,triggerZ-.03]} face={slate} wall={navy} />
      <g data-joint="trigger" transform={initial.trigger}>
        <path d="M0-.037H.31V-.112H.395V.035H0Z" fill={navy} stroke="#273a52" strokeWidth=".017" />
      </g>
      <g data-practice-trigger-axle="" transform={front(triggerPinX, triggerY, triggerZ)}>
        <circle r=".105" fill={navy} /><circle r=".059" fill={brass} />
      </g>
      {[[-1.95,.27,1.11],[2.05,.16,1.11]].map(([x,y,z]) => <g key={x} transform={front(x,y,z)}>
        <circle r=".072" fill="#82939b" /><circle r=".032" fill={brass} />
      </g>)}
      <path data-joint="cord" data-practice-cord="" d={initial.cord} stroke={navy} strokeWidth="2.05" fill="none" />
      <g data-joint="sleeve" transform={initial.sleeve}><rect x="-4.2" y="-1.8" width="8.4" height="3.6" rx=".9" fill={brass} /></g>
    </g>
  );
}
