# Changelog

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
