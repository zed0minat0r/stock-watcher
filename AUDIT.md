# StockPulse — THIRD AUDIT v3 (Nigel)
**Date:** 2026-04-01  
**Auditor:** Nigel (Strict Auditor)  
**Live Site:** https://zed0minat0r.github.io/stock-watcher/  
**Perspectives:** Mobile (375px) + Desktop/Display Mode  
**Previous Audits:** v1 scored 5.4, v2 scored 6.3

---

## Scoring Calibration
- 5.0 = average/basic | 5.5 = functional but generic | 6.0 = generic template
- 7.0 = genuinely better than most (HIGH bar) | 8.0 = user would choose over competitors
- 9.0 = award-worthy

**Benchmark competitors:** Robinhood, Yahoo Finance, TradingView

---

## 1. Visual Design — 6.6 / 10 (v2: 6.5, +0.1)

**What improved:**
- Gain/loss badge colors updated to `#e6fff2` on green bg and `#ffe6e9` on red bg. These are high-contrast, legible pairings. WCAG AA compliant against their semi-transparent backgrounds on the dark card surface. This resolves the v2 contrast flag on those badges.
- Market status badges (`#2cff8e` for open, `#ffa3ac` for closed) are bright enough against their pill backgrounds. Acceptable.

**Unchanged / still holding it back:**
- Logo remains a Unicode diamond (`&#9670;`). Still placeholder-tier. Every competitor has a proper SVG/icon mark.
- Buttons still use Unicode characters (`&#8635;`, `&#9974;`, `&#10005;`, `&#128269;`). Cross-browser rendering inconsistency persists. A lightweight icon set (Lucide, Phosphor) would solve this instantly.
- No hero, no landing personality. Opens straight to grid. Fine for a tool, limits emotional impact.
- Card hover is still conservative (`translateY(-2px)` + border glow). Functional, not exciting.
- The "breathing glow" claim: `@keyframes activeGlow` exists on `.display-card.active` (pulsing box-shadow at 3s intervals). This is display mode only, not dashboard cards. It is a subtle, tasteful effect — but does not materially change the visual design score for the dashboard.
- No meaningful visual design leap since v2. The contrast fixes are correctness, not design advancement.

**Score rationale:** The design is clean, professional dark fintech. Above template territory due to glassmorphism + directional accent bars + inner glow layering. But still not at the level where a user would say "this looks better than Robinhood." Holding at 6.6 — the contrast fixes earn a marginal bump for correctness.

---

## 2. Mobile UX (375px) — 7.0 / 10 (v2: 6.3, +0.7)

**What improved — this is the biggest single-area jump for v3:**
- **Header collapsed from 3 rows to 1 row.** This was the #2 v2 recommendation and it is properly resolved. The header is now a single `.header-row` with logo/market-status on the left and icon buttons on the right. Search is hidden behind a toggle button (`#search-toggle-btn`) that opens a `.header-search` drawer below the header. This reclaims ~80px of viewport space on iPhone SE.
- **All tap targets confirmed at 44px minimum.** `min-height: 44px` on `#search-input`, `.icon-btn`, `#search-btn`, `.modal-close-btn`, `.search-autocomplete-item`, `.card-remove` (44x44 on touch devices). `.tr-btn` (time range buttons) also at `min-height: 44px`. This is thorough.
- **16px font on search input** (`font-size: 16px` with comment "Prevents iOS zoom on focus"). Correct — this prevents the iOS auto-zoom that plagues many web apps.
- **Search drawer toggle** is clean: magnifying glass icon, `.active` state with blue highlight when open, auto-focuses the input on open. Good UX pattern.
- **Remove button** 44x44px on touch devices with proper absolute positioning. No longer hidden behind hover.
- **Autocomplete items** have `text-overflow: ellipsis` + `overflow: hidden` on `.ac-name`. This addresses the v2 concern about long company names overflowing on narrow screens.

**Still holding it back:**
- No `env(safe-area-inset-bottom)` for iPhone notch/home indicator. Toast notifications at `bottom: 24px` could still be obscured on modern iPhones.
- Chart modal height still 260px on mobile — cramped for candlestick data with real OHLC.
- No pull-to-refresh or swipe gestures. These are expected on mobile finance apps.
- Desktop media query at 601px shows search toggle but search drawer is hidden by default on desktop too — this means desktop users also need to click to search, which is an extra step compared to always-visible search. Acceptable tradeoff but noted.

**Score rationale:** The 1-row header is the single most impactful mobile UX change since v1. Combined with 44px tap targets everywhere and 16px input font, this now meets the bar for "genuinely better than most" mobile web finance dashboards. The remaining issues (safe-area, gestures) are polish. This earns 7.0.

---

## 3. Desktop / Display Mode — 7.2 / 10 (v2: 6.8, +0.4)

