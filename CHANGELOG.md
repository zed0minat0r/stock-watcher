# Changelog

## v1.5.1 — 2026-04-01

### Display Mode Card Transitions (Spark)
- **Smooth active-card transitions**: Display mode cards now animate smoothly between active states with 0.6s eased transitions on border, glow, scale, background, and opacity — resolves AUDIT finding of "instant class swap"
- **Breathing glow animation**: Active display card has a subtle 3s pulsing glow that cycles between soft and bright blue, giving the highlighted card a living, premium feel
- **Inactive card dim**: Non-active display cards fade to 75% opacity, creating clear visual hierarchy and focus on the currently highlighted stock
- **Enhanced navigation dots**: Active page dot now scales up 1.4x with a blue glow halo, matching the card's premium glow treatment
- All animations respect `prefers-reduced-motion` via existing media query

## v1.5.0 — 2026-04-01

### Mobile Header Collapse & Touch UX Audit (Pixel)
- **Fix: 3-row header collapsed to 1 row** — Logo + market status on left, icon buttons on
  right. Search is now behind a toggle icon (magnifying glass) that opens a slide-down drawer.
  Saves ~80px of vertical space on iPhone SE (375px).
- **Fix: Search toggle button** — Tap the magnifying glass to expand/collapse the search bar.
  "/" keyboard shortcut also opens the drawer automatically.
- **Fix: Minimum 16px input font size** — Prevents iOS auto-zoom on input focus.
- **Fix: 44px tap targets** — All header icon buttons, autocomplete items, chart time-range
  buttons, card remove button, and modal close button now meet 44px minimum.
- **Fix: Card remove button enlarged** — Touch device remove button increased from 22px to
  44px diameter for easier tapping.
- **Fix: Mobile padding & alignment** — Tighter horizontal padding on small screens,
  full-width search form, consistent center alignment preserved.

## v1.4.0 — 2026-04-01

### Real Historical Charts & ARIA Accessibility (Refiner)
- **Feature: Real chart data** — Replaced random-walk `generateChartData()` and
  `generateSparklineData()` with live Finnhub `/stock/candle` API calls. Sparklines now show
  real 30-day closing prices; candlestick modal shows real OHLC history for 1W/1M/3M/6M/1Y
  time ranges. 5-minute cache prevents excessive API calls. Falls back to generated data
  only when the API is unreachable.
- **Feature: ARIA combobox pattern** — Search autocomplete now implements WAI-ARIA combobox:
  `role="combobox"` on input, `aria-expanded`, `aria-activedescendant`, `role="listbox"` on
  dropdown, `role="option"` + `aria-selected` on each item. Screen readers can now navigate
  the autocomplete dropdown properly.
- **Feature: Chart timerange radiogroup** — Time range buttons (1W/1M/3M/6M/1Y) now use
  `role="radiogroup"` with `aria-checked` state management, announcing the active range
  to assistive technology.

## v1.3.0 — 2026-04-01

### Mobile UX, Search Autocomplete & Data Integrity (Builder)
- **Fix: Mobile remove button** — Always visible on touch devices as a compact circular X in
  the top-right corner of each stock card (no hover required)
- **Feature: Search autocomplete** — As you type in the search bar, a dropdown of matching
  stocks appears using Finnhub's /search endpoint. Supports keyboard navigation (arrow keys,
  Enter to select, Escape to close). Falls back to exact ticker input if API fails.
- **Fix: Fake ticker handling** — Unknown/invalid tickers no longer generate fabricated data.
  Instead, an error toast ("Ticker not found") is shown and the ticker is not added to the
  watchlist. Existing unknown tickers are silently cleaned from the watchlist on refresh.

## v1.2.0 — 2026-04-01

### Accessibility & Display Mode Refinements (Refiner)
- **Keyboard navigation**: Stock cards are now focusable (`tabindex="0"`, `role="button"`) with Enter/Space to open chart
- **Focus trap on chart modal**: Tab cycles within modal; focus returns to trigger card on close
- **WCAG AA contrast**: Bumped `--text-muted` from `#5a6572` to `#7a8592` for compliant contrast ratio
- **aria-live for price updates**: Stock grid has `aria-live="polite"` so screen readers announce changes
- **role="alert" on toasts**: Toast notifications are now announced by assistive tech
- **Focus-visible outlines**: Global `:focus-visible` ring using `--blue` color
- **Mobile remove button**: Always visible on touch devices (compact circle X in top-right)
- **Display mode larger fonts**: Ticker 2.2rem, price 3.4rem, change 1.2rem for TV readability
- **Stronger active-card highlight**: Scale 1.03, thicker blue border, inset glow on active display card
- **Display mode pagination**: Prev/Next controls appear when watchlist exceeds 8 stocks
- **TradingView CDN defer**: Added `defer` to lightweight-charts script to unblock render
- **prefers-reduced-motion**: Disables animations/transitions for users who prefer reduced motion

## v1.1.0 — 2026-04-01

### Premium Glassmorphism Stock Cards (Spark)
- **Frosted glass card effect**: Cards now use a gradient background with backdrop-filter blur for a premium layered look
- **Directional accent bar**: Each card has a top accent bar that glows green (stock up) or red (stock down) for instant at-a-glance trend status
- **Elevated hover states**: Cards lift with a refined shadow and subtle directional color glow on hover matching the stock's trend
- **Inner light gradient**: A soft top highlight on every card adds depth and dimensionality
- All changes are CSS-only with a single JS data-attribute addition — no new dependencies

## v1.0.0 — 2026-04-01

### Initial Release — StockPulse Market Dashboard

- **Dashboard**: Responsive card grid showing ticker, company name, price, day change ($/%),
  mini sparkline chart, volume, market cap, and 52-week range for each stock
- **Default Watchlist**: Pre-loaded with AAPL, MSFT, GOOGL, AMZN, NVDA, TSLA, META, SPY
- **Search & Add**: Type any ticker to add to your watchlist (persisted in localStorage)
- **Detailed Charts**: Click any card to open a candlestick chart modal with full metrics
  and time range selector (1W, 1M, 3M, 6M, 1Y) powered by TradingView Lightweight Charts
- **Display Mode**: Fullscreen button for wall-mounted monitors — 2x4 grid with large fonts,
  auto-rotates highlighted stock every 10s, shows live clock and market status
- **Data Layer**: Finnhub API integration (swappable); realistic hardcoded fallback data
  with jitter so the app works without an API key
- **Dark Theme**: Professional financial dark theme with green/red color coding
- **Responsive Layout**: Mobile 1-col, tablet 2-col, desktop 3-4 col, display mode 2x4
- **Keyboard Shortcuts**: `/` to search, `f` for display mode, `r` to refresh, `Esc` to close
- **Market Status**: Live open/closed indicator based on ET market hours
- **Toast Notifications**: Feedback on add, remove, refresh actions
- **Auto-Refresh**: Data refreshes every 60 seconds
