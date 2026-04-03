# StockPulse — FIFTH AUDIT v5 (Nigel)
**Date:** 2026-04-03
**Auditor:** Nigel (Strict Auditor)
**Live Site:** https://zed0minat0r.github.io/stock-watcher/
**Perspectives:** Mobile (375px) + Desktop/Display Mode
**Previous Audits:** v1 scored 5.4, v2 scored 6.3, v3 scored 6.9, v4 scored 7.2

---

## Scoring Calibration
- 5.0 = average/basic | 5.5 = functional but generic | 6.0 = generic template
- 7.0 = genuinely better than most (HIGH bar) | 8.0 = user would choose over competitors
- 9.0 = award-worthy

**Benchmark competitors:** Robinhood, Yahoo Finance, TradingView

---

## What Changed Since v4

Two commits landed after the v4 7.2 audit:

1. **`feat: live metrics, display sparklines, chart accessibility`** — Directly tackled v4 recommendations #1 (live metrics) and #2 (display sparklines) and #3 (chart a11y). The `fetchFromFinnhub()` function now fetches `/stock/metric?metric=all` in parallel with the quote, pulling real 52-week high/low, market cap, and volume from the API instead of FALLBACK_DATA. Display mode cards now have `<div class="d-sparkline" id="dspark-{ticker}">` with a full `renderDisplaySparkline()` implementation. A `generateChartA11ySummary()` function injects a `.sr-only` text description of the chart after data loads.

2. **`UI/UX polish: day range bar, display card trend accents, grid dot bg`** — Adds a visual day range bar (low/current/high track with thumb indicator) to both main cards and display cards. Adds the Bloomberg-style dot grid background (`body::before` with `radial-gradient`). Adds trend accent bars to display cards (`display-card::before` with green/red gradient, matching main cards).

These are the three features flagged as highest priority in the v4 audit. This is meaningful iteration.

---

## 1. Visual Design — 7.5 / 10 (v4: 7.2, +0.3)

**What improved:**

- **Grid dot background is now implemented.** `body::before` uses `radial-gradient(circle, rgba(37, 48, 64, 0.55) 1px, transparent 1px)` at 28px × 28px intervals, fixed to the viewport. This is the Bloomberg terminal aesthetic that was called out in v4 as absent. The subtle matrix pattern gives the dark background texture without competing with content. The opacity level is well-calibrated — visible on an empty background, invisible behind card content.

- **Day range bar on main cards.** A visual low-to-high price track with gradient fill and a white thumb dot showing current price position. Labels show formatted low/high values with "Day Range" label in the center. The implementation is clean: CSS-only track/fill/thumb with JS-calculated percentage position. The gradient fill (`var(--gradient-brand)`, green-to-blue) adds a polished branded touch to an otherwise functional element. On live data this is genuinely useful; on fallback data it shows the day high/low which defaults to `dayHigh: q.h` (real intraday high from Finnhub quote endpoint).

- **Display card trend accent bars.** `display-card::before` now has `background: linear-gradient(90deg, var(--green-dim), var(--green))` for up stocks, red gradient for down. 0.25 opacity glow on shadow. This was the missing visual parity between main cards and display mode cards — now unified.

**Still holding it back:**

- Logo icon remains Unicode `&#9670;`. The gradient text is polished; the diamond icon is not. A custom SVG favicon or logo mark would close this gap.
- Header action buttons still Unicode (`&#8635;`, `&#9974;`, `&#128269;`). The rest of the app uses SVG (trend arrows), making these stand out as inconsistent.
- Color palette is deliberate but narrow. No secondary accent moments (gold for watchlist stars, purple for alerts, etc.). All interactions are green/red/blue.
- The dot grid background only appears where `body::before` shows through — behind the header/tape it's covered by the header's own background, and behind cards it's covered by card backgrounds. The effect is most visible in the dashboard gutters between cards. On a 4-column desktop layout with 8 cards, very little background shows at all.

