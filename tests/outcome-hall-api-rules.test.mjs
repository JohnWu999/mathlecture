import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const hallRoute = readFileSync(new URL("../app/api/hall/route.ts", import.meta.url), "utf8");

test("outcome hall list API selects existing Question.topic field, not removed knowledgePoint field", () => {
  assert.match(hallRoute, /topic:\s*true/);
  assert.doesNotMatch(hallRoute, /select:\s*{[\s\S]*knowledgePoint:\s*true[\s\S]*}/);
});
