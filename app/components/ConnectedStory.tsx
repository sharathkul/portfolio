"use client";

import { useEffect, useId, useRef } from "react";
import styles from "./ConnectedStory.module.css";

type Props = { active: number; reducedMotion: boolean };
type Point = { x: number; y: number };
type Anchor = Point & { scale: number; top: number; height: number };

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

function Paper({ x = 0, y = 0, turn = 0, table = false, tinted = false }: {
  x?: number; y?: number; turn?: number; table?: boolean; tinted?: boolean;
}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${turn})`}>
      <g transform="matrix(.94 .20 -.22 .76 0 0)">
        <path className={styles.paperEdge} d="M-47-62H35L49-48V65H-47Z" transform="translate(4 5)" />
        <path className={tinted ? styles.tintedPaper : styles.paper} d="M-47-62H32L47-47V62H-47Z" />
        <path className={styles.fold} d="M32-62v15h15" />
        {table ? (
          <g className={styles.paperMark}>
            <path d="M-28-31H27V35H-28Z" />
            <path d="M-10-31V35M9-31V35M-28-9H27M-28 13H27" />
          </g>
        ) : (
          <g className={styles.paperMark}>
            <path d="M-27-27H21M-27-7H27M-27 13H13" />
          </g>
        )}
      </g>
    </g>
  );
}

function Folder({ x, y, turn = 0 }: { x: number; y: number; turn?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${turn})`}>
      <g transform="matrix(.96 .20 -.23 .77 0 0)">
        <path className={styles.paperEdge} d="M-66-36H-17L-4-23H68V63H-66Z" transform="translate(3 7)" />
        <path className={styles.tintedPaper} d="M-66-36H-17L-4-23H68V63H-66Z" />
        <path className={styles.paper} d="M-45-59H46V31H-45Z" />
        <path className={styles.paperMark} d="M-27-37H28M-27-18H19" />
        <path className={styles.folderFront} d="M-71-7H72L62 67H-62Z" />
        <path className={styles.folderLip} d="M-71-7H72" />
      </g>
    </g>
  );
}

function Devices({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g transform="matrix(.94 .17 -.18 .79 0 0)">
        <path className={styles.deviceEdge} d="M-81-63H66V30H-81Z" transform="translate(5 5)" />
        <rect className={styles.deviceFace} x="-81" y="-63" width="147" height="93" rx="5" />
        <rect className={styles.deviceGlass} x="-72" y="-54" width="129" height="72" rx="1" />
        <path className={styles.deviceStand} d="M-13 31v23m-34 4h67" />
        <path className={styles.deviceEdge} d="M42-24H89V63H42Z" transform="translate(4 4)" />
        <rect className={styles.deviceFace} x="42" y="-24" width="47" height="87" rx="7" />
        <rect className={styles.deviceGlass} x="48" y="-14" width="35" height="64" rx="2" />
      </g>
    </g>
  );
}

function Engineering({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g transform="matrix(.94 .20 -.22 .76 0 0)">
        <path className={styles.blueEdge} d="M-58-45H58V45H-58Z" transform="translate(5 6)" />
        <path className={styles.bluePlate} d="M-58-45H58V45H-58Z" />
        <g className={styles.codeMark}>
          <path d="m-22-15-15 15 15 15m44-30 15 15-15 15M7-21-7 21" />
        </g>
      </g>
    </g>
  );
}

