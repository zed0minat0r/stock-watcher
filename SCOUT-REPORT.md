# Scout Research Report — Stock Market Watcher App
**Date:** 2026-04-01

---

## 1. Free Stock Market APIs (Real-Time / Delayed Quotes)

### Finnhub (RECOMMENDED for this project)
- **Free tier:** 60 API calls/minute — most generous among free options
- **Data:** Real-time US market quotes, company profiles, news, earnings calendars, sentiment
- **Strengths:** Developer-friendly, WebSocket support for streaming, good documentation
- **Limitations:** Some advanced endpoints (insider transactions, pattern recognition) are premium

### Alpha Vantage
- **Free tier:** 25 requests/day (very limited)
- **Data:** Intraday, daily, weekly, monthly time series; forex; crypto; technical indicators
- **Strengths:** Excellent historical data and technical indicator endpoints
- **Limitations:** Real-time and 15-min delayed data is premium-only; 25/day cap makes it impractical as a primary source
- **Best for:** Historical chart data as a secondary API

### Polygon.io
- **Free tier:** 5 requests/minute, end-of-day data, limited real-time
- **Data:** Stocks, options, forex, crypto; aggregates, trades, quotes
- **Strengths:** High-quality data, good REST and WebSocket APIs
- **Limitations:** Free tier is restrictive; real-time requires paid plan

### Yahoo Finance (yfinance)
- **Free tier:** Technically free via web scraping
- **Data:** Quotes, historical data, financials, options chains
- **Strengths:** No API key needed, very broad data coverage
- **Limitations:** NOT officially supported; aggressive rate limiting, frequent IP bans, inconsistent availability. Unreliable for production use.

### FMP (Financial Modeling Prep)
- **Free tier:** 250 requests/day, delayed quotes
- **Data:** Stocks, ETFs, mutual funds, crypto, forex; financial statements
- **Strengths:** Good breadth of fundamental data on free tier
- **Limitations:** Real-time data requires paid plan

### Recommendation for This Project
Use **Finnhub as the primary API** for real-time quotes and news (60 calls/min is plenty for a dashboard). Use **Alpha Vantage as a secondary API** for historical chart data (time series). Both are free and require only an API key — no backend needed; calls can be made directly from the browser with CORS support.

---

## 2. Best Stock Dashboard UI/UX Patterns (2025-2026)

### Design Trends
- **Dark theme by default** — easier on the eyes for financial data, better contrast for green/red indicators
- **Card-based layouts** — modular grid of stock cards with key metrics (price, change %, volume, sparkline)
- **Responsive grids** — CSS Grid / Flexbox for mobile-first layouts that scale to large screens
- **Minimal chrome** — reduce UI clutter; let the data breathe
- **Real-time micro-animations** — subtle price ticker animations, smooth chart transitions
- **Color coding** — green for gains, red for losses is universal and expected

### Key Layout Components
1. **Header bar** — search input, market status indicator (open/closed), current time
2. **Watchlist sidebar or top bar** — quick access to tracked stocks
3. **Stock cards grid** — each card shows: ticker, price, change (%), mini sparkline chart, volume
4. **Expanded stock view** — full candlestick/line chart, key stats, news feed
5. **Market overview strip** — S&P 500, NASDAQ, DOW mini-indicators at top

### Notable Templates & Inspiration
- **TailAdmin V2** — Tailwind CSS V4 stock dashboard template, 500+ components
- **Robinhood-style investment dashboard** — 57+ pages, 13 modules (Portfolio, Watchlist, Market Overview, Stock Screener, Market Movers, Earnings Calendar)
- **Dribbble stock dashboard designs** — great visual inspiration for card layouts and color schemes

### Recommendation for This Project
Mobile-first card grid with dark theme. Each stock card = ticker + price + % change + sparkline. Tap/click to expand into full chart view. Keep it clean and Robinhood-inspired — minimal but information-dense.

---

## 3. Chart Libraries for Stock Data

### TradingView Lightweight Charts (STRONGLY RECOMMENDED)
- **Size:** ~45KB gzipped — extremely lightweight
- **Rendering:** HTML5 Canvas — fast, smooth, hardware-accelerated
- **Chart types:** Line, Area, Candlestick, Bar, Histogram, Baseline
- **Features:**
  - Crosshair with price/time tracking
  - Pinch-to-zoom on mobile (critical for mobile-first)
  - Smooth scrolling and zooming with 10k+ candles
  - TypeScript declarations included
  - Plugin system for custom indicators
  - Free and open-source (Apache 2.0)
