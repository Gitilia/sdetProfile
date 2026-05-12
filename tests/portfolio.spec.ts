import { test, expect, type Page } from "@playwright/test";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Wait for idle UI state (no spinners, status says "idle" or "all passed"). */
async function waitForIdle(page: Page) {
  await expect(page.locator("#status-text")).not.toHaveText("running", {
    timeout: 15_000,
  });
}

/** Click "Run all" and wait for every runnable test to finish. */
async function runAllAndWait(page: Page) {
  await page.click("#run-all");
  await expect(page.locator("#status-text")).toHaveText("all passed", {
    timeout: 30_000,
  });
}

/** Run a single test by clicking its ▶ button in the sidebar tree. */
async function runSingleTest(page: Page, testId: string) {
  await page.click(`.test[data-id="${testId}"] .test__run`);
  await expect(page.locator(`#result-${testId}`)).toHaveClass(/is-open/, {
    timeout: 15_000,
  });
}

// ---------------------------------------------------------------------------
// Smoke — page loads and renders the shell
// ---------------------------------------------------------------------------

test.describe("smoke", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("page has correct title", async ({ page }) => {
    await expect(page).toHaveTitle(/Ilia Dobkin/);
  });

  test("hero section renders name and role", async ({ page }) => {
    await expect(page.locator(".hero__title")).toHaveText("Ilia Dobkin");
    await expect(page.locator(".hero__sub")).toContainText("Senior SDET");
  });

  test("topbar contains Run all, Stop, Reset, and Theme toggle", async ({
    page,
  }) => {
    await expect(page.locator("#run-all")).toBeVisible();
    await expect(page.locator("#stop-all")).toBeVisible();
    await expect(page.locator("#reset-all")).toBeVisible();
    await expect(page.locator("#theme-toggle")).toBeVisible();
  });

  test("sidebar test explorer lists tests", async ({ page }) => {
    const tests = page.locator("#tree .test");
    await expect(tests.first()).toBeVisible();
    expect(await tests.count()).toBeGreaterThan(0);
  });

  test("status bar shows Playwright version", async ({ page }) => {
    await expect(page.locator(".statusbar")).toContainText("Playwright");
  });

  test("five tabs exist: Report, Trace, Source, Network, Console", async ({
    page,
  }) => {
    for (const label of ["Report", "Trace", "Source", "Network", "Console"]) {
      await expect(page.locator(`.tab[data-tab]`, { hasText: label })).toBeVisible();
    }
  });
});

// ---------------------------------------------------------------------------
// Run engine — Run All, individual runs, reset
// ---------------------------------------------------------------------------

test.describe("run engine", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForIdle(page);
  });

  test("Run All executes and all tests pass", async ({ page }) => {
    await runAllAndWait(page);

    const passCount = page.locator("#cnt-pass");
    expect(Number(await passCount.textContent())).toBeGreaterThan(0);
    await expect(page.locator("#cnt-fail")).toHaveText("0");
  });

  test("clicking ▶ on a single test runs only that test", async ({
    page,
  }) => {
    await runSingleTest(page, "about");

    await expect(
      page.locator('.test[data-id="about"]')
    ).toHaveClass(/is-passed/);

    const passCount = Number(await page.locator("#cnt-pass").textContent());
    expect(passCount).toBeGreaterThanOrEqual(1);
  });

  test("Reset clears all results back to idle", async ({ page }) => {
    await runAllAndWait(page);
    await page.click("#reset-all");

    await expect(page.locator("#status-text")).toHaveText("idle");
    await expect(page.locator("#cnt-pass")).toHaveText("0");
  });

  test("skipped test shows skip icon and badge", async ({ page }) => {
    const skippedRow = page.locator('.test[data-id="perf-budget"]');
    await expect(skippedRow).toHaveClass(/is-skipped/);
  });
});

// ---------------------------------------------------------------------------
// Theme toggle
// ---------------------------------------------------------------------------

test.describe("theme", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("starts in dark mode by default", async ({ page }) => {
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  });

  test("theme toggle cycles through dark → light → hc → dark", async ({
    page,
  }) => {
    await page.click("#theme-toggle");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

    await page.click("#theme-toggle");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "hc");

    await page.click("#theme-toggle");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  });
});

// ---------------------------------------------------------------------------
// Tab navigation
// ---------------------------------------------------------------------------