export default function ConnectedStory({ active, reducedMotion }: Props) {
  const id = useId().replace(/:/g, "");
  const viewport = useRef<SVGSVGElement>(null);
  const route = useRef<SVGPathElement>(null);
  const routeShadow = useRef<SVGPathElement>(null);
  const routeBase = useRef<SVGPathElement>(null);
  const groups = useRef<(SVGGElement | null)[]>([]);
  const sheets = useRef<(SVGGElement | null)[]>([]);
  const jointBranches = useRef<SVGGElement>(null);
  const system = useRef<SVGGElement>(null);
  const deliveryThread = useRef<SVGPathElement>(null);
  const current = useRef({ active, reducedMotion });
  const invalidate = useRef<() => void>(() => {});

  useEffect(() => {
    current.current = { active, reducedMotion };
    invalidate.current();
  }, [active, reducedMotion]);

  useEffect(() => {
    const svg = viewport.current;
    const path = route.current;
    if (!svg || !path) return;
    let frame = 0;
    let disposed = false;
    let anchors: Anchor[] = [];
    let width = window.innerWidth;
    let height = window.innerHeight;
    let mobile = width <= 760;
    let startY = 0;
    let endY = height * 4;
    let length = 1;
    const sections = ["start", "operations", "building", "clients", "journey"]
      .map((name) => document.getElementById(name));

    const render = () => {
      frame = 0;
      if (disposed || document.hidden) return;
      const scroll = window.scrollY;
      const reduced = current.current.reducedMotion;
      svg.setAttribute("viewBox", `0 ${scroll} ${width} ${height}`);
      const drawn = reduced ? 1 : clamp((scroll + height * 0.78 - startY) / Math.max(1, endY - startY));
      path.style.strokeDashoffset = `${(1 - drawn) * length}`;

      anchors.slice(0, 4).forEach((anchor, index) => {
        const group = groups.current[index];
        if (!group) return;
        const local = clamp((scroll + height * 0.62 - anchor.top) / Math.max(height * 0.8, 1));
        const drift = reduced ? 0 : (local - 0.5) * (mobile ? 8 : 18);
        const tilt = reduced ? 0 : (local - 0.5) * (index % 2 ? -3 : 3);
        group.setAttribute("transform", `translate(${anchor.x} ${anchor.y + drift}) scale(${anchor.scale}) rotate(${tilt})`);
        const viewY = anchor.y - scroll;
        const visible = mobile ? clamp((viewY + height * 0.045) / (height * 0.14)) : 1;
        group.style.opacity = `${visible}`;
      });

      // The source documents settle toward one shared working line as the
      // viewer moves through the manual-work chapter.
      const operation = anchors[1];
      if (operation) {
        const settle = reduced ? 0.5 : clamp((scroll + height * 0.5 - operation.top) / Math.max(height, 1));
        const paperPoses = [
          { x: -112, y: -76, turn: -13 },
          { x: 102, y: -24, turn: 10 },
          { x: -24, y: 111, turn: -4 },
        ];
        sheets.current.forEach((sheet, index) => {
          if (!sheet) return;
          const pose = paperPoses[index];
          const amount = 1 - settle * 0.28;
          sheet.setAttribute("transform", `translate(${pose.x * amount} ${pose.y * amount}) rotate(${pose.turn * (1 - settle * 0.5)})`);
        });
      }
      const build = anchors[2];
      if (build && jointBranches.current) {
        const joined = reduced ? 1 : clamp((scroll + height * 0.66 - build.top) / (height * 0.52));
        jointBranches.current.style.strokeDashoffset = `${1 - joined}`;
      }
      const clients = anchors[3];
      if (clients && deliveryThread.current) {
        const delivered = reduced ? 1 : clamp((scroll + height * 0.66 - clients.top) / (height * 0.52));
        deliveryThread.current.style.strokeDashoffset = `${1 - delivered}`;
      }
    };

    const request = () => {
      if (!frame && !disposed && !document.hidden) frame = requestAnimationFrame(render);
    };
    invalidate.current = request;
    const measure = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      mobile = width <= 760;
      const scroll = window.scrollY;
      const intro = sections[0]?.getBoundingClientRect();
      const profile = document.querySelector<HTMLElement>("#start .profile-overview")?.getBoundingClientRect() ?? intro;
      const portrait = document.querySelector<HTMLElement>("#start .intro-portrait")?.getBoundingClientRect();
      const composition = document.querySelector<HTMLElement>("#start .portrait-composition")?.getBoundingClientRect() ?? portrait;
      const origin = document.querySelector<HTMLElement>("#start [data-connector-origin]")?.getBoundingClientRect();
      const edgeX = mobile ? 12 : width * 0.045;
      const portraitOnRight = !mobile && composition && profile
        ? composition.left + composition.width * 0.5 > profile.left + profile.width * 0.5
        : false;
      const profileEdgeX = portraitOnRight
        ? Math.min(width - 12, (profile?.right ?? width - edgeX) + 24)
        : Math.max(12, (profile?.left ?? edgeX) - 24);
      const profileExitY = Math.max(
        (profile?.bottom ?? height * 0.65) + scroll + 28,
        (intro?.bottom ?? height * 0.7) + scroll - 24,
      );
      const beginning = origin ? {
        x: origin.left + origin.width * 0.5,
        y: origin.top + origin.height * 0.5 + scroll,
      } : composition ? {
        x: composition.left + composition.width * (portraitOnRight ? 0.86 : 0.14),
        y: composition.top + composition.height * 0.85 + scroll,
      } : { x: profileEdgeX, y: profileExitY - 40 };
      anchors = sections.map((section, index) => {
        const bounds = section?.getBoundingClientRect();
        const top = bounds ? bounds.top + scroll : index * height;
        const sectionHeight = bounds?.height ?? height;
        if (index === 0) return { x: edgeX, y: profileExitY, scale: 1, top, height: sectionHeight };
        const x = mobile ? width * 0.5
          : width * [0.73, 0.25, 0.75, 0.25, 0.5][index];
        let y = top + height * (mobile ? 0.235 : 0.45);
        const artWidth = mobile ? Math.min(width * 0.92, 410)
          : Math.min(width * 0.43, height * 0.69, 650);
        let scale = artWidth / 510;
        if (mobile && index < 4) {
          const copy = section?.querySelector<HTMLElement>(".scene-copy")?.getBoundingClientRect();
          const headerBottom = document.querySelector(".story-header")?.getBoundingClientRect().bottom ?? 76;
          const artTop = top + Math.max(headerBottom + 2, 76);
          const artBottom = copy ? copy.top + scroll - 18 : top + height * 0.34 - 18;
          const availableHeight = Math.max(100, artBottom - artTop);
          scale = Math.min(scale, availableHeight / [280, 330, 322, 320][index]);
          y = artTop + availableHeight * 0.5;
        }
        groups.current[index]?.style.setProperty("--diagram-label-size", `${mobile ? Math.max(26, 16 / scale) : 23}px`);
        return { x, y, scale, top, height: sectionHeight };
      });
      if (system.current) {
        const stations = [
          { name: "care", position: mobile ? [-145, -42] : [-134, -87], label: mobile ? [-145, -116] : [-139, -162] },
          { name: "engineering", position: mobile ? [140, -42] : [137, -84], label: mobile ? [145, -113] : [143, -157] },
          { name: "product", position: mobile ? [-8, 82] : [-8, 109], label: mobile ? [-6, 160] : [-6, 203] },
        ];
        stations.forEach((station, index) => {
          system.current?.querySelector(`[data-station="${station.name}"]`)?.setAttribute("transform", `translate(${station.position.join(" ")})`);
          const label = system.current?.querySelector(`[data-label="${station.name}"]`);
          label?.setAttribute("x", `${station.label[0]}`);
          label?.setAttribute("y", `${station.label[1]}`);
          jointBranches.current?.querySelectorAll("path")[index]?.setAttribute("d", `M0 0Q${station.position[0] * 0.3} ${station.position[1] * 0.8} ${station.position.join(" ")}`);
        });
      }
      const mapRoot = document.querySelector<HTMLElement>("#journey [data-journey-map]");
      const mapDrawing = mapRoot?.matches("[role='group']") ? mapRoot : mapRoot?.querySelector<HTMLElement>("[role='group']");
      const map = (mapDrawing ?? document.querySelector<HTMLElement>("#journey [aria-label^='Career journey']"))?.getBoundingClientRect();
      const ending = map ? {
        x: map.left + map.width * (mobile ? 82 / 350 : 70 / 1100),
        y: map.top + scroll + map.height * (mobile ? 35 / 550 : 200 / 390),
      } : { x: width * 0.13, y: anchors[4].top + height * 0.6 };
      anchors[4] = { ...anchors[4], ...ending };
      const first = anchors[0];
      // Continue the portrait composition along its outside edge, then turn
      // below the profile with a continuous tangent into the work chapter.
      const shoulderY = Math.min(first.y - 32, (composition?.bottom ?? beginning.y - scroll) + scroll + 18);
      const outside = portraitOnRight ? 1 : -1;
      const departure = Math.min(72, (composition?.width ?? 240) * 0.18);
      let d = `M${beginning.x} ${beginning.y} C${beginning.x + outside * departure} ${beginning.y + departure * 0.65} ${profileEdgeX} ${shoulderY - 32} ${profileEdgeX} ${shoulderY}`;
      d += ` C${profileEdgeX} ${shoulderY + Math.max(16, (first.y - shoulderY) * 0.55)} ${first.x} ${first.y - 28} ${first.x} ${first.y}`;
      anchors.forEach((point, index) => {
        if (!index) return;
        const previous = anchors[index - 1];
        const gap = point.y - previous.y;
        if (index === 1) {
          d += ` C${previous.x} ${previous.y + gap * 0.45} ${point.x} ${point.y - gap * 0.35} ${point.x} ${point.y}`;
        } else if (index === 4) {
          const edgeX = mobile ? 17 : width * 0.045;
          d += ` C${previous.x} ${previous.y + gap * 0.4} ${edgeX} ${previous.y + gap * 0.45} ${edgeX} ${point.y - 55}`;
          d += ` Q${edgeX} ${point.y} ${point.x} ${point.y}`;
        } else if (mobile) {
          const exit = previous.y + Math.min(height * 0.15, gap * 0.2);
          d += ` C${previous.x} ${exit} 12 ${previous.y + 40} 12 ${exit}`;
          d += ` L12 ${point.y - 65} Q12 ${point.y} ${point.x} ${point.y}`;
        } else {
          d += ` C${previous.x} ${previous.y + gap * 0.52} ${point.x} ${point.y - gap * 0.46} ${point.x} ${point.y}`;
        }
      });
      [path, routeBase.current, routeShadow.current].forEach((line) => line?.setAttribute("d", d));
      length = path.getTotalLength();
      path.style.strokeDasharray = `${length}`;
      startY = beginning.y;
      endY = ending.y;
      svg.style.opacity = "1";
      request();
    };
    const onVisibility = () => {
      if (document.hidden && frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      } else request();
    };
    const resize = new ResizeObserver(measure);
    sections.forEach((section) => { if (section) resize.observe(section); });
    document.querySelectorAll("#start .profile-overview, #start .intro-portrait, #start .portrait-composition")
      .forEach((element) => resize.observe(element));
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", measure, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    document.fonts.ready.then(() => { if (!disposed) measure(); });
    measure();
    return () => {
      disposed = true;
      invalidate.current = () => {};
      if (frame) cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", measure);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div className={styles.scene} data-active={active} data-reduced-motion={reducedMotion} aria-hidden="true">
      <svg ref={viewport} className={styles.viewport} viewBox="0 0 1440 900" fill="none" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`${id}-paper`} x1="-60" y1="-70" x2="65" y2="80" gradientUnits="userSpaceOnUse">
            <stop stopColor="#fffefa" /><stop offset="1" stopColor="#e7e8e6" />
          </linearGradient>
          <linearGradient id={`${id}-edge`} x1="0" y1="-70" x2="0" y2="80" gradientUnits="userSpaceOnUse">
            <stop stopColor="#e9edf5" /><stop offset="0.5" stopColor="#c2ccdf" /><stop offset="1" stopColor="#9daac0" />
          </linearGradient>
          <linearGradient id={`${id}-cobalt`} x1="-60" y1="-45" x2="80" y2="60" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6680db" /><stop offset="0.5" stopColor="#3156ce" /><stop offset="1" stopColor="#29449a" />
          </linearGradient>
          <filter id={`${id}-shadow`} x="-50%" y="-50%" width="200%" height="220%">
            <feDropShadow dx="0" dy="9" stdDeviation="10" floodColor="#1c2536" floodOpacity="0.09" />
          </filter>
        </defs>
        <style>{`
          .${styles.paper}, .${styles.deviceFace} { fill: url(#${id}-paper); }
          .${styles.paperEdge}, .${styles.deviceEdge} { fill: url(#${id}-edge); }
          .${styles.bluePlate}, .${styles.folderFront} { fill: url(#${id}-cobalt); }
          .${styles.element} { filter: url(#${id}-shadow); }
        `}</style>
        <path ref={routeShadow} className={styles.routeShadow} />
        <path ref={routeBase} className={styles.routeBase} />
        <path ref={route} className={styles.route} />

        <g ref={(element) => { groups.current[1] = element; }} className={styles.element}>
          <path className={styles.manualThread} d="M-184-44C-97-111 52-43 160-4M-32 86l30 27" />
          <g ref={(element) => { sheets.current[0] = element; }}><Paper table /></g>
          <g ref={(element) => { sheets.current[1] = element; }}><Paper tinted /></g>
          <g ref={(element) => { sheets.current[2] = element; }}><Paper /></g>
        </g>

        <g ref={(element) => { groups.current[2] = element; }} className={styles.element}>
          <g ref={system}>
          <g ref={jointBranches} className={styles.jointBranches}>
            <path d="M0 0Q-37-71-122-81" pathLength="1" />
            <path d="M0 0Q39-69 127-74" pathLength="1" />
            <path d="M0 0Q-2 76-10 111" pathLength="1" />
          </g>
          <g data-station="care"><Paper turn={-8} tinted /></g>
          <g data-station="engineering"><Engineering x={0} y={0} /></g>
          <g data-station="product"><Devices x={0} y={0} /></g>
          <text className={styles.label} data-label="care" textAnchor="middle">Care</text>
          <text className={styles.label} data-label="engineering" textAnchor="middle">Engineering</text>
          <text className={styles.label} data-label="product" textAnchor="middle">Product</text>
          </g>
        </g>

        <g ref={(element) => { groups.current[3] = element; }} className={styles.element}>
          <Folder x={-140} y={-23} turn={-8} />
          <Folder x={140} y={24} turn={6} />
          <path className={styles.deliveryBase} d="M-72-20C-11-104 52 98 105 24" />
          <path ref={deliveryThread} className={styles.deliveryThread} d="M-72-20C-11-104 52 98 105 24" pathLength="1" />
          <text className={styles.label} x="-144" y="-128" textAnchor="middle">nCare</text>
          <text className={styles.label} x="145" y="142" textAnchor="middle">Client teams</text>
        </g>
      </svg>
    </div>
  );
}
