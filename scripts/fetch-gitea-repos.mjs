#!/usr/bin/env node
/**
 * Refresh PORTFOLIO.giteaRepos descriptions from git.levkin.ca:
 * uses GET /api/v1/repos/search (all public repos), then README.md per repo
 * when description is empty.
 *
 * Run from repo root: node scripts/fetch-gitea-repos.mjs
 * Paste the printed `giteaRepos: [...]` block into js/data.js (no npm deps).
 */

import https from 'https';

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'portfolio-fetch-gitea/1' } }, (res) => {
      let d = '';
      res.on('data', c => { d += c; });
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    }).on('error', reject);
  });
}

async function readmeSnippet(owner, repo, branch) {
  const url = `https://git.levkin.ca/api/v1/repos/${owner}/${repo}/contents/README.md?ref=${branch}`;
  const { status, body } = await get(url);
  if (status !== 200) return null;
  let j;
  try { j = JSON.parse(body); } catch { return null; }
  if (!j.content) return null;
  const text = Buffer.from(j.content, 'base64').toString('utf8');
  const lines = text.split(/\r?\n/);
  let i = 0;
  while (i < lines.length && (/^#+\s/.test(lines[i]) || lines[i].trim() === '')) i++;
  const para = [];
  for (; i < lines.length; i++) {
    const L = lines[i].trim();
    if (L === '') break;
    if (/^#+\s/.test(lines[i])) break;
    para.push(L.replace(/^[-*]\s+/, ''));
  }
  let s = para.join(' ').replace(/\s+/g, ' ').trim();
  if (!s) {
    for (const line of lines) {
      const t = line.trim();
      if (t && !t.startsWith('#') && !t.startsWith('```')) { s = t; break; }
    }
  }
  if (s.includes('<')) {
    s = s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }
  if (s.length > 280) s = s.slice(0, 277) + '…';
  return s || null;
}

function jsString(s) {
  return JSON.stringify(s);
}

(async () => {
  const { body } = await get('https://git.levkin.ca/api/v1/repos/search?limit=100&page=1');
  const j = JSON.parse(body);
  const repos = j.data.sort((a, b) => a.full_name.localeCompare(b.full_name));
  const rows = [];

  for (const r of repos) {
    const [owner, name] = r.full_name.split('/');
    let desc = (r.description || '').trim();
    if (!desc) {
      desc = await readmeSnippet(owner, name, r.default_branch || 'main');
      if (!desc && r.default_branch !== 'master') {
        desc = await readmeSnippet(owner, name, 'master');
      }
    }
    if (!desc) {
      desc = r.language ? `${r.language} repository.` : 'Self-hosted repo on git.levkin.ca.';
    }

    rows.push({
      full_name: r.full_name,
      name,
      html_url: r.html_url,
      language: r.language || '',
      description: desc,
    });
    await new Promise(res => setTimeout(res, 100));
  }

  console.log('// --- Replace PORTFOLIO.giteaRepos in js/data.js with: ---\n');
  console.log('  giteaRepos: [');
  for (const row of rows) {
    console.log(`    { full_name: ${jsString(row.full_name)}, name: ${jsString(row.name)}, html_url: ${jsString(row.html_url)}, language: ${jsString(row.language)}, description: ${jsString(row.description)} },`);
  }
  console.log('  ],');
  console.error(`\n// Done — ${rows.length} repos (API lists all public repos on page 1).`);
})();
