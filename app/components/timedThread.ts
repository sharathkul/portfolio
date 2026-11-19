export type ThreadPoint = { x: number; y: number };
export const xy = ({ x, y }: ThreadPoint) => `${x.toFixed(2)} ${y.toFixed(2)}`;

// Object contacts have fixed moments in the choreography even when the
// responsive layout changes the distance between them.
export function timedThread(element: HTMLElement, selector: string, stops: number[]) {
  const gauges = Array.from(element.querySelectorAll<SVGPathElement>(selector));
  const distances = [0];
  let total = 0;

  function measure(origins: ThreadPoint[], legs: string[]) {
    total = 0;
    legs.forEach((leg, i) => {
      const gauge = gauges[i];
      const d = `M${xy(origins[i])} ${leg}`;
      if (gauge.getAttribute("d") !== d) {
        gauge.setAttribute("d", d);
        gauge.dataset.length = String(gauge.getTotalLength());
      }
      total += Number(gauge.dataset.length);
      distances[i + 1] = total;
    });
    return `M${xy(origins[0])} ${legs.join(" ")}`;
  }

  function fraction(p: number) {
    if (!total || p <= 0 || p >= 1) return p;
    const next = stops.findIndex(stop => stop >= p);
    const i = next - 1;
    const t = (p - stops[i]) / (stops[next] - stops[i]);
    return (distances[i] + (distances[next] - distances[i]) * t) / total;
  }
  return { measure, fraction };
}
