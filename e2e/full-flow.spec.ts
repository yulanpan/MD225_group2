import { expect, test, type Locator, type Page } from "@playwright/test";
import { initialState } from "../src/lib/game-data";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
});

async function beginOperationsAndSkipTutorial(page: Page, buttonName = "Begin Operations", skipName = "Skip") {
  await page.getByRole("button", { name: buttonName }).click();
  const tutorialPanel = page.locator(".tutorial-panel");
  await expect(tutorialPanel).toBeVisible();
  await tutorialPanel.getByRole("button", { name: skipName }).click();
  await expect(tutorialPanel).toHaveCount(0);
  const engineIntro = page.locator(".engine-intro-panel");
  await expect(engineIntro).toBeVisible();
  await engineIntro.getByRole("button", { name: /Connect Engine|连接引擎/ }).click();
  await expect(engineIntro).toHaveCount(0);
}

async function activateButton(button: Locator) {
  await expect(button).toBeEnabled();
  await button.evaluate((element) => {
    if (element instanceof HTMLButtonElement) element.click();
  });
}

async function resolveDialogueIfOpen(page: Page) {
  const panel = page.locator(".dialogue-panel");
  try {
    await expect(panel).toBeVisible({ timeout: 4500 });
  } catch {
    return;
  }
  const endExchange = panel.getByRole("button", { name: /End Exchange|Resolve Exchange|结束交流|结算交流/ });
  await activateButton(endExchange);
  await expect(panel).toHaveCount(0, { timeout: 15000 });
}

