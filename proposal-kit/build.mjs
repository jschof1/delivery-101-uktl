#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

const safeId = (value = '') => String(value).replace(/[^a-z0-9]/gi, '').slice(0, 32);
const externalLinkAttrs = (href = '') => /^https?:\/\//i.test(String(href)) ? ' target="_blank" rel="noreferrer"' : '';

const requiredPaths = [
  'meta.title',
  'meta.description',
  'brand.name',
  'client.name',
  'client.contactName',
  'announcement',
  'hero',
  'review',
  'video',
  'roadmap',
  'system',
  'ownership',
  'pipeline',
  'offer',
  'faq',
  'final'
];

function getPath(object, dottedPath) {
  return dottedPath.split('.').reduce((value, key) => value?.[key], object);
}

function validateConfig(config) {
  const missing = requiredPaths.filter((key) => {
    const value = getPath(config, key);
    return value === undefined || value === null || value === '';
  });
  if (missing.length) throw new Error(`Missing required proposal fields: ${missing.join(', ')}`);
  if (!Array.isArray(config.roadmap) || !config.roadmap.length) throw new Error('proposal.roadmap must contain at least one stage');
  if (!Array.isArray(config.system.layers) || !config.system.layers.length) throw new Error('proposal.system.layers must contain at least one layer');
  if (!Array.isArray(config.pipeline.stages) || !config.pipeline.stages.length) throw new Error('proposal.pipeline.stages must contain at least one stage');
  if (!Array.isArray(config.faq)) throw new Error('proposal.faq must be an array');
  if (!Array.isArray(config.offer.items)) throw new Error('proposal.offer.items must be an array');
  if (!Array.isArray(config.examples)) throw new Error('proposal.examples must be an array');
  for (const [index, example] of config.examples.entries()) {
    for (const field of ['name', 'title', 'description', 'url', 'image']) {
      if (!example?.[field]) throw new Error(`proposal.examples[${index}].${field} is required`);
    }
  }
}

function renderSignals(signals = []) {
  return signals.map((signal, index) => `
        <div class="signal"><span class="signal-icon">${escapeHtml(signal.icon || String(index + 1).padStart(2, '0'))}</span><span><strong>${escapeHtml(signal.title)}</strong><span>${escapeHtml(signal.detail)}</span></span></div>`).join('');
}

function renderReviewCards(cards = []) {
  return cards.map((card, index) => `
          <article class="review-card reveal"><span class="card-index">${escapeHtml(card.index || `${String(index + 1).padStart(2, '0')} / PRIORITY`)}</span><h3>${escapeHtml(card.title)}</h3><p>${escapeHtml(card.body)}</p></article>`).join('');
}

function renderRoadmap(items = []) {
  return items.map((item, index) => `
          <article class="roadmap-item reveal"><div class="roadmap-number">${escapeHtml(item.number || String(index + 1).padStart(2, '0'))}</div><div><h3><span>${escapeHtml(item.phase)}</span>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.body)}</p></div><div class="roadmap-result"><strong>${escapeHtml(item.resultLabel || 'Business signal')}</strong>${escapeHtml(item.result)}</div></article>`).join('');
}

function renderSystemLayers(layers = []) {
  return layers.map((layer, index) => `
          <article class="feature-card reveal"><div class="feature-icon">${escapeHtml(layer.icon || String(index + 1).padStart(2, '0'))}</div><h3>${escapeHtml(layer.title)}</h3><p>${escapeHtml(layer.body)}</p><ul>${(layer.bullets || []).map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join('')}</ul></article>`).join('');
}

function renderExamples(examples = [], clientName) {
  if (!examples.length) return '<p class="empty-proof">Add verified live examples here when they are available. Do not publish unverified work as proof.</p>';
  return examples.map((example) => `
          <a class="example-card reveal" href="${escapeHtml(example.url)}" target="_blank" rel="noreferrer" aria-label="View the ${escapeHtml(example.name)} live website">
            <div class="example-image"><img src="${escapeHtml(example.image)}" alt="${escapeHtml(example.alt || `Screenshot of the ${example.name} website`)}"></div>
            <div class="example-body"><p class="example-tag">${escapeHtml(example.name)}</p><h3>${escapeHtml(example.title)}</h3><p>${escapeHtml(example.description)}</p><span class="example-link">View live site <span aria-hidden="true">↗</span></span></div>
          </a>`).join('');
}

function renderPipeline(stages = []) {
  return stages.map((stage, index) => `
          <div class="pipeline-step reveal"><div class="pipeline-card"><small>${escapeHtml(stage.label || `${String(index + 1).padStart(2, '0')} / Stage`)}</small><strong>${escapeHtml(stage.title)}</strong><span>${escapeHtml(stage.detail)}</span></div></div>`).join('');
}

