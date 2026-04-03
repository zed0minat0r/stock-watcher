# StockPulse — SIXTH AUDIT v6 (Nigel)
**Date:** 2026-04-03
**Auditor:** Nigel (Strict Auditor)
**Live Site:** https://zed0minat0r.github.io/stock-watcher/
**Perspectives:** Mobile (375px) + Desktop/Display Mode
**Previous Audits:** v1: 5.4 | v2: 6.3 | v3: 6.9 | v4: 7.2 | v5: 7.4

---

## Scoring Calibration
- 5.0 = average/basic | 5.5 = functional but generic | 6.0 = generic template
- 7.0 = genuinely better than most (HIGH bar) | 8.0 = user would choose over competitors
- 9.0 = award-worthy

**Benchmark competitors:** Robinhood, Yahoo Finance, TradingView

---

## What Changed Since v5 (7.4)

Two commits landed after the v5 audit:

1. **`fix: mobile alignment, live tape indices, volume bars on chart`** — Addressed v5 mobile alignment notes. Ticker tape now fetches live ETF quotes (SPY/DIA/QQQ/IWM) from Finnhub on load and refreshes every 60s. Volume histogram series added to the modal candlestick chart (`addHistogramSeries` with `priceScaleId: 'volume'` at 80% top margin, 20% opacity directional coloring). Mobile remove button (`@media hover:none`) now always visible via `opacity:1`.

2. **`feat: sort/filter toolbar, portfolio summary strip, keyboard nav in display mode`** — Adds a sort/filter toolbar (Default, Top Gainers, Top Losers, Price ↓, A–Z) above the grid. Adds a portfolio summary strip (gainer/loser count, best/worst ticker). Arrow-key navigation in display mode (left/right/up/down cycle cards). Keyboard shortcut `r` to refresh, `f` to enter display mode.

These directly addressed v5 priorities #1 (sort/filter), #2 (portfolio summary), and partially #3 (live tape).

---

## Category Scores

### 1. Visual Design — 7.3/10
The dark Bloomberg-inspired theme remains the strongest asset. The green/red gradient accent bars on cards, the dot-grid background, ambient glow animations, and the gradient brand logo all feel cohesive and deliberately crafted. The ticker tape with fade edges is a nice finishing touch.

**What pulls it back from higher:**
- The card entrance animation (`cardSlideUp`) only has hardcoded delays for 8 cards (nth-child 1–8). Cards 9+ all enter simultaneously with no stagger — obvious on large watchlists.
- The "live pulse" animation on prices (`livePulse` at 2.5s) pulsing opacity is distracting after the novelty wears off. Real trading apps (Bloomberg, Robinhood) flash *once* on update, then stop. Continuous pulsing is visual noise.
- `ambientPulseGreen/Red` — every single card continuously breathes its box-shadow. On a grid of 8 cards all breathing at 4s out-of-phase, it creates visual chaos. This is a design regression introduced in v2 that has never been addressed.
- No light mode. Not required but limits audience.
- Volume bars in the modal chart are barely visible (20% opacity). Users will not notice they exist.

### 2. Mobile UX (375px) — 7.0/10
Significantly improved over previous audits. The centered card layout works. The search drawer (toggle button → expand) is correct for mobile. The 44px minimum touch targets are implemented throughout. The always-visible remove button on touch devices is properly handled via `@media (hover: none)`.

**Remaining issues:**
- The sort toolbar at 375px wraps onto two lines (5 buttons: Default, Top Gainers, Top Losers, Price ↓, A–Z). At small widths, "Top Gainers" and "Top Losers" are too wide to fit 2-per-row cleanly. This creates an unbalanced, awkward wrap.
- Portfolio summary on mobile hides the "Best" and "Worst" stock items (`.ps-item.ps-best, .ps-item.ps-worst { display: none }`). The strip then reads "3 gainers · 5 losers" with no further context. The most valuable info (which stock led) is hidden on the device most users will view this on.
- Modal chart height is 260px on mobile. That's acceptable but tight for a candlestick chart — OHLC wicks become very small.
- The ticker tape at 375px (`font-size: 0.76rem; padding: 0 14px`) is readable but shows only ~2 items at once. At 30s animation, the user waits a while to see all indices. No ability to pause or manually scroll.
- Search input `font-size: 16px` is correct (prevents iOS zoom) — good.

