import { useState, useRef, useEffect } from "react";

const CLAUDE_MODEL = "claude-sonnet-4-20250514";
const ANTHROPIC_KEY = import.meta.env.VITE_ANTHROPIC_KEY || "";
const STRIPE_LINKS = {
  basic: import.meta.env.VITE_STRIPE_BASIC || "https://buy.stripe.com/placeholder_basic",
  pro:   import.meta.env.VITE_STRIPE_PRO   || "https://buy.stripe.com/placeholder_pro",
};

const YOUTUBE_SCENE_PROMPTS = [
  "Cinematic aerial shot of a futuristic city at dawn, golden hour light, 8K",
  "Close-up of hands typing on a glowing keyboard, neon reflections, dark room",
  "Abstract data visualization floating in space, particle effects, deep blue",
  "Smooth camera pan across a modern minimalist workspace setup",
  "Time-lapse of clouds moving over mountain peaks, dramatic lighting",
];
const PRODUCT_SCENE_PROMPTS = [
  "Product floating in studio void, soft dramatic lighting, luxury aesthetic",
  "Close-up product details, macro lens, shallow depth of field, clean white",
  "Product in lifestyle context, warm natural light, aspirational feel",
  "360 rotation of product, seamless loop, premium brand aesthetic",
];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:       #06060f;
    --s1:       #0c0c1d;
    --s2:       #111128;
    --border:   rgba(255,255,255,0.06);
    --border2:  rgba(255,255,255,0.12);
    --p:        #7B5EA7;
    --p2:       #9B6FD0;
    --pink:     #E8619A;
    --teal:     #4ECDC4;
    --text:     #F0F0FA;
    --sub:      #8888A8;
    --font:     'Inter', sans-serif;
  }

  html { scroll-behavior: smooth; }
  body { background: var(--bg); color: var(--text); font-family: var(--font); overflow-x: hidden; }

  /* ── ORBS ── */
  .orb {
    position: fixed; border-radius: 50%; pointer-events: none; z-index: 0;
    filter: blur(100px); opacity: 0.18;
  }
  .orb-a { width: 700px; height: 700px; background: radial-gradient(circle, #7B5EA7, transparent); top: -200px; left: -200px; animation: drift 18s ease-in-out infinite alternate; }
  .orb-b { width: 500px; height: 500px; background: radial-gradient(circle, #E8619A, transparent); bottom: -150px; right: -150px; animation: drift 22s ease-in-out infinite alternate-reverse; }
  .orb-c { width: 350px; height: 350px; background: radial-gradient(circle, #4ECDC4, transparent); top: 50%; left: 50%; transform: translate(-50%,-50%); animation: drift 14s ease-in-out infinite alternate; }
  @keyframes drift { from { transform: translateY(0) scale(1); } to { transform: translateY(40px) scale(1.08); } }

  /* ── NAV ── */
  .nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 200;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 48px; height: 64px;
    background: rgba(6,6,15,0.7);
    backdrop-filter: blur(24px);
    border-bottom: 1px solid var(--border);
  }
  .logo {
    font-size: 17px; font-weight: 800; letter-spacing: -0.4px;
    display: flex; align-items: center; gap: 9px; cursor: pointer;
  }
  .logo-mark {
    width: 28px; height: 28px; border-radius: 8px;
    background: linear-gradient(135deg, var(--p), var(--pink));
    display: flex; align-items: center; justify-content: center;
    font-size: 13px;
  }
  .nav-right { display: flex; align-items: center; gap: 12px; }
  .nav-pill {
    font-size: 12px; font-weight: 500; padding: 6px 16px;
    border-radius: 20px; border: 1px solid var(--border2);
    background: var(--s1); color: var(--sub); cursor: pointer;
    transition: all 0.2s;
  }
  .nav-pill:hover { color: var(--text); border-color: var(--p); }
  .nav-pill.active { background: var(--p); color: white; border-color: transparent; }
  .nav-cta {
    font-size: 13px; font-weight: 600; padding: 8px 20px;
    border-radius: 8px; border: none; cursor: pointer;
    background: linear-gradient(135deg, var(--p), var(--p2));
    color: white; transition: all 0.2s;
    box-shadow: 0 2px 16px rgba(123,94,167,0.4);
  }
  .nav-cta:hover { transform: translateY(-1px); box-shadow: 0 4px 24px rgba(123,94,167,0.5); }
  .nav-access {
    font-size: 11px; font-weight: 600; padding: 5px 12px;
    border-radius: 20px; background: rgba(78,205,196,0.1);
    color: var(--teal); border: 1px solid rgba(78,205,196,0.25);
    display: flex; align-items: center; gap: 6px;
  }
  .nav-access::before { content:''; width:6px; height:6px; border-radius:50%; background:var(--teal); display:inline-block; animation: pulse2 2s ease-in-out infinite; }
  @keyframes pulse2 { 0%,100%{opacity:1} 50%{opacity:0.3} }

  /* ── HERO ── */
  .hero {
    position: relative; z-index: 1; min-height: 100vh;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    text-align: center; padding: 100px 24px 80px;
  }
  .hero-chip {
    display: inline-flex; align-items: center; gap: 7px;
    font-size: 11px; font-weight: 600; letter-spacing: 0.8px; text-transform: uppercase;
    color: var(--p2); background: rgba(123,94,167,0.12);
    border: 1px solid rgba(123,94,167,0.3); border-radius: 20px;
    padding: 6px 14px; margin-bottom: 28px;
    animation: fadeUp 0.6s ease both;
  }
  .hero-chip span { width:6px; height:6px; border-radius:50%; background:var(--p2); animation: pulse2 1.5s ease-in-out infinite; }
  .hero-h1 {
    font-size: clamp(42px, 7vw, 80px); font-weight: 900;
    line-height: 1.05; letter-spacing: -2.5px; margin-bottom: 24px;
    animation: fadeUp 0.6s ease 0.1s both;
  }
  .hero-h1 .grad {
    background: linear-gradient(135deg, #fff 0%, var(--p2) 50%, var(--pink) 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .hero-sub {
    font-size: clamp(15px, 2vw, 18px); color: var(--sub); max-width: 520px;
    line-height: 1.75; margin-bottom: 40px; font-weight: 400;
    animation: fadeUp 0.6s ease 0.2s both;
  }
  .hero-actions {
    display: flex; align-items: center; gap: 14px; flex-wrap: wrap; justify-content: center;
    animation: fadeUp 0.6s ease 0.3s both;
  }
  .btn-primary {
    font-size: 15px; font-weight: 700; padding: 14px 32px;
    border-radius: 10px; border: none; cursor: pointer;
    background: linear-gradient(135deg, var(--p), var(--p2));
    color: white; transition: all 0.25s;
    box-shadow: 0 4px 24px rgba(123,94,167,0.45);
    display: flex; align-items: center; gap: 8px;
  }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(123,94,167,0.55); }
  .btn-ghost {
    font-size: 14px; font-weight: 500; padding: 14px 28px;
    border-radius: 10px; border: 1px solid var(--border2);
    background: transparent; color: var(--sub); cursor: pointer;
    transition: all 0.2s;
  }
  .btn-ghost:hover { color: var(--text); border-color: var(--p); background: rgba(123,94,167,0.08); }
  .hero-social {
    margin-top: 56px; display: flex; align-items: center; gap: 32px; flex-wrap: wrap; justify-content: center;
    animation: fadeUp 0.6s ease 0.4s both;
  }
  .hero-stat { text-align: center; }
  .hero-stat-num { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
  .hero-stat-label { font-size: 11px; color: var(--sub); margin-top: 2px; }
  .divider-dot { width: 4px; height: 4px; border-radius: 50%; background: var(--border2); }

  /* ── FEATURE STRIP ── */
  .features {
    position: relative; z-index: 1;
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px;
    max-width: 900px; margin: 0 auto 100px;
    background: var(--border); border-radius: 16px; overflow: hidden;
  }
  .feature-item {
    background: var(--s1); padding: 32px 28px;
    transition: background 0.2s;
  }
  .feature-item:hover { background: var(--s2); }
  .feature-icon { font-size: 24px; margin-bottom: 12px; }
  .feature-title { font-size: 14px; font-weight: 700; margin-bottom: 6px; }
  .feature-desc { font-size: 12px; color: var(--sub); line-height: 1.6; }

  /* ── PRICING ── */
  .section { position: relative; z-index: 1; padding: 0 24px 100px; }
  .section-label {
    text-align: center; font-size: 11px; font-weight: 700; letter-spacing: 1.5px;
    text-transform: uppercase; color: var(--p2); margin-bottom: 12px;
  }
  .section-title {
    text-align: center; font-size: clamp(28px, 4vw, 44px); font-weight: 800;
    letter-spacing: -1px; margin-bottom: 12px;
  }
  .section-sub {
    text-align: center; font-size: 15px; color: var(--sub); max-width: 460px;
    margin: 0 auto 48px; line-height: 1.7;
  }
  .pricing-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
    max-width: 760px; margin: 0 auto;
  }
  .price-card {
    background: var(--s1); border: 1px solid var(--border);
    border-radius: 20px; padding: 36px 32px;
    position: relative; overflow: hidden; transition: transform 0.2s;
  }
  .price-card:hover { transform: translateY(-4px); }
  .price-card.featured {
    border-color: var(--p);
    background: linear-gradient(145deg, rgba(123,94,167,0.08) 0%, var(--s1) 100%);
    box-shadow: 0 0 48px rgba(123,94,167,0.15);
  }
  .price-badge {
    position: absolute; top: 20px; right: 20px;
    font-size: 9px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;
    background: var(--p); color: white; padding: 4px 10px; border-radius: 20px;
  }
  .price-tier { font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: var(--sub); margin-bottom: 16px; }
  .price-amount { font-size: 56px; font-weight: 900; letter-spacing: -2px; line-height: 1; }
  .price-amount sup { font-size: 22px; font-weight: 600; vertical-align: top; margin-top: 10px; letter-spacing: 0; }
  .price-once { font-size: 12px; color: var(--sub); margin-top: 6px; margin-bottom: 24px; }
  .price-list { list-style: none; display: flex; flex-direction: column; gap: 10px; margin-bottom: 28px; }
  .price-list li {
    font-size: 13px; color: var(--text); display: flex; align-items: flex-start; gap: 9px; line-height: 1.4;
  }
  .price-list li .check { color: var(--teal); font-size: 12px; margin-top: 1px; flex-shrink: 0; }
  .price-list li .dim { color: var(--sub); }
  .btn-buy {
    display: block; width: 100%; padding: 13px; border-radius: 10px;
    font-size: 14px; font-weight: 700; text-align: center;
    cursor: pointer; border: none; text-decoration: none; transition: all 0.2s;
  }
  .btn-buy-outline {
    background: transparent; color: var(--text);
    border: 1px solid var(--border2);
  }
  .btn-buy-outline:hover { border-color: var(--p); color: var(--p); }
  .btn-buy-fill {
    background: linear-gradient(135deg, var(--p), var(--p2));
    color: white; box-shadow: 0 4px 20px rgba(123,94,167,0.4);
  }
  .btn-buy-fill:hover { transform: translateY(-1px); box-shadow: 0 8px 28px rgba(123,94,167,0.5); }
  .pricing-note {
    text-align: center; font-size: 12px; color: var(--sub); margin-top: 24px;
  }
  .pricing-note a { color: var(--p2); cursor: pointer; text-decoration: underline; }

  /* ── STUDIO ── */
  .studio-wrap {
    position: relative; z-index: 1;
    padding: 80px 32px 60px; max-width: 1160px; margin: 0 auto;
  }
  .mode-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 28px; }
  .mode-btn {
    padding: 20px 22px; border-radius: 14px;
    border: 1px solid var(--border); background: var(--s1);
    cursor: pointer; display: flex; align-items: center; gap: 14px;
    transition: all 0.2s; text-align: left;
  }
  .mode-btn:hover { border-color: var(--border2); background: var(--s2); }
  .mode-btn.active { border-color: var(--p); background: rgba(123,94,167,0.08); box-shadow: 0 0 24px rgba(123,94,167,0.1); }
  .mode-btn.active-pink { border-color: var(--pink); background: rgba(232,97,154,0.08); box-shadow: 0 0 24px rgba(232,97,154,0.1); }
  .mode-emoji { font-size: 24px; flex-shrink: 0; }
  .mode-label { font-size: 13px; font-weight: 700; margin-bottom: 2px; }
  .mode-sublabel { font-size: 11px; color: var(--sub); line-height: 1.4; }

  .studio-grid { display: grid; grid-template-columns: 1fr 400px; gap: 20px; }

  /* card */
  .card {
    background: var(--s1); border: 1px solid var(--border);
    border-radius: 16px; overflow: hidden;
  }
  .card-head {
    padding: 16px 22px; border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
  }
  .card-title { font-size: 13px; font-weight: 700; }
  .card-body { padding: 22px; display: flex; flex-direction: column; gap: 18px; }

  /* pipe */
  .pipe-row { display: flex; align-items: center; gap: 0; background: var(--s2); border-radius: 8px; padding: 3px; }
  .pipe-step {
    flex: 1; padding: 7px 4px; text-align: center; font-size: 10px;
    color: var(--sub); border-radius: 6px; font-weight: 500; transition: all 0.2s;
  }
  .pipe-step.done { color: var(--teal); }
  .pipe-step.active { background: var(--s1); color: var(--text); }
  .pipe-sep { color: var(--border2); font-size: 10px; flex-shrink: 0; padding: 0 2px; }

  /* fields */
  .field { display: flex; flex-direction: column; gap: 7px; }
  .flabel { font-size: 11px; font-weight: 600; color: var(--sub); text-transform: uppercase; letter-spacing: 0.8px; }
  textarea, input[type=text], select {
    background: var(--s2); border: 1px solid var(--border);
    border-radius: 9px; color: var(--text); font-family: var(--font);
    font-size: 13px; padding: 11px 13px; width: 100%; outline: none; resize: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  textarea:focus, input[type=text]:focus, select:focus {
    border-color: rgba(123,94,167,0.5);
    box-shadow: 0 0 0 3px rgba(123,94,167,0.08);
  }
  select option { background: var(--s2); }
  .row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

  /* upload */
  .upload {
    border: 1.5px dashed var(--border); border-radius: 10px;
    padding: 28px; text-align: center; cursor: pointer;
    position: relative; overflow: hidden; transition: all 0.2s;
  }
  .upload:hover { border-color: var(--pink); background: rgba(232,97,154,0.03); }
  .upload input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
  .upload-icon { font-size: 24px; margin-bottom: 8px; }
  .upload-txt { font-size: 12px; color: var(--sub); line-height: 1.5; }
  .upload img { width: 100%; max-height: 140px; object-fit: cover; border-radius: 6px; margin-top: 10px; }

  /* generate btn */
  .btn-gen {
    width: 100%; padding: 15px; border-radius: 10px; border: none; cursor: pointer;
    font-family: var(--font); font-size: 14px; font-weight: 700;
    position: relative; overflow: hidden; transition: all 0.25s; color: white;
    background: linear-gradient(135deg, var(--p), var(--p2));
    box-shadow: 0 4px 20px rgba(123,94,167,0.35);
  }
  .btn-gen.pink-mode { background: linear-gradient(135deg, var(--pink), #f7a34b); box-shadow: 0 4px 20px rgba(232,97,154,0.35); }
  .btn-gen:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 28px rgba(123,94,167,0.45); }
  .btn-gen:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }
  .shimmer {
    position: absolute; inset: 0;
    background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 50%, transparent 100%);
    transform: translateX(-100%); animation: shim 2.2s infinite;
  }
  @keyframes shim { to { transform: translateX(100%); } }
  .spin {
    width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.25);
    border-top-color: white; border-radius: 50%;
    animation: rotating 0.7s linear infinite; display: inline-block; margin-right: 7px; vertical-align: middle;
  }
  @keyframes rotating { to { transform: rotate(360deg); } }

  /* cost badge */
  .cost-tag {
    font-size: 11px; padding: 5px 12px; border-radius: 20px;
    background: rgba(78,205,196,0.07); color: var(--teal);
    border: 1px solid rgba(78,205,196,0.18);
    display: inline-flex; align-items: center; gap: 5px;
  }

  /* output */
  .out-col { display: flex; flex-direction: column; gap: 14px; }

  .script-out { background: var(--s1); border: 1px solid var(--border); border-radius: 14px; overflow: hidden; }
  .script-head { padding: 13px 18px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
  .script-title-sm { font-size: 12px; font-weight: 700; }
  .script-body {
    padding: 16px 18px; font-size: 12px; line-height: 1.9; color: #b0b0d0;
    max-height: 200px; overflow-y: auto;
  }
  .script-body::-webkit-scrollbar { width: 3px; }
  .script-body::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }

  .cursor-blink { display: inline-block; width: 2px; height: 13px; background: var(--p2); margin-left: 2px; vertical-align: middle; animation: blink 1s step-end infinite; }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }

  .scenes-out { background: var(--s1); border: 1px solid var(--border); border-radius: 14px; overflow: hidden; }
  .scenes-head { padding: 13px 18px; border-bottom: 1px solid var(--border); }
  .prog-bar { height: 3px; margin: 0 18px 14px; background: var(--s2); border-radius: 2px; overflow: hidden; }
  .prog-fill { height: 100%; background: linear-gradient(90deg, var(--p), var(--teal)); transition: width 0.5s ease; border-radius: 2px; }
  .scenes-list { padding: 10px; display: flex; flex-direction: column; gap: 6px; }
  .scene-row {
    background: var(--s2); border-radius: 9px; padding: 11px 13px;
    display: flex; align-items: flex-start; gap: 10px;
    border: 1px solid transparent; transition: border-color 0.2s;
  }
  .scene-row.gen { border-color: rgba(123,94,167,0.4); animation: glowP 1.5s ease-in-out infinite; }
  .scene-row.done { border-color: rgba(78,205,196,0.25); }
  @keyframes glowP { 0%,100%{box-shadow:none} 50%{box-shadow:0 0 14px rgba(123,94,167,0.18)} }
  .s-num {
    width: 22px; height: 22px; border-radius: 6px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 10px; font-weight: 700; background: var(--s1); color: var(--sub);
  }
  .s-num.a { background: var(--p); color: white; }
  .s-num.d { background: rgba(78,205,196,0.12); color: var(--teal); }
  .s-info { flex: 1; }
  .s-lbl { font-size: 10px; color: var(--sub); margin-bottom: 2px; }
  .s-text { font-size: 12px; line-height: 1.45; }
  .s-status { font-size: 10px; margin-top: 4px; color: var(--sub); }
  .s-status.a { color: var(--p2); }
  .s-status.d { color: var(--teal); }

  .video-out { background: var(--s1); border: 1px solid var(--border); border-radius: 14px; overflow: hidden; }
  .video-ph {
    aspect-ratio: 16/9; background: var(--s2);
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 10px; color: var(--sub); font-size: 13px;
  }
  .video-ready-title { color: var(--teal); font-size: 13px; font-weight: 700; }

  .empty-state {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 12px; padding: 52px 24px; color: var(--sub); text-align: center;
  }
  .empty-icon { font-size: 40px; opacity: 0.25; }
  .empty-text { font-size: 13px; line-height: 1.7; max-width: 240px; }

  /* copy btn */
  .btn-sm {
    font-size: 11px; padding: 4px 10px; border-radius: 6px;
    border: 1px solid var(--border); background: var(--s2);
    color: var(--sub); cursor: pointer; font-family: var(--font);
    transition: all 0.15s;
  }
  .btn-sm:hover { color: var(--text); border-color: var(--p2); }

  /* settings / history */
  .settings-wrap { padding: 80px 32px 60px; max-width: 600px; margin: 0 auto; }

  /* gate */
  .gate {
    min-height: calc(100vh - 64px); display: flex; flex-direction: column;
    align-items: center; justify-content: center; text-align: center;
    padding: 60px 24px; position: relative; z-index: 1;
  }
  .gate-icon { font-size: 48px; margin-bottom: 20px; opacity: 0.5; }
  .gate-title { font-size: 22px; font-weight: 800; margin-bottom: 8px; }
  .gate-sub { font-size: 14px; color: var(--sub); margin-bottom: 28px; }

  /* animations */
  @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

  /* responsive */
  @media (max-width: 860px) {
    .nav { padding: 0 20px; }
    .studio-grid { grid-template-columns: 1fr; }
    .mode-row { grid-template-columns: 1fr; }
    .features { grid-template-columns: 1fr; }
    .pricing-grid { grid-template-columns: 1fr; }
    .studio-wrap { padding: 80px 16px 40px; }
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
  const [page, setPage] = useState(checkPaid() ? "studio" : "home"); // home | studio | history | settings
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

  const handleImageUpload = (e) => {
    const f = e.target.files[0];
    if (f) { const r = new FileReader(); r.onload = ev => setProductImage(ev.target.result); r.readAsDataURL(f); }
  };

  const typeOut = async (text) => {
    setTyping(true); setScript("");
    const words = text.split(" ");
    for (let i = 0; i < words.length; i++) {
      await new Promise(r => setTimeout(r, 28));
      setScript(prev => prev + (i === 0 ? "" : " ") + words[i]);
      if (scriptRef.current) scriptRef.current.scrollTop = scriptRef.current.scrollHeight;
    }
    setTyping(false);
  };

  const runScenes = async (list) => {
    const s = list.map(() => "pending"); setSceneStatus([...s]);
    for (let i = 0; i < list.length; i++) {
      await new Promise(r => setTimeout(r, 300));
      s[i] = "gen"; setSceneStatus([...s]);
      await new Promise(r => setTimeout(r, 1400 + Math.random() * 900));
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
        ? `You are a professional YouTube scriptwriter for faceless channels. Write a compelling ${duration}-second video script about: "${topic}". Style: ${style}.

Format:
HOOK (0-5s): [attention-grabbing opening]
MAIN CONTENT: [3-4 clear sections]
CTA (last 10s): [call to action]

Keep it punchy. Max ${Math.round(parseInt(duration) * 2.5)} words total.`
        : `You are a professional product video copywriter. Write compelling video ad copy for:
Product: ${productName}
Description: ${productDesc || "A premium product"}

Format:
HOOK (0-3s): [powerful opening]
PROBLEM (3-8s): [pain point]
SOLUTION (8-18s): [how product solves it]
PROOF (18-23s): [social proof]
CTA (23-30s): [clear call to action]

Make it punchy and conversion-focused.`;

      const headers = {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true"
      };

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers,
        body: JSON.stringify({ model: CLAUDE_MODEL, max_tokens: 1000, messages: [{ role: "user", content: prompt }] })
      });
      const data = await res.json();
      const scriptText = data.content?.find(b => b.type === "text")?.text || "Script generation failed.";
      await typeOut(scriptText);

      setStep(2);
      await new Promise(r => setTimeout(r, 500));

      const res2 = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers,
        body: JSON.stringify({
          model: CLAUDE_MODEL, max_tokens: 600,
          messages: [{ role: "user", content: `Based on this script, generate ${mode === "youtube" ? "5" : "4"} cinematic AI video scene prompts for Wan 2.2. Vivid and specific.\n\nScript: ${scriptText}\n\nReturn ONLY a JSON array:\n["prompt 1", "prompt 2", ...]` }]
        })
      });
      const d2 = await res2.json();
      let txt = d2.content?.find(b => b.type === "text")?.text || "[]";
      txt = txt.replace(/```json|```/g, "").trim();
      let parsed;
      try { parsed = JSON.parse(txt); } catch { parsed = mode === "youtube" ? YOUTUBE_SCENE_PROMPTS : PRODUCT_SCENE_PROMPTS; }

      setScenes(parsed);
      setStep(3);
      await runScenes(parsed);
      setStep(4);
    } catch (e) { console.error(e); } finally { setIsGen(false); }
  };

  const copyScript = () => { navigator.clipboard.writeText(script); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const unlock = (go = "studio") => { localStorage.setItem("cf_paid", "1"); setHasPaid(true); setPage(go); };

  const pipeSteps = ["Script", "Scenes", "Video", "Export"];

  return (
    <>
      <style>{css}</style>
      <div>
        <div className="orb orb-a" /><div className="orb orb-b" /><div className="orb orb-c" />

        {/* NAV */}
        <nav className="nav">
          <div className="logo" onClick={() => setPage(hasPaid ? "studio" : "home")}>
            <div className="logo-mark">⚡</div>
            ClipForge
          </div>
          <div className="nav-right">
            {hasPaid ? (
              <>
                {["studio","history","settings"].map(t => (
                  <button key={t} className={`nav-pill ${page === t ? "active" : ""}`} onClick={() => setPage(t)}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
                <div className="nav-access">Full Access</div>
              </>
            ) : (
              <>
                <button className="nav-pill" onClick={() => setPage("home")}>Home</button>
                <button className="nav-cta" onClick={() => setPage("home")}>Get Access →</button>
              </>
            )}
          </div>
        </nav>

        {/* ── HOME / LANDING ── */}
        {page === "home" && (
          <div style={{paddingTop: 64}}>
            {/* Hero */}
            <div className="hero">
              <div className="hero-chip"><span />New — Powered by Wan 2.2 + Claude AI</div>
              <h1 className="hero-h1">
                Turn ideas into<br/>
                <span className="grad">AI videos instantly</span>
              </h1>
              <p className="hero-sub">
                Generate faceless YouTube videos and product ads with AI. Write, visualise, and render — no skills needed.
              </p>
              <div className="hero-actions">
                <button className="btn-primary" onClick={() => hasPaid ? setPage("studio") : setPage("home")}>
                  Start Creating →
                </button>
                <button className="btn-ghost" onClick={() => document.getElementById("pricing")?.scrollIntoView({behavior:"smooth"})}>
                  See pricing
                </button>
              </div>
              <div className="hero-social">
                <div className="hero-stat"><div className="hero-stat-num">2</div><div className="hero-stat-label">Video modes</div></div>
                <div className="divider-dot" />
                <div className="hero-stat"><div className="hero-stat-num">$0</div><div className="hero-stat-label">Monthly fee</div></div>
                <div className="divider-dot" />
                <div className="hero-stat"><div className="hero-stat-num">~60s</div><div className="hero-stat-label">Script to scenes</div></div>
                <div className="divider-dot" />
                <div className="hero-stat"><div className="hero-stat-num">1080p</div><div className="hero-stat-label">Output quality</div></div>
              </div>
            </div>

            {/* Feature strip */}
            <div className="features" style={{padding: "0 24px", maxWidth: 900, margin: "0 auto 100px"}}>
              <div className="feature-item">
                <div className="feature-icon">🎬</div>
                <div className="feature-title">Faceless YouTube</div>
                <div className="feature-desc">Enter a topic, get a full script, voiceover, and cinematic clips ready to upload.</div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">🛍️</div>
                <div className="feature-title">Product Video Ads</div>
                <div className="feature-desc">Upload a product image and get a scroll-stopping 30-second ad for TikTok or Meta.</div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">⚡</div>
                <div className="feature-title">One-time payment</div>
                <div className="feature-desc">Pay once, use forever. No subscriptions, no watermarks, commercial rights included.</div>
              </div>
            </div>

            {/* Pricing */}
            <div className="section" id="pricing">
              <div className="section-label">Pricing</div>
              <h2 className="section-title">Simple, honest pricing</h2>
              <p className="section-sub">Pay once. No monthly fees. Instant access after checkout.</p>
              <div className="pricing-grid">
                {/* Basic */}
                <div className="price-card">
                  <div className="price-tier">Basic</div>
                  <div className="price-amount"><sup>$</sup>49</div>
                  <div className="price-once">one-time payment</div>
                  <ul className="price-list">
                    <li><span className="check">✓</span> Faceless YouTube automation</li>
                    <li><span className="check">✓</span> Claude AI script writer</li>
                    <li><span className="check">✓</span> 5 cinematic scenes per video</li>
                    <li><span className="check">✓</span> 720p video generation</li>
                    <li><span className="check">✓</span> No watermarks</li>
                    <li><span className="dim">✗ Product video ads</span></li>
                    <li><span className="dim">✗ Auto scene stitching</span></li>
                  </ul>
                  <a className="btn-buy btn-buy-outline"
                    href={`${STRIPE_LINKS.basic}?success_url=${encodeURIComponent(window.location.origin + "?payment=success")}`}
                    target="_blank" rel="noreferrer">
                    Buy Basic — $49
                  </a>
                </div>
                {/* Pro */}
                <div className="price-card featured">
                  <div className="price-badge">Best Value</div>
                  <div className="price-tier">Pro</div>
                  <div className="price-amount"><sup>$</sup>99</div>
                  <div className="price-once">one-time payment</div>
                  <ul className="price-list">
                    <li><span className="check">✓</span> Everything in Basic</li>
                    <li><span className="check">✓</span> Product video ad mode</li>
                    <li><span className="check">✓</span> 1080p video generation</li>
                    <li><span className="check">✓</span> Auto scene stitching</li>
                    <li><span className="check">✓</span> ElevenLabs voiceover</li>
                    <li><span className="check">✓</span> Commercial license</li>
                    <li><span className="check">✓</span> Priority support</li>
                  </ul>
                  <a className="btn-buy btn-buy-fill"
                    href={`${STRIPE_LINKS.pro}?success_url=${encodeURIComponent(window.location.origin + "?payment=success")}`}
                    target="_blank" rel="noreferrer">
                    Buy Pro — $99
                  </a>
                </div>
              </div>
              <p className="pricing-note">
                Already purchased? <a onClick={() => unlock("studio")}>Restore access</a>
                &nbsp;·&nbsp; Secure checkout via Stripe &nbsp;·&nbsp; Instant access
              </p>
            </div>
          </div>
        )}

        {/* ── GATE ── */}
        {!hasPaid && page !== "home" && (
          <div className="gate">
            <div className="gate-icon">🔒</div>
            <div className="gate-title">Purchase required</div>
            <div className="gate-sub">Get full access to the studio with a one-time payment.</div>
            <button className="btn-primary" onClick={() => setPage("home")}>View plans →</button>
          </div>
        )}

        {/* ── STUDIO ── */}
        {hasPaid && page === "studio" && (
          <div className="studio-wrap">
            {/* Mode select */}
            <div className="mode-row">
              <button className={`mode-btn ${mode === "youtube" ? "active" : ""}`} onClick={() => { setMode("youtube"); setStep(0); setScript(""); setScenes([]); }}>
                <span className="mode-emoji">🎬</span>
                <div>
                  <div className="mode-label">Faceless YouTube</div>
                  <div className="mode-sublabel">Topic → script → voiceover → video clips</div>
                </div>
              </button>
              <button className={`mode-btn ${mode === "product" ? "active-pink" : ""}`} onClick={() => { setMode("product"); setStep(0); setScript(""); setScenes([]); }}>
                <span className="mode-emoji">🛍️</span>
                <div>
                  <div className="mode-label">Product Video Ad</div>
                  <div className="mode-sublabel">Image + description → 30s ad</div>
                </div>
              </button>
            </div>

            <div className="studio-grid">
              {/* Left: inputs */}
              <div className="card">
                <div className="card-head">
                  <div className="card-title">{mode === "youtube" ? "🎬 YouTube Setup" : "🛍️ Product Ad Setup"}</div>
                </div>
                <div className="card-body">
                  {/* Pipeline */}
                  <div className="pipe-row">
                    {pipeSteps.map((s, i) => (
                      <>
                        <div key={s} className={`pipe-step ${step > i ? "done" : step === i + 1 ? "active" : ""}`}>
                          {step > i ? "✓ " : ""}{s}
                        </div>
                        {i < pipeSteps.length - 1 && <span className="pipe-sep">›</span>}
                      </>
                    ))}
                  </div>

                  {mode === "youtube" ? (
                    <>
                      <div className="field">
                        <label className="flabel">Video Topic</label>
                        <textarea rows={3} placeholder="e.g. Top 10 passive income ideas that actually work" value={topic} onChange={e => setTopic(e.target.value)} />
                      </div>
                      <div className="row2">
                        <div className="field">
                          <label className="flabel">Duration</label>
                          <select value={duration} onChange={e => setDuration(e.target.value)}>
                            <option value="30">30s — Short</option>
                            <option value="60">60s — 1 min</option>
                            <option value="180">3 min</option>
                            <option value="300">5 min</option>
                          </select>
                        </div>
                        <div className="field">
                          <label className="flabel">Style</label>
                          <select value={style} onChange={e => setStyle(e.target.value)}>
                            <option value="educational">Educational</option>
                            <option value="storytelling">Storytelling</option>
                            <option value="listicle">Listicle</option>
                            <option value="motivational">Motivational</option>
                            <option value="documentary">Documentary</option>
                          </select>
                        </div>
                      </div>
                      <div className="field">
                        <label className="flabel">Voiceover</label>
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
                        <label className="flabel">Product Name</label>
                        <input type="text" placeholder="e.g. AeroFoam Pro Wireless Headphones" value={productName} onChange={e => setProductName(e.target.value)} />
                      </div>
                      <div className="field">
                        <label className="flabel">Description</label>
                        <textarea rows={3} placeholder="Key features, benefits, target audience..." value={productDesc} onChange={e => setProductDesc(e.target.value)} />
                      </div>
                      <div className="field">
                        <label className="flabel">Product Image</label>
                        <div className="upload">
                          <input type="file" accept="image/*" onChange={handleImageUpload} />
                          {productImage ? <img src={productImage} alt="Product" /> : (
                            <><div className="upload-icon">📸</div><div className="upload-txt">Drop image or click to browse<br/><span style={{fontSize:11,opacity:0.6}}>PNG, JPG up to 10MB</span></div></>
                          )}
                        </div>
                      </div>
                      <div className="row2">
                        <div className="field">
                          <label className="flabel">Format</label>
                          <select value={videoFormat} onChange={e => setVideoFormat(e.target.value)}>
                            <option value="landscape">16:9 — YouTube</option>
                            <option value="portrait">9:16 — TikTok</option>
                            <option value="square">1:1 — Instagram</option>
                          </select>
                        </div>
                        <div className="field">
                          <label className="flabel">Length</label>
                          <select>
                            <option>15s — Story</option>
                            <option>30s — Standard</option>
                            <option>60s — Long</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  <div style={{display:"flex", alignItems:"center", justifyContent:"space-between"}}>
                    <span className="cost-tag">⚡ ~${mode === "youtube" ? "1.50" : "0.80"} per video</span>
                    <span style={{fontSize:11, color:"var(--sub)"}}>via fal.ai</span>
                  </div>

                  <button
                    className={`btn-gen ${mode === "product" ? "pink-mode" : ""}`}
                    onClick={generate}
                    disabled={isGen || (mode === "youtube" ? !topic.trim() : !productName.trim())}
                  >
                    <div className="shimmer" />
                    {isGen ? (
                      <><span className="spin" />{step === 1 ? "Writing script..." : step === 2 ? "Planning scenes..." : "Generating video..."}</>
                    ) : step === 4 ? "✓ Done — Generate another" : `Generate ${mode === "youtube" ? "YouTube video" : "product ad"} →`}
                  </button>
                </div>
              </div>

              {/* Right: output */}
              <div className="out-col">
                {step === 0 ? (
                  <div className="card">
                    <div className="empty-state">
                      <div className="empty-icon">{mode === "youtube" ? "🎬" : "🛍️"}</div>
                      <div className="empty-text">
                        {mode === "youtube"
                          ? "Enter a topic and generate. Claude writes the script, plans scenes, and queues video generation."
                          : "Add product details and image. Get a scroll-stopping video ad ready to run."}
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {script && (
                      <div className="script-out">
                        <div className="script-head">
                          <span className="script-title-sm">📝 Generated script</span>
                          <button className="btn-sm" onClick={copyScript}>{copied ? "✓ Copied" : "Copy"}</button>
                        </div>
                        <div className="script-body" ref={scriptRef}>
                          {script}{typing && <span className="cursor-blink" />}
                        </div>
                      </div>
                    )}

                    {scenes.length > 0 && (
                      <div className="scenes-out">
                        <div className="scenes-head">
                          <span className="script-title-sm">🎞️ Video scenes</span>
                        </div>
                        {step >= 3 && <div className="prog-bar"><div className="prog-fill" style={{width: `${progress}%`}} /></div>}
                        <div className="scenes-list">
                          {scenes.map((sc, i) => {
                            const st = sceneStatus[i] || "pending";
                            return (
                              <div key={i} className={`scene-row ${st === "gen" ? "gen" : st === "done" ? "done" : ""}`}>
                                <div className={`s-num ${st === "gen" ? "a" : st === "done" ? "d" : ""}`}>
                                  {st === "done" ? "✓" : i + 1}
                                </div>
                                <div className="s-info">
                                  <div className="s-lbl">Scene {i + 1}</div>
                                  <div className="s-text">{sc}</div>
                                  <div className={`s-status ${st === "gen" ? "a" : st === "done" ? "d" : ""}`}>
                                    {st === "pending" ? "· Queued" : st === "gen" ? "⟳ Generating..." : "✓ Rendered"}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {step >= 3 && (
                      <div className="video-out">
                        <div className="video-ph">
                          {step === 4 ? (
                            <>
                              <div style={{fontSize:36}}>🎥</div>
                              <div className="video-ready-title">Video ready!</div>
                              <div style={{fontSize:12, color:"var(--sub)"}}>Stitching via FFmpeg — coming soon</div>
                              <button style={{
                                padding:"9px 22px", borderRadius:"8px", border:"none",
                                background:"linear-gradient(135deg,var(--teal),#44b8a0)",
                                color:"#06060f", fontFamily:"var(--font)", fontWeight:700,
                                fontSize:13, cursor:"pointer"
                              }}>⬇ Download MP4</button>
                            </>
                          ) : (
                            <>
                              <div style={{fontSize:32, opacity:0.3}}>▶</div>
                              <div>Rendering scenes... {progress}%</div>
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

        {/* ── HISTORY ── */}
        {hasPaid && page === "history" && (
          <div className="settings-wrap">
            <div className="card">
              <div className="card-head"><div className="card-title">📁 Generation History</div></div>
              <div className="empty-state">
                <div className="empty-icon">📂</div>
                <div className="empty-text">Your generated videos will appear here.</div>
              </div>
            </div>
          </div>
        )}

        {/* ── SETTINGS ── */}
        {hasPaid && page === "settings" && (
          <div className="settings-wrap">
            <div className="card">
              <div className="card-head"><div className="card-title">⚙️ API Configuration</div></div>
              <div className="card-body">
                <div className="field"><label className="flabel">Anthropic API Key</label><input type="text" placeholder="sk-ant-••••••••••••" /></div>
                <div className="field"><label className="flabel">fal.ai API Key</label><input type="text" placeholder="••••••••••••••••••" /></div>
                <div className="field"><label className="flabel">ElevenLabs API Key</label><input type="text" placeholder="••••••••••••••••••" /></div>
                <div className="field">
                  <label className="flabel">Video Model</label>
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
