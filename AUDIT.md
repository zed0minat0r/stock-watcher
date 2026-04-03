# StockPulse — SECOND AUDIT v2 (Nigel)
**Date:** 2026-04-01  
**Auditor:** Nigel (Strict Auditor)  
**Live Site:** https://zed0minat0r.github.io/stock-watcher/  
**Perspectives:** Mobile (375px) + Desktop/Display Mode  
**Previous Audit:** v1 scored 5.4 overall

---

## Scoring Calibration
- 5.0 = average/basic | 5.5 = functional but generic | 6.0 = generic template
- 7.0 = genuinely better than most (HIGH bar) | 8.0 = user would choose over competitors
- 9.0 = award-worthy

**Benchmark competitors:** Robinhood, Yahoo Finance, TradingView

---

## 1. Visual Design — 6.5 / 10 (v1: 5.8, +0.7)

**What improved:**
- Glassmorphism card treatment with `backdrop-filter: blur(8px)` and gradient background adds genuine depth. Cards no longer look flat.
- Directional color accent bar on each card top (`::before` pseudo-element) with green/red gradient and glow. This is a real visual differentiator — you can now scan winners vs losers at a glance without reading numbers.
- Inner glow highlight (`::after` overlay) adds subtle premium feel.
- The overall card design now has layered depth: accent bar + gradient bg + blur + inner glow. This is meaningfully above "dark template" territory.

**Still holding it back:**
- Logo is still a Unicode diamond (`&#9670;`). This remains a placeholder-tier brand mark. Any competitor has a proper SVG logo.
- Buttons still use Unicode characters (`&#8635;`, `&#9974;`, `&#10005;`) — inconsistent cross-browser rendering. A lightweight icon set (Lucide, Phosphor) would fix this instantly.
- No hero section, no landing personality. It opens straight to a grid. Fine for a tool, but limits emotional impact.
- Card hover state (`scale(1.02)`, border glow) is nice but still conservative compared to modern fintech UIs.

---

## 2. Mobile UX (375px) — 6.3 / 10 (v1: 5.5, +0.8)

**What improved:**
- Remove button is now ALWAYS visible on touch devices via `@media (hover: none), (pointer: coarse)`. Styled as a compact circular X in the top-right of each card. This fully resolves the v1 critical bug where mobile users could not discover the remove button.
- The touch-specific styling (absolute positioned, 22px circle, semi-transparent bg) is well-executed and doesn't clutter the card.
- `:active` state on remove button (red highlight) gives proper touch feedback.
- Autocomplete dropdown on search means mobile users no longer need to know exact ticker symbols — they can type "apple" and get "AAPL" in the dropdown.

**Still holding it back:**
- **Header is still 3 rows on mobile** (logo row, search row, buttons row). This was flagged in v1 and is unchanged. Still consumes ~120px of viewport on iPhone SE. A collapsible search or hamburger menu would reclaim significant screen real estate.
- No `env(safe-area-inset-bottom)` for iPhone notch/home indicator. Toast notifications could still overlap.
- Chart modal height still 260px on mobile — cramped for candlestick data.
- Time range buttons in chart modal remain small touch targets.
- No pull-to-refresh or swipe gestures.
- Autocomplete dropdown may overflow on very narrow screens if company names are long — no `overflow: hidden` or `text-overflow: ellipsis` on `ac-name` (only `flex-shrink: 1` noted, which helps but not guaranteed).

---

## 3. Desktop / Display Mode — 6.8 / 10 (v1: 6.0, +0.8)

**What improved:**
- **Font sizes significantly increased.** `d-price` is now 3.4rem (up from 2.6rem). `d-ticker` is 2.2rem. These are much more TV-readable, though mobile display mode drops to 2rem/1.5rem.
- **Pagination added.** When watchlist > 8 stocks, prev/next buttons and page label appear. This fully fixes the v1 issue where extra stocks were invisible.
- **Active card highlight strengthened.** Now includes: 2px blue border, 32px blue glow shadow, inner 20px glow, scale(1.03) transform, and gradient background. This is a meaningful improvement — the active card now has clear visual distinction.
- Pagination buttons have proper `aria-label` attributes ("Previous page", "Next page").
- `disabled` state on pagination buttons when at first/last page.

**Still holding it back:**
- Display mode still has no sparklines or mini-charts on cards — just numbers. A wall-mounted TV has ample room for trend visualizations.
- 3.4rem for price is better but still not "across the room from a 55-inch TV" territory. Ideally 4.5-5rem for that use case. However, this is now acceptable for a desk/small-room monitor.
- No transition animation between active cards — still instant class swap.
- Desktop dashboard (non-display mode) still maxes at `max-width: 1440px`. On 4K monitors, significant empty space on sides.
- No drag-to-reorder cards on desktop.

---

