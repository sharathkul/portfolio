"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
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
  { label: "BBDO", desktop: { x: 70, y: 200 }, mobile: { x: 82, y: 35 }, labelDesktop: { x: 70, y: 231 }, labelMobile: { x: 82, y: 60 } },
  { label: "Business", desktop: { x: 235, y: 280 }, mobile: { x: 235, y: 105 }, labelDesktop: { x: 235, y: 311 }, labelMobile: { x: 235, y: 130 } },
  { label: "California", desktop: { x: 398, y: 190 }, mobile: { x: 82, y: 175 }, labelDesktop: { x: 398, y: 139 }, labelMobile: { x: 82, y: 200 } },
  { label: "Juniper", desktop: { x: 555, y: 270 }, mobile: { x: 235, y: 245 }, labelDesktop: { x: 555, y: 301 }, labelMobile: { x: 235, y: 270 } },
  { label: "TNG", desktop: { x: 710, y: 180 }, mobile: { x: 82, y: 315 }, labelDesktop: { x: 710, y: 129 }, labelMobile: { x: 82, y: 340 } },
  { label: "nCare", desktop: { x: 870, y: 92 }, mobile: { x: 175, y: 385 }, labelDesktop: { x: 870, y: 41 }, labelMobile: { x: 175, y: 410 } },
];

const paths = {
  desktop: "M70 198C125 184 170 310 235 280S338 149 398 190S493 315 555 270S652 139 710 180S814 111 870 90",
  mobile: "M82 33C82 73 235 61 235 105S82 132 82 175S235 201 235 245S82 270 82 315S175 346 175 383",
};

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

function Drawing({ mobile, selected, id }: { mobile: boolean; selected: number; id: string }) {
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
        <path d={route} />
        {branch.map((d, index) => <path key={index} d={d} />)}
      </g>
      {stops.map((stop, index) => <Platform key={stop.label} point={mobile ? stop.mobile : stop.desktop} selected={selected === index} port={index === 0 ? "entry" : undefined} />)}
      {scopes.map((scope) => <Platform key={scope.title} point={mobile ? scope.mobile : scope.desktop} port={scope.title === "Delivery" ? "exit" : undefined} />)}
      <path className={styles.thread} data-journey-route="" d={route} pathLength="1" />
      {branch.map((d, index) => <path key={index} className={styles.branchThread} data-journey-branch={scopes[index].title} d={d} pathLength="1" />)}
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
  const [selected, setSelected] = useState(5);
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
  }, [reducedMotion]);

  return (
    <div ref={host} className={styles.map} data-journey-map data-reduced-motion={reducedMotion}>
      <div className={styles.drawing} role="group" aria-label="Background and experience. Select a stop to learn more.">
        <Drawing mobile={false} selected={selected} id={`${id}-desktop-shadow`} />
        <Drawing mobile selected={selected} id={`${id}-mobile-shadow`} />
        {stops.map((stop, index) => (
          <button
            key={stop.label}
            className={styles.stopButton}
            style={labelPosition(stop.labelDesktop, stop.labelMobile)}
            type="button"
            aria-pressed={selected === index}
            aria-controls={detailId}
            onClick={() => setSelected(index)}
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
