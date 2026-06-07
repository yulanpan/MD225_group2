import { expect, test, type Locator, type Page, type TestInfo } from "@playwright/test";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { createInitialState } from "../src/lib/game-rules";
import type { EndingId, GameState, PlayerProfile } from "../src/lib/types";

type VisualIssue = {
  type: "overflow" | "overlap";
  target: string;
  details: string;
};

const auditRoot = path.join(process.cwd(), "output/playwright/ui-audit/latest");
const reports: Array<{ name: string; issues: VisualIssue[] }> = [];

test.beforeAll(async () => {
  reports.length = 0;
  await rm(auditRoot, { recursive: true, force: true });
  await mkdir(auditRoot, { recursive: true });
});

test.afterAll(async () => {
  await writeFile(path.join(auditRoot, "visual-report.json"), JSON.stringify(reports, null, 2));
});

async function activateButton(button: Locator) {
  await expect(button).toBeEnabled();
  await button.evaluate((element) => {
    if (element instanceof HTMLButtonElement) element.click();
  });
}

async function captureAudit(page: Page, testInfo: TestInfo, name: string) {
  await page.waitForTimeout(450);
  await page.screenshot({ path: path.join(auditRoot, `${name}.png`), fullPage: true });
  const issues = await collectVisualIssues(page);
  reports.push({ name: `${testInfo.project.name}/${name}`, issues });
  expect(issues, `${name} visual issues`).toEqual([]);
}

async function collectVisualIssues(page: Page): Promise<VisualIssue[]> {
  return page.evaluate(() => {
    const selectors = [
      ".briefing-panel",
      ".onboarding-panel",
      ".tutorial-panel",
      ".engine-intro-panel",
      ".command-panel",
      ".modal-panel",
      ".dialogue-panel",
      ".trace-panel",
      ".unlock-panel",
      ".toast-stack",
      ".term-tooltip-layer"
    ];
    const overflowSelectors = [".topbar", ".audio-control", ...selectors];
    const tolerance = 6;
    const viewport = { width: window.innerWidth, height: window.innerHeight };

    function isVisible(element: Element) {
      const rect = element.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) return false;
      for (let current: Element | null = element; current; current = current.parentElement) {
        const style = window.getComputedStyle(current);
        if (style.display === "none" || style.visibility === "hidden") return false;
        if (Number(style.opacity) <= 0.05) return false;
      }
      return rect.bottom > 0 && rect.right > 0 && rect.left < viewport.width && rect.top < viewport.height;
    }

    function label(element: Element) {
      const classes = Array.from(element.classList).slice(0, 3).join(".");
      return `${element.tagName.toLowerCase()}${classes ? `.${classes}` : ""}`;
    }

    const elements = Array.from(new Set(overflowSelectors.flatMap((selector) => Array.from(document.querySelectorAll(selector)))));
    const visible = elements
      .filter(isVisible)
      .map((element) => ({ element, selector: selectors.find((selector) => element.matches(selector)) ?? "", label: label(element), rect: element.getBoundingClientRect() }));
    const issues: VisualIssue[] = [];

    for (const item of visible) {
      const { rect } = item;
      if (rect.left < -tolerance || rect.top < -tolerance || rect.right > viewport.width + tolerance || rect.bottom > viewport.height + tolerance) {
        issues.push({
          type: "overflow",
          target: item.label,
          details: `viewport ${viewport.width}x${viewport.height}, rect ${Math.round(rect.left)},${Math.round(rect.top)},${Math.round(rect.right)},${Math.round(rect.bottom)}`
        });
      }
    }

    const floating = visible.filter((item) => item.selector);
    for (let firstIndex = 0; firstIndex < floating.length; firstIndex += 1) {
      for (let secondIndex = firstIndex + 1; secondIndex < floating.length; secondIndex += 1) {
        const first = floating[firstIndex];
        const second = floating[secondIndex];
        if (first.element.contains(second.element) || second.element.contains(first.element)) continue;
        const left = Math.max(first.rect.left, second.rect.left);
        const right = Math.min(first.rect.right, second.rect.right);
        const top = Math.max(first.rect.top, second.rect.top);
        const bottom = Math.min(first.rect.bottom, second.rect.bottom);
        const area = Math.max(0, right - left) * Math.max(0, bottom - top);
        if (area > 900) {
          issues.push({
            type: "overlap",
            target: `${first.label} / ${second.label}`,
            details: `overlap area ${Math.round(area)}`
          });
        }
      }
    }

    return issues;
  });
}

