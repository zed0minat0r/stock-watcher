# StockPulse — SEVENTH AUDIT v7 (Nigel)
**Date:** 2026-04-03
**Auditor:** Nigel (Strict Auditor)
**Live Site:** https://zed0minat0r.github.io/stock-watcher/
**Perspectives:** Mobile (375px) + Desktop/Display Mode
**Previous Audits:** v1: 5.4 | v2: 6.3 | v3: 6.9 | v4: 7.2 | v5: 7.4 | v6: 7.4

---

## Scoring Calibration
- 5.0 = average/basic | 5.5 = functional but generic | 6.0 = generic template
- 7.0 = genuinely better than most (HIGH bar) | 8.0 = user would choose over competitors
- 9.0 = award-worthy

**Benchmark competitors:** Robinhood, Yahoo Finance, TradingView

---

## What Changed Since v6 (7.4)

Four commits landed after the v6 audit. All three v6 top priorities were addressed:

1. **`fix: kill ambient breathing animations, add static tape badges, mobile UX fixes`** — Removed `ambientPulseGreen` and `ambientPulseRed` from stock cards. The `livePulse` continuous animation was also removed from price elements (now a comment `/* Continuous livePulse removed; price updates use flash-up/flash-down instead */`). Static tape items now show an `[est]` badge. Mobile UX fixes included.

2. **`Fix: move remove button to top-right corner of card, not card-top`** — The `card-remove` button is now `position: absolute; top: 4px; right: 4px` rather than inside card-top flex flow. Correct — removes a layout jitter on hover.

3. **`v2.4.0 — Replace static tape items with live ETFs, add tape pause button (WCAG 2.2.2), and watchlist slot counter`** — The entire ticker tape is now 8 live ETF symbols (`SPY`, `DIA`, `QQQ`, `IWM`, `GLD`, `USO`, `UUP`, `VIXY`) fetched from Finnhub on load and refreshed every 60s. A pause/play button was added at the right edge of the tape (WCAG 2.2.2 compliance). A watchlist slot counter (`X/20`) was added to the dashboard toolbar.

4. **`Dead code removal`** — Unused CSS block, dead JS variable, and no-op class calls removed.

These changes directly addressed v6 Priority 1 (breathing animations), Priority 2 (stale tape data), and Priority 3 (tape pause button).

---

## Category Scores

### 1. Visual Design — 7.6/10

The removal of ambient breathing animations is the most impactful change this cycle. Cards no longer continuously pulse their box-shadow — the grid is now calm and readable. The flash-up/flash-down animations fire only on actual price changes. This is exactly how Bloomberg Terminal and Robinhood handle it. Visual maturity improved meaningfully.

The dot-grid background, gradient accent bars, OHLC tooltip, and logo gradient remain strong. The `cardSlideUp` entrance animation still staggers cards nicely (20 nth-child delays defined, which now covers the full max watchlist size of 20).

**Remaining issues:**
- The logo icon (`&#9670;`) pulse (`logoPulse` animation: scale 1→1.15, opacity fade, drop-shadow) still runs continuously at 2s. It's small and subtle — acceptable, but it is still a perpetual breathing animation. The market status badge also has `statusPulse` continuously. These are lower priority than the card animations but noted.
- The `card-live-badge` ("● live data") is `font-size: 0.62rem` and `opacity: 0.75` — very easy to miss. Trust indicators should be more prominent.
- No light mode. Not a blocker but limits daytime use on bright screens.
- Volume bars in modal chart are still at 20% opacity (`rgba(0,214,114,0.20)` / `rgba(255,71,87,0.20)`). Users who have not been told to look for them will not register them.

### 2. Mobile UX (375px) — 7.2/10

Improved over v6's 7.0. The `@media (hover: none)` rule correctly keeps remove buttons visible on touch devices. The search drawer pattern (toggle button → expand) is correct. 44px minimum touch targets are maintained. The centered card layout with 1-column stack works well at 375px.

The watchlist slot counter (`X/20`) added in v2.4.0 now appears in the toolbar — this is visible on mobile and addresses a v6 bonus note.

**Remaining issues:**
- The sort toolbar at 375px still wraps awkwardly. While `data-mobile-label` is used to shorten button labels ("Gainers" instead of "Top Gainers"), the buttons still wrap to multiple lines at 375px because there are 5 buttons plus "Sort by" label. A `<select>` dropdown on mobile would be cleaner.
- Portfolio summary still hides `ps-item.ps-best` and `ps-item.ps-worst` on small screens (`display: none` implied by earlier CSS — actually looking again, v6 CSS at line 1097 shows `.ps-item.ps-best, .ps-item.ps-worst { display: inline-flex; }` which keeps them visible). On re-inspection this appears corrected: best/worst tickers ARE shown on mobile. The separator hiding (`ps-sep:nth-of-type(n+3) { display: none }`) reduces clutter. This is better than the v6 assessment suggested.
- Modal chart is 260px height on mobile. Tight but functional for OHLC candlesticks.
- Ticker tape pause button is present (`position: absolute; right: 0`) and accessible. On mobile at 375px the button occupies right edge with `padding: 0 12px 0 24px`. It does not interfere with tape readability.

