/* app.js — Playwright-runner UI behavior */
(function(){
  const $  = (sel,root=document)=>root.querySelector(sel);
  const $$ = (sel,root=document)=>Array.from(root.querySelectorAll(sel));
  const data = window.PORTFOLIO;
  const tests = data.suite.tests;
  const specs = Array.isArray(data.specs) && data.specs.length
    ? data.specs
    : [{ id: 'portfolio', file: 'portfolio.spec.ts', describe: data.suite.name }];
  /** Canonical resume file (sync with repo `assets/ilia-dobkin-resume.pdf`). */
  const RESUME_PDF = 'assets/ilia-dobkin-resume.pdf';

  // Test state: idle | running | passed | skipped
  const state = Object.fromEntries(tests.map(t=>[t.id, { status: t.skip ? 'skipped' : t.fail ? 'failed' : 'idle', runtime:0 }]));
  let isRunningAll = false;
  const headed = () => $('#headed').checked;
  const getWorkers = () => Math.max(1, parseInt($('#workers').value, 10) || 1);

  // Active spec controls which tests are visible in tree / results / source.
  // Restored from cookie on init; falls back to the first spec.
  function readSpecCookie(){
    const m = document.cookie.match(/(?:^|;\s*)spec=([a-z0-9_-]+)/i);
    return m ? m[1] : null;
  }
  function writeSpecCookie(v){
    try { document.cookie = `spec=${v}; path=/; max-age=31536000; SameSite=Lax`; } catch { /* cookies disabled */ }
  }
  function getSpec(id){ return specs.find(s => s.id === id) || specs[0]; }
  function specCountFor(id){ return tests.filter(t => t.spec === id).length; }
  let activeSpec = (specs.find(s => s.id === readSpecCookie()) || specs[0]).id;

  // ============ ICONS ============
  const ICONS = {
    play:  '<svg viewBox="0 0 16 16"><path d="M5 3 L12 8 L5 13 Z" fill="currentColor"/></svg>',
    check: '<svg viewBox="0 0 16 16"><path d="M3.5 8 L7 11.5 L13 5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    skip:  '<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="5.5" stroke="currentColor" stroke-width="1.6" fill="none"/><path d="M5.5 5.5 L10.5 10.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    fail:  '<svg viewBox="0 0 16 16"><path d="M4.5 4.5 L11.5 11.5 M11.5 4.5 L4.5 11.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    dot:   '<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="2.6" fill="currentColor"/></svg>',
    spin:  '<svg viewBox="0 0 16 16" class="spin"><circle cx="8" cy="8" r="5.5" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="20 12" stroke-linecap="round"/></svg>',
    chev:  '<svg viewBox="0 0 16 16"><path d="M6 4 L10 8 L6 12" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    rerun: '<svg viewBox="0 0 16 16"><path d="M12.5 6A4.5 4.5 0 1 1 8 3.5" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M12 2 L13 6 L9 6" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  };
  function statusIcon(s){
    if (s==='running') return ICONS.spin;
    if (s==='passed')  return ICONS.check;
    if (s==='failed')  return ICONS.fail;
    if (s==='skipped') return ICONS.skip;
    return ICONS.dot;
  }
  function statusClass(s){
    if (s==='running') return 'icon--run';
    if (s==='passed')  return 'icon--pass';
    if (s==='failed')  return 'icon--fail';
    if (s==='skipped') return 'icon--skip';
    return 'icon--idle';
  }

  // Format test title with syntax highlight
  function titleHTML(t){
    return `<span class="kw">test</span>(<span class="str">'${t.title}'</span>)`;
  }

  // ============ SIDEBAR (tree) ============
  // Renders a Test Explorer with ALL specs visible (one collapsible
  // describe block per spec). The editor tab strip controls which spec
  // is "open" in the right pane; clicking a test row in any suite
  // auto-switches the active tab to that test's spec.
  function renderTree(){
    const wrap = $('#tree');
    wrap.innerHTML = specs.map(s => {
      const specTests = tests.filter(t => t.spec === s.id);
      const cls = s.id === activeSpec ? 'is-active' : '';
      return `
      <div class="suite ${cls}" data-spec="${s.id}" data-suite>
        <div class="suite__head">
          <span class="suite__caret">${ICONS.chev}</span>
          <span class="suite__name"><span class="kw">describe</span>(<em>'${s.describe}'</em>)</span>
          <span class="suite__count">${specTests.length}</span>
        </div>
        ${specTests.map(renderTreeTest).join('')}
      </div>`;
    }).join('');

    wrap.addEventListener('click', e=>{
      const head = e.target.closest('.suite__head');
      if (head) { head.parentElement.classList.toggle('collapsed'); return; }
      const runBtn = e.target.closest('.test__run');
      if (runBtn) {
        e.stopPropagation();
        const id = runBtn.dataset.id;
        const t = tests.find(x => x.id === id);
        if (t && t.spec !== activeSpec) activateSpec(t.spec);
        runTest(id);
        return;
      }
      const row = e.target.closest('.test');
      if (row) {
        const id = row.dataset.id;
        const t = tests.find(x => x.id === id);
        if (t && t.spec !== activeSpec) activateSpec(t.spec);
        selectTest(id, true);
      }
    });
  }
  function renderTreeTest(t){
    const s = state[t.id];
    const cls = [
      'test',
      s.status==='running' ? 'is-running' : '',
      s.status==='passed'  ? 'is-passed'  : '',
      s.status==='failed'  ? 'is-failed'  : '',
      s.status==='skipped' ? 'is-skipped' : '',
    ].filter(Boolean).join(' ');
    return `
      <div class="${cls}" data-id="${t.id}" data-tags="${t.tags.join(' ')}">
        <button class="test__run" data-id="${t.id}" title="Run">${ICONS.play}</button>
        <span class="test__icon ${statusClass(s.status)}">${statusIcon(s.status)}</span>
        <span class="test__title">${titleHTML(t)}</span>
        <span class="test__dur">${s.runtime?formatMs(s.runtime):''}</span>
        <div class="test__tags">${t.tags.map(x=>`<span class="tag">${x}</span>`).join('')}</div>
      </div>`;
  }
  function refreshTreeRow(id){
    const s = state[id];
    const row = $(`.test[data-id="${id}"]`);
    if (!row) return;
    row.classList.toggle('is-running', s.status==='running');
    row.classList.toggle('is-passed',  s.status==='passed');
    row.classList.toggle('is-failed',  s.status==='failed');
    row.classList.toggle('is-skipped', s.status==='skipped');
    const iconEl = row.querySelector('.test__icon');
    iconEl.className = `test__icon ${statusClass(s.status)}`;
    iconEl.innerHTML = statusIcon(s.status);
    row.querySelector('.test__dur').textContent = s.runtime?formatMs(s.runtime):'';
  }

  // ============ TAG BAR ============
  // Show the first VISIBLE_TAGS by default; the rest hide behind a "+N more"
  // chip that expands them inline on click. Keeps the sidebar visual mass
  // small until a visitor needs the full registry.
  const VISIBLE_TAGS = 6;
  const activeTags = new Set();
  function renderTagBar(){
    const bar = $('#tag-bar');
    const all = Array.isArray(data.tags) ? data.tags : [];
    const hidden = Math.max(0, all.length - VISIBLE_TAGS);
    const tagHTML = all.map((t, i) =>
      `<span class="tag ${i >= VISIBLE_TAGS ? 'is-collapsed' : ''}" data-tag="${t}">${t}</span>`
    ).join('');
    const moreHTML = hidden > 0
      ? `<button class="tags-more" type="button" data-more aria-expanded="false">+${hidden} more</button>`
      : '';
    const clearHTML = `<button class="tags-clear" type="button" data-clear title="Clear filters"><svg viewBox="0 0 16 16"><path d="M4 4 L12 12 M12 4 L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>clear</button>`;
    bar.innerHTML = tagHTML + moreHTML + clearHTML;
    bar.addEventListener('click', e=>{
      const clr = e.target.closest('[data-clear]');
      if (clr) { clearTagFilter(); return; }
      const more = e.target.closest('[data-more]');
      if (more) {
        bar.classList.add('is-expanded');
        more.setAttribute('aria-expanded', 'true');
        return;
      }
      const el = e.target.closest('.tag'); if (!el) return;
      const tag = el.dataset.tag;
      if (activeTags.has(tag)) activeTags.delete(tag);
      else activeTags.add(tag);
      syncTagBarUI();
    });
  }

  function syncTagBarUI(){
    const bar = $('#tag-bar');
    bar.querySelectorAll('.tag').forEach(t=>{
      t.classList.toggle('is-active', activeTags.has(t.dataset.tag));
    });
    bar.classList.toggle('has-active', activeTags.size > 0);
    $('#grep').value = Array.from(activeTags).join(' ');
    applyFilter();
  }

  function clearTagFilter(){
    activeTags.clear();
    syncTagBarUI();
  }

  function applyFilter(){
    const grep = $('#grep').value.trim().toLowerCase();
    const wantedTags = grep.split(/\s+/).filter(s=>s.startsWith('@'));
    const text = grep.replace(/@\S+/g,'').trim();
    const hasFilter = wantedTags.length > 0 || text.length > 0;

    // Sidebar tree — filter per-suite so we can hide entire describe blocks
    // when none of their tests match (prevents the awkward "open caret but no
    // rows" look that reads as a broken collapsed state).
    $$('[data-suite]').forEach(suite => {
      let anyVisible = false;
      suite.querySelectorAll('.test').forEach(row => {
        const id = row.dataset.id;
        const t  = tests.find(x => x.id === id);
        if (!t) { row.style.display = 'none'; return; }
        const tagsOK = wantedTags.length === 0 || wantedTags.every(tg => t.tags.includes(tg));
        const textOK = !text || t.title.toLowerCase().includes(text) || id.includes(text);
        const visible = tagsOK && textOK;
        row.style.display = visible ? '' : 'none';
        if (visible) anyVisible = true;
      });
      // No filter → always show all suites. With a filter → hide suites that
      // have zero matching tests; auto-expand suites that do match.
      suite.style.display = (!hasFilter || anyVisible) ? '' : 'none';
      if (hasFilter && anyVisible) suite.classList.remove('collapsed');
    });

    // Right-pane results — only active spec is visible. The editor tab is
    // the "open file"; we render its body, not the rest of the project.
    $$('.result').forEach(art => {
      const id = art.dataset.id;
      const t  = tests.find(x => x.id === id);
      art.style.display = (t && t.spec === activeSpec) ? '' : 'none';
    });
  }

  // ============ MAIN PANE RESULTS ============
  // Returns the id of the first idle test for the active spec — the one we
  // render as a "pending preview" so the page never looks empty before a run.
  function firstIdleId(){
    const t = tests.find(x => x.spec === activeSpec && state[x.id].status === 'idle' && !x.skip && !x.fail);
    return t ? t.id : null;
  }

  // Pre-render the body for the pending-preview test: steps + the section's
  // own render(). Wrapped with an overlay so it reads as "preview, not result".
  function renderPendingBody(t){
    const stepsHTML = t.steps.map(st => `
      <div class="step">
        <span class="step__icon ${st.kind==='info'?'is-info':st.kind==='skip'?'is-skip':''}">${st.kind==='info'?ICONS.dot:ICONS.check}</span>
        <span class="step__title">${st.title}</span>
        <span class="step__dur">${formatMs(st.dur)}</span>
      </div>`).join('');
    const overlay = `<button type="button" class="result__pending-overlay" data-pending-run="${t.id}" aria-label="Run this test"><span>click <span class="kbd">▶</span> to run</span></button>`;
    return `${overlay}<div style="margin:0 0 14px">${stepsHTML}</div>${t.render()}`;
  }

  function renderSkippedBody(t){
    const stepsHTML = t.steps.map(st => `
      <div class="step">
        <span class="step__icon is-skip">${ICONS.skip}</span>
        <span class="step__title">${st.title}</span>
        <span class="step__dur">—</span>
      </div>`).join('');
    const reason = t.skipReason || 'test.skip()';
    return `<div style="margin:0 0 14px">${stepsHTML}</div>${t.render ? t.render() : `<div class="block"><p style="color:var(--skip)">${reason}</p></div>`}`;
  }

  function renderFailedBody(t){
    const stepsHTML = t.steps.map(st => {
      const isFail = st.kind === 'fail';
      const icon = isFail ? ICONS.fail : ICONS.check;
      const cls  = isFail ? 'is-fail' : 'is-pass';
      return `
      <div class="step">
        <span class="step__icon ${cls}">${icon}</span>
        <span class="step__title">${st.title}</span>
        <span class="step__dur">${st.dur ? formatMs(st.dur) : '—'}</span>
      </div>`;
    }).join('');
    const msg = t.failMessage || 'Assertion error';
    return `<div style="margin:0 0 14px">${stepsHTML}</div>${t.render ? t.render() : `<div class="block"><pre class="fail-trace">${msg}</pre></div>`}`;
  }

  function renderResults(){
    const wrap = $('#results');
    const pendingId = firstIdleId();
    wrap.innerHTML = tests.map(t=>{
      const s = state[t.id];
      const isPending = t.id === pendingId;
      const isSkip = s.status === 'skipped';
      const isFail = s.status === 'failed';

      let bodyHTML = '';
      let cls = 'result';
      let dataAttr = '';

      if (isFail) {
        cls = 'result is-open is-failed';
        bodyHTML = renderFailedBody(t);
      } else if (isSkip) {
        cls = 'result is-open is-skipped';
        bodyHTML = renderSkippedBody(t);
      } else if (isPending) {
        cls = 'result is-open is-pending';
        dataAttr = ' data-pending="1"';
        bodyHTML = renderPendingBody(t);
      }

      return `
      <article class="${cls}" id="result-${t.id}" data-id="${t.id}"${dataAttr}>
        <div class="result__head">
          <span class="result__caret">${ICONS.chev}</span>
          <span class="result__status ${statusClass(s.status)}">${statusIcon(s.status)}</span>
          <span class="result__title">${titleHTML(t)}</span>
          <span class="result__dur">${s.runtime?formatMs(s.runtime):''}</span>
          <button class="result__rerun" title="Run / re-run" data-id="${t.id}">${ICONS.rerun}</button>
        </div>
        <div class="progress"><div class="progress__bar" id="bar-${t.id}"></div></div>
        <div class="result__body" id="body-${t.id}">${bodyHTML}</div>
      </article>`;
    }).join('');

    wrap.addEventListener('click', e=>{
      const pendingBtn = e.target.closest('[data-pending-run]');
      if (pendingBtn) { e.stopPropagation(); runTest(pendingBtn.dataset.pendingRun); return; }
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
      art.classList.remove('is-pending');   // un-fade — real result is in.
      art.classList.add('is-open');
      // Animate skill bars if present
      $$('.skill__fill', body).forEach(el => requestAnimationFrame(()=> el.style.width = el.dataset.pct + '%'));
      // Hook resume buttons
      const dl = $('#dl-resume', body); if (dl) dl.addEventListener('click', downloadResume);
      const pr = $('#print-resume', body); if (pr) pr.addEventListener('click', ()=> window.open(RESUME_PDF, '_blank', 'noopener,noreferrer'));
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
    if (t.skip) { consoleLine('warn', `⊘ test('${t.title}') skipped`); return; }
    if (t.fail) { consoleLine('err', `✗ test('${t.title}') failed — ${t.failMessage ? t.failMessage.split('\n')[0] : 'assertion error'}`); return; }
    // If this row was sitting in the pending-preview state, lift the overlay
    // but keep the faded preview body visible through the run — that way the
    // report never blanks mid-animation. The "is-pending" class stays on
    // (so the body stays greyed) until refreshResultRow swaps in the real
    // result on completion.
    const art = $(`#result-${id}`);
    if (art && art.dataset.pending) {
      art.removeAttribute('data-pending');
      const overlay = art.querySelector('.result__pending-overlay');
      if (overlay) overlay.remove();
      art.dataset.populated = '';
    }
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
    if (art) art.dataset.populated = '';
    refreshTreeRow(id); refreshResultRow(id); updateStatusbar();
    consoleLine('ok', `✓ test('${t.title}') passed in ${formatMs(elapsed)}`);
  }

  async function runAll(){
    if (isRunningAll) return;
    isRunningAll = true;
    $('#run-all').disabled = true;
    $('#stop-all').disabled = false;

    // Build the queue from the active spec, in suite order. Skip tests
    // explicitly marked skip, and respect grep/tag filters via row display.
    const queue = tests.filter(t => {
      if (t.spec !== activeSpec) return false;
      if (t.skip || t.fail) return false;
      const row = $(`.test[data-id="${t.id}"]`);
      return !row || row.style.display !== 'none';
    });

    // Reset every queued test up front so all rows are visibly idle before
    // workers fan out — otherwise the first row would briefly look special.
    for (const t of queue) {
      state[t.id].status = 'idle';
      state[t.id].runtime = 0;
      const art = $(`#result-${t.id}`);
      if (art) {
        art.dataset.populated = '';
        const b = $(`#bar-${t.id}`);
        if (b) { b.style.width = '0%'; b.style.opacity = '1'; b.style.transition = ''; }
      }
      refreshTreeRow(t.id);
      refreshResultRow(t.id);
    }
    updateStatusbar();

    const N = Math.min(getWorkers(), queue.length || 1);
    const sf = getSpec(activeSpec).file;
    consoleLine('info', `▶ playwright test ${sf}  (workers=${N})`);

    let cursor = 0;
    const startedAt = performance.now();
    async function worker(){
      while (isRunningAll) {
        const next = queue[cursor++];
        if (!next) return;
        await runTest(next.id);
      }
    }
    await Promise.all(Array.from({ length: N }, worker));

    isRunningAll = false;
    $('#run-all').disabled = false;
    $('#stop-all').disabled = true;
    const wall = Math.round(performance.now() - startedAt);
    const cpu  = Object.values(state).reduce((a,s)=>a+(s.runtime||0),0);
    const speedup = cpu > 0 ? (cpu / Math.max(1, wall)).toFixed(2) : '1.00';
    const tail = N > 1 ? ` · ${formatMs(wall)} wall, ${formatMs(cpu)} cpu (${speedup}× speedup)`
                       : ` in ${formatMs(wall)}`;
    consoleLine('ok', `Test suite finished — ${countPassed()} passed${tail}`);
  }

  function resetAll(){
    isRunningAll = false;
    for (const t of tests) {
      state[t.id] = { status: t.skip ? 'skipped' : t.fail ? 'failed' : 'idle', runtime:0 };
      const art = $(`#result-${t.id}`);
      if (art) {
        art.dataset.populated = '';
        art.classList.remove('is-open');
        art.classList.remove('is-pending');
        art.removeAttribute('data-pending');
        const body = $(`#body-${t.id}`); if (body) body.innerHTML='';
        const b = $(`#bar-${t.id}`); if (b){ b.style.width='0%'; b.style.opacity='1'; b.style.transition=''; }
      }
      refreshTreeRow(t.id); refreshResultRow(t.id);
    }
    $('#console').innerHTML = '';
    // After reset, the first test in the active spec is "pending" again —
    // restore the preview so the report doesn't land empty.
    refreshPendingPreview();
    updateStatusbar();
    consoleLine('info', 'reset · all tests returned to idle');
  }

  // ============ STATUS / COUNTS ============
  function countPassed(){ return Object.values(state).filter(s=>s.status==='passed').length; }
  function updateStatusbar(){
    // Counts and runtime are scoped to the active spec — matches what the
    // user is currently viewing, not the global pool of all specs.
    const specTests = tests.filter(t => t.spec === activeSpec);
    const passed  = specTests.filter(t => state[t.id].status === 'passed').length;
    const failed  = specTests.filter(t => state[t.id].status === 'failed').length;
    const running = specTests.filter(t => state[t.id].status === 'running').length;
    const skipped = specTests.filter(t => state[t.id].status === 'skipped').length;
    const xfailed = specTests.filter(t => t.fail).length;
    const surprise = failed - xfailed;
    const runnableCount = specTests.length - skipped - xfailed;
    $('#cnt-pass').textContent = passed;
    $('#cnt-fail').textContent = surprise;
    $('#cnt-skip').textContent = skipped;
    const dot = $('#status-dot'); const txt = $('#status-text');
    if (running) { dot.className='dot dot--running'; txt.textContent = 'running'; }
    else if (surprise > 0) { dot.className='dot dot--fail'; txt.textContent = `${surprise} failed`; }
    else if (runnableCount > 0 && passed === runnableCount) { dot.className='dot dot--pass'; txt.textContent='all passed'; }
    else if (passed > 0) { dot.className='dot dot--pass'; txt.textContent='partial'; }
    else { dot.className='dot dot--idle'; txt.textContent='idle'; }
    const total = specTests.reduce((a,t) => a + (state[t.id].runtime||0), 0);
    $('#sb-runtime').textContent = `runtime: ${formatMs(total)}`;
    updateSummaryStripe(specTests, { passed, failed, running, skipped, total });
  }

  // Tiny run-history stripe above the results list. We aggregate the current
  // (last) wall time + counts for the active spec so it reads naturally as
  // either "Running… ✓ 1 passed · 3 pending" or "Last run · 1.4s · 4 passed".
  function updateSummaryStripe(specTests, agg){
    const el = $('#summary-stripe');
    if (!el) return;
    specTests = specTests || tests.filter(t => t.spec === activeSpec);
    const passed  = agg ? agg.passed  : specTests.filter(t => state[t.id].status === 'passed').length;
    const failed  = agg ? (agg.failed || 0) : specTests.filter(t => state[t.id].status === 'failed').length;
    const running = agg ? agg.running : specTests.filter(t => state[t.id].status === 'running').length;
    const skipped = agg ? (agg.skipped || 0) : specTests.filter(t => state[t.id].status === 'skipped').length;
    const total   = agg ? agg.total   : specTests.reduce((a,t) => a + (state[t.id].runtime||0), 0);
    const pending = specTests.length - passed - failed - running - skipped;
    let lbl, dotCls;
    if (running) { lbl = 'Running'; dotCls = 'ss__dot--running'; }
    else if (failed > 0) { lbl = 'Last run'; dotCls = 'ss__dot--fail'; }
    else if (passed > 0) { lbl = 'Last run'; dotCls = 'ss__dot--pass'; }
    else { lbl = 'No runs yet'; dotCls = 'ss__dot--pending'; }
    const parts = [
      `<span class="ss__dot ${dotCls}" aria-hidden="true"></span><span class="ss__lbl">${lbl}</span>`,
    ];
    if (total > 0) parts.push(`<span class="ss__sep">·</span><span class="ss__val">${formatMs(total)}</span>`);
    parts.push(`<span class="ss__sep">·</span><span class="ss__val ss__val--pass">${passed} passed</span>`);
    if (failed > 0) parts.push(`<span class="ss__sep">·</span><span class="ss__val ss__val--fail">${failed} failed</span>`);
    if (running > 0) parts.push(`<span class="ss__sep">·</span><span class="ss__val">${running} running</span>`);
    if (pending > 0) parts.push(`<span class="ss__sep">·</span><span class="ss__val ss__val--pending">${pending} pending</span>`);
    if (skipped > 0) parts.push(`<span class="ss__sep">·</span><span class="ss__val ss__val--skip">${skipped} skipped</span>`);
    el.innerHTML = parts.join('');
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
        if (id === 'network') {
          requestAnimationFrame(()=>renderNetwork());
        }
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

  // ============ NETWORK PANE (Gitea repos as API rows) ============
  function networkLatencyMs(name){
    let h = 2166136261;
    for (let i = 0; i < name.length; i++) {
      h ^= name.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return 38 + (Math.abs(h) % 145);
  }
  function formatNetworkBytes(n){
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
    return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  }
  function utf8ByteLength(str){
    if (typeof TextEncoder !== 'undefined') {
      try { return new TextEncoder().encode(str).length; } catch { /* fall through */ }
    }
    try { return encodeURIComponent(str).replace(/%../g, 'x').length; }
    catch { return str.length * 4; }
  }

  /** Resolve list mount (handles older HTML ids + creates a node under `.network-pane` if needed). */
  function networkMount(){
    let el = document.getElementById('gitea-network');
    if (el) return el;
    el = document.querySelector('#pane-network [data-repo-list]');
    if (el) return el;
    el = document.querySelector('#pane-network #network'); // legacy id
    if (el) return el;
    el = document.querySelector('#pane-network .network-scroll');
    if (el) return el;
    const pn = document.getElementById('pane-network');
    if (!pn) return null;
    const host = pn.querySelector('.network-pane') || pn;
    el = document.createElement('div');
    el.id = 'gitea-network';
    el.className = 'network-scroll';
    el.setAttribute('data-network-list', '1');
    const hdr = host.querySelector('.network-head');
    if (hdr) hdr.insertAdjacentElement('afterend', el);
    else host.appendChild(el);
    console.warn('portfolio: created #gitea-network — update deployed index.html to include this div.');
    return el;
  }

  /** Expand/collapse (delegated on #pane-network; survives innerHTML swaps). */
  function onNetworkPaneClick(e){
    const btn = e.target.closest('.network-row');
    if (!btn) return;
    const art = btn.closest('.network-entry');
    if (!art) return;
    const panel = art.querySelector('.network-detail');
    if (!panel) return;
    const open = !art.classList.contains('is-open');
    art.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    panel.hidden = !open;
  }

  function renderNetwork(){
    const wrap = networkMount();
    if (!wrap) {
      console.warn('portfolio: Network tab missing #pane-network · cannot render repo list.');
      return;
    }
    const GF = window.PORTFOLIO;
    const repos = GF && Array.isArray(GF.giteaRepos) ? GF.giteaRepos : [];
    const apiRoot = 'https://git.levkin.ca/api/v1/repos/';
    if (repos.length === 0) {
      wrap.innerHTML = `<div class="network-empty">No <span class="mono">giteaRepos</span> in <span class="mono">js/data.js</span>. Hard refresh the page (<span class="mono">Cmd+Shift+R</span>). If deploying, redeploy after adding the array.</div>`;
      return;
    }

    try {
      wrap.innerHTML = repos.map((r, i) => {
        const url = apiRoot + String(r.full_name || '');
        const ms = networkLatencyMs(String(r.name || r.full_name || 'x'));
        const bodyObj = {
          id: i + 1,
          full_name: r.full_name,
          name: r.name,
          html_url: r.html_url,
          language: r.language || null,
          description: r.description,
        };
        const json = JSON.stringify(bodyObj, null, 2);
        const bytes = utf8ByteLength(json);
        return `
      <article class="network-entry">
        <button type="button" class="network-row" aria-expanded="false">
          <span class="network-row__method">GET</span>
          <span class="network-row__url mono" title="${_esc(url)}">${_esc(url)}</span>
          <span class="network-row__status">200</span>
          <span class="network-row__mime mono">json</span>
          <span class="network-row__size mono">${formatNetworkBytes(bytes)}</span>
          <span class="network-row__time mono">${ms}ms</span>
          <span class="network-row__caret">${ICONS.chev}</span>
        </button>
        <div class="network-detail" hidden>
          <div class="network-detail__hdr">Response body</div>
          <pre class="network-detail__body mono">${_esc(json)}</pre>
          <a class="network-detail__link" href="${_esc(String(r.html_url || ''))}" target="_blank" rel="noopener">Open repository →</a>
        </div>
      </article>`;
      }).join('');
    } catch (err) {
      wrap.innerHTML = `<div class="network-err">Could not build network list (${_esc(err && err.message ? err.message : String(err))}). Check the Console for details.</div>`;
      console.error('renderNetwork', err);
    }
  }

  // ============ SOURCE PANE ============
  function renderSource(){
    const spec = getSpec(activeSpec);
    const specTests = tests.filter(t => t.spec === spec.id);
    const lines = [
      [`<span class="cm">// ${spec.file} — ${specTests.length} test${specTests.length===1?'':'s'}</span>`],
      ['<span class="kw">import</span> { test, expect } <span class="kw">from</span> <span class="str">\'@playwright/test\'</span>;'],
      ['<span class="kw">import</span> { person, experience, skills, projects } <span class="kw">from</span> <span class="str">\'./fixtures/ilia\'</span>;'],
      [''],
      [`test.describe(<span class="str">'${spec.describe}'</span>, () => {`],
      [''],
    ];
    if (specTests.length === 0) {
      lines.push(['  <span class="cm">// no tests in this spec yet — see IDEAS.md</span>']);
      lines.push(['']);
    } else {
      specTests.forEach(t=>{
        const tagStr = t.tags.length ? ` <span class="cm">// ${t.tags.join(' ')}</span>` : '';
        lines.push([`  test(<span class="str">'${t.title}'</span>, <span class="kw">async</span> ({ page }) => {${tagStr}`]);
        t.steps.forEach(s=>{
          lines.push([`    <span class="kw">await</span> test.step(<span class="str">'${s.title.replace(/'/g,"\\'")}'</span>, <span class="kw">async</span> () => { <span class="cm">/* ${s.dur}ms */</span> });`]);
        });
        lines.push([`  });`]);
        lines.push(['']);
      });
    }
    lines.push(['});']);

    $('#source').innerHTML = lines.map((row,i)=>`
      <div class="source__line">
        <span class="source__ln">${i+1}</span>
        <span class="source__code">${row[0]}</span>
      </div>`).join('');
  }

  // ============ RESUME DOWNLOAD ============
  function downloadResume(){
    const a = document.createElement('a');
    a.href = RESUME_PDF;
    a.download = 'Ilia-Dobkin-SDET-resume.pdf';
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    consoleLine('ok', '⇩ resume.pdf downloaded');
  }

  // ============ THEME TOGGLE ============
  // Three-step cycle: dark → light → hc (WCAG AAA high-contrast) → dark.
  // Persist via cookie because sandboxed iframes block other storage APIs.
  const THEME_CYCLE = ['dark', 'light', 'hc'];
  function readThemeCookie(){
    const m = document.cookie.match(/(?:^|;\s*)theme=(dark|light|hc)/);
    return m ? m[1] : null;
  }
  function writeThemeCookie(v){
    try { document.cookie = `theme=${v}; path=/; max-age=31536000; SameSite=Lax`; } catch { /* cookies disabled */ }
  }
  function initTheme(){
    const saved = readThemeCookie() || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    $('#theme-toggle').addEventListener('click', ()=>{
      const cur = document.documentElement.getAttribute('data-theme');
      const idx = THEME_CYCLE.indexOf(cur);
      const next = THEME_CYCLE[(idx + 1) % THEME_CYCLE.length] || THEME_CYCLE[0];
      document.documentElement.setAttribute('data-theme', next);
      writeThemeCookie(next);
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

  // ============ KEYBOARD SHORTCUTS ============
  // Single source of truth: drives both the help overlay and the keydown handler.
  const SHORTCUTS = [
    { html: '<span class="kbd">R</span>',                                desc: 'Run all tests' },
    { html: '<span class="kbd">X</span>',                                desc: 'Reset · clear results' },
    { html: '<span class="kbd">Esc</span>',                              desc: 'Stop running · close overlay' },
    { html: '<span class="kbd">T</span>',                                desc: 'Toggle theme' },
    { html: '<span class="kbd">/</span>',                                desc: 'Focus --grep filter' },
    { html: '<span class="kbd">1</span> – <span class="kbd">9</span>',   desc: 'Run visible test by index' },
    { html: '<span class="kbd">?</span>',                                desc: 'Toggle this overlay' },
  ];

  function renderShortcuts(){
    $('#kshelp-grid').innerHTML = SHORTCUTS.map(s =>
      `<div class="kshelp__row"><span class="kshelp__keys">${s.html}</span><span class="kshelp__desc">${s.desc}</span></div>`
    ).join('');
  }
  function helpOpen(){ return !$('#kshelp').hidden; }
  function openHelp(){
    const el = $('#kshelp');
    if (!el.hidden) return;
    el.hidden = false;
    // Defer focus so the dialog is in the a11y tree before we focus into it.
    requestAnimationFrame(()=> el.querySelector('.kshelp__panel').focus());
  }
  function closeHelp(){ $('#kshelp').hidden = true; }
  function toggleHelp(){ helpOpen() ? closeHelp() : openHelp(); }

  function isTypingTarget(el){
    if (!el) return false;
    if (el.isContentEditable) return true;
    const tag = el.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
  }

  function initShortcuts(){
    renderShortcuts();
    // Delegated on document so a click on the SVG glyph (or any nested element)
    // still reaches us, and so we don't depend on element lookup timing.
    document.addEventListener('click', e => {
      if (e.target.closest('#kshelp-open'))                  { e.preventDefault(); toggleHelp(); return; }
      if (e.target.closest('#kshelp-close'))                 { e.preventDefault(); closeHelp(); return; }
      if (e.target.closest('#kshelp-scrim'))                 { closeHelp();                     return; }
    });

    document.addEventListener('keydown', e => {
      // Escape always wins: close overlay > stop run > blur grep.
      if (e.key === 'Escape') {
        if (helpOpen())               { closeHelp(); e.preventDefault(); return; }
        if (isRunningAll)             { isRunningAll = false; consoleLine('warn','■ stop requested — finishing current test'); e.preventDefault(); return; }
        if (isTypingTarget(document.activeElement)) { document.activeElement.blur(); e.preventDefault(); }
        return;
      }

      // `?` toggles the overlay everywhere, even from the grep input.
      if (e.key === '?') { toggleHelp(); e.preventDefault(); return; }

      // Otherwise: don't hijack typing or modifier combos (Cmd+R, Ctrl+T, …).
      if (isTypingTarget(e.target)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (helpOpen()) return;

      const k = e.key;
      if (k === 'r' || k === 'R') { e.preventDefault(); runAll(); return; }
      if (k === 'x' || k === 'X') { e.preventDefault(); resetAll(); return; }
      if (k === 't' || k === 'T') { e.preventDefault(); $('#theme-toggle').click(); return; }
      if (k === '/')              { e.preventDefault(); const g = $('#grep'); g.focus(); g.select(); return; }

      if (/^[1-9]$/.test(k)) {
        // Index into the active spec's currently-visible tests (so it pairs
        // naturally with the open editor tab + any --grep / tag filter).
        const visible = tests.filter(t => {
          if (t.spec !== activeSpec) return false;
          const row = $(`.test[data-id="${t.id}"]`);
          return !row || row.style.display !== 'none';
        });
        const t = visible[parseInt(k, 10) - 1];
        if (t) { e.preventDefault(); runTest(t.id); }
      }
    });
  }

  // ============ EDITOR STRIP (open .spec.ts files) ============
  function renderEditorStrip(){
    const strip = $('#editor-strip');
    if (!strip) return;
    strip.innerHTML = specs.map(s => {
      const cnt = specCountFor(s.id);
      const on  = s.id === activeSpec;
      return `
        <button class="espec ${on?'is-active':''}" data-spec="${s.id}" type="button" role="tab"
                aria-selected="${on?'true':'false'}" title="${s.file} · ${cnt} test${cnt===1?'':'s'}">
          <span class="espec__icon" aria-hidden="true">TS</span>
          <span class="espec__name">${s.file}</span>
          <span class="espec__count">${cnt}</span>
        </button>`;
    }).join('');
    strip.addEventListener('click', e => {
      const btn = e.target.closest('.espec');
      if (!btn) return;
      activateSpec(btn.dataset.spec);
    });
  }

  function activateSpec(specId, opts){
    opts = opts || {};
    const spec = getSpec(specId);
    if (!spec) return;
    if (specId === activeSpec && !opts.force) return;
    activeSpec = spec.id;
    writeSpecCookie(activeSpec);

    // Editor strip — toggle is-active.
    $$('.espec').forEach(b => {
      const on = b.dataset.spec === activeSpec;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
    });

    // Sidebar tree — highlight the suite block matching the open spec.
    $$('.suite[data-spec]').forEach(s => {
      s.classList.toggle('is-active', s.dataset.spec === activeSpec);
    });

    // Breadcrumb + sidebar foot.
    const crumb = document.querySelector('.crumb strong');
    if (crumb) crumb.textContent = spec.file;
    const cnt = specCountFor(activeSpec);
    const foot = $('#sidebar-foot-meta');
    if (foot) foot.textContent = `v1.0.0 · ${cnt} test${cnt===1?'':'s'}`;

    // Reskin the hero (title/sub/hint) for the active spec.
    applyHeroForSpec();

    // Re-render the source pane for the new spec.
    renderSource();

    // Re-rank the "pending preview" — different spec means a different first
    // idle test. Clear the previous one, mark the new one (only if it's idle).
    refreshPendingPreview();

    // Apply grep + tag filter; refresh status counts (per active spec).
    applyFilter();
    updateStatusbar();

    // Reset scroll for panes whose content swapped (report, source).
    const panes = ['#pane-report', '#pane-source'];
    panes.forEach(sel => { const p = document.querySelector(sel); if (p) p.scrollTop = 0; });

    if (!opts.silent) consoleLine('info', `▶ opened ${spec.file} (${cnt} test${cnt===1?'':'s'})`);
  }

  // Recompute which result row should show the pending-preview body. Called
  // when the active spec changes (each spec has its own first idle test).
  function refreshPendingPreview(){
    const targetId = firstIdleId();
    $$('.result').forEach(art => {
      const id = art.dataset.id;
      const want = id === targetId;
      const has  = !!art.dataset.pending;
      if (want === has) return;
      const body = $(`#body-${id}`);
      if (want) {
        const t = tests.find(x => x.id === id);
        if (!t) return;
        art.classList.add('is-pending');
        art.classList.add('is-open');
        art.dataset.pending = '1';
        if (body) body.innerHTML = renderPendingBody(t);
      } else {
        art.classList.remove('is-pending');
        art.removeAttribute('data-pending');
        if (body) body.innerHTML = '';
        art.dataset.populated = '';
      }
    });
  }

  // Per-spec hero copy. Portfolio gets the full personal landing block;
  // other specs get a slimmer header so their (often single) test row
  // doesn't get visually buried by a 52px name title.
  const HEROES = {
    portfolio: {
      title: 'Ilia Dobkin',
      sub:   'Senior SDET · Toronto, ON · <span class="mono">test.describe("portfolio")</span>',
      hint:  'Click the green <span class="kbd">▶</span> next to any test to run it — or press <span class="kbd">Run all</span> above.',
    },
    projects: {
      title: 'Projects',
      sub:   'Self-hosted infrastructure & code · <span class="mono">test.describe("projects")</span>',
      hint:  'Run the test below to surface Levkin homelab, MCP server, and local-AI assistant cards.',
    },
    skills: {
      title: 'Skills & Capabilities',
      sub:   'Tag-driven competencies · <span class="mono">test.describe("skills")</span>',
      hint:  'Each test exposes a different angle — skills, daily stack, leadership, and KPIs.',
    },
    playground: {
      title: 'Playground',
      sub:   'Interactive demos & experiments · <span class="mono">test.describe("playground")</span>',
      hint:  'Reserved for fun stuff — see the test below for what\'s on the runway.',
    },
  };

  function applyHeroForSpec(){
    const hero = document.querySelector('.hero');
    if (!hero) return;
    const conf = HEROES[activeSpec] || HEROES.portfolio;
    hero.classList.toggle('hero--slim', activeSpec !== 'portfolio');
    const titleEl = hero.querySelector('.hero__title');
    const subEl   = hero.querySelector('.hero__sub');
    const hintEl  = hero.querySelector('.hero__hint');
    if (titleEl) titleEl.textContent = conf.title;
    if (subEl)   subEl.innerHTML     = conf.sub;
    if (hintEl)  hintEl.innerHTML    = conf.hint;
  }

  // ============ INIT ============
  function init(){
    initTheme();
    renderTagBar();
    renderTree();
    renderResults();
    renderTrace();
    renderNetwork();
    $('#pane-network').addEventListener('click', onNetworkPaneClick);
    renderEditorStrip();
    // activateSpec drives renderSource, applyFilter, updateStatusbar, etc.
    activateSpec(activeSpec, { force: true, silent: true });
    initTabs();
    initShortcuts();

    $('#results').addEventListener('click', e=>{
      const jump = e.target.closest('.tab-link[data-tab]');
      if (!jump) return;
      e.preventDefault();
      const tabBtn = $(`.tab[data-tab="${jump.dataset.tab}"]`);
      if (tabBtn) tabBtn.click();
    });

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

    const w0 = getWorkers();
    const sf = getSpec(activeSpec).file;
    const sc = specCountFor(activeSpec);
    consoleLine('info', `Loaded ${sc} test${sc===1?'':'s'} from ${sf} · workers=${w0}`);
    $('#workers').addEventListener('change', ()=>{
      const n = getWorkers();
      consoleLine('info', `--workers=${n} · next run will use ${n} parallel worker${n===1?'':'s'}`);
    });

    // Overflow menu (⋯) on the right of the editor bar. Holds --workers=
    // and --headed; opens on click, closes on outside-click + Escape.
    initOverflowMenu();

    // Friendly nudge: animate the Run All button briefly on first load
    setTimeout(()=> $('#run-all').classList.add('pulse'), 600);

    // Auto-run the first test of the active spec so the report never lands
    // empty — visitors see body content populated, with the runner animation
    // still playing once (progress bar fill). Skip if a Reduce Motion user
    // is here, or if the visitor has already touched a test in the 850ms
    // since load (e.g. clicked ▶ themselves — no surprise auto-runs).
    const prefersReduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReduce) {
      setTimeout(() => {
        const anyTouched = tests.some(t => state[t.id].status !== 'idle');
        if (anyTouched) return;
        const firstId = firstIdleId();
        if (firstId) runTest(firstId);
      }, 850);
    }
  }

  function initOverflowMenu(){
    const root = $('#overflow');
    const btn  = $('#overflow-btn');
    const menu = $('#overflow-menu');
    if (!root || !btn || !menu) return;
    function open(){
      menu.hidden = false;
      root.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');
    }
    function close(){
      menu.hidden = true;
      root.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
    }
    btn.addEventListener('click', e => {
      e.stopPropagation();
      menu.hidden ? open() : close();
    });
    // Outside-click closes; clicks inside the menu (e.g. toggling --headed
    // or changing --workers) shouldn't close it — visitors usually want to
    // tweak both in one go.
    document.addEventListener('click', e => {
      if (menu.hidden) return;
      if (root.contains(e.target)) return;
      close();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !menu.hidden) { close(); e.stopPropagation(); }
    });
  }
  document.addEventListener('DOMContentLoaded', init);
})();
