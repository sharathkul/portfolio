"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

type Lens = "product" | "people";
type Props = { progress: number; lens: Lens; reducedMotion: boolean };

const CYAN = "#6ee7ef";
const VIOLET = "#a08cff";
const WARM = "#e7c891";

function roundedShape(width: number, height: number, radius: number) {
  const x = -width / 2;
  const y = -height / 2;
  return new THREE.Shape()
    .moveTo(x + radius, y)
    .lineTo(x + width - radius, y)
    .quadraticCurveTo(x + width, y, x + width, y + radius)
    .lineTo(x + width, y + height - radius)
    .quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    .lineTo(x + radius, y + height)
    .quadraticCurveTo(x, y + height, x, y + height - radius)
    .lineTo(x, y + radius)
    .quadraticCurveTo(x, y, x + radius, y);
}

function panelTexture(title: string, accent: string, variant: number) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 352;
  const ctx = canvas.getContext("2d")!;
  const r = (
    x: number,
    y: number,
    w: number,
    h: number,
    color: string,
    radius = 4,
  ) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, radius);
    ctx.fill();
  };
  r(0, 0, 512, 352, "#091f2b", 15);
  const grad = ctx.createLinearGradient(0, 0, 512, 352);
  grad.addColorStop(0, "rgba(107,209,225,.08)");
  grad.addColorStop(1, "rgba(160,140,255,.04)");
  r(0, 0, 512, 352, "#091f2b", 15);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 352);
  ctx.strokeStyle = "rgba(158,213,230,.12)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, 57);
  ctx.lineTo(512, 57);
  ctx.moveTo(64, 57);
  ctx.lineTo(64, 352);
  ctx.stroke();
  r(22, 23, 14, 14, accent, 4);
  ctx.fillStyle = "#d9edf1";
  ctx.font = "500 15px system-ui, sans-serif";
  ctx.fillText(title, 52, 35);
  ctx.font = "9px monospace";
  ctx.fillStyle = "#7296a4";
  ctx.fillText("SYSTEM / 0" + (variant + 1), 378, 34);
  for (let i = 0; i < 5; i++) {
    r(25, 82 + i * 38, 14, 13, i === variant ? accent : "#24414e", 3);
  }
  ctx.fillStyle = "#8ba9b6";
  ctx.font = "10px monospace";
  ctx.fillText(
    [
      "WORKFLOW OVERVIEW",
      "CARE PROGRAMS",
      "REVENUE OPERATIONS",
      "TEAM & DELIVERY",
    ][variant],
    86,
    86,
  );
  if (variant === 0) {
    const labels = ["Intake", "In progress", "Complete"];
    labels.forEach((label, i) => {
      ctx.fillStyle = "#a4bfca";
      ctx.font = "11px system-ui, sans-serif";
      ctx.fillText(label, 87 + i * 133, 115);
      r(87 + i * 133, 126, 119, 171, "rgba(74,111,129,.10)", 7);
      for (let j = 0; j < 3 - (i === 2 ? 1 : 0); j++) {
        r(95 + i * 133, 136 + j * 49, 103, 40, "#163340", 5);
        r(104 + i * 133, 145 + j * 49, 54 + j * 7, 3, "#7698a6", 1);
        r(104 + i * 133, 156 + j * 49, 37, 3, "#355b6c", 1);
        r(182 + i * 133, 162 + j * 49, 7, 5, i === 2 ? accent : "#446677", 2);
      }
    });
  } else if (variant === 3) {
    const nodes = [
      [273, 134],
      [181, 217],
      [366, 217],
      [126, 284],
      [230, 284],
      [318, 284],
      [422, 284],
    ];
    ctx.strokeStyle = "#446376";
    ctx.lineWidth = 1;
    [
      [0, 1],
      [0, 2],
      [1, 3],
      [1, 4],
      [2, 5],
      [2, 6],
    ].forEach(([a, b]) => {
      ctx.beginPath();
      ctx.moveTo(...(nodes[a] as [number, number]));
      ctx.lineTo(...(nodes[b] as [number, number]));
      ctx.stroke();
    });
    nodes.forEach(([x, y], i) => {
      r(x - 26, y - 13, 52, 26, i === 0 ? "#526788" : "#1a3a48", 5);
      r(x - 14, y - 2, 28, 3, i === 0 ? accent : "#789dab", 1);
    });
  } else {
    for (let i = 0; i < 3; i++) {
      r(86 + i * 133, 108, 118, 61, "#14313f", 7);
      r(98 + i * 133, 121, 46, 3, "#7399a8", 1);
      r(98 + i * 133, 136, 63 - i * 7, 12, i === 1 ? accent : "#a5c4cf", 2);
    }
    for (let i = 0; i < 5; i++) {
      const y = 195 + i * 23;
      r(88, y, 80 + (i % 3) * 19, 4, "#4c7181", 2);
      r(234, y, 54, 4, "#274c5e", 2);
      r(
        337,
        y - 2,
        60 + ((i * 23 + variant * 13) % 70),
        7,
        i === 2 ? accent : "#315767",
        2,
      );
      r(473, y, 8, 4, "#6e9ca9", 2);
    }
  }
  r(87, 322, 36, 3, accent, 1);
  r(133, 322, 61, 3, "#2d5261", 1);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 2;
  return texture;
}

