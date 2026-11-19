import assert from "node:assert/strict";
import test from "node:test";
import { cornerTip, foldAngle, paperPose, paperRig, paperTiming } from "../app/components/paperMotion.ts";

test("the curled edge takes up tension before any of the loose papers move", () => {
  for (let i = 0; i < 3; i++) assert.deepEqual(paperPose(i, 0), paperPose(i, paperTiming.pull));
  assert.ok(foldAngle(paperTiming.pull) > foldAngle(paperTiming.catch) + .6);
  assert.deepEqual(paperPose(2, .40), paperPose(2, 0));
  assert.ok(paperPose(0, .40).x > paperPose(0, 0).x);
});

test("the crease follows the bead all the way to the registered stack", () => {
  const a = paperRig.triggerSurface;
  const b = paperRig.alignedSurface;
  for (let i = 0; i <= 100; i++) {
    const t = i/100;
    const pose = paperPose(0, paperTiming.pull + t * (paperTiming.release - paperTiming.pull));
    assert.ok(Math.abs(pose.x - (a[0] + (b[0] - a[0]) * t)) < 1e-10);
    assert.ok(Math.abs(pose.z - (a[2] + (b[2] - a[2]) * t)) < 1e-10);
  }
  const top = paperPose(0, 1);
  for (let i = 0; i < 3; i++) {
    const aligned = paperPose(i, paperTiming.release);
    assert.deepEqual(aligned, paperPose(i, 1));
    assert.ok(Math.abs(aligned.turn - top.turn) < 1e-10);
    assert.ok(Math.hypot(aligned.x - top.x, aligned.z - top.z) < .12);
  }
});

test("the corner uncurls after release, rebounds once and holds its shape", () => {
  const c = paperRig.corner;
  for (let i = 0; i <= 100; i++) {
    const [x,y,z] = cornerTip(foldAngle(i/100));
    assert.ok(Math.abs(Math.hypot(x,y,z) - c) < 1e-10);
    assert.ok(Math.abs(Math.hypot(x-c,y,z-c) - c) < 1e-10);
  }
  assert.ok(foldAngle(.78) < foldAngle(.72));
  assert.ok(foldAngle(.82) > foldAngle(.78));
  assert.equal(foldAngle(.88), foldAngle(1));
});
