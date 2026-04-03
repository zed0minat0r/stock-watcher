# StockPulse — FOURTH AUDIT v4 (Nigel)
**Date:** 2026-04-01  
**Auditor:** Nigel (Strict Auditor)  
**Live Site:** https://zed0minat0r.github.io/stock-watcher/  
**Perspectives:** Mobile (375px) + Desktop/Display Mode  
**Previous Audits:** v1 scored 5.4, v2 scored 6.3, v3 scored 6.9

---

## Scoring Calibration
- 5.0 = average/basic | 5.5 = functional but generic | 6.0 = generic template
- 7.0 = genuinely better than most (HIGH bar) | 8.0 = user would choose over competitors
- 9.0 = award-worthy

**Benchmark competitors:** Robinhood, Yahoo Finance, TradingView

---

## 1. Visual Design — 7.2 / 10 (v3: 6.6, +0.6)

**What improved (and it is meaningful this time):**
- **Gradient logo text.** `logo-text` now uses `var(--gradient-brand)` (green-to-blue) with `-webkit-background-clip: text`. This replaces the plain white text and gives the header a proper brand identity. The diamond icon remains Unicode, but with the gradient text it reads as intentional minimalism rather than placeholder.
- **Scrolling ticker tape banner.** A full-width market index tape (S&P, Dow, Nasdaq, Russell, VIX, Gold, Oil) scrolls beneath the header with edge-fade pseudo-elements. This is the single most impactful visual addition — it immediately signals "serious finance app" and is present on Bloomberg, CNBC, and every trading platform. The CSS-only `@keyframes tickerScroll` with duplicated content for seamless loop is clean implementation.
- **Trend-colored card hover glow.** Cards now get a direction-aware glow on hover: green halo for up stocks (`rgba(0,214,114,0.12)` at 32px + 64px spread), red for down. Combined with the `translateY(-3px)` lift, this is a genuinely satisfying interaction.
- **Ambient breathing pulse on cards.** `ambientPulseGreen` / `ambientPulseRed` keyframes create a subtle 4s pulse on card box-shadows. Extremely subtle (7% to 11% opacity variation) — tasteful, not distracting. Gives the dashboard a "living" quality.
- **Premium top accent bar** with directional gradient (green-dim to green for up stocks) and glow shadow. Combined with the inner glow `::after` pseudo-element, cards have real depth.
- **Staggered entrance animation.** Cards slide up with 40ms stagger delays (`cardSlideUp` with `nth-child` delays from 0 to 0.28s). This creates a waterfall effect on page load that feels polished.
- **Taller sparklines at 80px (90px on mobile).** More vertical space means the trend line carries more visual weight on each card.
- **SVG trend arrows.** Proper 12px SVG triangles replace any Unicode arrows for consistent cross-browser rendering.

**Still holding it back:**
- Logo icon is still Unicode `&#9670;`. A custom SVG mark would complete the brand story that the gradient text started.
- Header action buttons still use Unicode characters (`&#8635;`, `&#9974;`, `&#10005;`, `&#128269;`). Inconsistent with the SVG trend arrows on cards. A lightweight icon set would unify iconography.
- No Bloomberg-style grid dot background (mentioned in changelog but not found in CSS). The dark theme is clean but the `#0a0e14` background is flat.
- Color palette is professional but conservative. No accent moments beyond green/red/blue.

**Score rationale:** The ticker tape, card glow system, breathing pulse, and gradient logo collectively transform the visual personality from "clean dark template" to "stylish fintech dashboard." This is now visually distinctive. The ticker tape alone is worth +0.3 — it is the single most recognizable visual cue from professional trading terminals. A user seeing this for the first time would note the polish. Still not Robinhood-level polish (they have custom illustrations, onboarding animations, micro-interactions on every element), but this is now genuinely better than most web finance dashboards. Earns 7.2.

---

## 2. Mobile UX (375px) — 7.2 / 10 (v3: 7.0, +0.2)

