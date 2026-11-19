type Point3 = [number, number, number];

// Positive X feeds the card. Positive Z is the edge nearest the reader.
export const practiceRig = {
  cardWidth: 1.42,
  cardDepth: 1.04,
  lipX: .57,
  lipZ: .37,
  lipWidth: .12,
  triggerSurface: [-2.56, .45, .91] as Point3,
  trackExitWaypoint: [2.42, .16, 1.27] as Point3,
  rockerPivot: [1.05, .43, .98] as Point3,
};

function interval(value: number, start: number, end: number) {
  return Math.max(0, Math.min(1, (value - start) / (end - start)));
}
function ease(value: number) {
  return value * value * (3 - 2 * value);
}

export function samplePractice(progress: number) {
  const p = Math.max(0, Math.min(1, progress));
  const launch = interval(p, .22, .40);
  const landed = interval(p, .70, .92);
  // The last millimetres before the stop still have forward velocity; the
  // tip then holds exactly against the lip throughout the return stroke.
  const feed = launch * launch * (2 - launch);
  const weight = ease(interval(p, .48, .66));
  const correction = ease(interval(p, .50, .69));
  const startX = -1.78;
  const caughtX = practiceRig.lipX - practiceRig.cardWidth / 2;
  const cardX = startX + (caughtX - startX) * feed + (1.63 - caughtX) * ease(landed);
  const rockerAngle = .49 * weight;
  const cardY = .58 - .16 * weight - .065 * ease(landed);
  const cardZ = .16 - .47 * correction;
  // The front is blocked briefly while the feeder is still applying force.
  const tailLiftAngle = .104 * ease(interval(p, .40, .45)) * (1 - ease(interval(p, .61, .70)));
  return {
    cardX, cardY, cardZ, cardFrontX: cardX + practiceRig.cardWidth / 2, tailLiftAngle,
    guideX: -.46 - .53 * correction,
    guideZ: .768 - .47 * correction,
    guideAngle: .035 + .14 * correction,
    rockerAngle,
    cordTension: ease(interval(p, .48, .53)),
    trigger: ease(interval(p, .22, .29)),
  };
}
