import { expect, test, type Locator, type Page } from "@playwright/test";
import { initialState } from "../src/lib/game-data";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
});

async function beginOperationsAndSkipTutorial(page: Page, buttonName = "Begin Operations", skipName = "Skip") {
  await page.getByRole("button", { name: buttonName }).click();
  const tutorialPanel = page.locator(".onboarding-panel");
  await expect(tutorialPanel).toBeVisible();
  await tutorialPanel.getByRole("button", { name: new RegExp(skipName === "跳过" ? "跳过|跳过教程" : "Skip|Skip Tutorial") }).click();
  await expect(tutorialPanel).toHaveCount(0);
  await expect(page.locator(".engine-intro-panel")).toHaveCount(0);
  await expect(page.locator(".guidance-card")).toBeVisible();
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

async function clickTutorialNext(page: Page) {
  await page.locator(".onboarding-panel").getByRole("button", { name: "Next", exact: true }).click();
}

async function expectActiveTourTarget(page: Page, targetId: string) {
  await expect(page.locator(`[data-tour-target="${targetId}"][data-tour-active="true"]`)).toBeVisible();
}

async function expectActiveActionTarget(page: Page, targetId: string) {
  await expect(page.locator(`[data-tour-target="${targetId}"][data-tour-action-active="true"]`)).toBeVisible();
  await expect(page.locator(".tutorial-action-hint")).toBeVisible();
}

test("completes a six-action editorial shift and reaches the archive", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page.getByRole("dialog", { name: "Game Briefing" })).toBeVisible();
  await beginOperationsAndSkipTutorial(page);
  await expect(page.locator(".topbar")).toBeVisible();
  await expect(page.locator(".scroll-progress")).toBeAttached();
  await expect(page.locator(".cursor-light")).toBeAttached();
  await expect(page.locator(".panel-shell.lab-shell")).toBeVisible();
  await expect(page.locator(".phase-strip")).toBeVisible();
  await expect(page.locator(".phase-step.active")).toContainText("Source Focus");
  await expect(page.locator(".narrative-arc")).toContainText("Current Phase");
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

  await page.locator(".action-card").filter({ hasText: "Leak a Loom Photo" }).getByRole("button", { name: "Preview Result" }).click();
  await expect(page.getByRole("dialog", { name: "Result Preview", exact: true })).toBeVisible();
  await expect(page.getByRole("dialog", { name: "Result Preview" })).toContainText("Requires: Inspect the Looms.");
  await page.getByRole("button", { name: "Close Preview" }).click();

  await page.locator(".action-card").filter({ hasText: "Publish the Tailors' Claim" }).getByRole("button", { name: "Publish" }).click();
  await expect(page.locator(".dashboard-page")).toHaveAttribute("data-phase", "previewing");
  await expect(page.locator(".phase-step.active")).toContainText("Before Publishing");
  await expect(page.locator(".command-overlay.active")).toBeVisible();
  await expect(page.locator(".command-overlay.active")).toContainText("Publish the Tailors' Claim");
  await expect(page.locator(".command-overlay.active")).toContainText("Spread +2");
  await page.locator("[data-tour-target=\"command-commit\"]").click();
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
  await page.locator(".action-card").filter({ hasText: "Inspect the Looms" }).getByRole("button", { name: "Publish" }).click();
  await expect(page.locator(".command-overlay.active")).toBeVisible();
  await page.locator("[data-tour-target=\"command-commit\"]").click();
  await resolveDialogueIfOpen(page);
  await page.locator(".action-card").filter({ hasText: "Leak a Loom Photo" }).getByRole("button", { name: "Preview Result" }).click();
  await expect(page.getByRole("dialog", { name: "Result Preview" })).toContainText("Available");
  await expect(page.getByRole("dialog", { name: "Result Preview" })).toContainText("Original");
  await page.getByRole("button", { name: "Close Preview" }).click();
  await expect(page.locator(".action-card").filter({ hasText: "Leak a Loom Photo" }).getByRole("button", { name: "Ask AI to Rewrite" })).toHaveText("Ask AI to Rewrite");
  await page.locator(".action-card").filter({ hasText: "Leak a Loom Photo" }).getByRole("button", { name: "Ask AI to Rewrite" }).click();
  await expect(page.locator(".dashboard-page")).toHaveAttribute("data-phase", "previewing");
  await expect(page.locator(".modal-overlay.active")).toBeVisible();
  await expect(page.getByRole("dialog", { name: "AI Intervention" })).toBeVisible();
  await expect(page.locator(".readout")).toHaveCount(4);
  await expect(page.locator(".modal-badge")).toBeVisible();
  await expect(page.locator(".risk-meter")).toBeVisible();
  await page.getByRole("button", { name: "Keep Original" }).click();
  await expect(page.locator(".dashboard-page")).toHaveAttribute("data-last-risk", "risk");
  await expect(page.locator(".live-status")).toContainText("3 actions left");
  await resolveDialogueIfOpen(page);

  await page.getByRole("button", { name: "Public Comments" }).click();
  await page.locator(".action-card").filter({ hasText: "Show Unfiltered Comments" }).getByRole("button", { name: "Publish" }).click();
  await expect(page.locator(".command-overlay.active")).toBeVisible();
  await page.locator("[data-tour-target=\"command-commit\"]").click();
  await expect(page.locator(".live-status")).toContainText("2 actions left");
  await resolveDialogueIfOpen(page);
  await page.locator(".action-card").filter({ hasText: "Fact-check the Trend" }).getByRole("button", { name: "Publish" }).click();
  await expect(page.locator(".command-overlay.active")).toBeVisible();
  await page.locator("[data-tour-target=\"command-commit\"]").click();
  await expect(page.locator(".live-status")).toContainText("1 actions left");

  await page.getByRole("button", { name: "Child's Voice" }).click();
  await page.locator(".action-card").filter({ hasText: "Livestream the Crowd Reaction" }).getByRole("button", { name: "Publish" }).click();
  await expect(page.locator(".command-overlay.active")).toBeVisible();
  await page.locator("[data-tour-target=\"command-commit\"]").click();

  await expect(page).toHaveURL(/\/ending/);
  await expect(page.getByText("Post-Parade Archive")).toBeVisible();
  await expect(page.getByText("Final Feed State")).toBeVisible();
  await expect(page.locator(".ending-layout")).toBeVisible();
  await expect(page.locator(".archive-card")).toBeVisible();
  await expect(page.locator(".outcome-stack")).toBeVisible();
  await expect(page.locator(".history-list").first()).toBeVisible();
  await expect(page.getByText("Why This Ending Triggered")).toBeVisible();
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
  await page.getByRole("button", { name: "Public Comments" }).click();
  await page.locator(".action-card").filter({ hasText: "Run a Poll" }).getByRole("button", { name: "Publish" }).click();
  await expect(page.locator(".command-overlay.active")).toBeVisible();
  await page.locator("[data-tour-target=\"command-commit\"]").click();

  await expect(page.locator(".feed-log")).toContainText("39% Yes");
  await expect(page.locator(".metric").filter({ hasText: "Evidence" })).toContainText("1");
});