test("completes a six-action editorial shift and reaches the archive", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page.getByRole("dialog", { name: "Shift Briefing" })).toBeVisible();
  await beginOperationsAndSkipTutorial(page);
  await expect(page.locator(".topbar")).toBeVisible();
  await expect(page.locator(".scroll-progress")).toBeAttached();
  await expect(page.locator(".cursor-light")).toBeAttached();
  await expect(page.locator(".panel-shell.lab-shell")).toBeVisible();
  await expect(page.locator(".phase-strip")).toBeVisible();
  await expect(page.locator(".phase-step.active")).toContainText("Source Focus");
  await expect(page.locator(".narrative-arc")).toContainText("Current Narrative Phase");
  await expect(page.locator(".narrative-arc")).toContainText("Dominant Pressure");
  await expect(page.locator(".lab-head")).toBeVisible();
  await expect(page.locator(".lab-body")).toBeVisible();
  await expect(page.locator(".feed-grid")).toBeVisible();
  await expect(page.locator(".action-grid")).toBeVisible();
  await expect(page.locator(".action-card").first()).toBeVisible();
  await expect(page.locator(".feed-log")).toBeVisible();
  await expect(page.locator(".engine-stack")).toBeVisible();
  await expect(page.locator(".engine-eye")).toBeVisible();
  await expect(page.locator(".lab-footer")).toBeVisible();
  await expect(page.getByLabel("Public doubt heat map")).toBeVisible();

  await page.locator(".action-card").filter({ hasText: "Leak a Loom Photo" }).getByRole("button", { name: "Inspect Trace" }).click();
  await expect(page.getByRole("dialog", { name: "Action Trace" })).toBeVisible();
  await expect(page.getByRole("dialog", { name: "Action Trace" })).toContainText("Requires: Inspect the Looms.");
  await page.getByRole("button", { name: "Close Trace" }).click();

  await page.locator(".action-card").filter({ hasText: "Publish the Tailors' Claim" }).getByRole("button", { name: "Commit Action" }).click();
  await expect(page.locator(".dashboard-page")).toHaveAttribute("data-phase", "previewing");
  await expect(page.locator(".phase-step.active")).toContainText("Command Preview");
  await expect(page.locator(".command-overlay.active")).toBeVisible();
  await expect(page.locator(".command-overlay.active")).toContainText("Publish the Tailors' Claim");
  await expect(page.locator(".command-overlay.active")).toContainText("Virality +2");
  await page.getByRole("button", { name: "Commit Simulation" }).click();
  await expect(page.locator(".live-status")).toContainText("5 actions left");
  await expect(page.locator(".toast-stack")).toContainText("Publish the Tailors' Claim");
  await expect(page.locator(".feed-log")).toContainText("Publish the Tailors' Claim");
  await expect(page.locator(".feed-log")).toContainText("Shame Frame Holds");
  await expect(page.locator(".action-card").filter({ hasText: "Publish the Tailors' Claim" })).toContainText("Completed");
  await expect(page.locator(".action-card").filter({ hasText: "Publish the Tailors' Claim" }).locator(".record-stamp")).toContainText("Recorded");
  await page.reload();
  await expect(page.locator(".live-status")).toContainText("5 actions left");
  await expect(page.locator(".feed-log")).toContainText("Publish the Tailors' Claim");
  await expect(page.locator(".action-card").filter({ hasText: "Publish the Tailors' Claim" })).toContainText("Completed");
  await page.locator(".action-card").filter({ hasText: "Inspect the Looms" }).getByRole("button", { name: "Commit Action" }).click();
  await expect(page.locator(".command-overlay.active")).toBeVisible();
  await page.getByRole("button", { name: "Commit Simulation" }).click();
  await resolveDialogueIfOpen(page);
  await page.locator(".action-card").filter({ hasText: "Leak a Loom Photo" }).getByRole("button", { name: "Inspect Trace" }).click();
  await expect(page.getByRole("dialog", { name: "Action Trace" })).toContainText("Available");
  await expect(page.getByRole("dialog", { name: "Action Trace" })).toContainText("Original");
  await page.getByRole("button", { name: "Close Trace" }).click();
  await expect(page.locator(".action-card").filter({ hasText: "Leak a Loom Photo" }).getByRole("button", { name: "Request Engine Review" })).toHaveText("Request Engine Review");
  await page.locator(".action-card").filter({ hasText: "Leak a Loom Photo" }).getByRole("button", { name: "Request Engine Review" }).click();
  await expect(page.locator(".dashboard-page")).toHaveAttribute("data-phase", "previewing");
  await expect(page.locator(".modal-overlay.active")).toBeVisible();
  await expect(page.getByRole("dialog", { name: "AI Intervention" })).toBeVisible();
  await expect(page.locator(".readout")).toHaveCount(4);
  await expect(page.locator(".modal-badge")).toBeVisible();
  await expect(page.locator(".risk-meter")).toBeVisible();
  await page.getByRole("button", { name: "Publish Original Evidence" }).click();
  await expect(page.locator(".dashboard-page")).toHaveAttribute("data-last-risk", "risk");
  await expect(page.locator(".live-status")).toContainText("3 actions left");
  await resolveDialogueIfOpen(page);

  await page.getByRole("button", { name: "The Public Comments" }).click();
  await page.locator(".action-card").filter({ hasText: "Show Unfiltered Comments" }).getByRole("button", { name: "Commit Action" }).click();
  await expect(page.locator(".command-overlay.active")).toBeVisible();
  await page.getByRole("button", { name: "Commit Simulation" }).click();
  await expect(page.locator(".live-status")).toContainText("2 actions left");
  await resolveDialogueIfOpen(page);
  await page.locator(".action-card").filter({ hasText: "Fact-check the Trend" }).getByRole("button", { name: "Commit Action" }).click();
  await expect(page.locator(".command-overlay.active")).toBeVisible();
  await page.getByRole("button", { name: "Commit Simulation" }).click();
  await expect(page.locator(".live-status")).toContainText("1 actions left");

  await page.getByRole("button", { name: "The Child's Voice" }).click();
  await page.locator(".action-card").filter({ hasText: "Livestream the Crowd Reaction" }).getByRole("button", { name: "Commit Action" }).click();
  await expect(page.locator(".command-overlay.active")).toBeVisible();
  await page.getByRole("button", { name: "Commit Simulation" }).click();

  await expect(page).toHaveURL(/\/ending/);
  await expect(page.getByText("Post-Parade Archive")).toBeVisible();
  await expect(page.getByText("Final Feed State")).toBeVisible();
  await expect(page.locator(".ending-layout")).toBeVisible();
  await expect(page.locator(".archive-card")).toBeVisible();
  await expect(page.locator(".outcome-stack")).toBeVisible();
  await expect(page.locator(".history-list").first()).toBeVisible();
  await expect(page.getByText("Why This Ending Triggered")).toBeVisible();
  await expect(page.getByText("Live Feed Record")).toBeVisible();
  await expect(page.getByText("Run Analysis")).toBeVisible();
  await expect(page.getByText("Next Replay Objective")).toBeVisible();
  await expect(page.getByText("Action Path")).toBeVisible();
  await expect(page.getByText("Narrative Consequences")).toBeVisible();
  await expect(page.locator(".action-path-rail")).toBeVisible();
  await page.getByRole("button", { name: /Try for/ }).first().click();
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.locator(".replay-target")).toBeVisible();
});

