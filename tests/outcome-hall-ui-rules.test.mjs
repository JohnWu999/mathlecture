import test from "node:test";
import assert from "node:assert/strict";

import {
  OUTCOME_HALL_COPY,
  OUTCOME_TYPES,
  SHARE_AUTHORIZATION_COPY,
  buildOutcomeCard,
  getOutcomeTypeMeta,
  filterPublicOutcomes,
  getOutcomeDetailSections,
  getOutcomeEmptyCopy,
} from "../lib/outcome-hall-ui-rules.mjs";

test("outcome hall copy frames public works as reviewed and authorized inspiration", () => {
  assert.match(OUTCOME_HALL_COPY.title, /成果广场/);
  assert.match(OUTCOME_HALL_COPY.subtitle, /审核/);
  assert.match(OUTCOME_HALL_COPY.subtitle, /授权/);
  assert.match(OUTCOME_HALL_COPY.safetyNote, /互相启发/);
  assert.doesNotMatch(OUTCOME_HALL_COPY.safetyNote, /排行榜|Top|超过多少人|积分/);
});

test("outcome types cover question sprout, lecture growth and project forest", () => {
  assert.deepEqual(OUTCOME_TYPES.map((item) => item.type), ["QUESTION", "LECTURE", "PROJECT"]);
  assert.equal(getOutcomeTypeMeta("LECTURE").label, "讲解长高");
  assert.equal(getOutcomeTypeMeta("UNKNOWN").type, "LECTURE");
});

test("public outcomes require teacher approval and public hall authorization", () => {
  const outcomes = [
    { id: "a", reviewStatus: "APPROVED", shareScope: "PUBLIC_HALL" },
    { id: "b", reviewStatus: "PENDING", shareScope: "PUBLIC_HALL" },
    { id: "c", reviewStatus: "APPROVED", shareScope: "QUESTION_AUTHOR_ONLY" },
  ];
  assert.deepEqual(filterPublicOutcomes(outcomes).map((item) => item.id), ["a"]);
});

test("outcome card preserves child voice and exposes review authorization status", () => {
  const card = buildOutcomeCard({
    type: "LECTURE",
    title: "分数为什么要通分？",
    childName: "小树苗",
    grade: 2,
    childExpression: "我先画了两条一样长的线。",
    teacherNote: "画图帮助同学看见了单位。",
    reviewStatus: "APPROVED",
    shareScope: "PUBLIC_HALL",
  });

  assert.equal(card.typeLabel, "讲解长高");
  assert.match(card.title, /分数/);
  assert.match(card.childLine, /我先画/);
  assert.match(card.teacherLine, /老师看见/);
  assert.match(card.authorizationLabel, /审核通过/);
  assert.match(card.authorizationLabel, /授权公开/);
  assert.doesNotMatch(card.authorizationLabel, /排名|积分/);
});

test("detail sections explain child thinking, teacher note and sharing boundary", () => {
  const sections = getOutcomeDetailSections({ type: "PROJECT" });
  assert.deepEqual(sections.map((item) => item.key), ["child-thinking", "teacher-note", "sharing-boundary"]);
  assert.match(sections[0].title, /孩子/);
  assert.match(SHARE_AUTHORIZATION_COPY, /老师审核/);
  assert.match(SHARE_AUTHORIZATION_COPY, /家长|授权/);
  assert.match(getOutcomeEmptyCopy("PROJECT"), /项目/);
});