test("dialogue interruptions allow quick replies and resolve into the feed", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page.getByRole("dialog", { name: "Game Briefing" })).toBeVisible();
  await beginOperationsAndSkipTutorial(page);

  await page.locator(".action-card").filter({ hasText: "Publish the Tailors' Claim" }).getByRole("button", { name: "Publish" }).click();
  await page.locator("[data-tour-target=\"command-commit\"]").click();
  await page.getByRole("button", { name: "Public Comments" }).click();
  await page.locator(".action-card").filter({ hasText: "Show Unfiltered Comments" }).getByRole("button", { name: "Publish" }).click();
  await page.locator("[data-tour-target=\"command-commit\"]").click();

  const panel = page.locator(".dialogue-panel");
  await expect(panel).toBeVisible();
  await expect(panel).toContainText("Incoming Transmission");
  await expect(panel.locator(".dialogue-guide")).toBeVisible();
  await expect(panel.locator(".dialogue-guide")).toContainText("New Player Guide");
  await expect(panel.locator(".dialogue-guide")).toContainText("Choose one quick reply");
  await expect(panel.locator(".dialogue-timeout.paused")).toContainText("Guide Pause");
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

  await page.locator(".action-card").filter({ hasText: "Fact-check the Trend" }).getByRole("button", { name: "Publish" }).click();
  await expect(page.locator(".command-overlay.active")).toBeVisible();
  await page.locator("[data-tour-target=\"command-commit\"]").click();
  await expect(page.locator(".dialogue-panel")).toHaveCount(0, { timeout: 5000 });
});

