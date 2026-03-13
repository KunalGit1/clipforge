import { useState, useEffect, useRef } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #080810;
    --surface: #0f0f1a;
    --surface2: #16162a;
    --border: rgba(255,255,255,0.07);
    --accent: #7c6aff;
    --accent2: #ff6a8a;
    --accent3: #6affda;
    --text: #f0f0ff;
    --muted: #6b6b8a;
    --font-head: 'Syne', sans-serif;
    --font-mono: 'DM Mono', monospace;
  }

  body { background: var(--bg); color: var(--text); font-family: var(--font-mono); }

  .app {
    min-height: 100vh;
    background: var(--bg);
    position: relative;
    overflow-x: hidden;
  }

  /* Ambient background blobs */
  .blob {
    position: fixed;
    border-radius: 50%;
    filter: blur(120px);
    opacity: 0.12;
    pointer-events: none;
    z-index: 0;
  }
  .blob-1 { width: 600px; height: 600px; background: var(--accent); top: -200px; left: -200px; }
  .blob-2 { width: 500px; height: 500px; background: var(--accent2); bottom: -150px; right: -150px; }
  .blob-3 { width: 400px; height: 400px; background: var(--accent3); top: 40%; left: 40%; }

  /* NAV */
  .nav {
    position: sticky; top: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 40px;
    background: rgba(8,8,16,0.85);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
  }
  .nav-logo {
    font-family: var(--font-head);
    font-size: 20px; font-weight: 800; letter-spacing: -0.5px;
    display: flex; align-items: center; gap: 10px;
  }
  .logo-dot {
    width: 10px; height: 10px; border-radius: 50%;
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    box-shadow: 0 0 12px var(--accent);
    animation: pulse 2s ease-in-out infinite;
  }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(0.85)} }

  .nav-tabs { display: flex; gap: 4px; background: var(--surface); border-radius: 10px; padding: 4px; }
  .nav-tab {
    padding: 8px 18px; border-radius: 7px; border: none; cursor: pointer;
    font-family: var(--font-mono); font-size: 13px; font-weight: 500;
    color: var(--muted); background: transparent;
    transition: all 0.2s;
  }
  .nav-tab.active {
    background: var(--surface2);
    color: var(--text);
    box-shadow: 0 0 0 1px var(--border);
  }
  .nav-tab:hover:not(.active) { color: var(--text); }

  .nav-badge {
    font-size: 11px; padding: 4px 10px; border-radius: 20px;
    background: rgba(124,106,255,0.15); color: var(--accent);
    border: 1px solid rgba(124,106,255,0.3); font-family: var(--font-mono);
  }

  /* MAIN */
  .main { position: relative; z-index: 1; padding: 40px; max-width: 1200px; margin: 0 auto; }

  /* MODE SELECTOR */
  .mode-selector {
    display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 40px;
  }
  .mode-card {
    padding: 28px; border-radius: 16px; border: 1px solid var(--border);
    background: var(--surface); cursor: pointer;
    transition: all 0.25s; position: relative; overflow: hidden;
  }
  .mode-card::before {
    content: ''; position: absolute; inset: 0;
    opacity: 0; transition: opacity 0.25s;
    border-radius: 16px;
  }
  .mode-card.youtube::before { background: linear-gradient(135deg, rgba(124,106,255,0.1), transparent); }
  .mode-card.product::before { background: linear-gradient(135deg, rgba(255,106,138,0.1), transparent); }
  .mode-card.active { border-color: var(--accent); box-shadow: 0 0 30px rgba(124,106,255,0.15); }
  .mode-card.active.product { border-color: var(--accent2); box-shadow: 0 0 30px rgba(255,106,138,0.15); }
  .mode-card:hover { transform: translateY(-2px); }
  .mode-card:hover::before { opacity: 1; }

  .mode-icon { font-size: 32px; margin-bottom: 14px; display: block; }
  .mode-title { font-family: var(--font-head); font-size: 18px; font-weight: 700; margin-bottom: 6px; }
  .mode-desc { font-size: 12px; color: var(--muted); line-height: 1.6; }
  .mode-tag {
    display: inline-block; margin-top: 12px; font-size: 10px; padding: 3px 8px;
    border-radius: 4px; font-weight: 500; letter-spacing: 0.5px;
  }
  .tag-youtube { background: rgba(124,106,255,0.15); color: var(--accent); }
  .tag-product { background: rgba(255,106,138,0.15); color: var(--accent2); }

  /* WORKSPACE */
  .workspace { display: grid; grid-template-columns: 1fr 420px; gap: 24px; }

  /* INPUT PANEL */
  .panel {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 16px; overflow: hidden;
  }
  .panel-header {
    padding: 18px 24px; border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
  }
  .panel-title { font-family: var(--font-head); font-size: 14px; font-weight: 700; letter-spacing: 0.3px; }
  .panel-step {
    font-size: 11px; color: var(--muted); font-family: var(--font-mono);
    background: var(--surface2); padding: 3px 10px; border-radius: 20px;
    border: 1px solid var(--border);
  }
  .panel-body { padding: 24px; display: flex; flex-direction: column; gap: 20px; }

  /* INPUTS */
  .field { display: flex; flex-direction: column; gap: 8px; }
  .label { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; }

  textarea, input, select {
    background: var(--surface2); border: 1px solid var(--border);
    border-radius: 10px; color: var(--text);
    font-family: var(--font-mono); font-size: 13px;
    padding: 12px 14px; width: 100%;
    transition: border-color 0.2s, box-shadow 0.2s;
    outline: none; resize: none;
  }
  textarea:focus, input:focus, select:focus {
    border-color: rgba(124,106,255,0.5);
    box-shadow: 0 0 0 3px rgba(124,106,255,0.1);
  }
  select option { background: var(--surface2); }

  /* UPLOAD */
  .upload-zone {
    border: 2px dashed var(--border); border-radius: 12px;
    padding: 32px; text-align: center; cursor: pointer;
    transition: all 0.2s; position: relative; overflow: hidden;
  }
  .upload-zone:hover { border-color: var(--accent2); background: rgba(255,106,138,0.04); }
  .upload-zone input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
  .upload-icon { font-size: 28px; margin-bottom: 10px; }
  .upload-text { font-size: 13px; color: var(--muted); }
  .upload-preview {
    width: 100%; max-height: 160px; object-fit: cover;
    border-radius: 8px; margin-top: 12px;
  }

  /* STEPS PIPELINE */
  .pipeline {
    display: flex; gap: 0; margin: 8px 0;
    background: var(--surface2); border-radius: 10px;
    padding: 4px; overflow: hidden;
  }
  .pipe-step {
    flex: 1; padding: 8px 6px; text-align: center;
    font-size: 10px; color: var(--muted); border-radius: 7px;
    transition: all 0.2s; cursor: default;
  }
  .pipe-step.active { background: var(--surface); color: var(--text); }
  .pipe-step.done { color: var(--accent3); }
  .pipe-arrow { display: flex; align-items: center; color: var(--muted); font-size: 10px; padding: 0 2px; }

  /* GENERATE BTN */
  .btn-generate {
    width: 100%; padding: 16px; border-radius: 12px; border: none; cursor: pointer;
    font-family: var(--font-head); font-size: 15px; font-weight: 700;
    position: relative; overflow: hidden; transition: all 0.25s;
    background: linear-gradient(135deg, var(--accent), #a066ff);
    color: white; letter-spacing: 0.3px;
    box-shadow: 0 4px 24px rgba(124,106,255,0.35);
  }
  .btn-generate.product-mode {
    background: linear-gradient(135deg, var(--accent2), #ff9966);
    box-shadow: 0 4px 24px rgba(255,106,138,0.35);
  }
  .btn-generate:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(124,106,255,0.45); }
  .btn-generate:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
  .btn-generate .shimmer {
    position: absolute; inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
    transform: translateX(-100%);
    animation: shimmer 2s infinite;
  }
  @keyframes shimmer { to { transform: translateX(100%); } }

  /* RIGHT PANEL - OUTPUT */
  .output-panel { display: flex; flex-direction: column; gap: 16px; }

  /* SCRIPT OUTPUT */
  .script-box {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 16px; overflow: hidden;
  }
  .script-header {
    padding: 14px 20px; border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
  }
  .script-title { font-family: var(--font-head); font-size: 13px; font-weight: 700; }
  .script-body { padding: 18px 20px; font-size: 12px; line-height: 1.8; color: #c0c0e0; max-height: 220px; overflow-y: auto; }
  .script-body::-webkit-scrollbar { width: 4px; }
  .script-body::-webkit-scrollbar-track { background: transparent; }
  .script-body::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }

  /* SCENE CARDS */
  .scenes-box {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 16px; overflow: hidden;
  }
  .scenes-header { padding: 14px 20px; border-bottom: 1px solid var(--border); }
  .scenes-list { padding: 12px; display: flex; flex-direction: column; gap: 8px; }
  .scene-card {
    background: var(--surface2); border-radius: 10px; padding: 12px 14px;
    display: flex; align-items: flex-start; gap: 12px;
    border: 1px solid transparent; transition: border-color 0.2s;
  }
  .scene-card.generating { border-color: var(--accent); animation: glow 1.5s ease-in-out infinite; }
  .scene-card.done { border-color: rgba(106, 255, 218, 0.3); }
  @keyframes glow { 0%,100%{box-shadow:none} 50%{box-shadow:0 0 16px rgba(124,106,255,0.2)} }
  .scene-num {
    width: 24px; height: 24px; border-radius: 6px;
    background: var(--surface); display: flex; align-items: center; justify-content: center;
    font-size: 11px; color: var(--muted); flex-shrink: 0; margin-top: 1px;
    font-weight: 600;
  }
  .scene-num.active { background: var(--accent); color: white; }
  .scene-num.done { background: rgba(106,255,218,0.15); color: var(--accent3); }
  .scene-info { flex: 1; }
  .scene-label { font-size: 11px; color: var(--muted); margin-bottom: 3px; }
  .scene-prompt { font-size: 12px; color: var(--text); line-height: 1.5; }
  .scene-status { font-size: 10px; margin-top: 6px; }
  .status-pending { color: var(--muted); }
  .status-gen { color: var(--accent); }
  .status-done { color: var(--accent3); }

  /* VIDEO PREVIEW */
  .video-box {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 16px; overflow: hidden;
  }
  .video-placeholder {
    aspect-ratio: 16/9; background: var(--surface2);
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 12px; color: var(--muted); font-size: 13px;
  }
  .video-placeholder-icon { font-size: 36px; opacity: 0.4; }

  /* PROGRESS BAR */
  .progress-bar-wrap {
    background: var(--surface2); border-radius: 4px; height: 4px;
    margin: 0 20px 16px; overflow: hidden;
  }
  .progress-bar-fill {
    height: 100%; border-radius: 4px;
    background: linear-gradient(90deg, var(--accent), var(--accent3));
    transition: width 0.5s ease;
  }

  /* TYPING CURSOR */
  .cursor { display: inline-block; width: 2px; height: 14px; background: var(--accent); margin-left: 2px; animation: blink 1s step-end infinite; vertical-align: middle; }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }

  /* COPY BTN */
  .btn-copy {
    font-size: 11px; padding: 4px 10px; border-radius: 6px; border: 1px solid var(--border);
    background: var(--surface2); color: var(--muted); cursor: pointer;
    font-family: var(--font-mono); transition: all 0.2s;
  }
  .btn-copy:hover { color: var(--text); border-color: var(--accent); }

  /* SETTINGS ROW */
  .settings-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

  /* LOADING SPINNER */
  .spinner {
    width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.2);
    border-top-color: white; border-radius: 50%;
    animation: spin 0.7s linear infinite; display: inline-block; margin-right: 8px;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* COST ESTIMATE */
  .cost-badge {
    font-size: 11px; padding: 6px 14px; border-radius: 20px;
    background: rgba(106,255,218,0.08); color: var(--accent3);
    border: 1px solid rgba(106,255,218,0.2);
    display: inline-flex; align-items: center; gap: 6px;
  }

  /* EMPTY STATE */
  .empty-output {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; gap: 16px; padding: 60px 20px;
    color: var(--muted); text-align: center;
  }
  .empty-icon { font-size: 48px; opacity: 0.3; }
  .empty-text { font-size: 13px; line-height: 1.7; max-width: 260px; }

  /* RESPONSIVE */
  @media (max-width: 900px) {
    .workspace { grid-template-columns: 1fr; }
    .mode-selector { grid-template-columns: 1fr; }
    .main { padding: 20px; }
    .nav { padding: 14px 20px; }
  }

  /* PRICING PAGE */
  .pricing-hero {
    text-align: center; padding: 60px 20px 40px;
  }
  .pricing-hero h1 {
    font-family: var(--font-head); font-size: 48px; font-weight: 800;
    background: linear-gradient(135deg, var(--text), var(--accent));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    margin-bottom: 14px; letter-spacing: -1px;
  }
  .pricing-hero p {
    font-size: 16px; color: var(--muted); max-width: 480px; margin: 0 auto 40px; line-height: 1.7;
  }
  .pricing-cards {
    display: grid; grid-template-columns: 1fr 1fr; gap: 20px;
    max-width: 800px; margin: 0 auto 60px;
  }
  @media (max-width: 700px) { .pricing-cards { grid-template-columns: 1fr; } }
  .pricing-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 20px; padding: 36px 32px; position: relative; overflow: hidden;
    transition: transform 0.2s;
  }
  .pricing-card:hover { transform: translateY(-4px); }
  .pricing-card.featured {
    border-color: var(--accent);
    box-shadow: 0 0 40px rgba(124,106,255,0.2);
  }
  .pricing-card.featured::before {
    content: 'MOST POPULAR';
    position: absolute; top: 16px; right: -28px;
    background: var(--accent); color: white;
    font-size: 9px; font-weight: 700; letter-spacing: 1px;
    padding: 4px 40px; transform: rotate(45deg);
  }
  .plan-name {
    font-family: var(--font-head); font-size: 13px; font-weight: 700;
    color: var(--muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;
  }
  .plan-price {
    font-family: var(--font-head); font-size: 52px; font-weight: 800;
    color: var(--text); line-height: 1; margin-bottom: 4px;
  }
  .plan-price span { font-size: 20px; color: var(--muted); font-weight: 400; }
  .plan-desc { font-size: 12px; color: var(--muted); margin-bottom: 24px; }
  .plan-features { list-style: none; display: flex; flex-direction: column; gap: 10px; margin-bottom: 28px; }
  .plan-features li { font-size: 13px; color: var(--text); display: flex; align-items: center; gap: 8px; }
  .plan-features li::before { content: '✓'; color: var(--accent3); font-weight: 700; flex-shrink: 0; }
  .btn-buy {
    width: 100%; padding: 14px; border-radius: 10px; border: none; cursor: pointer;
    font-family: var(--font-head); font-size: 14px; font-weight: 700;
    transition: all 0.2s; text-decoration: none; display: block; text-align: center;
  }
  .btn-buy-basic {
    background: var(--surface2); color: var(--text);
    border: 1px solid var(--border);
  }
  .btn-buy-basic:hover { border-color: var(--accent); color: var(--accent); }
  .btn-buy-pro {
    background: linear-gradient(135deg, var(--accent), #a066ff);
    color: white; box-shadow: 0 4px 20px rgba(124,106,255,0.4);
  }
  .btn-buy-pro:hover { transform: translateY(-1px); box-shadow: 0 8px 28px rgba(124,106,255,0.5); }
  .pricing-footer {
    text-align: center; font-size: 12px; color: var(--muted); padding-bottom: 60px;
  }
  .pricing-footer a { color: var(--accent); cursor: pointer; text-decoration: underline; }

  /* ACCESS BADGE */
  .access-badge {
    display: flex; align-items: center; gap: 8px;
    font-size: 12px; color: var(--accent3);
    background: rgba(106,255,218,0.08); border: 1px solid rgba(106,255,218,0.2);
    border-radius: 20px; padding: 5px 14px;
  }
  .access-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent3); }
