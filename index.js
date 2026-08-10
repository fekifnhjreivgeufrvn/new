const HTML_PAGE = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Leaderboard Test</title>
<style>
  :root { color-scheme: dark; }
  body {
    font-family: system-ui, -apple-system, sans-serif;
    background: #0f172a;
    color: #e2e8f0;
    max-width: 480px;
    margin: 40px auto;
    padding: 0 20px;
  }
  h1 { font-size: 1.5rem; margin-bottom: 4px; }
  p.sub { color: #94a3b8; margin-top: 0; font-size: 0.9rem; }
  form { display: flex; gap: 8px; margin: 20px 0; }
  input {
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 6px;
    padding: 8px 10px;
    color: #e2e8f0;
  }
  input[name="name"] { flex: 2; }
  input[name="score"] { flex: 1; }
  button {
    background: #6366f1;
    border: none;
    border-radius: 6px;
    padding: 8px 14px;
    color: white;
    font-weight: 600;
    cursor: pointer;
  }
  button:hover { background: #4f46e5; }
  table { width: 100%; border-collapse: collapse; margin-top: 10px; }
  th, td { text-align: left; padding: 8px; border-bottom: 1px solid #1e293b; }
  th { color: #94a3b8; font-size: 0.8rem; text-transform: uppercase; }
  tr:first-child td { color: #facc15; font-weight: 700; }
  #status { font-size: 0.85rem; color: #94a3b8; min-height: 1.2em; }
  button.reset {
    background: transparent;
    border: 1px solid #334155;
    color: #94a3b8;
    margin-top: 16px;
    font-weight: 400;
    font-size: 0.8rem;
  }
</style>
</head>
<body>
  <h1>🏆 Leaderboard Test</h1>
  <p class="sub">Submit a name + score, stored in Cloudflare KV.</p>
  <form id="scoreForm">
    <input name="name" placeholder="Name" maxlength="20" required>
    <input name="score" type="number" placeholder="Score" required>
    <button type="submit">Submit</button>
  </form>
  <div id="status"></div>
  <table>
    <thead><tr><th>#</th><th>Name</th><th>Score</th></tr></thead>
    <tbody id="scoresBody"></tbody>
  </table>
  <button class="reset" id="resetBtn">Clear leaderboard (test only)</button>

<script>
async function loadScores() {
  const res = await fetch('/api/scores');
  const data = await res.json();
  const body = document.getElementById('scoresBody');
  body.innerHTML = data.map((s, i) =>
    \`<tr><td>\${i + 1}</td><td>\${escapeHtml(s.name)}</td><td>\${s.score}</td></tr>\`
  ).join('');
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

document.getElementById('scoreForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const name = form.name.value.trim();
  const score = Number(form.score.value);
  const status = document.getElementById('status');
  status.textContent = 'Submitting...';
  try {
    const res = await fetch('/api/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, score })
    });
    if (!res.ok) throw new Error(await res.text());
    form.reset();
    status.textContent = 'Submitted!';
    await loadScores();
  } catch (err) {
    status.textContent = 'Error: ' + err.message;
  }
});

document.getElementById('resetBtn').addEventListener('click', async () => {
  if (!confirm('Clear all scores?')) return;
  await fetch('/api/reset', { method: 'POST' });
  await loadScores();
});

loadScores();
</script>
</body>
</html>`;

const KV_KEY = 'leaderboard';
const MAX_ENTRIES = 100;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/' && request.method === 'GET') {
      return new Response(HTML_PAGE, {
        headers: { 'content-type': 'text/html;charset=UTF-8' }
      });
    }

    if (url.pathname === '/api/scores' && request.method === 'GET') {
      const scores = await getScores(env);
      return json(scores.slice(0, 20));
    }

    if (url.pathname === '/api/scores' && request.method === 'POST') {
      let body;
      try {
        body = await request.json();
      } catch {
        return json({ error: 'Invalid JSON' }, 400);
      }

      const name = String(body.name || '').trim().slice(0, 20);
      const score = Number(body.score);

      if (!name || !Number.isFinite(score)) {
        return json({ error: 'name and numeric score required' }, 400);
      }

      const scores = await getScores(env);
      scores.push({ name, score, ts: Date.now() });
      scores.sort((a, b) => b.score - a.score);
      const trimmed = scores.slice(0, MAX_ENTRIES);

      await env.LEADERBOARD.put(KV_KEY, JSON.stringify(trimmed));
      return json({ ok: true });
    }

    if (url.pathname === '/api/reset' && request.method === 'POST') {
      await env.LEADERBOARD.put(KV_KEY, JSON.stringify([]));
      return json({ ok: true });
    }

    return new Response('Not found', { status: 404 });
  }
};

async function getScores(env) {
  const raw = await env.LEADERBOARD.get(KV_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' }
  });
}
