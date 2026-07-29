/* data.js — single source of truth for the portfolio "test suite" */
window.PORTFOLIO = {
  person: {
    first: "Ilia",
    last: "Dobkin",
    title: "Senior SDET",
    location: "Remote (ET)",
    workAuth: "Canadian citizen",
    email: "idobkin@gmail.com",
    linkedin: "https://www.linkedin.com/in/ilia-dobkin-8263343/",
    gitea: "https://git.levkin.ca",
    site: "https://sdet.levkin.ca",
    blurb:
      "Senior SDET with 20+ years in audit/financial software and regulated web, including real-money iGaming. Deep across Playwright, Swagger/OpenAPI contract testing, and performance baselines integrated into CI/CD. I treat automation as a personal discipline as much as a job: scripts, shortcuts, and agents that streamline my day so engineering effort goes where it matters. Strong instinct for stabilizing flaky suites, tightening quality gates, and removing manual regression effort wherever it lives.",
    headline:
      "Built 300+ Playwright E2E + 250+ API tests; parallel CI runs consistently above ~90% pass rate; manual regression effort cut by ~50%.",
  },

  // Master tag palette — used for the filter bar at top of sidebar
  tags: [
    "@playwright","@cypress","@selenium","@api","@contract","@ci","@docker","@terraform",
    "@cloud","@a11y","@perf","@bdd","@ai","@infra","@leadership"
  ],

  /**
   * Open spec files — drive the editor tab strip above the main pane.
   * Each test below carries a `spec` matching one of these ids, so the
   * sidebar / report / source can filter by the active spec.
   */
  specs: [
    { id: "portfolio",  file: "portfolio.spec.ts",  describe: "Ilia Dobkin · portfolio" },
    { id: "projects",   file: "projects.spec.ts",   describe: "Levkin · projects" },
    { id: "skills",     file: "skills.spec.ts",     describe: "Ilia Dobkin · skills" },
    { id: "playground", file: "playground.spec.ts", describe: "Ilia Dobkin · playground" },
  ],

  // The "test suite" — each entry maps to a section on the page
  suite: {
    name: "Ilia Dobkin · portfolio",
    tests: [
      {
        id: "about",
        spec: "portfolio",
        title: 'should introduce Ilia Dobkin',
        tags: ["@playwright","@leadership"],
        duration: 142,
        steps: [
          { kind: "info", title: 'navigate to /about', dur: 12 },
          { kind: "ok",   title: 'render bio',          dur: 48 },
          { kind: "ok",   title: 'assert credentials',  dur: 82 },
        ],
        render: renderAbout
      },
      {
        id: "experience",
        spec: "portfolio",
        title: 'should list senior SDET experience',
        tags: ["@playwright","@api","@ci","@cloud","@leadership"],
        duration: 1280,
        steps: [
          { kind: "ok", title: 'expect(roles.length).toBe(8)',          dur: 38 },
          { kind: "ok", title: 'assert chronological order',            dur: 24 },
          { kind: "ok", title: 'verify each role.bullets.length > 0',   dur: 96 },
        ],
        render: renderExperience
      },
      {
        id: "skills",
        spec: "skills",
        title: 'should expose @-tagged skills',
        tags: ["@playwright","@cypress","@selenium","@api","@bdd","@ci","@docker","@terraform","@cloud","@a11y","@perf","@ai"],
        duration: 412,
        steps: [
          { kind: "ok", title: 'load tag registry',  dur: 54 },
          { kind: "ok", title: 'assign proficiency', dur: 84 },
        ],
        render: renderSkills
      },
      {
        id: "projects",
        spec: "projects",
        title: 'should showcase self-hosted projects',
        tags: ["@infra","@ai","@playwright","@docker","@api"],
        duration: 680,
        steps: [
          { kind: "ok", title: 'discover proxmox homelab', dur: 120 },
          { kind: "ok", title: 'load atlas voice agent',   dur: 92 },
          { kind: "ok", title: 'verify llm council fan-out', dur: 80 },
        ],
        render: renderProjects
      },
      {
        id: "stack",
        spec: "skills",
        title: 'should describe daily stack',
        tags: ["@docker","@terraform","@infra","@ai"],
        duration: 320,
        steps: [
          { kind: "ok", title: 'list editors and runtimes', dur: 40 },
          { kind: "ok", title: 'list local LLM tools',      dur: 36 },
        ],
        render: renderStack
      },
      {
        id: "leadership",
        spec: "skills",
        title: 'should demonstrate quality leadership',
        tags: ["@leadership","@ci"],
        duration: 220,
        steps: [
          { kind: "ok", title: 'mentor coverage stats', dur: 60 },
          { kind: "ok", title: 'shift-left adoption',   dur: 90 },
        ],
        render: renderLeadership
      },
      {
        id: "metrics",
        spec: "skills",
        title: 'should report quality KPIs',
        tags: ["@ci","@perf"],
        duration: 96,
        steps: [
          { kind: "ok", title: 'compute pass-rate', dur: 22 },
          { kind: "ok", title: 'compute coverage',  dur: 48 },
        ],
        render: renderMetrics
      },
      {
        id: "resume",
        spec: "portfolio",
        title: 'should expose downloadable resume',
        tags: ["@playwright"],
        duration: 64,
        steps: [
          { kind: "ok", title: 'render resume',     dur: 24 },
          { kind: "ok", title: 'assert download',   dur: 18 },
        ],
        render: renderResume
      },
      {
        id: "contact",
        spec: "portfolio",
        title: 'should accept inbound contact',
        tags: ["@api"],
        duration: 88,
        steps: [
          { kind: "ok", title: 'expose email + linkedin', dur: 24 },
          { kind: "ok", title: 'assert reachable',        dur: 40 },
        ],
        render: renderContact
      },
      {
        id: "perf-budget",
        spec: "portfolio",
        title: 'should meet performance budget',
        skip: true,
        skipReason: "Lighthouse CI not wired — pending infra (see IDEAS.md)",
        tags: ["@perf","@ci"],
        duration: 0,
        steps: [
          { kind: "skip", title: 'run lighthouse --budget',            dur: 0 },
          { kind: "skip", title: 'assert LCP < 2.5s',                 dur: 0 },
          { kind: "skip", title: 'assert CLS < 0.1',                  dur: 0 },
        ],
        render: renderPerfBudget
      },
      {
        id: "response-time",
        spec: "portfolio",
        title: 'should match expected response time',
        fail: true,
        failMessage: `Error: expect(received).toBeLessThan(expected)

  Expected: < 200
  Received:   347

    at api.spec.ts:42:31
    → GET /api/v1/repos/ilia/portfolio  347 ms
    ────────────────────────────────────────
    Retry 1/2 … 312 ms  ✗
    Retry 2/2 … 289 ms  ✗

  Threshold: 200 ms · Actual p95: 316 ms
  Hint: latency spike — possibly cold-start or DNS`,
        tags: ["@api","@perf"],
        duration: 0,
        steps: [
          { kind: "ok",   title: 'navigate to Gitea API endpoint',  dur: 45 },
          { kind: "ok",   title: 'send GET /api/v1/repos/ilia/portfolio', dur: 62 },
          { kind: "ok",   title: 'assert status 200',               dur: 8 },
          { kind: "fail", title: 'expect(latency).toBeLessThan(200)', dur: 347 },
        ],
        render: renderResponseTime
      },
      {
        id: "vibe-check",
        spec: "playground",
        title: 'should pass the vibe check',
        tags: ["@playwright"],
        duration: 110,
        steps: [
          { kind: "info", title: 'await coffee.brew()',          dur: 18 },
          { kind: "ok",   title: "expect(mood).toBe('☕')",       dur: 32 },
          { kind: "ok",   title: 'expect(typing).toBeRhythmic',  dur: 60 },
        ],
        render: renderVibe
      },
    ]
  },

  experience: [
    {
      company: "Niyasoft Canada Inc.",
      role: "Senior Quality Assurance Automation Engineer",
      when: "Aug 2023 – Apr 2026",
      where: "Vaughan, ON · remote · full-time",
      stack: "Playwright, TypeScript, GitHub Actions, PostgreSQL, GCP",
      bullets: [
        "Built and maintained 300+ Playwright E2E tests and 250+ API/integration tests plus performance suites for a regulated online-casino platform; coverage spanned happy-path, negative, workflow, page-navigation, and network request/response checks across payments, wallet/cashier, game/lobby, and back-office flows — cutting manual regression effort by ~50% and catching regressions earlier in the pipeline.",
        "Stabilized the Playwright suite by replacing brittle waits with deterministic patterns and improving environment readiness; reduced flaky-test noise and maintained daily pass rates above ~90% across parallel CI stages.",
        "Validated responsible gaming and player protection end-to-end — deposit/loss/session limits, self-exclusion, cooling-off, reality checks — supporting compliance posture across licensed wagering markets.",
        "Ran compliance-sensitive scenarios for geo-eligibility with audit-friendly logging; traceability artifacts available for licensing reviews on demand.",
        "Optimized GitHub Actions pipelines (regression, functional, component, smoke) with parallelized stages and daily PR/review cadence, keeping feedback time short on a high-availability real-money stack.",
        "Monitored GCP metrics and alerts for API reliability; validated PostgreSQL-backed data integrity and prevented sev-1 incidents by catching performance regressions before release.",
        "Authored and enforced Swagger/OpenAPI contract tests against backend microservices, catching breaking schema changes before they reached downstream consumers."
      ]
    },
    {
      company: "RIOS Canada",
      role: "Software Development Engineer in Test (SDET)",
      when: "Jun 2022 – Jul 2023",
      where: "Toronto, ON · remote · contract",
      stack: "Cypress, JavaScript, Bitbucket CI, Swagger/OpenAPI, Ansible",
      bullets: [
        "Built Cypress E2E and API suites (Swagger/OpenAPI) from scratch across core product flows, including shared test data builders and fixture libraries — enabling every-commit CI checks and cutting manual regression time ~40% per release.",
        "Introduced AODA/WCAG accessibility checks (alt text, keyboard nav, contrast) into Bitbucket CI gates, preventing accessibility regressions across web and mobile releases.",
        "Automated test-environment provisioning with Ansible — disposable, repeatable setups that shortened spin-up time and eliminated pre-regression drift.",
        "Partnered with engineering and product on defect triage, risk-based prioritization, and pragmatic quality gates without blocking incremental delivery."
      ]
    },
    {
      company: "Attabotics",
      role: "QA Automation Developer",
      when: "Sep 2021 – May 2022",
      where: "Calgary, AB · remote · contract",
      stack: "SpecFlow, Gherkin, C#, .NET, Azure, Docker, SQL Server",
      bullets: [
        "Mentored developers on testable design and BDD best practices, improving scenario quality and reducing review churn on test PRs.",
        "Maintained 3,500+ SpecFlow/Gherkin scenarios with C# in .NET/Azure, owning flaky-test triage and keeping daily build stability above ~90% across the suite.",
        "Caught defects earlier and tightened Given/When/Then clarity by co-authoring scenarios with developers early in the sprint, shortening feedback from story to green build in a large Agile team (left-shift QA).",
        "Stood up Docker-based local and CI-aligned test environments; used SQL Server for data setup, assertions, and traceability across integrated warehouse-automation workflows."
      ]
    },
    {
      company: "Levkin Inc.",
      role: "Senior Software Developer",
      when: "Oct 2020 – Aug 2021",
      where: "Vaughan, ON · remote · contract",
      stack: "Playwright, GitLab CI/CD, Terraform, AWS S3, Grafana",
      bullets: [
        "Built reusable Playwright patterns that replaced arbitrary waits, measurably reducing suite flakiness and stabilizing CI runs.",
        "Audited and refactored legacy test and UI code; documented testing strategy and shared patterns across the team.",
        "Optimized GitLab CI/CD pipelines for speed and reliability; piped test and pipeline metrics into Grafana dashboards for release visibility.",
        "Provisioned AWS (S3) environments with Terraform, validated end-to-end, and promoted to dev via the team's release procedure.",
        "Introduced page object patterns and shared utility layer that cut new-test authoring time and improved cross-team consistency.",
        "Ongoing: self-hosted infrastructure lab and local-GPU AI projects — see Projects section."
      ]
    },
    {
      company: "Accountants Templates Inc.",
      role: "Senior Software Developer",
      when: "Aug 2019 – Aug 2020",
      where: "Calgary, AB · remote · contract",
      stack: "CaseWare/CaseView, build automation, scripting",
      earlier: true,
      bullets: [
        "CaseWare/CaseView template delivery with build/packaging scripts that cut release effort from ~8 hours to under 2 minutes."
      ]
    },
    {
      company: "MNP LLP",
      role: "Senior Application Developer 2",
      when: "Aug 2017 – Jun 2019",
      where: "Toronto, ON · remote · full-time",
      stack: "C#, .NET Core, Selenium, Cucumber, Jenkins, Azure DevOps",
      earlier: true,
      bullets: [
        ".NET development on CaseWare/CaseView with Selenium/Cucumber automation across Jenkins and Azure DevOps pipelines."
      ]
    },
    {
      company: "CaseWare International Inc.",
      role: "Software Developer",
      when: "Aug 2006 – Jun 2017",
      where: "Toronto, ON · hybrid · full-time",
      stack: "C#, .NET, SQL Server, SilkTest, Agile/Scrum",
      earlier: true,
      bullets: [
        "11 years of feature development, client templates, and SilkTest automation for global audit/financial systems; mentored juniors."
      ]
    },
    {
      company: "ROLI Consulting",
      role: "Web/Application Developer",
      when: "Jan 2001 – Jul 2012",
      where: "Vaughan, ON · remote · contract",
      stack: "Python, Twilio API, multi-stack web",
      earlier: true,
      bullets: [
        "Voice/SMS broadcasting service plus multi-stack web and technical consulting for nonprofits and SMBs."
      ]
    }
  ],

  skills: [
    { name: "**Test automation**: Playwright, Cypress, Selenium, SilkTest; UI, API, mobile, cross-browser; page object model, BDD", level: 96, tags: ["@playwright","@cypress","@selenium","@bdd","@api"] },
    { name: "**Domains**: regulated iGaming (real-money), audit & financial software, warehouse automation, accessibility-compliant web (AODA/WCAG)", level: 88, tags: ["@a11y"] },
    { name: "**Languages & frameworks**: TypeScript, JavaScript, C#, .NET, Python, Java, Bash/Shell, Node.js, ASP.NET, Spring Boot, HTML/CSS", level: 92, tags: [] },
    { name: "**CI/CD & DevOps**: GitHub Actions, GitLab, Bitbucket, Jenkins, Azure DevOps; Git, Terraform, Ansible, Docker, SonarQube, self-hosted runners", level: 92, tags: ["@ci","@docker","@terraform"] },
    { name: "**Cloud & infra**: AWS (Lambda, S3), Azure, GCP; Linux administration, Proxmox, Caddy, TrueNAS, Vaultwarden", level: 84, tags: ["@cloud","@infra"] },
    { name: "**Observability & performance**: Grafana, Prometheus, Sentry, DataDog, Artillery, k6, JMeter, metrics & logging", level: 86, tags: ["@perf"] },
    { name: "**Data & domain**: PostgreSQL, SQL Server, MySQL, DB2, Informatica/ETL", level: 78, tags: [] },
    { name: "**QA testing types**: unit, integration, regression, smoke, exploratory, load, stress, end-to-end; API testing (Postman); accessibility (AODA/WCAG); contract testing (Swagger/OpenAPI)", level: 90, tags: ["@api","@a11y","@contract","@perf"] },
    { name: "**QA process**: BDD, risk-based prioritization, defect triage, quality gates, flaky-suite stabilization, shift-left QA, Agile/Scrum, Jira", level: 88, tags: ["@bdd","@leadership"] },
    { name: "**AI & LLM tooling**: AI-assisted engineering with Cursor and Claude Code; privacy-first local LLM usage; MCP servers and agent-based automation; GenAI-assisted test design and refactors", level: 82, tags: ["@ai"] },
  ],

  projects: [
    {
      name: "Self-Hosted Infrastructure Lab",
      tags: ["@infra","@docker","@ci"],
      stack: "Proxmox, Ansible, Caddy, TrueNAS, Gitea, SonarQube",
      desc: "Proxmox homelab (VMs/LXC) with Gitea, CI runners, Vaultwarden, Uptime Kuma, Mailcow, SonarQube — Ansible-provisioned, Caddy TLS, TrueNAS backups; patterns directly informed production DevOps decisions."
    },
    {
      name: "sdetProfile — Portfolio as Playwright Report",
      tags: ["@playwright","@a11y"],
      stack: "HTML, CSS, vanilla JS, Playwright (tests), ESLint, Stylelint",
      desc: "Zero-framework personal portfolio styled as a Playwright test runner — sidebar explorer, editor tabs, trace/network/source panels, tag filtering, keyboard shortcuts, and theme cycling (dark/light/WCAG AAA); 37 real Playwright specs verify the live site."
    },
    {
      name: "Atlas — Local Voice Agent",
      tags: ["@ai","@infra","@playwright"],
      stack: "Python, MCP, ASR/TTS, local LLM (RTX), Playwright",
      desc: "Privacy-focused home voice assistant with on-device AI transcription and tool use — Python, local GPU inference, no third-party model APIs; wired into calendar and home automation."
    },
    {
      name: "AtAnyRate — Event-Driven Pricing",
      tags: ["@playwright","@api","@docker"],
      stack: "Python, Playwright, Telegram Bot API, Ticketmaster/SeatGeek APIs, Docker",
      desc: "Python app that identifies Toronto events likely to spike Airbnb demand, sends Telegram alerts, and optionally adjusts nightly prices via Playwright browser automation."
    },
    {
      name: "LLM Council — Multi-Model Chat UI",
      tags: ["@ai"],
      stack: "Python, FastAPI, httpx, React, Vite, Ollama/vLLM",
      desc: "Local web UI that fans each prompt to multiple LLMs and presents side-by-side responses — Python backend, diverse model voting for higher-confidence answers."
    }
  ],

  stack: {
    Editors: ["Cursor", "VS Code", "iTerm2"],
    Languages: ["TypeScript","JavaScript","Python","C#","Bash"],
    Testing: ["Playwright","Cypress","Selenium","Postman","k6","Artillery","JMeter"],
    CI: ["GitHub Actions","GitLab","Jenkins","Azure DevOps","Bitbucket"],
    Infra: ["Docker","Proxmox","Terraform","Ansible","Caddy","TrueNAS"],
    AI: ["Cursor","Claude Code","Perplexity","Ollama (local)","MCP servers"]
  },

  metrics: [
    { label: "Playwright E2E tests authored", value: "300+" },
    { label: "API / integration tests",        value: "250+" },
    { label: "Parallel CI daily pass rate",    value: "≈ 90%+" },
    { label: "Manual regression reduction",    value: "≈ 50%" },
    { label: "SpecFlow scenarios maintained",  value: "3,500+" },
    { label: "Years shipping software",        value: "20+" }
  ],

  /**
   * Public repos on git.levkin.ca — descriptions from Gitea API when set,
   * otherwise first paragraph of README (see scripts/fetch-gitea-repos.mjs).
   * API lists all 19 repos on one page (explore UI may paginate).
   */
  giteaRepos: [
    { full_name: "ilia/ansible", name: "ansible", html_url: "https://git.levkin.ca/ilia/ansible", language: "Makefile", description: "Ansible automation for development machines, service hosts, and Proxmox-managed guests (LXC-first, with a path for KVM VMs)." },
    { full_name: "ilia/AtAnyRate", name: "AtAnyRate", html_url: "https://git.levkin.ca/ilia/AtAnyRate", language: "Python", description: "Local Python application that identifies upcoming Toronto events likely to increase Airbnb demand, sends Telegram alerts, and optionally adjusts nightly prices via Playwright automation." },
    { full_name: "ilia/atlas", name: "atlas", html_url: "https://git.levkin.ca/ilia/atlas", language: "Python", description: "Atlas is a local, privacy-focused home voice agent system — planning, architecture documentation, and kanban tickets for building the system." },
    { full_name: "ilia/crkl", name: "crkl", html_url: "https://git.levkin.ca/ilia/crkl", language: "Kotlin", description: "Privacy-first Android AI assistant — circle or touch any element on-screen; on-device AI transcribes, summarizes, explains, or drafts responses." },
    { full_name: "ilia/dotfiles", name: "dotfiles", html_url: "https://git.levkin.ca/ilia/dotfiles", language: "", description: "Dotfiles and shell configuration for dev machines." },
    { full_name: "ilia/hilitehero", name: "hilitehero", html_url: "https://git.levkin.ca/ilia/hilitehero", language: "Python", description: "Python tool for extracting highlighted text from PDFs with precise ordering and hyphenation handling." },
    { full_name: "ilia/invoice", name: "invoice", html_url: "https://git.levkin.ca/ilia/invoice", language: "JavaScript", description: "CLI for generating professional PDF invoices from JSON — interactive and non-interactive modes with preview-first workflow." },
    { full_name: "ilia/Jobber", name: "Jobber", html_url: "https://git.levkin.ca/ilia/Jobber", language: "TypeScript", description: "Self-hosted job search orchestration — discover roles, score fit, draft resumes and cover letters, export PDFs, track email; you submit applications yourself." },
    { full_name: "ilia/kanban", name: "kanban", html_url: "https://git.levkin.ca/ilia/kanban", language: "", description: "Kanban board project on self-hosted Gitea." },
    { full_name: "ilia/linkedout", name: "linkedout", html_url: "https://git.levkin.ca/ilia/linkedout", language: "JavaScript", description: "Job market intelligence platform with integrated AI-powered insights — modular architecture for extensibility." },
    { full_name: "ilia/llm_council", name: "llm_council", html_url: "https://git.levkin.ca/ilia/llm_council", language: "Python", description: "Local web UI like ChatGPT but sends each query to multiple LLMs — your \"LLM council\" votes with diverse models." },
    { full_name: "ilia/mirror_match", name: "mirror_match", html_url: "https://git.levkin.ca/ilia/mirror_match", language: "TypeScript", description: "Photo guessing game — upload photos, others guess who is in the picture for points. Next.js, PostgreSQL, NextAuth." },
    { full_name: "ilia/nanobot", name: "nanobot", html_url: "https://git.levkin.ca/ilia/nanobot", language: "Python", description: "Ultra-lightweight personal AI assistant (Python; published on PyPI as nanobot-ai)." },
    { full_name: "ilia/onboarding", name: "onboarding", html_url: "https://git.levkin.ca/ilia/onboarding", language: "Shell", description: "Developer environment setup — automates 60+ apps and tools plus Git and SSH configuration." },
    { full_name: "ilia/outreach", name: "outreach", html_url: "https://git.levkin.ca/ilia/outreach", language: "JavaScript", description: "Node.js email outreach for campaigns to law firms — templates, tracking, and tests." },
    { full_name: "ilia/POTE", name: "POTE", html_url: "https://git.levkin.ca/ilia/POTE", language: "Python", description: "Research-oriented tool for tracking and analyzing public stock trades by government officials." },
    { full_name: "ilia/profile", name: "profile", html_url: "https://git.levkin.ca/ilia/profile", language: "TypeScript", description: "Profile / personal site — TypeScript." },
    { full_name: "ilia/punimtag", name: "punimtag", html_url: "https://git.levkin.ca/ilia/punimtag", language: "TypeScript", description: "Modern photo management and facial recognition system." },
    { full_name: "ilia/resume", name: "resume", html_url: "https://git.levkin.ca/ilia/resume", language: "", description: "Résumé generator based on the best-resume-ever project." }
  ]
};

