import test from "node:test";
import assert from "node:assert/strict";

import {
  PROJECT_CAMP_COPY,
  getProjectTypeLabel,
  getProjectReadiness,
  getProjectTeamStatus,
  formatProjectValidity,
  getProjectEnrollmentCopy,
  getProjectGrowthPrompt,
} from "../lib/project-camp-ui-rules.mjs";

test("project camp copy frames projects as exploration instead of point gates", () => {
  assert.match(PROJECT_CAMP_COPY.title, /项目营/);
  assert.match(PROJECT_CAMP_COPY.subtitle, /真实任务/);
  assert.match(PROJECT_CAMP_COPY.safetyNote, /准备度/);
  assert.doesNotMatch(PROJECT_CAMP_COPY.safetyNote, /积分|排行榜|超过多少人/);
});

test("project type labels separate free exploration from paid guided projects", () => {
  assert.equal(getProjectTypeLabel("FREE").label, "基础项目");
  assert.match(getProjectTypeLabel("FREE").helper, /免费/);
  assert.equal(getProjectTypeLabel("PAID").label, "主题项目包");
  assert.match(getProjectTypeLabel("PAID").helper, /老师/);
});

test("readiness copy uses participation conditions without exposing points", () => {
  const readiness = getProjectReadiness({
    unlockRule: "适合完成过一次讲解或愿意和同伴讨论的孩子",
    knowledgeTags: ["测量", "估算", "表达"],
  });
  assert.equal(readiness.title, "准备度 / 参与条件");
  assert.match(readiness.summary, /适合完成过一次讲解/);
  assert.match(readiness.tags.join(" "), /测量/);
  assert.doesNotMatch(readiness.summary, /积分|成长能量\s*\d+|分解锁/);
});

test("team status and validity are child-readable", () => {
  assert.match(getProjectTeamStatus({ registrations: 2, groups: 0, groupSizeMin: 3, groupSizeMax: 5 }).label, /正在成组/);
  assert.match(getProjectTeamStatus({ registrations: 6, groups: 2, groupSizeMin: 3, groupSizeMax: 5 }).label, /已有小组/);
  assert.equal(formatProjectValidity(null), "长期开放，老师会根据报名情况安排开始时间");
  assert.match(formatProjectValidity("2026-06-30T00:00:00.000Z"), /有效期至/);
});

test("enrollment and growth prompts keep low-anxiety project language", () => {
  const freeCopy = getProjectEnrollmentCopy({ projectType: "FREE", price: 0 });
  const paidCopy = getProjectEnrollmentCopy({ projectType: "PAID", price: 9900 });
  assert.match(freeCopy.cta, /申请加入/);
  assert.match(freeCopy.helper, /老师确认/);
  assert.match(paidCopy.helper, /人工确认/);
  assert.doesNotMatch(paidCopy.helper, /立即付款|扫码付款/);

  const prompt = getProjectGrowthPrompt();
  assert.match(prompt, /探索成长能量/);
  assert.match(prompt, /不排名/);
});
