import test from "node:test";
import assert from "node:assert/strict";

import {
  GROWTH_ENERGY_SOURCES,
  GROWTH_ENERGY_USES,
  IDENTITY_PASSPORTS,
  getGrowthEnergyCopy,
  getIdentityPassportCard,
  formatGrowthEnergyTransaction,
  getPassportSafetyCopy,
} from "../lib/growth-passport-ui-rules.mjs";

test("growth energy explains where energy comes from and what it is used for without rankings", () => {
  assert.equal(GROWTH_ENERGY_SOURCES.length >= 4, true);
  assert.match(GROWTH_ENERGY_SOURCES.join(" "), /提问/);
  assert.match(GROWTH_ENERGY_SOURCES.join(" "), /讲解/);
  assert.match(GROWTH_ENERGY_SOURCES.join(" "), /项目/);
  assert.match(GROWTH_ENERGY_USES.join(" "), /记录个人成长/);
  assert.match(GROWTH_ENERGY_USES.join(" "), /项目准备度/);

  const copy = getGrowthEnergyCopy(120);
  assert.match(copy.title, /我的数学成长能量/);
  assert.match(copy.current, /120/);
  assert.equal(copy.rankingEnabled, false);
  assert.match(copy.parentExplanation, /不用于公开排名/);
  assert.match(copy.childExplanation, /不代表谁更聪明/);
});

test("passport identity cards expose three private growth identities with 1 to 3 stars", () => {
  assert.deepEqual(
    IDENTITY_PASSPORTS.map((item) => item.type),
    ["QUESTIONER", "LECTURER", "EXPLORER"]
  );

  const lecturer = getIdentityPassportCard({ identityType: "LECTURER", level: 2, effectiveCount: 3, qualityCount: 1 });
  assert.equal(lecturer.label, "小讲师");
  assert.equal(lecturer.stars, "★★☆");
  assert.match(lecturer.nextStep, /继续讲清楚/);
  assert.equal(lecturer.publicRanking, false);

  const unknown = getIdentityPassportCard({ identityType: "QUESTIONER", level: 0, effectiveCount: 0, qualityCount: 0 });
  assert.equal(unknown.stars, "☆☆☆");
  assert.match(unknown.nextStep, /提出一个真实问题/);
});

test("recent growth energy transactions use warm ledger language and keep identity exchange separate", () => {
  const tx = formatGrowthEnergyTransaction({
    amount: 5,
    displayLabel: "提问成长能量",
    userMessage: "你把问题说清楚了。",
    affectsIdentityLevel: false,
    createdAt: "2026-06-02T11:00:00.000Z",
  });

  assert.match(tx.amountLabel, /\+5/);
  assert.match(tx.title, /提问成长能量/);
  assert.match(tx.message, /你把问题说清楚了/);
  assert.match(tx.identityNote, /不会直接兑换身份星级/);
});

test("passport safety copy explicitly prevents public point pressure", () => {
  const safety = getPassportSafetyCopy();
  assert.match(safety.child, /不是比赛/);
  assert.match(safety.parent, /不用于公开排名/);
  assert.match(safety.parent, /不代表谁更聪明/);
  assert.equal(safety.showPublicPointTotal, false);
});
