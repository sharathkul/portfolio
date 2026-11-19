import { timedThread, xy, type ThreadPoint } from "./timedThread";

// Reserve the end of the scroll window for the bead to leave the feeder.
// During the catch and the return stroke the card has the viewer's attention.
export const practiceCycleShare = .78;
const stops = [0, .22 * practiceCycleShare, .90 * practiceCycleShare, .91, 1];

export function practiceThread(element: HTMLElement) {
  const route = timedThread(element, "[data-practice-leg]", stops);

  function draw(entry: ThreadPoint, exit: ThreadPoint, [face, end]: ThreadPoint[], width: number) {
    const hit = { x: face.x - 8.9, y: face.y };
    const lead = Math.min(54, width * .12);
    const margin = Math.max(3, Math.min(hit.x - 5, width * .045));
    const bottom = Math.max(hit.y, end.y) + lead * .29;
    const approach = `C${xy({ x: margin, y: entry.y })} ${xy({ x: margin, y: hit.y })} ${xy(hit)}`;
    const crossing = `C${xy({ x: hit.x + lead * .25, y: bottom })} ${xy({ x: end.x - lead * .65, y: bottom })} ${xy(end)}`;
    const leave = `C${xy({ x: end.x + lead * .5, y: end.y })} ${xy({ x: exit.x - lead * .55, y: exit.y })} ${xy(exit)}`;
    return route.measure([entry, hit, hit, end], [approach, `L${xy(hit)}`, crossing, leave]);
  }
  return { draw, fraction: route.fraction };
}
