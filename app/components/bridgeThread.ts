import { timedThread, xy, type ThreadPoint as Point } from "./timedThread";
const orbRadius = 8.9;

// The first three stops are mechanical cues, not fractions of the SVG length.
// Expanding the artwork on a phone must not change when the ball hits a leaf.
const stops = [0, .30, .48, .68, .86, .94, 1];

export function bridgeThread(element: HTMLElement) {
  const route = timedThread(element, "[data-bridge-leg]", stops);

  function draw(entry: Point, exit: Point, points: Point[], width: number, fromLeft: boolean) {
    const [face, near, far, computer] = points;
    const span = Math.max(1, Math.hypot(far.x - near.x, far.y - near.y));
    const axis = { x: (far.x - near.x) / span, y: (far.y - near.y) / span };
    const hit = { x: face.x - orbRadius * axis.x, y: face.y - orbRadius * axis.y };
    const start = { x: near.x, y: near.y - orbRadius };
    const end = { x: far.x, y: far.y - orbRadius };
    const push = { x: hit.x + (start.x - hit.x) * .48, y: hit.y + (start.y - hit.y) * .48 };
    const lead = Math.min(width * .12, 48);
    const run = Math.max(4, Math.min(lead, hit.x * .6));
    const before = { x: hit.x - axis.x * run, y: hit.y - axis.y * run };
    // Both layouts enter the mechanism from its left. The desktop rail loops
    // above the assembly so the bearing never passes through a raised leaf.
    const turn = { x: Math.max(5, hit.x * .26), y: entry.y + (hit.y - entry.y) * .38 };
    const approach = fromLeft
      ? `C${xy({ x: turn.x * 1.35, y: entry.y })} ${xy({ x: turn.x, y: turn.y - run * .55 })} ${xy(turn)}`
      : `C${xy({ x: entry.x - lead, y: entry.y })} ${xy({ x: turn.x, y: entry.y - lead * 1.6 })} ${xy(turn)}`;
    const legs = [
      `${approach} C${xy({ x: turn.x, y: turn.y + run * .64 })} ${xy(before)} ${xy(hit)}`,
      `L${xy(push)}`,
      `L${xy(start)}`,
      `L${xy(end)}`,
      `C${xy({ x: end.x + axis.x * lead * .55, y: end.y + axis.y * lead * .55 })} ${xy({ x: computer.x + lead * .7, y: computer.y + lead * .3 })} ${xy(computer)}`,
      `C${xy({ x: computer.x + lead * .85, y: computer.y - lead * .35 })} ${xy({ x: fromLeft ? width - 5 : exit.x - lead * .55, y: exit.y })} ${xy({ x: fromLeft ? width * .73 : exit.x - lead * .42, y: exit.y })} L${xy(exit)}`,
    ];
    const origins = [entry, hit, push, start, end, computer];
    return route.measure(origins, legs);
  }
  return { draw, fraction: route.fraction };
}
