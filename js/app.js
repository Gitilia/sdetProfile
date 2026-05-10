/* app.js — Playwright-runner UI behavior */
(function(){
  const $  = (sel,root=document)=>root.querySelector(sel);
  const $$ = (sel,root=document)=>Array.from(root.querySelectorAll(sel));
  const data = window.PORTFOLIO;
  const tests = data.suite.tests;

  // Test state: idle | running | passed
  const state = Object.fromEntries(tests.map(t=>[t.id, { status:'idle', runtime:0 }]));
  let isRunningAll = false;
  let activeTimers = [];
  const headed = () => $('#headed').checked;

  // ============ ICONS ============
  const ICONS = {
    play:  '<svg viewBox="0 0 16 16"><path d="M5 3 L12 8 L5 13 Z" fill="currentColor"/></svg>',
    check: '<svg viewBox="0 0 16 16"><path d="M3.5 8 L7 11.5 L13 5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    dot:   '<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="2.6" fill="currentColor"/></svg>',
    spin:  '<svg viewBox="0 0 16 16" class="spin"><circle cx="8" cy="8" r="5.5" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="20 12" stroke-linecap="round"/></svg>',
    chev:  '<svg viewBox="0 0 16 16"><path d="M6 4 L10 8 L6 12" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    rerun: '<svg viewBox="0 0 16 16"><path d="M12.5 6A4.5 4.5 0 1 1 8 3.5" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M12 2 L13 6 L9 6" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  };
  function statusIcon(s){
    if (s==='running') return ICONS.spin;
    if (s==='passed')  return ICONS.check;
    return ICONS.dot;
  }
  function statusClass(s){
    if (s==='running') return 'icon--run';
    if (s==='passed')  return 'icon--pass';
    return 'icon--idle';
  }

  // Format test title with syntax highlight
  function titleHTML(t){
    return `<span class="kw">test</span>(<span class="str">'${t.title}'</span>)`;
  }

  // ============ SIDEBAR (tree) ============
  function renderTree(){
    const wrap = $('#tree');
    wrap.innerHTML = `
      <div class="suite" data-suite>
        <div class="suite__head">
          <span class="suite__caret">${ICONS.chev}</span>
          <span class="suite__name"><span class="kw">describe</span>(<em>'${data.suite.name}'</em>)</span>
        </div>
        ${tests.map(renderTreeTest).join('')}
      </div>`;

    wrap.addEventListener('click', e=>{
      const head = e.target.closest('.suite__head');
      if (head) { head.parentElement.classList.toggle('collapsed'); return; }
      const runBtn = e.target.closest('.test__run');
      if (runBtn) { e.stopPropagation(); runTest(runBtn.dataset.id); return; }
      const row = e.target.closest('.test');
      if (row) { selectTest(row.dataset.id, true); }
    });
  }
  function renderTreeTest(t){
    const s = state[t.id];
    return `
      <div class="test ${s.status==='running'?'is-running':''} ${s.status==='passed'?'is-passed':''}" data-id="${t.id}" data-tags="${t.tags.join(' ')}">
        <button class="test__run" data-id="${t.id}" title="Run">${ICONS.play}</button>
        <span class="test__icon ${statusClass(s.status)}">${statusIcon(s.status)}</span>
        <span class="test__title">${titleHTML(t)}</span>
        <span class="test__dur">${s.runtime?formatMs(s.runtime):''}</span>
        <div class="test__tags">${t.tags.map(x=>`<span class="tag">${x}</span>`).join('')}</div>
      </div>`;
  }
  function refreshTreeRow(id){
    const t = tests.find(x=>x.id===id);
    const s = state[id];
    const row = $(`.test[data-id="${id}"]`);
    if (!row) return;
    row.classList.toggle('is-running', s.status==='running');
    row.classList.toggle('is-passed',  s.status==='passed');
    const iconEl = row.querySelector('.test__icon');
    iconEl.className = `test__icon ${statusClass(s.status)}`;
    iconEl.innerHTML = statusIcon(s.status);
    row.querySelector('.test__dur').textContent = s.runtime?formatMs(s.runtime):'';
  }

  // ============ TAG BAR ============
  let activeTags = new Set();
  function renderTagBar(){
    const bar = $('#tag-bar');
    bar.innerHTML = data.tags.map(t=>`<span class="tag" data-tag="${t}">${t}</span>`).join('');
    bar.addEventListener('click', e=>{
      const el = e.target.closest('.tag'); if (!el) return;
      const tag = el.dataset.tag;
      if (activeTags.has(tag)) activeTags.delete(tag);
      else activeTags.add(tag);
      bar.querySelectorAll('.tag').forEach(t=>{
        t.classList.toggle('is-active', activeTags.has(t.dataset.tag));
      });
      // Reflect into grep input
      $('#grep').value = Array.from(activeTags).join(' ');
      applyFilter();
    });
  }

  function applyFilter(){
    const grep = $('#grep').value.trim().toLowerCase();
    const wantedTags = grep.split(/\s+/).filter(s=>s.startsWith('@'));
    const text = grep.replace(/@\S+/g,'').trim();
    $$('.test').forEach(row=>{
      const id = row.dataset.id;
      const t  = tests.find(x=>x.id===id);
      const tagsOK = wantedTags.length===0 || wantedTags.every(tg => t.tags.includes(tg));
      const textOK = !text || t.title.toLowerCase().includes(text) || id.includes(text);
      row.style.display = (tagsOK && textOK) ? '' : 'none';
    });
  }

  // ============ MAIN PANE RESULTS ============
  function renderResults(){
    const wrap = $('#results');
    wrap.innerHTML = tests.map(t=>{
      const s = state[t.id];
      return `
      <article class="result" id="result-${t.id}" data-id="${t.id}">
        <div class="result__head">
          <span class="result__caret">${ICONS.chev}</span>
          <span class="result__status ${statusClass(s.status)}">${statusIcon(s.status)}</span>
          <span class="result__title">${titleHTML(t)}</span>
          <span class="result__dur">${s.runtime?formatMs(s.runtime):''}</span>
          <button class="result__rerun" title="Run / re-run" data-id="${t.id}">${ICONS.rerun}</button>
        </div>
        <div class="progress"><div class="progress__bar" id="bar-${t.id}"></div></div>
        <div class="result__body" id="body-${t.id}"></div>
      </article>`;
    }).join('');

    wrap.addEventListener('click', e=>{
      const rerun = e.target.closest('.result__rerun');
      if (rerun) { e.stopPropagation(); runTest(rerun.dataset.id); return; }
      const head = e.target.closest('.result__head');
      if (head) {
        const art = head.parentElement;
        const id = art.dataset.id;
        // If passed, toggle. If idle, run it.
        if (state[id].status === 'idle') { runTest(id); }
        else { art.classList.toggle('is-open'); }
      }
    });
  }
  function refreshResultRow(id){
    const t = tests.find(x=>x.id===id);
    const s = state[id];
    const art = $(`#result-${id}`);
    if (!art) return;
    const ico = art.querySelector('.result__status');
    ico.className = `result__status ${statusClass(s.status)}`;
    ico.innerHTML = statusIcon(s.status);
    art.querySelector('.result__dur').textContent = s.runtime?formatMs(s.runtime):'';
    if (s.status === 'passed' && !art.dataset.populated) {
      const body = $(`#body-${id}`);
      // Steps + custom content
      const stepsHTML = t.steps.map(st=>`
        <div class="step">
          <span class="step__icon ${st.kind==='info'?'is-info':st.kind==='skip'?'is-skip':''}">${st.kind==='info'?ICONS.dot:ICONS.check}</span>
          <span class="step__title">${st.title}</span>
          <span class="step__dur">${formatMs(st.dur)}</span>
        </div>`).join('');
      body.innerHTML = `<div style="margin:0 0 14px">${stepsHTML}</div>${t.render()}`;
      art.dataset.populated = '1';
      art.classList.add('is-open');
      // Animate skill bars if present
      $$('.skill__fill', body).forEach(el => requestAnimationFrame(()=> el.style.width = el.dataset.pct + '%'));
      // Hook resume buttons
      const dl = $('#dl-resume', body); if (dl) dl.addEventListener('click', downloadResume);
      const pr = $('#print-resume', body); if (pr) pr.addEventListener('click', ()=>window.print());
    }
  }

  // ============ RUN ENGINE ============
  function selectTest(id, scroll){
    $$('.test').forEach(r=>r.classList.toggle('is-selected', r.dataset.id===id));
    if (scroll) {
      const el = $(`#result-${id}`);
      if (el) el.scrollIntoView({ behavior:'smooth', block:'start' });
    }
  }

  async function runTest(id){
    const t = tests.find(x=>x.id===id);
    if (!t) return;
    const s = state[id];
    if (s.status === 'running') return;
    // reset
    s.status = 'running'; s.runtime = 0;
    refreshTreeRow(id); refreshResultRow(id); updateStatusbar();
    selectTest(id, true);
    consoleLine('info', `▶ running test('${t.title}')`);

    const dur = headed() ? t.duration * 2.5 : t.duration;
    const start = performance.now();
    const bar = $(`#bar-${id}`);
    bar.style.width = '0%';

    await tween(dur, (p)=>{ bar.style.width = (p*100) + '%'; });

    const elapsed = Math.round(performance.now() - start);
    s.runtime = elapsed; s.status = 'passed';
    bar.style.width = '100%';
    setTimeout(()=>{ bar.style.transition='opacity .4s'; bar.style.opacity='0'; }, 200);
    // Clear populated flag so it re-renders fresh on re-run
    const art = $(`#result-${id}`); if (art) art.dataset.populated = '';
    refreshTreeRow(id); refreshResultRow(id); updateStatusbar();
    consoleLine('ok', `✓ test('${t.title}') passed in ${formatMs(elapsed)}`);
  }

  async function runAll(){
    if (isRunningAll) return;
    isRunningAll = true;
    $('#run-all').disabled = true;
    $('#stop-all').disabled = false;
    consoleLine('info', `▶ playwright test  (workers=1)`);
    for (const t of tests) {
      const row = $(`.test[data-id="${t.id}"]`);
      if (row && row.style.display === 'none') continue; // respect filter
      // reset to idle if previously passed
      state[t.id].status = 'idle'; state[t.id].runtime = 0;
      const art = $(`#result-${t.id}`); if (art) { art.dataset.populated=''; const b=$(`#bar-${t.id}`); if(b){b.style.width='0%';b.style.opacity='1';b.style.transition='';}}
      refreshTreeRow(t.id); refreshResultRow(t.id);
      await runTest(t.id);
      if (!isRunningAll) break;
    }
    isRunningAll = false;
    $('#run-all').disabled = false;
    $('#stop-all').disabled = true;
    const total = Object.values(state).reduce((a,s)=>a+(s.runtime||0),0);
    consoleLine('ok', `Test suite finished — ${countPassed()} passed in ${formatMs(total)}`);
  }

  function resetAll(){
    isRunningAll = false;
    for (const t of tests) {
      state[t.id] = { status:'idle', runtime:0 };
      const art = $(`#result-${t.id}`);
      if (art) {
        art.dataset.populated = '';
        art.classList.remove('is-open');
        const body = $(`#body-${t.id}`); if (body) body.innerHTML='';
        const b = $(`#bar-${t.id}`); if (b){ b.style.width='0%'; b.style.opacity='1'; b.style.transition=''; }
      }
      refreshTreeRow(t.id); refreshResultRow(t.id);
    }
    $('#console').innerHTML = '';
    updateStatusbar();
    consoleLine('info', 'reset · all tests returned to idle');
  }

  // ============ STATUS / COUNTS ============
  function countPassed(){ return Object.values(state).filter(s=>s.status==='passed').length; }
  function updateStatusbar(){
    const passed  = countPassed();
    const running = Object.values(state).filter(s=>s.status==='running').length;
    $('#cnt-pass').textContent = passed;
    $('#cnt-fail').textContent = 0;
    $('#cnt-skip').textContent = 0;
    const dot = $('#status-dot'); const txt = $('#status-text');
    if (running) { dot.className='dot dot--running'; txt.textContent = 'running'; }
    else if (passed === tests.length) { dot.className='dot dot--pass'; txt.textContent='all passed'; }
    else if (passed > 0) { dot.className='dot dot--pass'; txt.textContent='partial'; }
    else { dot.className='dot dot--idle'; txt.textContent='idle'; }
    const total = Object.values(state).reduce((a,s)=>a+(s.runtime||0),0);
    $('#sb-runtime').textContent = `runtime: ${formatMs(total)}`;
  }

  // ============ CONSOLE ============
  function consoleLine(lvl, msg){
    const el = $('#console');
    const ts = new Date().toLocaleTimeString('en-CA', { hour12:false });
    const line = document.createElement('div');
    line.className = 'console__line';
    line.innerHTML = `<span class="console__ts">${ts}</span><span class="console__lvl lvl--${lvl}">${lvl.toUpperCase()}</span><span class="console__msg">${msg}</span>`;
    el.appendChild(line);
    el.scrollTop = el.scrollHeight;
  }

  // ============ TABS ============
  function initTabs(){
    $$('.tab').forEach(tab=>{
      tab.addEventListener('click', ()=>{
        const id = tab.dataset.tab;
        $$('.tab').forEach(t=>t.classList.toggle('is-active', t===tab));
        $$('.pane').forEach(p=>p.classList.toggle('is-active', p.id === `pane-${id}`));
      });
    });
  }

  // ============ TRACE PANE ============
  function renderTrace(){
    // Build a career timeline: each role gets a bar relative to a global timeline
    const trace = $('#trace');
    const items = data.experience.map(e => {
      const m = e.when.match(/(\w+\s+\d{4})\s*[–-]\s*(\w+\s+\d{4})/i);
      if (!m) return null;
      return { ...e, start: parseMon(m[1]), end: parseMon(m[2]) };
    }).filter(Boolean);

    const min = Math.min(...items.map(i=>i.start.getTime()));
    const max = Math.max(...items.map(i=>i.end.getTime()));
    const span = max - min;

    trace.innerHTML = items.map(it=>{
      const left = ((it.start - min) / span) * 100;
      const width = Math.max(2, ((it.end - it.start) / span) * 100);
      const months = Math.round((it.end - it.start)/(1000*60*60*24*30));
      return `
      <div class="trace-row" title="${_esc(it.company)} · ${_esc(it.when)}">
        <div class="trace-row__label">${_esc(it.company)} <small>· ${_esc(it.role)}</small></div>
        <div class="trace-row__track">
          <div class="trace-row__bar" style="left:${left}%;width:${width}%"></div>
        </div>
        <div class="trace-row__dur">${months}mo</div>
      </div>`;
    }).join('');

    // Axis ticks: years from min to max
    const axis = $('#trace-axis');
    const yStart = new Date(min).getFullYear();
    const yEnd   = new Date(max).getFullYear();
    const years = [];
    for (let y=yStart; y<=yEnd; y+=Math.max(1, Math.ceil((yEnd-yStart)/8))) years.push(y);
    if (years[years.length-1] !== yEnd) years.push(yEnd);
    axis.innerHTML = `<div></div><div class="trace-axis__ticks">${years.map(y=>`<span>${y}</span>`).join('')}</div><div></div>`;
  }
  function parseMon(s){
    const [mon,yr] = s.split(/\s+/);
    const idx = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec']
      .indexOf(mon.slice(0,3).toLowerCase());
    return new Date(parseInt(yr), idx<0?0:idx, 1);
  }
  function _esc(s){ return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

  // ============ SOURCE PANE ============
  function renderSource(){
    const lines = [
      ['<span class="cm">// portfolio.spec.ts — Senior SDET portfolio, expressed as a Playwright test suite</span>'],
      ['<span class="kw">import</span> { test, expect } <span class="kw">from</span> <span class="str">\'@playwright/test\'</span>;'],
      ['<span class="kw">import</span> { person, experience, skills, projects } <span class="kw">from</span> <span class="str">\'./fixtures/ilia\'</span>;'],
      [''],
      [`test.describe(<span class="str">'${data.suite.name}'</span>, () => {`],
      [''],
    ];
    tests.forEach(t=>{
      const tagStr = t.tags.length ? ` <span class="cm">// ${t.tags.join(' ')}</span>` : '';
      lines.push([`  test(<span class="str">'${t.title}'</span>, <span class="kw">async</span> ({ page }) => {${tagStr}`]);
      t.steps.forEach(s=>{
        lines.push([`    <span class="kw">await</span> test.step(<span class="str">'${s.title.replace(/'/g,"\\'")}'</span>, <span class="kw">async</span> () => { <span class="cm">/* ${s.dur}ms */</span> });`]);
      });
      lines.push([`  });`]);
      lines.push(['']);
    });
    lines.push(['});']);

    $('#source').innerHTML = lines.map((row,i)=>`
      <div class="source__line">
        <span class="source__ln">${i+1}</span>
        <span class="source__code">${row[0]}</span>
      </div>`).join('');
  }

  // ============ RESUME DOWNLOAD ============
  function downloadResume(){
    // Build a single-page HTML resume as a blob, open it in a new tab and trigger print
    const p = data.person;
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${p.first} ${p.last} — Resume</title>
<style>
  body { font-family: 'Inter', system-ui, sans-serif; max-width: 820px; margin: 40px auto; padding: 0 36px; color:#1f1f1f; }
  h1 { margin: 0 0 4px; font-size: 28px; letter-spacing: -.01em; }
  h2 { border-bottom: 1px solid #ddd; padding-bottom: 4px; font-size: 13px; letter-spacing: .12em; text-transform: uppercase; margin: 22px 0 10px; color: #444; }
  h3 { font-size: 14px; margin: 14px 0 2px; }
  .meta { color: #555; font-size: 12.5px; margin: 2px 0 6px; font-family: 'JetBrains Mono', ui-monospace, monospace; }
  ul { margin: 4px 0 0; padding-left: 18px; font-size: 13px; }
  li { margin: 3px 0; }
  .head { display: flex; justify-content: space-between; align-items: baseline; }
  .contact { color:#555; font-size: 12.5px; font-family:'JetBrains Mono', monospace; }
  .blurb { font-size: 13px; line-height: 1.55; color:#333; }
  .skills-list { font-size: 13px; line-height: 1.6; }
  @media print { body { margin: 0; padding: 0 28px; } h2 { page-break-after: avoid; } h3 { page-break-after: avoid; } }
</style></head><body>
<div class="head"><h1>${p.first} ${p.last}</h1><div class="contact">${p.email} · ${p.phone}</div></div>
<div class="meta">${p.title} · ${p.location} · ${p.linkedin}</div>
<p class="blurb">${p.blurb}</p>
<h2>Experience</h2>
${data.experience.map(e=>`
  <h3>${e.company} — ${e.role}</h3>
  <div class="meta">${e.when} · ${e.where}</div>
  <ul>${e.bullets.map(b=>`<li>${b}</li>`).join('')}</ul>
`).join('')}
<h2>Skills</h2>
<ul class="skills-list">${data.skills.map(s=>`<li>${s.name.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')}</li>`).join('')}</ul>
<h2>Projects</h2>
${data.projects.map(p=>`<h3>${p.name}</h3><p style="font-size:13px;margin:4px 0">${p.desc}</p>`).join('')}
<script>window.addEventListener('load', () => setTimeout(()=>window.print(), 300));</script>
</body></html>`;
    const blob = new Blob([html], { type:'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    consoleLine('ok', '⇩ resume.pdf generated — print dialog opened in new tab');
  }

  // ============ THEME TOGGLE ============
  function initTheme(){
    const saved = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    $('#theme-toggle').addEventListener('click', ()=>{
      const cur = document.documentElement.getAttribute('data-theme');
      const next = cur === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
    });
  }

  // ============ HELPERS ============
  function formatMs(ms){
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms/1000).toFixed(1)}s`;
  }
  function tween(duration, onUpdate){
    return new Promise(resolve=>{
      const start = performance.now();
      function frame(now){
        const p = Math.min(1, (now-start)/duration);
        onUpdate(p);
        if (p < 1) requestAnimationFrame(frame); else resolve();
      }
      requestAnimationFrame(frame);
    });
  }

  // ============ INIT ============
  function init(){
    initTheme();
    renderTagBar();
    renderTree();
    renderResults();
    renderTrace();
    renderSource();
    initTabs();
    updateStatusbar();

    $('#grep').addEventListener('input', applyFilter);
    $('#run-all').addEventListener('click', runAll);
    $('#stop-all').addEventListener('click', ()=>{ isRunningAll = false; consoleLine('warn','■ stop requested — finishing current test'); });
    $('#reset-all').addEventListener('click', resetAll);
    $('#expand-all').addEventListener('click', ()=>{
      $$('.suite').forEach(s=>s.classList.remove('collapsed'));
    });

    // Mobile drawer
    const sidebar = $('#sidebar');
    const scrim   = $('#sidebar-scrim');
    function closeDrawer(){ sidebar.classList.remove('is-open'); scrim.classList.remove('is-open'); }
    $('#menu-btn').addEventListener('click', ()=>{
      sidebar.classList.toggle('is-open');
      scrim.classList.toggle('is-open');
    });
    scrim.addEventListener('click', closeDrawer);
    // Close drawer when a test is selected on mobile
    sidebar.addEventListener('click', e => {
      if (window.innerWidth <= 900 && (e.target.closest('.test') || e.target.closest('.test__run'))) {
        setTimeout(closeDrawer, 120);
      }
    });

    consoleLine('info', `Running ${tests.length} tests using 1 worker`);

    // Friendly nudge: animate the Run All button briefly on first load
    setTimeout(()=> $('#run-all').classList.add('pulse'), 600);
  }
  document.addEventListener('DOMContentLoaded', init);
})();
