import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const playerVisibleFiles = [
  "src/app/login/page.tsx",
  "src/app/page.tsx",
  "src/app/credits/page.tsx",
  "src/app/archive/page.tsx",
  "src/app/ending/ending-client.tsx",
  "src/app/dashboard/dashboard-client.tsx",
  "src/lib/i18n.ts",
  "src/lib/onboarding-copy.ts"
];

const implementationTerms = [
  "SQLite",
  "httpOnly",
  "localStorage",
  "JavaScript",
  "规则系统",
  "token",
  "session",
  "cookie",
  "API"
];

function chineseStringLiterals(source: string) {
  const matches = source.matchAll(/"([^"\\]*(?:\\.[^"\\]*)*)"|'([^'\\]*(?:\\.[^'\\]*)*)'|`([^`\\]*(?:\\.[^`\\]*)*)`/g);
  return [...matches]
    .map((match) => match[1] ?? match[2] ?? match[3] ?? "")
    .filter((text) => /[\u4e00-\u9fff]/.test(text));
}

describe("player-facing Chinese copy", () => {
  it("does not expose implementation details in primary UI copy", () => {
    for (const file of playerVisibleFiles) {
      const source = fs.readFileSync(path.join(process.cwd(), file), "utf8");
      const copy = chineseStringLiterals(source).join("\n");

      for (const term of implementationTerms) {
        expect(copy, `${file} should not expose ${term}`).not.toContain(term);
      }
    }
  });
});