**Score rationale:** The grid dot background, range bar, and display accent bars are all genuine visual improvements. The dot grid adds texture and professional depth. The range bar adds a new data visualization element that wasn't present before. Combined with v4's ticker tape, card glow system, and gradient logo, the visual design has a clear identity. It is now visually competitive with mid-tier fintech dashboards — not Robinhood-level polish, but no longer a "clean template." The gap to 8.0 is mainly icon consistency and accent variety. 7.5.

---

## 2. Mobile UX (375px) — 7.3 / 10 (v4: 7.2, +0.1)

**What improved:**

- **Day range bar on mobile cards.** The range bar renders on mobile cards when live data provides `dayHigh`/`dayLow`. At 375px with 14px card padding, the track is full-width and the thumb is properly sized at 7px. The range label font at 0.62rem is tight but readable. This is a net add of useful data without breaking the mobile layout.

- **Display sparklines in mobile display mode.** Mobile display mode at 375px switches to 2×4 grid. Each display card now shows a 40px sparkline (`d-sparkline` at 40px in mobile CSS). At this size the sparklines are very small but directionally readable.

**Still holding it back:**

- Day range bar adds vertical height to mobile cards. Cards already had: ticker + company, price + change badge, sparkline (90px), metrics grid (2×2). The range bar inserts between the price row and sparkline, making cards taller. On 375px with a 10px gap, this can make the grid feel dense. No critical overflow issue, but card length is approaching the limit of comfortable scrolling.
- Range bar "Day Range" center label at `0.6rem` is extremely small — borderline unreadable on non-Retina screens. Not a WCAG failure (it's decorative context), but it adds noise at tiny sizes.
- Still no `env(safe-area-inset-bottom)` for iPhone notch/home indicator. Toast at `bottom: 24px` still potentially obscured on iPhone 15/16 Pro.
- Still no pull-to-refresh gesture.

**Score rationale:** Incremental improvement. The range bar adds genuine value without breaking layout. Display sparklines on mobile are present but very small. These are quality-of-life additions, not transformative changes. 7.3.

---

## 3. Desktop / Display Mode — 7.8 / 10 (v4: 7.4, +0.4)

**What improved — biggest area gain in v5:**

- **Display sparklines implemented.** `renderDisplaySparkline()` creates a 56px LightweightCharts area series inside each display card's `.d-sparkline` div. The implementation is complete: area series with directional color (green for up, red for down), transparent background, no crosshair/price line/last value labels, `fitContent()` after data loads. On a wall-mounted 4×2 display grid, each card now shows: ticker (2.2rem), company name, price (3.4rem), change badge, 56px sparkline, day range bar, vol/cap metrics row. This was the primary missing feature in v4 display mode and is now fully addressed. The sparkline data reuses the existing `fetchCandleData` cache — no extra API calls.

- **Day range bar in display cards.** The `dRangeBar` uses the same `buildRangeBar()` function with `'d'` prefix, targeting `.d-range-*` CSS classes. These are well-styled: 4px track height, white thumb dot, gradient fill. At display mode scale, the range bar adds meaningful context — a viewer can see where today's price sits relative to the day's range at a glance from across a room.

- **Trend accent bars on display cards.** Now visually consistent with main cards. The top 3px gradient bar (green/red gradient with glow shadow) gives display cards the same premium top-line treatment as main cards.

**Still holding it back:**

- Display mode sparklines are 56px — readable at desk distance, but undersized for actual wall-mounted TV viewing (55"+). At 3+ meters, even a 56px sparkline disappears. Would need 80-100px for genuine TV utility.
- `d-price` remains at 3.4rem (desktop). For TV use cases, 4.5-5rem would be more appropriate.
- Desktop max-width still at `1440px`. Ultrawide/4K monitors see empty side margins.
- No drag-to-reorder cards.

**Score rationale:** Display sparklines are the standout improvement in v5. A user entering display mode now sees genuine trend data on every card — not just price and change. Combined with v4's breathing glow, active-card highlight, and smooth transitions, display mode is now genuinely impressive. The feature gap to professional Bloomberg/CNBC terminal displays is closing. 7.8 reflects a real step toward "would choose over competitors" for the display-mode use case specifically.

---

## 4. Charts — 7.6 / 10 (v4: 7.6, +0.0)

**No meaningful change since v4.**

The chart accessibility summary (`generateChartA11ySummary`) is the one new addition: a `.sr-only` div with `aria-live="polite"` is injected into `#chart-wrap` after candle data loads, describing the chart in prose: "[TICKER] [period] chart: opened at $[price] on [date], closed at $[price] on [date]. Period high $[price], low $[price]. Overall change [±$amount] ([±pct]%), trend [up/down]." This is a meaningful accessibility addition but does not change the chart feature set for visual users.

**Still holding it back (unchanged from v4):**

- No volume bars below candlestick chart. Volume is included in Finnhub candle data but not visualized.
- No technical indicators (MA, RSI, MACD).
- Fallback random-walk charts still have no "Demo Data" indicator.
- Chart height at 260px on mobile is cramped.
- No chart drawing tools.

**Score rationale:** The a11y summary is a genuine improvement (see Accessibility section) but does not change the visual/interactive chart experience for the majority of users. 7.6 holds.

---

## 5. Search & Navigation — 7.0 / 10 (v4: 7.0, +0.0)

**No change since v4.** ARIA combobox pattern remains properly implemented. Finnhub autocomplete with debounced input and keyboard navigation remains solid. Keyboard shortcuts (/, f, r, Esc) unchanged.

**Still holding it back:**

- No watchlist sorting or grouping.
- No recent/popular suggestions.
- No drag-to-reorder.
- Search hidden behind toggle on all screen sizes.

**Score rationale:** Solid and stable. 7.0.

---

## 6. Data Quality — 7.0 / 10 (v4: 6.5, +0.5)

**What improved — the v4 #1 recommendation is now addressed:**

- **Live metrics from Finnhub `/stock/metric` endpoint.** `fetchFromFinnhub()` now fetches `metricUrl` in parallel with `quoteUrl`. If the metric response is OK, it extracts:
  - `mm['52WeekHigh']` and `mm['52WeekLow']` — replacing the FALLBACK_DATA snapshots for 52-week range
  - `mm['marketCapitalization']` × 1e6 — replacing hardcoded market cap
  - `mm['10DayAverageTradingVolume']` × 1e6 (or 3-month avg as fallback) — replacing hardcoded volume

  The `liveMetrics: true` flag is set when real data is present, which triggers a `card-live-badge` "● live data" indicator on cards. This resolves the "plastic food" issue: volume, market cap, and 52-week ranges are now real API data when Finnhub responds.

- **Ticker tape remains hardcoded.** `MARKET_INDICES` in main.js is a static array with price/change values from a specific date. The 30-second "refresh" only adds jitter (±0.4), not real data. This is the remaining data quality gap: the tape reads as live but is static. Labels like "S&P 500: 5672.80" reflect a snapshot, not today's close.

- **API key still hardcoded in source.** Security concern unaddressed.

- **Fallback still has no "Demo" indicator** beyond `updateTimestamp('fallback')` text showing "Sample data - HH:MM" in the last-updated span. Cards themselves don't indicate fallback mode.

**Score rationale:** Moving from hardcoded FALLBACK_DATA for metrics to real Finnhub `/stock/metric` data is a significant data quality improvement. A user can now trust the volume, market cap, and 52-week range figures alongside the real-time price. The ticker tape remaining static is a known limitation. 7.0 — crossed the "better than most" threshold for data quality but not yet "competitive with Yahoo Finance."

---

## 7. Performance — 6.8 / 10 (v4: 6.8, +0.0)

**No meaningful change.**

- Display sparklines add API calls per display card render. These reuse the existing `_candleCache` so no extra Finnhub hits if sparklines were already fetched for main cards. Clean implementation.
- Day range bar is pure HTML/CSS — no performance impact.
- Grid dot background is a fixed `body::before` pseudo-element with CSS background-image — effectively free.
- `/stock/metric` fetch added in parallel with `/quote` — doubles API call count per ticker on load, but within the 60-second refresh window and behind AbortSignal timeout. Finnhub free tier is 60 API calls/minute; with 8 tickers × 2 calls = 16 calls on load, leaving headroom.
- Still no lazy loading, service worker, or offline support.
- Single HTML/CSS/JS architecture remains lean.

**Score rationale:** No regression, no meaningful improvement. 6.8.

---

## 8. Accessibility — 7.6 / 10 (v4: 7.4, +0.2)

**What improved:**

- **Chart data accessibility — screen reader summary.** `generateChartA11ySummary()` runs after `fetchCandleData()` resolves and injects a `.sr-only` prose summary into `#chart-wrap`. The text is comprehensive: period label (1-week/1-month/etc.), opening price and date, closing price and date, period high/low, overall change and percentage, trend direction. `aria-live="polite"` ensures it is announced after the chart renders without interrupting the user. This was the final major gap flagged in v3 and v4. It is now fully addressed.

- **Range bar accessibility.** `buildRangeBar()` adds `aria-label="Day range: low $X, current $Y, high $Z"` to the wrapper div. This provides a text alternative for the visual range track for screen readers.

**Unchanged from v4 (still good):**

- Skip-to-content link. ARIA combobox on search. Radiogroup on chart timerange. tabindex/role="button" on stock cards. Focus trap on modal. aria-live regions. prefers-reduced-motion. Global :focus-visible. WCAG contrast. aria-hidden on OHLC tooltip.

**Still holding it back:**

- `prefers-color-scheme` not supported — dark mode only. Users who prefer or require light mode have no option.
- Ticker tape continuously scrolls with no pause mechanism other than `prefers-reduced-motion: reduce` (which stops it entirely). No pause-on-focus or pause-on-hover.
- Display mode has no keyboard navigation between cards (arrow keys) — only the auto-rotation cycle.

**Score rationale:** The chart a11y summary completes the accessibility story for the app's most data-rich component. Combined with the range bar aria-label, skip-to-content, ARIA combobox, and focus management, StockPulse has strong accessibility fundamentals. The remaining gaps are polish-level issues, not WCAG failures. 7.6.

---

## 9. Overall App Feel — 7.5 / 10 (v4: 7.3, +0.2)

**Summary:** StockPulse v5 has tightened the gap between "genuinely impressive" and "would choose over competitors." The three v4 priority recommendations were all addressed in a single build cycle — live metrics, display sparklines, and chart accessibility. This is the most targeted iteration since v3.

**What makes v5 feel meaningfully different from v4:**

1. **Display mode is now a complete product.** In v4, display cards had ticker, price, change, metrics — but no trend visualization. A user glancing at a wall display could see current price and direction but not trajectory. With 56px sparklines, trend accent bars, and day range bars, each display card now tells a full story: where the stock is, how it moved today, and how it's trended over 30 days. This is the feature that makes display mode worth using.

2. **Data you can trust.** The "live data" badge with real Finnhub metrics means the app's secondary figures (volume, cap, 52w range) are now trustworthy alongside the primary price. In v4 there was a subtle credibility issue: live price next to stale volume. In v5 that dissonance is resolved for connected users.

3. **Background texture.** The dot grid is a small change that has a disproportionate visual effect. The empty dashboard background no longer reads as a plain dark gray rectangle — it has depth and intentionality.

**Compared to competitors:** Robinhood's UX is still superior (onboarding, portfolio integration, notifications, news integration). Yahoo Finance still vastly outpaces on data depth. But for a pure watchlist + display use case, StockPulse has a compelling offering. The display mode with sparklines, breathing glow, and auto-rotation is genuinely unique among free/open web finance dashboards.

---

## OVERALL SCORE: 7.4 / 10 (v4: 7.2, +0.2)

| Area | v1 Score | v2 Score | v3 Score | v4 Score | v5 Score | v4→v5 Change |
|------|----------|----------|----------|----------|----------|--------------|
| Visual Design | 5.8 | 6.5 | 6.6 | 7.2 | 7.5 | +0.3 |
| Mobile UX (375px) | 5.5 | 6.3 | 7.0 | 7.2 | 7.3 | +0.1 |
| Desktop / Display Mode | 6.0 | 6.8 | 7.2 | 7.4 | 7.8 | +0.4 |
| Charts | 5.5 | 5.5 | 7.0 | 7.6 | 7.6 | +0.0 |
| Search & Navigation | 5.0 | 6.5 | 7.0 | 7.0 | 7.0 | +0.0 |
| Data Quality | 4.5 | 5.8 | 6.5 | 6.5 | 7.0 | +0.5 |
| Performance | 6.5 | 6.8 | 6.8 | 6.8 | 6.8 | +0.0 |
| Accessibility | 4.5 | 6.2 | 7.0 | 7.4 | 7.6 | +0.2 |
| Overall App Feel | 5.5 | 6.2 | 7.0 | 7.3 | 7.5 | +0.2 |
| **Weighted Average** | **5.4** | **6.3** | **6.9** | **7.2** | **7.4** | **+0.2** |

---

## TOP 3 PRIORITY RECOMMENDATIONS

### 1. Live Ticker Tape Indices — Replace Hardcoded MARKET_INDICES (High — data credibility)
The ticker tape displays index data from a static hardcoded array (`MARKET_INDICES` in main.js) with only ±0.4 price jitter added every 30 seconds. The values (S&P at 5672.80, Nasdaq at 19823.45) are stale snapshots. For a user who checks the tape daily, this is the one element that looks live but isn't. Finnhub free tier does not provide index data directly, but SPY/DIA/QQQ/IWM are ETFs and can be fetched via the same `/quote` endpoint already used for watchlist tickers. Fetching these 4 ETFs plus VIX via `FRED` or a similar free source would make the tape genuinely live. Even if only SPY/DIA/QQQ/IWM are live-fetched (4 API calls), the tape would be real. This is the last "fake live" element in the app.

### 2. Volume Bars Below Candlestick Chart (Medium — charting completeness)
Finnhub `/stock/candle` returns volume (`v` array) alongside OHLC. The candlestick modal currently ignores volume. Adding a histogram series below the candlestick using `addHistogramSeries()` with the volume data — green bars for up candles, red for down, at 20% opacity — would make the chart genuinely useful for technical analysis. Volume is the first overlay any trader adds to a candlestick chart. LightweightCharts supports this natively. The data is already being fetched; it just needs to be stored in `data.push({ ..., volume: json.v[i] })` and rendered. This would push the Charts score toward 8.0.

### 3. Keyboard Navigation in Display Mode (Low-Medium — accessibility + power users)
Display mode currently auto-rotates cards on a 10-second timer and supports Prev/Next page buttons. There is no keyboard navigation between cards within a page (arrow keys to highlight the next card, Enter to drill in, etc.). For a wall display controlled by a keyboard or remote, this is a gap. Adding `ArrowLeft`/`ArrowRight` keydown handlers to cycle `displayIndex` would allow keyboard-driven navigation without touching the mouse. Combined with the existing `f` and `Esc` shortcuts, display mode would feel fully keyboard-accessible.

---

*v5 audit complete. Display Mode (+0.4) and Data Quality (+0.5) are the biggest movers. All three v4 priority recommendations were implemented. The app has reached 7.4 overall — above "genuinely better than most" and approaching the 8.0 "would choose over competitors" threshold. The clearest path to 8.0 is: live ticker tape indices (credibility), volume bars (chart depth), and search/sort improvements (navigation utility). The display mode is now StockPulse's strongest feature — genuinely distinctive and well-executed.*

— Nigel
