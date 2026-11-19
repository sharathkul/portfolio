import * as THREE from "three";
import { cornerRadius, halfThickness, hingeSpacing, tileAngles, tileReach } from "./tileBridgeMotion";

type Triple = [number, number, number];
type BridgeParts = {
  blue: THREE.Material;
  slate: THREE.Material;
  metal: THREE.Material;
  box: (parent: THREE.Object3D, size: Triple, position: Triple, material: THREE.Material, radius?: number) => THREE.Mesh;
  ownGeometry: <T extends THREE.BufferGeometry>(geometry: T) => T;
};

const hingeY = .125;
const rootClearance = .12;
const width = .46;

export function createTileBridge({ blue, slate, metal, box, ownGeometry }: BridgeParts) {
  const group = new THREE.Group();
  group.name = "two-tile-bridge";
  const deckY = hingeY + halfThickness;
  const end = hingeSpacing + tileReach;
  // Short end banks and a low floor make the gap readable when the leaves are up.
  // The space at each root accepts the preceding leaf when both have landed.
  box(group, [.41, deckY, width + .09], [rootClearance - .205, deckY / 2, 0], slate, .012);
  box(group, [.25, deckY, width + .09], [end + .125, deckY / 2, 0], slate, .012);
  box(group, [end - rootClearance, .014, width], [(end + rootClearance) / 2, .007, 0], slate, .006);
  const pinShape = ownGeometry(new THREE.CylinderGeometry(.035, .035, .058, 18));
  pinShape.rotateX(Math.PI / 2);

  function leaf(x: number, finish: THREE.Material) {
    const pivot = new THREE.Group();
    pivot.position.set(x, hingeY, 0);
    group.add(pivot);
    box(pivot, [halfThickness * 2, tileReach - rootClearance, width], [0, (tileReach + rootClearance) / 2, 0], finish, cornerRadius);
    for (const sign of [-1, 1]) {
      const edge = sign * (width / 2 + .022);
      // The two short outboard pins leave the ball's central running surface clear.
      box(group, [.083, hingeY, .03], [x, hingeY / 2, edge + sign * .017], metal, .011);
      box(pivot, [.058, rootClearance + .045, .026], [0, (rootClearance + .045) / 2, edge], finish, .01);
      box(pivot, [.052, .03, .053], [0, rootClearance + .027, sign * (width / 2 + .01)], finish, .007);
      const pin = new THREE.Mesh(pinShape, metal);
      pin.position.set(x, hingeY, edge + sign * .007);
      pin.castShadow = true;
      group.add(pin);
    }
    // A single inlaid line makes the face rotation visible at phone size.
    box(pivot, [.003, .021, width * .62], [halfThickness, tileReach * .76, 0], metal, .001);
    return pivot;
  }

  const first = leaf(0, blue);
  const second = leaf(hingeSpacing, slate);
  first.name = "first-tile";
  second.name = "second-tile";

  function update(progress: number) {
    const [alpha, beta] = tileAngles(progress);
    if (first.rotation.z === -alpha && second.rotation.z === -beta) return false;
    first.rotation.z = -alpha;
    second.rotation.z = -beta;
    return true;
  }

  const contactPoint = (radius = .12) => new THREE.Vector3(-halfThickness - radius, deckY + radius, 0);
  const bridgeEntry = (radius = .12) => new THREE.Vector3(rootClearance, deckY + radius, 0);
  const bridgeExit = (radius = .12) => new THREE.Vector3(end, deckY + radius, 0);
  function rollPoint(t: number, radius = .12) {
    const progress = THREE.MathUtils.clamp(t, 0, 1);
    return new THREE.Vector3(THREE.MathUtils.lerp(-halfThickness - radius, end, progress), deckY + radius, 0);
  }

  return { group, update, contactPoint, bridgeEntry, bridgeExit, rollPoint };
}