**What improved:**
- **Smooth display mode transitions.** `.display-card` has `transition: border-color 0.6s ease, box-shadow 0.6s ease, transform 0.6s ease, background 0.6s ease, opacity 0.6s ease`. The active card swap is no longer an instant class toggle — it smoothly fades glow, scales, and shifts opacity. This addresses the v2 complaint about instant class swap.
- **Breathing glow on active card.** `@keyframes activeGlow` pulses the box-shadow between 32px and 48px blue glow on a 3s cycle. Subtle and tasteful — gives the active card a living, ambient quality on a wall-mounted display.
- **Inactive card dim.** `.display-card { opacity: 0.75 }` with `.display-card.active { opacity: 1 }`. This creates clear visual hierarchy — the active card pops while inactive cards recede. Combined with the 0.6s opacity transition, the rotation feels cinematic.
- **Enhanced nav dots.** `.display-dot.active` scales to 1.4x with blue glow (`box-shadow: 0 0 8px rgba(78,168,246,0.5)`). Smooth 0.6s transition. These are a small but meaningful polish detail for display mode.
- **Real sparkline data on dashboard cards** (fetched from Finnhub `/stock/candle`). This means dashboard cards now show real 30-day price trends, not random walks. The sparklines are meaningful. However, display mode cards still do not show sparklines.

**Still holding it back:**
- Display mode still has no sparklines or mini-charts on cards — just numbers. A wall-mounted TV has room for trend lines.
- 3.4rem for price is acceptable for desk monitor but still not ideal for across-the-room 55" TV viewing (would need 4.5-5rem).
- Desktop dashboard maxes at `max-width: 1440px`. On 4K monitors, significant empty space.
- No drag-to-reorder cards.
- Search drawer hidden by default on desktop — users must click toggle to add stocks.

**Score rationale:** The display mode now feels like a proper ambient dashboard with the transition animations, breathing glow, dim/active contrast, and nav dots. It is no longer a static grid that flips cards — it is a living display. This is a genuine quality-of-life improvement that a user mounting this on a monitor would appreciate. Earns 7.2.

---

## 4. Charts — 7.0 / 10 (v2: 5.5, +1.5)

**What improved — this is the most transformative change in v3:**
- **Real historical data from Finnhub `/stock/candle` API.** `fetchCandleData()` makes authenticated requests with proper resolution selection (15-min for 5-day, daily for longer). Data is parsed into `{ time, open, high, low, close }` OHLC format. This replaces the entirely fake `generateChartData()` and `generateSparklineData()` functions that were the #1 v2 complaint.
- **Sparklines now show real 30-day close prices.** `renderSparkline()` calls `fetchCandleData(ticker, 30, 'sparkline')` which returns close-only data. The sparkline on a +3% stock will now actually show an upward trend matching reality. This was the single biggest credibility gap.
- **Candlestick modal uses real OHLC data.** `renderModalChart()` calls `fetchCandleData(ticker, days, 'candle')` with the selected time range. Multiple ranges available: 1W, 1M, 3M, 6M, 1Y.
- **Intelligent caching.** `_candleCache` with 5-minute TTL prevents redundant API calls. Cache key includes ticker + resolution + days. This is proper engineering.
- **Graceful fallback.** When API returns `s !== 'ok'` or fetch fails, it falls back to `_generateFallbackSparkline()` / `_generateFallbackCandles()`. The app degrades gracefully instead of showing empty charts.
- **AbortSignal.timeout(8000)** prevents hanging requests.

**Still holding it back:**
- **Crosshair still disabled** (`mode: 0`) on both sparkline and modal chart. Users cannot hover to see price/date on any point. This is a significant interaction gap — even Yahoo Finance's basic charts support hover tooltips.
- No volume bars on candlestick chart.
- No technical indicators (MA, RSI, MACD). TradingView has 100+; even a single 50-day MA would add analytical value.
- No chart drawing tools.
- Fallback data is still random walks — when API fails, users see fake data without clear indication. The "Sample data" label mentioned in v2 is not prominently shown.
- Finnhub free tier may not return data for all tickers or all time ranges, so fallback frequency depends on portfolio composition.

**Score rationale:** This is the change that vaulted Charts from the weakest area to a respectable one. Real OHLC data with proper caching and graceful fallback is what a stock watcher needs. The sparklines are now meaningful visual signals. However, no crosshair/tooltip on hover is a real gap — users cannot inspect specific prices on the chart, which limits its utility to "glance at trend" rather than "analyze data." No volume, no indicators. This earns 7.0: genuinely better than most hobby projects, but clearly below Yahoo Finance or TradingView in charting depth.

---

## 5. Search & Navigation — 7.0 / 10 (v2: 6.5, +0.5)

