import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { createTileBridge } from "./createTileBridge";
import { createPracticeMechanism } from "./practiceMechanism";

export type SculptureChapter = "operations" | "building" | "clients";
export type SculptureInteraction = { x: number; y: number };
export type ThreadProjection = { x: number; y: number }[];
export type StorySculpture = {
  resize(width: number, height: number): void;
  update(progress: number, reducedMotion: boolean, interaction?: SculptureInteraction, mechanismProgress?: number): void;
  updateMechanism(progress: number, reducedMotion: boolean): void;
  dispose(): void;
};

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const phase = (value: number, start: number, end: number) => clamp((value - start) / (end - start));
const smooth = (value: number) => value * value * (3 - 2 * value);
const mix = THREE.MathUtils.lerp;

/** A small, render-on-demand sculpture. It owns no scroll or animation loop. */
export function createStorySculpture(
  canvas: HTMLCanvasElement,
  chapter: SculptureChapter,
  onProjection: (points: ThreadProjection) => void,
  onMechanismProjection: (points: ThreadProjection) => void,
): StorySculpture {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1.45, .1, 40);
  const model = new THREE.Group();
  scene.add(model);
  const threadAnchors: THREE.Object3D[] = [];
  const bridgeAnchors: THREE.Object3D[] = [];
  let bridge: ReturnType<typeof createTileBridge> | undefined;
  let practice: ReturnType<typeof createPracticeMechanism> | undefined;
  const projectedAnchor = new THREE.Vector3();
  function anchorThread(object: THREE.Object3D, x: number, y: number, z: number) {
    const anchor = new THREE.Object3D();
    anchor.position.set(x, y, z);
    object.add(anchor);
    threadAnchors.push(anchor);
  }
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const boxes = new Map<string, THREE.BufferGeometry>();
  const ownGeometry = <T extends THREE.BufferGeometry>(geometry: T): T => { geometries.add(geometry); return geometry; };
  const physical = (color: THREE.ColorRepresentation, roughness = .38, extra: THREE.MeshPhysicalMaterialParameters = {}) => {
    const material = new THREE.MeshPhysicalMaterial({ color, roughness, metalness: .025, clearcoat: .22, clearcoatRoughness: .3, ...extra });
    materials.add(material);
    return material;
  };
  const theme = getComputedStyle(canvas);
  const accentColor = theme.getPropertyValue("--accent").trim();
  const accentShadow = theme.getPropertyValue("--accent-shadow").trim();
  const accentLight = theme.getPropertyValue("--accent-light").trim();
  const porcelain = physical(0xf8f8f4, .38);
  const paper = physical(0xfffefa, .64);
  const ice = physical(0xc5cbd5, .46);
  const blue = physical(accentColor, .72, { clearcoat: .05 });
  const deepBlue = physical(accentShadow, .72, { clearcoat: .05 });
  const ink = physical(0x67778e, .52);
  const glass = physical(0xdde1e6, .18, { clearcoat: .8 });
  const opticalGlass = physical(0xc5cfdf, .12, { clearcoat: 1, transparent: true, opacity: .58, depthWrite: false });
  const signal = new THREE.MeshStandardMaterial({ color: accentLight, emissive: accentLight, emissiveIntensity: .38, roughness: .28, metalness: .02 });
  materials.add(signal);

  function box(parent: THREE.Object3D, size: [number, number, number], position: [number, number, number], material: THREE.Material, radius = .04) {
    const key = [...size, radius].join(":");
    let geometry = boxes.get(key);
    if (!geometry) {
      geometry = ownGeometry(new RoundedBoxGeometry(...size, 2, radius));
      boxes.set(key, geometry);
    }
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...position);
    mesh.castShadow = Math.min(...size) > .02;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  function pageStack(width: number, depth: number, sheets = 3, markings = true) {
    const group = new THREE.Group();
    for (let index = 0; index < sheets; index++) {
      const sheet = box(group, [width, .055, depth], [(index % 2 ? .025 : -.015), .045 + index * .063, 0], index === 0 ? ice : paper, .025);
      sheet.rotation.y = (index - sheets + 1) * .035;
    }
    const top = .08 + (sheets - 1) * .063;
    if (markings) {
      for (let index = 0; index < 3; index++) {
        box(group, [width * (index === 2 ? .43 : .65), .013, .026], [-width * .08, top, -depth * .22 + index * depth * .16], index === 0 ? blue : ink, .008);
      }
    }
    return group;
  }

  function plinth(x: number, z: number, width: number, depth: number) {
    box(model, [width, .13, depth], [x, .075, z], ice, .09);
    box(model, [width - .04, .045, depth - .04], [x, .153, z], porcelain, .06);
  }

  function connector(curve: THREE.Curve<THREE.Vector3>, radius = .028, material: THREE.Material = blue) {
    const geometry = ownGeometry(new THREE.TubeGeometry(curve, 36, radius, 6, false));
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    model.add(mesh);
    const count = geometry.index?.count ?? geometry.attributes.position.count;
    return { mesh, draw(amount: number) { geometry.setDrawRange(0, Math.floor(count * clamp(amount) / 6) * 6); } };
  }

  let animate: ((progress: number) => void) | undefined;
  if (chapter === "operations") {
    const poses = [
      { x: -1.55, z: -.15, turn: -.16, startX: -2.0, lift: .8, tilt: -.16 },
      { x: 0, z: .5, turn: .12, startX: .08, lift: 1.03, tilt: .13 },
      { x: 1.55, z: -.2, turn: .22, startX: 2.03, lift: .62, tilt: -.1 },
    ];
    const stacks = poses.map((pose, index) => {
      plinth(pose.x, pose.z, 1.55, 1.62);
      const stack = pageStack(1.13, 1.4, index === 1 ? 4 : 3, index === 1);
      if (index === 0) {
        // A care symbol makes the first physical panel legible before its label.
        box(stack, [.12, .025, .63], [0, .235, 0], blue, .025);
        box(stack, [.63, .025, .12], [0, .235, 0], blue, .025);
      } else if (index === 2) {
        const ring = new THREE.Mesh(ownGeometry(new THREE.TorusGeometry(.31, .022, 6, 28)), blue);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = .24;
        stack.add(ring);
        const currencyCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(.08, .25, -.16), new THREE.Vector3(-.06, .25, -.17),
          new THREE.Vector3(-.12, .25, -.08), new THREE.Vector3(-.035, .25, -.015),
          new THREE.Vector3(.095, .25, .05), new THREE.Vector3(.1, .25, .13),
          new THREE.Vector3(-.02, .25, .18), new THREE.Vector3(-.1, .25, .15),
        ]);
        const currency = new THREE.Mesh(ownGeometry(new THREE.TubeGeometry(currencyCurve, 22, .018, 5, false)), blue);
        stack.add(currency);
        box(stack, [.025, .025, .44], [0, .25, 0], blue, .008);
      }
      model.add(stack);
      return stack;
    });
    // The information panel keeps a folded navy corner as the shared accent.
    const accent = box(stacks[1], [.36, .035, .18], [.32, .32, -.5], blue, .025);
    accent.rotation.y = -.15;
    anchorThread(stacks[0], -.48, .20, .28);
    anchorThread(stacks[1], -.08, .265, .46);
    anchorThread(stacks[2], .48, .20, .15);
    const sourceChannel = connector(new THREE.CubicBezierCurve3(new THREE.Vector3(-1.55, .24, .35), new THREE.Vector3(-1.2, .34, 1.04), new THREE.Vector3(-.4, .34, 1.04), new THREE.Vector3(0, .24, .72)), .022, signal);
    const workingChannel = connector(new THREE.CubicBezierCurve3(new THREE.Vector3(1.55, .24, .3), new THREE.Vector3(1.2, .34, .97), new THREE.Vector3(.4, .34, .97), new THREE.Vector3(0, .24, .72)), .03, blue);
    animate = progress => {
      stacks.forEach((stack, index) => {
        const amount = smooth(phase(progress, index * .08, .76 + index * .08));
        const pose = poses[index];
        stack.position.set(mix(pose.startX, pose.x, amount), .195 + pose.lift * (1 - amount), mix(pose.z + .25, pose.z, amount));
        stack.rotation.set(pose.tilt * (1 - amount), pose.turn + (1 - amount) * (index % 2 ? .25 : -.25), (1 - amount) * (index % 2 ? .12 : -.12));
      });
      sourceChannel.draw(phase(progress, .2, .76));
      workingChannel.draw(phase(progress, .34, .9));
    };
  } else if (chapter === "building") {
    const slate = physical(0x475b74, .57, { clearcoat: .08 });
    const metal = physical(0xc0b9a8, .47, { metalness: .28 });
    bridge = createTileBridge({ blue, slate, metal, box, ownGeometry });
    bridge.group.position.set(-2.30, .015, 1.79);
    bridge.group.rotation.y = -.20;
    bridge.group.scale.setScalar(1.84);
    model.add(bridge.group);
    plinth(-1.8, -.38, 1.45, 1.34);
    plinth(1.8, -.38, 1.45, 1.34);
    plinth(.75, .53, 2.36, 1.66);
    const care = pageStack(1.02, 1.2);
    model.add(care);
    const engineering = new THREE.Group();
    box(engineering, [1.28, .98, .16], [0, .61, 0], deepBlue, .07);
    box(engineering, [1.24, .94, .1], [0, .63, .09], blue, .06);
    box(engineering, [.045, .6, .018], [-.51, .63, .155], signal, .012);
    const codeSegments = [
      [[-.24, .78, .156], [-.4, .63, .156]], [[-.4, .63, .156], [-.24, .48, .156]],
      [[.24, .78, .156], [.4, .63, .156]], [[.4, .63, .156], [.24, .48, .156]],
      [[.075, .84, .156], [-.075, .42, .156]],
    ];
    for (const [a, b] of codeSegments) {
      const start = new THREE.Vector3(...a as [number, number, number]);
      const finish = new THREE.Vector3(...b as [number, number, number]);
      const direction = finish.clone().sub(start);
      const mark = new THREE.Mesh(ownGeometry(new THREE.CylinderGeometry(.022, .022, direction.length(), 6)), paper);
      mark.position.copy(start).add(finish).multiplyScalar(.5);
      mark.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
      engineering.add(mark);
    }
    model.add(engineering);

    const product = new THREE.Group();
    box(product, [1.2, .085, .43], [0, .05, .05], porcelain, .04);
    box(product, [.12, .4, .14], [0, .29, -.02], ice, .035);
    box(product, [1.48, .99, .15], [0, .94, -.02], deepBlue, .075);
    box(product, [1.31, .81, .03], [0, .96, .07], glass, .035);
    for (let index = 0; index < 3; index++) {
      box(product, [index === 2 ? .58 : .92, .035, .014], [-.12, 1.18 - index * .18, .095], index === 0 ? blue : porcelain, .012);
    }
    const phone = new THREE.Group();
    box(phone, [.43, .79, .11], [0, .43, 0], deepBlue, .06);
    box(phone, [.34, .65, .025], [0, .44, .066], glass, .035);
    box(phone, [.21, .025, .013], [0, .55, .084], blue, .01);
    phone.position.set(.83, .04, .24);
    phone.rotation.y = -.12;
    product.add(phone);
    model.add(product);
    anchorThread(care, -.42, .20, .20);
    anchorThread(product, -.20, .52, .067);
    anchorThread(engineering, .58, .48, .14);
    // Fixed guides describe the upright face and the surface of the landed
    // deck. Rotating a leaf must never move the thread that drives it.
    for (const point of [bridge.contactPoint(0), bridge.bridgeEntry(0), bridge.bridgeExit(0)]) {
      const anchor = new THREE.Object3D();
      anchor.position.copy(point);
      anchor.position.z = .14;
      bridge.group.add(anchor);
      bridgeAnchors.push(anchor);
    }
    bridgeAnchors.push(threadAnchors[1]);

    const intelligence = new THREE.Group();
    intelligence.position.set(-.75, .95, -.7);
    const spineSignal = new THREE.MeshStandardMaterial({ color: accentLight, emissive: accentLight, emissiveIntensity: .38, roughness: .24, metalness: .02 });
    materials.add(spineSignal);
    const layerPoses = [
      { x: -.05, z: .055, turn: -.1 },
      { x: .105, z: -.04, turn: .12 },
      { x: -.055, z: .04, turn: -.075 },
    ];
    const intelligenceLayers = [0, 1, 2].map(index => {
      const layer = new THREE.Group();
      box(layer, [1.05, .14, .75], [0, 0, 0], index === 1 ? porcelain : blue, .06);
      box(layer, [.98, .035, .68], [0, .088, 0], opticalGlass, .025);
      const trace = box(layer, [.72, .024, .018], [0, -.015, .387], spineSignal, .009);
      intelligence.add(layer);
      return { layer, trace };
    });
    // Alternating perimeter folds leave the center open between the plates.
    // The luminous inner rail describes a single finite assembly sequence.
    const ribPoints = [
      [[-.32, -.4, .2], [-.51, -.4, .2], [-.51, .3, .2], [-.29, .43, .2]],
      [[-.43, .49, -.25], [-.43, .84, -.25], [-.34, 1.025, -.25], [.07, 1.025, -.25]],
      [[.46, 1.1, .29], [.46, 1.43, .29], [.35, 1.65, .29], [-.04, 1.65, .29]],
    ];
    const ribs = ribPoints.map(points => {
      const path = new THREE.CatmullRomCurve3(points.map(point => new THREE.Vector3(...point as [number, number, number])), false, "centripetal");
      const outer = new THREE.Mesh(ownGeometry(new THREE.TubeGeometry(path, 24, .037, 6, false)), blue);
      outer.castShadow = true;
      outer.receiveShadow = true;
      intelligence.add(outer);
      const innerPath = new THREE.CatmullRomCurve3(points.map(point => new THREE.Vector3(point[0], point[1], point[2] + .039)), false, "centripetal");
      const geometry = ownGeometry(new THREE.TubeGeometry(innerPath, 24, .013, 5, false));
      const inner = new THREE.Mesh(geometry, spineSignal);
      intelligence.add(inner);
      const count = geometry.index?.count ?? geometry.attributes.position.count;
      return { geometry, count };
    });
    model.add(intelligence);
    const hub = new THREE.Vector3(-.75, .48, -.52);
    const careLink = connector(new THREE.QuadraticBezierCurve3(new THREE.Vector3(-1.75, .25, -.25), new THREE.Vector3(-1.45, .7, -.2), hub));
    const engineeringLink = connector(new THREE.QuadraticBezierCurve3(new THREE.Vector3(1.75, .25, -.25), new THREE.Vector3(.2, .78, -.58), hub));
    const productSignal = connector(new THREE.CubicBezierCurve3(hub, new THREE.Vector3(-.75, .65, .2), new THREE.Vector3(.76, .65, .3), new THREE.Vector3(.76, .29, .51)), .018, signal);
    animate = progress => {
      const gathering = smooth(phase(progress, .04, .55));
      care.position.set(mix(-2.05, -1.8, gathering), mix(.65, .195, gathering), -.38);
      care.rotation.y = mix(-.38, -.12, gathering);
      engineering.position.set(mix(2.05, 1.8, gathering), mix(.65, .195, gathering), -.38);
      engineering.rotation.y = mix(.3, -.12, gathering);
      careLink.draw(phase(progress, .18, .6));
      engineeringLink.draw(phase(progress, .3, .72));
      intelligenceLayers.forEach(({ layer, trace }, index) => {
        const assembled = smooth(phase(progress, .15 + index * .1, .58 + index * .1));
        const pose = layerPoses[index];
        layer.position.set(pose.x, .42 + index * .62 + (1 - assembled) * .24, pose.z);
        layer.rotation.y = pose.turn + (1 - assembled) * (index % 2 ? .15 : -.15);
        trace.scale.x = Math.max(.001, phase(progress, .24 + index * .1, .62 + index * .1));
      });
      ribs.forEach((rib, index) => rib.geometry.setDrawRange(0, Math.floor(rib.count * phase(progress, .14 + index * .13, .57 + index * .13) / 6) * 6));
      intelligence.rotation.y = mix(-.13, .04, gathering);
      productSignal.draw(phase(progress, .5, .9));
      const rise = smooth(phase(progress, .38, .92));
      product.position.set(.76, mix(.02, .21, rise), .51);
      product.rotation.y = mix(-.15, .02, rise);
      product.scale.setScalar(mix(1.15, 1.35, rise));
    };
  } else {
    const metal = physical(0x9aa7ad, .42, { metalness: .48, clearcoat: .12 });
    const brass = physical(0x86572f, .56, { metalness: .16, clearcoat: .05 });
    practice = createPracticeMechanism({ box, ownGeometry, blue, deepBlue, ice, paper, porcelain, ink, metal, brass });
    model.add(practice.group);
  }

  const hemisphere = new THREE.HemisphereLight(0xffffff, 0xb5bbc6, 2.3);
  scene.add(hemisphere);
  const key = new THREE.DirectionalLight(0xfff8ed, 3.6);
  key.position.set(-3.5, 8, 5.5);
  key.castShadow = true;
  key.shadow.mapSize.set(512, 512);
  key.shadow.camera.left = -6;
  key.shadow.camera.right = 6;
  key.shadow.camera.top = 6;
  key.shadow.camera.bottom = -6;
  key.shadow.camera.near = .5;
  key.shadow.camera.far = 20;
  key.shadow.bias = -.0006;
  key.shadow.normalBias = .025;
  key.shadow.radius = 3;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xe1e5ec, 1.05);
  rim.position.set(4, 3, -4);
  scene.add(rim);
  const shadowMaterial = new THREE.ShadowMaterial({ color: 0x39465f, opacity: .2 });
  materials.add(shadowMaterial);
  const ground = new THREE.Mesh(ownGeometry(new THREE.PlaneGeometry(30, 30)), shadowMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -.005;
  ground.receiveShadow = true;
  scene.add(ground);

  const apply = (progress: number, reduced: boolean, interaction: SculptureInteraction = { x: 0, y: 0 }) => {
    const p = reduced ? 1 : clamp(progress);
    if (practice) {
      // Keep the feeder and its receiving lip in register as the card catches.
      model.updateMatrixWorld(true);
      return;
    }
    animate?.(p);
    const x = reduced ? 0 : Math.max(-.5, Math.min(.5, interaction.x || 0));
    const y = reduced ? 0 : Math.max(-.5, Math.min(.5, interaction.y || 0));
    model.rotation.y = mix(-.18, .16, p) + x * .16;
    model.rotation.x = y * -.1;
    model.updateMatrixWorld(true);
  };

  // Fit the entire motion envelope, not just its final pose, so small phones
  // do not clip a raised document or a folder during a scroll transition.
  const envelope = new THREE.Box3();
  const envelopePoints: THREE.Vector3[] = [];
  const samples = practice ? [0, .22, .40, .48, .69, .9, 1] : [0, .25, .5, .75, 1];
  const poses = samples.map(progress => ({ progress, interaction: { x: 0, y: 0 } }));
  if (!practice) {
    for (const progress of [0, .5, 1]) for (const x of [-.5, .5]) for (const y of [-.5, .5]) {
      poses.push({ progress, interaction: { x, y } });
    }
  }
  for (const pose of poses) {
    practice?.update(pose.progress);
    bridge?.update(pose.progress);
    apply(pose.progress, false, pose.interaction);
    envelope.union(new THREE.Box3().setFromObject(model));
    model.traverse(object => {
      if (!(object instanceof THREE.Mesh)) return;
      if (!object.geometry.boundingBox) object.geometry.computeBoundingBox();
      const bounds = object.geometry.boundingBox;
      if (!bounds) return;
      for (const x of [bounds.min.x, bounds.max.x]) for (const y of [bounds.min.y, bounds.max.y]) for (const z of [bounds.min.z, bounds.max.z]) {
        envelopePoints.push(new THREE.Vector3(x, y, z).applyMatrix4(object.matrixWorld));
      }
    });
  }
  const target = envelope.getCenter(new THREE.Vector3());
  target.y -= (envelope.max.y - envelope.min.y) * .08;
  const direction = new THREE.Vector3(...(chapter === "building" ? [3.7, 4.7, 9] : chapter === "operations" ? [4.8, 6.8, 8.8] : [1.8, 5.7, 10]) as [number, number, number]).normalize();
  let disposed = false;
  let lastWidth = 0;
  let lastHeight = 0;

  function project(point: THREE.Vector3) {
    point.project(camera);
    return {
      x: Math.round(clamp((point.x + 1) / 2) * 10000) / 10000,
      y: Math.round(clamp((1 - point.y) / 2) * 10000) / 10000,
    };
  }

  const render = () => {
    if (disposed) return;
    renderer.render(scene, camera);
    // The renderer has updated the world matrices for this exact pose.
    // Normalized positions remain independent of canvas pixel density.
    if (bridge && lastHeight) {
      const anchors = bridgeAnchors.map(anchor => project(projectedAnchor.setFromMatrixPosition(anchor.matrixWorld)));
      // The thread orb has a CSS-pixel radius, while the scene scales. Locate
      // its centre height on the actual first face at the current resolution.
      const hit = bridgeAnchors[0];
      const surface = anchors[0];
      const testPoint = project(hit.localToWorld(projectedAnchor.set(0, .1, 0)));
      const pixelsPerUnit = (surface.y - testPoint.y) * lastHeight / .1;
      const contactLift = THREE.MathUtils.clamp(8.9 / Math.max(1, pixelsPerUnit), .088, .78);
      anchors[0] = project(hit.localToWorld(projectedAnchor.set(0, contactLift, 0)));
      onMechanismProjection(anchors);
    }
    if (practice) {
      const { group, triggerSurface, trackExitWaypoint } = practice;
      onMechanismProjection([triggerSurface, trackExitWaypoint].map(point =>
        project(group.localToWorld(projectedAnchor.copy(point)))));
    } else {
      onProjection(threadAnchors.map(anchor => project(projectedAnchor.setFromMatrixPosition(anchor.matrixWorld))));
    }
  };
  const fitCamera = () => {
    const projected = new THREE.Vector3();
    for (let distance = 5; distance <= 24; distance += .12) {
      camera.position.copy(target).addScaledVector(direction, distance);
      camera.lookAt(target);
      camera.updateProjectionMatrix();
      camera.updateMatrixWorld(true);
      if (envelopePoints.every(point => {
        projected.copy(point).project(camera);
        return Math.abs(projected.x) <= .92 && projected.y <= .9 && projected.y >= (practice || bridge ? -.84 : -.7);
      })) break;
    }
  };
  const mechanism = practice || bridge;
  mechanism?.update(1);
  apply(1, true);

  return {
    resize(width, height) {
      if (disposed || width <= 0 || height <= 0) return;
      const nextWidth = Math.max(1, Math.round(width));
      const nextHeight = Math.max(1, Math.round(height));
      if (nextWidth === lastWidth && nextHeight === lastHeight) return;
      lastWidth = nextWidth;
      lastHeight = nextHeight;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setSize(nextWidth, nextHeight, false);
      const shadowSize = nextWidth >= 600 ? 1024 : 512;
      if (key.shadow.mapSize.x !== shadowSize) {
        key.shadow.mapSize.set(shadowSize, shadowSize);
        key.shadow.map?.dispose();
        key.shadow.map = null;
      }
      camera.aspect = nextWidth / nextHeight;
      fitCamera();
      render();
    },
    update(progress, reducedMotion, interaction, mechanismProgress = 0) {
      if (disposed) return;
      const changed = mechanism?.update(reducedMotion ? 1 : clamp(mechanismProgress));
      if (practice) {
        if (changed) renderer.render(scene, camera);
        return;
      }
      apply(progress, reducedMotion, interaction);
      render();
    },
    updateMechanism(progress, reducedMotion) {
      if (disposed || !mechanism) return;
      // Neither the camera nor a thread anchor moved. Do not notify layout.
      if (mechanism.update(reducedMotion ? 1 : clamp(progress))) renderer.render(scene, camera);
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      geometries.forEach(geometry => geometry.dispose());
      materials.forEach(material => material.dispose());
      key.shadow.map?.dispose();
      renderer.renderLists.dispose();
      renderer.dispose();
      scene.clear();
      // Keep the canvas context restorable when a phone rotates to desktop
      // width and back. Deliberately do not call forceContextLoss here.
    },
  };
}