- **Performance:** Tested with 10k candles — buttery smooth zoom, crisp crosshair, calm CPU usage
- **Mobile:** Pinch zoom works great, no random jumps
- **CDN:** Available via unpkg/jsdelivr — no build step needed

### Chart.js (with candlestick plugin)
- **Size:** ~60KB gzipped (core) + plugin
- **Strengths:** Easy to learn, massive ecosystem, great for simple line/bar charts
- **Weaknesses:** Candlestick support requires `chartjs-chart-financial` plugin; not optimized for large datasets; lacks financial-specific features (crosshair, price scale)
- **Verdict:** Fine for sparklines in stock cards, but not ideal for the main chart view

### ECharts (Apache)
- **Size:** ~300KB+ — heavy
- **Strengths:** Extremely powerful, supports candlestick natively, good for complex visualizations
- **Weaknesses:** Large bundle size, complex API, overkill for this use case

### Recommendation for This Project
Use **TradingView Lightweight Charts** for the main stock chart view (candlestick + line). It is purpose-built for financial data, tiny, fast, mobile-friendly, and free. For sparkline mini-charts inside stock cards, either use Lightweight Charts in a minimal config or simple inline SVG sparklines for maximum performance.

---

## 4. Display Mode / TV Dashboard Patterns

### What "Display Mode" Means
A full-screen, distraction-free view optimized for wall-mounted monitors or TVs. Sometimes called "kiosk mode" or "TV mode."

### Key Patterns from Industry Leaders

#### Auto-Rotation / Playlist
- Dashboard cycles through different views on a set interval (e.g., every 30-60 seconds)
- Views could rotate between: watchlist overview, individual stock deep-dives, market summary, sector heatmap
- Datadog, Grafana, and Geckoboard all implement this pattern

#### Visual Optimization for Distance
- **Larger fonts** — readable from 10+ feet away
- **High contrast** — dark background with bright data; pure black or dark navy recommended
- **Reduced density** — fewer items per screen, more whitespace
- **No scrolling** — everything visible without interaction
- **No hover states** — since there's no mouse in TV mode

#### Kiosk Mode Features
- Hide all navigation, toolbars, and interactive controls
- Full-screen browser API (F11 / `document.fullscreenElement`)
- Auto-refresh data on interval (WebSocket preferred, polling as fallback)
- Optional clock/timestamp display so viewers know data freshness
- Screen burn-in prevention: subtle movement or periodic view rotation

#### Status Indicators
- Market open/closed indicator prominently displayed
- Last-updated timestamp
- Connection status (live/delayed/offline)

### Recommendation for This Project
Implement a dedicated "Display Mode" button that:
1. Goes full-screen via the Fullscreen API
2. Hides search, navigation, and controls
3. Enlarges fonts and spacing for distance readability
4. Auto-rotates through watchlist stocks every 30s (configurable)
5. Shows market status + last-updated timestamp
6. Uses dark theme with high contrast
7. Press ESC or tap to exit

---

## 5. Standout Features for a Stock Watcher App

### Must-Have Features
1. **Search & Add Stocks** — fast ticker search with autocomplete
2. **Real-Time Price Updates** — WebSocket streaming or frequent polling with visual price-change animation
3. **Watchlist Management** — add/remove/reorder stocks, persist in localStorage
4. **Interactive Charts** — candlestick and line charts with time range selectors (1D, 1W, 1M, 3M, 1Y, ALL)
5. **Color-Coded Gains/Losses** — green/red throughout the UI

### Differentiating Features
6. **Display Mode** (TV/Kiosk) — full-screen auto-rotating dashboard (see Section 4)
7. **Market Overview Bar** — S&P 500, NASDAQ, DOW Jones mini-tickers always visible
8. **Sector Heatmap** — treemap showing sector performance at a glance
9. **Price Alerts** — browser notifications when a stock hits a target price
10. **News Feed per Stock** — headlines from Finnhub's news API displayed in expanded view
11. **AI Score / Sentiment Indicator** — simple bull/bear sentiment from news analysis (Finnhub provides sentiment data)
12. **Sparkline Mini-Charts** — tiny inline charts on each watchlist card for instant trend visibility
13. **Keyboard Shortcuts** — power users love them (j/k to navigate, / to search, f for fullscreen)
14. **Offline Resilience** — cache last-known data in localStorage; show "last updated" timestamp
15. **No Login Required** — zero friction; everything stored locally in the browser

