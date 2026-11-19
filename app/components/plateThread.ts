import { bridgeThread } from "./bridgeThread";
import { relayThread } from "./relayThread";
import { xy, type ThreadPoint } from "./timedThread";

export const sceneMechanism = { operations: "paper", building: "bridge", clients: "practice" } as const;
export type Mechanism = (typeof sceneMechanism)[keyof typeof sceneMechanism];

export function measurePlate(element: HTMLElement, mechanism: Mechanism, fromLeft: boolean) {
  const box = element.getBoundingClientRect();
  const surface = element.querySelector("canvas")!.getBoundingClientRect();
  const left = surface.left - box.left;
  const top = surface.top - box.top;
  const edge = fromLeft ? 0 : box.width;
  const entry = { x: edge, y: top + surface.height * .26 };
  const exit = { x: mechanism === "practice" ? box.width : edge, y: top + surface.height * .88 };
  const paths = element.querySelectorAll<SVGPathElement>("[data-plate-edging], [data-plate-base], [data-plate-drawn]");
  const ink = element.querySelector<SVGPathElement>("[data-plate-drawn]")!;
  const route = mechanism === "bridge" ? bridgeThread(element) : relayThread(element, mechanism);
  element.querySelectorAll("[data-plate-layer]").forEach(layer => layer.setAttribute("viewBox", `0 0 ${box.width} ${box.height}`));

  function draw() {
    const projection = element.dataset[mechanism + "Projection"] || element.dataset[mechanism + "FallbackProjection"];
    let path = `M${xy(entry)} L${xy(exit)}`;
    if (projection) {
      const points: ThreadPoint[] = JSON.parse(projection);
      path = route.draw(entry, exit, points.map(p => ({
        x: left + p.x * surface.width, y: top + p.y * surface.height,
      })), box.width, fromLeft);
    }
    paths.forEach(layer => layer.setAttribute("d", path));
  }
  return { entry, exit, ink, draw, fraction: route.fraction };
}
