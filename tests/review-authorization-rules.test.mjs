import test from "node:test";
import assert from "node:assert/strict";
import {
  canEnterOutcomeHall,
  canWithdrawPublicAuthorization,
  buildProjectArtifactDraft,
  getTeacherOutcomeReviewTabs,
  getAuthorizationStatusLabel,
} from "../lib/review-authorization-rules.mjs";

test("outcome hall visibility requires teacher approval and public authorization", () => {
  assert.equal(canEnterOutcomeHall({ reviewStatus: "APPROVED", shareScope: "PUBLIC_HALL" }), true);
  assert.equal(canEnterOutcomeHall({ reviewStatus: "PENDING", shareScope: "PUBLIC_HALL" }), false);
  assert.equal(canEnterOutcomeHall({ reviewStatus: "APPROVED", shareScope: "GROUP_ONLY" }), false);
  assert.equal(canEnterOutcomeHall({ reviewStatus: "WITHDRAWN", shareScope: "PUBLIC_HALL" }), false);
  assert.equal(canEnterOutcomeHall({ reviewStatus: "APPROVED", shareScope: "WITHDRAWN" }), false);
});

test("parent or teacher can withdraw public authorization without deleting the child work", () => {
  assert.equal(canWithdrawPublicAuthorization({ actorRole: "PARENT", ownerId: "u1", actorId: "u1" }), true);
  assert.equal(canWithdrawPublicAuthorization({ actorRole: "TEACHER", ownerId: "u1", actorId: "t1" }), true);
  assert.equal(canWithdrawPublicAuthorization({ actorRole: "ADMIN", ownerId: "u1", actorId: "a1" }), true);
  assert.equal(canWithdrawPublicAuthorization({ actorRole: "STUDENT", ownerId: "u1", actorId: "u2" }), false);
});

test("project submission from collaboration record becomes a pending project artifact", () => {
  const draft = buildProjectArtifactDraft({
    messageId: "m1",
    groupId: "g1",
    projectId: "p1",
    authorId: "u1",
    content: "[作品提交]\n我们做了一个影子测量海报\n作品/过程链接：https://example.com/poster.png",
  });

  assert.equal(draft.reviewStatus, "PENDING");
  assert.equal(draft.shareScope, "GROUP_ONLY");
  assert.equal(draft.sourceMessageId, "m1");
  assert.equal(draft.artifactUrl, "https://example.com/poster.png");
  assert.match(draft.title, /影子测量海报/);
});

test("teacher workspace exposes outcome review and authorization management tabs", () => {
  const tabs = getTeacherOutcomeReviewTabs();
  assert.deepEqual(tabs.map((tab) => tab.key), ["pending-outcomes", "public-authorized", "withdrawn"]);
  assert.match(tabs.map((tab) => tab.label).join(" "), /成果审核/);
  assert.match(tabs.map((tab) => tab.label).join(" "), /授权管理/);
  assert.doesNotMatch(tabs.map((tab) => tab.label).join(" "), /排名|比较/);
});

test("authorization label makes review and withdrawal boundaries explicit", () => {
  assert.equal(getAuthorizationStatusLabel({ reviewStatus: "PENDING", shareScope: "PUBLIC_HALL" }), "等待老师审核 · 已申请公开授权");
  assert.equal(getAuthorizationStatusLabel({ reviewStatus: "APPROVED", shareScope: "PUBLIC_HALL" }), "老师审核通过 · 已授权公开");
  assert.equal(getAuthorizationStatusLabel({ reviewStatus: "APPROVED", shareScope: "WITHDRAWN" }), "公开授权已撤回 · 不在成果广场展示");
});
