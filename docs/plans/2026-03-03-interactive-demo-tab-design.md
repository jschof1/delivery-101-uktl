# Interactive Demo Tab — Design Doc
_Date: 2026-03-03_

## What We're Building

A third tab ("🌐 See It In Action") added to the existing delivery doc (`index.html`). It shows three real client websites side-by-side in iframes, with a global page switcher that updates all three simultaneously.

## Sites

| Label | Domain |
|---|---|
| DH Electrical Services | dhelectricalservices.com |
| All Aspects Roofing | allaspectsroofingspecialists.com |
| Aphex Heating | aphex-heating.pages.dev |

## Page Switcher

Five buttons at the top of the tab. Clicking any one updates all three iframes at once.

| Button | Path | Subtitle |
|---|---|---|
| 🏠 Website | `/` | Your homepage |
| ➕ Add Customer | `/add-customer` | You tap this after every job |
| 📞 Get Quote | `/get-quote` | Auto-sent when you miss a call |
| 🎁 Discount | `/discount` | Auto-sent to past customers every 3 months |
| ⭐ Feedback | `/feedback` | Auto-sent after every job completes |

Active button: gold fill. Default active: 🏠 Website.

## Iframe Layout

Three equal-width columns, side-by-side on desktop, stacked on mobile (< 768px).

Each column:
1. **Site name** — gold label above the browser bar
2. **Fake browser chrome bar** — dark background, macOS traffic-light dots (red/yellow/green), URL text updates on page switch
3. **iframe** — 620px fixed height, `overflow: hidden` on the wrapper (iframe itself scrolls internally)

The grid sits within the existing container but can use `max-width: 1200px` to give iframes more room than the standard 1000px content width.

## Interaction

- JS `setPage(path)` function updates `iframe.src` for all three + the URL text in each browser bar
- Active button class toggled on switcher click
- No loading states needed for MVP

## Constraints

- Sites must not have `X-Frame-Options: DENY` (user controls all three, so this is manageable)
- If a route doesn't exist on a site yet, iframe shows whatever the URL returns — no error handling needed
- No external dependencies — pure HTML/CSS/JS inside the existing single file
