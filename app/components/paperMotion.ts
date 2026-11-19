export type PaperPoint = [number, number, number];
export type PaperPose = { x: number; z: number; turn: number };

export const paperNames = ["care", "information", "billing"] as const;
export const paperTiming = { catch: .22, pull: .34, release: .72, settle: .88 };

const loose: PaperPose[] = [
  { x: -2.27, z: 1.06, turn: -.32 },
  { x: -.77, z: .36, turn: .22 },
  { x: .76, z: .70, turn: -.15 },
];
const stackX = .15, stackZ = .70;
const levels = [.155, .096, .039];
const corner = .44;
const restingFold = .66;
const tightFold = 2.10;

export const paperRig = {
  width: 1.68, depth: 2.18, corner, levels,
  triggerSurface: [loose[0].x, levels[0], loose[0].z] as PaperPoint,
  alignedSurface: [stackX, levels[0], stackZ] as PaperPoint,
  // After release, the bead runs along the front cut edge and away from the stack.
  trackExitWaypoint: [stackX + 2.12, levels[0], stackZ + .53] as PaperPoint,
};

const phase = (p: number, a: number, b: number) => Math.min(1, Math.max(0, (p - a) / (b - a)));
const ease = (x: number) => x * x * (3 - 2 * x);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

export function paperActionProgress(progress: number) {
  return Math.min(paperTiming.settle, Math.max(paperTiming.catch, progress));
}

export function paperPose(index: number, progress: number): PaperPose {
  const { pull, release } = paperTiming;
  const start = loose[index];
  // The foremost sheet pivots about the crease held by the thread. The sheets
  // underneath slide later as their edges are swept up by the moving paper.
  const linear = phase(progress, pull + .065 * index, release - (index === 1 ? .015 : 0));
  const shift = index === 0 ? linear : ease(linear);
  return {
    x: mix(start.x, stackX + .035 * index, shift),
    z: mix(start.z, stackZ - .045 * index, shift),
    turn: mix(start.turn, -.075, ease(linear)),
  };
}

export function foldAngle(progress: number) {
  const { catch: snag, pull, release, settle } = paperTiming;
  if (progress <= release) return mix(restingFold, tightFold, ease(phase(progress, snag, pull)));
  // One small recoil as the bead clears the paper, with a long settled pose.
  if (progress < .78) return mix(tightFold, .045, ease(phase(progress, release, .78)));
  if (progress < .82) return mix(.045, .32, ease(phase(progress, .78, .82)));
  return mix(.32, .16, ease(phase(progress, .82, settle)));
}

// The two crease endpoints are fixed. The free corner rotates around their
// diagonal, so the fold is a real paper triangle with constant edge lengths.
export function cornerTip(angle: number): PaperPoint {
  return [corner * (1 - Math.cos(angle)) / 2, corner * Math.sin(angle) / Math.SQRT2,
    corner * (1 + Math.cos(angle)) / 2];
}

export function paperWorld(index: number, pose: PaperPose, [u, h, v]: PaperPoint): PaperPoint {
  const c = Math.cos(pose.turn), s = Math.sin(pose.turn);
  return [pose.x + u * c + v * s, levels[index] + h, pose.z + v * c - u * s];
}