test("guided dialogue pauses timeout and resolves cleanly", async ({ page }) => {
  await page.addInitScript(() => {
    (window as Window & { __PNE_DIALOGUE_TIMEOUT_MS?: number }).__PNE_DIALOGUE_TIMEOUT_MS = 700;
  });
  await page.goto("/dashboard");
  await expect(page.getByRole("dialog", { name: "Game Briefing" })).toBeVisible();
  await beginOperationsAndSkipTutorial(page);

  await page.locator(".action-card").filter({ hasText: "Publish the Tailors' Claim" }).getByRole("button", { name: "Publish" }).click();
  await page.locator("[data-tour-target=\"command-commit\"]").click();
  await page.locator(".action-card").filter({ hasText: "Inspect the Looms" }).getByRole("button", { name: "Publish" }).click();
  await page.locator("[data-tour-target=\"command-commit\"]").click();

  const panel = page.locator(".dialogue-panel");
  await expect(panel).toBeVisible();
  await expect(panel.locator(".dialogue-timeout-bar")).toBeVisible();
  await expect(panel.locator(".dialogue-timeout.paused")).toContainText("Guide Pause");
  await expect(panel).not.toContainText("Your silence reads as uncertainty.");
  await expect(panel.getByRole("button", { name: "The public should know." })).toBeEnabled();
  await expect(panel.getByPlaceholder("Type a response, 280 characters max")).toBeEnabled();
  await panel.getByRole("button", { name: /End Exchange|Close Exchange|Resolve Exchange/ }).click({ force: true });
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
  await page.getByRole("button", { name: "Start Game" }).click();
  await expect(page.locator(".title-screen")).toHaveAttribute("data-starting", "true");
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.locator(".topbar")).toBeVisible();
  await expect(page.locator(".section-header .eyebrow", { hasText: "Palace Feed Desk" })).toBeVisible();
});

