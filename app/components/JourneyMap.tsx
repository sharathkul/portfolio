"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
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
  { label: "Co-founding", desktop: { x: 235, y: 280 }, mobile: { x: 235, y: 105 }, labelDesktop: { x: 235, y: 311 }, labelMobile: { x: 235, y: 130 } },
  { label: "California", desktop: { x: 398, y: 190 }, mobile: { x: 82, y: 175 }, labelDesktop: { x: 398, y: 139 }, labelMobile: { x: 82, y: 200 } },
  { label: "Juniper", desktop: { x: 555, y: 270 }, mobile: { x: 235, y: 245 }, labelDesktop: { x: 555, y: 301 }, labelMobile: { x: 235, y: 270 } },
  { label: "TNG", desktop: { x: 710, y: 180 }, mobile: { x: 82, y: 315 }, labelDesktop: { x: 710, y: 129 }, labelMobile: { x: 82, y: 340 } },
  { label: "nCare", desktop: { x: 870, y: 92 }, mobile: { x: 175, y: 385 }, labelDesktop: { x: 870, y: 41 }, labelMobile: { x: 175, y: 410 } },
];

const paths = {
  desktop: "M70 200C125 184 170 310 235 280S338 149 398 190S493 315 555 270S652 139 710 180S814 111 870 92",
  mobile: "M82 35C82 73 235 61 235 105S82 132 82 175S235 201 235 245S82 270 82 315S175 346 175 385",
};

const scopes = [
  { title: "People", detail: "Teams and managers", desktop: { x: 765, y: 251 }, mobile: { x: 55, y: 470 } },
  { title: "Product", detail: "HEMI + engineering", desktop: { x: 905, y: 269 }, mobile: { x: 175, y: 470 } },
  { title: "Delivery", detail: "Care, RCM, clients", desktop: { x: 1030, y: 245 }, mobile: { x: 295, y: 470 } },
];

function Company({ href, children }: { href: string; children: ReactNode }) {
  return <a href={href} target="_blank" rel="noreferrer">{children}</a>;
}

function Detail({ selected }: { selected: number }) {
  switch (selected) {
    case 0:
      return <>I began in brand and campaign work at <Company href="https://bbdo.com/">BBDO</Company>, learning to understand clients and carry work through.</>;
    case 1:
      return <>Co-founding a business put clients, finances, sales, and day-to-day decisions on the same desk.</>;
    case 2:
      return <>I moved to California for my MBA and to explore the technology world.</>;
    case 3:
      return <>During my MBA, a marketing operations internship at <Company href="https://www.juniper.net/us/en.html">Juniper</Company> brought me into stakeholder research and an internal marketing portal.</>;
    case 4:
      return <>I joined <Company href="https://www.thenephrologygroupinc.com/">The Nephrology Group</Company> in 2023 in business intelligence and analytics, then learned the practice and its workflows from the inside.</>;
    default:
      return <>Today I lead <Company href="https://ncaremd.com/">nCare’s</Company> day-to-day operations below the CEO, connecting teams, product development, care and RCM programs, and client delivery.</>;
  }
}

function Platform({ point, selected = false }: { point: Point; selected?: boolean }) {
  return (
    <g transform={`translate(${point.x} ${point.y})`} className={selected ? styles.selectedStop : undefined}>
      <path className={styles.platformShadow} d="m-31 3 31-14 31 14-31 15Z" transform="translate(0 9)" />
      <path className={styles.platformSide} d="m-31 0 31 14 31-14v9L0 23-31 9Z" />
      <path className={styles.platformTop} d="m-31 0 31-14 31 14L0 14Z" />
      <circle className={styles.stopPin} cx="0" cy="-2" r="5" />
    </g>
  );
}

function Drawing({ mobile, selected, id }: { mobile: boolean; selected: number; id: string }) {
  const route = mobile ? paths.mobile : paths.desktop;
  const branch = mobile
    ? ["M175 396v26Q175 443 55 470", "M175 396v74", "M175 396v26Q175 443 295 470"]
    : ["M870 103v69Q870 199 765 251", "M870 103v79Q870 220 905 269", "M870 103v69Q870 199 1030 245"];
  return (
    <svg
      viewBox={mobile ? "0 0 350 550" : "0 0 1100 390"}
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
      {stops.map((stop, index) => <Platform key={stop.label} point={mobile ? stop.mobile : stop.desktop} selected={selected === index} />)}
      {scopes.map((scope) => <Platform key={scope.title} point={mobile ? scope.mobile : scope.desktop} />)}
      <path className={styles.thread} d={route} pathLength="1" />
      {branch.map((d, index) => <path key={index} className={styles.branchThread} d={d} pathLength="1" />)}
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
  const [traced, setTraced] = useState(false);
  const host = useRef<HTMLDivElement>(null);
  const id = useId().replace(/:/g, "");
  const detailId = `${id}-journey-detail`;

  useEffect(() => {
    const element = host.current;
    if (!element || reducedMotion || traced) return;
    if (!("IntersectionObserver" in window)) {
      setTraced(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setTraced(true);
        observer.disconnect();
      }
    }, { threshold: 0.25 });
    observer.observe(element);
    return () => observer.disconnect();
  }, [reducedMotion, traced]);

  return (
    <div ref={host} className={styles.map} data-traced={traced} data-reduced-motion={reducedMotion}>
      <div className={styles.drawing} role="group" aria-label="Career journey. Select a stop to read the short version.">
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
      <p id={detailId} className={styles.detail} aria-live="polite">
        <Detail selected={selected} />
      </p>
    </div>
  );
}