**What improved:**
- **ARIA combobox pattern fully implemented.** `role="combobox"` on input, `aria-expanded`, `aria-autocomplete="list"`, `aria-controls="search-autocomplete"`, `aria-activedescendant` on the input. `role="listbox"` on dropdown container. `role="option"` + `aria-selected` on each item. This was the #3 v2 recommendation and it is properly implemented per WAI-ARIA 1.2 combobox pattern.
- **Chart time range buttons** now have `role="radiogroup"` on the container and `role="radio"` + `aria-checked` on each button. This was specifically flagged in the v2 accessibility/search rec.
- **Search drawer toggle** makes the search discoverable on mobile without consuming permanent header space. The `aria-label="Toggle search"` on the button is correct.

**Unchanged (still good from v2):**
- Finnhub autocomplete with debounced input, arrow key navigation, Enter/Escape, click-to-select, click-outside-to-close.
- Fake ticker blocking with error toast.

**Still holding it back:**
- No watchlist sorting (by price, change%, name).
- No filtering or grouping by sector/performance.
- No recent/popular suggestions in autocomplete.
- No drag-to-reorder cards.
- Search hidden behind toggle on all screen sizes — could be always-visible on desktop for faster access.

**Score rationale:** The ARIA combobox and radiogroup additions complete the accessibility story for search and chart controls. The search UX is now both functionally solid and screen-reader accessible. 7.0 — meets the "genuinely better than most" bar for a web dashboard search experience.

---

## 6. Data Quality — 6.5 / 10 (v2: 5.8, +0.7)

**What improved:**
- **Real historical chart data.** This was the #1 v2 recommendation. Sparklines and candlestick charts now show real Finnhub OHLC data. The fundamental credibility gap of "beautiful restaurant serving plastic food" is resolved — the food is now real.
- **5-minute candle cache** prevents stale chart data while respecting API rate limits.

**Unchanged (still present from v2):**
- Real Finnhub API key with live quote data for price/change/pct.
- Ticker validation prevents adding nonexistent symbols.

**Still holding it back:**
- Volume, market cap, 52-week high/low still come from hardcoded `FALLBACK_DATA`. These are stale snapshots. A user sees real-time price next to potentially months-old volume/cap figures.
- Company names for non-fallback tickers still default to the ticker symbol via `COMPANY_NAMES` lookup.
- When candle API fails, fallback is random-generated data with no clear "Demo Data" badge. Users cannot distinguish real from fake chart data.
- Auto-refresh every 60s with multiple tickers consumes Finnhub free-tier quota. 8 default tickers + candle fetches can hit the 60/min limit.
- API key is hardcoded in source code (visible to anyone inspecting the page). Not a security best practice, though acceptable for a free-tier key in a demo.

**Score rationale:** The real chart data is a meaningful credibility improvement. But stale fallback metrics (volume, cap, 52w range) sitting next to real-time prices creates a subtle data integrity issue. And the invisible fallback-to-fake-charts when API fails is still deceptive. 6.5.

---

## 7. Performance — 6.8 / 10 (v2: 6.8, +0.0)

**No meaningful change.**

- Real API candle fetches add network requests but the 5-minute cache mitigates this well.
- `AbortSignal.timeout(8000)` on candle fetches prevents hung requests.
- Sparklines are still destroyed and recreated on every refresh for all cards.
- No lazy loading of off-screen sparklines.
- No service worker or offline support.
- Single HTML/CSS/JS architecture remains lean.

**Score rationale:** Performance was already adequate. The candle caching is good engineering but doesn't change the overall performance profile. 6.8.

---

## 8. Accessibility — 7.0 / 10 (v2: 6.2, +0.8)

**What improved:**
- **Full ARIA combobox pattern on search.** `role="combobox"`, `aria-expanded`, `aria-activedescendant`, `aria-autocomplete="list"`, `aria-controls` on the input. `role="listbox"` on dropdown. `role="option"` + `aria-selected` on each item. This was the #3 v2 recommendation and it is textbook-correct.
- **Chart time range buttons** have `role="radiogroup"` on container, `role="radio"` + `aria-checked` on each button. Screen readers can navigate these as a proper radio group.
- **Search toggle button** has `aria-label="Toggle search"`.

