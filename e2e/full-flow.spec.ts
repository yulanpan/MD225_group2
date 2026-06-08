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
  await expectTutorialPanelClearOfTarget(page, targetId);
}

async function expectActiveActionTarget(page: Page, targetId: string) {
  await expect(page.locator(`[data-tour-target="${targetId}"][data-tour-action-active="true"]`)).toBeVisible();
  await expect(page.locator(".tutorial-action-hint")).toBeVisible();
}

async function expectActionHintBelowTarget(page: Page, targetId: string) {
  const target = page.locator(`[data-tour-target="${targetId}"]`);
  const hint = page.locator(".tutorial-action-hint");
  await expect(hint).toHaveAttribute("data-placement", "bottom");
  const targetBox = await target.boundingBox();
  const hintBox = await hint.boundingBox();
  if (!targetBox || !hintBox) throw new Error(`Missing tutorial geometry for ${targetId}`);
  const targetCenterX = targetBox.x + targetBox.width / 2;
  expect(hintBox.y).toBeGreaterThanOrEqual(targetBox.y + targetBox.height + 4);
  expect(targetCenterX).toBeGreaterThanOrEqual(hintBox.x + 12);
  expect(targetCenterX).toBeLessThanOrEqual(hintBox.x + hintBox.width - 12);
}

function boxOverlapArea(
  first: NonNullable<Awaited<ReturnType<Locator["boundingBox"]>>>,
  second: NonNullable<Awaited<ReturnType<Locator["boundingBox"]>>>
) {
  const overlapX = Math.max(0, Math.min(first.x + first.width, second.x + second.width) - Math.max(first.x, second.x));
  const overlapY = Math.max(0, Math.min(first.y + first.height, second.y + second.height) - Math.max(first.y, second.y));
  expect(overlapX * overlapY).toBe(0);
}

async function expectTutorialPanelClearOfTarget(page: Page, targetId: string) {
  const panel = page.locator(".onboarding-panel");
  const target = page.locator(`[data-tour-target="${targetId}"][data-tour-active="true"]`);
  await expect(panel).toBeVisible();
  await expect(target).toBeVisible();
  await expect.poll(async () => {
    const tutorialBox = await panel.boundingBox();
    const targetBox = await target.boundingBox();
    if (!tutorialBox || !targetBox) return "missing";
    const overlapX = Math.max(0, Math.min(tutorialBox.x + tutorialBox.width, targetBox.x + targetBox.width) - Math.max(tutorialBox.x, targetBox.x));
    const overlapY = Math.max(0, Math.min(tutorialBox.y + tutorialBox.height, targetBox.y + targetBox.height) - Math.max(tutorialBox.y, targetBox.y));
    const overlapArea = overlapX * overlapY;
    const targetArea = targetBox.width * targetBox.height;
    const coverage = targetArea > 0 ? overlapArea / targetArea : 1;
    const targetCenterCovered =
      targetBox.x + targetBox.width / 2 >= tutorialBox.x &&
      targetBox.x + targetBox.width / 2 <= tutorialBox.x + tutorialBox.width &&
      targetBox.y + targetBox.height / 2 >= tutorialBox.y &&
      targetBox.y + targetBox.height / 2 <= tutorialBox.y + tutorialBox.height;
    return coverage <= 0.35 && !targetCenterCovered ? "ok" : `coverage ${coverage.toFixed(2)}, center ${targetCenterCovered}`;
  }, { timeout: 5000 }).toBe("ok");
}

async function expectTutorialPanelWithinViewport(page: Page) {
  const panel = page.locator(".onboarding-panel");
  await expect(panel).toBeVisible();
  await expect.poll(async () => {
    const viewport = page.viewportSize();
    const box = await panel.boundingBox();
    if (!viewport || !box) return "missing";
    const tolerance = 2;
    const left = box.x >= -tolerance;
    const top = box.y >= -tolerance;
    const right = box.x + box.width <= viewport.width + tolerance;
    const bottom = box.y + box.height <= viewport.height + tolerance;
    return left && top && right && bottom ? "ok" : `${Math.round(box.x)},${Math.round(box.y)},${Math.round(box.x + box.width)},${Math.round(box.y + box.height)} in ${viewport.width}x${viewport.height}`;
  }, { timeout: 5000 }).toBe("ok");
}