test("poll outcomes respond to the current pressure and doubt balance", async ({ page }) => {
  await page.evaluate((storedState) => {
    localStorage.setItem("emperor-feed-state", JSON.stringify(storedState));
    localStorage.setItem("emperor-feed-profile", JSON.stringify({
      version: 2,
      achievements: [],
      runs: [{ id: "run-e2e", completedAt: "2026-05-20T00:00:00.000Z", endingId: "unstableFeed", language: "en", finalMetrics: {}, actionPath: [], dialogueCount: 0, achievementsUnlocked: [] }],
      engineFragments: [],
      biasAwareness: 0,
      decodedEngine: false,
      secretEndingUnlocked: false
    }));
  }, {
    ...initialState,
    pressure: 2,
    publicDoubt: 4
  });

  await page.goto("/dashboard");
  await beginOperationsAndSkipTutorial(page);
  await page.getByRole("button", { name: "The Public Comments" }).click();
  await page.locator(".action-card").filter({ hasText: "Run a Poll" }).getByRole("button", { name: "Commit Action" }).click();
  await expect(page.locator(".command-overlay.active")).toBeVisible();
  await page.getByRole("button", { name: "Commit Simulation" }).click();

  await expect(page.locator(".feed-log")).toContainText("39% Yes");
  await expect(page.locator(".metric").filter({ hasText: "Truth" })).toContainText("1");
});