function renderFaq(items = []) {
  return items.map((item) => `<details class="reveal"><summary>${escapeHtml(item.question)}</summary><p>${escapeHtml(item.answer)}</p></details>`).join('');
}

const style = String.raw`
    :root {
      --bg: #1a1a1a;
      --bg-deep: #151515;
      --card: #242424;
      --card-raised: #2b2b2b;
      --ink: #ffffff;
      --muted: #d1d5db;
      --soft: #f1f3f5;
      --accent: #fbc02d;
      --accent-hover: #e0a800;
      --line: #3a3a3a;
      --line-soft: rgba(255,255,255,0.13);
      --green: #a8d5a2;
      --max: 1000px;
      --radius: 12px;
      --font: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }

    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body { margin: 0; background: var(--bg); color: var(--ink); font-family: var(--font); line-height: 1.5; -webkit-font-smoothing: antialiased; }
    ::selection { background: var(--accent); color: #000; }
    a { color: inherit; text-decoration: none; }
    img, svg { max-width: 100%; }
    .wrap { width: min(calc(100% - 40px), var(--max)); margin: 0 auto; }

    .announcement { background: var(--accent); color: #000; font-size: 0.78rem; font-weight: 850; letter-spacing: 0.07em; padding: 10px 16px; text-align: center; text-transform: uppercase; }
    .site-header { padding: 34px 0 0; text-align: center; }
    .brand { align-items: center; display: inline-flex; gap: 11px; }
    .brand-mark { align-items: center; background: var(--accent); border-radius: 5px; color: #000; display: inline-flex; font-size: 1.1rem; font-weight: 900; height: 36px; justify-content: center; width: 36px; }
    .brand-copy { font-size: 1.45rem; font-weight: 800; letter-spacing: -0.04em; }
    .brand-copy small { color: var(--muted); display: block; font-size: 0.62rem; font-weight: 650; letter-spacing: 0.12em; margin-top: 2px; text-transform: uppercase; }
    .brand-context { color: var(--muted); font-size: 0.8rem; margin: 13px 0 0; }
    .nav { align-items: center; border-bottom: 2px solid var(--line); display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; margin-top: 27px; padding-bottom: 20px; }
    .nav a { background: var(--card); border: 1px solid #444; border-radius: 8px; color: var(--ink); font-size: 0.87rem; font-weight: 750; padding: 10px 16px; transition: border-color 160ms ease, color 160ms ease, transform 160ms ease, background 160ms ease; }
    .nav a:hover { border-color: var(--accent); color: var(--accent); transform: translateY(-1px); }
    .nav a.nav-cta { background: var(--accent); border-color: var(--accent); color: #000; }
    .nav a.nav-cta:hover { background: var(--accent-hover); border-color: var(--accent-hover); color: #000; }

    section { border-top: 1px solid var(--line-soft); padding: 82px 0; }
    .hero { border-top: 0; padding: 68px 0 76px; }
    .hero-grid { align-items: center; display: grid; gap: 42px; grid-template-columns: minmax(0, 1.08fr) minmax(310px, 0.92fr); }
    .eyebrow, .section-kicker { color: var(--accent); font-size: 0.72rem; font-weight: 850; letter-spacing: 0.14em; margin: 0 0 16px; text-transform: uppercase; }
    .client-intro { align-items: center; display: flex; gap: 15px; margin-bottom: 19px; }
    .client-intro .eyebrow { margin: 0 0 5px; }
    .client-logo { align-items: center; background: #050505; border: 1px solid #464646; border-radius: 10px; display: flex; flex: 0 0 auto; height: 78px; justify-content: center; overflow: hidden; padding: 5px; width: 82px; }
    .client-logo img { display: block; height: 100%; object-fit: contain; width: 100%; }
    .client-name { color: var(--ink); display: block; font-size: 0.82rem; font-weight: 800; letter-spacing: 0.02em; }
    h1, h2, h3, p { margin-top: 0; }
    h1 { font-size: clamp(2.7rem, 5.6vw, 4.8rem); font-weight: 800; letter-spacing: -0.065em; line-height: 0.99; margin-bottom: 22px; max-width: 690px; }
    h1 em { color: var(--accent); font-style: normal; }
    .hero-copy { color: var(--muted); font-size: 1.08rem; max-width: 610px; }
    .button-row { align-items: center; display: flex; flex-wrap: wrap; gap: 12px; margin-top: 28px; }
    .button { align-items: center; border: 1px solid transparent; border-radius: 8px; display: inline-flex; font-size: 0.88rem; font-weight: 800; gap: 8px; justify-content: center; padding: 13px 18px; transition: background 160ms ease, border-color 160ms ease, color 160ms ease, transform 160ms ease; }
    .button:hover { transform: translateY(-1px); }
    .button-primary { background: var(--accent); color: #000; }
    .button-primary:hover { background: var(--accent-hover); }
    .button-quiet { background: var(--card); border-color: #444; color: var(--ink); }
    .button-quiet:hover { border-color: var(--accent); color: var(--accent); }
    .hero-note { color: var(--muted); font-size: 0.8rem; margin: 17px 0 0; }
    .hero-panel { background: var(--card); border: 1px solid #454545; border-left: 4px solid var(--accent); border-radius: var(--radius); padding: 26px; }
    .panel-label { color: var(--muted); font-size: 0.74rem; font-weight: 850; letter-spacing: 0.14em; text-transform: uppercase; }
    .panel-title { font-size: 1.45rem; letter-spacing: -0.035em; line-height: 1.1; margin: 11px 0 19px; }
    .status-line { align-items: center; color: var(--green); display: flex; font-size: 0.78rem; font-weight: 750; gap: 9px; margin-bottom: 16px; }
    .status-dot { background: var(--green); border-radius: 50%; height: 8px; width: 8px; }
    .mini-pipeline { display: grid; gap: 8px; }
    .mini-stage { align-items: center; background: var(--bg); border: 1px solid var(--line); border-radius: 8px; display: flex; gap: 10px; padding: 11px 12px; }
    .mini-stage:nth-child(2) { margin-left: 12px; }
    .mini-stage:nth-child(3) { margin-left: 24px; }
    .mini-stage:nth-child(4) { margin-left: 36px; }
    .stage-number { align-items: center; background: var(--accent); border-radius: 5px; color: #000; display: flex; flex: 0 0 auto; font-size: 0.66rem; font-weight: 900; height: 25px; justify-content: center; width: 25px; }
    .stage-copy strong { display: block; font-size: 0.81rem; }
    .stage-copy small { color: var(--muted); display: block; font-size: 0.68rem; margin-top: 1px; }
    .panel-foot { border-top: 1px solid var(--line); color: var(--muted); font-size: 0.76rem; margin: 20px 0 0; padding-top: 15px; }
    .panel-foot strong { color: var(--accent); }

    .signal-strip { border-bottom: 1px solid var(--line); border-top: 1px solid var(--line); padding: 17px 0; }
    .signal-grid { display: grid; gap: 17px; grid-template-columns: repeat(3, 1fr); }
    .signal { align-items: center; display: flex; gap: 10px; }
    .signal-icon { align-items: center; background: var(--accent); border-radius: 5px; color: #000; display: flex; flex: 0 0 auto; font-size: 0.65rem; font-weight: 900; height: 28px; justify-content: center; width: 28px; }
    .signal strong { display: block; font-size: 0.82rem; }
    .signal span span { color: var(--muted); display: block; font-size: 0.71rem; }

    .section-heading { border-bottom: 1px solid var(--line); color: var(--accent); font-size: clamp(1.85rem, 4vw, 3rem); font-weight: 800; letter-spacing: -0.055em; line-height: 1.05; margin-bottom: 18px; padding-bottom: 11px; }
    .section-intro { color: var(--muted); font-size: 1rem; max-width: 680px; }
    .section-header { margin-bottom: 42px; }
    .review-section, .ownership-section, .faq { background: var(--bg-deep); }
    .review-grid { display: grid; gap: 15px; grid-template-columns: repeat(3, 1fr); margin-top: 38px; }
    .review-card { background: var(--card); border: 1px solid var(--line); border-left: 4px solid var(--accent); border-radius: var(--radius); padding: 23px; }
    .card-index { color: var(--accent); font-size: 0.72rem; font-weight: 850; letter-spacing: 0.12em; }
    .review-card h3 { font-size: 1.08rem; letter-spacing: -0.025em; margin: 24px 0 9px; }
    .review-card p { color: var(--muted); font-size: 0.84rem; margin-bottom: 0; }
    .quote-callout { border: 1px solid var(--line); border-left: 4px solid var(--accent); border-radius: 8px; margin-top: 30px; padding: 16px 18px; }
    .quote-callout p { color: var(--soft); font-size: 0.92rem; margin-bottom: 0; }

    .video-layout { align-items: center; display: grid; gap: 38px; grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr); }
    .video-copy p { color: var(--muted); max-width: 480px; }
    .video-note { border-top: 1px solid var(--line); color: var(--soft); display: flex; font-size: 0.8rem; gap: 10px; margin-top: 22px; padding-top: 14px; }
    .video-note b { color: var(--accent); font-size: 0.72rem; }
    .video-frame { background: #0b0b0b; border: 1px solid var(--line); border-radius: var(--radius); overflow: hidden; }
    .video-frame wistia-player { display: block; width: 100%; }

    .roadmap-list { border-top: 1px solid var(--line); margin-top: 40px; }
    .roadmap-item { align-items: start; border-bottom: 1px solid var(--line); display: grid; gap: 24px; grid-template-columns: 75px minmax(200px, 0.8fr) minmax(0, 1.2fr); padding: 25px 0; }
    .roadmap-number { color: var(--accent); font-size: 0.75rem; font-weight: 900; letter-spacing: 0.1em; padding-top: 4px; }
    .roadmap-item h3 { font-size: 1.17rem; letter-spacing: -0.035em; margin-bottom: 7px; }
    .roadmap-item h3 span { color: var(--accent); display: block; font-size: 0.66rem; letter-spacing: 0.11em; margin-bottom: 6px; text-transform: uppercase; }
    .roadmap-item p, .roadmap-result { color: var(--muted); font-size: 0.83rem; margin: 0; }
    .roadmap-result { border-left: 1px solid var(--line); padding-left: 20px; }
    .roadmap-result strong { color: var(--ink); display: block; font-size: 0.68rem; letter-spacing: 0.09em; margin-bottom: 6px; text-transform: uppercase; }

    .system-grid { display: grid; gap: 15px; grid-template-columns: repeat(3, 1fr); margin-top: 40px; }
    .feature-card { background: var(--card); border: 1px solid var(--line); border-left: 4px solid var(--accent); border-radius: var(--radius); min-height: 255px; padding: 23px; }
    .feature-icon { align-items: center; background: var(--accent); border-radius: 5px; color: #000; display: flex; font-size: 0.72rem; font-weight: 900; height: 30px; justify-content: center; margin-bottom: 27px; width: 30px; }
    .feature-card h3 { font-size: 1.08rem; letter-spacing: -0.025em; margin-bottom: 8px; }
    .feature-card p { color: var(--muted); font-size: 0.82rem; margin-bottom: 16px; }
    .feature-card ul { color: var(--soft); font-size: 0.76rem; list-style: none; margin: 0; padding: 0; }
    .feature-card li { border-top: 1px solid var(--line); padding: 7px 0; }
    .feature-card li::before { color: var(--accent); content: "+"; font-weight: 900; margin-right: 7px; }

    .examples-grid { display: grid; gap: 15px; grid-template-columns: repeat(3, minmax(0, 1fr)); margin-top: 40px; }
    .example-card { background: var(--card); border: 1px solid var(--line); border-radius: var(--radius); overflow: hidden; transition: border-color 160ms ease, transform 160ms ease; }
    .example-card:hover { border-color: var(--accent); transform: translateY(-2px); }
    .example-card:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
    .example-image { aspect-ratio: 16 / 10; background: #0e0e0e; overflow: hidden; }
    .example-image img { display: block; height: 100%; object-fit: cover; width: 100%; }
    .example-body { padding: 16px 17px 18px; }
    .example-tag { color: var(--accent); font-size: 0.63rem; font-weight: 850; letter-spacing: 0.11em; margin-bottom: 7px; text-transform: uppercase; }
    .example-card h3 { font-size: 0.95rem; letter-spacing: -0.025em; margin-bottom: 7px; }
    .example-card p:not(.example-tag) { color: var(--muted); font-size: 0.75rem; margin-bottom: 10px; }
    .example-link { color: var(--soft); font-size: 0.72rem; font-weight: 800; }
    .example-link span { color: var(--accent); margin-left: 4px; }
    .examples-footnote, .empty-proof { color: var(--muted); font-size: 0.78rem; margin: 21px 0 0; }

    .ownership-layout, .commercial-layout { align-items: center; display: grid; gap: 42px; grid-template-columns: minmax(0, 0.9fr) minmax(320px, 1.1fr); }
    .ownership-copy p, .commercial-copy p { color: var(--muted); max-width: 520px; }
    .ownership-box, .price-card { background: var(--card); border: 1px solid var(--line); border-left: 4px solid var(--accent); border-radius: var(--radius); padding: 25px; }
    .ownership-box h3 { font-size: 1.15rem; margin-bottom: 17px; }
    .ownership-list, .price-list { list-style: none; margin: 0; padding: 0; }
    .ownership-list li, .price-list li { border-top: 1px solid var(--line); font-size: 0.82rem; padding: 10px 0; }
    .ownership-list li::before { color: var(--green); content: "✓"; font-weight: 900; margin-right: 9px; }
    .ownership-footnote, .guarantee { color: var(--muted); font-size: 0.76rem; margin: 17px 0 0; }

    .pipeline-head { align-items: end; display: flex; gap: 25px; justify-content: space-between; }
    .pipeline-head .section-intro { max-width: 390px; }
    .pipeline { display: grid; gap: 8px; grid-template-columns: repeat(7, 1fr); margin-top: 40px; }
    .pipeline-step { min-width: 0; position: relative; }
    .pipeline-step:not(:last-child)::after { color: var(--accent); content: "→"; font-size: 1rem; position: absolute; right: -7px; top: 17px; z-index: 2; }
    .pipeline-card { background: var(--card-raised); border: 1px solid var(--line); border-radius: 8px; min-height: 112px; padding: 13px 10px; }
    .pipeline-card small { color: var(--accent); display: block; font-size: 0.65rem; font-weight: 850; letter-spacing: 0.06em; margin-bottom: 15px; text-transform: uppercase; }
    .pipeline-card strong { display: block; font-size: 0.76rem; line-height: 1.16; }
    .pipeline-card span { color: var(--muted); display: block; font-size: 0.7rem; line-height: 1.28; margin-top: 6px; }
    .pipeline-caption { color: var(--muted); font-size: 0.8rem; margin: 17px 0 0; }

    .price { color: var(--accent); font-size: clamp(2.8rem, 5vw, 4rem); font-weight: 850; letter-spacing: -0.07em; line-height: 1; margin: 14px 0 4px; }
    .price small { color: var(--muted); font-size: 0.85rem; font-weight: 600; letter-spacing: 0; }
    .price-detail { color: var(--muted); font-size: 0.84rem; }
    .price-list { margin: 21px 0 23px; }
    .faq-grid { display: grid; gap: 15px; grid-template-columns: 1fr 1fr; }
    .faq details { background: var(--card); border: 1px solid var(--line); border-radius: 8px; margin-bottom: 10px; padding: 16px 18px; }
    .faq summary { color: var(--ink); cursor: pointer; font-size: 0.85rem; font-weight: 750; list-style: none; padding-right: 24px; position: relative; }
    .faq summary::-webkit-details-marker { display: none; }
    .faq summary::after { color: var(--accent); content: "+"; font-size: 1.1rem; position: absolute; right: 0; top: -4px; }
    .faq details[open] summary::after { content: "−"; }
    .faq details p { color: var(--muted); font-size: 0.8rem; margin: 11px 0 0; }
    .final-cta { background: var(--bg-deep); padding: 90px 0 105px; text-align: center; }
    .final-cta .section-heading { margin-left: auto; margin-right: auto; max-width: 710px; }
    .final-cta p { color: var(--muted); margin-left: auto; margin-right: auto; max-width: 580px; }
    .final-cta .button-row { justify-content: center; }
    footer { border-top: 1px solid var(--line); color: var(--muted); font-size: 0.76rem; padding: 20px 0 25px; }
    .footer-row { align-items: center; display: flex; justify-content: space-between; }
    .footer-row a { color: var(--accent); }

    .reveal { opacity: 1; transform: none; transition: opacity 500ms ease, transform 500ms ease; }
    .js-ready .reveal { opacity: 1; transform: translateY(10px); }
    .js-ready .reveal.is-visible { opacity: 1; transform: none; }
    @media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } .reveal { opacity: 1; transform: none; transition: none; } .button, .nav a, .example-card { transition: none; } }
    @media (max-width: 900px) {
      .hero-grid, .video-layout, .ownership-layout, .commercial-layout { gap: 30px; grid-template-columns: 1fr; }
      .hero-panel { max-width: 600px; }
      .system-grid, .examples-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .pipeline { grid-template-columns: repeat(4, 1fr); row-gap: 15px; }
      .pipeline-step:not(:last-child)::after { display: none; }
      .pipeline-step:nth-child(4) { grid-column: 1; }
      .pipeline-step:nth-child(5) { grid-column: 2; }
      .pipeline-step:nth-child(6) { grid-column: 3; }
      .pipeline-step:nth-child(7) { grid-column: 4; }
    }
    @media (max-width: 680px) {
      .wrap { width: min(calc(100% - 28px), var(--max)); }
      .announcement { font-size: 0.62rem; letter-spacing: 0.05em; }
      .site-header { padding-top: 25px; }
      .nav { gap: 8px; margin-top: 22px; padding-bottom: 16px; }
      .nav a { font-size: 0.72rem; padding: 8px 10px; }
      .nav a:not(.nav-cta) { display: none; }
      section { padding: 66px 0; }
      .hero { padding: 53px 0 62px; }
      h1 { font-size: clamp(2.65rem, 14vw, 4.5rem); }
      .client-logo { height: 68px; width: 72px; }
      .client-name { font-size: 0.76rem; }
      .signal-grid, .review-grid, .system-grid, .examples-grid, .faq-grid { grid-template-columns: 1fr; }
      .signal-grid { gap: 13px; }
      .section-header { margin-bottom: 32px; }
      .section-heading { font-size: clamp(1.9rem, 10vw, 3rem); }
      .roadmap-list { margin-top: 30px; }
      .roadmap-item { gap: 11px; grid-template-columns: 42px 1fr; padding: 22px 0; }
      .roadmap-result { border-left: 0; border-top: 1px solid var(--line); grid-column: 2; padding: 13px 0 0; }
      .pipeline-head { align-items: start; flex-direction: column; gap: 14px; }
      .pipeline { gap: 7px; grid-template-columns: repeat(2, 1fr); margin-top: 28px; }
      .pipeline-step:nth-child(4), .pipeline-step:nth-child(5), .pipeline-step:nth-child(6), .pipeline-step:nth-child(7) { grid-column: auto; }
      .pipeline-card { min-height: 105px; }
      .footer-row { align-items: flex-start; flex-direction: column; gap: 7px; }
    }
`;