**What improved:**
- **Center-aligned card content on mobile.** `text-align: center; align-items: center` on `.stock-card`, with `justify-content: center` on `.card-price-row` and `justify-items: center` on `.card-metrics`. The card layout is now fully centered on narrow screens, which reads correctly for single-column mobile. This was specifically called out in AGENT-RULES as a requirement.
- **Card-top repositioned.** `flex-direction: column; align-items: center` on `.card-top` at 600px breakpoint means ticker and company name stack centered instead of space-between layout. Remove button repositioned with `top: -4px; right: -4px` absolute.
- **Font size tuning.** `.card-price` at 1.5rem mobile (up from default), `.card-company` at 0.76rem, `.card-metrics` at 0.76rem. These are well-chosen sizes for 375px — large enough to read, compact enough to fit.
- **90px sparklines on mobile** (up from 80px desktop default). Giving mobile users slightly taller sparklines is a smart choice — the single-column layout has horizontal space to spare, so vertical space for the chart adds value.
- **Ticker tape adapts.** 34px height, 0.76rem font, tighter padding on mobile. Still functional and readable.

**Unchanged from v3 (still good):**
- 1-row header with search behind toggle. 44px tap targets everywhere. 16px search input (prevents iOS zoom).
- Remove button always visible on touch devices via `@media (hover: none), (pointer: coarse)`.

**Still holding it back:**
- Still no `env(safe-area-inset-bottom)` for iPhone notch/home indicator. Toast at `bottom: 24px` could be partially obscured on iPhone 15/16 Pro.
- Chart modal height remains 260px on mobile. With the crosshair tooltip now active, the tooltip competes for already-cramped vertical space.
- No pull-to-refresh gesture. Expected on mobile finance apps.
- Ticker tape on 375px: 34px is appropriate height, but horizontal scroll is pure CSS animation with no user control (no pause on touch). A long-press-to-pause or swipe-to-scrub would be better UX.

**Score rationale:** The center alignment and font size tuning complete the mobile-first story. Cards look intentionally designed for mobile, not just reflowed desktop cards. The sparkline height bump is a smart density choice. These are incremental improvements over v3's strong foundation. 7.2 — solid mobile experience with polish-level gaps remaining.

---

## 3. Desktop / Display Mode — 7.4 / 10 (v3: 7.2, +0.2)

**What improved:**
- **Ticker tape on desktop** is the main addition. At full width with edge-fade gradients and smooth scrolling animation, this adds a professional ambient data layer that was completely absent before. On a desk monitor, the scrolling indices create the "trading floor" atmosphere described in the changelog.
- **4-column grid at 1280px+** with `gap: 14px` gives good card density on large screens.
- **Display mode exit button styling** is well-defined: clear `padding: 8px 16px`, visible border, hover state. The `100dvh` max-height with flex layout prevents overflow on small screens.

**Unchanged from v3 (still good):**
- Breathing glow on active display card (3s `activeGlow` keyframe). Smooth 0.6s transitions on card swap. Inactive cards at 0.75 opacity. Enhanced nav dots with blue glow. These collectively make display mode feel alive.

**Still holding it back:**
- Display mode cards still have no sparklines or mini-charts. The 2x4 grid has plenty of room for a small trend line on each card. This would be high-impact for wall-mounted displays where trend matters more than exact numbers.
- `d-price` at 3.4rem is readable at desk distance but undersized for across-the-room 55" TV viewing. Would need 4.5-5rem for that use case.
- Desktop dashboard maxes at `max-width: 1440px`. On 4K/ultrawide monitors, significant empty space on sides.
- Search still hidden behind toggle on desktop. An always-visible search bar on wide screens (perhaps integrated into the header-right area when space permits) would reduce friction.
- No drag-to-reorder cards on desktop.

**Score rationale:** The ticker tape genuinely elevates the desktop experience. Combined with v3's display mode polish (transitions, breathing glow, active/inactive contrast), the desktop/display mode is now a cohesive ambient dashboard. The remaining gaps (no sparklines in display mode, no 4K optimization) are features, not bugs. 7.4.