## 4. Charts — 5.5 / 10 (v1: 5.5, +0.0)

**No meaningful change.**

- Chart data is **still randomly generated** (`generateChartData`, `generateSparklineData` with `Math.random()`). Every page load produces different fake history. The sparkline on a +3% stock can still show a downward random walk. This remains fundamentally misleading.
- No volume bars on candlestick chart.
- No technical indicators (MA, RSI, MACD).
- Crosshair still disabled (`mode: 0`) — no hover tooltip showing price/date.
- Chart CDN script now uses `defer` attribute (was sync in v1). This is a performance improvement, not a charts improvement, so credited in Performance.
- The chart area remains the weakest functional area. Competitors like TradingView offer real historical data, 50+ indicators, and drawing tools. Even Yahoo Finance shows real OHLC history. StockPulse shows random walks styled as candlesticks.

---

## 5. Search & Navigation — 6.5 / 10 (v1: 5.0, +1.5)

**What improved — this is the biggest single-area jump:**
- **Autocomplete with Finnhub `/search` API.** Typing triggers a debounced (250ms) search. Results are filtered to Common Stock/ETP/ADR, limited to 8 results. Dropdown shows symbol + company name. This was the #1 v1 recommendation and it is properly implemented.
- **Keyboard navigation in dropdown.** Arrow up/down to highlight, Enter to select, Escape to close. Properly prevents form submission when selecting an item (`e.stopPropagation()`).
- **Click-to-select** on dropdown items works correctly.
- **Fake ticker blocking.** `addTicker()` now validates by fetching data first. If the API returns nothing, shows error toast: `Ticker "XXX" not found. Check the symbol and try again.` This fixes the v1 issue where "ZZZZ" would generate fake data.
- **Click-outside-to-close** on autocomplete dropdown.

**Still holding it back:**
- No watchlist sorting (by price, change%, name, etc.).
- No filtering or grouping by sector/performance.
- Autocomplete shows raw Finnhub results — no local fuzzy matching or recent/popular suggestions.
- Still no way to reorder cards (drag-and-drop or manual sort).

---

## 6. Data Quality — 5.8 / 10 (v1: 4.5, +1.3)

**What improved:**
- **Real Finnhub API key** (`d77hb59r01...`) replaces the `demo` key. Live quote data (price, change, pct) should now work for major US tickers within Finnhub free-tier rate limits.
- **Ticker validation** prevents adding nonexistent symbols. No more fake data for random strings.
- Error toast on invalid tickers gives clear user feedback.

**Still holding it back:**
- Volume, market cap, 52-week high/low still come from hardcoded `FALLBACK_DATA` (lines 112, 143). Live Finnhub `/quote` on the free tier does not return these fields, so they are stale snapshots. Users see real-time price next to potentially months-old volume/cap.
- **Historical chart data is entirely fake** (random walks). This is the single biggest remaining credibility issue. The sparklines and candlestick charts show meaningless data. A user who does not read source code has no way to know this.
- No "Demo Data" badge or indicator when viewing generated charts. The timestamp says "Sample data" but it is subtle.
- Company names for non-fallback tickers still default to the ticker symbol.
- Auto-refresh every 60s will consume Finnhub free-tier quota (60 calls/minute limit). With 10 stocks, that is 10 calls per refresh — manageable, but 20 stocks pushes limits.

---

## 7. Performance — 6.8 / 10 (v1: 6.5, +0.3)

**What improved:**
- Chart CDN script (`lightweight-charts`) now uses `defer` attribute. No longer blocks initial render. This was flagged in v1.
- Autocomplete uses debounced input (250ms) with `AbortSignal.timeout(5000)` — prevents excessive API calls during typing.

**Unchanged (still good):**
- Single HTML/CSS/JS architecture, minimal HTTP requests.
- Vanilla JS, no framework overhead.
- `requestAnimationFrame` for sparkline rendering.
- Short CSS transitions (0.18s).

**Still holding it back:**
- Sparklines still destroyed and recreated on every refresh for all cards. 20 stocks = 20 chart instances torn down and rebuilt every 60 seconds.
- No lazy loading of off-screen sparklines.
- No service worker or offline support.
- Random data generation runs on every render — CPU cycles producing meaningless output.

---

## 8. Accessibility — 6.2 / 10 (v1: 4.5, +1.7)

