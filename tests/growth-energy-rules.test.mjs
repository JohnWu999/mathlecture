import test from "node:test";
import assert from "node:assert/strict";

import {
  GROWTH_ENERGY_REASONS,
  calculateGrowthEnergyTransaction,
  getGrowthEnergySummary,
} from "../lib/growth-energy-rules.mjs";

test("approved question creates a private growth energy transaction with child-facing copy", () => {
  const transaction = calculateGrowthEnergyTransaction({
    reason: GROWTH_ENERGY_REASONS.QUESTION_APPROVED,
    sourceType: "QUESTION",
    sourceId: "question-1",
  });

  assert.equal(transaction.amount, 5);
  assert.equal(transaction.displayLabel, "提问成长能量");
  assert.equal(transaction.visibility, "PRIVATE");
  assert.equal(transaction.affectsIdentityLevel, false);
  assert.match(transaction.userMessage, /谢谢你把问题说出来/);
});

test("approved answer records energy without treating energy as identity star level", () => {
  const transaction = calculateGrowthEnergyTransaction({
    reason: GROWTH_ENERGY_REASONS.ANSWER_APPROVED,
    sourceType: "ANSWER",
    sourceId: "answer-1",
  });

  assert.equal(transaction.amount, 10);
  assert.equal(transaction.displayLabel, "讲解成长能量");
  assert.equal(transaction.affectsIdentityLevel, false);
  assert.match(transaction.userMessage, /讲清楚/);
});

test("summary explains sources and safe usage without rankings", () => {
  const summary = getGrowthEnergySummary([
    { amount: 5, reason: GROWTH_ENERGY_REASONS.QUESTION_APPROVED },
    { amount: 10, reason: GROWTH_ENERGY_REASONS.ANSWER_APPROVED },
  ]);

  assert.equal(summary.total, 15);
  assert.deepEqual(summary.sourceLabels, ["提问成长能量", "讲解成长能量"]);
  assert.equal(summary.rankingEnabled, false);
  assert.match(summary.childExplanation, /不代表谁更聪明/);
  assert.match(summary.parentExplanation, /不用于公开排名/);
});

test("unknown growth energy reason is rejected to prevent arbitrary scoring", () => {
  assert.throws(
    () => calculateGrowthEnergyTransaction({ reason: "RANDOM_POINTS" }),
    /Unknown growth energy reason/,
  );
});