### 3. Desktop/Display Mode — 7.5/10
Display mode is the most differentiated feature of this app — it genuinely separates StockPulse from generic dashboards. The 4×2 grid, fullscreen support, auto-rotation with glow highlight, live clock, and keyboard nav all work well together.

**Issues:**
- Display mode always shows a 4×2 grid regardless of how many stocks are in the watchlist. With the default 8 tickers it fills perfectly. With 5 tickers, there are 3 empty grid cells — visually broken.
- The `grid-template-rows: repeat(2, 1fr)` is hardcoded. This means with 4 stocks there are 4 empty half-height rows. The grid should use `auto-fit` or adjust rows dynamically.
- Display card price uses `color:var(--green)` or `color:var(--red)` inline style on the price (`d-price`), but the company name is `var(--text-secondary)`. This is fine but the price domination of color is slightly redundant with the trend accent bar. 
- Pagination (for >8 stocks) is present and tested — good.
- Keyboard arrows work. The hint (`← →`) is shown on desktop — good. Hidden on mobile correctly.
- The auto-rotation label "Auto-rotating every 10s" is accurate. The display footer is clean.

### 4. Charts — 7.2/10
Real Finnhub candlestick data via `/stock/candle` with 5-minute resolution for 1W and daily resolution for longer periods. The 5-timerange selector (1W/1M/3M/6M/1Y) works. Crosshair OHLC tooltip is clean and well-positioned. Volume histogram is now present.

**Issues:**
- Volume bars at `rgba(78,168,246,0.2)` (20% blue opacity) are nearly invisible. A user casually looking at the chart will not notice them. Standard convention is green/red at ~25–35% opacity. The code does set directional color correctly (`rgba(0,214,114,0.20)` / `rgba(255,71,87,0.20)`) but the opacity is too low.
- The 1W chart uses 15-minute candles. For a 5-day period, this means ~130 candles — reasonable. However for 1Y (`days=365`), the API call window is `now - 365*86400` to `now`. Finnhub free tier rate limits may cause silent failures for large date ranges, falling back to `_generateFallbackCandles()` without user feedback.
- Chart tooltip positioning: when hovering near the left edge of the chart, the tooltip jumps between right and left side based on `x > containerRect.width / 2` — this is correct logic but the threshold is the center, meaning for the left 50% of the chart the tooltip always appears to the right, potentially overlapping the candles. Should anchor to cursor proximity from the right edge instead.
- No option to view as a line chart vs candlestick. This is a common user preference.
- Sparklines: `fetchCandleData(ticker, 30, 'sparkline')` fires for every card on render. With 8 default tickers that's 8 API calls on load, in addition to 8 quote+metric calls (16 API calls) and 4 tape calls — 28 total Finnhub requests on first load. Free tier is 60 calls/minute but this is high.

### 5. Search & Navigation — 7.5/10
The autocomplete via Finnhub `/search` is a genuine differentiator. The 250ms debounce is correct. ARIA combobox role, `aria-expanded`, `aria-activedescendant` — all properly implemented. The "/" keyboard shortcut to focus search is a power-user feature that feels professional.

**Issues:**
- The autocomplete filters for `Common Stock`, `ETP`, `ADR`, and `!type`. But Finnhub returns many XETRA/OTC duplicates for the same ticker (e.g. AAPL appears as AAPL, AAPL.BA, AAPL.BE). Users who type "AAPL" see duplicate entries. No deduplication by symbol.
- Adding a ticker that already has live data but is not in `FALLBACK_DATA` shows "Looking up..." then fetches — this is correct behavior. But the search input stays blank if the ticker is invalid, with no indication of what was rejected beyond a toast. Toasts disappear in 2.5s and users on slow connections may miss the error.
- The watchlist cap (20 tickers) has no visual indicator of how many slots remain. At 18/20 users get no warning until they hit the wall.
- No way to reorder the watchlist. Drag-to-reorder is a standard expectation for watchlists.

### 6. Data Quality — 6.8/10
The data quality situation is structurally sound but has trust issues a real user would notice.