test("dialogue interruptions allow quick replies and resolve into the feed", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page.getByRole("dialog", { name: "Shift Briefing" })).toBeVisible();
  await beginOperationsAndSkipTutorial(page);

  const guidedCoach = page.locator(".guided-coach-panel");
  await expect(guidedCoach).toBeVisible();
  await guidedCoach.getByRole("button", { name: "Open the trace brief" }).click();
  await expect(page.getByRole("dialog", { name: "Action Trace" })).toBeVisible();
  await page.getByRole("button", { name: "Close Trace" }).click();
  await guidedCoach.getByRole("button", { name: "Commit the first record" }).click();
  await page.getByRole("button", { name: "Commit Simulation" }).click();
  await expect(guidedCoach).toContainText("Read the public signal");
  await guidedCoach.getByRole("button", { name: "Go to Public Comments" }).click();
  await guidedCoach.getByRole("button", { name: "Go to Public Comments" }).click();
  await page.getByRole("button", { name: "Commit Simulation" }).click();

  const panel = page.locator(".dialogue-panel");
  await expect(panel).toBeVisible();
  await expect(panel).toContainText("Incoming Transmission");
  await expect(panel.locator(".dialogue-guide")).toBeVisible();
  await expect(panel.locator(".dialogue-guide")).toContainText("New Player Guide");
  await expect(panel.locator(".dialogue-guide")).toContainText("Choose one quick reply");
  const publicReply = panel.getByRole("button", { name: "The public should know." });
  await activateButton(publicReply);
  await expect(panel.locator(".dialogue-message.player")).toContainText("The public should know this doubt exists.", { timeout: 10000 });
  await expect(panel.locator(".dialogue-message.speaker").last()).not.toContainText("Signal forming");
  await expect(panel.locator(".dialogue-guide")).toContainText("You have answered");
  await expect(panel.getByRole("button", { name: "The public should know." })).toHaveCount(0);
  const nextReplies = panel.locator(".dialogue-quick button");
  await expect(nextReplies.first()).toBeVisible({ timeout: 15000 });
  await expect(nextReplies.first()).toBeEnabled();
  const endExchange = panel.getByRole("button", { name: /End Exchange|Resolve Exchange/ });
  await activateButton(endExchange);
  await expect(panel).toHaveCount(0, { timeout: 15000 });
  await expect(page.locator(".feed-log")).toContainText("Incoming Transmission");

  await page.locator(".action-card").filter({ hasText: "Fact-check the Trend" }).getByRole("button", { name: "Commit Action" }).click();
  await expect(page.locator(".command-overlay.active")).toBeVisible();
  await page.getByRole("button", { name: "Commit Simulation" }).click();
  await expect(page.locator(".dialogue-panel")).toHaveCount(0, { timeout: 5000 });
});

test("dialogue silence timeout locks replies and resolves cleanly", async ({ page }) => {
  await page.addInitScript(() => {
    (window as Window & { __PNE_DIALOGUE_TIMEOUT_MS?: number }).__PNE_DIALOGUE_TIMEOUT_MS = 700;
  });
  await page.goto("/dashboard");
  await expect(page.getByRole("dialog", { name: "Shift Briefing" })).toBeVisible();
  await beginOperationsAndSkipTutorial(page);

  await page.locator(".action-card").filter({ hasText: "Publish the Tailors' Claim" }).getByRole("button", { name: "Commit Action" }).click();
  await page.getByRole("button", { name: "Commit Simulation" }).click();
  await page.locator(".action-card").filter({ hasText: "Inspect the Looms" }).getByRole("button", { name: "Commit Action" }).click();
  await page.getByRole("button", { name: "Commit Simulation" }).click();

  const panel = page.locator(".dialogue-panel");
  await expect(panel).toBeVisible();
  await expect(panel.locator(".dialogue-timeout-bar")).toBeVisible();
  await expect(panel).toContainText("Your silence reads as uncertainty.");
  await expect(panel.getByRole("button", { name: "The public should know." })).toBeDisabled();
  await expect(panel.getByPlaceholder("Type a response, 280 characters max")).toBeDisabled();
  await panel.getByRole("button", { name: /Close Exchange|Resolve Exchange/ }).click({ force: true });
  await expect(panel).toHaveCount(0);
});

test("start page exposes the operating shift", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".topbar")).toHaveCount(0);
  await expect(page.locator(".hero")).toBeVisible();
  await expect(page.locator(".title-screen")).toHaveAttribute("data-starting", "false");
  await expect(page.locator(".title-hero")).toHaveCSS("background-image", /background-king\.png/);
  await expect(page.locator(".title-visual-plane")).toHaveCount(0);
  await expect(page.locator(".hero-system")).toBeVisible();
  await expect(page.locator(".control-composition")).toBeVisible();
  await expect(page.locator(".system-card.prime")).toBeVisible();
  await expect(page.locator(".system-card.alert")).toBeVisible();
  await expect(page.locator(".briefing-grid")).toBeVisible();
  await expect(page.getByRole("heading", { name: /The Emperor's Feed/i })).toBeVisible();
  await page.getByRole("button", { name: "Start Shift" }).click();
  await expect(page.locator(".title-screen")).toHaveAttribute("data-starting", "true");
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.locator(".topbar")).toBeVisible();
  await expect(page.locator(".section-header .eyebrow", { hasText: "Narrative Operations Theatre" })).toBeVisible();
});

