import test from "node:test";
import assert from "node:assert/strict";

import {
  PROJECT_COLLAB_COPY,
  PROJECT_MESSAGE_TYPES,
  buildProjectTaskCards,
  getActiveTaskCard,
  getProjectMessageType,
  buildTypedMessageContent,
  getProjectSubmissionPrompt,
  getProjectFeedbackPrompt,
  getProjectCollabGrowthPrompt,
  getAiBoundaryCopy,
} from "../lib/project-collab-ui-rules.mjs";

test("collaboration copy frames project space as task work, traces, and child voice", () => {
  assert.match(PROJECT_COLLAB_COPY.title, /项目协作空间/);
  assert.match(PROJECT_COLLAB_COPY.subtitle, /任务卡/);
  assert.match(PROJECT_COLLAB_COPY.safetyNote, /孩子自己的观察/);
  assert.doesNotMatch(PROJECT_COLLAB_COPY.safetyNote, /AI代写|排行榜|积分/);
});

test("task cards are generated from project duration and current day progress", () => {
  const cards = buildProjectTaskCards({ durationDays: 5, dayProgress: 3 });
  assert.equal(cards.length, 5);
  assert.equal(cards[0].status, "done");
  assert.equal(cards[2].status, "active");
  assert.equal(cards[4].status, "locked");
  assert.match(cards[2].childAction, /今天/);
  assert.match(getActiveTaskCard(cards).title, /Day 3/);
});

test("message types separate discussion, evidence, submission and reflection", () => {
  assert.deepEqual(PROJECT_MESSAGE_TYPES.map((item) => item.type), ["DISCUSSION", "EVIDENCE", "SUBMISSION", "REFLECTION"]);
  assert.equal(getProjectMessageType("SUBMISSION").label, "作品提交");
  assert.match(getProjectMessageType("REFLECTION").helper, /感受/);
});

test("typed message content preserves child words and labels process traces", () => {
  const content = buildTypedMessageContent({ type: "SUBMISSION", text: "这是我们的测量海报", artifactUrl: "https://example.com/poster.png" });
  assert.match(content, /\[作品提交\]/);
  assert.match(content, /这是我们的测量海报/);
  assert.match(content, /https:\/\/example.com/);
  assert.doesNotMatch(content, /AI已优化|标准答案/);
});

test("submission feedback growth and AI boundary prompts are low-anxiety", () => {
  assert.match(getProjectSubmissionPrompt(), /老师审核/);
  assert.match(getProjectSubmissionPrompt(), /成果广场/);
  assert.match(getProjectFeedbackPrompt(), /三句话以内/);
  assert.match(getProjectCollabGrowthPrompt(), /探索成长能量/);
  assert.match(getProjectCollabGrowthPrompt(), /不排名/);
  assert.match(getAiBoundaryCopy(), /不替孩子/);
});
