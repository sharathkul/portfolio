import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

export type SculptureChapter = "hero" | "operations" | "building" | "clients";
export type SculptureInteraction = { x: number; y: number };
export type StorySculpture = {
  resize(width: number, height: number): void;
  update(progress: number, reducedMotion: boolean, interaction?: SculptureInteraction): void;
  dispose(): void;
};

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const phase = (value: number, start: number, end: number) => clamp((value - start) / (end - start));
const smooth = (value: number) => value * value * (3 - 2 * value);
const mix = THREE.MathUtils.lerp;

/** A small, render-on-demand sculpture. It owns no scroll or animation loop. */
export function createStorySculpture(canvas: HTMLCanvasElement, chapter: SculptureChapter): StorySculpture {
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
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const boxes = new Map<string, THREE.BufferGeometry>();
  const ownGeometry = <T extends THREE.BufferGeometry>(geometry: T): T => { geometries.add(geometry); return geometry; };
  const physical = (color: number, roughness = .38, extra: THREE.MeshPhysicalMaterialParameters = {}) => {
    const material = new THREE.MeshPhysicalMaterial({ color, roughness, metalness: .025, clearcoat: .22, clearcoatRoughness: .3, ...extra });
    materials.add(material);
    return material;
  };
  const porcelain = physical(0xf8f8f4, .38);
  const paper = physical(0xfffefa, .64);
  const ice = physical(0xc3d2e9, .46);
  const blue = physical(0x3156ce, .3, { clearcoat: .45 });
  const deepBlue = physical(0x243d8d, .38);
  const ink = physical(0x67778e, .52);
  const glass = physical(0xdce8f8, .18, { clearcoat: .8 });
  const opticalGlass = physical(0xc9e3f1, .12, { clearcoat: 1, transparent: true, opacity: .58, depthWrite: false });
  const signal = new THREE.MeshStandardMaterial({ color: 0x5ccbea, emissive: 0x5ccbea, emissiveIntensity: .38, roughness: .28, metalness: .02 });
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

  function pageStack(width: number, depth: number, sheets = 3) {
    const group = new THREE.Group();
    for (let index = 0; index < sheets; index++) {
      const sheet = box(group, [width, .055, depth], [(index % 2 ? .025 : -.015), .045 + index * .063, 0], index === 0 ? ice : paper, .025);
      sheet.rotation.y = (index - sheets + 1) * .035;
    }
    const top = .08 + (sheets - 1) * .063;
    for (let index = 0; index < 3; index++) {
      box(group, [width * (index === 2 ? .43 : .65), .013, .026], [-width * .08, top, -depth * .22 + index * depth * .16], index === 0 ? blue : ink, .008);
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

  let animate: (progress: number, reduced: boolean) => void;
  if (chapter === "hero") {
    const shape = new THREE.Shape();
    shape.moveTo(-2.65, -2.3);
    shape.lineTo(-2.65, 1.24);
    shape.quadraticCurveTo(-2.65, 2.38, -1.48, 2.38);
    shape.lineTo(1.48, 2.38);
    shape.quadraticCurveTo(2.65, 2.38, 2.65, 1.24);
    shape.lineTo(2.65, -1.5);
    shape.lineTo(2.34, -1.5);
    shape.lineTo(2.34, 1.24);
    shape.quadraticCurveTo(2.34, 2.07, 1.48, 2.07);
    shape.lineTo(-1.48, 2.07);
    shape.quadraticCurveTo(-2.34, 2.07, -2.34, 1.24);
    shape.lineTo(-2.34, -2.3);
    shape.closePath();
    const geometry = ownGeometry(new THREE.ExtrudeGeometry(shape, { depth: .26, steps: 1, bevelEnabled: true, bevelSegments: 2, bevelSize: .045, bevelThickness: .035, curveSegments: 14 }));
    const back = new THREE.Mesh(geometry, deepBlue);
    back.position.set(.075, .075, -.32);
    back.castShadow = true;
    back.receiveShadow = true;
    model.add(back);
    const frame = new THREE.Mesh(geometry, porcelain);
    frame.castShadow = true;
    frame.receiveShadow = true;
    model.add(frame);
    const cobaltEdge = box(model, [.32, 1.0, .31], [-2.495, -1.8, .015], blue, .045);
    const upperBlade = box(model, [.31, 1.16, .09], [2.62, .92, .31], opticalGlass, .04);
    upperBlade.rotation.set(.03, -.2, -.12);
    const lowerBlade = box(model, [.3, .76, .11], [-2.56, -.18, .31], opticalGlass, .035);
    lowerBlade.rotation.set(-.06, .17, .1);
    const arcLeft = connector(new THREE.CubicBezierCurve3(new THREE.Vector3(-2.48, -1.42, .34), new THREE.Vector3(-2.83, .12, .34), new THREE.Vector3(-2.55, 2.33, .34), new THREE.Vector3(-1.32, 2.24, .34)), .018, signal);
    const arcRight = connector(new THREE.QuadraticBezierCurve3(new THREE.Vector3(1.2, 2.25, .34), new THREE.Vector3(2.52, 2.5, .34), new THREE.Vector3(2.49, .28, .34)), .024, blue);
    animate = progress => {
      const travel = smooth(progress);
      upperBlade.position.y = .92 + travel * .1;
      upperBlade.rotation.y = -.2 + travel * .15;
      lowerBlade.position.y = -.18 - travel * .1;
      cobaltEdge.position.y = -1.8 + travel * .05;
      arcLeft.draw(.62 + progress * .38);
      arcRight.draw(.58 + progress * .42);
    };
  } else if (chapter === "operations") {
    const poses = [
      { x: -1.55, z: -.15, turn: -.16, startX: -2.0, lift: .8, tilt: -.16 },
      { x: 0, z: .5, turn: .12, startX: .08, lift: 1.03, tilt: .13 },
      { x: 1.55, z: -.2, turn: .22, startX: 2.03, lift: .62, tilt: -.1 },
    ];
    const stacks = poses.map((pose, index) => {
      plinth(pose.x, pose.z, 1.55, 1.62);
      const stack = pageStack(1.13, 1.4, index === 1 ? 4 : 3);
      model.add(stack);
      return stack;
    });
    // A folded cobalt corner gives the paper forms a distinct material accent.
    const accent = box(stacks[1], [.36, .035, .18], [.32, .32, -.5], blue, .025);
    accent.rotation.y = -.15;
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
    plinth(-1.8, -.38, 1.45, 1.34);
    plinth(1.8, -.38, 1.45, 1.34);
    plinth(0, .65, 2.36, 1.66);
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

    const intelligence = new THREE.Group();
    intelligence.position.set(-.75, .95, -.7);
    const spineSignal = new THREE.MeshStandardMaterial({ color: 0x5ccbea, emissive: 0x5ccbea, emissiveIntensity: .78, roughness: .24, metalness: .02 });
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
    const productSignal = connector(new THREE.CubicBezierCurve3(hub, new THREE.Vector3(-.75, .65, .2), new THREE.Vector3(.25, .65, .3), new THREE.Vector3(.25, .29, .65)), .018, signal);
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
      product.position.set(.25, mix(.02, .21, rise), .65);
      product.rotation.y = mix(-.15, .02, rise);
      product.scale.setScalar(mix(1.15, 1.35, rise));
    };
  } else {
    function folder() {
      const group = new THREE.Group();
      box(group, [1.36, 1.25, .1], [0, .84, -.11], deepBlue, .055);
      box(group, [.47, .2, .11], [-.35, 1.48, -.105], blue, .045);
      for (let index = 0; index < 3; index++) {
        const sheet = box(group, [1.1, 1.2, .04], [-.035 + index * .023, .89 + index * .055, -.01 + index * .065], paper, .025);
        sheet.rotation.z = (index - 1) * .025;
      }
      for (let index = 0; index < 2; index++) box(group, [.64, .025, .015], [-.08, 1.24 - index * .17, .147], index ? ice : blue, .008);
      box(group, [1.42, .1, .5], [0, .18, .1], deepBlue, .04);
      box(group, [.075, .68, .38], [-.66, .53, .08], blue, .025);
      box(group, [.075, .68, .38], [.66, .53, .08], blue, .025);
      const front = box(group, [1.49, .88, .12], [0, .62, .31], blue, .055);
      front.rotation.x = -.14;
      return group;
    }
    plinth(-1.82, .22, 1.88, 1.58);
    const source = folder();
    model.add(source);
    const sitePoses = [
      { x: .52, z: -1.05, height: .56 },
      { x: 1.96, z: -.58, height: .8 },
      { x: 2.13, z: .86, height: .63 },
      { x: .68, z: 1.24, height: .7 },
    ];
    const sites = sitePoses.map((pose, index) => {
      plinth(pose.x, pose.z, .98, .92);
      const site = new THREE.Group();
      box(site, [.67, pose.height, .57], [0, pose.height / 2 + .03, 0], index % 2 ? blue : porcelain, .065);
      box(site, [.54, pose.height * .71, .035], [0, pose.height / 2 + .04, .3], index % 2 ? opticalGlass : glass, .025);
      box(site, [.035, pose.height * .5, .014], [-.17, pose.height / 2 + .04, .325], signal, .01);
      model.add(site);
      return site;
    });
    const curves = sitePoses.map(pose => new THREE.CubicBezierCurve3(
      new THREE.Vector3(-1.05, .38, .34), new THREE.Vector3(-.28, .72, pose.z * .35),
      new THREE.Vector3(pose.x - .55, .62, pose.z - .1), new THREE.Vector3(pose.x - .27, .3, pose.z + .2),
    ));
    const bridges = curves.map(curve => connector(curve, .034));
    const traces = curves.map(curve => connector(new THREE.CubicBezierCurve3(
      curve.v0.clone().add(new THREE.Vector3(0, .014, 0)), curve.v1.clone().add(new THREE.Vector3(0, .014, 0)),
      curve.v2.clone().add(new THREE.Vector3(0, .014, 0)), curve.v3.clone().add(new THREE.Vector3(0, .014, 0)),
    ), .011, signal));
    const packetPaper = physical(0xfffefa, .6, { transparent: true });
    const packetAccent = physical(0x3156ce, .35, { transparent: true });
    const packet = new THREE.Group();
    box(packet, [.35, .065, .43], [0, 0, 0], packetPaper, .025);
    box(packet, [.2, .014, .034], [-.035, .041, -.08], packetAccent, .008);
    model.add(packet);
    animate = (progress, reduced) => {
      const settle = smooth(phase(progress, .02, .5));
      source.position.set(mix(-2.02, -1.82, settle), mix(.5, .19, settle), .22);
      source.rotation.set(0, mix(-.26, -.05, settle), mix(-.08, 0, settle));
      source.scale.set(1.04, 1.2, 1.1);
      sites.forEach((site, index) => {
        const amount = smooth(phase(progress, .12 + index * .08, .58 + index * .08));
        const pose = sitePoses[index];
        site.position.set(mix(pose.x - .16, pose.x, amount), .19 + (1 - amount) * .26, pose.z);
        site.rotation.y = mix(index % 2 ? .17 : -.17, -.06, amount);
        site.scale.setScalar(mix(.86, 1, amount));
        bridges[index].draw(phase(progress, .15 + index * .09, .58 + index * .09));
        traces[index].draw(phase(progress, .21 + index * .09, .65 + index * .09));
      });
      // Four finite deliveries echo the four client implementations. A
      // single packet resets invisibly at the origin between each branch.
      const delivered = phase(progress, .28, .94);
      const branch = Math.min(3, Math.floor(delivered * 4));
      const travel = delivered >= 1 ? 1 : (delivered * 4) % 1;
      packet.position.copy(curves[branch].getPoint(travel));
      packet.position.y += .09;
      packet.rotation.y = mix(-.3, .3, travel);
      const opacity = reduced ? 0 : clamp(Math.min(travel * 8, (1 - travel) * 8));
      packet.visible = opacity > .001;
      packetPaper.opacity = opacity;
      packetAccent.opacity = opacity;
    };
  }

  const hemisphere = new THREE.HemisphereLight(0xffffff, 0xa8b8d0, 2.3);
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
  const rim = new THREE.DirectionalLight(0x8baaff, 1.05);
  rim.position.set(4, 3, -4);
  scene.add(rim);
  const shadowMaterial = new THREE.ShadowMaterial({ color: 0x39465f, opacity: .2 });
  materials.add(shadowMaterial);
  if (chapter !== "hero") {
    const ground = new THREE.Mesh(ownGeometry(new THREE.PlaneGeometry(30, 30)), shadowMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -.005;
    ground.receiveShadow = true;
    scene.add(ground);
  }

  const apply = (progress: number, reduced: boolean, interaction: SculptureInteraction = { x: 0, y: 0 }) => {
    const p = reduced ? 1 : clamp(progress);
    animate(p, reduced);
    const x = reduced ? 0 : Math.max(-.5, Math.min(.5, interaction.x || 0));
    const y = reduced ? 0 : Math.max(-.5, Math.min(.5, interaction.y || 0));
    model.rotation.y = mix(chapter === "hero" ? -.08 : -.18, chapter === "hero" ? .1 : .16, p) + x * .16;
    model.rotation.x = y * -.1;
    model.updateMatrixWorld(true);
  };

  // Fit the entire motion envelope, not just its final pose, so small phones
  // do not clip a raised document or a folder during a scroll transition.
  const envelope = new THREE.Box3();
  const envelopePoints: THREE.Vector3[] = [];
  const poses = [0, .25, .5, .75, 1].map(progress => ({ progress, interaction: { x: 0, y: 0 } }));
  for (const progress of [0, .5, 1]) for (const x of [-.5, .5]) for (const y of [-.5, .5]) poses.push({ progress, interaction: { x, y } });
  for (const pose of poses) {
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
  const direction = new THREE.Vector3(...(chapter === "hero" ? [.25, .5, 10] : chapter === "building" ? [3.7, 4.7, 9] : chapter === "operations" ? [4.8, 6.8, 8.8] : [4.4, 4.9, 8.6]) as [number, number, number]).normalize();
  let disposed = false;
  let lastProgress = 1;
  let lastReduced = true;
  let lastInteraction: SculptureInteraction = { x: 0, y: 0 };
  let lastWidth = 0;
  let lastHeight = 0;

  const render = () => { if (!disposed) renderer.render(scene, camera); };
  const fitCamera = () => {
    const projected = new THREE.Vector3();
    for (let distance = 5; distance <= 24; distance += .12) {
      camera.position.copy(target).addScaledVector(direction, distance);
      camera.lookAt(target);
      camera.updateProjectionMatrix();
      camera.updateMatrixWorld(true);
      if (envelopePoints.every(point => {
        projected.copy(point).project(camera);
        return Math.abs(projected.x) <= .92 && projected.y <= .9 && projected.y >= (chapter === "hero" ? -.8 : -.7);
      })) break;
    }
  };
  apply(lastProgress, lastReduced);

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
    update(progress, reducedMotion, interaction) {
      if (disposed) return;
      lastProgress = clamp(progress);
      lastReduced = reducedMotion;
      lastInteraction = interaction ?? { x: 0, y: 0 };
      apply(lastProgress, lastReduced, lastInteraction);
      render();
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
