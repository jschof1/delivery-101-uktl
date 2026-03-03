# Interactive Demo Tab Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a third "See It In Action" tab to `index.html` with a global page switcher and three side-by-side iframes showing live client sites.

**Architecture:** Pure HTML/CSS/JS added to the existing single-file `index.html`. A `setPage(path)` function updates all three iframe `src` attributes and the URL text in each fake browser bar simultaneously. No external dependencies.

**Tech Stack:** Vanilla HTML, CSS, JavaScript — single file modification.

---

### Task 1: Add the tab button

**Files:**
- Modify: `index.html` — tab-container div (around line 459)

**Step 1: Add the new tab button**

In the `.tab-container` div, after the existing two buttons, add:

```html
<button class="tab-btn" onclick="openTab(event, 'Demo')">🌐 See It In Action</button>
```

**Step 2: Verify in browser**

Open `index.html` in a browser. Three tab buttons should appear. Clicking "See It In Action" should show an empty area (tab content div doesn't exist yet).

**Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add demo tab button"
```

---

### Task 2: Add demo tab CSS

**Files:**
- Modify: `index.html` — `<style>` block (before `</style>`)

**Step 1: Add demo-specific styles**

Append to the `<style>` block:

```css
/* --- STYLES FOR DEMO TAB --- */
.demo-intro {
    text-align: center;
    color: var(--text-muted);
    margin-bottom: 25px;
    font-size: 0.95rem;
}

.page-switcher {
    display: flex;
    gap: 10px;
    justify-content: center;
    flex-wrap: wrap;
    margin-bottom: 30px;
}

.page-btn {
    background-color: var(--card-bg);
    border: 1px solid #444;
    color: var(--text-main);
    border-radius: 8px;
    padding: 10px 18px;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 600;
    transition: all 0.2s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    min-width: 110px;
}

.page-btn:hover {
    border-color: var(--accent-gold);
    color: var(--accent-gold);
}

.page-btn.active {
    background-color: var(--accent-gold);
    color: #000;
    border-color: var(--accent-gold);
}

.page-btn .btn-label {
    font-size: 1.1rem;
}

.page-btn .btn-sub {
    font-size: 0.72rem;
    font-weight: 400;
    opacity: 0.8;
    text-align: center;
    line-height: 1.2;
}

.page-btn.active .btn-sub {
    opacity: 0.7;
}

.demo-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 20px;
    max-width: 1200px;
    margin: 0 auto;
}

@media(min-width: 900px) {
    .demo-grid {
        grid-template-columns: 1fr 1fr 1fr;
    }
}

.demo-site {
    display: flex;
    flex-direction: column;
}