`;

const CLAUDE_MODEL = "claude-sonnet-4-20250514";
const ANTHROPIC_KEY = import.meta.env.VITE_ANTHROPIC_KEY || "";

// Stripe Payment Links — replace with your real links from Stripe dashboard
const STRIPE_LINKS = {
  basic:  import.meta.env.VITE_STRIPE_BASIC  || "https://buy.stripe.com/placeholder_basic",
  pro:    import.meta.env.VITE_STRIPE_PRO    || "https://buy.stripe.com/placeholder_pro",
};

// Fake scene prompts for demo (since we don't have real Replicate keys)
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

export default function App() {
  // Check localStorage + URL param for paid state
  const checkPaid = () => {
    if (localStorage.getItem("cf_paid")) return true;
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") === "success") {
      localStorage.setItem("cf_paid", "1");
      window.history.replaceState({}, "", window.location.pathname);
      return true;
    }
    return false;
  };
  const [hasPaid, setHasPaid] = useState(checkPaid);
  const [activeTab, setActiveTab] = useState(checkPaid() ? "studio" : "pricing");
  const [mode, setMode] = useState("youtube"); // youtube | product
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0); // 0=idle,1=script,2=scenes,3=video,4=done
  const [script, setScript] = useState("");
  const [scriptTyping, setScriptTyping] = useState(false);
  const [scenes, setScenes] = useState([]);
  const [sceneStatuses, setSceneStatuses] = useState([]);
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  // Form state
  const [topic, setTopic] = useState("");
  const [duration, setDuration] = useState("60");
  const [style, setStyle] = useState("educational");
  const [productName, setProductName] = useState("");
  const [productDesc, setProductDesc] = useState("");
  const [productImage, setProductImage] = useState(null);
  const [videoFormat, setVideoFormat] = useState("landscape");

  const scriptRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setProductImage(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const typeScript = async (text) => {
    setScriptTyping(true);
    setScript("");
    const words = text.split(" ");
    for (let i = 0; i < words.length; i++) {
      await new Promise(r => setTimeout(r, 30));
      setScript(prev => prev + (i === 0 ? "" : " ") + words[i]);
      if (scriptRef.current) scriptRef.current.scrollTop = scriptRef.current.scrollHeight;
    }
    setScriptTyping(false);
  };

  const simulateSceneGeneration = async (sceneList) => {
    const statuses = sceneList.map(() => "pending");
    setSceneStatuses([...statuses]);
    for (let i = 0; i < sceneList.length; i++) {
      await new Promise(r => setTimeout(r, 400));
      statuses[i] = "generating";
      setSceneStatuses([...statuses]);
      const genTime = 1500 + Math.random() * 1000;
      await new Promise(r => setTimeout(r, genTime));
      statuses[i] = "done";
      setSceneStatuses([...statuses]);
      setProgress(Math.round(((i + 1) / sceneList.length) * 100));
    }
  };

  const handleGenerate = async () => {
    if (mode === "youtube" && !topic.trim()) return;
    if (mode === "product" && !productName.trim()) return;

    setIsGenerating(true);
    setGenerationStep(1);
    setScript("");
    setScenes([]);
    setSceneStatuses([]);
    setProgress(0);

    try {
      // Step 1: Generate script via Claude API
      const prompt = mode === "youtube"
        ? `You are a professional YouTube scriptwriter for faceless channels. Write a compelling ${duration}-second video script about: "${topic}". Style: ${style}. 

