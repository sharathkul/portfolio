import * as THREE from "three";
import { paperAngles, paperRig as rig } from "./paperMotion";

type Point3 = [number, number, number];
type Material = THREE.Material;
type PaperParts = {
  box(parent: THREE.Object3D, size: Point3, position: Point3, finish: Material, radius?: number): THREE.Mesh;
  ownGeometry<T extends THREE.BufferGeometry>(geometry: T): T;
  paper: Material;
  reverse: Material;
  edge: Material;
  ink: Material;
  pale: Material;
};

export function createPaperRelay({ box, ownGeometry, paper, reverse, edge, ink, pale }: PaperParts) {
  const group = new THREE.Group();
  group.name = "paper-handoff";
  const leaves: THREE.Group[] = [];
  const h = rig.reach, w = rig.width / 2, half = rig.halfThickness;
  const page = new THREE.Shape();
  page.moveTo(-w + .025, 0);
  page.lineTo(w - .025, 0);
  page.quadraticCurveTo(w, 0, w, .025);
  page.lineTo(w, h - .22);
  page.lineTo(w - .22, h);
  page.lineTo(-w + .025, h);
  page.quadraticCurveTo(-w, h, -w, h - .025);
  page.lineTo(-w, .025);
  page.quadraticCurveTo(-w, 0, -w + .025, 0);

  // Local XY is the upright page artboard. Its printed face points towards
  // the camera at rest and turns upwards when the paper folds over.
  const pageGeometry = ownGeometry(new THREE.ExtrudeGeometry(page, { depth: 2 * half, bevelEnabled: false, curveSegments: 3 }));
  pageGeometry.rotateY(-Math.PI / 2);
  pageGeometry.translate(half, 0, 0);
  const faceGeometry = ownGeometry(new THREE.ShapeGeometry(page, 3));
  const fold = new THREE.Shape();
  fold.moveTo(w - .22, h);
  fold.lineTo(w, h - .22);
  fold.lineTo(w - .22, h - .22);
  fold.closePath();
  const foldGeometry = ownGeometry(new THREE.ShapeGeometry(fold));

  function print(parent: THREE.Object3D, width: number, height: number, u: number, v: number, finish = ink) {
    box(parent, [width, height, .003], [u, v, .004], finish, .001);
  }
  function currency(parent: THREE.Object3D) {
    const stamp = new THREE.Mesh(ownGeometry(new THREE.RingGeometry(.224, .260, 40)), ink);
    stamp.position.set(0, .95, .008);
    parent.add(stamp);
    const s = new THREE.CatmullRomCurve3([
      [.074, 1.060], [-.019, 1.084], [-.086, 1.045], [-.086, .994],
      [-.014, .957], [.067, .920], [.083, .871], [.030, .830], [-.080, .849],
    ].map(([u,v]) => new THREE.Vector3(u,v,.011)));
    parent.add(new THREE.Mesh(ownGeometry(new THREE.TubeGeometry(s, 22, .019, 5, false)), ink));
    print(parent, .024, .315, 0, .95);
  }

  for (const [index, x] of rig.pivots.entries()) {
    // The hinge is the crease of a cover attached to a slim stack of forms.
    // Individual edges stay visible after the moving cover settles.
    for (let sheet = 0; sheet < 4; sheet++) {
      const top = sheet === 3;
      const width = index === 2 ? 1.71 : 1.405;
      const leaf = box(group, [width, .041, rig.width + .10],
        [x + width / 2 - .033 + (sheet % 2) * .016, .070 + sheet * .049, .008 * (sheet % 2)],
        top ? pale : sheet === 0 ? edge : paper, .017);
      leaf.rotation.y = top ? 0 : (sheet - 2) * .009;
    }
    // A dark strip of binding across the crease makes its rotation legible
    // at thumbnail sizes without turning a sheet of paper into a metal tile.
    box(group, [.094, .028, rig.width + .025], [x, .244, 0], reverse, .010);
    const pivot = new THREE.Group();
    pivot.name = ["care-sheet", "information-sheet", "billing-sheet"][index];
    pivot.position.set(x, rig.hingeY, 0);
    group.add(pivot);
    leaves.push(pivot);
    const body = new THREE.Mesh(pageGeometry, reverse);
    body.castShadow = body.receiveShadow = true;
    pivot.add(body);

    const art = new THREE.Group();
    art.rotation.y = -Math.PI / 2;
    art.position.x = -half - .001;
    pivot.add(art);
    const front = new THREE.Mesh(faceGeometry, paper);
    front.receiveShadow = true;
    art.add(front);
    const dogEar = new THREE.Mesh(foldGeometry, edge);
    dogEar.position.z = .003;
    art.add(dogEar);

    print(art, .22, .040, -.30, h - .19, reverse);
    print(art, .59, .018, -.12, .28, edge);
    print(art, .42, .018, -.205, .21, edge);
    if (index === 0) {
      print(art, .16, .57, 0, .94);
      print(art, .57, .16, 0, .94);
    } else if (index === 1) {
      print(art, .69, .070, -.02, 1.09);
      print(art, .69, .055, -.02, .92);
      print(art, .40, .055, -.165, .75);
    } else {
      currency(art);
    }
  }

  function update(progress: number) {
    const angles = paperAngles(progress);
    let moved = false;
    leaves.forEach((leaf, i) => {
      if (leaf.rotation.z === -angles[i]) return;
      leaf.rotation.z = -angles[i];
      moved = true;
    });
    return moved;
  }
  const triggerSurface = new THREE.Vector3(...rig.triggerSurface);
  const trackExitWaypoint = new THREE.Vector3(...rig.trackExitWaypoint);
  return { group, update, triggerSurface, trackExitWaypoint };
}