/** An illustrative system model; no patient data or actual product screens. */
export default function SpatialSystem({
  progress,
  lens,
  reducedMotion,
}: Props) {
  const host = useRef<HTMLDivElement>(null);
  const live = useRef({ progress, lens, reducedMotion });
  const invalidate = useRef<() => void>(() => {});
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    live.current = { progress, lens, reducedMotion };
    invalidate.current();
  }, [progress, lens, reducedMotion]);

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "low-power",
      });
    } catch {
      setFallback(true);
      return;
    }
    renderer.setClearColor(0x061923, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.domElement.style.cssText =
      "display:block;width:100%;height:100%;outline:none;";
    element.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 40);
    camera.position.set(2.8, 2.55, 9.8);
    camera.lookAt(0, 0, 0);
    scene.add(new THREE.AmbientLight(0x99c9e0, 2.3));
    const key = new THREE.DirectionalLight(0xd8f8ff, 4);
    key.position.set(-3, 5, 6);
    scene.add(key);
    const edge = new THREE.PointLight(0x937aff, 55, 15);
    edge.position.set(4, -2, 1);
    scene.add(edge);
    const fill = new THREE.PointLight(0x4ae1ed, 35, 15);
    fill.position.set(-4, 1, -1);
    scene.add(fill);

    const system = new THREE.Group();
    system.rotation.set(-0.16, -0.4, -0.14);
    scene.add(system);
    const shapes: THREE.BufferGeometry[] = [];
    const materials: THREE.Material[] = [];
    const textures: THREE.Texture[] = [];
    const ownGeometry = <T extends THREE.BufferGeometry>(g: T) => {
      shapes.push(g);
      return g;
    };
    const ownMaterial = <T extends THREE.Material>(m: T) => {
      materials.push(m);
      return m;
    };
    const colors = [CYAN, VIOLET, "#9ec8ed", WARM];
    const panelConfigs = [
      {
        title: "Workflow",
        size: [3.85, 2.65],
        pos: [-0.25, -0.16, 1.02],
        end: [-0.9, 0.55, 1.0],
      },
      {
        title: "Care",
        size: [3.35, 2.3],
        pos: [0.16, 1.03, 0.06],
        end: [1.0, 1.15, -0.1],
      },
      {
        title: "Revenue",
        size: [3.2, 2.2],
        pos: [0.55, -0.9, -0.65],
        end: [1.15, -1.3, 0.1],
      },
      {
        title: "People",
        size: [2.95, 2.03],
        pos: [-0.95, 0.35, -1.5],
        end: [-1.45, -0.55, -0.8],
      },
    ];
    const plates = panelConfigs.map((config, index) => {
      const group = new THREE.Group();
      const [width, height] = config.size;
      const shape = roundedShape(width, height, 0.13);
      const frameGeometry = ownGeometry(
        new THREE.ExtrudeGeometry(shape, {
          depth: 0.065,
          bevelEnabled: true,
          bevelSegments: 3,
          steps: 1,
          bevelSize: 0.04,
          bevelThickness: 0.03,
          curveSegments: 8,
        }),
      );
      const frameMaterial = ownMaterial(
        new THREE.MeshPhysicalMaterial({
          color: index === 0 ? 0x658a9c : 0x305565,
          metalness: 0.75,
          roughness: 0.24,
          clearcoat: 1,
          clearcoatRoughness: 0.15,
        }),
      );
      group.add(new THREE.Mesh(frameGeometry, frameMaterial));
      const texture = panelTexture(config.title, colors[index], index);
      textures.push(texture);
      const uiMaterial = ownMaterial(
        new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
          opacity: 0.97,
          side: THREE.FrontSide,
        }),
      );
      const face = new THREE.Mesh(
        ownGeometry(
          new THREE.ShapeGeometry(
            roundedShape(width - 0.055, height - 0.055, 0.11),
            8,
          ),
        ),
        uiMaterial,
      );
      // ShapeGeometry's world-space UVs are replaced to fill the panel.
      const uv = face.geometry.attributes.uv;
      const position = face.geometry.attributes.position;
      for (let i = 0; i < uv.count; i++)
        uv.setXY(
          i,
          position.getX(i) / (width - 0.055) + 0.5,
          position.getY(i) / (height - 0.055) + 0.5,
        );
      face.position.z = 0.1;
      group.add(face);
      const linePoints = shape
        .getPoints(45)
        .map((p) => new THREE.Vector3(p.x, p.y, 0.105));
      const outline = new THREE.LineLoop(
        ownGeometry(new THREE.BufferGeometry().setFromPoints(linePoints)),
        ownMaterial(
          new THREE.LineBasicMaterial({
            color: colors[index],
            transparent: true,
            opacity: index === 0 ? 0.65 : 0.32,
          }),
        ),
      );
      group.add(outline);
      // Precision fasteners emphasize that the UI is a dimensional object.
      [-1, 1].forEach((sign) => {
        const screw = new THREE.Mesh(
          ownGeometry(new THREE.CylinderGeometry(0.018, 0.018, 0.015, 8)),
          ownMaterial(
            new THREE.MeshStandardMaterial({
              color: 0xc4d8e1,
              metalness: 1,
              roughness: 0.3,
            }),
          ),
        );
        screw.rotation.x = Math.PI / 2;
        screw.position.set(sign * (width / 2 - 0.09), height / 2 - 0.09, 0.11);
        group.add(screw);
      });
      group.position.fromArray(config.pos);
      group.rotation.z = [0.025, -0.04, 0.055, -0.035][index];
      system.add(group);
      return {
        group,
        uiMaterial,
        start: new THREE.Vector3(...config.pos),
        end: new THREE.Vector3(...config.end),
      };
    });

    // Architectural signal paths form a legible system around the interface stack.
    const network = new THREE.Group();
    system.add(network);
    const nodePositions = [
      [-2.55, 1.9, -0.4],
      [2.45, 1.55, -0.8],
      [2.6, -1.6, -0.1],
      [-2.35, -1.85, 0.3],
      [-2.75, 0.1, 0.7],
      [0.9, 2.35, -1.2],
      [0.35, -2.3, -0.7],
    ].map((p) => new THREE.Vector3(...p));
    const nodeGroups = nodePositions.map((position, i) => {
      const g = new THREE.Group();
      g.position.copy(position);
      const color = colors[i % colors.length];
      const body = new THREE.Mesh(
        ownGeometry(new THREE.OctahedronGeometry(0.105, 0)),
        ownMaterial(
          new THREE.MeshStandardMaterial({
            color,
            metalness: 0.65,
            roughness: 0.21,
            emissive: color,
            emissiveIntensity: 0.12,
          }),
        ),
      );
      body.rotation.z = Math.PI / 4;
      g.add(body);
      const halo = new THREE.Mesh(
        ownGeometry(new THREE.RingGeometry(0.18, 0.19, 36)),
        ownMaterial(
          new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity: 0.4,
            side: THREE.DoubleSide,
          }),
        ),
      );
      g.add(halo);
      network.add(g);
      return g;
    });
    const paths: {
      curve: THREE.CatmullRomCurve3;
      dot: THREE.Mesh;
      phase: number;
      line: THREE.Line;
    }[] = [];
    nodePositions.forEach((node, i) => {
      const target = new THREE.Vector3(
        (i % 2 ? 1 : -1) * 1.25,
        ((i % 3) - 1) * 0.65,
        0.2 - (i % 3) * 0.5,
      );
      const elbow = node.clone().lerp(target, 0.45);
      elbow.z -= 0.45;
      const curve = new THREE.CatmullRomCurve3(
        [node, elbow, target],
        false,
        "catmullrom",
        0.1,
      );
      const line = new THREE.Line(
        ownGeometry(
          new THREE.BufferGeometry().setFromPoints(curve.getPoints(50)),
        ),
        ownMaterial(
          new THREE.LineBasicMaterial({
            color: colors[i % 4],
            transparent: true,
            opacity: 0.3,
          }),
        ),
      );
      network.add(line);
      const dot = new THREE.Mesh(
        ownGeometry(new THREE.SphereGeometry(0.027, 8, 8)),
        ownMaterial(
          new THREE.MeshBasicMaterial({ color: i % 3 === 0 ? WARM : CYAN }),
        ),
      );
      network.add(dot);
      paths.push({ curve, dot, phase: i * 0.153, line });
    });

    // A thin instrument ring grounds the composition without becoming a star field.
    const ring = new THREE.Group();
    ring.position.set(0, -1.7, -0.4);
    ring.rotation.x = -Math.PI / 2;
    const ringMat = ownMaterial(
      new THREE.MeshBasicMaterial({
        color: 0x5898aa,
        transparent: true,
        opacity: 0.23,
        side: THREE.DoubleSide,
      }),
    );
    ring.add(
      new THREE.Mesh(
        ownGeometry(new THREE.RingGeometry(2.5, 2.507, 100)),
        ringMat,
      ),
    );
    const tickPoints: THREE.Vector3[] = [];
    for (let i = 0; i < 64; i++) {
      const a = (i / 64) * Math.PI * 2;
      const length = i % 8 === 0 ? 0.11 : 0.04;
      tickPoints.push(
        new THREE.Vector3(Math.cos(a) * 2.56, Math.sin(a) * 2.56, 0),
        new THREE.Vector3(
          Math.cos(a) * (2.56 + length),
          Math.sin(a) * (2.56 + length),
          0,
        ),
      );
    }
    ring.add(
      new THREE.LineSegments(
        ownGeometry(new THREE.BufferGeometry().setFromPoints(tickPoints)),
        ownMaterial(
          new THREE.LineBasicMaterial({
            color: 0x648f9f,
            transparent: true,
            opacity: 0.4,
          }),
        ),
      ),
    );
    system.add(ring);

    let frame = 0;
    let disposed = false;
    let contextLost = false;
    let inView = true;
    const pointer = new THREE.Vector2();
    const smoothPointer = new THREE.Vector2();
    const timer = new THREE.Timer();
    timer.connect(document);
    let easedProgress = live.current.progress;
    let easedLens = live.current.lens === "people" ? 1 : 0;
    const render = () => {
      frame = 0;
      if (disposed || contextLost || document.hidden || !inView) return;
      const {
        progress: p,
        reducedMotion: reduced,
        lens: currentLens,
      } = live.current;
      timer.update();
      const time = reduced ? 0 : timer.getElapsed();
      easedProgress = reduced
        ? p
        : THREE.MathUtils.lerp(easedProgress, p, 0.055);
      easedLens = reduced
        ? Number(currentLens === "people")
        : THREE.MathUtils.lerp(
            easedLens,
            Number(currentLens === "people"),
            0.06,
          );
      const spread =
        0.2 +
        THREE.MathUtils.smoothstep(easedProgress, 0.04, 0.7) * 0.5 +
        easedLens * 0.2;
      smoothPointer.lerp(reduced ? new THREE.Vector2() : pointer, 0.04);
      system.rotation.y = -0.4 + easedProgress * 0.48 + smoothPointer.x * 0.07;
      system.rotation.x = -0.16 + smoothPointer.y * 0.04;
      system.rotation.z = -0.14 + easedProgress * 0.11;
      system.position.y = reduced ? 0 : Math.sin(time * 0.45) * 0.045;
      plates.forEach(({ group, start, end, uiMaterial }, i) => {
        group.position.lerpVectors(start, end, spread);
        group.rotation.y = spread * [0.02, -0.2, 0.14, 0.12][i];
        group.rotation.z = [0.025, -0.04, 0.055, -0.035][i] * (1 + spread);
        uiMaterial.opacity = 0.98 - easedLens * (i === 3 ? 0 : 0.23);
      });
      network.scale.setScalar(1 + easedLens * 0.09);
      nodeGroups.forEach((g, i) => {
        g.rotation.z = reduced ? 0 : time * 0.08 * (i % 2 ? 1 : -1);
        g.scale.setScalar(1 + easedLens * 0.35);
      });
      paths.forEach(({ curve, dot, phase, line }) => {
        dot.position.copy(curve.getPoint((time * 0.075 + phase) % 1));
        (line.material as THREE.LineBasicMaterial).opacity =
          0.23 + easedLens * 0.3;
      });
      ring.rotation.z = reduced ? 0 : time * 0.012;
      camera.position.x = 2.8 - easedProgress * 1.8;
      camera.position.y = 2.55 - easedProgress * 1.1;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
      if (!reduced) frame = requestAnimationFrame(render);
    };
    const request = () => {
      if (!frame && !disposed && !document.hidden && !contextLost && inView)
        frame = requestAnimationFrame(render);
    };
    invalidate.current = request;
    const resize = () => {
      const width = element.clientWidth;
      const height = element.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      // Preserve the composition on tall mobile canvases.
      camera.fov = width / height < 0.85 ? 41 : 34;
      camera.updateProjectionMatrix();
      request();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    const intersection = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (!inView && frame) {
          cancelAnimationFrame(frame);
          frame = 0;
        }
        if (inView) request();
      },
      { rootMargin: "80px" },
    );
    intersection.observe(element);
    const move = (event: PointerEvent) => {
      const bounds = element.getBoundingClientRect();
      pointer.set(
        (event.clientX - bounds.left) / bounds.width - 0.5,
        (event.clientY - bounds.top) / bounds.height - 0.5,
      );
    };
    const leave = () => {
      pointer.set(0, 0);
    };
    const visibility = () => {
      if (document.hidden && frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      } else request();
    };
    const lost = (event: Event) => {
      event.preventDefault();
      contextLost = true;
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      setFallback(true);
    };
    const restored = () => {
      contextLost = false;
      setFallback(false);
      request();
    };
    element.addEventListener("pointermove", move, { passive: true });
    element.addEventListener("pointerleave", leave);
    document.addEventListener("visibilitychange", visibility);
    renderer.domElement.addEventListener("webglcontextlost", lost);
    renderer.domElement.addEventListener("webglcontextrestored", restored);
    resize();
    return () => {
      disposed = true;
      invalidate.current = () => {};
      if (frame) cancelAnimationFrame(frame);
      observer.disconnect();
      intersection.disconnect();
      element.removeEventListener("pointermove", move);
      element.removeEventListener("pointerleave", leave);
      document.removeEventListener("visibilitychange", visibility);
      renderer.domElement.removeEventListener("webglcontextlost", lost);
      renderer.domElement.removeEventListener("webglcontextrestored", restored);
      shapes.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      textures.forEach((t) => t.dispose());
      timer.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: 320,
      }}
    >
      <div
        ref={host}
        style={{ position: "absolute", inset: 0, opacity: fallback ? 0 : 1 }}
      />
      {fallback && (
        <svg
          viewBox="0 0 600 600"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
          }}
        >
          <defs>
            <linearGradient id="system-glass" x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="#183f50" />
              <stop offset="1" stopColor="#0a2332" />
            </linearGradient>
          </defs>
          <g transform="translate(300 280) rotate(-12) skewY(7)">
            {[-2, -1, 0].map((i) => (
              <rect
                key={i}
                x={-175 + i * 18}
                y={-115 + i * 30}
                width="350"
                height="240"
                rx="12"
                fill="url(#system-glass)"
                stroke={i === 0 ? CYAN : VIOLET}
                strokeOpacity={i === 0 ? 0.7 : 0.35}
              />
            ))}
            <text
              x="-150"
              y="-82"
              fill="#c9e6ee"
              fontFamily="monospace"
              fontSize="13"
            >
              WORKFLOW / CARE / PEOPLE
            </text>
            {[0, 1, 2].map((i) => (
              <g key={i} transform={`translate(${i * 100} 0)`}>
                <rect
                  x="-150"
                  y="-50"
                  width="86"
                  height="143"
                  rx="5"
                  fill="#1c4050"
                />
                {[0, 1, 2].map((j) => (
                  <rect
                    key={j}
                    x="-140"
                    y={-35 + j * 40}
                    width="66"
                    height="27"
                    rx="3"
                    fill="#386072"
                  />
                ))}
              </g>
            ))}
          </g>
          <path
            d="M70 215 100 215 130 295M420 410 460 460 530 460M390 115 460 100"
            fill="none"
            stroke={CYAN}
            strokeOpacity=".55"
          />
          {[
            [70, 215],
            [530, 460],
            [460, 100],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="5" fill={i === 1 ? WARM : CYAN} />
          ))}
        </svg>
      )}
    </div>
  );
}