/* ----------- Section renderers ----------- */
function _esc(s){ return String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])); }
function _tags(arr){ return `<div class="card__tags">${arr.map(t=>`<span class="tag">${t}</span>`).join('')}</div>`; }

function renderAbout(){
  const p = PORTFOLIO.person;
  const authSuffix = p.workAuth ? ` · ${_esc(p.workAuth)}` : '';
  return `
    <div class="block">
      <p><strong>${p.title}</strong> · ${_esc(p.location)}${authSuffix}.</p>
      <p>${p.blurb}</p>
      <p><em style="color:var(--accent);font-style:normal">▸</em> ${p.headline}</p>
      <div class="snippet"><div class="ln">1
2
3
4</div><div class="code"><span class="cm">// portfolio.spec.ts</span>
<span class="kw">import</span> { test, expect } <span class="kw">from</span> <span class="str">'@playwright/test'</span>;
<span class="kw">test</span>(<span class="str">'ilia is a senior SDET'</span>, <span class="kw">async</span> ({ page }) => {
  <span class="kw">await</span> expect(page.getByRole(<span class="str">'heading'</span>, { name: <span class="str">/ilia dobkin/i</span> })).toBeVisible();
});</div></div>
      <div class="cta-row">
        <a class="cta" href="mailto:${p.email}">contact()</a>
        <a class="cta cta--ghost" href="${p.linkedin}" target="_blank" rel="noopener">linkedin.profile</a>
      </div>
    </div>`;
}

