import { timedThread, xy, type ThreadPoint } from "./timedThread";

// The bead waits while the triggered mechanism runs, then follows the thread out.
export const relayCycleShare = .78;

export function relayThread(element: HTMLElement, mechanism: "paper" | "practice") {
  const paper = mechanism === "paper";
  const release = paper ? .88 : .90;
  const route = timedThread(element, `[data-${mechanism}-leg]`, [0, .22 * relayCycleShare, release * relayCycleShare, .91, 1]);

  function draw(entry: ThreadPoint, exit: ThreadPoint, [face, end]: ThreadPoint[], width: number) {
    const hit = { x: face.x - 8.9, y: face.y };
    const lead = Math.min(54, width * .12);
    const margin = Math.max(3, Math.min(hit.x - 5, width * .045));
    const bottom = Math.max(hit.y, end.y) + lead * .29;
    const approach = `C${xy({ x: margin, y: entry.y })} ${xy({ x: margin, y: hit.y })} ${xy(hit)}`;
    const crossing = `C${xy({ x: hit.x + lead * .25, y: bottom })} ${xy({ x: end.x - lead * .65, y: bottom })} ${xy(end)}`;
    const leave = paper
      ? `C${xy({ x: end.x + lead, y: end.y })} ${xy({ x: Math.min(width, end.x + lead), y: exit.y })} ${xy({ x: end.x, y: exit.y })} H${exit.x}`
      : `C${xy({ x: end.x + lead * .5, y: end.y })} ${xy({ x: exit.x - lead * .55, y: exit.y })} ${xy(exit)}`;
    return route.measure([entry, hit, hit, end], [approach, `L${xy(hit)}`, crossing, leave]);
  }
  return { draw, fraction: route.fraction };
}