Format your response as:
HOOK (0-5s): [attention-grabbing opening]
MAIN CONTENT: [the core content broken into 3-4 clear sections]
CTA (last 10s): [call to action]

Keep it punchy, engaging, and optimized for retention. No filler words. Maximum ${Math.round(parseInt(duration) * 2.5)} words total.`
        : `You are a professional product video copywriter. Write compelling video ad copy for:
Product: ${productName}
Description: ${productDesc || "A premium product"}

Format:
HOOK (0-3s): [powerful opening line]
PROBLEM (3-8s): [pain point this solves]  
SOLUTION (8-18s): [how the product solves it, key features]
PROOF (18-23s): [social proof or results]
CTA (23-30s): [clear call to action]

Make it punchy, conversion-focused, and emotionally resonant.`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": ANTHROPIC_KEY, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
        body: JSON.stringify({
          model: CLAUDE_MODEL,
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }]
        })
      });

      const data = await response.json();
      const scriptText = data.content?.find(b => b.type === "text")?.text || "Script generation failed.";

      await typeScript(scriptText);

      // Step 2: Generate scene prompts
      setGenerationStep(2);
      await new Promise(r => setTimeout(r, 600));

      const scenesResponse = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": ANTHROPIC_KEY, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
        body: JSON.stringify({
          model: CLAUDE_MODEL,
          max_tokens: 600,
          messages: [{
            role: "user",
            content: `Based on this video script, generate ${mode === "youtube" ? "5" : "4"} cinematic video scene prompts for AI video generation (Wan 2.2 model). Each prompt should be vivid, specific, and cinematic.