test.describe("tabs", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("clicking each tab reveals corresponding pane", async ({ page }) => {
    const tabs = ["report", "trace", "source", "network", "console"];

    for (const tabId of tabs) {
      await page.click(`.tab[data-tab="${tabId}"]`);
      await expect(page.locator(`#pane-${tabId}`)).toHaveClass(/is-active/);
    }
  });

  test("Source tab renders spec-like code", async ({ page }) => {
    await page.click('.tab[data-tab="source"]');
    await expect(page.locator("#source")).toContainText("import");
    await expect(page.locator("#source")).toContainText("test.describe");
  });

  test("Trace tab renders career timeline", async ({ page }) => {
    await page.click('.tab[data-tab="trace"]');
    const rows = page.locator(".trace-row");
    expect(await rows.count()).toBeGreaterThan(0);
  });

  test("Network tab renders Gitea repo rows", async ({ page }) => {
    await page.click('.tab[data-tab="network"]');
    const entries = page.locator(".network-entry");
    await expect(entries.first()).toBeVisible();
    expect(await entries.count()).toBeGreaterThan(0);
  });

  test("Console tab logs events after a test run", async ({ page }) => {
    await runSingleTest(page, "about");
    await page.click('.tab[data-tab="console"]');
    const lines = page.locator(".console__line");
    expect(await lines.count()).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Editor strip — switching spec files
// ---------------------------------------------------------------------------

test.describe("editor strip", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("editor tabs exist for all spec files", async ({ page }) => {
    for (const file of [
      "portfolio.spec.ts",
      "projects.spec.ts",
      "skills.spec.ts",
      "playground.spec.ts",
    ]) {
      await expect(
        page.locator(".espec", { hasText: file })
      ).toBeVisible();
    }
  });

  test("clicking a spec tab switches the active spec", async ({ page }) => {
    await page.click('.espec[data-spec="projects"]');
    await expect(
      page.locator('.espec[data-spec="projects"]')
    ).toHaveClass(/is-active/);

    const crumb = page.locator(".crumb strong");
    await expect(crumb).toHaveText("projects.spec.ts");
  });

  test("switching spec shows Report pane with updated hero", async ({
    page,
  }) => {
    await page.click('.espec[data-spec="projects"]');

    await expect(page.locator("#pane-report")).toHaveClass(/is-active/);
    await expect(page.locator(".hero__title")).toHaveText("Projects");
  });

  test("switching spec updates the Source tab", async ({ page }) => {
    await page.click('.espec[data-spec="skills"]');
    await page.click('.tab[data-tab="source"]');
    await expect(page.locator("#source")).toContainText("skills");
  });
});

// ---------------------------------------------------------------------------
// Sidebar — grep filter and tag chips
// ---------------------------------------------------------------------------

test.describe("filtering", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("typing in grep input filters visible tests", async ({ page }) => {
    const allBefore = await page.locator("#tree .test").count();

    await page.fill("#grep", "resume");
    await page.waitForTimeout(200);

    const visible = page.locator('#tree .test:not([style*="display: none"])');
    const visibleCount = await visible.count();
    expect(visibleCount).toBeLessThan(allBefore);
    expect(visibleCount).toBeGreaterThan(0);
  });

  test("clicking a tag chip activates it and filters", async ({ page }) => {
    const tag = page.locator('#tag-bar .tag[data-tag="@api"]');
    await tag.click();
    await expect(tag).toHaveClass(/is-active/);

    await expect(page.locator("#grep")).toHaveValue(/@api/);
  });

  test("clear button removes all tag filters", async ({ page }) => {
    await page.click('#tag-bar .tag[data-tag="@api"]');
    await page.click("#tag-bar [data-clear]");
    await expect(page.locator("#grep")).toHaveValue("");
  });
});

// ---------------------------------------------------------------------------
// Keyboard shortcuts
// ---------------------------------------------------------------------------

test.describe("keyboard shortcuts", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForIdle(page);
  });

  test("pressing ? opens keyboard shortcuts overlay", async ({ page }) => {
    await page.keyboard.press("?");
    await expect(page.locator("#kshelp")).not.toHaveAttribute("hidden", "");
  });

  test("pressing Escape closes the shortcuts overlay", async ({ page }) => {
    await page.keyboard.press("?");
    await expect(page.locator("#kshelp")).not.toHaveAttribute("hidden", "");
    await page.keyboard.press("Escape");
    await expect(page.locator("#kshelp")).toHaveAttribute("hidden", "");
  });

  test("pressing T toggles theme", async ({ page }) => {
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await page.keyboard.press("t");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  });

  test("pressing / focuses the grep input", async ({ page }) => {
    await page.keyboard.press("/");
    await expect(page.locator("#grep")).toBeFocused();
  });
});