test("each new shift briefing continues into the spotlight tutorial with real controls", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page.getByRole("dialog", { name: "Game Briefing" })).toBeVisible();
  await page.getByRole("button", { name: "Begin Operations" }).click();

  const tutorialPanel = page.locator(".onboarding-panel");
  const tutorial = page.getByRole("dialog", { name: "Six actions before the parade" });
  await expect(tutorial).toBeVisible();
  await expect(page.locator(".tutorial-spotlight-frame")).toBeVisible();
  await expect(page.getByRole("button", { name: /Highlight target area|Continue the shift/ })).toHaveCount(0);
  await expect(page.locator(".guided-coach-panel")).toHaveCount(0);
  await expect(page.locator(".guidance-card")).toHaveCount(0);
  await expect(page.locator(".tutorial-progress")).toHaveCount(0);
  await expectActiveTourTarget(page, "role-card");

  await clickTutorialNext(page);
  await expect(page.getByRole("dialog", { name: "Sources choose the queue" })).toBeVisible();
  await expectActiveTourTarget(page, "source-tailors");

  await clickTutorialNext(page);
  await expect(page.getByRole("dialog", { name: "Read the full action card" })).toBeVisible();
  await expectActiveTourTarget(page, "card-publishTailorsClaim");

  await clickTutorialNext(page);
  await expect(page.getByRole("dialog", { name: "Preview before publishing" })).toBeVisible();
  await expectActiveTourTarget(page, "card-publishTailorsClaim");
  await expectActiveActionTarget(page, "action-publishTailorsClaim-inspect");
  await activateButton(page.locator('[data-tour-target="action-publishTailorsClaim-inspect"]'));
  await expect(page.getByRole("dialog", { name: "Result Preview", exact: true })).toBeVisible();
  await expect(page.getByRole("dialog", { name: "This is the pre-publish check" })).toBeVisible();
  await expectActiveTourTarget(page, "trace-panel");

  await clickTutorialNext(page);
  await expect(page.getByRole("dialog", { name: "Requirements explain locks" })).toBeVisible();
  await expectActiveTourTarget(page, "trace-requirement");

  await clickTutorialNext(page);
  await expect(page.getByRole("dialog", { name: "Risk shows danger" })).toBeVisible();
  await expectActiveTourTarget(page, "trace-risk");

  await clickTutorialNext(page);
  await expect(page.getByRole("dialog", { name: "Projected output shows the record" })).toBeVisible();
  await expectActiveTourTarget(page, "trace-output");
  await expectActiveActionTarget(page, "trace-close");
  await activateButton(page.locator('[data-tour-target="trace-close"]'));

  await expect(page.getByRole("dialog", { name: "Publish the first record" })).toBeVisible();
  await expectActiveTourTarget(page, "card-publishTailorsClaim");
  await expectActiveActionTarget(page, "action-publishTailorsClaim-commit");
  await activateButton(page.locator('[data-tour-target="action-publishTailorsClaim-commit"]'));
  await expect(page.locator(".command-panel")).toBeVisible();
  await expect(page.getByRole("dialog", { name: "Before Publishing is the final check" })).toBeVisible();
  await expectActiveTourTarget(page, "command-panel");

  await clickTutorialNext(page);
  await expect(page.getByRole("dialog", { name: "Confirm the selected action" })).toBeVisible();
  await expectActiveTourTarget(page, "command-selected");

  await clickTutorialNext(page);
  await expect(page.getByRole("dialog", { name: "Read the predicted effect" })).toBeVisible();
  await expectActiveTourTarget(page, "command-effects");

  await clickTutorialNext(page);
  await expect(page.getByRole("dialog", { name: "The AI advice is not the rule" })).toBeVisible();
  await expectActiveTourTarget(page, "command-response");

  await clickTutorialNext(page);
  await expect(page.getByRole("dialog", { name: "Confirm Publish" })).toBeVisible();
  await expectActiveTourTarget(page, "command-panel");
  await expectActiveActionTarget(page, "command-commit");
  await activateButton(page.locator('[data-tour-target="command-commit"]'));

  await expect(page.getByRole("dialog", { name: "Spread is repetition speed" })).toBeVisible();
  await expectActiveTourTarget(page, "metric-virality");
  await clickTutorialNext(page);
  await expect(page.getByRole("dialog", { name: "Palace Pressure is palace force" })).toBeVisible();
  await expectActiveTourTarget(page, "metric-pressure");
  await clickTutorialNext(page);
  await expect(page.getByRole("dialog", { name: "Safety is editor protection" })).toBeVisible();
  await expectActiveTourTarget(page, "metric-reputation");
  await clickTutorialNext(page);
  await expect(page.getByRole("dialog", { name: "Public Doubt is shared uncertainty" })).toBeVisible();
  await expectActiveTourTarget(page, "metric-publicDoubt");
  await clickTutorialNext(page);
  await expect(page.getByRole("dialog", { name: "Evidence is visible proof" })).toBeVisible();
  await expectActiveTourTarget(page, "metric-truth");
  await clickTutorialNext(page);
  await expect(page.getByRole("dialog", { name: "Switch to Public Comments" })).toBeVisible();
  await expectActiveTourTarget(page, "source-public");
  await expectActiveActionTarget(page, "source-public");
  await activateButton(page.locator('[data-tour-target="source-public"]'));

  await expect(page.getByRole("dialog", { name: "Read Show Unfiltered Comments" })).toBeVisible();
  await expectActiveTourTarget(page, "card-showUnfilteredComments");
  await clickTutorialNext(page);
  await expect(page.getByRole("dialog", { name: "Comments show crowd state" })).toBeVisible();
  await expectActiveTourTarget(page, "comments-panel");
  await clickTutorialNext(page);
  await expect(page.getByRole("dialog", { name: "Publish the public signal" })).toBeVisible();
  await expectActiveTourTarget(page, "card-showUnfilteredComments");
  await expectActiveActionTarget(page, "action-showUnfilteredComments-commit");
  await activateButton(page.locator('[data-tour-target="action-showUnfilteredComments-commit"]'));
  await expect(page.locator(".command-panel")).toBeVisible();
  await expect(page.getByRole("dialog", { name: "This effect is riskier" })).toBeVisible();
  await expectActiveTourTarget(page, "command-effects");
  await clickTutorialNext(page);
  await expect(page.getByRole("dialog", { name: "Write the public record" })).toBeVisible();
  await expectActiveTourTarget(page, "command-panel");
  await expectActiveActionTarget(page, "command-commit");
  await activateButton(page.locator('[data-tour-target="command-commit"]'));

  await expect(page.locator(".dialogue-panel")).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole("dialog", { name: "Dialogue is an immediate reaction" })).toBeVisible();
  await expectActiveTourTarget(page, "dialogue-panel");
  await clickTutorialNext(page);
  await expect(page.getByRole("dialog", { name: "Stakes explain why this matters" })).toBeVisible();
  await expectActiveTourTarget(page, "dialogue-stakes");
  await clickTutorialNext(page);
  await expect(page.getByRole("dialog", { name: "These are dialogue meters" })).toBeVisible();
  await expectActiveTourTarget(page, "dialogue-mood");
  await clickTutorialNext(page);
  await expect(page.getByRole("dialog", { name: "Choose a quick reply" })).toBeVisible();
  await expectActiveTourTarget(page, "dialogue-panel");
  await expectActiveActionTarget(page, "dialogue-reply");
  await expect(page.locator(".dialogue-panel .dialogue-timeout.paused")).toContainText("Guide Pause");
  await activateButton(page.locator('[data-tour-target="dialogue-reply"]'));

  await expect(page.getByRole("dialog", { name: "Write the exchange result" })).toBeVisible();
  await expectActiveTourTarget(page, "dialogue-panel");
  await expectActiveActionTarget(page, "dialogue-resolve");
  const resolveButton = page.locator('[data-tour-target="dialogue-resolve"]');
  await expect(resolveButton).toBeEnabled({ timeout: 15000 });
  await activateButton(resolveButton);
  await expect(page.locator(".dialogue-panel")).toHaveCount(0, { timeout: 15000 });

  await expect(page.getByRole("dialog", { name: "Palace Alert is access risk" })).toBeVisible();
  await expectActiveTourTarget(page, "metric-systemSuspicion");
  await clickTutorialNext(page);
  await expect(page.getByRole("dialog", { name: "The right side is a readout" })).toBeVisible();
  await expectActiveTourTarget(page, "engine-panel");
  await clickTutorialNext(page);
  await expect(page.getByRole("dialog", { name: "Finish the remaining actions" })).toBeVisible();
  await expectActiveTourTarget(page, "role-card");
  await tutorialPanel.getByRole("button", { name: "Finish Tutorial" }).click();
  await expect(page.locator(".onboarding-panel")).toHaveCount(0);
  await expect(page.locator(".engine-intro-panel")).toHaveCount(0);
  await expect(page.locator(".guidance-card")).toBeVisible();
  await expect(page.locator(".guidance-card")).toContainText("System Guide");

  await page.reload();
  await expect(page.locator(".onboarding-panel")).toHaveCount(0);
  await expect(page.locator(".guidance-card")).toBeVisible();

  await page.goto("/");
  await page.getByRole("button", { name: "Start Game" }).click();
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByRole("dialog", { name: "Game Briefing" })).toBeVisible();
  await page.getByRole("button", { name: "Begin Operations" }).click();
  await expect(page.getByRole("dialog", { name: "Six actions before the parade" })).toBeVisible();
});