### 3. Desktop/Display Mode — 7.6/10

Display mode remains the most differentiated feature. No regressions. The sparkline charts inside display cards work. Auto-rotation with keyboard nav (arrows) is polished. Pagination for >8 stocks is in place.

**Remaining issue:**
- Display grid is still hardcoded `grid-template-columns: repeat(4, 1fr); grid-template-rows: repeat(2, 1fr)`. With fewer than 8 stocks the grid has empty cells. This is a visual issue that has persisted since v4. At 5 tickers in a 4×2 grid, there are 3 empty grey-bordered cells. A user testing with a small watchlist will notice this looks broken. The fix is straightforward: either use `auto-fit` or calculate grid columns dynamically based on `watchlist.length`.
- `role="region"` is on the display overlay — good. But no `aria-label` is set on the display overlay element in the HTML. This was raised in v6 and remains unaddressed.
- Display card price is colored inline (`style="color:var(--green)"`) — minor but inline styles reduce maintainability.

### 4. Charts — 7.3/10

No chart changes since v6. The Finnhub candlestick integration, 5-timerange selector, and crosshair OHLC tooltip remain solid. Score bumped from 7.2 to 7.3 because the overall app quality uplift means the chart features look more professional in context now that the card animations have been removed.

**Unchanged issues:**
- Volume bars at 20% opacity are still barely visible. Standard convention is 25–35%.
- No line chart option. Candlestick-only is limiting for 1Y views where daily candle bodies are very small.
- Tooltip flip threshold is chart center rather than cursor proximity to right edge — minor positioning annoyance.
- API rate limit risk from sparkline calls on initial load (28 total requests) remains.

### 5. Search & Navigation — 7.5/10

No changes to search since v6. The autocomplete, debounce, ARIA combobox, and keyboard shortcuts remain solid. Score unchanged.

**Unchanged issues:**
- Autocomplete still shows duplicate symbols from different exchanges (AAPL, AAPL.BA, AAPL.BE). No deduplication by symbol.
- Invalid ticker errors are only communicated via a toast that disappears in 2.5s.
- No drag-to-reorder for watchlist items. This is a standard user expectation.

### 6. Data Quality — 7.0/10

Improved from v6's 6.8. The ticker tape is now fully live ETF data — no more stale VIX/DXY/Gold/Crude hardcodes in the tape. The `[est]` badge on fallback items gives users a clear signal when data is estimated. This is a genuine quality improvement.

All 8 tape items now fetch from Finnhub (`TAPE_ETF_SYMBOLS = ['SPY', 'DIA', 'QQQ', 'IWM', 'GLD', 'USO', 'UUP', 'VIXY']`). `GLD` proxies gold, `USO` proxies oil, `UUP` proxies the dollar index, `VIXY` proxies VIX. These are legitimate ETF proxies and the labels correctly identify them as such ("Gold", "Oil", "US Dollar", "VIX Proxy").

**Remaining issues:**
- `FALLBACK_DATA` prices (TSLA at $271.30, NVDA at $118.62, etc.) are still months-stale. A user on a corporate firewall who sees fallback data will see materially wrong prices. The "Sample data - HH:MM" timestamp helps but the gap between real and sample price could be 30–40% on volatile tickers like NVDA.
- No pre/after-hours price data. Robinhood and Yahoo Finance surface extended hours prominently. For a finance dashboard this is a notable absence.
- Live vs. fallback differentiation: the `card-live-badge` is present but very small and low contrast. Consider a more prominent status indicator.

### 7. Performance — 6.5/10

No performance changes since v6. The API call count remains elevated: 8 quote + 8 metric + 8 sparkline + 8 tape = **32 requests on first load** (tape expanded from 4 to 8 ETFs, adding 4 more calls vs. v6). Each 60s refresh is 16 calls (main) + 8 tape. Score unchanged — the situation is no worse but the tape expansion makes it slightly higher.

**Issues:**
- First-load request count is now ~32 Finnhub API calls. Free tier is 60/minute. With 12+ tickers in the watchlist this would approach the limit instantly.
- `LightweightCharts` loaded from unpkg CDN with no SRI hash. App breaks if CDN is unavailable.
- No service worker, no caching beyond in-memory `_candleCache` (reset on hard refresh).
- `backdrop-filter: blur(16px)` on header + `blur(8px)` on cards can impact low-end Android devices.

### 8. Accessibility — 7.5/10

Improved from v6's 7.3. The tape pause button directly addresses WCAG 2.1 SC 2.2.2 (pause, stop, hide for moving content). The button correctly toggles `animationPlayState`, updates `aria-label` on state change, and shows a visual indicator. This resolves the only actual WCAG violation cited in v6.

