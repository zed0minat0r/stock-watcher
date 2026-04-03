# StockPulse — FIRST AUDIT (Nigel)
**Date:** 2026-04-01  
**Auditor:** Nigel (Strict Auditor)  
**Live Site:** https://zed0minat0r.github.io/stock-watcher/  
**Perspectives:** Mobile (375px) + Desktop/Display Mode

---

## Scoring Calibration
- 5.0 = average/basic | 5.5 = functional but generic | 6.0 = generic template
- 7.0 = genuinely better than most (HIGH bar) | 8.0 = user would choose over competitors
- 9.0 = award-worthy

**Benchmark competitors:** Robinhood, Yahoo Finance, TradingView

---

## 1. Visual Design — 5.8 / 10

**Strengths:**
- Dark theme is appropriate for a financial app. Color palette (`#0a0e14` bg, green/red coding) is clean and professional.
- Font choices are sensible (system font stack with SF Pro Display).
- Card-based layout with consistent spacing and border radii.
- Tabular-nums font-variant on numeric values — good attention to detail.

**Weaknesses:**
- The overall design feels like a **well-executed dark template**, not a distinctive product. Compare to Robinhood's bold simplicity or TradingView's information density — StockPulse sits in a generic middle ground.
- Logo is a Unicode diamond (`&#9670;`) — this screams placeholder. Real apps have SVG logos or at minimum a styled wordmark.
- No branding personality. No gradients, no hero section, no visual hierarchy beyond card grid.
- Buttons (refresh, display mode) use Unicode characters (`&#8635;`, `&#9974;`) instead of proper icon library. These render inconsistently across browsers and platforms.
- No visual differentiation between stock cards — every card looks identical aside from numbers. No micro-charts or visual cues to quickly scan winners vs losers at a glance (the sparkline helps but is small).
- Color palette is safe but flat. No accent gradients, no depth beyond `box-shadow`.

---

## 2. Mobile UX (375px) — 5.5 / 10

**Strengths:**
- Responsive grid drops to 1-column on mobile. Cards stack correctly.
- Header elements center-align on mobile per AGENT-RULES requirement.
- Search input is full-width on mobile — good touch target.
- `last-updated` hides on mobile to save space.
- Display mode grid shifts to 2x4 on mobile.

**Weaknesses:**
- **Header is 3 rows tall on mobile** (logo row, search row, buttons row) due to `flex-wrap: wrap`. This eats ~120px of precious viewport. On a 375px-wide / 667px-tall iPhone SE, that's nearly 20% of the screen just for the header.
- No hamburger menu or collapsible controls. All buttons always visible.
- Card remove button (`card-remove`) requires hover (`opacity: 0` -> `opacity: 1` on hover). **Hover does not exist on mobile.** Users cannot see or discover the remove button without long-press or accidental tap. This is a real usability bug.
- No pull-to-refresh gesture or obvious mobile refresh pattern.
- Search placeholder says "Add ticker (e.g. AAPL)" — fine, but no autocomplete or ticker suggestions. On mobile, users must know exact ticker symbols.
- Toast notification at bottom could overlap with iPhone home indicator / safe area. No `env(safe-area-inset-bottom)` padding.
- Chart modal at 260px height on mobile is cramped for candlestick data. Time range buttons are small touch targets (5px padding).
- No swipe gestures between stocks in the modal.

---

## 3. Desktop / Display Mode — 6.0 / 10

**Strengths:**
- Display mode is a genuinely useful feature — wall-mounted monitor use case is well-conceived.
- 2x4 grid layout fills the screen. Auto-rotation every 10s with dot navigation.
- Live clock in display header. Market status indicator.
- Native fullscreen API integration.
- Keyboard shortcut `f` to enter display mode — nice power-user touch.
- Fullscreen exit detection handles browser ESC.

**Weaknesses:**
- Display mode shows max 8 stocks in a static grid. If user has 12 stocks, the last 4 are invisible with no pagination or scroll.
- The "active" card highlight is subtle — just a blue border and slight shadow. On a wall-mounted TV from across the room, this would be nearly invisible. Needs much stronger visual emphasis (scale transform, background color change, pulsing glow).
- No transition animation when rotating between stocks — just instant class swap.
- Display mode has no charts or sparklines — just numbers. For a "display mode" on a big screen, this is a missed opportunity.
- Desktop dashboard (non-display mode) maxes at 4 columns (`1280px` breakpoint). On a 4K monitor, there's massive empty space on the sides (`max-width: 1440px`).
- No drag-to-reorder cards on desktop.
- Display mode font sizes (`d-price` at 2.6rem) are decent but not "across the room" readable. A 55" TV at 10 feet would benefit from 4-5rem+.

---

## 4. Charts — 5.5 / 10