test("each new shift briefing continues into the guided operator tutorial", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page.getByRole("dialog", { name: "Shift Briefing" })).toBeVisible();
  await page.getByRole("button", { name: "Begin Operations" }).click();

  const tutorialPanel = page.locator(".tutorial-panel");
  const tutorial = page.getByRole("dialog", { name: "Choose the signal source" });
  await expect(tutorial).toBeVisible();
  await expect(page.locator(".guidance-card")).toHaveCount(0);
  await expect(page.locator('[data-tour-id="sources"][data-tour-active="true"]')).toBeVisible();
  await expect(page.locator(".tutorial-progress span.active")).toHaveCount(1);

  await tutorialPanel.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Inspect and commit actions" })).toBeVisible();
  await expect(page.locator('[data-tour-id="actions"][data-tour-active="true"]')).toBeVisible();

  await tutorialPanel.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Watch the Palace Narrative Engine" })).toBeVisible();
  await expect(page.locator('[data-tour-id="engine"][data-tour-active="true"]')).toBeVisible();

  await tutorialPanel.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Read the comment stream" })).toBeVisible();
  await expect(page.locator('[data-tour-id="comments"][data-tour-active="true"]')).toBeVisible();

  await tutorialPanel.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Use metrics to read the run" })).toBeVisible();
  await expect(page.locator('[data-tour-id="metrics"][data-tour-active="true"]')).toBeVisible();
  await tutorialPanel.getByRole("button", { name: "Finish Tutorial" }).click();
  await expect(page.locator(".tutorial-panel")).toHaveCount(0);
  await expect(page.locator(".engine-intro-panel")).toBeVisible();
  await expect(page.locator(".guidance-card")).toHaveCount(0);
  await page.locator(".engine-intro-panel").getByRole("button", { name: "Connect Engine" }).click();
  await expect(page.locator(".engine-intro-panel")).toHaveCount(0);
  await expect(page.locator(".guidance-card")).toBeVisible();
  await expect(page.locator(".guidance-card")).toContainText("System Guide");

  await page.reload();
  await expect(page.locator(".tutorial-panel")).toHaveCount(0);
  await expect(page.locator(".guidance-card")).toBeVisible();

  await page.goto("/");
  await page.getByRole("button", { name: "Start Shift" }).click();
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByRole("dialog", { name: "Shift Briefing" })).toBeVisible();
  await page.getByRole("button", { name: "Begin Operations" }).click();
  await expect(page.getByRole("dialog", { name: "Choose the signal source" })).toBeVisible();
});

test("fresh first run shows sealed systems and unlocks them through guided play", async ({ page }) => {
  await page.goto("/dashboard");
  await beginOperationsAndSkipTutorial(page);

  await expect(page.locator(".dashboard-page")).toHaveAttribute("data-guided-step", "firstTurn");
  await expect(page.locator(".guided-card")).toContainText("First Run / Task 01");
  await expect(page.locator(".stage-button.guided-sealed")).toHaveCount(3);
  await expect(page.locator(".metric.guided-sealed")).toHaveCount(3);
  await expect(page.getByRole("button", { name: "The Public Comments" })).toContainText("Unlocks after the first record");
  await expect(page.locator(".action-card").filter({ hasText: "Inspect the Looms" }).first()).toContainText("Complete the first guided record first.");

  await page.locator(".action-card").filter({ hasText: "Publish the Tailors' Claim" }).getByRole("button", { name: "Inspect Trace" }).click();
  await expect(page.getByRole("dialog", { name: "Action Trace" })).toContainText("Publish the Tailors' Claim");
  await page.getByRole("button", { name: "Close Trace" }).click();
  await expect(page.locator(".guided-card")).toContainText("Commit the first record");

  await page.locator(".action-card").filter({ hasText: "Publish the Tailors' Claim" }).getByRole("button", { name: "Commit Action" }).click();
  await page.getByRole("button", { name: "Commit Simulation" }).click();
  await expect(page.locator(".unlock-panel")).toContainText("Public Comments");
  await expect(page.locator(".dashboard-page")).toHaveAttribute("data-guided-step", "publicSignals");
  await expect(page.locator(".stage-button.guided-sealed")).toHaveCount(1);
  await expect(page.locator(".metric.guided-sealed")).toHaveCount(1);
  await page.getByRole("button", { name: "The Public Comments" }).click();
  await expect(page.locator(".guided-card")).toContainText("Read the public signal");
});

