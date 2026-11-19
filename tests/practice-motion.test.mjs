import assert from "node:assert/strict";
import test from "node:test";
import { practiceRig, samplePractice } from "../app/components/practiceMotion.ts";

test("the card stops at the receiving lip before the guide starts moving", () => {
  const start = samplePractice(0);
  assert.equal(samplePractice(.22).cardX, start.cardX);
  for (const time of [.40, .48, .55, .62, .69, .70]) {
    assert.ok(Math.abs(samplePractice(time).cardFrontX - practiceRig.lipX) < 1e-8);
  }
  assert.equal(samplePractice(.48).guideX, start.guideX);
  assert.ok(samplePractice(.45).tailLiftAngle > samplePractice(.40).tailLiftAngle);
  assert.ok(samplePractice(.62).guideX < start.guideX);
  assert.ok(samplePractice(.62).rockerAngle > 0);
});

test("the marked corner clears the lip before the card feeds into the folder", () => {
  const aligned = samplePractice(.70);
  assert.equal(aligned.tailLiftAngle, 0);
  assert.ok(aligned.cardZ + practiceRig.cardDepth / 2 < practiceRig.lipZ);
  for (let frame = 0; frame <= 1000; frame++) {
    const pose = samplePractice(frame / 1000);
    if (pose.cardFrontX > practiceRig.lipX + 1e-8) {
      assert.ok(pose.cardZ + practiceRig.cardDepth / 2 < practiceRig.lipZ);
      assert.equal(pose.guideX, aligned.guideX);
    }
  }
  assert.ok(samplePractice(1).cardFrontX > practiceRig.lipX + practiceRig.cardWidth);
});