---

## 4. Charts — 7.6 / 10 (v3: 7.0, +0.6)

**What improved — crosshair + OHLC tooltip resolves the #1 v3 recommendation:**
- **Crosshair enabled on modal chart.** `crosshair: { mode: 1 }` with styled vertical and horizontal lines (blue `rgba(78,168,246,0.4)`, dashed style 2, dark label backgrounds). This is the single most requested feature from v3 and it is properly implemented.
- **OHLC tooltip.** `subscribeCrosshairMove()` callback renders a positioned tooltip with date, O/H/L/C values, and change (absolute + percentage) with color coding. The tooltip is styled with `backdrop-filter: blur(8px)`, `border-radius`, and `tabular-nums` for aligned numbers. It dynamically repositions to stay within the chart container bounds.
- **Tooltip HTML structure** is clean: `.tt-date` header, `.tt-row` for each OHLC value with label/value flex layout, `.tt-change` footer with color-coded change. This is a proper trading-grade tooltip — not a basic hover label.
- **Sparklines still have crosshair disabled** (`mode: 0`, `crosshairMarkerVisible: false`). This is correct — sparklines are glance-level indicators, not interactive charts.

**Unchanged from v3 (still good):**
- Real Finnhub OHLC data with 5-minute cache. Multiple time ranges (1W to 1Y). Graceful fallback. AbortSignal timeout.

**Still holding it back:**
- No volume bars below candlestick chart. Volume is one of the most basic overlays and Finnhub candle data includes volume.
- No technical indicators (even a single MA line would add value).
- Chart height at 260px on mobile is cramped, especially now that the tooltip overlay consumes visual space.
- Fallback to random-walk data when API fails still has no clear "Demo Data" indicator.
- No chart drawing tools (expected for 8+ but fair to note).

**Score rationale:** The crosshair + OHLC tooltip transforms the chart from "look at the trend" to "analyze the data." Users can now hover over any candle and see exact OHLC, date, and change. The tooltip styling is polished and the positioning logic prevents it from clipping. This is the most impactful single-feature addition in v4. Combined with the real data foundation from v3, the charting experience is now genuinely useful for daily monitoring. 7.6 — above the "better than most" bar and approaching the "choose over basic competitors" threshold. Still below TradingView (obviously) and Yahoo Finance (volume, indicators, comparisons), but competitive for a lightweight watchlist tool.

---

## 5. Search & Navigation — 7.0 / 10 (v3: 7.0, +0.0)

**No meaningful change since v3.**

- ARIA combobox pattern remains properly implemented.
- Chart time range buttons still have `role="radiogroup"` with `aria-checked`.
- Search drawer toggle with proper `aria-label`.
- Finnhub autocomplete with debounced input, keyboard navigation, fake ticker blocking.

**Still holding it back:**
- No watchlist sorting (by price, change%, name, alphabetical).
- No filtering or grouping by sector/performance.
- No recent/popular suggestions.
- No drag-to-reorder.
- Search hidden behind toggle on all screen sizes.

**Score rationale:** Search was solid in v3 and remains solid. No regressions, no advances. 7.0.

---

## 6. Data Quality — 6.5 / 10 (v3: 6.5, +0.0)

**No meaningful change since v3.**

- Real Finnhub OHLC chart data with caching. Real-time quotes for price/change.
- Volume, market cap, 52-week high/low still from hardcoded `FALLBACK_DATA`. The code explicitly shows: `volume: FALLBACK_DATA[ticker]?.volume || 0`, `cap: FALLBACK_DATA[ticker]?.cap || 0`, `high52: FALLBACK_DATA[ticker]?.high52 || q.h`. These are stale snapshots displayed alongside real-time prices.
- Ticker tape indices appear to be hardcoded data (not live API fetches).
- API key still hardcoded in source.
- Fallback random-walk charts still have no "Demo" indicator.

