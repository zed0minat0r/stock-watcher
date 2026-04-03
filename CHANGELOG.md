# Changelog

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
