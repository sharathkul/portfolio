// Dimensions are in bridge-local space. The pins run along Z and the ball rolls toward +X.
export const tileReach = .88;
export const hingeSpacing = .78;
export const halfThickness = .04;
export const cornerRadius = .012;
const rightAngle = Math.PI / 2;
const ballImpact = .30;
const tileImpact = .48;
const release = .523;
const secondLanding = .607;
const firstLanding = .675;

// The furthest point on the first tile's rounded upper corner is one corner
// radius beyond the projected centre of its fillet. Contact occurs when this
// point reaches the receiving tile's left face at x = hinge spacing minus half the thickness.
const tipX = halfThickness - cornerRadius;
const tipY = tileReach - cornerRadius;
const contactAngle = Math.asin((hingeSpacing - halfThickness - cornerRadius) / Math.hypot(tipX, tipY)) - Math.atan2(tipX, tipY);

function hingeArc(progress: number, start: number, end: number, from: number, to: number, speedIn: number, speedOut: number) {
  const t = Math.max(0, Math.min(1, (progress - start) / (end - start)));
  const remaining = 1 - t;
  return from * remaining * remaining * (1 + 2 * t) + to * t * t * (3 - 2 * t)
    + (end - start) * t * remaining * (speedIn * remaining - speedOut * t);
}

function driverAngle(progress: number) {
  return progress <= tileImpact
    ? hingeArc(progress, ballImpact, tileImpact, 0, contactAngle, 0, 3.7)
    : hingeArc(progress, tileImpact, firstLanding, contactAngle, rightAngle, 3.7, 0);
}

function drivenAngle(alpha: number) {
  const x = tipX * Math.cos(alpha) + tipY * Math.sin(alpha) - hingeSpacing;
  const y = tipY * Math.cos(alpha) - tipX * Math.sin(alpha);
  // Project that corner onto the rotating second tile's face normal.
  return Math.atan2(-y, x) + Math.acos(-(halfThickness + cornerRadius) / Math.hypot(x, y));
}

const releaseAngle = drivenAngle(driverAngle(release));
const releaseSpeed = (drivenAngle(driverAngle(release + .00001)) - drivenAngle(driverAngle(release - .00001))) / .00002;
const flightTime = secondLanding - release;
const acceleration = 2 * (rightAngle - releaseAngle - releaseSpeed * flightTime) / (flightTime * flightTime);

// Angles are clockwise from vertical in the X/Y plane, measured in radians.
export function tileAngles(progress: number): [number, number] {
  const alpha = driverAngle(progress);
  let beta = 0;
  if (progress > tileImpact && progress <= release) {
    beta = drivenAngle(alpha);
  } else if (progress > release) {
    const free = Math.min(flightTime, progress - release);
    beta = Math.min(rightAngle, releaseAngle + releaseSpeed * free + .5 * acceleration * free * free);
  }
  return [alpha, beta];
}