**Score rationale:** The crosshair makes existing data more accessible but does not add new data sources. The fundamental issue of stale volume/cap/52w figures next to live prices persists. 6.5.

---

## 7. Performance — 6.8 / 10 (v3: 6.8, +0.0)

**No meaningful change.**

- Ticker tape animation is CSS-only (no JS overhead). Good.
- Staggered card entrance animations are CSS-only. Good.
- Ambient pulse animations are CSS-only. Good.
- `prefers-reduced-motion: reduce` disables all animations including ticker tape. Correct.
- Still no lazy loading of off-screen sparklines.
- Still no service worker or offline support.
- Single HTML/CSS/JS architecture remains lean (920 CSS + 1133 JS + 95 HTML = 2148 lines total).

**Score rationale:** Performance was already adequate and the v4 additions are all CSS-only, which is the right approach. 6.8.

---

## 8. Accessibility — 7.4 / 10 (v3: 7.0, +0.4)

**What improved:**
- **Skip-to-content link.** `<a href="#stock-grid" class="skip-to-content">Skip to content</a>` is the first element in `<body>`, visually hidden at `top: -100%`, becomes visible on focus with a blue outline. This was the #3 v3 recommendation and it is properly implemented per WCAG 2.1 SC 2.4.1. Screen reader users can now jump directly to the stock grid.
- **Chart tooltip is `aria-hidden="true"`.** The crosshair tooltip `<div id="chart-tooltip" class="chart-tooltip" aria-hidden="true">` correctly hides the dynamic tooltip from screen readers, which would otherwise read constantly-changing OHLC values during mouse movement. This is a thoughtful accessibility detail.
- **Ticker tape has `aria-label="Market indices ticker tape"`.** Provides context for screen readers encountering the scrolling banner.

**Unchanged from v3 (still good):**
- Full ARIA combobox pattern on search. Radiogroup on chart time range buttons. `tabindex="0"` + `role="button"` on stock cards. Focus trap on modal. `aria-live` regions. `prefers-reduced-motion`. Global `:focus-visible` outline. WCAG contrast on text colors.

**Still holding it back:**
- Chart canvas content remains inaccessible to screen readers. No alt text or data table fallback summarizing the chart data (e.g., "AAPL: opened $210, closed $213, 30-day high $215, low $198"). This was the second half of the v3 #3 recommendation and is still missing.
- Ticker tape continuously scrolls with no pause mechanism. Users with vestibular disorders may find this problematic even with `prefers-reduced-motion` (which does stop it — confirmed). But users who want reduced motion but not NO motion have no middle ground.
- `prefers-color-scheme` not supported — dark mode only.

**Score rationale:** The skip-to-content link resolves the longest-standing accessibility gap (flagged since v2). Combined with the strong existing foundation and the thoughtful `aria-hidden` on the chart tooltip, this is a well-accessible web app. The remaining gap (chart data accessibility) is meaningful but niche. 7.4.

---

## 9. Overall App Feel — 7.3 / 10 (v3: 7.0, +0.3)

**Summary:** StockPulse v4 has crossed into genuinely impressive territory for a single-file web app. The changes since v3 fall into two categories:

**1. Visual personality (Spark + Builder v2.0.0).** The ticker tape, gradient logo, card glow system, breathing pulse, staggered entrance animations, and price flash effects collectively give the dashboard a "trading floor energy" that was absent in v3. The app now has a distinctive visual identity — it no longer looks like any dark-mode template. The ticker tape is the anchor element: it immediately communicates "this is a serious finance tool."

**2. Chart interaction (Refiner).** The crosshair + OHLC tooltip transforms charts from passive trend viewers to interactive data tools. A user can now hover over a specific candle and see the exact date, OHLC values, and daily change. This is the interaction that makes the difference between "glance at it" and "use it daily."

**3. Mobile polish (Pixel).** Center alignment, font size tuning, and tap target refinements complete the mobile-first story. Cards look intentionally designed for 375px, not just reflowed.

