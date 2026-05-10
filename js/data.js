/* data.js — single source of truth for the portfolio "test suite" */
window.PORTFOLIO = {
  person: {
    first: "Ilia",
    last: "Dobkin",
    title: "Senior SDET",
    location: "Toronto, Ontario, Canada",
    email: "idobkin@gmail.com",
    phone: "+1 (647) 987-2792",
    linkedin: "https://www.linkedin.com/in/idobkin/",
    gitea: "https://git.levkin.ca",
    site: "https://iliadobkin.com",
    blurb:
      "Senior SDET with 20+ years delivering automation and release confidence for audit/financial software and regulated web (including real-money iGaming). Owns E2E and API test strategy — Playwright, Cypress, Selenium — contract testing against Swagger/OpenAPI, and performance baselines, integrated into CI/CD for fast, reliable feedback.",
    headline:
      "Built 300+ Playwright E2E + 250+ API tests; parallel CI runs consistently above ~95% pass rate; manual regression effort cut by ~50%.",
  },

  // Master tag palette — used for the filter bar at top of sidebar
  tags: [
    "@playwright","@cypress","@selenium","@api","@ci","@docker","@terraform",
    "@cloud","@a11y","@perf","@bdd","@ai","@infra","@leadership"
  ],

  // The "test suite" — each entry maps to a section on the page
  suite: {
    name: "Ilia Dobkin · portfolio",
    tests: [
      {
        id: "about",
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
        title: 'should showcase self-hosted projects',
        tags: ["@infra","@ai","@playwright","@docker"],
        duration: 680,
        steps: [
          { kind: "ok", title: 'discover proxmox homelab', dur: 120 },
          { kind: "ok", title: 'validate MCP server',      dur: 80 },
        ],
        render: renderProjects
      },
      {
        id: "stack",
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
        title: 'should accept inbound contact',
        tags: ["@api"],
        duration: 88,
        steps: [
          { kind: "ok", title: 'expose email + linkedin', dur: 24 },
          { kind: "ok", title: 'assert reachable',        dur: 40 },
        ],
        render: renderContact
      },
    ]
  },

  experience: [
    {
      company: "Niyasoft Canada Inc.",
      role: "Senior QA Automation Engineer",
      when: "Aug 2023 – Apr 2026",
      where: "Vaughan, ON · remote · full-time",
      bullets: [
        "Built & maintained 300+ Playwright E2E tests and 250+ API/integration tests plus performance suites for a regulated online-casino platform; coverage spanned happy-path, negative, workflow, page-navigation, and network request/response checks across payments, wallet/cashier, game/lobby, and back-office flows — cutting manual regression effort by ~50%.",
        "Stabilized the Playwright suite by replacing brittle waits with deterministic patterns and improving environment readiness, keeping daily pass rates consistently above ~95% across parallel CI stages.",
        "Validated responsible-gaming end-to-end — deposit/loss/session limits, self-exclusion, cooling-off, reality checks — supporting compliance posture across licensed wagering markets.",
        "Ran compliance-sensitive geo-eligibility scenarios with audit-friendly logging; traceability artifacts available for licensing reviews on demand.",
        "Optimized GitHub Actions pipelines (regression, functional, component, smoke) with parallelized stages and daily PR cadence on a high-availability real-money stack.",
        "Monitored GCP metrics and validated PostgreSQL-backed data integrity; prevented sev-1 incidents by catching performance regressions before release."
      ]
    },
    {
      company: "RIOS Canada",
      role: "Software Development Engineer in Test (SDET)",
      when: "Jun 2022 – Jul 2023",
      where: "Toronto, ON · remote · contract",
      bullets: [
        "Built Cypress E2E and API suites (Swagger/OpenAPI) from scratch across core product flows; enabled every-commit CI checks and cut manual regression time ~40% per release.",
        "Introduced AODA/WCAG accessibility checks (alt text, keyboard nav, contrast) into Bitbucket CI gates, preventing accessibility regressions across web and mobile releases.",
        "Automated test-environment provisioning with Ansible — disposable, repeatable setups that shortened spin-up and eliminated pre-regression drift.",
        "Partnered with engineering and product on defect triage, risk-based prioritization, and pragmatic quality gates without blocking incremental delivery."
      ]
    },
    {
      company: "Attabotics",
      role: "QA Automation Developer",
      when: "Sep 2021 – May 2022",
      where: "Calgary, AB · remote · contract",
      bullets: [
        "Maintained 3,500+ SpecFlow/Gherkin scenarios with C# in .NET/Azure; owned flaky-test triage and kept daily build stability above ~90%.",
        "Practiced left-shift QA in a large Agile team — co-authored scenarios with developers early in the sprint, tightening Given/When/Then clarity.",
        "Stood up Docker-based local and CI-aligned test environments; used SQL Server for data setup, assertions, and traceability across integrated warehouse-automation workflows."
      ]
    },
    {
      company: "Levkin Inc.",
      role: "Senior Software Developer",
      when: "Oct 2020 – Aug 2021",
      where: "Vaughan, ON · remote · contract",
      bullets: [
        "Built reusable Playwright building blocks with deterministic patterns, eliminating arbitrary waits and measurably reducing suite flakiness.",
        "Audited and refactored legacy test and UI code; documented testing strategy and shared patterns across the team.",
        "Optimized GitLab CI/CD pipelines; piped test and pipeline metrics into Grafana dashboards for release visibility.",
        "Provisioned AWS (S3) environments with Terraform, validated end-to-end, and promoted to dev via the team's release procedure.",
        "Ongoing: self-hosted infrastructure lab and local-GPU AI assistant under the Levkin brand — see Projects."
      ]
    },
    {
      company: "Accountants Templates Inc.",
      role: "Senior Software Developer",
      when: "Aug 2019 – Aug 2020",
      where: "Calgary, AB · remote · contract",
      bullets: [
        "Owned CaseWare/CaseView template delivery including compliance updates, standards-driven releases, and documentation for internal and client use.",
        "Reviewed software for improvements and implemented recommendations; collaborated with support on reported issues.",
        "Automated build and packaging workflows, compressing ~8 hours of manual release effort to under 2 minutes per cycle."
      ]
    },
    {
      company: "MNP LLP",
      role: "Senior Application Developer 2",
      when: "Aug 2017 – Jun 2019",
      where: "Toronto, ON · remote · full-time",
      bullets: [
        "Developed and maintained C#, .NET, .NET Core applications integrating with CaseWare/CaseView; extended with JavaScript where specs required.",
        "Contributed automation strategy and hands-on Selenium/Cucumber work; managed Jenkins triggers, Cucumber reporting, and Azure DevOps pipelines."
      ]
    },
    {
      company: "CaseWare International Inc.",
      role: "Software Developer",
      when: "Aug 2006 – Jun 2017",
      where: "Toronto, ON · hybrid · full-time",
      bullets: [
        "Delivered features, defect fixes, and client templates (JavaScript, HTML, YUI, jQuery, CSS) for global financial/audit systems; automated validation with SilkTest.",
        "Mentored junior developers on conventions, debugging, and code review; built reusable JS libraries; Agile Scrum, Jira, Git."
      ]
    },
    {
      company: "ROLI Consulting",
      role: "Web/Application Developer",
      when: "Jan 2001 – Jul 2012",
      where: "Vaughan, ON · remote · part-time",
      bullets: [
        "Voice broadcasting and SMS service (Python, Twilio API); websites across multiple stacks; technical consulting for nonprofits and SMBs."
      ]
    },
    {
      company: "Earlier Career — Kaboose · Coutts · EDS/Scotiabank",
      role: "QA Automation · Java Developer · ETL Co-op",
      when: "May 2005 – Aug 2006",
      where: "Toronto, ON",
      bullets: [
        "QA automation with QTP/Quality Center, cross-browser and end-to-end testing, and UAT support (Kaboose); Java/J2EE development (Coutts); Informatica ETL co-op on AIX/DB2 (EDS/Scotiabank)."
      ]
    }
  ],

  skills: [
    { name: "Test automation: Playwright, Cypress, Selenium, SilkTest; UI, API, mobile, cross-browser; POM, BDD", level: 96, tags: ["@playwright","@cypress","@selenium","@bdd","@api"] },
    { name: "Languages & frameworks: TypeScript, JavaScript, C#, .NET, Python, Java, Bash, Node.js", level: 92, tags: [] },
    { name: "CI/CD & DevOps: GitHub Actions, GitLab, Bitbucket, Jenkins, Azure DevOps; Git, Terraform, Ansible, Docker", level: 92, tags: ["@ci","@docker","@terraform"] },
    { name: "Cloud & infra: AWS, Azure, GCP; Linux administration, Proxmox, Caddy, TrueNAS", level: 84, tags: ["@cloud","@infra"] },
    { name: "Observability & performance: Grafana, Prometheus, Sentry, DataDog, Artillery, k6, JMeter", level: 86, tags: ["@perf"] },
    { name: "Data & domain: PostgreSQL, SQL Server, MySQL, DB2; CaseWare/CaseView, audit & financial software", level: 78, tags: [] },
    { name: "QA practices: BDD (SpecFlow, Cucumber), API testing (Postman, OpenAPI), accessibility (AODA/WCAG), risk-based testing, flaky-suite stabilization", level: 90, tags: ["@bdd","@a11y","@api"] },
    { name: "Leadership & collaboration: mentoring, test strategy & docs, partnering with product/engineering on release risk and pragmatic gates", level: 84, tags: ["@leadership"] },
    { name: "AI & LLM tooling: Cursor, local LLM, MCP servers, Copilot, Claude Code, Perplexity; GenAI-assisted test design", level: 82, tags: ["@ai"] },
    { name: "Tooling & workflows: code review, trunk-based, feature flags, canary releases, observability-driven debugging", level: 78, tags: ["@ci"] },
  ],

  projects: [
    {
      name: "Levkin — Self-Hosted Infrastructure Lab",
      tags: ["@infra","@docker","@ci"],
      desc: "Proxmox-based homelab (VMs/LXC) running Gitea + CI runners, Vaultwarden, Vikunja, Uptime Kuma, Mailcow, Listmonk, n8n, SonarQube — provisioned via Ansible with Caddy edge TLS and TrueNAS backups. Full Linux admin: multi-domain DNS, firewall hardening, monitoring, repeatable deploys. Patterns directly informed production DevOps decisions in later roles."
    },
    {
      name: "Levkin — Privacy-First Local AI Assistant",
      tags: ["@ai","@infra"],
      desc: "Tool-using assistant wired into mail & calendars (triage, drafts, scheduling) on local GPU inference — prompts and context stay on-LAN, no SaaS LLMs. Composable with homelab identity, TLS, secrets, and automation so event-driven workflows hand off without third-party model APIs."
    },
    {
      name: "Levkin — Playwright MCP Server",
      tags: ["@ai","@playwright"],
      desc: "MCP server developers use from Cursor and other MCP-capable assistants while writing Playwright tests — surfaces selectors, fixtures, and in-repo conventions so generated specs stay aligned with team patterns."
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
    { label: "Parallel CI daily pass rate",    value: "≈ 95%+" },
    { label: "Manual regression reduction",    value: "≈ 50%" },
    { label: "SpecFlow scenarios maintained",  value: "3,500+" },
    { label: "Years shipping software",        value: "20+" }
  ]
};

/* ----------- Section renderers ----------- */
function _esc(s){ return String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])); }
function _tags(arr){ return `<div class="card__tags">${arr.map(t=>`<span class="tag">${t}</span>`).join('')}</div>`; }