**Unchanged (still good from v2):**
- `tabindex="0"` + `role="button"` + descriptive `aria-label` on stock cards.
- Keyboard activation (Enter/Space) on cards.
- Focus trap on modal with tab wrapping.
- Focus moves to close button on modal open.
- `aria-live="polite"` on stock grid.
- Toast with `role="alert"` + `aria-live="assertive"`.
- WCAG contrast on `--text-muted` (#7a8592).
- `prefers-reduced-motion: reduce` media query.
- Global `:focus-visible` outline.

**Still holding it back:**
- No skip-to-content link. Screen reader users must tab through header to reach stock grid. This has been flagged since v2.
- Chart content remains entirely inaccessible to screen readers — no alt text or data table fallback for the canvas-rendered charts.
- `prefers-color-scheme` not supported — dark mode only.
- Modal focus trap comment says "Focus trap" but the implementation only moves focus to close button — the actual trap via keydown listener is separate. Works correctly but could be cleaner.

**Score rationale:** The ARIA combobox and radiogroup additions are substantial. The search is now a proper accessible widget. Combined with the strong v2 foundation (card roles, focus trap, reduced motion, live regions), this is a genuinely accessible web app. The remaining gaps (skip-to-content, chart alt text) prevent it from reaching 7.5+. Earns 7.0.

---

## 9. Overall App Feel — 7.0 / 10 (v2: 6.2, +0.8)

**Summary:** StockPulse has crossed a meaningful threshold with v3. The two most impactful changes are:

1. **Real chart data** — Sparklines and candlestick charts now show actual Finnhub OHLC history. The app no longer serves "plastic food." When a stock is up 3%, its sparkline shows a real upward trend from the past 30 days. When you open a candlestick chart, you see real daily OHLC bars. This transforms the app from a styled prototype into a functional tool.

2. **Collapsed mobile header** — The 3-row header that consumed ~120px is now a single row with search behind a toggle. This gives mobile users significantly more viewport for what matters: the stock cards.

The display mode now feels alive with breathing glow, smooth transitions, and inactive card dimming. The ARIA combobox makes search fully accessible. 44px tap targets and 16px input font show mobile-first attention to detail.

**Compared to competitors:** Still not at Robinhood (cleaner design, real portfolio integration), Yahoo Finance (vastly deeper data + news), or TradingView (professional charting). But StockPulse is now a credible, functional stock watchlist dashboard. A user who just wants to monitor 5-10 tickers on a desk monitor or phone would find this genuinely useful — which was not true with fake chart data.

---

## OVERALL SCORE: 6.9 / 10 (v2: 6.3, +0.6)

| Area | v1 Score | v2 Score | v3 Score | v2→v3 Change |
|------|----------|----------|----------|--------------|
| Visual Design | 5.8 | 6.5 | 6.6 | +0.1 |
| Mobile UX (375px) | 5.5 | 6.3 | 7.0 | +0.7 |
| Desktop / Display Mode | 6.0 | 6.8 | 7.2 | +0.4 |
| Charts | 5.5 | 5.5 | 7.0 | +1.5 |
| Search & Navigation | 5.0 | 6.5 | 7.0 | +0.5 |
| Data Quality | 4.5 | 5.8 | 6.5 | +0.7 |
| Performance | 6.5 | 6.8 | 6.8 | +0.0 |
| Accessibility | 4.5 | 6.2 | 7.0 | +0.8 |
| Overall App Feel | 5.5 | 6.2 | 7.0 | +0.8 |
| **Weighted Average** | **5.4** | **6.3** | **6.9** | **+0.6** |

---

## TOP 3 PRIORITY RECOMMENDATIONS

### 1. Enable Crosshair + Hover Tooltip on Charts (High — usability gap)
Both sparkline and modal charts have crosshair disabled (`mode: 0`). Users cannot hover to see the price and date at any point on the chart. This is the single most common interaction on any financial chart — "what was the price on March 15?" Enable `CrosshairMode.Normal` on the modal chart and add a tooltip overlay showing OHLC + date. Even a basic crosshair would significantly increase the chart's analytical utility. Also consider adding a volume histogram below the candlestick chart.

### 2. Live Metrics Beyond Price (Medium — data completeness)
Volume, market cap, and 52-week high/low are still hardcoded in `FALLBACK_DATA`. These are displayed alongside real-time price, creating a subtle data integrity issue. Finnhub `/stock/metric` endpoint (free tier) provides 52-week high/low and other fundamentals. Finnhub `/quote` returns volume. Fetching these on refresh would make the entire card data layer real, completing the credibility story that real chart data started.

### 3. Skip-to-Content Link + Chart Accessibility (Medium — a11y completeness)
Add a visually-hidden skip-to-content link as the first focusable element, jumping to `#stock-grid`. This is low-effort, high-impact for screen reader users. Also, when chart data loads, generate a brief `aria-label` or visually-hidden summary (e.g., "AAPL price chart: opened at $210.50, closed at $213.25, 30-day range $198-$215"). Canvas charts are inherently inaccessible; a text summary bridges the gap.

---

*v3 audit complete. Charts (+1.5) is the biggest mover — real Finnhub candle data resolves the #1 credibility issue from v1 and v2. Mobile UX (+0.7) and Accessibility (+0.8) also show strong gains from header collapse and ARIA combobox. The app is approaching 7.0 territory. Enable chart crosshairs and live metrics to push past it.*

— Nigel
