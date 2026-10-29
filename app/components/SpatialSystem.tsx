"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

type Lens = "product" | "people";
type Props = { progress: number; lens: Lens; reducedMotion: boolean };

const COBALT = "#234cc8";
const PORCELAIN = "#eef2f7";
const APRICOT = "#ebc2a4";

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

function linkShape(width: number, height: number, band: number) {
  const outer = roundedShape(width, height, 0.63);
  const inner = roundedShape(width - band * 2, height - band * 2, 0.42);
  outer.holes.push(new THREE.Path(inner.getPoints(32).reverse()));
  return outer;
}

/** A linked sculpture: product structure and the people who connect it. */
export default function SpatialSystem({ progress, lens, reducedMotion }: Props) {
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
    renderer.setClearColor(0xeef2f7, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.04;
    renderer.domElement.style.cssText =
      "display:block;width:100%;height:100%;outline:none;";
    element.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 40);
    camera.position.set(3.05, 2.0, 10.6);
    camera.lookAt(0, 0.05, 0);

    // A soft studio environment gives the materials depth without luminous effects.
    const room = new RoomEnvironment();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const environment = pmrem.fromScene(room, 0.04);
    scene.environment = environment.texture;
    scene.environmentIntensity = 1.45;
    room.dispose();
    pmrem.dispose();
    scene.add(new THREE.AmbientLight(0xcbd8ee, 1.3));
    const key = new THREE.DirectionalLight(0xffffff, 3.7);
    key.position.set(-3, 6, 6);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xa8c4ff, 1.6);
    fill.position.set(4, -1, -2);
    scene.add(fill);
    const warm = new THREE.DirectionalLight(0xffe9d9, 1.9);
    warm.position.set(-4, -3, 2);
    scene.add(warm);

    const sculpture = new THREE.Group();
    sculpture.rotation.set(-0.08, -0.1, -0.12);
    scene.add(sculpture);
    const geometries: THREE.BufferGeometry[] = [];
    const materials: THREE.Material[] = [];
    const ownGeometry = <T extends THREE.BufferGeometry>(geometry: T) => {
      geometries.push(geometry);
      return geometry;
    };
    const ownMaterial = <T extends THREE.Material>(material: T) => {
      materials.push(material);
      return material;
    };
    const porcelain = ownMaterial(
      new THREE.MeshPhysicalMaterial({
        color: PORCELAIN,
        metalness: 0.12,
        roughness: 0.22,
        clearcoat: 0.9,
        clearcoatRoughness: 0.15,
      }),
    );
    const cobalt = ownMaterial(
      new THREE.MeshPhysicalMaterial({
        color: COBALT,
        metalness: 0.46,
        roughness: 0.21,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
      }),
    );
    const frosted = ownMaterial(
      new THREE.MeshPhysicalMaterial({
        color: "#b6c9e4",
        metalness: 0.08,
        roughness: 0.28,
        transparent: true,
        opacity: 0.77,
        clearcoat: 1,
        clearcoatRoughness: 0.15,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    );
    const ceramic = ownMaterial(
      new THREE.MeshPhysicalMaterial({
        color: APRICOT,
        metalness: 0.1,
        roughness: 0.23,
        clearcoat: 0.8,
        clearcoatRoughness: 0.17,
      }),
    );
    const brushedEdge = ownMaterial(
      new THREE.MeshStandardMaterial({
        color: "#8aa4c9",
        metalness: 0.72,
        roughness: 0.27,
      }),
    );

    // Alternating planes form a single chain. Its open centres deliberately
    // remove the screen metaphor; the connecting structure is the subject.
    const linkGeometry = ownGeometry(
      new THREE.ExtrudeGeometry(linkShape(3.25, 2.16, 0.29), {
        depth: 0.24,
        bevelEnabled: true,
        bevelSegments: 5,
        steps: 1,
        bevelSize: 0.075,
        bevelThickness: 0.075,
        curveSegments: 24,
      }),
    );
    linkGeometry.translate(0, 0, -0.12);
    const configs = [
      {
        position: new THREE.Vector3(-0.55, -1.07, 0.6),
        rotation: new THREE.Euler(-0.16, -0.2, -0.3),
        materials: [porcelain, cobalt],
      },
      {
        position: new THREE.Vector3(0.03, 0.08, 0),
        rotation: new THREE.Euler(0.12, 1.15, -0.3),
        materials: [cobalt, cobalt],
      },
      {
        position: new THREE.Vector3(0.6, 1.22, -0.55),
        rotation: new THREE.Euler(-0.16, -0.2, -0.3),
        materials: [frosted, brushedEdge],
      },
    ];
    const links = configs.map((config) => {
      const group = new THREE.Group();
      group.position.copy(config.position);
      group.rotation.copy(config.rotation);
      group.add(new THREE.Mesh(linkGeometry, config.materials));
      sculpture.add(group);
      return { group, start: config.position, rotation: config.rotation };
    });

    // Two deliberately placed couplings make the joints visible as the chain
    // opens. They do not orbit or simulate activity, and carry no invented data.
    const couplings = new THREE.Group();
    links[1].group.add(couplings);
    const jointGeometry = ownGeometry(new THREE.CapsuleGeometry(0.11, 0.3, 6, 20));
    const collarGeometry = ownGeometry(new THREE.TorusGeometry(0.122, 0.022, 8, 28));
    const joints = [
      new THREE.Vector3(0, -1.08, 0.22),
      new THREE.Vector3(0, 1.08, 0.22),
    ].map((position) => {
      const group = new THREE.Group();
      const body = new THREE.Mesh(jointGeometry, ceramic);
      body.rotation.z = Math.PI / 2;
      group.add(body);
      [-0.15, 0.15].forEach((offset) => {
        const collar = new THREE.Mesh(collarGeometry, brushedEdge);
        collar.rotation.y = Math.PI / 2;
        collar.position.x = offset;
        group.add(collar);
      });
      group.position.copy(position);
      couplings.add(group);
      return { group, position };
    });

    let frame = 0;
    let disposed = false;
    let contextLost = false;
    let inView = true;
    const pointer = new THREE.Vector2();
    const smoothPointer = new THREE.Vector2();
    const porcelainColor = new THREE.Color(PORCELAIN);
    const porcelainPeopleColor = new THREE.Color("#dce5f2");
    const ceramicColor = new THREE.Color(APRICOT);
    const ceramicPeopleColor = new THREE.Color("#e9b58b");
    let easedProgress = live.current.progress;
    let easedLens = live.current.lens === "people" ? 1 : 0;
    const render = () => {
      frame = 0;
      if (disposed || contextLost || document.hidden || !inView) return;
      const { progress: p, reducedMotion: reduced, lens: currentLens } = live.current;
      easedProgress = reduced ? p : THREE.MathUtils.lerp(easedProgress, p, 0.065);
      easedLens = reduced
        ? Number(currentLens === "people")
        : THREE.MathUtils.lerp(easedLens, Number(currentLens === "people"), 0.075);
      const unfold = THREE.MathUtils.smoothstep(easedProgress, 0.03, 0.84);
      if (reduced) smoothPointer.set(0, 0);
      else smoothPointer.lerp(pointer, 0.045);
      sculpture.rotation.set(
        -0.08 + smoothPointer.y * 0.045,
        -0.1 + unfold * 0.38 + smoothPointer.x * 0.075,
        -0.12 + unfold * 0.09,
      );
      links.forEach(({ group, start, rotation }, index) => {
        const direction = index - 1;
        group.position.set(
          start.x + direction * unfold * 0.14,
          start.y + direction * unfold * 0.28,
          start.z + direction * unfold * -0.13,
        );
        group.rotation.set(
          rotation.x + direction * unfold * 0.08,
          rotation.y + (index === 1 ? -1 : 0.15) * unfold * 0.25 + easedLens * direction * 0.12,
          rotation.z + direction * unfold * 0.04,
        );
      });
      joints.forEach(({ group, position }) => {
        group.position.copy(position);
        group.scale.setScalar(0.94 + easedLens * 0.19);
      });
      porcelain.color.copy(porcelainColor).lerp(porcelainPeopleColor, easedLens * 0.35);
      ceramic.color.copy(ceramicColor).lerp(ceramicPeopleColor, easedLens);
      camera.position.x = 3.05 - unfold * 1.1;
      camera.position.y = 2.0 - unfold * 0.65;
      camera.lookAt(0, 0.05, 0);
      renderer.render(scene, camera);
      const isSettling =
        Math.abs(easedProgress - p) > 0.0001 ||
        Math.abs(easedLens - Number(currentLens === "people")) > 0.0001 ||
        smoothPointer.distanceToSquared(pointer) > 0.000001;
      if (!reduced && isSettling) frame = requestAnimationFrame(render);
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
      camera.fov = width / height < 0.85 ? 40 : 34;
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
      request();
    };
    const leave = () => {
      pointer.set(0, 0);
      request();
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
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
      environment.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{ position: "relative", width: "100%", height: "100%", minHeight: 320 }}
    >
      <div ref={host} style={{ position: "absolute", inset: 0, opacity: fallback ? 0 : 1 }} />
      {fallback && (
        <svg
          viewBox="0 0 600 600"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        >
          <defs>
            <linearGradient id="sculpture-porcelain" x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="#f9fbff" />
              <stop offset="1" stopColor="#aabdd7" />
            </linearGradient>
          </defs>
          <g transform="translate(300 300) rotate(-27)" fill="none" strokeWidth="27">
            <rect x="-105" y="-215" width="210" height="170" rx="50" stroke="#aabdd7" />
            <rect x="-60" y="-82" width="120" height="170" rx="42" stroke={COBALT} />
            <rect x="-105" y="45" width="210" height="170" rx="50" stroke="url(#sculpture-porcelain)" />
            <path d="M0-60v17M0 51v17" stroke={APRICOT} strokeWidth="22" strokeLinecap="round" />
          </g>
        </svg>
      )}
    </div>
  );
}