async function resetGame(page: Page) {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.goto("/dashboard");
}

async function beginAndShowOnboarding(page: Page) {
  await page.getByRole("button", { name: "Begin Operations" }).click();
  const tutorialPanel = page.locator(".onboarding-panel");
  await expect(tutorialPanel).toBeVisible();
}

async function setArchiveProfile(page: Page) {
  const profile: PlayerProfile = {
    version: 2,
    achievements: [
      { id: "firstShift", runId: "visual-run", unlockedAt: "2026-05-21T00:00:00.000Z" },
      { id: "dialogueHandler", runId: "visual-run", unlockedAt: "2026-05-21T00:00:00.000Z" }
    ],
    runs: [
      {
        id: "visual-run",
        completedAt: "2026-05-21T00:00:00.000Z",
        endingId: "unstableFeed",
        language: "en",
        finalMetrics: { truth: 5, pressure: 6, virality: 5, publicDoubt: 6, reputation: 3, systemSuspicion: 4 },
        actionPath: [
          { actionId: "publishTailorsClaim", title: "Publish the Tailors' Claim", choice: "direct" },
          { actionId: "showUnfilteredComments", title: "Show Unfiltered Comments", choice: "direct" }
        ],
        feedEvents: [{ title: "Incoming Transmission", text: "A record of an interrupted editorial exchange." }],
        dialogueSummaries: ["The exchange ended with public doubt still active."],
        dialogueCount: 1,
        achievementsUnlocked: ["firstShift", "dialogueHandler"],
        engineFragmentsUnlocked: [],
        biasAwarenessAfterRun: 25
      }
    ],
    engineFragments: [],
    biasAwareness: 25,
    decodedEngine: false,
    secretEndingUnlocked: false
  };
  await page.goto("/");
  await page.evaluate((storedProfile) => {
    localStorage.clear();
    localStorage.setItem("emperor-feed-profile", JSON.stringify(storedProfile));
  }, profile);
}

async function setEndingState(page: Page, endingId: EndingId) {
  const state: GameState = {
    ...createInitialState("en"),
    truth: 5,
    pressure: 7,
    virality: 6,
    publicDoubt: 7,
    reputation: 2,
    systemSuspicion: 5,
    actionsLeft: 0
  };
  await page.goto("/");
  await page.evaluate(({ storedState, storedEnding }) => {
    localStorage.clear();
    localStorage.setItem("emperor-feed-final-state", JSON.stringify(storedState));
    localStorage.setItem("emperor-feed-ending", storedEnding);
  }, { storedState: state, storedEnding: endingId });
}