test("fresh first run shows sealed systems and unlocks them through guided play", async ({ page }) => {
  await page.goto("/dashboard");
  await beginOperationsAndSkipTutorial(page);

  await expect(page.locator(".dashboard-page")).toHaveAttribute("data-guided-step", "firstTurn");
  await expect(page.locator(".guided-card")).toHaveCount(0);
  await expect(page.locator(".guided-coach-panel")).toHaveCount(0);
  await expect(page.locator(".stage-button.guided-sealed")).toHaveCount(3);
  await expect(page.locator(".metric.guided-sealed")).toHaveCount(3);
  await expect(page.getByRole("button", { name: "Public Comments" })).toContainText("Unlocks after the first record");
  await expect(page.locator(".action-card").filter({ hasText: "Inspect the Looms" }).first()).toContainText("Complete the first guided record first.");

  await page.locator(".action-card").filter({ hasText: "Publish the Tailors' Claim" }).getByRole("button", { name: "Preview Result" }).click();
  await expect(page.getByRole("dialog", { name: "Result Preview" })).toContainText("Publish the Tailors' Claim");
  await page.getByRole("button", { name: "Close Preview" }).click();

  await page.locator(".action-card").filter({ hasText: "Publish the Tailors' Claim" }).getByRole("button", { name: "Publish" }).click();
  await page.locator("[data-tour-target=\"command-commit\"]").click();
  await expect(page.locator(".unlock-panel")).toContainText("Public Comments");
  await expect(page.locator(".dashboard-page")).toHaveAttribute("data-guided-step", "publicSignals");
  await expect(page.locator(".stage-button.guided-sealed")).toHaveCount(1);
  await expect(page.locator(".metric.guided-sealed")).toHaveCount(1);
  await page.getByRole("button", { name: "Public Comments" }).click();
  await expect(page.locator(".action-card").filter({ hasText: "Show Unfiltered Comments" })).toBeVisible();
});