// ---------------------------------------------------------------------------
// Overflow menu (workers / headed)
// ---------------------------------------------------------------------------

test.describe("overflow menu", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("clicking ⋯ opens the overflow menu", async ({ page }) => {
    await page.click("#overflow-btn");
    await expect(page.locator("#overflow-menu")).not.toHaveAttribute(
      "hidden",
      ""
    );
  });

  test("workers dropdown is accessible", async ({ page }) => {
    await page.click("#overflow-btn");
    await expect(page.locator("#workers")).toBeVisible();
    await page.selectOption("#workers", "4");
    await expect(page.locator("#workers")).toHaveValue("4");
  });
});

// ---------------------------------------------------------------------------
// Network tab — expand/collapse repo detail
// ---------------------------------------------------------------------------

test.describe("network detail", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.click('.tab[data-tab="network"]');
  });

  test("clicking a network row expands its detail panel", async ({ page }) => {
    const firstEntry = page.locator(".network-entry").first();
    await firstEntry.locator(".network-row").click();
    await expect(firstEntry).toHaveClass(/is-open/);
    await expect(firstEntry.locator(".network-detail")).not.toHaveAttribute(
      "hidden",
      ""
    );
  });

  test("expanded detail shows JSON body and repo link", async ({ page }) => {
    const firstEntry = page.locator(".network-entry").first();
    await firstEntry.locator(".network-row").click();

    await expect(
      firstEntry.locator(".network-detail__body")
    ).toContainText("full_name");
    await expect(
      firstEntry.locator(".network-detail__link")
    ).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Accessibility basics
// ---------------------------------------------------------------------------

test.describe("accessibility", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("all interactive buttons have accessible names", async ({ page }) => {
    const buttons = page.locator(
      "button:visible:not(.tag):not(.espec):not(.tab):not(.cmdpal__item)"
    );
    const count = await buttons.count();

    for (let i = 0; i < count; i++) {
      const btn = buttons.nth(i);
      const name = await btn.getAttribute("aria-label");
      const title = await btn.getAttribute("title");
      const text = (await btn.textContent())?.trim();
      const hasName = (name && name.length > 0) ||
        (title && title.length > 0) ||
        (text && text.length > 0);
      expect(hasName, `Button ${i} should have an accessible name`).toBe(true);
    }
  });

  test("landmark roles are present", async ({ page }) => {
    // <header> and <footer> at the top level expose implicit banner /
    // contentinfo roles; querying via getByRole picks them up natively.
    await expect(page.getByRole("banner")).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Responsive — mobile viewport
// ---------------------------------------------------------------------------

test.describe("responsive", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("sidebar is hidden by default on mobile", async ({ page }) => {
    await page.goto("/");
    const sidebar = page.locator("#sidebar");
    await expect(sidebar).not.toHaveClass(/is-open/);
  });

  test("menu button opens sidebar drawer on mobile", async ({ page }) => {
    await page.goto("/");
    await page.click("#menu-btn");
    await expect(page.locator("#sidebar")).toHaveClass(/is-open/);
  });
});

// ---------------------------------------------------------------------------
// End-to-end: full run lifecycle
// ---------------------------------------------------------------------------

test.describe("full lifecycle", () => {
  test("run all → verify results → reset → verify idle", async ({ page }) => {
    await page.goto("/");
    await waitForIdle(page);

    await runAllAndWait(page);

    const passed = Number(await page.locator("#cnt-pass").textContent());
    expect(passed).toBeGreaterThan(0);
    await expect(page.locator("#cnt-fail")).toHaveText("0");

    await expect(page.locator("#summary-stripe")).toContainText("passed");

    await page.click("#reset-all");
    await expect(page.locator("#status-text")).toHaveText("idle");
    await expect(page.locator("#cnt-pass")).toHaveText("0");
  });
});