test.describe("desktop visual audit", () => {
  test("captures onboarding, guidance, command, and dialogue states", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "Desktop-only visual audit.");

    await resetGame(page);
    await captureAudit(page, testInfo, "01-briefing");

    await beginAndShowOnboarding(page);
    await captureAudit(page, testInfo, "02-onboarding-spotlight");
    await page.locator(".onboarding-panel").getByRole("button", { name: "Skip Tutorial" }).click();
    await expect(page.locator(".onboarding-panel")).toHaveCount(0);
    await expect(page.locator(".engine-intro-panel")).toHaveCount(0);
    await expect(page.locator(".guidance-card")).toBeVisible();
    await captureAudit(page, testInfo, "03-guidance");

    await page.locator(".action-card").filter({ hasText: "Publish the Tailors' Claim" }).getByRole("button", { name: "Preview Result" }).click();
    await expect(page.locator(".trace-panel")).toBeVisible();
    await captureAudit(page, testInfo, "04-trace-panel");
    await page.getByRole("button", { name: "Close Preview" }).click();

    await page.locator(".action-card").filter({ hasText: "Publish the Tailors' Claim" }).getByRole("button", { name: "Publish" }).click();
    await expect(page.locator(".command-panel")).toBeVisible();
    await captureAudit(page, testInfo, "05-command-preview");
    await page.locator("[data-tour-target=\"command-commit\"]").click();

    await page.getByRole("button", { name: "Public Comments" }).click();
    await captureAudit(page, testInfo, "06-public-guidance");
    await page.locator(".action-card").filter({ hasText: "Show Unfiltered Comments" }).getByRole("button", { name: "Publish" }).click();
    await expect(page.locator(".command-panel")).toBeVisible();
    await page.locator("[data-tour-target=\"command-commit\"]").click();

    const dialoguePanel = page.locator(".dialogue-panel");
    await expect(dialoguePanel).toBeVisible();
    await captureAudit(page, testInfo, "07-dialogue-panel");
    await activateButton(dialoguePanel.getByRole("button", { name: "The public should know." }));
    await expect(dialoguePanel.locator(".dialogue-message.speaker").last()).not.toContainText("Signal forming", { timeout: 15000 });
    await captureAudit(page, testInfo, "08-dialogue-response");
  });

  test("keeps core operations in bounds across desktop viewport ratios", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "Desktop-only visual audit.");
    test.setTimeout(180000);

    const viewports = [
      { name: "1280x720", width: 1280, height: 720 },
      { name: "1366x768", width: 1366, height: 768 },
      { name: "1440x900", width: 1440, height: 900 },
      { name: "1920x1080", width: 1920, height: 1080 }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await resetGame(page);
      await captureAudit(page, testInfo, `${viewport.name}-briefing`);

      await beginAndShowOnboarding(page);
      await captureAudit(page, testInfo, `${viewport.name}-onboarding`);
      await page.locator(".onboarding-panel").getByRole("button", { name: "Skip Tutorial" }).click();
      await expect(page.locator(".onboarding-panel")).toHaveCount(0);

      await page.locator(".action-card").filter({ hasText: "Publish the Tailors' Claim" }).getByRole("button", { name: "Preview Result" }).click();
      await expect(page.locator(".trace-panel")).toBeVisible();
      await captureAudit(page, testInfo, `${viewport.name}-trace`);
      await page.getByRole("button", { name: "Close Preview" }).click();

      await page.locator(".action-card").filter({ hasText: "Publish the Tailors' Claim" }).getByRole("button", { name: "Publish" }).click();
      await expect(page.locator(".command-panel")).toBeVisible();
      await captureAudit(page, testInfo, `${viewport.name}-command`);
      await page.locator("[data-tour-target=\"command-commit\"]").click();

      await page.getByRole("button", { name: "Public Comments" }).click();
      await page.locator(".action-card").filter({ hasText: "Show Unfiltered Comments" }).getByRole("button", { name: "Publish" }).click();
      await expect(page.locator(".command-panel")).toBeVisible();
      await page.locator("[data-tour-target=\"command-commit\"]").click();
      await expect(page.locator(".dialogue-panel")).toBeVisible({ timeout: 15000 });
      await captureAudit(page, testInfo, `${viewport.name}-dialogue`);
    }
  });

  test("captures archive and ending layouts", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "Desktop-only visual audit.");

    await setArchiveProfile(page);
    await page.goto("/archive");
    await expect(page.locator(".archive-room-grid")).toBeVisible();
    await captureAudit(page, testInfo, "09-archive-room");

    await setEndingState(page, "unstableFeed");
    await page.goto("/ending");
    await expect(page.locator(".ending-layout")).toBeVisible();
    await captureAudit(page, testInfo, "10-ending-report");
  });
});
