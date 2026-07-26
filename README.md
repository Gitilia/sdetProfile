# portfolio.spec.ts

> A personal portfolio + resume styled as a **Playwright test runner**. Built by an SDET, for SDETs.
>
> Gitea remote: `ilia/sdetProfile` (local folder is usually cloned as `portfolio`).

Click the green ▶ next to any test to "run" it — each passing test reveals a portfolio section. Filter by `@tag` chips like a real `--grep`. Includes a career-timeline trace viewer, a Source tab that renders the portfolio as actual-looking Playwright spec code, a **Network** tab that lists public [git.levkin.ca](https://git.levkin.ca/explore/repos) repos as Playwright-style `GET … 200` rows with expandable JSON (descriptions from the Gitea API or each repo's README), and a downloadable PDF resume.

**Live preview:** deploy locally (see below) or open `index.html` directly.

---

## Why this exists

A traditional portfolio doesn't tell a hiring manager you live in test runners all day. This one does — every interaction is a love letter to the tooling SDETs use:

- Sidebar **Test Explorer** (400px) with collapsible suites, green run arrows, and tree-view ellipsis for long describe labels
- **Editor tab strip** (28px, slim) above the report — switch between `portfolio.spec.ts`, `projects.spec.ts`, `skills.spec.ts`, `playground.spec.ts`; each rescopes the explorer, report, source view, and status counts (cookie-persisted)
- **Status pill** merged into the editor bar with live pass/fail/skip counts per active spec
- **Overflow menu** (⋯) on the right of the editor tabs with `--workers=` and `--headed` controls
- **Skipped test** (`should meet performance budget`) with amber ⊘ icon — a 100% green suite looks fake; mixed outcomes feel authentic
- Progress bars under each test that fill in real time
- **Auto-run** first test on page load so the hero arrives with body content rendered (runner animation still plays)
- **Summary stripe** above the results list: `Last run · 1.4s · 4 passed · 1 skipped`
- **Pending preview** — the first idle test's body is shown expanded with a faded look + "click ▶ to run" overlay
- **Tag bar** with 6 visible tags + "+N more" expand chip + a `× clear` button
- **Count bubbles** right-aligned with consistent width, tabular numerals, outlined — reads as "metric" not "tag"
- VS Code dark+ / Playwright trace viewer palette (Inter + JetBrains Mono)
- A `Trace` tab that draws your career as a Gantt-style waterfall
- A `Source` tab that renders the active spec as a real-looking `.spec.ts` file
- A `Console` tab that logs test run events live
- A `Network` tab modeled on Playwright's network panel — one row per public Gitea repo (`GET https://git.levkin.ca/api/v1/repos/…`), click to expand the faux JSON body
- `--headed` toggle that slows animations down for demo mode
- `--workers=` selector for parallel test execution (1, 2, or 4 workers)
- Cookie-persisted theme cycle: dark → light → high-contrast (WCAG AAA)
- Keyboard shortcuts (`?` to see all): `R` run all, `X` reset, `T` theme, `/` grep, `1–9` run Nth test
- Mobile drawer for the test explorer, fully responsive

---

## Stack

Intentionally zero-framework. The whole point is craftsmanship: hand-rolled HTML, CSS variables, and vanilla JS. Easy to read, easy to fork, deploys anywhere static.

| Layer        | Choice                                    |
| ------------ | ----------------------------------------- |
| Markup       | Single `index.html`                       |
| Styling      | `css/base.css` (tokens) + `css/app.css`   |
| Behavior     | `js/data.js` (content) + `js/app.js` (UI) |
| Type         | Inter (sans) + JetBrains Mono (mono)      |
| Icons / Logo | Hand-written inline SVG                   |
| Build        | None — open the file                      |
| Tests (dev)  | `@playwright/test` against `npx serve`    |
| Hosting      | Any static host (S3, Netlify, GitHub Pages, your homelab) |

---

## Project structure

```
portfolio/
├── index.html              # Single-page shell — topbar, editor bar, sidebar, tabs, statusbar
├── README.md               # You are here
├── IDEAS.md                # Future work, ranked by effort/payoff
├── package.json            # Dev-only — Playwright test runner
├── playwright.config.ts    # Playwright config — serves site locally on port 3173
├── scripts/
│   └── fetch-gitea-repos.mjs   # Optional: regenerate `giteaRepos` from git.levkin.ca API + READMEs
├── tests/
│   └── portfolio.spec.ts   # 37 Playwright specs exercising the live site
├── css/
│   ├── base.css            # Design tokens: colors, type, spacing, dark/light/hc themes
│   └── app.css             # Component styles: tree, tabs, results, trace, network, source, etc.
├── js/
│   ├── data.js             # All portfolio content — single source of truth (incl. `giteaRepos`)
│   └── app.js              # Test-runner behavior: tree, run engine, tabs, theme, drawer
└── assets/
    ├── favicon.svg
    └── DobkinResume26.pdf
```

---

## Quick start

```bash
# clone / open in Cursor, then:
cd portfolio
python3 -m http.server 8765
open http://localhost:8765
```

That's it. No build step, no dependencies. Edit a file, refresh the page.

---

## Running the Playwright tests

The site that *looks* like a Playwright report is itself tested by real Playwright. The `tests/` directory ships **37 specs across 12 describe blocks** covering smoke checks, the run engine, theme cycling, tab navigation, editor strip switching, grep/tag filtering, keyboard shortcuts, the network panel, accessibility basics, the overflow menu, mobile responsiveness, and a full lifecycle scenario.

```bash
npm install
npx playwright install    # downloads browser binaries
npm test                  # runs against Chromium by default
```

Useful variants:

```bash
npm run test:headed       # watch the browser — great for debugging
npm run test:ui           # Playwright's interactive UI mode
npm run report            # open the HTML report from the last run
```

By default the config spins up a local static server on port 3173 (via `npx serve`) and runs Chromium only. Firefox and WebKit projects are present in `playwright.config.ts` — uncomment them to fan out. To test against a deployed URL instead of the local server:

```bash
BASE_URL=https://iliadobkin.com npx playwright test
```

> **Note:** `package.json` and `node_modules/` are test-only concerns — the site itself still has zero build step.

---

## Lint & quality checks

The site has no build step, but the dev toolchain runs a four-step quality pass on every commit-worthy change. All checks have an npm script and can be run individually.

```bash
npm run lint        # eslint + stylelint + html-validate, in parallel
npm run lint:js     # ESLint over js/, scripts/, tests/, *.ts (vanilla JS + TS)
npm run lint:css    # Stylelint over css/*.css (bug-only ruleset, no style nags)
npm run lint:html   # html-validate over index.html (a11y, roles, DOCTYPE)
npm run typecheck   # tsc --noEmit on playwright.config.ts + tests/*.ts
npm run check       # lint + typecheck + test (the full guardrail set)
```

Conventions worth knowing:

- **ESLint** uses a flat config (`eslint.config.mjs`) with three scopes — browser globals for `js/`, Node ESM for `scripts/`, and `typescript-eslint` for `tests/` + `*.ts`. `console.warn` / `console.error` are allowed; `console.log` is not.
- **Stylelint** runs a minimal "bug-only" ruleset (`.stylelintrc.json`) — block-no-empty, no-invalid-hex, function-no-unknown, property-no-unknown, etc. Compact handwritten CSS (single-line rules, `rgba()`, 6-char hex) is intentional and not flagged.
- **html-validate** (`.htmlvalidate.json`) enforces uppercase DOCTYPE, accessible button names, non-redundant ARIA roles, and valid landmark usage.
- **tsc** (`tsconfig.json`) runs in `--noEmit` strict mode against the test files — fails fast if a selector signature drifts.

`npm-run-all2` parallelizes the linters for speed (`npm run lint` finishes in ~3s); `npm run check` is the one to wire into a Gitea Actions runner.

---

## Editing content

**All content lives in [`js/data.js`](js/data.js)** under `window.PORTFOLIO`. Change a title, swap a job, retag a skill — the UI updates automatically because every section is rendered from this single object.

```js
window.PORTFOLIO = {
  person: { first: 'Ilia', last: 'Dobkin', /* ... */ },

  // Master tag palette — drives the filter bar (first 6 shown, rest in "+N more")
  tags: ['@playwright', '@cypress', '@api', '@ci', /* ... */],

  // Open .spec.ts files — each becomes a tab in the editor strip
  specs: [
    { id: 'portfolio',  file: 'portfolio.spec.ts',  describe: 'Ilia Dobkin · portfolio' },
    { id: 'projects',   file: 'projects.spec.ts',   describe: 'Levkin · projects' },
    { id: 'skills',     file: 'skills.spec.ts',     describe: 'Ilia Dobkin · skills' },
    { id: 'playground', file: 'playground.spec.ts', describe: 'Ilia Dobkin · playground' },
  ],

  // The test suite — each entry maps to one portfolio section
  suite: {
    name: 'Ilia Dobkin · portfolio',
    tests: [
      {
        id: 'about',
        spec: 'portfolio',                // ← which file this test lives in
        title: 'should introduce Ilia Dobkin',
        tags: ['@playwright', '@leadership'],
        duration: 142,
        steps: [
          { kind: 'info', title: 'navigate to /about',     dur: 12 },
          { kind: 'ok',   title: 'render bio',             dur: 48 },
          { kind: 'ok',   title: 'assert credentials',     dur: 82 },
        ],
        render: renderAbout, // function that returns the section HTML
      },
      {
        id: 'perf-budget',
        spec: 'portfolio',
        title: 'should meet performance budget',
        skip: true,                       // ← amber ⊘ icon, excluded from Run All
        skipReason: 'Lighthouse CI not wired — pending infra',
        // ...
      },
      // ...
    ],
  },

  experience: [ /* roles, in reverse-chronological order */ ],
  skills:     [ /* name, level (0–100), tags */ ],
  projects:   [ /* name, desc, tags */ ],
  stack:      { Editors: [...], Languages: [...], /* ... */ },
  metrics:    [ /* label / value pairs for the KPI cards */ ],
  giteaRepos: [ /* full_name, html_url, language, description — Network tab */ ],
};
```

### Add a new test (section)

1. Add an entry to `PORTFOLIO.suite.tests` — set `spec` to the spec it belongs in (matching one of `PORTFOLIO.specs[].id`).
2. Write a `render<Name>()` function further down in `data.js` that returns HTML.
3. Reference it as the `render` property. Done — it appears in the sidebar + report when its spec tab is active.

### Skip a test

Set `skip: true` on the test entry. It will render with the amber ⊘ icon, be excluded from `Run All`, and display its `skipReason` in the body.

### Add a new spec file (tab)

1. Append an entry to `PORTFOLIO.specs` (`{ id, file, describe }`).
2. Tag any tests into it via the `spec: '<id>'` field.

That's it — a new tab appears in the editor strip with the count badge.

### Add a new tag

Append to `PORTFOLIO.tags`. To make it filter anything, also add it to the `tags: []` array on the relevant tests. Only the first 6 tags are shown by default; the rest hide behind a "+N more" chip.

### Add an experience entry

Push to `PORTFOLIO.experience`. The Trace tab parses `when` (`"Aug 2023 – Apr 2026"`) automatically and lays it out on the timeline.

### Refresh Gitea repo descriptions

Public repos are listed at [git.levkin.ca/explore/repos](https://git.levkin.ca/explore/repos); the HTTP UI may split results across pages, but the Gitea API returns **all 19 public repos in one `repos/search` response**. To refresh blurbs from live READMEs:

```bash
node scripts/fetch-gitea-repos.mjs
```

Copy the printed `giteaRepos: [ … ]` block into `js/data.js` (or merge rows by hand). Descriptions prefer the repo's Gitea `description` field, then the first paragraph of `README.md`.

---

## Customizing the look

All design tokens live in [`css/base.css`](css/base.css) as CSS variables, scoped to `:root[data-theme='dark']`, `:root[data-theme='light']`, and `:root[data-theme='hc']` (WCAG AAA high-contrast).

**Want a different accent?** Change `--accent` (default `#4ec9b0`, Playwright's signature teal).

**Different font?** Swap the `<link>` in `index.html` and `--font-sans` / `--font-mono` in `base.css`.

**Different statusbar color?** `--statusbar-bg` (default VS Code blue `#007acc`).

---

## Deploying

Any static host works because there's no build:

- **S3 / CloudFront** — upload the folder; entry point `index.html`.
- **GitHub Pages** — push to `gh-pages` branch, point to root.
- **Netlify / Vercel** — drag-and-drop the folder.
- **Your homelab (Caddy / nginx)** — just serve the directory.
- **Custom domain (e.g. `iliadobkin.com`)** — point an A/CNAME record at your host.

> Note: the theme toggle cycles **dark → light → high-contrast (WCAG AAA)** and persists via a cookie, which works fine on any normal domain. If you embed in a sandboxed iframe that strips cookies, the theme will reset on reload but otherwise works.

---

## Architecture cheatsheet

**Render loop is simple and stateless per-test:**

```
state[testId] = { status: 'idle' | 'running' | 'passed' | 'skipped', runtime: ms }

runTest(id)
  ├─ if test.skip → log warning, bail
  ├─ flip state to 'running'
  ├─ refreshTreeRow + refreshResultRow         (update sidebar + main pane)
  ├─ animate progress bar via requestAnimationFrame
  └─ on completion → state 'passed', renderBody() injects section HTML
```

**Where to look for things:**

| You want to change…              | Open                              |
| -------------------------------- | --------------------------------- |
| What a test looks like inside    | `data.js` — the matching `render*` fn |
| The order or set of tests        | `data.js` — `PORTFOLIO.suite.tests` |
| The set of spec files (tabs)     | `data.js` — `PORTFOLIO.specs` (+ `spec` on each test) |
| The editor bar + overflow menu   | `app.js` — `renderEditorStrip()` / `initOverflowMenu()` |
| The status pill / summary stripe | `app.js` — `updateStatusbar()` / `updateSummaryStripe()` |
| The tag bar + clear button       | `app.js` — `renderTagBar()` / `syncTagBarUI()` / `clearTagFilter()` |
| The trace tab parsing            | `app.js` — `renderTrace()` + `parseMon()` |
| The fake source code             | `app.js` — `renderSource()`       |
| The Network / Gitea repo list    | `data.js` — `giteaRepos` + `app.js` — `renderNetwork()` |
| Run-animation timing             | `app.js` — `runTest()` / `tween()`|
| Theme colors                     | `base.css` — `:root[data-theme=*]`|
| Mobile breakpoints               | `app.css` — `@media (max-width: 900px)` |

---

## Roadmap

See [IDEAS.md](IDEAS.md) for the backlog. Quick wins on top, ambitious experiments at the bottom.

---

## License

MIT. Fork it, restyle it, replace the content with your own. If you ship a variation, a wave hello on LinkedIn would be appreciated but is not required.

---

**Built by** [Ilia Dobkin](https://www.linkedin.com/in/ilia-dobkin-8263343/) · Senior SDET · Remote (ET)