test("fresh first run hides route spoilers and shows unclipped help tooltips", async ({ page }) => {
  await page.goto("/dashboard");
  await beginOperationsAndSkipTutorial(page);

  const body = page.locator("body");
  await expect(page.locator(".guided-coach-panel")).toBeVisible();
  await expect(body).not.toContainText(/Full dashboard unlocked|Choose your route|testing its bias|secret ending|Engine Decode/i);
  await expect(body).not.toContainText(/完整控制台已解锁|决定你的路线|测试它的偏向|秘密结局|引擎解码/);

  const truthTerm = page.locator(".metric .term-help").filter({ hasText: "Truth" }).first();
  await truthTerm.hover();
  const tooltip = page.locator(".term-tooltip-layer");
  await expect(tooltip).toBeVisible();
  await expect(tooltip).toContainText("direct evidence");

  const viewport = page.viewportSize();
  const box = await tooltip.boundingBox();
  expect(viewport).not.toBeNull();
  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.y).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(viewport!.width);
  expect(box!.y + box!.height).toBeLessThanOrEqual(viewport!.height);

  await page.goto("/archive");
  await expect(page.locator("body")).not.toContainText(/Engine Decoded|Narrative Liberation|secret ending|engine-bias fragments/i);
  await expect(page.locator(".achievement-archive-grid")).toContainText("Sealed Archive Signal");
});

test("language toggle switches UI and AI fallback output to Chinese", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Switch language" }).click();
  await expect(page.getByRole("button", { name: "开始值班" })).toBeVisible();
  await expect(page.getByText("游行前六次行动")).toBeVisible();

  await page.getByRole("button", { name: "开始值班" }).click();
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByRole("dialog", { name: "值班简报" })).toBeVisible();
  await beginOperationsAndSkipTutorial(page, "开始行动", "跳过");
  await expect(page.getByRole("heading", { name: "宫廷信息流控制台" })).toBeVisible();
  await expect(page.locator(".phase-step.active")).toContainText("来源选择");

  await page.locator(".action-card").filter({ hasText: "发布裁缝声明" }).getByRole("button", { name: "提交行动" }).click();
  await page.getByRole("button", { name: "提交模拟" }).click();
  await page.locator(".action-card").filter({ hasText: "检查织布机" }).getByRole("button", { name: "提交行动" }).click();
  await expect(page.locator(".command-overlay.active")).toContainText("检查织布机");
  await expect(page.locator(".command-overlay.active")).toContainText("真相 +2");
  await page.getByRole("button", { name: "提交模拟" }).click();
  await expect(page.locator(".feed-log")).toContainText("检查织布机");
  await resolveDialogueIfOpen(page);

  await page.locator(".action-card").filter({ hasText: "泄露织布机照片" }).getByRole("button", { name: "请求引擎审查" }).click();
  await expect(page.getByRole("dialog", { name: "AI 介入" })).toBeVisible();
  await expect(page.getByRole("dialog", { name: "AI 介入" })).toContainText("直接证据");
  await expect(page.getByRole("button", { name: "发布原始证据" })).toBeVisible();
});
