import { paperTiming } from "./paperMotion";
import { timedThread, xy, type ThreadPoint } from "./timedThread";

export const relayCycleShare = .78;
const beadRadius = 8.9;

export function relayThread(element: HTMLElement, mechanism: "paper" | "practice") {
  const paper = mechanism === "paper";
  const stops = paper
    ? [0, paperTiming.catch * relayCycleShare, paperTiming.pull * relayCycleShare, paperTiming.release * relayCycleShare, 1]
    : [0, .22 * relayCycleShare, .90 * relayCycleShare, .91, 1];
  const route = timedThread(element, `[data-${mechanism}-leg]`, stops);
  function draw(entry: ThreadPoint, exit: ThreadPoint, points: ThreadPoint[], width: number) {
    const [face, next, far] = points;
    const hit = { x: face.x - beadRadius, y: face.y };
    const lead = Math.min(54, width * .12);
    const margin = Math.max(3, Math.min(hit.x - 5, width * .045));
    const approach = `C${xy({ x: margin, y: entry.y })} ${xy({ x: margin, y: hit.y })} ${xy(hit)}`;
    if (paper) {
      const registered = { x: next.x - beadRadius, y: next.y };
      // Stay hooked to the very same point of the moving crease. At release
      // the tail slides round the newly registered pages and returns to the rail.
      const slip = `C${xy({ x: next.x + lead * .28, y: next.y + lead * .45 })} ${xy({ x: far.x - lead * .5, y: far.y })} ${xy(far)}`;
      const turn = Math.min(width - 2, far.x + lead);
      const leave = `C${xy({ x: turn, y: far.y })} ${xy({ x: turn, y: exit.y })} ${xy({ x: far.x, y: exit.y })} H${exit.x}`;
      return route.measure([entry, hit, hit, registered], [approach, `L${xy(hit)}`, `L${xy(registered)}`, slip + " " + leave]);
    }
    const bottom = Math.max(hit.y, next.y) + lead * .29;
    const crossing = `C${xy({ x: hit.x + lead * .25, y: bottom })} ${xy({ x: next.x - lead * .65, y: bottom })} ${xy(next)}`;
    const leave = `C${xy({ x: next.x + lead * .5, y: next.y })} ${xy({ x: exit.x - lead * .55, y: exit.y })} ${xy(exit)}`;
    return route.measure([entry, hit, hit, next], [approach, `L${xy(hit)}`, crossing, leave]);
  }
  return { draw, fraction: route.fraction };
}
