type Point = { x: number; y: number };
export type Projection = Point[] | null;
export type Stroke = { paths: SVGPathElement[]; start: number; end: number };

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
  const allPaths = element.querySelectorAll<SVGPathElement>("[data-plate-base], [data-plate-drawn]");
  const paths = Array.from(element.querySelectorAll<SVGPathElement>("[data-plate-drawn]"));
  const patches = element.querySelectorAll<SVGEllipseElement>("[data-thread-surface]");
  const fallbackObjects = fallbackSelectors[element.dataset.scene!].map(selector => element.querySelector(selector)!);
  element.querySelectorAll("[data-plate-layer]").forEach(layer => layer.setAttribute("viewBox", `0 0 ${box.width} ${box.height}`));

  function draw(projection: Projection) {
    let points: Point[];
    if (projection?.length === 3) {
      points = projection.map(p => ({ x: offset.x + p.x * width, y: offset.y + p.y * height }));
    } else {
      // A device without WebGL still has animated SVG objects to thread.
      const currentBox = element.getBoundingClientRect();
      points = fallbackObjects.map(object => {
        const rect = object.getBoundingClientRect();
        return { x: rect.left - currentBox.left + rect.width * .5, y: rect.top - currentBox.top + rect.height * .57 };
      });
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
    // Only a short stitch rides on top of the first two surfaces.
    // Elsewhere the transparent canvas provides the objects' actual silhouettes.
    patches.forEach((patch, i) => {
      patch.setAttribute("cx", String(points[i].x));
      patch.setAttribute("cy", String(points[i].y));
      patch.setAttribute("rx", String(Math.min(15, width * .025)));
      patch.setAttribute("ry", String(Math.min(8, height * .027)));
    });
  }

  return { entry, exit, paths, draw };
}