async function expectCommandTutorialLayout(page: Page) {
  await expect(page.locator(".command-panel")).toBeVisible();
  await expectTutorialPanelWithinViewport(page);
  const viewport = page.viewportSize();
  if (!viewport || viewport.width <= 1180) return;

  await expect.poll(async () => {
    const commandBox = await page.locator(".command-panel").boundingBox();
    const tutorialBox = await page.locator(".onboarding-panel").boundingBox();
    if (!commandBox || !tutorialBox) return "missing";
    const gap = tutorialBox.x - (commandBox.x + commandBox.width);
    const right = tutorialBox.x + tutorialBox.width;
    return gap >= 12 && right <= viewport.width - 2 ? "ok" : `gap ${Math.round(gap)}, right ${Math.round(right)} of ${viewport.width}`;
  }, { timeout: 5000 }).toBe("ok");
}

async function expectTutorialPanelClearOfDialogue(page: Page) {
  const tutorialBox = await page.locator(".onboarding-panel").boundingBox();
  const dialogueBox = await page.locator(".dialogue-panel").boundingBox();
  if (!tutorialBox || !dialogueBox) throw new Error("Missing tutorial or dialogue geometry");
  boxOverlapArea(tutorialBox, dialogueBox);
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
  await expect(page.locator(".ending-report-layout")).toBeVisible();
  await expect(page.locator(".ending-summary-card")).toBeVisible();
  await expect(page.locator(".ending-outcome-grid")).toBeVisible();
  await expect(page.locator(".history-list").first()).toBeVisible();
  await expect(page.getByText("Why This Ending Triggered")).toBeVisible();
  await expect(page.getByText("Run Analysis")).toBeVisible();
  await expect(page.getByText("Next Replay Objective")).toBeVisible();
  await expect(page.getByText("Action Path")).toBeVisible();
  await expect(page.getByText("Aftermath")).toBeVisible();
  await expect(page.locator(".action-path-rail")).toBeVisible();
  await page.getByRole("button", { name: /Try for/ }).first().click();
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.locator(".replay-target")).toBeVisible();
});

