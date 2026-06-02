import test from "node:test";
import assert from "node:assert/strict";

import {
  QUESTION_FORM_STEPS,
  QUESTION_SHARE_OPTIONS,
  getQuestionStatusBadge,
  formatClaimDeadline,
  getHeatPrompt,
  getAnswerSubmitPrompt,
  TEACHER_QUESTION_REVIEW_COPY,
} from "../lib/qa-ui-rules.mjs";

test("question form guides low-grade learners through photo, suggested title, confusion and sharing", () => {
  assert.deepEqual(
    QUESTION_FORM_STEPS.map((step) => step.key),
    ["photo", "suggested-title", "confusion", "sharing"]
  );
  assert.match(QUESTION_FORM_STEPS[0].helper, /拍照上传题目/);
  assert.match(QUESTION_FORM_STEPS[1].helper, /家长或孩子确认/);
  assert.match(QUESTION_FORM_STEPS[2].helper, /说清楚卡在哪里/);
  assert.equal(QUESTION_SHARE_OPTIONS[0].value, "QUESTION_AUTHOR_ONLY");
  assert.equal(QUESTION_SHARE_OPTIONS[1].value, "PUBLIC_HALL");
  assert.match(QUESTION_SHARE_OPTIONS[1].parentNote, /老师审核/);
});

test("question list explains heat without ranking pressure", () => {
  const prompt = getHeatPrompt({ heatCount: 8, hasHeated: false });
  assert.match(prompt.label, /加一点热度/);
  assert.equal(prompt.rankingEnabled, false);
  assert.equal(prompt.sortingOnly, true);
  assert.match(prompt.helper, /不是排名/);

  const duplicate = getHeatPrompt({ heatCount: 8, hasHeated: true });
  assert.match(duplicate.label, /已加热度/);
});

test("claim deadline copy shows 72 hour gentle reminder", () => {
  const copy = formatClaimDeadline({
    claimExpiresAt: "2026-06-05T03:00:00.000Z",
    now: new Date("2026-06-02T03:00:00.000Z"),
  });

  assert.equal(copy.hoursLeft, 72);
  assert.match(copy.label, /72小时/);
  assert.match(copy.helper, /慢慢讲/);
});

test("question and answer statuses use review-first sharing language", () => {
  assert.equal(getQuestionStatusBadge({ status: "OPEN", reviewStatus: "APPROVED" }).label, "可认领");
  assert.equal(getQuestionStatusBadge({ status: "OPEN", reviewStatus: "PENDING" }).label, "老师审核中");
  assert.match(getAnswerSubmitPrompt("PUBLIC_HALL"), /老师审核通过后/);
  assert.match(TEACHER_QUESTION_REVIEW_COPY.approveMessage, /提问成长能量/);
  assert.match(TEACHER_QUESTION_REVIEW_COPY.rejectMessage, /补充一点信息/);
});
