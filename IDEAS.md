# IDEAS — portfolio.spec.ts roadmap

Future enhancements, ranked by **payoff ÷ effort**. Quick wins on top.

---

## Quick wins (an evening or less)

### 1. Add a deliberate "failure" or "skipped" test
Set one test (e.g. `should accept inbound contact`) to status `skipped` with an amber ⊘ icon, or have a `should match expected response time` test that fails with a stack trace. Adds visual variety + shows you understand real test output.

- **Why**: A test suite that's 100% green looks fake. Mixed outcomes feel authentic and let you show error-rendering chops.
- **Where**: `data.js` → add `status: 'skipped' | 'failed'` field on tests; extend `statusIcon()` / `statusClass()` in `app.js`.

### 2. Workers indicator (`--workers=4`)
Add a dropdown next to `--headed` that picks 1, 2, or 4 workers. Run-all then runs N tests in parallel visually, with N progress bars filling concurrently.

- **Why**: Shows off parallelization (your daily reality), looks cool.
- **Where**: `app.js` → rewrite `runAll()` to pull from a queue with `Promise.all` of N workers.

### 3. Keyboard shortcuts overlay
- `R` runs all, `Esc` stops, `T` toggles theme, `/` focuses grep, `1`–`9` runs that test, `?` opens a help overlay.
- **Why**: Power-user keybindings feel native to VS Code / terminal users.
- **Where**: `app.js` → add `document.addEventListener('keydown', ...)` near `init()`.

### 4. Persist filter + tab state in URL
Add `?grep=@playwright&tab=trace` so links into specific views work. Mirror to / from `location.hash`.

- **Why**: Shareable deep links to "what I want a recruiter to see."
- **Where**: `app.js` → wrap `applyFilter` and tab clicks to call `history.replaceState`.

### 5. Footer "playback speed" slider
1×, 2×, 5×, 10× — multiply the `duration` of every test. Pairs well with the `--headed` toggle.

- **Where**: `app.js` → make `headed()` return a numeric multiplier, not a boolean.

### 6. Real Playwright HTML report download button
A "View report" button that bundles the current run state into an actual `playwright-report/index.html`-style page and downloads it. Bonus points: include screenshots of the current page.

---

## Medium lift (a weekend)

### 7. Trace tab drill-down
Click a bar on the career timeline → scroll the Report tab to that company and highlight it. Add a hover tooltip with role + bullet count + key tech.

- **Where**: `app.js` → bind `click` handlers in `renderTrace()`, animate `scrollIntoView`.

### 8. Network tab
A new tab modeled after Playwright's network panel. Each project entry becomes a fake XHR — `GET git.levkin.ca/api/repos/playwright-mcp 200 142ms` — clicking expands request/response detail. Same visual language as Source.

- **Why**: Plays directly into your "I see networks every day" identity.

### 9. Pinned-repo / activity feed
On Projects, pull live data from your Gitea (`git.levkin.ca`) or GitHub: latest commit, last build status, star count. Render with the same green-check / red-x vocabulary.

- **Approach**: small backend (Cloudflare Workers / Vercel function) that proxies a couple of API calls and caches for 5–10 minutes.

### 10. Real resume PDF generation
The current `download resume.pdf` opens a print-styled HTML page. Replace with a true PDF generated server-side (Puppeteer) or client-side (`pdf-lib`, `jsPDF`). Multi-page, properly hyphenated, with embedded fonts.

### 11. Search-runner: open-command style
`Ctrl+P` opens a command palette with fuzzy matching across test names, sections, and tags — VS Code-style.

### 12. Code-coverage strip
A small bar at the top of the report saying `coverage: 9 / 9 tests · 100%`. When tests are filtered out, it shows the current selection's coverage. Tiny detail, big SDET energy.

### 13. Custom domain on `iliadobkin.com`
- Buy / point domain → static host (S3 + CloudFront, or your Proxmox box behind Caddy)
- Set up Caddy site block with auto-TLS
- Add `og:image` (a screenshot of the runner) and `og:title` for nice link previews
- Plumb a tiny analytics pixel (Plausible or self-hosted Umami) — bonus: render a private `/admin` route that shows live visitor data in a Console-tab style

### 14. Dark+ light high-contrast variant
Third theme — high-contrast accessible mode (WCAG AAA). Toggle cycles dark → light → high-contrast. Reinforces your AODA/WCAG expertise.

---

## Ambitious experiments (a project on its own)

### 15. Real Playwright tests of the portfolio
Ship a `tests/` directory with actual Playwright specs that exercise the site (`page.click('#run-all')`, asserts that 9 tests pass). Include the report in CI. The site that looks like a Playwright report is itself tested by Playwright. Self-referential, beautiful.

### 16. MCP integration showcase
Make a tiny live demo of your Playwright MCP server — embed a Cursor-style sidebar showing fake assistant chat where an LLM "writes a test" against the site and you watch the test appear and run. Pure flex.

### 17. Live "watch mode"
Add a fake file-tree on the left (`portfolio.spec.ts`, `fixtures/`, `playwright.config.ts`). Clicking a file opens it in a code-editor view (Monaco editor, full syntax highlighting). Editing reruns the affected tests. Becomes more "interactive IDE" than portfolio.

### 18. Multi-spec navigation
Split content across multiple "spec files":
- `portfolio.spec.ts` — about, experience, contact
- `projects.spec.ts` — homelab, MCP server, local AI
- `skills.spec.ts` — tag-driven
- `playground.spec.ts` — interactive demos, mini-games, fun stuff

Each gets its own tab in the editor strip at the top.

### 19. Tag-driven "narrative mode"
Click a tag and the site replays as a story: it runs only tests with that tag, in a deliberate order, with auto-scroll between sections. Great for recruiters with 30 seconds. "Show me the iGaming story" → runs experience@iGaming, skills@playwright, metrics tests in sequence.

### 20. Recording mode (literal demo videos)
Use the MediaRecorder API to capture a 20-second video of a Run All cycle and offer it as a download — recruiters can embed in Slack. Closing the loop on "you're a tester, prove the site works" with video evidence.

---

## Content / polish backlog

- [ ] Add 1–2 GIFs or screenshots in this README
- [ ] Generate `og:image` social card (screenshot the dark hero)
- [ ] Write a short blog post on `iliadobkin.com/blog` titled "I built my portfolio as a Playwright test runner" — pair with this repo
- [ ] Add a "References" test: collapsed quotes from past managers / colleagues, each rendered as a test assertion (`expect(reference.satisfaction).toBeGreaterThan(threshold)`)
- [ ] Audit color contrast in light theme (WCAG AA minimum)
- [ ] Add ARIA labels to the run buttons (`aria-label="Run test: should introduce Ilia Dobkin"`)
- [ ] Test on iOS Safari + Firefox (currently QA'd in Chromium)
- [ ] Add a "print" stylesheet so the whole Report tab prints clean

---

## Notes to self

Things to keep invariant as the project grows:

1. **No build step.** The day this needs `npm install` is the day it loses its character.
2. **`data.js` stays human-editable.** No code-gen, no schema validation, no DSL. Just JS objects.
3. **Vanilla, framework-free.** If a feature genuinely needs React or a charting lib, weigh the bundle cost — the whole site is ~30 KB unminified.
4. **Every interaction should *feel* like a real test runner.** When in doubt, ask: "what would Playwright / Vitest UI do here?"