### What Users Praise Most (from app reviews)
- **Speed** — instant load, no waiting for data
- **Simplicity** — don't overwhelm with too many features; do the basics excellently
- **Customization** — let users choose which stocks to watch, not a preset list
- **Visual clarity** — clean charts, clear numbers, obvious color coding

### Recommendation for This Project
Focus on the core loop: **Search -> Add to Watchlist -> View Price + Chart -> Display Mode**. Nail these four flows with polish. Then layer on: news feed, market overview bar, price alerts, and keyboard shortcuts. Avoid feature bloat — simplicity is the differentiator for a free, no-login stock watcher.

---

## Technology Stack Recommendation

| Layer | Choice | Reason |
|-------|--------|--------|
| **Framework** | Vanilla JS or lightweight (no React/Vue needed) | GitHub Pages static hosting, fast load |
| **Styling** | Tailwind CSS via CDN | Rapid UI development, mobile-first utilities |
| **Charts** | TradingView Lightweight Charts | 45KB, purpose-built for financial data |
| **Primary API** | Finnhub (free, 60 calls/min) | Real-time quotes, news, WebSocket streaming |
| **Secondary API** | Alpha Vantage (free, 25/day) | Historical time series for charts |
| **Storage** | localStorage | Watchlist persistence, no backend needed |
| **Hosting** | GitHub Pages | Already set up at zed0minat0r.github.io/stock-watcher |

---

## Sources
- [Best Real-Time Stock Market Data APIs 2026 — FMP](https://site.financialmodelingprep.com/education/other/best-realtime-stock-market-data-apis-in-)
- [Best Financial Data APIs in 2026 — nb-data](https://www.nb-data.com/p/best-financial-data-apis-in-2026)
- [7 Best Real-Time Stock Data APIs 2026 — Coinmonks/Medium](https://medium.com/coinmonks/the-7-best-real-time-stock-data-apis-for-investors-and-developers-in-2026-in-depth-analysis-61614dc9bf6c)
- [Financial Data APIs Compared: Polygon vs IEX vs Alpha Vantage](https://www.ksred.com/the-complete-guide-to-financial-data-apis-building-your-own-stock-market-data-pipeline-in-2025/)
- [Top 5 Free Financial Data APIs — DEV Community](https://dev.to/williamsmithh/top-5-free-financial-data-apis-for-building-a-powerful-stock-portfolio-tracker-4dhj)
- [Alpha Vantage Complete 2026 Guide](https://alphalog.ai/blog/alphavantage-api-complete-guide)
- [TradingView Lightweight Charts](https://www.tradingview.com/lightweight-charts/)
- [I Tested 7 JavaScript Candlestick Charts — eJS Chart](https://www.ejschart.com/i-tested-7-javascript-candlestick-charts-heres-what-actually-worked/)
- [Stock Market Dashboard Templates — TailAdmin](https://tailadmin.com/blog/stock-market-dashboard-templates)
- [Dashboard Design Principles 2026 — DesignRush](https://www.designrush.com/agency/ui-ux-design/dashboard/trends/dashboard-design-principles)
- [TV Mode for Dashboards — Datadog](https://docs.datadoghq.com/dashboards/guide/tv_mode/)
- [Grafana Kiosk Tutorial](https://grafana.com/blog/2019/05/02/grafana-tutorial-how-to-create-kiosks-to-display-dashboards-on-a-tv/)
- [Ultimate Guide to TV Dashboards — Geckoboard](https://www.geckoboard.com/best-practice/tv-dashboards/)
- [8 Best Stock Tracking Apps 2026 — Wall Street Zen](https://www.wallstreetzen.com/blog/best-stock-tracking-apps/)
- [Best Stock Watchlist App 2026 — Gainify](https://www.gainify.io/blog/best-stock-watchlist-app)