**What improved — second biggest area jump:**
- **Stock cards now have `tabindex="0"` and `role="button"`** with descriptive `aria-label` (ticker, name, price, direction, change, and instruction to press Enter). This fully addresses the v1 card accessibility gap.
- **Keyboard activation** on cards: Enter and Space open the chart modal.
- **Focus trap on modal.** Tab wraps between first and last focusable element. Shift+Tab wraps backward. This is a proper implementation.
- **Focus moves to close button** when modal opens (`$('#modal-close').focus()` at line 451).
- **`aria-live="polite"` on stock grid** (`#stock-grid`) with `aria-relevant="additions removals"`. Price updates are announced to screen readers.
- **Toast has `role="alert"` and `aria-live="assertive"`**. Screen readers will announce toasts.
- **WCAG contrast fix:** `--text-muted` changed from `#5a6572` to `#7a8592`. This brings contrast against `#0a0e14` to approximately 4.5:1, meeting WCAG AA. Verified.
- **`prefers-reduced-motion: reduce`** media query kills all animations and transitions. Proper implementation with `!important` overrides.
- **Global `:focus-visible`** outline (2px solid blue, 2px offset) on all focusable elements.
- **Remove button `:focus-visible`** state forces `opacity: 1` so keyboard users can see it.

**Still holding it back:**
- No skip-to-content link. Screen reader users must tab through header to reach stock grid.
- Time range buttons in chart modal have no `aria-pressed` state or group label (`role="radiogroup"`).
- Autocomplete dropdown items have no `role="option"` or `aria-selected` attributes. The dropdown itself lacks `role="listbox"`.
- No `aria-expanded` on search input to indicate dropdown state.
- `prefers-color-scheme` not supported — dark mode only. Not a major issue for a finance app, but noted.
- Chart content is entirely inaccessible to screen readers — no alt text or data table fallback.

---

## 9. Overall App Feel — 6.2 / 10 (v1: 5.5, +0.7)

**Summary:** StockPulse has made a genuine leap from "competent prototype" to "polished prototype approaching product quality." The glassmorphism cards with directional trend accents give the UI personality it previously lacked. Search autocomplete transforms the core interaction from "know your tickers" to "search like a real app." Fake ticker rejection and live API data add credibility. The accessibility improvements are substantial and well-implemented.

However, the app still carries a fundamental credibility gap: **charts show fake random data.** This is the one issue that prevents a real user from trusting or relying on the app. Everything else — the UI polish, the search, the display mode — works well enough that the fake charts stand out even more starkly by contrast. It is like a beautiful restaurant serving plastic food.

**Compared to competitors:** Still not at Robinhood (simplicity + real data), Yahoo Finance (depth + history), or TradingView (charting power). But the gap has narrowed meaningfully, especially on the UX and accessibility front.

---

## OVERALL SCORE: 6.3 / 10 (v1: 5.4, +0.9)

| Area | v1 Score | v2 Score | Change |
|------|----------|----------|--------|
| Visual Design | 5.8 | 6.5 | +0.7 |
| Mobile UX (375px) | 5.5 | 6.3 | +0.8 |
| Desktop / Display Mode | 6.0 | 6.8 | +0.8 |
| Charts | 5.5 | 5.5 | +0.0 |
| Search & Navigation | 5.0 | 6.5 | +1.5 |
| Data Quality | 4.5 | 5.8 | +1.3 |
| Performance | 6.5 | 6.8 | +0.3 |
| Accessibility | 4.5 | 6.2 | +1.7 |
| Overall App Feel | 5.5 | 6.2 | +0.7 |
| **Weighted Average** | **5.4** | **6.3** | **+0.9** |

---

## TOP 3 PRIORITY RECOMMENDATIONS

### 1. Real Historical Chart Data (Critical — blocking credibility)
Charts are the last major area showing fake data. Integrate a free historical price API (Alpha Vantage TIME_SERIES_DAILY, or Finnhub `/stock/candle` endpoint which is available on free tier). Replace `generateChartData()` and `generateSparklineData()` with real OHLC data. Until this is fixed, the app cannot be taken seriously as a stock watcher — sparklines and candlestick charts are decorative fiction. This is the single change that would push the overall score above 7.0.

### 2. Collapse Mobile Header (High — reclaim viewport)
The 3-row mobile header (logo, search, buttons) still consumes ~120px on a 667px viewport. Options: (a) put search behind a magnifying glass icon that expands, (b) combine logo + buttons into one row with search below, or (c) make the header sticky but thinner with a scroll-triggered compact mode. This was flagged in v1 and remains the #1 mobile layout issue.

### 3. Accessible Autocomplete Pattern (Medium — polish the win)
The autocomplete works great functionally but lacks ARIA markup: add `role="listbox"` on the dropdown, `role="option"` + `aria-selected` on items, `aria-expanded` and `aria-activedescendant` on the search input. This is a well-documented WAI-ARIA combobox pattern and would bring the search from "works for sighted users" to "works for everyone." Also add `role="radiogroup"` + `aria-pressed` on chart time range buttons.

---

*v2 audit complete. Meaningful improvement across the board — Search (+1.5) and Accessibility (+1.7) show the most dramatic gains. Charts remain the Achilles heel. Fix the fake data and this app crosses the 7.0 threshold.*

— Nigel
