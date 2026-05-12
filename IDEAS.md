# IDEAS — portfolio.spec.ts roadmap

Future enhancements, ranked by **payoff ÷ effort**. Quick wins on top.

---

## Quick wins (an evening or less)

### 1. Persist filter + tab state in URL
Add `?grep=@playwright&tab=trace` so links into specific views work. Mirror to / from `location.hash`.

- **Why**: Shareable deep links to "what I want a recruiter to see."
- **Where**: `app.js` → wrap `applyFilter` and tab clicks to call `history.replaceState`.

### 2. Footer "playback speed" slider
1×, 2×, 5×, 10× — multiply the `duration` of every test. Pairs well with the `--headed` toggle.

- **Where**: `app.js` → make `headed()` return a numeric multiplier, not a boolean.

### 3. Real Playwright HTML report download button
A "View report" button that bundles the current run state into an actual `playwright-report/index.html`-style page and downloads it. Bonus points: include screenshots of the current page.

### 4. Network tab filter + copy-as-cURL
Add a filter input above the repo list and a "Copy cURL" button per row.

---

## Medium lift (a weekend)

### 5. Trace tab drill-down
Click a bar on the career timeline → scroll the Report tab to that company and highlight it. Add a hover tooltip with role + bullet count + key tech.

- **Where**: `app.js` → bind `click` handlers in `renderTrace()`, animate `scrollIntoView`.

### 6. Pinned-repo / activity feed
On Projects or Network, pull **live** data from Gitea: latest commit, last push, star count — without baking `data.js`. Render with the same green-check / red-x vocabulary.

- **Approach**: small backend (Cloudflare Workers / Vercel function) that proxies `GET /api/v1/repos/{owner}/{repo}` and caches for 5–10 minutes (CORS-friendly). Static snapshot in `giteaRepos` already covers descriptions offline.

### 7. Real resume PDF generation
The current `download resume.pdf` opens a print-styled HTML page. Replace with a true PDF generated server-side (Puppeteer) or client-side (`pdf-lib`, `jsPDF`). Multi-page, properly hyphenated, with embedded fonts.

### 8. Custom domain on `iliadobkin.com`
- Buy / point domain → static host (S3 + CloudFront, or your Proxmox box behind Caddy)
- Set up Caddy site block with auto-TLS
- Add `og:image` (a screenshot of the runner) and `og:title` for nice link previews
- Plumb a tiny analytics pixel (Plausible or self-hosted Umami)

---

## Ambitious experiments (a project on its own)

### 9. MCP integration showcase
Make a tiny live demo of your Playwright MCP server — embed a Cursor-style sidebar showing fake assistant chat where an LLM "writes a test" against the site and you watch the test appear and run.

### 10. Live "watch mode"
Add a fake file-tree on the left (`portfolio.spec.ts`, `fixtures/`, `playwright.config.ts`). Clicking a file opens it in a code-editor view (Monaco editor, full syntax highlighting). Editing reruns the affected tests.

### 11. Tag-driven "narrative mode"
Click a tag and the site replays as a story: it runs only tests with that tag, in a deliberate order, with auto-scroll between sections. Great for recruiters with 30 seconds. "Show me the iGaming story" → runs experience@iGaming, skills@playwright, metrics tests in sequence.

### 12. Recording mode (literal demo videos)
Use the MediaRecorder API to capture a 20-second video of a Run All cycle and offer it as a download — recruiters can embed in Slack.

---

## Content / polish backlog

- [ ] Add 1–2 GIFs or screenshots in this README
- [ ] Generate `og:image` social card (screenshot the dark hero)
- [ ] Write a short blog post on `iliadobkin.com/blog` titled "I built my portfolio as a Playwright test runner"
- [ ] Add a "References" test: collapsed quotes from past managers / colleagues, each rendered as a test assertion
- [ ] Audit color contrast in light theme (WCAG AA minimum)
- [ ] Test on iOS Safari + Firefox (currently QA'd in Chromium)
- [ ] Add a "print" stylesheet so the whole Report tab prints clean
- [ ] Split `projects` into three tests (homelab / MCP / AI) so `projects.spec.ts` reads as 3 sibling rows

---

## Notes to self

Things to keep invariant as the project grows:

1. **`data.js` stays human-editable.** No code-gen, no schema validation, no DSL. Just JS objects.
2. **Vanilla, framework-free.** If a feature genuinely needs React or a charting lib, weigh the bundle cost — the whole site is ~30 KB unminified.
3. **Every interaction should *feel* like a real test runner.** When in doubt, ask: "what would Playwright / Vitest UI do here?"
