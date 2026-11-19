import assert from "node:assert/strict";
import test from "node:test";
import { paperAngles, paperRig } from "../app/components/paperMotion.ts";

test("the bead starts Care, then each sheet tips the next one on contact", () => {
  assert.deepEqual(paperAngles(.22), [0, 0, 0]);
  assert.ok(paperAngles(.32)[0] > 0);
  assert.equal(paperAngles(.43)[1], 0);
  assert.ok(paperAngles(.50)[1] > 0);
  assert.deepEqual(paperAngles(.62), paperAngles(.64));
  assert.equal(paperAngles(.64)[2], 0);
  assert.ok(paperAngles(.72)[2] > 0);
  assert.deepEqual(paperAngles(.88), paperAngles(1));
});

test("the striking edge stays against the receiving face after each contact", () => {
  // Project each moving top corner onto its neighbour's face normal.
  const { pivots, reach, halfThickness: half } = paperRig;
  for (let step = 0; step <= 1000; step++) {
    const progress = step / 1000;
    const angles = paperAngles(progress);
    for (const [index, contact] of [.43, .62].entries()) {
      if (progress < contact) continue;
      const delta = angles[index] - angles[index + 1];
      const distance = reach * Math.sin(delta) + half * Math.cos(delta)
        - (pivots[index + 1] - pivots[index]) * Math.cos(angles[index + 1]);
      assert.ok(Math.abs(distance + half) < 1e-10);
    }
  }
});