**Strengths:**
- Uses `lightweight-charts` library (TradingView's open-source charting) — good choice, performant and professional.
- Candlestick chart in modal with proper OHLC data structure.
- Sparklines on each card with area fill and color coding (green up, red down).
- Time range selector (1W, 1M, 3M, 6M, 1Y) — standard and expected.
- Chart properly resizes on window resize.

**Weaknesses:**
- **All chart data is randomly generated** (`generateChartData`, `generateSparklineData`). Every page load produces different "history." This is fundamentally misleading — the sparkline trends on cards don't reflect actual stock performance. A stock showing +3% might have a downward-trending sparkline by random chance.
- No volume bars on the candlestick chart. Any serious stock app shows volume alongside price.
- No technical indicators (MA, RSI, MACD). TradingView and Yahoo Finance offer these as baseline.
- No line chart option — only candlestick. Many casual users prefer simple line charts.
- Chart modal doesn't show the ticker's sparkline color-coding (the overall trend direction).
- Sparkline height is only 48px — barely readable, especially for showing meaningful price action.
- No crosshair tooltip showing price/date on hover in the modal chart (`crosshair mode: 0` disables it).

---

## 5. Search & Navigation — 5.0 / 10

**Strengths:**
- Search input with auto-uppercase is sensible for ticker symbols.
- Keyboard shortcut `/` to focus search — power-user friendly.
- Max 20 tickers in watchlist — reasonable limit with user feedback.
- Toast notifications for add/remove/refresh actions.

**Weaknesses:**
- **No autocomplete/typeahead.** User must type exact ticker. Searching "Apple" returns nothing — must know "AAPL." This is the single biggest UX gap vs competitors. Robinhood, Yahoo Finance, and TradingView all have search-by-company-name.
- No search results dropdown. Just a text input and an "Add" button. No validation that the ticker exists before adding.
- Adding an unknown ticker generates random fake data (the `else` branch in `getFallbackData`). User could add "ZZZZ" and see a fake stock card with fake price. This is misleading.
- No way to reorder the watchlist. Newly added tickers go to the front (`unshift`), but user can't sort by price, change%, name, etc.
- No filtering or grouping (e.g., by sector, by performance).
- No way to navigate between cards via keyboard (arrow keys).

---

## 6. Data Quality — 4.5 / 10

**Strengths:**
- Finnhub API integration is structured and provider-swappable. Good architecture.
- Fallback data has realistic prices and fundamentals for major tickers.
- Jitter on fallback data simulates live feel.
- 8-second timeout on API calls prevents hanging.
- Parallel fetch for all tickers.

**Weaknesses:**
- **Finnhub key is `'demo'`** — this will rate-limit almost immediately or return empty data. In practice, users will always see fallback data.
- Volume and market cap come from hardcoded fallback even when Finnhub returns real quote data (lines 102-103). This means live price but stale volume/cap.
- 52-week high/low also falls back to hardcoded values (lines 104-105). These are point-in-time snapshots that will become stale.
- Company names for non-fallback tickers default to the ticker symbol itself (line 98). No API call to resolve company name.
- No historical price API integration — all chart data is fake random walks. This is the biggest data integrity issue.
- No error state shown to user when API fails — silently falls back. User doesn't know they're looking at fake data (only "Sample data" in the timestamp, easily missed).
- Auto-refresh every 60s with demo key will burn through rate limits fast.

---

## 7. Performance — 6.5 / 10

**Strengths:**
- Single HTML file, single CSS file, single JS file — minimal HTTP requests.
- Only external dependency is `lightweight-charts` from CDN (unpkg).
- No framework overhead — vanilla JS.
- `requestAnimationFrame` for sparkline rendering — avoids layout thrashing.
- CSS transitions are short (0.18s) — feels snappy.
- `AbortSignal.timeout(8000)` prevents hanging fetches.

**Weaknesses:**
- Sparkline charts are destroyed and recreated on every refresh (`renderGrid` calls `chart.remove()` then re-renders all). For 20 stocks, that's 20 chart instances torn down and rebuilt every 60 seconds.
- No lazy loading — all sparklines render immediately even if off-screen.
- No service worker or offline support.
- CDN script (`unpkg.com/lightweight-charts`) is loaded synchronously in `<head>` — blocks rendering. Should be `defer` or loaded async.
- No minification or bundling (acceptable for a prototype, but noted).
- `generateSparklineData` and `generateChartData` run on every render with random data — CPU work that produces meaningless output.

---

## 8. Accessibility — 4.5 / 10

**Strengths:**
- `aria-label` on search input and modal dialog.
- `role="dialog"` on chart modal.
- Semantic HTML: `<header>`, `<main>`, `<h1>`, `<h2>`, `<form>`.
- `:focus` style on search input (blue border + shadow).

**Weaknesses:**
- **No skip-to-content link.**
- Stock cards have no `role="button"` or `tabindex` despite being clickable. Keyboard users cannot tab to or activate cards.
- Remove button has `opacity: 0` by default — invisible to all users until hover, and completely inaccessible on keyboard/screen reader.
- Modal has no focus trap. When modal opens, focus doesn't move to it. Tab key will go behind the modal to hidden elements.
- No `aria-live` region for dynamic content updates (price changes, toast notifications).
- Toast notifications are purely visual — no `role="alert"` or `aria-live="polite"`.
- Color contrast: `--text-muted` (#5a6572) on `--bg-primary` (#0a0e14) = ~3.1:1 ratio, **fails WCAG AA** (needs 4.5:1). Many labels use this color.
- Display mode has no keyboard navigation between cards.
- Time range buttons in modal have no `aria-pressed` or group label.
- No `prefers-reduced-motion` media query — animations play regardless of user preference.
- No `prefers-color-scheme` support — dark mode only.

---

## 9. Overall App Feel — 5.5 / 10

**Summary:** StockPulse is a **competent prototype** that covers the basic features of a stock watchlist app. The dark theme is appropriate, the code is clean and well-structured, and the display mode concept is a nice differentiator. However, it falls short of being something a real user would choose over Robinhood (for simplicity), Yahoo Finance (for data depth), or TradingView (for charting power).

The fundamental issue is that the app displays **fake data** in most scenarios (demo API key, random chart data, hardcoded fundamentals). A user who doesn't read the source code would not realize the sparklines and charts are meaningless random walks. This undermines the entire purpose of a stock watcher.

The mobile experience is functional but has real UX bugs (invisible remove button, cramped header). Desktop is clean but underuses screen real estate. Display mode is a cool concept held back by weak visual emphasis and missing charts.

**What it does well:** Clean code architecture, appropriate tech choices, decent responsive layout, useful feature set on paper.

**What holds it back:** Fake data everywhere, no search autocomplete, accessibility gaps, generic visual identity, mobile UX bugs.

---

## OVERALL SCORE: 5.4 / 10

| Area | Score |
|------|-------|
| Visual Design | 5.8 |
| Mobile UX (375px) | 5.5 |
| Desktop / Display Mode | 6.0 |
| Charts | 5.5 |
| Search & Navigation | 5.0 |
| Data Quality | 4.5 |
| Performance | 6.5 |
| Accessibility | 4.5 |
| Overall App Feel | 5.5 |
| **Weighted Average** | **5.4** |

---

## TOP 5 PRIORITY RECOMMENDATIONS

### 1. Fix Data Integrity (Critical)
- Replace demo Finnhub key with a working free key, OR integrate Yahoo Finance API (via a CORS proxy or alternative endpoint).
- Use a real historical price API for chart data instead of random generation. The sparklines and candlestick charts currently show meaningless data. This is the #1 thing undermining the app's credibility.
- Show a clear "Demo Data" badge when using fallback data, not just a subtle timestamp change.

### 2. Add Search Autocomplete (High)
- Integrate a ticker/company name search API (Finnhub has `/search?q=apple`). Show a dropdown with matching results.
- Validate ticker before adding to watchlist. Currently, any random string gets added with fake data generated for it.
- This is the single biggest UX improvement possible — it's what separates a toy from a tool.

### 3. Fix Mobile Remove Button & Header (High)
- The `card-remove` button is `opacity: 0` and only appears on hover. **Mobile has no hover.** Add a visible remove affordance — swipe-to-delete, a persistent icon, or a long-press menu.
- Collapse the 3-row mobile header: put search behind a toggle/icon, or combine logo + buttons into one row.
- Add `env(safe-area-inset-bottom)` for iPhone notch/home indicator.

### 4. Strengthen Display Mode (Medium)
- Increase font sizes for TV readability (price should be 4-5rem+, ticker 2.5rem+).
- Make active card highlight much more dramatic (scale 1.05, bright border, background glow, or animated pulse).
- Add sparkline or mini-chart to each display card — the big screen has room for it.
- Add pagination/scrolling if watchlist > 8 stocks.

### 5. Address Core Accessibility (Medium)
- Add `tabindex="0"` and `role="button"` to stock cards. Add keyboard event handlers.
- Make remove button always visible (or provide an accessible alternative).
- Add focus trap to modal. Move focus on open, return focus on close.
- Add `role="alert"` to toast. Add `aria-live` to dynamic price regions.
- Fix color contrast: bump `--text-muted` to at least `#7a8592` for WCAG AA compliance.
- Add `prefers-reduced-motion` media query.

---

*Audit complete. This is a solid foundation that needs real data integration and mobile polish to graduate from prototype to product.*

— Nigel
