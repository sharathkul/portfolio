// Long horizontal crossings need some scroll distance; long vertical runs
// should keep the leading point within the reader's view.
function measurePacing(path: SVGPathElement, length: number) {
  const samples = 36;
  const first = path.getPointAtLength(0);
  const last = path.getPointAtLength(length);
  const height = Math.max(1, last.y - first.y);
  const timing = [0];
  for (let i = 1; i < samples; i++) {
    const fraction = i / samples;
    const y = path.getPointAtLength(length * fraction).y;
    const readingPosition = Math.max(0, Math.min(1, (y - first.y) / height));
    timing.push(Math.max(timing[i - 1], readingPosition * .8 + fraction * .2));
  }
  timing.push(1);
  return timing;
}

function distanceFraction(progress: number, timing: number[]) {
  if (!timing.length || progress <= 0 || progress >= 1) return progress;
  const next = timing.findIndex(value => value >= progress);
  const previous = next - 1;
  return (previous + (progress - timing[previous]) / (timing[next] - timing[previous])) / (timing.length - 1);
}

export function inkTrack(path: SVGPathElement, start: number, end: number, originX: number, originY: number, isPagePath: boolean, mapProgress?: (p: number) => number) {
  let geometry = path.getAttribute("d");
  let length = path.getTotalLength();
  let lastProgress = -1;
  let distance = 0;
  const timing = isPagePath && length ? measurePacing(path, length) : [];

  function paint(progress: number, orb: SVGGElement | null) {
    const d = path.getAttribute("d");
    if (d !== geometry) {
      geometry = d;
      length = path.getTotalLength();
      lastProgress = -1;
    }
    if (lastProgress !== progress) {
      distance = (mapProgress ? mapProgress(progress) : distanceFraction(progress, timing)) * length;
      path.style.visibility = progress === 0 ? "hidden" : "visible";
      if (progress > 0 && progress < 1) {
        path.style.strokeDasharray = `${length} ${length}`;
        path.style.strokeDashoffset = String(length - distance);
      } else {
        path.style.strokeDasharray = "none";
        path.style.strokeDashoffset = "0";
      }
      lastProgress = progress;
    }
    if (orb) {
      const point = path.getPointAtLength(distance);
      orb.setAttribute("transform", `translate(${originX + point.x} ${originY + point.y})`);
      orb.querySelector("[data-orb-glint]")?.setAttribute("transform", `rotate(${(distance * 1.5) % 360})`);
    }
  }
  return { start, end, paint };
}