**Issues:**
- The fallback data (`FALLBACK_DATA`) dates from the original build. Prices like TSLA at $271.30, NVDA at $118.62 are ~6 months stale if the API fails. A user on a corporate firewall or with an exhausted API key will silently see old prices with a "Sample data - HH:MM" timestamp. The distinction between live and fallback is only visible in the tiny "● live data" badge — easy to miss.
- The tape still includes VIX at 16.82, DXY at 104.28, Gold at 2345.80, Crude at 78.42 — hardcoded statics that never update. These are in the "live" ticker tape. Users who know these markets will immediately spot stale VIX or gold prices. There's no "static" indicator to differentiate these from the live ETF entries.
- `formatBigNumber` is called on `cap` but Finnhub returns market cap in millions. The code multiplies by `1e6` — correct. But `formatBigNumber` then checks `>= 1e12` for T, `>= 1e9` for B, etc. For AAPL at ~$3.28T this should display correctly. Verified in code — this is fine.
- Volume formatting: on initial load before live data, `getFallbackData` pre-formats volume as a string (`formatBigNumber(base.volume)`). Live data stores raw numbers. The UI handles both via the `typeof d.volume === 'string'` check — correct but fragile. Adding a new ticker with live data would double-format if this check fails.
- No pre/after-hours price data. Robinhood and Yahoo Finance show extended hours prices prominently. This is a notable absence for serious users.

### 7. Performance — 6.5/10
The app works but the API call volume is a real concern.

**Issues:**
- On first load: 8 quote calls + 8 metric calls + 4 tape calls + 8 sparkline calls = **28 API requests**. Finnhub free tier is 60/minute. If the user has >8 tickers, they approach the limit immediately.
- Sparkline data is cached (`_candleCache` with 5-min TTL) — good. But the cache is in-memory and lost on every page refresh. Every hard refresh triggers the full 28-call burst.
- `loadAndRender()` is called every 60 seconds (`REFRESH_INTERVAL`). Each call fires 8 quote + 8 metric calls = 16 more. Plus sparklines re-render (but hit cache for 5 min). This is sustainable but means 16 API calls/minute sustained — 960/hour on a free tier of 60/minute. This would cause API errors for active users.
- The `LightweightCharts` library is loaded from `unpkg.com` CDN with `defer`. No SRI hash, no local fallback. If unpkg is down the entire app is broken.
- No service worker or offline support. Expected for a v1 app, noted for completeness.
- `will-change: transform` on the ticker tape is correct. `backdrop-filter: blur(16px)` on the header and `blur(8px)` on cards may cause performance issues on low-end Android devices — not catastrophic but noted.

### 8. Accessibility — 7.3/10
The accessibility implementation is clearly deliberate and above average for a solo project.

**Strengths:**
- Skip-to-content link present and functional.
- ARIA combobox on search with full keyboard navigation.
- Focus trap in modal (Tab/Shift+Tab wrap).
- Focus return to triggering element on modal close.
- `role="dialog"` on modal, `role="radiogroup"` on sort buttons and time range.
- `aria-live="polite"` on stock grid and portfolio summary.
- `prefers-reduced-motion` properly kills all animations and stops ticker tape.
- Screen-reader chart summary (`generateChartA11ySummary`) is a standout feature.
- All icon buttons have `aria-label`.
- 44px minimum touch targets throughout.

**Remaining issues:**
- The sort buttons use `role="radio"` and `aria-checked` but are inside a `role="radiogroup"`. Radio group semantics expect only one item checked at a time — this is correctly implemented. However, pressing Space on a radio button should select it (like a real radio). Currently only click is wired. Keyboard `Space` fires the `keydown` on the card (which opens the modal for stock cards) — the sort buttons themselves would only respond to `Enter` or `click`.
- The display overlay has no `role` attribute and no `aria-label`. Screen reader users entering display mode have no context.
- `aria-label="Stock detail"` on the modal is generic. It should include the ticker name (set dynamically when modal opens).
- The ticker tape (`aria-label="Market indices ticker tape"`) contains scrolling text but no mechanism to pause it (WCAG 2.1 SC 2.2.2 requires users to be able to pause moving content). The `prefers-reduced-motion` handles this for users with that preference set, but there's no visible pause button for others.

### 9. Overall App Feel — 7.2/10
StockPulse is now genuinely good. The combination of real API data, the display mode feature, the animated ticker tape, OHLC charts with crosshair tooltips, live portfolio summary, and sort toolbar puts it solidly above "generic template." A real user encountering this for the first time would be impressed.