function renderProposal(config) {
  validateConfig(config);
  const videoId = safeId(config.video.wistiaId || '');
  const canonical = config.meta.canonical || '';
  const title = config.meta.title;
  const description = config.meta.description;
  const socialImage = config.meta.image || '';
  const clientName = config.client.name;
  const videoScripts = videoId ? `
  <script src="https://fast.wistia.com/player.js" async></script>
  <script src="https://fast.wistia.com/embed/${videoId}.js" async type="module"></script>` : '';
  const videoFallbackStyle = videoId ? `<style>wistia-player[media-id='${videoId}']:not(:defined) { background: center / contain no-repeat url('https://fast.wistia.com/embed/medias/${videoId}/swatch'); display: block; filter: blur(5px); padding-top: 56.25%; }</style>` : '';
  const videoPlayer = videoId ? `<wistia-player media-id="${videoId}" aspect="1.7777777777777777"></wistia-player>` : '<div class="empty-proof">Add the walkthrough video when it is ready.</div>';

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="theme-color" content="#1a1a1a">
  <meta name="robots" content="noindex, nofollow">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:site_name" content="${escapeHtml(config.brand.name)}">
  ${canonical ? `<meta property="og:url" content="${escapeHtml(canonical)}">` : ''}
  ${socialImage ? `<meta property="og:image" content="${escapeHtml(socialImage)}">` : ''}
  <meta name="twitter:card" content="${socialImage ? 'summary_large_image' : 'summary'}">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  ${socialImage ? `<meta name="twitter:image" content="${escapeHtml(socialImage)}">` : ''}
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='10' fill='%23fbc02d'/%3E%3Cpath d='M19 17v18c0 9 5 14 13 14s13-5 13-14V17h-8v18c0 4-2 6-5 6s-5-2-5-6V17z' fill='%231a1a1a'/%3E%3C/svg%3E">
  ${canonical ? `<link rel="canonical" href="${escapeHtml(canonical)}">` : ''}
  <title>${escapeHtml(config.meta.title)}</title>${videoScripts}${videoFallbackStyle}
  <style>${style}</style>
</head>
<body>
  <div class="announcement">${escapeHtml(config.announcement)}</div>
  <header class="wrap site-header">
    <a class="brand" href="#top" aria-label="${escapeHtml(clientName)} proposal home">
      <span class="brand-mark">${escapeHtml(config.brand.mark || clientName.slice(0, 1))}</span>
      <span class="brand-copy">${escapeHtml(config.brand.name)}<small>${escapeHtml(config.brand.subline || 'Client proposal system')}</small></span>
    </a>
    <p class="brand-context">Prepared for ${escapeHtml(config.client.contactName)} at ${escapeHtml(config.client.legalName || clientName)}</p>
    <nav class="nav" aria-label="Main navigation">
      <a href="#plan">The plan</a>
      <a href="#system">The system</a>
      <a href="#examples">Examples</a>
      <a href="#ownership">Ownership</a>
      <a class="nav-cta" href="#next-step">${escapeHtml(config.navCta || 'See the next step')}</a>
    </nav>
  </header>

  <main id="top">
    <section class="hero">
      <div class="wrap hero-grid">
        <div class="reveal">
          <div class="client-intro">
            ${config.client.logo ? `<span class="client-logo"><img src="${escapeHtml(config.client.logo)}" alt="${escapeHtml(config.client.logoAlt || `${clientName} logo`)}"></span>` : ''}
            <span><span class="eyebrow">${escapeHtml(config.hero.eyebrow)}</span><span class="client-name">${escapeHtml(clientName)}</span></span>
          </div>
          <h1>${escapeHtml(config.hero.titleBefore)} <em>${escapeHtml(config.hero.titleAccent)}</em></h1>
          <p class="hero-copy">${escapeHtml(config.hero.body)}</p>
          <div class="button-row">
            <a class="button button-primary" href="${escapeHtml(config.hero.primaryHref || '#plan')}">${escapeHtml(config.hero.primaryLabel || 'See the plan')} <span aria-hidden="true">↓</span></a>
            <a class="button button-quiet" href="${escapeHtml(config.hero.secondaryHref || '#video')}">${escapeHtml(config.hero.secondaryLabel || 'Watch the walkthrough')} <span aria-hidden="true">↗</span></a>
          </div>
          <p class="hero-note">${escapeHtml(config.hero.note)}</p>
        </div>
        <div class="hero-panel reveal">
          <p class="panel-label">${escapeHtml(config.hero.panelLabel)}</p>
          <h2 class="panel-title">${escapeHtml(config.hero.panelTitle)}</h2>
          <div class="status-line"><span class="status-dot"></span><span>${escapeHtml(config.hero.panelStatus)}</span></div>
          <div class="mini-pipeline" aria-label="Example job pipeline">
            ${(config.hero.panelItems || []).map((item, index) => `<div class="mini-stage"><span class="stage-number">${String(index + 1).padStart(2, '0')}</span><span class="stage-copy"><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.detail)}</small></span></div>`).join('')}
          </div>
          <p class="panel-foot"><strong>${escapeHtml(config.hero.panelFootLabel || 'First priority:')}</strong> ${escapeHtml(config.hero.panelFoot)}</p>
        </div>
      </div>
    </section>

    <div class="signal-strip">
      <div class="wrap signal-grid">${renderSignals(config.signals)}</div>
    </div>

    <section class="review-section">
      <div class="wrap">
        <div class="section-header reveal">
          <p class="section-kicker">${escapeHtml(config.review.kicker)}</p>
          <h2 class="section-heading">${escapeHtml(config.review.title)}</h2>
          <p class="section-intro">${escapeHtml(config.review.intro)}</p>
        </div>
        <div class="review-grid">${renderReviewCards(config.review.cards)}</div>
        <div class="quote-callout reveal"><p>${escapeHtml(config.review.callout)}</p></div>
      </div>
    </section>

    <section class="video-section" id="video">
      <div class="wrap video-layout">
        <div class="video-copy reveal">
          <p class="section-kicker">${escapeHtml(config.video.kicker)}</p>
          <h2 class="section-heading">${escapeHtml(config.video.title)}</h2>
          <p>${escapeHtml(config.video.body)}</p>
          <div class="video-note"><b>${escapeHtml(config.video.noteLabel || 'WATCH FOR')}</b><span>${escapeHtml(config.video.note)}</span></div>
        </div>
        <div class="video-frame reveal">${videoPlayer}</div>
      </div>
    </section>

    <section class="roadmap" id="plan">
      <div class="wrap">
        <div class="section-header reveal">
          <p class="section-kicker">${escapeHtml(config.roadmapKicker || 'The client growth plan')}</p>
          <h2 class="section-heading">${escapeHtml(config.roadmapTitle || 'A sensible order of operations.')}</h2>
          <p class="section-intro">${escapeHtml(config.roadmapIntro || '')}</p>
        </div>
        <div class="roadmap-list">${renderRoadmap(config.roadmap)}</div>
      </div>
    </section>

    <section class="system-section" id="system">
      <div class="wrap">
        <div class="section-header reveal">
          <p class="section-kicker">${escapeHtml(config.system.kicker)}</p>
          <h2 class="section-heading">${escapeHtml(config.system.title)}</h2>
          <p class="section-intro">${escapeHtml(config.system.intro)}</p>
        </div>
        <div class="system-grid">${renderSystemLayers(config.system.layers)}</div>
      </div>
    </section>

    <section class="examples-section" id="examples">
      <div class="wrap">
        <div class="section-header reveal">
          <p class="section-kicker">${escapeHtml(config.examplesKicker || 'Live client examples')}</p>
          <h2 class="section-heading">${escapeHtml(config.examplesTitle || 'The standard we can bring to your business.')}</h2>
          <p class="section-intro">${escapeHtml(config.examplesIntro || 'Use verified live examples as proof. Keep the description factual and link to the source.')}</p>
        </div>
        <div class="examples-grid">${renderExamples(config.examples || [], clientName)}</div>
        <p class="examples-footnote reveal">${escapeHtml(config.examplesFootnote || 'Only include work that has been verified as live or clearly label it as a private review build.')}</p>
      </div>
    </section>

    <section class="ownership-section" id="ownership">
      <div class="wrap ownership-layout">
        <div class="ownership-copy reveal">
          <p class="section-kicker">${escapeHtml(config.ownership.kicker)}</p>
          <h2 class="section-heading">${escapeHtml(config.ownership.title)}</h2>
          ${(config.ownership.body || []).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}
        </div>
        <div class="ownership-box reveal">
          <h3>${escapeHtml(config.ownership.boxTitle || 'What remains yours')}</h3>
          <ul class="ownership-list">${(config.ownership.items || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
          <p class="ownership-footnote">${escapeHtml(config.ownership.footnote || '')}</p>
        </div>
      </div>
    </section>

    <section class="pipeline-section">
      <div class="wrap">
        <div class="pipeline-head reveal">
          <div><p class="section-kicker">${escapeHtml(config.pipeline.kicker)}</p><h2 class="section-heading">${escapeHtml(config.pipeline.title)}</h2></div>
          <p class="section-intro">${escapeHtml(config.pipeline.intro)}</p>
        </div>
        <div class="pipeline" aria-label="${escapeHtml(clientName)} job pipeline stages">${renderPipeline(config.pipeline.stages)}</div>
        <p class="pipeline-caption reveal">${escapeHtml(config.pipeline.caption)}</p>
      </div>
    </section>

    <section class="commercial" id="next-step">
      <div class="wrap commercial-layout">
        <div class="commercial-copy reveal">
          <p class="section-kicker">${escapeHtml(config.offer.kicker)}</p>
          <h2 class="section-heading">${escapeHtml(config.offer.title)}</h2>
          ${(config.offer.body || []).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}
        </div>
        <aside class="price-card reveal">
          <p class="panel-label">${escapeHtml(config.offer.label || `${clientName} system`)}</p>
          <div class="price">${escapeHtml(config.offer.price)} <small>${escapeHtml(config.offer.period || '/ month')}</small></div>
          <p class="price-detail">${escapeHtml(config.offer.detail)}</p>
          <ul class="price-list">${config.offer.items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
          <a class="button button-primary" href="${escapeHtml(config.offer.ctaHref || '#contact')}"${externalLinkAttrs(config.offer.ctaHref || '#contact')}>${escapeHtml(config.offer.ctaLabel || 'Talk through the setup')} <span aria-hidden="true">↗</span></a>
          <p class="guarantee">${escapeHtml(config.offer.guarantee || '')}</p>
        </aside>
      </div>
    </section>

    <section class="faq" id="contact">
      <div class="wrap">
        <div class="section-header reveal"><p class="section-kicker">${escapeHtml(config.faqKicker || 'Clear answers')}</p><h2 class="section-heading">${escapeHtml(config.faqTitle || 'The important bits, plainly.')}</h2></div>
        <div class="faq-grid"><div>${renderFaq(config.faq.slice(0, Math.ceil(config.faq.length / 2)))}</div><div>${renderFaq(config.faq.slice(Math.ceil(config.faq.length / 2)))}</div></div>
      </div>
    </section>

    <section class="final-cta">
      <div class="wrap reveal">
        <p class="section-kicker">${escapeHtml(config.final.kicker)}</p>
        <h2 class="section-heading">${escapeHtml(config.final.title)}</h2>
        <p>${escapeHtml(config.final.body)}</p>
        <div class="button-row"><a class="button button-primary" href="${escapeHtml(config.final.primaryHref || '#next-step')}"${externalLinkAttrs(config.final.primaryHref || '#next-step')}>${escapeHtml(config.final.primaryLabel || 'Start the conversation')} <span aria-hidden="true">↗</span></a><a class="button button-quiet" href="#top">Back to the top</a></div>
      </div>
    </section>
  </main>

  <footer>
    <div class="wrap footer-row"><span>${escapeHtml(config.footer || `A personalised proposal for ${clientName}.`)}</span><a href="${escapeHtml(config.brand.url || 'https://delivery101.uktradeleads.com/') }" target="_blank" rel="noreferrer">${escapeHtml(config.brand.name)}</a></div>
  </footer>

  <script>
    const revealItems = document.querySelectorAll('.reveal');
    const revealAll = () => revealItems.forEach((item) => item.classList.add('is-visible'));
    document.documentElement.classList.add('js-ready');
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries, instance) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            instance.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });
      revealItems.forEach((item) => observer.observe(item));
    } else {
      revealAll();
    }
    setTimeout(revealAll, 1800);
  </script>
</body>
</html>
`;
}

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index].startsWith('--')) args[argv[index].slice(2)] = argv[index + 1];
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
if (!args.config || !args.out) {
  console.error('Usage: node proposal-kit/build.mjs --config path/to/client.json --out output-directory');
  process.exit(1);
}

const configPath = path.resolve(process.cwd(), args.config);
const outputDir = path.resolve(process.cwd(), args.out);
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const output = renderProposal(config);
fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(path.join(outputDir, 'index.html'), output);
console.log(`Built ${path.join(outputDir, 'index.html')} from ${configPath}`);
