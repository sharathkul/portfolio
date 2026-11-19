type Point3 = [number, number, number];

const pitch = 1.43;
const half = .018;
const reach = 1.65;
const hingeY = .26;
const firstX = -2.15;
export const paperRig = {
  pivots: [firstX, firstX + pitch, firstX + pitch * 2],
  reach, hingeY, halfThickness: half, width: 1.18,
  triggerSurface: [firstX - half, hingeY + .62, .29] as Point3,
  trackExitWaypoint: [2.46, .29, .42] as Point3,
};

const clamp = (n: number) => Math.max(0, Math.min(1, n));

// The uncut edge of one sheet rests against its neighbour's back. Project
// its outer top corner onto the receiver's normal and solve for the angle
// that leaves exactly one half-sheet of clearance from the receiver axis.
// This works through touchdown, including the slight overlap of three
// paper layers at rest. Their printed faces never snap through each other.
function trailingAngle(receiver: number) {
  return receiver + Math.asin((pitch * Math.cos(receiver) - half) / Math.hypot(reach, half))
    - Math.atan2(half, reach);
}
const impact = trailingAngle(0);

export function paperAngles(progress: number): [number, number, number] {
  const first = clamp((progress - .22) / (.43 - .22));
  const second = clamp((progress - .43) / (.62 - .43));
  const third = clamp((progress - .64) / (.88 - .64));
  // A folded sheet has little weight until its centre clears its crease.
  // The last fold holds briefly under pressure before it takes the load.
  const last = third * third * (3 - 2 * third) * Math.PI / 2;
  const middle = second < 1 ? impact * second * (.57 + .43 * second) : trailingAngle(last);
  const leading = first < 1 ? impact * first * first : trailingAngle(middle);
  return [leading, middle, last];
}