test("child source uses the same blue source accent as the other source buttons", async ({ page }) => {
  await page.goto("/dashboard");
  await beginOperationsAndSkipTutorial(page);
  await page.evaluate(() => {
    const state = JSON.parse(localStorage.getItem("emperor-feed-state") ?? "{}");
    localStorage.setItem("emperor-feed-profile", JSON.stringify({
      version: 2,
      achievements: [],
      runs: [{ id: "run-e2e", completedAt: "2026-05-20T00:00:00.000Z", endingId: "unstableFeed", language: "en", finalMetrics: {}, actionPath: [], dialogueCount: 0, achievementsUnlocked: [] }],
      engineFragments: [],
      biasAwareness: 0,
      decodedEngine: false,
      secretEndingUnlocked: false
    }));
    localStorage.setItem("emperor-feed-state", JSON.stringify({
      ...state,
      actionsLeft: 4,
      usedActionIds: ["publishTailorsClaim", "showUnfilteredComments"],
      history: [
        { id: "a", actionId: "publishTailorsClaim", actionTitle: "Publish the Tailors' Claim", zone: "tailors", choice: "direct", publishedText: "x", engineMessage: "x", stateBefore: state, stateAfter: state },
        { id: "b", actionId: "showUnfilteredComments", actionTitle: "Show Unfiltered Comments", zone: "public", choice: "direct", publishedText: "x", engineMessage: "x", stateBefore: state, stateAfter: state }
      ],
      truth: 3,
      publicDoubt: 3
    }));
  });
  await page.reload();
  const childButton = page.getByRole("button", { name: "Child's Voice" });
  await expect(childButton).toBeVisible();
  const childAccent = await childButton.evaluate((element) => getComputedStyle(element).getPropertyValue("--accent").trim());
  expect(childAccent.toLowerCase()).toBe("#00a6c8");
  expect(childAccent.toLowerCase()).not.toBe("#db2942");
  await childButton.click();
  const riskyPublish = page.locator(".action-card").filter({ hasText: "Livestream the Crowd Reaction" }).getByRole("button", { name: "Publish" });
  await expect(riskyPublish).toBeVisible();
  await expect(riskyPublish).not.toHaveClass(/risk/);
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

test("credits page lists complete bilingual source links", async ({ page }) => {
  await page.goto("/credits");
  await expect(page.locator(".source-card")).toHaveCount(4);
  await expect(page.locator('a[href="https://andersen.sdu.dk/vaerk/hersholt/TheEmperorsNewClothes_e.html?oph=1"]')).toBeVisible();
  await expect(page.locator('a[href="https://andersen.sdu.dk/vaerk/register/info_e.html?vid=17"]')).toBeVisible();
  await expect(page.locator('a[href="https://samlinger.museumodense.dk/HCA/XVIII-58-B"]')).toBeVisible();
  await expect(page.locator('a[href="https://www.gutenberg.org/ebooks/1597"]')).toBeVisible();
  await expect(page.locator('a[href="https://en.wikisource.org/wiki/The_Emperor%27s_New_Clothes"]')).toBeVisible();
  await expect(page.locator('a[href="https://commons.wikimedia.org/wiki/Category:The_Emperor%27s_New_Clothes"]')).toBeVisible();
  await expect(page.locator('a[href="https://commons.wikimedia.org/wiki/File:Edmund_Dulac_-_The_Emperors_New_Clothes_-_empty_loom.jpg"]')).toBeVisible();
  await expect(page.locator('a[href="https://platform.openai.com/docs/guides/structured-outputs?api-mode=chat"]')).toBeVisible();
  await expect(page.locator('a[href="https://platform.openai.com/docs/models"]')).toBeVisible();
  await expect(page.locator(".source-card").filter({ hasText: "Visual References" })).toContainText("local project/generated assets");
  await expect(page.locator(".source-card").filter({ hasText: "AI Disclosure" })).toContainText("Endings are still calculated by local game rules and player actions.");

  await page.evaluate(() => localStorage.setItem("emperor-feed-language", "zh"));
  await page.reload();
  await expect(page.locator(".source-card").filter({ hasText: "视觉参考" })).toContainText("项目本地制作或生成资产");
  await expect(page.locator(".source-card").filter({ hasText: "AI 披露" })).toContainText("结局仍由本地游戏规则和玩家行动决定");
  await expect(page.locator('a[href="https://andersen.sdu.dk/vaerk/hersholt/TheEmperorsNewClothes_e.html?oph=1"]')).toContainText("汉斯·克里斯蒂安·安徒生中心");
});

test("ending headline and trigger explanation are concrete in both languages", async ({ page }) => {
  const storedState = {
    ...initialState,
    actionsLeft: 0,
    truth: 0,
    pressure: 3,
    virality: 4,
    publicDoubt: 2,
    reputation: 6,
    systemSuspicion: 2
  };
  await page.goto("/");
  await page.evaluate((state) => {
    localStorage.setItem("emperor-feed-language", "zh");
    localStorage.setItem("emperor-feed-final-state", JSON.stringify(state));
    localStorage.setItem("emperor-feed-ending", "unstableFeed");
  }, storedState);

  await page.goto("/ending");
  await expect(page.getByRole("heading", { name: "游行开始，大家说法不一。" })).toBeVisible();
  await expect(page.locator("body")).not.toContainText("界面成为历史");
  await expect(page.locator(".outcome-card").filter({ hasText: "这局为什么会这样" })).toContainText("没有一种说法真正占上风");
  await expect(page.locator(".outcome-card").filter({ hasText: "这局为什么会这样" })).toContainText("公开记录仍然摇摆");

  await page.evaluate(() => localStorage.setItem("emperor-feed-language", "en"));
  await page.reload();
  await expect(page.getByRole("heading", { name: "The parade begins with no stable story." })).toBeVisible();
  await expect(page.locator("body")).not.toContainText("interface becomes history");
  await expect(page.locator(".outcome-card").filter({ hasText: "Why This Ending Triggered" })).toContainText("No single version won");
  await expect(page.locator(".outcome-card").filter({ hasText: "Why This Ending Triggered" })).toContainText("public record unsettled");
});

test("each new shift briefing continues into the spotlight tutorial with real controls", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page.getByRole("dialog", { name: "Game Briefing" })).toBeVisible();
  await page.getByRole("button", { name: "Begin Operations" }).click();

  const tutorialPanel = page.locator(".onboarding-panel");
  const tutorial = page.getByRole("dialog", { name: "Six posts decide the ending" });
  await expect(tutorial).toBeVisible();
  await expect(page.locator(".tutorial-spotlight-frame")).toBeVisible();
  await expect(page.getByRole("button", { name: /Highlight target area|Continue the shift/ })).toHaveCount(0);
  await expect(page.locator(".guided-coach-panel")).toHaveCount(0);
  await expect(page.locator(".guidance-card")).toHaveCount(0);
  await expect(page.locator(".tutorial-progress")).toHaveCount(0);
  await expectActiveTourTarget(page, "role-card");

  await clickTutorialNext(page);
  await expect(page.getByRole("dialog", { name: "Choose a source first" })).toBeVisible();
  await expectActiveTourTarget(page, "source-tailors");

  await clickTutorialNext(page);
  await expect(page.getByRole("dialog", { name: "Preview before publishing" })).toBeVisible();
  await expectActiveTourTarget(page, "card-publishTailorsClaim");
  await expectActiveActionTarget(page, "action-publishTailorsClaim-inspect");
  await activateButton(page.locator('[data-tour-target="action-publishTailorsClaim-inspect"]'));
  await expect(page.getByRole("dialog", { name: "Result Preview", exact: true })).toBeVisible();
  await expect(page.getByRole("dialog", { name: "Risk is a route signal" })).toBeVisible();
  await expectActiveTourTarget(page, "trace-panel");
  await expectActiveActionTarget(page, "trace-close");
  await expectActionHintBelowTarget(page, "trace-close");
  await activateButton(page.locator('[data-tour-target="trace-close"]'));

  await expect(page.getByRole("dialog", { name: "Publish the first record" })).toBeVisible();
  await expectActiveTourTarget(page, "card-publishTailorsClaim");
  await expectActiveActionTarget(page, "action-publishTailorsClaim-commit");
  await activateButton(page.locator('[data-tour-target="action-publishTailorsClaim-commit"]'));
  await expect(page.locator(".command-panel")).toBeVisible();
  await expect(page.getByRole("dialog", { name: "Before Publishing is the final check" })).toBeVisible();
  await expectActiveTourTarget(page, "command-panel");
  await expectActiveActionTarget(page, "command-commit");
  await expectCommandTutorialLayout(page);
  await activateButton(page.locator('[data-tour-target="command-commit"]'));

  await expect(page.getByRole("dialog", { name: "Metrics show the run's direction" })).toBeVisible();
  await expect(page.locator(".live-status")).toContainText("6 actions left");
  await expectActiveTourTarget(page, "metrics-grid");
  await clickTutorialNext(page);
  await expect(page.getByRole("dialog", { name: "Switch to Public Comments" })).toBeVisible();
  await expectActiveTourTarget(page, "source-public");
  await expectActiveActionTarget(page, "source-public");
  await activateButton(page.locator('[data-tour-target="source-public"]'));

  await expect(page.getByRole("dialog", { name: "Publish a public signal" })).toBeVisible();
  await expectActiveTourTarget(page, "card-showUnfilteredComments");
  await expectActiveActionTarget(page, "action-showUnfilteredComments-commit");
  await activateButton(page.locator('[data-tour-target="action-showUnfilteredComments-commit"]'));
  await expect(page.locator(".command-panel")).toBeVisible();
  await expect(page.getByRole("dialog", { name: "This move is riskier" })).toBeVisible();
  await expectActiveTourTarget(page, "command-panel");
  await expectActiveActionTarget(page, "command-commit");
  await expectCommandTutorialLayout(page);
  await activateButton(page.locator('[data-tour-target="command-commit"]'));

  await expect(page.locator(".dialogue-panel")).toBeVisible({ timeout: 15000 });
  await expect(page.locator(".live-status")).toContainText("6 actions left");
  await expect(page.getByRole("dialog", { name: "Dialogue is immediate reaction" })).toBeVisible();
  await expectActiveTourTarget(page, "dialogue-panel");
  await expectActiveActionTarget(page, "dialogue-reply");
  await expectTutorialPanelClearOfDialogue(page);
  await expect(page.locator(".dialogue-panel .dialogue-timeout.paused")).toContainText("Guide Pause");
  await activateButton(page.locator('[data-tour-target="dialogue-reply"]'));

  await expect(page.getByRole("dialog", { name: "Write the exchange into the run" })).toBeVisible();
  await expectActiveTourTarget(page, "dialogue-panel");
  await expectActiveActionTarget(page, "dialogue-resolve");
  await expectTutorialPanelClearOfDialogue(page);
  const resolveButton = page.locator('[data-tour-target="dialogue-resolve"]');
  await expect(resolveButton).toBeEnabled({ timeout: 15000 });
  await activateButton(resolveButton);
  await expect(page.locator(".dialogue-panel")).toHaveCount(0, { timeout: 15000 });
  await expect(page.locator(".onboarding-panel")).toHaveCount(0);
  await expect(page.locator(".engine-intro-panel")).toHaveCount(0);
  await expect(page.locator(".guidance-card")).toBeVisible();
  await expect(page.locator(".guidance-card")).toContainText("System Guide");
  await expect(page.locator(".role-card")).toContainText("0 spent");
  await expect(page.locator(".clock-card")).toContainText("6/6");
  const guidedState = await page.evaluate(() => JSON.parse(localStorage.getItem("emperor-feed-state") ?? "{}"));
  expect(guidedState.actionsLeft).toBe(6);
  expect(guidedState.history?.map((entry: { spentAction?: boolean }) => entry.spentAction)).toEqual([false, false]);

  await page.reload();
  await expect(page.locator(".onboarding-panel")).toHaveCount(0);
  await expect(page.locator(".guidance-card")).toBeVisible();
  await expect(page.locator(".role-card")).toContainText("0 spent");
  await expect(page.locator(".clock-card")).toContainText("6/6");

  await page.goto("/");
  await page.getByRole("button", { name: "Start Game" }).click();
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByRole("dialog", { name: "Game Briefing" })).toBeVisible();
  await page.getByRole("button", { name: "Begin Operations" }).click();
  await expect(page.getByRole("dialog", { name: "Six posts decide the ending" })).toBeVisible();
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
  await expect(page.locator(".toast-stack")).toContainText("游戏已开始");
  await expect(page.locator(".toast-stack")).toContainText("宫廷 AI 已上线");
  await expect(page.locator(".toast-stack")).not.toContainText("Palace AI is monitoring");

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

test("legacy Chinese guided tutorial saves are refunded to six actions", async ({ page }) => {
  await page.evaluate((state) => {
    const firstState = { ...state, actionsLeft: 5 };
    const secondState = { ...state, actionsLeft: 4 };
    localStorage.setItem("emperor-feed-language", "zh");
    localStorage.setItem("emperor-feed-briefing-dismissed", "true");
    localStorage.setItem("emperor-feed-guidance-unlocked", "true");
    localStorage.setItem("emperor-feed-state", JSON.stringify({
      ...state,
      actionsLeft: 4,
      usedActionIds: ["publishTailorsClaim", "showUnfilteredComments"],
      history: [
        {
          id: "publishTailorsClaim-1",
          actionId: "publishTailorsClaim",
          actionTitle: "发布裁缝声明",
          zone: "裁缝声明",
          choice: "direct",
          publishedText: "皇帝的新衣获得一致称赞。",
          resultText: "皇帝的新衣获得一致称赞。",
          engineMessage: "宫廷 AI 建议保持稳定。",
          spentAction: true,
          stateBefore: state,
          stateAfter: firstState
        },
        {
          id: "showUnfilteredComments-2",
          actionId: "showUnfilteredComments",
          actionTitle: "显示未过滤评论",
          zone: "未过滤公众",
          choice: "direct",
          publishedText: "未过滤评论现在可见。",
          resultText: "未过滤评论现在可见。",
          engineMessage: "未过滤可见性可能增加解释混乱。",
          spentAction: true,
          stateBefore: firstState,
          stateAfter: secondState
        }
      ]
    }));
  }, initialState);

  await page.goto("/dashboard");

  await expect(page.locator(".role-card")).toContainText("正式已执行 0 次");
  await expect(page.locator(".clock-card")).toContainText("6/6");
  const restored = await page.evaluate(() => JSON.parse(localStorage.getItem("emperor-feed-state") ?? "{}"));
  expect(restored.actionsLeft).toBe(6);
  expect(restored.history?.map((entry: { spentAction?: boolean }) => entry.spentAction)).toEqual([false, false]);
});

test("saved mixed-language run text is localized or hidden in the current language", async ({ page }) => {
  await page.evaluate((state) => {
    const zhHistoryEntry = {
      id: "zh-entry-1",
      actionId: "publishTailorsClaim",
      actionTitle: "发布裁缝声明",
      zone: "tailors",
      choice: "direct",
      publishedText: "皇帝的新衣获得一致称赞。",
      engineMessage: "宫廷 AI 建议保持稳定。",
      stateBefore: state,
      stateAfter: state
    };
    localStorage.setItem("emperor-feed-language", "en");
    localStorage.setItem("emperor-feed-briefing-dismissed", "true");
    localStorage.setItem("emperor-feed-guidance-unlocked", "true");
    localStorage.setItem("emperor-feed-state", JSON.stringify({
      ...state,
      actionsLeft: 5,
      usedActionIds: ["publishTailorsClaim"],
      history: [zhHistoryEntry],
      feedEvents: [{ id: "old-feed", type: "official", title: "发布裁缝声明", text: "这条信息来自中文旧局。" }],
      comments: ["这是一条中文旧评论。"],
      publicComments: [{ handle: "@旧评论", persona: "市民", stance: "praise", text: "这是一条中文旧评论。", intensity: 2 }]
    }));
    localStorage.setItem("emperor-feed-profile", JSON.stringify({
      version: 2,
      achievements: [],
      runs: [{
        id: "mixed-language-run",
        completedAt: "2026-05-20T00:00:00.000Z",
        endingId: "unstableFeed",
        language: "zh",
        finalMetrics: {
          truth: 0,
          pressure: 3,
          virality: 4,
          publicDoubt: 2,
          reputation: 6,
          systemSuspicion: 2
        },
        actionPath: [{ actionId: "publishTailorsClaim", title: "发布裁缝声明", choice: "direct" }],
        dialogueCount: 0,
        achievementsUnlocked: []
      }],
      engineFragments: [],
      biasAwareness: 0,
      decodedEngine: false,
      secretEndingUnlocked: false
    }));
  }, initialState);

  await page.goto("/dashboard");
  await expect(page.locator(".log-list")).toContainText("Publish the Tailors' Claim");
  await expect(page.locator(".log-list")).not.toContainText("发布裁缝声明");
  await expect(page.locator(".feed-log")).toContainText("Saved feed record");
  await expect(page.locator(".comment-stream")).toContainText("This saved comment was written in another language");

  await page.goto("/archive");
  await expect(page.locator(".archive-detail .history-list")).toContainText("Publish the Tailors' Claim");
  await page.getByRole("button", { name: "Switch language" }).click();
  await expect(page.locator(".archive-detail .history-list")).toContainText("发布裁缝声明");
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
  await expect(page.getByRole("dialog", { name: "Game Briefing" })).toBeVisible();

  await page.request.post("/api/auth/logout");
  await page.evaluate(() => localStorage.clear());
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("correct-password");
  await page.locator(".auth-form .btn.primary").click();

  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.locator(".auth-chip")).toContainText(email);
  await expect(page.getByRole("dialog", { name: "Game Briefing" })).toBeVisible();
});