**Compared to competitors:** The gap to Robinhood has narrowed on visual design (StockPulse's dark theme + glow effects are arguably more visually striking, though Robinhood's UX polish and portfolio integration remain superior). Yahoo Finance still vastly outpaces on data depth + news. TradingView remains in a different league for charting. But StockPulse is now a credible, visually distinctive stock watchlist that a user would bookmark. The key differentiator is the display mode — neither Robinhood nor Yahoo Finance offer an ambient wall-mounted dashboard view with auto-rotation, breathing glow, and smooth transitions. This is StockPulse's unique feature and it is well-executed.

---

## OVERALL SCORE: 7.2 / 10 (v3: 6.9, +0.3)

| Area | v1 Score | v2 Score | v3 Score | v4 Score | v3->v4 Change |
|------|----------|----------|----------|----------|---------------|
| Visual Design | 5.8 | 6.5 | 6.6 | 7.2 | +0.6 |
| Mobile UX (375px) | 5.5 | 6.3 | 7.0 | 7.2 | +0.2 |
| Desktop / Display Mode | 6.0 | 6.8 | 7.2 | 7.4 | +0.2 |
| Charts | 5.5 | 5.5 | 7.0 | 7.6 | +0.6 |
| Search & Navigation | 5.0 | 6.5 | 7.0 | 7.0 | +0.0 |
| Data Quality | 4.5 | 5.8 | 6.5 | 6.5 | +0.0 |
| Performance | 6.5 | 6.8 | 6.8 | 6.8 | +0.0 |
| Accessibility | 4.5 | 6.2 | 7.0 | 7.4 | +0.4 |
| Overall App Feel | 5.5 | 6.2 | 7.0 | 7.3 | +0.3 |
| **Weighted Average** | **5.4** | **6.3** | **6.9** | **7.2** | **+0.3** |

---

## TOP 3 PRIORITY RECOMMENDATIONS

### 1. Live Metrics Beyond Price — Volume, Market Cap, 52w Range (High — data integrity)
Volume, market cap, and 52-week high/low are still hardcoded in `FALLBACK_DATA` and displayed next to real-time prices. This is a subtle credibility issue: a user sees a live price move but the volume figure is a stale snapshot from whenever the fallback data was written. Finnhub `/quote` returns today's volume (`v` field). Finnhub `/stock/metric?metric=all` (free tier) returns 52-week high/low and basic fundamentals. Fetching these on refresh would make every number on the card real. This is the last major "plastic food" issue.

### 2. Sparklines in Display Mode Cards (Medium — display mode value)
Display mode cards show ticker, price, change, and a few metrics — but no sparkline or mini-chart. The 2x4 grid has ample vertical space per card (especially on a 55" TV). Adding even a basic 40px sparkline to each display card would let a user glance at the wall and see trends at a distance, which is the primary use case for a wall-mounted dashboard. The sparkline infrastructure already exists; it just needs to be rendered inside `.display-card` elements.

### 3. Chart Accessibility — Data Summary for Screen Readers (Medium — a11y completeness)
Canvas-rendered charts are invisible to screen readers. When chart data loads, generate a visually-hidden text summary as an `aria-label` or `sr-only` span: e.g., "AAPL 1-month chart: opened at $198.50 on March 1, closed at $213.25 on April 1. 30-day high $215.80, low $195.20. Overall change +7.4%." This bridges the accessibility gap for the most data-rich component in the app. The OHLC data is already available from `fetchCandleData()` — it just needs to be summarized in text form.

---

*v4 audit complete. Visual Design (+0.6) and Charts (+0.6) are the biggest movers. The ticker tape and crosshair tooltip are the two standout additions. The app has crossed the 7.0 threshold overall — it is now genuinely better than most web finance dashboards. The remaining path to 8.0 requires live data completeness (rec #1) and display mode enrichment (rec #2). Data Quality at 6.5 is the weakest area and the clearest bottleneck.*

— Nigel