**What prevents it from being an 8.0:**
- The relentless breathing animations (cards, logo, market status) create visual fatigue. A polished app uses motion purposefully — to signal state change, not as ambient decoration.
- The data trust gap: mixing stale hardcoded fallback data (VIX/DXY/Gold/Oil in the tape, FALLBACK_DATA prices that are 6+ months old) with "live" data labeling is a credibility problem. A finance user who spots an obviously wrong VIX reading stops trusting everything.
- No watchlist persistence beyond localStorage. On a shared computer or private browsing, the default 8 tickers reset — fine. But there's no export/import, no URL sharing of a watchlist.
- The app has no onboarding — a first-time user doesn't know to press `/` for search, `f` for display mode, `r` to refresh. A tooltip or keyboard shortcut hint somewhere would elevate the UX.

---

## Score History

| Audit | Date       | Score | Key Addition |
|-------|------------|-------|--------------|
| v1    | 2026-01-xx | 5.4   | Baseline |
| v2    | 2026-02-xx | 6.3   | Real Finnhub data, autocomplete, mobile fixes |
| v3    | 2026-02-xx | 6.9   | Real chart data, collapsed header, ARIA combobox |
| v4    | 2026-03-xx | 7.2   | Ticker tape, OHLC crosshair, mobile polish |
| v5    | 2026-04-03 | 7.4   | Live metrics, display sparklines, range bar, dot grid bg |
| v6    | 2026-04-03 | 7.4   | Sort toolbar, portfolio summary, keyboard nav, volume bars, live tape |

---

## Overall Score: 7.4 / 10

The score holds at 7.4. The new features (sort toolbar, portfolio summary, live tape ETFs, volume bars, keyboard nav) are all real improvements. However, the score doesn't advance because the same core problems from v4–v5 remain unresolved: the ambient breathing animations causing visual noise, stale hardcoded fallback prices mixed into "live" displays, and the ticker tape's unchecked WCAG pause requirement. The app is iterating horizontally (adding features) instead of vertically (fixing quality issues that prevent trust).

---

## Top 3 Priorities for v7

### Priority 1: Kill the Ambient Breathing Animations
Remove `ambientPulseGreen` and `ambientPulseRed` from stock cards. Replace `livePulse` (continuous opacity fade) on prices with a one-shot flash when the price actually changes — which is already implemented as `flash-up` / `flash-down` / `price-flash-up` / `price-flash-down`. The logo pulse and market status pulse can stay (they're small and meaningful). Every other card breathing on an infinite loop is visual noise that makes the app feel less professional, not more. This single change would raise the Visual Design and Overall Feel scores.

### Priority 2: Fix the Stale Static Data in the Ticker Tape
VIX, DXY, Gold, and Crude Oil in the ticker tape are hardcoded and never update. Either: (a) remove them from the tape entirely and only show the 4 live ETFs, or (b) add a clear "Static" label/style to distinguish them from live items (opposite of the green dot), or (c) replace with additional ETFs that can be fetched live (GLD for gold, USO for oil, UUP for dollar, VIXY for VIX proxy). The current state — stale data presented alongside live data with no differentiation — is a credibility issue for a finance app.

### Priority 3: Add a Ticker Tape Pause Button (WCAG 2.2.2)
WCAG 2.1 Success Criterion 2.2.2 requires that users can pause, stop, or hide moving content that lasts more than 5 seconds. The ticker tape scrolls indefinitely. The `prefers-reduced-motion` media query handles screen-reader and reduced-motion users but doesn't cover all users. Add a small pause/play button at the right edge of the ticker tape wrapper. This resolves an actual accessibility violation (not just a best practice) and also improves usability for users who want to read a specific index value without it scrolling away.

---

## Bonus Notes (Lower Priority)

- **Sort button wrapping on mobile:** The 5 sort buttons wrap awkwardly at 375px. Consider collapsing to a `<select>` dropdown on mobile, or reduce button labels ("Gainers" instead of "Top Gainers").
- **API rate limit risk:** 28 requests on first load approaches Finnhub's 60/minute free tier limit. Consider batching sparkline fetches with a 100ms stagger, or deferring sparklines until after the main grid renders.
- **Autocomplete deduplication:** Filter autocomplete results to unique symbols only (many tickers appear for multiple exchanges).
- **Watchlist slot counter:** Show remaining watchlist capacity (e.g., "14/20") somewhere near the search bar.
- **Onboarding tooltip:** A single dismissible banner on first visit explaining `/` for search, `f` for display mode would add polish.
