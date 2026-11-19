"use client";

import { useEffect, useId, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import ThreadOrb from "./ThreadOrb";
import styles from "./JourneyMap.module.css";

type Props = { reducedMotion?: boolean };
type Point = { x: number; y: number };
type Stop = {
  label: string;
  desktop: Point;
  mobile: Point;
  labelDesktop: Point;
  labelMobile: Point;
};

const stops: Stop[] = [
  { label: "BBDO", desktop: { x: 70, y: 200 }, mobile: { x: 82, y: 35 }, labelDesktop: { x: 70, y: 231 }, labelMobile: { x: 168, y: 33 } },
  { label: "Business", desktop: { x: 235, y: 280 }, mobile: { x: 235, y: 105 }, labelDesktop: { x: 235, y: 311 }, labelMobile: { x: 144, y: 103 } },
  { label: "California", desktop: { x: 398, y: 190 }, mobile: { x: 82, y: 175 }, labelDesktop: { x: 398, y: 139 }, labelMobile: { x: 180, y: 173 } },
  { label: "Juniper", desktop: { x: 555, y: 270 }, mobile: { x: 235, y: 245 }, labelDesktop: { x: 555, y: 301 }, labelMobile: { x: 149, y: 243 } },
  { label: "TNG", desktop: { x: 710, y: 180 }, mobile: { x: 82, y: 315 }, labelDesktop: { x: 710, y: 129 }, labelMobile: { x: 158, y: 313 } },
  { label: "nCare", desktop: { x: 870, y: 92 }, mobile: { x: 175, y: 385 }, labelDesktop: { x: 870, y: 41 }, labelMobile: { x: 259, y: 383 } },
];

const paths = {
  desktop: "M70 198C125 184 170 310 235 280S338 149 398 190S493 315 555 270S652 139 710 180S814 111 870 90",
  mobile: "M82 33C82 73 235 61 235 105S82 132 82 175S235 201 235 245S82 270 82 315S175 346 175 383",
};

type Cubic = [Point, Point, Point, Point];
const pt = (x: number, y: number): Point => ({ x, y });
const xy = (p: Point) => `${p.x.toFixed(2)} ${p.y.toFixed(2)}`;
const pointAt = (a: Point, b: Point, t: number) => pt(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
const advance = (p: Point, v: Point, n: number) => pt(p.x + v.x * n, p.y + v.y * n);

// Split the original rail so only the few millimetres around a pin change.
function split([a, b, c, d]: Cubic, t: number): [Cubic, Cubic] {
  const ab = pointAt(a, b, t), bc = pointAt(b, c, t), cd = pointAt(c, d, t);
  const left = pointAt(ab, bc, t), right = pointAt(bc, cd, t);
  const middle = pointAt(left, right, t);
  return [[a, ab, left, middle], [middle, right, cd, d]];
}

function pinWrap(center: Point, forward: Point, explored: boolean) {
  const rx = explored ? 15.5 : 11.5, ry = explored ? 10.5 : 8;
  const angle = Math.atan2(forward.y / ry, forward.x / rx) - Math.PI / 4;
  const ellipse = (a: number) => pt(center.x + rx * Math.cos(a), center.y + ry * Math.sin(a));
  const tangent = (a: number) => {
    const x = -rx * Math.sin(a), y = ry * Math.cos(a), length = Math.hypot(x, y);
    return pt(x / length, y / length);
  };
  const end = angle + Math.PI * 1.5;
  const enter = ellipse(angle), leave = ellipse(end);
  return { enter, leave, into: tangent(angle), out: tangent(end),
    arc: `A${rx} ${ry} 0 1 1 ${xy(leave)}` };
}

function tracedRoute(mobile: boolean, explored: number | null) {
  const pins = stops.map(s => {
    const p = mobile ? s.mobile : s.desktop;
    return pt(p.x, p.y - 2);
  });
  const controls = mobile
    ? [pt(235, 61), pt(82, 132), pt(235, 201), pt(82, 270), pt(175, 346)]
    : [pt(170, 310), pt(338, 149), pt(493, 315), pt(652, 139), pt(814, 111)];
  const first = mobile ? pt(82, 73) : pt(125, 184);
  const winds = pins.map((pin, i) => pinWrap(pin,
    i ? pt(pin.x - controls[i - 1].x, pin.y - controls[i - 1].y) : pt(first.x - pin.x, first.y - pin.y),
    i === explored));
  const firstWrap = winds[0];
  let d = `M${xy(pins[0])} Q${xy(advance(firstWrap.enter, firstWrap.into, -5))} ${xy(firstWrap.enter)} ${firstWrap.arc}`;
  controls.forEach((last, i) => {
    const handle = i ? pointAt(controls[i - 1], pins[i], 2) : first;
    const [depart, rest] = split([pins[i], handle, last, pins[i + 1]], .16);
    const [rail, approach] = split(rest, .68 / .84);
    const from = winds[i], to = winds[i + 1];
    d += ` C${xy(advance(from.leave, from.out, 9))} ${xy(depart[2])} ${xy(depart[3])}`;
    d += ` C${xy(rail[1])} ${xy(rail[2])} ${xy(rail[3])}`;
    d += ` C${xy(approach[1])} ${xy(advance(to.enter, to.into, -9))} ${xy(to.enter)} ${to.arc}`;
  });
  const last = winds[winds.length - 1];
  d += ` Q${xy(advance(last.leave, last.out, 5))} ${xy(pins[pins.length - 1])}`;
  const detail = explored === null ? "" : `M${xy(winds[explored].enter)} ${winds[explored].arc}`;
  return { d, detail };
}

const scopes = [
  { title: "People", detail: "Care & operations", desktop: { x: 765, y: 251 }, mobile: { x: 55, y: 470 } },
  { title: "Product", detail: "Internal platform", desktop: { x: 905, y: 269 }, mobile: { x: 175, y: 470 } },
  { title: "Delivery", detail: "Care & clients", desktop: { x: 1030, y: 245 }, mobile: { x: 295, y: 470 } },
];

function Company({ href, children }: { href: string; children: ReactNode }) {
  return <a href={href} target="_blank" rel="noreferrer">{children}</a>;
}

function Detail({ selected }: { selected: number }) {
  switch (selected) {
    case 0:
      return <>Brand and campaign work at <Company href="https://bbdo.com/">BBDO</Company>.</>;
    case 1:
      return <>Co-founded a business, with responsibility across clients, sales, finances and operations.</>;
    case 2:
      return <>MBA at California State University, Fresno, 2021–2023. A move to California to explore technology and business.</>;
    case 3:
      return <>At <Company href="https://www.juniper.net/us/en.html">Juniper</Company>, research with the teams using an internal marketing portal helped shape its redesign.</>;
    case 4:
      return <>Reporting, analytics and healthcare operations at <Company href="https://www.thenephrologygroupinc.com/">The Nephrology Group</Company> since 2023.</>;
    default:
      return null;
  }
}

function Platform({ point, selected = false, port }: { point: Point; selected?: boolean; port?: "entry" | "exit" }) {
  return (
    <g transform={`translate(${point.x} ${point.y})`} className={selected ? styles.selectedStop : undefined}>
      <path className={styles.platformShadow} d="m-31 3 31-14 31 14-31 15Z" transform="translate(0 9)" />
      <path className={styles.platformSide} d="m-31 0 31 14 31-14v9L0 23-31 9Z" />
      <path className={styles.platformTop} d="m-31 0 31-14 31 14L0 14Z" />
      <circle className={styles.stopPin} cx="0" cy="-2" r="5" data-thread-port={port} />
    </g>
  );
}

function Drawing({ mobile, selected, visit, id }: { mobile: boolean; selected: number; visit: number; id: string }) {
  const { d, detail } = useMemo(() => tracedRoute(mobile, visit ? selected : null), [mobile, selected, visit]);
  const route = mobile ? paths.mobile : paths.desktop;
  const branch = mobile
    ? ["M175 383V422Q175 443 55 468", "M175 383V468", "M175 383V422Q175 443 295 468"]
    : ["M870 90V172Q870 199 765 249", "M870 90V182Q870 220 905 267", "M870 90V172Q870 199 1030 243"];
  return (
    <svg
      viewBox={mobile ? "0 0 350 550" : "0 0 1100 390"}
      data-journey-drawing={mobile ? "mobile" : "desktop"}
      className={mobile ? styles.mobileDrawing : styles.desktopDrawing}
      aria-hidden="true"
      fill="none"
    >
      <defs>
        <filter id={id} x="-30%" y="-60%" width="160%" height="240%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>
      <path className={styles.routeShadow} d={route} transform="translate(0 9)" filter={`url(#${id})`} />
      <path className={styles.routeDepth} d={route} transform="translate(0 4)" />
      <path className={styles.routeSurface} d={route} />
      {branch.map((d, index) => <path key={index} className={styles.branchSurface} d={d} />)}
      <g className={styles.routeGuide}>
        {branch.map((d, index) => <path key={index} d={d} />)}
      </g>
      {stops.map((stop, index) => <Platform key={stop.label} point={mobile ? stop.mobile : stop.desktop} selected={selected === index} port={index === 0 ? "entry" : undefined} />)}
      {scopes.map((scope) => <Platform key={scope.title} point={mobile ? scope.mobile : scope.desktop} port={scope.title === "Delivery" ? "exit" : undefined} />)}
      <path className={styles.routeGuide} d={d} />
      <path className={styles.thread} data-journey-route="" d={d} pathLength="1" />
      {branch.map((d, index) => <path key={index} className={styles.branchThread} data-journey-branch={scopes[index].title} d={d} pathLength="1" />)}
      {detail && <path key={visit} className={styles.pinTrace} data-map-pin-trace={selected} d={detail} pathLength="1" />}
      <ThreadOrb />
    </svg>
  );
}

function labelPosition(desktop: Point, mobile: Point): CSSProperties {
  return {
    "--desktop-x": `${desktop.x / 11}%`,
    "--desktop-y": `${desktop.y / 3.9}%`,
    "--mobile-x": `${mobile.x / 3.5}%`,
    "--mobile-y": `${mobile.y / 5.5}%`,
  } as CSSProperties;
}

export default function JourneyMap({ reducedMotion = true }: Props) {
  const [{ selected, visit }, select] = useState({ selected: 5, visit: 0 });
  const host = useRef<HTMLDivElement>(null);
  const id = useId().replace(/:/g, "");
  const detailId = `${id}-journey-detail`;

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    const narrow = window.matchMedia("(max-width: 960px)");
    const lengths = new WeakMap<SVGPathElement, number>();
    const views = Array.from(element.querySelectorAll<SVGSVGElement>("[data-journey-drawing]")).map(svg => ({
      svg,
      mobile: svg.dataset.journeyDrawing === "mobile",
      route: svg.querySelector<SVGPathElement>("[data-journey-route]")!,
      delivery: svg.querySelector<SVGPathElement>("[data-journey-branch='Delivery']")!,
      orb: svg.querySelector<SVGGElement>("[data-thread-orb]")!,
      glint: svg.querySelector<SVGGElement>("[data-orb-glint]")!,
      scale: 1,
    }));

    const measure = () => {
      for (const view of views) {
        if (view.mobile === narrow.matches) {
          const width = view.svg.getBoundingClientRect().width;
          if (width > 0) view.scale = view.svg.viewBox.baseVal.width / width;
        }
      }
    };
    const getLength = (path: SVGPathElement) => {
      let length = lengths.get(path);
      if (length === undefined) {
        length = path.getTotalLength();
        lengths.set(path, length);
      }
      return length;
    };
    const paint = (progress: number, paused: boolean) => {
      const total = paused ? 1 : Math.max(0, Math.min(1, progress));
      const route = Math.min(1, total / .72);
      const branches = Math.max(0, (total - .72) / .28);
      element.style.setProperty("--route-remaining", String(1 - route));
      element.style.setProperty("--branch-remaining", String(1 - branches));
      for (const view of views) {
        if (paused || total <= 0 || total >= 1 || narrow.matches !== view.mobile) {
          view.orb.setAttribute("visibility", "hidden");
          continue;
        }
        const path = total < .72 ? view.route : view.delivery;
        const amount = total < .72 ? route : branches;
        const distance = getLength(path) * amount;
        const point = path.getPointAtLength(distance);
        const traveled = (path === view.delivery ? getLength(view.route) : 0) + distance;
        view.orb.setAttribute("transform", `translate(${point.x} ${point.y}) scale(${view.scale})`);
        view.glint.setAttribute("transform", `rotate(${traveled / view.scale * 2})`);
        view.orb.setAttribute("visibility", "visible");
      }
    };
    const restore = () => paint(Number(element.dataset.threadMapProgress ?? 0), element.dataset.threadMapReduced === "true" || reducedMotion);
    const onProgress = (event: Event) => {
      const { progress, reducedMotion: paused } = (event as CustomEvent<{ progress: number; reducedMotion: boolean }>).detail;
      paint(progress, paused);
    };
    element.addEventListener("thread:map-progress", onProgress);
    const observer = new ResizeObserver(() => { measure(); restore(); });
    observer.observe(element);
    measure();
    restore();
    return () => {
      element.removeEventListener("thread:map-progress", onProgress);
      observer.disconnect();
    };
  }, [reducedMotion, selected, visit]);

  return (
    <div ref={host} className={styles.map} data-journey-map data-reduced-motion={reducedMotion}>
      <div className={styles.drawing} role="group" aria-label="Background and experience. Select a stop to learn more.">
        <Drawing mobile={false} selected={selected} visit={visit} id={`${id}-desktop-shadow`} />
        <Drawing mobile selected={selected} visit={visit} id={`${id}-mobile-shadow`} />
        {stops.map((stop, index) => (
          <button
            key={stop.label}
            className={styles.stopButton}
            style={labelPosition(stop.labelDesktop, stop.labelMobile)}
            type="button"
            aria-pressed={selected === index}
            aria-controls={detailId}
            onClick={() => select(current => ({ selected: index, visit: current.visit + 1 }))}
          >
            {stop.label}
          </button>
        ))}
        {scopes.map((scope) => (
          <div
            className={styles.scope}
            key={scope.title}
            style={labelPosition(
              { x: scope.desktop.x, y: scope.desktop.y + 31 },
              { x: scope.mobile.x, y: scope.mobile.y + 26 },
            )}
          >
            <strong>{scope.title}</strong>
            <span>{scope.detail}</span>
          </div>
        ))}
      </div>
      <div className={styles.detailArea} id={detailId} hidden={selected === stops.length - 1}>
        <div className={styles.detailSizer} aria-hidden="true" inert>
          {stops.slice(0, -1).map((stop, index) => (
            <p key={stop.label} className={styles.detail}><Detail selected={index} /></p>
          ))}
        </div>
        <p className={styles.detail} aria-live="polite">
          <Detail selected={selected} />
        </p>
      </div>
    </div>
  );
}