Script: ${scriptText}

Return ONLY a JSON array of strings, no markdown, no explanation:
["prompt 1", "prompt 2", ...]`
          }]
        })
      });

      const scenesData = await scenesResponse.json();
      let scenesText = scenesData.content?.find(b => b.type === "text")?.text || "[]";
      scenesText = scenesText.replace(/```json|```/g, "").trim();
      let parsedScenes;
      try {
        parsedScenes = JSON.parse(scenesText);
      } catch {
        parsedScenes = mode === "youtube" ? YOUTUBE_SCENE_PROMPTS : PRODUCT_SCENE_PROMPTS;
      }

      setScenes(parsedScenes);
      setSceneStatuses(parsedScenes.map(() => "pending"));

      // Step 3: Simulate video generation (in real app: call Replicate API)
      setGenerationStep(3);
      await simulateSceneGeneration(parsedScenes);

      // Step 4: Done
      setGenerationStep(4);

    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyScript = () => {
    navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const pipeSteps = ["Script", "Scenes", "Video Gen", "Export"];

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />

        {/* NAV */}
        <nav className="nav">
          <div className="nav-logo">
            <div className="logo-dot" />
            ClipForge
          </div>
          {hasPaid ? (
            <div className="nav-tabs">
              {["studio", "history", "settings"].map(tab => (
                <button
                  key={tab}
                  className={`nav-tab ${activeTab === tab ? "active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          ) : (
            <button className="btn-buy btn-buy-pro" style={{width:"auto",padding:"8px 20px",fontSize:"13px"}}
              onClick={() => setActiveTab("pricing")}>
              Get Access →
            </button>
          )}
          {hasPaid ? (
            <div className="access-badge"><div className="access-dot" /> Full Access</div>
          ) : (
            <div className="nav-badge">✦ fal.ai · Wan 2.2</div>
          )}
        </nav>

        <main className="main">
          {/* PRICING PAGE */}
          {(!hasPaid || activeTab === "pricing") && activeTab !== "studio" && activeTab !== "history" && activeTab !== "settings" && (
            <div>
              <div className="pricing-hero">
                <h1>Make AI Videos.<br/>Pay Once. Keep Forever.</h1>
                <p>Generate faceless YouTube videos and product ads with AI. No subscriptions. No watermarks. Yours to keep.</p>
              </div>
              <div className="pricing-cards">
                <div className="pricing-card">
                  <div className="plan-name">Basic</div>
                  <div className="plan-price">$49<span> one-time</span></div>
                  <div className="plan-desc">Perfect to get started</div>
                  <ul className="plan-features">
                    <li>Faceless YouTube automation</li>
                    <li>AI script writer (Claude)</li>
                    <li>5 scenes per video</li>
                    <li>720p video generation</li>
                    <li>Download individual clips</li>
                    <li>No watermarks</li>
                  </ul>
                  <a className="btn-buy btn-buy-basic"
                    href={`${STRIPE_LINKS.basic}?success_url=${encodeURIComponent(window.location.origin + "?payment=success")}`}
                    target="_blank" rel="noreferrer">
                    Buy Basic — $49
                  </a>
                </div>
                <div className="pricing-card featured">
                  <div className="plan-name">Pro</div>
                  <div className="plan-price">$99<span> one-time</span></div>
                  <div className="plan-desc">Everything you need to scale</div>
                  <ul className="plan-features">
                    <li>Everything in Basic</li>
                    <li>Product video ad mode</li>
                    <li>1080p video generation</li>
                    <li>Auto scene stitching (FFmpeg)</li>
                    <li>ElevenLabs voiceover</li>
                    <li>Commercial license included</li>
                    <li>Priority support</li>
                  </ul>
                  <a className="btn-buy btn-buy-pro"
                    href={`${STRIPE_LINKS.pro}?success_url=${encodeURIComponent(window.location.origin + "?payment=success")}`}
                    target="_blank" rel="noreferrer">
                    Buy Pro — $99
                  </a>
                </div>
              </div>
              <div className="pricing-footer">
                Already purchased? <a onClick={() => { localStorage.setItem("cf_paid","1"); setHasPaid(true); setActiveTab("studio"); }}>Click here to restore access</a>
                &nbsp;·&nbsp; Secure payment via Stripe &nbsp;·&nbsp; Instant access after purchase
              </div>
            </div>
          )}

          {/* GATE: show pricing if not paid and trying to access studio */}
          {!hasPaid && (activeTab === "studio" || activeTab === "history" || activeTab === "settings") && (
            <div className="empty-output" style={{paddingTop:80}}>
              <div className="empty-icon">🔒</div>
              <div className="empty-text">Purchase a plan to unlock the studio.</div>
              <button className="btn-generate" style={{marginTop:16,width:"auto",padding:"12px 32px"}}
                onClick={() => setActiveTab("pricing")}>
                View Pricing →
              </button>
            </div>
          )}

          {hasPaid && activeTab === "studio" && (
            <>
              {/* MODE SELECTOR */}
              <div className="mode-selector">
                <div
                  className={`mode-card youtube ${mode === "youtube" ? "active" : ""}`}
                  onClick={() => { setMode("youtube"); setGenerationStep(0); setScript(""); setScenes([]); }}
                >
                  <span className="mode-icon">🎬</span>
                  <div className="mode-title">Faceless YouTube</div>
                  <div className="mode-desc">Topic → Script → Voiceover → AI video clips → Assembled video ready to upload</div>
                  <span className="mode-tag tag-youtube">YOUTUBE AUTOMATION</span>
                </div>
                <div
                  className={`mode-card product ${mode === "product" ? "active" : ""}`}
                  onClick={() => { setMode("product"); setGenerationStep(0); setScript(""); setScenes([]); }}
                >
                  <span className="mode-icon">🛍️</span>
                  <div className="mode-title">Product Video Ad</div>
                  <div className="mode-desc">Product image + description → Ad copy → Animated video ad for TikTok, Meta, YouTube</div>
                  <span className="mode-tag tag-product">E-COMMERCE ADS</span>
                </div>
              </div>

              {/* WORKSPACE */}
              <div className="workspace">
                {/* LEFT: INPUT */}
                <div className="panel">
                  <div className="panel-header">
                    <div className="panel-title">
                      {mode === "youtube" ? "🎬 YouTube Video Setup" : "🛍️ Product Ad Setup"}
                    </div>
                    <div className="panel-step">Step 1 of 3</div>
                  </div>
                  <div className="panel-body">

                    {/* PIPELINE */}
                    <div className="pipeline">
                      {pipeSteps.map((step, i) => (
                        <>
                          <div key={step} className={`pipe-step ${generationStep > i ? "done" : generationStep === i + 1 ? "active" : ""}`}>
                            {generationStep > i ? "✓ " : ""}{step}
                          </div>
                          {i < pipeSteps.length - 1 && <div className="pipe-arrow">›</div>}
                        </>
                      ))}
                    </div>

                    {mode === "youtube" ? (
                      <>
                        <div className="field">
                          <label className="label">Video Topic</label>
                          <textarea
                            rows={3}
                            placeholder="e.g. 'Top 10 passive income ideas for 2025 that actually work'"
                            value={topic}
                            onChange={e => setTopic(e.target.value)}
                          />
                        </div>
                        <div className="settings-row">
                          <div className="field">
                            <label className="label">Duration (seconds)</label>
                            <select value={duration} onChange={e => setDuration(e.target.value)}>
                              <option value="30">30s — Short</option>
                              <option value="60">60s — 1 min</option>
                              <option value="180">3 min</option>
                              <option value="300">5 min</option>
                            </select>
                          </div>
                          <div className="field">
                            <label className="label">Style</label>
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
                          <label className="label">Voiceover Style</label>
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
                          <label className="label">Product Name</label>
                          <input
                            type="text"
                            placeholder="e.g. AeroFoam Pro Wireless Headphones"
                            value={productName}
                            onChange={e => setProductName(e.target.value)}
                          />
                        </div>
                        <div className="field">
                          <label className="label">Product Description</label>
                          <textarea
                            rows={3}
                            placeholder="Key features, benefits, target audience, price point..."
                            value={productDesc}
                            onChange={e => setProductDesc(e.target.value)}
                          />
                        </div>
                        <div className="field">
                          <label className="label">Product Image</label>
                          <div className="upload-zone">
                            <input type="file" accept="image/*" onChange={handleImageUpload} />
                            {productImage ? (
                              <img src={productImage} alt="Product" className="upload-preview" />
                            ) : (
                              <>
                                <div className="upload-icon">📸</div>
                                <div className="upload-text">Drop product image or click to browse<br /><span style={{fontSize:'11px',opacity:0.6}}>PNG, JPG up to 10MB</span></div>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="settings-row">
                          <div className="field">
                            <label className="label">Format</label>
                            <select value={videoFormat} onChange={e => setVideoFormat(e.target.value)}>
                              <option value="landscape">16:9 — YouTube</option>
                              <option value="portrait">9:16 — TikTok/Reels</option>
                              <option value="square">1:1 — Instagram</option>
                            </select>
                          </div>
                          <div className="field">
                            <label className="label">Ad Duration</label>
                            <select>
                              <option>15s — Story Ad</option>
                              <option>30s — Standard</option>
                              <option>60s — Long Form</option>
                            </select>
                          </div>
                        </div>
                      </>
                    )}

                    <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginTop: 4}}>
                      <div className="cost-badge">
                        ⚡ Est. cost: ~${mode === "youtube" ? "1.50" : "0.80"} / video
                      </div>
                      <span style={{fontSize:'11px', color:'var(--muted)'}}>via Replicate</span>
                    </div>

                    <button
                      className={`btn-generate ${mode === "product" ? "product-mode" : ""}`}
                      onClick={handleGenerate}
                      disabled={isGenerating || (mode === "youtube" ? !topic.trim() : !productName.trim())}
                    >
                      <div className="shimmer" />
                      {isGenerating ? (
                        <><span className="spinner" />{generationStep === 1 ? "Writing Script..." : generationStep === 2 ? "Planning Scenes..." : "Generating Video..."}</>
                      ) : generationStep === 4 ? (
                        "✓ Done — Generate Another"
                      ) : (
                        `Generate ${mode === "youtube" ? "YouTube Video" : "Product Ad"} →`
                      )}
                    </button>
                  </div>
                </div>

                {/* RIGHT: OUTPUT */}
                <div className="output-panel">
                  {generationStep === 0 ? (
                    <div className="panel">
                      <div className="empty-output">
                        <div className="empty-icon">{mode === "youtube" ? "🎬" : "🛍️"}</div>
                        <div className="empty-text">
                          {mode === "youtube"
                            ? "Enter your topic and hit Generate. Claude will write the script, plan scenes, and queue video generation."
                            : "Add your product details and image. We'll create a scroll-stopping video ad in seconds."}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* SCRIPT */}
                      {script && (
                        <div className="script-box">
                          <div className="script-header">
                            <div className="script-title">📝 Generated Script</div>
                            <button className="btn-copy" onClick={copyScript}>
                              {copied ? "✓ Copied" : "Copy"}
                            </button>
                          </div>
                          <div className="script-body" ref={scriptRef}>
                            {script}{scriptTyping && <span className="cursor" />}
                          </div>
                        </div>
                      )}

                      {/* SCENES */}
                      {scenes.length > 0 && (
                        <div className="scenes-box">
                          <div className="scenes-header">
                            <div className="script-title">🎞️ Video Scenes</div>
                          </div>
                          {generationStep >= 3 && (
                            <div className="progress-bar-wrap">
                              <div className="progress-bar-fill" style={{width: `${progress}%`}} />
                            </div>
                          )}
                          <div className="scenes-list">
                            {scenes.map((scene, i) => {
                              const status = sceneStatuses[i] || "pending";
                              return (
                                <div key={i} className={`scene-card ${status === "generating" ? "generating" : status === "done" ? "done" : ""}`}>
                                  <div className={`scene-num ${status === "generating" ? "active" : status === "done" ? "done" : ""}`}>
                                    {status === "done" ? "✓" : i + 1}
                                  </div>
                                  <div className="scene-info">
                                    <div className="scene-label">Scene {i + 1}</div>
                                    <div className="scene-prompt">{scene}</div>
                                    <div className={`scene-status status-${status === "generating" ? "gen" : status}`}>
                                      {status === "pending" ? "· Queued" : status === "generating" ? "⟳ Generating via Replicate..." : "✓ Rendered"}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* VIDEO PREVIEW */}
                      {generationStep >= 3 && (
                        <div className="video-box">
                          <div className="video-placeholder">
                            {generationStep === 4 ? (
                              <>
                                <div style={{fontSize:'42px'}}>🎥</div>
                                <div style={{color:'var(--accent3)', fontFamily:'var(--font-head)', fontSize:'14px', fontWeight:700}}>Video Ready!</div>
                                <div style={{fontSize:'12px', color:'var(--muted)'}}>In production: assembled via FFmpeg + uploaded</div>
                                <button style={{
                                  padding:'10px 24px', borderRadius:'8px', border:'none',
                                  background:'linear-gradient(135deg,var(--accent3),#44b8a0)',
                                  color:'#080810', fontFamily:'var(--font-head)', fontWeight:700,
                                  fontSize:'13px', cursor:'pointer'
                                }}>⬇ Download MP4</button>
                              </>
                            ) : (
                              <>
                                <div className="video-placeholder-icon">▶</div>
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
            </>
          )}

          {hasPaid && activeTab === "history" && (
            <div className="panel">
              <div className="panel-header"><div className="panel-title">📁 Generation History</div></div>
              <div className="empty-output">
                <div className="empty-icon">📂</div>
                <div className="empty-text">Your generated videos will appear here. Start generating in the Studio tab.</div>
              </div>
            </div>
          )}

          {hasPaid && activeTab === "settings" && (
            <div className="panel">
              <div className="panel-header"><div className="panel-title">⚙️ API Configuration</div></div>
              <div className="panel-body">
                <div className="field">
                  <label className="label">Replicate API Key</label>
                  <input type="password" placeholder="r8_••••••••••••••••••••••••••••••" />
                </div>
                <div className="field">
                  <label className="label">Anthropic API Key</label>
                  <input type="password" placeholder="sk-ant-••••••••••••••••••••••••••••" />
                </div>
                <div className="field">
                  <label className="label">Default Video Model</label>
                  <select>
                    <option>Wan 2.2 T2V (Best quality)</option>
                    <option>Wan 2.2 I2V (Image-to-video)</option>
                    <option>LTX-Video (Fastest)</option>
                    <option>CogVideoX-5B (Efficient)</option>
                  </select>
                </div>
                <div className="field">
                  <label className="label">Default TTS Engine</label>
                  <select>
                    <option>ElevenLabs (Premium)</option>
                    <option>OpenAI TTS</option>
                    <option>Kokoro (Free / Open Source)</option>
                  </select>
                </div>
                <button className="btn-generate" style={{marginTop:8}}>Save Settings</button>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
