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

  .name-field {
    display: flex; align-items: center; gap: 10px;
    background: transparent; border: 0; border-bottom: 1px solid var(--soft-border); border-radius: 0;
    padding: 7px 2px; margin: 0 auto 20px; max-width: 270px; transition: border-color .2s ease, box-shadow .2s ease;
  }
  .name-field:focus-within { border-color: var(--accent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 22%, transparent); }
  .name-field label { font-size: .62rem; text-transform: uppercase; letter-spacing: .08em; color: var(--text-3); white-space: nowrap; }
  .name-field input { flex: 1; border: 0; background: transparent; color: var(--text); font-size: .95rem; outline: none; font-family: inherit; min-width: 0; }
  .name-field input::placeholder { color: var(--text-3); }

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

  /* ---------- leaderboard ---------- */
  .leaderboard { margin-top: 44px; }
  .leaderboard h2 { display: flex; align-items: center; gap: 8px; font-size: 1.05rem; margin: 0 0 14px; }
  .lb-table { border: 1px solid var(--border); border-radius: 16px; overflow: hidden; background: var(--surface); }
  .lb-row { display: grid; grid-template-columns: 36px 1fr 1fr 88px; align-items: center; gap: 8px; padding: 11px 14px; font-size: .85rem; }
  .lb-head { color: var(--text-3); font-size: .68rem; text-transform: uppercase; letter-spacing: .06em; border-bottom: 1px solid var(--border); }
  .lb-body-row { border-bottom: 1px solid var(--border); transition: background .2s ease; animation: rowIn .35s ease both; }
  @keyframes rowIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
  .lb-body-row:last-child { border-bottom: none; }
  .lb-body-row:hover { background: var(--surface-2); }
  .lb-body-row.me { background: color-mix(in srgb, var(--accent) 10%, transparent); }
  .lb-rank { font-weight: 700; color: var(--text-3); }
  .lb-word { font-family: "Space Mono", monospace; font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .lb-name { font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .lb-ep { font-family: "Space Mono", monospace; font-weight: 700; }
  .lb-rolls, .lb-best { font-family: "Space Mono", monospace; color: var(--text-2); font-size: .8rem; }
  .lb-empty { padding: 26px; text-align: center; color: var(--text-3); font-size: .85rem; }

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
</style>
</head>
<body>
  <div class="bg-decor" aria-hidden="true"></div>

  <header class="site-header">
    <div class="brand"><span class="brand-dice">🎲</span><span>SixRoll</span></div>
    <div class="header-actions">
      <a href="#leaderboard" class="icon-btn" aria-label="Jump to leaderboard" title="Leaderboard">🏆</a>
      <button id="themeToggle" class="icon-btn" aria-label="Toggle theme" title="Toggle theme">
        <span class="theme-icon-moon">🌙</span><span class="theme-icon-sun">☀️</span>
      </button>
    </div>
  </header>

  <main class="container">
    <section class="hero-card">
      <p class="hero-tag">Roll six random letters. Score badges for patterns and real words hidden in your pull.</p>

      <div class="name-field">
        <label for="nameInput">Player</label>
        <input id="nameInput" maxlength="20" placeholder="Enter a name for the leaderboard">
      </div>

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
      <h2><span>🏆</span> Leaderboard</h2>
      <div class="lb-table">
        <div class="lb-row lb-head">
          <span>#</span><span>Word</span><span>Name</span><span>EP</span>
        </div>
        <div id="lbBody"></div>
      </div>
    </section>
  </main>

  <div id="toast" class="toast"></div>
  <div id="confettiRoot" class="confetti-root" aria-hidden="true"></div>

<script>
/* ================= word list & game data ================= */
var WORDS = new Set(["AAA","AARON","ABC","ABLE","ABOUT","ABOVE","ABROAD","ABS","ABSENT","ABU","ABUSE","ACC","ACCENT","ACCEPT","ACCESS","ACE","ACER","ACID","ACIDS","ACM","ACNE","ACRE","ACRES","ACROSS","ACT","ACTING","ACTION","ACTIVE","ACTOR","ACTORS","ACTS","ACTUAL","ACUTE","ADA","ADAM","ADAMS","ADD","ADDED","ADDING","ADDS","ADIDAS","ADIPEX","ADJUST","ADMIN","ADMIT","ADOBE","ADOPT","ADRIAN","ADS","ADSL","ADULT","ADULTS","ADVERT","ADVICE","ADVISE","ADWARE","AERIAL","AFFAIR","AFFECT","AFFORD","AFRAID","AFRICA","AFTER","AGAIN","AGE","AGED","AGENCY","AGENDA","AGENT","AGENTS","AGES","AGING","AGO","AGREE","AGREED","AGREES","AHEAD","AID","AIDS","AIM","AIMED","AIMS","AIR","AKA","ALA","ALAN","ALARM","ALASKA","ALBANY","ALBERT","ALBUM","ALBUMS","ALERT","ALERTS","ALEX","ALFRED","ALI","ALIAS","ALICE","ALIEN","ALIGN","ALIKE","ALIVE","ALL","ALLAH","ALLAN","ALLEN","ALLIED","ALLOW","ALLOWS","ALLOY","ALMOST","ALONE","ALONG","ALOT","ALPHA","ALPINE","ALSO","ALT","ALTER","ALTO","ALUMNI","ALWAYS","AMANDA","AMAZON","AMBER","AMBIEN","AMD","AMEND","AMINO","AMONG","AMOUNT","AMP","AMY","ANA","ANALOG","ANCHOR","AND","ANDALE","ANDREA","ANDREW","ANDY","ANGEL","ANGELA","ANGELS","ANGER","ANGLE","ANGOLA","ANGRY","ANIMAL","ANIME","ANN","ANNA","ANNE","ANNEX","ANNIE","ANNUAL","ANSWER","ANT","ANTI","ANY","ANYONE","ANYWAY","AOL","APACHE","APART","API","APNIC","APOLLO","APP","APPEAL","APPEAR","APPLE","APPLY","APPROX","APPS","APR","APRIL","APT","AQUA","ARAB","ARABIA","ARABIC","ARBOR","ARC","ARCADE","ARCH","ARCTIC","ARE","AREA","AREAS","ARENA","ARG","ARGUE","ARGUED","ARISE","ARM","ARMED","ARMOR","ARMS","ARMY","ARNOLD","AROUND","ARRAY","ARREST","ARRIVE","ARROW","ART","ARTHUR","ARTIST","ARTS","ARUBA","ASCII","ASH","ASHLEY","ASIA","ASIAN","ASIDE","ASIN","ASK","ASKED","ASKING","ASKS","ASN","ASP","ASPECT","ASSESS","ASSET","ASSETS","ASSIGN","ASSIST","ASSUME","ASSURE","ASTHMA","ASUS","ASYLUM","ATA","ATE","ATHENS","ATI","ATLAS","ATM","ATOM","ATOMIC","ATTACH","ATTACK","ATTEND","AUBURN","AUD","AUDI","AUDIO","AUDIT","AUG","AUGUST","AURORA","AUS","AUSTIN","AUTHOR","AUTO","AUTOS","AUTUMN","AVATAR","AVE","AVENUE","AVG","AVI","AVOID","AVON","AWARD","AWARDS","AWARE","AWAY","AWFUL","AXIS","AYE","BABE","BABES","BABIES","BABY","BACK","BACKED","BACKUP","BACON","BAD","BADGE","BADLY","BAG","BAGS","BAILEY","BAKER","BAKING","BALD","BALI","BALL","BALLET","BALLOT","BAN","BANANA","BAND","BANDS","BANG","BANK","BANKS","BANNED","BANNER","BAR","BARBIE","BARE","BARELY","BARN","BARNES","BARREL","BARRY","BARS","BASE","BASED","BASES","BASIC","BASICS","BASIN","BASIS","BASKET","BASS","BAT","BATCH","BATH","BATHS","BATMAN","BATTLE","BAY","BBC","BBS","BEACH","BEADS","BEAM","BEAN","BEANS","BEAR","BEARS","BEAST","BEAT","BEATS","BEAUTY","BEAVER","BECAME","BECOME","BED","BEDS","BEE","BEEF","BEEN","BEER","BEFORE","BEGAN","BEGIN","BEGINS","BEGUN","BEHALF","BEHIND","BEING","BEINGS","BELIEF","BELIZE","BELKIN","BELL","BELLE","BELLY","BELONG","BELOW","BELT","BELTS","BEN","BENCH","BEND","BENT","BENZ","BERLIN","BERRY","BESIDE","BEST","BET","BETA","BETH","BETTER","BETTY","BEYOND","BHUTAN","BIAS","BIBLE","BID","BIDDER","BIDS","BIG","BIGGER","BIKE","BIKES","BIKINI","BILL","BILLS","BILLY","BIN","BINARY","BIND","BINGO","BIO","BIOL","BIOS","BIRD","BIRDS","BIRTH","BISHOP","BIT","BITE","BITS","BIZ","BLACK","BLACKS","BLADE","BLADES","BLAH","BLAIR","BLAKE","BLAME","BLANK","BLAST","BLEND","BLESS","BLIND","BLINK","BLOCK","BLOCKS","BLOG","BLOGS","BLOND","BLONDE","BLOOD","BLOOM","BLOW","BLUE","BLUES","BLVD","BMW","BOARD","BOARDS","BOAT","BOATS","BOB","BOBBY","BOC","BODIES","BODY","BOLD","BOLT","BOMB","BON","BOND","BONDS","BONE","BONES","BONUS","BOOK","BOOKS","BOOL","BOOM","BOOST","BOOT","BOOTH","BOOTS","BOOTY","BORDER","BORED","BORING","BORN","BOSNIA","BOSS","BOSTON","BOTH","BOTHER","BOTTLE","BOTTOM","BOUGHT","BOUND","BOW","BOWL","BOX","BOXED","BOXES","BOXING","BOY","BOYS","BRA","BRAD","BRAIN","BRAKE","BRAKES","BRANCH","BRAND","BRANDS","BRAS","BRASS","BRAVE","BRAZIL","BREACH","BREAD","BREAK","BREAKS","BREAST","BREATH","BREED","BREEDS","BRIAN","BRICK","BRIDAL","BRIDE","BRIDGE","BRIEF","BRIEFS","BRIGHT","BRING","BRINGS","BROAD","BROKE","BROKEN","BROKER","BRONZE","BROOK","BROOKS","BROWN","BROWSE","BRUCE","BRUNEI","BRUSH","BRUTAL","BRYAN","BRYANT","BUBBLE","BUCK","BUCKS","BUDDY","BUDGET","BUF","BUFFER","BUFING","BUG","BUGS","BUILD","BUILDS","BUILT","BULK","BULL","BULLET","BUMPER","BUNCH","BUNDLE","BUNNY","BURDEN","BUREAU","BURIED","BURKE","BURN","BURNER","BURNS","BURST","BURTON","BUS","BUSES","BUSH","BUSY","BUT","BUTLER","BUTTER","BUTTON","BUTTS","BUY","BUYER","BUYERS","BUYING","BUYS","BUZZ","BYE","BYTE","BYTES","CAB","CABIN","CABLE","CABLES","CACHE","CACHED","CAD","CAFE","CAGE","CAKE","CAKES","CAL","CALL","CALLED","CALLS","CALM","CALVIN","CAM","CAME","CAMEL","CAMERA","CAMP","CAMPS","CAMPUS","CAMS","CAN","CANADA","CANAL","CANCEL","CANCER","CANDLE","CANDY","CANNON","CANON","CANT","CANVAS","CANYON","CAP","CAPE","CAPS","CAR","CARB","CARBON","CARD","CARDS","CARE","CAREER","CAREY","CARGO","CARING","CARL","CARLO","CARLOS","CARMEN","CAROL","CARPET","CARRY","CARS","CART","CARTER","CAS","CASA","CASE","CASES","CASEY","CASH","CASINO","CASIO","CAST","CASTLE","CASUAL","CAT","CATCH","CATS","CATTLE","CAUGHT","CAUSE","CAUSED","CAUSES","CAVE","CAYMAN","CBS","CCD","CDNA","CDS","CDT","CEDAR","CELEBS","CELL","CELLS","CELTIC","CEMENT","CENSUS","CENT","CENTER","CENTRE","CENTS","CEO","CET","CFR","CGI","CHAD","CHAIN","CHAINS","CHAIR","CHAIRS","CHAN","CHANCE","CHANGE","CHAOS","CHAPEL","CHAR","CHARGE","CHARM","CHARMS","CHART","CHARTS","CHASE","CHAT","CHEAP","CHEAT","CHEATS","CHECK","CHECKS","CHEERS","CHEESE","CHEF","CHEM","CHEN","CHEQUE","CHERRY","CHESS","CHEST","CHEVY","CHI","CHICK","CHICKS","CHIEF","CHILD","CHILE","CHINA","CHIP","CHIPS","CHO","CHOICE","CHOIR","CHOOSE","CHORUS","CHOSE","CHOSEN","CHRIS","CHRIST","CHROME","CHUBBY","CHUCK","CHURCH","CIA","CIALIS","CIAO","CINDY","CINEMA","CIO","CIR","CIRCLE","CIRCUS","CISCO","CITE","CITED","CITIES","CITY","CIVIC","CIVIL","CLAIM","CLAIMS","CLAIRE","CLAN","CLARA","CLARK","CLARKE","CLASS","CLAUSE","CLAY","CLEAN","CLEAR","CLERK","CLICK","CLICKS","CLIENT","CLIFF","CLIMB","CLINIC","CLIP","CLIPS","CLOCK","CLOCKS","CLONE","CLOSE","CLOSED","CLOSER","CLOSES","CLOTH","CLOUD","CLOUDS","CLOUDY","CLUB","CLUBS","CMS","CNET","CNN","COACH","COAL","COAST","COAT","COATED","COD","CODE","CODES","CODING","COFFEE","COHEN","COIN","COINS","COL","COLD","COLE","COLIN","COLLAR","COLON","COLONY","COLOR","COLORS","COLOUR","COLUMN","COM","COMBAT","COMBO","COME","COMEDY","COMES","COMIC","COMICS","COMING","COMM","COMMIT","COMMON","COMP","COMPAQ","COMPLY","CON","CONDO","CONDOS","CONF","CONFIG","CONGO","CONS","CONST","COOK","COOKED","COOKIE","COOL","COOLER","COOPER","COP","COPE","COPIED","COPIES","COPPER","COPY","CORAL","CORD","CORE","CORK","CORN","CORNER","CORP","CORPS","CORPUS","COS","COST","COSTA","COSTS","COTTON","COULD","COUNT","COUNTS","COUNTY","COUPLE","COUPON","COURSE","COURT","COURTS","COVE","COVER","COVERS","COW","COWBOY","CPU","CRACK","CRADLE","CRAFT","CRAFTS","CRAIG","CRAPS","CRASH","CRAZY","CREAM","CREATE","CREDIT","CREEK","CREST","CREW","CRIME","CRIMES","CRISIS","CRM","CROP","CROPS","CROSS","CROWD","CROWN","CRUDE","CRUISE","CRUZ","CRY","CSS","CST","CTRL","CUBA","CUBE","CUBIC","CULT","CUP","CUPS","CURE","CURSOR","CURTIS","CURVE","CURVES","CUSTOM","CUT","CUTE","CUTS","CVS","CYBER","CYCLE","CYCLES","CYPRUS","CZECH","DAD","DADDY","DAILY","DAIRY","DAISY","DAKOTA","DALE","DALLAS","DAM","DAMAGE","DAME","DAN","DANA","DANCE","DANGER","DANIEL","DANISH","DANNY","DANS","DARE","DARK","DARWIN","DAS","DASH","DAT","DATA","DATE","DATED","DATES","DATING","DAVE","DAVID","DAVIS","DAWN","DAY","DAYS","DAYTON","DDR","DEAD","DEADLY","DEAF","DEAL","DEALER","DEALS","DEALT","DEAN","DEAR","DEATH","DEATHS","DEBATE","DEBIAN","DEBT","DEBUG","DEBUT","DEC","DECADE","DECENT","DECIDE","DECK","DECOR","DEE","DEEMED","DEEP","DEEPER","DEEPLY","DEER","DEF","DEFEAT","DEFEND","DEFINE","DEGREE","DEL","DELAY","DELAYS","DELETE","DELHI","DELL","DELTA","DELUXE","DEM","DEMAND","DEMO","DEN","DENIAL","DENIED","DENNIS","DENSE","DENTAL","DENVER","DENY","DEPEND","DEPOT","DEPT","DEPTH","DEPUTY","DER","DERBY","DEREK","DES","DESERT","DESIGN","DESIRE","DESK","DETAIL","DETECT","DEV","DEVEL","DEVICE","DEVIL","DEVON","DIAL","DIALOG","DIANA","DIANE","DIARY","DICE","DICKE","DID","DIE","DIED","DIEGO","DIES","DIESEL","DIET","DIFF","DIFFER","DIFFS","DIG","DIGEST","DIGIT","DIM","DINING","DINNER","DIP","DIR","DIRECT","DIRT","DIRTY","DIS","DISC","DISCO","DISCS","DISH","DISHES","DISK","DISKS","DISNEY","DIST","DIV","DIVE","DIVIDE","DIVINE","DIVING","DIVX","DIY","DNA","DNS","DOC","DOCK","DOCS","DOCTOR","DOD","DODGE","DOE","DOES","DOG","DOGS","DOING","DOLL","DOLLAR","DOLLS","DOM","DOMAIN","DOME","DON","DONALD","DONATE","DONE","DONNA","DONOR","DONORS","DONT","DOOM","DOOR","DOORS","DOS","DOSAGE","DOSE","DOT","DOUBLE","DOUBT","DOUG","DOVER","DOW","DOWN","DOZEN","DOZENS","DPI","DRAFT","DRAG","DRAGON","DRAIN","DRAMA","DRAW","DRAWN","DRAWS","DREAM","DREAMS","DRESS","DREW","DRIED","DRILL","DRINK","DRINKS","DRIVE","DRIVEN","DRIVER","DRIVES","DROP","DROPS","DROVE","DRUG","DRUGS","DRUM","DRUMS","DRUNK","DRY","DRYER","DSC","DSL","DTS","DUAL","DUBAI","DUBLIN","DUCK","DUDE","DUE","DUI","DUKE","DUMB","DUMP","DUNCAN","DUO","DURHAM","DURING","DUST","DUTCH","DUTIES","DUTY","DVD","DVDS","DYING","DYLAN","EACH","EAGLE","EAGLES","EAR","EARL","EARLY","EARN","EARNED","EARS","EARTH","EASE","EASIER","EASILY","EAST","EASTER","EASY","EAT","EATING","EAU","EBAY","EBONY","EBOOK","EBOOKS","ECHO","ECO","EDDIE","EDEN","EDGAR","EDGE","EDGES","EDIT","EDITED","EDITOR","EDS","EDT","EDWARD","EFFECT","EFFORT","EGG","EGGS","EGYPT","EIGHT","EITHER","ELDER","ELECT","ELEVEN","ELITE","ELLEN","ELLIS","ELSE","ELVIS","EMACS","EMAIL","EMAILS","EMILY","EMINEM","EMMA","EMPIRE","EMPLOY","EMPTY","ENABLE","ENB","END","ENDED","ENDIF","ENDING","ENDS","ENEMY","ENERGY","ENG","ENGAGE","ENGINE","ENJOY","ENOUGH","ENSURE","ENT","ENTER","ENTERS","ENTIRE","ENTITY","ENTRY","ENZYME","EOS","EPA","EPIC","EPSON","EQUAL","EQUITY","ERA","ERIC","ERIK","ERP","ERROR","ERRORS","ESCAPE","ESPN","ESSAY","ESSAYS","ESSEX","EST","ESTATE","ETC","ETHICS","ETHNIC","EUGENE","EUR","EURO","EUROPE","EUROS","EVA","EVAL","EVANS","EVE","EVEN","EVENT","EVENTS","EVER","EVERY","EVIL","EXACT","EXAM","EXAMS","EXCEED","EXCEL","EXCEPT","EXCESS","EXCUSE","EXEC","EXEMPT","EXIST","EXISTS","EXIT","EXOTIC","EXP","EXPAND","EXPECT","EXPERT","EXPO","EXPORT","EXT","EXTEND","EXTENT","EXTRA","EXTRAS","EYE","EYED","EYES","FABRIC","FACE","FACED","FACES","FACIAL","FACING","FACT","FACTOR","FACTS","FAIL","FAILED","FAILS","FAIR","FAIRLY","FAIRY","FAITH","FAKE","FALL","FALLEN","FALLS","FALSE","FAME","FAMILY","FAMOUS","FAN","FANCY","FANS","FAQ","FAQS","FAR","FARE","FARES","FARM","FARMER","FARMS","FAST","FASTER","FAT","FATAL","FATE","FATHER","FATTY","FAULT","FAVOR","FAVORS","FAVOUR","FAX","FBI","FCC","FDA","FEAR","FEARS","FEAT","FEB","FED","FEE","FEED","FEEDS","FEEL","FEELS","FEES","FEET","FELL","FELLOW","FELT","FEMALE","FENCE","FEOF","FERRY","FETISH","FEVER","FEW","FEWER","FIBER","FIBRE","FIELD","FIELDS","FIFTH","FIFTY","FIG","FIGHT","FIGURE","FIJI","FILE","FILED","FILES","FILING","FILL","FILLED","FILM","FILME","FILMS","FILTER","FIN","FINAL","FINALS","FIND","FINDER","FINDS","FINE","FINEST","FINGER","FINISH","FINITE","FIRE","FIRED","FIRES","FIRM","FIRMS","FIRST","FISCAL","FISH","FISHER","FIST","FIT","FITS","FITTED","FIVE","FIX","FIXED","FIXES","FLAG","FLAGS","FLAME","FLASH","FLAT","FLAVOR","FLEECE","FLEET","FLESH","FLEX","FLICKR","FLIGHT","FLIP","FLOAT","FLOOD","FLOOR","FLOORS","FLOPPY","FLORAL","FLOUR","FLOW","FLOWER","FLOWS","FLOYD","FLU","FLUID","FLUSH","FLUX","FLY","FLYER","FLYING","FOAM","FOCAL","FOCUS","FOG","FOLD","FOLDER","FOLK","FOLKS","FOLLOW","FONT","FONTS","FOO","FOOD","FOODS","FOOL","FOOT","FOR","FORBES","FORCE","FORCED","FORCES","FORD","FOREST","FORGE","FORGET","FORGOT","FORK","FORM","FORMAL","FORMAT","FORMED","FORMER","FORMS","FORT","FORTH","FORTY","FORUM","FORUMS","FOSSIL","FOSTER","FOTO","FOTOS","FOUGHT","FOUL","FOUND","FOUR","FOURTH","FOX","FRAME","FRAMED","FRAMES","FRANCE","FRANK","FRASER","FRAUD","FRED","FREE","FREELY","FREEZE","FRENCH","FRESH","FRI","FRIDAY","FRIDGE","FRIEND","FROG","FROM","FRONT","FROST","FROZEN","FRUIT","FRUITS","FTP","FUEL","FUJI","FULL","FULLY","FUN","FUND","FUNDED","FUNDS","FUNK","FUNKY","FUNNY","FUR","FUSION","FUTURE","FUZZY","FWD","GAGE","GAIN","GAINED","GAINS","GALAXY","GALE","GAME","GAMES","GAMING","GAMMA","GANG","GAP","GAPS","GARAGE","GARCIA","GARDEN","GARLIC","GARMIN","GARY","GAS","GATE","GATES","GATHER","GAUGE","GAVE","GAY","GAYS","GBA","GBP","GCC","GDP","GEAR","GEEK","GEL","GEM","GEN","GENDER","GENE","GENES","GENEVA","GENIUS","GENOME","GENRE","GENRES","GENTLE","GENTLY","GEO","GEORGE","GERALD","GERMAN","GET","GETS","GHANA","GHOST","GHZ","GIANT","GIANTS","GIBSON","GIF","GIFT","GIFTS","GIG","GIRL","GIRLS","GIS","GIVE","GIVEN","GIVES","GIVING","GLAD","GLANCE","GLASS","GLEN","GLENN","GLOBAL","GLOBE","GLORY","GLOVES","GLOW","GMBH","GMC","GMT","GNOME","GNU","GOAL","GOALS","GOAT","GODS","GOES","GOING","GOLD","GOLDEN","GOLF","GONE","GONNA","GOOD","GOODS","GOOGLE","GORDON","GORE","GOSPEL","GOSSIP","GOT","GOTHIC","GOTO","GOTTA","GOTTEN","GPL","GPS","GRAB","GRACE","GRAD","GRADE","GRADES","GRAHAM","GRAIN","GRAMS","GRAND","GRANDE","GRANNY","GRANT","GRANTS","GRAPH","GRAPHS","GRAS","GRASS","GRATIS","GRAVE","GRAY","GREAT","GREECE","GREEK","GREEN","GREENE","GREG","GREW","GREY","GRID","GRILL","GRIP","GROOVE","GROSS","GROUND","GROUP","GROUPS","GROVE","GROW","GROWN","GROWS","GROWTH","GSM","GST","GTK","GUAM","GUARD","GUARDS","GUESS","GUEST","GUESTS","GUI","GUIDE","GUIDED","GUIDES","GUILD","GUILTY","GUINEA","GUITAR","GULF","GUN","GUNS","GURU","GUY","GUYANA","GUYS","GYM","GZIP","HABITS","HACK","HACKER","HAD","HAIR","HAIRY","HAITI","HALF","HALL","HALO","HAM","HAMMER","HAND","HANDED","HANDLE","HANDS","HANDY","HANG","HANS","HANSEN","HAPPEN","HAPPY","HARBOR","HARD","HARDER","HARDLY","HARLEY","HARM","HAROLD","HARPER","HARRIS","HARRY","HART","HARVEY","HAS","HASH","HAT","HATE","HATS","HAVE","HAVEN","HAVING","HAWAII","HAWK","HAY","HAYES","HAZARD","HDTV","HEAD","HEADED","HEADER","HEADS","HEALTH","HEAR","HEARD","HEART","HEARTS","HEAT","HEATED","HEATER","HEATH","HEAVEN","HEAVY","HEBREW","HEEL","HEIGHT","HELD","HELEN","HELENA","HELLO","HELMET","HELP","HELPED","HELPS","HENCE","HENRY","HER","HERALD","HERB","HERBAL","HERBS","HERE","HEREBY","HEREIN","HERO","HEROES","HEY","HIDDEN","HIDE","HIGH","HIGHER","HIGHLY","HIGHS","HIKING","HILL","HILLS","HILTON","HIM","HINDU","HINT","HINTS","HIP","HIRE","HIRED","HIRING","HIS","HIST","HIT","HITS","HIV","HOBBY","HOCKEY","HOLD","HOLDEM","HOLDER","HOLDS","HOLE","HOLES","HOLLOW","HOLLY","HOLMES","HOLY","HOME","HOMES","HON","HONDA","HONEST","HONEY","HONG","HONOR","HONORS","HOOD","HOOK","HOP","HOPE","HOPED","HOPES","HOPING","HORN","HORROR","HORSE","HORSES","HOSE","HOST","HOSTED","HOSTEL","HOSTS","HOT","HOTEL","HOTELS","HOUR","HOURLY","HOURS","HOUSE","HOUSES","HOW","HOWARD","HOWTO","HREF","HRS","HTML","HTTP","HUB","HUDSON","HUGE","HUGH","HUGHES","HUGO","HULL","HUMAN","HUMANS","HUMOR","HUNG","HUNGER","HUNGRY","HUNT","HUNTER","HURT","HWY","HYBRID","IAN","IBM","ICE","ICON","ICONS","ICQ","ICT","IDAHO","IDE","IDEA","IDEAL","IDEAS","IDLE","IDOL","IDS","IEEE","IGNORE","III","ILL","IMAGE","IMAGES","IMG","IMMUNE","IMPACT","IMPORT","IMPOSE","INBOX","INC","INCH","INCHES","INCL","INCOME","IND","INDEED","INDEX","INDIA","INDIAN","INDIE","INDOOR","INF","INFANT","INFO","INFORM","ING","INJURY","INK","INKJET","INLINE","INN","INNER","INNS","INPUT","INPUTS","INS","INSERT","INSIDE","INT","INTAKE","INTEL","INTEND","INTENT","INTER","INTL","INTO","INTRO","INVEST","INVITE","ION","IOWA","IPAQ","IPOD","IPS","IRA","IRAN","IRAQ","IRAQI","IRC","IRISH","IRON","IRS","ISA","ISAAC","ISBN","ISLAM","ISLAND","ISLE","ISO","ISP","ISRAEL","ISSN","ISSUE","ISSUED","ISSUES","IST","ITALIA","ITALIC","ITALY","ITEM","ITEMS","ITS","ITSELF","ITUNES","IVORY","JACK","JACKET","JACKIE","JACOB","JADE","JAGUAR","JAIL","JAKE","JAM","JAMES","JAMIE","JAN","JANE","JANET","JAPAN","JAR","JASON","JAVA","JAY","JAZZ","JEAN","JEANS","JEEP","JEFF","JENNY","JEREMY","JERRY","JERSEY","JESSE","JESUS","JET","JETS","JEWEL","JEWISH","JEWS","JILL","JIM","JIMMY","JOAN","JOB","JOBS","JOE","JOEL","JOHN","JOHNNY","JOHNS","JOIN","JOINED","JOINS","JOINT","JOKE","JOKES","JON","JONES","JORDAN","JOSE","JOSEPH","JOSH","JOSHUA","JOY","JOYCE","JPEG","JPG","JUAN","JUDGE","JUDGES","JUDY","JUICE","JUL","JULIA","JULIAN","JULIE","JULY","JUMP","JUN","JUNE","JUNGLE","JUNIOR","JUNK","JURY","JUST","JUSTIN","JVC","KAI","KANSAS","KAREN","KARL","KARMA","KATE","KATHY","KATIE","KAY","KDE","KEEN","KEEP","KEEPS","KEITH","KELKOO","KELLY","KEN","KENNY","KENO","KENT","KENYA","KEPT","KERNEL","KERRY","KEVIN","KEY","KEYS","KICK","KID","KIDNEY","KIDS","KIJIJI","KILL","KILLED","KILLER","KILLS","KIM","KINASE","KIND","KINDA","KINDS","KING","KINGS","KIRK","KISS","KIT","KITS","KITTY","KLEIN","KNEE","KNEW","KNIFE","KNIGHT","KNIT","KNIVES","KNOCK","KNOW","KNOWN","KNOWS","KODAK","KONG","KOREA","KOREAN","KRUGER","KURT","KUWAIT","KYLE","LAB","LABEL","LABELS","LABOR","LABOUR","LABS","LACE","LACK","LADDER","LADEN","LADIES","LADY","LAID","LAKE","LAKES","LAMB","LAMBDA","LAMP","LAMPS","LAN","LANCE","LAND","LANDS","LANE","LANES","LANG","LANKA","LAOS","LAP","LAPTOP","LARGE","LARGER","LARRY","LAS","LASER","LAST","LAT","LATE","LATELY","LATER","LATEST","LATEX","LATIN","LATINA","LATINO","LATTER","LATVIA","LAUGH","LAUNCH","LAURA","LAUREN","LAW","LAWN","LAWS","LAWYER","LAY","LAYER","LAYERS","LAYOUT","LAZY","LBS","LCD","LEAD","LEADER","LEADS","LEAF","LEAGUE","LEAN","LEARN","LEASE","LEAST","LEAVE","LEAVES","LED","LEE","LEEDS","LEFT","LEG","LEGACY","LEGAL","LEGEND","LEGS","LEMON","LEN","LENDER","LENGTH","LENS","LENSES","LEO","LEON","LEONE","LES","LESLIE","LESS","LESSER","LESSON","LET","LETS","LETTER","LEU","LEVEL","LEVELS","LEVY","LEWIS","LEXUS","LIABLE","LIB","LIBS","LID","LIE","LIES","LIFE","LIFT","LIGHT","LIGHTS","LIKE","LIKED","LIKELY","LIKES","LIL","LIME","LIMIT","LIMITS","LINDA","LINE","LINEAR","LINED","LINES","LINK","LINKED","LINKS","LINUX","LION","LIONS","LIP","LIPS","LIQUID","LISA","LIST","LISTED","LISTEN","LISTS","LIT","LITE","LITTLE","LIVE","LIVED","LIVER","LIVES","LIVING","LIZ","LLC","LLOYD","LLP","LOAD","LOADED","LOADS","LOAN","LOANS","LOBBY","LOC","LOCAL","LOCALE","LOCATE","LOCK","LOCKED","LOCKS","LODGE","LOG","LOGAN","LOGGED","LOGIC","LOGIN","LOGO","LOGOS","LOGS","LOL","LONDON","LONE","LONELY","LONG","LONGER","LOOK","LOOKED","LOOKS","LOOKUP","LOOP","LOOPS","LOOSE","LOPEZ","LORD","LOS","LOSE","LOSING","LOSS","LOSSES","LOST","LOT","LOTS","LOTUS","LOU","LOUD","LOUIS","LOUISE","LOUNGE","LOVE","LOVED","LOVELY","LOVER","LOVERS","LOVES","LOVING","LOW","LOWER","LOWEST","LOWS","LTD","LUCAS","LUCIA","LUCK","LUCKY","LUCY","LUIS","LUKE","LUNCH","LUNG","LUTHER","LUXURY","LYCOS","LYING","LYNN","LYRIC","LYRICS","MAC","MACRO","MAD","MADE","MADRID","MAE","MAG","MAGIC","MAGNET","MAI","MAIDEN","MAIL","MAILED","MAILS","MAILTO","MAIN","MAINE","MAINLY","MAJOR","MAKE","MAKER","MAKERS","MAKES","MAKEUP","MAKING","MALAWI","MALE","MALES","MALI","MALL","MALTA","MAMBO","MAN","MANAGE","MANGA","MANNER","MANOR","MANUAL","MANY","MAP","MAPLE","MAPS","MAR","MARBLE","MARC","MARCH","MARCO","MARCUS","MARDI","MARGIN","MARIA","MARIAH","MARIE","MARINA","MARINE","MARIO","MARION","MARK","MARKED","MARKER","MARKET","MARKS","MARS","MARSH","MART","MARTHA","MARTIN","MARVEL","MARY","MAS","MASK","MASON","MASS","MASTER","MAT","MATCH","MATE","MATH","MATING","MATRIX","MATS","MATT","MATTER","MATURE","MAUI","MAX","MAY","MAYBE","MAYOR","MAZDA","MBA","MEAL","MEALS","MEAN","MEANS","MEANT","MEAT","MED","MEDAL","MEDIA","MEDIAN","MEDIUM","MEET","MEETS","MEETUP","MEGA","MEL","MEM","MEMBER","MEMO","MEMORY","MEN","MENS","MENT","MENTAL","MENTOR","MENU","MENUS","MERCY","MERE","MERELY","MERGE","MERGER","MERIT","MERRY","MESA","MESH","MESS","MET","META","METAL","METALS","METER","METERS","METHOD","METRES","METRIC","METRO","MEXICO","MEYER","MHZ","MIA","MIAMI","MIC","MICE","MICHEL","MICRO","MID","MIDDLE","MIDI","MIGHT","MIGHTY","MIKE","MIL","MILAN","MILD","MILE","MILES","MILK","MILL","MILLER","MILLS","MILTON","MIME","MIN","MIND","MINDS","MINE","MINES","MINI","MINING","MINOR","MINS","MINT","MINUS","MINUTE","MIRROR","MISC","MISS","MISSED","MIT","MIX","MIXED","MIXER","MIXING","MLB","MLS","MOBILE","MOD","MODE","MODEL","MODELS","MODEM","MODEMS","MODERN","MODES","MODIFY","MODS","MODULE","MOLD","MOM","MOMENT","MOMS","MON","MONACO","MONDAY","MONEY","MONICA","MONKEY","MONO","MONROE","MONTE","MONTH","MONTHS","MOOD","MOON","MOORE","MORAL","MORE","MORGAN","MORRIS","MOSCOW","MOSES","MOSS","MOST","MOSTLY","MOTEL","MOTELS","MOTHER","MOTION","MOTOR","MOTORS","MOUNT","MOUNTS","MOUSE","MOUTH","MOVE","MOVED","MOVERS","MOVES","MOVIE","MOVIES","MOVING","MPEG","MPEGS","MPG","MPH","MRNA","MRS","MSG","MSGID","MSGSTR","MSIE","MSN","MTV","MUCH","MUD","MUG","MULTI","MUMBAI","MUNICH","MURDER","MURPHY","MURRAY","MUSCLE","MUSEUM","MUSIC","MUSLIM","MUST","MUTUAL","MUZE","MYERS","MYRTLE","MYSELF","MYSQL","MYTH","NAIL","NAILS","NAKED","NAM","NAME","NAMED","NAMELY","NAMES","NANCY","NANO","NAPLES","NARROW","NASA","NASCAR","NASDAQ","NASTY","NAT","NATHAN","NATION","NATIVE","NATO","NATURE","NAV","NAVAL","NAVY","NBA","NBC","NCAA","NEAR","NEARBY","NEARLY","NEC","NECK","NEED","NEEDED","NEEDLE","NEEDS","NEIL","NELSON","NEO","NEON","NEPAL","NERVE","NEST","NESTED","NET","NEURAL","NEVADA","NEVER","NEW","NEWARK","NEWBIE","NEWER","NEWEST","NEWLY","NEWMAN","NEWS","NEWTON","NEXT","NEXTEL","NFL","NHL","NHS","NICE","NICK","NICKEL","NICOLE","NIGER","NIGHT","NIGHTS","NIKE","NIKON","NIL","NINE","NISSAN","NOBLE","NOBODY","NODE","NODES","NOISE","NOKIA","NON","NONE","NOON","NOR","NORM","NORMAL","NORMAN","NORTH","NORTON","NORWAY","NOSE","NOT","NOTE","NOTED","NOTES","NOTICE","NOTIFY","NOTION","NOTRE","NOV","NOVA","NOVEL","NOVELS","NOW","NSW","NTSC","NUDIST","NUKE","NULL","NUMBER","NURSE","NURSES","NUT","NUTS","NUTTEN","NVIDIA","NYC","NYLON","OAK","OAKS","OASIS","OBJ","OBJECT","OBTAIN","OCCUR","OCCURS","OCEAN","OCLC","OCT","ODD","ODDS","OECD","OEM","OFF","OFFER","OFFERS","OFFICE","OFFSET","OFTEN","OHIO","OIL","OILS","OKAY","OLD","OLDER","OLDEST","OLIVE","OLIVER","OMAHA","OMAN","OMEGA","ONCE","ONE","ONES","ONION","ONLINE","ONLY","ONS","ONTO","OOO","OOPS","OPEN","OPENED","OPENS","OPERA","OPT","OPTICS","OPTION","ORACLE","ORAL","ORANGE","ORBIT","ORDER","ORDERS","OREGON","ORG","ORGAN","ORIGIN","OSCAR","OTHER","OTHERS","OTTAWA","OUGHT","OUR","OURS","OUT","OUTER","OUTLET","OUTPUT","OVAL","OVEN","OVER","OWEN","OWN","OWNED","OWNER","OWNERS","OWNS","OXFORD","OXIDE","OXYGEN","OZONE","PAC","PACE","PACK","PACKED","PACKET","PACKS","PAD","PADS","PAGE","PAGES","PAID","PAIN","PAINT","PAIR","PAIRS","PAL","PALACE","PALE","PALM","PALMER","PAM","PAMELA","PAN","PANAMA","PANEL","PANELS","PANIC","PANTS","PAPER","PAPERS","PAPUA","PAR","PARA","PARADE","PARCEL","PARENT","PARIS","PARISH","PARK","PARKER","PARKS","PART","PARTLY","PARTS","PARTY","PAS","PASO","PASS","PASSED","PASSES","PAST","PASTA","PASTE","PASTOR","PAT","PATCH","PATENT","PATH","PATHS","PATIO","PATROL","PAUL","PAXIL","PAY","PAYDAY","PAYING","PAYPAL","PAYS","PCI","PCS","PCT","PDA","PDAS","PDF","PDT","PEACE","PEAK","PEARL","PEAS","PEE","PEEING","PEER","PEERS","PEN","PENCIL","PENN","PENNY","PENS","PEOPLE","PEPPER","PER","PERIOD","PERL","PERMIT","PERRY","PERSON","PERTH","PERU","PEST","PET","PETE","PETER","PETITE","PETS","PGP","PHASE","PHASES","PHD","PHI","PHIL","PHILIP","PHONE","PHONES","PHOTO","PHOTOS","PHP","PHPBB","PHRASE","PHYS","PIANO","PIC","PICK","PICKED","PICKS","PICKUP","PICNIC","PICS","PIE","PIECE","PIECES","PIERCE","PIERRE","PIG","PIKE","PILL","PILLOW","PILLS","PILOT","PIN","PINE","PING","PINK","PINS","PIPE","PIPES","PIT","PITCH","PIX","PIXEL","PIXELS","PIZZA","PLACE","PLACED","PLACES","PLAIN","PLAINS","PLAN","PLANE","PLANES","PLANET","PLANS","PLANT","PLANTS","PLASMA","PLATE","PLATES","PLAY","PLAYED","PLAYER","PLAYS","PLAZA","PLC","PLEASE","PLEDGE","PLENTY","PLOT","PLOTS","PLUG","PLUGIN","PLUS","PMC","PMID","POCKET","POD","POEM","POEMS","POET","POETRY","POINT","POINTS","POISON","POKER","POLAND","POLAR","POLE","POLICE","POLICY","POLISH","POLL","POLLS","POLO","POLY","POND","POOL","POOLS","POOR","POP","POPE","POR","PORK","PORT","PORTAL","PORTER","PORTS","POS","POSE","POSING","POST","POSTAL","POSTED","POSTER","POSTS","POT","POTATO","POTTER","POUND","POUNDS","POUR","POWDER","POWELL","POWER","POWERS","PPC","PPM","PRAGUE","PRAISE","PRAY","PRAYER","PRE","PREFER","PREFIX","PREP","PRESS","PRETTY","PREV","PRICE","PRICED","PRICES","PRIDE","PRIEST","PRIME","PRINCE","PRINT","PRINTS","PRIOR","PRISON","PRIX","PRIZE","PRIZES","PRO","PROBE","PROC","PROFIT","PROMO","PROMPT","PROOF","PROPER","PROS","PROT","PROUD","PROVE","PROVED","PROVEN","PROXY","PROZAC","PSI","PSP","PST","PTS","PTY","PUB","PUBLIC","PUBMED","PUBS","PUERTO","PULL","PULLED","PULSE","PUMP","PUMPS","PUNCH","PUNK","PUPILS","PUPPY","PURE","PURPLE","PURSE","PURSUE","PUSH","PUSHED","PUT","PUTS","PUZZLE","PVC","PYTHON","QATAR","QLD","QTY","QUAD","QUE","QUEBEC","QUEEN","QUEENS","QUERY","QUEST","QUEUE","QUI","QUICK","QUIET","QUILT","QUIT","QUITE","QUIZ","QUOTE","QUOTED","QUOTES","RABBIT","RACE","RACES","RACHEL","RACIAL","RACING","RACK","RACKS","RADAR","RADIO","RADIOS","RADIUS","RAGE","RAID","RAIL","RAIN","RAISE","RAISED","RAISES","RALLY","RALPH","RAM","RAN","RANCH","RAND","RANDOM","RANDY","RANGE","RANGER","RANGES","RANK","RANKED","RANKS","RAP","RAPID","RAPIDS","RARE","RARELY","RAT","RATE","RATED","RATES","RATHER","RATING","RATIO","RATIOS","RATS","RAW","RAY","RAYS","RCA","REACH","READ","READER","READS","READY","REAL","REALLY","REALM","REALTY","REAR","REASON","REBATE","REBEL","REC","RECALL","RECENT","RECIPE","RECORD","RED","REDEEM","REDUCE","REED","REEF","REEL","REF","REFER","REFERS","REFINE","REFORM","REFUND","REFUSE","REG","REGARD","REGGAE","REGIME","REGION","REHAB","REID","REJECT","RELATE","RELAX","RELAY","RELIEF","RELOAD","RELY","REMAIN","REMARK","REMEDY","REMIND","REMIX","REMOTE","REMOVE","RENDER","RENEW","RENO","RENT","RENTAL","REP","REPAIR","REPEAT","REPLY","REPORT","RES","RESCUE","RESET","RESIST","RESORT","REST","RESULT","RESUME","RETAIL","RETAIN","RETRO","RETURN","REV","REVEAL","REVIEW","REWARD","RFC","RHODE","RHYTHM","RIBBON","RICA","RICE","RICH","RICK","RICKY","RICO","RID","RIDE","RIDER","RIDERS","RIDES","RIDGE","RIDING","RIGHT","RIGHTS","RIM","RING","RINGS","RIO","RIP","RIPE","RISE","RISING","RISK","RISKS","RIVER","RIVERS","RNA","ROAD","ROADS","ROB","ROBBIE","ROBERT","ROBIN","ROBOT","ROBOTS","ROBUST","ROCK","ROCKET","ROCKS","ROCKY","ROD","ROGER","ROGERS","ROLAND","ROLE","ROLES","ROLL","ROLLED","ROLLER","ROLLS","ROM","ROMAN","ROME","RON","RONALD","ROOF","ROOM","ROOMS","ROOT","ROOTS","ROPE","ROSA","ROSE","ROSES","ROSS","ROSTER","ROTARY","ROUGE","ROUGH","ROUND","ROUNDS","ROUTE","ROUTER","ROUTES","ROVER","ROW","ROWS","ROY","ROYAL","RPG","RPM","RRP","RSS","RUBBER","RUBY","RUG","RUGBY","RUGS","RULE","RULED","RULES","RULING","RUN","RUNNER","RUNS","RURAL","RUSH","RUSSIA","RUTH","RWANDA","RYAN","SACRED","SAD","SADDAM","SAFARI","SAFE","SAFELY","SAFER","SAFETY","SAGE","SAGEM","SAID","SAIL","SAINT","SAINTS","SAKE","SALAD","SALARY","SALE","SALEM","SALES","SALLY","SALMON","SALON","SALT","SAM","SAMBA","SAME","SAMOA","SAMPLE","SAMUEL","SAN","SAND","SANDRA","SANDY","SANS","SANTA","SANYO","SAO","SAP","SARA","SARAH","SAS","SAT","SATIN","SATURN","SAUCE","SAUDI","SAVAGE","SAVE","SAVED","SAVER","SAVES","SAVING","SAW","SAY","SAYING","SAYS","SBJCT","SCALE","SCALES","SCAN","SCARED","SCARY","SCENE","SCENES","SCENIC","SCHEMA","SCHEME","SCHOOL","SCI","SCOOP","SCOPE","SCORE","SCORED","SCORES","SCOTIA","SCOTT","SCOUT","SCREEN","SCREW","SCRIPT","SCROLL","SCSI","SCUBA","SEA","SEAL","SEALED","SEAN","SEARCH","SEAS","SEASON","SEAT","SEATS","SEC","SECOND","SECRET","SECTOR","SECURE","SEE","SEED","SEEDS","SEEING","SEEK","SEEKER","SEEKS","SEEM","SEEMED","SEEMS","SEEN","SEES","SEGA","SELECT","SELF","SELL","SELLER","SELLS","SEMI","SEN","SENATE","SEND","SENDER","SENDS","SENIOR","SENSE","SENSOR","SENT","SEO","SEP","SEPT","SEQ","SER","SERBIA","SERIAL","SERIES","SERUM","SERVE","SERVED","SERVER","SERVES","SET","SETS","SETTLE","SETUP","SEVEN","SEVERE","SEWING","SEXUAL","SHADE","SHADES","SHADOW","SHAFT","SHAKE","SHALL","SHAME","SHAPE","SHAPED","SHAPES","SHARE","SHARED","SHARES","SHARK","SHARON","SHARP","SHAVED","SHAW","SHE","SHED","SHEEP","SHEER","SHEET","SHEETS","SHELF","SHELL","SHIELD","SHIFT","SHINE","SHIP","SHIPS","SHIRT","SHIRTS","SHOCK","SHOE","SHOES","SHOOT","SHOP","SHOPS","SHORE","SHORT","SHORTS","SHOT","SHOTS","SHOULD","SHOW","SHOWED","SHOWER","SHOWN","SHOWS","SHUT","SIC","SICK","SIDE","SIDES","SIE","SIERRA","SIG","SIGHT","SIGMA","SIGN","SIGNAL","SIGNED","SIGNS","SIGNUP","SILENT","SILK","SILLY","SILVER","SIM","SIMON","SIMPLE","SIMPLY","SIMS","SIN","SINCE","SING","SINGER","SINGH","SINGLE","SINK","SIP","SIR","SISTER","SIT","SITE","SITES","SIX","SIXTH","SIZE","SIZED","SIZES","SKI","SKIING","SKILL","SKILLS","SKIN","SKINS","SKIP","SKIRT","SKIRTS","SKU","SKY","SKYPE","SLAVE","SLEEP","SLEEPS","SLEEVE","SLIDE","SLIDES","SLIGHT","SLIM","SLIP","SLOPE","SLOT","SLOTS","SLOVAK","SLOW","SLOWLY","SMALL","SMART","SMELL","SMILE","SMITH","SMOKE","SMOOTH","SMS","SMTP","SNAKE","SNAP","SNOW","SOA","SOAP","SOC","SOCCER","SOCIAL","SOCKET","SOCKS","SODIUM","SOFA","SOFT","SOIL","SOL","SOLAR","SOLD","SOLE","SOLELY","SOLID","SOLO","SOLVE","SOLVED","SOMA","SOME","SON","SONG","SONGS","SONIC","SONS","SONY","SOON","SORRY","SORT","SORTED","SORTS","SOUGHT","SOUL","SOULS","SOUND","SOUNDS","SOUP","SOURCE","SOUTH","SOVIET","SOX","SPA","SPACE","SPACES","SPAIN","SPAM","SPAN","SPANK","SPARC","SPARE","SPAS","SPEAK","SPEAKS","SPEARS","SPEC","SPECS","SPEECH","SPEED","SPEEDS","SPELL","SPEND","SPENT","SPERM","SPHERE","SPICE","SPIDER","SPIES","SPIN","SPINE","SPIRIT","SPLIT","SPOKE","SPOKEN","SPORT","SPORTS","SPOT","SPOTS","SPOUSE","SPRAY","SPREAD","SPRING","SPRINT","SPY","SQL","SQUAD","SQUARE","SRC","SRI","SSL","STABLE","STACK","STAFF","STAGE","STAGES","STAKE","STAMP","STAMPS","STAN","STAND","STANDS","STAR","STARS","START","STARTS","STAT","STATE","STATED","STATES","STATIC","STATS","STATUS","STAY","STAYED","STAYS","STD","STE","STEADY","STEAL","STEAM","STEEL","STEM","STEP","STEPS","STEREO","STEVE","STEVEN","STICK","STICKS","STICKY","STILL","STOCK","STOCKS","STOLEN","STONE","STONES","STOOD","STOP","STOPS","STORE","STORED","STORES","STORM","STORY","STR","STRAIN","STRAND","STRAP","STREAM","STREET","STRESS","STRICT","STRIKE","STRING","STRIP","STRIPS","STROKE","STRONG","STRUCK","STRUCT","STUART","STUCK","STUD","STUDIO","STUDY","STUFF","STUPID","STYLE","STYLES","STYLUS","SUB","SUBARU","SUBMIT","SUBTLE","SUCH","SUDAN","SUDDEN","SUE","SUFFER","SUGAR","SUIT","SUITE","SUITED","SUITES","SUITS","SUM","SUMMER","SUMMIT","SUN","SUNDAY","SUNNY","SUNSET","SUPER","SUPERB","SUPPLY","SUR","SURE","SURELY","SURF","SURGE","SURREY","SURVEY","SUSAN","SUSE","SUSSEX","SUZUKI","SWAP","SWEDEN","SWEET","SWIFT","SWIM","SWING","SWISS","SWITCH","SWORD","SYDNEY","SYMBOL","SYNC","SYNTAX","SYRIA","SYS","SYSTEM","TAB","TABLE","TABLES","TABLET","TABS","TACKLE","TAG","TAGGED","TAGS","TAHOE","TAIL","TAIWAN","TAKE","TAKEN","TAKES","TAKING","TALE","TALENT","TALES","TALK","TALKED","TALKS","TALL","TAMIL","TAMPA","TAN","TANK","TANKS","TAP","TAPE","TAPES","TAR","TARGET","TARIFF","TASK","TASKS","TASTE","TATTOO","TAUGHT","TAX","TAXES","TAXI","TAYLOR","TBA","TCP","TEA","TEACH","TEAM","TEAMS","TEAR","TEARS","TECH","TECHNO","TED","TEDDY","TEE","TEEN","TEENS","TEETH","TEL","TELL","TELLS","TEMP","TEMPLE","TEN","TENANT","TEND","TENDER","TENNIS","TENT","TERM","TERMS","TERROR","TERRY","TEST","TESTED","TESTS","TEX","TEXAS","TEXT","TEXTS","TFT","TGP","THAI","THAN","THANK","THANKS","THAT","THATS","THE","THEE","THEFT","THEHUN","THEIR","THEM","THEME","THEMES","THEN","THEORY","THERE","THESE","THESIS","THETA","THEY","THICK","THIN","THING","THINGS","THINK","THINKS","THIRD","THIRTY","THIS","THOMAS","THONG","THONGS","THOSE","THOU","THOUGH","THREAD","THREAT","THREE","THROAT","THROW","THROWN","THROWS","THRU","THU","THUMB","THUMBS","THUS","THY","TICKET","TIDE","TIE","TIED","TIER","TIES","TIGER","TIGERS","TIGHT","TIL","TILE","TILES","TILL","TIM","TIMBER","TIME","TIMELY","TIMER","TIMES","TIMING","TIN","TINY","TION","TIONS","TIP","TIPS","TIRE","TIRED","TIRES","TISSUE","TITANS","TITLE","TITLED","TITLES","TITTEN","TMP","TOBAGO","TODAY","TODD","TOE","TOILET","TOKEN","TOKYO","TOLD","TOLL","TOM","TOMATO","TOMMY","TON","TONE","TONER","TONES","TONGUE","TONS","TONY","TOO","TOOK","TOOL","TOOLS","TOOTH","TOP","TOPIC","TOPICS","TOPS","TOTAL","TOTALS","TOUCH","TOUGH","TOUR","TOURS","TOWARD","TOWER","TOWERS","TOWN","TOWNS","TOXIC","TOY","TOYOTA","TOYS","TRACE","TRACK","TRACKS","TRACT","TRACY","TRADE","TRADER","TRADES","TRAIL","TRAILS","TRAIN","TRAINS","TRANCE","TRANS","TRAP","TRASH","TRAUMA","TRAVEL","TRAVIS","TRAY","TREAT","TREATY","TREE","TREES","TREK","TREMBL","TREND","TRENDS","TREO","TRI","TRIAL","TRIALS","TRIBAL","TRIBE","TRIBES","TRICK","TRICKS","TRIED","TRIES","TRIM","TRIO","TRIP","TRIPLE","TRIPS","TRIVIA","TROOPS","TROUT","TROY","TRUCK","TRUCKS","TRUE","TRULY","TRUNK","TRUST","TRUSTS","TRUTH","TRY","TRYING","TUB","TUBE","TUBES","TUCSON","TUE","TULSA","TUMOR","TUNE","TUNER","TUNES","TUNING","TUNNEL","TURBO","TURKEY","TURN","TURNED","TURNER","TURNS","TURTLE","TVS","TWELVE","TWENTY","TWICE","TWIKI","TWIN","TWINS","TWIST","TWO","TYLER","TYPE","TYPES","TYPING","UGANDA","UGLY","ULTRA","ULTRAM","UNA","UNABLE","UNCLE","UND","UNDER","UNDO","UNE","UNI","UNION","UNIONS","UNIQUE","UNIT","UNITED","UNITS","UNITY","UNIV","UNIX","UNLESS","UNLIKE","UNLOCK","UNTIL","UNTO","UNWRAP","UPC","UPDATE","UPLOAD","UPON","UPPER","UPS","UPSET","URBAN","URGE","URGENT","URI","URL","URLS","URW","USA","USAGE","USB","USC","USD","USDA","USE","USED","USEFUL","USER","USERS","USES","USGS","USING","USPS","USR","USUAL","UTAH","UTC","UTILS","VACUUM","VAL","VALID","VALIUM","VALLEY","VALUE","VALUED","VALUES","VALVE","VALVES","VAN","VAR","VARIED","VARIES","VARY","VAST","VAT","VAULT","VCR","VECTOR","VEGAS","VELVET","VENDOR","VENICE","VENUE","VENUES","VER","VERBAL","VERDE","VERIFY","VERNON","VERSE","VERSUS","VERTEX","VERY","VESSEL","VHS","VIA","VIC","VICE","VICTIM","VICTOR","VID","VIDEO","VIDEOS","VIDS","VIENNA","VIEW","VIEWED","VIEWER","VIEWS","VII","VIII","VIKING","VILLA","VILLAS","VINYL","VIOLIN","VIP","VIRAL","VIRGIN","VIRTUE","VIRUS","VISA","VISION","VISIT","VISITS","VISTA","VISUAL","VITAL","VOCAL","VOCALS","VOICE","VOICES","VOID","VOIP","VOL","VOLT","VOLUME","VOLVO","VON","VOTE","VOTED","VOTERS","VOTES","VOTING","VOYUER","VPN","VSNET","WAGE","WAGES","WAGNER","WAGON","WAIT","WAIVER","WAKE","WAL","WALES","WALK","WALKED","WALKER","WALKS","WALL","WALLET","WALLS","WALNUT","WALT","WALTER","WAN","WANNA","WANT","WANTED","WANTS","WAR","WARD","WARE","WARM","WARNED","WARNER","WARREN","WARS","WAS","WASH","WASHER","WASTE","WATCH","WATER","WATERS","WATSON","WATT","WATTS","WAV","WAVE","WAVES","WAX","WAY","WAYNE","WAYS","WEAK","WEALTH","WEAPON","WEAR","WEB","WEBCAM","WEBLOG","WED","WEED","WEEK","WEEKLY","WEEKS","WEIGHT","WEIRD","WELL","WELLS","WELSH","WENDY","WENT","WERE","WESLEY","WEST","WET","WHALE","WHAT","WHATS","WHEAT","WHEEL","WHEELS","WHEN","WHERE","WHICH","WHILE","WHILST","WHITE","WHO","WHOLE","WHOM","WHOSE","WHY","WICKED","WIDE","WIDELY","WIDER","WIDTH","WIFE","WIFI","WIKI","WILD","WILEY","WILL","WILLOW","WILSON","WIN","WIND","WINDOW","WINDS","WINE","WINES","WING","WINGS","WINNER","WINS","WINTER","WIRE","WIRED","WIRES","WIRING","WISDOM","WISE","WISH","WISHES","WIT","WITCH","WITH","WITHIN","WIVES","WIZARD","WMA","WOLF","WOMAN","WOMEN","WOMENS","WON","WONDER","WOOD","WOODEN","WOODS","WOOL","WORD","WORDS","WORK","WORKED","WORKER","WORKS","WORLD","WORLDS","WORM","WORN","WORRY","WORSE","WORST","WORTH","WORTHY","WOULD","WOUND","WOW","WRAP","WRIGHT","WRIST","WRITE","WRITER","WRITES","WRONG","WROTE","WTO","WWW","XANAX","XBOX","XEROX","XHTML","XML","YACHT","YAHOO","YALE","YAMAHA","YANG","YARD","YARDS","YARN","YEA","YEAH","YEAR","YEARLY","YEARS","YEAST","YELLOW","YEMEN","YEN","YES","YET","YIELD","YIELDS","YOGA","YORK","YOU","YOUNG","YOUR","YOURS","YOUTH","YRS","YUKON","ZAMBIA","ZDNET","ZEN","ZERO","ZINC","ZIP","ZOLOFT","ZONE","ZONES","ZONING","ZOO","ZOOM","ZOPE","ZSHOPS","ZUM","ZUS"]);
WORDS.add("REACH");
var VOWELS = { A: 1, E: 1, I: 1, O: 1, U: 1 };
var KEYBOARD_ROWS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];
var SCRABBLE_VALUES = { A: 1, B: 3, C: 3, D: 2, E: 1, F: 4, G: 2, H: 4, I: 1, J: 8, K: 5, L: 1, M: 3, N: 1, O: 1, P: 3, Q: 10, R: 1, S: 1, T: 1, U: 1, V: 4, W: 4, X: 8, Y: 4, Z: 10 };
var RARE_LETTERS = { J: 1, Q: 1, X: 1, Z: 1, V: 1, W: 1, K: 1 };
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

/* ================= name ================= */
function getName() { return (localStorage.getItem("sixroll_name") || "").trim(); }
var nameInput = document.getElementById("nameInput");
nameInput.value = getName();
nameInput.addEventListener("input", function () {
  localStorage.setItem("sixroll_name", nameInput.value.trim());
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
// EP now follows a power curve on rarity (1/probability) instead of a flat log scale,
// so common badges stay modest while the rarest possible pulls spike dramatically.
// Calibrated so a ~1%-chance badge lands around 2,000 EP and the single rarest
// possible badge (~1 in 530 million) lands around 160,000,000 EP.
var EP_CURVE_BASE = 70;
var EP_CURVE_EXPONENT = 0.73;
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
  if (name === "Double Word Score") return 1 / 1000;
  // Exact probabilities from full combinatorial enumeration over all 736,281 distinct
  // 6-letter multisets (weighted by permutation count), checking whether the roll contains
  // a rearrangeable subset of letters matching a dictionary word. This replaces old guessed
  // placeholder odds (1/500, 1/5000) that badly understated how often these fire -- with this
  // word list, ~76% of rolls contain SOME 3-4 letter scrambled word, which is why "Scrambled
  // Word" was dominating every result's EP despite being displayed as if it were rare.
  if (name === "Scrambled Long Word") return 0.04878883233208523; // 5-6 letter anagram match, ~1 in 20.5
  if (name === "Scrambled Word") return 0.7560909903157552; // 3-4 letter anagram match, ~1 in 1.3
  if (name.indexOf("Word") !== -1) return 1 - Math.pow(1 - Math.pow(26, -((badge.wordLength || 3))), 7 - (badge.wordLength || 3));
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

function topPercentForEP(ep, leaderboard) {
  var scores = (leaderboard || []).map(function (player) { return Number(player.ep) || 0; });
  scores.push(ep);
  scores.sort(function (a, b) { return b - a; });
  var rank = scores.indexOf(ep) + 1;
  var percent = Math.ceil((rank / scores.length) * 100);
  return Math.max(1, Math.min(100, percent));
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
  position: "📍", keyboard: "⌨️", base: "🎲"
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
  var topPercent = topPercentForEP(res.totalEP, leaderboard);
  rollRarity.textContent = res.tier + " · Top " + topPercent + "%";
  rollRarity.style.color = tierColor;
  rollRarity.style.background = "color-mix(in srgb, " + tierColor + " 14%, transparent)";
  rollRarity.className = "roll-rarity show";

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
}

/* ================= leaderboard ================= */
var LB = {
  load: async function () {
    var res = await fetch("/api/leaderboard");
    if (!res.ok) throw new Error("Failed to load leaderboard");
    return await res.json();
  },
  submit: async function (name, word, ep) {
    await fetch("/api/roll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name, word: word, ep: ep })
    });
  }
};

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
async function loadLeaderboard() {
  var data = [];
  try { data = await LB.load(); } catch (e) { data = []; }
  var body = document.getElementById("lbBody");
  var myName = getName().toLowerCase();
  if (!data.length) {
    body.innerHTML = "<div class='lb-empty'>No rolls yet — be the first on the board.</div>";
    return;
  }
  data.sort(function (a, b) { return (Number(b.ep) || 0) - (Number(a.ep) || 0); });
  body.innerHTML = data.map(function (p, i) {
    var rankDisplay = MEDALS[i] || (i + 1);
    var mine = p.name.toLowerCase() === myName && myName !== "";
    var wordColor = colorForEP(Number(p.ep) || 0);
    return "<div class='lb-row lb-body-row" + (mine ? " me" : "") + "' style='animation-delay:" + (i * 30) + "ms'>" +
      "<span class='lb-rank'>" + rankDisplay + "</span>" +
      "<span class='lb-word' style='color:" + wordColor + "'>" + escapeHtml(p.word) + "</span>" +
      "<span class='lb-name'>" + escapeHtml(p.name) + "</span>" +
      "<span class='lb-ep' style='color:" + wordColor + "'>" + p.ep + "</span>" +
      "</div>";
  }).join("");
}

/* ================= cooldown ================= */
function getCooldownRemaining() {
  var until = parseInt(localStorage.getItem("sixroll_next_roll") || "0", 10);
  return Math.max(0, until - Date.now());
}

function startCooldownBar(durationMs) {
  var fill = document.getElementById("cooldownFill");
  fill.style.transition = "none";
  fill.style.width = "0%";
  void fill.offsetWidth;
  fill.style.transition = "width " + durationMs + "ms linear";
  fill.style.width = "100%";
}

function syncCooldownUI() {
  var unlimited = localStorage.getItem("sixroll_unlimited") === "1";
  var btn = document.getElementById("rollBtn");
  var wrap = document.getElementById("cooldownWrap");
  if (unlimited) { btn.disabled = false; wrap.hidden = true; return; }
  var remaining = getCooldownRemaining();
  if (remaining <= 0) {
    btn.disabled = false; wrap.hidden = true;
  } else {
    btn.disabled = true; wrap.hidden = false;
    startCooldownBar(remaining);
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

/* ================= roll flow ================= */
var rollInProgress = false;
document.getElementById("rollBtn").addEventListener("click", async function () {
  if (rollInProgress) return;
  rollInProgress = true;
  var name = getName();
  if (!name) {
    showToast("Enter a name first");
    nameInput.focus();
    rollInProgress = false;
    return;
  }
  var btn = document.getElementById("rollBtn");
  btn.disabled = true;
  btn.classList.add("is-rolling");
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
  var leaderboard = [];
  try { leaderboard = await LB.load(); } catch (e) {}
  await renderResult(letters, res, leaderboard);

  var unlimited = localStorage.getItem("sixroll_unlimited") === "1";
  if (!unlimited) {
    localStorage.setItem("sixroll_next_roll", String(Date.now() + COOLDOWN_MS));
  }

  try { await LB.submit(name, letters.join(""), res.totalEP); } catch (e) {}

  await loadLeaderboard();
  syncCooldownUI();
  tickCooldownText();
  btn.classList.remove("is-rolling");
  rollInProgress = false;
});

updateUnlimitedUI();
syncCooldownUI();
tickCooldownText();
loadLeaderboard();
</script>
</body>
</html>
`;

const KV_KEY = "rolls";
const MAX_ROLLS = 500;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/" && request.method === "GET") {
      return new Response(HTML_PAGE, { headers: { "content-type": "text/html;charset=UTF-8" } });
    }

    if (url.pathname === "/api/leaderboard" && request.method === "GET") {
      const rolls = await getRolls(env);
      const top = rolls.slice().sort((a, b) => (Number(b.ep) || 0) - (Number(a.ep) || 0)).slice(0, 20);
      return json(top);
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
      if (!name || !/^[A-Z]{6}$/.test(word) || !Number.isFinite(ep) || ep < 0) {
        return json({ error: "name, six-letter word, and non-negative numeric ep required" }, 400);
      }

      const rolls = await getRolls(env);
      rolls.push({ word, name, ep, ts: Date.now() });
      rolls.sort((a, b) => (Number(b.ep) || 0) - (Number(a.ep) || 0));
      await env.PLAYERS.put(KV_KEY, JSON.stringify(rolls.slice(0, MAX_ROLLS)));

      return json({ ok: true });
    }

    if (url.pathname === "/api/reset" && request.method === "POST") {
      await env.PLAYERS.put(KV_KEY, JSON.stringify([]));
      return json({ ok: true });
    }

    return new Response("Not found", { status: 404 });
  },
};

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

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json" } });
}

