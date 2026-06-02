import test from "node:test";
import assert from "node:assert/strict";

import {
  normalizeQuestionDraft,
  getClaimWindow,
  createQuestionHeatDecision,
  createQuestionApprovalGrowthEnergy,
} from "../lib/qa-flow-rules.mjs";

test("normalizes a child question draft with confirmed title and review defaults", () => {
  const draft = normalizeQuestionDraft({
    suggestedTitle: "  这道表内乘法题怎么想？ ",
    title: "  这道表内乘法题怎么想？ ",
    content: "我不知道先算什么",
    recognizedText: "3×4 表示什么？",
    imageUrl: "https://example.com/q.png",
    grade: "2",
    topic: "表内乘法",
    confusionType: "不知道先算什么",
    shareScope: "PUBLIC_HALL",
    isAnonymous: true,
  });

  assert.equal(draft.title, "这道表内乘法题怎么想？");
  assert.equal(draft.suggestedTitle, "这道表内乘法题怎么想？");
  assert.equal(draft.grade, 2);
  assert.equal(draft.reviewStatus, "PENDING");
  assert.equal(draft.status, "OPEN");
  assert.equal(draft.confusionType, "不知道先算什么");
  assert.equal(draft.shareScope, "PUBLIC_HALL");
  assert.equal(draft.childMessage, "谢谢你把问题说出来。老师看过后，小讲师就可以来认领讲解。");
});

test("creates a 72 hour claim window and warm reminder", () => {
  const now = new Date("2026-06-02T03:00:00.000Z");
  const claim = getClaimWindow({ now, lecturerId: "learner-1" });

  assert.equal(claim.status, "CLAIMED");
  assert.equal(claim.claimedById, "learner-1");
  assert.equal(claim.claimedAt.toISOString(), "2026-06-02T03:00:00.000Z");
  assert.equal(claim.claimExpiresAt.toISOString(), "2026-06-05T03:00:00.000Z");
  assert.equal(claim.hoursToExplain, 72);
  assert.match(claim.childMessage, /72小时/);
});

test("question heat is private, unique per learner, and only affects sorting", () => {
  const first = createQuestionHeatDecision({ alreadyHeated: false });
  assert.equal(first.shouldCreate, true);
  assert.equal(first.heatIncrement, 1);
  assert.equal(first.visibility, "PRIVATE_LEDGER");
  assert.equal(first.rankingEnabled, false);
  assert.equal(first.sortingOnly, true);

  const duplicate = createQuestionHeatDecision({ alreadyHeated: true });
  assert.equal(duplicate.shouldCreate, false);
  assert.equal(duplicate.heatIncrement, 0);
  assert.match(duplicate.childMessage, /已经帮这道题加过热度/);
});

test("approved questions create private question growth energy but not rank or star exchange", () => {
  const tx = createQuestionApprovalGrowthEnergy({ questionId: "q-1", userId: "learner-1" });

  assert.equal(tx.amount, 3);
  assert.equal(tx.reason, "QUESTION_APPROVED");
  assert.equal(tx.sourceType, "QUESTION");
  assert.equal(tx.sourceId, "q-1");
  assert.equal(tx.visibility, "PRIVATE");
  assert.equal(tx.affectsIdentityLevel, false);
  assert.equal(tx.rankingEnabled, false);
  assert.match(tx.userMessage, /提出一个认真问题/);
});
