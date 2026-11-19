import { bridgeThread } from "./bridgeThread";

type Point = { x: number; y: number };
export type Projection = Point[] | null;

const fallbackSelectors: Record<string, string[]> = {
  operations: ["[data-motion-part='paper-left']", "[data-motion-part='paper-bottom']", "[data-motion-part='paper-right']"],
  building: ["[data-motion-part='care']", "[data-motion-part='product']", "[data-motion-part='engineering']"],
  clients: ["[data-motion-part='source-folder']", "[data-motion-part='client-folder'] > g > g:first-child", "[data-motion-part='client-folder'] > g > g:last-child"],
};

export function measurePlate(element: HTMLElement, fromLeft: boolean) {
  const box = element.getBoundingClientRect();
  const surface = element.querySelector("canvas")!.getBoundingClientRect();
  const offset = { x: surface.left - box.left, y: surface.top - box.top };
  const width = surface.width;
  const height = surface.height;
  const dir = fromLeft ? 1 : -1;
  const edge = fromLeft ? 0 : box.width;
  const entry = { x: edge, y: offset.y + height * .26 };
  const exit = { x: edge, y: offset.y + height * .88 };
  const allPaths = element.querySelectorAll<SVGPathElement>("[data-plate-edging], [data-plate-base], [data-plate-drawn]");
  const ink = element.querySelector<SVGPathElement>("[data-plate-drawn]")!;
  const fallbackObjects = fallbackSelectors[element.dataset.scene!].map(selector => element.querySelector(selector)!);
  const bridge = element.dataset.scene === "building" ? bridgeThread(element) : null;
  const local = (p: Point) => ({ x: offset.x + p.x * width, y: offset.y + p.y * height });
  element.querySelectorAll("[data-plate-layer]").forEach(layer => layer.setAttribute("viewBox", `0 0 ${box.width} ${box.height}`));

  function draw(projection: Projection) {
    let points: Point[];
    if (projection?.length === 3) {
      points = projection.map(local);
    } else {
      // A device without WebGL still has animated SVG objects to thread.
      const currentBox = element.getBoundingClientRect();
      points = fallbackObjects.map(object => {
        const rect = object.getBoundingClientRect();
        return { x: rect.left - currentBox.left + rect.width * .5, y: rect.top - currentBox.top + rect.height * .57 };
      });
    }
    const layout = element.dataset.bridgeProjection || element.dataset.bridgeFallbackProjection;
    if (bridge && layout) {
      const projected: Point[] = JSON.parse(layout);
      const d = bridge.draw(entry, exit, projected.map(local), box.width, fromLeft);
      allPaths.forEach(path => path.setAttribute("d", d));
      return;
    }
    if (!fromLeft) points.reverse();
    const [a, b, c] = points;
    const handle = Math.min(width * .085, 52);
    const farEdge = fromLeft ? box.width : 0;
    const turnX = c.x + (farEdge - c.x) * .57;
    const turnY = exit.y - height * .15;
    const d = [
      `M${edge} ${entry.y}`,
      `C${edge + dir * handle} ${entry.y} ${a.x - dir * handle} ${a.y - height * .08} ${a.x} ${a.y}`,
      `C${a.x + dir * handle * .55} ${a.y + height * .05} ${b.x - dir * handle * .55} ${b.y} ${b.x} ${b.y}`,
      `C${b.x + dir * handle * .6} ${b.y} ${c.x - dir * handle * .55} ${c.y} ${c.x} ${c.y}`,
      `C${c.x + dir * handle} ${c.y} ${turnX} ${turnY} ${turnX} ${turnY + height * .035}`,
      `C${turnX} ${exit.y + height * .03} ${edge + dir * width * .36} ${exit.y} ${edge} ${exit.y}`,
    ].join(" ");
    allPaths.forEach(path => path.setAttribute("d", d));
  }

  return { entry, exit, ink, draw, fraction: bridge?.fraction };
}
