# portfolio.spec.ts

> A personal portfolio + resume styled as a **Playwright test runner**. Built by an SDET, for SDETs.

Click the green ▶ next to any test to "run" it — each passing test reveals a portfolio section. Filter by `@tag` chips like a real `--grep`. Includes a career-timeline trace viewer, a Source tab that renders the portfolio as actual-looking Playwright spec code, and a downloadable PDF resume.

**Live preview:** deploy locally (see below) or open `index.html` directly.

---

## Why this exists

A traditional portfolio doesn't tell a hiring manager you live in test runners all day. This one does — every interaction is a love letter to the tooling SDETs use:

- Sidebar **Test Explorer** with collapsible suite + green run arrows
- Pass / fail / skip status pill in the top bar with live counts
- Progress bars under each test that fill in real time
- VS Code dark+ / Playwright trace viewer palette (Inter + JetBrains Mono)
- A `Trace` tab that draws your career as a Gantt-style waterfall
- A `Source` tab that renders the portfolio as a real-looking `.spec.ts` file
- A `Console` tab that logs test run events live
- `--headed` toggle that slows animations down for demo mode
- Cookie-persisted dark / light theme toggle
- Mobile drawer for the test explorer, fully responsive

---

## Stack

Intentionally zero-framework. The whole point is craftsmanship: hand-rolled HTML, CSS variables, and vanilla JS. Easy to read, easy to fork, deploys anywhere static.

| Layer       | Choice                                    |
| ----------- | ----------------------------------------- |
| Markup      | Single `index.html`                       |
| Styling     | `css/base.css` (tokens) + `css/app.css`   |
| Behavior    | `js/data.js` (content) + `js/app.js` (UI) |
| Type        | Inter (sans) + JetBrains Mono (mono)      |
| Icons / Logo| Hand-written inline SVG                   |
| Build       | None — open the file                      |
| Hosting     | Any static host (S3, Netlify, GitHub Pages, your homelab) |

---

## Project structure

```
portfolio/
├── index.html              # Single-page shell — topbar, sidebar, tabs, statusbar
├── README.md               # You are here
├── IDEAS.md                # Future work, ranked by effort/payoff
├── css/
│   ├── base.css            # Design tokens: colors, type, spacing, dark/light themes
│   └── app.css             # Component styles: tree, tabs, results, trace, source, etc.
├── js/
│   ├── data.js             # All portfolio content — single source of truth
│   └── app.js              # Test-runner behavior: tree, run engine, tabs, theme, drawer
└── assets/
    └── favicon.svg         # Custom mark
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

## Editing content

**All content lives in [`js/data.js`](js/data.js)** under `window.PORTFOLIO`. Change a title, swap a job, retag a skill — the UI updates automatically because every section is rendered from this single object.

```js
window.PORTFOLIO = {
  person: { first: 'Ilia', last: 'Dobkin', /* ... */ },

  // Master tag palette — drives the filter bar
  tags: ['@playwright', '@cypress', '@api', '@ci', /* ... */],

  // The test suite — each entry maps to one portfolio section
  suite: {
    name: 'Ilia Dobkin · portfolio',
    tests: [
      {
        id: 'about',
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
      // ...
    ],
  },

  experience: [ /* roles, in reverse-chronological order */ ],
  skills:     [ /* name, level (0–100), tags */ ],
  projects:   [ /* name, desc, tags */ ],
  stack:      { Editors: [...], Languages: [...], /* ... */ },
  metrics:    [ /* label / value pairs for the KPI cards */ ],
};
```

### Add a new test (section)

1. Add an entry to `PORTFOLIO.suite.tests`.
2. Write a `render<Name>()` function further down in `data.js` that returns HTML.
3. Reference it as the `render` property. Done — it appears in the sidebar + report.

### Add a new tag

Append to `PORTFOLIO.tags`. To make it filter anything, also add it to the `tags: []` array on the relevant tests.

### Add an experience entry

Push to `PORTFOLIO.experience`. The Trace tab parses `when` (`"Aug 2023 – Apr 2026"`) automatically and lays it out on the timeline.

---

## Customizing the look

All design tokens live in [`css/base.css`](css/base.css) as CSS variables, scoped to `:root[data-theme='dark']` and `:root[data-theme='light']`.

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

> Note: the theme toggle persists via a cookie, which works fine on any normal domain. If you embed in a sandboxed iframe that strips cookies, the theme will reset on reload but otherwise works.

---

## Architecture cheatsheet

**Render loop is simple and stateless per-test:**

```
state[testId] = { status: 'idle' | 'running' | 'passed', runtime: ms }

runTest(id)
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
| The trace tab parsing            | `app.js` — `renderTrace()` + `parseMon()` |
| The fake source code             | `app.js` — `renderSource()`       |
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

**Built by** [Ilia Dobkin](https://www.linkedin.com/in/idobkin/) · Senior SDET · Toronto