function renderExperience(){
  const exp = PORTFOLIO.experience;
  let earlierEmitted = false;
  return `<div class="block">${
    exp.map((e)=>{
      let header = '';
      if (e.earlier && !earlierEmitted) {
        earlierEmitted = true;
        header = `<h4 style="margin-top:18px;letter-spacing:.04em;color:var(--text-3);font-family:var(--font-mono);font-size:12px;text-transform:uppercase">// earlier career — 2001 – 2020</h4>`;
      }
      const meta = [e.role, e.when, e.where].filter(Boolean).map(_esc).join(' · ');
      const stack = e.stack
        ? `<p style="font-family:var(--font-mono);font-size:11px;color:var(--text-4);margin:0 0 6px;line-height:1.5"><span style="color:var(--accent)">stack:</span> ${_esc(e.stack)}</p>`
        : '';
      return `
      ${header}
      <h4>${_esc(e.company)}</h4>
      ${meta ? `<p style="font-family:var(--font-mono);font-size:11.5px;color:var(--text-3);margin:2px 0 4px;line-height:1.45">${meta}</p>` : ''}
      ${stack}
      <ul>${e.bullets.map(b=>`<li>${_esc(b)}</li>`).join('')}</ul>
    `;
    }).join('')
  }</div>`;
}

function renderSkills(){
  return `<div class="block"><div class="skills">${
    PORTFOLIO.skills.map(s=>`
      <div class="skill">
        <div>
          <div class="skill__name">${s.name.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')}</div>
          ${s.tags.length?`<div class="card__tags" style="margin-top:6px">${s.tags.map(t=>`<span class="tag">${t}</span>`).join('')}</div>`:''}
        </div>
        <div>
          <div class="skill__bar"><div class="skill__fill" data-pct="${s.level}"></div></div>
          <div class="skill__pct">${s.level}%</div>
        </div>
      </div>`).join('')
  }</div></div>`;
}

function renderProjects(){
  return `<div class="block"><div class="cards">${
    PORTFOLIO.projects.map(p=>`
      <div class="card">
        <h5>${_esc(p.name)}</h5>
        ${p.stack ? `<p style="font-family:var(--font-mono);font-size:11px;color:var(--text-4);margin:2px 0 6px"><span style="color:var(--accent)">stack:</span> ${_esc(p.stack)}</p>` : ''}
        <p>${_esc(p.desc)}</p>
        ${_tags(p.tags)}
      </div>`).join('')
  }</div>
    <p class="projects-foot">Public code on <a href="https://git.levkin.ca/explore/repos" target="_blank" rel="noopener">git.levkin.ca</a> — open the <button type="button" class="tab-link" data-tab="network">Network</button> tab for an API-style request list.</p>
  </div>`;
}

function renderStack(){
  return `<div class="block">${
    Object.entries(PORTFOLIO.stack).map(([k,v])=>`
      <h4>${k}</h4>
      <div class="card__tags">${v.map(x=>`<span class="tag">${x}</span>`).join('')}</div>
    `).join('')
  }</div>`;
}

function renderLeadership(){
  return `<div class="block">
    <h4>Mentoring & strategy</h4>
    <ul>
      <li>Mentored junior developers and QA engineers across CaseWare, MNP, and Niyasoft — conventions, debugging, code review.</li>
      <li>Authored test strategy docs and reusable patterns adopted team-wide.</li>
      <li>Partner with product/engineering on release risk and pragmatic quality gates that don't block delivery.</li>
    </ul>
    <h4>Shift-left in practice</h4>
    <ul>
      <li>Co-author scenarios with developers early in the sprint, tightening Given/When/Then clarity before code is merged.</li>
      <li>Wire accessibility and contract checks into PR gates so quality lives left of the pipeline, not at the end.</li>
    </ul>
  </div>`;
}

function renderMetrics(){
  return `<div class="block"><div class="cards">${
    PORTFOLIO.metrics.map(m=>`
      <div class="card">
        <h5 style="font-size:28px;color:var(--accent);margin-bottom:6px">${_esc(m.value)}</h5>
        <p style="color:var(--text-3)">${_esc(m.label)}</p>
      </div>`).join('')
  }</div></div>`;
}

function renderResume(){
  return `<div class="block">
    <p>PDF resume — the same file used for applications.</p>
    <div class="cta-row">
      <button class="cta" id="dl-resume">⇩ download resume.pdf</button>
      <button class="cta cta--ghost" id="print-resume">open in tab</button>
    </div>
    <p style="color:var(--text-4);font-size:11.5px;font-family:var(--font-mono);margin-top:10px">// opens the PDF for viewing or printing from the browser</p>
  </div>`;
}

function renderContact(){
  const p = PORTFOLIO.person;
  return `<div class="block"><div class="contact-grid">
    <div class="contact-cell"><label>email</label><a href="mailto:${p.email}">${p.email}</a></div>
    <div class="contact-cell"><label>linkedin</label><a href="${p.linkedin}" target="_blank" rel="noopener">in/idobkin</a></div>
    <div class="contact-cell"><label>gitea (self-hosted)</label><a href="${p.gitea}" target="_blank" rel="noopener">git.levkin.ca</a></div>
    <div class="contact-cell"><label>site</label><a href="${p.site}" target="_blank" rel="noopener">sdet.levkin.ca</a></div>
    <div class="contact-cell"><label>location</label>${_esc(p.location)}${p.workAuth ? ` · ${_esc(p.workAuth)}` : ''}</div>
  </div></div>`;
}

function renderPerfBudget(){
  return `<div class="block">
    <p style="color:var(--skip)">Lighthouse CI not wired — pending infra (see IDEAS.md)</p>
    <p>Once connected, this test will assert Core Web Vitals on every deploy: LCP&lt;2.5s, CLS&lt;0.1, TBT&lt;200ms.</p>
  </div>`;
}

function renderResponseTime(){
  return `<div class="block">
    <p>The Gitea API endpoint <code>GET /api/v1/repos/ilia/portfolio</code> exceeded the <strong>200 ms</strong> latency budget three times in a row.</p>
    <h4>What happened</h4>
    <ul>
      <li>Initial request returned in <strong>347 ms</strong> — likely a cold-start on the VPS.</li>
      <li>Retry 1: <strong>312 ms</strong>, Retry 2: <strong>289 ms</strong> — trending down but still above threshold.</li>
      <li>The p95 across the three attempts was <strong>316 ms</strong>.</li>
    </ul>
    <h4>Possible fixes</h4>
    <ul>
      <li>Add a keep-alive cron to prevent cold-starts.</li>
      <li>Enable response caching on the reverse proxy.</li>
      <li>Raise the threshold to 350 ms if p50 is acceptable.</li>
    </ul>
    <div class="snippet"><div class="ln">1
