// SixRoll - a "roll six random letters, discover words and patterns" leaderboard game
// Inspired by RNGdle's number-pattern badge system, applied to letters instead of digits.
// Frontend design integrated from provided template.

const HTML_PAGE = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SixRoll — Roll. Discover. Compete.</title>
<meta name="description" content="Roll six random letters, uncover hidden words and patterns, and climb the leaderboard.">
<script>
(function () {
  try {
    var saved = localStorage.getItem("sixroll_theme");
    var dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var theme = saved === "light" || saved === "dark" ? saved : (dark ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", theme);
  } catch (e) {}
})();

(function () {
  try {
    var path = window.location.pathname;
    if (path === "/leaderboard") {
      document.documentElement.classList.add("leaderboard-page");
    } else if (path === "/account" || path.startsWith("/account/")) {
      document.documentElement.classList.add("account-page");
    } else if (path.startsWith("/roll/")) {
      document.documentElement.classList.add("detail-page");
    }
  } catch (e) {}
})();

  // Admin manual-score debug tool.
(function () {
  function initManualScoreDebug() {
    var btn=document.getElementById('manualScoreBtn'), form=document.getElementById('manualScoreForm'), submit=document.getElementById('manualScoreSubmit');
    if(!btn||!form||!submit||btn.dataset.bound==='1') return;
    btn.dataset.bound='1';
    btn.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();form.hidden=!form.hidden;form.style.display=form.hidden?'none':'grid';});
    submit.addEventListener('click',async function(e){
      e.preventDefault();e.stopPropagation();
      var name=document.getElementById('manualScoreName').value.trim(), word=document.getElementById('manualScoreWord').value.trim().toUpperCase(), ep=Number(document.getElementById('manualScoreEP').value), status=document.getElementById('manualScoreStatus');
      if(!name||!/^[A-Z]{6}$/.test(word)||!Number.isFinite(ep)||ep<0){if(status)status.textContent='Enter a name, 6-letter word and valid EP.';return;}
      submit.disabled=true;if(status)status.textContent='Saving...';
      try{var r=await fetch('/api/admin/manual-score',{method:'POST',headers:{'content-type':'application/json'},credentials:'same-origin',cache:'no-store',body:JSON.stringify({name:name,word:word,ep:ep})});var d={};try{d=await r.json()}catch(_){} if(!r.ok)throw new Error(d.error||('Request failed ('+r.status+')')); if(typeof leaderboardCache!=='undefined')leaderboardCache=d.leaderboard||[]; if(typeof renderLeaderboard==='function')renderLeaderboard(d.leaderboard||[]); if(status)status.textContent='Score added - leaderboard rebuilt.'; if(typeof showToast==='function')showToast('Manual score added');}catch(e){if(status)status.textContent='Failed: '+(e.message||'request error');}finally{submit.disabled=false;}
    });
  }
  function initDeleteScoreDebug() {
    var btn=document.getElementById('deleteScoreBtn'), form=document.getElementById('deleteScoreForm'), submit=document.getElementById('deleteScoreSubmit');
    if(!btn||!form||!submit||btn.dataset.bound==='1') return;
    btn.dataset.bound='1';
    btn.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();form.hidden=!form.hidden;form.style.display=form.hidden?'none':'grid';});
    submit.addEventListener('click',async function(e){
      e.preventDefault();e.stopPropagation();
      var name=document.getElementById('deleteScoreName').value.trim(), word=document.getElementById('deleteScoreWord').value.trim().toUpperCase(), status=document.getElementById('deleteScoreStatus');
      if(!name||!/^[A-Z]{6}$/.test(word)){if(status)status.textContent='Enter a name and 6-letter word.';return;}
      submit.disabled=true;if(status)status.textContent='Deleting...';
      try{var r=await fetch('/api/admin/delete-score',{method:'POST',headers:{'content-type':'application/json'},credentials:'same-origin',cache:'no-store',body:JSON.stringify({name:name,word:word})});var d={};try{d=await r.json()}catch(_){} if(!r.ok)throw new Error(d.error||('Request failed ('+r.status+')')); if(typeof leaderboardCache!=='undefined')leaderboardCache=d.leaderboard||[]; if(typeof renderLeaderboard==='function')renderLeaderboard(d.leaderboard||[]); if(status)status.textContent='Score deleted - leaderboard rebuilt.'; if(typeof showToast==='function')showToast('Score deleted'); document.getElementById('deleteScoreName').value=''; document.getElementById('deleteScoreWord').value='';}catch(e){if(status)status.textContent='Failed: '+(e.message||'request error');}finally{submit.disabled=false;}
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){initManualScoreDebug(); initDeleteScoreDebug();});else {initManualScoreDebug(); initDeleteScoreDebug();}
  new MutationObserver(function(){initManualScoreDebug(); initDeleteScoreDebug();}).observe(document.documentElement,{childList:true,subtree:true});
})();
</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  :root {
    --bg: #f5f5fb;
    --bg-elevated: #ffffff;
    --surface: #ffffff;
    --surface-2: #f0f0f8;
    --border: #e3e3ee;
    --border-strong: #cdcde2;
    --text: #14141f;
    --text-2: #52526b;
    --text-3: #8a8aa3;
    --accent: #6d5ef7;
    --accent-2: #9b7bff;
    --accent-contrast: #ffffff;
    --page-bg: #fbfbfc;
    --header-bg: rgba(255,255,255,.96);
    --card-bg: #ffffff;
    --soft-border: #e6e7eb;
    --placeholder: #c7c7ca;
    --tier-trash: #94a3b8;
    --tier-common: #a1a1aa;
    --tier-uncommon: #22c55e;
    --tier-rare: #3b82f6;
    --tier-epic: #a855f7;
    --tier-legendary: #f59e0b;
    --tier-mythic: #f43f5e;
    --tier-divine: #ec4899;
    --tier-cosmic: #8b5cf6;
    color-scheme: light;
  }
  html[data-theme="dark"] {
    --bg: #0a0a12;
    --bg-elevated: #121220;
    --surface: #13131f;
    --surface-2: #1a1a2c;
    --border: #262638;
    --border-strong: #34344c;
    --text: #f1f1f8;
    --text-2: #a8a8c2;
    --text-3: #6f6f8c;
    --accent: #7c6bff;
    --accent-2: #a78bff;
    --accent-contrast: #0a0a12;
    --page-bg: #0a0a12;
    --header-bg: rgba(10,10,18,.96);
    --card-bg: #13131f;
    --soft-border: #34344c;
    --placeholder: #777791;
    color-scheme: dark;
  }
  html[data-theme="dark"] body { background: #0a0a12; color: #f1f1f8; }
  html[data-theme="dark"] .result-card { background: #13131f; border-color: #262638; }
  html[data-theme="dark"] .site-header { background: rgba(10,10,18,.96); border-color: #262638; }
  html[data-theme="dark"] .name-field { border-color: #34344c; }
  html[data-theme="dark"] .badge-item, html[data-theme="dark"] .badge-slot { border-color: #34344c; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    font-family: "Inter", system-ui, -apple-system, sans-serif;
    background: var(--page-bg);
    color: var(--text);
    min-height: 100vh;
    transition: background .3s ease, color .3s ease;
    -webkit-font-smoothing: antialiased;
  }
  .mono { font-family: "Space Mono", ui-monospace, monospace; }

  /* ---------- accessibility: visible keyboard focus ---------- */
  a:focus-visible, button:focus-visible, input:focus-visible, [tabindex]:focus-visible {
    outline: 2px solid var(--accent); outline-offset: 2px; border-radius: 4px;
  }

  /* ---------- ambient background ---------- */
  .bg-decor { display: none; }
  .bg-decor::before, .bg-decor::after {
    content: ""; position: absolute; width: 60vmax; height: 60vmax; border-radius: 50%;
    filter: blur(90px);
  }
  .bg-decor::before { background: var(--accent); opacity: .22; top: -22%; left: -12%; animation: drift1 26s ease-in-out infinite alternate; }
  .bg-decor::after { background: var(--tier-legendary); opacity: .14; bottom: -26%; right: -16%; animation: drift2 30s ease-in-out infinite alternate; }
  @keyframes drift1 { from { transform: translate(0,0); } to { transform: translate(7%,9%); } }
  @keyframes drift2 { from { transform: translate(0,0); } to { transform: translate(-8%,-7%); } }

  /* ---------- header ---------- */
  .site-header {
    position: sticky; top: 0; z-index: 30;
    display: flex; align-items: center; justify-content: space-between;
    padding: 5px 12px; border-bottom: 1px solid var(--border);
    background: var(--header-bg);
    backdrop-filter: blur(10px);
  }
  .brand { display: flex; align-items: center; gap: 8px; font-weight: 800; font-size: .78rem; letter-spacing: .08em; }
  .brand-dice { font-size: .9rem; display: inline-block; animation: diceFloat 4s ease-in-out infinite; }
  @keyframes diceFloat { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-3px) rotate(8deg); } }
  .header-actions { display: flex; align-items: center; gap: 8px; }
  .header-link { color: var(--text-2); font-size: .68rem; font-weight: 700; letter-spacing: .06em; text-decoration: none; text-transform: uppercase; }
  .header-link:hover { color: var(--text); }
  .icon-btn {
    display: inline-flex; align-items: center; justify-content: center;
    width: 27px; height: 27px; border-radius: 7px; border: 1px solid var(--border);
    background: var(--surface); color: var(--text-2); cursor: pointer;
    transition: color .2s ease, border-color .2s ease, transform .2s ease, box-shadow .2s ease;
    text-decoration: none; font-size: 1rem;
  }
  .icon-btn:hover { color: var(--text); border-color: var(--border-strong); transform: translateY(-1px); box-shadow: 0 6px 14px -8px rgba(0,0,0,.4); }
  .icon-btn svg { width: 17px; height: 17px; }
  .theme-icon-sun, html[data-theme="dark"] .theme-icon-moon { display: none; }
  html[data-theme="dark"] .theme-icon-sun { display: inline-flex; }

  /* ---------- layout ---------- */
  .container { max-width: 420px; margin: 0 auto; padding: 108px 18px 70px; }

  .hero-card {
    background: transparent; border: 0; border-radius: 0;
    padding: 0; position: relative; overflow: visible;
    box-shadow: none;
    animation: cardIn .5s cubic-bezier(.2,.8,.2,1) both;
  }
  @keyframes cardIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  .hero-tag { text-align: center; color: var(--text-2); font-size: .78rem; line-height: 1.55; margin: 0 0 8px; }
  .roll-confirmation { min-height: 34px; text-align: center; }
  .roll-rarity { display: inline-flex; min-height: 24px; align-items: center; gap: 8px; padding: 4px 12px; border: 1px solid currentColor; border-radius: 999px; font-size: .68rem; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; opacity: 0; transition: opacity .35s ease, color .35s ease, background .35s ease; }
  .roll-rarity.show { opacity: 1; }

  .account-page-wrap { max-width: 980px; padding-top: 72px; display: grid; gap: 24px; }
  .account-grid { display: grid; grid-template-columns: minmax(280px, 360px) minmax(360px, 1fr); gap: 24px; align-items: start; }
  .account-card {
    width: 100%; padding: 24px 22px; border: 1px solid var(--border); border-radius: 24px;
    background: var(--surface); box-shadow: 0 10px 24px -14px rgba(0,0,0,.12);
    border-left: 4px solid rgba(109,94,247,.18);
    display: grid; gap: 20px;
  }
  .auth-title { margin: 0 0 8px; font-size: 1rem; font-weight: 800; letter-spacing: .02em; }
  .auth-hint { margin: 0 0 14px; color: var(--text-3); font-size: .88rem; line-height: 1.6; }
  #accountOverview[hidden] { display: none; }
  .profile-header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
  .profile-meta { display: flex; align-items: center; gap: 14px; }
  .profile-title-block { display: grid; gap: 6px; }
  .profile-title { margin: 0; font-size: 1.35rem; font-weight: 800; }
  .profile-subtitle { margin: 0; color: var(--text-2); font-size: .94rem; }
    .profile-stats-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; margin-bottom: 24px; }
  .account-page-wrap.public-profile .account-grid { grid-template-columns: 1fr; }
  .account-page-wrap.public-profile .account-card { display: none; }
  .account-page-wrap.public-profile .profile-overview { grid-column: 1 / -1; }
  .profile-stats-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; margin-bottom: 24px; }
  .profile-field { border-radius: 20px; background: var(--surface); border: 1px solid var(--border); padding: 18px; box-shadow: inset 0 1px 0 rgba(255,255,255,.6); }
  .profile-field-label { display: block; color: var(--text-3); font-size: .72rem; letter-spacing: .08em; text-transform: uppercase; margin-bottom: 8px; }
  .profile-field-value { display: block; font-size: 1.12rem; font-weight: 700; color: var(--text); }
  .recent-rolls { display: grid; gap: 14px; }
  .recent-rolls #recentRolls { display: grid; gap: 12px; }
  .recent-roll { display: grid; gap: 8px; padding: 18px 20px; border-radius: 22px; background: var(--surface); border: 1px solid var(--border); box-shadow: 0 10px 22px -18px rgba(0,0,0,.12); }
  .recent-roll-word { font-size: 1rem; font-weight: 700; letter-spacing: .04em; margin-bottom: 2px; }
  .recent-roll-meta { display: flex; flex-wrap: wrap; gap: 10px; color: var(--text-2); font-size: .82rem; }
  .profile-panel { width: 100%; }
  .account-back-link { display: inline-flex; justify-content: center; width: 100%; max-width: 320px; margin: 0 auto; padding: 12px 0; border-radius: 999px; border: 1px solid transparent; background: rgba(109,94,247,.06); color: var(--accent); font-weight: 700; text-decoration: none; transition: background .2s ease, border-color .2s ease; }
  .account-back-link:hover { background: rgba(109,94,247,.12); border-color: var(--accent); }
  .auth-controls { display: flex; gap: 8px; margin-top: 12px; }
  .auth-form { display: flex; flex-direction: column; gap: 10px; }
  .auth-input {
    flex: 1; width: 100%; border: 1px solid var(--border); border-radius: 18px; background: var(--surface-2); color: var(--text);
    font: inherit; padding: 14px 16px; min-width: 0; transition: border-color .2s ease, box-shadow .2s ease, background .2s ease;
  }
  .auth-input:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 22%, transparent); }
  .auth-input.editing { background: var(--surface); border-color: var(--accent); }
  .auth-btn, .auth-btn-secondary {
    border-radius: 16px; padding: 13px 16px; font: 700 .92rem inherit; cursor: pointer;
    transition: transform .15s ease, opacity .15s ease, color .15s ease, background .15s ease, border-color .15s ease;
  }
  .auth-btn {
    border: 1px solid var(--border); background: var(--accent); color: var(--accent-contrast);
    box-shadow: 0 10px 24px -18px rgba(109,94,247,.35);
  }
  .auth-btn-secondary {
    border: 1px solid var(--border); background: var(--surface); color: var(--text-2);
    box-shadow: 0 8px 18px -16px rgba(0,0,0,.06);
  }
  .auth-btn:hover, .auth-btn-secondary:hover { opacity: .95; transform: translateY(-1px); }
  .auth-btn:active, .auth-btn-secondary:active { transform: translateY(0); }
  .auth-btn-block { width: 100%; margin-top: 12px; }
  .auth-divider { display: flex; align-items: center; gap: 10px; margin: 18px 0; color: var(--text-3); font-size: .7rem; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; }
  .auth-divider::before, .auth-divider::after { content: ""; flex: 1; height: 1px; background: var(--border); }
  .auth-profile {
    display: flex; align-items: center; gap: 14px; margin-bottom: 16px;
    background: var(--surface-2); border: 1px solid var(--border); border-radius: 20px;
    padding: 14px 16px;
  }
  .auth-avatar {
    width: 50px; height: 50px; flex-shrink: 0; border-radius: 50%; background: var(--accent); color: var(--accent-contrast);
    display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.2rem;
  }
  .auth-email { font-weight: 700; font-size: .96rem; }
  .auth-subtitle { color: var(--text-3); font-size: .78rem; margin-top: 2px; }
  .account-actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 18px; }
  .auth-input:disabled { opacity: .74; background: var(--surface-2); cursor: default; }
  .auth-btn:disabled { opacity: .55; cursor: not-allowed; }
  .name-field {
    display: flex; align-items: center; gap: 10px;
    background: transparent; border: 0; border-bottom: 1px solid var(--soft-border); border-radius: 0;
    padding: 7px 2px; margin: 0 0 8px; transition: border-color .2s ease, box-shadow .2s ease;
  }
  .name-field label { width: 120px; font-size: .75rem; text-transform: uppercase; letter-spacing: .06em; color: var(--text-3); }
  .name-field input { flex: 1; border: 0; background: transparent; color: var(--text); font-size: .98rem; outline: none; font-family: inherit; min-width: 0; }
  .name-field:focus-within { border-color: var(--accent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 22%, transparent); }
  .name-field label { font-size: .62rem; text-transform: uppercase; letter-spacing: .08em; color: var(--text-3); white-space: nowrap; }
  .name-field input { flex: 1; border: 0; background: transparent; color: var(--text); font-size: .95rem; outline: none; font-family: inherit; min-width: 0; }
  .name-field input::placeholder { color: var(--text-3); }
  .auth-status {
    margin-top: 12px; min-height: 1.2em; font-size: .78rem; color: var(--text-2);
  }
  .auth-status.success { color: var(--tier-uncommon); }
  .auth-status.error { color: var(--tier-mythic); }

  .profile-overview { display: grid; gap: 18px; margin-top: 18px; padding: 20px; border-radius: 24px; background: var(--surface); border: 1px solid var(--border); box-shadow: 0 10px 24px -16px rgba(0,0,0,.08); border-left: 4px solid rgba(109,94,247,.18); }
  .profile-overview-head { display: flex; align-items: center; gap: 14px; }
  .profile-overview-head .auth-avatar { width: 52px; height: 52px; font-size: 1.2rem; }
  .profile-summary-title { margin: 0; font-size: 1.18rem; font-weight: 800; }
  .profile-summary-note { margin: 4px 0 0; color: var(--text-2); font-size: .88rem; }
  .profile-field-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
  .profile-field {
    border-radius: 18px; background: var(--surface); border: 1px solid var(--border);
    padding: 16px;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.5);
  }
  .profile-field-label { display: block; color: var(--text-3); font-size: .68rem; text-transform: uppercase; letter-spacing: .08em; margin-bottom: 4px; }
  .profile-field-value { display: block; font-size: 1rem; font-weight: 700; color: var(--text); }
  .profile-description { margin: 0; color: var(--text-2); line-height: 1.5; }
  .profile-section-title { margin: 0 0 10px; font-size: .92rem; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: var(--text-3); }
  .recent-rolls { display: grid; gap: 10px; }
  .recent-roll { display: grid; grid-template-columns: 1fr auto; gap: 10px; padding: 16px 18px; border-radius: 20px; background: var(--surface); border: 1px solid var(--border); box-shadow: 0 10px 20px -16px rgba(0,0,0,.08); }
  .recent-roll-main { min-width: 0; }
  .recent-roll-word { font-family: "Space Mono", monospace; font-weight: 700; letter-spacing: .08em; display: block; color: var(--text); }
  .recent-roll-meta { display: flex; gap: 8px; flex-wrap: wrap; color: var(--text-3); font-size: .78rem; }
  .recent-roll-ep { color: var(--accent); font-weight: 700; }
  .lb-name-btn { all: unset; cursor: pointer; color: inherit; font: inherit; display: inline; }
  .lb-name-btn:hover { text-decoration: underline; }

  /* ---------- tiles ---------- */
  .tiles { display: flex; gap: 2px; justify-content: center; perspective: 800px; margin: 0 0 20px; }
  .tile {
    width: 38px; height: 48px;
    background: transparent; border: 0; border-radius: 0;
    display: flex; align-items: center; justify-content: center;
    font-family: "Space Mono", monospace; font-weight: 700; font-size: 2.15rem; color: var(--placeholder);
    transform-style: preserve-3d;
    transition: border-color .35s ease, box-shadow .35s ease, background .35s ease;
  }
  .tile.rolling { animation: none; color: var(--text-2); }
  .tile.settled {
    animation: tileSettle .5s cubic-bezier(.34,1.56,.64,1);
    color: var(--text); border-color: transparent;
    background: transparent; box-shadow: none;
  }
  @keyframes tileSettle { 0% { transform: scale(1.2) rotateX(0); } 55% { transform: scale(.92); } 100% { transform: scale(1); } }
  .tile.tile-highlight {
    border-color: transparent;
    background: transparent;
    animation: tileSettle .5s cubic-bezier(.34,1.56,.64,1);
  }
  @keyframes tilePulse {
    0%,100% { box-shadow: 0 0 0 1px var(--tier-color) inset, 0 0 10px -2px var(--tier-color); }
    50% { box-shadow: 0 0 0 1px var(--tier-color) inset, 0 0 26px 2px var(--tier-color); }
  }

  /* ---------- roll button + cooldown ---------- */
  .roll-area { display: flex; flex-direction: column; align-items: center; gap: 12px; }
  .roll-btn {
    position: relative; overflow: hidden; border: none; border-radius: 14px;
    width: 228px; padding: 13px 30px; font-size: 1rem; font-weight: 800; letter-spacing: .1em; font-family: inherit;
    color: #fff; background: #080808;
    cursor: pointer; box-shadow: 0 0 0 2px #2e9cff, 0 8px 22px -8px rgba(46,156,255,.5);
    transition: transform .15s ease, box-shadow .2s ease, background .2s ease, color .2s ease;
  }
  .roll-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 0 0 2px #ff65bc, 0 12px 28px -8px rgba(255,101,188,.5); }
  .roll-btn:active:not(:disabled) { transform: translateY(0) scale(.97); }
  .roll-btn:disabled { cursor: not-allowed; background: var(--surface-2); color: var(--text-3); box-shadow: none; }
  .roll-btn.is-rolling { cursor: wait; background: #272733; color: #8f8fa4; box-shadow: 0 0 0 2px #57576b; }
  .roll-btn .btn-shimmer { position: absolute; inset: 0; background: linear-gradient(120deg, transparent, rgba(255,255,255,.35), transparent); transform: translateX(-120%); }
  .roll-btn:not(:disabled) .btn-shimmer { animation: shimmer 2.8s ease-in-out infinite; }
  @keyframes shimmer { 0% { transform: translateX(-120%); } 60%,100% { transform: translateX(120%); } }

  .cooldown-wrap { width: 220px; display: flex; flex-direction: column; align-items: center; gap: 6px; margin-top: 4px; }
  .cooldown-bar { width: 100%; height: 4px; border-radius: 99px; background: var(--surface-2); overflow: hidden; }
  .cooldown-fill { height: 100%; width: 0%; background: linear-gradient(90deg, var(--accent), var(--accent-2)); }
  .cooldown-text { font-size: .78rem; color: var(--text-3); }

  .unlimited-badge {
    display: none; font-size: .68rem; font-weight: 700; color: var(--tier-legendary);
    border: 1px solid var(--tier-legendary); border-radius: 999px; padding: 3px 12px;
    letter-spacing: .05em; text-transform: uppercase;
  }

  /* ---------- result ---------- */
  .result-card {
    position: relative; margin-top: 26px; border-radius: 6px; border: 1px solid var(--border);
    background: var(--card-bg); padding: 16px; opacity: 0; transform: translateY(14px) scale(.98);
    pointer-events: none; transition: opacity .4s ease, transform .4s cubic-bezier(.2,.8,.2,1);
    overflow: hidden;
  }
  .result-card.show { opacity: 1; transform: translateY(0) scale(1); pointer-events: auto; }
  .result-glow {
    position: absolute; inset: -40% -10% auto -10%; height: 220px;
    background: radial-gradient(circle, var(--tier-color, var(--accent)) 0%, transparent 70%);
    opacity: .28; filter: blur(14px); pointer-events: none; transition: background .3s ease;
  }
  .result-header { display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 10px 12px; margin-bottom: 18px; position: relative; z-index: 1; }
  .result-total { display: flex; align-items: baseline; gap: 6px; }
  .result-letters { font-family: "Space Mono", monospace; font-weight: 700; font-size: 1.55rem; letter-spacing: .1em; }
  .tier-badge {
    font-size: .74rem; font-weight: 800; text-transform: uppercase; letter-spacing: .06em;
    padding: 6px 14px; border-radius: 999px; color: var(--tier-color);
    background: color-mix(in srgb, var(--tier-color) 16%, transparent);
    border: 1px solid color-mix(in srgb, var(--tier-color) 45%, transparent);
  }
  .tier-badge.shimmer-tag {
    background-image: linear-gradient(120deg, color-mix(in srgb, var(--tier-color) 16%, transparent) 0%, color-mix(in srgb, var(--tier-color) 40%, transparent) 50%, color-mix(in srgb, var(--tier-color) 16%, transparent) 100%);
    background-size: 200% 100%; animation: tagShimmer 2.2s linear infinite;
  }
  @keyframes tagShimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

  /* ---------- tier identity ----------
     Every rarity pill (hero roll, leaderboard, detail page) shares this system so a tier
     reads as a distinct "material" at a glance, not just recolored text in a pill outline. */
  .roll-rarity .tier-label { position: relative; z-index: 1; }
  .roll-rarity.rarity-trash, .roll-rarity.rarity-common { box-shadow: none; }
  .roll-rarity.rarity-uncommon { box-shadow: 0 0 10px -5px currentColor; }
  .roll-rarity.rarity-rare { box-shadow: 0 0 13px -5px currentColor; }
  .roll-rarity.rarity-epic {
    box-shadow: 0 0 16px -4px currentColor;
    animation: tierPulse 2.6s ease-in-out infinite;
  }
  .roll-rarity.rarity-legendary {
    box-shadow: 0 0 20px -3px currentColor;
    background-image: linear-gradient(120deg, color-mix(in srgb, currentColor 14%, transparent) 0%, color-mix(in srgb, currentColor 34%, transparent) 50%, color-mix(in srgb, currentColor 14%, transparent) 100%);
    background-size: 220% 100%;
    animation: tierPulse 2s ease-in-out infinite, tierShimmer 2.6s linear infinite;
  }
  .roll-rarity.rarity-mythic, .roll-rarity.rarity-divine, .roll-rarity.rarity-cosmic {
    box-shadow: 0 0 24px -2px currentColor;
    background-image: linear-gradient(120deg, color-mix(in srgb, currentColor 18%, transparent) 0%, color-mix(in srgb, currentColor 44%, transparent) 50%, color-mix(in srgb, currentColor 18%, transparent) 100%);
    background-size: 220% 100%;
    animation: tierPulse 1.3s ease-in-out infinite, tierShimmer 1.7s linear infinite;
  }
  @keyframes tierPulse { 0%, 100% { filter: brightness(1); } 50% { filter: brightness(1.22); } }
  @keyframes tierShimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
  /* compact version for tight spaces like leaderboard rows */
  .tier-dot-mini { display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: currentColor; margin-right: 5px; box-shadow: 0 0 0 2px color-mix(in srgb, currentColor 20%, transparent); vertical-align: middle; }
  .tier-dot-mini.rarity-epic, .tier-dot-mini.rarity-legendary, .tier-dot-mini.rarity-mythic, .tier-dot-mini.rarity-divine, .tier-dot-mini.rarity-cosmic { animation: tierPulse 2s ease-in-out infinite; }

  .badge-list { list-style: none; margin: 0 0 14px; padding: 0; display: flex; flex-direction: column; gap: 8px; position: relative; z-index: 1; }
  .badge-item {
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
    background: var(--surface-2); border: 1px solid var(--border); border-left: 3px solid var(--badge-color, var(--border));
    border-radius: 10px; padding: 10px 14px;
    opacity: 0; transform: translateX(-8px); animation: badgeIn .55s ease var(--badge-delay, 0ms) both;
  }
  .badge-item.rarity-trash { background: color-mix(in srgb, var(--badge-color) 4%, var(--surface)); }
  .badge-item.rarity-common { background: color-mix(in srgb, var(--badge-color) 8%, var(--surface)); }
  .badge-item.rarity-uncommon { background: color-mix(in srgb, var(--badge-color) 12%, var(--surface)); }
  .badge-item.rarity-rare { background: linear-gradient(110deg, color-mix(in srgb, var(--badge-color) 16%, var(--surface)), var(--surface)); }
  .badge-item.rarity-epic { background: linear-gradient(110deg, color-mix(in srgb, var(--badge-color) 22%, var(--surface)), color-mix(in srgb, var(--badge-color) 5%, var(--surface))); }
  .badge-item.rarity-legendary { background: linear-gradient(110deg, color-mix(in srgb, var(--badge-color) 28%, var(--surface)), color-mix(in srgb, var(--badge-color) 8%, var(--surface)), color-mix(in srgb, var(--badge-color) 22%, var(--surface))); background-size: 180% 100%; animation-name: badgeIn, badgeGradient; animation-duration: .55s, 3s; animation-delay: var(--badge-delay), .7s; animation-iteration-count: 1, infinite; }
  .badge-item.rarity-mythic, .badge-item.rarity-divine, .badge-item.rarity-cosmic { background: linear-gradient(110deg, color-mix(in srgb, var(--badge-color) 32%, var(--surface)), color-mix(in srgb, var(--badge-color) 8%, var(--surface)), color-mix(in srgb, var(--badge-color) 30%, var(--surface))); background-size: 180% 100%; animation-name: badgeIn, badgeGradient; animation-duration: .55s, 2.2s; animation-delay: var(--badge-delay), .7s; animation-iteration-count: 1, infinite; }
  html[data-theme="dark"] .badge-item.rarity-trash { background: color-mix(in srgb, var(--badge-color) 7%, var(--surface)); }
  html[data-theme="dark"] .badge-item.rarity-common { background: color-mix(in srgb, var(--badge-color) 11%, var(--surface)); }
  html[data-theme="dark"] .badge-item.rarity-uncommon { background: color-mix(in srgb, var(--badge-color) 15%, var(--surface)); }
  .badge-item.rarity-epic, .badge-item.rarity-legendary, .badge-item.rarity-mythic { box-shadow: 0 0 18px -8px var(--badge-color); }
  .badge-item.rarity-legendary { animation-name: badgeIn, badgeGlow; animation-duration: .55s, 2.2s; animation-delay: var(--badge-delay), .7s; animation-iteration-count: 1, infinite; }
  .badge-item.rarity-mythic { animation-name: badgeIn, badgeGlow; animation-duration: .55s, 1.4s; animation-delay: var(--badge-delay), .7s; animation-iteration-count: 1, infinite; }
  .badge-item.rarity-epic { border-color: color-mix(in srgb, var(--badge-color) 55%, var(--border)); }
  @keyframes badgeGlow { 0%,100% { box-shadow: 0 0 18px -8px var(--badge-color); } 50% { box-shadow: 0 0 26px 1px var(--badge-color); } }
  @keyframes badgeGradient { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
  @keyframes badgeIn { to { opacity: 1; transform: translateX(0); } }
  .badge-name { font-weight: 700; font-size: .9rem; }
  .badge-icon { display: inline-block; width: 1.35em; margin-right: 4px; }
  .badge-desc { display: block; color: var(--text-3); font-size: .76rem; margin-top: 2px; }
  .badge-ep { font-family: "Space Mono", monospace; font-weight: 700; white-space: nowrap; color: var(--badge-color, var(--text)); }
  .badge-slots { display: flex; gap: 3px; margin-top: 8px; padding-top: 7px; border-top: 1px solid var(--border); }
  .badge-slot { width: 22px; height: 22px; display: inline-flex; align-items: center; justify-content: center; border: 1px solid var(--border); border-radius: 4px; color: var(--text-3); background: var(--surface); font: 700 .68rem "Space Mono", monospace; }
  .badge-slot.active { color: var(--text); border-color: var(--badge-color); background: color-mix(in srgb, var(--badge-color) 18%, var(--surface)); box-shadow: 0 0 0 1px color-mix(in srgb, var(--badge-color) 25%, transparent); }
  .badge-slot.active { animation: slotPop .45s cubic-bezier(.2,.8,.2,1) both; }
  .rarity-legendary .badge-slot.active, .rarity-mythic .badge-slot.active { animation: slotPop .45s cubic-bezier(.2,.8,.2,1) both, slotGlow 1.5s ease-in-out .45s infinite; }
  @keyframes slotPop { from { transform: scale(.7); opacity: .35; } to { transform: scale(1); opacity: 1; } }
  @keyframes slotGlow { 0%,100% { box-shadow: 0 0 0 1px color-mix(in srgb, var(--badge-color) 35%, transparent); } 50% { box-shadow: 0 0 12px 2px var(--badge-color); } }

  .supporting { font-size: .78rem; color: var(--text-3); margin-bottom: 14px; position: relative; z-index: 1; }
  .result-footer {
    display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;
    position: relative; z-index: 1; padding-top: 14px; border-top: 1px dashed var(--border);
  }
  .total-ep-label { font-size: .7rem; text-transform: uppercase; letter-spacing: .08em; color: var(--text-3); }
  .total-ep-value { font-family: "Space Mono", monospace; font-weight: 700; font-size: 1.6rem; color: var(--tier-color); transition: color .3s ease; }
  .total-ep-unit { font-size: .78rem; color: var(--text-3); }
  .share-btn {
    border: 1px solid var(--border); background: var(--surface); color: var(--text-2);
    padding: 9px 16px; border-radius: 10px; font-size: .82rem; font-weight: 600; font-family: inherit;
    cursor: pointer; transition: border-color .2s ease, color .2s ease, transform .2s ease;
  }
  .share-btn:hover { border-color: var(--border-strong); color: var(--text); transform: translateY(-1px); }

  /* ---------- leaderboard podium polish ---------- */
  .lb-body-row.rank-1, .lb-body-row.rank-2, .lb-body-row.rank-3 {
    position: relative;
    overflow: hidden;
    border-left: 3px solid var(--podium-color);
    background: color-mix(in srgb, var(--podium-color) 8%, var(--surface));
  }
  .lb-body-row.rank-1 { --podium-color: #f5b301; box-shadow: 0 0 24px -12px #f5b301; }
  .lb-body-row.rank-2 { --podium-color: #94a3b8; box-shadow: 0 0 20px -13px #94a3b8; }
  .lb-body-row.rank-3 { --podium-color: #cd7f32; box-shadow: 0 0 20px -13px #cd7f32; }
  .lb-body-row.rank-1::after, .lb-body-row.rank-2::after, .lb-body-row.rank-3::after {
    content: ""; position:absolute; inset:0; pointer-events:none;
    background: linear-gradient(110deg, transparent, color-mix(in srgb, var(--podium-color) 10%, transparent), transparent);
    transform: translateX(-110%); animation: podiumSweep 3.2s ease-in-out infinite;
  }
  .lb-body-row.rank-1 .lb-rank { font-size: 1.05rem; filter: drop-shadow(0 0 7px #f5b301); }
  .lb-body-row.rank-2 .lb-rank { font-size: 1rem; filter: drop-shadow(0 0 6px #94a3b8); }
  .lb-body-row.rank-3 .lb-rank { font-size: 1rem; filter: drop-shadow(0 0 6px #cd7f32); }
  .lb-body-row.rank-1 .lb-word, .lb-body-row.rank-2 .lb-word, .lb-body-row.rank-3 .lb-word { font-weight: 850; }
  @keyframes podiumSweep { 0%,65%,100% { transform:translateX(-110%); opacity:0; } 75% { opacity:1; } 90% { transform:translateX(110%); opacity:0; } }

  /* ---------- rarity-specific roll reveal ---------- */
  .result-card.reveal-common .result-header { animation: revealCommon .45s ease both; }
  .result-card.reveal-uncommon .result-header { animation: revealUncommon .6s cubic-bezier(.2,.8,.2,1) both; }
  .result-card.reveal-rare .result-header { animation: revealRare .72s cubic-bezier(.2,.8,.2,1) both; }
  .result-card.reveal-epic .result-header { animation: revealEpic .82s cubic-bezier(.16,1,.3,1) both; }
  .result-card.reveal-legendary .result-header { animation: revealLegendary .95s cubic-bezier(.16,1,.3,1) both; }
  .result-card.reveal-mythic .result-header { animation: revealMythic 1s cubic-bezier(.16,1,.3,1) both; }
  .result-card.reveal-divine .result-header { animation: revealDivine 1.05s cubic-bezier(.16,1,.3,1) both; }
  .result-card.reveal-cosmic .result-header { animation: revealCosmic 1.2s cubic-bezier(.16,1,.3,1) both; }
  .result-card.reveal-legendary, .result-card.reveal-mythic, .result-card.reveal-divine, .result-card.reveal-cosmic { --reveal-color: var(--tier-color); }
  .result-card.reveal-legendary .roll-rarity, .result-card.reveal-mythic .roll-rarity, .result-card.reveal-divine .roll-rarity, .result-card.reveal-cosmic .roll-rarity { animation: rarityPillReveal .8s cubic-bezier(.16,1,.3,1) both; }
  @keyframes revealCommon { from { opacity:.5; transform:translateY(5px); } to { opacity:1; transform:none; } }
  @keyframes revealUncommon { 0% { opacity:.5; transform:scale(.96); } 60% { transform:scale(1.025); } 100% { opacity:1; transform:scale(1); } }
  @keyframes revealRare { 0% { opacity:.45; transform:translateY(8px); filter:brightness(.8); } 55% { filter:brightness(1.35); } 100% { opacity:1; transform:none; filter:none; } }
  @keyframes revealEpic { 0% { opacity:0; transform:scale(.9); filter:brightness(.7); } 55% { opacity:1; transform:scale(1.045); filter:brightness(1.45); } 100% { transform:scale(1); filter:brightness(1); } }
  @keyframes revealLegendary { 0% { opacity:0; transform:scale(.86) rotate(-1deg); filter:brightness(.65); } 35% { opacity:1; transform:scale(1.07) rotate(.5deg); filter:brightness(1.8); } 60% { transform:scale(.99); } 100% { transform:scale(1); filter:brightness(1); } }
  @keyframes revealMythic { 0% { opacity:0; transform:translateY(12px) scale(.82); filter:saturate(.5) brightness(.6); } 38% { opacity:1; transform:translateY(-3px) scale(1.08); filter:saturate(1.5) brightness(1.7); } 60% { transform:translateY(0) scale(.99); } 100% { transform:none; filter:none; } }
  @keyframes revealDivine { 0% { opacity:0; transform:scale(.78); box-shadow:0 0 0 transparent; } 45% { opacity:1; transform:scale(1.08); box-shadow:0 0 38px -4px var(--reveal-color); } 100% { transform:scale(1); } }
  @keyframes revealCosmic { 0% { opacity:0; transform:scale(.72) rotate(-2deg); filter:blur(2px) saturate(.4); } 35% { opacity:1; transform:scale(1.1) rotate(1deg); filter:blur(0) saturate(1.8) brightness(1.8); } 58% { transform:scale(.98) rotate(0); } 100% { transform:scale(1); filter:saturate(1) brightness(1); } }
  @keyframes rarityPillReveal { from { opacity:0; transform:translateY(8px) scale(.82); } to { opacity:1; transform:none; } }

  /* clickable badge entries */
  .badge-item { cursor: pointer; transition: transform .18s ease, border-color .18s ease, filter .18s ease; }
  .badge-item:hover { transform: translateX(3px); filter:brightness(1.04); }
  .badge-item:focus-visible { outline:2px solid var(--badge-color, var(--accent)); outline-offset:2px; }
  .badge-item .badge-open-hint { color:var(--text-3); font-size:.58rem; margin-left:8px; letter-spacing:.06em; text-transform:uppercase; }

  /* ---------- badge detail page ---------- */
  html.badge-detail-route .hero-card, html.badge-detail-route .result-card, html.badge-detail-route .leaderboard, html.badge-detail-route .detail-card, html.badge-detail-route .admin-panel, html.badge-detail-route .account-page-wrap { display:none; }
  html.badge-detail-route .container { max-width:680px; padding-top:64px; }
  .badge-detail-page { display:none; gap:18px; }
html.badge-detail-route .badge-detail-page { display:grid; }
  .badge-detail-back { border:1px solid var(--border); background:var(--surface); color:var(--text-2); border-radius:8px; padding:7px 11px; cursor:pointer; font:600 .78rem inherit; width:max-content; margin:0 0 2px; }
  .badge-detail-back:hover { color:var(--text); border-color:var(--border-strong); }
  .badge-detail-card { position:relative; overflow:hidden; border:1px solid var(--border); border-left:4px solid var(--badge-color); background:color-mix(in srgb,var(--badge-color) 8%,var(--surface)); padding:22px; border-radius:10px; box-shadow:0 0 26px -13px var(--badge-color); }
  .badge-detail-card.rarity-legendary, .badge-detail-card.rarity-mythic, .badge-detail-card.rarity-divine, .badge-detail-card.rarity-cosmic { background:linear-gradient(110deg,color-mix(in srgb,var(--badge-color) 22%,var(--surface)),color-mix(in srgb,var(--badge-color) 6%,var(--surface)),color-mix(in srgb,var(--badge-color) 18%,var(--surface))); background-size:180% 100%; animation:badgeGradient 2.4s ease-in-out infinite; }
  .badge-detail-icon { font-size:2.4rem; line-height:1; }
  .badge-detail-name { margin:10px 0 4px; font-size:1.35rem; font-weight:850; }
  .badge-detail-family { color:var(--text-3); font-size:.68rem; letter-spacing:.09em; text-transform:uppercase; }
  .badge-detail-ep { margin-top:14px; font:800 1rem "Space Mono",monospace; color:var(--badge-color); }
  .badge-detail-explanation { margin:20px 0 0; padding-top:16px; border-top:1px dashed var(--border); color:var(--text-2); font-size:.84rem; line-height:1.7; }

  /* ---------- leaderboard ---------- */
  .leaderboard { margin-top: 44px; }
  .leaderboard-page-title { margin: 0 0 14px; font-size: 1.15rem; letter-spacing: .08em; text-transform: uppercase; }
  .featured-roll { max-width: 300px; margin: 0 auto 18px; padding: 14px; text-align: center; border: 1px solid var(--border); border-radius: 8px; background: var(--card-bg); }
  .featured-label { color: var(--text-3); font-size: .6rem; letter-spacing: .1em; text-transform: uppercase; }
  .featured-word { margin: 8px 0 5px; font: 700 2rem "Space Mono", monospace; }
  .featured-meta { color: var(--text-2); font-size: .72rem; }
  .featured-stats { display: flex; align-items: center; justify-content: center; gap: 8px; flex-wrap: wrap; }
  .featured-by { color: var(--text-3); font-size: .74rem; }
  .leaderboard h2 { display: flex; align-items: center; gap: 8px; font-size: 1.05rem; margin: 0 0 14px; }
  .lb-table { border: 1px solid var(--border); border-radius: 12px; overflow: hidden; background: var(--surface); }
  .lb-row { display: grid; grid-template-columns: 36px 1fr 1fr 80px 100px; align-items: center; gap: 12px; padding: 12px 16px; font-size: .85rem; border-bottom: 1px solid var(--border); animation: rowIn .35s ease both; }
  .lb-head { color: var(--text-3); font-size: .68rem; text-transform: uppercase; letter-spacing: .06em; font-weight: 700; }
  .lb-body-row { transition: background .15s ease; }
  .lb-body-row:last-child { border-bottom: none; }
  .lb-body-row:hover { background: var(--surface-2); }
  .lb-body-row.me { background: color-mix(in srgb, var(--accent) 8%, transparent); }
  .lb-body-row.rank-1 { border-left: 3px solid #f59e0b; background: color-mix(in srgb, #f59e0b 5%, var(--surface)); }
  .lb-body-row.rank-2 { border-left: 3px solid #a78bff; background: color-mix(in srgb, #a78bff 4%, var(--surface)); }
  .lb-body-row.rank-3 { border-left: 3px solid #8b5cf6; background: color-mix(in srgb, #8b5cf6 3%, var(--surface)); }
  @keyframes rowIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
  .lb-row.pulse { animation: lb-pulse 2s ease-in-out 1; }
  .lb-row.pulse .lb-name { animation: lb-name-pulse 800ms ease-in-out 0s 3; }
  @keyframes lb-name-pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.08); } }
  @keyframes lb-pulse { 0% { box-shadow: inset 0 0 0 0 rgba(0,0,0,0); } 50% { box-shadow: inset 0 0 0 12px rgba(125,90,255,0.08); } 100% { box-shadow: inset 0 0 0 0 rgba(0,0,0,0); } }
  .lb-rank { font-weight: 700; color: var(--text-3); }
  .lb-tier { font-size: .63rem; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; padding: 3px 7px; border-radius: 3px; background: transparent; color: currentColor; border: 1px solid currentColor; }
  .lb-word { font-family: "Space Mono", monospace; font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .lb-word-btn { display: block; width: 100%; padding: 0; border: 0; background: transparent; color: inherit; text-align: left; font: inherit; cursor: pointer; text-decoration: underline; text-decoration-color: color-mix(in srgb, currentColor 40%, transparent); text-underline-offset: 3px; }
  .lb-word-btn:hover { text-decoration-color: currentColor; }
  .lb-name { font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .lb-name-btn { display: block; width: 100%; padding: 0; border: 0; background: transparent; color: inherit; text-align: left; font: inherit; cursor: pointer; }
  .lb-name-btn:hover { text-decoration: underline; }
  .lb-ep { font-family: "Space Mono", monospace; font-weight: 700; }
  .lb-rolls, .lb-best { font-family: "Space Mono", monospace; color: var(--text-2); font-size: .8rem; }
  .lb-empty { padding: 26px; text-align: center; color: var(--text-3); font-size: .85rem; }
  .detail-card { display: none; margin-top: 26px; padding: 18px; border: 1px solid var(--border); border-radius: 10px; background: var(--card-bg); }
  .detail-card.show { display: block; }
  html.detail-page .hero-card, html.detail-page .result-card, html.detail-page .leaderboard, html.detail-page .admin-panel { display: none; }
  html.detail-page .container { padding-top: 42px; }
  html.detail-page .detail-card { display: block; margin-top: 0; }
  html.leaderboard-page .hero-card, html.leaderboard-page .result-card, html.leaderboard-page .detail-card, html.leaderboard-page .admin-panel { display: none; }
  html.leaderboard-page .container { max-width: 720px; padding-top: 34px; }
  html.leaderboard-page .leaderboard { margin-top: 0; }
  html:not(.leaderboard-page):not(.detail-page) .leaderboard { display: none; }
  html.leaderboard-page .leaderboard:not(.ready) { display: none; }
  html.account-page .hero-card, html.account-page .result-card, html.account-page .leaderboard, html.account-page .detail-card, html.account-page .admin-panel { display: none; }
  html.account-page .container { max-width: 980px; padding-top: 72px; }
  html:not(.account-page) .account-page-wrap { display: none; }
  html.account-page .account-page-wrap:not(.ready) { display: none; }

  /* ---------- account page ---------- */
  .account-page-head { text-align: center; margin: 0 0 22px; }
  .account-page-emoji { display: inline-block; font-size: 1.9rem; margin-bottom: 8px; animation: diceFloat 4s ease-in-out infinite; }
  .account-page-title { margin: 0 0 6px; font-size: 1.3rem; font-weight: 800; }
  .account-page-subtitle { margin: 0; color: var(--text-2); font-size: .85rem; line-height: 1.55; }
  .account-back-link {
    display: block; text-align: center; margin-top: 20px; color: var(--text-3); font-size: .8rem;
    text-decoration: none; font-weight: 600;
  }
  .account-back-link:hover { color: var(--text-2); }
  .detail-back { border: 1px solid var(--border); background: var(--surface); color: var(--text-2); border-radius: 8px; padding: 7px 11px; cursor: pointer; font: 600 .78rem inherit; transition: border-color .2s ease, color .2s ease; }
  .detail-back:hover { border-color: var(--border-strong); color: var(--text); }
  .detail-top {
    display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap;
    margin: 18px 0 14px; padding-bottom: 16px; border-bottom: 1px dashed var(--border);
  }
  .detail-player { display: flex; align-items: center; gap: 12px; }
  .detail-avatar {
    width: 42px; height: 42px; border-radius: 50%; flex: none;
    display: inline-flex; align-items: center; justify-content: center;
    font-weight: 800; font-size: 1.05rem; color: #fff;
    background: linear-gradient(135deg, var(--accent), var(--accent-2));
  }
  .detail-player-name { color: var(--text-2); font-size: .8rem; font-weight: 600; }
  .detail-word { font: 700 1.45rem "Space Mono", monospace; margin-top: 2px; }
  .detail-stats { display: flex; flex-direction: column; align-items: flex-end; gap: 7px; }
  .detail-ep-value { font-family: "Space Mono", monospace; font-weight: 700; font-size: .95rem; color: var(--text-2); }
  .detail-summary { color: var(--text-3); font-size: .78rem; margin-bottom: 14px; }
  .detail-list { margin: 16px 0 0; }

  /* ---------- admin panel ---------- */
  .admin-panel {
    margin-top: 40px; border: 1px solid var(--accent); border-radius: 16px;
    background: color-mix(in srgb, var(--accent) 6%, var(--surface)); padding: 16px 18px;
    animation: rowIn .35s ease both;
  }
  .admin-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
  .admin-head h2 { display: flex; align-items: center; gap: 8px; font-size: 1.02rem; margin: 0; }
  .admin-close {
    border: 1px solid var(--border); background: var(--surface); color: var(--text-2);
    width: 28px; height: 28px; border-radius: 8px; cursor: pointer; font-size: .85rem; line-height: 1;
    transition: color .2s ease, border-color .2s ease;
  }
  .admin-close:hover { color: var(--text); border-color: var(--border-strong); }
  .admin-note { color: var(--text-3); font-size: .76rem; margin: 8px 0 14px; }
  .admin-actions { display: flex; flex-wrap: wrap; gap: 10px; }
  .admin-btn {
    border: 1px solid var(--accent); background: var(--accent); color: var(--accent-contrast);
    padding: 10px 16px; border-radius: 10px; font-size: .85rem; font-weight: 700; font-family: inherit;
    cursor: pointer; transition: transform .15s ease, opacity .2s ease;
  }
  .admin-btn:hover:not(:disabled) { transform: translateY(-1px); }
  .admin-btn:disabled { opacity: .55; cursor: wait; }
  .admin-log {
    font-family: "Space Mono", monospace; font-size: .74rem; color: var(--text-2);
    margin-top: 12px; white-space: pre-wrap; word-break: break-word;
  }

  /* ---------- toast / confetti ---------- */
  .toast {
    position: fixed; bottom: 22px; left: 50%; transform: translateX(-50%) translateY(20px);
    background: var(--surface); border: 1px solid var(--border-strong); color: var(--text);
    padding: 10px 18px; border-radius: 12px; font-size: .85rem; opacity: 0; pointer-events: none;
    transition: opacity .3s ease, transform .3s ease; box-shadow: 0 14px 34px -16px rgba(0,0,0,.5); z-index: 80;
    max-width: 88vw;
  }
  .toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
  .confetti-root { position: fixed; inset: 0; pointer-events: none; z-index: 70; overflow: hidden; }
  .confetti-piece { position: absolute; top: -12px; width: 8px; height: 14px; opacity: .95; animation: confettiFall linear forwards; }
  @keyframes confettiFall { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(108vh) rotate(600deg); opacity: 0; } }

  @media (prefers-reduced-motion: reduce) {
    * { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
  }


  /* ---------- account/auth: badge-list visual language ----------
     Keep account screens in the same visual system as the roll result:
     compact 10px surfaces, a 3px accent rail, restrained borders, and
     tier-like color washes instead of large rounded/shadowed cards. */
  .account-page-wrap {
    max-width: 820px;
    padding-top: 72px;
    gap: 18px;
  }
  .account-page-head {
    text-align: left;
    margin: 0 0 4px;
    padding-left: 4px;
  }
  .account-page-emoji {
    font-size: 1.25rem;
    margin: 0 0 4px;
  }
  .account-page-title {
    font-size: 1.15rem;
    letter-spacing: .02em;
  }
  .account-page-subtitle {
    font-size: .78rem;
    line-height: 1.5;
  }
  .account-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 10px;
  }
  .account-card,
  .profile-overview {
    border-radius: 6px;
    border: 1px solid var(--border);
    border-left: 3px solid var(--accent);
    background: var(--card-bg);
    box-shadow: none;
  }
  .account-card {
    padding: 16px;
    gap: 14px;
  }
  .profile-overview {
    margin-top: 0;
    padding: 16px;
    gap: 14px;
  }
  .auth-form {
    gap: 8px;
  }
  .auth-input {
    border-radius: 10px;
    background: var(--surface-2);
    padding: 11px 13px;
    font-size: .88rem;
  }
  .auth-input:focus {
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent) 22%, transparent);
  }
  .auth-btn,
  .auth-btn-secondary {
    border-radius: 10px;
    padding: 10px 13px;
    font-size: .8rem;
    box-shadow: none;
  }
  .auth-btn {
    border-left: 3px solid color-mix(in srgb, var(--accent) 70%, #fff);
    background: color-mix(in srgb, var(--accent) 14%, var(--surface-2));
    color: var(--accent);
  }
  .auth-btn-secondary {
    background: var(--surface-2);
    color: var(--text-2);
  }
  .auth-btn:hover,
  .auth-btn-secondary:hover {
    border-color: var(--border-strong);
    opacity: 1;
  }
  .auth-btn-block {
    margin-top: 8px;
  }
  .auth-divider {
    margin: 14px 0;
  }
  .auth-profile {
    margin-bottom: 12px;
    padding: 10px 12px;
    border-radius: 10px;
    border-left: 3px solid var(--accent);
    background: color-mix(in srgb, var(--accent) 7%, var(--surface));
  }
  .auth-avatar {
    width: 42px;
    height: 42px;
    font-size: 1rem;
  }
  .auth-email {
    font-size: .86rem;
  }
  .auth-subtitle {
    font-size: .72rem;
  }
  .name-field {
    padding: 8px 11px;
    margin: 0 0 6px;
    border: 1px solid var(--border);
    border-left: 3px solid var(--accent);
    border-radius: 10px;
    background: var(--surface-2);
  }
  .name-field:focus-within {
    border-color: var(--accent);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent) 18%, transparent);
  }
  .name-field label {
    width: auto;
    min-width: 92px;
    font-size: .6rem;
  }
  .name-field input {
    font-size: .88rem;
  }
  .account-actions {
    gap: 8px;
    margin-top: 12px;
  }
  .auth-status {
    margin-top: 8px;
  }

  .profile-header {
    gap: 12px;
    margin-bottom: 4px;
  }
  .profile-title {
    font-size: 1.05rem;
  }
  .profile-subtitle {
    font-size: .8rem;
  }
  .profile-stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
    margin-bottom: 8px;
  }
  .profile-field {
    position: relative;
    overflow: hidden;
    border-radius: 10px;
    padding: 11px 13px 11px 15px;
    background: var(--surface-2);
    box-shadow: none;
  }
  .profile-field::before {
    content: "";
    position: absolute;
    inset: 0 auto 0 0;
    width: 3px;
    background: var(--accent);
  }
  .profile-field-label {
    font-size: .6rem;
    margin-bottom: 3px;
  }
  .profile-field-value {
    font-size: .88rem;
  }
  .profile-section-title {
    margin: 0 0 8px;
    font-size: .72rem;
  }
  .recent-rolls {
    gap: 8px;
  }
  .recent-rolls #recentRolls {
    gap: 8px;
  }
  .recent-roll {
    position: relative;
    overflow: hidden;
    grid-template-columns: 1fr auto;
    gap: 8px;
    padding: 10px 13px 10px 15px;
    border-radius: 10px;
    background: color-mix(in srgb, var(--accent) 6%, var(--surface));
    border: 1px solid var(--border);
    border-left: 3px solid var(--accent);
    box-shadow: none;
  }
  .recent-roll-word {
    font-size: .88rem;
  }
  .recent-roll-meta {
    gap: 7px;
    font-size: .7rem;
  }
  .recent-roll-ep {
    color: var(--accent);
  }
  .account-back-link {
    width: auto;
    max-width: none;
    justify-content: flex-start;
    margin: 0;
    padding: 4px 0;
    border-radius: 0;
    background: transparent;
    color: var(--text-3);
    font-size: .72rem;
  }
  .account-back-link:hover {
    background: transparent;
    border-color: transparent;
    color: var(--accent);
  }


  .recent-roll.rarity-trash { border-left-color: var(--badge-color); background: color-mix(in srgb, var(--badge-color) 4%, var(--surface)); }
  .recent-roll.rarity-common { border-left-color: var(--badge-color); background: color-mix(in srgb, var(--badge-color) 8%, var(--surface)); }
  .recent-roll.rarity-uncommon { border-left-color: var(--badge-color); background: color-mix(in srgb, var(--badge-color) 12%, var(--surface)); }
  .recent-roll.rarity-rare { border-left-color: var(--badge-color); background: linear-gradient(110deg, color-mix(in srgb, var(--badge-color) 16%, var(--surface)), var(--surface)); }
  .recent-roll.rarity-epic { border-left-color: var(--badge-color); background: linear-gradient(110deg, color-mix(in srgb, var(--badge-color) 22%, var(--surface)), color-mix(in srgb, var(--badge-color) 5%, var(--surface))); box-shadow: 0 0 18px -8px var(--badge-color); }
  .recent-roll.rarity-legendary,
  .recent-roll.rarity-mythic,
  .recent-roll.rarity-divine,
  .recent-roll.rarity-cosmic {
    border-left-color: var(--badge-color);
    background: linear-gradient(110deg, color-mix(in srgb, var(--badge-color) 28%, var(--surface)), color-mix(in srgb, var(--badge-color) 8%, var(--surface)), color-mix(in srgb, var(--badge-color) 22%, var(--surface)));
    background-size: 180% 100%;
    animation: badgeGradient 3s ease-in-out infinite;
    box-shadow: 0 0 18px -8px var(--badge-color);
  }
  .recent-roll.rarity-mythic,
  .recent-roll.rarity-divine,
  .recent-roll.rarity-cosmic {
    animation-duration: 2.2s;
  }


  /* ---------- signed-in profile cleanup / alignment ---------- */
  html.account-page.profile-mode .account-page-head { display:none !important; }
  html.account-page.profile-mode .account-page-wrap {
    width: min(100%, 680px);
    max-width: 680px;
    margin-inline: auto;
    padding-top: 34px;
    padding-left: 0;
    padding-right: 0;
    box-sizing: border-box;
  }
  html.account-page.profile-mode .account-page-wrap .account-card { display:none !important; }
  html.account-page.profile-mode .account-page-wrap .account-grid {
    display:block;
    width:100%;
  }
  html.account-page.profile-mode .profile-overview {
    display:block;
    width:100%;
    margin-inline:auto;
  }
  .profile-signout-btn {
    border:1px solid var(--border);
    background:var(--surface-2);
    color:var(--text-2);
    border-radius:8px;
    padding:6px 10px;
    cursor:pointer;
    font:700 .68rem inherit;
    transition:color .18s ease,border-color .18s ease,background .18s ease;
  }
  .profile-signout-btn:hover {
    color:var(--accent);
    border-color:var(--border-strong);
    background:color-mix(in srgb,var(--accent) 7%,var(--surface-2));
  }
  .profile-roll-word {
    font-family:"Space Mono",ui-monospace,SFMono-Regular,Menlo,monospace;
    font-weight:700;
    letter-spacing:.035em;
  }
  .profile-roll-ep {
    font-size:.68rem;
    font-weight:700;
    color:var(--text-3);
    letter-spacing:.01em;
  }
  .profile-best-word {
    font-family:"Space Mono",ui-monospace,SFMono-Regular,Menlo,monospace;
    font-weight:800;
    color:var(--badge-color,var(--text));
    letter-spacing:.03em;
  }
  .profile-best-ep {
    color:var(--text-2);
    font-size:.7em;
    font-weight:700;
    letter-spacing:0;
  }
  .profile-best-stat.rarity-rare,
  .profile-best-stat.rarity-epic {
    box-shadow:0 0 20px -9px var(--badge-color);
  }
  .profile-best-stat.rarity-legendary,
  .profile-best-stat.rarity-mythic,
  .profile-best-stat.rarity-divine,
  .profile-best-stat.rarity-cosmic {
    background:linear-gradient(110deg,
      color-mix(in srgb,var(--badge-color) 26%,var(--surface)),
      color-mix(in srgb,var(--badge-color) 7%,var(--surface)),
      color-mix(in srgb,var(--badge-color) 20%,var(--surface)));
    background-size:180% 100%;
    animation:badgeGradient 2.6s ease-in-out infinite;
    box-shadow:0 0 24px -8px var(--badge-color);
  }
  .recent-roll.rarity-rare,
  .recent-roll.rarity-epic {
    box-shadow:0 0 18px -9px var(--badge-color);
  }
  .recent-roll.rarity-legendary,
  .recent-roll.rarity-mythic,
  .recent-roll.rarity-divine,
  .recent-roll.rarity-cosmic {
    background:linear-gradient(110deg,
      color-mix(in srgb,var(--badge-color) 25%,var(--surface)),
      color-mix(in srgb,var(--badge-color) 7%,var(--surface)),
      color-mix(in srgb,var(--badge-color) 20%,var(--surface)));
    background-size:180% 100%;
    animation:badgeGradient 2.6s ease-in-out infinite;
    box-shadow:0 0 24px -8px var(--badge-color);
  }
  @media(max-width:700px){
    html.account-page.profile-mode .account-page-wrap{
      width:min(100%,680px);
      padding-left:14px;
      padding-right:14px;
      box-sizing:border-box;
    }
  }

  /* ---------- profile showcase ---------- */
  .account-page-wrap.public-profile{width:min(100%,720px);margin-inline:auto}
  .account-page-wrap.public-profile .account-grid{display:block;width:100%}
  .account-page-wrap.public-profile .account-card{display:none}
  .profile-overview{width:100%;padding:0 0 20px;margin:0;background:transparent;border:0;box-shadow:none}
  .profile-identity{display:flex;align-items:center;gap:18px;padding:4px 4px 28px;text-align:left}
  .profile-identity .auth-avatar{width:68px;height:68px;border-radius:18px;font-size:1.35rem;box-shadow:0 0 0 1px var(--border),0 12px 28px -18px rgba(0,0,0,.35)}
  .profile-identity-copy{min-width:0;display:grid;gap:3px}
  .profile-display-name{margin:0;font-size:clamp(1.45rem,3vw,2rem);line-height:1.05;font-weight:850;letter-spacing:-.025em}
  .profile-username{margin:0;color:var(--text-3);font-size:.82rem;font-weight:650;letter-spacing:.04em}
  .profile-identity .profile-subtitle{margin:3px 0 0;color:var(--text-2);font-size:.76rem;line-height:1.4}
  .profile-section{margin-top:12px;text-align:left}
  .profile-section-heading{display:flex;align-items:baseline;gap:9px;margin:0 0 12px;padding:0 4px}
  .profile-section-heading h3{margin:0;font-size:.92rem;font-weight:800;letter-spacing:.06em;text-transform:uppercase}
  .profile-section-kicker{color:var(--accent);font:700 .62rem/1 inherit;letter-spacing:.08em}
  .profile-feature-stats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
  .profile-feature-stat{position:relative;overflow:hidden;min-height:112px;padding:17px 18px;border:1px solid var(--border);border-left:3px solid var(--accent);border-radius:10px;background:var(--surface);box-shadow:none}
  .profile-feature-stat::after{content:"";position:absolute;width:110px;height:110px;right:-48px;bottom:-60px;border-radius:50%;background:color-mix(in srgb,var(--accent) 10%,transparent);pointer-events:none}
  .profile-stat-label,.profile-stat-meta{display:block;color:var(--text-3)}
  .profile-stat-label{font-size:.63rem;font-weight:750;letter-spacing:.1em;text-transform:uppercase}
  .profile-stat-value{display:block;margin-top:7px;font-size:clamp(1.35rem,4vw,1.85rem);line-height:1;font-weight:850;letter-spacing:-.025em}
  .profile-stat-meta{margin-top:9px;font-size:.67rem}
  .profile-best-stat{border-left-color:var(--badge-color,var(--accent));background:linear-gradient(110deg,color-mix(in srgb,var(--badge-color,var(--accent)) 9%,var(--surface)),var(--surface))}
  .profile-best-stat .profile-stat-value{color:var(--badge-color,var(--text))}
  .profile-secondary-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:8px}
  .profile-secondary-stat{position:relative;min-width:0;padding:10px 12px;border-top:1px solid var(--border);background:color-mix(in srgb,var(--surface-2) 72%,transparent)}
  .profile-secondary-stat>span{display:block;color:var(--text-3);font-size:.58rem;font-weight:750;letter-spacing:.08em;text-transform:uppercase}
  .profile-secondary-stat>strong{display:block;overflow:hidden;margin-top:4px;color:var(--text);font-size:.78rem;text-overflow:ellipsis;white-space:nowrap}
  .profile-editable-stat{padding-right:38px}
  .profile-edit-btn{position:absolute;right:8px;bottom:8px;width:24px;height:24px;padding:0;border:1px solid transparent;border-radius:6px;background:transparent;color:var(--text-3);cursor:pointer;font:inherit;opacity:.65;transition:color .18s ease,background .18s ease,border-color .18s ease,opacity .18s ease}
  .profile-edit-btn:hover,.profile-edit-btn:focus-visible{opacity:1;color:var(--accent);background:color-mix(in srgb,var(--accent) 8%,var(--surface));border-color:var(--border);outline:none}
  .profile-roll-history{margin-top:30px}
  .profile-roll-history #recentRolls{display:grid;gap:8px}
  .profile-roll-history .recent-roll{text-align:left}
  @media(max-width:700px){html.account-page .container{padding-top:44px}.account-page-wrap.public-profile{width:min(100%,640px)}.profile-identity{gap:13px;padding-bottom:22px}.profile-identity .auth-avatar{width:56px;height:56px;border-radius:14px;font-size:1.05rem}.profile-feature-stats{grid-template-columns:1fr}.profile-feature-stat{min-height:96px}.profile-secondary-stats{grid-template-columns:repeat(2,minmax(0,1fr))}.profile-secondary-stat:last-child{grid-column:auto}}
  @media(max-width:430px){.profile-display-name{font-size:1.35rem}.profile-identity .profile-subtitle{display:none}}

  @media (max-width: 760px) {
    .account-page-wrap.profile-active {
      width: min(100%, 680px);
      padding-inline: 14px;
    }
  }
  @media (min-width: 761px) {
    .account-page-wrap.profile-active {
      width: min(100%, 680px);
    }
  }
  /* ---------- responsive ---------- */
  @media (max-width: 680px) {
    .account-grid { grid-template-columns: 1fr; }
    .lb-row { grid-template-columns: 32px 1fr 80px 70px; gap: 8px; padding: 10px 12px; font-size: .8rem; }
    .lb-name { display: none; }
  }
  @media (max-width: 500px) {
    .lb-row { grid-template-columns: 28px 1fr 60px; gap: 6px; padding: 8px 10px; font-size: .75rem; }
    .lb-tier { display: none; }
  }

  /* Badge detail theme hardening */
  .badge-detail-screen,
  .badge-detail-page,
  .badge-detail-card,
  .badge-detail-panel {
    color: var(--text, #f5f5f5);
    background: var(--bg, #0b0d10);
  }
  .badge-detail-screen {
    min-height: 100%;
  }
  .badge-detail-card,
  .badge-detail-panel {
    border-color: var(--border, rgba(255,255,255,.12));
    box-shadow: 0 18px 50px rgba(0,0,0,.28);
  }
  .badge-detail-screen a,
  .badge-detail-screen button {
    color: inherit;
  }


  html.badge-detail-mode body,
  body.badge-detail-mode {
    background: var(--bg, #0b0d10) !important;
    color: var(--text, #f5f5f5) !important;
  }
  html.badge-detail-mode .badge-detail-screen {
    background: transparent !important;
    color: inherit !important;
  }

</style>
</head>
<body>
  <div class="bg-decor" aria-hidden="true"></div>

  <header class="site-header">
    <div class="brand"><span class="brand-dice">🎲</span><span>SixRoll</span></div>
    <div class="header-actions">
      <a href="/leaderboard" class="header-link">Leaderboard</a>
      <a href="/" class="header-link">Roll</a>
      <a href="/account" class="header-link" id="accountNavLink">Account</a>
      <button id="themeToggle" class="icon-btn" aria-label="Toggle theme" title="Toggle theme">
        <span class="theme-icon-moon">🌙</span><span class="theme-icon-sun">☀️</span>
      </button>
    </div>
  </header>

  <main class="container">
    <section class="hero-card">
      <p class="hero-tag">Roll six random letters. Score badges for patterns and real words hidden in your pull.</p>

      <div class="tiles" id="tiles"></div>
      <div class="roll-confirmation">
        <div class="roll-rarity" id="rollRarity" aria-live="polite"></div>
      </div>

      <div class="roll-area">
        <button class="roll-btn" id="rollBtn"><span class="btn-shimmer"></span><span class="btn-label">Roll</span></button>
        <div class="cooldown-wrap" id="cooldownWrap" hidden>
          <div class="cooldown-bar"><div class="cooldown-fill" id="cooldownFill"></div></div>
          <div class="cooldown-text" id="cooldownText"></div>
        </div>
        <div class="unlimited-badge" id="unlimitedBadge">Test mode — unlimited rolls</div>
      </div>
    </section>

    <section class="account-page-wrap" id="accountPageWrap">
      <div class="account-page-head">
        <span class="account-page-emoji" aria-hidden="true">🎲</span>
        <h1 class="account-page-title" id="accountPageTitle">Sign in</h1>
        <p class="account-page-subtitle" id="accountPageSubtitle">Save your rolls and claim your spot on the leaderboard.</p>
      </div>
      <div class="account-grid">
        <section class="account-card" aria-label="Account">
          <div id="authSignedOut">
            <div class="auth-form">
              <input id="usernameInput" class="auth-input" type="text" autocomplete="username" placeholder="Username">
              <input id="passwordInput" class="auth-input" type="password" autocomplete="current-password" placeholder="Password">
            </div>
            <button id="loginBtn" class="auth-btn auth-btn-block" type="button">Log in</button>
            <div class="auth-divider"><span>or</span></div>
            <button id="showRegisterBtn" class="auth-btn-secondary auth-btn-block" type="button">Create an account</button>
            <div id="registerPanel" style="display:none;margin-top:12px;border-top:1px dashed var(--border);padding-top:12px;">
              <p class="auth-hint">Takes a few seconds — no email required.</p>
              <div class="auth-form">
                <input id="regUsernameInput" class="auth-input" type="text" placeholder="Choose a username">
                <input id="regPasswordInput" class="auth-input" type="password" placeholder="Choose a password">
                <input id="regNameInput" class="auth-input" type="text" placeholder="Display name (optional)">
              </div>
              <div style="display:flex;gap:8px;margin-top:10px;">
                <button id="registerBtn" class="auth-btn">Create account</button>
                <button id="hideRegisterBtn" class="auth-btn-secondary">Cancel</button>
              </div>
            </div>
          </div>
          <div id="authSignedIn" hidden>
            <div class="auth-profile">
              <div class="auth-avatar" id="authAvatar" aria-hidden="true"></div>
              <div>
                <div class="auth-email" id="accountEmail"></div>
                <div class="auth-subtitle">You're signed in</div>
              </div>
            </div>
            <div class="name-field">
              <label for="accountNameInput">Display name</label>
              <input id="accountNameInput" maxlength="20" placeholder="Set your public name">
            </div>
            <div class="account-actions">
              <button id="editProfileBtn" class="auth-btn-secondary" type="button">Edit profile</button>
              <button id="saveNameBtn" class="auth-btn" type="button" disabled>Save profile</button>
              <button id="signOutBtn" class="auth-btn-secondary" type="button">Sign out</button>
            </div>
          </div>
          <div id="authStatus" class="auth-status" aria-live="polite"></div>
        </section>
        <section class="profile-overview profile-panel" id="accountOverview" hidden>
          <header class="profile-identity">
            <div class="profile-identity-avatar"><div class="auth-avatar" id="overviewAvatar" aria-hidden="true"></div></div>
            <div class="profile-identity-copy">
              <h2 class="profile-display-name" id="overviewTitle">Player</h2>
              <p class="profile-username" id="overviewUsername">#username</p>
              <p class="profile-subtitle" id="overviewSubtitle">Your rolls, stats, and leaderboard history.</p>
              <div class="profile-identity-actions">
                <button type="button" class="profile-edit-btn profile-edit-name-btn" id="editDisplayNameBtn" aria-label="Edit display name" title="Edit display name">✎</button>
                <button type="button" class="profile-signout-btn" id="profileSignOutBtn">Sign out</button>
              </div>
              <div class="profile-inline-editor" id="profileInlineEditor" hidden>
                <label for="profileDisplayNameInput">Display name</label>
                <div class="profile-inline-editor-row">
                  <input id="profileDisplayNameInput" maxlength="20" placeholder="Set your public name">
                  <button type="button" class="profile-editor-save" id="profileSaveNameBtn">Save</button>
                  <button type="button" class="profile-editor-cancel" id="profileCancelNameBtn">Cancel</button>
                </div>
              </div>
            </div>
          </header>
          <section class="profile-section" aria-labelledby="profileStatisticsTitle">
            <div class="profile-section-heading"><span class="profile-section-kicker">01</span><h3 id="profileStatisticsTitle">Statistics</h3></div>
            <div class="profile-feature-stats">
              <div class="profile-feature-stat profile-best-stat" id="bestRollStat"><span class="profile-stat-label">Best roll</span><strong class="profile-stat-value" id="overviewBestRoll">—</strong><span class="profile-stat-meta">Leaderboard</span></div>
              <div class="profile-feature-stat"><span class="profile-stat-label">Total EP</span><strong class="profile-stat-value" id="overviewTotalEP">—</strong><span class="profile-stat-meta" id="overviewTotalEPRank">Earned from all saved rolls</span></div>
            </div>
            <div class="profile-secondary-stats">
              <div class="profile-secondary-stat"><span>Rolls</span><strong id="overviewRollCount">—</strong></div>
              <div class="profile-secondary-stat"><span>Account</span><strong id="overviewUsernameSecondary">—</strong></div>
              <div class="profile-secondary-stat"><span>Display name</span><strong id="overviewDisplayName">—</strong></div>
              <div class="profile-secondary-stat"><span>Joined</span><strong id="overviewJoinDate">—</strong></div>
            </div>
          </section>
          <section class="profile-section profile-roll-history" id="recentRollsSection" aria-labelledby="rollHistoryTitle">
            <div class="profile-section-heading"><span class="profile-section-kicker">02</span><h3 id="rollHistoryTitle">Roll history</h3></div>
            <div id="recentRolls"></div>
          </section>
        </section>
      </div>
    </section>

    <section class="result-card" id="result">
      <div class="result-glow" id="resultGlow" aria-hidden="true"></div>
      <div class="result-header">
        <div class="result-letters" id="resultTitle"></div>
        <div class="result-total total-ep">
          <span class="total-ep-label">Total EP</span>
          <span class="total-ep-value mono" id="totalEp">0</span>
        </div>
      </div>
      <ul class="badge-list" id="badgeList"></ul>
      <div class="supporting" id="supporting"></div>
      <div class="result-footer">
        <button class="share-btn" id="shareBtn" type="button">Copy result</button>
      </div>
    </section>

    <section class="leaderboard" id="leaderboard">
      <h1 class="leaderboard-page-title">Global Leaderboard</h1>
      <div class="featured-roll" id="featuredRoll" hidden>
        <div class="featured-label">Top roll</div>
        <div class="featured-word" id="featuredWord"></div>
        <div class="featured-stats">
          <span class="roll-rarity show" id="featuredTier"></span>
          <span class="featured-by" id="featuredBy"></span>
        </div>
      </div>
      <div class="lb-table">
        <div class="lb-row lb-head">
          <span>#</span><span>Word</span><span>Name</span><span>Rarity</span><span>EP</span>
        </div>
        <div id="lbBody"></div>
      </div>
    </section>

    <section class="detail-card" id="rollDetail" aria-live="polite">
      <button class="detail-back" id="detailBack" type="button">&larr; Back to leaderboard</button>
      <div class="detail-top">
        <div class="detail-player">
          <span class="detail-avatar" id="detailAvatar" aria-hidden="true"></span>
          <div>
            <div class="detail-player-name" id="detailPlayerName"></div>
            <div class="detail-word" id="detailWord"></div>
          </div>
        </div>
        <div class="detail-stats">
          <span class="roll-rarity show" id="detailTier"></span>
          <span class="detail-ep-value" id="detailEp"></span>
        </div>
      </div>
      <div class="detail-summary" id="detailSummary"></div>
      <ul class="badge-list detail-list" id="detailBadgeList"></ul>
    </section>

    <section class="badge-detail-page" id="badgeDetailPage" hidden aria-live="polite">
      <button class="badge-detail-back" id="badgeDetailBack" type="button">&larr; Back</button>
      <div class="badge-detail-card" id="badgeDetailCard">
        <div class="badge-detail-icon" id="badgeDetailIcon"></div>
        <h1 class="badge-detail-name" id="badgeDetailName"></h1>
        <div class="badge-detail-family" id="badgeDetailFamily"></div>
        <div class="badge-detail-rarity" id="badgeDetailRarity"></div>
        <div class="badge-detail-ep" id="badgeDetailEP"></div>
        <p class="badge-detail-explanation" id="badgeDetailExplanation"></p>
      </div>
    </section>

    <section class="admin-panel" id="adminPanel" hidden aria-label="Admin tools">
      <div class="admin-head">
        <h2><span>🛠️</span> Admin Mode</h2>
        <button class="admin-close" id="adminClose" type="button" aria-label="Exit admin mode" title="Exit admin mode">✕</button>
      </div>
      <p class="admin-note">Enabled via secret code. Actions here modify the live leaderboard.</p>
      <div class="admin-actions">
        <button class="admin-btn" id="manualScoreBtn" type="button">Add manual score</button>
        <div id="manualScoreForm" hidden style="margin-top:10px;display:grid;gap:8px;grid-template-columns:1fr 1fr 1fr auto;">
          <input id="manualScoreName" maxlength="20" placeholder="Name">
          <input id="manualScoreWord" maxlength="6" placeholder="ABCDEF">
          <input id="manualScoreEP" type="number" min="0" step="1" placeholder="EP">
          <button class="admin-btn" id="manualScoreSubmit" type="button">Add</button><span id="manualScoreStatus" style="grid-column:1/-1;min-height:1.2em"></span>
        </div>
        <button class="admin-btn" id="deleteScoreBtn" type="button">Delete score</button>
        <div id="deleteScoreForm" hidden style="margin-top:10px;display:grid;gap:8px;grid-template-columns:1fr 1fr auto;">
          <input id="deleteScoreName" maxlength="20" placeholder="Name">
          <input id="deleteScoreWord" maxlength="6" placeholder="ABCDEF">
          <button class="admin-btn" id="deleteScoreSubmit" type="button">Delete</button><span id="deleteScoreStatus" style="grid-column:1/-1;min-height:1.2em"></span>
        </div>
        <button class="admin-btn" id="recalcBtn" type="button">Recalculate all scores</button>
      </div>
      <div class="admin-log" id="adminLog"></div>
    </section>
  </main>

  <div id="toast" class="toast"></div>
  <div id="confettiRoot" class="confetti-root" aria-hidden="true"></div>

<script>
/* ================= word list & game data ================= */
var WORDS = new Set(["AAH","AAHED","AAHING","AAHS","AAL","AALII","AALIIS","AALS","AARGH","AARRGH","AAS","ABA","ABACA","ABACAS","ABACI","ABACK","ABACUS","ABAFT","ABAKA","ABAKAS","ABAMP","ABAMPS","ABAS","ABASE","ABASED","ABASER","ABASES","ABASH","ABASIA","ABATE","ABATED","ABATER","ABATES","ABATIS","ABATOR","ABBA","ABBACY","ABBAS","ABBE","ABBES","ABBESS","ABBEY","ABBEYS","ABBOT","ABBOTS","ABDUCE","ABDUCT","ABEAM","ABED","ABELE","ABELES","ABELIA","ABET","ABETS","ABHOR","ABHORS","ABIDE","ABIDED","ABIDER","ABIDES","ABJECT","ABJURE","ABLATE","ABLAUT","ABLAZE","ABLE","ABLER","ABLES","ABLEST","ABLINS","ABLOOM","ABLUSH","ABLY","ABMHO","ABMHOS","ABO","ABOARD","ABODE","ABODED","ABODES","ABOHM","ABOHMS","ABOIL","ABOLLA","ABOMA","ABOMAS","ABOON","ABORAL","ABORT","ABORTS","ABOS","ABOUND","ABOUT","ABOVE","ABOVES","ABRADE","ABRI","ABRIS","ABROAD","ABRUPT","ABS","ABSEIL","ABSENT","ABSORB","ABSURD","ABULIA","ABULIC","ABUSE","ABUSED","ABUSER","ABUSES","ABUT","ABUTS","ABUZZ","ABVOLT","ABWATT","ABY","ABYE","ABYES","ABYING","ABYS","ABYSM","ABYSMS","ABYSS","ACACIA","ACAJOU","ACARI","ACARID","ACARUS","ACCEDE","ACCENT","ACCEPT","ACCESS","ACCORD","ACCOST","ACCRUE","ACCUSE","ACE","ACED","ACEDIA","ACERB","ACES","ACETA","ACETAL","ACETIC","ACETIN","ACETUM","ACETYL","ACHE","ACHED","ACHENE","ACHES","ACHIER","ACHING","ACHOO","ACHY","ACID","ACIDIC","ACIDLY","ACIDS","ACIDY","ACINAR","ACING","ACINI","ACINIC","ACINUS","ACKEE","ACKEES","ACME","ACMES","ACMIC","ACNE","ACNED","ACNES","ACNODE","ACOCK","ACOLD","ACORN","ACORNS","ACQUIT","ACRE","ACRED","ACRES","ACRID","ACROSS","ACT","ACTA","ACTED","ACTIN","ACTING","ACTINS","ACTION","ACTIVE","ACTOR","ACTORS","ACTS","ACTUAL","ACUATE","ACUITY","ACULEI","ACUMEN","ACUTE","ACUTER","ACUTES","ACYL","ACYLS","ADAGE","ADAGES","ADAGIO","ADAPT","ADAPTS","ADD","ADDAX","ADDED","ADDEND","ADDER","ADDERS","ADDICT","ADDING","ADDLE","ADDLED","ADDLES","ADDS","ADDUCE","ADDUCT","ADEEM","ADEEMS","ADENYL","ADEPT","ADEPTS","ADHERE","ADIEU","ADIEUS","ADIEUX","ADIOS","ADIPIC","ADIT","ADITS","ADJOIN","ADJURE","ADJUST","ADMAN","ADMASS","ADMEN","ADMIRE","ADMIT","ADMITS","ADMIX","ADMIXT","ADNATE","ADNEXA","ADNOUN","ADO","ADOBE","ADOBES","ADOBO","ADOBOS","ADONIS","ADOPT","ADOPTS","ADORE","ADORED","ADORER","ADORES","ADORN","ADORNS","ADOS","ADOWN","ADOZE","ADRIFT","ADROIT","ADS","ADSORB","ADULT","ADULTS","ADUNC","ADUST","ADVECT","ADVENT","ADVERB","ADVERT","ADVICE","ADVISE","ADYTA","ADYTUM","ADZ","ADZE","ADZES","ADZUKI","AECIA","AECIAL","AECIUM","AEDES","AEDILE","AEDINE","AEGIS","AENEUS","AEON","AEONIC","AEONS","AERATE","AERIAL","AERIE","AERIED","AERIER","AERIES","AERIFY","AERILY","AERO","AEROBE","AERUGO","AERY","AETHER","AFAR","AFARS","AFEARD","AFF","AFFAIR","AFFECT","AFFINE","AFFIRM","AFFIX","AFFLUX","AFFORD","AFFRAY","AFGHAN","AFIELD","AFIRE","AFLAME","AFLOAT","AFOOT","AFORE","AFOUL","AFRAID","AFREET","AFRESH","AFRIT","AFRITS","AFT","AFTER","AFTERS","AFTOSA","AGA","AGAIN","AGAMA","AGAMAS","AGAMIC","AGAPAE","AGAPAI","AGAPE","AGAR","AGARIC","AGARS","AGAS","AGATE","AGATES","AGAVE","AGAVES","AGAZE","AGE","AGED","AGEDLY","AGEE","AGEING","AGEISM","AGEIST","AGENCY","AGENDA","AGENE","AGENES","AGENT","AGENTS","AGER","AGERS","AGES","AGGER","AGGERS","AGGIE","AGGIES","AGGRO","AGGROS","AGHA","AGHAS","AGHAST","AGILE","AGIN","AGING","AGINGS","AGIO","AGIOS","AGISM","AGISMS","AGIST","AGISTS","AGLARE","AGLEAM","AGLEE","AGLET","AGLETS","AGLEY","AGLOW","AGLY","AGMA","AGMAS","AGNAIL","AGNATE","AGNIZE","AGO","AGOG","AGON","AGONAL","AGONE","AGONES","AGONIC","AGONS","AGONY","AGORA","AGORAE","AGORAS","AGOROT","AGOUTI","AGOUTY","AGRAFE","AGREE","AGREED","AGREES","AGRIA","AGRIAS","AGUE","AGUES","AGUISH","AHA","AHCHOO","AHEAD","AHEM","AHIMSA","AHOLD","AHOLDS","AHORSE","AHOY","AHULL","AID","AIDE","AIDED","AIDER","AIDERS","AIDES","AIDFUL","AIDING","AIDMAN","AIDMEN","AIDS","AIGLET","AIGRET","AIKIDO","AIL","AILED","AILING","AILS","AIM","AIMED","AIMER","AIMERS","AIMFUL","AIMING","AIMS","AIN","AINS","AIOLI","AIOLIS","AIR","AIRBUS","AIRED","AIRER","AIRERS","AIREST","AIRIER","AIRILY","AIRING","AIRMAN","AIRMEN","AIRN","AIRNS","AIRS","AIRT","AIRTED","AIRTH","AIRTHS","AIRTS","AIRWAY","AIRY","AIS","AISLE","AISLED","AISLES","AIT","AITCH","AITS","AIVER","AIVERS","AJAR","AJEE","AJIVA","AJIVAS","AJOWAN","AJUGA","AJUGAS","AKEE","AKEES","AKELA","AKELAS","AKENE","AKENES","AKIMBO","AKIN","ALA","ALACK","ALAE","ALAMO","ALAMOS","ALAN","ALAND","ALANDS","ALANE","ALANG","ALANIN","ALANS","ALANT","ALANTS","ALANYL","ALAR","ALARM","ALARMS","ALARUM","ALARY","ALAS","ALASKA","ALATE","ALATED","ALATES","ALB","ALBA","ALBAS","ALBATA","ALBEDO","ALBEIT","ALBINO","ALBITE","ALBS","ALBUM","ALBUMS","ALCADE","ALCAIC","ALCID","ALCIDS","ALCOVE","ALDER","ALDERS","ALDOL","ALDOLS","ALDOSE","ALDRIN","ALE","ALEC","ALECS","ALEE","ALEF","ALEFS","ALEGAR","ALEPH","ALEPHS","ALERT","ALERTS","ALES","ALEVIN","ALEXIA","ALEXIN","ALFA","ALFAKI","ALFAS","ALGA","ALGAE","ALGAL","ALGAS","ALGID","ALGIN","ALGINS","ALGOID","ALGOR","ALGORS","ALGUM","ALGUMS","ALIAS","ALIBI","ALIBIS","ALIBLE","ALIDAD","ALIEN","ALIENS","ALIF","ALIFS","ALIGHT","ALIGN","ALIGNS","ALIKE","ALINE","ALINED","ALINER","ALINES","ALIPED","ALIST","ALIT","ALIVE","ALIYA","ALIYAH","ALIYAS","ALIYOS","ALIYOT","ALKALI","ALKANE","ALKENE","ALKIES","ALKINE","ALKOXY","ALKY","ALKYD","ALKYDS","ALKYL","ALKYLS","ALKYNE","ALL","ALLAY","ALLAYS","ALLEE","ALLEES","ALLEGE","ALLELE","ALLEY","ALLEYS","ALLIED","ALLIES","ALLIUM","ALLOD","ALLODS","ALLOT","ALLOTS","ALLOW","ALLOWS","ALLOY","ALLOYS","ALLS","ALLUDE","ALLURE","ALLY","ALLYL","ALLYLS","ALMA","ALMAH","ALMAHS","ALMAS","ALME","ALMEH","ALMEHS","ALMES","ALMNER","ALMOND","ALMOST","ALMS","ALMUCE","ALMUD","ALMUDE","ALMUDS","ALMUG","ALMUGS","ALNICO","ALODIA","ALOE","ALOES","ALOFT","ALOHA","ALOHAS","ALOIN","ALOINS","ALONE","ALONG","ALOOF","ALOUD","ALOW","ALP","ALPACA","ALPHA","ALPHAS","ALPHYL","ALPINE","ALPS","ALS","ALSIKE","ALSO","ALT","ALTAR","ALTARS","ALTER","ALTERS","ALTHEA","ALTHO","ALTO","ALTOS","ALTS","ALUDEL","ALULA","ALULAE","ALULAR","ALUM","ALUMIN","ALUMNA","ALUMNI","ALUMS","ALVINE","ALWAY","ALWAYS","AMA","AMADOU","AMAH","AMAHS","AMAIN","AMARNA","AMAS","AMASS","AMATOL","AMAZE","AMAZED","AMAZES","AMAZON","AMBAGE","AMBARI","AMBARY","AMBEER","AMBER","AMBERS","AMBERY","AMBIT","AMBITS","AMBLE","AMBLED","AMBLER","AMBLES","AMBO","AMBOS","AMBRY","AMBUSH","AMEBA","AMEBAE","AMEBAN","AMEBAS","AMEBIC","AMEER","AMEERS","AMEN","AMEND","AMENDS","AMENS","AMENT","AMENTS","AMERCE","AMI","AMIA","AMIAS","AMICE","AMICES","AMICI","AMICUS","AMID","AMIDE","AMIDES","AMIDIC","AMIDIN","AMIDO","AMIDOL","AMIDS","AMIDST","AMIE","AMIES","AMIGA","AMIGAS","AMIGO","AMIGOS","AMIN","AMINE","AMINES","AMINIC","AMINO","AMINS","AMIR","AMIRS","AMIS","AMISS","AMITY","AMMINE","AMMINO","AMMO","AMMONO","AMMOS","AMNIA","AMNIC","AMNION","AMOEBA","AMOK","AMOKS","AMOLE","AMOLES","AMONG","AMORAL","AMORT","AMOUNT","AMOUR","AMOURS","AMP","AMPERE","AMPLE","AMPLER","AMPLY","AMPS","AMPUL","AMPULE","AMPULS","AMRITA","AMTRAC","AMU","AMUCK","AMUCKS","AMULET","AMUS","AMUSE","AMUSED","AMUSER","AMUSES","AMUSIA","AMYL","AMYLIC","AMYLS","AMYLUM","ANA","ANABAS","ANADEM","ANAL","ANALLY","ANALOG","ANANKE","ANARCH","ANAS","ANATTO","ANCHOR","ANCON","ANCONE","AND","ANDS","ANE","ANEAR","ANEARS","ANELE","ANELED","ANELES","ANEMIA","ANEMIC","ANENST","ANENT","ANERGY","ANES","ANEW","ANGA","ANGARY","ANGAS","ANGEL","ANGELS","ANGER","ANGERS","ANGINA","ANGLE","ANGLED","ANGLER","ANGLES","ANGORA","ANGRY","ANGST","ANGSTS","ANI","ANIL","ANILE","ANILIN","ANILS","ANIMA","ANIMAL","ANIMAS","ANIME","ANIMES","ANIMI","ANIMIS","ANIMUS","ANION","ANIONS","ANIS","ANISE","ANISES","ANISIC","ANKH","ANKHS","ANKLE","ANKLED","ANKLES","ANKLET","ANKUS","ANKUSH","ANLACE","ANLAGE","ANLAS","ANNA","ANNAL","ANNALS","ANNAS","ANNEAL","ANNEX","ANNEXE","ANNOY","ANNOYS","ANNUAL","ANNUL","ANNULI","ANNULS","ANOA","ANOAS","ANODAL","ANODE","ANODES","ANODIC","ANOINT","ANOLE","ANOLES","ANOMIC","ANOMIE","ANOMY","ANON","ANONYM","ANOPIA","ANORAK","ANOXIA","ANOXIC","ANSA","ANSAE","ANSATE","ANSWER","ANT","ANTA","ANTAE","ANTAS","ANTE","ANTED","ANTEED","ANTES","ANTHEM","ANTHER","ANTI","ANTIAR","ANTIC","ANTICK","ANTICS","ANTING","ANTIS","ANTLER","ANTRA","ANTRAL","ANTRE","ANTRES","ANTRUM","ANTS","ANTSY","ANURAL","ANURAN","ANURIA","ANURIC","ANUS","ANUSES","ANVIL","ANVILS","ANY","ANYHOW","ANYONE","ANYWAY","AORIST","AORTA","AORTAE","AORTAL","AORTAS","AORTIC","AOUDAD","APACE","APACHE","APART","APATHY","APE","APEAK","APED","APEEK","APER","APERCU","APERS","APERY","APES","APEX","APEXES","APHID","APHIDS","APHIS","APHTHA","APIAN","APIARY","APICAL","APICES","APIECE","APING","APISH","APLITE","APLOMB","APNEA","APNEAL","APNEAS","APNEIC","APNOEA","APOD","APODAL","APODS","APOGEE","APOLLO","APOLOG","APORT","APPAL","APPALL","APPALS","APPEAL","APPEAR","APPEL","APPELS","APPEND","APPLE","APPLES","APPLY","APPOSE","APRES","APRON","APRONS","APSE","APSES","APSIS","APT","APTER","APTEST","APTLY","AQUA","AQUAE","AQUAS","ARABIC","ARABLE","ARAK","ARAKS","ARAMID","ARB","ARBOR","ARBORS","ARBOUR","ARBS","ARBUTE","ARC","ARCADE","ARCANA","ARCANE","ARCED","ARCH","ARCHED","ARCHER","ARCHES","ARCHIL","ARCHLY","ARCHON","ARCING","ARCKED","ARCO","ARCS","ARCTIC","ARCUS","ARDEB","ARDEBS","ARDENT","ARDOR","ARDORS","ARDOUR","ARE","AREA","AREAE","AREAL","AREAS","ARECA","ARECAS","AREIC","ARENA","ARENAS","AREOLA","AREOLE","ARES","ARETE","ARETES","ARF","ARFS","ARGAL","ARGALA","ARGALI","ARGALS","ARGENT","ARGIL","ARGILS","ARGLE","ARGLED","ARGLES","ARGOL","ARGOLS","ARGON","ARGONS","ARGOSY","ARGOT","ARGOTS","ARGUE","ARGUED","ARGUER","ARGUES","ARGUFY","ARGUS","ARGYLE","ARGYLL","ARHAT","ARHATS","ARIA","ARIAS","ARID","ARIDER","ARIDLY","ARIEL","ARIELS","ARIGHT","ARIL","ARILED","ARILS","ARIOSE","ARIOSI","ARIOSO","ARISE","ARISEN","ARISES","ARISTA","ARISTO","ARK","ARKOSE","ARKS","ARLES","ARM","ARMADA","ARMED","ARMER","ARMERS","ARMET","ARMETS","ARMFUL","ARMIES","ARMING","ARMLET","ARMOR","ARMORS","ARMORY","ARMOUR","ARMPIT","ARMS","ARMURE","ARMY","ARNICA","AROID","AROIDS","AROINT","AROMA","AROMAS","AROSE","AROUND","AROUSE","AROYNT","ARPEN","ARPENS","ARPENT","ARRACK","ARRANT","ARRAS","ARRAY","ARRAYS","ARREAR","ARREST","ARRIS","ARRIVE","ARROBA","ARROW","ARROWS","ARROWY","ARROYO","ARS","ARSE","ARSENO","ARSES","ARSHIN","ARSINE","ARSINO","ARSIS","ARSON","ARSONS","ART","ARTAL","ARTEL","ARTELS","ARTERY","ARTFUL","ARTIER","ARTILY","ARTIST","ARTS","ARTSY","ARTY","ARUM","ARUMS","ARVAL","ARVO","ARVOS","ARYL","ARYLS","ASANA","ASANAS","ASARUM","ASCEND","ASCENT","ASCI","ASCOT","ASCOTS","ASCUS","ASDIC","ASDICS","ASEA","ASH","ASHCAN","ASHED","ASHEN","ASHES","ASHIER","ASHING","ASHLAR","ASHLER","ASHMAN","ASHMEN","ASHORE","ASHRAM","ASHY","ASIDE","ASIDES","ASK","ASKANT","ASKED","ASKER","ASKERS","ASKEW","ASKING","ASKOI","ASKOS","ASKS","ASLANT","ASLEEP","ASLOPE","ASP","ASPECT","ASPEN","ASPENS","ASPER","ASPERS","ASPIC","ASPICS","ASPIRE","ASPIS","ASPISH","ASPS","ASRAMA","ASS","ASSAI","ASSAIL","ASSAIS","ASSAY","ASSAYS","ASSENT","ASSERT","ASSES","ASSESS","ASSET","ASSETS","ASSIGN","ASSIST","ASSIZE","ASSOIL","ASSORT","ASSUME","ASSURE","ASTER","ASTERN","ASTERS","ASTHMA","ASTIR","ASTONY","ASTRAL","ASTRAY","ASTUTE","ASWARM","ASWIRL","ASWOON","ASYLA","ASYLUM","ATABAL","ATAMAN","ATAP","ATAPS","ATAVIC","ATAXIA","ATAXIC","ATAXY","ATE","ATELIC","ATES","ATILT","ATLAS","ATLATL","ATMA","ATMAN","ATMANS","ATMAS","ATOLL","ATOLLS","ATOM","ATOMIC","ATOMS","ATOMY","ATONAL","ATONE","ATONED","ATONER","ATONES","ATONIC","ATONY","ATOP","ATOPIC","ATOPY","ATRIA","ATRIAL","ATRIP","ATRIUM","ATT","ATTACH","ATTACK","ATTAIN","ATTAR","ATTARS","ATTEND","ATTENT","ATTEST","ATTIC","ATTICS","ATTIRE","ATTORN","ATTUNE","ATWAIN","ATWEEN","ATYPIC","AUBADE","AUBURN","AUCUBA","AUDAD","AUDADS","AUDIAL","AUDILE","AUDING","AUDIO","AUDIOS","AUDIT","AUDITS","AUGEND","AUGER","AUGERS","AUGHT","AUGHTS","AUGITE","AUGUR","AUGURS","AUGURY","AUGUST","AUK","AUKLET","AUKS","AULD","AULDER","AULIC","AUNT","AUNTIE","AUNTLY","AUNTS","AUNTY","AURA","AURAE","AURAL","AURAR","AURAS","AURATE","AUREI","AURES","AUREUS","AURIC","AURIS","AURIST","AURORA","AUROUS","AURUM","AURUMS","AUSPEX","AUSUBO","AUTEUR","AUTHOR","AUTISM","AUTO","AUTOED","AUTOS","AUTUMN","AUXIN","AUXINS","AVA","AVAIL","AVAILS","AVANT","AVAST","AVATAR","AVAUNT","AVE","AVENGE","AVENS","AVENUE","AVER","AVERS","AVERSE","AVERT","AVERTS","AVES","AVGAS","AVIAN","AVIANS","AVIARY","AVIATE","AVID","AVIDIN","AVIDLY","AVION","AVIONS","AVISO","AVISOS","AVO","AVOCET","AVOID","AVOIDS","AVOS","AVOSET","AVOUCH","AVOW","AVOWAL","AVOWED","AVOWER","AVOWS","AVULSE","AWA","AWAIT","AWAITS","AWAKE","AWAKED","AWAKEN","AWAKES","AWARD","AWARDS","AWARE","AWASH","AWAY","AWE","AWEARY","AWED","AWEE","AWEIGH","AWEING","AWES","AWFUL","AWHILE","AWHIRL","AWING","AWL","AWLESS","AWLS","AWMOUS","AWN","AWNED","AWNING","AWNS","AWNY","AWOKE","AWOKEN","AWOL","AWOLS","AWRY","AXAL","AXE","AXED","AXEL","AXELS","AXEMAN","AXEMEN","AXENIC","AXES","AXIAL","AXIL","AXILE","AXILLA","AXILS","AXING","AXIOM","AXIOMS","AXION","AXIONS","AXIS","AXISED","AXISES","AXITE","AXITES","AXLE","AXLED","AXLES","AXLIKE","AXMAN","AXMEN","AXON","AXONAL","AXONE","AXONES","AXONIC","AXONS","AXSEED","AYAH","AYAHS","AYE","AYES","AYIN","AYINS","AYS","AZALEA","AZAN","AZANS","AZIDE","AZIDES","AZIDO","AZINE","AZINES","AZLON","AZLONS","AZO","AZOIC","AZOLE","AZOLES","AZON","AZONAL","AZONIC","AZONS","AZOTE","AZOTED","AZOTES","AZOTH","AZOTHS","AZOTIC","AZURE","AZURES","AZYGOS","BAA","BAAED","BAAING","BAAL","BAALIM","BAALS","BAAS","BAASES","BABA","BABAS","BABBLE","BABE","BABEL","BABELS","BABES","BABIED","BABIES","BABKA","BABKAS","BABOO","BABOOL","BABOON","BABOOS","BABU","BABUL","BABULS","BABUS","BABY","BACCA","BACCAE","BACH","BACHED","BACHES","BACK","BACKED","BACKER","BACKS","BACKUP","BACON","BACONS","BACULA","BAD","BADASS","BADDER","BADDIE","BADDY","BADE","BADGE","BADGED","BADGER","BADGES","BADLY","BADMAN","BADMEN","BADS","BAFF","BAFFED","BAFFLE","BAFFS","BAFFY","BAG","BAGASS","BAGEL","BAGELS","BAGFUL","BAGGED","BAGGER","BAGGIE","BAGGY","BAGMAN","BAGMEN","BAGNIO","BAGS","BAGUET","BAGWIG","BAH","BAHT","BAHTS","BAIL","BAILED","BAILEE","BAILER","BAILEY","BAILIE","BAILOR","BAILS","BAIRN","BAIRNS","BAIT","BAITED","BAITER","BAITH","BAITS","BAIZA","BAIZAS","BAIZE","BAIZES","BAKE","BAKED","BAKER","BAKERS","BAKERY","BAKES","BAKING","BAL","BALAS","BALATA","BALBOA","BALD","BALDED","BALDER","BALDLY","BALDS","BALDY","BALE","BALED","BALEEN","BALER","BALERS","BALES","BALING","BALK","BALKED","BALKER","BALKS","BALKY","BALL","BALLAD","BALLED","BALLER","BALLET","BALLON","BALLOT","BALLS","BALLSY","BALLY","BALM","BALMS","BALMY","BALS","BALSA","BALSAM","BALSAS","BAM","BAMBOO","BAMMED","BAMS","BAN","BANAL","BANANA","BANCO","BANCOS","BAND","BANDED","BANDER","BANDIT","BANDOG","BANDS","BANDY","BANE","BANED","BANES","BANG","BANGED","BANGER","BANGLE","BANGS","BANI","BANIAN","BANING","BANISH","BANJAX","BANJO","BANJOS","BANK","BANKED","BANKER","BANKS","BANNED","BANNER","BANNET","BANNS","BANS","BANTAM","BANTER","BANTY","BANYAN","BANZAI","BAOBAB","BAP","BAPS","BAR","BARB","BARBAL","BARBE","BARBED","BARBEL","BARBER","BARBES","BARBET","BARBS","BARBUT","BARD","BARDE","BARDED","BARDES","BARDIC","BARDS","BARE","BARED","BAREGE","BARELY","BARER","BARES","BAREST","BARF","BARFED","BARFLY","BARFS","BARGE","BARGED","BARGEE","BARGES","BARHOP","BARIC","BARING","BARITE","BARIUM","BARK","BARKED","BARKER","BARKS","BARKY","BARLEY","BARLOW","BARM","BARMAN","BARMEN","BARMIE","BARMS","BARMY","BARN","BARNS","BARNY","BARON","BARONG","BARONS","BARONY","BARQUE","BARRE","BARRED","BARREL","BARREN","BARRES","BARRET","BARRIO","BARROW","BARS","BARTER","BARYE","BARYES","BARYON","BARYTA","BARYTE","BAS","BASAL","BASALT","BASE","BASED","BASELY","BASER","BASES","BASEST","BASH","BASHAW","BASHED","BASHER","BASHES","BASIC","BASICS","BASIFY","BASIL","BASILS","BASIN","BASING","BASINS","BASION","BASIS","BASK","BASKED","BASKET","BASKS","BASQUE","BASS","BASSES","BASSET","BASSI","BASSLY","BASSO","BASSOS","BASSY","BAST","BASTE","BASTED","BASTER","BASTES","BASTS","BAT","BATBOY","BATCH","BATE","BATEAU","BATED","BATES","BATH","BATHE","BATHED","BATHER","BATHES","BATHOS","BATHS","BATIK","BATIKS","BATING","BATMAN","BATMEN","BATON","BATONS","BATS","BATT","BATTED","BATTEN","BATTER","BATTIK","BATTLE","BATTS","BATTU","BATTUE","BATTY","BAUBEE","BAUBLE","BAUD","BAUDS","BAULK","BAULKS","BAULKY","BAWBEE","BAWD","BAWDRY","BAWDS","BAWDY","BAWL","BAWLED","BAWLER","BAWLS","BAWTIE","BAWTY","BAY","BAYAMO","BAYARD","BAYED","BAYING","BAYMAN","BAYMEN","BAYOU","BAYOUS","BAYS","BAZAAR","BAZAR","BAZARS","BAZOO","BAZOOS","BEACH","BEACHY","BEACON","BEAD","BEADED","BEADLE","BEADS","BEADY","BEAGLE","BEAK","BEAKED","BEAKER","BEAKS","BEAKY","BEAM","BEAMED","BEAMS","BEAMY","BEAN","BEANED","BEANIE","BEANO","BEANOS","BEANS","BEAR","BEARD","BEARDS","BEARER","BEARS","BEAST","BEASTS","BEAT","BEATEN","BEATER","BEATS","BEAU","BEAUS","BEAUT","BEAUTS","BEAUTY","BEAUX","BEAVER","BEBOP","BEBOPS","BECALM","BECAME","BECAP","BECAPS","BECK","BECKED","BECKET","BECKON","BECKS","BECLOG","BECOME","BED","BEDAMN","BEDAUB","BEDBUG","BEDDED","BEDDER","BEDECK","BEDEL","BEDELL","BEDELS","BEDEW","BEDEWS","BEDIM","BEDIMS","BEDLAM","BEDPAN","BEDRID","BEDRUG","BEDS","BEDSIT","BEDU","BEDUIN","BEDUMB","BEE","BEEBEE","BEECH","BEECHY","BEEF","BEEFED","BEEFS","BEEFY","BEEN","BEEP","BEEPED","BEEPER","BEEPS","BEER","BEERS","BEERY","BEES","BEET","BEETLE","BEETS","BEEVES","BEEZER","BEFALL","BEFELL","BEFIT","BEFITS","BEFLAG","BEFLEA","BEFOG","BEFOGS","BEFOOL","BEFORE","BEFOUL","BEFRET","BEG","BEGALL","BEGAN","BEGAT","BEGAZE","BEGET","BEGETS","BEGGAR","BEGGED","BEGIN","BEGINS","BEGIRD","BEGIRT","BEGLAD","BEGONE","BEGOT","BEGRIM","BEGS","BEGULF","BEGUM","BEGUMS","BEGUN","BEHALF","BEHAVE","BEHEAD","BEHELD","BEHEST","BEHIND","BEHOLD","BEHOOF","BEHOVE","BEHOWL","BEIGE","BEIGES","BEIGY","BEING","BEINGS","BEKISS","BEKNOT","BEL","BELADY","BELAUD","BELAY","BELAYS","BELCH","BELDAM","BELEAP","BELFRY","BELGA","BELGAS","BELIE","BELIED","BELIEF","BELIER","BELIES","BELIKE","BELIVE","BELL","BELLE","BELLED","BELLES","BELLOW","BELLS","BELLY","BELONG","BELOW","BELOWS","BELS","BELT","BELTED","BELTER","BELTS","BELUGA","BEMA","BEMAS","BEMATA","BEMEAN","BEMIRE","BEMIST","BEMIX","BEMIXT","BEMOAN","BEMOCK","BEMUSE","BEN","BENAME","BENCH","BEND","BENDAY","BENDED","BENDEE","BENDER","BENDS","BENDY","BENDYS","BENE","BENES","BENIGN","BENNE","BENNES","BENNET","BENNI","BENNIS","BENNY","BENS","BENT","BENTS","BENUMB","BENZAL","BENZIN","BENZOL","BENZYL","BERAKE","BERATE","BEREFT","BERET","BERETS","BERG","BERGS","BERIME","BERLIN","BERM","BERME","BERMES","BERMS","BERRY","BERTH","BERTHA","BERTHS","BERYL","BERYLS","BESEEM","BESET","BESETS","BESIDE","BESMUT","BESNOW","BESOM","BESOMS","BESOT","BESOTS","BEST","BESTED","BESTIR","BESTOW","BESTS","BESTUD","BET","BETA","BETAKE","BETAS","BETEL","BETELS","BETH","BETHEL","BETHS","BETIDE","BETIME","BETISE","BETON","BETONS","BETONY","BETOOK","BETRAY","BETS","BETTA","BETTAS","BETTED","BETTER","BETTOR","BEVEL","BEVELS","BEVIES","BEVOR","BEVORS","BEVY","BEWAIL","BEWARE","BEWEEP","BEWEPT","BEWIG","BEWIGS","BEWORM","BEWRAP","BEWRAY","BEY","BEYLIC","BEYLIK","BEYOND","BEYS","BEZANT","BEZAZZ","BEZEL","BEZELS","BEZIL","BEZILS","BEZOAR","BHAKTA","BHAKTI","BHANG","BHANGS","BHARAL","BHOOT","BHOOTS","BHUT","BHUTS","BIALI","BIALIS","BIALY","BIALYS","BIAS","BIASED","BIASES","BIAXAL","BIB","BIBB","BIBBED","BIBBER","BIBBS","BIBLE","BIBLES","BIBS","BICARB","BICE","BICEPS","BICES","BICKER","BICORN","BICRON","BID","BIDDEN","BIDDER","BIDDY","BIDE","BIDED","BIDER","BIDERS","BIDES","BIDET","BIDETS","BIDING","BIDS","BIELD","BIELDS","BIER","BIERS","BIFACE","BIFF","BIFFED","BIFFIN","BIFFS","BIFFY","BIFID","BIFLEX","BIFOLD","BIFORM","BIG","BIGAMY","BIGEYE","BIGGER","BIGGIE","BIGGIN","BIGHT","BIGHTS","BIGLY","BIGOT","BIGOTS","BIGS","BIGWIG","BIJOU","BIJOUS","BIJOUX","BIKE","BIKED","BIKER","BIKERS","BIKES","BIKIE","BIKIES","BIKING","BIKINI","BILBO","BILBOA","BILBOS","BILE","BILES","BILGE","BILGED","BILGES","BILGY","BILK","BILKED","BILKER","BILKS","BILL","BILLED","BILLER","BILLET","BILLIE","BILLON","BILLOW","BILLS","BILLY","BIMA","BIMAH","BIMAHS","BIMAS","BIMBO","BIMBOS","BIN","BINAL","BINARY","BINATE","BIND","BINDER","BINDI","BINDIS","BINDLE","BINDS","BINE","BINES","BINGE","BINGED","BINGER","BINGES","BINGO","BINGOS","BINIT","BINITS","BINNED","BINOCS","BINS","BINT","BINTS","BIO","BIOGAS","BIOGEN","BIOME","BIOMES","BIONIC","BIONT","BIONTS","BIOPIC","BIOPSY","BIOS","BIOTA","BIOTAS","BIOTIC","BIOTIN","BIPACK","BIPED","BIPEDS","BIPOD","BIPODS","BIRCH","BIRD","BIRDED","BIRDER","BIRDIE","BIRDS","BIREME","BIRK","BIRKIE","BIRKS","BIRL","BIRLE","BIRLED","BIRLER","BIRLES","BIRLS","BIRR","BIRRED","BIRRS","BIRSE","BIRSES","BIRTH","BIRTHS","BIS","BISE","BISECT","BISES","BISHOP","BISK","BISKS","BISON","BISONS","BISQUE","BISTER","BISTRE","BISTRO","BIT","BITCH","BITCHY","BITE","BITER","BITERS","BITES","BITING","BITS","BITSY","BITT","BITTED","BITTEN","BITTER","BITTS","BITTY","BIZ","BIZE","BIZES","BIZONE","BIZZES","BLAB","BLABBY","BLABS","BLACK","BLACKS","BLADE","BLADED","BLADES","BLAE","BLAH","BLAHS","BLAIN","BLAINS","BLAM","BLAME","BLAMED","BLAMER","BLAMES","BLAMS","BLANCH","BLAND","BLANK","BLANKS","BLARE","BLARED","BLARES","BLASE","BLAST","BLASTS","BLASTY","BLAT","BLATE","BLATS","BLAW","BLAWED","BLAWN","BLAWS","BLAZE","BLAZED","BLAZER","BLAZES","BLAZON","BLEACH","BLEAK","BLEAKS","BLEAR","BLEARS","BLEARY","BLEAT","BLEATS","BLEB","BLEBBY","BLEBS","BLED","BLEED","BLEEDS","BLEEP","BLEEPS","BLENCH","BLEND","BLENDE","BLENDS","BLENNY","BLENT","BLESS","BLEST","BLET","BLETS","BLEW","BLIGHT","BLIMEY","BLIMP","BLIMPS","BLIMY","BLIN","BLIND","BLINDS","BLINI","BLINIS","BLINK","BLINKS","BLINTZ","BLIP","BLIPS","BLISS","BLITE","BLITES","BLITHE","BLITZ","BLOAT","BLOATS","BLOB","BLOBS","BLOC","BLOCK","BLOCKS","BLOCKY","BLOCS","BLOKE","BLOKES","BLOND","BLONDE","BLONDS","BLOOD","BLOODS","BLOODY","BLOOEY","BLOOIE","BLOOM","BLOOMS","BLOOMY","BLOOP","BLOOPS","BLOT","BLOTCH","BLOTS","BLOTTO","BLOTTY","BLOUSE","BLOUSY","BLOW","BLOWBY","BLOWED","BLOWER","BLOWN","BLOWS","BLOWSY","BLOWUP","BLOWY","BLOWZY","BLUB","BLUBS","BLUE","BLUED","BLUELY","BLUER","BLUES","BLUEST","BLUESY","BLUET","BLUETS","BLUEY","BLUEYS","BLUFF","BLUFFS","BLUING","BLUISH","BLUME","BLUMED","BLUMES","BLUNGE","BLUNT","BLUNTS","BLUR","BLURB","BLURBS","BLURRY","BLURS","BLURT","BLURTS","BLUSH","BLYPE","BLYPES","BOA","BOAR","BOARD","BOARDS","BOARS","BOART","BOARTS","BOAS","BOAST","BOASTS","BOAT","BOATED","BOATEL","BOATER","BOATS","BOB","BOBBED","BOBBER","BOBBIN","BOBBLE","BOBBY","BOBCAT","BOBS","BOCCE","BOCCES","BOCCI","BOCCIA","BOCCIE","BOCCIS","BOCHE","BOCHES","BOCK","BOCKS","BOD","BODE","BODED","BODEGA","BODES","BODICE","BODIED","BODIES","BODILY","BODING","BODKIN","BODS","BODY","BOFF","BOFFIN","BOFFO","BOFFOS","BOFFS","BOG","BOGAN","BOGANS","BOGEY","BOGEYS","BOGGED","BOGGLE","BOGGY","BOGIE","BOGIES","BOGLE","BOGLES","BOGS","BOGUS","BOGY","BOHEA","BOHEAS","BOHUNK","BOIL","BOILED","BOILER","BOILS","BOING","BOITE","BOITES","BOLA","BOLAR","BOLAS","BOLD","BOLDER","BOLDLY","BOLDS","BOLE","BOLERO","BOLES","BOLETE","BOLETI","BOLIDE","BOLL","BOLLED","BOLLIX","BOLLOX","BOLLS","BOLO","BOLOS","BOLSHY","BOLSON","BOLT","BOLTED","BOLTER","BOLTS","BOLUS","BOMB","BOMBAX","BOMBE","BOMBED","BOMBER","BOMBES","BOMBS","BOMBYX","BONACI","BONBON","BOND","BONDED","BONDER","BONDS","BONDUC","BONE","BONED","BONER","BONERS","BONES","BONEY","BONG","BONGED","BONGO","BONGOS","BONGS","BONIER","BONING","BONITA","BONITO","BONK","BONKED","BONKS","BONNE","BONNES","BONNET","BONNIE","BONNY","BONSAI","BONUS","BONY","BONZE","BONZER","BONZES","BOO","BOOB","BOOBED","BOOBIE","BOOBOO","BOOBS","BOOBY","BOODLE","BOOED","BOOGER","BOOGEY","BOOGIE","BOOGY","BOOHOO","BOOING","BOOK","BOOKED","BOOKER","BOOKIE","BOOKS","BOOM","BOOMED","BOOMER","BOOMS","BOOMY","BOON","BOONS","BOOR","BOORS","BOOS","BOOST","BOOSTS","BOOT","BOOTED","BOOTEE","BOOTH","BOOTHS","BOOTIE","BOOTS","BOOTY","BOOZE","BOOZED","BOOZER","BOOZES","BOOZY","BOP","BOPEEP","BOPPED","BOPPER","BOPS","BORA","BORAGE","BORAL","BORALS","BORANE","BORAS","BORATE","BORAX","BORDEL","BORDER","BORE","BOREAL","BORED","BOREEN","BORER","BORERS","BORES","BORIC","BORIDE","BORING","BORN","BORNE","BORON","BORONS","BORROW","BORSCH","BORSHT","BORT","BORTS","BORTY","BORTZ","BORZOI","BOS","BOSH","BOSHES","BOSK","BOSKER","BOSKET","BOSKS","BOSKY","BOSOM","BOSOMS","BOSOMY","BOSON","BOSONS","BOSQUE","BOSS","BOSSED","BOSSES","BOSSY","BOSTON","BOSUN","BOSUNS","BOT","BOTA","BOTANY","BOTAS","BOTCH","BOTCHY","BOTEL","BOTELS","BOTFLY","BOTH","BOTHER","BOTHY","BOTS","BOTT","BOTTLE","BOTTOM","BOTTS","BOUBOU","BOUCLE","BOUFFE","BOUGH","BOUGHS","BOUGHT","BOUGIE","BOULE","BOULES","BOULLE","BOUNCE","BOUNCY","BOUND","BOUNDS","BOUNTY","BOURG","BOURGS","BOURN","BOURNE","BOURNS","BOURSE","BOUSE","BOUSED","BOUSES","BOUSY","BOUT","BOUTON","BOUTS","BOVID","BOVIDS","BOVINE","BOW","BOWED","BOWEL","BOWELS","BOWER","BOWERS","BOWERY","BOWFIN","BOWING","BOWL","BOWLED","BOWLEG","BOWLER","BOWLS","BOWMAN","BOWMEN","BOWPOT","BOWS","BOWSE","BOWSED","BOWSES","BOWWOW","BOWYER","BOX","BOXCAR","BOXED","BOXER","BOXERS","BOXES","BOXFUL","BOXIER","BOXING","BOXY","BOY","BOYAR","BOYARD","BOYARS","BOYISH","BOYLA","BOYLAS","BOYO","BOYOS","BOYS","BOZO","BOZOS","BRA","BRACE","BRACED","BRACER","BRACES","BRACH","BRACHS","BRACT","BRACTS","BRAD","BRADS","BRAE","BRAES","BRAG","BRAGGY","BRAGS","BRAHMA","BRAID","BRAIDS","BRAIL","BRAILS","BRAIN","BRAINS","BRAINY","BRAISE","BRAIZE","BRAKE","BRAKED","BRAKES","BRAKY","BRAN","BRANCH","BRAND","BRANDS","BRANDY","BRANK","BRANKS","BRANNY","BRANS","BRANT","BRANTS","BRAS","BRASH","BRASHY","BRASIL","BRASS","BRASSY","BRAT","BRATS","BRATTY","BRAVA","BRAVAS","BRAVE","BRAVED","BRAVER","BRAVES","BRAVI","BRAVO","BRAVOS","BRAW","BRAWER","BRAWL","BRAWLS","BRAWLY","BRAWN","BRAWNS","BRAWNY","BRAWS","BRAXY","BRAY","BRAYED","BRAYER","BRAYS","BRAZA","BRAZAS","BRAZE","BRAZED","BRAZEN","BRAZER","BRAZES","BRAZIL","BREACH","BREAD","BREADS","BREADY","BREAK","BREAKS","BREAM","BREAMS","BREAST","BREATH","BRED","BREDE","BREDES","BREE","BREECH","BREED","BREEDS","BREEKS","BREES","BREEZE","BREEZY","BREGMA","BREN","BRENS","BRENT","BRENTS","BREVE","BREVES","BREVET","BREW","BREWED","BREWER","BREWIS","BREWS","BRIAR","BRIARD","BRIARS","BRIARY","BRIBE","BRIBED","BRIBEE","BRIBER","BRIBES","BRICK","BRICKS","BRICKY","BRIDAL","BRIDE","BRIDES","BRIDGE","BRIDLE","BRIE","BRIEF","BRIEFS","BRIER","BRIERS","BRIERY","BRIES","BRIG","BRIGHT","BRIGS","BRILL","BRILLS","BRIM","BRIMS","BRIN","BRINE","BRINED","BRINER","BRINES","BRING","BRINGS","BRINK","BRINKS","BRINS","BRINY","BRIO","BRIONY","BRIOS","BRIS","BRISK","BRISKS","BRIT","BRITS","BRITT","BRITTS","BRO","BROACH","BROAD","BROADS","BROCHE","BROCK","BROCKS","BROGAN","BROGUE","BROIL","BROILS","BROKE","BROKEN","BROKER","BROLLY","BROMAL","BROME","BROMES","BROMIC","BROMID","BROMIN","BROMO","BROMOS","BRONC","BRONCO","BRONCS","BRONZE","BRONZY","BROO","BROOCH","BROOD","BROODS","BROODY","BROOK","BROOKS","BROOM","BROOMS","BROOMY","BROOS","BROS","BROSE","BROSES","BROSY","BROTH","BROTHS","BROTHY","BROW","BROWED","BROWN","BROWNS","BROWNY","BROWS","BROWSE","BRR","BRRR","BRUCIN","BRUGH","BRUGHS","BRUIN","BRUINS","BRUISE","BRUIT","BRUITS","BRULOT","BRUMAL","BRUMBY","BRUME","BRUMES","BRUNCH","BRUNET","BRUNT","BRUNTS","BRUSH","BRUSHY","BRUSK","BRUT","BRUTAL","BRUTE","BRUTED","BRUTES","BRYONY","BUB","BUBAL","BUBALE","BUBALS","BUBBLE","BUBBLY","BUBBY","BUBO","BUBOED","BUBOES","BUBS","BUCCAL","BUCK","BUCKED","BUCKER","BUCKET","BUCKLE","BUCKO","BUCKRA","BUCKS","BUD","BUDDED","BUDDER","BUDDLE","BUDDY","BUDGE","BUDGED","BUDGER","BUDGES","BUDGET","BUDGIE","BUDS","BUFF","BUFFED","BUFFER","BUFFET","BUFFI","BUFFO","BUFFOS","BUFFS","BUFFY","BUG","BUGEYE","BUGGED","BUGGER","BUGGY","BUGLE","BUGLED","BUGLER","BUGLES","BUGS","BUGSHA","BUHL","BUHLS","BUHR","BUHRS","BUILD","BUILDS","BUILT","BULB","BULBAR","BULBED","BULBEL","BULBIL","BULBS","BULBUL","BULGE","BULGED","BULGER","BULGES","BULGUR","BULGY","BULK","BULKED","BULKS","BULKY","BULL","BULLA","BULLAE","BULLED","BULLET","BULLS","BULLY","BUM","BUMBLE","BUMF","BUMFS","BUMKIN","BUMMED","BUMMER","BUMP","BUMPED","BUMPER","BUMPH","BUMPHS","BUMPS","BUMPY","BUMS","BUN","BUNCH","BUNCHY","BUNCO","BUNCOS","BUND","BUNDLE","BUNDS","BUNDT","BUNDTS","BUNG","BUNGED","BUNGEE","BUNGLE","BUNGS","BUNION","BUNK","BUNKED","BUNKER","BUNKO","BUNKOS","BUNKS","BUNKUM","BUNN","BUNNS","BUNNY","BUNS","BUNT","BUNTED","BUNTER","BUNTS","BUNYA","BUNYAS","BUOY","BUOYED","BUOYS","BUPPIE","BUQSHA","BUR","BURA","BURAN","BURANS","BURAS","BURBLE","BURBLY","BURBOT","BURBS","BURD","BURDEN","BURDIE","BURDS","BUREAU","BURET","BURETS","BURG","BURGEE","BURGER","BURGH","BURGHS","BURGLE","BURGOO","BURGS","BURIAL","BURIED","BURIER","BURIES","BURIN","BURINS","BURKE","BURKED","BURKER","BURKES","BURL","BURLAP","BURLED","BURLER","BURLEY","BURLS","BURLY","BURN","BURNED","BURNER","BURNET","BURNIE","BURNS","BURNT","BURP","BURPED","BURPS","BURR","BURRED","BURRER","BURRO","BURROS","BURROW","BURRS","BURRY","BURS","BURSA","BURSAE","BURSAL","BURSAR","BURSAS","BURSE","BURSES","BURST","BURSTS","BURTON","BURY","BUS","BUSBAR","BUSBOY","BUSBY","BUSED","BUSES","BUSH","BUSHED","BUSHEL","BUSHER","BUSHES","BUSHWA","BUSHY","BUSIED","BUSIER","BUSIES","BUSILY","BUSING","BUSK","BUSKED","BUSKER","BUSKIN","BUSKS","BUSMAN","BUSMEN","BUSS","BUSSED","BUSSES","BUST","BUSTED","BUSTER","BUSTIC","BUSTLE","BUSTS","BUSTY","BUSY","BUT","BUTANE","BUTCH","BUTE","BUTENE","BUTEO","BUTEOS","BUTLE","BUTLED","BUTLER","BUTLES","BUTS","BUTT","BUTTE","BUTTED","BUTTER","BUTTES","BUTTON","BUTTS","BUTTY","BUTUT","BUTUTS","BUTYL","BUTYLS","BUXOM","BUY","BUYER","BUYERS","BUYING","BUYOUT","BUYS","BUZUKI","BUZZ","BUZZED","BUZZER","BUZZES","BWANA","BWANAS","BYE","BYELAW","BYES","BYGONE","BYLAW","BYLAWS","BYLINE","BYNAME","BYPASS","BYPAST","BYPATH","BYPLAY","BYRE","BYRES","BYRL","BYRLED","BYRLS","BYRNIE","BYROAD","BYS","BYSSI","BYSSUS","BYTALK","BYTE","BYTES","BYWAY","BYWAYS","BYWORD","BYWORK","BYZANT","CAB","CABAL","CABALA","CABALS","CABANA","CABBED","CABBIE","CABBY","CABER","CABERS","CABIN","CABINS","CABLE","CABLED","CABLES","CABLET","CABMAN","CABMEN","CABOB","CABOBS","CABS","CACA","CACAO","CACAOS","CACAS","CACHE","CACHED","CACHES","CACHET","CACHOU","CACKLE","CACTI","CACTUS","CAD","CADDIE","CADDIS","CADDY","CADE","CADENT","CADES","CADET","CADETS","CADGE","CADGED","CADGER","CADGES","CADGY","CADI","CADIS","CADMIC","CADRE","CADRES","CADS","CAECA","CAECAL","CAECUM","CAEOMA","CAESAR","CAFE","CAFES","CAFF","CAFFS","CAFTAN","CAGE","CAGED","CAGER","CAGERS","CAGES","CAGEY","CAGIER","CAGILY","CAGING","CAGY","CAHIER","CAHOOT","CAHOW","CAHOWS","CAID","CAIDS","CAIMAN","CAIN","CAINS","CAIQUE","CAIRD","CAIRDS","CAIRN","CAIRNS","CAIRNY","CAJOLE","CAJON","CAKE","CAKED","CAKES","CAKEY","CAKIER","CAKING","CAKY","CALAMI","CALASH","CALCAR","CALCES","CALCIC","CALESA","CALF","CALFS","CALICO","CALIF","CALIFS","CALIPH","CALIX","CALK","CALKED","CALKER","CALKIN","CALKS","CALL","CALLA","CALLAN","CALLAS","CALLED","CALLER","CALLET","CALLOW","CALLS","CALLUS","CALM","CALMED","CALMER","CALMLY","CALMS","CALO","CALORY","CALPAC","CALQUE","CALVE","CALVED","CALVES","CALX","CALXES","CALYX","CAM","CAMAIL","CAMAS","CAMASS","CAMBER","CAMBIA","CAME","CAMEL","CAMELS","CAMEO","CAMEOS","CAMERA","CAMES","CAMION","CAMISA","CAMISE","CAMLET","CAMP","CAMPED","CAMPER","CAMPI","CAMPO","CAMPOS","CAMPS","CAMPUS","CAMPY","CAMS","CAN","CANAL","CANALS","CANAPE","CANARD","CANARY","CANCAN","CANCEL","CANCER","CANCHA","CANDID","CANDLE","CANDOR","CANDY","CANE","CANED","CANER","CANERS","CANES","CANFUL","CANGUE","CANID","CANIDS","CANINE","CANING","CANKER","CANNA","CANNAS","CANNED","CANNEL","CANNER","CANNIE","CANNON","CANNOT","CANNY","CANOE","CANOED","CANOES","CANOLA","CANON","CANONS","CANOPY","CANS","CANSO","CANSOS","CANST","CANT","CANTED","CANTER","CANTHI","CANTIC","CANTLE","CANTO","CANTON","CANTOR","CANTOS","CANTS","CANTUS","CANTY","CANULA","CANVAS","CANYON","CAP","CAPE","CAPED","CAPER","CAPERS","CAPES","CAPFUL","CAPH","CAPHS","CAPIAS","CAPITA","CAPLET","CAPLIN","CAPO","CAPON","CAPONS","CAPOS","CAPOTE","CAPPED","CAPPER","CAPRIC","CAPRIS","CAPS","CAPSID","CAPTAN","CAPTOR","CAPUT","CAR","CARACK","CARAFE","CARAT","CARATE","CARATS","CARB","CARBO","CARBON","CARBOS","CARBOY","CARBS","CARCEL","CARD","CARDED","CARDER","CARDIA","CARDS","CARE","CARED","CAREEN","CAREER","CARER","CARERS","CARES","CARESS","CARET","CARETS","CAREX","CARFUL","CARGO","CARGOS","CARHOP","CARIBE","CARIED","CARIES","CARINA","CARING","CARK","CARKED","CARKS","CARL","CARLE","CARLES","CARLIN","CARLS","CARMAN","CARMEN","CARN","CARNAL","CARNET","CARNEY","CARNIE","CARNS","CARNY","CAROB","CAROBS","CAROCH","CAROL","CAROLI","CAROLS","CAROM","CAROMS","CARP","CARPAL","CARPED","CARPEL","CARPER","CARPET","CARPI","CARPS","CARPUS","CARR","CARREL","CARROM","CARROT","CARRS","CARRY","CARS","CARSE","CARSES","CART","CARTE","CARTED","CARTEL","CARTER","CARTES","CARTON","CARTOP","CARTS","CARVE","CARVED","CARVEL","CARVEN","CARVER","CARVES","CASA","CASABA","CASAS","CASAVA","CASBAH","CASE","CASED","CASEFY","CASEIC","CASEIN","CASERN","CASES","CASH","CASHAW","CASHED","CASHES","CASHEW","CASHOO","CASING","CASINI","CASINO","CASITA","CASK","CASKED","CASKET","CASKS","CASKY","CASQUE","CASSIA","CASSIS","CAST","CASTE","CASTER","CASTES","CASTLE","CASTOR","CASTS","CASUAL","CASUS","CAT","CATALO","CATCH","CATCHY","CATE","CATENA","CATER","CATERS","CATES","CATGUT","CATION","CATKIN","CATLIN","CATNAP","CATNIP","CATS","CATSUP","CATTED","CATTIE","CATTLE","CATTY","CAUCUS","CAUDAD","CAUDAL","CAUDEX","CAUDLE","CAUGHT","CAUL","CAULD","CAULDS","CAULES","CAULIS","CAULK","CAULKS","CAULS","CAUSAL","CAUSE","CAUSED","CAUSER","CAUSES","CAUSEY","CAVE","CAVEAT","CAVED","CAVER","CAVERN","CAVERS","CAVES","CAVIAR","CAVIE","CAVIES","CAVIL","CAVILS","CAVING","CAVITY","CAVORT","CAVY","CAW","CAWED","CAWING","CAWS","CAY","CAYMAN","CAYS","CAYUSE","CEASE","CEASED","CEASES","CEBID","CEBIDS","CEBOID","CECA","CECAL","CECUM","CEDAR","CEDARN","CEDARS","CEDE","CEDED","CEDER","CEDERS","CEDES","CEDI","CEDING","CEDIS","CEDULA","CEE","CEES","CEIBA","CEIBAS","CEIL","CEILED","CEILER","CEILS","CEL","CELEB","CELEBS","CELERY","CELIAC","CELL","CELLA","CELLAE","CELLAR","CELLED","CELLI","CELLO","CELLOS","CELLS","CELOM","CELOMS","CELS","CELT","CELTS","CEMENT","CENOTE","CENSE","CENSED","CENSER","CENSES","CENSOR","CENSUS","CENT","CENTAL","CENTER","CENTO","CENTOS","CENTRA","CENTRE","CENTS","CENTUM","CEORL","CEORLS","CEP","CEPE","CEPES","CEPS","CERATE","CERCI","CERCIS","CERCUS","CERE","CEREAL","CERED","CERES","CEREUS","CERIA","CERIAS","CERIC","CERING","CERIPH","CERISE","CERITE","CERIUM","CERMET","CERO","CEROS","CEROUS","CERTES","CERUSE","CERVID","CERVIX","CESIUM","CESS","CESSED","CESSES","CESTA","CESTAS","CESTI","CESTOI","CESTOS","CESTUS","CESURA","CETANE","CETE","CETES","CHABUK","CHACMA","CHAD","CHADAR","CHADOR","CHADRI","CHADS","CHAETA","CHAFE","CHAFED","CHAFER","CHAFES","CHAFF","CHAFFS","CHAFFY","CHAIN","CHAINE","CHAINS","CHAIR","CHAIRS","CHAISE","CHAKRA","CHALAH","CHALEH","CHALET","CHALK","CHALKS","CHALKY","CHALLA","CHALLY","CHALOT","CHAM","CHAMMY","CHAMP","CHAMPS","CHAMPY","CHAMS","CHANCE","CHANCY","CHANG","CHANGE","CHANGS","CHANT","CHANTS","CHANTY","CHAO","CHAOS","CHAP","CHAPE","CHAPEL","CHAPES","CHAPS","CHAPT","CHAR","CHARAS","CHARD","CHARDS","CHARE","CHARED","CHARES","CHARGE","CHARK","CHARKA","CHARKS","CHARM","CHARMS","CHARR","CHARRO","CHARRS","CHARRY","CHARS","CHART","CHARTS","CHARY","CHASE","CHASED","CHASER","CHASES","CHASM","CHASMS","CHASMY","CHASSE","CHASTE","CHAT","CHATS","CHATTY","CHAUNT","CHAW","CHAWED","CHAWER","CHAWS","CHAY","CHAYS","CHAZAN","CHEAP","CHEAPO","CHEAPS","CHEAT","CHEATS","CHEBEC","CHECK","CHECKS","CHEDER","CHEEK","CHEEKS","CHEEKY","CHEEP","CHEEPS","CHEER","CHEERO","CHEERS","CHEERY","CHEESE","CHEESY","CHEF","CHEFS","CHEGOE","CHELA","CHELAE","CHELAS","CHEMIC","CHEMO","CHEMOS","CHEQUE","CHERRY","CHERT","CHERTS","CHERTY","CHERUB","CHESS","CHEST","CHESTS","CHESTY","CHETAH","CHETH","CHETHS","CHEVRE","CHEVY","CHEW","CHEWED","CHEWER","CHEWS","CHEWY","CHEZ","CHI","CHIA","CHIAO","CHIAS","CHIASM","CHIAUS","CHIC","CHICER","CHICHI","CHICK","CHICKS","CHICLE","CHICLY","CHICO","CHICOS","CHICS","CHID","CHIDE","CHIDED","CHIDER","CHIDES","CHIEF","CHIEFS","CHIEL","CHIELD","CHIELS","CHIGOE","CHILD","CHILDE","CHILE","CHILES","CHILI","CHILL","CHILLI","CHILLS","CHILLY","CHIMAR","CHIMB","CHIMBS","CHIME","CHIMED","CHIMER","CHIMES","CHIMLA","CHIMP","CHIMPS","CHIN","CHINA","CHINAS","CHINCH","CHINE","CHINED","CHINES","CHINK","CHINKS","CHINKY","CHINO","CHINOS","CHINS","CHINTS","CHINTZ","CHIP","CHIPPY","CHIPS","CHIRAL","CHIRK","CHIRKS","CHIRM","CHIRMS","CHIRO","CHIROS","CHIRP","CHIRPS","CHIRPY","CHIRR","CHIRRE","CHIRRS","CHIS","CHISEL","CHIT","CHITAL","CHITIN","CHITON","CHITS","CHITTY","CHIVE","CHIVES","CHIVVY","CHIVY","CHOANA","CHOCK","CHOCKS","CHOICE","CHOIR","CHOIRS","CHOKE","CHOKED","CHOKER","CHOKES","CHOKEY","CHOKY","CHOLER","CHOLLA","CHOLO","CHOLOS","CHOMP","CHOMPS","CHON","CHOOK","CHOOKS","CHOOSE","CHOOSY","CHOP","CHOPIN","CHOPPY","CHOPS","CHORAL","CHORD","CHORDS","CHORE","CHOREA","CHORED","CHORES","CHORIC","CHORUS","CHOSE","CHOSEN","CHOSES","CHOTT","CHOTTS","CHOUGH","CHOUSE","CHOUSH","CHOW","CHOWED","CHOWS","CHOWSE","CHRISM","CHROMA","CHROME","CHROMO","CHUB","CHUBBY","CHUBS","CHUCK","CHUCKS","CHUCKY","CHUFA","CHUFAS","CHUFF","CHUFFS","CHUFFY","CHUG","CHUGS","CHUKAR","CHUKKA","CHUM","CHUMMY","CHUMP","CHUMPS","CHUMS","CHUNK","CHUNKS","CHUNKY","CHURCH","CHURL","CHURLS","CHURN","CHURNS","CHURR","CHURRS","CHUTE","CHUTED","CHUTES","CHYLE","CHYLES","CHYME","CHYMES","CHYMIC","CIAO","CIBOL","CIBOLS","CICADA","CICALA","CICALE","CICELY","CICERO","CIDER","CIDERS","CIGAR","CIGARS","CILIA","CILICE","CILIUM","CIMEX","CINCH","CINDER","CINE","CINEMA","CINEOL","CINES","CINQUE","CION","CIONS","CIPHER","CIRCA","CIRCLE","CIRCUS","CIRE","CIRES","CIRQUE","CIRRI","CIRRUS","CIS","CISCO","CISCOS","CISSY","CIST","CISTS","CISTUS","CITE","CITED","CITER","CITERS","CITES","CITHER","CITIED","CITIES","CITIFY","CITING","CITOLA","CITOLE","CITRAL","CITRIC","CITRIN","CITRON","CITRUS","CITY","CIVET","CIVETS","CIVIC","CIVICS","CIVIE","CIVIES","CIVIL","CIVISM","CIVVY","CLACH","CLACHS","CLACK","CLACKS","CLAD","CLADE","CLADES","CLADS","CLAG","CLAGS","CLAIM","CLAIMS","CLAM","CLAMMY","CLAMOR","CLAMP","CLAMPS","CLAMS","CLAN","CLANG","CLANGS","CLANK","CLANKS","CLANS","CLAP","CLAPS","CLAPT","CLAQUE","CLARET","CLARO","CLAROS","CLARY","CLASH","CLASP","CLASPS","CLASPT","CLASS","CLASSY","CLAST","CLASTS","CLAUSE","CLAVE","CLAVER","CLAVES","CLAVI","CLAVUS","CLAW","CLAWED","CLAWER","CLAWS","CLAXON","CLAY","CLAYED","CLAYEY","CLAYS","CLEAN","CLEANS","CLEAR","CLEARS","CLEAT","CLEATS","CLEAVE","CLEEK","CLEEKS","CLEF","CLEFS","CLEFT","CLEFTS","CLENCH","CLEOME","CLEPE","CLEPED","CLEPES","CLEPT","CLERGY","CLERIC","CLERID","CLERK","CLERKS","CLEVER","CLEVIS","CLEW","CLEWED","CLEWS","CLICHE","CLICK","CLICKS","CLIENT","CLIFF","CLIFFS","CLIFFY","CLIFT","CLIFTS","CLIMAX","CLIMB","CLIMBS","CLIME","CLIMES","CLINAL","CLINCH","CLINE","CLINES","CLING","CLINGS","CLINGY","CLINIC","CLINK","CLINKS","CLIP","CLIPS","CLIPT","CLIQUE","CLIQUY","CLITIC","CLIVIA","CLOACA","CLOAK","CLOAKS","CLOCHE","CLOCK","CLOCKS","CLOD","CLODDY","CLODS","CLOG","CLOGGY","CLOGS","CLOMB","CLOMP","CLOMPS","CLON","CLONAL","CLONE","CLONED","CLONER","CLONES","CLONIC","CLONK","CLONKS","CLONS","CLONUS","CLOOT","CLOOTS","CLOP","CLOPS","CLOQUE","CLOSE","CLOSED","CLOSER","CLOSES","CLOSET","CLOT","CLOTH","CLOTHE","CLOTHS","CLOTS","CLOTTY","CLOUD","CLOUDS","CLOUDY","CLOUGH","CLOUR","CLOURS","CLOUT","CLOUTS","CLOVE","CLOVEN","CLOVER","CLOVES","CLOWN","CLOWNS","CLOY","CLOYED","CLOYS","CLOZE","CLOZES","CLUB","CLUBBY","CLUBS","CLUCK","CLUCKS","CLUE","CLUED","CLUES","CLUING","CLUMP","CLUMPS","CLUMPY","CLUMSY","CLUNG","CLUNK","CLUNKS","CLUNKY","CLUTCH","CLYPEI","COACH","COACT","COACTS","COAL","COALA","COALAS","COALED","COALER","COALS","COALY","COAPT","COAPTS","COARSE","COAST","COASTS","COAT","COATED","COATEE","COATER","COATI","COATIS","COATS","COAX","COAXAL","COAXED","COAXER","COAXES","COB","COBALT","COBB","COBBER","COBBLE","COBBS","COBBY","COBIA","COBIAS","COBLE","COBLES","COBNUT","COBRA","COBRAS","COBS","COBWEB","COCA","COCAIN","COCAS","COCCAL","COCCI","COCCIC","COCCID","COCCUS","COCCYX","COCHIN","COCK","COCKED","COCKER","COCKLE","COCKS","COCKUP","COCKY","COCO","COCOA","COCOAS","COCOON","COCOS","COD","CODA","CODAS","CODDED","CODDER","CODDLE","CODE","CODEC","CODECS","CODED","CODEIA","CODEIN","CODEN","CODENS","CODER","CODERS","CODES","CODEX","CODGER","CODIFY","CODING","CODLIN","CODON","CODONS","CODS","COED","COEDIT","COEDS","COELOM","COEMPT","COERCE","COEVAL","COFF","COFFEE","COFFER","COFFIN","COFFLE","COFFS","COFT","COG","COGENT","COGGED","COGITO","COGNAC","COGON","COGONS","COGS","COGWAY","COHEAD","COHEIR","COHERE","COHO","COHOG","COHOGS","COHORT","COHOS","COHOSH","COHOST","COHUNE","COIF","COIFED","COIFFE","COIFS","COIGN","COIGNE","COIGNS","COIL","COILED","COILER","COILS","COIN","COINED","COINER","COINS","COIR","COIRS","COITAL","COITUS","COJOIN","COKE","COKED","COKES","COKING","COL","COLA","COLAS","COLD","COLDER","COLDLY","COLDS","COLE","COLEAD","COLED","COLES","COLEUS","COLIC","COLICS","COLIES","COLIN","COLINS","COLLAR","COLLET","COLLIE","COLLOP","COLLY","COLOBI","COLOG","COLOGS","COLON","COLONE","COLONI","COLONS","COLONY","COLOR","COLORS","COLOUR","COLS","COLT","COLTER","COLTS","COLUGO","COLUMN","COLURE","COLY","COLZA","COLZAS","COMA","COMADE","COMAE","COMAKE","COMAL","COMAS","COMATE","COMB","COMBAT","COMBE","COMBED","COMBER","COMBES","COMBO","COMBOS","COMBS","COME","COMEDO","COMEDY","COMELY","COMER","COMERS","COMES","COMET","COMETH","COMETS","COMFIT","COMFY","COMIC","COMICS","COMING","COMITY","COMIX","COMMA","COMMAS","COMMIE","COMMIT","COMMIX","COMMON","COMMY","COMOSE","COMOUS","COMP","COMPED","COMPEL","COMPLY","COMPO","COMPOS","COMPS","COMPT","COMPTS","COMTE","COMTES","CON","CONCH","CONCHA","CONCHS","CONCHY","CONCUR","CONDO","CONDOM","CONDOR","CONDOS","CONE","CONED","CONES","CONEY","CONEYS","CONFAB","CONFER","CONFIT","CONGA","CONGAS","CONGE","CONGEE","CONGER","CONGES","CONGII","CONGO","CONGOS","CONGOU","CONI","CONIC","CONICS","CONIES","CONIN","CONINE","CONING","CONINS","CONIUM","CONK","CONKED","CONKER","CONKS","CONKY","CONN","CONNED","CONNER","CONNS","CONOID","CONS","CONSOL","CONSUL","CONTE","CONTES","CONTO","CONTOS","CONTRA","CONUS","CONVEX","CONVEY","CONVOY","CONY","COO","COOCH","COOCOO","COOED","COOEE","COOEED","COOEES","COOER","COOERS","COOEY","COOEYS","COOF","COOFS","COOING","COOK","COOKED","COOKER","COOKEY","COOKIE","COOKS","COOKY","COOL","COOLED","COOLER","COOLIE","COOLLY","COOLS","COOLTH","COOLY","COOMB","COOMBE","COOMBS","COON","COONS","COOP","COOPED","COOPER","COOPS","COOPT","COOPTS","COOS","COOT","COOTER","COOTIE","COOTS","COP","COPAL","COPALM","COPALS","COPE","COPECK","COPED","COPEN","COPENS","COPER","COPERS","COPES","COPIED","COPIER","COPIES","COPING","COPLOT","COPPED","COPPER","COPPRA","COPRA","COPRAH","COPRAS","COPS","COPSE","COPSES","COPTER","COPULA","COPY","COQUET","COR","CORAL","CORALS","CORBAN","CORBEL","CORBIE","CORBY","CORD","CORDED","CORDER","CORDON","CORDS","CORE","CORED","CORER","CORERS","CORES","CORF","CORGI","CORGIS","CORIA","CORING","CORIUM","CORK","CORKED","CORKER","CORKS","CORKY","CORM","CORMEL","CORMS","CORN","CORNEA","CORNED","CORNEL","CORNER","CORNET","CORNS","CORNU","CORNUA","CORNUS","CORNY","CORODY","CORONA","CORPS","CORPSE","CORPUS","CORRAL","CORRIE","CORSAC","CORSE","CORSES","CORSET","CORTEX","CORTIN","CORVEE","CORVES","CORVET","CORY","CORYMB","CORYZA","COS","COSEC","COSECS","COSES","COSET","COSETS","COSEY","COSEYS","COSH","COSHED","COSHER","COSHES","COSIE","COSIED","COSIER","COSIES","COSIGN","COSILY","COSINE","COSMIC","COSMOS","COSS","COSSET","COST","COSTA","COSTAE","COSTAL","COSTAR","COSTED","COSTER","COSTLY","COSTS","COSY","COT","COTAN","COTANS","COTE","COTEAU","COTED","COTES","COTING","COTS","COTTA","COTTAE","COTTAR","COTTAS","COTTER","COTTON","COTYPE","COUCH","COUDE","COUGAR","COUGH","COUGHS","COULD","COULEE","COULIS","COUNT","COUNTS","COUNTY","COUP","COUPE","COUPED","COUPES","COUPLE","COUPON","COUPS","COURSE","COURT","COURTS","COUSIN","COUTER","COUTH","COUTHS","COVE","COVED","COVEN","COVENS","COVER","COVERS","COVERT","COVES","COVET","COVETS","COVEY","COVEYS","COVIN","COVING","COVINS","COW","COWAGE","COWARD","COWBOY","COWED","COWER","COWERS","COWIER","COWING","COWL","COWLED","COWLS","COWMAN","COWMEN","COWPAT","COWPEA","COWPIE","COWPOX","COWRIE","COWRY","COWS","COWY","COX","COXA","COXAE","COXAL","COXED","COXES","COXING","COY","COYDOG","COYED","COYER","COYEST","COYING","COYISH","COYLY","COYOTE","COYPOU","COYPU","COYPUS","COYS","COZ","COZEN","COZENS","COZES","COZEY","COZEYS","COZIE","COZIED","COZIER","COZIES","COZILY","COZY","COZZES","CRAAL","CRAALS","CRAB","CRABBY","CRABS","CRACK","CRACKS","CRACKY","CRADLE","CRAFT","CRAFTS","CRAFTY","CRAG","CRAGGY","CRAGS","CRAKE","CRAKES","CRAM","CRAMBE","CRAMBO","CRAMP","CRAMPS","CRAMS","CRANCH","CRANE","CRANED","CRANES","CRANIA","CRANK","CRANKS","CRANKY","CRANNY","CRAP","CRAPE","CRAPED","CRAPES","CRAPPY","CRAPS","CRASES","CRASH","CRASIS","CRASS","CRATCH","CRATE","CRATED","CRATER","CRATES","CRATON","CRAVAT","CRAVE","CRAVED","CRAVEN","CRAVER","CRAVES","CRAW","CRAWL","CRAWLS","CRAWLY","CRAWS","CRAYON","CRAZE","CRAZED","CRAZES","CRAZY","CREAK","CREAKS","CREAKY","CREAM","CREAMS","CREAMY","CREASE","CREASY","CREATE","CRECHE","CREDAL","CREDIT","CREDO","CREDOS","CREED","CREEDS","CREEK","CREEKS","CREEL","CREELS","CREEP","CREEPS","CREEPY","CREESE","CREESH","CREME","CREMES","CRENEL","CREOLE","CREPE","CREPED","CREPES","CREPEY","CREPON","CREPT","CREPY","CRESOL","CRESS","CREST","CRESTS","CRESYL","CRETIC","CRETIN","CREW","CREWED","CREWEL","CREWS","CRIB","CRIBS","CRICK","CRICKS","CRIED","CRIER","CRIERS","CRIES","CRIKEY","CRIME","CRIMES","CRIMP","CRIMPS","CRIMPY","CRINGE","CRINUM","CRIPE","CRIPES","CRIS","CRISES","CRISIC","CRISIS","CRISP","CRISPS","CRISPY","CRISSA","CRISTA","CRITIC","CROAK","CROAKS","CROAKY","CROC","CROCI","CROCK","CROCKS","CROCS","CROCUS","CROFT","CROFTS","CROJIK","CRONE","CRONES","CRONY","CROOK","CROOKS","CROON","CROONS","CROP","CROPS","CRORE","CRORES","CROSS","CROSSE","CROTCH","CROTON","CROUCH","CROUP","CROUPE","CROUPS","CROUPY","CROUSE","CROW","CROWD","CROWDS","CROWDY","CROWED","CROWER","CROWN","CROWNS","CROWS","CROZE","CROZER","CROZES","CRUCES","CRUCK","CRUCKS","CRUD","CRUDDY","CRUDE","CRUDER","CRUDES","CRUDS","CRUEL","CRUET","CRUETS","CRUISE","CRUMB","CRUMBS","CRUMBY","CRUMMY","CRUMP","CRUMPS","CRUNCH","CRUOR","CRUORS","CRURA","CRURAL","CRUS","CRUSE","CRUSES","CRUSET","CRUSH","CRUST","CRUSTS","CRUSTY","CRUTCH","CRUX","CRUXES","CRWTH","CRWTHS","CRY","CRYING","CRYPT","CRYPTO","CRYPTS","CUB","CUBAGE","CUBBY","CUBE","CUBEB","CUBEBS","CUBED","CUBER","CUBERS","CUBES","CUBIC","CUBICS","CUBING","CUBISM","CUBIST","CUBIT","CUBITS","CUBOID","CUBS","CUCKOO","CUD","CUDDIE","CUDDLE","CUDDLY","CUDDY","CUDGEL","CUDS","CUE","CUED","CUEING","CUES","CUESTA","CUFF","CUFFED","CUFFS","CUIF","CUIFS","CUING","CUISH","CUISSE","CUKE","CUKES","CULCH","CULET","CULETS","CULEX","CULL","CULLAY","CULLED","CULLER","CULLET","CULLIS","CULLS","CULLY","CULM","CULMED","CULMS","CULPA","CULPAE","CULT","CULTCH","CULTI","CULTIC","CULTS","CULTUS","CULVER","CUM","CUMBER","CUMIN","CUMINS","CUMMER","CUMMIN","CUMULI","CUNDUM","CUNEAL","CUNNER","CUNT","CUNTS","CUP","CUPEL","CUPELS","CUPFUL","CUPID","CUPIDS","CUPOLA","CUPPA","CUPPAS","CUPPED","CUPPER","CUPPY","CUPRIC","CUPRUM","CUPS","CUPULA","CUPULE","CUR","CURACY","CURAGH","CURARA","CURARE","CURARI","CURATE","CURB","CURBED","CURBER","CURBS","CURCH","CURD","CURDED","CURDLE","CURDS","CURDY","CURE","CURED","CURER","CURERS","CURES","CURET","CURETS","CURF","CURFEW","CURFS","CURIA","CURIAE","CURIAL","CURIE","CURIES","CURING","CURIO","CURIOS","CURITE","CURIUM","CURL","CURLED","CURLER","CURLEW","CURLS","CURLY","CURN","CURNS","CURR","CURRAN","CURRED","CURRIE","CURRS","CURRY","CURS","CURSE","CURSED","CURSER","CURSES","CURSOR","CURST","CURT","CURTAL","CURTER","CURTLY","CURTSY","CURULE","CURVE","CURVED","CURVES","CURVET","CURVEY","CURVY","CUSCUS","CUSEC","CUSECS","CUSHAT","CUSHAW","CUSHY","CUSK","CUSKS","CUSP","CUSPED","CUSPID","CUSPIS","CUSPS","CUSS","CUSSED","CUSSER","CUSSES","CUSSO","CUSSOS","CUSTOM","CUSTOS","CUT","CUTCH","CUTE","CUTELY","CUTER","CUTES","CUTEST","CUTESY","CUTEY","CUTEYS","CUTIE","CUTIES","CUTIN","CUTINS","CUTIS","CUTLAS","CUTLER","CUTLET","CUTOFF","CUTOUT","CUTS","CUTTER","CUTTLE","CUTTY","CUTUP","CUTUPS","CWM","CWMS","CYAN","CYANIC","CYANID","CYANIN","CYANO","CYANS","CYBORG","CYCAD","CYCADS","CYCAS","CYCLE","CYCLED","CYCLER","CYCLES","CYCLIC","CYCLO","CYCLOS","CYDER","CYDERS","CYESES","CYESIS","CYGNET","CYLIX","CYMA","CYMAE","CYMAR","CYMARS","CYMAS","CYMBAL","CYME","CYMENE","CYMES","CYMLIN","CYMOID","CYMOL","CYMOLS","CYMOSE","CYMOUS","CYNIC","CYNICS","CYPHER","CYPRES","CYPRUS","CYST","CYSTIC","CYSTS","CYTON","CYTONS","CZAR","CZARS","DAB","DABBED","DABBER","DABBLE","DABS","DACE","DACES","DACHA","DACHAS","DACKER","DACOIT","DACTYL","DAD","DADA","DADAS","DADDLE","DADDY","DADO","DADOED","DADOES","DADOS","DADS","DAEDAL","DAEMON","DAFF","DAFFED","DAFFS","DAFFY","DAFT","DAFTER","DAFTLY","DAG","DAGGA","DAGGAS","DAGGER","DAGGLE","DAGO","DAGOBA","DAGOES","DAGOS","DAGS","DAH","DAHL","DAHLIA","DAHLS","DAHOON","DAHS","DAIKER","DAIKON","DAILY","DAIMEN","DAIMIO","DAIMON","DAIMYO","DAINTY","DAIRY","DAIS","DAISES","DAISY","DAK","DAKOIT","DAKS","DAL","DALASI","DALE","DALEDH","DALES","DALETH","DALLES","DALLY","DALS","DALTON","DAM","DAMAGE","DAMAN","DAMANS","DAMAR","DAMARS","DAMASK","DAME","DAMES","DAMMAR","DAMMED","DAMMER","DAMN","DAMNED","DAMNER","DAMNS","DAMP","DAMPED","DAMPEN","DAMPER","DAMPLY","DAMPS","DAMS","DAMSEL","DAMSON","DANCE","DANCED","DANCER","DANCES","DANDER","DANDLE","DANDY","DANG","DANGED","DANGER","DANGLE","DANGS","DANIO","DANIOS","DANISH","DANK","DANKER","DANKLY","DAP","DAPHNE","DAPPED","DAPPER","DAPPLE","DAPS","DARB","DARBS","DARE","DARED","DARER","DARERS","DARES","DARIC","DARICS","DARING","DARK","DARKED","DARKEN","DARKER","DARKEY","DARKIE","DARKLE","DARKLY","DARKS","DARKY","DARN","DARNED","DARNEL","DARNER","DARNS","DART","DARTED","DARTER","DARTLE","DARTS","DASH","DASHED","DASHER","DASHES","DASHI","DASHIS","DASHY","DASSIE","DATA","DATARY","DATCHA","DATE","DATED","DATER","DATERS","DATES","DATING","DATIVE","DATO","DATOS","DATTO","DATTOS","DATUM","DATUMS","DATURA","DAUB","DAUBE","DAUBED","DAUBER","DAUBES","DAUBRY","DAUBS","DAUBY","DAUNT","DAUNTS","DAUT","DAUTED","DAUTIE","DAUTS","DAVEN","DAVENS","DAVIES","DAVIT","DAVITS","DAVY","DAW","DAWDLE","DAWED","DAWEN","DAWING","DAWK","DAWKS","DAWN","DAWNED","DAWNS","DAWS","DAWT","DAWTED","DAWTIE","DAWTS","DAY","DAYBED","DAYFLY","DAYLIT","DAYS","DAZE","DAZED","DAZES","DAZING","DAZZLE","DEACON","DEAD","DEADEN","DEADER","DEADLY","DEADS","DEAF","DEAFEN","DEAFER","DEAFLY","DEAIR","DEAIRS","DEAL","DEALER","DEALS","DEALT","DEAN","DEANED","DEANS","DEAR","DEARER","DEARIE","DEARLY","DEARS","DEARTH","DEARY","DEASH","DEASIL","DEATH","DEATHS","DEATHY","DEAVE","DEAVED","DEAVES","DEB","DEBAR","DEBARK","DEBARS","DEBASE","DEBATE","DEBEAK","DEBIT","DEBITS","DEBONE","DEBRIS","DEBS","DEBT","DEBTOR","DEBTS","DEBUG","DEBUGS","DEBUNK","DEBUT","DEBUTS","DEBYE","DEBYES","DECADE","DECAF","DECAFS","DECAL","DECALS","DECAMP","DECANE","DECANT","DECARE","DECAY","DECAYS","DECEIT","DECENT","DECERN","DECIDE","DECILE","DECK","DECKED","DECKEL","DECKER","DECKLE","DECKS","DECLAW","DECO","DECOCT","DECODE","DECOR","DECORS","DECOS","DECOY","DECOYS","DECREE","DECRY","DECURY","DEDAL","DEDANS","DEDUCE","DEDUCT","DEE","DEED","DEEDED","DEEDS","DEEDY","DEEJAY","DEEM","DEEMED","DEEMS","DEEP","DEEPEN","DEEPER","DEEPLY","DEEPS","DEER","DEERS","DEES","DEET","DEETS","DEEWAN","DEFACE","DEFAME","DEFANG","DEFAT","DEFATS","DEFEAT","DEFECT","DEFEND","DEFER","DEFERS","DEFI","DEFIED","DEFIER","DEFIES","DEFILE","DEFINE","DEFIS","DEFLEA","DEFOAM","DEFOG","DEFOGS","DEFORM","DEFRAY","DEFT","DEFTER","DEFTLY","DEFUND","DEFUSE","DEFUZE","DEFY","DEGAGE","DEGAME","DEGAMI","DEGAS","DEGERM","DEGREE","DEGUM","DEGUMS","DEGUST","DEHORN","DEHORT","DEICE","DEICED","DEICER","DEICES","DEIFIC","DEIFY","DEIGN","DEIGNS","DEIL","DEILS","DEISM","DEISMS","DEIST","DEISTS","DEITY","DEIXIS","DEJECT","DEKARE","DEKE","DEKED","DEKES","DEKING","DEKKO","DEKKOS","DEL","DELATE","DELAY","DELAYS","DELE","DELEAD","DELED","DELES","DELETE","DELF","DELFS","DELFT","DELFTS","DELI","DELICT","DELIME","DELIS","DELIST","DELL","DELLS","DELLY","DELS","DELTA","DELTAS","DELTIC","DELUDE","DELUGE","DELUXE","DELVE","DELVED","DELVER","DELVES","DEMAND","DEMARK","DEMAST","DEME","DEMEAN","DEMENT","DEMES","DEMIES","DEMISE","DEMIT","DEMITS","DEMO","DEMOB","DEMOBS","DEMODE","DEMON","DEMONS","DEMOS","DEMOTE","DEMUR","DEMURE","DEMURS","DEMY","DEN","DENARY","DENE","DENES","DENGUE","DENIAL","DENIED","DENIER","DENIES","DENIM","DENIMS","DENNED","DENOTE","DENS","DENSE","DENSER","DENT","DENTAL","DENTED","DENTIL","DENTIN","DENTS","DENUDE","DENY","DEODAR","DEOXY","DEPART","DEPEND","DEPERM","DEPICT","DEPLOY","DEPONE","DEPORT","DEPOSE","DEPOT","DEPOTS","DEPTH","DEPTHS","DEPUTE","DEPUTY","DERAIL","DERAT","DERATE","DERATS","DERAY","DERAYS","DERBY","DERE","DERIDE","DERIVE","DERM","DERMA","DERMAL","DERMAS","DERMIC","DERMIS","DERMS","DERRIS","DERRY","DESALT","DESAND","DESCRY","DESERT","DESEX","DESIGN","DESIRE","DESIST","DESK","DESKS","DESMAN","DESMID","DESORB","DESOXY","DESPOT","DETACH","DETAIL","DETAIN","DETECT","DETENT","DETER","DETERS","DETEST","DETICK","DETOUR","DETOX","DEUCE","DEUCED","DEUCES","DEV","DEVA","DEVAS","DEVEIN","DEVEL","DEVELS","DEVEST","DEVICE","DEVIL","DEVILS","DEVISE","DEVOID","DEVOIR","DEVON","DEVONS","DEVOTE","DEVOUR","DEVOUT","DEVS","DEW","DEWAN","DEWANS","DEWAR","DEWARS","DEWAX","DEWED","DEWIER","DEWILY","DEWING","DEWLAP","DEWOOL","DEWORM","DEWS","DEWY","DEX","DEXES","DEXIE","DEXIES","DEXTER","DEXTRO","DEXY","DEY","DEYS","DEZINC","DHAK","DHAKS","DHAL","DHALS","DHARMA","DHARNA","DHOBI","DHOBIS","DHOLE","DHOLES","DHOOLY","DHOORA","DHOOTI","DHOTI","DHOTIS","DHOW","DHOWS","DHURNA","DHUTI","DHUTIS","DIACID","DIADEM","DIAL","DIALED","DIALER","DIALOG","DIALS","DIAMIN","DIAPER","DIAPIR","DIARY","DIATOM","DIAZIN","DIAZO","DIB","DIBBED","DIBBER","DIBBLE","DIBBUK","DIBS","DICAST","DICE","DICED","DICER","DICERS","DICES","DICEY","DICIER","DICING","DICK","DICKED","DICKER","DICKEY","DICKIE","DICKS","DICKY","DICOT","DICOTS","DICTA","DICTUM","DICTY","DID","DIDACT","DIDDLE","DIDDLY","DIDIE","DIDIES","DIDO","DIDOES","DIDOS","DIDST","DIDY","DIE","DIED","DIEING","DIEL","DIENE","DIENES","DIES","DIESEL","DIESES","DIESIS","DIET","DIETED","DIETER","DIETS","DIFFER","DIG","DIGAMY","DIGEST","DIGGED","DIGGER","DIGHT","DIGHTS","DIGIT","DIGITS","DIGLOT","DIGS","DIKDIK","DIKE","DIKED","DIKER","DIKERS","DIKES","DIKEY","DIKING","DIKTAT","DILATE","DILDO","DILDOE","DILDOS","DILL","DILLED","DILLS","DILLY","DILUTE","DIM","DIME","DIMER","DIMERS","DIMES","DIMITY","DIMLY","DIMMED","DIMMER","DIMOUT","DIMPLE","DIMPLY","DIMS","DIMWIT","DIN","DINAR","DINARS","DINDLE","DINE","DINED","DINER","DINERO","DINERS","DINES","DING","DINGE","DINGED","DINGER","DINGES","DINGEY","DINGHY","DINGLE","DINGO","DINGS","DINGUS","DINGY","DINING","DINK","DINKED","DINKEY","DINKLY","DINKS","DINKUM","DINKY","DINNED","DINNER","DINS","DINT","DINTED","DINTS","DIOBOL","DIODE","DIODES","DIOECY","DIOL","DIOLS","DIOXAN","DIOXID","DIOXIN","DIP","DIPLEX","DIPLOE","DIPNET","DIPODY","DIPOLE","DIPPED","DIPPER","DIPPY","DIPS","DIPSAS","DIPSO","DIPSOS","DIPT","DIQUAT","DIRDUM","DIRE","DIRECT","DIRELY","DIRER","DIREST","DIRGE","DIRGES","DIRHAM","DIRK","DIRKED","DIRKS","DIRL","DIRLED","DIRLS","DIRNDL","DIRT","DIRTS","DIRTY","DIS","DISARM","DISBAR","DISBUD","DISC","DISCED","DISCI","DISCO","DISCOS","DISCS","DISCUS","DISH","DISHED","DISHES","DISHY","DISK","DISKED","DISKS","DISMAL","DISMAY","DISME","DISMES","DISOWN","DISPEL","DISS","DISSED","DISSES","DISTAL","DISTIL","DISUSE","DIT","DITA","DITAS","DITCH","DITE","DITES","DITHER","DITS","DITSY","DITTO","DITTOS","DITTY","DITZ","DITZES","DITZY","DIURON","DIVA","DIVAN","DIVANS","DIVAS","DIVE","DIVED","DIVER","DIVERS","DIVERT","DIVES","DIVEST","DIVIDE","DIVINE","DIVING","DIVOT","DIVOTS","DIVVY","DIWAN","DIWANS","DIXIT","DIXITS","DIZEN","DIZENS","DIZZY","DJEBEL","DJIN","DJINN","DJINNI","DJINNS","DJINNY","DJINS","DOABLE","DOAT","DOATED","DOATS","DOBBER","DOBBIN","DOBBY","DOBIE","DOBIES","DOBLA","DOBLAS","DOBLON","DOBRA","DOBRAS","DOBSON","DOBY","DOC","DOCENT","DOCILE","DOCK","DOCKED","DOCKER","DOCKET","DOCKS","DOCS","DOCTOR","DODDER","DODGE","DODGED","DODGEM","DODGER","DODGES","DODGY","DODO","DODOES","DODOS","DOE","DOER","DOERS","DOES","DOEST","DOETH","DOFF","DOFFED","DOFFER","DOFFS","DOG","DOGDOM","DOGE","DOGEAR","DOGES","DOGEY","DOGEYS","DOGGED","DOGGER","DOGGIE","DOGGO","DOGGY","DOGIE","DOGIES","DOGLEG","DOGMA","DOGMAS","DOGNAP","DOGS","DOGY","DOILED","DOILY","DOING","DOINGS","DOIT","DOITED","DOITS","DOJO","DOJOS","DOL","DOLCE","DOLCI","DOLE","DOLED","DOLES","DOLING","DOLL","DOLLAR","DOLLED","DOLLOP","DOLLS","DOLLY","DOLMA","DOLMAN","DOLMAS","DOLMEN","DOLOR","DOLORS","DOLOUR","DOLS","DOLT","DOLTS","DOM","DOMAIN","DOMAL","DOME","DOMED","DOMES","DOMIC","DOMINE","DOMING","DOMINO","DOMS","DON","DONA","DONAS","DONATE","DONE","DONEE","DONEES","DONG","DONGA","DONGAS","DONGS","DONJON","DONKEY","DONNA","DONNAS","DONNE","DONNED","DONNEE","DONOR","DONORS","DONS","DONSIE","DONSY","DONUT","DONUTS","DONZEL","DOODAD","DOODLE","DOOFUS","DOOLEE","DOOLIE","DOOLY","DOOM","DOOMED","DOOMS","DOOMY","DOOR","DOORS","DOOZER","DOOZIE","DOOZY","DOPA","DOPANT","DOPAS","DOPE","DOPED","DOPER","DOPERS","DOPES","DOPEY","DOPIER","DOPING","DOPY","DOR","DORADO","DORBUG","DORE","DORIES","DORK","DORKS","DORKY","DORM","DORMER","DORMIE","DORMIN","DORMS","DORMY","DORP","DORPER","DORPS","DORR","DORRS","DORS","DORSA","DORSAD","DORSAL","DORSEL","DORSER","DORSUM","DORTY","DORY","DOS","DOSAGE","DOSE","DOSED","DOSER","DOSERS","DOSES","DOSING","DOSS","DOSSAL","DOSSED","DOSSEL","DOSSER","DOSSES","DOSSIL","DOST","DOT","DOTAGE","DOTAL","DOTARD","DOTE","DOTED","DOTER","DOTERS","DOTES","DOTH","DOTIER","DOTING","DOTS","DOTTED","DOTTEL","DOTTER","DOTTLE","DOTTY","DOTY","DOUBLE","DOUBLY","DOUBT","DOUBTS","DOUCE","DOUCHE","DOUGH","DOUGHS","DOUGHT","DOUGHY","DOUM","DOUMA","DOUMAS","DOUMS","DOUR","DOURA","DOURAH","DOURAS","DOURER","DOURLY","DOUSE","DOUSED","DOUSER","DOUSES","DOUX","DOVE","DOVEN","DOVENS","DOVES","DOVISH","DOW","DOWDY","DOWED","DOWEL","DOWELS","DOWER","DOWERS","DOWERY","DOWIE","DOWING","DOWN","DOWNED","DOWNER","DOWNS","DOWNY","DOWRY","DOWS","DOWSE","DOWSED","DOWSER","DOWSES","DOXIE","DOXIES","DOXY","DOYEN","DOYENS","DOYLEY","DOYLY","DOZE","DOZED","DOZEN","DOZENS","DOZER","DOZERS","DOZES","DOZIER","DOZILY","DOZING","DOZY","DRAB","DRABLY","DRABS","DRACHM","DRAFF","DRAFFS","DRAFFY","DRAFT","DRAFTS","DRAFTY","DRAG","DRAGEE","DRAGGY","DRAGON","DRAGS","DRAIL","DRAILS","DRAIN","DRAINS","DRAKE","DRAKES","DRAM","DRAMA","DRAMAS","DRAMS","DRANK","DRAPE","DRAPED","DRAPER","DRAPES","DRAPEY","DRAT","DRATS","DRAVE","DRAW","DRAWEE","DRAWER","DRAWL","DRAWLS","DRAWLY","DRAWN","DRAWS","DRAY","DRAYED","DRAYS","DREAD","DREADS","DREAM","DREAMS","DREAMT","DREAMY","DREAR","DREARS","DREARY","DRECK","DRECKS","DRECKY","DREDGE","DREE","DREED","DREES","DREG","DREGGY","DREGS","DREICH","DREIDL","DREIGH","DREK","DREKS","DRENCH","DRESS","DRESSY","DREST","DREW","DRIB","DRIBS","DRIED","DRIEGH","DRIER","DRIERS","DRIES","DRIEST","DRIFT","DRIFTS","DRIFTY","DRILL","DRILLS","DRILY","DRINK","DRINKS","DRIP","DRIPPY","DRIPS","DRIPT","DRIVE","DRIVEL","DRIVEN","DRIVER","DRIVES","DROGUE","DROIT","DROITS","DROLL","DROLLS","DROLLY","DROMON","DRONE","DRONED","DRONER","DRONES","DRONGO","DROOL","DROOLS","DROOP","DROOPS","DROOPY","DROP","DROPS","DROPSY","DROPT","DROSKY","DROSS","DROSSY","DROUK","DROUKS","DROUTH","DROVE","DROVED","DROVER","DROVES","DROWN","DROWND","DROWNS","DROWSE","DROWSY","DRUB","DRUBS","DRUDGE","DRUG","DRUGGY","DRUGS","DRUID","DRUIDS","DRUM","DRUMLY","DRUMS","DRUNK","DRUNKS","DRUPE","DRUPES","DRUSE","DRUSES","DRY","DRYAD","DRYADS","DRYER","DRYERS","DRYEST","DRYING","DRYISH","DRYLOT","DRYLY","DRYS","DUAD","DUADS","DUAL","DUALLY","DUALS","DUB","DUBBED","DUBBER","DUBBIN","DUBS","DUCAL","DUCAT","DUCATS","DUCE","DUCES","DUCHY","DUCI","DUCK","DUCKED","DUCKER","DUCKIE","DUCKS","DUCKY","DUCT","DUCTAL","DUCTED","DUCTS","DUD","DUDDIE","DUDDY","DUDE","DUDED","DUDEEN","DUDES","DUDING","DUDISH","DUDS","DUE","DUEL","DUELED","DUELER","DUELLI","DUELLO","DUELS","DUENDE","DUENNA","DUES","DUET","DUETS","DUFF","DUFFEL","DUFFER","DUFFLE","DUFFS","DUG","DUGONG","DUGOUT","DUGS","DUI","DUIKER","DUIT","DUITS","DUKE","DUKED","DUKES","DUKING","DULCET","DULIA","DULIAS","DULL","DULLED","DULLER","DULLS","DULLY","DULSE","DULSES","DULY","DUMA","DUMAS","DUMB","DUMBED","DUMBER","DUMBLY","DUMBS","DUMDUM","DUMKA","DUMKY","DUMMY","DUMP","DUMPED","DUMPER","DUMPS","DUMPY","DUN","DUNAM","DUNAMS","DUNCE","DUNCES","DUNCH","DUNE","DUNES","DUNG","DUNGED","DUNGS","DUNGY","DUNITE","DUNK","DUNKED","DUNKER","DUNKS","DUNLIN","DUNNED","DUNNER","DUNS","DUNT","DUNTED","DUNTS","DUO","DUOLOG","DUOMI","DUOMO","DUOMOS","DUOS","DUP","DUPE","DUPED","DUPER","DUPERS","DUPERY","DUPES","DUPING","DUPLE","DUPLEX","DUPPED","DUPS","DURA","DURAL","DURAS","DURBAR","DURE","DURED","DURES","DURESS","DURIAN","DURING","DURION","DURN","DURNED","DURNS","DURO","DUROC","DUROCS","DUROS","DURR","DURRA","DURRAS","DURRIE","DURRS","DURST","DURUM","DURUMS","DUSK","DUSKED","DUSKS","DUSKY","DUST","DUSTED","DUSTER","DUSTS","DUSTUP","DUSTY","DUTCH","DUTIES","DUTY","DUVET","DUVETS","DWARF","DWARFS","DWEEB","DWEEBS","DWELL","DWELLS","DWELT","DWINE","DWINED","DWINES","DYABLE","DYAD","DYADIC","DYADS","DYBBUK","DYE","DYED","DYEING","DYER","DYERS","DYES","DYING","DYINGS","DYKE","DYKED","DYKES","DYKEY","DYKING","DYNAMO","DYNAST","DYNE","DYNEIN","DYNEL","DYNELS","DYNES","DYNODE","DYVOUR","EACH","EAGER","EAGERS","EAGLE","EAGLES","EAGLET","EAGRE","EAGRES","EAR","EARED","EARFUL","EARING","EARL","EARLAP","EARLS","EARLY","EARN","EARNED","EARNER","EARNS","EARS","EARTH","EARTHS","EARTHY","EARWAX","EARWIG","EASE","EASED","EASEL","EASELS","EASES","EASIER","EASIES","EASILY","EASING","EAST","EASTER","EASTS","EASY","EAT","EATEN","EATER","EATERS","EATERY","EATH","EATING","EATS","EAU","EAUX","EAVE","EAVED","EAVES","EBB","EBBED","EBBET","EBBETS","EBBING","EBBS","EBON","EBONS","EBONY","ECARTE","ECESIS","ECHARD","ECHE","ECHED","ECHES","ECHING","ECHINI","ECHO","ECHOED","ECHOER","ECHOES","ECHOEY","ECHOIC","ECHOS","ECLAIR","ECLAT","ECLATS","ECRU","ECRUS","ECTYPE","ECU","ECUS","ECZEMA","EDDIED","EDDIES","EDDO","EDDOES","EDDY","EDEMA","EDEMAS","EDENIC","EDGE","EDGED","EDGER","EDGERS","EDGES","EDGIER","EDGILY","EDGING","EDGY","EDH","EDHS","EDIBLE","EDICT","EDICTS","EDIFY","EDILE","EDILES","EDIT","EDITED","EDITOR","EDITS","EDUCE","EDUCED","EDUCES","EDUCT","EDUCTS","EEL","EELIER","EELS","EELY","EERIE","EERIER","EERILY","EERY","EFF","EFFACE","EFFECT","EFFETE","EFFIGY","EFFLUX","EFFORT","EFFS","EFFUSE","EFS","EFT","EFTS","EGAD","EGADS","EGAL","EGER","EGERS","EGEST","EGESTA","EGESTS","EGG","EGGAR","EGGARS","EGGCUP","EGGED","EGGER","EGGERS","EGGING","EGGNOG","EGGS","EGGY","EGIS","EGISES","EGO","EGOISM","EGOIST","EGOS","EGRESS","EGRET","EGRETS","EIDE","EIDER","EIDERS","EIDOLA","EIDOS","EIGHT","EIGHTH","EIGHTS","EIGHTY","EIKON","EIKONS","EITHER","EJECT","EJECTA","EJECTS","EKE","EKED","EKES","EKING","EKUELE","ELAIN","ELAINS","ELAN","ELAND","ELANDS","ELANS","ELAPID","ELAPSE","ELATE","ELATED","ELATER","ELATES","ELBOW","ELBOWS","ELD","ELDER","ELDERS","ELDEST","ELDS","ELECT","ELECTS","ELEGIT","ELEGY","ELEMI","ELEMIS","ELEVEN","ELEVON","ELF","ELFIN","ELFINS","ELFISH","ELHI","ELICIT","ELIDE","ELIDED","ELIDES","ELINT","ELINTS","ELITE","ELITES","ELIXIR","ELK","ELKS","ELL","ELLS","ELM","ELMIER","ELMS","ELMY","ELODEA","ELOIGN","ELOIN","ELOINS","ELOPE","ELOPED","ELOPER","ELOPES","ELS","ELSE","ELUANT","ELUATE","ELUDE","ELUDED","ELUDER","ELUDES","ELUENT","ELUTE","ELUTED","ELUTES","ELUVIA","ELVER","ELVERS","ELVES","ELVISH","ELYTRA","EMBALM","EMBANK","EMBAR","EMBARK","EMBARS","EMBAY","EMBAYS","EMBED","EMBEDS","EMBER","EMBERS","EMBLEM","EMBODY","EMBOLI","EMBOLY","EMBOSK","EMBOSS","EMBOW","EMBOWS","EMBRUE","EMBRYO","EMCEE","EMCEED","EMCEES","EME","EMEER","EMEERS","EMEND","EMENDS","EMERGE","EMEROD","EMERY","EMES","EMESES","EMESIS","EMETIC","EMETIN","EMEU","EMEUS","EMEUTE","EMF","EMFS","EMIC","EMIGRE","EMIR","EMIRS","EMIT","EMITS","EMMER","EMMERS","EMMET","EMMETS","EMODIN","EMOTE","EMOTED","EMOTER","EMOTES","EMPALE","EMPERY","EMPIRE","EMPLOY","EMPTY","EMS","EMU","EMUS","EMYD","EMYDE","EMYDES","EMYDS","ENABLE","ENACT","ENACTS","ENAMEL","ENAMOR","ENATE","ENATES","ENATIC","ENCAGE","ENCAMP","ENCASE","ENCASH","ENCINA","ENCODE","ENCORE","ENCYST","END","ENDEAR","ENDED","ENDER","ENDERS","ENDING","ENDITE","ENDIVE","ENDOW","ENDOWS","ENDRIN","ENDS","ENDUE","ENDUED","ENDUES","ENDURE","ENDURO","ENEMA","ENEMAS","ENEMY","ENERGY","ENFACE","ENFOLD","ENG","ENGAGE","ENGILD","ENGINE","ENGIRD","ENGIRT","ENGLUT","ENGRAM","ENGS","ENGULF","ENHALO","ENIGMA","ENISLE","ENJOIN","ENJOY","ENJOYS","ENLACE","ENLIST","ENMESH","ENMITY","ENNEAD","ENNUI","ENNUIS","ENNUYE","ENOKI","ENOKIS","ENOL","ENOLIC","ENOLS","ENORM","ENOSIS","ENOUGH","ENOW","ENOWS","ENRAGE","ENRAPT","ENRICH","ENROBE","ENROL","ENROLL","ENROLS","ENROOT","ENS","ENSERF","ENSIGN","ENSILE","ENSKY","ENSOUL","ENSUE","ENSUED","ENSUES","ENSURE","ENTAIL","ENTER","ENTERA","ENTERS","ENTIA","ENTICE","ENTIRE","ENTITY","ENTOIL","ENTOMB","ENTRAP","ENTREE","ENTRY","ENURE","ENURED","ENURES","ENVIED","ENVIER","ENVIES","ENVOI","ENVOIS","ENVOY","ENVOYS","ENVY","ENWIND","ENWOMB","ENWRAP","ENZYM","ENZYME","ENZYMS","EOLIAN","EOLITH","EON","EONIAN","EONISM","EONS","EOSIN","EOSINE","EOSINS","EPACT","EPACTS","EPARCH","EPEE","EPEES","EPHA","EPHAH","EPHAHS","EPHAS","EPHEBE","EPHEBI","EPHOD","EPHODS","EPHOR","EPHORI","EPHORS","EPIC","EPICAL","EPICS","EPIGON","EPILOG","EPIMER","EPIZOA","EPOCH","EPOCHS","EPODE","EPODES","EPONYM","EPOPEE","EPOS","EPOSES","EPOXY","EQUAL","EQUALS","EQUATE","EQUID","EQUIDS","EQUINE","EQUIP","EQUIPS","EQUITY","ERA","ERAS","ERASE","ERASED","ERASER","ERASES","ERBIUM","ERE","ERECT","ERECTS","ERENOW","ERG","ERGATE","ERGO","ERGOT","ERGOTS","ERGS","ERICA","ERICAS","ERINGO","ERMINE","ERN","ERNE","ERNES","ERNS","ERODE","ERODED","ERODES","EROS","EROSE","EROSES","EROTIC","ERR","ERRAND","ERRANT","ERRATA","ERRED","ERRING","ERROR","ERRORS","ERRS","ERS","ERSATZ","ERSES","ERST","ERUCT","ERUCTS","ERUGO","ERUGOS","ERUPT","ERUPTS","ERVIL","ERVILS","ERYNGO","ESCAPE","ESCAR","ESCARP","ESCARS","ESCHAR","ESCHEW","ESCORT","ESCOT","ESCOTS","ESCROW","ESCUDO","ESES","ESKAR","ESKARS","ESKER","ESKERS","ESPIAL","ESPIED","ESPIES","ESPRIT","ESPY","ESS","ESSAY","ESSAYS","ESSES","ESSOIN","ESTATE","ESTEEM","ESTER","ESTERS","ESTOP","ESTOPS","ESTRAL","ESTRAY","ESTRIN","ESTRUM","ESTRUS","ETA","ETALON","ETAMIN","ETAPE","ETAPES","ETAS","ETCH","ETCHED","ETCHER","ETCHES","ETERNE","ETH","ETHANE","ETHENE","ETHER","ETHERS","ETHIC","ETHICS","ETHION","ETHNIC","ETHNOS","ETHOS","ETHOXY","ETHS","ETHYL","ETHYLS","ETHYNE","ETIC","ETNA","ETNAS","ETOILE","ETUDE","ETUDES","ETUI","ETUIS","ETWEE","ETWEES","ETYMA","ETYMON","EUCHRE","EULOGY","EUNUCH","EUPNEA","EUREKA","EURIPI","EURO","EUROKY","EUROS","EUTAXY","EVADE","EVADED","EVADER","EVADES","EVE","EVEN","EVENED","EVENER","EVENLY","EVENS","EVENT","EVENTS","EVER","EVERT","EVERTS","EVERY","EVES","EVICT","EVICTS","EVIL","EVILER","EVILLY","EVILS","EVINCE","EVITE","EVITED","EVITES","EVOKE","EVOKED","EVOKER","EVOKES","EVOLVE","EVZONE","EWE","EWER","EWERS","EWES","EXACT","EXACTA","EXACTS","EXALT","EXALTS","EXAM","EXAMEN","EXAMS","EXARCH","EXCEED","EXCEL","EXCELS","EXCEPT","EXCESS","EXCIDE","EXCISE","EXCITE","EXCUSE","EXEC","EXECS","EXEDRA","EXEMPT","EXEQUY","EXERT","EXERTS","EXES","EXEUNT","EXHALE","EXHORT","EXHUME","EXILE","EXILED","EXILES","EXILIC","EXINE","EXINES","EXIST","EXISTS","EXIT","EXITED","EXITS","EXODOI","EXODOS","EXODUS","EXOGEN","EXON","EXONIC","EXONS","EXOTIC","EXPAND","EXPAT","EXPATS","EXPECT","EXPEL","EXPELS","EXPEND","EXPERT","EXPIRE","EXPIRY","EXPO","EXPORT","EXPOS","EXPOSE","EXSECT","EXSERT","EXTANT","EXTEND","EXTENT","EXTERN","EXTOL","EXTOLL","EXTOLS","EXTORT","EXTRA","EXTRAS","EXUDE","EXUDED","EXUDES","EXULT","EXULTS","EXURB","EXURBS","EXUVIA","EYAS","EYASES","EYE","EYEBAR","EYECUP","EYED","EYEFUL","EYEING","EYELET","EYELID","EYEN","EYER","EYERS","EYES","EYING","EYNE","EYRA","EYRAS","EYRE","EYRES","EYRIE","EYRIES","EYRIR","EYRY","FABLE","FABLED","FABLER","FABLES","FABRIC","FACADE","FACE","FACED","FACER","FACERS","FACES","FACET","FACETE","FACETS","FACEUP","FACIA","FACIAL","FACIAS","FACIES","FACILE","FACING","FACT","FACTOR","FACTS","FACULA","FAD","FADDY","FADE","FADED","FADER","FADERS","FADES","FADGE","FADGED","FADGES","FADING","FADO","FADOS","FADS","FAECAL","FAECES","FAENA","FAENAS","FAERIE","FAERY","FAG","FAGGED","FAGGOT","FAGGY","FAGIN","FAGINS","FAGOT","FAGOTS","FAGS","FAIL","FAILED","FAILLE","FAILS","FAIN","FAINER","FAINT","FAINTS","FAIR","FAIRED","FAIRER","FAIRLY","FAIRS","FAIRY","FAITH","FAITHS","FAJITA","FAKE","FAKED","FAKEER","FAKER","FAKERS","FAKERY","FAKES","FAKEY","FAKING","FAKIR","FAKIRS","FALCES","FALCON","FALL","FALLAL","FALLEN","FALLER","FALLOW","FALLS","FALSE","FALSER","FALSIE","FALTER","FALX","FAME","FAMED","FAMES","FAMILY","FAMINE","FAMING","FAMISH","FAMOUS","FAMULI","FAN","FANCY","FANDOM","FANE","FANEGA","FANES","FANG","FANGA","FANGAS","FANGED","FANGS","FANION","FANJET","FANNED","FANNER","FANNY","FANO","FANON","FANONS","FANOS","FANS","FANTOD","FANTOM","FANUM","FANUMS","FAQIR","FAQIRS","FAQUIR","FAR","FARAD","FARADS","FARCE","FARCED","FARCER","FARCES","FARCI","FARCIE","FARCY","FARD","FARDED","FARDEL","FARDS","FARE","FARED","FARER","FARERS","FARES","FARFAL","FARFEL","FARINA","FARING","FARL","FARLE","FARLES","FARLS","FARM","FARMED","FARMER","FARMS","FARO","FAROS","FARROW","FART","FARTED","FARTS","FAS","FASCES","FASCIA","FASH","FASHED","FASHES","FAST","FASTED","FASTEN","FASTER","FASTS","FAT","FATAL","FATE","FATED","FATES","FATHER","FATHOM","FATING","FATLY","FATS","FATSO","FATSOS","FATTED","FATTEN","FATTER","FATTY","FATWA","FATWAS","FAUCAL","FAUCES","FAUCET","FAUGH","FAULD","FAULDS","FAULT","FAULTS","FAULTY","FAUN","FAUNA","FAUNAE","FAUNAL","FAUNAS","FAUNS","FAUVE","FAUVES","FAUX","FAVA","FAVAS","FAVE","FAVELA","FAVES","FAVISM","FAVOR","FAVORS","FAVOUR","FAVUS","FAWN","FAWNED","FAWNER","FAWNS","FAWNY","FAX","FAXED","FAXES","FAXING","FAY","FAYED","FAYING","FAYS","FAZE","FAZED","FAZES","FAZING","FEAL","FEALTY","FEAR","FEARED","FEARER","FEARS","FEASE","FEASED","FEASES","FEAST","FEASTS","FEAT","FEATER","FEATLY","FEATS","FEAZE","FEAZED","FEAZES","FECAL","FECES","FECIAL","FECK","FECKLY","FECKS","FECULA","FECUND","FED","FEDORA","FEDS","FEE","FEEBLE","FEEBLY","FEED","FEEDER","FEEDS","FEEING","FEEL","FEELER","FEELS","FEES","FEET","FEEZE","FEEZED","FEEZES","FEH","FEHS","FEIGN","FEIGNS","FEIJOA","FEINT","FEINTS","FEIRIE","FEIST","FEISTS","FEISTY","FELID","FELIDS","FELINE","FELL","FELLA","FELLAH","FELLAS","FELLED","FELLER","FELLOE","FELLOW","FELLS","FELLY","FELON","FELONS","FELONY","FELT","FELTED","FELTS","FEM","FEMALE","FEME","FEMES","FEMME","FEMMES","FEMORA","FEMS","FEMUR","FEMURS","FEN","FENCE","FENCED","FENCER","FENCES","FEND","FENDED","FENDER","FENDS","FENNEC","FENNEL","FENNY","FENS","FEOD","FEODS","FEOFF","FEOFFS","FER","FERAL","FERBAM","FERE","FERES","FERIA","FERIAE","FERIAL","FERIAS","FERINE","FERITY","FERLIE","FERLY","FERMI","FERMIS","FERN","FERNS","FERNY","FERREL","FERRET","FERRIC","FERRUM","FERRY","FERULA","FERULE","FERVID","FERVOR","FESCUE","FESS","FESSE","FESSED","FESSES","FESTAL","FESTER","FET","FETA","FETAL","FETAS","FETCH","FETE","FETED","FETES","FETIAL","FETICH","FETID","FETING","FETISH","FETOR","FETORS","FETS","FETTED","FETTER","FETTLE","FETUS","FEU","FEUAR","FEUARS","FEUD","FEUDAL","FEUDED","FEUDS","FEUED","FEUING","FEUS","FEVER","FEVERS","FEW","FEWER","FEWEST","FEY","FEYER","FEYEST","FEYLY","FEZ","FEZES","FEZZED","FEZZES","FIACRE","FIANCE","FIAR","FIARS","FIASCO","FIAT","FIATS","FIB","FIBBED","FIBBER","FIBER","FIBERS","FIBRE","FIBRES","FIBRIL","FIBRIN","FIBS","FIBULA","FICE","FICES","FICHE","FICHES","FICHU","FICHUS","FICIN","FICINS","FICKLE","FICKLY","FICO","FICOES","FICUS","FID","FIDDLE","FIDDLY","FIDGE","FIDGED","FIDGES","FIDGET","FIDO","FIDOS","FIDS","FIE","FIEF","FIEFS","FIELD","FIELDS","FIEND","FIENDS","FIERCE","FIERY","FIESTA","FIFE","FIFED","FIFER","FIFERS","FIFES","FIFING","FIFTH","FIFTHS","FIFTY","FIG","FIGGED","FIGHT","FIGHTS","FIGS","FIGURE","FIL","FILA","FILAR","FILCH","FILE","FILED","FILER","FILERS","FILES","FILET","FILETS","FILIAL","FILING","FILL","FILLE","FILLED","FILLER","FILLES","FILLET","FILLIP","FILLO","FILLOS","FILLS","FILLY","FILM","FILMED","FILMER","FILMIC","FILMS","FILMY","FILO","FILOS","FILOSE","FILS","FILTER","FILTH","FILTHS","FILTHY","FILUM","FIMBLE","FIN","FINAL","FINALE","FINALS","FINCH","FIND","FINDER","FINDS","FINE","FINED","FINELY","FINER","FINERY","FINES","FINEST","FINGER","FINIAL","FINING","FINIS","FINISH","FINITE","FINK","FINKED","FINKS","FINNED","FINNY","FINO","FINOS","FINS","FIORD","FIORDS","FIPPLE","FIQUE","FIQUES","FIR","FIRE","FIRED","FIRER","FIRERS","FIRES","FIRING","FIRKIN","FIRM","FIRMAN","FIRMED","FIRMER","FIRMLY","FIRMS","FIRN","FIRNS","FIRRY","FIRS","FIRST","FIRSTS","FIRTH","FIRTHS","FISC","FISCAL","FISCS","FISH","FISHED","FISHER","FISHES","FISHY","FIST","FISTED","FISTIC","FISTS","FIT","FITCH","FITCHY","FITFUL","FITLY","FITS","FITTED","FITTER","FIVE","FIVER","FIVERS","FIVES","FIX","FIXATE","FIXED","FIXER","FIXERS","FIXES","FIXING","FIXIT","FIXITY","FIXT","FIXURE","FIZ","FIZGIG","FIZZ","FIZZED","FIZZER","FIZZES","FIZZLE","FIZZY","FJELD","FJELDS","FJORD","FJORDS","FLAB","FLABBY","FLABS","FLACK","FLACKS","FLACON","FLAG","FLAGGY","FLAGON","FLAGS","FLAIL","FLAILS","FLAIR","FLAIRS","FLAK","FLAKE","FLAKED","FLAKER","FLAKES","FLAKEY","FLAKY","FLAM","FLAMBE","FLAME","FLAMED","FLAMEN","FLAMER","FLAMES","FLAMS","FLAMY","FLAN","FLANES","FLANGE","FLANK","FLANKS","FLANS","FLAP","FLAPPY","FLAPS","FLARE","FLARED","FLARES","FLASH","FLASHY","FLASK","FLASKS","FLAT","FLATLY","FLATS","FLATUS","FLAUNT","FLAVIN","FLAVOR","FLAW","FLAWED","FLAWS","FLAWY","FLAX","FLAXEN","FLAXES","FLAXY","FLAY","FLAYED","FLAYER","FLAYS","FLEA","FLEAM","FLEAMS","FLEAS","FLECHE","FLECK","FLECKS","FLECKY","FLED","FLEDGE","FLEDGY","FLEE","FLEECE","FLEECH","FLEECY","FLEER","FLEERS","FLEES","FLEET","FLEETS","FLENCH","FLENSE","FLESH","FLESHY","FLETCH","FLEURY","FLEW","FLEWS","FLEX","FLEXED","FLEXES","FLEXOR","FLEY","FLEYED","FLEYS","FLIC","FLICK","FLICKS","FLICS","FLIED","FLIER","FLIERS","FLIES","FLIEST","FLIGHT","FLIMSY","FLINCH","FLING","FLINGS","FLINT","FLINTS","FLINTY","FLIP","FLIPPY","FLIPS","FLIRT","FLIRTS","FLIRTY","FLIT","FLITCH","FLITE","FLITED","FLITES","FLITS","FLOAT","FLOATS","FLOATY","FLOC","FLOCCI","FLOCK","FLOCKS","FLOCKY","FLOCS","FLOE","FLOES","FLOG","FLOGS","FLONG","FLONGS","FLOOD","FLOODS","FLOOEY","FLOOIE","FLOOR","FLOORS","FLOOSY","FLOOZY","FLOP","FLOPPY","FLOPS","FLORA","FLORAE","FLORAL","FLORAS","FLORET","FLORID","FLORIN","FLOSS","FLOSSY","FLOTA","FLOTAS","FLOUR","FLOURS","FLOURY","FLOUT","FLOUTS","FLOW","FLOWED","FLOWER","FLOWN","FLOWS","FLU","FLUB","FLUBS","FLUE","FLUED","FLUENT","FLUES","FLUFF","FLUFFS","FLUFFY","FLUID","FLUIDS","FLUKE","FLUKED","FLUKES","FLUKEY","FLUKY","FLUME","FLUMED","FLUMES","FLUMP","FLUMPS","FLUNG","FLUNK","FLUNKS","FLUNKY","FLUOR","FLUORS","FLURRY","FLUS","FLUSH","FLUTE","FLUTED","FLUTER","FLUTES","FLUTEY","FLUTY","FLUX","FLUXED","FLUXES","FLUYT","FLUYTS","FLY","FLYBOY","FLYBY","FLYBYS","FLYER","FLYERS","FLYING","FLYMAN","FLYMEN","FLYOFF","FLYSCH","FLYTE","FLYTED","FLYTES","FLYWAY","FOAL","FOALED","FOALS","FOAM","FOAMED","FOAMER","FOAMS","FOAMY","FOB","FOBBED","FOBS","FOCAL","FOCI","FOCUS","FODDER","FODGEL","FOE","FOEHN","FOEHNS","FOEMAN","FOEMEN","FOES","FOETAL","FOETID","FOETOR","FOETUS","FOG","FOGBOW","FOGDOG","FOGEY","FOGEYS","FOGGED","FOGGER","FOGGY","FOGIE","FOGIES","FOGS","FOGY","FOH","FOHN","FOHNS","FOIBLE","FOIL","FOILED","FOILS","FOIN","FOINED","FOINS","FOISON","FOIST","FOISTS","FOLATE","FOLD","FOLDED","FOLDER","FOLDS","FOLIA","FOLIAR","FOLIO","FOLIOS","FOLIUM","FOLK","FOLKIE","FOLKS","FOLKSY","FOLKY","FOLLES","FOLLIS","FOLLOW","FOLLY","FOMENT","FOMITE","FON","FOND","FONDED","FONDER","FONDLE","FONDLY","FONDS","FONDU","FONDUE","FONDUS","FONS","FONT","FONTAL","FONTS","FOOD","FOODIE","FOODS","FOOL","FOOLED","FOOLS","FOOT","FOOTED","FOOTER","FOOTIE","FOOTLE","FOOTS","FOOTSY","FOOTY","FOOZLE","FOP","FOPPED","FOPS","FOR","FORA","FORAGE","FORAM","FORAMS","FORAY","FORAYS","FORB","FORBAD","FORBID","FORBS","FORBY","FORBYE","FORCE","FORCED","FORCER","FORCES","FORD","FORDED","FORDID","FORDO","FORDS","FORE","FOREBY","FOREDO","FOREGO","FORES","FOREST","FORGAT","FORGE","FORGED","FORGER","FORGES","FORGET","FORGO","FORGOT","FORINT","FORK","FORKED","FORKER","FORKS","FORKY","FORM","FORMAL","FORMAT","FORME","FORMED","FORMEE","FORMER","FORMES","FORMIC","FORMOL","FORMS","FORMYL","FORNIX","FORRIT","FORT","FORTE","FORTES","FORTH","FORTIS","FORTS","FORTY","FORUM","FORUMS","FORWHY","FOSS","FOSSA","FOSSAE","FOSSAS","FOSSE","FOSSES","FOSSIL","FOSTER","FOU","FOUGHT","FOUL","FOULED","FOULER","FOULLY","FOULS","FOUND","FOUNDS","FOUNT","FOUNTS","FOUR","FOURS","FOURTH","FOVEA","FOVEAE","FOVEAL","FOVEAS","FOWL","FOWLED","FOWLER","FOWLS","FOX","FOXED","FOXES","FOXIER","FOXILY","FOXING","FOXY","FOY","FOYER","FOYERS","FOYS","FOZIER","FOZY","FRACAS","FRACTI","FRAE","FRAENA","FRAG","FRAGS","FRAIL","FRAILS","FRAISE","FRAME","FRAMED","FRAMER","FRAMES","FRANC","FRANCS","FRANK","FRANKS","FRAP","FRAPPE","FRAPS","FRASS","FRAT","FRATER","FRATS","FRAUD","FRAUDS","FRAY","FRAYED","FRAYS","FRAZIL","FREAK","FREAKS","FREAKY","FREE","FREED","FREELY","FREER","FREERS","FREES","FREEST","FREEZE","FREMD","FRENA","FRENCH","FRENUM","FRENZY","FRERE","FRERES","FRESCO","FRESH","FRET","FRETS","FRETTY","FRIAR","FRIARS","FRIARY","FRIDGE","FRIED","FRIEND","FRIER","FRIERS","FRIES","FRIEZE","FRIG","FRIGHT","FRIGID","FRIGS","FRIJOL","FRILL","FRILLS","FRILLY","FRINGE","FRINGY","FRISE","FRISES","FRISK","FRISKS","FRISKY","FRIT","FRITH","FRITHS","FRITS","FRITT","FRITTS","FRITZ","FRIVOL","FRIZ","FRIZED","FRIZER","FRIZES","FRIZZ","FRIZZY","FRO","FROCK","FROCKS","FROE","FROES","FROG","FROGGY","FROGS","FROLIC","FROM","FROND","FRONDS","FRONS","FRONT","FRONTS","FRORE","FROSH","FROST","FROSTS","FROSTY","FROTH","FROTHS","FROTHY","FROUZY","FROW","FROWN","FROWNS","FROWS","FROWST","FROWSY","FROWZY","FROZE","FROZEN","FRUG","FRUGAL","FRUGS","FRUIT","FRUITS","FRUITY","FRUMP","FRUMPS","FRUMPY","FRUSTA","FRY","FRYER","FRYERS","FRYING","FRYPAN","FUB","FUBBED","FUBS","FUBSY","FUCI","FUCK","FUCKED","FUCKER","FUCKS","FUCKUP","FUCOID","FUCOSE","FUCOUS","FUCUS","FUD","FUDDLE","FUDGE","FUDGED","FUDGES","FUDS","FUEL","FUELED","FUELER","FUELS","FUG","FUGAL","FUGATO","FUGGED","FUGGY","FUGIO","FUGIOS","FUGLE","FUGLED","FUGLES","FUGS","FUGU","FUGUE","FUGUED","FUGUES","FUGUS","FUHRER","FUJI","FUJIS","FULCRA","FULFIL","FULGID","FULHAM","FULL","FULLAM","FULLED","FULLER","FULLS","FULLY","FULMAR","FUMBLE","FUME","FUMED","FUMER","FUMERS","FUMES","FUMET","FUMETS","FUMIER","FUMING","FUMULI","FUMY","FUN","FUND","FUNDED","FUNDI","FUNDIC","FUNDS","FUNDUS","FUNEST","FUNGAL","FUNGI","FUNGIC","FUNGO","FUNGUS","FUNK","FUNKED","FUNKER","FUNKIA","FUNKS","FUNKY","FUNNED","FUNNEL","FUNNER","FUNNY","FUNS","FUR","FURAN","FURANE","FURANS","FURFUR","FURIES","FURL","FURLED","FURLER","FURLS","FUROR","FURORE","FURORS","FURRED","FURROW","FURRY","FURS","FURY","FURZE","FURZES","FURZY","FUSAIN","FUSE","FUSED","FUSEE","FUSEES","FUSEL","FUSELS","FUSES","FUSIL","FUSILE","FUSILS","FUSING","FUSION","FUSS","FUSSED","FUSSER","FUSSES","FUSSY","FUSTIC","FUSTY","FUTILE","FUTON","FUTONS","FUTURE","FUTZ","FUTZED","FUTZES","FUZE","FUZED","FUZEE","FUZEES","FUZES","FUZIL","FUZILS","FUZING","FUZZ","FUZZED","FUZZES","FUZZY","FYCE","FYCES","FYKE","FYKES","FYLFOT","FYTTE","FYTTES","GAB","GABBED","GABBER","GABBLE","GABBRO","GABBY","GABIES","GABION","GABLE","GABLED","GABLES","GABOON","GABS","GABY","GAD","GADDED","GADDER","GADDI","GADDIS","GADFLY","GADGET","GADI","GADID","GADIDS","GADIS","GADOID","GADS","GAE","GAED","GAEING","GAEN","GAES","GAFF","GAFFE","GAFFED","GAFFER","GAFFES","GAFFS","GAG","GAGA","GAGAKU","GAGE","GAGED","GAGER","GAGERS","GAGES","GAGGED","GAGGER","GAGGLE","GAGING","GAGMAN","GAGMEN","GAGS","GAIETY","GAIJIN","GAILY","GAIN","GAINED","GAINER","GAINLY","GAINS","GAINST","GAIT","GAITED","GAITER","GAITS","GAL","GALA","GALAGO","GALAH","GALAHS","GALAS","GALAX","GALAXY","GALE","GALEA","GALEAE","GALEAS","GALENA","GALERE","GALES","GALIOT","GALL","GALLED","GALLET","GALLEY","GALLIC","GALLON","GALLOP","GALLS","GALLUS","GALLY","GALOOT","GALOP","GALOPS","GALORE","GALOSH","GALS","GALYAC","GALYAK","GAM","GAMA","GAMAS","GAMAY","GAMAYS","GAMB","GAMBA","GAMBAS","GAMBE","GAMBES","GAMBIA","GAMBIR","GAMBIT","GAMBLE","GAMBOL","GAMBS","GAME","GAMED","GAMELY","GAMER","GAMERS","GAMES","GAMEST","GAMETE","GAMEY","GAMIC","GAMIER","GAMILY","GAMIN","GAMINE","GAMING","GAMINS","GAMMA","GAMMAS","GAMMED","GAMMER","GAMMON","GAMMY","GAMP","GAMPS","GAMS","GAMUT","GAMUTS","GAMY","GAN","GANDER","GANE","GANEF","GANEFS","GANEV","GANEVS","GANG","GANGED","GANGER","GANGLY","GANGS","GANGUE","GANJA","GANJAH","GANJAS","GANNET","GANOF","GANOFS","GANOID","GANTRY","GAOL","GAOLED","GAOLER","GAOLS","GAP","GAPE","GAPED","GAPER","GAPERS","GAPES","GAPING","GAPPED","GAPPY","GAPS","GAPY","GAR","GARAGE","GARB","GARBED","GARBLE","GARBS","GARCON","GARDEN","GARGET","GARGLE","GARISH","GARLIC","GARNER","GARNET","GARNI","GAROTE","GARRED","GARRET","GARRON","GARS","GARTER","GARTH","GARTHS","GARVEY","GAS","GASBAG","GASCON","GASES","GASH","GASHED","GASHER","GASHES","GASIFY","GASKET","GASKIN","GASLIT","GASMAN","GASMEN","GASP","GASPED","GASPER","GASPS","GASSED","GASSER","GASSES","GASSY","GAST","GASTED","GASTER","GASTS","GAT","GATE","GATEAU","GATED","GATES","GATHER","GATING","GATOR","GATORS","GATS","GAUCHE","GAUCHO","GAUD","GAUDS","GAUDY","GAUGE","GAUGED","GAUGER","GAUGES","GAULT","GAULTS","GAUM","GAUMED","GAUMS","GAUN","GAUNT","GAUR","GAURS","GAUSS","GAUZE","GAUZES","GAUZY","GAVAGE","GAVE","GAVEL","GAVELS","GAVIAL","GAVOT","GAVOTS","GAWK","GAWKED","GAWKER","GAWKS","GAWKY","GAWP","GAWPED","GAWPER","GAWPS","GAWSIE","GAWSY","GAY","GAYAL","GAYALS","GAYER","GAYEST","GAYETY","GAYLY","GAYS","GAZABO","GAZAR","GAZARS","GAZE","GAZEBO","GAZED","GAZER","GAZERS","GAZES","GAZING","GAZUMP","GEAR","GEARED","GEARS","GECK","GECKED","GECKO","GECKOS","GECKS","GED","GEDS","GEE","GEED","GEEGAW","GEEING","GEEK","GEEKS","GEEKY","GEES","GEESE","GEEST","GEESTS","GEEZ","GEEZER","GEISHA","GEL","GELADA","GELANT","GELATE","GELATI","GELATO","GELD","GELDED","GELDER","GELDS","GELEE","GELEES","GELID","GELLED","GELS","GELT","GELTS","GEM","GEMMA","GEMMAE","GEMMED","GEMMY","GEMOT","GEMOTE","GEMOTS","GEMS","GEN","GENDER","GENE","GENERA","GENES","GENET","GENETS","GENEVA","GENIAL","GENIC","GENIE","GENIES","GENII","GENIP","GENIPS","GENIUS","GENOA","GENOAS","GENOM","GENOME","GENOMS","GENRE","GENRES","GENRO","GENROS","GENS","GENT","GENTES","GENTIL","GENTLE","GENTLY","GENTOO","GENTRY","GENTS","GENU","GENUA","GENUS","GEODE","GEODES","GEODIC","GEOID","GEOIDS","GERAH","GERAHS","GERBIL","GERENT","GERM","GERMAN","GERMEN","GERMS","GERMY","GERUND","GESSO","GEST","GESTE","GESTES","GESTIC","GESTS","GET","GETA","GETAS","GETS","GETTER","GETUP","GETUPS","GEUM","GEUMS","GEWGAW","GEY","GEYSER","GHARRI","GHARRY","GHAST","GHAT","GHATS","GHAUT","GHAUTS","GHAZI","GHAZIS","GHEE","GHEES","GHERAO","GHETTO","GHI","GHIBLI","GHIS","GHOST","GHOSTS","GHOSTY","GHOUL","GHOULS","GHYLL","GHYLLS","GIANT","GIANTS","GIAOUR","GIB","GIBBED","GIBBER","GIBBET","GIBBON","GIBE","GIBED","GIBER","GIBERS","GIBES","GIBING","GIBLET","GIBS","GIBSON","GID","GIDDAP","GIDDY","GIDS","GIE","GIED","GIEING","GIEN","GIES","GIFT","GIFTED","GIFTS","GIG","GIGA","GIGAS","GIGGED","GIGGLE","GIGGLY","GIGHE","GIGLET","GIGLOT","GIGOLO","GIGOT","GIGOTS","GIGS","GIGUE","GIGUES","GILD","GILDED","GILDER","GILDS","GILL","GILLED","GILLER","GILLIE","GILLS","GILLY","GILT","GILTS","GIMBAL","GIMEL","GIMELS","GIMLET","GIMMAL","GIMME","GIMMES","GIMMIE","GIMP","GIMPED","GIMPS","GIMPY","GIN","GINGAL","GINGER","GINGKO","GINK","GINKGO","GINKS","GINNED","GINNER","GINNY","GINS","GIP","GIPON","GIPONS","GIPPED","GIPPER","GIPS","GIPSY","GIRD","GIRDED","GIRDER","GIRDLE","GIRDS","GIRL","GIRLIE","GIRLS","GIRLY","GIRN","GIRNED","GIRNS","GIRO","GIRON","GIRONS","GIROS","GIRSH","GIRT","GIRTED","GIRTH","GIRTHS","GIRTS","GISMO","GISMOS","GIST","GISTS","GIT","GITANO","GITS","GITTIN","GIVE","GIVEN","GIVENS","GIVER","GIVERS","GIVES","GIVING","GIZMO","GIZMOS","GLACE","GLACES","GLACIS","GLAD","GLADE","GLADES","GLADLY","GLADS","GLADY","GLAIR","GLAIRE","GLAIRS","GLAIRY","GLAIVE","GLAMOR","GLANCE","GLAND","GLANDS","GLANS","GLARE","GLARED","GLARES","GLARY","GLASS","GLASSY","GLAZE","GLAZED","GLAZER","GLAZES","GLAZY","GLEAM","GLEAMS","GLEAMY","GLEAN","GLEANS","GLEBA","GLEBAE","GLEBE","GLEBES","GLED","GLEDE","GLEDES","GLEDS","GLEE","GLEED","GLEEDS","GLEEK","GLEEKS","GLEES","GLEET","GLEETS","GLEETY","GLEG","GLEGLY","GLEN","GLENS","GLEY","GLEYED","GLEYS","GLIA","GLIAL","GLIAS","GLIB","GLIBLY","GLIDE","GLIDED","GLIDER","GLIDES","GLIFF","GLIFFS","GLIM","GLIME","GLIMED","GLIMES","GLIMS","GLINT","GLINTS","GLIOMA","GLITCH","GLITZ","GLITZY","GLOAM","GLOAMS","GLOAT","GLOATS","GLOB","GLOBAL","GLOBBY","GLOBE","GLOBED","GLOBES","GLOBIN","GLOBS","GLOGG","GLOGGS","GLOM","GLOMS","GLOMUS","GLOOM","GLOOMS","GLOOMY","GLOP","GLOPPY","GLOPS","GLORIA","GLORY","GLOSS","GLOSSA","GLOSSY","GLOST","GLOSTS","GLOUT","GLOUTS","GLOVE","GLOVED","GLOVER","GLOVES","GLOW","GLOWED","GLOWER","GLOWS","GLOZE","GLOZED","GLOZES","GLUCAN","GLUE","GLUED","GLUER","GLUERS","GLUES","GLUEY","GLUG","GLUGS","GLUIER","GLUILY","GLUING","GLUM","GLUME","GLUMES","GLUMLY","GLUMPY","GLUNCH","GLUON","GLUONS","GLUT","GLUTEI","GLUTEN","GLUTS","GLYCAN","GLYCIN","GLYCOL","GLYCYL","GLYPH","GLYPHS","GNAR","GNARL","GNARLS","GNARLY","GNARR","GNARRS","GNARS","GNASH","GNAT","GNATS","GNATTY","GNAW","GNAWED","GNAWER","GNAWN","GNAWS","GNEISS","GNOME","GNOMES","GNOMIC","GNOMON","GNOSES","GNOSIS","GNU","GNUS","GOA","GOAD","GOADED","GOADS","GOAL","GOALED","GOALIE","GOALS","GOANNA","GOAS","GOAT","GOATEE","GOATS","GOB","GOBAN","GOBANG","GOBANS","GOBBED","GOBBET","GOBBLE","GOBIES","GOBLET","GOBLIN","GOBO","GOBOES","GOBONY","GOBOS","GOBS","GOBY","GOD","GODDAM","GODDED","GODET","GODETS","GODLY","GODOWN","GODS","GODSON","GODWIT","GOER","GOERS","GOES","GOFER","GOFERS","GOFFER","GOGGLE","GOGGLY","GOGLET","GOGO","GOGOS","GOING","GOINGS","GOITER","GOITRE","GOLD","GOLDEN","GOLDER","GOLDS","GOLEM","GOLEMS","GOLF","GOLFED","GOLFER","GOLFS","GOLLY","GOLOSH","GOMBO","GOMBOS","GOMUTI","GONAD","GONADS","GONE","GONEF","GONEFS","GONER","GONERS","GONG","GONGED","GONGS","GONIA","GONIF","GONIFF","GONIFS","GONION","GONIUM","GONOF","GONOFS","GONOPH","GONZO","GOO","GOOBER","GOOD","GOODBY","GOODIE","GOODLY","GOODS","GOODY","GOOEY","GOOF","GOOFED","GOOFS","GOOFY","GOOGLY","GOOGOL","GOOIER","GOOK","GOOKS","GOOKY","GOON","GOONEY","GOONIE","GOONS","GOONY","GOOP","GOOPS","GOOPY","GOORAL","GOOS","GOOSE","GOOSED","GOOSES","GOOSEY","GOOSY","GOPHER","GOR","GORAL","GORALS","GORE","GORED","GORES","GORGE","GORGED","GORGER","GORGES","GORGET","GORGON","GORHEN","GORIER","GORILY","GORING","GORP","GORPS","GORSE","GORSES","GORSY","GORY","GOSH","GOSPEL","GOSSAN","GOSSIP","GOT","GOTHIC","GOTTEN","GOUGE","GOUGED","GOUGER","GOUGES","GOURD","GOURDE","GOURDS","GOUT","GOUTS","GOUTY","GOVERN","GOWAN","GOWANS","GOWANY","GOWD","GOWDS","GOWK","GOWKS","GOWN","GOWNED","GOWNS","GOX","GOXES","GOY","GOYIM","GOYISH","GOYS","GRAAL","GRAALS","GRAB","GRABBY","GRABEN","GRABS","GRACE","GRACED","GRACES","GRAD","GRADE","GRADED","GRADER","GRADES","GRADIN","GRADS","GRADUS","GRAFT","GRAFTS","GRAHAM","GRAIL","GRAILS","GRAIN","GRAINS","GRAINY","GRAM","GRAMA","GRAMAS","GRAMME","GRAMP","GRAMPS","GRAMS","GRAN","GRANA","GRAND","GRANDS","GRANGE","GRANNY","GRANS","GRANT","GRANTS","GRANUM","GRAPE","GRAPES","GRAPEY","GRAPH","GRAPHS","GRAPPA","GRAPY","GRASP","GRASPS","GRASS","GRASSY","GRAT","GRATE","GRATED","GRATER","GRATES","GRATIN","GRATIS","GRAVE","GRAVED","GRAVEL","GRAVEN","GRAVER","GRAVES","GRAVID","GRAVY","GRAY","GRAYED","GRAYER","GRAYLY","GRAYS","GRAZE","GRAZED","GRAZER","GRAZES","GREASE","GREASY","GREAT","GREATS","GREAVE","GREBE","GREBES","GREE","GREED","GREEDS","GREEDY","GREEK","GREEN","GREENS","GREENY","GREES","GREET","GREETS","GREGO","GREGOS","GREIGE","GREMMY","GREW","GREY","GREYED","GREYER","GREYLY","GREYS","GRID","GRIDE","GRIDED","GRIDES","GRIDS","GRIEF","GRIEFS","GRIEVE","GRIFF","GRIFFE","GRIFFS","GRIFT","GRIFTS","GRIG","GRIGRI","GRIGS","GRILL","GRILLE","GRILLS","GRILSE","GRIM","GRIME","GRIMED","GRIMES","GRIMLY","GRIMY","GRIN","GRINCH","GRIND","GRINDS","GRINGO","GRINS","GRIOT","GRIOTS","GRIP","GRIPE","GRIPED","GRIPER","GRIPES","GRIPEY","GRIPPE","GRIPPY","GRIPS","GRIPT","GRIPY","GRISLY","GRISON","GRIST","GRISTS","GRIT","GRITH","GRITHS","GRITS","GRITTY","GRIVET","GROAN","GROANS","GROAT","GROATS","GROCER","GROG","GROGGY","GROGS","GROIN","GROINS","GROOM","GROOMS","GROOVE","GROOVY","GROPE","GROPED","GROPER","GROPES","GROSS","GROSZ","GROSZE","GROSZY","GROT","GROTS","GROTTO","GROTTY","GROUCH","GROUND","GROUP","GROUPS","GROUSE","GROUT","GROUTS","GROUTY","GROVE","GROVED","GROVEL","GROVES","GROW","GROWER","GROWL","GROWLS","GROWLY","GROWN","GROWS","GROWTH","GROYNE","GRUB","GRUBBY","GRUBS","GRUDGE","GRUE","GRUEL","GRUELS","GRUES","GRUFF","GRUFFS","GRUFFY","GRUGRU","GRUM","GRUME","GRUMES","GRUMP","GRUMPS","GRUMPY","GRUNGE","GRUNGY","GRUNT","GRUNTS","GRUTCH","GUACO","GUACOS","GUAIAC","GUAN","GUANAY","GUANIN","GUANO","GUANOS","GUANS","GUAR","GUARD","GUARDS","GUARS","GUAVA","GUAVAS","GUCK","GUCKS","GUDE","GUDES","GUENON","GUESS","GUEST","GUESTS","GUFF","GUFFAW","GUFFS","GUGGLE","GUGLET","GUID","GUIDE","GUIDED","GUIDER","GUIDES","GUIDON","GUIDS","GUILD","GUILDS","GUILE","GUILED","GUILES","GUILT","GUILTS","GUILTY","GUIMPE","GUINEA","GUIRO","GUIROS","GUISE","GUISED","GUISES","GUITAR","GUL","GULAG","GULAGS","GULAR","GULCH","GULDEN","GULES","GULF","GULFED","GULFS","GULFY","GULL","GULLED","GULLET","GULLEY","GULLS","GULLY","GULP","GULPED","GULPER","GULPS","GULPY","GULS","GUM","GUMBO","GUMBOS","GUMMA","GUMMAS","GUMMED","GUMMER","GUMMY","GUMS","GUN","GUNDOG","GUNITE","GUNK","GUNKS","GUNKY","GUNMAN","GUNMEN","GUNNED","GUNNEL","GUNNEN","GUNNER","GUNNY","GUNS","GUNSEL","GUPPY","GURGE","GURGED","GURGES","GURGLE","GURNET","GURNEY","GURRY","GURSH","GURU","GURUS","GUSH","GUSHED","GUSHER","GUSHES","GUSHY","GUSSET","GUSSIE","GUSSY","GUST","GUSTED","GUSTO","GUSTS","GUSTY","GUT","GUTS","GUTSY","GUTTA","GUTTAE","GUTTED","GUTTER","GUTTLE","GUTTY","GUV","GUVS","GUY","GUYED","GUYING","GUYOT","GUYOTS","GUYS","GUZZLE","GWEDUC","GYBE","GYBED","GYBES","GYBING","GYM","GYMS","GYP","GYPPED","GYPPER","GYPS","GYPSUM","GYPSY","GYRAL","GYRASE","GYRATE","GYRE","GYRED","GYRENE","GYRES","GYRI","GYRING","GYRO","GYRON","GYRONS","GYROS","GYROSE","GYRUS","GYVE","GYVED","GYVES","GYVING","HAAF","HAAFS","HAAR","HAARS","HABILE","HABIT","HABITS","HABOOB","HABU","HABUS","HACEK","HACEKS","HACK","HACKED","HACKEE","HACKER","HACKIE","HACKLE","HACKLY","HACKS","HAD","HADAL","HADE","HADED","HADES","HADING","HADITH","HADJ","HADJEE","HADJES","HADJI","HADJIS","HADRON","HADST","HAE","HAED","HAEING","HAEM","HAEMAL","HAEMIC","HAEMIN","HAEMS","HAEN","HAERES","HAES","HAET","HAETS","HAFFET","HAFFIT","HAFIS","HAFIZ","HAFT","HAFTED","HAFTER","HAFTS","HAG","HAGBUT","HAGDON","HAGGED","HAGGIS","HAGGLE","HAGS","HAH","HAHA","HAHAS","HAHS","HAIK","HAIKA","HAIKS","HAIKU","HAIL","HAILED","HAILER","HAILS","HAIR","HAIRDO","HAIRED","HAIRS","HAIRY","HAJ","HAJES","HAJI","HAJIS","HAJJ","HAJJES","HAJJI","HAJJIS","HAKE","HAKEEM","HAKES","HAKIM","HAKIMS","HALALA","HALE","HALED","HALER","HALERS","HALERU","HALES","HALEST","HALF","HALID","HALIDE","HALIDS","HALING","HALITE","HALL","HALLAH","HALLEL","HALLO","HALLOA","HALLOO","HALLOS","HALLOT","HALLOW","HALLS","HALLUX","HALM","HALMA","HALMAS","HALMS","HALO","HALOED","HALOES","HALOID","HALOS","HALT","HALTED","HALTER","HALTS","HALUTZ","HALVA","HALVAH","HALVAS","HALVE","HALVED","HALVES","HAM","HAMADA","HAMAL","HAMALS","HAMATE","HAMAUL","HAME","HAMES","HAMLET","HAMMAL","HAMMED","HAMMER","HAMMY","HAMPER","HAMS","HAMULI","HAMZA","HAMZAH","HAMZAS","HANCE","HANCES","HAND","HANDED","HANDLE","HANDS","HANDY","HANG","HANGAR","HANGED","HANGER","HANGS","HANGUL","HANGUP","HANIWA","HANK","HANKED","HANKER","HANKIE","HANKS","HANKY","HANSA","HANSAS","HANSE","HANSEL","HANSES","HANSOM","HANT","HANTED","HANTLE","HANTS","HAO","HAOLE","HAOLES","HAP","HAPAX","HAPLY","HAPPED","HAPPEN","HAPPY","HAPS","HAPTEN","HAPTIC","HARASS","HARBOR","HARD","HARDEN","HARDER","HARDLY","HARDS","HARDY","HARE","HARED","HAREEM","HAREM","HAREMS","HARES","HARING","HARK","HARKED","HARKEN","HARKS","HARL","HARLOT","HARLS","HARM","HARMED","HARMER","HARMIN","HARMS","HARP","HARPED","HARPER","HARPIN","HARPS","HARPY","HARROW","HARRY","HARSH","HART","HARTAL","HARTS","HAS","HASH","HASHED","HASHES","HASLET","HASP","HASPED","HASPS","HASSEL","HASSLE","HAST","HASTE","HASTED","HASTEN","HASTES","HASTY","HAT","HATBOX","HATCH","HATE","HATED","HATER","HATERS","HATES","HATFUL","HATH","HATING","HATPIN","HATRED","HATS","HATTED","HATTER","HAUGH","HAUGHS","HAUL","HAULED","HAULER","HAULM","HAULMS","HAULMY","HAULS","HAUNCH","HAUNT","HAUNTS","HAUSEN","HAUT","HAUTE","HAVE","HAVEN","HAVENS","HAVER","HAVERS","HAVES","HAVING","HAVIOR","HAVOC","HAVOCS","HAW","HAWED","HAWING","HAWK","HAWKED","HAWKER","HAWKEY","HAWKIE","HAWKS","HAWS","HAWSE","HAWSER","HAWSES","HAY","HAYED","HAYER","HAYERS","HAYING","HAYMOW","HAYS","HAZAN","HAZANS","HAZARD","HAZE","HAZED","HAZEL","HAZELS","HAZER","HAZERS","HAZES","HAZIER","HAZILY","HAZING","HAZY","HAZZAN","HEAD","HEADED","HEADER","HEADS","HEADY","HEAL","HEALED","HEALER","HEALS","HEALTH","HEAP","HEAPED","HEAPS","HEAR","HEARD","HEARER","HEARS","HEARSE","HEART","HEARTH","HEARTS","HEARTY","HEAT","HEATED","HEATER","HEATH","HEATHS","HEATHY","HEATS","HEAUME","HEAVE","HEAVED","HEAVEN","HEAVER","HEAVES","HEAVY","HEBE","HEBES","HECK","HECKLE","HECKS","HECTIC","HECTOR","HEDDLE","HEDER","HEDERS","HEDGE","HEDGED","HEDGER","HEDGES","HEDGY","HEED","HEEDED","HEEDER","HEEDS","HEEHAW","HEEL","HEELED","HEELER","HEELS","HEEZE","HEEZED","HEEZES","HEFT","HEFTED","HEFTER","HEFTS","HEFTY","HEGARI","HEGIRA","HEH","HEHS","HEIFER","HEIGH","HEIGHT","HEIL","HEILED","HEILS","HEINIE","HEIR","HEIRED","HEIRS","HEISHI","HEIST","HEISTS","HEJIRA","HELD","HELIAC","HELIO","HELIOS","HELIUM","HELIX","HELL","HELLED","HELLER","HELLO","HELLOS","HELLS","HELM","HELMED","HELMET","HELMS","HELO","HELOS","HELOT","HELOTS","HELP","HELPED","HELPER","HELPS","HELVE","HELVED","HELVES","HEM","HEMAL","HEME","HEMES","HEMIC","HEMIN","HEMINS","HEMMED","HEMMER","HEMOID","HEMP","HEMPEN","HEMPIE","HEMPS","HEMPY","HEMS","HEN","HENBIT","HENCE","HENNA","HENNAS","HENRY","HENRYS","HENS","HENT","HENTED","HENTS","HEP","HEPCAT","HEPTAD","HER","HERALD","HERB","HERBAL","HERBED","HERBS","HERBY","HERD","HERDED","HERDER","HERDIC","HERDS","HERE","HEREAT","HEREBY","HEREIN","HEREOF","HEREON","HERES","HERESY","HERETO","HERIOT","HERL","HERLS","HERM","HERMA","HERMAE","HERMAI","HERMIT","HERMS","HERN","HERNIA","HERNS","HERO","HEROES","HEROIC","HEROIN","HERON","HERONS","HEROS","HERPES","HERRY","HERS","HERTZ","HES","HEST","HESTS","HET","HETERO","HETH","HETHS","HETMAN","HETS","HEUCH","HEUCHS","HEUGH","HEUGHS","HEW","HEWED","HEWER","HEWERS","HEWING","HEWN","HEWS","HEX","HEXAD","HEXADE","HEXADS","HEXANE","HEXED","HEXER","HEXERS","HEXES","HEXING","HEXONE","HEXOSE","HEXYL","HEXYLS","HEY","HEYDAY","HEYDEY","HIATAL","HIATUS","HIC","HICCUP","HICK","HICKEY","HICKS","HID","HIDDEN","HIDE","HIDED","HIDER","HIDERS","HIDES","HIDING","HIE","HIED","HIEING","HIEMAL","HIES","HIGGLE","HIGH","HIGHER","HIGHLY","HIGHS","HIGHT","HIGHTH","HIGHTS","HIJACK","HIKE","HIKED","HIKER","HIKERS","HIKES","HIKING","HILA","HILAR","HILI","HILL","HILLED","HILLER","HILLO","HILLOA","HILLOS","HILLS","HILLY","HILT","HILTED","HILTS","HILUM","HILUS","HIM","HIN","HIND","HINDER","HINDS","HINGE","HINGED","HINGER","HINGES","HINNY","HINS","HINT","HINTED","HINTER","HINTS","HIP","HIPPED","HIPPER","HIPPIE","HIPPO","HIPPOS","HIPPY","HIPS","HIRE","HIRED","HIRER","HIRERS","HIRES","HIRING","HIRPLE","HIRSEL","HIRSLE","HIS","HISN","HISPID","HISS","HISSED","HISSER","HISSES","HISSY","HIST","HISTED","HISTS","HIT","HITCH","HITHER","HITS","HITTER","HIVE","HIVED","HIVES","HIVING","HMM","HOAGIE","HOAGY","HOAR","HOARD","HOARDS","HOARS","HOARSE","HOARY","HOAX","HOAXED","HOAXER","HOAXES","HOB","HOBBED","HOBBIT","HOBBLE","HOBBY","HOBNOB","HOBO","HOBOED","HOBOES","HOBOS","HOBS","HOCK","HOCKED","HOCKER","HOCKEY","HOCKS","HOCUS","HOD","HODAD","HODADS","HODDEN","HODDIN","HODS","HOE","HOED","HOEING","HOER","HOERS","HOES","HOG","HOGAN","HOGANS","HOGG","HOGGED","HOGGER","HOGGET","HOGGS","HOGNUT","HOGS","HOGTIE","HOICK","HOICKS","HOIDEN","HOISE","HOISED","HOISES","HOIST","HOISTS","HOKE","HOKED","HOKES","HOKEY","HOKIER","HOKILY","HOKING","HOKKU","HOKUM","HOKUMS","HOLARD","HOLD","HOLDEN","HOLDER","HOLDS","HOLDUP","HOLE","HOLED","HOLES","HOLEY","HOLIER","HOLIES","HOLILY","HOLING","HOLISM","HOLIST","HOLK","HOLKED","HOLKS","HOLLA","HOLLAS","HOLLER","HOLLO","HOLLOA","HOLLOO","HOLLOS","HOLLOW","HOLLY","HOLM","HOLMIC","HOLMS","HOLP","HOLPEN","HOLS","HOLT","HOLTS","HOLY","HOMAGE","HOMBRE","HOME","HOMED","HOMELY","HOMER","HOMERS","HOMES","HOMEY","HOMIER","HOMILY","HOMING","HOMINY","HOMMOS","HOMO","HOMOS","HOMY","HON","HONAN","HONANS","HONCHO","HONDA","HONDAS","HONDLE","HONE","HONED","HONER","HONERS","HONES","HONEST","HONEY","HONEYS","HONG","HONGS","HONIED","HONING","HONK","HONKED","HONKER","HONKEY","HONKIE","HONKS","HONKY","HONOR","HONORS","HONOUR","HONS","HOOCH","HOOD","HOODED","HOODIE","HOODOO","HOODS","HOODY","HOOEY","HOOEYS","HOOF","HOOFED","HOOFER","HOOFS","HOOK","HOOKA","HOOKAH","HOOKAS","HOOKED","HOOKER","HOOKEY","HOOKS","HOOKUP","HOOKY","HOOLIE","HOOLY","HOOP","HOOPED","HOOPER","HOOPLA","HOOPOE","HOOPOO","HOOPS","HOORAH","HOORAY","HOOT","HOOTCH","HOOTED","HOOTER","HOOTS","HOOTY","HOOVED","HOOVES","HOP","HOPE","HOPED","HOPER","HOPERS","HOPES","HOPING","HOPPED","HOPPER","HOPPLE","HOPPY","HOPS","HORA","HORAH","HORAHS","HORAL","HORARY","HORAS","HORDE","HORDED","HORDES","HORN","HORNED","HORNET","HORNS","HORNY","HORRID","HORROR","HORSE","HORSED","HORSES","HORSEY","HORST","HORSTE","HORSTS","HORSY","HOSE","HOSED","HOSEL","HOSELS","HOSEN","HOSES","HOSIER","HOSING","HOST","HOSTA","HOSTAS","HOSTED","HOSTEL","HOSTLY","HOSTS","HOT","HOTBED","HOTBOX","HOTCH","HOTDOG","HOTEL","HOTELS","HOTLY","HOTROD","HOTS","HOTTED","HOTTER","HOUDAH","HOUND","HOUNDS","HOUR","HOURI","HOURIS","HOURLY","HOURS","HOUSE","HOUSED","HOUSEL","HOUSER","HOUSES","HOVE","HOVEL","HOVELS","HOVER","HOVERS","HOW","HOWDAH","HOWDIE","HOWDY","HOWE","HOWES","HOWF","HOWFF","HOWFFS","HOWFS","HOWK","HOWKED","HOWKS","HOWL","HOWLED","HOWLER","HOWLET","HOWLS","HOWS","HOY","HOYA","HOYAS","HOYDEN","HOYLE","HOYLES","HOYS","HUB","HUBBLY","HUBBUB","HUBBY","HUBCAP","HUBRIS","HUBS","HUCK","HUCKLE","HUCKS","HUDDLE","HUE","HUED","HUES","HUFF","HUFFED","HUFFS","HUFFY","HUG","HUGE","HUGELY","HUGER","HUGEST","HUGGED","HUGGER","HUGS","HUH","HUIC","HUIPIL","HULA","HULAS","HULK","HULKED","HULKS","HULKY","HULL","HULLED","HULLER","HULLO","HULLOA","HULLOS","HULLS","HUM","HUMAN","HUMANE","HUMANS","HUMATE","HUMBLE","HUMBLY","HUMBUG","HUMERI","HUMIC","HUMID","HUMMED","HUMMER","HUMMUS","HUMOR","HUMORS","HUMOUR","HUMP","HUMPED","HUMPH","HUMPHS","HUMPS","HUMPY","HUMS","HUMUS","HUMVEE","HUN","HUNCH","HUNG","HUNGER","HUNGRY","HUNH","HUNK","HUNKER","HUNKS","HUNKY","HUNS","HUNT","HUNTED","HUNTER","HUNTS","HUP","HURDLE","HURDS","HURL","HURLED","HURLER","HURLEY","HURLS","HURLY","HURRAH","HURRAY","HURRY","HURST","HURSTS","HURT","HURTER","HURTLE","HURTS","HUSH","HUSHED","HUSHES","HUSK","HUSKED","HUSKER","HUSKS","HUSKY","HUSSAR","HUSSY","HUSTLE","HUT","HUTCH","HUTS","HUTTED","HUTZPA","HUZZA","HUZZAH","HUZZAS","HWAN","HYAENA","HYALIN","HYBRID","HYBRIS","HYDRA","HYDRAE","HYDRAS","HYDRIA","HYDRIC","HYDRID","HYDRO","HYDROS","HYENA","HYENAS","HYENIC","HYETAL","HYING","HYLA","HYLAS","HYMEN","HYMENS","HYMN","HYMNAL","HYMNED","HYMNS","HYOID","HYOIDS","HYP","HYPE","HYPED","HYPER","HYPES","HYPHA","HYPHAE","HYPHAL","HYPHEN","HYPING","HYPNIC","HYPO","HYPOED","HYPOS","HYPS","HYRAX","HYSON","HYSONS","HYSSOP","HYTE","IAMB","IAMBI","IAMBIC","IAMBS","IAMBUS","IATRIC","IBEX","IBEXES","IBICES","IBIDEM","IBIS","IBISES","ICE","ICEBOX","ICECAP","ICED","ICEMAN","ICEMEN","ICES","ICH","ICHOR","ICHORS","ICHS","ICICLE","ICIER","ICIEST","ICILY","ICING","ICINGS","ICK","ICKER","ICKERS","ICKIER","ICKILY","ICKY","ICON","ICONES","ICONIC","ICONS","ICTIC","ICTUS","ICY","IDEA","IDEAL","IDEALS","IDEAS","IDEATE","IDEM","IDES","IDIOCY","IDIOM","IDIOMS","IDIOT","IDIOTS","IDLE","IDLED","IDLER","IDLERS","IDLES","IDLEST","IDLING","IDLY","IDOL","IDOLS","IDS","IDYL","IDYLL","IDYLLS","IDYLS","IFF","IFFIER","IFFY","IFS","IGLOO","IGLOOS","IGLU","IGLUS","IGNIFY","IGNITE","IGNORE","IGUANA","IHRAM","IHRAMS","IKAT","IKATS","IKON","IKONS","ILEA","ILEAC","ILEAL","ILEUM","ILEUS","ILEX","ILEXES","ILIA","ILIAC","ILIAD","ILIADS","ILIAL","ILIUM","ILK","ILKA","ILKS","ILL","ILLER","ILLEST","ILLITE","ILLS","ILLUME","ILLY","IMAGE","IMAGED","IMAGER","IMAGES","IMAGO","IMAGOS","IMAM","IMAMS","IMARET","IMAUM","IMAUMS","IMBALM","IMBARK","IMBED","IMBEDS","IMBIBE","IMBODY","IMBRUE","IMBUE","IMBUED","IMBUES","IMID","IMIDE","IMIDES","IMIDIC","IMIDO","IMIDS","IMINE","IMINES","IMINO","IMMANE","IMMESH","IMMIES","IMMIX","IMMUNE","IMMURE","IMMY","IMP","IMPACT","IMPAIR","IMPALA","IMPALE","IMPARK","IMPART","IMPAWN","IMPED","IMPEDE","IMPEL","IMPELS","IMPEND","IMPHEE","IMPI","IMPING","IMPIS","IMPISH","IMPLY","IMPONE","IMPORT","IMPOSE","IMPOST","IMPROV","IMPS","IMPUGN","IMPURE","IMPUTE","INANE","INANER","INANES","INAPT","INARCH","INARM","INARMS","INBORN","INBRED","INBY","INBYE","INCAGE","INCANT","INCASE","INCEPT","INCEST","INCH","INCHED","INCHES","INCISE","INCITE","INCLIP","INCOG","INCOGS","INCOME","INCONY","INCUBI","INCULT","INCUR","INCURS","INCUS","INCUSE","INDABA","INDEED","INDENE","INDENT","INDEX","INDICT","INDIE","INDIES","INDIGN","INDIGO","INDITE","INDIUM","INDOL","INDOLE","INDOLS","INDOOR","INDOW","INDOWS","INDRI","INDRIS","INDUCE","INDUCT","INDUE","INDUED","INDUES","INDULT","INEPT","INERT","INERTS","INFALL","INFAMY","INFANT","INFARE","INFECT","INFER","INFERS","INFEST","INFIRM","INFIX","INFLOW","INFLUX","INFO","INFOLD","INFORM","INFOS","INFRA","INFUSE","INGATE","INGEST","INGLE","INGLES","INGOT","INGOTS","INGULF","INHALE","INHAUL","INHERE","INHUME","INIA","INION","INJECT","INJURE","INJURY","INK","INKED","INKER","INKERS","INKIER","INKING","INKJET","INKLE","INKLES","INKPOT","INKS","INKY","INLACE","INLAID","INLAND","INLAY","INLAYS","INLET","INLETS","INLIER","INLY","INMATE","INMESH","INMOST","INN","INNATE","INNED","INNER","INNERS","INNING","INNS","INPOUR","INPUT","INPUTS","INRO","INROAD","INRUSH","INS","INSANE","INSEAM","INSECT","INSERT","INSET","INSETS","INSIDE","INSIST","INSOLE","INSOUL","INSPAN","INSTAL","INSTAR","INSTEP","INSTIL","INSULT","INSURE","INTACT","INTAKE","INTEND","INTENT","INTER","INTERN","INTERS","INTI","INTIMA","INTIME","INTINE","INTIS","INTO","INTOMB","INTONE","INTORT","INTOWN","INTRO","INTRON","INTROS","INTUIT","INTURN","INULIN","INURE","INURED","INURES","INURN","INURNS","INVADE","INVAR","INVARS","INVENT","INVERT","INVEST","INVITE","INVOKE","INWALL","INWARD","INWIND","INWOVE","INWRAP","IODATE","IODIC","IODID","IODIDE","IODIDS","IODIN","IODINE","IODINS","IODISE","IODISM","IODIZE","IODOUS","IOLITE","ION","IONIC","IONICS","IONISE","IONIUM","IONIZE","IONONE","IONS","IOTA","IOTAS","IPECAC","IRADE","IRADES","IRATE","IRATER","IRE","IRED","IREFUL","IRENIC","IRES","IRID","IRIDES","IRIDIC","IRIDS","IRING","IRIS","IRISED","IRISES","IRITIC","IRITIS","IRK","IRKED","IRKING","IRKS","IROKO","IROKOS","IRON","IRONE","IRONED","IRONER","IRONES","IRONIC","IRONS","IRONY","IRREAL","IRRUPT","ISATIN","ISBA","ISBAS","ISCHIA","ISLAND","ISLE","ISLED","ISLES","ISLET","ISLETS","ISLING","ISM","ISMS","ISOBAR","ISOGON","ISOHEL","ISOLOG","ISOMER","ISOPOD","ISSEI","ISSEIS","ISSUE","ISSUED","ISSUER","ISSUES","ISTHMI","ISTLE","ISTLES","ITALIC","ITCH","ITCHED","ITCHES","ITCHY","ITEM","ITEMED","ITEMS","ITERUM","ITHER","ITS","ITSELF","IVIED","IVIES","IVORY","IVY","IWIS","IXIA","IXIAS","IXODID","IXORA","IXORAS","IXTLE","IXTLES","IZAR","IZARS","IZZARD","JAB","JABBED","JABBER","JABIRU","JABOT","JABOTS","JABS","JACAL","JACALS","JACANA","JACK","JACKAL","JACKED","JACKER","JACKET","JACKS","JACKY","JADE","JADED","JADES","JADING","JADISH","JAEGER","JAG","JAGER","JAGERS","JAGG","JAGGED","JAGGER","JAGGS","JAGGY","JAGRA","JAGRAS","JAGS","JAGUAR","JAIL","JAILED","JAILER","JAILOR","JAILS","JAKE","JAKES","JALAP","JALAPS","JALOP","JALOPS","JALOPY","JAM","JAMB","JAMBE","JAMBED","JAMBES","JAMBS","JAMMED","JAMMER","JAMMY","JAMS","JANE","JANES","JANGLE","JANGLY","JANTY","JAPAN","JAPANS","JAPE","JAPED","JAPER","JAPERS","JAPERY","JAPES","JAPING","JAR","JARFUL","JARGON","JARINA","JARL","JARLS","JARRAH","JARRED","JARS","JARVEY","JASMIN","JASPER","JASSID","JATO","JATOS","JAUK","JAUKED","JAUKS","JAUNCE","JAUNT","JAUNTS","JAUNTY","JAUP","JAUPED","JAUPS","JAVA","JAVAS","JAW","JAWAN","JAWANS","JAWED","JAWING","JAWS","JAY","JAYGEE","JAYS","JAYVEE","JAZZ","JAZZED","JAZZER","JAZZES","JAZZY","JEAN","JEANS","JEBEL","JEBELS","JEE","JEED","JEEING","JEEP","JEEPED","JEEPS","JEER","JEERED","JEERER","JEERS","JEES","JEEZ","JEFE","JEFES","JEHAD","JEHADS","JEHU","JEHUS","JEJUNA","JEJUNE","JELL","JELLED","JELLS","JELLY","JEMMY","JENNET","JENNY","JEON","JERBOA","JEREED","JERID","JERIDS","JERK","JERKED","JERKER","JERKIN","JERKS","JERKY","JERRID","JERRY","JERSEY","JESS","JESSE","JESSED","JESSES","JEST","JESTED","JESTER","JESTS","JESUIT","JET","JETE","JETES","JETON","JETONS","JETS","JETSAM","JETSOM","JETTED","JETTON","JETTY","JEU","JEUX","JEW","JEWED","JEWEL","JEWELS","JEWING","JEWS","JEZAIL","JIAO","JIB","JIBB","JIBBED","JIBBER","JIBBS","JIBE","JIBED","JIBER","JIBERS","JIBES","JIBING","JIBS","JICAMA","JIFF","JIFFS","JIFFY","JIG","JIGGED","JIGGER","JIGGLE","JIGGLY","JIGS","JIGSAW","JIHAD","JIHADS","JILL","JILLS","JILT","JILTED","JILTER","JILTS","JIMINY","JIMMY","JIMP","JIMPER","JIMPLY","JIMPY","JIN","JINGAL","JINGKO","JINGLE","JINGLY","JINGO","JINK","JINKED","JINKER","JINKS","JINN","JINNEE","JINNI","JINNS","JINS","JINX","JINXED","JINXES","JISM","JISMS","JITNEY","JITTER","JIVE","JIVED","JIVER","JIVERS","JIVES","JIVEY","JIVIER","JIVING","JNANA","JNANAS","JOB","JOBBED","JOBBER","JOBS","JOCK","JOCKEY","JOCKO","JOCKOS","JOCKS","JOCOSE","JOCUND","JOE","JOES","JOEY","JOEYS","JOG","JOGGED","JOGGER","JOGGLE","JOGS","JOHN","JOHNNY","JOHNS","JOIN","JOINED","JOINER","JOINS","JOINT","JOINTS","JOIST","JOISTS","JOJOBA","JOKE","JOKED","JOKER","JOKERS","JOKES","JOKEY","JOKIER","JOKILY","JOKING","JOKY","JOLE","JOLES","JOLLY","JOLT","JOLTED","JOLTER","JOLTS","JOLTY","JONES","JORAM","JORAMS","JORDAN","JORUM","JORUMS","JOSEPH","JOSH","JOSHED","JOSHER","JOSHES","JOSS","JOSSES","JOSTLE","JOT","JOTA","JOTAS","JOTS","JOTTED","JOTTER","JOTTY","JOUAL","JOUALS","JOUK","JOUKED","JOUKS","JOULE","JOULES","JOUNCE","JOUNCY","JOUST","JOUSTS","JOVIAL","JOW","JOWAR","JOWARS","JOWED","JOWING","JOWL","JOWLED","JOWLS","JOWLY","JOWS","JOY","JOYED","JOYFUL","JOYING","JOYOUS","JOYPOP","JOYS","JUBA","JUBAS","JUBBAH","JUBE","JUBES","JUBHAH","JUBILE","JUDAS","JUDDER","JUDGE","JUDGED","JUDGER","JUDGES","JUDO","JUDOKA","JUDOS","JUG","JUGA","JUGAL","JUGATE","JUGFUL","JUGGED","JUGGLE","JUGS","JUGULA","JUGUM","JUGUMS","JUICE","JUICED","JUICER","JUICES","JUICY","JUJU","JUJUBE","JUJUS","JUKE","JUKED","JUKES","JUKING","JULEP","JULEPS","JUMBAL","JUMBLE","JUMBO","JUMBOS","JUMP","JUMPED","JUMPER","JUMPS","JUMPY","JUN","JUNCO","JUNCOS","JUNGLE","JUNGLY","JUNIOR","JUNK","JUNKED","JUNKER","JUNKET","JUNKIE","JUNKS","JUNKY","JUNTA","JUNTAS","JUNTO","JUNTOS","JUPE","JUPES","JUPON","JUPONS","JURA","JURAL","JURANT","JURAT","JURATS","JUREL","JURELS","JURIED","JURIES","JURIST","JUROR","JURORS","JURY","JUS","JUST","JUSTED","JUSTER","JUSTLE","JUSTLY","JUSTS","JUT","JUTE","JUTES","JUTS","JUTTED","JUTTY","KAAS","KAB","KABAB","KABABS","KABAKA","KABALA","KABAR","KABARS","KABAYA","KABIKI","KABOB","KABOBS","KABS","KABUKI","KADI","KADIS","KAE","KAES","KAF","KAFFIR","KAFIR","KAFIRS","KAFS","KAFTAN","KAGU","KAGUS","KAHUNA","KAIAK","KAIAKS","KAIF","KAIFS","KAIL","KAILS","KAIN","KAINIT","KAINS","KAISER","KAKA","KAKAPO","KAKAS","KAKI","KAKIS","KALAM","KALAMS","KALE","KALES","KALIAN","KALIF","KALIFS","KALIPH","KALIUM","KALMIA","KALONG","KALPA","KALPAK","KALPAS","KAMALA","KAME","KAMES","KAMI","KAMIK","KAMIKS","KAMSIN","KANA","KANAS","KANBAN","KANE","KANES","KANJI","KANJIS","KANTAR","KAOLIN","KAON","KAONS","KAPA","KAPAS","KAPH","KAPHS","KAPOK","KAPOKS","KAPPA","KAPPAS","KAPUT","KAPUTT","KARAT","KARATE","KARATS","KARMA","KARMAS","KARMIC","KARN","KARNS","KAROO","KAROOS","KAROSS","KARROO","KARST","KARSTS","KART","KARTS","KAS","KASBAH","KASHA","KASHAS","KASHER","KAT","KATA","KATAS","KATION","KATS","KAURI","KAURIS","KAURY","KAVA","KAVAS","KAVASS","KAY","KAYAK","KAYAKS","KAYLES","KAYO","KAYOED","KAYOES","KAYOS","KAYS","KAZOO","KAZOOS","KBAR","KBARS","KEA","KEAS","KEBAB","KEBABS","KEBAR","KEBARS","KEBBIE","KEBLAH","KEBOB","KEBOBS","KECK","KECKED","KECKLE","KECKS","KEDDAH","KEDGE","KEDGED","KEDGES","KEEF","KEEFS","KEEK","KEEKED","KEEKS","KEEL","KEELED","KEELS","KEEN","KEENED","KEENER","KEENLY","KEENS","KEEP","KEEPER","KEEPS","KEET","KEETS","KEEVE","KEEVES","KEF","KEFIR","KEFIRS","KEFS","KEG","KEGLER","KEGS","KEIR","KEIRS","KELEP","KELEPS","KELIM","KELIMS","KELLY","KELOID","KELP","KELPED","KELPIE","KELPS","KELPY","KELSON","KELTER","KELVIN","KEMP","KEMPS","KEMPT","KEN","KENAF","KENAFS","KENCH","KENDO","KENDOS","KENNED","KENNEL","KENO","KENOS","KENS","KENT","KEP","KEPI","KEPIS","KEPPED","KEPPEN","KEPS","KEPT","KERB","KERBED","KERBS","KERF","KERFED","KERFS","KERMES","KERMIS","KERN","KERNE","KERNED","KERNEL","KERNES","KERNS","KERRIA","KERRY","KERSEY","KETCH","KETENE","KETO","KETOL","KETOLS","KETONE","KETOSE","KETTLE","KEVEL","KEVELS","KEVIL","KEVILS","KEX","KEXES","KEY","KEYED","KEYING","KEYPAD","KEYS","KEYSET","KEYWAY","KHADI","KHADIS","KHAF","KHAFS","KHAKI","KHAKIS","KHALIF","KHAN","KHANS","KHAPH","KHAPHS","KHAT","KHATS","KHAZEN","KHEDA","KHEDAH","KHEDAS","KHET","KHETH","KHETHS","KHETS","KHI","KHIS","KHOUM","KHOUMS","KIANG","KIANGS","KIAUGH","KIBBE","KIBBEH","KIBBES","KIBBI","KIBBIS","KIBBLE","KIBE","KIBEI","KIBEIS","KIBES","KIBITZ","KIBLA","KIBLAH","KIBLAS","KIBOSH","KICK","KICKED","KICKER","KICKS","KICKUP","KICKY","KID","KIDDED","KIDDER","KIDDIE","KIDDO","KIDDOS","KIDDY","KIDNAP","KIDNEY","KIDS","KIDVID","KIEF","KIEFS","KIER","KIERS","KIF","KIFS","KIKE","KIKES","KILIM","KILIMS","KILL","KILLED","KILLER","KILLIE","KILLS","KILN","KILNED","KILNS","KILO","KILOS","KILT","KILTED","KILTER","KILTIE","KILTS","KILTY","KIMCHI","KIMONO","KIN","KINA","KINAS","KINASE","KIND","KINDER","KINDLE","KINDLY","KINDS","KINE","KINEMA","KINES","KING","KINGED","KINGLY","KINGS","KININ","KININS","KINK","KINKED","KINKS","KINKY","KINO","KINOS","KINS","KIOSK","KIOSKS","KIP","KIPPED","KIPPEN","KIPPER","KIPS","KIR","KIRK","KIRKS","KIRN","KIRNED","KIRNS","KIRS","KIRSCH","KIRTLE","KISHKA","KISHKE","KISMAT","KISMET","KISS","KISSED","KISSER","KISSES","KISSY","KIST","KISTS","KIT","KITE","KITED","KITER","KITERS","KITES","KITH","KITHE","KITHED","KITHES","KITHS","KITING","KITS","KITSCH","KITTED","KITTEL","KITTEN","KITTLE","KITTY","KIVA","KIVAS","KIWI","KIWIS","KLATCH","KLAXON","KLEPHT","KLONG","KLONGS","KLOOF","KLOOFS","KLUDGE","KLUGE","KLUGES","KLUTZ","KLUTZY","KNACK","KNACKS","KNAP","KNAPS","KNAR","KNARRY","KNARS","KNAUR","KNAURS","KNAVE","KNAVES","KNAWEL","KNEAD","KNEADS","KNEE","KNEED","KNEEL","KNEELS","KNEES","KNELL","KNELLS","KNELT","KNEW","KNIFE","KNIFED","KNIFER","KNIFES","KNIGHT","KNISH","KNIT","KNITS","KNIVES","KNOB","KNOBBY","KNOBS","KNOCK","KNOCKS","KNOLL","KNOLLS","KNOLLY","KNOP","KNOPS","KNOSP","KNOSPS","KNOT","KNOTS","KNOTTY","KNOUT","KNOUTS","KNOW","KNOWER","KNOWN","KNOWNS","KNOWS","KNUBBY","KNUR","KNURL","KNURLS","KNURLY","KNURS","KOA","KOALA","KOALAS","KOAN","KOANS","KOAS","KOB","KOBO","KOBOLD","KOBS","KOEL","KOELS","KOHL","KOHLS","KOI","KOINE","KOINES","KOLA","KOLAS","KOLHOZ","KOLKOZ","KOLO","KOLOS","KONK","KONKED","KONKS","KOODOO","KOOK","KOOKIE","KOOKS","KOOKY","KOP","KOPECK","KOPEK","KOPEKS","KOPH","KOPHS","KOPJE","KOPJES","KOPPA","KOPPAS","KOPPIE","KOPS","KOR","KORAI","KORAT","KORATS","KORE","KORS","KORUN","KORUNA","KORUNY","KOS","KOSHER","KOSS","KOTO","KOTOS","KOTOW","KOTOWS","KOUMIS","KOUMYS","KOUROI","KOUROS","KOUSSO","KOWTOW","KRAAL","KRAALS","KRAFT","KRAFTS","KRAIT","KRAITS","KRAKEN","KRATER","KRAUT","KRAUTS","KREEP","KREEPS","KRILL","KRILLS","KRIS","KRISES","KRONA","KRONE","KRONEN","KRONER","KRONOR","KRONUR","KROON","KROONI","KROONS","KRUBI","KRUBIS","KRUBUT","KUCHEN","KUDO","KUDOS","KUDU","KUDUS","KUDZU","KUDZUS","KUE","KUES","KUGEL","KUGELS","KUKRI","KUKRIS","KULAK","KULAKI","KULAKS","KULTUR","KUMISS","KUMMEL","KUMYS","KURGAN","KURTA","KURTAS","KURU","KURUS","KUSSO","KUSSOS","KUVASZ","KVAS","KVASES","KVASS","KVETCH","KWACHA","KWANZA","KYACK","KYACKS","KYAK","KYAKS","KYAR","KYARS","KYAT","KYATS","KYBOSH","KYLIX","KYRIE","KYRIES","KYTE","KYTES","KYTHE","KYTHED","KYTHES","LAAGER","LAARI","LAB","LABARA","LABEL","LABELS","LABIA","LABIAL","LABILE","LABIUM","LABOR","LABORS","LABOUR","LABRA","LABRET","LABRUM","LABS","LAC","LACE","LACED","LACER","LACERS","LACES","LACEY","LACHES","LACIER","LACILY","LACING","LACK","LACKED","LACKER","LACKEY","LACKS","LACS","LACTAM","LACTIC","LACUNA","LACUNE","LACY","LAD","LADDER","LADDIE","LADE","LADED","LADEN","LADENS","LADER","LADERS","LADES","LADIES","LADING","LADINO","LADLE","LADLED","LADLER","LADLES","LADRON","LADS","LADY","LAEVO","LAG","LAGAN","LAGANS","LAGEND","LAGER","LAGERS","LAGGED","LAGGER","LAGOON","LAGS","LAGUNA","LAGUNE","LAHAR","LAHARS","LAIC","LAICAL","LAICH","LAICHS","LAICS","LAID","LAIGH","LAIGHS","LAIN","LAIR","LAIRD","LAIRDS","LAIRED","LAIRS","LAITH","LAITY","LAKE","LAKED","LAKER","LAKERS","LAKES","LAKH","LAKHS","LAKIER","LAKING","LAKY","LALL","LALLAN","LALLED","LALLS","LAM","LAMA","LAMAS","LAMB","LAMBDA","LAMBED","LAMBER","LAMBIE","LAMBS","LAMBY","LAME","LAMED","LAMEDH","LAMEDS","LAMELY","LAMENT","LAMER","LAMES","LAMEST","LAMIA","LAMIAE","LAMIAS","LAMINA","LAMING","LAMMED","LAMP","LAMPAD","LAMPAS","LAMPED","LAMPS","LAMS","LANAI","LANAIS","LANATE","LANCE","LANCED","LANCER","LANCES","LANCET","LAND","LANDAU","LANDED","LANDER","LANDS","LANE","LANELY","LANES","LANG","LANGUE","LANGUR","LANK","LANKER","LANKLY","LANKY","LANNER","LANOSE","LANUGO","LAP","LAPDOG","LAPEL","LAPELS","LAPFUL","LAPIN","LAPINS","LAPIS","LAPPED","LAPPER","LAPPET","LAPS","LAPSE","LAPSED","LAPSER","LAPSES","LAPSUS","LAPTOP","LAR","LARCH","LARD","LARDED","LARDER","LARDON","LARDS","LARDY","LAREE","LAREES","LARES","LARGE","LARGER","LARGES","LARGO","LARGOS","LARI","LARIAT","LARINE","LARIS","LARK","LARKED","LARKER","LARKS","LARKY","LARRUP","LARS","LARUM","LARUMS","LARVA","LARVAE","LARVAL","LARVAS","LARYNX","LAS","LASCAR","LASE","LASED","LASER","LASERS","LASES","LASH","LASHED","LASHER","LASHES","LASING","LASS","LASSES","LASSIE","LASSO","LASSOS","LAST","LASTED","LASTER","LASTLY","LASTS","LAT","LATCH","LATE","LATED","LATEEN","LATELY","LATEN","LATENS","LATENT","LATER","LATEST","LATEX","LATH","LATHE","LATHED","LATHER","LATHES","LATHI","LATHIS","LATHS","LATHY","LATI","LATIGO","LATINO","LATISH","LATKE","LATKES","LATRIA","LATS","LATTE","LATTEN","LATTER","LATTES","LATTIN","LAUAN","LAUANS","LAUD","LAUDED","LAUDER","LAUDS","LAUGH","LAUGHS","LAUNCE","LAUNCH","LAURA","LAURAE","LAURAS","LAUREL","LAV","LAVA","LAVABO","LAVAGE","LAVAS","LAVE","LAVED","LAVEER","LAVER","LAVERS","LAVES","LAVING","LAVISH","LAVS","LAW","LAWED","LAWFUL","LAWINE","LAWING","LAWMAN","LAWMEN","LAWN","LAWNS","LAWNY","LAWS","LAWYER","LAX","LAXER","LAXEST","LAXITY","LAXLY","LAY","LAYED","LAYER","LAYERS","LAYING","LAYMAN","LAYMEN","LAYOFF","LAYOUT","LAYS","LAYUP","LAYUPS","LAZAR","LAZARS","LAZE","LAZED","LAZES","LAZIED","LAZIER","LAZIES","LAZILY","LAZING","LAZULI","LAZY","LEA","LEACH","LEACHY","LEAD","LEADED","LEADEN","LEADER","LEADS","LEADY","LEAF","LEAFED","LEAFS","LEAFY","LEAGUE","LEAK","LEAKED","LEAKER","LEAKS","LEAKY","LEAL","LEALLY","LEALTY","LEAN","LEANED","LEANER","LEANLY","LEANS","LEANT","LEAP","LEAPED","LEAPER","LEAPS","LEAPT","LEAR","LEARN","LEARNS","LEARNT","LEARS","LEARY","LEAS","LEASE","LEASED","LEASER","LEASES","LEASH","LEAST","LEASTS","LEAVE","LEAVED","LEAVEN","LEAVER","LEAVES","LEAVY","LEBEN","LEBENS","LECH","LECHED","LECHER","LECHES","LECHWE","LECTIN","LECTOR","LED","LEDGE","LEDGER","LEDGES","LEDGY","LEE","LEECH","LEEK","LEEKS","LEER","LEERED","LEERS","LEERY","LEES","LEET","LEETS","LEEWAY","LEFT","LEFTER","LEFTS","LEFTY","LEG","LEGACY","LEGAL","LEGALS","LEGATE","LEGATO","LEGEND","LEGER","LEGERS","LEGES","LEGGED","LEGGIN","LEGGY","LEGION","LEGIST","LEGIT","LEGITS","LEGMAN","LEGMEN","LEGONG","LEGS","LEGUME","LEHR","LEHRS","LEHUA","LEHUAS","LEI","LEIS","LEK","LEKE","LEKS","LEKU","LEKVAR","LEMAN","LEMANS","LEMMA","LEMMAS","LEMON","LEMONS","LEMONY","LEMUR","LEMURS","LEND","LENDER","LENDS","LENES","LENGTH","LENIS","LENITY","LENO","LENOS","LENS","LENSE","LENSED","LENSES","LENT","LENTEN","LENTIC","LENTIL","LENTO","LENTOS","LEONE","LEONES","LEPER","LEPERS","LEPT","LEPTA","LEPTON","LESION","LESS","LESSEE","LESSEN","LESSER","LESSON","LESSOR","LEST","LET","LETCH","LETHAL","LETHE","LETHES","LETS","LETTED","LETTER","LETUP","LETUPS","LEU","LEUCIN","LEUD","LEUDES","LEUDS","LEUKON","LEV","LEVA","LEVANT","LEVEE","LEVEED","LEVEES","LEVEL","LEVELS","LEVER","LEVERS","LEVIED","LEVIER","LEVIES","LEVIN","LEVINS","LEVITY","LEVO","LEVY","LEWD","LEWDER","LEWDLY","LEWIS","LEX","LEXEME","LEXES","LEXICA","LEXIS","LEY","LEYS","LEZ","LEZZES","LEZZIE","LEZZY","LIABLE","LIAISE","LIANA","LIANAS","LIANE","LIANES","LIANG","LIANGS","LIAR","LIARD","LIARDS","LIARS","LIB","LIBBER","LIBEL","LIBELS","LIBER","LIBERS","LIBIDO","LIBLAB","LIBRA","LIBRAE","LIBRAS","LIBRI","LIBS","LICE","LICH","LICHEE","LICHEN","LICHES","LICHI","LICHIS","LICHT","LICHTS","LICIT","LICK","LICKED","LICKER","LICKS","LICTOR","LID","LIDAR","LIDARS","LIDDED","LIDO","LIDOS","LIDS","LIE","LIED","LIEDER","LIEF","LIEFER","LIEFLY","LIEGE","LIEGES","LIEN","LIENAL","LIENS","LIER","LIERNE","LIERS","LIES","LIEU","LIEUS","LIEVE","LIEVER","LIFE","LIFER","LIFERS","LIFT","LIFTED","LIFTER","LIFTS","LIGAN","LIGAND","LIGANS","LIGASE","LIGATE","LIGER","LIGERS","LIGHT","LIGHTS","LIGNIN","LIGULA","LIGULE","LIGURE","LIKE","LIKED","LIKELY","LIKEN","LIKENS","LIKER","LIKERS","LIKES","LIKEST","LIKING","LIKUTA","LILAC","LILACS","LILIED","LILIES","LILT","LILTED","LILTS","LILY","LIMA","LIMAN","LIMANS","LIMAS","LIMB","LIMBA","LIMBAS","LIMBED","LIMBER","LIMBI","LIMBIC","LIMBO","LIMBOS","LIMBS","LIMBUS","LIMBY","LIME","LIMED","LIMEN","LIMENS","LIMES","LIMEY","LIMEYS","LIMIER","LIMINA","LIMING","LIMIT","LIMITS","LIMMER","LIMN","LIMNED","LIMNER","LIMNIC","LIMNS","LIMO","LIMOS","LIMP","LIMPA","LIMPAS","LIMPED","LIMPER","LIMPET","LIMPID","LIMPLY","LIMPS","LIMPSY","LIMULI","LIMY","LIN","LINAC","LINACS","LINAGE","LINDEN","LINDY","LINE","LINEAL","LINEAR","LINED","LINEN","LINENS","LINENY","LINER","LINERS","LINES","LINEUP","LINEY","LING","LINGA","LINGAM","LINGAS","LINGER","LINGO","LINGS","LINGUA","LINGY","LINIER","LININ","LINING","LININS","LINK","LINKED","LINKER","LINKS","LINKUP","LINKY","LINN","LINNET","LINNS","LINO","LINOS","LINS","LINSEY","LINT","LINTEL","LINTER","LINTOL","LINTS","LINTY","LINUM","LINUMS","LINY","LION","LIONS","LIP","LIPASE","LIPID","LIPIDE","LIPIDS","LIPIN","LIPINS","LIPOID","LIPOMA","LIPPED","LIPPEN","LIPPER","LIPPY","LIPS","LIQUID","LIQUOR","LIRA","LIRAS","LIRE","LIRI","LIROT","LIROTH","LIS","LISLE","LISLES","LISP","LISPED","LISPER","LISPS","LISSOM","LIST","LISTED","LISTEE","LISTEL","LISTEN","LISTER","LISTS","LIT","LITAI","LITANY","LITAS","LITCHI","LITE","LITER","LITERS","LITHE","LITHER","LITHIA","LITHIC","LITHO","LITHOS","LITMUS","LITRE","LITRES","LITS","LITTEN","LITTER","LITTLE","LITU","LIVE","LIVED","LIVELY","LIVEN","LIVENS","LIVER","LIVERS","LIVERY","LIVES","LIVEST","LIVID","LIVIER","LIVING","LIVRE","LIVRES","LIVYER","LIZARD","LLAMA","LLAMAS","LLANO","LLANOS","LOACH","LOAD","LOADED","LOADER","LOADS","LOAF","LOAFED","LOAFER","LOAFS","LOAM","LOAMED","LOAMS","LOAMY","LOAN","LOANED","LOANER","LOANS","LOATH","LOATHE","LOAVES","LOB","LOBAR","LOBATE","LOBBED","LOBBER","LOBBY","LOBE","LOBED","LOBES","LOBO","LOBOS","LOBS","LOBULE","LOCA","LOCAL","LOCALE","LOCALS","LOCATE","LOCH","LOCHAN","LOCHIA","LOCHS","LOCI","LOCK","LOCKED","LOCKER","LOCKET","LOCKS","LOCKUP","LOCO","LOCOED","LOCOES","LOCOS","LOCULE","LOCULI","LOCUM","LOCUMS","LOCUS","LOCUST","LODE","LODEN","LODENS","LODES","LODGE","LODGED","LODGER","LODGES","LOESS","LOFT","LOFTED","LOFTER","LOFTS","LOFTY","LOG","LOGAN","LOGANS","LOGE","LOGES","LOGGED","LOGGER","LOGGIA","LOGGIE","LOGGY","LOGIA","LOGIC","LOGICS","LOGIER","LOGILY","LOGION","LOGJAM","LOGO","LOGOI","LOGOS","LOGS","LOGWAY","LOGY","LOIN","LOINS","LOITER","LOLL","LOLLED","LOLLER","LOLLOP","LOLLS","LOLLY","LOMEIN","LOMENT","LONE","LONELY","LONER","LONERS","LONG","LONGAN","LONGE","LONGED","LONGER","LONGES","LONGLY","LONGS","LOO","LOOBY","LOOED","LOOEY","LOOEYS","LOOF","LOOFA","LOOFAH","LOOFAS","LOOFS","LOOIE","LOOIES","LOOING","LOOK","LOOKED","LOOKER","LOOKS","LOOKUP","LOOM","LOOMED","LOOMS","LOON","LOONEY","LOONS","LOONY","LOOP","LOOPED","LOOPER","LOOPS","LOOPY","LOOS","LOOSE","LOOSED","LOOSEN","LOOSER","LOOSES","LOOT","LOOTED","LOOTER","LOOTS","LOP","LOPE","LOPED","LOPER","LOPERS","LOPES","LOPING","LOPPED","LOPPER","LOPPY","LOPS","LOQUAT","LORAL","LORAN","LORANS","LORD","LORDED","LORDLY","LORDS","LORE","LOREAL","LORES","LORICA","LORIES","LORIS","LORN","LORRY","LORY","LOSE","LOSEL","LOSELS","LOSER","LOSERS","LOSES","LOSING","LOSS","LOSSES","LOSSY","LOST","LOT","LOTA","LOTAH","LOTAHS","LOTAS","LOTH","LOTI","LOTIC","LOTION","LOTOS","LOTS","LOTTE","LOTTED","LOTTES","LOTTO","LOTTOS","LOTUS","LOUCHE","LOUD","LOUDEN","LOUDER","LOUDLY","LOUGH","LOUGHS","LOUIE","LOUIES","LOUIS","LOUNGE","LOUNGY","LOUP","LOUPE","LOUPED","LOUPEN","LOUPES","LOUPS","LOUR","LOURED","LOURS","LOURY","LOUSE","LOUSED","LOUSES","LOUSY","LOUT","LOUTED","LOUTS","LOUVER","LOUVRE","LOVAGE","LOVAT","LOVATS","LOVE","LOVED","LOVELY","LOVER","LOVERS","LOVES","LOVING","LOW","LOWBOY","LOWE","LOWED","LOWER","LOWERS","LOWERY","LOWES","LOWEST","LOWING","LOWISH","LOWLY","LOWN","LOWS","LOWSE","LOX","LOXED","LOXES","LOXING","LOYAL","LUAU","LUAUS","LUBBER","LUBE","LUBES","LUBRIC","LUCE","LUCENT","LUCERN","LUCES","LUCID","LUCK","LUCKED","LUCKIE","LUCKS","LUCKY","LUCRE","LUCRES","LUDE","LUDES","LUDIC","LUES","LUETIC","LUFF","LUFFA","LUFFAS","LUFFED","LUFFS","LUG","LUGE","LUGED","LUGER","LUGERS","LUGES","LUGGED","LUGGER","LUGGIE","LUGS","LULL","LULLED","LULLS","LULU","LULUS","LUM","LUMBAR","LUMBER","LUMEN","LUMENS","LUMINA","LUMMOX","LUMP","LUMPED","LUMPEN","LUMPER","LUMPS","LUMPY","LUMS","LUNA","LUNACY","LUNAR","LUNARS","LUNAS","LUNATE","LUNCH","LUNE","LUNES","LUNET","LUNETS","LUNG","LUNGAN","LUNGE","LUNGED","LUNGEE","LUNGER","LUNGES","LUNGI","LUNGIS","LUNGS","LUNGYI","LUNIER","LUNIES","LUNK","LUNKER","LUNKS","LUNT","LUNTED","LUNTS","LUNULA","LUNULE","LUNY","LUPIN","LUPINE","LUPINS","LUPOUS","LUPUS","LURCH","LURDAN","LURE","LURED","LURER","LURERS","LURES","LURID","LURING","LURK","LURKED","LURKER","LURKS","LUSH","LUSHED","LUSHER","LUSHES","LUSHLY","LUST","LUSTED","LUSTER","LUSTRA","LUSTRE","LUSTS","LUSTY","LUSUS","LUTE","LUTEA","LUTEAL","LUTED","LUTEIN","LUTES","LUTEUM","LUTING","LUTIST","LUTZ","LUTZES","LUV","LUVS","LUX","LUXATE","LUXE","LUXES","LUXURY","LWEI","LWEIS","LYARD","LYART","LYASE","LYASES","LYCEA","LYCEE","LYCEES","LYCEUM","LYCHEE","LYE","LYES","LYING","LYINGS","LYMPH","LYMPHS","LYNCH","LYNX","LYNXES","LYRATE","LYRE","LYRES","LYRIC","LYRICS","LYRISM","LYRIST","LYSATE","LYSE","LYSED","LYSES","LYSIN","LYSINE","LYSING","LYSINS","LYSIS","LYSSA","LYSSAS","LYTIC","LYTTA","LYTTAE","LYTTAS","MAAR","MAARS","MABE","MABES","MAC","MACACO","MACAW","MACAWS","MACE","MACED","MACER","MACERS","MACES","MACH","MACHE","MACHES","MACHO","MACHOS","MACHS","MACING","MACK","MACKLE","MACKS","MACLE","MACLED","MACLES","MACON","MACONS","MACRO","MACRON","MACROS","MACS","MACULA","MACULE","MAD","MADAM","MADAME","MADAMS","MADCAP","MADDED","MADDEN","MADDER","MADE","MADLY","MADMAN","MADMEN","MADRAS","MADRE","MADRES","MADS","MADURO","MAE","MAENAD","MAES","MAFFIA","MAFIA","MAFIAS","MAFIC","MAFTIR","MAG","MAGE","MAGES","MAGGOT","MAGI","MAGIAN","MAGIC","MAGICS","MAGILP","MAGLEV","MAGMA","MAGMAS","MAGNET","MAGNUM","MAGOT","MAGOTS","MAGPIE","MAGS","MAGUEY","MAGUS","MAHOE","MAHOES","MAHOUT","MAHZOR","MAID","MAIDEN","MAIDS","MAIGRE","MAIHEM","MAIL","MAILE","MAILED","MAILER","MAILES","MAILL","MAILLS","MAILS","MAIM","MAIMED","MAIMER","MAIMS","MAIN","MAINLY","MAINS","MAIR","MAIRS","MAIST","MAISTS","MAIZE","MAIZES","MAJOR","MAJORS","MAKAR","MAKARS","MAKE","MAKER","MAKERS","MAKES","MAKEUP","MAKING","MAKO","MAKOS","MAKUTA","MALADY","MALAR","MALARS","MALATE","MALE","MALES","MALFED","MALGRE","MALIC","MALICE","MALIGN","MALINE","MALKIN","MALL","MALLED","MALLEE","MALLEI","MALLET","MALLOW","MALLS","MALM","MALMS","MALMY","MALOTI","MALT","MALTED","MALTHA","MALTOL","MALTS","MALTY","MAMA","MAMAS","MAMBA","MAMBAS","MAMBO","MAMBOS","MAMEY","MAMEYS","MAMIE","MAMIES","MAMLUK","MAMMA","MAMMAE","MAMMAL","MAMMAS","MAMMEE","MAMMER","MAMMET","MAMMEY","MAMMIE","MAMMON","MAMMY","MAN","MANA","MANAGE","MANANA","MANAS","MANCHE","MANE","MANED","MANEGE","MANES","MANFUL","MANGE","MANGEL","MANGER","MANGES","MANGEY","MANGLE","MANGO","MANGOS","MANGY","MANIA","MANIAC","MANIAS","MANIC","MANICS","MANILA","MANIOC","MANITO","MANITU","MANLY","MANNA","MANNAN","MANNAS","MANNED","MANNER","MANO","MANOR","MANORS","MANOS","MANQUE","MANS","MANSE","MANSES","MANTA","MANTAS","MANTEL","MANTES","MANTIC","MANTID","MANTIS","MANTLE","MANTRA","MANTUA","MANUAL","MANURE","MANUS","MANY","MAP","MAPLE","MAPLES","MAPPED","MAPPER","MAPS","MAQUI","MAQUIS","MAR","MARACA","MARAUD","MARBLE","MARBLY","MARC","MARCEL","MARCH","MARCS","MARE","MARES","MARGAY","MARGE","MARGES","MARGIN","MARIA","MARINA","MARINE","MARISH","MARK","MARKED","MARKER","MARKET","MARKKA","MARKS","MARKUP","MARL","MARLED","MARLIN","MARLS","MARLY","MARMOT","MAROON","MARQUE","MARRAM","MARRED","MARRER","MARRON","MARROW","MARRY","MARS","MARSE","MARSES","MARSH","MARSHY","MART","MARTED","MARTEN","MARTIN","MARTS","MARTYR","MARVEL","MARVY","MAS","MASCON","MASCOT","MASER","MASERS","MASH","MASHED","MASHER","MASHES","MASHIE","MASHY","MASJID","MASK","MASKED","MASKEG","MASKER","MASKS","MASON","MASONS","MASQUE","MASS","MASSA","MASSAS","MASSE","MASSED","MASSES","MASSIF","MASSY","MAST","MASTED","MASTER","MASTIC","MASTIX","MASTS","MAT","MATCH","MATE","MATED","MATER","MATERS","MATES","MATEY","MATEYS","MATH","MATHS","MATIN","MATING","MATINS","MATRES","MATRIX","MATRON","MATS","MATSAH","MATT","MATTE","MATTED","MATTER","MATTES","MATTIN","MATTS","MATURE","MATZA","MATZAH","MATZAS","MATZO","MATZOH","MATZOS","MATZOT","MAUD","MAUDS","MAUGER","MAUGRE","MAUL","MAULED","MAULER","MAULS","MAUMET","MAUN","MAUND","MAUNDS","MAUNDY","MAUT","MAUTS","MAUVE","MAUVES","MAVEN","MAVENS","MAVIE","MAVIES","MAVIN","MAVINS","MAVIS","MAW","MAWED","MAWING","MAWN","MAWS","MAX","MAXES","MAXI","MAXIM","MAXIMA","MAXIMS","MAXIS","MAXIXE","MAY","MAYA","MAYAN","MAYAS","MAYBE","MAYBES","MAYDAY","MAYED","MAYEST","MAYFLY","MAYHAP","MAYHEM","MAYING","MAYO","MAYOR","MAYORS","MAYOS","MAYPOP","MAYS","MAYST","MAYVIN","MAZARD","MAZE","MAZED","MAZER","MAZERS","MAZES","MAZIER","MAZILY","MAZING","MAZUMA","MAZY","MBIRA","MBIRAS","MEAD","MEADOW","MEADS","MEAGER","MEAGRE","MEAL","MEALIE","MEALS","MEALY","MEAN","MEANER","MEANIE","MEANLY","MEANS","MEANT","MEANY","MEASLE","MEASLY","MEAT","MEATAL","MEATED","MEATS","MEATUS","MEATY","MECCA","MECCAS","MED","MEDAKA","MEDAL","MEDALS","MEDDLE","MEDFLY","MEDIA","MEDIAD","MEDIAE","MEDIAL","MEDIAN","MEDIAS","MEDIC","MEDICK","MEDICO","MEDICS","MEDII","MEDINA","MEDIUM","MEDIUS","MEDLAR","MEDLEY","MEDUSA","MEED","MEEDS","MEEK","MEEKER","MEEKLY","MEET","MEETER","MEETLY","MEETS","MEGASS","MEGILP","MEGOHM","MEGRIM","MEIKLE","MEINIE","MEINY","MEL","MELD","MELDED","MELDER","MELDS","MELEE","MELEES","MELIC","MELL","MELLED","MELLOW","MELLS","MELODY","MELOID","MELON","MELONS","MELS","MELT","MELTED","MELTER","MELTON","MELTS","MEM","MEMBER","MEMO","MEMOIR","MEMORY","MEMOS","MEMS","MEN","MENACE","MENAD","MENADS","MENAGE","MEND","MENDED","MENDER","MENDS","MENHIR","MENIAL","MENINX","MENO","MENSA","MENSAE","MENSAL","MENSAS","MENSCH","MENSE","MENSED","MENSES","MENTA","MENTAL","MENTOR","MENTUM","MENU","MENUS","MEOU","MEOUED","MEOUS","MEOW","MEOWED","MEOWS","MERCER","MERCY","MERDE","MERDES","MERE","MERELY","MERER","MERES","MEREST","MERGE","MERGED","MERGER","MERGES","MERINO","MERIT","MERITS","MERK","MERKS","MERL","MERLE","MERLES","MERLIN","MERLON","MERLOT","MERLS","MERMAN","MERMEN","MERRY","MESA","MESAS","MESCAL","MESH","MESHED","MESHES","MESHY","MESIAL","MESIAN","MESIC","MESNE","MESNES","MESON","MESONS","MESS","MESSAN","MESSED","MESSES","MESSY","MESTEE","MET","META","METAGE","METAL","METALS","METATE","METE","METED","METEOR","METEPA","METER","METERS","METES","METH","METHOD","METHS","METHYL","METIER","METING","METIS","METOPE","METRE","METRED","METRES","METRIC","METRO","METROS","METTLE","METUMP","MEW","MEWED","MEWING","MEWL","MEWLED","MEWLER","MEWLS","MEWS","MEZCAL","MEZE","MEZES","MEZUZA","MEZZO","MEZZOS","MHO","MHOS","MIAOU","MIAOUS","MIAOW","MIAOWS","MIASM","MIASMA","MIASMS","MIAUL","MIAULS","MIB","MIBS","MICA","MICAS","MICE","MICELL","MICHE","MICHED","MICHES","MICK","MICKEY","MICKLE","MICKS","MICRA","MICRO","MICRON","MICROS","MID","MIDAIR","MIDDAY","MIDDEN","MIDDLE","MIDDY","MIDGE","MIDGES","MIDGET","MIDGUT","MIDI","MIDIS","MIDLEG","MIDRIB","MIDS","MIDST","MIDSTS","MIDWAY","MIEN","MIENS","MIFF","MIFFED","MIFFS","MIFFY","MIG","MIGG","MIGGLE","MIGGS","MIGHT","MIGHTS","MIGHTY","MIGNON","MIGS","MIHRAB","MIKADO","MIKE","MIKED","MIKES","MIKING","MIKRA","MIKRON","MIKVAH","MIKVEH","MIL","MILADI","MILADY","MILAGE","MILCH","MILD","MILDEN","MILDER","MILDEW","MILDLY","MILE","MILER","MILERS","MILES","MILIA","MILIEU","MILIUM","MILK","MILKED","MILKER","MILKS","MILKY","MILL","MILLE","MILLED","MILLER","MILLES","MILLET","MILLS","MILNEB","MILO","MILORD","MILOS","MILPA","MILPAS","MILS","MILT","MILTED","MILTER","MILTS","MILTY","MIM","MIMBAR","MIME","MIMED","MIMEO","MIMEOS","MIMER","MIMERS","MIMES","MIMIC","MIMICS","MIMING","MIMOSA","MINA","MINAE","MINAS","MINCE","MINCED","MINCER","MINCES","MINCY","MIND","MINDED","MINDER","MINDS","MINE","MINED","MINER","MINERS","MINES","MINGLE","MINGY","MINI","MINIFY","MINIM","MINIMA","MINIMS","MINING","MINION","MINIS","MINISH","MINIUM","MINK","MINKE","MINKES","MINKS","MINNOW","MINNY","MINOR","MINORS","MINT","MINTED","MINTER","MINTS","MINTY","MINUET","MINUS","MINUTE","MINX","MINXES","MINYAN","MIOSES","MIOSIS","MIOTIC","MIR","MIRAGE","MIRE","MIRED","MIRES","MIREX","MIRI","MIRIER","MIRING","MIRK","MIRKER","MIRKS","MIRKY","MIRROR","MIRS","MIRTH","MIRTHS","MIRY","MIRZA","MIRZAS","MIS","MISACT","MISADD","MISAIM","MISATE","MISCUE","MISCUT","MISDID","MISDO","MISE","MISEAT","MISER","MISERS","MISERY","MISES","MISFIT","MISHAP","MISHIT","MISKAL","MISLAY","MISLED","MISLIE","MISLIT","MISMET","MISO","MISOS","MISPEN","MISS","MISSAL","MISSAY","MISSED","MISSEL","MISSES","MISSET","MISSIS","MISSUS","MISSY","MIST","MISTED","MISTER","MISTS","MISTY","MISUSE","MITE","MITER","MITERS","MITES","MITHER","MITIER","MITIS","MITRAL","MITRE","MITRED","MITRES","MITT","MITTEN","MITTS","MITY","MIX","MIXED","MIXER","MIXERS","MIXES","MIXING","MIXT","MIXUP","MIXUPS","MIZEN","MIZENS","MIZZEN","MIZZLE","MIZZLY","MOA","MOAN","MOANED","MOANER","MOANS","MOAS","MOAT","MOATED","MOATS","MOB","MOBBED","MOBBER","MOBCAP","MOBILE","MOBLED","MOBS","MOC","MOCHA","MOCHAS","MOCK","MOCKED","MOCKER","MOCKS","MOCKUP","MOCS","MOD","MODAL","MODE","MODEL","MODELS","MODEM","MODEMS","MODERN","MODES","MODEST","MODI","MODICA","MODIFY","MODISH","MODS","MODULE","MODULI","MODULO","MODUS","MOG","MOGGED","MOGGIE","MOGGY","MOGS","MOGUL","MOGULS","MOHAIR","MOHEL","MOHELS","MOHUR","MOHURS","MOIETY","MOIL","MOILED","MOILER","MOILS","MOIRA","MOIRAI","MOIRE","MOIRES","MOIST","MOJO","MOJOES","MOJOS","MOKE","MOKES","MOL","MOLA","MOLAL","MOLAR","MOLARS","MOLAS","MOLD","MOLDED","MOLDER","MOLDS","MOLDY","MOLE","MOLES","MOLEST","MOLIES","MOLINE","MOLL","MOLLAH","MOLLIE","MOLLS","MOLLY","MOLOCH","MOLS","MOLT","MOLTED","MOLTEN","MOLTER","MOLTO","MOLTS","MOLY","MOM","MOME","MOMENT","MOMES","MOMI","MOMISM","MOMMA","MOMMAS","MOMMY","MOMS","MOMSER","MOMUS","MOMZER","MON","MONAD","MONADS","MONAS","MONDE","MONDES","MONDO","MONDOS","MONEY","MONEYS","MONGER","MONGO","MONGOE","MONGOL","MONGOS","MONGST","MONIE","MONIED","MONIES","MONISH","MONISM","MONIST","MONK","MONKEY","MONKS","MONO","MONODY","MONOS","MONS","MONTE","MONTES","MONTH","MONTHS","MONY","MOO","MOOCH","MOOD","MOODS","MOODY","MOOED","MOOING","MOOL","MOOLA","MOOLAH","MOOLAS","MOOLEY","MOOLS","MOON","MOONED","MOONS","MOONY","MOOR","MOORED","MOORS","MOORY","MOOS","MOOSE","MOOT","MOOTED","MOOTER","MOOTS","MOP","MOPE","MOPED","MOPEDS","MOPER","MOPERS","MOPERY","MOPES","MOPEY","MOPIER","MOPING","MOPISH","MOPOKE","MOPPED","MOPPER","MOPPET","MOPS","MOPY","MOR","MORA","MORAE","MORAL","MORALE","MORALS","MORAS","MORASS","MORAY","MORAYS","MORBID","MORE","MOREEN","MOREL","MORELS","MORES","MORGAN","MORGEN","MORGUE","MORION","MORN","MORNS","MORON","MORONS","MOROSE","MORPH","MORPHO","MORPHS","MORRIS","MORRO","MORROS","MORROW","MORS","MORSE","MORSEL","MORT","MORTAL","MORTAR","MORTS","MORULA","MOS","MOSAIC","MOSEY","MOSEYS","MOSHAV","MOSK","MOSKS","MOSQUE","MOSS","MOSSED","MOSSER","MOSSES","MOSSO","MOSSY","MOST","MOSTE","MOSTLY","MOSTS","MOT","MOTE","MOTEL","MOTELS","MOTES","MOTET","MOTETS","MOTEY","MOTH","MOTHER","MOTHS","MOTHY","MOTIF","MOTIFS","MOTILE","MOTION","MOTIVE","MOTLEY","MOTMOT","MOTOR","MOTORS","MOTS","MOTT","MOTTE","MOTTES","MOTTLE","MOTTO","MOTTOS","MOTTS","MOUCH","MOUE","MOUES","MOUJIK","MOULD","MOULDS","MOULDY","MOULIN","MOULT","MOULTS","MOUND","MOUNDS","MOUNT","MOUNTS","MOURN","MOURNS","MOUSE","MOUSED","MOUSER","MOUSES","MOUSEY","MOUSSE","MOUSY","MOUTH","MOUTHS","MOUTHY","MOUTON","MOVE","MOVED","MOVER","MOVERS","MOVES","MOVIE","MOVIES","MOVING","MOW","MOWED","MOWER","MOWERS","MOWING","MOWN","MOWS","MOXA","MOXAS","MOXIE","MOXIES","MOZO","MOZOS","MUCH","MUCHES","MUCHLY","MUCID","MUCIN","MUCINS","MUCK","MUCKED","MUCKER","MUCKLE","MUCKS","MUCKY","MUCLUC","MUCOID","MUCOR","MUCORS","MUCOSA","MUCOSE","MUCOUS","MUCRO","MUCUS","MUD","MUDCAP","MUDCAT","MUDDED","MUDDER","MUDDLE","MUDDLY","MUDDY","MUDRA","MUDRAS","MUDS","MUESLI","MUFF","MUFFED","MUFFIN","MUFFLE","MUFFS","MUFTI","MUFTIS","MUG","MUGFUL","MUGG","MUGGAR","MUGGED","MUGGEE","MUGGER","MUGGS","MUGGUR","MUGGY","MUGS","MUHLY","MUJIK","MUJIKS","MUKLUK","MUKTUK","MULCH","MULCT","MULCTS","MULE","MULED","MULES","MULETA","MULEY","MULEYS","MULING","MULISH","MULL","MULLA","MULLAH","MULLAS","MULLED","MULLEN","MULLER","MULLET","MULLEY","MULLS","MUM","MUMBLE","MUMBLY","MUMM","MUMMED","MUMMER","MUMMS","MUMMY","MUMP","MUMPED","MUMPER","MUMPS","MUMS","MUMU","MUMUS","MUN","MUNCH","MUNGO","MUNGOS","MUNI","MUNIS","MUNS","MUNTIN","MUON","MUONIC","MUONS","MURA","MURAL","MURALS","MURAS","MURDER","MURE","MURED","MUREIN","MURES","MUREX","MURID","MURIDS","MURINE","MURING","MURK","MURKER","MURKLY","MURKS","MURKY","MURMUR","MURPHY","MURR","MURRA","MURRAS","MURRE","MURRES","MURREY","MURRHA","MURRS","MURRY","MUS","MUSCA","MUSCAE","MUSCAT","MUSCID","MUSCLE","MUSCLY","MUSE","MUSED","MUSER","MUSERS","MUSES","MUSEUM","MUSH","MUSHED","MUSHER","MUSHES","MUSHY","MUSIC","MUSICS","MUSING","MUSJID","MUSK","MUSKEG","MUSKET","MUSKIE","MUSKIT","MUSKS","MUSKY","MUSLIN","MUSS","MUSSED","MUSSEL","MUSSES","MUSSY","MUST","MUSTED","MUSTEE","MUSTER","MUSTH","MUSTHS","MUSTS","MUSTY","MUT","MUTANT","MUTASE","MUTATE","MUTCH","MUTE","MUTED","MUTELY","MUTER","MUTES","MUTEST","MUTINE","MUTING","MUTINY","MUTISM","MUTON","MUTONS","MUTS","MUTT","MUTTER","MUTTON","MUTTS","MUTUAL","MUTUEL","MUTULE","MUUMUU","MUZHIK","MUZJIK","MUZZLE","MUZZY","MYASES","MYASIS","MYCELE","MYELIN","MYNA","MYNAH","MYNAHS","MYNAS","MYOID","MYOMA","MYOMAS","MYOPE","MYOPES","MYOPIA","MYOPIC","MYOPY","MYOSES","MYOSIN","MYOSIS","MYOTIC","MYRIAD","MYRICA","MYRRH","MYRRHS","MYRTLE","MYSELF","MYSID","MYSIDS","MYSOST","MYSTIC","MYTH","MYTHIC","MYTHOI","MYTHOS","MYTHS","MYTHY","MYXOID","MYXOMA","NAAN","NAANS","NAB","NABBED","NABBER","NABE","NABES","NABIS","NABOB","NABOBS","NABS","NACHAS","NACHES","NACHO","NACHOS","NACRE","NACRED","NACRES","NADA","NADAS","NADIR","NADIRS","NAE","NAEVI","NAEVUS","NAG","NAGANA","NAGGED","NAGGER","NAGGY","NAGS","NAH","NAIAD","NAIADS","NAIF","NAIFS","NAIL","NAILED","NAILER","NAILS","NAIRA","NAIVE","NAIVER","NAIVES","NAKED","NALED","NALEDS","NAM","NAME","NAMED","NAMELY","NAMER","NAMERS","NAMES","NAMING","NAN","NANA","NANAS","NANCE","NANCES","NANCY","NANDIN","NANISM","NANKIN","NANNIE","NANNY","NANS","NAOI","NAOS","NAP","NAPALM","NAPE","NAPERY","NAPES","NAPKIN","NAPPE","NAPPED","NAPPER","NAPPES","NAPPIE","NAPPY","NAPS","NARC","NARCO","NARCOS","NARCS","NARD","NARDS","NARES","NARIAL","NARIC","NARINE","NARIS","NARK","NARKED","NARKS","NARKY","NARROW","NARWAL","NARY","NASAL","NASALS","NASIAL","NASION","NASTIC","NASTY","NATAL","NATANT","NATCH","NATES","NATION","NATIVE","NATRON","NATTER","NATTY","NATURE","NAUGHT","NAUSEA","NAUTCH","NAVAID","NAVAL","NAVAR","NAVARS","NAVE","NAVEL","NAVELS","NAVES","NAVIES","NAVVY","NAVY","NAW","NAWAB","NAWABS","NAY","NAYS","NAZI","NAZIFY","NAZIS","NEAP","NEAPS","NEAR","NEARBY","NEARED","NEARER","NEARLY","NEARS","NEAT","NEATEN","NEATER","NEATH","NEATLY","NEATS","NEB","NEBS","NEBULA","NEBULE","NEBULY","NECK","NECKED","NECKER","NECKS","NECTAR","NEE","NEED","NEEDED","NEEDER","NEEDLE","NEEDS","NEEDY","NEEM","NEEMS","NEEP","NEEPS","NEGATE","NEGUS","NEIF","NEIFS","NEIGH","NEIGHS","NEIST","NEKTON","NELLIE","NELLY","NELSON","NEMA","NEMAS","NENE","NEON","NEONED","NEONS","NEPHEW","NERD","NERDS","NERDY","NEREID","NEREIS","NEROL","NEROLI","NEROLS","NERTS","NERTZ","NERVE","NERVED","NERVES","NERVY","NESS","NESSES","NEST","NESTED","NESTER","NESTLE","NESTOR","NESTS","NET","NETHER","NETOP","NETOPS","NETS","NETT","NETTED","NETTER","NETTLE","NETTLY","NETTS","NETTY","NEUK","NEUKS","NEUM","NEUME","NEUMES","NEUMIC","NEUMS","NEURAL","NEURON","NEUTER","NEVE","NEVER","NEVES","NEVI","NEVOID","NEVUS","NEW","NEWEL","NEWELS","NEWER","NEWEST","NEWIE","NEWIES","NEWISH","NEWLY","NEWS","NEWSIE","NEWSY","NEWT","NEWTON","NEWTS","NEXT","NEXUS","NGWEE","NIACIN","NIB","NIBBED","NIBBLE","NIBS","NICAD","NICADS","NICE","NICELY","NICER","NICEST","NICETY","NICHE","NICHED","NICHES","NICK","NICKED","NICKEL","NICKER","NICKLE","NICKS","NICOL","NICOLS","NIDAL","NIDE","NIDED","NIDES","NIDGET","NIDI","NIDIFY","NIDING","NIDUS","NIECE","NIECES","NIELLI","NIELLO","NIEVE","NIEVES","NIFFER","NIFTY","NIGGER","NIGGLE","NIGH","NIGHED","NIGHER","NIGHS","NIGHT","NIGHTS","NIGHTY","NIHIL","NIHILS","NIL","NILGAI","NILGAU","NILL","NILLED","NILLS","NILS","NIM","NIMBI","NIMBLE","NIMBLY","NIMBUS","NIMMED","NIMROD","NIMS","NINE","NINES","NINETY","NINJA","NINJAS","NINNY","NINON","NINONS","NINTH","NINTHS","NIOBIC","NIP","NIPA","NIPAS","NIPPED","NIPPER","NIPPLE","NIPPY","NIPS","NISEI","NISEIS","NISI","NISUS","NIT","NITE","NITER","NITERS","NITERY","NITES","NITID","NITON","NITONS","NITRE","NITRES","NITRIC","NITRID","NITRIL","NITRO","NITROS","NITS","NITTY","NITWIT","NIVAL","NIX","NIXE","NIXED","NIXES","NIXIE","NIXIES","NIXING","NIXY","NIZAM","NIZAMS","NOB","NOBBLE","NOBBY","NOBLE","NOBLER","NOBLES","NOBLY","NOBODY","NOBS","NOCENT","NOCK","NOCKED","NOCKS","NOD","NODAL","NODDED","NODDER","NODDLE","NODDY","NODE","NODES","NODI","NODOSE","NODOUS","NODS","NODULE","NODUS","NOEL","NOELS","NOES","NOESIS","NOETIC","NOG","NOGG","NOGGED","NOGGIN","NOGGS","NOGS","NOH","NOHOW","NOIL","NOILS","NOILY","NOIR","NOIRS","NOISE","NOISED","NOISES","NOISY","NOLO","NOLOS","NOM","NOMA","NOMAD","NOMADS","NOMAS","NOME","NOMEN","NOMES","NOMINA","NOMISM","NOMOI","NOMOS","NOMS","NONA","NONAGE","NONART","NONAS","NONCE","NONCES","NONCOM","NONE","NONEGO","NONES","NONET","NONETS","NONFAN","NONFAT","NONGAY","NONMAN","NONMEN","NONPAR","NONTAX","NONUSE","NONWAR","NONYL","NONYLS","NOO","NOODGE","NOODLE","NOOK","NOOKS","NOOKY","NOON","NOONS","NOOSE","NOOSED","NOOSER","NOOSES","NOPAL","NOPALS","NOPE","NOR","NORDIC","NORI","NORIA","NORIAS","NORIS","NORITE","NORM","NORMAL","NORMED","NORMS","NORTH","NORTHS","NOS","NOSE","NOSED","NOSES","NOSEY","NOSH","NOSHED","NOSHER","NOSHES","NOSIER","NOSILY","NOSING","NOSTOC","NOSY","NOT","NOTA","NOTAL","NOTARY","NOTATE","NOTCH","NOTE","NOTED","NOTER","NOTERS","NOTES","NOTHER","NOTICE","NOTIFY","NOTING","NOTION","NOTUM","NOUGAT","NOUGHT","NOUN","NOUNAL","NOUNS","NOUS","NOUSES","NOVA","NOVAE","NOVAS","NOVEL","NOVELS","NOVENA","NOVICE","NOW","NOWAY","NOWAYS","NOWISE","NOWS","NOWT","NOWTS","NOYADE","NOZZLE","NTH","NUANCE","NUB","NUBBIN","NUBBLE","NUBBLY","NUBBY","NUBIA","NUBIAS","NUBILE","NUBS","NUCHA","NUCHAE","NUCHAL","NUCLEI","NUDE","NUDELY","NUDER","NUDES","NUDEST","NUDGE","NUDGED","NUDGER","NUDGES","NUDIE","NUDIES","NUDISM","NUDIST","NUDITY","NUDNIK","NUDZH","NUGGET","NUKE","NUKED","NUKES","NUKING","NULL","NULLAH","NULLED","NULLS","NUMB","NUMBAT","NUMBED","NUMBER","NUMBLY","NUMBS","NUMEN","NUMINA","NUN","NUNCIO","NUNCLE","NUNS","NURD","NURDS","NURL","NURLED","NURLS","NURSE","NURSED","NURSER","NURSES","NUS","NUT","NUTANT","NUTATE","NUTLET","NUTMEG","NUTRIA","NUTS","NUTSY","NUTTED","NUTTER","NUTTY","NUZZLE","NYALA","NYALAS","NYLON","NYLONS","NYMPH","NYMPHA","NYMPHO","NYMPHS","OAF","OAFISH","OAFS","OAK","OAKEN","OAKS","OAKUM","OAKUMS","OAR","OARED","OARING","OARS","OASES","OASIS","OAST","OASTS","OAT","OATEN","OATER","OATERS","OATH","OATHS","OATS","OAVES","OBE","OBEAH","OBEAHS","OBELI","OBELIA","OBELUS","OBES","OBESE","OBEY","OBEYED","OBEYER","OBEYS","OBI","OBIA","OBIAS","OBIISM","OBIS","OBIT","OBITS","OBJECT","OBJET","OBJETS","OBLAST","OBLATE","OBLIGE","OBLONG","OBOE","OBOES","OBOIST","OBOL","OBOLE","OBOLES","OBOLI","OBOLS","OBOLUS","OBSESS","OBTAIN","OBTECT","OBTEST","OBTUND","OBTUSE","OBVERT","OCA","OCAS","OCCULT","OCCUPY","OCCUR","OCCURS","OCEAN","OCEANS","OCELLI","OCELOT","OCHER","OCHERS","OCHERY","OCHONE","OCHRE","OCHREA","OCHRED","OCHRES","OCHRY","OCKER","OCKERS","OCREA","OCREAE","OCTAD","OCTADS","OCTAL","OCTAN","OCTANE","OCTANS","OCTANT","OCTAVE","OCTAVO","OCTET","OCTETS","OCTOPI","OCTROI","OCTYL","OCTYLS","OCULAR","OCULI","OCULUS","ODD","ODDER","ODDEST","ODDISH","ODDITY","ODDLY","ODDS","ODE","ODEA","ODEON","ODEONS","ODES","ODEUM","ODEUMS","ODIC","ODIOUS","ODIST","ODISTS","ODIUM","ODIUMS","ODOR","ODORED","ODORS","ODOUR","ODOURS","ODS","ODYL","ODYLE","ODYLES","ODYLS","OEDEMA","OES","OEUVRE","OFAY","OFAYS","OFF","OFFAL","OFFALS","OFFCUT","OFFED","OFFEND","OFFER","OFFERS","OFFICE","OFFING","OFFISH","OFFKEY","OFFS","OFFSET","OFT","OFTEN","OFTER","OFTEST","OGAM","OGAMS","OGDOAD","OGEE","OGEES","OGHAM","OGHAMS","OGIVAL","OGIVE","OGIVES","OGLE","OGLED","OGLER","OGLERS","OGLES","OGLING","OGRE","OGRES","OGRESS","OGRISH","OGRISM","OHED","OHIA","OHIAS","OHING","OHM","OHMAGE","OHMIC","OHMS","OHO","OHS","OIDIA","OIDIUM","OIL","OILCAN","OILCUP","OILED","OILER","OILERS","OILIER","OILILY","OILING","OILMAN","OILMEN","OILS","OILWAY","OILY","OINK","OINKED","OINKS","OKA","OKAPI","OKAPIS","OKAS","OKAY","OKAYED","OKAYS","OKE","OKEH","OKEHS","OKES","OKRA","OKRAS","OLD","OLDEN","OLDER","OLDEST","OLDIE","OLDIES","OLDISH","OLDS","OLDY","OLE","OLEA","OLEATE","OLEFIN","OLEIC","OLEIN","OLEINE","OLEINS","OLEO","OLEOS","OLES","OLEUM","OLEUMS","OLIO","OLIOS","OLIVE","OLIVES","OLLA","OLLAS","OLOGY","OMASA","OMASUM","OMBER","OMBERS","OMBRE","OMBRES","OMEGA","OMEGAS","OMELET","OMEN","OMENED","OMENS","OMENTA","OMER","OMERS","OMIT","OMITS","OMS","ONAGER","ONAGRI","ONCE","ONE","ONERY","ONES","ONION","ONIONS","ONIONY","ONIUM","ONLY","ONRUSH","ONS","ONSET","ONSETS","ONSIDE","ONTIC","ONTO","ONUS","ONUSES","ONWARD","ONYX","ONYXES","OOCYST","OOCYTE","OODLES","OOGAMY","OOGENY","OOH","OOHED","OOHING","OOHS","OOLITE","OOLITH","OOLOGY","OOLONG","OOMIAC","OOMIAK","OOMPAH","OOMPH","OOMPHS","OOPS","OORALI","OORIE","OOT","OOTID","OOTIDS","OOTS","OOZE","OOZED","OOZES","OOZIER","OOZILY","OOZING","OOZY","OPAH","OPAHS","OPAL","OPALS","OPAQUE","OPE","OPED","OPEN","OPENED","OPENER","OPENLY","OPENS","OPERA","OPERAS","OPERON","OPES","OPHITE","OPIATE","OPINE","OPINED","OPINES","OPING","OPIOID","OPIUM","OPIUMS","OPPOSE","OPPUGN","OPS","OPSIN","OPSINS","OPT","OPTED","OPTIC","OPTICS","OPTIMA","OPTIME","OPTING","OPTION","OPTS","OPUS","OPUSES","ORA","ORACH","ORACHE","ORACLE","ORAD","ORAL","ORALLY","ORALS","ORANG","ORANGE","ORANGS","ORANGY","ORATE","ORATED","ORATES","ORATOR","ORB","ORBED","ORBIER","ORBING","ORBIT","ORBITS","ORBS","ORBY","ORC","ORCA","ORCAS","ORCEIN","ORCHID","ORCHIL","ORCHIS","ORCIN","ORCINS","ORCS","ORDAIN","ORDEAL","ORDER","ORDERS","ORDO","ORDOS","ORDURE","ORE","OREAD","OREADS","OREIDE","ORES","ORFRAY","ORGAN","ORGANA","ORGANS","ORGASM","ORGEAT","ORGIAC","ORGIC","ORGIES","ORGONE","ORGY","ORIBI","ORIBIS","ORIEL","ORIELS","ORIENT","ORIGAN","ORIGIN","ORIOLE","ORISON","ORLE","ORLES","ORLOP","ORLOPS","ORMER","ORMERS","ORMOLU","ORNATE","ORNERY","ORNIS","OROIDE","ORPHAN","ORPHIC","ORPIN","ORPINE","ORPINS","ORRA","ORRERY","ORRICE","ORRIS","ORS","ORT","ORTHO","ORTS","ORYX","ORYXES","ORZO","ORZOS","OSAR","OSCINE","OSCULA","OSCULE","OSE","OSES","OSIER","OSIERS","OSMIC","OSMICS","OSMIUM","OSMOL","OSMOLE","OSMOLS","OSMOSE","OSMOUS","OSMUND","OSPREY","OSSA","OSSEIN","OSSIA","OSSIFY","OSTEAL","OSTIA","OSTIUM","OSTLER","OSTOMY","OTALGY","OTHER","OTHERS","OTIC","OTIOSE","OTITIC","OTITIS","OTTAR","OTTARS","OTTAVA","OTTER","OTTERS","OTTO","OTTOS","OUCH","OUCHED","OUCHES","OUD","OUDS","OUGHT","OUGHTS","OUNCE","OUNCES","OUPH","OUPHE","OUPHES","OUPHS","OUR","OURANG","OURARI","OUREBI","OURIE","OURS","OUSEL","OUSELS","OUST","OUSTED","OUSTER","OUSTS","OUT","OUTACT","OUTADD","OUTAGE","OUTASK","OUTATE","OUTBEG","OUTBID","OUTBOX","OUTBUY","OUTBY","OUTBYE","OUTCRY","OUTDID","OUTDO","OUTEAT","OUTED","OUTER","OUTERS","OUTFIT","OUTFLY","OUTFOX","OUTGAS","OUTGO","OUTGUN","OUTHIT","OUTING","OUTJUT","OUTLAW","OUTLAY","OUTLET","OUTLIE","OUTMAN","OUTPUT","OUTRAN","OUTRE","OUTROW","OUTRUN","OUTS","OUTSAT","OUTSAW","OUTSEE","OUTSET","OUTSIN","OUTSIT","OUTVIE","OUTWAR","OUTWIT","OUZEL","OUZELS","OUZO","OUZOS","OVA","OVAL","OVALLY","OVALS","OVARY","OVATE","OVEN","OVENS","OVER","OVERDO","OVERED","OVERLY","OVERS","OVERT","OVIBOS","OVINE","OVINES","OVISAC","OVOID","OVOIDS","OVOLI","OVOLO","OVOLOS","OVONIC","OVULAR","OVULE","OVULES","OVUM","OWE","OWED","OWES","OWING","OWL","OWLET","OWLETS","OWLISH","OWLS","OWN","OWNED","OWNER","OWNERS","OWNING","OWNS","OWSE","OWSEN","OXALIC","OXALIS","OXBOW","OXBOWS","OXCART","OXEN","OXES","OXEYE","OXEYES","OXFORD","OXID","OXIDE","OXIDES","OXIDIC","OXIDS","OXIM","OXIME","OXIMES","OXIMS","OXLIP","OXLIPS","OXO","OXTAIL","OXTER","OXTERS","OXY","OXYGEN","OYER","OYERS","OYES","OYEZ","OYSTER","OZONE","OZONES","OZONIC","PABLUM","PAC","PACA","PACAS","PACE","PACED","PACER","PACERS","PACES","PACHA","PACHAS","PACIFY","PACING","PACK","PACKED","PACKER","PACKET","PACKLY","PACKS","PACS","PACT","PACTS","PAD","PADAUK","PADDED","PADDER","PADDLE","PADDY","PADI","PADIS","PADLE","PADLES","PADNAG","PADOUK","PADRE","PADRES","PADRI","PADS","PAEAN","PAEANS","PAELLA","PAEON","PAEONS","PAESAN","PAGAN","PAGANS","PAGE","PAGED","PAGER","PAGERS","PAGES","PAGING","PAGOD","PAGODA","PAGODS","PAH","PAID","PAIK","PAIKED","PAIKS","PAIL","PAILS","PAIN","PAINCH","PAINED","PAINS","PAINT","PAINTS","PAINTY","PAIR","PAIRED","PAIRS","PAISA","PAISAN","PAISAS","PAISE","PAJAMA","PAKEHA","PAL","PALACE","PALAIS","PALATE","PALE","PALEA","PALEAE","PALEAL","PALED","PALELY","PALER","PALES","PALEST","PALET","PALETS","PALIER","PALING","PALISH","PALL","PALLED","PALLET","PALLIA","PALLID","PALLOR","PALLS","PALLY","PALM","PALMAR","PALMED","PALMER","PALMS","PALMY","PALP","PALPAL","PALPI","PALPS","PALPUS","PALS","PALSY","PALTER","PALTRY","PALY","PAM","PAMPA","PAMPAS","PAMPER","PAMS","PAN","PANADA","PANAMA","PANDA","PANDAS","PANDER","PANDIT","PANDY","PANE","PANED","PANEL","PANELS","PANES","PANFRY","PANFUL","PANG","PANGA","PANGAS","PANGED","PANGEN","PANGS","PANIC","PANICS","PANIER","PANNE","PANNED","PANNES","PANS","PANSY","PANT","PANTED","PANTIE","PANTO","PANTOS","PANTRY","PANTS","PANTY","PANZER","PAP","PAPA","PAPACY","PAPAIN","PAPAL","PAPAS","PAPAW","PAPAWS","PAPAYA","PAPER","PAPERS","PAPERY","PAPIST","PAPPI","PAPPUS","PAPPY","PAPS","PAPULA","PAPULE","PAPYRI","PAR","PARA","PARADE","PARAMO","PARANG","PARAPH","PARAS","PARCEL","PARCH","PARD","PARDAH","PARDEE","PARDI","PARDIE","PARDON","PARDS","PARDY","PARE","PARED","PARENT","PAREO","PAREOS","PARER","PARERS","PARES","PAREU","PAREUS","PAREVE","PARGE","PARGED","PARGES","PARGET","PARGO","PARGOS","PARIAH","PARIAN","PARIES","PARING","PARIS","PARISH","PARITY","PARK","PARKA","PARKAS","PARKED","PARKER","PARKS","PARLAY","PARLE","PARLED","PARLES","PARLEY","PARLOR","PARODY","PAROL","PAROLE","PAROLS","PAROUS","PARR","PARRAL","PARRED","PARREL","PARROT","PARRS","PARRY","PARS","PARSE","PARSEC","PARSED","PARSER","PARSES","PARSON","PART","PARTAN","PARTED","PARTLY","PARTON","PARTS","PARTY","PARURA","PARURE","PARVE","PARVIS","PARVO","PARVOS","PAS","PASCAL","PASE","PASEO","PASEOS","PASES","PASH","PASHA","PASHAS","PASHED","PASHES","PASS","PASSE","PASSED","PASSEE","PASSEL","PASSER","PASSES","PASSIM","PASSUS","PAST","PASTA","PASTAS","PASTE","PASTED","PASTEL","PASTER","PASTES","PASTIE","PASTIL","PASTIS","PASTOR","PASTRY","PASTS","PASTY","PAT","PATACA","PATCH","PATCHY","PATE","PATED","PATEN","PATENS","PATENT","PATER","PATERS","PATES","PATH","PATHOS","PATHS","PATIN","PATINA","PATINE","PATINS","PATIO","PATIOS","PATLY","PATOIS","PATROL","PATRON","PATS","PATSY","PATTED","PATTEE","PATTEN","PATTER","PATTIE","PATTY","PATY","PATZER","PAULIN","PAUNCH","PAUPER","PAUSAL","PAUSE","PAUSED","PAUSER","PAUSES","PAVAN","PAVANE","PAVANS","PAVE","PAVED","PAVEED","PAVER","PAVERS","PAVES","PAVID","PAVIN","PAVING","PAVINS","PAVIOR","PAVIS","PAVISE","PAW","PAWED","PAWER","PAWERS","PAWING","PAWKY","PAWL","PAWLS","PAWN","PAWNED","PAWNEE","PAWNER","PAWNOR","PAWNS","PAWPAW","PAWS","PAX","PAXES","PAXWAX","PAY","PAYDAY","PAYED","PAYEE","PAYEES","PAYER","PAYERS","PAYING","PAYNIM","PAYOFF","PAYOLA","PAYOR","PAYORS","PAYOUT","PAYS","PAZAZZ","PEA","PEACE","PEACED","PEACES","PEACH","PEACHY","PEAG","PEAGE","PEAGES","PEAGS","PEAHEN","PEAK","PEAKED","PEAKS","PEAKY","PEAL","PEALED","PEALS","PEAN","PEANS","PEANUT","PEAR","PEARL","PEARLS","PEARLY","PEARS","PEART","PEAS","PEASE","PEASEN","PEASES","PEAT","PEATS","PEATY","PEAVEY","PEAVY","PEBBLE","PEBBLY","PEC","PECAN","PECANS","PECH","PECHAN","PECHED","PECHS","PECK","PECKED","PECKER","PECKS","PECKY","PECS","PECTEN","PECTIC","PECTIN","PED","PEDAL","PEDALO","PEDALS","PEDANT","PEDATE","PEDDLE","PEDES","PEDLAR","PEDLER","PEDRO","PEDROS","PEDS","PEE","PEED","PEEING","PEEK","PEEKED","PEEKS","PEEL","PEELED","PEELER","PEELS","PEEN","PEENED","PEENS","PEEP","PEEPED","PEEPER","PEEPS","PEEPUL","PEER","PEERED","PEERIE","PEERS","PEERY","PEES","PEEVE","PEEVED","PEEVES","PEEWEE","PEEWIT","PEG","PEGBOX","PEGGED","PEGS","PEH","PEHS","PEIN","PEINED","PEINS","PEISE","PEISED","PEISES","PEKAN","PEKANS","PEKE","PEKES","PEKIN","PEKINS","PEKOE","PEKOES","PELAGE","PELE","PELES","PELF","PELFS","PELITE","PELLET","PELMET","PELON","PELOTA","PELT","PELTED","PELTER","PELTRY","PELTS","PELVES","PELVIC","PELVIS","PEN","PENAL","PENANG","PENCE","PENCEL","PENCIL","PEND","PENDED","PENDS","PENES","PENGO","PENGOS","PENIAL","PENILE","PENIS","PENMAN","PENMEN","PENNA","PENNAE","PENNE","PENNED","PENNER","PENNI","PENNIA","PENNIS","PENNON","PENNY","PENS","PENSEE","PENSIL","PENT","PENTAD","PENTYL","PENULT","PENURY","PEON","PEONES","PEONS","PEONY","PEOPLE","PEP","PEPLA","PEPLOS","PEPLUM","PEPLUS","PEPO","PEPOS","PEPPED","PEPPER","PEPPY","PEPS","PEPSIN","PEPTIC","PEPTID","PER","PERCH","PERDIE","PERDU","PERDUE","PERDUS","PERDY","PEREA","PEREIA","PEREON","PERI","PERIL","PERILS","PERIOD","PERIS","PERISH","PERK","PERKED","PERKS","PERKY","PERM","PERMED","PERMIT","PERMS","PEROXY","PERRON","PERRY","PERSE","PERSES","PERSON","PERT","PERTER","PERTLY","PERUKE","PERUSE","PES","PESADE","PESETA","PESEWA","PESKY","PESO","PESOS","PEST","PESTER","PESTLE","PESTO","PESTOS","PESTS","PESTY","PET","PETAL","PETALS","PETARD","PETER","PETERS","PETIT","PETITE","PETNAP","PETREL","PETROL","PETS","PETSAI","PETTED","PETTER","PETTI","PETTLE","PETTO","PETTY","PEW","PEWEE","PEWEES","PEWIT","PEWITS","PEWS","PEWTER","PEYOTE","PEYOTL","PFFT","PFUI","PHAGE","PHAGES","PHALLI","PHAROS","PHASE","PHASED","PHASES","PHASIC","PHASIS","PHAT","PHATIC","PHENIX","PHENOL","PHENOM","PHENYL","PHEW","PHI","PHIAL","PHIALS","PHIS","PHIZ","PHIZES","PHLEGM","PHLOEM","PHLOX","PHOBIA","PHOBIC","PHOEBE","PHON","PHONAL","PHONE","PHONED","PHONES","PHONEY","PHONIC","PHONO","PHONON","PHONOS","PHONS","PHONY","PHOOEY","PHOT","PHOTIC","PHOTO","PHOTOG","PHOTON","PHOTOS","PHOTS","PHPHT","PHRASE","PHT","PHUT","PHUTS","PHYLA","PHYLAE","PHYLAR","PHYLE","PHYLIC","PHYLLO","PHYLON","PHYLUM","PHYSED","PHYSES","PHYSIC","PHYSIS","PHYTOL","PHYTON","PIA","PIAFFE","PIAL","PIAN","PIANIC","PIANO","PIANOS","PIANS","PIAS","PIAZZA","PIAZZE","PIBAL","PIBALS","PIC","PICA","PICAL","PICARA","PICARO","PICAS","PICE","PICK","PICKAX","PICKED","PICKER","PICKET","PICKLE","PICKS","PICKUP","PICKY","PICNIC","PICOT","PICOTS","PICRIC","PICS","PICUL","PICULS","PIDDLE","PIDDLY","PIDGIN","PIE","PIECE","PIECED","PIECER","PIECES","PIED","PIEING","PIER","PIERCE","PIERS","PIES","PIETA","PIETAS","PIETY","PIFFLE","PIG","PIGEON","PIGGED","PIGGIE","PIGGIN","PIGGY","PIGLET","PIGMY","PIGNUS","PIGNUT","PIGOUT","PIGPEN","PIGS","PIGSTY","PIING","PIKA","PIKAKE","PIKAS","PIKE","PIKED","PIKER","PIKERS","PIKES","PIKI","PIKING","PIKIS","PILAF","PILAFF","PILAFS","PILAR","PILAU","PILAUS","PILAW","PILAWS","PILE","PILEA","PILED","PILEI","PILES","PILEUM","PILEUP","PILEUS","PILFER","PILI","PILING","PILIS","PILL","PILLAR","PILLED","PILLOW","PILLS","PILOSE","PILOT","PILOTS","PILOUS","PILULE","PILUS","PILY","PIMA","PIMAS","PIMP","PIMPED","PIMPLE","PIMPLY","PIMPS","PIN","PINA","PINANG","PINAS","PINATA","PINCER","PINCH","PINDER","PINE","PINEAL","PINED","PINENE","PINERY","PINES","PINETA","PINEY","PING","PINGED","PINGER","PINGO","PINGOS","PINGS","PINIER","PINING","PINION","PINITE","PINK","PINKED","PINKEN","PINKER","PINKEY","PINKIE","PINKLY","PINKO","PINKOS","PINKS","PINKY","PINNA","PINNAE","PINNAL","PINNAS","PINNED","PINNER","PINNY","PINOLE","PINON","PINONS","PINOT","PINOTS","PINS","PINT","PINTA","PINTAS","PINTLE","PINTO","PINTOS","PINTS","PINUP","PINUPS","PINY","PINYIN","PINYON","PIOLET","PION","PIONIC","PIONS","PIOUS","PIP","PIPAGE","PIPAL","PIPALS","PIPE","PIPED","PIPER","PIPERS","PIPES","PIPET","PIPETS","PIPIER","PIPING","PIPIT","PIPITS","PIPKIN","PIPPED","PIPPIN","PIPS","PIPY","PIQUE","PIQUED","PIQUES","PIQUET","PIRACY","PIRANA","PIRATE","PIRAYA","PIRN","PIRNS","PIROG","PIROGI","PIS","PISCO","PISCOS","PISH","PISHED","PISHES","PISO","PISOS","PISS","PISSED","PISSER","PISSES","PISTE","PISTES","PISTIL","PISTOL","PISTON","PIT","PITA","PITAS","PITCH","PITCHY","PITH","PITHED","PITHS","PITHY","PITIED","PITIER","PITIES","PITMAN","PITMEN","PITON","PITONS","PITS","PITSAW","PITTED","PITY","PIU","PIVOT","PIVOTS","PIX","PIXEL","PIXELS","PIXES","PIXIE","PIXIES","PIXY","PIZAZZ","PIZZA","PIZZAS","PIZZLE","PLACE","PLACED","PLACER","PLACES","PLACET","PLACID","PLACK","PLACKS","PLAGAL","PLAGE","PLAGES","PLAGUE","PLAGUY","PLAICE","PLAID","PLAIDS","PLAIN","PLAINS","PLAINT","PLAIT","PLAITS","PLAN","PLANAR","PLANCH","PLANE","PLANED","PLANER","PLANES","PLANET","PLANK","PLANKS","PLANS","PLANT","PLANTS","PLAQUE","PLASH","PLASHY","PLASM","PLASMA","PLASMS","PLAT","PLATAN","PLATE","PLATED","PLATEN","PLATER","PLATES","PLATS","PLATY","PLATYS","PLAY","PLAYA","PLAYAS","PLAYED","PLAYER","PLAYS","PLAZA","PLAZAS","PLEA","PLEACH","PLEAD","PLEADS","PLEAS","PLEASE","PLEAT","PLEATS","PLEB","PLEBE","PLEBES","PLEBS","PLED","PLEDGE","PLEIAD","PLENA","PLENCH","PLENTY","PLENUM","PLEURA","PLEW","PLEWS","PLEXAL","PLEXOR","PLEXUS","PLIANT","PLICA","PLICAE","PLICAL","PLIE","PLIED","PLIER","PLIERS","PLIES","PLIGHT","PLINK","PLINKS","PLINTH","PLISKY","PLISSE","PLOD","PLODS","PLOIDY","PLONK","PLONKS","PLOP","PLOPS","PLOT","PLOTS","PLOTTY","PLOTZ","PLOUGH","PLOVER","PLOW","PLOWED","PLOWER","PLOWS","PLOY","PLOYED","PLOYS","PLUCK","PLUCKS","PLUCKY","PLUG","PLUGS","PLUM","PLUMB","PLUMBS","PLUME","PLUMED","PLUMES","PLUMMY","PLUMP","PLUMPS","PLUMS","PLUMY","PLUNGE","PLUNK","PLUNKS","PLURAL","PLUS","PLUSES","PLUSH","PLUSHY","PLUTEI","PLUTON","PLY","PLYER","PLYERS","PLYING","PNEUMA","POACH","POACHY","POCK","POCKED","POCKET","POCKS","POCKY","POCO","POD","PODDED","PODGY","PODIA","PODITE","PODIUM","PODS","PODSOL","PODZOL","POEM","POEMS","POESY","POET","POETIC","POETRY","POETS","POGEY","POGEYS","POGIES","POGROM","POGY","POH","POI","POILU","POILUS","POIND","POINDS","POINT","POINTE","POINTS","POINTY","POIS","POISE","POISED","POISER","POISES","POISHA","POISON","POKE","POKED","POKER","POKERS","POKES","POKEY","POKEYS","POKIER","POKIES","POKILY","POKING","POKY","POL","POLAR","POLARS","POLDER","POLE","POLEAX","POLED","POLEIS","POLER","POLERS","POLES","POLEYN","POLICE","POLICY","POLING","POLIO","POLIOS","POLIS","POLISH","POLITE","POLITY","POLKA","POLKAS","POLL","POLLED","POLLEE","POLLEN","POLLER","POLLEX","POLLS","POLO","POLOS","POLS","POLY","POLYP","POLYPI","POLYPS","POLYS","POM","POMACE","POMADE","POME","POMELO","POMES","POMMEE","POMMEL","POMMIE","POMMY","POMP","POMPOM","POMPON","POMPS","POMS","PONCE","PONCED","PONCES","PONCHO","POND","PONDED","PONDER","PONDS","PONE","PONENT","PONES","PONG","PONGED","PONGEE","PONGID","PONGS","PONIED","PONIES","PONS","PONTES","PONTIL","PONTON","PONY","POOCH","POOD","POODLE","POODS","POOF","POOFS","POOFY","POOH","POOHED","POOHS","POOL","POOLED","POOLS","POON","POONS","POOP","POOPED","POOPS","POOR","POORER","POORI","POORIS","POORLY","POOVE","POOVES","POP","POPE","POPERY","POPES","POPGUN","POPISH","POPLAR","POPLIN","POPPA","POPPAS","POPPED","POPPER","POPPET","POPPLE","POPPY","POPS","POPSIE","POPSY","PORCH","PORE","PORED","PORES","PORGY","PORING","PORISM","PORK","PORKER","PORKS","PORKY","PORN","PORNO","PORNOS","PORNS","PORNY","POROSE","POROUS","PORT","PORTAL","PORTED","PORTER","PORTLY","PORTS","POSADA","POSE","POSED","POSER","POSERS","POSES","POSEUR","POSH","POSHER","POSHLY","POSIES","POSING","POSIT","POSITS","POSSE","POSSES","POSSET","POSSUM","POST","POSTAL","POSTED","POSTER","POSTIN","POSTS","POSY","POT","POTAGE","POTASH","POTATO","POTBOY","POTEEN","POTENT","POTFUL","POTHER","POTION","POTMAN","POTMEN","POTPIE","POTS","POTSIE","POTSY","POTTED","POTTER","POTTLE","POTTO","POTTOS","POTTY","POTZER","POUCH","POUCHY","POUF","POUFED","POUFF","POUFFE","POUFFS","POUFS","POULT","POULTS","POUNCE","POUND","POUNDS","POUR","POURED","POURER","POURS","POUT","POUTED","POUTER","POUTS","POUTY","POW","POWDER","POWER","POWERS","POWS","POWTER","POWWOW","POX","POXED","POXES","POXING","POYOU","POYOUS","PRAAM","PRAAMS","PRAHU","PRAHUS","PRAISE","PRAM","PRAMS","PRANCE","PRANG","PRANGS","PRANK","PRANKS","PRAO","PRAOS","PRASE","PRASES","PRAT","PRATE","PRATED","PRATER","PRATES","PRATS","PRAU","PRAUS","PRAWN","PRAWNS","PRAXES","PRAXIS","PRAY","PRAYED","PRAYER","PRAYS","PREACH","PREACT","PREAMP","PREARM","PRECIS","PRECUT","PREE","PREED","PREEN","PREENS","PREES","PREFAB","PREFER","PREFIX","PRELIM","PREMAN","PREMED","PREMEN","PREMIE","PREMIX","PREP","PREPAY","PREPPY","PREPS","PRESA","PRESE","PRESET","PRESS","PREST","PRESTO","PRESTS","PRETAX","PRETOR","PRETTY","PREVUE","PREWAR","PREX","PREXES","PREXY","PREY","PREYED","PREYER","PREYS","PREZ","PREZES","PRIAPI","PRICE","PRICED","PRICER","PRICES","PRICEY","PRICK","PRICKS","PRICKY","PRICY","PRIDE","PRIDED","PRIDES","PRIED","PRIER","PRIERS","PRIES","PRIEST","PRIG","PRIGS","PRILL","PRILLS","PRIM","PRIMA","PRIMAL","PRIMAS","PRIME","PRIMED","PRIMER","PRIMES","PRIMI","PRIMLY","PRIMO","PRIMOS","PRIMP","PRIMPS","PRIMS","PRIMUS","PRINCE","PRINK","PRINKS","PRINT","PRINTS","PRION","PRIONS","PRIOR","PRIORS","PRIORY","PRISE","PRISED","PRISES","PRISM","PRISMS","PRISON","PRISS","PRISSY","PRIVET","PRIVY","PRIZE","PRIZED","PRIZER","PRIZES","PRO","PROA","PROAS","PROBE","PROBED","PROBER","PROBES","PROBIT","PROD","PRODS","PROEM","PROEMS","PROF","PROFIT","PROFS","PROG","PROGS","PROJET","PROLAN","PROLE","PROLEG","PROLES","PROLIX","PROLOG","PROM","PROMO","PROMOS","PROMPT","PROMS","PRONE","PRONG","PRONGS","PRONTO","PROOF","PROOFS","PROP","PROPEL","PROPER","PROPS","PROPYL","PROS","PROSE","PROSED","PROSER","PROSES","PROSIT","PROSO","PROSOS","PROSS","PROST","PROSY","PROTEA","PROTEI","PROTON","PROTYL","PROUD","PROVE","PROVED","PROVEN","PROVER","PROVES","PROW","PROWAR","PROWER","PROWL","PROWLS","PROWS","PROXY","PRUDE","PRUDES","PRUNE","PRUNED","PRUNER","PRUNES","PRUNUS","PRUTA","PRUTAH","PRUTOT","PRY","PRYER","PRYERS","PRYING","PSALM","PSALMS","PSEUD","PSEUDO","PSEUDS","PSHAW","PSHAWS","PSI","PSIS","PSOAE","PSOAI","PSOAS","PSOCID","PSST","PSYCH","PSYCHE","PSYCHO","PSYCHS","PSYLLA","PSYWAR","PTERIN","PTISAN","PTOSES","PTOSIS","PTOTIC","PUB","PUBES","PUBIC","PUBIS","PUBLIC","PUBS","PUCE","PUCES","PUCK","PUCKA","PUCKER","PUCKS","PUD","PUDDLE","PUDDLY","PUDGY","PUDIC","PUDS","PUEBLO","PUFF","PUFFED","PUFFER","PUFFIN","PUFFS","PUFFY","PUG","PUGGED","PUGGRY","PUGGY","PUGH","PUGREE","PUGS","PUISNE","PUJA","PUJAH","PUJAHS","PUJAS","PUKE","PUKED","PUKES","PUKING","PUKKA","PUL","PULA","PULE","PULED","PULER","PULERS","PULES","PULI","PULIK","PULING","PULIS","PULL","PULLED","PULLER","PULLET","PULLEY","PULLS","PULLUP","PULP","PULPAL","PULPED","PULPER","PULPIT","PULPS","PULPY","PULQUE","PULS","PULSAR","PULSE","PULSED","PULSER","PULSES","PUMA","PUMAS","PUMELO","PUMICE","PUMMEL","PUMP","PUMPED","PUMPER","PUMPS","PUN","PUNA","PUNAS","PUNCH","PUNCHY","PUNDIT","PUNG","PUNGLE","PUNGS","PUNIER","PUNILY","PUNISH","PUNK","PUNKA","PUNKAH","PUNKAS","PUNKER","PUNKEY","PUNKIE","PUNKIN","PUNKS","PUNKY","PUNNED","PUNNER","PUNNET","PUNNY","PUNS","PUNT","PUNTED","PUNTER","PUNTO","PUNTOS","PUNTS","PUNTY","PUNY","PUP","PUPA","PUPAE","PUPAL","PUPAS","PUPATE","PUPIL","PUPILS","PUPPED","PUPPET","PUPPY","PUPS","PUR","PURANA","PURDA","PURDAH","PURDAS","PURE","PUREE","PUREED","PUREES","PURELY","PURER","PUREST","PURFLE","PURGE","PURGED","PURGER","PURGES","PURI","PURIFY","PURIN","PURINE","PURINS","PURIS","PURISM","PURIST","PURITY","PURL","PURLED","PURLIN","PURLS","PURPLE","PURPLY","PURR","PURRED","PURRS","PURS","PURSE","PURSED","PURSER","PURSES","PURSUE","PURSY","PURVEY","PUS","PUSES","PUSH","PUSHED","PUSHER","PUSHES","PUSHUP","PUSHY","PUSLEY","PUSS","PUSSES","PUSSLY","PUSSY","PUT","PUTLOG","PUTOFF","PUTON","PUTONS","PUTOUT","PUTRID","PUTS","PUTSCH","PUTT","PUTTED","PUTTEE","PUTTER","PUTTI","PUTTO","PUTTS","PUTTY","PUTZ","PUTZED","PUTZES","PUZZLE","PYA","PYAS","PYE","PYEMIA","PYEMIC","PYES","PYGMY","PYIC","PYIN","PYINS","PYKNIC","PYLON","PYLONS","PYLORI","PYOID","PYOSES","PYOSIS","PYRAN","PYRANS","PYRE","PYRENE","PYRES","PYRIC","PYRITE","PYROLA","PYRONE","PYROPE","PYRROL","PYTHON","PYURIA","PYX","PYXES","PYXIE","PYXIES","PYXIS","QAID","QAIDS","QANAT","QANATS","QAT","QATS","QINDAR","QINTAR","QIVIUT","QOPH","QOPHS","QUA","QUACK","QUACKS","QUAD","QUADS","QUAERE","QUAFF","QUAFFS","QUAG","QUAGGA","QUAGGY","QUAGS","QUAHOG","QUAI","QUAICH","QUAIGH","QUAIL","QUAILS","QUAINT","QUAIS","QUAKE","QUAKED","QUAKER","QUAKES","QUAKY","QUALE","QUALIA","QUALM","QUALMS","QUALMY","QUANGO","QUANT","QUANTA","QUANTS","QUARE","QUARK","QUARKS","QUARRY","QUART","QUARTE","QUARTO","QUARTS","QUARTZ","QUASAR","QUASH","QUASI","QUASS","QUATE","QUATRE","QUAVER","QUAY","QUAYS","QUEAN","QUEANS","QUEASY","QUEAZY","QUEEN","QUEENS","QUEER","QUEERS","QUELL","QUELLS","QUENCH","QUERN","QUERNS","QUERY","QUEST","QUESTS","QUEUE","QUEUED","QUEUER","QUEUES","QUEY","QUEYS","QUEZAL","QUICHE","QUICK","QUICKS","QUID","QUIDS","QUIET","QUIETS","QUIFF","QUIFFS","QUILL","QUILLS","QUILT","QUILTS","QUIN","QUINCE","QUINIC","QUININ","QUINOA","QUINOL","QUINS","QUINSY","QUINT","QUINTA","QUINTE","QUINTS","QUIP","QUIPPU","QUIPS","QUIPU","QUIPUS","QUIRE","QUIRED","QUIRES","QUIRK","QUIRKS","QUIRKY","QUIRT","QUIRTS","QUIT","QUITCH","QUITE","QUITS","QUIVER","QUIZ","QUOD","QUODS","QUOHOG","QUOIN","QUOINS","QUOIT","QUOITS","QUOKKA","QUORUM","QUOTA","QUOTAS","QUOTE","QUOTED","QUOTER","QUOTES","QUOTH","QUOTHA","QURSH","QURUSH","QWERTY","RABAT","RABATO","RABATS","RABBET","RABBI","RABBIN","RABBIS","RABBIT","RABBLE","RABIC","RABID","RABIES","RACE","RACED","RACEME","RACER","RACERS","RACES","RACHET","RACHIS","RACIAL","RACIER","RACILY","RACING","RACISM","RACIST","RACK","RACKED","RACKER","RACKET","RACKLE","RACKS","RACON","RACONS","RACOON","RACY","RAD","RADAR","RADARS","RADDED","RADDLE","RADIAL","RADIAN","RADII","RADIO","RADIOS","RADISH","RADIUM","RADIUS","RADIX","RADOME","RADON","RADONS","RADS","RADULA","RAFF","RAFFIA","RAFFLE","RAFFS","RAFT","RAFTED","RAFTER","RAFTS","RAG","RAGA","RAGAS","RAGBAG","RAGE","RAGED","RAGEE","RAGEES","RAGES","RAGGED","RAGGEE","RAGGLE","RAGGY","RAGI","RAGING","RAGIS","RAGLAN","RAGMAN","RAGMEN","RAGOUT","RAGS","RAGTAG","RAGTOP","RAH","RAIA","RAIAS","RAID","RAIDED","RAIDER","RAIDS","RAIL","RAILED","RAILER","RAILS","RAIN","RAINED","RAINS","RAINY","RAISE","RAISED","RAISER","RAISES","RAISIN","RAJ","RAJA","RAJAH","RAJAHS","RAJAS","RAJES","RAKE","RAKED","RAKEE","RAKEES","RAKER","RAKERS","RAKES","RAKI","RAKING","RAKIS","RAKISH","RALE","RALES","RALLY","RALLYE","RALPH","RALPHS","RAM","RAMATE","RAMBLE","RAMEE","RAMEES","RAMET","RAMETS","RAMI","RAMIE","RAMIES","RAMIFY","RAMJET","RAMMED","RAMMER","RAMMY","RAMOSE","RAMOUS","RAMP","RAMPED","RAMPS","RAMROD","RAMS","RAMSON","RAMTIL","RAMUS","RAN","RANCE","RANCES","RANCH","RANCHO","RANCID","RANCOR","RAND","RANDAN","RANDOM","RANDS","RANDY","RANEE","RANEES","RANG","RANGE","RANGED","RANGER","RANGES","RANGY","RANI","RANID","RANIDS","RANIS","RANK","RANKED","RANKER","RANKLE","RANKLY","RANKS","RANSOM","RANT","RANTED","RANTER","RANTS","RANULA","RAP","RAPE","RAPED","RAPER","RAPERS","RAPES","RAPHAE","RAPHE","RAPHES","RAPHIA","RAPHIS","RAPID","RAPIDS","RAPIER","RAPINE","RAPING","RAPINI","RAPIST","RAPPED","RAPPEE","RAPPEL","RAPPEN","RAPPER","RAPS","RAPT","RAPTLY","RAPTOR","RARE","RARED","RAREFY","RARELY","RARER","RARES","RAREST","RARIFY","RARING","RARITY","RAS","RASCAL","RASE","RASED","RASER","RASERS","RASES","RASH","RASHER","RASHES","RASHLY","RASING","RASP","RASPED","RASPER","RASPS","RASPY","RASSLE","RASTER","RASURE","RAT","RATAL","RATALS","RATAN","RATANS","RATANY","RATBAG","RATCH","RATE","RATED","RATEL","RATELS","RATER","RATERS","RATES","RATH","RATHE","RATHER","RATIFY","RATINE","RATING","RATIO","RATION","RATIOS","RATITE","RATLIN","RATO","RATOON","RATOS","RATS","RATTAN","RATTED","RATTEN","RATTER","RATTLE","RATTLY","RATTON","RATTY","RAUNCH","RAVAGE","RAVE","RAVED","RAVEL","RAVELS","RAVEN","RAVENS","RAVER","RAVERS","RAVES","RAVIN","RAVINE","RAVING","RAVINS","RAVISH","RAW","RAWER","RAWEST","RAWIN","RAWINS","RAWISH","RAWLY","RAWS","RAX","RAXED","RAXES","RAXING","RAY","RAYA","RAYAH","RAYAHS","RAYAS","RAYED","RAYING","RAYON","RAYONS","RAYS","RAZE","RAZED","RAZEE","RAZEED","RAZEES","RAZER","RAZERS","RAZES","RAZING","RAZOR","RAZORS","RAZZ","RAZZED","RAZZES","REACH","REACT","REACTS","READ","READD","READDS","READER","READS","READY","REAGIN","REAL","REALER","REALES","REALIA","REALLY","REALM","REALMS","REALS","REALTY","REAM","REAMED","REAMER","REAMS","REAP","REAPED","REAPER","REAPS","REAR","REARED","REARER","REARM","REARMS","REARS","REASON","REATA","REATAS","REAVE","REAVED","REAVER","REAVES","REAVOW","REB","REBAIT","REBAR","REBARS","REBATE","REBATO","REBBE","REBBES","REBEC","REBECK","REBECS","REBEL","REBELS","REBID","REBIDS","REBILL","REBIND","REBODY","REBOIL","REBOOK","REBOOT","REBOP","REBOPS","REBORE","REBORN","REBOZO","REBRED","REBS","REBUFF","REBUKE","REBURY","REBUS","REBUT","REBUTS","REBUY","REBUYS","REC","RECALL","RECANE","RECANT","RECAP","RECAPS","RECAST","RECCE","RECCES","RECEDE","RECENT","RECEPT","RECESS","RECHEW","RECIPE","RECITE","RECK","RECKED","RECKON","RECKS","RECLAD","RECOAL","RECOCK","RECODE","RECOIL","RECOIN","RECOMB","RECON","RECONS","RECOOK","RECOPY","RECORD","RECORK","RECOUP","RECS","RECTA","RECTAL","RECTI","RECTO","RECTOR","RECTOS","RECTUM","RECTUS","RECUR","RECURS","RECUSE","RECUT","RECUTS","RED","REDACT","REDAN","REDANS","REDATE","REDBAY","REDBUD","REDBUG","REDCAP","REDD","REDDED","REDDEN","REDDER","REDDLE","REDDS","REDE","REDEAR","REDED","REDEEM","REDEFY","REDENY","REDES","REDEYE","REDFIN","REDIA","REDIAE","REDIAL","REDIAS","REDID","REDING","REDIP","REDIPS","REDIPT","REDLEG","REDLY","REDO","REDOCK","REDOES","REDON","REDONE","REDONS","REDOS","REDOUT","REDOWA","REDOX","REDRAW","REDREW","REDRY","REDS","REDTOP","REDUB","REDUBS","REDUCE","REDUX","REDYE","REDYED","REDYES","REE","REEARN","REECHO","REECHY","REED","REEDED","REEDIT","REEDS","REEDY","REEF","REEFED","REEFER","REEFS","REEFY","REEK","REEKED","REEKER","REEKS","REEKY","REEL","REELED","REELER","REELS","REEMIT","REES","REEST","REESTS","REEVE","REEVED","REEVES","REF","REFACE","REFALL","REFECT","REFED","REFEED","REFEEL","REFEL","REFELL","REFELS","REFELT","REFER","REFERS","REFFED","REFILE","REFILL","REFILM","REFIND","REFINE","REFIRE","REFIT","REFITS","REFIX","REFLET","REFLEW","REFLEX","REFLOW","REFLUX","REFLY","REFOLD","REFORM","REFRY","REFS","REFT","REFUEL","REFUGE","REFUND","REFUSE","REFUTE","REG","REGAIN","REGAL","REGALE","REGARD","REGAVE","REGEAR","REGENT","REGES","REGGAE","REGILD","REGILT","REGIME","REGINA","REGION","REGIUS","REGIVE","REGLET","REGLOW","REGLUE","REGMA","REGNA","REGNAL","REGNUM","REGRET","REGREW","REGROW","REGS","REGULI","REHAB","REHABS","REHANG","REHASH","REHEAR","REHEAT","REHEEL","REHEM","REHEMS","REHIRE","REHUNG","REI","REIF","REIFS","REIFY","REIGN","REIGNS","REIN","REINED","REINK","REINKS","REINS","REIS","REIVE","REIVED","REIVER","REIVES","REJECT","REJOIN","REKEY","REKEYS","REKNIT","RELACE","RELAID","RELATE","RELAX","RELAY","RELAYS","RELEND","RELENT","RELET","RELETS","RELEVE","RELIC","RELICS","RELICT","RELIED","RELIEF","RELIER","RELIES","RELINE","RELINK","RELISH","RELIST","RELIT","RELIVE","RELOAD","RELOAN","RELOCK","RELOOK","RELUCT","RELUME","RELY","REM","REMADE","REMAIL","REMAIN","REMAKE","REMAN","REMAND","REMANS","REMAP","REMAPS","REMARK","REMATE","REMEDY","REMEET","REMELT","REMEND","REMET","REMEX","REMIND","REMINT","REMISE","REMISS","REMIT","REMITS","REMIX","REMIXT","REMOLD","REMORA","REMOTE","REMOVE","REMS","REMUDA","RENAIL","RENAL","RENAME","REND","RENDED","RENDER","RENDS","RENEGE","RENEST","RENEW","RENEWS","RENIG","RENIGS","RENIN","RENINS","RENNET","RENNIN","RENOWN","RENT","RENTAL","RENTE","RENTED","RENTER","RENTES","RENTS","RENVOI","REOIL","REOILS","REOPEN","REP","REPACK","REPAID","REPAIR","REPAND","REPARK","REPASS","REPAST","REPAVE","REPAY","REPAYS","REPEAL","REPEAT","REPEG","REPEGS","REPEL","REPELS","REPENT","REPERK","REPIN","REPINE","REPINS","REPLAN","REPLAY","REPLED","REPLOT","REPLY","REPO","REPOLL","REPORT","REPOS","REPOSE","REPOT","REPOTS","REPOUR","REPP","REPPED","REPPS","REPRO","REPROS","REPS","REPUGN","REPUMP","REPUTE","REQUIN","RERACK","RERAN","REREAD","RERIG","RERIGS","RERISE","REROLL","REROOF","REROSE","RERUN","RERUNS","RES","RESAID","RESAIL","RESALE","RESAW","RESAWN","RESAWS","RESAY","RESAYS","RESCUE","RESEAL","RESEAT","RESEAU","RESECT","RESEDA","RESEE","RESEED","RESEEK","RESEEN","RESEES","RESELL","RESEND","RESENT","RESET","RESETS","RESEW","RESEWN","RESEWS","RESH","RESHES","RESHIP","RESHOD","RESHOE","RESHOT","RESHOW","RESID","RESIDE","RESIDS","RESIFT","RESIGN","RESILE","RESIN","RESINS","RESINY","RESIST","RESITE","RESIZE","RESOAK","RESOD","RESODS","RESOLD","RESOLE","RESORB","RESORT","RESOW","RESOWN","RESOWS","RESPOT","REST","RESTED","RESTER","RESTS","RESULT","RESUME","RET","RETACK","RETAG","RETAGS","RETAIL","RETAIN","RETAKE","RETAPE","RETARD","RETAX","RETCH","RETE","RETEAM","RETEAR","RETELL","RETEM","RETEMS","RETENE","RETEST","RETIA","RETIAL","RETIE","RETIED","RETIES","RETILE","RETIME","RETINA","RETINE","RETINT","RETIRE","RETOLD","RETOOK","RETOOL","RETORE","RETORN","RETORT","RETRAL","RETRIM","RETRO","RETROS","RETRY","RETS","RETTED","RETUNE","RETURN","RETUSE","RETYPE","REUSE","REUSED","REUSES","REV","REVAMP","REVEAL","REVEL","REVELS","REVERB","REVERE","REVERS","REVERT","REVERY","REVEST","REVET","REVETS","REVIEW","REVILE","REVISE","REVIVE","REVOKE","REVOLT","REVOTE","REVS","REVUE","REVUES","REVVED","REWAKE","REWAN","REWARD","REWARM","REWASH","REWAX","REWED","REWEDS","REWELD","REWET","REWETS","REWIN","REWIND","REWINS","REWIRE","REWOKE","REWON","REWORD","REWORK","REWOVE","REWRAP","REX","REXES","REZONE","RHAPHE","RHEA","RHEAS","RHEBOK","RHESUS","RHETOR","RHEUM","RHEUMS","RHEUMY","RHINAL","RHINO","RHINOS","RHO","RHODIC","RHOMB","RHOMBI","RHOMBS","RHOS","RHUMB","RHUMBA","RHUMBS","RHUS","RHUSES","RHYME","RHYMED","RHYMER","RHYMES","RHYTA","RHYTHM","RHYTON","RIA","RIAL","RIALS","RIALTO","RIANT","RIAS","RIATA","RIATAS","RIB","RIBALD","RIBAND","RIBBED","RIBBER","RIBBON","RIBBY","RIBES","RIBIER","RIBLET","RIBOSE","RIBS","RICE","RICED","RICER","RICERS","RICES","RICH","RICHEN","RICHER","RICHES","RICHLY","RICIN","RICING","RICINS","RICK","RICKED","RICKEY","RICKS","RICRAC","RICTAL","RICTUS","RID","RIDDED","RIDDEN","RIDDER","RIDDLE","RIDE","RIDENT","RIDER","RIDERS","RIDES","RIDGE","RIDGED","RIDGEL","RIDGES","RIDGIL","RIDGY","RIDING","RIDLEY","RIDS","RIEL","RIELS","RIEVER","RIF","RIFE","RIFELY","RIFER","RIFEST","RIFF","RIFFED","RIFFLE","RIFFS","RIFLE","RIFLED","RIFLER","RIFLES","RIFS","RIFT","RIFTED","RIFTS","RIG","RIGGED","RIGGER","RIGHT","RIGHTO","RIGHTS","RIGHTY","RIGID","RIGOR","RIGORS","RIGOUR","RIGS","RILE","RILED","RILES","RILEY","RILING","RILL","RILLE","RILLED","RILLES","RILLET","RILLS","RIM","RIME","RIMED","RIMER","RIMERS","RIMES","RIMIER","RIMING","RIMMED","RIMMER","RIMOSE","RIMOUS","RIMPLE","RIMS","RIMY","RIN","RIND","RINDED","RINDS","RING","RINGED","RINGER","RINGS","RINK","RINKS","RINS","RINSE","RINSED","RINSER","RINSES","RIOJA","RIOJAS","RIOT","RIOTED","RIOTER","RIOTS","RIP","RIPE","RIPED","RIPELY","RIPEN","RIPENS","RIPER","RIPES","RIPEST","RIPING","RIPOFF","RIPOST","RIPPED","RIPPER","RIPPLE","RIPPLY","RIPRAP","RIPS","RIPSAW","RISE","RISEN","RISER","RISERS","RISES","RISHI","RISHIS","RISING","RISK","RISKED","RISKER","RISKS","RISKY","RISQUE","RISUS","RITARD","RITE","RITES","RITTER","RITUAL","RITZ","RITZES","RITZY","RIVAGE","RIVAL","RIVALS","RIVE","RIVED","RIVEN","RIVER","RIVERS","RIVES","RIVET","RIVETS","RIVING","RIYAL","RIYALS","ROACH","ROAD","ROADEO","ROADIE","ROADS","ROAM","ROAMED","ROAMER","ROAMS","ROAN","ROANS","ROAR","ROARED","ROARER","ROARS","ROAST","ROASTS","ROB","ROBALO","ROBAND","ROBBED","ROBBER","ROBBIN","ROBE","ROBED","ROBES","ROBIN","ROBING","ROBINS","ROBLE","ROBLES","ROBOT","ROBOTS","ROBS","ROBUST","ROC","ROCHET","ROCK","ROCKED","ROCKER","ROCKET","ROCKS","ROCKY","ROCOCO","ROCS","ROD","RODDED","RODE","RODENT","RODEO","RODEOS","RODMAN","RODMEN","RODS","ROE","ROES","ROGER","ROGERS","ROGUE","ROGUED","ROGUES","ROIL","ROILED","ROILS","ROILY","ROLE","ROLES","ROLF","ROLFED","ROLFER","ROLFS","ROLL","ROLLED","ROLLER","ROLLS","ROM","ROMAN","ROMANO","ROMANS","ROMEO","ROMEOS","ROMP","ROMPED","ROMPER","ROMPS","ROMS","RONDEL","RONDO","RONDOS","RONION","RONNEL","RONYON","ROOD","ROODS","ROOF","ROOFED","ROOFER","ROOFS","ROOK","ROOKED","ROOKIE","ROOKS","ROOKY","ROOM","ROOMED","ROOMER","ROOMIE","ROOMS","ROOMY","ROOSE","ROOSED","ROOSER","ROOSES","ROOST","ROOSTS","ROOT","ROOTED","ROOTER","ROOTS","ROOTY","ROPE","ROPED","ROPER","ROPERS","ROPERY","ROPES","ROPEY","ROPIER","ROPILY","ROPING","ROPY","ROQUE","ROQUES","ROQUET","ROSARY","ROSCOE","ROSE","ROSED","ROSERY","ROSES","ROSET","ROSETS","ROSIER","ROSILY","ROSIN","ROSING","ROSINS","ROSINY","ROSTER","ROSTRA","ROSY","ROT","ROTA","ROTARY","ROTAS","ROTATE","ROTCH","ROTCHE","ROTE","ROTES","ROTGUT","ROTI","ROTIS","ROTL","ROTLS","ROTO","ROTOR","ROTORS","ROTOS","ROTS","ROTTE","ROTTED","ROTTEN","ROTTER","ROTTES","ROTUND","ROUBLE","ROUCHE","ROUE","ROUEN","ROUENS","ROUES","ROUGE","ROUGED","ROUGES","ROUGH","ROUGHS","ROUND","ROUNDS","ROUP","ROUPED","ROUPET","ROUPS","ROUPY","ROUSE","ROUSED","ROUSER","ROUSES","ROUST","ROUSTS","ROUT","ROUTE","ROUTED","ROUTER","ROUTES","ROUTH","ROUTHS","ROUTS","ROUX","ROVE","ROVED","ROVEN","ROVER","ROVERS","ROVES","ROVING","ROW","ROWAN","ROWANS","ROWDY","ROWED","ROWEL","ROWELS","ROWEN","ROWENS","ROWER","ROWERS","ROWING","ROWS","ROWTH","ROWTHS","ROYAL","ROYALS","ROZZER","RUANA","RUANAS","RUB","RUBACE","RUBATO","RUBBED","RUBBER","RUBBLE","RUBBLY","RUBE","RUBES","RUBIED","RUBIER","RUBIES","RUBIGO","RUBLE","RUBLES","RUBOFF","RUBOUT","RUBRIC","RUBS","RUBUS","RUBY","RUCHE","RUCHED","RUCHES","RUCK","RUCKED","RUCKLE","RUCKS","RUCKUS","RUDD","RUDDER","RUDDLE","RUDDS","RUDDY","RUDE","RUDELY","RUDER","RUDEST","RUE","RUED","RUEFUL","RUER","RUERS","RUES","RUFF","RUFFE","RUFFED","RUFFES","RUFFLE","RUFFLY","RUFFS","RUFOUS","RUG","RUGA","RUGAE","RUGAL","RUGATE","RUGBY","RUGGED","RUGGER","RUGOLA","RUGOSA","RUGOSE","RUGOUS","RUGS","RUIN","RUINED","RUINER","RUING","RUINS","RULE","RULED","RULER","RULERS","RULES","RULIER","RULING","RULY","RUM","RUMAKI","RUMBA","RUMBAS","RUMBLE","RUMBLY","RUMEN","RUMENS","RUMINA","RUMMER","RUMMY","RUMOR","RUMORS","RUMOUR","RUMP","RUMPLE","RUMPLY","RUMPS","RUMPUS","RUMS","RUN","RUNDLE","RUNE","RUNES","RUNG","RUNGS","RUNIC","RUNKLE","RUNLET","RUNNEL","RUNNER","RUNNY","RUNOFF","RUNOUT","RUNS","RUNT","RUNTS","RUNTY","RUNWAY","RUPEE","RUPEES","RUPIAH","RURAL","RURBAN","RUSE","RUSES","RUSH","RUSHED","RUSHEE","RUSHER","RUSHES","RUSHY","RUSINE","RUSK","RUSKS","RUSSET","RUST","RUSTED","RUSTIC","RUSTLE","RUSTS","RUSTY","RUT","RUTH","RUTHS","RUTILE","RUTIN","RUTINS","RUTS","RUTTED","RUTTY","RYA","RYAS","RYE","RYES","RYKE","RYKED","RYKES","RYKING","RYND","RYNDS","RYOKAN","RYOT","RYOTS","SAB","SABBAT","SABBED","SABE","SABED","SABER","SABERS","SABES","SABIN","SABINE","SABINS","SABIR","SABIRS","SABLE","SABLES","SABOT","SABOTS","SABRA","SABRAS","SABRE","SABRED","SABRES","SABS","SAC","SACBUT","SACHEM","SACHET","SACK","SACKED","SACKER","SACKS","SACQUE","SACRA","SACRAL","SACRED","SACRUM","SACS","SAD","SADDEN","SADDER","SADDHU","SADDLE","SADE","SADES","SADHE","SADHES","SADHU","SADHUS","SADI","SADIS","SADISM","SADIST","SADLY","SAE","SAFARI","SAFE","SAFELY","SAFER","SAFES","SAFEST","SAFETY","SAFROL","SAG","SAGA","SAGAS","SAGBUT","SAGE","SAGELY","SAGER","SAGES","SAGEST","SAGGAR","SAGGED","SAGGER","SAGGY","SAGIER","SAGO","SAGOS","SAGS","SAGUM","SAGY","SAHIB","SAHIBS","SAICE","SAICES","SAID","SAIDS","SAIGA","SAIGAS","SAIL","SAILED","SAILER","SAILOR","SAILS","SAIMIN","SAIN","SAINED","SAINS","SAINT","SAINTS","SAITH","SAITHE","SAIYID","SAJOU","SAJOUS","SAKE","SAKER","SAKERS","SAKES","SAKI","SAKIS","SAL","SALAAM","SALAD","SALADS","SALAL","SALALS","SALAMI","SALARY","SALE","SALEP","SALEPS","SALES","SALIC","SALIFY","SALINA","SALINE","SALIVA","SALL","SALLET","SALLOW","SALLY","SALMI","SALMIS","SALMON","SALOL","SALOLS","SALON","SALONS","SALOON","SALOOP","SALP","SALPA","SALPAE","SALPAS","SALPID","SALPS","SALS","SALSA","SALSAS","SALT","SALTED","SALTER","SALTIE","SALTS","SALTY","SALUKI","SALUTE","SALVE","SALVED","SALVER","SALVES","SALVIA","SALVO","SALVOR","SALVOS","SAMARA","SAMBA","SAMBAR","SAMBAS","SAMBO","SAMBOS","SAMBUR","SAME","SAMECH","SAMEK","SAMEKH","SAMEKS","SAMIEL","SAMITE","SAMLET","SAMOSA","SAMP","SAMPAN","SAMPLE","SAMPS","SAMSHU","SANCTA","SAND","SANDAL","SANDED","SANDER","SANDHI","SANDS","SANDY","SANE","SANED","SANELY","SANER","SANES","SANEST","SANG","SANGA","SANGAR","SANGAS","SANGER","SANGH","SANGHS","SANIES","SANING","SANITY","SANJAK","SANK","SANNOP","SANNUP","SANS","SANSAR","SANSEI","SANTIR","SANTO","SANTOL","SANTOS","SANTUR","SAP","SAPID","SAPOR","SAPORS","SAPOTA","SAPOTE","SAPOUR","SAPPED","SAPPER","SAPPY","SAPS","SARAN","SARANS","SARAPE","SARD","SARDAR","SARDS","SAREE","SAREES","SARGE","SARGES","SARI","SARIN","SARINS","SARIS","SARK","SARKS","SARKY","SAROD","SARODE","SARODS","SARONG","SAROS","SARSAR","SARSEN","SARTOR","SASH","SASHAY","SASHED","SASHES","SASIN","SASINS","SASS","SASSED","SASSES","SASSY","SAT","SATANG","SATARA","SATAY","SATAYS","SATE","SATED","SATEEN","SATEM","SATES","SATI","SATIN","SATING","SATINS","SATINY","SATIRE","SATIS","SATORI","SATRAP","SATYR","SATYRS","SAU","SAUCE","SAUCED","SAUCER","SAUCES","SAUCH","SAUCHS","SAUCY","SAUGER","SAUGH","SAUGHS","SAUGHY","SAUL","SAULS","SAULT","SAULTS","SAUNA","SAUNAS","SAUREL","SAURY","SAUTE","SAUTED","SAUTES","SAVAGE","SAVANT","SAVATE","SAVE","SAVED","SAVER","SAVERS","SAVES","SAVIN","SAVINE","SAVING","SAVINS","SAVIOR","SAVOR","SAVORS","SAVORY","SAVOUR","SAVOY","SAVOYS","SAVVY","SAW","SAWED","SAWER","SAWERS","SAWFLY","SAWING","SAWLOG","SAWN","SAWNEY","SAWS","SAWYER","SAX","SAXES","SAXONY","SAY","SAYER","SAYERS","SAYEST","SAYID","SAYIDS","SAYING","SAYS","SAYST","SAYYID","SCAB","SCABBY","SCABS","SCAD","SCADS","SCAG","SCAGS","SCALAR","SCALD","SCALDS","SCALE","SCALED","SCALER","SCALES","SCALL","SCALLS","SCALP","SCALPS","SCALY","SCAM","SCAMP","SCAMPI","SCAMPS","SCAMS","SCAN","SCANS","SCANT","SCANTS","SCANTY","SCAPE","SCAPED","SCAPES","SCAR","SCARAB","SCARCE","SCARE","SCARED","SCARER","SCARES","SCAREY","SCARF","SCARFS","SCARP","SCARPH","SCARPS","SCARRY","SCARS","SCART","SCARTS","SCARY","SCAT","SCATHE","SCATS","SCATT","SCATTS","SCATTY","SCAUP","SCAUPS","SCAUR","SCAURS","SCENA","SCENAS","SCEND","SCENDS","SCENE","SCENES","SCENIC","SCENT","SCENTS","SCHAV","SCHAVS","SCHEMA","SCHEME","SCHISM","SCHIST","SCHIZO","SCHIZY","SCHLEP","SCHMO","SCHMOE","SCHMOS","SCHNOZ","SCHOOL","SCHORL","SCHRIK","SCHROD","SCHTIK","SCHUIT","SCHUL","SCHULN","SCHUSS","SCHWA","SCHWAS","SCILLA","SCION","SCIONS","SCLAFF","SCLERA","SCOFF","SCOFFS","SCOLD","SCOLDS","SCOLEX","SCONCE","SCONE","SCONES","SCOOP","SCOOPS","SCOOT","SCOOTS","SCOP","SCOPE","SCOPED","SCOPES","SCOPS","SCORCH","SCORE","SCORED","SCORER","SCORES","SCORIA","SCORN","SCORNS","SCOT","SCOTCH","SCOTER","SCOTIA","SCOTS","SCOUR","SCOURS","SCOUSE","SCOUT","SCOUTH","SCOUTS","SCOW","SCOWED","SCOWL","SCOWLS","SCOWS","SCRAG","SCRAGS","SCRAM","SCRAMS","SCRAP","SCRAPE","SCRAPS","SCRAWL","SCREAK","SCREAM","SCREE","SCREED","SCREEN","SCREES","SCREW","SCREWS","SCREWY","SCRIBE","SCRIED","SCRIES","SCRIM","SCRIMP","SCRIMS","SCRIP","SCRIPS","SCRIPT","SCRIVE","SCROD","SCRODS","SCROLL","SCROOP","SCROTA","SCRUB","SCRUBS","SCRUFF","SCRUM","SCRUMS","SCRY","SCUBA","SCUBAS","SCUD","SCUDI","SCUDO","SCUDS","SCUFF","SCUFFS","SCULK","SCULKS","SCULL","SCULLS","SCULP","SCULPS","SCULPT","SCUM","SCUMMY","SCUMS","SCUP","SCUPS","SCURF","SCURFS","SCURFY","SCURRY","SCURVY","SCUT","SCUTA","SCUTCH","SCUTE","SCUTES","SCUTS","SCUTUM","SCUZZY","SCYPHI","SCYTHE","SEA","SEABAG","SEABED","SEADOG","SEAL","SEALED","SEALER","SEALS","SEAM","SEAMAN","SEAMED","SEAMEN","SEAMER","SEAMS","SEAMY","SEANCE","SEAR","SEARCH","SEARED","SEARER","SEARS","SEAS","SEASON","SEAT","SEATED","SEATER","SEATS","SEAWAN","SEAWAY","SEBUM","SEBUMS","SEC","SECANT","SECCO","SECCOS","SECEDE","SECERN","SECOND","SECPAR","SECRET","SECS","SECT","SECTOR","SECTS","SECUND","SECURE","SEDAN","SEDANS","SEDATE","SEDER","SEDERS","SEDGE","SEDGES","SEDGY","SEDILE","SEDUCE","SEDUM","SEDUMS","SEE","SEED","SEEDED","SEEDER","SEEDS","SEEDY","SEEING","SEEK","SEEKER","SEEKS","SEEL","SEELED","SEELS","SEELY","SEEM","SEEMED","SEEMER","SEEMLY","SEEMS","SEEN","SEEP","SEEPED","SEEPS","SEEPY","SEER","SEERS","SEES","SEESAW","SEETHE","SEG","SEGGAR","SEGNI","SEGNO","SEGNOS","SEGO","SEGOS","SEGS","SEGUE","SEGUED","SEGUES","SEI","SEICHE","SEIDEL","SEIF","SEIFS","SEINE","SEINED","SEINER","SEINES","SEIS","SEISE","SEISED","SEISER","SEISES","SEISIN","SEISM","SEISMS","SEISOR","SEIZE","SEIZED","SEIZER","SEIZES","SEIZIN","SEIZOR","SEJANT","SEL","SELAH","SELAHS","SELDOM","SELECT","SELF","SELFED","SELFS","SELL","SELLE","SELLER","SELLES","SELLS","SELS","SELSYN","SELVA","SELVAS","SELVES","SEME","SEMEME","SEMEN","SEMENS","SEMES","SEMI","SEMINA","SEMIS","SEMPLE","SEMPRE","SEN","SENARY","SENATE","SEND","SENDAL","SENDED","SENDER","SENDS","SENDUP","SENE","SENECA","SENEGA","SENGI","SENHOR","SENILE","SENIOR","SENITI","SENNA","SENNAS","SENNET","SENNIT","SENOR","SENORA","SENORS","SENRYU","SENSA","SENSE","SENSED","SENSES","SENSOR","SENSUM","SENT","SENTE","SENTI","SENTRY","SEPAL","SEPALS","SEPIA","SEPIAS","SEPIC","SEPOY","SEPOYS","SEPSES","SEPSIS","SEPT","SEPTA","SEPTAL","SEPTET","SEPTIC","SEPTS","SEPTUM","SEQUEL","SEQUIN","SER","SERA","SERAC","SERACS","SERAI","SERAIL","SERAIS","SERAL","SERAPE","SERAPH","SERDAB","SERE","SERED","SEREIN","SERENE","SERER","SERES","SEREST","SERF","SERFS","SERGE","SERGES","SERIAL","SERIES","SERIF","SERIFS","SERIN","SERINE","SERING","SERINS","SERMON","SEROSA","SEROUS","SEROW","SEROWS","SERRY","SERS","SERUM","SERUMS","SERVAL","SERVE","SERVED","SERVER","SERVES","SERVO","SERVOS","SESAME","SESTET","SET","SETA","SETAE","SETAL","SETOFF","SETON","SETONS","SETOSE","SETOUS","SETOUT","SETS","SETT","SETTEE","SETTER","SETTLE","SETTS","SETUP","SETUPS","SEVEN","SEVENS","SEVER","SEVERE","SEVERS","SEW","SEWAGE","SEWAN","SEWANS","SEWAR","SEWARS","SEWED","SEWER","SEWERS","SEWING","SEWN","SEWS","SEX","SEXED","SEXES","SEXIER","SEXILY","SEXING","SEXISM","SEXIST","SEXPOT","SEXT","SEXTAN","SEXTET","SEXTO","SEXTON","SEXTOS","SEXTS","SEXUAL","SEXY","SHA","SHABBY","SHACK","SHACKO","SHACKS","SHAD","SHADE","SHADED","SHADER","SHADES","SHADOW","SHADS","SHADUF","SHADY","SHAFT","SHAFTS","SHAG","SHAGGY","SHAGS","SHAH","SHAHS","SHAIRD","SHAIRN","SHAKE","SHAKEN","SHAKER","SHAKES","SHAKO","SHAKOS","SHAKY","SHALE","SHALED","SHALES","SHALEY","SHALL","SHALOM","SHALT","SHALY","SHAM","SHAMAN","SHAMAS","SHAME","SHAMED","SHAMES","SHAMMY","SHAMOS","SHAMOY","SHAMS","SHAMUS","SHANDY","SHANK","SHANKS","SHANNY","SHANTI","SHANTY","SHAPE","SHAPED","SHAPEN","SHAPER","SHAPES","SHARD","SHARDS","SHARE","SHARED","SHARER","SHARES","SHARIF","SHARK","SHARKS","SHARN","SHARNS","SHARNY","SHARP","SHARPS","SHARPY","SHAT","SHAUGH","SHAUL","SHAULS","SHAVE","SHAVED","SHAVEN","SHAVER","SHAVES","SHAVIE","SHAW","SHAWED","SHAWL","SHAWLS","SHAWM","SHAWMS","SHAWN","SHAWS","SHAY","SHAYS","SHE","SHEA","SHEAF","SHEAFS","SHEAL","SHEALS","SHEAR","SHEARS","SHEAS","SHEATH","SHEAVE","SHED","SHEDS","SHEEN","SHEENS","SHEENY","SHEEP","SHEER","SHEERS","SHEET","SHEETS","SHEEVE","SHEIK","SHEIKH","SHEIKS","SHEILA","SHEKEL","SHELF","SHELL","SHELLS","SHELLY","SHELTA","SHELTY","SHELVE","SHELVY","SHEND","SHENDS","SHENT","SHEOL","SHEOLS","SHEQEL","SHERD","SHERDS","SHERIF","SHERPA","SHERRY","SHES","SHEUCH","SHEUGH","SHEW","SHEWED","SHEWER","SHEWN","SHEWS","SHH","SHIBAH","SHIED","SHIEL","SHIELD","SHIELS","SHIER","SHIERS","SHIES","SHIEST","SHIFT","SHIFTS","SHIFTY","SHIKAR","SHIKSA","SHIKSE","SHILL","SHILLS","SHILY","SHIM","SHIMMY","SHIMS","SHIN","SHINDY","SHINE","SHINED","SHINER","SHINES","SHINNY","SHINS","SHINY","SHIP","SHIPS","SHIRE","SHIRES","SHIRK","SHIRKS","SHIRR","SHIRRS","SHIRT","SHIRTS","SHIRTY","SHIST","SHISTS","SHIT","SHITS","SHITTY","SHIV","SHIVA","SHIVAH","SHIVAS","SHIVE","SHIVER","SHIVES","SHIVS","SHLEP","SHLEPP","SHLEPS","SHLOCK","SHLUMP","SHMEAR","SHMO","SHMOES","SHMUCK","SHNAPS","SHNOOK","SHOAL","SHOALS","SHOALY","SHOAT","SHOATS","SHOCK","SHOCKS","SHOD","SHODDY","SHOE","SHOED","SHOER","SHOERS","SHOES","SHOFAR","SHOG","SHOGS","SHOGUN","SHOJI","SHOJIS","SHOLOM","SHONE","SHOO","SHOOED","SHOOK","SHOOKS","SHOOL","SHOOLS","SHOON","SHOOS","SHOOT","SHOOTS","SHOP","SHOPPE","SHOPS","SHORAN","SHORE","SHORED","SHORES","SHORL","SHORLS","SHORN","SHORT","SHORTS","SHORTY","SHOT","SHOTE","SHOTES","SHOTS","SHOTT","SHOTTS","SHOULD","SHOUT","SHOUTS","SHOVE","SHOVED","SHOVEL","SHOVER","SHOVES","SHOW","SHOWED","SHOWER","SHOWN","SHOWS","SHOWY","SHOYU","SHOYUS","SHRANK","SHRED","SHREDS","SHREW","SHREWD","SHREWS","SHRI","SHRIEK","SHRIFT","SHRIKE","SHRILL","SHRIMP","SHRINE","SHRINK","SHRIS","SHRIVE","SHROFF","SHROUD","SHROVE","SHRUB","SHRUBS","SHRUG","SHRUGS","SHRUNK","SHTETL","SHTICK","SHTIK","SHTIKS","SHUCK","SHUCKS","SHUL","SHULN","SHULS","SHUN","SHUNS","SHUNT","SHUNTS","SHUSH","SHUT","SHUTE","SHUTED","SHUTES","SHUTS","SHY","SHYER","SHYERS","SHYEST","SHYING","SHYLY","SIAL","SIALIC","SIALID","SIALS","SIB","SIBB","SIBBS","SIBS","SIBYL","SIBYLS","SIC","SICCAN","SICCED","SICE","SICES","SICK","SICKED","SICKEE","SICKEN","SICKER","SICKIE","SICKLE","SICKLY","SICKO","SICKOS","SICKS","SICS","SIDDUR","SIDE","SIDED","SIDES","SIDING","SIDLE","SIDLED","SIDLER","SIDLES","SIEGE","SIEGED","SIEGES","SIENNA","SIERRA","SIESTA","SIEUR","SIEURS","SIEVE","SIEVED","SIEVES","SIFAKA","SIFT","SIFTED","SIFTER","SIFTS","SIGH","SIGHED","SIGHER","SIGHS","SIGHT","SIGHTS","SIGIL","SIGILS","SIGLOI","SIGLOS","SIGMA","SIGMAS","SIGN","SIGNAL","SIGNED","SIGNEE","SIGNER","SIGNET","SIGNOR","SIGNS","SIKE","SIKER","SIKES","SILAGE","SILANE","SILD","SILDS","SILENI","SILENT","SILEX","SILICA","SILK","SILKED","SILKEN","SILKS","SILKY","SILL","SILLER","SILLS","SILLY","SILO","SILOED","SILOS","SILT","SILTED","SILTS","SILTY","SILVA","SILVAE","SILVAN","SILVAS","SILVER","SILVEX","SIM","SIMA","SIMAR","SIMARS","SIMAS","SIMIAN","SIMILE","SIMLIN","SIMMER","SIMNEL","SIMONY","SIMOOM","SIMOON","SIMP","SIMPER","SIMPLE","SIMPLY","SIMPS","SIMS","SIN","SINCE","SINE","SINES","SINEW","SINEWS","SINEWY","SINFUL","SING","SINGE","SINGED","SINGER","SINGES","SINGLE","SINGLY","SINGS","SINH","SINHS","SINK","SINKER","SINKS","SINNED","SINNER","SINS","SINTER","SINUS","SIP","SIPE","SIPED","SIPES","SIPHON","SIPING","SIPPED","SIPPER","SIPPET","SIPS","SIR","SIRDAR","SIRE","SIRED","SIREE","SIREES","SIREN","SIRENS","SIRES","SIRING","SIRRA","SIRRAH","SIRRAS","SIRREE","SIRS","SIRUP","SIRUPS","SIRUPY","SIS","SISAL","SISALS","SISES","SISKIN","SISSY","SISTER","SISTRA","SIT","SITAR","SITARS","SITCOM","SITE","SITED","SITES","SITH","SITING","SITS","SITTEN","SITTER","SITUP","SITUPS","SITUS","SIVER","SIVERS","SIX","SIXES","SIXMO","SIXMOS","SIXTE","SIXTES","SIXTH","SIXTHS","SIXTY","SIZAR","SIZARS","SIZE","SIZED","SIZER","SIZERS","SIZES","SIZIER","SIZING","SIZY","SIZZLE","SKA","SKAG","SKAGS","SKALD","SKALDS","SKAS","SKAT","SKATE","SKATED","SKATER","SKATES","SKATOL","SKATS","SKEAN","SKEANE","SKEANS","SKEE","SKEED","SKEEN","SKEENS","SKEES","SKEET","SKEETS","SKEG","SKEGS","SKEIGH","SKEIN","SKEINS","SKELM","SKELMS","SKELP","SKELPS","SKENE","SKENES","SKEP","SKEPS","SKERRY","SKETCH","SKEW","SKEWED","SKEWER","SKEWS","SKI","SKIBOB","SKID","SKIDDY","SKIDOO","SKIDS","SKIED","SKIER","SKIERS","SKIES","SKIEY","SKIFF","SKIFFS","SKIING","SKILL","SKILLS","SKIM","SKIMO","SKIMOS","SKIMP","SKIMPS","SKIMPY","SKIMS","SKIN","SKINK","SKINKS","SKINNY","SKINS","SKINT","SKIP","SKIPS","SKIRL","SKIRLS","SKIRR","SKIRRS","SKIRT","SKIRTS","SKIS","SKIT","SKITE","SKITED","SKITES","SKITS","SKIVE","SKIVED","SKIVER","SKIVES","SKIVVY","SKLENT","SKOAL","SKOALS","SKOSH","SKUA","SKUAS","SKULK","SKULKS","SKULL","SKULLS","SKUNK","SKUNKS","SKY","SKYBOX","SKYCAP","SKYED","SKYEY","SKYING","SKYLIT","SKYMAN","SKYMEN","SKYWAY","SLAB","SLABS","SLACK","SLACKS","SLAG","SLAGGY","SLAGS","SLAIN","SLAKE","SLAKED","SLAKER","SLAKES","SLALOM","SLAM","SLAMS","SLANG","SLANGS","SLANGY","SLANK","SLANT","SLANTS","SLANTY","SLAP","SLAPS","SLASH","SLAT","SLATCH","SLATE","SLATED","SLATER","SLATES","SLATEY","SLATS","SLATY","SLAVE","SLAVED","SLAVER","SLAVES","SLAVEY","SLAW","SLAWS","SLAY","SLAYED","SLAYER","SLAYS","SLEAVE","SLEAZE","SLEAZO","SLEAZY","SLED","SLEDGE","SLEDS","SLEEK","SLEEKS","SLEEKY","SLEEP","SLEEPS","SLEEPY","SLEET","SLEETS","SLEETY","SLEEVE","SLEIGH","SLEPT","SLEUTH","SLEW","SLEWED","SLEWS","SLICE","SLICED","SLICER","SLICES","SLICK","SLICKS","SLID","SLIDE","SLIDER","SLIDES","SLIER","SLIEST","SLIGHT","SLILY","SLIM","SLIME","SLIMED","SLIMES","SLIMLY","SLIMS","SLIMSY","SLIMY","SLING","SLINGS","SLINK","SLINKS","SLINKY","SLIP","SLIPE","SLIPED","SLIPES","SLIPPY","SLIPS","SLIPT","SLIPUP","SLIT","SLITS","SLIVER","SLOB","SLOBBY","SLOBS","SLOE","SLOES","SLOG","SLOGAN","SLOGS","SLOID","SLOIDS","SLOJD","SLOJDS","SLOOP","SLOOPS","SLOP","SLOPE","SLOPED","SLOPER","SLOPES","SLOPPY","SLOPS","SLOSH","SLOSHY","SLOT","SLOTH","SLOTHS","SLOTS","SLOUCH","SLOUGH","SLOVEN","SLOW","SLOWED","SLOWER","SLOWLY","SLOWS","SLOYD","SLOYDS","SLUB","SLUBS","SLUDGE","SLUDGY","SLUE","SLUED","SLUES","SLUFF","SLUFFS","SLUG","SLUGS","SLUICE","SLUICY","SLUING","SLUM","SLUMMY","SLUMP","SLUMPS","SLUMS","SLUNG","SLUNK","SLUR","SLURB","SLURBS","SLURP","SLURPS","SLURRY","SLURS","SLUSH","SLUSHY","SLUT","SLUTS","SLUTTY","SLY","SLYER","SLYEST","SLYLY","SLYPE","SLYPES","SMACK","SMACKS","SMALL","SMALLS","SMALT","SMALTI","SMALTO","SMALTS","SMARM","SMARMS","SMARMY","SMART","SMARTS","SMARTY","SMASH","SMAZE","SMAZES","SMEAR","SMEARS","SMEARY","SMEEK","SMEEKS","SMEGMA","SMELL","SMELLS","SMELLY","SMELT","SMELTS","SMERK","SMERKS","SMEW","SMEWS","SMIDGE","SMILAX","SMILE","SMILED","SMILER","SMILES","SMILEY","SMIRCH","SMIRK","SMIRKS","SMIRKY","SMIT","SMITE","SMITER","SMITES","SMITH","SMITHS","SMITHY","SMOCK","SMOCKS","SMOG","SMOGGY","SMOGS","SMOKE","SMOKED","SMOKER","SMOKES","SMOKEY","SMOKY","SMOLT","SMOLTS","SMOOCH","SMOOTH","SMOTE","SMUDGE","SMUDGY","SMUG","SMUGLY","SMUT","SMUTCH","SMUTS","SMUTTY","SNACK","SNACKS","SNAFU","SNAFUS","SNAG","SNAGGY","SNAGS","SNAIL","SNAILS","SNAKE","SNAKED","SNAKES","SNAKEY","SNAKY","SNAP","SNAPPY","SNAPS","SNARE","SNARED","SNARER","SNARES","SNARK","SNARKS","SNARKY","SNARL","SNARLS","SNARLY","SNASH","SNATCH","SNATH","SNATHE","SNATHS","SNAW","SNAWED","SNAWS","SNAZZY","SNEAK","SNEAKS","SNEAKY","SNEAP","SNEAPS","SNECK","SNECKS","SNED","SNEDS","SNEER","SNEERS","SNEESH","SNEEZE","SNEEZY","SNELL","SNELLS","SNIB","SNIBS","SNICK","SNICKS","SNIDE","SNIDER","SNIFF","SNIFFS","SNIFFY","SNIP","SNIPE","SNIPED","SNIPER","SNIPES","SNIPPY","SNIPS","SNIT","SNITCH","SNITS","SNIVEL","SNOB","SNOBBY","SNOBS","SNOG","SNOGS","SNOOD","SNOODS","SNOOK","SNOOKS","SNOOL","SNOOLS","SNOOP","SNOOPS","SNOOPY","SNOOT","SNOOTS","SNOOTY","SNOOZE","SNOOZY","SNORE","SNORED","SNORER","SNORES","SNORT","SNORTS","SNOT","SNOTS","SNOTTY","SNOUT","SNOUTS","SNOUTY","SNOW","SNOWED","SNOWS","SNOWY","SNUB","SNUBBY","SNUBS","SNUCK","SNUFF","SNUFFS","SNUFFY","SNUG","SNUGLY","SNUGS","SNYE","SNYES","SOAK","SOAKED","SOAKER","SOAKS","SOAP","SOAPED","SOAPER","SOAPS","SOAPY","SOAR","SOARED","SOARER","SOARS","SOAVE","SOAVES","SOB","SOBBED","SOBBER","SOBEIT","SOBER","SOBERS","SOBFUL","SOBS","SOCAGE","SOCCER","SOCIAL","SOCK","SOCKED","SOCKET","SOCKO","SOCKS","SOCLE","SOCLES","SOCMAN","SOCMEN","SOD","SODA","SODAS","SODDED","SODDEN","SODDY","SODIC","SODIUM","SODOM","SODOMS","SODOMY","SODS","SOEVER","SOFA","SOFAR","SOFARS","SOFAS","SOFFIT","SOFT","SOFTA","SOFTAS","SOFTEN","SOFTER","SOFTIE","SOFTLY","SOFTS","SOFTY","SOGGED","SOGGY","SOIGNE","SOIL","SOILED","SOILS","SOIREE","SOJA","SOJAS","SOKE","SOKES","SOKOL","SOKOLS","SOL","SOLA","SOLACE","SOLAN","SOLAND","SOLANO","SOLANS","SOLAR","SOLATE","SOLD","SOLDAN","SOLDER","SOLDI","SOLDO","SOLE","SOLED","SOLEI","SOLELY","SOLEMN","SOLES","SOLEUS","SOLGEL","SOLI","SOLID","SOLIDI","SOLIDS","SOLING","SOLION","SOLO","SOLOED","SOLON","SOLONS","SOLOS","SOLS","SOLUM","SOLUMS","SOLUS","SOLUTE","SOLVE","SOLVED","SOLVER","SOLVES","SOMA","SOMAS","SOMATA","SOMBER","SOMBRE","SOME","SOMITE","SON","SONANT","SONAR","SONARS","SONATA","SONDE","SONDER","SONDES","SONE","SONES","SONG","SONGS","SONIC","SONICS","SONLY","SONNET","SONNY","SONS","SONSIE","SONSY","SOOEY","SOOK","SOOKS","SOON","SOONER","SOOT","SOOTED","SOOTH","SOOTHE","SOOTHS","SOOTS","SOOTY","SOP","SOPH","SOPHS","SOPHY","SOPITE","SOPOR","SOPORS","SOPPED","SOPPY","SOPS","SORA","SORAS","SORB","SORBED","SORBET","SORBIC","SORBS","SORD","SORDID","SORDOR","SORDS","SORE","SOREL","SORELS","SORELY","SORER","SORES","SOREST","SORGHO","SORGO","SORGOS","SORI","SORING","SORN","SORNED","SORNER","SORNS","SORREL","SORROW","SORRY","SORT","SORTED","SORTER","SORTIE","SORTS","SORUS","SOS","SOT","SOTH","SOTHS","SOTOL","SOTOLS","SOTS","SOTTED","SOU","SOUARI","SOUCAR","SOUDAN","SOUGH","SOUGHS","SOUGHT","SOUK","SOUKS","SOUL","SOULED","SOULS","SOUND","SOUNDS","SOUP","SOUPED","SOUPS","SOUPY","SOUR","SOURCE","SOURED","SOURER","SOURLY","SOURS","SOUS","SOUSE","SOUSED","SOUSES","SOUTER","SOUTH","SOUTHS","SOVIET","SOVRAN","SOW","SOWANS","SOWAR","SOWARS","SOWCAR","SOWED","SOWENS","SOWER","SOWERS","SOWING","SOWN","SOWS","SOX","SOY","SOYA","SOYAS","SOYS","SOYUZ","SOZIN","SOZINE","SOZINS","SPA","SPACE","SPACED","SPACER","SPACES","SPACEY","SPACY","SPADE","SPADED","SPADER","SPADES","SPADIX","SPADO","SPAE","SPAED","SPAES","SPAHEE","SPAHI","SPAHIS","SPAIL","SPAILS","SPAIT","SPAITS","SPAKE","SPALE","SPALES","SPALL","SPALLS","SPAN","SPANG","SPANK","SPANKS","SPANS","SPAR","SPARE","SPARED","SPARER","SPARES","SPARGE","SPARID","SPARK","SPARKS","SPARKY","SPARRY","SPARS","SPARSE","SPAS","SPASM","SPASMS","SPAT","SPATE","SPATES","SPATHE","SPATS","SPAVIE","SPAVIN","SPAWN","SPAWNS","SPAY","SPAYED","SPAYS","SPAZ","SPEAK","SPEAKS","SPEAN","SPEANS","SPEAR","SPEARS","SPEC","SPECIE","SPECK","SPECKS","SPECS","SPED","SPEECH","SPEED","SPEEDO","SPEEDS","SPEEDY","SPEEL","SPEELS","SPEER","SPEERS","SPEIL","SPEILS","SPEIR","SPEIRS","SPEISE","SPEISS","SPELL","SPELLS","SPELT","SPELTS","SPELTZ","SPENCE","SPEND","SPENDS","SPENSE","SPENT","SPERM","SPERMS","SPEW","SPEWED","SPEWER","SPEWS","SPHENE","SPHERE","SPHERY","SPHINX","SPIC","SPICA","SPICAE","SPICAS","SPICE","SPICED","SPICER","SPICES","SPICEY","SPICK","SPICKS","SPICS","SPICY","SPIDER","SPIED","SPIEL","SPIELS","SPIER","SPIERS","SPIES","SPIFF","SPIFFS","SPIFFY","SPIGOT","SPIK","SPIKE","SPIKED","SPIKER","SPIKES","SPIKEY","SPIKS","SPIKY","SPILE","SPILED","SPILES","SPILL","SPILLS","SPILT","SPILTH","SPIN","SPINAL","SPINE","SPINED","SPINEL","SPINES","SPINET","SPINNY","SPINOR","SPINS","SPINTO","SPINY","SPIRAL","SPIRE","SPIREA","SPIRED","SPIREM","SPIRES","SPIRIT","SPIRT","SPIRTS","SPIRY","SPIT","SPITAL","SPITE","SPITED","SPITES","SPITS","SPITZ","SPIV","SPIVS","SPLAKE","SPLASH","SPLAT","SPLATS","SPLAY","SPLAYS","SPLEEN","SPLENT","SPLICE","SPLIFF","SPLINE","SPLINT","SPLIT","SPLITS","SPLORE","SPLOSH","SPODE","SPODES","SPOIL","SPOILS","SPOILT","SPOKE","SPOKED","SPOKEN","SPOKES","SPONGE","SPONGY","SPOOF","SPOOFS","SPOOFY","SPOOK","SPOOKS","SPOOKY","SPOOL","SPOOLS","SPOON","SPOONS","SPOONY","SPOOR","SPOORS","SPORAL","SPORE","SPORED","SPORES","SPORT","SPORTS","SPORTY","SPOT","SPOTS","SPOTTY","SPOUSE","SPOUT","SPOUTS","SPRAG","SPRAGS","SPRAIN","SPRANG","SPRAT","SPRATS","SPRAWL","SPRAY","SPRAYS","SPREAD","SPREE","SPREES","SPRENT","SPRIER","SPRIG","SPRIGS","SPRING","SPRINT","SPRIT","SPRITE","SPRITS","SPRITZ","SPROUT","SPRUCE","SPRUCY","SPRUE","SPRUES","SPRUG","SPRUGS","SPRUNG","SPRY","SPRYER","SPRYLY","SPUD","SPUDS","SPUE","SPUED","SPUES","SPUING","SPUME","SPUMED","SPUMES","SPUMY","SPUN","SPUNK","SPUNKS","SPUNKY","SPUR","SPURGE","SPURN","SPURNS","SPURRY","SPURS","SPURT","SPURTS","SPUTA","SPUTUM","SPY","SPYING","SQUAB","SQUABS","SQUAD","SQUADS","SQUALL","SQUAMA","SQUARE","SQUASH","SQUAT","SQUATS","SQUAW","SQUAWK","SQUAWS","SQUEAK","SQUEAL","SQUEG","SQUEGS","SQUIB","SQUIBS","SQUID","SQUIDS","SQUILL","SQUINT","SQUIRE","SQUIRM","SQUIRT","SQUISH","SQUUSH","SRADHA","SRI","SRIS","STAB","STABLE","STABLY","STABS","STACK","STACKS","STACTE","STADE","STADES","STADIA","STAFF","STAFFS","STAG","STAGE","STAGED","STAGER","STAGES","STAGEY","STAGGY","STAGS","STAGY","STAID","STAIG","STAIGS","STAIN","STAINS","STAIR","STAIRS","STAKE","STAKED","STAKES","STALAG","STALE","STALED","STALER","STALES","STALK","STALKS","STALKY","STALL","STALLS","STAMEN","STAMP","STAMPS","STANCE","STANCH","STAND","STANDS","STANE","STANED","STANES","STANG","STANGS","STANK","STANKS","STANZA","STAPES","STAPH","STAPHS","STAPLE","STAR","STARCH","STARE","STARED","STARER","STARES","STARK","STARRY","STARS","START","STARTS","STARVE","STASES","STASH","STASIS","STAT","STATAL","STATE","STATED","STATER","STATES","STATIC","STATOR","STATS","STATUE","STATUS","STAVE","STAVED","STAVES","STAW","STAY","STAYED","STAYER","STAYS","STEAD","STEADS","STEADY","STEAK","STEAKS","STEAL","STEALS","STEAM","STEAMS","STEAMY","STEED","STEEDS","STEEK","STEEKS","STEEL","STEELS","STEELY","STEEP","STEEPS","STEER","STEERS","STEEVE","STEIN","STEINS","STELA","STELAE","STELAI","STELAR","STELE","STELES","STELIC","STELLA","STEM","STEMMA","STEMMY","STEMS","STENCH","STENO","STENOS","STEP","STEPPE","STEPS","STERE","STEREO","STERES","STERIC","STERN","STERNA","STERNS","STEROL","STET","STETS","STEW","STEWED","STEWS","STEY","STICH","STICHS","STICK","STICKS","STICKY","STIED","STIES","STIFF","STIFFS","STIFLE","STIGMA","STILE","STILES","STILL","STILLS","STILLY","STILT","STILTS","STIME","STIMES","STIMY","STING","STINGO","STINGS","STINGY","STINK","STINKO","STINKS","STINKY","STINT","STINTS","STIPE","STIPED","STIPEL","STIPES","STIR","STIRK","STIRKS","STIRP","STIRPS","STIRS","STITCH","STITHY","STIVER","STOA","STOAE","STOAI","STOAS","STOAT","STOATS","STOB","STOBS","STOCK","STOCKS","STOCKY","STODGE","STODGY","STOGEY","STOGIE","STOGY","STOIC","STOICS","STOKE","STOKED","STOKER","STOKES","STOLE","STOLED","STOLEN","STOLES","STOLID","STOLON","STOMA","STOMAL","STOMAS","STOMP","STOMPS","STONE","STONED","STONER","STONES","STONEY","STONY","STOOD","STOOGE","STOOK","STOOKS","STOOL","STOOLS","STOOP","STOOPS","STOP","STOPE","STOPED","STOPER","STOPES","STOPS","STOPT","STORAX","STORE","STORED","STORES","STOREY","STORK","STORKS","STORM","STORMS","STORMY","STORY","STOSS","STOUND","STOUP","STOUPS","STOUR","STOURE","STOURS","STOURY","STOUT","STOUTS","STOVE","STOVER","STOVES","STOW","STOWED","STOWP","STOWPS","STOWS","STRAFE","STRAIN","STRAIT","STRAKE","STRAND","STRANG","STRAP","STRAPS","STRASS","STRATA","STRATH","STRATI","STRAW","STRAWS","STRAWY","STRAY","STRAYS","STREAK","STREAM","STREEK","STREEL","STREET","STREP","STREPS","STRESS","STREW","STREWN","STREWS","STRIA","STRIAE","STRICK","STRICT","STRIDE","STRIFE","STRIKE","STRING","STRIP","STRIPE","STRIPS","STRIPT","STRIPY","STRIVE","STROBE","STRODE","STROKE","STROLL","STROMA","STRONG","STROOK","STROP","STROPS","STROUD","STROVE","STROW","STROWN","STROWS","STROY","STROYS","STRUCK","STRUM","STRUMA","STRUMS","STRUNG","STRUNT","STRUT","STRUTS","STUB","STUBBY","STUBS","STUCCO","STUCK","STUD","STUDIO","STUDLY","STUDS","STUDY","STUFF","STUFFS","STUFFY","STULL","STULLS","STUM","STUMP","STUMPS","STUMPY","STUMS","STUN","STUNG","STUNK","STUNS","STUNT","STUNTS","STUPA","STUPAS","STUPE","STUPES","STUPID","STUPOR","STURDY","STURT","STURTS","STY","STYE","STYED","STYES","STYING","STYLAR","STYLE","STYLED","STYLER","STYLES","STYLET","STYLI","STYLUS","STYMIE","STYMY","STYRAX","SUABLE","SUABLY","SUAVE","SUAVER","SUB","SUBA","SUBAH","SUBAHS","SUBAS","SUBBED","SUBDEB","SUBDUE","SUBER","SUBERS","SUBFIX","SUBGUM","SUBITO","SUBLET","SUBLOT","SUBMIT","SUBNET","SUBORN","SUBPAR","SUBS","SUBSEA","SUBSET","SUBTLE","SUBTLY","SUBURB","SUBWAY","SUCCAH","SUCCOR","SUCH","SUCK","SUCKED","SUCKER","SUCKLE","SUCKS","SUCRE","SUCRES","SUDARY","SUDD","SUDDEN","SUDDS","SUDOR","SUDORS","SUDS","SUDSED","SUDSER","SUDSES","SUDSY","SUE","SUED","SUEDE","SUEDED","SUEDES","SUER","SUERS","SUES","SUET","SUETS","SUETY","SUFFER","SUFFIX","SUGAR","SUGARS","SUGARY","SUGH","SUGHED","SUGHS","SUING","SUINT","SUINTS","SUIT","SUITE","SUITED","SUITER","SUITES","SUITOR","SUITS","SUKKAH","SUKKOT","SULCAL","SULCI","SULCUS","SULDAN","SULFA","SULFAS","SULFID","SULFO","SULFUR","SULK","SULKED","SULKER","SULKS","SULKY","SULLEN","SULLY","SULPHA","SULTAN","SULTRY","SULU","SULUS","SUM","SUMAC","SUMACH","SUMACS","SUMMA","SUMMAE","SUMMAS","SUMMED","SUMMER","SUMMIT","SUMMON","SUMO","SUMOS","SUMP","SUMPS","SUMS","SUN","SUNBOW","SUNDAE","SUNDER","SUNDEW","SUNDOG","SUNDRY","SUNG","SUNK","SUNKEN","SUNKET","SUNLIT","SUNN","SUNNA","SUNNAH","SUNNAS","SUNNED","SUNNS","SUNNY","SUNS","SUNSET","SUNTAN","SUNUP","SUNUPS","SUP","SUPE","SUPER","SUPERB","SUPERS","SUPES","SUPINE","SUPPED","SUPPER","SUPPLE","SUPPLY","SUPRA","SUPS","SUQ","SUQS","SURA","SURAH","SURAHS","SURAL","SURAS","SURD","SURDS","SURE","SURELY","SURER","SUREST","SURETY","SURF","SURFED","SURFER","SURFS","SURFY","SURGE","SURGED","SURGER","SURGES","SURGY","SURIMI","SURLY","SURRA","SURRAS","SURREY","SURTAX","SURVEY","SUSHI","SUSHIS","SUSLIK","SUSS","SUSSED","SUSSES","SUTLER","SUTRA","SUTRAS","SUTTA","SUTTAS","SUTTEE","SUTURE","SVARAJ","SVELTE","SWAB","SWABBY","SWABS","SWAG","SWAGE","SWAGED","SWAGER","SWAGES","SWAGS","SWAIL","SWAILS","SWAIN","SWAINS","SWALE","SWALES","SWAM","SWAMI","SWAMIS","SWAMP","SWAMPS","SWAMPY","SWAMY","SWAN","SWANG","SWANK","SWANKS","SWANKY","SWANS","SWAP","SWAPS","SWARAJ","SWARD","SWARDS","SWARE","SWARF","SWARFS","SWARM","SWARMS","SWART","SWARTH","SWARTY","SWASH","SWAT","SWATCH","SWATH","SWATHE","SWATHS","SWATS","SWAY","SWAYED","SWAYER","SWAYS","SWEAR","SWEARS","SWEAT","SWEATS","SWEATY","SWEDE","SWEDES","SWEENY","SWEEP","SWEEPS","SWEEPY","SWEER","SWEET","SWEETS","SWELL","SWELLS","SWEPT","SWERVE","SWEVEN","SWIFT","SWIFTS","SWIG","SWIGS","SWILL","SWILLS","SWIM","SWIMMY","SWIMS","SWINE","SWING","SWINGE","SWINGS","SWINGY","SWINK","SWINKS","SWIPE","SWIPED","SWIPES","SWIPLE","SWIRL","SWIRLS","SWIRLY","SWISH","SWISHY","SWISS","SWITCH","SWITH","SWITHE","SWIVE","SWIVED","SWIVEL","SWIVES","SWIVET","SWOB","SWOBS","SWOON","SWOONS","SWOOP","SWOOPS","SWOOSH","SWOP","SWOPS","SWORD","SWORDS","SWORE","SWORN","SWOT","SWOTS","SWOUN","SWOUND","SWOUNS","SWUM","SWUNG","SYBO","SYBOES","SYCE","SYCEE","SYCEES","SYCES","SYKE","SYKES","SYLI","SYLIS","SYLPH","SYLPHS","SYLPHY","SYLVA","SYLVAE","SYLVAN","SYLVAS","SYLVIN","SYMBOL","SYN","SYNC","SYNCED","SYNCH","SYNCHS","SYNCOM","SYNCS","SYNDET","SYNDIC","SYNE","SYNGAS","SYNOD","SYNODS","SYNTAX","SYNTH","SYNTHS","SYNURA","SYPH","SYPHER","SYPHON","SYPHS","SYREN","SYRENS","SYRINX","SYRUP","SYRUPS","SYRUPY","SYSOP","SYSOPS","SYSTEM","SYZYGY","TAB","TABARD","TABBED","TABBIS","TABBY","TABER","TABERS","TABES","TABID","TABLA","TABLAS","TABLE","TABLED","TABLES","TABLET","TABOO","TABOOS","TABOR","TABORS","TABOUR","TABS","TABU","TABUED","TABULI","TABUN","TABUNS","TABUS","TACE","TACES","TACET","TACH","TACHE","TACHES","TACHS","TACIT","TACK","TACKED","TACKER","TACKET","TACKEY","TACKLE","TACKS","TACKY","TACO","TACOS","TACT","TACTIC","TACTS","TAD","TADS","TAE","TAEL","TAELS","TAENIA","TAFFIA","TAFFY","TAFIA","TAFIAS","TAG","TAGGED","TAGGER","TAGRAG","TAGS","TAHINI","TAHR","TAHRS","TAHSIL","TAIGA","TAIGAS","TAIL","TAILED","TAILER","TAILLE","TAILOR","TAILS","TAIN","TAINS","TAINT","TAINTS","TAIPAN","TAJ","TAJES","TAKA","TAKAHE","TAKE","TAKEN","TAKER","TAKERS","TAKES","TAKEUP","TAKIN","TAKING","TAKINS","TALA","TALAR","TALARS","TALAS","TALC","TALCED","TALCKY","TALCS","TALCUM","TALE","TALENT","TALER","TALERS","TALES","TALI","TALION","TALK","TALKED","TALKER","TALKIE","TALKS","TALKY","TALL","TALLER","TALLIS","TALLIT","TALLOL","TALLOW","TALLY","TALON","TALONS","TALUK","TALUKA","TALUKS","TALUS","TAM","TAMAL","TAMALE","TAMALS","TAMARI","TAMBAC","TAMBAK","TAMBUR","TAME","TAMED","TAMEIN","TAMELY","TAMER","TAMERS","TAMES","TAMEST","TAMING","TAMIS","TAMMIE","TAMMY","TAMP","TAMPAN","TAMPED","TAMPER","TAMPON","TAMPS","TAMS","TAN","TANDEM","TANG","TANGED","TANGLE","TANGLY","TANGO","TANGOS","TANGS","TANGY","TANIST","TANK","TANKA","TANKAS","TANKED","TANKER","TANKS","TANNED","TANNER","TANNIC","TANNIN","TANREC","TANS","TANSY","TANTO","TANTRA","TANUKI","TAO","TAOS","TAP","TAPA","TAPALO","TAPAS","TAPE","TAPED","TAPER","TAPERS","TAPES","TAPETA","TAPING","TAPIR","TAPIRS","TAPIS","TAPPED","TAPPER","TAPPET","TAPS","TAR","TARAMA","TARDO","TARDY","TARE","TARED","TARES","TARGE","TARGES","TARGET","TARIFF","TARING","TARMAC","TARN","TARNAL","TARNS","TARO","TAROC","TAROCS","TAROK","TAROKS","TAROS","TAROT","TAROTS","TARP","TARPAN","TARPON","TARPS","TARRE","TARRED","TARRES","TARRY","TARS","TARSAL","TARSI","TARSIA","TARSUS","TART","TARTAN","TARTAR","TARTED","TARTER","TARTLY","TARTS","TARTY","TARZAN","TAS","TASK","TASKED","TASKS","TASS","TASSE","TASSEL","TASSES","TASSET","TASSIE","TASTE","TASTED","TASTER","TASTES","TASTY","TAT","TATAMI","TATAR","TATARS","TATE","TATER","TATERS","TATES","TATS","TATTED","TATTER","TATTIE","TATTLE","TATTOO","TATTY","TAU","TAUGHT","TAUNT","TAUNTS","TAUPE","TAUPES","TAUS","TAUT","TAUTED","TAUTEN","TAUTER","TAUTLY","TAUTOG","TAUTS","TAV","TAVERN","TAVS","TAW","TAWDRY","TAWED","TAWER","TAWERS","TAWIE","TAWING","TAWNEY","TAWNY","TAWPIE","TAWS","TAWSE","TAWSED","TAWSES","TAX","TAXA","TAXED","TAXEME","TAXER","TAXERS","TAXES","TAXI","TAXIED","TAXIES","TAXING","TAXIS","TAXITE","TAXMAN","TAXMEN","TAXON","TAXONS","TAXUS","TAZZA","TAZZAS","TAZZE","TEA","TEABOX","TEACH","TEACUP","TEAK","TEAKS","TEAL","TEALS","TEAM","TEAMED","TEAMS","TEAPOT","TEAPOY","TEAR","TEARED","TEARER","TEARS","TEARY","TEAS","TEASE","TEASED","TEASEL","TEASER","TEASES","TEAT","TEATED","TEATS","TEAZEL","TEAZLE","TECHED","TECHIE","TECHY","TECTA","TECTAL","TECTUM","TED","TEDDED","TEDDER","TEDDY","TEDIUM","TEDS","TEE","TEED","TEEING","TEEL","TEELS","TEEM","TEEMED","TEEMER","TEEMS","TEEN","TEENER","TEENS","TEENSY","TEENY","TEEPEE","TEES","TEETER","TEETH","TEETHE","TEFF","TEFFS","TEG","TEGMEN","TEGS","TEGUA","TEGUAS","TEIID","TEIIDS","TEIND","TEINDS","TEL","TELA","TELAE","TELE","TELEDU","TELEGA","TELES","TELEX","TELFER","TELIA","TELIAL","TELIC","TELIUM","TELL","TELLER","TELLS","TELLY","TELLYS","TELOI","TELOME","TELOS","TELS","TELSON","TEMP","TEMPED","TEMPEH","TEMPER","TEMPI","TEMPLE","TEMPO","TEMPOS","TEMPS","TEMPT","TEMPTS","TEN","TENACE","TENAIL","TENANT","TENCH","TEND","TENDED","TENDER","TENDON","TENDS","TENET","TENETS","TENIA","TENIAE","TENIAS","TENNER","TENNIS","TENON","TENONS","TENOR","TENORS","TENOUR","TENPIN","TENREC","TENS","TENSE","TENSED","TENSER","TENSES","TENSOR","TENT","TENTED","TENTER","TENTH","TENTHS","TENTIE","TENTS","TENTY","TENUES","TENUIS","TENURE","TENUTI","TENUTO","TEOPAN","TEPA","TEPAL","TEPALS","TEPAS","TEPEE","TEPEES","TEPEFY","TEPHRA","TEPID","TEPOY","TEPOYS","TERAI","TERAIS","TERAPH","TERBIA","TERBIC","TERCE","TERCEL","TERCES","TERCET","TEREDO","TERETE","TERGA","TERGAL","TERGUM","TERM","TERMED","TERMER","TERMLY","TERMOR","TERMS","TERN","TERNE","TERNES","TERNS","TERRA","TERRAE","TERRAS","TERRET","TERRIT","TERROR","TERRY","TERSE","TERSER","TESLA","TESLAS","TEST","TESTA","TESTAE","TESTED","TESTEE","TESTER","TESTES","TESTIS","TESTON","TESTS","TESTY","TET","TETANY","TETCHY","TETH","TETHER","TETHS","TETRA","TETRAD","TETRAS","TETRYL","TETS","TETTER","TEUCH","TEUGH","TEW","TEWED","TEWING","TEWS","TEXAS","TEXT","TEXTS","THACK","THACKS","THAE","THAIRM","THALER","THALLI","THAN","THANE","THANES","THANK","THANKS","THARM","THARMS","THAT","THATCH","THAW","THAWED","THAWER","THAWS","THE","THEBE","THECA","THECAE","THECAL","THEE","THEFT","THEFTS","THEGN","THEGNS","THEIN","THEINE","THEINS","THEIR","THEIRS","THEISM","THEIST","THEM","THEME","THEMED","THEMES","THEN","THENAL","THENAR","THENCE","THENS","THEORY","THERE","THERES","THERM","THERME","THERMS","THESE","THESES","THESIS","THETA","THETAS","THETIC","THEW","THEWS","THEWY","THEY","THICK","THICKS","THIEF","THIEVE","THIGH","THIGHS","THILL","THILLS","THIN","THINE","THING","THINGS","THINK","THINKS","THINLY","THINS","THIO","THIOL","THIOLS","THIR","THIRAM","THIRD","THIRDS","THIRL","THIRLS","THIRST","THIRTY","THIS","THO","THOLE","THOLED","THOLES","THOLOI","THOLOS","THONG","THONGS","THORAX","THORIA","THORIC","THORN","THORNS","THORNY","THORO","THORON","THORP","THORPE","THORPS","THOSE","THOU","THOUED","THOUGH","THOUS","THRALL","THRASH","THRAVE","THRAW","THRAWN","THRAWS","THREAD","THREAP","THREAT","THREE","THREEP","THREES","THRESH","THREW","THRICE","THRIFT","THRILL","THRIP","THRIPS","THRIVE","THRO","THROAT","THROB","THROBS","THROE","THROES","THRONE","THRONG","THROVE","THROW","THROWN","THROWS","THRU","THRUM","THRUMS","THRUSH","THRUST","THUD","THUDS","THUG","THUGS","THUJA","THUJAS","THULIA","THUMB","THUMBS","THUMP","THUMPS","THUNK","THUNKS","THURL","THURLS","THUS","THUSLY","THUYA","THUYAS","THWACK","THWART","THY","THYME","THYMES","THYMEY","THYMI","THYMIC","THYMOL","THYMUS","THYMY","THYRSE","THYRSI","TIARA","TIARAS","TIBIA","TIBIAE","TIBIAL","TIBIAS","TIC","TICAL","TICALS","TICK","TICKED","TICKER","TICKET","TICKLE","TICKS","TICS","TICTAC","TICTOC","TIDAL","TIDBIT","TIDDLY","TIDE","TIDED","TIDES","TIDIED","TIDIER","TIDIES","TIDILY","TIDING","TIDY","TIE","TIED","TIEING","TIEPIN","TIER","TIERCE","TIERED","TIERS","TIES","TIFF","TIFFED","TIFFIN","TIFFS","TIGER","TIGERS","TIGHT","TIGHTS","TIGLON","TIGON","TIGONS","TIKE","TIKES","TIKI","TIKIS","TIL","TILAK","TILAKS","TILDE","TILDES","TILE","TILED","TILER","TILERS","TILES","TILING","TILL","TILLED","TILLER","TILLS","TILS","TILT","TILTED","TILTER","TILTH","TILTHS","TILTS","TIMBAL","TIMBER","TIMBRE","TIME","TIMED","TIMELY","TIMER","TIMERS","TIMES","TIMID","TIMING","TIN","TINCAL","TINCT","TINCTS","TINDER","TINE","TINEA","TINEAL","TINEAS","TINED","TINEID","TINES","TINFUL","TING","TINGE","TINGED","TINGES","TINGLE","TINGLY","TINGS","TINIER","TINILY","TINING","TINKER","TINKLE","TINKLY","TINMAN","TINMEN","TINNED","TINNER","TINNY","TINS","TINSEL","TINT","TINTED","TINTER","TINTS","TINY","TIP","TIPCAT","TIPI","TIPIS","TIPOFF","TIPPED","TIPPER","TIPPET","TIPPLE","TIPPY","TIPS","TIPSY","TIPTOE","TIPTOP","TIRADE","TIRE","TIRED","TIRES","TIRING","TIRL","TIRLED","TIRLS","TIRO","TIROS","TIS","TISANE","TISSUE","TIT","TITAN","TITANS","TITBIT","TITER","TITERS","TITFER","TITHE","TITHED","TITHER","TITHES","TITI","TITIAN","TITIS","TITLE","TITLED","TITLES","TITMAN","TITMEN","TITRE","TITRES","TITS","TITTER","TITTIE","TITTLE","TITTUP","TITTY","TIVY","TIZZY","TMESES","TMESIS","TOAD","TOADS","TOADY","TOAST","TOASTS","TOASTY","TOBIES","TOBY","TOCHER","TOCSIN","TOD","TODAY","TODAYS","TODDLE","TODDY","TODIES","TODS","TODY","TOE","TOEA","TOECAP","TOED","TOEING","TOES","TOFF","TOFFEE","TOFFS","TOFFY","TOFT","TOFTS","TOFU","TOFUS","TOG","TOGA","TOGAE","TOGAED","TOGAS","TOGATE","TOGGED","TOGGLE","TOGS","TOGUE","TOGUES","TOIL","TOILE","TOILED","TOILER","TOILES","TOILET","TOILS","TOIT","TOITED","TOITS","TOKAY","TOKAYS","TOKE","TOKED","TOKEN","TOKENS","TOKER","TOKERS","TOKES","TOKING","TOLA","TOLAN","TOLANE","TOLANS","TOLAS","TOLD","TOLE","TOLED","TOLEDO","TOLES","TOLING","TOLL","TOLLED","TOLLER","TOLLS","TOLU","TOLUIC","TOLUID","TOLUOL","TOLUS","TOLUYL","TOLYL","TOLYLS","TOM","TOMAN","TOMANS","TOMATO","TOMB","TOMBAC","TOMBAK","TOMBAL","TOMBED","TOMBOY","TOMBS","TOMCAT","TOMCOD","TOME","TOMES","TOMMED","TOMMY","TOMS","TOMTIT","TON","TONAL","TONDI","TONDO","TONDOS","TONE","TONED","TONEME","TONER","TONERS","TONES","TONEY","TONG","TONGA","TONGAS","TONGED","TONGER","TONGS","TONGUE","TONIC","TONICS","TONIER","TONING","TONISH","TONLET","TONNE","TONNER","TONNES","TONS","TONSIL","TONUS","TONY","TOO","TOOK","TOOL","TOOLED","TOOLER","TOOLS","TOOM","TOON","TOONS","TOOT","TOOTED","TOOTER","TOOTH","TOOTHS","TOOTHY","TOOTLE","TOOTS","TOOTSY","TOP","TOPAZ","TOPE","TOPED","TOPEE","TOPEES","TOPER","TOPERS","TOPES","TOPFUL","TOPH","TOPHE","TOPHES","TOPHI","TOPHS","TOPHUS","TOPI","TOPIC","TOPICS","TOPING","TOPIS","TOPOI","TOPOS","TOPPED","TOPPER","TOPPLE","TOPS","TOQUE","TOQUES","TOQUET","TOR","TORA","TORAH","TORAHS","TORAS","TORC","TORCH","TORCHY","TORCS","TORE","TORERO","TORES","TORI","TORIC","TORIES","TORII","TORN","TORO","TOROID","TOROS","TOROSE","TOROT","TOROTH","TOROUS","TORPID","TORPOR","TORQUE","TORR","TORRID","TORS","TORSE","TORSES","TORSI","TORSK","TORSKS","TORSO","TORSOS","TORT","TORTE","TORTEN","TORTES","TORTS","TORULA","TORUS","TORY","TOSH","TOSHES","TOSS","TOSSED","TOSSER","TOSSES","TOSSUP","TOST","TOT","TOTAL","TOTALS","TOTE","TOTED","TOTEM","TOTEMS","TOTER","TOTERS","TOTES","TOTHER","TOTING","TOTS","TOTTED","TOTTER","TOUCAN","TOUCH","TOUCHE","TOUCHY","TOUGH","TOUGHS","TOUGHY","TOUPEE","TOUR","TOURED","TOURER","TOURS","TOUSE","TOUSED","TOUSES","TOUSLE","TOUT","TOUTED","TOUTER","TOUTS","TOUZLE","TOW","TOWAGE","TOWARD","TOWED","TOWEL","TOWELS","TOWER","TOWERS","TOWERY","TOWHEE","TOWIE","TOWIES","TOWING","TOWN","TOWNEE","TOWNIE","TOWNS","TOWNY","TOWS","TOWY","TOXIC","TOXICS","TOXIN","TOXINE","TOXINS","TOXOID","TOY","TOYED","TOYER","TOYERS","TOYING","TOYISH","TOYO","TOYON","TOYONS","TOYOS","TOYS","TRACE","TRACED","TRACER","TRACES","TRACK","TRACKS","TRACT","TRACTS","TRAD","TRADE","TRADED","TRADER","TRADES","TRAGI","TRAGIC","TRAGUS","TRAIK","TRAIKS","TRAIL","TRAILS","TRAIN","TRAINS","TRAIT","TRAITS","TRAM","TRAMEL","TRAMP","TRAMPS","TRAMS","TRANCE","TRANK","TRANKS","TRANQ","TRANQS","TRANS","TRAP","TRAPAN","TRAPES","TRAPS","TRAPT","TRASH","TRASHY","TRASS","TRAUMA","TRAVE","TRAVEL","TRAVES","TRAWL","TRAWLS","TRAY","TRAYS","TREAD","TREADS","TREAT","TREATS","TREATY","TREBLE","TREBLY","TREE","TREED","TREEN","TREENS","TREES","TREF","TREFAH","TREK","TREKS","TREMOR","TRENCH","TREND","TRENDS","TRENDY","TREPAN","TREPID","TRESS","TRESSY","TRET","TRETS","TREVET","TREWS","TREY","TREYS","TRIAC","TRIACS","TRIAD","TRIADS","TRIAGE","TRIAL","TRIALS","TRIBAL","TRIBE","TRIBES","TRICE","TRICED","TRICES","TRICK","TRICKS","TRICKY","TRICOT","TRIED","TRIENE","TRIENS","TRIER","TRIERS","TRIES","TRIFID","TRIFLE","TRIG","TRIGLY","TRIGO","TRIGON","TRIGOS","TRIGS","TRIJET","TRIKE","TRIKES","TRILBY","TRILL","TRILLS","TRIM","TRIMER","TRIMLY","TRIMS","TRINAL","TRINE","TRINED","TRINES","TRIO","TRIODE","TRIOL","TRIOLS","TRIOS","TRIOSE","TRIP","TRIPE","TRIPES","TRIPLE","TRIPLY","TRIPOD","TRIPOS","TRIPPY","TRIPS","TRISTE","TRITE","TRITER","TRITON","TRIUNE","TRIVET","TRIVIA","TROAK","TROAKS","TROCAR","TROCHE","TROCK","TROCKS","TROD","TRODE","TROGON","TROIKA","TROIS","TROKE","TROKED","TROKES","TROLL","TROLLS","TROLLY","TROMP","TROMPE","TROMPS","TRONA","TRONAS","TRONE","TRONES","TROOP","TROOPS","TROOZ","TROP","TROPE","TROPES","TROPHY","TROPIC","TROPIN","TROT","TROTH","TROTHS","TROTS","TROTYL","TROUGH","TROUPE","TROUT","TROUTS","TROUTY","TROVE","TROVER","TROVES","TROW","TROWED","TROWEL","TROWS","TROWTH","TROY","TROYS","TRUANT","TRUCE","TRUCED","TRUCES","TRUCK","TRUCKS","TRUDGE","TRUE","TRUED","TRUER","TRUES","TRUEST","TRUFFE","TRUG","TRUGS","TRUING","TRUISM","TRULL","TRULLS","TRULY","TRUMP","TRUMPS","TRUNK","TRUNKS","TRUSS","TRUST","TRUSTS","TRUSTY","TRUTH","TRUTHS","TRY","TRYING","TRYMA","TRYOUT","TRYST","TRYSTE","TRYSTS","TSADE","TSADES","TSADI","TSADIS","TSAR","TSARS","TSETSE","TSK","TSKED","TSKING","TSKS","TSKTSK","TSORES","TSORIS","TSUBA","TSURIS","TUB","TUBA","TUBAE","TUBAL","TUBAS","TUBATE","TUBBED","TUBBER","TUBBY","TUBE","TUBED","TUBER","TUBERS","TUBES","TUBFUL","TUBING","TUBIST","TUBS","TUBULE","TUCHUN","TUCK","TUCKED","TUCKER","TUCKET","TUCKS","TUFA","TUFAS","TUFF","TUFFET","TUFFS","TUFOLI","TUFT","TUFTED","TUFTER","TUFTS","TUFTY","TUG","TUGGED","TUGGER","TUGRIK","TUGS","TUI","TUILLE","TUIS","TULADI","TULE","TULES","TULIP","TULIPS","TULLE","TULLES","TUMBLE","TUMEFY","TUMID","TUMMY","TUMOR","TUMORS","TUMOUR","TUMP","TUMPED","TUMPS","TUMULI","TUMULT","TUN","TUNA","TUNAS","TUNDRA","TUNE","TUNED","TUNER","TUNERS","TUNES","TUNEUP","TUNG","TUNGS","TUNIC","TUNICA","TUNICS","TUNING","TUNNED","TUNNEL","TUNNY","TUNS","TUP","TUPELO","TUPIK","TUPIKS","TUPPED","TUPS","TUQUE","TUQUES","TURACO","TURBAN","TURBID","TURBIT","TURBO","TURBOS","TURBOT","TURD","TURDS","TUREEN","TURF","TURFED","TURFS","TURFY","TURGID","TURGOR","TURK","TURKEY","TURKS","TURN","TURNED","TURNER","TURNIP","TURNS","TURNUP","TURPS","TURRET","TURTLE","TURVES","TUSCHE","TUSH","TUSHED","TUSHES","TUSHIE","TUSHY","TUSK","TUSKED","TUSKER","TUSKS","TUSSAH","TUSSAL","TUSSAR","TUSSEH","TUSSER","TUSSIS","TUSSLE","TUSSOR","TUSSUR","TUT","TUTEE","TUTEES","TUTOR","TUTORS","TUTS","TUTTED","TUTTI","TUTTIS","TUTTY","TUTU","TUTUS","TUX","TUXEDO","TUXES","TUYER","TUYERE","TUYERS","TWA","TWAE","TWAES","TWAIN","TWAINS","TWANG","TWANGS","TWANGY","TWANKY","TWAS","TWAT","TWATS","TWEAK","TWEAKS","TWEAKY","TWEE","TWEED","TWEEDS","TWEEDY","TWEEN","TWEENY","TWEET","TWEETS","TWEEZE","TWELVE","TWENTY","TWERP","TWERPS","TWIBIL","TWICE","TWIER","TWIERS","TWIG","TWIGGY","TWIGS","TWILIT","TWILL","TWILLS","TWIN","TWINE","TWINED","TWINER","TWINES","TWINGE","TWINS","TWINY","TWIRL","TWIRLS","TWIRLY","TWIRP","TWIRPS","TWIST","TWISTS","TWISTY","TWIT","TWITCH","TWITS","TWIXT","TWO","TWOFER","TWOS","TWYER","TWYERS","TYCOON","TYE","TYEE","TYEES","TYER","TYERS","TYES","TYING","TYKE","TYKES","TYMBAL","TYMPAN","TYNE","TYNED","TYNES","TYNING","TYPAL","TYPE","TYPED","TYPES","TYPEY","TYPHON","TYPHUS","TYPIC","TYPIER","TYPIFY","TYPING","TYPIST","TYPO","TYPOS","TYPP","TYPPS","TYPY","TYRANT","TYRE","TYRED","TYRES","TYRING","TYRO","TYROS","TYTHE","TYTHED","TYTHES","TZAR","TZARS","TZETZE","TZURIS","UBIETY","UBIQUE","UDDER","UDDERS","UDO","UDOS","UGH","UGHS","UGLIER","UGLIES","UGLIFY","UGLILY","UGLY","UGSOME","UHLAN","UHLANS","UKASE","UKASES","UKE","UKES","ULAMA","ULAMAS","ULAN","ULANS","ULCER","ULCERS","ULEMA","ULEMAS","ULLAGE","ULNA","ULNAD","ULNAE","ULNAR","ULNAS","ULPAN","ULSTER","ULTIMA","ULTIMO","ULTRA","ULTRAS","ULU","ULUS","ULVA","ULVAS","UMBEL","UMBELS","UMBER","UMBERS","UMBLES","UMBO","UMBOS","UMBRA","UMBRAE","UMBRAL","UMBRAS","UMIAC","UMIACK","UMIACS","UMIAK","UMIAKS","UMIAQ","UMIAQS","UMLAUT","UMM","UMP","UMPED","UMPING","UMPIRE","UMPS","UNABLE","UNAGED","UNAI","UNAIS","UNAKIN","UNAPT","UNARM","UNARMS","UNARY","UNAU","UNAUS","UNAWED","UNBAN","UNBANS","UNBAR","UNBARS","UNBE","UNBEAR","UNBELT","UNBEND","UNBENT","UNBID","UNBIND","UNBOLT","UNBORN","UNBOX","UNBRED","UNBUSY","UNCAGE","UNCAKE","UNCAP","UNCAPS","UNCASE","UNCHIC","UNCI","UNCIA","UNCIAE","UNCIAL","UNCINI","UNCLAD","UNCLE","UNCLES","UNCLIP","UNCLOG","UNCO","UNCOCK","UNCOIL","UNCOOL","UNCORK","UNCOS","UNCOY","UNCUFF","UNCURB","UNCURL","UNCUS","UNCUT","UNCUTE","UNDE","UNDEAD","UNDEE","UNDER","UNDID","UNDIES","UNDINE","UNDO","UNDOCK","UNDOER","UNDOES","UNDONE","UNDRAW","UNDREW","UNDUE","UNDULY","UNDY","UNDYED","UNEASE","UNEASY","UNEVEN","UNFAIR","UNFED","UNFELT","UNFIT","UNFITS","UNFIX","UNFIXT","UNFOLD","UNFOND","UNFREE","UNFURL","UNGIRD","UNGIRT","UNGLUE","UNGOT","UNGUAL","UNGUES","UNGUIS","UNGULA","UNHAIR","UNHAND","UNHANG","UNHAT","UNHATS","UNHELM","UNHEWN","UNHIP","UNHOLY","UNHOOD","UNHOOK","UNHUNG","UNHURT","UNHUSK","UNIFIC","UNIFY","UNION","UNIONS","UNIPOD","UNIQUE","UNISEX","UNISON","UNIT","UNITE","UNITED","UNITER","UNITES","UNITS","UNITY","UNJUST","UNKEND","UNKENT","UNKEPT","UNKIND","UNKINK","UNKNIT","UNKNOT","UNLACE","UNLADE","UNLAID","UNLASH","UNLAY","UNLAYS","UNLEAD","UNLED","UNLESS","UNLET","UNLIKE","UNLINK","UNLIT","UNLIVE","UNLOAD","UNLOCK","UNMADE","UNMAKE","UNMAN","UNMANS","UNMASK","UNMEET","UNMESH","UNMET","UNMEW","UNMEWS","UNMIX","UNMIXT","UNMOLD","UNMOOR","UNMOWN","UNNAIL","UNOPEN","UNPACK","UNPAID","UNPEG","UNPEGS","UNPEN","UNPENS","UNPENT","UNPICK","UNPILE","UNPIN","UNPINS","UNPLUG","UNPURE","UNREAD","UNREAL","UNREEL","UNRENT","UNREST","UNRIG","UNRIGS","UNRIP","UNRIPE","UNRIPS","UNROBE","UNROLL","UNROOF","UNROOT","UNROVE","UNRULY","UNS","UNSAFE","UNSAID","UNSAWN","UNSAY","UNSAYS","UNSEAL","UNSEAM","UNSEAT","UNSEEN","UNSELL","UNSENT","UNSET","UNSETS","UNSEW","UNSEWN","UNSEWS","UNSEX","UNSEXY","UNSHED","UNSHIP","UNSHOD","UNSHUT","UNSNAP","UNSOLD","UNSOWN","UNSPUN","UNSTEP","UNSTOP","UNSUNG","UNSUNK","UNSURE","UNTACK","UNTAME","UNTIDY","UNTIE","UNTIED","UNTIES","UNTIL","UNTO","UNTOLD","UNTORN","UNTRIM","UNTROD","UNTRUE","UNTUCK","UNTUNE","UNUSED","UNVEIL","UNVEXT","UNWARY","UNWED","UNWELL","UNWEPT","UNWIND","UNWISE","UNWISH","UNWIT","UNWITS","UNWON","UNWORN","UNWOVE","UNWRAP","UNYOKE","UNZIP","UNZIPS","UPAS","UPASES","UPBEAR","UPBEAT","UPBIND","UPBOIL","UPBORE","UPBOW","UPBOWS","UPBY","UPBYE","UPCAST","UPCOIL","UPCURL","UPDART","UPDATE","UPDIVE","UPDO","UPDOS","UPDOVE","UPDRY","UPEND","UPENDS","UPFLOW","UPFOLD","UPGAZE","UPGIRD","UPGIRT","UPGREW","UPGROW","UPHEAP","UPHELD","UPHILL","UPHOLD","UPHOVE","UPHROE","UPKEEP","UPLAND","UPLEAP","UPLIFT","UPLINK","UPLIT","UPLOAD","UPMOST","UPO","UPON","UPPED","UPPER","UPPERS","UPPILE","UPPING","UPPISH","UPPITY","UPPROP","UPRATE","UPREAR","UPRISE","UPROAR","UPROOT","UPROSE","UPRUSH","UPS","UPSEND","UPSENT","UPSET","UPSETS","UPSHOT","UPSIDE","UPSOAR","UPSTEP","UPSTIR","UPTAKE","UPTEAR","UPTICK","UPTILT","UPTIME","UPTORE","UPTORN","UPTOSS","UPTOWN","UPTURN","UPWAFT","UPWARD","UPWELL","UPWIND","URACIL","URAEI","URAEUS","URANIA","URANIC","URANYL","URARE","URARES","URARI","URARIS","URASE","URASES","URATE","URATES","URATIC","URB","URBAN","URBANE","URBIA","URBIAS","URBS","URCHIN","URD","URDS","UREA","UREAL","UREAS","UREASE","UREDIA","UREDO","UREDOS","UREIC","UREIDE","UREMIA","UREMIC","URETER","URETIC","URGE","URGED","URGENT","URGER","URGERS","URGES","URGING","URIAL","URIALS","URIC","URINAL","URINE","URINES","URN","URNS","UROPOD","URSA","URSAE","URSINE","URTEXT","URUS","URUSES","USABLE","USABLY","USAGE","USAGES","USANCE","USE","USED","USEFUL","USER","USERS","USES","USHER","USHERS","USING","USNEA","USNEAS","USQUE","USQUES","USUAL","USUALS","USURER","USURP","USURPS","USURY","UTA","UTAS","UTERI","UTERUS","UTILE","UTMOST","UTOPIA","UTS","UTTER","UTTERS","UVEA","UVEAL","UVEAS","UVEOUS","UVULA","UVULAE","UVULAR","UVULAS","VAC","VACANT","VACATE","VACS","VACUA","VACUUM","VADOSE","VAGAL","VAGARY","VAGI","VAGILE","VAGINA","VAGROM","VAGUE","VAGUER","VAGUS","VAHINE","VAIL","VAILED","VAILS","VAIN","VAINER","VAINLY","VAIR","VAIRS","VAKEEL","VAKIL","VAKILS","VALE","VALES","VALET","VALETS","VALGUS","VALID","VALINE","VALISE","VALKYR","VALLEY","VALOR","VALORS","VALOUR","VALSE","VALSES","VALUE","VALUED","VALUER","VALUES","VALUTA","VALVAL","VALVAR","VALVE","VALVED","VALVES","VAMOSE","VAMP","VAMPED","VAMPER","VAMPS","VAN","VANDA","VANDAL","VANDAS","VANE","VANED","VANES","VANG","VANGS","VANISH","VANITY","VANMAN","VANMEN","VANNED","VANNER","VANS","VAPID","VAPOR","VAPORS","VAPORY","VAPOUR","VAR","VARA","VARAS","VARIA","VARIED","VARIER","VARIES","VARIX","VARLET","VARNA","VARNAS","VAROOM","VARS","VARUS","VARVE","VARVED","VARVES","VARY","VAS","VASA","VASAL","VASE","VASES","VASSAL","VAST","VASTER","VASTLY","VASTS","VASTY","VAT","VATFUL","VATIC","VATS","VATTED","VATU","VATUS","VAU","VAULT","VAULTS","VAULTY","VAUNT","VAUNTS","VAUNTY","VAUS","VAV","VAVS","VAW","VAWARD","VAWS","VEAL","VEALED","VEALER","VEALS","VEALY","VECTOR","VEE","VEEJAY","VEENA","VEENAS","VEEP","VEEPEE","VEEPS","VEER","VEERED","VEERS","VEERY","VEES","VEG","VEGAN","VEGANS","VEGETE","VEGGIE","VEGIE","VEGIES","VEIL","VEILED","VEILER","VEILS","VEIN","VEINAL","VEINED","VEINER","VEINS","VEINY","VELA","VELAR","VELARS","VELATE","VELD","VELDS","VELDT","VELDTS","VELLUM","VELOCE","VELOUR","VELUM","VELURE","VELVET","VENA","VENAE","VENAL","VEND","VENDED","VENDEE","VENDER","VENDOR","VENDS","VENDUE","VENEER","VENERY","VENGE","VENGED","VENGES","VENIAL","VENIN","VENINE","VENINS","VENIRE","VENOM","VENOMS","VENOSE","VENOUS","VENT","VENTED","VENTER","VENTS","VENUE","VENUES","VENULE","VERA","VERB","VERBAL","VERBID","VERBS","VERDIN","VERGE","VERGED","VERGER","VERGES","VERIER","VERIFY","VERILY","VERISM","VERIST","VERITE","VERITY","VERMES","VERMIN","VERMIS","VERNAL","VERNIX","VERSAL","VERSE","VERSED","VERSER","VERSES","VERSET","VERSO","VERSOS","VERST","VERSTE","VERSTS","VERSUS","VERT","VERTEX","VERTS","VERTU","VERTUS","VERVE","VERVES","VERVET","VERY","VESICA","VESPER","VESPID","VESSEL","VEST","VESTA","VESTAL","VESTAS","VESTED","VESTEE","VESTRY","VESTS","VET","VETCH","VETO","VETOED","VETOER","VETOES","VETS","VETTED","VEX","VEXED","VEXER","VEXERS","VEXES","VEXIL","VEXILS","VEXING","VEXT","VIA","VIABLE","VIABLY","VIAL","VIALED","VIALS","VIAND","VIANDS","VIATIC","VIATOR","VIBE","VIBES","VIBIST","VIBRIO","VICAR","VICARS","VICE","VICED","VICES","VICHY","VICING","VICTIM","VICTOR","VICUNA","VIDE","VIDEO","VIDEOS","VIE","VIED","VIER","VIERS","VIES","VIEW","VIEWED","VIEWER","VIEWS","VIEWY","VIG","VIGA","VIGAS","VIGIL","VIGILS","VIGOR","VIGORS","VIGOUR","VIGS","VIKING","VILE","VILELY","VILER","VILEST","VILIFY","VILL","VILLA","VILLAE","VILLAS","VILLI","VILLS","VILLUS","VIM","VIMEN","VIMINA","VIMS","VINA","VINAL","VINALS","VINAS","VINCA","VINCAS","VINE","VINEAL","VINED","VINERY","VINES","VINIC","VINIER","VINIFY","VINING","VINO","VINOS","VINOUS","VINY","VINYL","VINYLS","VIOL","VIOLA","VIOLAS","VIOLET","VIOLIN","VIOLS","VIPER","VIPERS","VIRAGO","VIRAL","VIREO","VIREOS","VIRES","VIRGA","VIRGAS","VIRGIN","VIRID","VIRILE","VIRION","VIRL","VIRLS","VIROID","VIRTU","VIRTUE","VIRTUS","VIRUS","VIS","VISA","VISAED","VISAGE","VISARD","VISAS","VISCID","VISCUS","VISE","VISED","VISEED","VISES","VISING","VISION","VISIT","VISITS","VISIVE","VISOR","VISORS","VISTA","VISTAS","VISUAL","VITA","VITAE","VITAL","VITALS","VITRIC","VITTA","VITTAE","VITTLE","VIVA","VIVACE","VIVARY","VIVAS","VIVE","VIVERS","VIVID","VIVIFY","VIXEN","VIXENS","VIZARD","VIZIER","VIZIR","VIZIRS","VIZOR","VIZORS","VIZSLA","VOCAL","VOCALS","VOCES","VODKA","VODKAS","VODOUN","VODUN","VODUNS","VOE","VOES","VOGIE","VOGUE","VOGUED","VOGUER","VOGUES","VOICE","VOICED","VOICER","VOICES","VOID","VOIDED","VOIDER","VOIDS","VOILA","VOILE","VOILES","VOLANT","VOLAR","VOLE","VOLED","VOLERY","VOLES","VOLING","VOLLEY","VOLOST","VOLT","VOLTA","VOLTE","VOLTES","VOLTI","VOLTS","VOLUME","VOLUTE","VOLVA","VOLVAS","VOLVOX","VOMER","VOMERS","VOMICA","VOMIT","VOMITO","VOMITS","VOODOO","VORTEX","VOTARY","VOTE","VOTED","VOTER","VOTERS","VOTES","VOTING","VOTIVE","VOUCH","VOW","VOWED","VOWEL","VOWELS","VOWER","VOWERS","VOWING","VOWS","VOX","VOYAGE","VOYEUR","VROOM","VROOMS","VROUW","VROUWS","VROW","VROWS","VUG","VUGG","VUGGS","VUGGY","VUGH","VUGHS","VUGS","VULGAR","VULGO","VULGUS","VULVA","VULVAE","VULVAL","VULVAR","VULVAS","VYING","WAB","WABBLE","WABBLY","WABS","WACK","WACKE","WACKES","WACKO","WACKOS","WACKS","WACKY","WAD","WADDED","WADDER","WADDIE","WADDLE","WADDLY","WADDY","WADE","WADED","WADER","WADERS","WADES","WADI","WADIES","WADING","WADIS","WADMAL","WADMEL","WADMOL","WADS","WADSET","WADY","WAE","WAEFUL","WAES","WAFER","WAFERS","WAFERY","WAFF","WAFFED","WAFFIE","WAFFLE","WAFFS","WAFT","WAFTED","WAFTER","WAFTS","WAG","WAGE","WAGED","WAGER","WAGERS","WAGES","WAGGED","WAGGER","WAGGLE","WAGGLY","WAGGON","WAGING","WAGON","WAGONS","WAGS","WAHINE","WAHOO","WAHOOS","WAIF","WAIFED","WAIFS","WAIL","WAILED","WAILER","WAILS","WAIN","WAINS","WAIR","WAIRED","WAIRS","WAIST","WAISTS","WAIT","WAITED","WAITER","WAITS","WAIVE","WAIVED","WAIVER","WAIVES","WAKE","WAKED","WAKEN","WAKENS","WAKER","WAKERS","WAKES","WAKIKI","WAKING","WALE","WALED","WALER","WALERS","WALES","WALIES","WALING","WALK","WALKED","WALKER","WALKS","WALKUP","WALL","WALLA","WALLAH","WALLAS","WALLED","WALLET","WALLIE","WALLOP","WALLOW","WALLS","WALLY","WALNUT","WALRUS","WALTZ","WALY","WAMBLE","WAMBLY","WAME","WAMES","WAMMUS","WAMPUM","WAMPUS","WAMUS","WAN","WAND","WANDER","WANDLE","WANDS","WANE","WANED","WANES","WANEY","WANGAN","WANGLE","WANGUN","WANIER","WANING","WANION","WANLY","WANNED","WANNER","WANS","WANT","WANTED","WANTER","WANTON","WANTS","WANY","WAP","WAPITI","WAPPED","WAPS","WAR","WARBLE","WARD","WARDED","WARDEN","WARDER","WARDS","WARE","WARED","WARES","WARIER","WARILY","WARING","WARK","WARKED","WARKS","WARM","WARMED","WARMER","WARMLY","WARMS","WARMTH","WARMUP","WARN","WARNED","WARNER","WARNS","WARP","WARPED","WARPER","WARPS","WARRED","WARREN","WARS","WARSAW","WARSLE","WART","WARTED","WARTS","WARTY","WARY","WAS","WASABI","WASH","WASHED","WASHER","WASHES","WASHUP","WASHY","WASP","WASPS","WASPY","WAST","WASTE","WASTED","WASTER","WASTES","WASTRY","WASTS","WAT","WATAP","WATAPE","WATAPS","WATCH","WATER","WATERS","WATERY","WATS","WATT","WATTER","WATTLE","WATTS","WAUCHT","WAUGH","WAUGHT","WAUK","WAUKED","WAUKS","WAUL","WAULED","WAULS","WAUR","WAVE","WAVED","WAVER","WAVERS","WAVERY","WAVES","WAVEY","WAVEYS","WAVIER","WAVIES","WAVILY","WAVING","WAVY","WAW","WAWL","WAWLED","WAWLS","WAWS","WAX","WAXED","WAXEN","WAXER","WAXERS","WAXES","WAXIER","WAXILY","WAXING","WAXY","WAY","WAYLAY","WAYS","WEAK","WEAKEN","WEAKER","WEAKLY","WEAL","WEALD","WEALDS","WEALS","WEALTH","WEAN","WEANED","WEANER","WEANS","WEAPON","WEAR","WEARER","WEARS","WEARY","WEASEL","WEASON","WEAVE","WEAVED","WEAVER","WEAVES","WEB","WEBBED","WEBBY","WEBER","WEBERS","WEBFED","WEBS","WECHT","WECHTS","WED","WEDDED","WEDDER","WEDEL","WEDELN","WEDELS","WEDGE","WEDGED","WEDGES","WEDGIE","WEDGY","WEDS","WEE","WEED","WEEDED","WEEDER","WEEDS","WEEDY","WEEK","WEEKLY","WEEKS","WEEL","WEEN","WEENED","WEENIE","WEENS","WEENSY","WEENY","WEEP","WEEPER","WEEPIE","WEEPS","WEEPY","WEER","WEES","WEEST","WEET","WEETED","WEETS","WEEVER","WEEVIL","WEEWEE","WEFT","WEFTS","WEIGH","WEIGHS","WEIGHT","WEINER","WEIR","WEIRD","WEIRDO","WEIRDS","WEIRDY","WEIRS","WEKA","WEKAS","WELCH","WELD","WELDED","WELDER","WELDOR","WELDS","WELKIN","WELL","WELLED","WELLIE","WELLS","WELLY","WELSH","WELT","WELTED","WELTER","WELTS","WEN","WENCH","WEND","WENDED","WENDS","WENNY","WENS","WENT","WEPT","WERE","WERT","WESKIT","WEST","WESTER","WESTS","WET","WETHER","WETLY","WETS","WETTED","WETTER","WHA","WHACK","WHACKO","WHACKS","WHACKY","WHALE","WHALED","WHALER","WHALES","WHAM","WHAMMO","WHAMMY","WHAMO","WHAMS","WHANG","WHANGS","WHAP","WHAPS","WHARF","WHARFS","WHARVE","WHAT","WHATS","WHAUP","WHAUPS","WHEAL","WHEALS","WHEAT","WHEATS","WHEE","WHEEL","WHEELS","WHEEN","WHEENS","WHEEP","WHEEPS","WHEEZE","WHEEZY","WHELK","WHELKS","WHELKY","WHELM","WHELMS","WHELP","WHELPS","WHEN","WHENAS","WHENCE","WHENS","WHERE","WHERES","WHERRY","WHERVE","WHET","WHETS","WHEW","WHEWS","WHEY","WHEYEY","WHEYS","WHICH","WHID","WHIDAH","WHIDS","WHIFF","WHIFFS","WHIG","WHIGS","WHILE","WHILED","WHILES","WHILOM","WHILST","WHIM","WHIMS","WHIMSY","WHIN","WHINE","WHINED","WHINER","WHINES","WHINEY","WHINGE","WHINNY","WHINS","WHINY","WHIP","WHIPPY","WHIPS","WHIPT","WHIR","WHIRL","WHIRLS","WHIRLY","WHIRR","WHIRRS","WHIRRY","WHIRS","WHISH","WHISHT","WHISK","WHISKS","WHISKY","WHIST","WHISTS","WHIT","WHITE","WHITED","WHITEN","WHITER","WHITES","WHITEY","WHITS","WHITY","WHIZ","WHIZZ","WHO","WHOA","WHOLE","WHOLES","WHOLLY","WHOM","WHOMP","WHOMPS","WHOMSO","WHOOF","WHOOFS","WHOOP","WHOOPS","WHOOSH","WHOP","WHOPS","WHORE","WHORED","WHORES","WHORL","WHORLS","WHORT","WHORTS","WHOSE","WHOSIS","WHOSO","WHUMP","WHUMPS","WHY","WHYDAH","WHYS","WICH","WICHES","WICK","WICKED","WICKER","WICKET","WICKS","WICOPY","WIDDER","WIDDIE","WIDDLE","WIDDY","WIDE","WIDELY","WIDEN","WIDENS","WIDER","WIDES","WIDEST","WIDGET","WIDISH","WIDOW","WIDOWS","WIDTH","WIDTHS","WIELD","WIELDS","WIELDY","WIENER","WIENIE","WIFE","WIFED","WIFELY","WIFES","WIFING","WIFTY","WIG","WIGAN","WIGANS","WIGEON","WIGGED","WIGGLE","WIGGLY","WIGGY","WIGHT","WIGHTS","WIGLET","WIGS","WIGWAG","WIGWAM","WIKIUP","WILCO","WILD","WILDER","WILDLY","WILDS","WILE","WILED","WILES","WILFUL","WILIER","WILILY","WILING","WILL","WILLED","WILLER","WILLET","WILLOW","WILLS","WILLY","WILT","WILTED","WILTS","WILY","WIMBLE","WIMP","WIMPLE","WIMPS","WIMPY","WIN","WINCE","WINCED","WINCER","WINCES","WINCEY","WINCH","WIND","WINDED","WINDER","WINDLE","WINDOW","WINDS","WINDUP","WINDY","WINE","WINED","WINERY","WINES","WINEY","WING","WINGED","WINGER","WINGS","WINGY","WINIER","WINING","WINISH","WINK","WINKED","WINKER","WINKLE","WINKS","WINNED","WINNER","WINNOW","WINO","WINOES","WINOS","WINS","WINTER","WINTLE","WINTRY","WINY","WINZE","WINZES","WIPE","WIPED","WIPER","WIPERS","WIPES","WIPING","WIRE","WIRED","WIRER","WIRERS","WIRES","WIRIER","WIRILY","WIRING","WIRRA","WIRY","WIS","WISDOM","WISE","WISED","WISELY","WISENT","WISER","WISES","WISEST","WISH","WISHA","WISHED","WISHER","WISHES","WISING","WISP","WISPED","WISPS","WISPY","WISS","WISSED","WISSES","WIST","WISTED","WISTS","WIT","WITAN","WITCH","WITCHY","WITE","WITED","WITES","WITH","WITHAL","WITHE","WITHED","WITHER","WITHES","WITHIN","WITHY","WITING","WITNEY","WITS","WITTED","WITTOL","WITTY","WIVE","WIVED","WIVER","WIVERN","WIVERS","WIVES","WIVING","WIZ","WIZARD","WIZEN","WIZENS","WIZES","WIZZEN","WOAD","WOADED","WOADS","WOALD","WOALDS","WOBBLE","WOBBLY","WODGE","WODGES","WOE","WOEFUL","WOES","WOFUL","WOG","WOGS","WOK","WOKE","WOKEN","WOKS","WOLD","WOLDS","WOLF","WOLFED","WOLFER","WOLFS","WOLVER","WOLVES","WOMAN","WOMANS","WOMB","WOMBAT","WOMBED","WOMBS","WOMBY","WOMEN","WOMERA","WON","WONDER","WONK","WONKS","WONKY","WONNED","WONNER","WONS","WONT","WONTED","WONTON","WONTS","WOO","WOOD","WOODED","WOODEN","WOODIE","WOODS","WOODSY","WOODY","WOOED","WOOER","WOOERS","WOOF","WOOFED","WOOFER","WOOFS","WOOING","WOOL","WOOLED","WOOLEN","WOOLER","WOOLIE","WOOLLY","WOOLS","WOOLY","WOOPS","WOOS","WOOSH","WOOZY","WOP","WOPS","WORD","WORDED","WORDS","WORDY","WORE","WORK","WORKED","WORKER","WORKS","WORKUP","WORLD","WORLDS","WORM","WORMED","WORMER","WORMIL","WORMS","WORMY","WORN","WORRIT","WORRY","WORSE","WORSEN","WORSER","WORSES","WORSET","WORST","WORSTS","WORT","WORTH","WORTHS","WORTHY","WORTS","WOS","WOST","WOT","WOTS","WOTTED","WOULD","WOUND","WOUNDS","WOVE","WOVEN","WOVENS","WOW","WOWED","WOWING","WOWS","WOWSER","WRACK","WRACKS","WRAITH","WRANG","WRANGS","WRAP","WRAPS","WRAPT","WRASSE","WRATH","WRATHS","WRATHY","WREAK","WREAKS","WREATH","WRECK","WRECKS","WREN","WRENCH","WRENS","WREST","WRESTS","WRETCH","WRICK","WRICKS","WRIED","WRIER","WRIES","WRIEST","WRIGHT","WRING","WRINGS","WRIST","WRISTS","WRISTY","WRIT","WRITE","WRITER","WRITES","WRITHE","WRITS","WRONG","WRONGS","WROTE","WROTH","WRUNG","WRY","WRYER","WRYEST","WRYING","WRYLY","WUD","WURST","WURSTS","WURZEL","WUSS","WUSSES","WUSSY","WUTHER","WYCH","WYCHES","WYE","WYES","WYLE","WYLED","WYLES","WYLING","WYN","WYND","WYNDS","WYNN","WYNNS","WYNS","WYTE","WYTED","WYTES","WYTING","WYVERN","XEBEC","XEBECS","XENIA","XENIAL","XENIAS","XENIC","XENON","XENONS","XERIC","XEROX","XERUS","XIS","XYLAN","XYLANS","XYLEM","XYLEMS","XYLENE","XYLOID","XYLOL","XYLOLS","XYLOSE","XYLYL","XYLYLS","XYST","XYSTER","XYSTI","XYSTOI","XYSTOS","XYSTS","XYSTUS","YABBER","YACHT","YACHTS","YACK","YACKED","YACKS","YAFF","YAFFED","YAFFS","YAGER","YAGERS","YAGI","YAGIS","YAH","YAHOO","YAHOOS","YAIRD","YAIRDS","YAK","YAKKED","YAKKER","YAKS","YALD","YAM","YAMEN","YAMENS","YAMMER","YAMS","YAMUN","YAMUNS","YANG","YANGS","YANK","YANKED","YANKS","YANQUI","YANTRA","YAP","YAPOCK","YAPOK","YAPOKS","YAPON","YAPONS","YAPPED","YAPPER","YAPS","YAR","YARD","YARDED","YARDS","YARE","YARELY","YARER","YAREST","YARN","YARNED","YARNER","YARNS","YARROW","YASMAK","YATTER","YAUD","YAUDS","YAULD","YAUP","YAUPED","YAUPER","YAUPON","YAUPS","YAUTIA","YAW","YAWED","YAWING","YAWL","YAWLED","YAWLS","YAWN","YAWNED","YAWNER","YAWNS","YAWP","YAWPED","YAWPER","YAWPS","YAWS","YAY","YAYS","YCLEPT","YEA","YEAH","YEAN","YEANED","YEANS","YEAR","YEARLY","YEARN","YEARNS","YEARS","YEAS","YEAST","YEASTS","YEASTY","YECCH","YECCHS","YECH","YECHS","YECHY","YEELIN","YEGG","YEGGS","YEH","YELD","YELK","YELKS","YELL","YELLED","YELLER","YELLOW","YELLS","YELP","YELPED","YELPER","YELPS","YEN","YENNED","YENS","YENTA","YENTAS","YENTE","YENTES","YEOMAN","YEOMEN","YEP","YERBA","YERBAS","YERK","YERKED","YERKS","YES","YESES","YESSED","YESSES","YESTER","YET","YETI","YETIS","YETT","YETTS","YEUK","YEUKED","YEUKS","YEUKY","YEW","YEWS","YID","YIDS","YIELD","YIELDS","YIKES","YILL","YILLS","YIN","YINCE","YINS","YIP","YIPE","YIPES","YIPPED","YIPPEE","YIPPIE","YIPS","YIRD","YIRDS","YIRR","YIRRED","YIRRS","YIRTH","YIRTHS","YLEM","YLEMS","YOB","YOBBO","YOBBOS","YOBS","YOCK","YOCKED","YOCKS","YOD","YODEL","YODELS","YODH","YODHS","YODLE","YODLED","YODLER","YODLES","YODS","YOGA","YOGAS","YOGEE","YOGEES","YOGH","YOGHS","YOGI","YOGIC","YOGIN","YOGINI","YOGINS","YOGIS","YOGURT","YOICKS","YOK","YOKE","YOKED","YOKEL","YOKELS","YOKES","YOKING","YOKS","YOLK","YOLKED","YOLKS","YOLKY","YOM","YOMIM","YON","YOND","YONDER","YONI","YONIC","YONIS","YONKER","YORE","YORES","YOU","YOUNG","YOUNGS","YOUPON","YOUR","YOURN","YOURS","YOUSE","YOUTH","YOUTHS","YOW","YOWE","YOWED","YOWES","YOWIE","YOWIES","YOWING","YOWL","YOWLED","YOWLER","YOWLS","YOWS","YTTRIA","YTTRIC","YUAN","YUANS","YUCA","YUCAS","YUCCA","YUCCAS","YUCCH","YUCH","YUCK","YUCKED","YUCKS","YUCKY","YUGA","YUGAS","YUK","YUKKED","YUKS","YULAN","YULANS","YULE","YULES","YUM","YUMMY","YUP","YUPON","YUPONS","YUPPIE","YUPS","YURT","YURTA","YURTS","YWIS","ZADDIK","ZAFFAR","ZAFFER","ZAFFIR","ZAFFRE","ZAFTIG","ZAG","ZAGGED","ZAGS","ZAIKAI","ZAIRE","ZAIRES","ZAMIA","ZAMIAS","ZANANA","ZANDER","ZANIER","ZANIES","ZANILY","ZANY","ZANZA","ZANZAS","ZAP","ZAPPED","ZAPPER","ZAPPY","ZAPS","ZAREBA","ZARF","ZARFS","ZARIBA","ZAX","ZAXES","ZAYIN","ZAYINS","ZAZEN","ZAZENS","ZEAL","ZEALOT","ZEALS","ZEATIN","ZEBEC","ZEBECK","ZEBECS","ZEBRA","ZEBRAS","ZEBU","ZEBUS","ZECHIN","ZED","ZEDS","ZEE","ZEES","ZEIN","ZEINS","ZEK","ZEKS","ZENANA","ZENITH","ZEPHYR","ZERK","ZERKS","ZERO","ZEROED","ZEROES","ZEROS","ZEROTH","ZEST","ZESTED","ZESTER","ZESTS","ZESTY","ZETA","ZETAS","ZEUGMA","ZIBET","ZIBETH","ZIBETS","ZIG","ZIGGED","ZIGS","ZIGZAG","ZILCH","ZILL","ZILLAH","ZILLS","ZIN","ZINC","ZINCED","ZINCIC","ZINCKY","ZINCS","ZINCY","ZINEB","ZINEBS","ZING","ZINGED","ZINGER","ZINGS","ZINGY","ZINKY","ZINNIA","ZINS","ZIP","ZIPPED","ZIPPER","ZIPPY","ZIPS","ZIRAM","ZIRAMS","ZIRCON","ZIT","ZITHER","ZITI","ZITIS","ZITS","ZIZIT","ZIZITH","ZIZZLE","ZLOTE","ZLOTY","ZLOTYS","ZOA","ZOARIA","ZODIAC","ZOEA","ZOEAE","ZOEAL","ZOEAS","ZOECIA","ZOFTIG","ZOIC","ZOMBI","ZOMBIE","ZOMBIS","ZONAL","ZONARY","ZONATE","ZONE","ZONED","ZONER","ZONERS","ZONES","ZONING","ZONK","ZONKED","ZONKS","ZONULA","ZONULE","ZOO","ZOOID","ZOOIDS","ZOOKS","ZOOM","ZOOMED","ZOOMS","ZOON","ZOONAL","ZOONS","ZOOS","ZOOTY","ZORI","ZORIL","ZORILS","ZORIS","ZOSTER","ZOUAVE","ZOUNDS","ZOWIE","ZOYSIA","ZYDECO","ZYGOID","ZYGOMA","ZYGOSE","ZYGOTE","ZYMASE","ZYME","ZYMES"]);
var VOWELS = { A: 1, E: 1, I: 1, O: 1, U: 1 };
var KEYBOARD_ROWS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];
var SCRABBLE_VALUES = { A: 1, B: 3, C: 3, D: 2, E: 1, F: 4, G: 2, H: 4, I: 1, J: 8, K: 5, L: 1, M: 3, N: 1, O: 1, P: 3, Q: 10, R: 1, S: 1, T: 1, U: 1, V: 4, W: 4, X: 8, Y: 4, Z: 10 };
var RARE_LETTERS = { J: 1, Q: 1, X: 1, Z: 1, V: 1, W: 1, K: 1 };
var PRIME_LETTERS = { B: 1, C: 1, E: 1, G: 1, K: 1, M: 1, Q: 1, S: 1, W: 1 };
var SYMMETRIC_LETTERS = { B: 1, C: 1, D: 1, E: 1, H: 1, I: 1, K: 1, O: 1, X: 1 };
var ROMAN_LETTERS = { I: 1, V: 1, X: 1, L: 1, C: 1, D: 1, M: 1 };
var ANAGRAM_WORDS = {};
WORDS.forEach(function (word) {
  if (word.length < 3 || word.length > 6) return;
  var key = word.split("").sort().join("");
  if (!ANAGRAM_WORDS[key]) ANAGRAM_WORDS[key] = [];
  ANAGRAM_WORDS[key].push(word);
});
var SECRET_CODE = "dkfkdkfjdjfj";
var COOLDOWN_MS = 10 * 60 * 1000;

var TIER_COLORS = {
  Trash: "#94a3b8", Common: "#a1a1aa", Uncommon: "#22c55e",
  Rare: "#3b82f6", Epic: "#a855f7", Legendary: "#f59e0b", Mythic: "#f43f5e",
  Divine: "#ec4899", Cosmic: "#8b5cf6"
};
var RARITY_COLORS = {
  common: "#a1a1aa", uncommon: "#22c55e", rare: "#3b82f6",
  epic: "#a855f7", legendary: "#f59e0b", mythic: "#f43f5e"
};

/* ================= theme ================= */
function getTheme() { return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light"; }
function setTheme(t) {
  document.documentElement.setAttribute("data-theme", t);
  try { localStorage.setItem("sixroll_theme", t); } catch (e) {}
}
document.getElementById("themeToggle").addEventListener("click", function () {
  setTheme(getTheme() === "dark" ? "light" : "dark");
});

/* ================= toast ================= */
function showToast(msg) {
  var t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(showToast._tid);
  showToast._tid = setTimeout(function () { t.classList.remove("show"); }, 2400);
}

/* ================= confetti ================= */
function spawnConfetti(colors, count) {
  var root = document.getElementById("confettiRoot");
  for (var i = 0; i < count; i++) {
    (function () {
      var el = document.createElement("div");
      el.className = "confetti-piece";
      var color = colors[Math.floor(Math.random() * colors.length)];
      el.style.background = color;
      el.style.left = (Math.random() * 100) + "vw";
      el.style.borderRadius = Math.random() > .5 ? "50%" : "2px";
      var duration = 2200 + Math.random() * 1600;
      el.style.animationDuration = duration + "ms";
      el.style.animationDelay = (Math.random() * 300) + "ms";
      root.appendChild(el);
      setTimeout(function () { el.remove(); }, duration + 500);
    })();
  }
}

/* ================= secret test-mode toggle (unchanged behavior) ================= */
var typedBuffer = "";
document.addEventListener("keydown", function (e) {
  if (e.key.length === 1) {
    typedBuffer = (typedBuffer + e.key.toLowerCase()).slice(-40);
    if (typedBuffer.indexOf(SECRET_CODE) !== -1) {
      typedBuffer = "";
      var enabled = localStorage.getItem("sixroll_unlimited") === "1";
      localStorage.setItem("sixroll_unlimited", enabled ? "0" : "1");
      updateUnlimitedUI();
      syncCooldownUI();
      showToast(enabled ? "Test mode off" : "Test mode: unlimited rolls");
    }
  }
});
function updateUnlimitedUI() {
  var on = localStorage.getItem("sixroll_unlimited") === "1";
  document.getElementById("unlimitedBadge").style.display = on ? "inline-block" : "none";
}

/* ================= auth ================= */
var authState = { user: null };

function getName() {
  if (authState.user && authState.user.name) return authState.user.name;
  return (localStorage.getItem("sixroll_name") || "").trim();
}

function setAuthStatus(message, kind) {
  var statusEl = document.getElementById("authStatus");
  if (!statusEl) return;
  statusEl.textContent = message || "";
  statusEl.className = "auth-status" + (kind ? " " + kind : "");
}

var profileEditMode = false;

function setProfileEditMode(enabled) {
  profileEditMode = enabled;
  var nameInput = document.getElementById("accountNameInput");
  var saveBtn = document.getElementById("saveNameBtn");
  var editBtn = document.getElementById("editProfileBtn");
  if (nameInput) {
    nameInput.disabled = !enabled;
    nameInput.classList.toggle("editing", enabled);
    if (enabled) nameInput.focus();
  }
  if (saveBtn) saveBtn.disabled = !enabled;
  if (editBtn) editBtn.textContent = enabled ? "Cancel edit" : "Edit profile";
}

function updateAuthUI() {
  var signedOut = document.getElementById("authSignedOut");
  var signedIn = document.getElementById("authSignedIn");
  var emailEl = document.getElementById("accountEmail");
  var nameInput = document.getElementById("accountNameInput");
  var pageTitle = document.getElementById("accountPageTitle");
  var pageSubtitle = document.getElementById("accountPageSubtitle");
  var avatar = document.getElementById("authAvatar");
  var navLink = document.getElementById("accountNavLink");
  if (!signedOut || !signedIn || !emailEl || !nameInput) return;
  if (authState.user) {
    document.documentElement.classList.add("profile-mode");
    signedOut.hidden = true;
    signedIn.hidden = false;
    emailEl.textContent = authState.user.email || "Signed in";
    nameInput.value = authState.user.name || "";
    setProfileEditMode(false);
    if (pageTitle) pageTitle.textContent = authState.user.name || authState.user.email || "Profile";
    if (pageSubtitle) pageSubtitle.textContent = "";
    if (avatar) {
      var initial = (authState.user.name || authState.user.email || "?").trim().charAt(0).toUpperCase();
      avatar.textContent = initial || "?";
    }
    if (navLink) navLink.textContent = "Hi, " + (authState.user.name || (authState.user.email || "there").split("@")[0]);
  } else {
    document.documentElement.classList.remove("profile-mode");
    signedOut.hidden = false;
    signedIn.hidden = true;
    nameInput.value = "";
    setProfileEditMode(false);
    if (pageTitle) pageTitle.textContent = "Sign in";
    if (pageSubtitle) pageSubtitle.textContent = "Save your rolls and claim your spot on the leaderboard.";
    if (navLink) navLink.textContent = "Account";
    var overviewEl = document.getElementById("accountOverview");
    if (overviewEl && window.location.pathname === "/account") {
      overviewEl.hidden = true;
    }
  }
}

async function refreshAuthState() {
  try {
    var response = await fetch("/api/auth/me", { cache: "no-store" });
    if (!response.ok) throw new Error("Not signed in");
    var data = await response.json();
    authState.user = data.user || null;
  } catch (e) {
    authState.user = null;
  }
  updateAuthUI();
  if (window.location.pathname.startsWith("/account")) {
    var explicitName = getAccountPathName();
    if (authState.user || explicitName) {
      initializeAccountOverview(explicitName).catch(function () {});
    } else {
      var overviewEl = document.getElementById("accountOverview");
      if (overviewEl) overviewEl.hidden = true;
    }
    var pageWrap = document.getElementById("accountPageWrap");
    if (pageWrap) pageWrap.classList.add("ready");
  }
}

function getAccountPathName() {
  var path = window.location.pathname;
  if (path.startsWith("/account/")) return decodeURIComponent(path.slice("/account/".length));
  return null;
}

function formatTimestamp(ts) {
  if (!ts) return "—";
  var date = new Date(Number(ts));
  if (Number.isNaN(date.getTime())) return "—";
  return date.toISOString().slice(0, 19).replace("T", " ");
}

function renderPlayerOverview(summary, isCurrentUser) {
  var overview = document.getElementById("accountOverview");
  var pageWrap = document.getElementById("accountPageWrap");
  if (!overview) return;
  if (pageWrap) pageWrap.classList.toggle("profile-active", !!isCurrentUser);
  var title = document.getElementById("overviewTitle");
  var subtitle = document.getElementById("overviewSubtitle");
  var avatar = document.getElementById("overviewAvatar");
  var username = document.getElementById("overviewUsername");
  var displayName = document.getElementById("overviewDisplayName");
  var bestRoll = document.getElementById("overviewBestRoll");
  var rollCount = document.getElementById("overviewRollCount");
  var recentRolls = document.getElementById("recentRolls");
  if (avatar) avatar.textContent = (summary.displayName || summary.username || "?").trim().charAt(0).toUpperCase() || "?";
  if (title) title.textContent = summary.displayName || summary.username || "Player";
  if (subtitle) subtitle.textContent = isCurrentUser ? "Your rolls, stats, and leaderboard history." : "Leaderboard activity and top rolls for this player.";
  if (username) username.textContent = summary.username ? "#" + summary.username : "#—";
  if (displayName) displayName.textContent = summary.displayName || "—";
  if (bestRoll) {
    if (summary.bestRoll) {
      bestRoll.innerHTML = '<span class="profile-best-word">' + escapeHtml(summary.bestRoll.word) + '</span> <span class="profile-best-ep">' + Number(summary.bestRoll.ep || 0).toLocaleString() + ' EP</span>';
    } else {
      bestRoll.textContent = "No rolls yet";
    }
  }
  if (rollCount) rollCount.textContent = String(summary.rollCount || 0);
  var totalEP = Number(summary.totalEP != null ? summary.totalEP : (summary.totalEp != null ? summary.totalEp : 0)) || 0;
  var totalEPEl = document.getElementById("overviewTotalEP");
  if (totalEPEl) totalEPEl.textContent = totalEP.toLocaleString() + " EP";
  var totalEPRankEl = document.getElementById("overviewTotalEPRank");
  if (totalEPRankEl) totalEPRankEl.textContent = summary.totalEPRank != null ? "Rank #" + summary.totalEPRank + " · Total EP" : "Total EP earned from all saved rolls";
  var joinDateEl = document.getElementById("overviewJoinDate");
  if (joinDateEl) joinDateEl.textContent = summary.createdAt ? new Date(Number(summary.createdAt)).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "—";
  var bestRollStat = document.getElementById("bestRollStat");
  if (bestRollStat && summary.bestRoll) {
    var bestTier = tierForEP(Number(summary.bestRoll.ep) || 0);
    var bestColor = colorForEP(Number(summary.bestRoll.ep) || 0);
    bestRollStat.className = "profile-feature-stat profile-best-stat rarity-" + bestTier.toLowerCase();
    bestRollStat.style.setProperty("--badge-color", bestColor);
    var bestMeta = bestRollStat.querySelector(".profile-stat-meta");
    if (bestMeta) bestMeta.textContent = bestTier + (summary.bestRoll.rank != null ? " · Rank #" + summary.bestRoll.rank : "");
  }
  if (recentRolls) {
    recentRolls.innerHTML = "";
    if (!summary.recentRolls || !summary.recentRolls.length) {
      recentRolls.innerHTML = "<div class='profile-description'>No recent rolls yet.</div>";
    } else {
      summary.recentRolls.forEach(function (roll) {
        var item = document.createElement("div");
        item.className = "recent-roll";
        var recentTier = tierForEP(roll.ep).toLowerCase();
        item.classList.add("rarity-" + recentTier);
        item.style.setProperty("--badge-color", colorForEP(roll.ep));
        var main = document.createElement("div");
        main.className = "recent-roll-main";
        var recentTierLabel = tierForEP(roll.ep);
        var recentColor = colorForEP(roll.ep);
        main.innerHTML = "<span class='recent-roll-word profile-roll-word' style='color:" + recentColor + "'>" + escapeHtml(roll.word) + "</span>" +
          "<span class='recent-roll-meta'><span class='roll-rarity show rarity-" + recentTier + "' style='color:" + recentColor + ";background:color-mix(in srgb, " + recentColor + " 14%, transparent)'><span class='tier-label'>" + recentTierLabel + "</span></span><span class='recent-roll-ep profile-roll-ep'>" + Number(roll.ep || 0).toLocaleString() + " EP</span>" + (roll.rank != null ? "<span>Rank #" + roll.rank + "</span>" : "") + "<span>" + escapeHtml(formatTimestamp(roll.ts)) + "</span></span>";
        item.appendChild(main);
        recentRolls.appendChild(item);
      });
    }
  }
  overview.hidden = false;
}

async function initializeAccountOverview(explicitName) {
  var pathName = explicitName || getAccountPathName();
  var isSelf = !pathName;
  var playerName = pathName || (authState.user ? authState.user.email || authState.user.name || "" : "");
  var signedIn = !!authState.user;
  var signedOutEl = document.getElementById("authSignedOut");
  var signedInEl = document.getElementById("authSignedIn");
  var pageWrap = document.getElementById("accountPageWrap");
  var accountCard = document.querySelector(".account-card");
  var overviewEl = document.getElementById("accountOverview");
  var pageTitle = document.getElementById("accountPageTitle");
  var pageSubtitle = document.getElementById("accountPageSubtitle");

  if (pageWrap) {
    pageWrap.classList.toggle("public-profile", !!pathName && !isSelf);
    pageWrap.classList.toggle("profile-mode", !!signedIn && isSelf);
  }
  document.documentElement.classList.toggle("profile-mode", !!signedIn && isSelf);

  if (pathName) {
    var currentUserName = authState.user ? (authState.user.name || authState.user.email || "").toLowerCase() : "";
    var targetName = playerName.toLowerCase();
    var isCurrentUser = signedIn && currentUserName === targetName;

    if (signedOutEl) signedOutEl.hidden = true;
    if (signedInEl) signedInEl.hidden = !isCurrentUser;
    if (accountCard) accountCard.hidden = !isCurrentUser;
    if (overviewEl) overviewEl.hidden = isCurrentUser;

    if (isCurrentUser) {
      if (pageTitle) pageTitle.textContent = "";
      if (pageSubtitle) pageSubtitle.textContent = "";
    } else {
      if (pageTitle) pageTitle.textContent = "Player profile";
      if (pageSubtitle) pageSubtitle.textContent = "Public leaderboard stats for " + escapeHtml(playerName) + ".";
    }
  } else if (signedIn) {
    if (signedOutEl) signedOutEl.hidden = true;
    if (signedInEl) signedInEl.hidden = true;
    if (accountCard) accountCard.hidden = true;
    if (overviewEl) overviewEl.hidden = false;
    if (pageTitle) pageTitle.textContent = "";
    if (pageSubtitle) pageSubtitle.textContent = "";
  } else {
    if (signedOutEl) signedOutEl.hidden = false;
    if (signedInEl) signedInEl.hidden = true;
    if (accountCard) accountCard.hidden = false;
    if (overviewEl) overviewEl.hidden = true;
    if (pageTitle) pageTitle.textContent = "Sign in";
    if (pageSubtitle) pageSubtitle.textContent = "Save your rolls and claim your spot on the leaderboard.";
  }

  if (!playerName) {
    return;
  }

  if (overviewEl) {
    overviewEl.hidden = true;
  }

  try {
    var response = await fetch("/api/player/" + encodeURIComponent(playerName));
    if (!response.ok) throw new Error("Player not found");
    var summary = await response.json();
    renderPlayerOverview(summary, isSelf && signedIn);
  } catch (e) {
    if (overviewEl) overviewEl.hidden = true;
    setAuthStatus("Unable to load player overview.", "error");
  }
}

// Profile-page editing mirrors the account controls without rendering the old account panel.
(function bindProfileControls() {
  var editBtn = document.getElementById("editDisplayNameBtn");
  var editor = document.getElementById("profileInlineEditor");
  var input = document.getElementById("profileDisplayNameInput");
  var saveBtn = document.getElementById("profileSaveNameBtn");
  var cancelBtn = document.getElementById("profileCancelNameBtn");
  var signOutBtn = document.getElementById("profileSignOutBtn");

  function closeEditor() {
    if (editor) editor.hidden = true;
  }

  if (editBtn) editBtn.addEventListener("click", function () {
    if (!editor || !input) return;
    input.value = authState.user && authState.user.name ? authState.user.name : "";
    editor.hidden = false;
    input.focus();
    input.select();
  });

  if (cancelBtn) cancelBtn.addEventListener("click", closeEditor);

  if (saveBtn) saveBtn.addEventListener("click", async function () {
    if (!authState.user || !input) return;
    var name = (input.value || "").trim().slice(0, 20);
    saveBtn.disabled = true;
    try {
      var response = await fetch("/api/auth/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name })
      });
      var data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to save your profile");
      authState.user = data.user || authState.user;
      closeEditor();
      updateAuthUI();
      await initializeAccountOverview();
      showToast("Profile updated");
    } catch (e) {
      setAuthStatus(e.message || "Unable to save your profile.", "error");
    } finally {
      saveBtn.disabled = false;
    }
  });

  if (signOutBtn) signOutBtn.addEventListener("click", function () {
    var existing = document.getElementById("signOutBtn");
    if (existing) existing.click();
  });
})();

// Password login/register UI behavior
document.getElementById("showRegisterBtn").addEventListener("click", function () {
  document.getElementById("registerPanel").style.display = "block";
});
document.getElementById("hideRegisterBtn").addEventListener("click", function () {
  document.getElementById("registerPanel").style.display = "none";
});

document.getElementById("loginBtn").addEventListener("click", async function () {
  var username = (document.getElementById("usernameInput").value || "").trim();
  var password = (document.getElementById("passwordInput").value || "");
  if (!username || !password) { setAuthStatus("Enter username and password", "error"); return; }
  setAuthStatus("Signing in…", "");
  try {
    var response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username, password: password })
    });
    var data = await response.json();
    if (!response.ok) throw new Error(data.error || "Login failed");
    await refreshAuthState();
    if (authState.user) saveAuthLocal(authState.user);
    setAuthStatus("Signed in", "success");
    document.getElementById("usernameInput").value = "";
    document.getElementById("passwordInput").value = "";
  } catch (e) {
    setAuthStatus(e.message || "Login failed", "error");
  }
});

document.getElementById("registerBtn").addEventListener("click", async function () {
  var username = (document.getElementById("regUsernameInput").value || "").trim();
  var password = (document.getElementById("regPasswordInput").value || "");
  var name = (document.getElementById("regNameInput").value || "").trim();
  if (!username || !password) { setAuthStatus("Choose a username and password", "error"); return; }
  setAuthStatus("Creating account…", "");
  try {
    var response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username, password: password, name: name })
    });
    var data = await response.json();
    if (!response.ok) throw new Error(data.error || "Registration failed");
    await refreshAuthState();
    if (authState.user) saveAuthLocal(authState.user);
    setAuthStatus("Account created and signed in", "success");
    document.getElementById("registerPanel").style.display = "none";
  } catch (e) {
    setAuthStatus(e.message || "Registration failed", "error");
  }
});

document.getElementById("saveNameBtn").addEventListener("click", async function () {
  if (!authState.user) return;
  var nameInput = document.getElementById("accountNameInput");
  var name = (nameInput.value || "").trim().slice(0, 20);
  try {
    var response = await fetch("/api/auth/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name })
    });
    var data = await response.json();
    if (!response.ok) throw new Error(data.error || "Unable to save your profile");
    authState.user = data.user || authState.user;
    updateAuthUI();
    if (window.location.pathname.startsWith("/account")) {
      initializeAccountOverview().catch(function () {});
    }
    setAuthStatus("Profile updated.", "success");
    showToast("Profile updated");
  } catch (e) {
    setAuthStatus(e.message || "Unable to save your profile.", "error");
  }
});

document.getElementById("editProfileBtn").addEventListener("click", function () {
  setProfileEditMode(!profileEditMode);
});

document.getElementById("accountNameInput").addEventListener("input", function () {
  var saveBtn = document.getElementById("saveNameBtn");
  if (saveBtn && profileEditMode) {
    saveBtn.disabled = this.value.trim() === "";
  }
});

document.getElementById("signOutBtn").addEventListener("click", async function () {
  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } catch (e) {}
  authState.user = null;
  clearAuthLocal();
  updateAuthUI();
  if (window.location.pathname.startsWith("/account")) {
    initializeAccountOverview().catch(function () {});
  }
  setAuthStatus("Signed out.", "");
  showToast("Signed out");
});

/* ================= tiles ================= */
function randLetter() { return String.fromCharCode(65 + Math.floor(Math.random() * 26)); }

function buildTiles() {
  var wrap = document.getElementById("tiles");
  wrap.innerHTML = "";
  for (var i = 0; i < 6; i++) {
    var d = document.createElement("div");
    d.className = "tile";
    d.id = "tile" + i;
    d.textContent = "?";
    wrap.appendChild(d);
  }
}
buildTiles();

function resetTiles() {
  for (var i = 0; i < 6; i++) {
    var el = document.getElementById("tile" + i);
    el.className = "tile";
    el.textContent = "?";
    el.style.removeProperty("--tier-color");
  }
}

function revealTile(el, finalLetter, delay) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      el.classList.add("rolling");
      var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      var cycle = 0;
      var cycleTimer = setInterval(function () {
        el.textContent = alphabet[cycle % alphabet.length];
        cycle++;
      }, 75);
      setTimeout(function () {
        clearInterval(cycleTimer);
        el.textContent = finalLetter;
        el.classList.remove("rolling");
        el.classList.add("settled");
        resolve();
      }, 650);
    }, delay);
  });
}

/* ================= scoring ================= */
function findWords(seq) {
  var found = [];
  for (var len = 6; len >= 3; len--) {
    for (var start = 0; start + len <= 6; start++) {
      var sub = seq.slice(start, start + len);
      if (WORDS.has(sub)) found.push({ word: sub, len: len, start: start });
    }
  }
  return found;
}

function findRunSpan(letters) {
  for (var len = 6; len >= 3; len--) {
    for (var start = 0; start + len <= 6; start++) {
      var asc = true, desc = true;
      for (var i = start; i < start + len - 1; i++) {
        var diff = letters[i + 1].charCodeAt(0) - letters[i].charCodeAt(0);
        if (diff !== 1) asc = false;
        if (diff !== -1) desc = false;
      }
      if (asc || desc) return { start: start, len: len };
    }
  }
  return null;
}

function findKeyboardSpan(seq) {
  for (var r = 0; r < KEYBOARD_ROWS.length; r++) {
    var row = KEYBOARD_ROWS[r];
    var rowRev = row.split("").reverse().join("");
    for (var len = 4; len >= 3; len--) {
      for (var start = 0; start + len <= 6; start++) {
        var sub = seq.slice(start, start + len);
        if (row.indexOf(sub) !== -1 || rowRev.indexOf(sub) !== -1) {
          return { start: start, len: len };
        }
      }
    }
  }
  return null;
}

function rangeArr(start, len) {
  var out = [];
  for (var i = 0; i < len; i++) out.push(start + i);
  return out;
}

function findAnagramMatches(letters) {
  var matches = [];
  for (var len = 6; len >= 3; len--) {
    for (var mask = 0; mask < 64; mask++) {
      var positions = [], picked = [];
      for (var bit = 0; bit < 6; bit++) {
        if (mask & (1 << bit)) { positions.push(bit); picked.push(letters[bit]); }
      }
      if (picked.length !== len) continue;
      var candidates = ANAGRAM_WORDS[picked.slice().sort().join("")] || [];
      for (var c = 0; c < candidates.length; c++) {
        var word = candidates[c];
        var contiguous = positions[len - 1] - positions[0] === len - 1;
        if (word !== picked.join("") || !contiguous) return [{ word: word, len: len, positions: positions }];
      }
    }
  }
  return matches;
}

function findAdjacentRepeat(letters) {
  for (var i = 0; i < letters.length - 1; i++) {
    if (letters[i] === letters[i + 1]) return [i, i + 1];
  }
  return null;
}

function isStrictlyAscending(letters) {
  for (var i = 1; i < letters.length; i++) if (letters[i - 1] >= letters[i]) return false;
  return true;
}

function isStrictlyDescending(letters) {
  for (var i = 1; i < letters.length; i++) if (letters[i - 1] <= letters[i]) return false;
  return true;
}

var ROLL_SPACE = Math.pow(26, 6);
// EP follows a steep power curve on rarity (1/probability), so common badges stay
// modest while the rarest possible pulls spike dramatically. The super-linear
// exponent (>1) is what creates the noticeable gap between an ordinary roll and a
// special one: a ~1%-chance badge lands around 4,000 EP, a quintuple (5-of-a-kind)
// spikes to ~7.8M EP, and a sextuple/full-run-of-6 explodes past 1 billion EP.
var EP_CURVE_BASE = 40;
var EP_CURVE_EXPONENT = 1.08;
var probabilityCache = {};

function choose(n, k) {
  if (k < 0 || k > n) return 0;
  k = Math.min(k, n - k);
  var result = 1;
  for (var i = 1; i <= k; i++) result = result * (n - k + i) / i;
  return result;
}

function binomialProbability(n, k, successes, trials) {
  return choose(n, k) * Math.pow(successes / trials, k) * Math.pow((trials - successes) / trials, n - k);
}

function boundedRepeatProbability(maxCount) {
  var key = "repeat:" + maxCount;
  if (probabilityCache[key]) return probabilityCache[key];
  var dp = [1, 0, 0, 0, 0, 0, 0];
  for (var letter = 0; letter < 26; letter++) {
    var next = [0, 0, 0, 0, 0, 0, 0];
    for (var used = 0; used <= 6; used++) {
      for (var add = 0; add <= maxCount && used + add <= 6; add++) {
        next[used + add] += dp[used] / factorial(add);
      }
    }
    dp = next;
  }
  var ways = dp[6] * factorial(6);
  probabilityCache[key] = ways / ROLL_SPACE;
  return probabilityCache[key];
}

function factorial(n) {
  var result = 1;
  for (var i = 2; i <= n; i++) result *= i;
  return result;
}

function exactRepeatProbability(count) {
  return boundedRepeatProbability(count) - boundedRepeatProbability(count - 1);
}

function rangeProbability(minRange, maxRange) {
  var count = 0;
  for (var distance = minRange; distance <= maxRange; distance++) {
    var intervalWays = distance === 0 ? 1 : Math.pow(distance + 1, 6) - 2 * Math.pow(distance, 6) + Math.pow(Math.max(0, distance - 1), 6);
    count += (26 - distance) * intervalWays;
  }
  return count / ROLL_SPACE;
}

function scrabbleSumProbability(test) {
  var key = "scrabble:" + test;
  if (probabilityCache[key]) return probabilityCache[key];
  var dp = [1];
  for (var letter = 0; letter < 6; letter++) {
    var next = [];
    for (var sum = 0; sum < dp.length; sum++) {
      if (!dp[sum]) continue;
      for (var charCode = 65; charCode <= 90; charCode++) {
        var value = SCRABBLE_VALUES[String.fromCharCode(charCode)];
        next[sum + value] = (next[sum + value] || 0) + dp[sum];
      }
    }
    dp = next;
  }
  var matching = 0;
  for (var total = 0; total < dp.length; total++) if (dp[total] && test(total)) matching += dp[total];
  probabilityCache[key] = matching / ROLL_SPACE;
  return probabilityCache[key];
}

function badgeProbability(badge) {
  var name = badge.name;
  if (name === "Six Letters") return 1;
  if (name === "Rainbow") return (26 * 25 * 24 * 23 * 22 * 21) / ROLL_SPACE;
  if (name === "Prime Letters") return Math.pow(9 / 26, 6);
  if (name === "Half Split") return choose(6, 3) * Math.pow(13 / 26, 6);
  if (name === "Vowel Variety") {
    var vowelCoverage = 0;
    for (var omitted = 0; omitted <= 5; omitted++) vowelCoverage += (omitted % 2 ? -1 : 1) * choose(5, omitted) * Math.pow(26 - omitted, 6);
    return vowelCoverage / ROLL_SPACE;
  }
  if (name === "Alphabet Bookends") return 1 - 2 * Math.pow(25 / 26, 6) + Math.pow(24 / 26, 6);
  if (name === "Solo Rare") return binomialProbability(6, 1, 7, 26);
  if (name === "Double Trouble") return choose(26, 2) * choose(24, 2) * factorial(6) / (4 * ROLL_SPACE);
  if (name === "Rising Star" || name === "Falling Star") return choose(26, 6) / ROLL_SPACE;
  if (name === "Bargain Bin") return scrabbleSumProbability(function (sum) { return sum <= 8; });
  if (name === "High Roller") return scrabbleSumProbability(function (sum) { return sum >= 25; });
  if (name === "Triple Q/X/Z") return 1 - Math.pow(23 / 26, 6);
  if (name === "Rare Haul") return 1 - binomialProbability(6, 0, 7, 26) - binomialProbability(6, 1, 7, 26) - binomialProbability(6, 2, 7, 26);
  if (name === "All Vowels") return Math.pow(5 / 26, 6);
  if (name === "No Vowels") return Math.pow(21 / 26, 6);
  if (name === "Vowel Heavy") return binomialProbability(6, 4, 5, 26) + binomialProbability(6, 5, 5, 26);
  if (name === "Vowel Light") return binomialProbability(6, 1, 5, 26) + binomialProbability(6, 2, 5, 26);
  if (name === "Bookend Vowels") return Math.pow(5 / 26, 2);
  if (name === "Sandwich") return Math.pow(5 / 26, 2) * Math.pow(21 / 26, 4);
  if (name === "Center Match") return Math.pow(5 / 26, 2) + Math.pow(21 / 26, 2);
  if (name === "Diphthong") return 1 - (Math.pow(21, 6) + 5 * Math.pow(21, 5) + 10 * Math.pow(21, 4) + 10 * Math.pow(21, 3) + 5 * Math.pow(21, 2) + 1 * 21) / ROLL_SPACE;
  if (name === "Roman Numeral") return Math.pow(7 / 26, 6);
  if (name === "Symmetrical Shapes") return Math.pow(9 / 26, 6);
  if (name === "Full Spectrum") return rangeProbability(20, 25);
  if (name === "Tight Cluster") return rangeProbability(0, 5);
  // "Pair" now requires the repeated letter to sit adjacently (a real double-letter, like the
  // OO in "SPOOKY"), not just to appear twice anywhere in the roll. Exact probability from the
  // same combinatorial enumeration: P(no letter appears 3+ times AND at least one letter repeats
  // in two adjacent slots). Any-position repeats alone are ~43.6% (birthday-paradox math on 6
  // draws from 26 letters) -- too common to feel special -- adjacency brings it down to ~15.6%.
  if (name === "Pair") return 0.15614353085029883;
  if (name === "Triple") return exactRepeatProbability(3);
  if (name === "Quadruple") return exactRepeatProbability(4);
  if (name === "Quintuple") return exactRepeatProbability(5);
  if (name === "Sextuple") return exactRepeatProbability(6);
  if (name === "Perfect Palindrome") return Math.pow(26, 3) / ROLL_SPACE;
  if (name === "Mirror Bookends") return 1 / 26;
  if (name === "Twin Core") return 1 / 26;
  // Word-badge odds below are MEASURED, not guessed: an 8,000,000-roll Monte Carlo simulation
  // was run against the actual dictionary this build ships with (ANAGRAM_WORDS / WORDS), tallying
  // how often each badge really fires. Earlier versions used closed-form approximations that
  // assumed every word of a given length was roughly as likely to appear as a random string of
  // that length -- wildly wrong for a real dictionary, where e.g. 3-letter words hit about 1 roll
  // in 6 (dictionaries are dense in short substrings), not 1 in 4,394. That mismatch is what made
  // a throwaway 3-letter word worth ~40,000 EP -- more than almost every pattern badge combined.
  // If the word list changes again, re-run simulate.js and paste the new numbers in here.
  if (name === "Double Word Score") return 0.0352; // ~1 in 28
  if (name === "Scrambled Long Word") return 0.176751; // 5-6 letter anagram match, ~1 in 5.7
  if (name === "Scrambled Word") return 0.579845; // 3-4 letter anagram match, ~1 in 1.7
  if (name.indexOf("Word") !== -1) {
    var WORD_LEN_PROBABILITY = { 3: 0.1783786, 4: 0.0239776, 5: 0.0014045, 6: 0.0000526 };
    return WORD_LEN_PROBABILITY[badge.wordLength] || WORD_LEN_PROBABILITY[3];
  }
  if (name === "Full Run") return 2 * 21 / ROLL_SPACE;
  if (name === "Long Run") return 2 * 22 / Math.pow(26, 5);
  if (name === "Short Run") return 2 * 23 / Math.pow(26, 4);
  if (name === "Mini Run") return 2 * 24 / Math.pow(26, 3);
  if (name === "Keyboard Walk") return 1 / 500;
  if (name === "Keyboard Echo") return 1 / 100;
  if (name === "Vowel Light") return .5;
  return 1 / 100;
}

function applyProbabilityEP(badges) {
  for (var i = 0; i < badges.length; i++) {
    var badge = badges[i];
    var probability = Math.max(1 / ROLL_SPACE, Math.min(1, badgeProbability(badge)));
    badge.chance = probability;
    if (probability >= 0.999) {
      // Guaranteed-or-near-guaranteed badges (e.g. "Six Letters") stay trivial.
      badge.ep = 1;
    } else {
      var rarity = 1 / probability;
      badge.ep = Math.max(1, Math.round(EP_CURVE_BASE * Math.pow(rarity, EP_CURVE_EXPONENT)));
    }
    badge.desc = badge.desc + " (" + formatChance(probability) + ")";
  }
}

function formatChance(probability) {
  var percent = probability * 100;
  var precision = percent < 0.1 ? 3 : percent < 1 ? 2 : 1;
  return percent.toFixed(precision) + "% chance";
}

function tierForEP(ep) {
  if (ep >= 80000000) return "Cosmic";
  if (ep >= 20000000) return "Divine";
  if (ep >= 2000000) return "Mythic";
  if (ep >= 250000) return "Legendary";
  if (ep >= 50000) return "Epic";
  if (ep >= 10000) return "Rare";
  if (ep >= 2000) return "Uncommon";
  if (ep >= 300) return "Common";
  return "Trash";
}

function colorForEP(ep) {
  return TIER_COLORS[tierForEP(ep)] || TIER_COLORS.Trash;
}

function rankForEP(ep, leaderboard) {
  var scores = (leaderboard || []).map(function (player) { return Number(player.ep) || 0; });
  scores.push(ep);
  scores.sort(function (a, b) { return b - a; });
  var rank = scores.indexOf(ep) + 1;
  return rank <= 20 ? rank : null;
}

function computeRoll(letters) {
  var seq = letters.join("");
  var badges = [];
  var supporting = [];

  var words = findWords(seq);
  if (words.length > 0) {
    var best = words[0];
    var epMap = { 6: 2500, 5: 500, 4: 120, 3: 25 };
    var nameMap = { 6: "Full Word", 5: "Rare Word", 4: "Common Word", 3: "Small Word" };
    var rarityMap = { 6: "mythic", 5: "legendary", 4: "epic", 3: "uncommon" };
    badges.push({
      family: "word", name: nameMap[best.len], ep: epMap[best.len],
      desc: 'Your pull contains "' + best.word + '"', rarity: rarityMap[best.len],
      positions: rangeArr(best.start, best.len), wordLength: best.len
    });
    for (var w = 1; w < words.length; w++) {
      if (words[w].word !== best.word) supporting.push(words[w].word);
    }
    var distinctWords = {};
    for (var dw = 0; dw < words.length; dw++) distinctWords[words[dw].word] = true;
    if (Object.keys(distinctWords).length >= 2) {
      badges.push({ family: "word", name: "Double Word Score", ep: 20, desc: "Two different words in one roll", rarity: "rare", positions: null, wordLength: words[1].len });
    }
  }

  var anagrams = findAnagramMatches(letters);
  var primaryWord = words.length ? { word: words[0].word, len: words[0].len, ordered: true, positions: rangeArr(words[0].start, words[0].len) } : null;
  if (anagrams.length) {
    var anagram = anagrams[0];
    if (!primaryWord || anagram.len > primaryWord.len) primaryWord = { word: anagram.word, len: anagram.len, ordered: false, positions: anagram.positions };
    badges.push({ family: "anagram", name: anagram.len >= 5 ? "Scrambled Long Word" : "Scrambled Word", ep: anagram.len >= 5 ? 180 : 35, desc: 'Rearranges into "' + anagram.word + '"', rarity: anagram.len >= 5 ? "epic" : "uncommon", positions: anagram.positions, wordLength: anagram.len });
  }

  var letterValue = 0, rareValueCount = 0, rareCount = 0;
  var rareValuePositions = [], rarePositions = [];
  for (var lv = 0; lv < letters.length; lv++) {
    letterValue += SCRABBLE_VALUES[letters[lv]];
    if (letters[lv] === "Q" || letters[lv] === "X" || letters[lv] === "Z") { rareValueCount++; rareValuePositions.push(lv); }
    if (RARE_LETTERS[letters[lv]]) { rareCount++; rarePositions.push(lv); }
  }
  if (letterValue >= 25) badges.push({ family: "value", name: "High Roller", ep: 25, desc: "Scrabble value reaches " + letterValue, rarity: "rare", positions: rangeArr(0, 6) });
  else if (letterValue <= 8) badges.push({ family: "value", name: "Bargain Bin", ep: 8, desc: "Scrabble value is only " + letterValue, rarity: "common", positions: rangeArr(0, 6) });
  if (rareValueCount) badges.push({ family: "value", name: "Triple Q/X/Z", ep: 30, desc: "A rare 8- or 10-point letter landed", rarity: "epic", positions: rareValuePositions });
  if (rareCount >= 3) badges.push({ family: "rare", name: "Rare Haul", ep: 45, desc: rareCount + " rare letters in one pull", rarity: "rare", positions: rarePositions });

  var uniqueLetters = {};
  for (var u = 0; u < letters.length; u++) uniqueLetters[letters[u]] = (uniqueLetters[letters[u]] || 0) + 1;
  var uniqueCount = Object.keys(uniqueLetters).length;
  if (uniqueCount === 6) badges.push({ family: "distinct", name: "Rainbow", ep: 18, desc: "All six letters are different", rarity: "uncommon", positions: [0,1,2,3,4,5] });
  var primePositions = [], halfSplitCount = 0, rarePositionsExact = [];
  for (var special = 0; special < letters.length; special++) {
    if (PRIME_LETTERS[letters[special]]) primePositions.push(special);
    if (letters[special] <= "M") halfSplitCount++;
    if (RARE_LETTERS[letters[special]]) rarePositionsExact.push(special);
  }
  if (primePositions.length === 6) badges.push({ family: "alphabet", name: "Prime Letters", ep: 20, desc: "Every letter has a prime alphabet position", rarity: "rare", positions: primePositions });
  if (halfSplitCount === 3) badges.push({ family: "alphabet", name: "Half Split", ep: 14, desc: "Three letters from each half of the alphabet", rarity: "uncommon", positions: [0,1,2,3,4,5] });
  if (letters.indexOf("A") !== -1 && letters.indexOf("Z") !== -1) {
    badges.push({ family: "alphabet", name: "Alphabet Bookends", ep: 35, desc: "The roll contains both A and Z", rarity: "rare", positions: letters.reduce(function (positions, letter, index) { if (letter === "A" || letter === "Z") positions.push(index); return positions; }, []) });
  }
  if (rarePositionsExact.length === 1) badges.push({ family: "rare", name: "Solo Rare", ep: 18, desc: "Exactly one rare letter", rarity: "uncommon", positions: rarePositionsExact });
  var pairCount = 0;
  for (var pairLetter in uniqueLetters) if (uniqueLetters[pairLetter] === 2) pairCount++;
  if (pairCount === 2 && uniqueCount === 4) badges.push({ family: "distinct", name: "Double Trouble", ep: 24, desc: "Exactly two separate pairs", rarity: "rare", positions: null });

  if (isStrictlyAscending(letters)) badges.push({ family: "order", name: "Rising Star", ep: 90, desc: "Letters climb from A to Z", rarity: "epic", positions: [0,1,2,3,4,5] });
  if (isStrictlyDescending(letters)) badges.push({ family: "order", name: "Falling Star", ep: 90, desc: "Letters fall from Z to A", rarity: "epic", positions: [0,1,2,3,4,5] });

  var alphabetMin = 26, alphabetMax = 0;
  for (var ar = 0; ar < letters.length; ar++) {
    var alphabetPosition = letters[ar].charCodeAt(0) - 65;
    alphabetMin = Math.min(alphabetMin, alphabetPosition);
    alphabetMax = Math.max(alphabetMax, alphabetPosition);
  }
  if (alphabetMax - alphabetMin >= 20) badges.push({ family: "range", name: "Full Spectrum", ep: 22, desc: "Letters span 20+ alphabet positions", rarity: "rare", positions: null });
  if (uniqueCount > 1 && alphabetMax - alphabetMin <= 5 && !findRunSpan(letters)) badges.push({ family: "range", name: "Tight Cluster", ep: 16, desc: "All letters fit in a narrow range", rarity: "uncommon", positions: null });

  var allSymmetric = true, allRoman = true;
  for (var shape = 0; shape < letters.length; shape++) {
    if (!SYMMETRIC_LETTERS[letters[shape]]) allSymmetric = false;
    if (!ROMAN_LETTERS[letters[shape]]) allRoman = false;
  }
  if (allSymmetric) badges.push({ family: "shape", name: "Symmetrical Shapes", ep: 55, desc: "Every letter has visual symmetry", rarity: "rare", positions: [0,1,2,3,4,5] });
  if (allRoman) badges.push({ family: "shape", name: "Roman Numeral", ep: 65, desc: "Every letter is a Roman numeral", rarity: "epic", positions: [0,1,2,3,4,5] });

  var counts = {};
  for (var c = 0; c < letters.length; c++) counts[letters[c]] = (counts[letters[c]] || 0) + 1;
  var maxCount = 0, maxLetter = null;
  for (var k in counts) {
    if (counts[k] > maxCount) { maxCount = counts[k]; maxLetter = k; }
  }
  var repeatPositions = [];
  if (maxLetter) {
    for (var ri = 0; ri < letters.length; ri++) if (letters[ri] === maxLetter) repeatPositions.push(ri);
  }
  if (maxCount === 6) badges.push({ family: "repeat", name: "Sextuple", ep: 5000, desc: "All six letters identical", rarity: "mythic", positions: repeatPositions });
  else if (maxCount === 5) badges.push({ family: "repeat", name: "Quintuple", ep: 800, desc: "Five matching letters", rarity: "legendary", positions: repeatPositions });
  else if (maxCount === 4) badges.push({ family: "repeat", name: "Quadruple", ep: 200, desc: "Four matching letters", rarity: "epic", positions: repeatPositions });
  else if (maxCount === 3) badges.push({ family: "repeat", name: "Triple", ep: 40, desc: "Three matching letters", rarity: "rare", positions: repeatPositions });
  else if (maxCount === 2) {
    var adjacentRepeat = findAdjacentRepeat(letters);
    if (adjacentRepeat) badges.push({ family: "repeat", name: "Pair", ep: 5, desc: "Two identical letters sit side by side", rarity: "common", positions: adjacentRepeat });
  }

  var runSpan = findRunSpan(letters);
  var run = runSpan ? runSpan.len : 1;
  if (run >= 6) badges.push({ family: "sequence", name: "Full Run", ep: 3000, desc: "All 6 letters run consecutively", rarity: "mythic", positions: rangeArr(runSpan.start, runSpan.len) });
  else if (run >= 5) badges.push({ family: "sequence", name: "Long Run", ep: 400, desc: "5 letters run consecutively", rarity: "legendary", positions: rangeArr(runSpan.start, runSpan.len) });
  else if (run >= 4) badges.push({ family: "sequence", name: "Short Run", ep: 80, desc: "4 letters run consecutively", rarity: "rare", positions: rangeArr(runSpan.start, runSpan.len) });
  else if (run >= 3) badges.push({ family: "sequence", name: "Mini Run", ep: 15, desc: "3 letters run consecutively", rarity: "uncommon", positions: rangeArr(runSpan.start, runSpan.len) });

  var rev = letters.slice().reverse().join("");
  if (seq === rev) {
    badges.push({ family: "symmetry", name: "Perfect Palindrome", ep: 1200, desc: "Reads the same forwards and backwards", rarity: "legendary", positions: [0,1,2,3,4,5] });
  } else if (letters[0] === letters[5]) {
    badges.push({ family: "symmetry", name: "Mirror Bookends", ep: 10, desc: "First and last letter match", rarity: "common", positions: [0,5] });
  } else if (letters[2] === letters[3]) {
    badges.push({ family: "symmetry", name: "Twin Core", ep: 8, desc: "Middle two letters match", rarity: "common", positions: [2,3] });
  }

  var vowelCount = 0, pattern = "";
  for (var v = 0; v < letters.length; v++) {
    var isV = !!VOWELS[letters[v]];
    if (isV) vowelCount++;
    pattern += isV ? "V" : "C";
  }
  if (vowelCount === 6) badges.push({ family: "vowel", name: "All Vowels", ep: 600, desc: "Every letter is a vowel", rarity: "legendary", positions: [0,1,2,3,4,5] });
  else if (vowelCount === 0) badges.push({ family: "vowel", name: "No Vowels", ep: 150, desc: "Not a single vowel", rarity: "rare", positions: [0,1,2,3,4,5] });
  else if (pattern === "VCVCVC" || pattern === "CVCVCV") badges.push({ family: "vowel", name: "Perfect Alternation", ep: 100, desc: "Vowels and consonants alternate perfectly", rarity: "rare", positions: [0,1,2,3,4,5] });
  if (vowelCount >= 4 && vowelCount <= 5) badges.push({ family: "vowel", name: "Vowel Heavy", ep: 28, desc: vowelCount + " vowels in the pull", rarity: "uncommon", positions: null });
  var vowelPositions = [];
  for (var vp = 0; vp < letters.length; vp++) if (VOWELS[letters[vp]]) vowelPositions.push(vp);
  var vowelSet = {};
  for (var vs = 0; vs < vowelPositions.length; vs++) vowelSet[letters[vowelPositions[vs]]] = true;
  if (Object.keys(vowelSet).length === 5) badges.push({ family: "vowel", name: "Vowel Variety", ep: 30, desc: "All five vowel types appear", rarity: "rare", positions: vowelPositions });
  if (vowelCount >= 1 && vowelCount <= 2) badges.push({ family: "vowel", name: "Vowel Light", ep: 12, desc: vowelCount + " vowel" + (vowelCount === 1 ? "" : "s") + " in the pull", rarity: "common", positions: vowelPositions });
  var adjacentVowels = false;
  for (var av = 0; av < letters.length - 1; av++) if (VOWELS[letters[av]] && VOWELS[letters[av + 1]]) adjacentVowels = true;
  if (adjacentVowels) badges.push({ family: "vowel", name: "Diphthong", ep: 20, desc: "Two vowels sit side by side", rarity: "uncommon", positions: null });
  if (VOWELS[letters[0]] && VOWELS[letters[5]]) badges.push({ family: "position", name: "Bookend Vowels", ep: 22, desc: "Vowels open and close the roll", rarity: "rare", positions: [0,5] });
  if (pattern === "VCCCCV") badges.push({ family: "position", name: "Sandwich", ep: 35, desc: "A vowel-consonant-consonant-consonant-consonant-vowel shape", rarity: "rare", positions: [0,5] });
  if ((VOWELS[letters[2]] && VOWELS[letters[3]]) || (!VOWELS[letters[2]] && !VOWELS[letters[3]])) {
    badges.push({ family: "position", name: "Center Match", ep: 10, desc: "The center pair shares a vowel shape", rarity: "common", positions: [2,3] });
  }

  var kbSpan = findKeyboardSpan(seq);
  var kbLen = kbSpan ? kbSpan.len : 0;
  if (kbLen >= 4) badges.push({ family: "keyboard", name: "Keyboard Walk", ep: 250, desc: "4+ letters follow a keyboard row", rarity: "epic", positions: rangeArr(kbSpan.start, kbSpan.len) });
  else if (kbLen === 3) badges.push({ family: "keyboard", name: "Keyboard Echo", ep: 30, desc: "3 letters follow a keyboard row", rarity: "uncommon", positions: rangeArr(kbSpan.start, kbSpan.len) });

  badges.push({ family: "base", name: "Six Letters", ep: 1, desc: "Every roll earns this", rarity: "common", positions: null });

  var totalEP = 0;
  applyProbabilityEP(badges);
  for (var b = 0; b < badges.length; b++) totalEP += badges[b].ep;

  var tier = "Trash";
  if (totalEP >= 80000000) tier = "Cosmic";
  else if (totalEP >= 20000000) tier = "Divine";
  else if (totalEP >= 2000000) tier = "Mythic";
  else if (totalEP >= 250000) tier = "Legendary";
  else if (totalEP >= 50000) tier = "Epic";
  else if (totalEP >= 10000) tier = "Rare";
  else if (totalEP >= 2000) tier = "Uncommon";
  else if (totalEP >= 300) tier = "Common";

  return { badges: badges, totalEP: totalEP, tier: tier, supporting: supporting, primaryWord: primaryWord };
}

function pickHighlightBadge(badges) {
  var top = null;
  for (var i = 0; i < badges.length; i++) {
    if (!top || badges[i].ep > top.ep) top = badges[i];
  }
  return top;
}

var BADGE_ICONS = {
  word: "🔤", anagram: "🔀", value: "💰", rare: "💎", distinct: "🌈", order: "⭐",
  range: "📏", shape: "🔷", repeat: "🔁", sequence: "📈", symmetry: "🪞", vowel: "🗣️",
  position: "📍", keyboard: "⌨️", alphabet: "🔡", base: "🎲"
};

/* ================= rendering ================= */
function animateCount(el, to, duration) {
  var start = Number(el.textContent) || 0, startTime = null;
  function step(ts) {
    if (!startTime) startTime = ts;
    var progress = Math.min(1, (ts - startTime) / duration);
    var eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(start + (to - start) * eased);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = to;
  }
  requestAnimationFrame(step);
}

function playBadgeTone(index) {
  try {
    var AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    var context = playBadgeTone._context || (playBadgeTone._context = new AudioContext());
    var oscillator = context.createOscillator();
    var gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = 280 + index * 55;
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.07, context.currentTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.24);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.25);
  } catch (e) {}
}

async function renderResult(letters, res, leaderboard) {
  var panel = document.getElementById("result");
  var tierColor = TIER_COLORS[res.tier] || TIER_COLORS.Trash;
  // Start at the "Trash" tier color since the running total starts at 0 EP -- the color/glow
  // will climb through the tiers live as badges stack up, instead of jumping straight to the
  // final rarity before the reveal has even played.
  panel.style.setProperty("--tier-color", TIER_COLORS.Trash);

  document.getElementById("resultTitle").textContent = letters.join("");

  var rollRarity = document.getElementById("rollRarity");

  var sortedBadges = res.badges.slice().sort(function (a, b) { return a.ep - b.ep; });
  var list = document.getElementById("badgeList");
  list.innerHTML = "";
  var totalEl = document.getElementById("totalEp");
  totalEl.textContent = "0";
  panel.classList.add("show");
  var runningEP = 0;
  for (var i = 0; i < sortedBadges.length; i++) {
    var b = sortedBadges[i];
    var color = colorForEP(b.ep);
    var li = document.createElement("li");
    li.className = "badge-item rarity-" + tierForEP(b.ep).toLowerCase();
    li.style.setProperty("--badge-color", color);
    li.style.setProperty("--badge-delay", "0ms");
    var icon = BADGE_ICONS[b.family] || "✨";
    var slots = "<div class='badge-slots'>";
    for (var slot = 0; slot < letters.length; slot++) {
      var active = b.positions && b.positions.indexOf(slot) !== -1 ? " active" : "";
      slots += "<span class='badge-slot" + active + "'>" + letters[slot] + "</span>";
    }
    slots += "</div>";
    li.innerHTML = "<div><span class='badge-name'><span class='badge-icon' aria-hidden='true'>" + icon + "</span>" + b.name + "</span>" +
      "<span class='badge-desc'>" + b.desc + "</span>" + slots + "</div>" +
      "<span class='badge-ep'>+" + b.ep + " EP</span>";
    li.tabIndex = 0;
    li.setAttribute("role", "button");
    li.dataset.badgeName = b.name;
    li.dataset.badgeFamily = b.family || "badge";
    li.dataset.badgeEp = String(b.ep);
    li.dataset.badgeDesc = b.desc || "";
    (function (badgeForLink) {
      var openBadge = function () {
        var detailDescription = badgeForLink.desc || "A special pattern discovered in a roll.";
        window.location.href = "/badge/" + encodeURIComponent(badgeForLink.name) + "?ep=" + encodeURIComponent(badgeForLink.ep) + "&family=" + encodeURIComponent(badgeForLink.family || "badge") + "&desc=" + encodeURIComponent(detailDescription);
      };
      li.addEventListener("click", openBadge);
      li.addEventListener("keydown", function (event) { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openBadge(); } });
    })(b);
    list.insertBefore(li, list.firstChild);
    runningEP += b.ep;
    // Recolor the running total (and its glow) to match the rarity tier of the EP accumulated
    // so far, so the color visibly climbs as bigger badges land instead of being fixed upfront.
    panel.style.setProperty("--tier-color", TIER_COLORS[tierForEP(runningEP)] || TIER_COLORS.Trash);
    playBadgeTone(i);
    animateCount(totalEl, runningEP, 320);
    await new Promise(function (resolve) { setTimeout(resolve, 420 + i * 160); });
  }

  var sup = document.getElementById("supporting");
  sup.textContent = res.supporting.length ? ("Also spotted: " + res.supporting.join(", ")) : "";

  // Reveal the rarity pill only now that every badge has landed and the running total has
  // settled on its final tier color, instead of announcing the result before the reveal plays.
  panel.style.setProperty("--tier-color", tierColor);
  var rank = rankForEP(res.totalEP, leaderboard);
  rollRarity.innerHTML = "<span class='tier-label'>" + res.tier + (rank ? " · #" + rank : "") + "</span>";
  rollRarity.style.color = tierColor;
  rollRarity.style.background = "color-mix(in srgb, " + tierColor + " 14%, transparent)";
  rollRarity.className = "roll-rarity show rarity-" + res.tier.toLowerCase();
  panel.className = panel.className.replace(/\breveal-[a-z]+\b/g, "");
  panel.classList.add("reveal-" + res.tier.toLowerCase());

  if (res.tier === "Epic") spawnConfetti([TIER_COLORS.Epic, TIER_COLORS.Rare, "#ffffff"], 16);
  else if (res.tier === "Legendary") spawnConfetti([TIER_COLORS.Legendary, TIER_COLORS.Epic, "#ffffff"], 26);
  else if (res.tier === "Mythic") spawnConfetti([TIER_COLORS.Mythic, TIER_COLORS.Legendary, TIER_COLORS.Epic, "#ffffff"], 38);

  document.getElementById("shareBtn").onclick = function () {
    var lines = ["🎲 SixRoll " + letters.join("") + " — " + res.tier + " (" + res.totalEP + " EP)"];
    sortedBadges.forEach(function (b) { lines.push("• " + b.name + " +" + b.ep); });
    var text = lines.join("\\n");
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { showToast("Copied result to clipboard"); })
        .catch(function () { showToast("Couldn't copy — select and copy manually"); });
    } else {
      showToast("Clipboard not available");
    }
  };

  // If this roll is in the top 20, expose a "Go to leaderboard" button under the badge list
  try {
    var prevBtn = document.getElementById("goLeaderboardBtn");
    if (prevBtn) prevBtn.remove();
    if (rank) {
      var gbtn = document.createElement("button");
      gbtn.id = "goLeaderboardBtn";
      gbtn.type = "button";
      gbtn.className = "share-btn";
      gbtn.textContent = "Go to leaderboard";
      gbtn.onclick = function () {
        try { localStorage.setItem("sixroll_pulse", getName()); } catch (e) {}
        window.location.href = "/leaderboard";
      };
      var supEl = document.getElementById("supporting");
      if (supEl && supEl.parentNode) supEl.parentNode.insertBefore(gbtn, supEl);
    }
  } catch (e) {}
}

/* ================= leaderboard ================= */
var LB = {
  load: async function () {
    var cacheKey = "sixroll_leaderboard_cache";
    // Always ask the server for the authoritative board when this screen is
    // opened. A local cache may be used elsewhere for instant UI, but it must
    // never prevent a leaderboard page reload from seeing a newly qualified roll.
    var res = await fetch("/api/leaderboard?_=" + Date.now(), {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" }
    });
    if (!res.ok) throw new Error("Failed to load leaderboard");
    var data = await res.json();
    try {
      localStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), data: data }));
    } catch (e) {}
    return Array.isArray(data) ? data : [];
  },
  submit: async function (name, word, ep, email) {
    var response = await fetch("/api/roll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name, word: word, ep: ep, email: email || "" })
    });
    if (!response.ok) throw new Error("Failed to save roll");
    return await response.json();
  }
};

var leaderboardCache = [];
var leaderboardLoaded = false;

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, function (c) {
    if (c === "&") return "&amp;";
    if (c === "<") return "&lt;";
    if (c === ">") return "&gt;";
    if (c === '"') return "&quot;";
    return "&#39;";
  });
}

var MEDALS = ["🥇", "🥈", "🥉"];
function renderLeaderboard(data) {
  var body = document.getElementById("lbBody");
  var myName = getName().toLowerCase();
  if (!data.length) {
    document.getElementById("featuredRoll").hidden = true;
    body.innerHTML = "<div class='lb-empty'>No rolls yet — be the first on the board.</div>";
    return;
  }
  data.sort(function (a, b) { return (Number(b.ep) || 0) - (Number(a.ep) || 0); });
  var featured = data[0];
  var featuredColor = colorForEP(Number(featured.ep) || 0);
  var featuredTier = tierForEP(Number(featured.ep) || 0);
  document.getElementById("featuredWord").textContent = featured.word;
  document.getElementById("featuredWord").style.color = featuredColor;
  var featTierEl = document.getElementById("featuredTier");
  featTierEl.innerHTML = "<span class='tier-label'>" + featuredTier + "</span>";
  featTierEl.style.color = featuredColor;
  featTierEl.style.background = "color-mix(in srgb, " + featuredColor + " 14%, transparent)";
  featTierEl.className = "roll-rarity show rarity-" + featuredTier.toLowerCase();
  document.getElementById("featuredBy").textContent = featured.name + " · " + featured.ep + " EP";
  document.getElementById("featuredRoll").hidden = !document.documentElement.classList.contains("leaderboard-page");
  body.innerHTML = data.map(function (p, i) {
    var rankDisplay = MEDALS[i] || (i + 1);
    var mine = p.name.toLowerCase() === myName && myName !== "";
    var wordColor = colorForEP(Number(p.ep) || 0);
    var rowTier = tierForEP(Number(p.ep) || 0);
    var rankClass = i < 3 ? " rank-" + (i + 1) : "";
    var tierClass = " rarity-" + rowTier.toLowerCase();
    var tierLabel = rowTier.charAt(0).toUpperCase() + rowTier.slice(1);
    return "<div class='lb-row lb-body-row" + rankClass + tierClass + (mine ? " me" : "") + "' style='animation-delay:" + (i * 30) + "ms'>" +
      "<span class='lb-rank" + (i < 3 ? " medal" : "") + "'>" + rankDisplay + "</span>" +
      "<span class='lb-word' style='color:" + wordColor + "'><button class='lb-word-btn' type='button' data-word='" + escapeHtml(p.word) + "' data-player='" + escapeHtml(p.name) + "' data-ep='" + p.ep + "' style='color:" + wordColor + "'>" + escapeHtml(p.word) + "</button></span>" +
      "<span class='lb-name'><button class='lb-name-btn' type='button' data-player='" + escapeHtml(p.name) + "'>" + escapeHtml(p.name) + "</button></span>" +
      "<span class='lb-tier' style='color:" + wordColor + "; border: 1px solid " + wordColor + "; background: color-mix(in srgb, " + wordColor + " 10%, rgba(255,255,255,.04));'>" + tierLabel + "</span>" +
      "<span class='lb-ep' style='color:" + wordColor + "' title='" + rowTier + "'>" + Number(p.ep || 0).toLocaleString() + " EP</span>" +
      "</div>";
  }).join("");
  body.querySelectorAll(".lb-word-btn").forEach(function (button) {
    button.addEventListener("click", function () {
      window.location.href = "/roll/" + encodeURIComponent(button.dataset.word) + "?name=" + encodeURIComponent(button.dataset.player) + "&ep=" + encodeURIComponent(button.dataset.ep);
    });
  });
  body.querySelectorAll(".lb-name-btn").forEach(function (button) {
    button.addEventListener("click", function () {
      window.location.href = "/account/" + encodeURIComponent(button.dataset.player);
    });
  });

  // If a pulse request was set by the roll page, animate the matching player's row briefly
  try {
    var pulseName = localStorage.getItem("sixroll_pulse");
    if (pulseName) {
      localStorage.removeItem("sixroll_pulse");
      (function (pulseLower) {
        setTimeout(function () {
          var rows = body.querySelectorAll(".lb-row");
          rows.forEach(function (row) {
            var nameEl = row.querySelector(".lb-name");
            if (nameEl && nameEl.textContent.toLowerCase() === pulseLower) {
              row.classList.add("pulse");
              setTimeout(function () { row.classList.remove("pulse"); }, 2400);
            }
          });
        }, 80);
      })(pulseName.toLowerCase());
    }
  } catch (e) {}
  var leaderboardEl = document.querySelector(".leaderboard");
  if (leaderboardEl) leaderboardEl.classList.add("ready");
}

async function loadLeaderboard() {
  if (!leaderboardLoaded) {
    try { leaderboardCache = await LB.load(); } catch (e) { leaderboardCache = []; }
    leaderboardLoaded = true;
  }
  leaderboardCache.sort(function (a, b) { return (Number(b.ep) || 0) - (Number(a.ep) || 0); });
  renderLeaderboard(leaderboardCache);
}

function rollQualifies(ep) {
  return leaderboardCache.length < 20 || Number(ep) >= (Number(leaderboardCache[leaderboardCache.length - 1].ep) || 0);
}

function addRollToLeaderboardCache(record) {
  leaderboardCache.push(record);
  leaderboardCache.sort(function (a, b) { return (Number(b.ep) || 0) - (Number(a.ep) || 0); });
  leaderboardCache = leaderboardCache.slice(0, 20);
  renderLeaderboard(leaderboardCache);
}

function showRollDetail(word, player, ep) {
  var detail = document.getElementById("rollDetail");
  var letters = word.split("");
  var result = computeRoll(letters);
  var color = colorForEP(ep);
  var tier = tierForEP(ep);
  var displayName = player || "Anonymous";

  document.getElementById("detailWord").textContent = word;
  document.getElementById("detailWord").style.color = color;
  document.getElementById("detailPlayerName").textContent = displayName;
  document.getElementById("detailAvatar").textContent = displayName.trim().charAt(0).toUpperCase() || "?";

  var tierEl = document.getElementById("detailTier");
  tierEl.innerHTML = "<span class='tier-label'>" + tier + "</span>";
  tierEl.style.color = color;
  tierEl.style.background = "color-mix(in srgb, " + color + " 14%, transparent)";
  tierEl.className = "roll-rarity show rarity-" + tier.toLowerCase();

  document.getElementById("detailEp").textContent = ep + " EP";
  document.getElementById("detailSummary").textContent = result.badges.length + " badge types found in this roll";
  var list = document.getElementById("detailBadgeList");
  list.innerHTML = "";
  result.badges.slice().sort(function (a, b) { return b.ep - a.ep; }).forEach(function (badge) {
    var badgeColor = colorForEP(badge.ep);
    var item = document.createElement("li");
    item.className = "badge-item rarity-" + tierForEP(badge.ep).toLowerCase();
    item.style.setProperty("--badge-color", badgeColor);
    var slots = "<div class='badge-slots'>";
    for (var i = 0; i < letters.length; i++) {
      slots += "<span class='badge-slot" + (badge.positions && badge.positions.indexOf(i) !== -1 ? " active" : "") + "'>" + letters[i] + "</span>";
    }
    slots += "</div>";
    item.innerHTML = "<div><span class='badge-name'><span class='badge-icon' aria-hidden='true'>" + (BADGE_ICONS[badge.family] || "✨") + "</span>" + badge.name + "</span><span class='badge-desc'>" + badge.desc + "</span>" + slots + "</div><span class='badge-ep'>+" + badge.ep + " EP</span>";
    item.tabIndex = 0;
    item.setAttribute("role", "button");
    var openBadge = function () { window.location.href = "/badge/" + encodeURIComponent(badge.name) + "?ep=" + encodeURIComponent(badge.ep) + "&family=" + encodeURIComponent(badge.family || "badge") + "&desc=" + encodeURIComponent(badge.desc || ""); };
    item.addEventListener("click", openBadge);
    item.addEventListener("keydown", function (event) { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openBadge(); } });
    list.appendChild(item);
  });
  detail.classList.add("show");
}

function initializeBadgeDetailPage() {
  var path = window.location.pathname;
  if (path.indexOf("/badge/") !== 0) return false;
  document.documentElement.classList.add("badge-detail-route");
  var name = decodeURIComponent(path.slice("/badge/".length) || "Badge");
  var params = new URLSearchParams(window.location.search);
  var ep = Number(params.get("ep")) || 0;
  var family = params.get("family") || "badge";
  var desc = params.get("desc") || (name + " is a " + family + " pattern badge discovered in this roll.");
  var tier = tierForEP(ep);
  var color = colorForEP(ep);
  document.getElementById("badgeDetailPage").hidden = false;
  document.getElementById("badgeDetailIcon").textContent = BADGE_ICONS[family] || "✨";
  document.getElementById("badgeDetailName").textContent = name;
  document.getElementById("badgeDetailFamily").textContent = family + " badge";
  var rarity = document.getElementById("badgeDetailRarity");
  rarity.innerHTML = "<span class='tier-label'>" + tier + "</span>";
  rarity.style.color = color;
  rarity.style.background = "color-mix(in srgb, " + color + " 14%, transparent)";
  rarity.style.marginTop = "12px";
  rarity.className = "roll-rarity show rarity-" + tier.toLowerCase();
  document.getElementById("badgeDetailEP").textContent = "+" + ep + " EP";
  document.getElementById("badgeDetailExplanation").textContent = desc;
  var card = document.getElementById("badgeDetailCard");
  card.style.setProperty("--badge-color", color);
  card.className = "badge-detail-card rarity-" + tier.toLowerCase();
  document.title = name + " — SixRoll badge";
  return true;
}

document.getElementById("badgeDetailBack").addEventListener("click", function () {
  if (window.history.length > 1) window.history.back(); else window.location.href = "/";
});

async function initializeDetailPage() {
  var path = window.location.pathname;
  if (path === "/leaderboard") {
    document.documentElement.classList.add("leaderboard-page");
    document.title = "Global Leaderboard — SixRoll";
    return false;
  }
  if (path === "/account" || path.startsWith("/account/")) {
    document.documentElement.classList.add("account-page");
    document.title = path === "/account" ? "Your Account — SixRoll" : "Player overview — SixRoll";
    return true;
  }
  var prefix = "/roll/";
  if (path.indexOf(prefix) !== 0) return false;
  document.documentElement.classList.add("detail-page");
  var word = path.slice(prefix.length).toUpperCase();
  if (!/^[A-Z]{6}$/.test(word)) return false;
  var params = new URLSearchParams(window.location.search);
  var player = params.get("name") || "Unknown player";
  var ep = Number(params.get("ep")) || 0;
  try {
    var response = await fetch("/api/roll/" + encodeURIComponent(word) + "?name=" + encodeURIComponent(player) + "&ep=" + encodeURIComponent(ep));
    if (response.ok) {
      var record = await response.json();
      player = record.name;
      ep = Number(record.ep) || ep;
    }
  } catch (e) {}
  showRollDetail(word, player, ep);
  document.title = word + " — SixRoll details";
  return true;
}

/* ================= cooldown ================= */
function getCooldownRemaining() {
  var until = parseInt(localStorage.getItem("sixroll_next_roll") || "0", 10);
  return Math.max(0, until - Date.now());
}

var cooldownAnimationFrame = 0;

function getCooldownProgress() {
  var until = parseInt(localStorage.getItem("sixroll_next_roll") || "0", 10);
  if (!until) return 1;

  /*
   * The countdown itself is authoritative.  Do not depend on a second
   * localStorage timestamp: older sessions/tabs can have a stale or missing
   * cooldown_start value, which makes the visual bar disagree with the timer.
   *
   * Progress is therefore simply:
   *   elapsed / total = 1 - remaining / COOLDOWN_MS
   */
  var remaining = Math.max(0, until - Date.now());
  return Math.max(0, Math.min(1, 1 - (remaining / COOLDOWN_MS)));
}

function startCooldownBar() {
  var fill = document.getElementById("cooldownFill");
  if (!fill) return;
  if (cooldownAnimationFrame) cancelAnimationFrame(cooldownAnimationFrame);

  function frame() {
    var remaining = getCooldownRemaining();
    var progress = getCooldownProgress();
    fill.style.transition = "none";
    fill.style.width = (progress * 100).toFixed(3) + "%";

    if (remaining > 0) {
      cooldownAnimationFrame = requestAnimationFrame(frame);
    } else {
      fill.style.width = "100%";
      cooldownAnimationFrame = 0;
    }
  }

  frame();
}

function syncCooldownUI() {
  var unlimited = localStorage.getItem("sixroll_unlimited") === "1";
  var btn = document.getElementById("rollBtn");
  var wrap = document.getElementById("cooldownWrap");
  if (!btn || !wrap) return;
  if (unlimited) { btn.disabled = false; wrap.hidden = true; return; }
  var remaining = getCooldownRemaining();
  if (remaining <= 0) {
    btn.disabled = false; wrap.hidden = true;
    if (cooldownAnimationFrame) { cancelAnimationFrame(cooldownAnimationFrame); cooldownAnimationFrame = 0; }
  } else {
    btn.disabled = true; wrap.hidden = false;
    startCooldownBar();
  }
}

function tickCooldownText() {
  var unlimited = localStorage.getItem("sixroll_unlimited") === "1";
  var btn = document.getElementById("rollBtn");
  var wrap = document.getElementById("cooldownWrap");
  var text = document.getElementById("cooldownText");
  if (unlimited) { btn.disabled = false; wrap.hidden = true; return; }
  var remaining = getCooldownRemaining();
  if (remaining <= 0) {
    btn.disabled = false; wrap.hidden = true;
  } else {
    btn.disabled = true; wrap.hidden = false;
    var mins = Math.floor(remaining / 60000);
    var secs = Math.floor((remaining % 60000) / 1000);
    text.textContent = "Next roll in " + mins + ":" + (secs < 10 ? "0" : "") + secs;
  }
}
setInterval(tickCooldownText, 1000);

window.addEventListener("storage", function (event) {
  if (event.key === "sixroll_next_roll" || event.key === "sixroll_unlimited") {
    syncCooldownUI();
    tickCooldownText();
  }
});

document.addEventListener("visibilitychange", function () {
  if (!document.hidden) {
    syncCooldownUI();
    tickCooldownText();
  }
});

/* ================= roll flow ================= */
var rollInProgress = false;
document.getElementById("rollBtn").addEventListener("click", async function () {
  if (rollInProgress) return;
  rollInProgress = true;
  var name = getName();
  var btn = document.getElementById("rollBtn");
  if (!authState.user) {
    showToast("Sign in to save your roll");
  }
  btn.disabled = true;
  btn.classList.add("is-rolling");
  if (!leaderboardLoaded) await loadLeaderboard();
  document.getElementById("rollRarity").classList.remove("show");
  document.getElementById("rollRarity").textContent = "";
  document.getElementById("result").classList.remove("show");
  resetTiles();

  var letters = [];
  for (var i = 0; i < 6; i++) letters.push(randLetter());

  for (var t = 0; t < 6; t++) {
    await revealTile(document.getElementById("tile" + t), letters[t], 60);
  }

  var res = computeRoll(letters);
  await renderResult(letters, res, leaderboardCache);

  var unlimited = localStorage.getItem("sixroll_unlimited") === "1";
  if (!unlimited) {
    /*
     * Store only the absolute unlock time.  The progress bar and countdown
     * both derive their state from this same timestamp.
     */
    localStorage.setItem("sixroll_next_roll", String(Date.now() + COOLDOWN_MS));
    localStorage.removeItem("sixroll_cooldown_start");
  }

  if (authState.user) {
    try {
      var saved = await LB.submit(name, letters.join(""), res.totalEP, authState.user.email);
      // The server is authoritative. Replace the client cache with its actual
      // top-20 index instead of trying to reconstruct the board locally. This
      // also handles ties, evictions, and concurrent rolls correctly.
      if (saved && Array.isArray(saved.leaderboardData)) {
        leaderboardCache = saved.leaderboardData.slice();
        leaderboardCache.sort(function (a, b) { return (Number(b.ep) || 0) - (Number(a.ep) || 0); });
        try { localStorage.removeItem("sixroll_leaderboard_cache"); } catch (e) {}
        if (window.location.pathname === "/leaderboard") {
          renderLeaderboard(leaderboardCache);
        }
      }
      if (window.location.pathname === "/account" || window.location.pathname.startsWith("/account/")) {
        initializeAccountOverview().catch(function () {});
      }
    } catch (e) {
      showToast("Couldn't save your roll");
    }
  }
  syncCooldownUI();
  tickCooldownText();
  btn.classList.remove("is-rolling");
  rollInProgress = false;
});

/* ================= admin mode ================= */
var ADMIN_CODE = "dkdkfkdjdjfkfkfjdkfkfjfjdk";
var adminBuffer = "";

function isAdminEnabled() {
  return sessionStorage.getItem("sixroll_admin") === "1";
}

function setAdminPanel(open) {
  var panel = document.getElementById("adminPanel");
  if (!panel) return;
  panel.hidden = !open;
  if (open) {
    sessionStorage.setItem("sixroll_admin", "1");
    panel.scrollIntoView({ behavior: "smooth", block: "center" });
  } else {
    sessionStorage.removeItem("sixroll_admin");
  }
}

function adminLog(msg) {
  var el = document.getElementById("adminLog");
  if (el) el.textContent = msg;
}

// Listen for the secret code being typed anywhere on the page (ignoring input fields).
document.addEventListener("keydown", function (e) {
  var tag = (e.target && e.target.tagName) || "";
  if (tag === "INPUT" || tag === "TEXTAREA") return;
  if (e.key && e.key.length === 1) {
    adminBuffer = (adminBuffer + e.key.toLowerCase()).slice(-ADMIN_CODE.length);
    if (adminBuffer === ADMIN_CODE) {
      adminBuffer = "";
      setAdminPanel(true);
      showToast("Admin mode enabled");
    }
  }
});

// Recalculate every stored score with the current formula.
async function recalcAllScores() {
  var btn = document.getElementById("recalcBtn");
  btn.disabled = true;
  adminLog("Loading all stored rolls…");
  try {
    var res = await fetch("/api/admin/rolls");
    if (!res.ok) throw new Error("Failed to load rolls");
    var rolls = await res.json();
    if (!Array.isArray(rolls) || !rolls.length) {
      adminLog("No rolls to recalculate.");
      btn.disabled = false;
      return;
    }
    var changed = 0;
    var recomputed = rolls.map(function (r) {
      var word = String(r.word || "").toUpperCase();
      var letters = word.split("");
      var newEp = r.ep;
      if (letters.length === 6) {
        try { newEp = computeRoll(letters).totalEP; } catch (err) { newEp = r.ep; }
      }
      if (newEp !== r.ep) changed++;
      return { name: r.name, word: word, ep: newEp, ts: r.ts };
    });
    adminLog("Recomputed " + recomputed.length + " rolls (" + changed + " changed). Saving…");
    var save = await fetch("/api/admin/recalc", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rolls: recomputed })
    });
    if (!save.ok) throw new Error("Failed to save recalculated scores");
    var out = await save.json();
    adminLog("Done — " + out.count + " scores saved, " + changed + " updated to the new formula.");
    showToast("Recalculated " + changed + " score" + (changed === 1 ? "" : "s"));
    leaderboardLoaded = false;
    await loadLeaderboard();
  } catch (err) {
    adminLog("Error: " + (err && err.message ? err.message : "recalculation failed"));
    showToast("Recalculation failed");
  } finally {
    btn.disabled = false;
  }
}

document.getElementById("recalcBtn").addEventListener("click", recalcAllScores);
document.getElementById("adminClose").addEventListener("click", function () {
  setAdminPanel(false);
  showToast("Admin mode disabled");
});

// Restore the panel if admin mode was enabled earlier this session.
if (isAdminEnabled()) setAdminPanel(true);

updateUnlimitedUI();
syncCooldownUI();
tickCooldownText();
document.addEventListener("click", function (event) {
  var back = event.target && event.target.closest("#accountBackLink");
  if (!back) return;
  event.preventDefault();
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.assign("/");
  }
});

refreshAuthState().then(function () {
  if (initializeBadgeDetailPage()) return;
  initializeDetailPage().then(function (isDetailPage) {
    if (!isDetailPage) loadLeaderboard();
  });
});
</script>
</body>
</html>
`;

const KV_KEY = "rolls";
const ROLL_INDEX_KEY = "roll_index";
const PROFILE_PREFIX = "profile:";
const MAX_ROLLS = 500;
const MAX_PROFILE_RECENT = 20;
const MAX_LEADERBOARD = 20;
const AUTH_COOKIE = "sixroll_auth";
const AUTH_USERS_KEY = "auth_users";
const AUTH_SESSIONS_KEY = "auth_sessions";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if ((url.pathname === "/" || url.pathname === "/leaderboard" || url.pathname === "/account" || /^\/account\/[^/]+$/.test(url.pathname) || /^\/roll\/[A-Za-z]{6}$/.test(url.pathname) || /^\/badge\/.+/.test(url.pathname)) && request.method === "GET") {
      return new Response(HTML_PAGE, { headers: { "content-type": "text/html;charset=UTF-8" } });
    }

    // Username/password registration
    if (url.pathname === "/api/auth/register" && request.method === "POST") {
      let body;
      try {
        body = await request.json();
      } catch {
        return json({ error: "Invalid JSON" }, 400);
      }
      const username = String(body.username || "").trim();
      const password = String(body.password || "");
      const name = String(body.name || "").trim();
      if (!/^[a-zA-Z0-9_\-]{3,30}$/.test(username)) return json({ error: "Invalid username" }, 400);
      if (password.length < 8) return json({ error: "Password must be at least 8 characters" }, 400);
      const users = await getAuthUsers(env);
      if (users.find((u) => u.username === username)) return json({ error: "Username taken" }, 400);
      const salt = generateSaltBase64();
      const hash = await derivePasswordHash(password, salt);
      const user = { username, passwordHash: hash, salt, name, createdAt: Date.now() };
      users.push(user);
      await env.PLAYERS.put(AUTH_USERS_KEY, JSON.stringify(users));
      const sessionToken = createSessionToken(username);
      await env.PLAYERS.put(`${AUTH_SESSIONS_KEY}:${sessionToken}`, JSON.stringify({ email: username, expiresAt: Date.now() + SESSION_TTL_SECONDS * 1000 }));
      const cookie = serializeCookie(AUTH_COOKIE, sessionToken, { httpOnly: true, secure: true, sameSite: "Lax", path: "/", maxAge: SESSION_TTL_SECONDS });
      return json({ ok: true }, 200, { "Set-Cookie": cookie });
    }

    // Username/password login
    if (url.pathname === "/api/auth/login" && request.method === "POST") {
      let body;
      try {
        body = await request.json();
      } catch {
        return json({ error: "Invalid JSON" }, 400);
      }
      const username = String(body.username || "").trim();
      const password = String(body.password || "");
      const users = await getAuthUsers(env);
      const user = users.find((u) => u.username === username);
      if (!user || !user.salt || !user.passwordHash) return json({ error: "Invalid credentials" }, 401);
      const hash = await derivePasswordHash(password, user.salt);
      if (hash !== user.passwordHash) return json({ error: "Invalid credentials" }, 401);
      const sessionToken = createSessionToken(username);
      await env.PLAYERS.put(`${AUTH_SESSIONS_KEY}:${sessionToken}`, JSON.stringify({ email: username, expiresAt: Date.now() + SESSION_TTL_SECONDS * 1000 }));
      const cookie = serializeCookie(AUTH_COOKIE, sessionToken, { httpOnly: true, secure: true, sameSite: "Lax", path: "/", maxAge: SESSION_TTL_SECONDS });
      return json({ ok: true }, 200, { "Set-Cookie": cookie });
    }

    if (url.pathname === "/api/auth/me" && request.method === "GET") {
      const session = await getSessionRecord(request, env);
      if (!session || !session.user) return json({ error: "Not signed in" }, 401);
      const refreshedExpiresAt = Date.now() + SESSION_TTL_SECONDS * 1000;
      await env.PLAYERS.put(session.key, JSON.stringify({ email: session.email, expiresAt: refreshedExpiresAt }));
      const cookie = serializeCookie(AUTH_COOKIE, session.token, { httpOnly: true, secure: true, sameSite: "Lax", path: "/", maxAge: SESSION_TTL_SECONDS });
      return json({ user: session.user }, 200, { "Set-Cookie": cookie });
    }

    if (url.pathname === "/api/auth/profile" && request.method === "POST") {
      const user = await getSessionUser(request, env);
      if (!user) return json({ error: "Not signed in" }, 401);
      let body;
      try {
        body = await request.json();
      } catch {
        return json({ error: "Invalid JSON" }, 400);
      }
      const name = String(body.name || "").trim().slice(0, 20);
      const users = await getAuthUsers(env);
      const stored = users.find((entry) => String(entry.username || entry.email || "").toLowerCase() === String(user.username || user.email || "").toLowerCase());
      if (stored) {
        stored.name = name;
        await env.PLAYERS.put(AUTH_USERS_KEY, JSON.stringify(users));
      }
      const profileKey = PROFILE_PREFIX + String(user.username || user.email || "").trim().toLowerCase();
      const existingProfileRaw = await env.PLAYERS.get(profileKey);
      if (existingProfileRaw) {
        try {
          const existingProfile = JSON.parse(existingProfileRaw);
          if (existingProfile && typeof existingProfile === "object") {
            existingProfile.displayName = name || String(user.username || user.email || "");
            await env.PLAYERS.put(profileKey, JSON.stringify(existingProfile));
          }
        } catch {}
      }
      return json({ user: { email: user.email, username: user.username, name, createdAt: stored ? stored.createdAt : user.createdAt } });
    }

    if (url.pathname === "/api/auth/logout" && request.method === "POST") {
      const cookie = serializeCookie(AUTH_COOKIE, "", { path: "/", maxAge: 0, httpOnly: true, secure: true, sameSite: "Lax" });
      return json({ ok: true }, 200, { "Set-Cookie": cookie });
    }

    if (url.pathname === "/api/leaderboard" && request.method === "GET") {
      const index = await getRollIndex(env);
      return json(index.leaderboard || [], 200, {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0"
      });
    }

    if (url.pathname.startsWith("/api/player/") && request.method === "GET") {
      const playerName = decodeURIComponent(url.pathname.slice("/api/player/".length)).trim();
      if (!playerName) return json({ error: "Player name required" }, 404);

      const users = await getAuthUsers(env);
      const normalized = playerName.toLowerCase();
      const stored = users.find((entry) => {
        const username = String(entry.username || entry.email || "").toLowerCase();
        const displayName = String(entry.name || "").toLowerCase();
        return username === normalized || displayName === normalized;
      });

      const username = stored ? String(stored.username || stored.email || playerName) : playerName;
      const displayName = stored ? String(stored.name || username) : playerName;
      const profile = await getPlayerProfile(env, username, {
        displayName,
        seedFromLegacy: true
      });

      if (!profile) {
        return json({
          username,
          displayName,
          createdAt: stored ? Number(stored.createdAt) || null : null,
          totalEPRank: 1 + (await Promise.all(users.map(async (entry) => {
            const rawProfile = await env.PLAYERS.get(PROFILE_PREFIX + String(entry.username || entry.email || "").toLowerCase());
            try { const p = rawProfile ? JSON.parse(rawProfile) : null; return Number(p && p.totalEP) || 0; } catch { return 0; }
          }))).filter((v) => v > 0).length,
          rollCount: 0,
          totalEP: 0,
          bestRoll: null,
          recentRolls: []
        });
      }

      const index = await getRollIndex(env);
      const leaderboard = Array.isArray(index.leaderboard) ? index.leaderboard : [];
      // Total-EP rank is intentionally computed from per-player aggregates.
      // This keeps the leaderboard index small while making profile ranks authoritative.
      const profileTotals = await Promise.all(users.map(async (entry) => {
        const entryUsername = String(entry.username || entry.email || "").trim();
        if (!entryUsername) return null;
        const rawProfile = await env.PLAYERS.get(PROFILE_PREFIX + entryUsername.toLowerCase());
        if (!rawProfile) return { username: entryUsername, totalEP: 0 };
        try {
          const parsed = JSON.parse(rawProfile);
          return { username: entryUsername, totalEP: Number(parsed && parsed.totalEP) || 0 };
        } catch { return { username: entryUsername, totalEP: 0 }; }
      }));
      const myTotalEP = Number(profile.totalEP) || 0;
      const totalEPRank = 1 + profileTotals.filter((entry) => entry && entry.username.toLowerCase() !== String(username).toLowerCase() && entry.totalEP > myTotalEP).length;
      const best = profile.bestRoll || null;
      let bestRank = null;
      if (best) {
        const lbIndex = leaderboard.findIndex((entry) =>
          String(entry.name || "").toLowerCase() === String(best.name || username).toLowerCase() &&
          String(entry.word || "") === String(best.word || "") &&
          Number(entry.ep) === Number(best.ep) &&
          Number(entry.ts) === Number(best.ts)
        );
        if (lbIndex >= 0) bestRank = lbIndex + 1;
      }

      return json({
        username: profile.username || username,
        displayName: profile.displayName || displayName,
        createdAt: stored ? Number(stored.createdAt) || null : null,
        totalEPRank,
        rollCount: Number(profile.rollCount) || 0,
        totalEP: Number(profile.totalEP) || 0,
        bestRoll: best ? { word: best.word, ep: best.ep, ts: best.ts, rank: bestRank } : null,
        recentRolls: (profile.recentRolls || []).slice(0, MAX_PROFILE_RECENT).map((r) => ({
          word: r.word,
          ep: r.ep,
          ts: r.ts,
          rank: leaderboard.findIndex((entry) => String(entry.name || "").toLowerCase() === String(r.name || profile.username).toLowerCase() && String(entry.word || "") === String(r.word || "") && Number(entry.ep) === Number(r.ep) && Number(entry.ts) === Number(r.ts)) >= 0
            ? leaderboard.findIndex((entry) => String(entry.name || "").toLowerCase() === String(r.name || profile.username).toLowerCase() && String(entry.word || "") === String(r.word || "") && Number(entry.ep) === Number(r.ep) && Number(entry.ts) === Number(r.ts)) + 1
            : null
        }))
      });
    }

    if (url.pathname.startsWith("/api/roll/") && request.method === "GET") {
      const word = decodeURIComponent(url.pathname.slice("/api/roll/".length)).toUpperCase();
      const name = String(url.searchParams.get("name") || "").toLowerCase();
      const ep = Number(url.searchParams.get("ep"));
      const rolls = await getRolls(env);
      const record = rolls.find((roll) => roll.word === word && (!name || roll.name.toLowerCase() === name) && (!Number.isFinite(ep) || Number(roll.ep) === ep));
      return record ? json(record) : json({ error: "Roll not found" }, 404);
    }

    if (url.pathname === "/api/roll" && request.method === "POST") {
      let body;
      try {
        body = await request.json();
      } catch {
        return json({ error: "Invalid JSON" }, 400);
      }
      const name = String(body.name || "").trim().slice(0, 20);
      const word = String(body.word || "").trim().toUpperCase().slice(0, 6);
      const ep = Number(body.ep);
      const email = String(body.email || "").trim().toLowerCase();
      const signedInUser = await getSessionUser(request, env);
      const canSave = !!signedInUser && (!email || email === signedInUser.email);
      if (!name || !/^[A-Z]{6}$/.test(word) || !Number.isFinite(ep) || ep < 0) {
        return json({ error: "name, six-letter word, and non-negative numeric ep required" }, 400);
      }
      if (!canSave) return json({ ok: false, skipped: true });

      const username = String(signedInUser.username || signedInUser.email || email || name).trim();
      const ts = Date.now();
      const record = { word, name, ep, ts, email: signedInUser.email || email || null, username };

      // Every successful roll is now part of the player's own history.
      // The profile stores aggregates + a bounded recent history, so ordinary
      // rolls no longer disappear just because they miss the global top 20.
      const profile = await getPlayerProfile(env, username, {
        displayName: name,
        seedFromLegacy: true
      }) || {
        username,
        displayName: name,
        rollCount: 0,
        totalEP: 0,
        bestRoll: null,
        recentRolls: []
      };

      profile.username = username;
      profile.displayName = name || profile.displayName || username;
      profile.rollCount = (Number(profile.rollCount) || 0) + 1;
      profile.totalEP = (Number(profile.totalEP) || 0) + ep;
      profile.bestRoll = !profile.bestRoll || ep > Number(profile.bestRoll.ep || 0) ? record : profile.bestRoll;
      profile.recentRolls = [record].concat(Array.isArray(profile.recentRolls) ? profile.recentRolls : [])
        .sort((a, b) => (Number(b.ts) || 0) - (Number(a.ts) || 0))
        .slice(0, MAX_PROFILE_RECENT);
      await env.PLAYERS.put(PROFILE_PREFIX + username.toLowerCase(), JSON.stringify(profile));

      // Only the global top-20 index needs to be touched when this roll can
      // actually enter it. This keeps leaderboard traffic small while player
      // history remains complete.
      const index = await getRollIndex(env);
      const leaderboard = Array.isArray(index.leaderboard) ? index.leaderboard.slice() : [];
      const qualifies = leaderboard.length < MAX_LEADERBOARD || ep >= Number(leaderboard[leaderboard.length - 1]?.ep || 0);
      let savedToLeaderboard = false;

      if (qualifies) {
        leaderboard.push(record);
        leaderboard.sort((a, b) => (Number(b.ep) || 0) - (Number(a.ep) || 0));
        const top = leaderboard.slice(0, MAX_LEADERBOARD);
        const cutoffEp = top.length ? Number(top[top.length - 1].ep) || 0 : null;
        await env.PLAYERS.put(ROLL_INDEX_KEY, JSON.stringify({
          count: top.length,
          cutoffEp,
          leaderboard: top
        }));
        savedToLeaderboard = top.some((roll) => roll.word === word && roll.name === name && Number(roll.ep) === ep && Number(roll.ts) === ts);
      }

      const latestIndex = await getRollIndex(env);
      return json({ ok: true, saved: true, leaderboard: savedToLeaderboard,
        leaderboardData: latestIndex.leaderboard || [],
        profile: {
          rollCount: profile.rollCount,
          totalEP: profile.totalEP,
          bestRoll: profile.bestRoll
        }});
    }

    // --- Admin debug: manually inject a score into the live profile/leaderboard. ---
    // --- Admin debug: manually inject a score into the live profile/leaderboard. ---
        if (url.pathname === "/api/admin/manual-score" && request.method === "POST") {
      try {
        let body;
        try { body = await request.json(); } catch (_) { return json({ error: "Invalid JSON" }, 400); }

        const name = String(body?.name || "").trim().slice(0, 32);
        const word = String(body?.word || "").trim().toUpperCase();
        const ep = Number(body?.ep);

        if (!name) return json({ error: "Name is required" }, 400);
        if (!/^[A-Z]{6}$/.test(word)) return json({ error: "Word must be exactly 6 letters" }, 400);
        if (!Number.isFinite(ep) || ep < 0) return json({ error: "EP must be a non-negative number" }, 400);

        const record = { word, name, ep, ts: Date.now() };

        // Diagnostic path: read the already-maintained leaderboard index, add the
        // supplied score, sort it, and write the index back. This isolates whether
        // the live leaderboard index itself can be updated.
        let index = null;
        const rawIndex = await env.PLAYERS.get(ROLL_INDEX_KEY);
        if (rawIndex) {
          try { index = JSON.parse(rawIndex); } catch (_) { index = null; }
        }

        let top = Array.isArray(index?.leaderboard) ? index.leaderboard.slice() : [];
        top.push(record);
        top.sort((a, b) => {
          const epDiff = (Number(b.ep) || 0) - (Number(a.ep) || 0);
          if (epDiff) return epDiff;
          return (Number(a.ts) || 0) - (Number(b.ts) || 0);
        });
        top = top.slice(0, MAX_LEADERBOARD);

        const cutoffEp = top.length ? Number(top[top.length - 1].ep) || 0 : null;
        await env.PLAYERS.put(ROLL_INDEX_KEY, JSON.stringify({
          count: top.length,
          cutoffEp,
          leaderboard: top,
          updatedAt: Date.now()
        }));

        return json({ ok: true, record, leaderboard: top });
      } catch (err) {
        console.error("manual score error", err);
        return json({
          error: "Manual score failed",
          detail: String(err?.stack || err?.message || err)
        }, 500);
      }
    }

    // --- Admin debug: delete a score from the live leaderboard. ---
    if (url.pathname === "/api/admin/delete-score" && request.method === "POST") {
      try {
        let body;
        try { body = await request.json(); } catch (_) { return json({ error: "Invalid JSON" }, 400); }

        const name = String(body?.name || "").trim().slice(0, 32);
        const word = String(body?.word || "").trim().toUpperCase();

        if (!name) return json({ error: "Name is required" }, 400);
        if (!/^[A-Z]{6}$/.test(word)) return json({ error: "Word must be exactly 6 letters" }, 400);

        let index = null;
        const rawIndex = await env.PLAYERS.get(ROLL_INDEX_KEY);
        if (rawIndex) {
          try { index = JSON.parse(rawIndex); } catch (_) { index = null; }
        }

        let top = Array.isArray(index?.leaderboard) ? index.leaderboard.slice() : [];
        const beforeCount = top.length;
        top = top.filter((r) => !(r.name && String(r.name).toLowerCase() === name.toLowerCase() && r.word === word));
        const deleted = beforeCount - top.length;

        top.sort((a, b) => {
          const epDiff = (Number(b.ep) || 0) - (Number(a.ep) || 0);
          if (epDiff) return epDiff;
          return (Number(a.ts) || 0) - (Number(b.ts) || 0);
        });
        top = top.slice(0, MAX_LEADERBOARD);

        const cutoffEp = top.length ? Number(top[top.length - 1].ep) || 0 : null;
        await env.PLAYERS.put(ROLL_INDEX_KEY, JSON.stringify({
          count: top.length,
          cutoffEp,
          leaderboard: top,
          updatedAt: Date.now()
        }));

        return json({ ok: true, deleted, leaderboard: top });
      } catch (err) {
        console.error("delete score error", err);
        return json({
          error: "Delete score failed",
          detail: String(err?.stack || err?.message || err)
        }, 500);
      }
    }

    if (url.pathname === "/api/reset" && request.method === "POST") {
      await env.PLAYERS.put(KV_KEY, JSON.stringify([]));
      await env.PLAYERS.put(ROLL_INDEX_KEY, JSON.stringify({ count: 0, cutoffEp: null, leaderboard: [] }));
      const users = await getAuthUsers(env);
      for (const user of users) {
        const username = String(user.username || user.email || "").trim().toLowerCase();
        if (username) await env.PLAYERS.delete(PROFILE_PREFIX + username);
      }
      return json({ ok: true });
    }

    // --- Admin: return every stored roll (not just the top 20) so the client
    // can recompute each score with the current formula. ---
    if (url.pathname === "/api/admin/rolls" && request.method === "GET") {
      const rolls = await getRolls(env);
      return json(rolls);
    }

    // --- Admin: overwrite the leaderboard with a recalculated set of rolls. ---
    if (url.pathname === "/api/admin/recalc" && request.method === "POST") {
      let body;
      try {
        body = await request.json();
      } catch {
        return json({ error: "Invalid JSON" }, 400);
      }
      const incoming = Array.isArray(body && body.rolls) ? body.rolls : null;
      if (!incoming) return json({ error: "rolls array required" }, 400);

      const cleaned = [];
      for (const roll of incoming) {
        if (!roll || typeof roll !== "object") continue;
        const name = String(roll.name || "").trim().slice(0, 20);
        const word = String(roll.word || "").trim().toUpperCase().slice(0, 6);
        const ep = Number(roll.ep);
        if (!name || !/^[A-Z]{6}$/.test(word) || !Number.isFinite(ep) || ep < 0) continue;
        const ts = Number.isFinite(Number(roll.ts)) ? Number(roll.ts) : Date.now();
        cleaned.push({ word, name, ep, ts });
      }
      cleaned.sort((a, b) => (Number(b.ep) || 0) - (Number(a.ep) || 0));
      const trimmed = cleaned.slice(0, MAX_ROLLS);
      await env.PLAYERS.put(KV_KEY, JSON.stringify(trimmed));
      await env.PLAYERS.put(ROLL_INDEX_KEY, JSON.stringify({
        count: trimmed.length,
        cutoffEp: trimmed.length ? Number(trimmed[trimmed.length - 1].ep) || 0 : null,
        leaderboard: trimmed.slice(0, MAX_LEADERBOARD)
      }));
      return json({ ok: true, count: cleaned.length });
    }

    return new Response("Not found", { status: 404 });
  },
};

async function getPlayerProfile(env, username, options = {}) {
  const keyName = String(username || "").trim().toLowerCase();
  if (!keyName) return null;
  const key = PROFILE_PREFIX + keyName;
  const raw = await env.PLAYERS.get(key);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") return parsed;
    } catch {}
  }

  // Existing deployments only have the legacy top-500 roll list. Seed a
  // profile from that data once so current users get useful stats immediately.
  if (!options.seedFromLegacy) return null;
  const rolls = await getRolls(env);
  const displayName = String(options.displayName || username).trim();
  const normalized = keyName;
  const playerRolls = rolls.filter((roll) => {
    const rollName = String(roll.name || "").toLowerCase();
    const rollEmail = String(roll.email || "").toLowerCase();
    return rollName === normalized || rollName === displayName.toLowerCase() || rollEmail === normalized || String(roll.username || "").toLowerCase() === normalized;
  }).sort((a, b) => (Number(b.ts) || 0) - (Number(a.ts) || 0));
  if (!playerRolls.length) return null;
  const profile = {
    username,
    displayName,
    rollCount: playerRolls.length,
    totalEP: playerRolls.reduce((sum, roll) => sum + (Number(roll.ep) || 0), 0),
    bestRoll: playerRolls.slice().sort((a, b) => (Number(b.ep) || 0) - (Number(a.ep) || 0))[0],
    recentRolls: playerRolls.slice(0, MAX_PROFILE_RECENT)
  };
  await env.PLAYERS.put(key, JSON.stringify(profile));
  return profile;
}

async function getRolls(env) {
  const raw = await env.PLAYERS.get(KV_KEY);
  if (!raw) return [];
  try {
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data.filter((roll) => roll && typeof roll.word === "string" && typeof roll.name === "string" && Number.isFinite(Number(roll.ep))) : [];
  } catch {
    return [];
  }
}

async function getRollIndex(env) {
  const raw = await env.PLAYERS.get(ROLL_INDEX_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.leaderboard)) {
        return {
          count: Number(parsed.count) || parsed.leaderboard.length,
          cutoffEp: Number.isFinite(Number(parsed.cutoffEp)) ? Number(parsed.cutoffEp) : null,
          leaderboard: parsed.leaderboard
        };
      }
    } catch {}
  }

  // One-time migration/fallback for existing deployments that only have the
  // original "rolls" key.
  const rolls = await getRolls(env);
  const sorted = rolls.slice().sort((a, b) => (Number(b.ep) || 0) - (Number(a.ep) || 0));
  const trimmed = sorted.slice(0, MAX_ROLLS);
  const index = {
    count: trimmed.length,
    cutoffEp: trimmed.length ? Number(trimmed[trimmed.length - 1].ep) || 0 : null,
    leaderboard: trimmed.slice(0, MAX_LEADERBOARD)
  };
  await env.PLAYERS.put(ROLL_INDEX_KEY, JSON.stringify(index));
  return index;
}

async function getAuthUsers(env) {
  const raw = await env.PLAYERS.get(AUTH_USERS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Web Crypto helpers for password hashing
function uint8ArrayToBase64(u8) {
  let CHUNK_SIZE = 0x8000;
  let index = 0;
  let result = "";
  while (index < u8.length) {
    const sub = u8.subarray(index, Math.min(index + CHUNK_SIZE, u8.length));
    result += String.fromCharCode.apply(null, sub);
    index += CHUNK_SIZE;
  }
  return btoa(result);
}

function base64ToUint8Array(b64) {
  const bin = atob(b64);
  const len = bin.length;
  const arr = new Uint8Array(len);
  for (let i = 0; i < len; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}

function generateSaltBase64() {
  const s = crypto.getRandomValues(new Uint8Array(16));
  return uint8ArrayToBase64(s);
}

async function derivePasswordHash(password, saltBase64) {
  const enc = new TextEncoder();
  const salt = base64ToUint8Array(saltBase64);
  const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(password), { name: "PBKDF2" }, false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: salt, iterations: 100000, hash: "SHA-256" }, keyMaterial, 256);
  return uint8ArrayToBase64(new Uint8Array(bits));
}

async function getSessionRecord(request, env) {
  const cookieHeader = request.headers.get("Cookie") || "";
  const match = cookieHeader.match(new RegExp(`(?:^|; )${AUTH_COOKIE}=([^;]+)`));
  if (!match) return null;
  const token = decodeURIComponent(match[1]);
  const key = `${AUTH_SESSIONS_KEY}:${token}`;
  const raw = await env.PLAYERS.get(key);
  if (!raw) return null;
  try {
    const payload = JSON.parse(raw);
    if (payload.expiresAt <= Date.now()) {
      await env.PLAYERS.delete(key);
      return null;
    }
    const users = await getAuthUsers(env);
    const user = users.find((entry) => entry.email === payload.email || entry.username === payload.email);
    return {
      key,
      token,
      email: payload.email,
      user: user ? { email: user.email || user.username, username: user.username || user.email, name: user.name || "", createdAt: user.createdAt || null } : { email: payload.email, username: payload.email, name: "", createdAt: null }
    };
  } catch {
    return null;
  }
}

async function getSessionUser(request, env) {
  const session = await getSessionRecord(request, env);
  return session ? session.user : null;
}

async function requireAdmin(request, env) {
  const user = await getSessionUser(request, env);
  return user ? user : null;
}

function createSessionToken(email) {
  return `${email}:${Date.now().toString(36)}:${Math.random().toString(36).slice(2)}`;
}

function serializeCookie(name, value, options = {}) {
  let cookie = `${name}=${encodeURIComponent(value)}`;
  if (options.maxAge) cookie += `; Max-Age=${options.maxAge}`;
  if (options.path) cookie += `; Path=${options.path}`;
  if (options.httpOnly) cookie += `; HttpOnly`;
  if (options.secure) cookie += `; Secure`;
  if (options.sameSite) cookie += `; SameSite=${options.sameSite}`;
  return cookie;
}

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: Object.assign({ "content-type": "application/json" }, extraHeaders)
  });
}
