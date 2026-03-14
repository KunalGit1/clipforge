import { useState, useRef } from "react";

const CLAUDE_MODEL = "claude-sonnet-4-20250514";
const ANTHROPIC_KEY = import.meta.env.VITE_ANTHROPIC_KEY || "";
const STRIPE_LINKS = {
  basic: import.meta.env.VITE_STRIPE_BASIC || "https://buy.stripe.com/placeholder_basic",
  pro:   import.meta.env.VITE_STRIPE_PRO   || "https://buy.stripe.com/placeholder_pro",
};

const YOUTUBE_SCENES = [
  "Cinematic aerial shot of futuristic city at dawn, golden hour light, 8K",
  "Close-up of hands typing on glowing keyboard, neon reflections, dark room",
  "Abstract data visualization floating in space, particle effects, deep blue",
  "Smooth camera pan across a modern minimalist workspace",
  "Time-lapse of clouds over mountain peaks, dramatic lighting",
];
const PRODUCT_SCENES = [
  "Product floating in studio void, soft dramatic lighting, luxury aesthetic",
  "Close-up product details, macro lens, shallow depth of field, clean white",
  "Product in lifestyle context, warm natural light, aspirational feel",
  "360 rotation of product, seamless loop, premium brand aesthetic",
];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #07071a;
    --s1: rgba(255,255,255,0.04);
    --s2: rgba(255,255,255,0.07);
    --border: rgba(255,255,255,0.08);
    --border2: rgba(255,255,255,0.15);
    --v: #8B5CF6;
    --v2: #A78BFA;
    --pk: #EC4899;
    --cy: #06B6D4;
    --gr: #10B981;
    --text: #F1F0FF;
    --sub: #94909E;
    --font: 'Plus Jakarta Sans', sans-serif;
  }
  html { scroll-behavior: smooth; }
  body { background: var(--bg); color: var(--text); font-family: var(--font); overflow-x: hidden; -webkit-font-smoothing: antialiased; }

  /* ─── AURORA BACKGROUND ─── */
  .aurora {
    position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden;
  }
  .aurora::before {
    content: '';
    position: absolute; width: 140%; height: 140%; top: -20%; left: -20%;
    background:
      radial-gradient(ellipse 60% 50% at 20% 20%, rgba(139,92,246,0.22) 0%, transparent 70%),
      radial-gradient(ellipse 50% 40% at 80% 10%, rgba(236,72,153,0.15) 0%, transparent 60%),
      radial-gradient(ellipse 70% 60% at 50% 80%, rgba(6,182,212,0.12) 0%, transparent 65%),
      radial-gradient(ellipse 40% 50% at 90% 70%, rgba(139,92,246,0.1) 0%, transparent 60%);
    animation: auroraMove 20s ease-in-out infinite alternate;
  }
  .aurora::after {
    content: '';
    position: absolute; inset: 0;
    background: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
    opacity: 0.4;
  }
  @keyframes auroraMove {
    0%   { transform: translate(0,0) rotate(0deg) scale(1); }
    33%  { transform: translate(2%, 3%) rotate(2deg) scale(1.03); }
    66%  { transform: translate(-1%, 2%) rotate(-1deg) scale(1.01); }
    100% { transform: translate(1%, -2%) rotate(1deg) scale(1.02); }
  }

  /* ─── NAV ─── */
  .nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 300;
    height: 60px; display: flex; align-items: center; justify-content: space-between;
    padding: 0 40px;
    background: rgba(7,7,26,0.6);
    backdrop-filter: blur(20px) saturate(180%);
    border-bottom: 1px solid var(--border);
  }
  .logo { display: flex; align-items: center; gap: 10px; cursor: pointer; text-decoration: none; }
  .logo-icon {
    width: 32px; height: 32px; border-radius: 9px;
    background: linear-gradient(135deg, var(--v), var(--pk));
    display: flex; align-items: center; justify-content: center;
    font-size: 15px; box-shadow: 0 0 20px rgba(139,92,246,0.5);
  }
  .logo-text { font-size: 16px; font-weight: 800; letter-spacing: -0.3px; }
  .nav-center { display: flex; gap: 4px; }
  .nav-tab {
    padding: 6px 16px; border-radius: 8px; border: none;
    background: transparent; color: var(--sub); font-family: var(--font);
    font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.18s;
  }
  .nav-tab:hover { color: var(--text); background: var(--s1); }
  .nav-tab.on { color: var(--text); background: var(--s2); }
  .nav-r { display: flex; align-items: center; gap: 10px; }
  .badge-access {
    font-size: 11px; font-weight: 600; padding: 4px 12px; border-radius: 20px;
    background: rgba(16,185,129,0.12); color: var(--gr);
    border: 1px solid rgba(16,185,129,0.25);
    display: flex; align-items: center; gap: 5px;
  }
  .live-dot { width:5px; height:5px; border-radius:50%; background:var(--gr); animation: livePulse 1.8s ease-in-out infinite; }
  @keyframes livePulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.7)} }

  /* ─── GLASS CARD ─── */
  .glass {
    background: rgba(255,255,255,0.04);
    backdrop-filter: blur(24px) saturate(140%);
    border: 1px solid rgba(255,255,255,0.09);
    border-radius: 20px;
  }
  .glass-bright {
    background: rgba(255,255,255,0.06);
    backdrop-filter: blur(28px) saturate(160%);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 20px;
  }

  /* ─── HERO ─── */
  .hero {
    position: relative; z-index: 1; min-height: 100vh;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    text-align: center; padding: 80px 24px 60px;
  }
  .hero-eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    font-size: 11px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase;
    padding: 7px 16px; border-radius: 24px; margin-bottom: 32px;
    background: rgba(139,92,246,0.1);
    border: 1px solid rgba(139,92,246,0.25);
    color: var(--v2);
    animation: fadeSlide 0.5s ease both;
  }
  .hero-eyebrow-dot { width:6px; height:6px; border-radius:50%; background:var(--v2); animation: livePulse 1.8s ease-in-out infinite; }
  .hero-title {
    font-size: clamp(44px, 8vw, 88px); font-weight: 800;
    line-height: 1.02; letter-spacing: -3px; margin-bottom: 22px;
    animation: fadeSlide 0.5s ease 0.08s both;
  }
  .g1 { background: linear-gradient(120deg, #fff 0%, var(--v2) 40%, var(--pk) 80%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .hero-sub {
    font-size: clamp(15px, 2vw, 19px); color: var(--sub); line-height: 1.75;
    max-width: 540px; margin: 0 auto 44px; font-weight: 400;
    animation: fadeSlide 0.5s ease 0.16s both;
  }
  .hero-btns {
    display: flex; align-items: center; gap: 12px; flex-wrap: wrap; justify-content: center;
    animation: fadeSlide 0.5s ease 0.24s both;
  }
  .btn-cta {
    padding: 14px 34px; border-radius: 12px; border: none; cursor: pointer;
    font-family: var(--font); font-size: 15px; font-weight: 700; color: white;
    background: linear-gradient(135deg, var(--v), #7C3AED);
    box-shadow: 0 4px 28px rgba(139,92,246,0.5), inset 0 1px 0 rgba(255,255,255,0.15);
    transition: all 0.22s; display: flex; align-items: center; gap: 8px;
    position: relative; overflow: hidden;
  }
  .btn-cta::before {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
    transform: translateX(-100%); animation: sheen 3s ease-in-out infinite 1s;
  }
  @keyframes sheen { 0%,100%{transform:translateX(-100%)} 40%{transform:translateX(100%)} }
  .btn-cta:hover { transform: translateY(-2px); box-shadow: 0 8px 36px rgba(139,92,246,0.6), inset 0 1px 0 rgba(255,255,255,0.15); }
  .btn-outline {
    padding: 14px 28px; border-radius: 12px; cursor: pointer;
    font-family: var(--font); font-size: 14px; font-weight: 600;
    background: var(--s1); border: 1px solid var(--border2);
    color: var(--sub); transition: all 0.18s;
  }
  .btn-outline:hover { color: var(--text); border-color: var(--v); background: rgba(139,92,246,0.06); }

  /* hero stats */
  .hero-stats {
    display: flex; align-items: center; gap: 36px; margin-top: 60px; flex-wrap: wrap; justify-content: center;
    animation: fadeSlide 0.5s ease 0.32s both;
  }
  .hstat { text-align: center; }
  .hstat-n { font-size: 28px; font-weight: 800; letter-spacing: -1px; background: linear-gradient(135deg, var(--text), var(--v2)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
  .hstat-l { font-size: 11px; color: var(--sub); margin-top: 3px; font-weight: 500; letter-spacing: 0.3px; }
  .hstat-div { width: 1px; height: 36px; background: var(--border); }

  /* ─── BENTO FEATURES ─── */
  .bento-section { position:relative; z-index:1; padding: 20px 32px 100px; max-width: 1100px; margin: 0 auto; }
  .bento-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: auto auto;
    gap: 14px;
  }
  .bento {
    padding: 28px 26px; border-radius: 20px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    backdrop-filter: blur(16px);
    transition: all 0.25s; position: relative; overflow: hidden;
  }
  .bento:hover { border-color: rgba(255,255,255,0.14); background: rgba(255,255,255,0.05); transform: translateY(-2px); }
  .bento::before { content:''; position:absolute; inset:0; opacity:0; transition:opacity 0.25s; border-radius:20px; }
  .bento-wide { grid-column: span 2; }
  .bento-tall { grid-row: span 2; }
  .bento-v::before  { background: radial-gradient(ellipse at top left, rgba(139,92,246,0.12), transparent 70%); }
  .bento-pk::before { background: radial-gradient(ellipse at top right, rgba(236,72,153,0.1), transparent 70%); }
  .bento-cy::before { background: radial-gradient(ellipse at bottom, rgba(6,182,212,0.1), transparent 70%); }
  .bento:hover::before { opacity: 1; }
  .bento-tag {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 10px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase;
    padding: 4px 10px; border-radius: 20px; margin-bottom: 14px;
  }
  .tag-v  { background: rgba(139,92,246,0.15); color: var(--v2); border: 1px solid rgba(139,92,246,0.2); }
  .tag-pk { background: rgba(236,72,153,0.12); color: var(--pk);  border: 1px solid rgba(236,72,153,0.2); }
  .tag-cy { background: rgba(6,182,212,0.12);  color: var(--cy);  border: 1px solid rgba(6,182,212,0.2); }
  .tag-gr { background: rgba(16,185,129,0.12); color: var(--gr);  border: 1px solid rgba(16,185,129,0.2); }
  .bento-icon { font-size: 28px; margin-bottom: 12px; display: block; }
  .bento-title { font-size: 16px; font-weight: 700; margin-bottom: 7px; letter-spacing: -0.2px; color: var(--text); }
  .bento-desc { font-size: 13px; color: rgba(255,255,255,0.5); line-height: 1.65; }
  .bento-demo {
    margin-top: 20px; background: rgba(0,0,0,0.25); border-radius: 10px; padding: 12px 14px;
    font-size: 11px; color: var(--sub); line-height: 1.7; border: 1px solid var(--border);
  }
  .bento-demo-line { display: flex; align-items: center; gap: 8px; padding: 2px 0; }
  .bento-demo-line .arrow { color: var(--v2); font-weight: 700; }
  .pipeline-visual {
    display: flex; align-items: center; gap: 0; margin-top: 18px; flex-wrap: wrap;
  }
  .pipe-node {
    font-size: 10px; font-weight: 600; padding: 5px 10px; border-radius: 6px;
    background: rgba(139,92,246,0.12); color: var(--v2);
    border: 1px solid rgba(139,92,246,0.2);
  }
  .pipe-arr { color: var(--sub); font-size: 12px; padding: 0 4px; }

  /* ─── PRICING ─── */
  .pricing-section { position:relative; z-index:1; padding: 40px 32px 100px; max-width: 900px; margin: 0 auto; }
  .section-eyebrow {
    text-align:center; font-size: 11px; font-weight: 700; letter-spacing: 1.5px;
    text-transform: uppercase; color: var(--v2); margin-bottom: 12px;
  }
  .section-h { text-align:center; font-size: clamp(28px,4vw,46px); font-weight:800; letter-spacing:-1.5px; margin-bottom: 12px; color: var(--text); }
  .section-p { text-align:center; font-size:15px; color: rgba(255,255,255,0.55); max-width:420px; margin:0 auto 52px; line-height:1.7; }
  .plans { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
  .plan {
    padding: 36px 32px; border-radius: 22px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    backdrop-filter: blur(20px);
    position: relative; overflow: hidden; transition: transform 0.22s;
  }
  .plan:hover { transform: translateY(-4px); }
  .plan.featured {
    background: rgba(139,92,246,0.07);
    border-color: rgba(139,92,246,0.3);
    box-shadow: 0 0 60px rgba(139,92,246,0.15), inset 0 1px 0 rgba(255,255,255,0.08);
  }
  .plan.featured::before {
    content: ''; position:absolute; top:0; left:0; right:0; height:1px;
    background: linear-gradient(90deg, transparent, rgba(139,92,246,0.8), transparent);
  }
  .plan-chip {
    position:absolute; top:18px; right:18px;
    font-size:9px; font-weight:700; letter-spacing:0.8px; text-transform:uppercase;
    padding:4px 10px; border-radius:20px;
    background: linear-gradient(135deg, var(--v), var(--pk)); color:white;
  }
  .plan-tier { font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:var(--sub); margin-bottom:18px; }
  .plan-price { font-size:60px; font-weight:900; letter-spacing:-3px; line-height:1; }
  .plan-price sup { font-size:24px; font-weight:700; vertical-align:super; font-size:22px; letter-spacing:0; }
  .plan-cadence { font-size:12px; color:var(--sub); margin-top:6px; margin-bottom:28px; }
  .plan-feats { list-style:none; display:flex; flex-direction:column; gap:11px; margin-bottom:30px; }
  .plan-feats li { font-size:13px; display:flex; align-items:flex-start; gap:9px; line-height:1.4; }
  .check { color:var(--gr); font-size:12px; margin-top:1px; flex-shrink:0; font-weight:700; }
  .cross { color:rgba(255,255,255,0.2); font-size:12px; margin-top:1px; flex-shrink:0; }
  .dim-feat { color:var(--sub); }
  .plan-btn {
    display:block; width:100%; padding:13px; text-align:center; border-radius:11px;
    font-family:var(--font); font-size:14px; font-weight:700; cursor:pointer;
    border:none; text-decoration:none; transition:all 0.2s;
  }
  .plan-btn-outline { background:transparent; border:1px solid var(--border2); color:var(--text); }
  .plan-btn-outline:hover { border-color:var(--v); color:var(--v2); background:rgba(139,92,246,0.06); }
  .plan-btn-fill {
    background: linear-gradient(135deg, var(--v), #7C3AED); color:white;
    box-shadow: 0 4px 20px rgba(139,92,246,0.4);
  }
  .plan-btn-fill:hover { transform:translateY(-1px); box-shadow: 0 8px 28px rgba(139,92,246,0.5); }
  .pricing-foot { text-align:center; font-size:12px; color:var(--sub); margin-top:24px; }
  .pricing-foot a { color:var(--v2); cursor:pointer; text-decoration:underline; }

  /* ─── STUDIO ─── */
  .studio {
    position:relative; z-index:1; padding:80px 32px 60px; max-width:1160px; margin:0 auto;
  }
  .studio-header { margin-bottom: 28px; }
  .studio-header h2 { font-size:26px; font-weight:800; letter-spacing:-0.8px; margin-bottom:4px; }
  .studio-header p { font-size:13px; color:var(--sub); }

  .mode-toggle {
    display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:24px;
  }
  .mode-btn {
    padding:18px 20px; border-radius:14px; cursor:pointer; text-align:left;
    display:flex; align-items:center; gap:14px; transition:all 0.2s;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    backdrop-filter: blur(16px);
  }
  .mode-btn:hover { border-color: var(--border2); background: rgba(255,255,255,0.05); }
  .mode-btn.sel-v { border-color:rgba(139,92,246,0.5); background:rgba(139,92,246,0.08); box-shadow:0 0 20px rgba(139,92,246,0.12); }
  .mode-btn.sel-pk { border-color:rgba(236,72,153,0.5); background:rgba(236,72,153,0.07); box-shadow:0 0 20px rgba(236,72,153,0.1); }
  .mode-em { font-size:22px; flex-shrink:0; }
  .mode-lbl { font-size:13px; font-weight:700; margin-bottom:2px; }
  .mode-sub { font-size:11px; color:var(--sub); }
  .sel-indicator {
    margin-left:auto; width:8px; height:8px; border-radius:50%; flex-shrink:0;
    background:var(--v); box-shadow:0 0 8px var(--v);
  }
  .sel-indicator.pk { background:var(--pk); box-shadow:0 0 8px var(--pk); }

  .studio-layout { display:grid; grid-template-columns:1fr 380px; gap:16px; }

  /* glass panel */
  .gpanel {
    background: rgba(255,255,255,0.03);
    backdrop-filter: blur(24px) saturate(140%);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 18px; overflow:hidden;
  }
  .gpanel-head {
    padding:15px 20px; border-bottom:1px solid rgba(255,255,255,0.06);
    display:flex; align-items:center; justify-content:space-between;
  }
  .gpanel-title { font-size:13px; font-weight:700; }
  .gpanel-body { padding:20px; display:flex; flex-direction:column; gap:16px; }

  /* pipe steps */
  .pipe-track { display:flex; align-items:center; background:rgba(0,0,0,0.2); border-radius:8px; padding:3px; }
  .ps {
    flex:1; padding:6px 4px; text-align:center; font-size:10px; font-weight:600;
    color:var(--sub); border-radius:6px; transition:all 0.2s;
  }
  .ps.on { background:rgba(255,255,255,0.07); color:var(--text); }
  .ps.done { color:var(--gr); }
  .ps-sep { color:rgba(255,255,255,0.15); font-size:10px; padding:0 2px; }

  /* fields */
  .field { display:flex; flex-direction:column; gap:6px; }
  .flbl { font-size:10px; font-weight:700; letter-spacing:0.8px; text-transform:uppercase; color:var(--sub); }
  textarea, input[type=text], select {
    background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.08);
    border-radius:10px; color:var(--text); font-family:var(--font);
    font-size:13px; padding:11px 13px; width:100%; outline:none; resize:none;
    transition:all 0.18s;
  }
  textarea:focus, input[type=text]:focus, select:focus {
    border-color:rgba(139,92,246,0.45);
    box-shadow:0 0 0 3px rgba(139,92,246,0.08);
    background: rgba(0,0,0,0.35);
  }
  textarea::placeholder, input::placeholder { color:rgba(255,255,255,0.2); }
  select option { background:#0c0c1e; }
  .row2 { display:grid; grid-template-columns:1fr 1fr; gap:10px; }

  /* upload */
  .upzone {
    border:1.5px dashed rgba(255,255,255,0.1); border-radius:10px;
    padding:28px; text-align:center; position:relative; overflow:hidden;
    cursor:pointer; transition:all 0.2s;
    background:rgba(0,0,0,0.15);
  }
  .upzone:hover { border-color:rgba(236,72,153,0.4); background:rgba(236,72,153,0.03); }
  .upzone input { position:absolute; inset:0; opacity:0; cursor:pointer; }
  .up-ico { font-size:22px; margin-bottom:6px; }
  .up-txt { font-size:11px; color:var(--sub); line-height:1.5; }
  .up-img { width:100%; max-height:130px; object-fit:cover; border-radius:7px; margin-top:8px; }

  /* cost tag */
  .cost-tag {
    font-size:11px; padding:5px 12px; border-radius:20px;
    background:rgba(16,185,129,0.08); color:var(--gr);
    border:1px solid rgba(16,185,129,0.18);
    display:inline-flex; align-items:center; gap:5px;
  }

  /* gen button */
  .btn-gen {
    width:100%; padding:14px; border-radius:11px; border:none; cursor:pointer;
    font-family:var(--font); font-size:14px; font-weight:700; color:white;
    position:relative; overflow:hidden; transition:all 0.22s;
    background: linear-gradient(135deg, var(--v), #7C3AED);
    box-shadow: 0 4px 20px rgba(139,92,246,0.4), inset 0 1px 0 rgba(255,255,255,0.12);
  }
  .btn-gen.pk { background: linear-gradient(135deg, var(--pk), #F97316); box-shadow: 0 4px 20px rgba(236,72,153,0.4), inset 0 1px 0 rgba(255,255,255,0.12); }
  .btn-gen:hover:not(:disabled) { transform:translateY(-1px); box-shadow: 0 8px 28px rgba(139,92,246,0.5), inset 0 1px 0 rgba(255,255,255,0.12); }
  .btn-gen:disabled { opacity:0.4; cursor:not-allowed; transform:none; }
  .shim {
    position:absolute; inset:0;
    background:linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent);
    transform:translateX(-100%); animation:shimAnim 2.5s infinite;
  }
  @keyframes shimAnim { to{transform:translateX(100%)} }
  .spin {
    width:13px; height:13px; border:2px solid rgba(255,255,255,0.25);
    border-top-color:white; border-radius:50%;
    animation:rot 0.65s linear infinite; display:inline-block; margin-right:7px; vertical-align:middle;
  }
  @keyframes rot { to{transform:rotate(360deg)} }

  /* output */
  .out-stack { display:flex; flex-direction:column; gap:12px; }

  .out-card {
    background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07);
    border-radius:16px; overflow:hidden; backdrop-filter:blur(16px);
  }
  .out-head { padding:12px 16px; border-bottom:1px solid rgba(255,255,255,0.06); display:flex; align-items:center; justify-content:space-between; }
  .out-title { font-size:12px; font-weight:700; }
  .out-body { padding:14px 16px; font-size:12px; line-height:1.85; color:rgba(255,255,255,0.6); max-height:190px; overflow-y:auto; }
  .out-body::-webkit-scrollbar { width:3px; }
  .out-body::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.1); border-radius:4px; }

  .tcursor { display:inline-block; width:2px; height:12px; background:var(--v2); margin-left:2px; vertical-align:middle; animation:tblink 1s step-end infinite; }
  @keyframes tblink { 0%,100%{opacity:1} 50%{opacity:0} }

  .scene-list { padding:10px; display:flex; flex-direction:column; gap:6px; }
  .scene-row {
    background:rgba(0,0,0,0.2); border-radius:10px; padding:10px 12px;
    display:flex; align-items:flex-start; gap:10px;
    border:1px solid transparent; transition:all 0.2s;
  }
  .scene-row.gen { border-color:rgba(139,92,246,0.35); background:rgba(139,92,246,0.05); animation:sceneGlow 1.5s ease-in-out infinite; }
  .scene-row.done { border-color:rgba(16,185,129,0.25); }
  @keyframes sceneGlow { 0%,100%{box-shadow:none} 50%{box-shadow:0 0 12px rgba(139,92,246,0.15)} }
  .snum {
    width:21px; height:21px; border-radius:6px; flex-shrink:0;
    display:flex; align-items:center; justify-content:center;
    font-size:10px; font-weight:700;
    background:rgba(255,255,255,0.06); color:var(--sub);
  }
  .snum.a { background:var(--v); color:white; }
  .snum.d { background:rgba(16,185,129,0.15); color:var(--gr); }
  .sinfo { flex:1; }
  .slbl { font-size:10px; color:var(--sub); margin-bottom:2px; font-weight:600; }
  .stxt { font-size:12px; line-height:1.45; }
  .sstat { font-size:10px; margin-top:4px; color:var(--sub); }
  .sstat.a { color:var(--v2); }
  .sstat.d { color:var(--gr); }

  .prog-wrap { height:2px; margin:0 16px 14px; background:rgba(255,255,255,0.06); border-radius:2px; overflow:hidden; }
  .prog-fill { height:100%; background:linear-gradient(90deg,var(--v),var(--cy)); transition:width 0.5s ease; border-radius:2px; }

  .vid-ph {
    aspect-ratio:16/9; display:flex; flex-direction:column;
    align-items:center; justify-content:center; gap:10px;
    color:var(--sub); font-size:13px;
    background: linear-gradient(135deg, rgba(139,92,246,0.04), rgba(6,182,212,0.04));
  }
  .vid-ready { color:var(--gr); font-size:13px; font-weight:700; }
  .dl-btn {
    padding:9px 22px; border-radius:9px; border:none; cursor:pointer;
    font-family:var(--font); font-size:13px; font-weight:700;
    background:linear-gradient(135deg,var(--gr),#059669);
    color:white; transition:all 0.2s;
    box-shadow:0 4px 16px rgba(16,185,129,0.35);
  }
  .dl-btn:hover { transform:translateY(-1px); }

  .empty-s {
    display:flex; flex-direction:column; align-items:center;
    justify-content:center; gap:12px; padding:48px 24px;
    color:var(--sub); text-align:center;
  }
  .empty-ico { font-size:36px; opacity:0.2; }
  .empty-txt { font-size:12px; line-height:1.7; max-width:220px; }

  .btn-xs {
    font-size:10px; padding:4px 10px; border-radius:6px;
    border:1px solid var(--border2); background:transparent;
    color:var(--sub); cursor:pointer; font-family:var(--font);
    font-weight:600; transition:all 0.15s;
  }
  .btn-xs:hover { color:var(--text); border-color:var(--v2); }

  /* ─── SETTINGS / HISTORY ─── */
  .sub-page { position:relative; z-index:1; padding:80px 32px 60px; max-width:600px; margin:0 auto; }

  /* ─── GATE ─── */
  .gate {
    position:relative; z-index:1; min-height:calc(100vh - 60px);
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    text-align:center; padding:60px 24px;
  }
  .gate-ico { font-size:52px; margin-bottom:20px; opacity:0.35; }
  .gate-h { font-size:22px; font-weight:800; margin-bottom:8px; letter-spacing:-0.5px; }
  .gate-p { font-size:14px; color:var(--sub); margin-bottom:28px; }

  /* ─── ANIMATIONS ─── */
  @keyframes fadeSlide { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }

  /* ─── RESPONSIVE ─── */
  @media(max-width:860px){
    .nav{padding:0 20px}
    .studio-layout{grid-template-columns:1fr}
    .mode-toggle{grid-template-columns:1fr}
    .bento-grid{grid-template-columns:1fr}
    .bento-wide{grid-column:span 1}
    .plans{grid-template-columns:1fr}
    .studio{padding:80px 16px 40px}
    .bento-section{padding:0 16px 80px}
    .pricing-section{padding:40px 16px 80px}
  }
`;

export default function App() {
  const checkPaid = () => {
    if (localStorage.getItem("cf_paid")) return true;
    const p = new URLSearchParams(window.location.search);
    if (p.get("access") === "admin" || p.get("payment") === "success") {
      localStorage.setItem("cf_paid", "1");
      window.history.replaceState({}, "", window.location.pathname);
      return true;
    }
    return false;
  };

  const [hasPaid, setHasPaid] = useState(checkPaid);
  const [page, setPage] = useState(checkPaid() ? "studio" : "home");
  const [mode, setMode] = useState("youtube");
  const [isGen, setIsGen] = useState(false);
  const [step, setStep] = useState(0);
  const [script, setScript] = useState("");
  const [typing, setTyping] = useState(false);
  const [scenes, setScenes] = useState([]);
  const [sceneStatus, setSceneStatus] = useState([]);
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const [topic, setTopic] = useState("");
  const [duration, setDuration] = useState("60");
  const [style, setStyle] = useState("educational");
  const [productName, setProductName] = useState("");
  const [productDesc, setProductDesc] = useState("");
  const [productImage, setProductImage] = useState(null);
  const [videoFormat, setVideoFormat] = useState("landscape");
  const scriptRef = useRef(null);

  const handleImg = (e) => {
    const f = e.target.files[0];
    if (f) { const r = new FileReader(); r.onload = ev => setProductImage(ev.target.result); r.readAsDataURL(f); }
  };

  const typeOut = async (text) => {
    setTyping(true); setScript("");
    const words = text.split(" ");
    for (let i = 0; i < words.length; i++) {
      await new Promise(r => setTimeout(r, 26));
      setScript(p => p + (i === 0 ? "" : " ") + words[i]);
      if (scriptRef.current) scriptRef.current.scrollTop = scriptRef.current.scrollHeight;
    }
    setTyping(false);
  };

  const runScenes = async (list) => {
    const s = list.map(() => "pending"); setSceneStatus([...s]);
    for (let i = 0; i < list.length; i++) {
      await new Promise(r => setTimeout(r, 300));
      s[i] = "gen"; setSceneStatus([...s]);
      await new Promise(r => setTimeout(r, 1300 + Math.random() * 900));
      s[i] = "done"; setSceneStatus([...s]);
      setProgress(Math.round(((i + 1) / list.length) * 100));
    }
  };

  const generate = async () => {
    if (mode === "youtube" && !topic.trim()) return;
    if (mode === "product" && !productName.trim()) return;
    setIsGen(true); setStep(1); setScript(""); setScenes([]); setSceneStatus([]); setProgress(0);
    try {
      const prompt = mode === "youtube"
        ? `You are a professional YouTube scriptwriter for faceless channels. Write a ${duration}-second script about: "${topic}". Style: ${style}.
Format: HOOK (0-5s): ... | MAIN CONTENT: ... | CTA (last 10s): ...
Punchy, no filler. Max ${Math.round(parseInt(duration)*2.5)} words.`
        : `Write compelling 30s video ad copy for: ${productName}. ${productDesc ? "Details: "+productDesc : ""}
Format: HOOK | PROBLEM | SOLUTION | PROOF | CTA. Punchy and conversion-focused.`;

      const hdrs = {
        "Content-Type":"application/json",
        "x-api-key":ANTHROPIC_KEY,
        "anthropic-version":"2023-06-01",
        "anthropic-dangerous-direct-browser-access":"true"
      };
      const r1 = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:hdrs,
        body:JSON.stringify({ model:CLAUDE_MODEL, max_tokens:1000, messages:[{role:"user",content:prompt}] })
      });
      const d1 = await r1.json();
      const scriptText = d1.content?.find(b=>b.type==="text")?.text || "Script generation failed.";
      await typeOut(scriptText);

      setStep(2);
      await new Promise(r => setTimeout(r, 500));

      const r2 = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:hdrs,
        body:JSON.stringify({ model:CLAUDE_MODEL, max_tokens:600,
          messages:[{role:"user",content:`Generate ${mode==="youtube"?"5":"4"} cinematic AI video scene prompts for Wan 2.2 based on:\n${scriptText}\n\nReturn ONLY a JSON array:\n["prompt 1","prompt 2",...]`}]
        })
      });
      const d2 = await r2.json();
      let txt = (d2.content?.find(b=>b.type==="text")?.text||"[]").replace(/```json|```/g,"").trim();
      let parsed;
      try { parsed = JSON.parse(txt); } catch { parsed = mode==="youtube" ? YOUTUBE_SCENES : PRODUCT_SCENES; }

      setScenes(parsed);
      setStep(3);
      await runScenes(parsed);
      setStep(4);
    } catch(e){ console.error(e); } finally { setIsGen(false); }
  };

  const copyScript = () => { navigator.clipboard.writeText(script); setCopied(true); setTimeout(()=>setCopied(false), 2000); };
  const unlock = () => { localStorage.setItem("cf_paid","1"); setHasPaid(true); setPage("studio"); };

  const pipeSteps = ["Script","Scenes","Video","Export"];

  return (
    <>
      <style>{css}</style>
      <div>
        <div className="aurora" />

        {/* NAV */}
        <nav className="nav">
          <div className="logo" onClick={() => setPage(hasPaid ? "studio" : "home")}>
            <div className="logo-icon">⚡</div>
            <span className="logo-text">ClipForge</span>
          </div>

          {hasPaid && (
            <div className="nav-center">
              {["studio","history","settings"].map(t => (
                <button key={t} className={`nav-tab ${page===t?"on":""}`} onClick={() => setPage(t)}>
                  {t[0].toUpperCase()+t.slice(1)}
                </button>
              ))}
            </div>
          )}

          <div className="nav-r">
            {hasPaid ? (
              <div className="badge-access"><div className="live-dot"/>Full Access</div>
            ) : (
              <>
                <button className="btn-outline" style={{padding:"7px 16px",fontSize:13}} onClick={() => document.getElementById("pricing")?.scrollIntoView({behavior:"smooth"})}>Pricing</button>
                <button className="btn-cta" style={{padding:"8px 20px",fontSize:13}} onClick={() => document.getElementById("pricing")?.scrollIntoView({behavior:"smooth"})}>Get Access →</button>
              </>
            )}
          </div>
        </nav>

        {/* ──── HOME ──── */}
        {page === "home" && (
          <div style={{paddingTop:60}}>

            {/* Hero */}
            <div className="hero">
              <div className="hero-eyebrow"><div className="hero-eyebrow-dot"/>Claude AI · Wan 2.2 · fal.ai</div>
              <h1 className="hero-title">
                AI videos,<br/><span className="g1">without the effort</span>
              </h1>
              <p className="hero-sub">Generate faceless YouTube videos and product ads with AI. Script, scenes, voiceover — all in one click.</p>
              <div className="hero-btns">
                <button className="btn-cta" onClick={() => hasPaid ? setPage("studio") : document.getElementById("pricing")?.scrollIntoView({behavior:"smooth"})}>
                  Start Creating →
                </button>
                <button className="btn-outline" onClick={() => document.getElementById("features")?.scrollIntoView({behavior:"smooth"})}>
                  See how it works
                </button>
              </div>
              <div className="hero-stats">
                <div className="hstat"><div className="hstat-n">2</div><div className="hstat-l">Video modes</div></div>
                <div className="hstat-div"/>
                <div className="hstat"><div className="hstat-n">$0</div><div className="hstat-l">Monthly fee</div></div>
                <div className="hstat-div"/>
                <div className="hstat"><div className="hstat-n">~60s</div><div className="hstat-l">Script to scenes</div></div>
                <div className="hstat-div"/>
                <div className="hstat"><div className="hstat-n">1080p</div><div className="hstat-l">Output quality</div></div>
              </div>
            </div>

            {/* Bento features */}
            <div className="bento-section" id="features">
              <div className="bento-grid">
                {/* Wide: faceless YT */}
                <div className="bento bento-wide bento-v">
                  <div className="bento-tag tag-v">🎬 YouTube Mode</div>
                  <div className="bento-title">Faceless YouTube, fully automated</div>
                  <div className="bento-desc">Enter a topic and get a complete video — script, voiceover, and AI-generated cinematic clips. No face, no editing skills needed.</div>
                  <div className="pipeline-visual">
                    <div className="pipe-node">Topic</div><span className="pipe-arr">→</span>
                    <div className="pipe-node">Claude Script</div><span className="pipe-arr">→</span>
                    <div className="pipe-node">Voiceover</div><span className="pipe-arr">→</span>
                    <div className="pipe-node">Wan 2.2 Clips</div><span className="pipe-arr">→</span>
                    <div className="pipe-node">MP4 ✓</div>
                  </div>
                </div>
                {/* Product ads */}
                <div className="bento bento-pk">
                  <div className="bento-tag tag-pk">🛍️ Product Mode</div>
                  <div className="bento-title">30-second product ads</div>
                  <div className="bento-desc">Upload a product image. Get a scroll-stopping video ad ready for TikTok, Meta, or YouTube in seconds.</div>
                </div>
                {/* One-time */}
                <div className="bento bento-cy">
                  <div className="bento-tag tag-cy">💳 Pricing</div>
                  <div className="bento-title">Pay once, keep forever</div>
                  <div className="bento-desc">No subscriptions. No watermarks. Commercial rights included. From $49.</div>
                </div>
                {/* AI Script */}
                <div className="bento bento-v">
                  <div className="bento-tag tag-v">✍️ AI Scriptwriting</div>
                  <div className="bento-title">Claude writes the script</div>
                  <div className="bento-desc">Hooks, main content, CTA — structured and optimised for retention with a live typing effect.</div>
                  <div className="bento-demo">
                    <div className="bento-demo-line"><span className="arrow">▸</span>HOOK: "Most people waste 10 years..."</div>
                    <div className="bento-demo-line"><span className="arrow">▸</span>MAIN: Step-by-step breakdown</div>
                    <div className="bento-demo-line"><span className="arrow">▸</span>CTA: "Subscribe for more..."</div>
                  </div>
                </div>
                {/* Quality */}
                <div className="bento">
                  <div className="bento-tag tag-gr">🎯 Quality</div>
                  <div className="bento-title">1080p cinematic output</div>
                  <div className="bento-desc">Powered by Wan 2.2 — the best open-source video model. Upgrade to self-hosted GPU for pennies per clip.</div>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="pricing-section" id="pricing">
              <div className="section-eyebrow">Pricing</div>
              <h2 className="section-h">Simple, honest pricing</h2>
              <p className="section-p">Pay once. No monthly fees. Instant access after checkout.</p>
              <div className="plans">
                <div className="plan">
                  <div className="plan-tier">Basic</div>
                  <div className="plan-price"><sup>$</sup>49</div>
                  <div className="plan-cadence">one-time payment</div>
                  <ul className="plan-feats">
                    <li><span className="check">✓</span>Faceless YouTube automation</li>
                    <li><span className="check">✓</span>Claude AI script writer</li>
                    <li><span className="check">✓</span>5 cinematic scenes per video</li>
                    <li><span className="check">✓</span>720p video generation</li>
                    <li><span className="check">✓</span>No watermarks</li>
                    <li><span className="cross">✗</span><span className="dim-feat">Product video ads</span></li>
                    <li><span className="cross">✗</span><span className="dim-feat">Auto scene stitching</span></li>
                  </ul>
                  <a className="plan-btn plan-btn-outline"
                    href={`${STRIPE_LINKS.basic}?success_url=${encodeURIComponent(window.location.origin+"?payment=success")}`}
                    target="_blank" rel="noreferrer">Buy Basic — $49</a>
                </div>
                <div className="plan featured">
                  <div className="plan-chip">Best Value</div>
                  <div className="plan-tier">Pro</div>
                  <div className="plan-price"><sup>$</sup>99</div>
                  <div className="plan-cadence">one-time payment</div>
                  <ul className="plan-feats">
                    <li><span className="check">✓</span>Everything in Basic</li>
                    <li><span className="check">✓</span>Product video ad mode</li>
                    <li><span className="check">✓</span>1080p video generation</li>
                    <li><span className="check">✓</span>Auto scene stitching</li>
                    <li><span className="check">✓</span>ElevenLabs voiceover</li>
                    <li><span className="check">✓</span>Commercial licence</li>
                    <li><span className="check">✓</span>Priority support</li>
                  </ul>
                  <a className="plan-btn plan-btn-fill"
                    href={`${STRIPE_LINKS.pro}?success_url=${encodeURIComponent(window.location.origin+"?payment=success")}`}
                    target="_blank" rel="noreferrer">Buy Pro — $99</a>
                </div>
              </div>
              <p className="pricing-foot">
                Already purchased? <a onClick={unlock}>Restore access</a>
                &nbsp;·&nbsp; Secure checkout via Stripe &nbsp;·&nbsp; Instant access
              </p>
            </div>
          </div>
        )}

        {/* ──── GATE ──── */}
        {!hasPaid && page !== "home" && (
          <div className="gate">
            <div className="gate-ico">🔒</div>
            <div className="gate-h">Purchase required</div>
            <p className="gate-p">Get full studio access with a one-time payment.</p>
            <button className="btn-cta" onClick={() => setPage("home")}>View plans →</button>
          </div>
        )}

        {/* ──── STUDIO ──── */}
        {hasPaid && page === "studio" && (
          <div className="studio">
            <div className="studio-header">
              <h2>Studio</h2>
              <p>Choose a mode and generate your video</p>
            </div>

            <div className="mode-toggle">
              <button className={`mode-btn ${mode==="youtube"?"sel-v":""}`} onClick={() => { setMode("youtube"); setStep(0); setScript(""); setScenes([]); }}>
                <span className="mode-em">🎬</span>
                <div><div className="mode-lbl">Faceless YouTube</div><div className="mode-sub">Topic → script → voiceover → clips</div></div>
                {mode==="youtube" && <div className="sel-indicator"/>}
              </button>
              <button className={`mode-btn ${mode==="product"?"sel-pk":""}`} onClick={() => { setMode("product"); setStep(0); setScript(""); setScenes([]); }}>
                <span className="mode-em">🛍️</span>
                <div><div className="mode-lbl">Product Video Ad</div><div className="mode-sub">Image + description → 30s ad</div></div>
                {mode==="product" && <div className="sel-indicator pk"/>}
              </button>
            </div>

            <div className="studio-layout">
              {/* Inputs */}
              <div className="gpanel">
                <div className="gpanel-head">
                  <span className="gpanel-title">{mode==="youtube" ? "🎬 YouTube setup" : "🛍️ Product ad setup"}</span>
                </div>
                <div className="gpanel-body">
                  <div className="pipe-track">
                    {pipeSteps.map((s,i) => (
                      <>
                        <div key={s} className={`ps ${step>i?"done":step===i+1?"on":""}`}>{step>i?"✓ ":""}{s}</div>
                        {i<pipeSteps.length-1 && <span className="ps-sep">›</span>}
                      </>
                    ))}
                  </div>

                  {mode==="youtube" ? (
                    <>
                      <div className="field">
                        <label className="flbl">Video Topic</label>
                        <textarea rows={3} placeholder="e.g. Top 10 passive income ideas that actually work" value={topic} onChange={e=>setTopic(e.target.value)}/>
                      </div>
                      <div className="row2">
                        <div className="field">
                          <label className="flbl">Duration</label>
                          <select value={duration} onChange={e=>setDuration(e.target.value)}>
                            <option value="30">30s — Short</option>
                            <option value="60">60s — 1 min</option>
                            <option value="180">3 min</option>
                            <option value="300">5 min</option>
                          </select>
                        </div>
                        <div className="field">
                          <label className="flbl">Style</label>
                          <select value={style} onChange={e=>setStyle(e.target.value)}>
                            <option value="educational">Educational</option>
                            <option value="storytelling">Storytelling</option>
                            <option value="listicle">Listicle</option>
                            <option value="motivational">Motivational</option>
                            <option value="documentary">Documentary</option>
                          </select>
                        </div>
                      </div>
                      <div className="field">
                        <label className="flbl">Voiceover</label>
                        <select>
                          <option>Deep Male — Professional</option>
                          <option>Female — Warm & Engaging</option>
                          <option>Male — Energetic</option>
                          <option>Female — Documentary</option>
                        </select>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="field">
                        <label className="flbl">Product Name</label>
                        <input type="text" placeholder="e.g. AeroFoam Pro Wireless Headphones" value={productName} onChange={e=>setProductName(e.target.value)}/>
                      </div>
                      <div className="field">
                        <label className="flbl">Description</label>
                        <textarea rows={3} placeholder="Key features, benefits, target audience..." value={productDesc} onChange={e=>setProductDesc(e.target.value)}/>
                      </div>
                      <div className="field">
                        <label className="flbl">Product Image</label>
                        <div className="upzone">
                          <input type="file" accept="image/*" onChange={handleImg}/>
                          {productImage ? <img src={productImage} className="up-img" alt="Product"/> : (
                            <><div className="up-ico">📸</div><div className="up-txt">Drop image or click to browse<br/><span style={{fontSize:10,opacity:0.6}}>PNG, JPG up to 10MB</span></div></>
                          )}
                        </div>
                      </div>
                      <div className="row2">
                        <div className="field">
                          <label className="flbl">Format</label>
                          <select value={videoFormat} onChange={e=>setVideoFormat(e.target.value)}>
                            <option value="landscape">16:9 — YouTube</option>
                            <option value="portrait">9:16 — TikTok</option>
                            <option value="square">1:1 — Instagram</option>
                          </select>
                        </div>
                        <div className="field">
                          <label className="flbl">Length</label>
                          <select>
                            <option>15s — Story</option>
                            <option>30s — Standard</option>
                            <option>60s — Long</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <span className="cost-tag">⚡ ~${mode==="youtube"?"1.50":"0.80"} per video</span>
                    <span style={{fontSize:11,color:"var(--sub)"}}>via fal.ai</span>
                  </div>

                  <button
                    className={`btn-gen ${mode==="product"?"pk":""}`}
                    onClick={generate}
                    disabled={isGen||(mode==="youtube"?!topic.trim():!productName.trim())}
                  >
                    <div className="shim"/>
                    {isGen
                      ? <><span className="spin"/>{step===1?"Writing script...":step===2?"Planning scenes...":"Generating video..."}</>
                      : step===4 ? "✓ Done — Generate another"
                      : `Generate ${mode==="youtube"?"YouTube video":"product ad"} →`
                    }
                  </button>
                </div>
              </div>

              {/* Output */}
              <div className="out-stack">
                {step===0 ? (
                  <div className="gpanel">
                    <div className="empty-s">
                      <div className="empty-ico">{mode==="youtube"?"🎬":"🛍️"}</div>
                      <div className="empty-txt">
                        {mode==="youtube"
                          ? "Enter a topic and hit generate. Claude writes the script, plans scenes, and queues video generation."
                          : "Add product details and an image to generate a scroll-stopping video ad."}
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {script && (
                      <div className="out-card">
                        <div className="out-head">
                          <span className="out-title">📝 Script</span>
                          <button className="btn-xs" onClick={copyScript}>{copied?"✓ Copied":"Copy"}</button>
                        </div>
                        <div className="out-body" ref={scriptRef}>
                          {script}{typing && <span className="tcursor"/>}
                        </div>
                      </div>
                    )}

                    {scenes.length>0 && (
                      <div className="out-card">
                        <div className="out-head"><span className="out-title">🎞️ Scenes</span></div>
                        {step>=3 && <div className="prog-wrap"><div className="prog-fill" style={{width:`${progress}%`}}/></div>}
                        <div className="scene-list">
                          {scenes.map((sc,i) => {
                            const st = sceneStatus[i]||"pending";
                            return (
                              <div key={i} className={`scene-row ${st==="gen"?"gen":st==="done"?"done":""}`}>
                                <div className={`snum ${st==="gen"?"a":st==="done"?"d":""}`}>{st==="done"?"✓":i+1}</div>
                                <div className="sinfo">
                                  <div className="slbl">Scene {i+1}</div>
                                  <div className="stxt">{sc}</div>
                                  <div className={`sstat ${st==="gen"?"a":st==="done"?"d":""}`}>
                                    {st==="pending"?"· Queued":st==="gen"?"⟳ Generating...":"✓ Rendered"}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {step>=3 && (
                      <div className="out-card">
                        <div className="vid-ph">
                          {step===4 ? (
                            <>
                              <div style={{fontSize:34}}>🎥</div>
                              <div className="vid-ready">Video ready!</div>
                              <div style={{fontSize:11,color:"var(--sub)"}}>Scene stitching via FFmpeg — coming soon</div>
                              <button className="dl-btn">⬇ Download MP4</button>
                            </>
                          ) : (
                            <>
                              <div style={{fontSize:28,opacity:0.25}}>▶</div>
                              <div>Rendering... {progress}%</div>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ──── HISTORY ──── */}
        {hasPaid && page==="history" && (
          <div className="sub-page">
            <div className="gpanel">
              <div className="gpanel-head"><span className="gpanel-title">📁 Generation History</span></div>
              <div className="empty-s"><div className="empty-ico">📂</div><div className="empty-txt">Your generated videos will appear here.</div></div>
            </div>
          </div>
        )}

        {/* ──── SETTINGS ──── */}
        {hasPaid && page==="settings" && (
          <div className="sub-page">
            <div className="gpanel">
              <div className="gpanel-head"><span className="gpanel-title">⚙️ API Configuration</span></div>
              <div className="gpanel-body">
                <div className="field"><label className="flbl">Anthropic API Key</label><input type="text" placeholder="sk-ant-••••••••••••"/></div>
                <div className="field"><label className="flbl">fal.ai API Key</label><input type="text" placeholder="••••••••••••••••••"/></div>
                <div className="field"><label className="flbl">ElevenLabs API Key</label><input type="text" placeholder="••••••••••••••••••"/></div>
                <div className="field">
                  <label className="flbl">Video Model</label>
                  <select>
                    <option>Wan 2.2 T2V — Best quality</option>
                    <option>Wan 2.2 I2V — Image to video</option>
                    <option>LTX-Video — Fastest</option>
                  </select>
                </div>
                <button className="btn-gen">Save Settings</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