2
3
4
5
6</div><div class="code"><span class="cm">// api.spec.ts:42</span>
<span class="kw">const</span> res = <span class="kw">await</span> request.get(<span class="str">'/api/v1/repos/ilia/portfolio'</span>);
<span class="kw">const</span> latency = res.headers[<span class="str">'x-response-time'</span>];
expect(res.status()).toBe(<span class="num">200</span>);
expect(Number(latency)).toBeLessThan(<span class="num">200</span>);
<span class="cm">// ✗ Expected: &lt; 200 · Received: 347</span></div></div>
  </div>`;
}

function renderVibe(){
  return `<div class="block">
    <p><code>playground.spec.ts</code> is reserved for interactive demos and small experiments — the things that don't quite belong in the resume but make this site fun to poke at.</p>
    <h4>On the runway</h4>
    <ul>
      <li><strong>Real Playwright tests of this site</strong> — meta, self-referential, satisfying. The runner that <em>looks</em> like a Playwright report becomes one that <em>is</em> verified by Playwright.</li>
      <li><strong>Recording mode</strong> — MediaRecorder API captures a 20s Run-All clip you can drop into Slack.</li>
      <li><strong>Narrative replay</strong> — click a tag, watch the runner play that storyline end-to-end.</li>
      <li><strong>Konami easter egg</strong> — because every test runner deserves one.</li>
    </ul>
    <div class="snippet"><div class="ln">1
2
3
4
5</div><div class="code"><span class="cm">// playground.spec.ts</span>
<span class="kw">test</span>(<span class="str">'should pass the vibe check'</span>, <span class="kw">async</span> ({ page }) =&gt; {
  <span class="kw">const</span> coffee = <span class="kw">await</span> kitchen.brew();
  <span class="kw">await</span> expect(coffee.temperature).toBeWithinRange(<span class="num">63</span>, <span class="num">68</span>);
});</div></div>
  </div>`;
}