test("fresh first run hides route spoilers and shows unclipped help tooltips", async ({ page }) => {
  await page.goto("/dashboard");
  await beginOperationsAndSkipTutorial(page);

  const body = page.locator("body");
  await expect(page.locator(".guided-coach-panel")).toHaveCount(0);
  await expect(page.locator(".onboarding-panel")).toHaveCount(0);
  await expect(body).not.toContainText(/Full dashboard unlocked|Choose your route|testing its bias|secret ending|Engine Decode/i);
  await expect(body).not.toContainText(/完整控制台已解锁|决定你的路线|测试它的偏向|秘密结局|引擎解码/);

  const truthTerm = page.locator(".metric .term-help").filter({ hasText: "Evidence" }).first();
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
  await expect(page.locator("body")).not.toContainText(/AI Bias Found|The Crowd Speaks|secret ending|engine-bias fragments/i);
  await expect(page.locator(".achievement-archive-grid")).toContainText("Sealed Archive Signal");
});

test("language toggle switches UI and AI fallback output to Chinese", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Switch language" }).click();
  await expect(page.getByRole("button", { name: "开始游戏" })).toBeVisible();
  await expect(page.getByText("游行前六次行动")).toBeVisible();

  await page.getByRole("button", { name: "开始游戏" }).click();
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByRole("dialog", { name: "游戏简报" })).toBeVisible();
  await beginOperationsAndSkipTutorial(page, "开始行动", "跳过");
  await expect(page.getByRole("heading", { name: "宫廷发布台" })).toBeVisible();
  await expect(page.locator(".phase-step.active")).toContainText("来源选择");

  await page.locator(".action-card").filter({ hasText: "发布裁缝声明" }).getByRole("button", { name: "发布" }).click();
  await page.getByRole("button", { name: "确认发布" }).click();
  await page.locator(".action-card").filter({ hasText: "检查织布机" }).getByRole("button", { name: "发布" }).click();
  await expect(page.locator(".command-overlay.active")).toContainText("检查织布机");
  await expect(page.locator(".command-overlay.active")).toContainText("证据 +2");
  await page.getByRole("button", { name: "确认发布" }).click();
  await expect(page.locator(".feed-log")).toContainText("检查织布机");
  await resolveDialogueIfOpen(page);

  await page.locator(".action-card").filter({ hasText: "泄露织布机照片" }).getByRole("button", { name: "让 AI 改写" }).click();
  await expect(page.getByRole("dialog", { name: "AI 介入" })).toBeVisible();
  await expect(page.getByRole("dialog", { name: "AI 介入" })).toContainText("直接证据");
  await expect(page.getByRole("button", { name: "坚持原文" })).toBeVisible();
});

test("registers an account and exposes cloud save status", async ({ page }) => {
  const email = `player-${Date.now()}@example.com`;
  await page.goto("/login");
  await page.getByRole("button", { name: "Register" }).click();
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("correct-password");
  await page.getByRole("button", { name: "Register and login" }).click();

  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.locator(".auth-chip")).toContainText(email);
  await expect(page.locator(".auth-chip")).toContainText(/Cloud saved|Saving/);

  await page.request.post("/api/auth/logout");
  await page.reload();
  await expect(page.locator(".auth-link")).toContainText("Login / Register");
});
