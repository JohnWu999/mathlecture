import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import * as outcomeRules from "../lib/outcome-hall-ui-rules.mjs";

const hallPage = readFileSync(new URL("../app/hall/page.tsx", import.meta.url), "utf8");
const hallRoute = readFileSync(new URL("../app/api/hall/route.ts", import.meta.url), "utf8");
const outcomeRulesSource = readFileSync(new URL("../lib/outcome-hall-ui-rules.mjs", import.meta.url), "utf8");

test("P0-2 global empty state says first trial works are under review, not a hollow plaza", () => {
  assert.match(outcomeRulesSource, /export const OUTCOME_HALL_EMPTY_STATE/);
  assert.equal(typeof outcomeRules.getOutcomeHallEmptyState, "function");
  const emptyState = outcomeRules.getOutcomeHallEmptyState({ totalPublicOutcomes: 0 });

  assert.equal(emptyState.state, "REVIEWING_FIRST_BATCH");
  assert.match(emptyState.title, /第一批|试运营|审核/);
  assert.match(emptyState.description, /老师审核|家长|授权/);
  assert.match(emptyState.description, /不会展示未经授权|未经授权/);
  assert.match(emptyState.primaryActionLabel, /回到你问我答|提出问题/);
  assert.equal(emptyState.primaryActionHref, "/math-young-lecturer/qa");
  assert.doesNotMatch(`${emptyState.title}${emptyState.description}`, /排行榜|积分|超过.*同学|Top/i);
});

test("P0-2 category empty copy keeps authorization boundary for every tab", () => {
  for (const type of ["QUESTION", "LECTURE", "PROJECT"]) {
    const copy = outcomeRules.getOutcomeEmptyCopy(type);
    assert.match(copy, /审核|授权|第一批/);
    assert.match(copy, /未经授权|不会展示/);
    assert.doesNotMatch(copy, /排行榜|积分|超过.*同学|Top/i);
  }
});

test("P0-2 API returns emptyState metadata and still only selects authorized public outcomes", () => {
  assert.match(hallRoute, /emptyState:\s*getOutcomeHallEmptyState\(\{\s*totalPublicOutcomes:\s*outcomes\.length\s*\}\)/s);
  assert.match(hallRoute, /authorizationRule/);
  assert.match(hallRoute, /reviewStatus:\s*"APPROVED"/);
  assert.match(hallRoute, /shareScope:\s*"PUBLIC_HALL"/);
  assert.match(hallRoute, /canEnterOutcomeHall/);
});

test("P0-2 page renders the API empty-state card and does not show fake works", () => {
  assert.match(hallPage, /emptyState\?:\s*OutcomeHallEmptyState/);
  assert.match(hallPage, /const emptyState = data\?\.emptyState \|\| OUTCOME_HALL_EMPTY_STATE/);
  assert.match(hallPage, /emptyState\.title/);
  assert.match(hallPage, /emptyState\.description/);
  assert.match(hallPage, /emptyState\.primaryActionHref/);
  assert.doesNotMatch(hallPage, /demoOutcome|mockOutcome|placeholderOutcome|fakeOutcome/);
});

test("P0-2 filter continues to suppress unapproved or unauthorized items", () => {
  const outcomes = [
    { id: "ok", reviewStatus: "APPROVED", shareScope: "PUBLIC_HALL" },
    { id: "pending", reviewStatus: "PENDING", shareScope: "PUBLIC_HALL" },
    { id: "private", reviewStatus: "APPROVED", shareScope: "GROUP_ONLY" },
  ];
  assert.deepEqual(outcomeRules.filterPublicOutcomes(outcomes).map((item) => item.id), ["ok"]);
  assert.match(outcomeRules.OUTCOME_HALL_EMPTY_STATE.description, /未经授权|不会展示/);
});
