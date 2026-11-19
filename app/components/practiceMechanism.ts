import * as THREE from "three";
import { practiceRig as rig, samplePractice } from "./practiceMotion";

type Triple = [number, number, number];
type Part = THREE.Material;
type Parts = {
  box: (parent: THREE.Object3D, size: Triple, position: Triple, material: Part, radius?: number) => THREE.Mesh;
  ownGeometry: <T extends THREE.BufferGeometry>(geometry: T) => T;
  blue: Part; deepBlue: Part; ice: Part; paper: Part; porcelain: Part; ink: Part; metal: Part; brass: Part;
};

export function createPracticeMechanism({ box, ownGeometry, blue, deepBlue, ice, paper, porcelain, ink, metal, brass }: Parts) {
  const group = new THREE.Group();
  group.name = "practice-paper-feeder";
  const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  function part(name: string) {
    const item = new THREE.Group();
    item.name = name;
    group.add(item);
    return item;
  }

  // A cut outline makes each backing look like a folded file with an index
  // tab. All its edges belong to one sheet, especially at small sizes.
  function cutSheet(parent: THREE.Object3D, outline: number[][], thickness: number, finish: Part | Part[]) {
    const shape = new THREE.Shape();
    outline.forEach(([x, y], i) => i ? shape.lineTo(x, y) : shape.moveTo(x, y));
    shape.closePath();
    const mesh = new THREE.Mesh(ownGeometry(new THREE.ExtrudeGeometry(shape, {
      depth: thickness, bevelEnabled: true, bevelThickness: .009, bevelSize: .009, bevelSegments: 1, steps: 1,
    })), finish);
    mesh.castShadow = mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }
  function spine(x: number, z: number, width: number, finish: Part) {
    const backing = cutSheet(group, [[0, 0], [width, 0], [width, .69], [width - .48, .69], [width - .55, .83],
    [width - .97, .83], [width - 1.04, .69], [0, .69]], .055, finish);
    backing.position.set(x, .19, z);
  }

  // The stock and its destination are shallow open-sided folders. Each sleeve
  // has a folded band at its closed end, leaving the entire handoff in view.
  box(group, [1.58, .075, 1.37], [-1.80, .37, .13], ice, .033);
  box(group, [1.56, .043, 1.35], [-1.80, .424, .13], porcelain, .025);
  spine(-2.58, -.58, 1.55, blue);
  box(group, [.095, .39, 1.33], [-2.54, .57, .13], deepBlue, .025);
  box(group, [.69, .046, 1.30], [-2.23, .68, .13], blue, .020);
  box(group, [.69, .25, .046], [-2.23, .54, .766], deepBlue, .014);
  box(group, [1.82, .085, 1.43], [1.52, .25, -.24], ice, .035);
  box(group, [1.80, .045, 1.41], [1.52, .31, -.24], paper, .025);
  spine(.65, -.97, 1.77, deepBlue);
  box(group, [.085, .43, 1.39], [2.39, .52, -.24], blue, .028);
  box(group, [.49, .045, 1.37], [2.15, .59, -.24], blue, .018);
  const receiverCheek = cutSheet(group, [[0, 0], [1.50, 0], [1.50, .32], [1.03, .32], [.84, .13], [.06, .13]], .047, blue);
  receiverCheek.position.set(.92, .28, .448);

  // Bearing trigger. Its outer bearing race stays at the contact point while
  // the attached paddle rotates into the feeder. The thread uses this face.
  const trigger = part("feed-trigger");
  const [tx, ty, tz] = rig.triggerSurface;
  trigger.position.set(tx + .105, ty, tz);
  const pinGeo = ownGeometry(new THREE.CylinderGeometry(1, 1, 1, 20));
  function pin(parent: THREE.Object3D, x: number, y: number, z: number, r: number, depth: number, finish: Part) {
    const pin = new THREE.Mesh(pinGeo, finish);
    pin.rotation.x = Math.PI / 2;
    pin.scale.set(r, depth, r);
    pin.position.set(x, y, z);
    pin.castShadow = pin.receiveShadow = true;
    parent.add(pin);
    return pin;
  }
  box(group, [.17, .26, .16], [tx + .105, .25, tz - .11], ink, .035);
  pin(trigger, 0, 0, 0, .105, .17, blue);
  pin(trigger, 0, 0, .09, .059, .022, metal);
  box(trigger, [.42, .075, .10], [.19, .012, -.06], blue, .025);
  box(trigger, [.09, .13, .22], [.35, .06, -.13], blue, .023);

  // One solid card. Its clipped corner, ink stripe and tail mark remain fixed
  // on it through the catch and the final partial occlusion by the sleeve.
  const card = part("single-index-card");
  const w = rig.cardWidth / 2, h = rig.cardDepth / 2;
  const stock = cutSheet(card, [[-w, -h + .12], [-w + .12, -h], [w, -h], [w, h], [-w, h]], .034, [paper, ink]);
  stock.rotation.x = -Math.PI / 2;
  // A fine three-sided rule holds the paper silhouette against the pale bed.
  box(card, [rig.cardWidth - .035, .010, .039], [0, .05, -h + .028], blue, .004);
  box(card, [.038, .010, rig.cardDepth - .045], [w - .028, .05, 0], blue, .004);
  box(card, [rig.cardWidth - .15, .010, .042], [.059, .05, h - .030], blue, .004);
  // This folded corner stays attached to the same card all the way into the sleeve.
  const toe = cutSheet(card, [[w - .26, -h + .01], [w - .009, -h + .01], [w - .009, -h + .255]], .012, brass);
  toe.rotation.x = -Math.PI / 2;
  toe.position.y = .059;
  box(card, [.26, .014, .087], [-.40, .053, -.29], blue, .008);
  box(card, [.75, .013, .036], [-.13, .052, -.085], ink, .008);
  box(card, [.48, .013, .03], [-.25, .052, .075], ice, .007);
  const corner = cutSheet(card, [[-w + .14, -h + .012], [-w + .36, -h + .012], [-w + .015, -h + .35], [-w + .015, -h + .14]], .005, blue);
  corner.rotation.x = -Math.PI / 2;
  corner.position.y = .047;

  // A fixed lip on the near side of the receiving pocket. Only the near
  // corner catches. Looking down into the slot reveals the open path behind.
  box(group, [rig.lipWidth, .35, .35], [rig.lipX + rig.lipWidth / 2, .50, rig.lipZ + .175], blue, .017);
  box(group, [.064, .022, .22], [rig.lipX + .036, .678, rig.lipZ + .20], brass, .007);
  box(group, [.58, .075, .12], [.84, .274, .585], ink, .022);
  box(group, [.78, .07, .105], [-.68, .27, -.27], ice, .020);

  // The long arm amplifies the small drop of the receiving shoe. Its tip
  // lifts the cord over the last pulley and draws the upstream guide back.
  const rocker = part("receiving-rocker");
  rocker.position.set(...rig.rockerPivot);
  box(rocker, [1.64, .07, .09], [.29, 0, 0], ink, .024);
  box(rocker, [.22, .070, .68], [-.43, .094, -.25], metal, .021);
  box(rocker, [.10, .11, .09], [-.43, .06, 0], metal, .015);
  pin(group, rocker.position.x, rocker.position.y, rocker.position.z + .045, .086, .13, blue);
  pin(group, rocker.position.x, rocker.position.y, rocker.position.z + .12, .039, .019, metal);
  box(group, [.20, .32, .12], [rocker.position.x, .22, rocker.position.z - .08], ice, .035);

  // The card guide has a single diagonal adjustment slot. Its fixed witness
  // mark makes the upstream travel readable with a stationary camera.
  const slot = box(group, [1.07, .075, .25], [-.74, .34, .55], ice, .035);
  slot.rotation.y = -.725;
  const slit = box(group, [.79, .012, .052], [-.73, .385, .55], ink, .015);
  slit.rotation.y = slot.rotation.y;
  const guide = part("upstream-guide");
  box(guide, [1.13, .245, .095], [0, .505, 0], blue, .024);
  box(guide, [.30, .26, .24], [-.08, .432, .060], blue, .035);
  box(guide, [.14, .024, .18], [-.08, .574, .078], metal, .016);
  const fixedLine = box(group, [.033, .015, .22], [-.46, .409, .77], metal, .006);
  fixedLine.rotation.y = slot.rotation.y;

  // Place the return cord on the audience side of the mechanism. Its ferrule
  // rides with the actual cord, so the return stroke is legible without
  // animated arrows, labels or changing the colour of the card.
  const leftWheel = v(-1.91, .245, 1.14), rightWheel = v(2.10, .195, 1.14);
  for (const center of [leftWheel, rightWheel]) {
    box(group, [.20, center.y, .15], [center.x, center.y / 2, center.z - .09], ice, .024);
    pin(group, center.x, center.y, center.z, .109, .08, ink);
    pin(group, center.x, center.y, center.z + .05, .076, .025, metal);
    pin(group, center.x, center.y, center.z + .068, .029, .014, blue);
  }
  const tube = ownGeometry(new THREE.CylinderGeometry(1, 1, 1, 8));
  const up = v(0, 1, 0), direction = new THREE.Vector3();
  function rod(finish: Part) {
    const mesh = new THREE.Mesh(tube, finish);
    group.add(mesh);
    return mesh;
  }
  function span(mesh: THREE.Mesh, a: THREE.Vector3, b: THREE.Vector3, radius: number) {
    direction.subVectors(b, a);
    mesh.scale.set(radius, direction.length(), radius);
    mesh.position.copy(a).lerp(b, .5);
    mesh.quaternion.setFromUnitVectors(up, direction.normalize());
  }
  const landmarks = [v(0, 0, 0), v(leftWheel.x, .347, 1.17), v(leftWheel.x - .109, .245, 1.17),
  v(leftWheel.x, .143, 1.17), v(.12, .111, 1.17), v(rightWheel.x, .093, 1.17),
  v(rightWheel.x + .108, .195, 1.17), v(0, 0, 0)];
  const cord = landmarks.slice(1).map(() => rod(deepBlue));
  const ferrule = rod(metal);
  const eye = v(0, 0, 0), end = v(0, 0, 0);
  let previous = -1;
  function update(progress: number) {
    let p = Math.max(.22, Math.min(.92, progress));
    if (p >= .45 && p < .48) p = .45;
    if (previous === p) return false;
    previous = p;
    const pose = samplePractice(p);
    // Rotate around the blocked front edge. The card center lifts and shifts
    // forward a fraction as its tail rises but the collision point stays put.
    card.rotation.z = -pose.tailLiftAngle;
    card.position.set(pose.cardFrontX - w * Math.cos(pose.tailLiftAngle),
      pose.cardY + w * Math.sin(pose.tailLiftAngle), pose.cardZ);
    guide.position.set(pose.guideX, 0, pose.guideZ);
    guide.rotation.y = pose.guideAngle;
    rocker.rotation.z = pose.rockerAngle;
    trigger.rotation.z = -.34 * pose.trigger;
    // Transform local attachments into this group's coordinates. They share a
    // camera-independent coordinate system even while the main scene tilts.
    guide.updateMatrix();
    rocker.updateMatrix();
    landmarks[0].set(-.08, .49, .16).applyMatrix4(guide.matrix);
    landmarks[4].y = .048 + .073 * pose.cordTension;
    landmarks[7].set(1.10, .012, .19).applyMatrix4(rocker.matrix);
    cord.forEach((segment, i) => span(segment, landmarks[i], landmarks[i + 1], .025));
    eye.copy(landmarks[0]).lerp(landmarks[1], .24);
    end.copy(landmarks[0]).lerp(landmarks[1], .36);
    span(ferrule, eye, end, .049);
    return true;
  }
  update(0);
  return {
    group, update, triggerSurface: new THREE.Vector3(...rig.triggerSurface),
    trackExitWaypoint: new THREE.Vector3(...rig.trackExitWaypoint)
  };
}
