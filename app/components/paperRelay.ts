import * as THREE from "three";
import { foldAngle, paperActionProgress, paperNames, paperPose, paperRig as rig, type PaperPoint } from "./paperMotion";

type Material = THREE.Material;
type PaperParts = {
  box(parent: THREE.Object3D, size: PaperPoint, position: PaperPoint, finish: Material, radius?: number): THREE.Mesh;
  ownGeometry<T extends THREE.BufferGeometry>(geometry: T): T;
  paper: Material;
  reverse: Material;
  edge: Material;
  ink: Material;
  pale: Material;
};

export function createPaperRelay({ box, ownGeometry, paper, reverse, edge, ink, pale }: PaperParts) {
  const group = new THREE.Group();
  group.name = "paper-snag";
  const { width: w, depth: d, corner: c } = rig;
  const rear = c - d;

  function stroke(parent: THREE.Object3D, x: number, z: number, width: number, depth: number, mat = ink) {
    box(parent, [width, .004, depth], [x, .006, z], mat, .002);
  }
  function sheetShape(cut: boolean) {
    // Shape XY maps to desk X, -Z; the paper's visible face points upwards.
    const s = new THREE.Shape();
    s.moveTo(0, -rear);
    s.lineTo(w, -rear);
    s.lineTo(w, -c);
    s.lineTo(cut ? c : 0, -c);
    if (cut) s.lineTo(0, 0);
    s.closePath();
    return s;
  }
  const leaves = paperNames.map((name, i) => {
    const leaf = new THREE.Group();
    leaf.name = name + "-sheet";
    group.add(leaf);
    const geo = ownGeometry(new THREE.ExtrudeGeometry(sheetShape(i === 0), {
      depth: .038, bevelEnabled: false, curveSegments: 2,
    }));
    geo.translate(0, 0, -.038);
    geo.rotateX(-Math.PI / 2);
    const stock = new THREE.Mesh(geo, [i === 2 ? pale : paper, i === 0 ? edge : reverse]);
    stock.castShadow = stock.receiveShadow = true;
    leaf.add(stock);

    // Three indexed tabs survive in the margin when the printed faces overlap.
    const tabZ = rear + .29 + i * .55;
    box(leaf, [.14, .028, .30], [w + .047, -.020, tabZ], [ink, edge, reverse][i], .014);
    stroke(leaf, .41, rear + .22, .46, .044, edge);
    stroke(leaf, 1.37, rear + .22, .19, .036, edge);
    const cx = .81, cz = rear + .78;
    if (i === 0) {
      stroke(leaf, cx, cz, .17, .61);
      stroke(leaf, cx, cz, .61, .17);
    } else if (i === 1) {
      for (const [r, len] of [.72, .81, .45].entries()) {
        stroke(leaf, cx - .36 + len / 2, cz - .17 + r * .17, len, .068);
      }
    } else {
      const stamp = new THREE.Mesh(ownGeometry(new THREE.RingGeometry(.265, .30, 36)), ink);
      stamp.rotation.x = -Math.PI / 2;
      stamp.position.set(cx, .008, cz);
      leaf.add(stamp);
      const curve = new THREE.CatmullRomCurve3([
        [.085,-.143],[-.04,-.16],[-.103,-.106],[-.084,-.042],[.037,.01],[.095,.061],[.088,.119],[.032,.153],[-.104,.139],
      ].map(([x, z]) => new THREE.Vector3(cx + x, .012, cz + z)));
      leaf.add(new THREE.Mesh(ownGeometry(new THREE.TubeGeometry(curve, 22, .020, 5, false)), ink));
      stroke(leaf, cx, cz, .025, .40);
    }
    stroke(leaf, .79, rear + 1.36, 1.12, .024, edge);
    stroke(leaf, .64, rear + 1.49, .82, .024, edge);
    stroke(leaf, 1.28, c - .17, .34, .035, edge);
    return leaf;
  });

  // A small lifted triangle shares its crease with the cut in the top sheet.
  const curl = new THREE.Group();
  leaves[0].add(curl);
  const fold = new THREE.BufferGeometry();
  fold.setAttribute("position", new THREE.Float32BufferAttribute([
    0, 0, 0, 0, 0, c, c, 0, c,
    0, 0, 0, c, 0, c, 0, 0, c,
  ], 3));
  fold.computeVertexNormals();
  fold.addGroup(0, 3, 0);
  fold.addGroup(3, 3, 1);
  const dogEar = new THREE.Mesh(ownGeometry(fold), [reverse, edge]);
  dogEar.castShadow = dogEar.receiveShadow = true;
  curl.add(dogEar);
  // Thin ink on the two cut edges keeps the snag visible even when the
  // triangular fold briefly turns edge-on to the camera.
  stroke(curl, 0, c / 2, .016, c, reverse);
  stroke(curl, c / 2, c, c, .016, reverse);
  const crease = box(leaves[0], [Math.SQRT2 * c, .010, .028], [c / 2, .004, c / 2], edge, .004);
  crease.rotation.y = -Math.PI / 4;
  const diagonal = new THREE.Vector3(-1, 0, -1).normalize();

  let previous = Number.NaN;
  function update(input: number) {
    const progress = paperActionProgress(input);
    if (progress === previous) return false;
    previous = progress;
    leaves.forEach((leaf, index) => {
      const pose = paperPose(index, progress);
      leaf.position.set(pose.x, rig.levels[index], pose.z);
      leaf.rotation.y = pose.turn;
    });
    curl.quaternion.setFromAxisAngle(diagonal, foldAngle(progress));
    return true;
  }

  return { group, update, triggerSurface: new THREE.Vector3(...rig.triggerSurface),
    alignedSurface: new THREE.Vector3(...rig.alignedSurface),
    trackExitWaypoint: new THREE.Vector3(...rig.trackExitWaypoint) };
}