.demo-site-name {
    color: var(--accent-gold);
    font-weight: 700;
    font-size: 0.9rem;
    margin-bottom: 8px;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.browser-chrome {
    background-color: #2e2e2e;
    border-radius: 10px 10px 0 0;
    padding: 8px 12px;
    display: flex;
    align-items: center;
    gap: 10px;
    border: 1px solid #444;
    border-bottom: none;
}

.browser-dots {
    display: flex;
    gap: 5px;
    flex-shrink: 0;
}

.browser-dots span {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    display: block;
}

.dot-red   { background-color: #ff5f57; }
.dot-yellow { background-color: #febc2e; }
.dot-green  { background-color: #28c840; }

.browser-url {
    background-color: #1a1a1a;
    border-radius: 4px;
    padding: 4px 10px;
    font-size: 0.75rem;
    color: #aaa;
    font-family: monospace;
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.demo-iframe-wrapper {
    border: 1px solid #444;
    border-top: none;
    border-radius: 0 0 8px 8px;
    overflow: hidden;
    height: 620px;
    background: #fff;
}

.demo-iframe-wrapper iframe {
    width: 100%;
    height: 100%;
    border: none;
    display: block;
}
```

**Step 2: Verify**

No visual change yet — styles are waiting for the HTML. Check no CSS syntax errors by opening the file in browser devtools.

**Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add demo tab CSS"
```

---

### Task 3: Add demo tab HTML content

**Files:**
- Modify: `index.html` — after the closing `</div>` of the `Playbook` tab content (around line 593)

**Step 1: Add the Demo tab content div**

Insert after `</div>` that closes `id="Playbook"`:

```html
<div id="Demo" class="tab-content">
    <p class="demo-intro">These are real client sites. Click any page to see it live across all three.</p>

    <div class="page-switcher">
        <button class="page-btn active" onclick="setPage(event, '/')">
            <span class="btn-label">🏠 Website</span>
            <span class="btn-sub">Your homepage</span>
        </button>
        <button class="page-btn" onclick="setPage(event, '/add-customer')">
            <span class="btn-label">➕ Add Customer</span>
            <span class="btn-sub">You tap this after every job</span>
        </button>
        <button class="page-btn" onclick="setPage(event, '/get-quote')">
            <span class="btn-label">📞 Get Quote</span>
            <span class="btn-sub">Auto-sent when you miss a call</span>
        </button>
        <button class="page-btn" onclick="setPage(event, '/discount')">
            <span class="btn-label">🎁 Discount</span>
            <span class="btn-sub">Auto-sent every 3 months</span>
        </button>
        <button class="page-btn" onclick="setPage(event, '/feedback')">
            <span class="btn-label">⭐ Feedback</span>
            <span class="btn-sub">Auto-sent after every job</span>
        </button>
    </div>

    <div class="demo-grid">

        <div class="demo-site">
            <div class="demo-site-name">DH Electrical Services</div>
            <div class="browser-chrome">
                <div class="browser-dots">
                    <span class="dot-red"></span>
                    <span class="dot-yellow"></span>
                    <span class="dot-green"></span>
                </div>
                <div class="browser-url" id="url-dh">dhelectricalservices.com</div>
            </div>
            <div class="demo-iframe-wrapper">
                <iframe id="iframe-dh" src="https://dhelectricalservices.com" title="DH Electrical Services"></iframe>
            </div>
        </div>

        <div class="demo-site">
            <div class="demo-site-name">All Aspects Roofing</div>
            <div class="browser-chrome">
                <div class="browser-dots">
                    <span class="dot-red"></span>
                    <span class="dot-yellow"></span>
                    <span class="dot-green"></span>
                </div>
                <div class="browser-url" id="url-roofing">allaspectsroofingspecialists.com</div>
            </div>
            <div class="demo-iframe-wrapper">
                <iframe id="iframe-roofing" src="https://allaspectsroofingspecialists.com" title="All Aspects Roofing"></iframe>
            </div>
        </div>

        <div class="demo-site">
            <div class="demo-site-name">Aphex Heating</div>
            <div class="browser-chrome">
                <div class="browser-dots">
                    <span class="dot-red"></span>
                    <span class="dot-yellow"></span>
                    <span class="dot-green"></span>
                </div>
                <div class="browser-url" id="url-aphex">aphex-heating.pages.dev</div>
            </div>
            <div class="demo-iframe-wrapper">
                <iframe id="iframe-aphex" src="https://aphex-heating.pages.dev" title="Aphex Heating"></iframe>
            </div>
        </div>

    </div>
</div>
```

**Step 2: Verify**

Click the "See It In Action" tab. Three columns should appear with browser chrome bars and iframes loading the homepages. On screens < 900px they stack vertically.

**Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add demo tab HTML with three iframe columns"
```

---

### Task 4: Add setPage() JavaScript function

**Files:**
- Modify: `index.html` — `<script>` block (inside the existing script tag, after `openTab`)

**Step 1: Add the setPage function**

```javascript
const demoSites = {
    dh:      'https://dhelectricalservices.com',
    roofing: 'https://allaspectsroofingspecialists.com',
    aphex:   'https://aphex-heating.pages.dev'
};

function setPage(evt, path) {
    // Update all iframes
    document.getElementById('iframe-dh').src      = demoSites.dh      + path;
    document.getElementById('iframe-roofing').src  = demoSites.roofing  + path;
    document.getElementById('iframe-aphex').src    = demoSites.aphex    + path;

    // Update browser URL bars
    const displayPath = path === '/' ? '' : path;
    document.getElementById('url-dh').textContent      = 'dhelectricalservices.com'        + displayPath;
    document.getElementById('url-roofing').textContent  = 'allaspectsroofingspecialists.com' + displayPath;
    document.getElementById('url-aphex').textContent    = 'aphex-heating.pages.dev'          + displayPath;

    // Toggle active button
    document.querySelectorAll('.page-btn').forEach(btn => btn.classList.remove('active'));
    evt.currentTarget.classList.add('active');
}
```

**Step 2: Verify interaction**

Open in browser. Click the Demo tab, then click each page switcher button. Confirm:
- All three iframes reload to the new path
- URL text in browser bars updates accordingly
- Active button highlights gold

**Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add setPage() to sync iframes and browser bars"
```

---

### Task 5: Final polish — wider demo container

**Files:**
- Modify: `index.html` — wrap the `demo-grid` section to break out of the 1000px container

**Step 1: Note on container width**

The `demo-grid` already has `max-width: 1200px` via CSS. Since it's inside the `.container` (1000px), add a negative-margin breakout for the demo grid on wide screens:

```css
@media(min-width: 900px) {
    .demo-grid {
        margin-left: -100px;
        margin-right: -100px;
        max-width: none;
    }
}
```

Add this inside the existing `@media(min-width: 900px)` block for `.demo-grid` (merge the two into one block).

**Step 2: Verify layout**

On wide viewport (> 1100px), three columns should have enough width that the iframes are comfortably readable. On narrow viewports they stack cleanly.

**Step 3: Final commit**

```bash
git add index.html
git commit -m "feat: widen demo grid with negative margin breakout"
```