function renderAbout(){
  const p = PORTFOLIO.person;
  return `
    <div class="block">
      <p><strong>${p.title}</strong> based in ${p.location}.</p>
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
  return `<div class="block">${
    PORTFOLIO.experience.map((e,i)=>`
      <h4>${_esc(e.company)} <span style="color:var(--text-4);font-weight:400">— ${_esc(e.role)}</span></h4>
      <p style="font-family:var(--font-mono);font-size:11.5px;color:var(--text-3);margin:2px 0 6px">${_esc(e.when)} · ${_esc(e.where)}</p>
      <ul>${e.bullets.map(b=>`<li>${_esc(b)}</li>`).join('')}</ul>
    `).join('')
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
        <p>${_esc(p.desc)}</p>
        ${_tags(p.tags)}
      </div>`).join('')
  }</div></div>`;
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
    <p>Full PDF resume — generated from this same source of truth.</p>
    <div class="cta-row">
      <button class="cta" id="dl-resume">⇩ download resume.pdf</button>
      <button class="cta cta--ghost" id="print-resume">print()</button>
    </div>
    <p style="color:var(--text-4);font-size:11.5px;font-family:var(--font-mono);margin-top:10px">// resume renders inline using the print stylesheet — try ⌘P</p>
  </div>`;
}

function renderContact(){
  const p = PORTFOLIO.person;
  return `<div class="block"><div class="contact-grid">
    <div class="contact-cell"><label>email</label><a href="mailto:${p.email}">${p.email}</a></div>
    <div class="contact-cell"><label>phone</label>${p.phone}</div>
    <div class="contact-cell"><label>linkedin</label><a href="${p.linkedin}" target="_blank" rel="noopener">in/idobkin</a></div>
    <div class="contact-cell"><label>gitea (self-hosted)</label><a href="${p.gitea}" target="_blank" rel="noopener">git.levkin.ca</a></div>
    <div class="contact-cell"><label>site</label><a href="${p.site}" target="_blank" rel="noopener">iliadobkin.com</a></div>
    <div class="contact-cell"><label>location</label>${p.location}</div>
  </div></div>`;
}