**Remaining issues:**
- Display overlay: HTML has `role="region"` but `aria-label` attribute is set in the HTML markup but says `"StockPulse Display Mode — fullscreen market dashboard"` — actually checking the HTML this IS present on line 85: `role="region" aria-label="StockPulse Display Mode — fullscreen market dashboard"`. This was incorrectly flagged in v6; it IS labeled. Correcting the record.
- Sort buttons: `role="radio"` + `aria-checked` are correctly set, but keyboard Space on a focused sort button may not fire because the card's `keydown` listener intercepts Space for opening modals. The sort buttons are not inside cards, so this is not actually a conflict — they are separate DOM elements. This is fine.
- Modal `aria-label` is updated dynamically in `openModal()`: `modal.setAttribute('aria-label', \`${ticker} — ${d.name} Stock Detail\`)`. Correcting the v6 mis-report — this WAS already done in the code.
- The one genuine remaining gap: the `chart-a11y-summary` SR-only div is appended inside `#chart-wrap` but removed and re-appended on each timerange change without an explicit `aria-live="assertive"`. Using `polite` may cause screen readers to miss the update if the user is currently reading. Minor.

### 9. Overall App Feel — 7.5/10

The removal of the ambient breathing animations is the single highest-impact change this project has ever shipped. The grid now feels calm, professional, and information-dense — closer to Bloomberg Terminal than a student portfolio project. Combined with the fully live ticker tape, pause button, watchlist counter, and remove button positioning fix, this is a meaningfully more polished experience than v6.

A real user encountering this app would feel they're using something deliberately crafted. The dark theme, gradient accents, real OHLC charts, autocomplete search, and display mode together create a differentiated product.

**What prevents it from reaching 8.0:**
- The display grid empty cell issue (fewer than 8 stocks = visually broken layout) is immediately apparent on first exploration.
- API reliability: a user on a restricted network gets stale fallback data silently. There is no retry UI or "using cached data" banner.
- Onboarding: keyboard shortcuts (`/`, `f`, `r`) are undiscoverable. A first-time user will use only click/tap and miss major features.
- No watchlist sharing or export. The app is personal-device-only by design — fine, but it limits how users advocate for it.

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
| v7    | 2026-04-03 | 7.5   | Kill breathing animations, fully live tape ETFs, tape pause (WCAG 2.2.2), watchlist counter |

---

## Overall Score: 7.5 / 10

Up from 7.4. The three priorities were executed correctly and the impact is real — particularly the breathing animation removal, which is the highest-ROI code change since the Finnhub integration. The app is now measurably more professional. The score advances but does not reach 7.7+ because the display grid empty cell bug, API overload risk, and onboarding gap remain unresolved, and no new differentiated feature was shipped.

---

## Top 3 Priorities for v8

### Priority 1: Fix the Display Mode Grid Empty Cells
When the watchlist has fewer than 8 stocks, the 4×2 hardcoded display grid shows empty cells with visible borders. This is a first-impression UX failure for any user exploring the app with a small watchlist. Fix: calculate grid columns dynamically in JS (`Math.ceil(Math.sqrt(count))` or a lookup table for 1–8 items), or use CSS `grid-template-columns: repeat(auto-fit, minmax(200px, 1fr))` and remove the fixed rows. Target: at 4 tickers show a 2×2 grid; at 6 tickers show a 3×2 grid; at 8 show 4×2.

### Priority 2: Add a Keyboard Shortcut Discovery Panel
The `/`, `f`, and `r` shortcuts are power-user features that most first-time users will never discover. Add a small `?` icon button in the header (or a tooltip on the display mode button) that opens a simple keyboard shortcut overlay. Alternatively, a single dismissible onboarding card at the top of the grid on first visit (stored in localStorage so it only shows once) would surface these features without being obtrusive. This has zero API cost and directly increases perceived quality.

### Priority 3: Reduce First-Load API Footprint
32 Finnhub requests on first load is too many for the free tier (60/min). Solutions in order of impact: (a) Defer sparkline fetches — render the grid first with placeholder sparkline areas, then fetch sparklines 500ms after initial render. (b) Batch the 8 tape ETF requests after main stock data completes. (c) Cache sparkline data in localStorage with a 10-minute TTL (survives hard refresh for quick revisits). Any one of these would reduce the burst from 32 to ~16 requests and make the app reliable for users with 10+ tickers.

---

## Bonus Notes (Lower Priority)

- **Fallback data staleness:** Update `FALLBACK_DATA` prices quarterly or add a warning banner when fallback mode activates ("Live data unavailable — showing recent estimates").
- **Volume bar opacity:** Raise from 20% to 30% in the modal chart. The directional coloring (green up/red down) is already correct; just increase visibility.
- **Autocomplete deduplication:** Filter autocomplete results to unique `.symbol` values to remove XETRA/OTC duplicates.
- **Line chart toggle:** Add a candlestick/line toggle button in the modal timerange bar. Useful for 1Y views where individual candle bodies become too small to distinguish.
- **Logo pulse:** `logoPulse` and `statusPulse` are the last continuous breathing animations. They are small and contextually meaningful (logo identity, market state). Keep but consider making them optional under `prefers-reduced-motion` explicitly (they may already be caught by the global motion override — they are, checked).
