/* =========================================================
   StockPulse — Main Application
   ========================================================= */

// ---- CONFIG ----
const DEFAULT_TICKERS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META', 'SPY'];
const LS_KEY = 'stockpulse_watchlist';
const REFRESH_INTERVAL = 60_000;        // 1 min
const DISPLAY_ROTATE_INTERVAL = 10_000; // 10 sec

// ---- MARKET INDICES FOR TICKER TAPE ----
// Fetchable ETF proxies: SPY (S&P 500), DIA (Dow), QQQ (Nasdaq), IWM (Russell 2000)
// Non-fetchable (Finnhub free tier): VIX, DXY, Gold, Crude — kept as static fallback
const TAPE_ETF_SYMBOLS = ['SPY', 'DIA', 'QQQ', 'IWM'];
const TAPE_ETF_LABELS  = { SPY: 'S&P 500', DIA: 'Dow Jones', QQQ: 'Nasdaq', IWM: 'Russell 2000' };
const MARKET_INDICES_FALLBACK = [
  { symbol: 'SPY',  label: 'S&P 500',      price: 5672.80, change: 18.42,  pct: 0.33  },
  { symbol: 'DIA',  label: 'Dow Jones',     price: 42156.30, change: -52.70, pct: -0.13 },
  { symbol: 'QQQ',  label: 'Nasdaq',        price: 19823.45, change: 95.12,  pct: 0.48  },
  { symbol: 'IWM',  label: 'Russell 2000',  price: 2078.60, change: -8.35,  pct: -0.40 },
  { symbol: 'VIX',  label: 'VIX',           price: 16.82,   change: -0.45,  pct: -2.61 },
  { symbol: 'DXY',  label: 'US Dollar',     price: 104.28,  change: 0.18,   pct: 0.17  },
  { symbol: 'GC=F', label: 'Gold',          price: 2345.80, change: 12.60,  pct: 0.54  },
  { symbol: 'CL=F', label: 'Crude Oil',     price: 78.42,   change: -0.86,  pct: -1.08 },
];
// Live tape data — populated by fetchLiveTapeData()
let _liveTapeIndices = null;

// Finnhub API — swap key or provider here
const API_CONFIG = {
  provider: 'finnhub',
  finnhubKey: 'd77hb59r01qp6afll3j0d77hb59r01qp6afll3jg',   // Replace with your free Finnhub key from https://finnhub.io/
  baseUrl: 'https://finnhub.io/api/v1',
};

// ---- REALISTIC FALLBACK DATA ----
const FALLBACK_DATA = {
  AAPL:  { name: 'Apple Inc.',          price: 213.25, change: 2.41,  pct: 1.14,  volume: 54_300_000,  cap: 3_280_000_000_000, high52: 237.49, low52: 164.08 },
  MSFT:  { name: 'Microsoft Corp.',     price: 428.50, change: -1.73, pct: -0.40, volume: 22_100_000,  cap: 3_180_000_000_000, high52: 468.35, low52: 362.90 },
  GOOGL: { name: 'Alphabet Inc.',       price: 163.80, change: 1.22,  pct: 0.75,  volume: 28_600_000,  cap: 2_010_000_000_000, high52: 191.75, low52: 130.67 },
  AMZN:  { name: 'Amazon.com Inc.',     price: 192.45, change: 3.17,  pct: 1.67,  volume: 46_800_000,  cap: 2_010_000_000_000, high52: 215.90, low52: 151.61 },
  NVDA:  { name: 'NVIDIA Corp.',        price: 118.62, change: -2.08, pct: -1.72, volume: 312_500_000, cap: 2_900_000_000_000, high52: 153.13, low52: 75.61  },
  TSLA:  { name: 'Tesla Inc.',          price: 271.30, change: 8.42,  pct: 3.20,  volume: 108_700_000, cap: 870_000_000_000,   high52: 488.54, low52: 138.80 },
  META:  { name: 'Meta Platforms Inc.', price: 597.10, change: -4.56, pct: -0.76, volume: 14_900_000,  cap: 1_510_000_000_000, high52: 638.40, low52: 414.50 },
  SPY:   { name: 'SPDR S&P 500 ETF',   price: 567.80, change: 1.94,  pct: 0.34,  volume: 63_200_000,  cap: 524_000_000_000,   high52: 613.23, low52: 493.86 },
  NFLX:  { name: 'Netflix Inc.',        price: 918.40, change: 12.30, pct: 1.36,  volume: 5_600_000,   cap: 396_000_000_000,   high52: 1005.99, low52: 543.22 },
  AMD:   { name: 'AMD Inc.',            price: 112.85, change: -0.95, pct: -0.83, volume: 42_100_000,  cap: 182_000_000_000,   high52: 186.47, low52: 103.38 },
  JPM:   { name: 'JPMorgan Chase',      price: 245.30, change: 1.10,  pct: 0.45,  volume: 9_800_000,   cap: 690_000_000_000,   high52: 268.30, low52: 183.22 },
  V:     { name: 'Visa Inc.',           price: 315.70, change: 0.85,  pct: 0.27,  volume: 6_400_000,   cap: 612_000_000_000,   high52: 332.10, low52: 260.55 },
  DIS:   { name: 'Walt Disney Co.',     price: 109.20, change: -1.35, pct: -1.22, volume: 11_200_000,  cap: 198_000_000_000,   high52: 123.74, low52: 83.91  },
  INTC:  { name: 'Intel Corp.',         price: 23.45,  change: 0.32,  pct: 1.38,  volume: 38_900_000,  cap: 101_000_000_000,   high52: 39.78,  low52: 18.51  },
};

// Company name lookup for tickers not in fallback
const COMPANY_NAMES = {
  ...Object.fromEntries(Object.entries(FALLBACK_DATA).map(([k, v]) => [k, v.name])),
};

// ---- STATE ----
let stockData = {};        // ticker -> data object
let watchlist = [];         // array of ticker strings
let displayInterval = null;
let displayIndex = 0;
let refreshTimer = null;
let sparklineCharts = {};   // ticker -> chart instance
let currentModalTicker = null;
let currentSort = 'default'; // active sort mode

// ---- DOM REFS ----
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);
const grid = $('#stock-grid');
const searchForm = $('#search-form');
const searchInput = $('#search-input');
const modal = $('#chart-modal');
const displayOverlay = $('#display-overlay');
const searchToggleBtn = $('#search-toggle-btn');
const headerSearch = $('#header-search');

// ---- SEARCH TOGGLE (mobile compact header) ----
if (searchToggleBtn && headerSearch) {
  searchToggleBtn.addEventListener('click', () => {
    const isOpen = headerSearch.classList.toggle('open');
    searchToggleBtn.classList.toggle('active', isOpen);
    if (isOpen) searchInput.focus();
  });
}

// =========================================================
//  DATA LAYER — structured so API provider can be swapped
// =========================================================

/**
 * Fetch stock quotes for an array of tickers.
 * Returns { ticker: { name, price, change, pct, volume, cap, high52, low52 } }
 */
async function fetchStockData(tickers) {
  let data = {};
  try {
    data = await fetchFromFinnhub(tickers);
    if (data && Object.keys(data).length > 0) {
      updateTimestamp();
      // For tickers Finnhub didn't return, try fallback (known tickers only)
      const missing = tickers.filter(t => !data[t]);
      if (missing.length > 0) {
        const fallback = getFallbackData(missing);
        for (const t of missing) {
          if (fallback[t]) data[t] = fallback[t];
          // null = unknown ticker — left out of data so card won't render
        }
      }
      return data;
    }
  } catch (e) {
    console.warn('Finnhub fetch failed, using fallback data:', e.message);
  }
  // Fallback: realistic hardcoded data with small jitter
  updateTimestamp('fallback');
  return getFallbackData(tickers);
}

/**
 * Finnhub API — fetch quote + basic metrics for each ticker
 * Quote endpoint:   /quote?symbol=AAPL&token=KEY
 * Metric endpoint:  /stock/metric?symbol=AAPL&metric=all&token=KEY
 */
async function fetchFromFinnhub(tickers) {
  const results = {};
  const promises = tickers.map(async (ticker) => {
    const quoteUrl  = `${API_CONFIG.baseUrl}/quote?symbol=${encodeURIComponent(ticker)}&token=${API_CONFIG.finnhubKey}`;
    const metricUrl = `${API_CONFIG.baseUrl}/stock/metric?symbol=${encodeURIComponent(ticker)}&metric=all&token=${API_CONFIG.finnhubKey}`;
    try {
      // Fetch quote and metrics in parallel
      const [qRes, mRes] = await Promise.all([
        fetch(quoteUrl,  { signal: AbortSignal.timeout(8000) }),
        fetch(metricUrl, { signal: AbortSignal.timeout(8000) }),
      ]);
      if (!qRes.ok) throw new Error(`HTTP ${qRes.status}`);
      const q = await qRes.json();
      // Finnhub returns { c: current, d: change, dp: pct, h: high, l: low, o: open, pc: prevClose, t: timestamp }
      if (q && q.c && q.c > 0) {
        // Parse metrics (volume, 52w range, market cap) if available
        let vol    = FALLBACK_DATA[ticker]?.volume || 0;
        let cap    = FALLBACK_DATA[ticker]?.cap    || 0;
        let high52 = FALLBACK_DATA[ticker]?.high52 || q.h;
        let low52  = FALLBACK_DATA[ticker]?.low52  || q.l;

        if (mRes.ok) {
          try {
            const m = await mRes.json();
            const mm = m?.metric || {};
            // 52-week high/low
            if (mm['52WeekHigh'])  high52 = mm['52WeekHigh'];
            if (mm['52WeekLow'])   low52  = mm['52WeekLow'];
            // Market cap: Finnhub reports in millions on free tier
            if (mm['marketCapitalization']) cap = mm['marketCapitalization'] * 1e6;
            // Volume: use 10-day avg or last close volume
            if (mm['10DayAverageTradingVolume']) vol = Math.round(mm['10DayAverageTradingVolume'] * 1e6);
            else if (mm['3MonthAverageTradingVolume']) vol = Math.round(mm['3MonthAverageTradingVolume'] * 1e6);
          } catch {}
        }

        results[ticker] = {
          name: COMPANY_NAMES[ticker] || ticker,
          price: q.c,
          change: q.d || 0,
          pct: q.dp || 0,
          volume: vol,
          cap,
          high52,
          low52,
          dayHigh: q.h,
          dayLow: q.l,
          open: q.o,
          prevClose: q.pc,
          liveMetrics: true,  // flag so UI can mark these as real data
        };
      }
    } catch (err) {
      console.warn(`Finnhub: failed for ${ticker}:`, err.message);
    }
  });
  await Promise.all(promises);
  return results;
}

/**
 * Fallback data with small jitter to simulate live feel
 */
function getFallbackData(tickers) {
  const out = {};
  for (const t of tickers) {
    const base = FALLBACK_DATA[t];
    if (base) {
      const jitter = (Math.random() - 0.5) * 2;
      const price = +(base.price + jitter).toFixed(2);
      const change = +(base.change + jitter * 0.3).toFixed(2);
      const pct = +((change / (price - change)) * 100).toFixed(2);
      out[t] = { ...base, price, change, pct,
        volume: formatBigNumber(base.volume),
        cap: formatBigNumber(base.cap),
      };
    } else {
      // Unknown ticker — do not fabricate data
      out[t] = null;
    }
  }
  return out;
}

/**
 * Cache for historical candle data: { 'AAPL_D_30': { data: [...], ts: Date.now() } }
 */
const _candleCache = {};
const CANDLE_CACHE_TTL = 5 * 60 * 1000; // 5 min cache

/**
 * Fetch real historical candle data from Finnhub /stock/candle endpoint.
 * resolution: '1', '5', '15', '30', '60', 'D', 'W', 'M'
 * Returns array of { time, open, high, low, close } for candlestick,
 * or array of { time, value } for sparkline (close-only).
 */
async function fetchCandleData(ticker, days = 90, mode = 'candle') {
  const resolution = days <= 5 ? '15' : 'D';
  const cacheKey = `${ticker}_${resolution}_${days}`;
  const cached = _candleCache[cacheKey];
  if (cached && (Date.now() - cached.ts) < CANDLE_CACHE_TTL) {
    return mode === 'sparkline'
      ? cached.data.map(d => ({ time: d.time, value: d.close }))
      : cached.data;
  }

  const now = Math.floor(Date.now() / 1000);
  const from = now - days * 86400;
  const url = `${API_CONFIG.baseUrl}/stock/candle?symbol=${encodeURIComponent(ticker)}&resolution=${resolution}&from=${from}&to=${now}&token=${API_CONFIG.finnhubKey}`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    if (json.s !== 'ok' || !json.c || json.c.length === 0) {
      console.warn(`No candle data for ${ticker}, falling back to generated data`);
      return mode === 'sparkline'
        ? _generateFallbackSparkline(ticker)
        : _generateFallbackCandles(ticker, days);
    }

    const data = [];
    for (let i = 0; i < json.c.length; i++) {
      const ts = json.t[i];
      // For daily resolution, convert to YYYY-MM-DD string
      let timeVal;
      if (resolution === 'D' || resolution === 'W' || resolution === 'M') {
        const dt = new Date(ts * 1000);
        timeVal = dt.toISOString().split('T')[0];
      } else {
        timeVal = ts;
      }
      data.push({
        time: timeVal,
        open: +json.o[i].toFixed(2),
        high: +json.h[i].toFixed(2),
        low: +json.l[i].toFixed(2),
        close: +json.c[i].toFixed(2),
        volume: json.v ? json.v[i] : 0,
      });
    }

    // Sort by time ascending
    data.sort((a, b) => (a.time < b.time ? -1 : a.time > b.time ? 1 : 0));

    _candleCache[cacheKey] = { data, ts: Date.now() };

    if (mode === 'sparkline') {
      return data.map(d => ({ time: d.time, value: d.close }));
    }
    return data;
  } catch (err) {
    console.warn(`Candle fetch failed for ${ticker}:`, err.message);
    return mode === 'sparkline'
      ? _generateFallbackSparkline(ticker)
      : _generateFallbackCandles(ticker, days);
  }
}

/**
 * Fallback sparkline generator (used only when API fails)
 */
function _generateFallbackSparkline(ticker, points = 30) {
  const base = stockData[ticker];
  if (!base) return [];
  const data = [];
  let val = base.price - base.change * 1.5;
  const now = new Date();
  for (let i = points; i >= 0; i--) {
    val += (Math.random() - 0.48) * (base.price * 0.007);
    const d = new Date(now);
    d.setMinutes(d.getMinutes() - i * 15);
    data.push({ time: d.getTime() / 1000, value: +val.toFixed(2) });
  }
  data[data.length - 1].value = base.price;
  return data;
}

/**
 * Fallback candlestick generator (used only when API fails)
 */
function _generateFallbackCandles(ticker, days = 90) {
  const base = stockData[ticker];
  if (!base) return [];
  const data = [];
  let close = base.price * (1 - base.pct / 100 * 0.5);
  const now = new Date();
  for (let i = days; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dow = d.getDay();
    if (dow === 0 || dow === 6) continue;
    const dayStr = d.toISOString().split('T')[0];
    const open = close + (Math.random() - 0.5) * (close * 0.015);
    const high = Math.max(open, close) + Math.random() * (close * 0.01);
    const low = Math.min(open, close) - Math.random() * (close * 0.01);
    close = close + (Math.random() - 0.48) * (close * 0.02);
    close = Math.max(close, 1);
    data.push({
      time: dayStr,
      open: +open.toFixed(2),
      high: +high.toFixed(2),
      low: +low.toFixed(2),
      close: +close.toFixed(2),
    });
  }
  if (data.length > 0) {
    const last = data[data.length - 1];
    last.close = base.price;
    last.high = Math.max(last.high, base.price);
    last.low = Math.min(last.low, base.price);
  }
  return data;
}

// =========================================================
//  HELPERS
// =========================================================
function formatBigNumber(n) {
  if (typeof n === 'string') return n;
  if (n == null) return '--';
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return String(n);
}

function formatPrice(p) {
  if (p == null) return '--';
  return p.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

function formatChange(change, pct) {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)} (${sign}${pct.toFixed(2)}%)`;
}

function isUp(change) { return change >= 0; }

function trendArrowSVG(up) {
  if (up) {
    return `<span class="trend-arrow"><svg viewBox="0 0 12 12" fill="none"><path d="M6 2L10 7H2L6 2Z" fill="currentColor"/></svg></span>`;
  }
  return `<span class="trend-arrow"><svg viewBox="0 0 12 12" fill="none"><path d="M6 10L2 5H10L6 10Z" fill="currentColor"/></svg></span>`;
}

function updateTimestamp(mode) {
  const el = $('#last-updated');
  if (!el) return;
  const now = new Date();
  const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  el.textContent = mode === 'fallback' ? `Sample data - ${time}` : `Updated ${time}`;
}

function updateMarketStatus() {
  const now = new Date();
  const et = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const hour = et.getHours();
  const min = et.getMinutes();
  const dow = et.getDay();
  const mins = hour * 60 + min;
  const isOpen = dow >= 1 && dow <= 5 && mins >= 570 && mins < 960; // 9:30-16:00 ET

  const els = [$$('.market-status')];
  document.querySelectorAll('.market-status').forEach(el => {
    el.textContent = isOpen ? 'LIVE' : 'Market Closed';
    el.className = `market-status ${isOpen ? 'open' : 'closed'}`;
  });
}

function showToast(msg, isError = false) {
  let toast = $('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.toggle('error', isError);
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

// ---- LocalStorage ----
function loadWatchlist() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return [...DEFAULT_TICKERS];
}

function saveWatchlist() {
  localStorage.setItem(LS_KEY, JSON.stringify(watchlist));
}

// =========================================================
//  HELPERS — Range Bar
// =========================================================
/**
 * Build a visual day-range progress bar HTML.
 * prefix: 'card' or 'd' (for display cards)
 */
function buildRangeBar(price, low, high, prefix = 'card') {
  const range = high - low;
  if (range <= 0) return '';
  const pct = Math.min(Math.max(((price - low) / range) * 100, 0), 100);
  const lowFmt  = price < 100 ? low.toFixed(2)  : low.toFixed(0);
  const highFmt = price < 100 ? high.toFixed(2) : high.toFixed(0);
  return `
    <div class="${prefix}-range-bar-wrap" aria-label="Day range: low $${lowFmt}, current $${price.toFixed(2)}, high $${highFmt}">
      <div class="${prefix}-range-labels">
        <span>$${lowFmt}</span>
        <span style="color:var(--text-secondary);font-size:0.6rem;">Day Range</span>
        <span>$${highFmt}</span>
      </div>
      <div class="${prefix}-range-track">
        <div class="${prefix}-range-fill" style="width:${pct.toFixed(1)}%"></div>
        <div class="${prefix}-range-thumb" style="left:${pct.toFixed(1)}%"></div>
      </div>
    </div>`;
}

// =========================================================
//  SORT HELPERS
// =========================================================
function getSortedWatchlist() {
  const list = [...watchlist];
  switch (currentSort) {
    case 'change-desc':
      return list.sort((a, b) => (stockData[b]?.pct ?? 0) - (stockData[a]?.pct ?? 0));
    case 'change-asc':
      return list.sort((a, b) => (stockData[a]?.pct ?? 0) - (stockData[b]?.pct ?? 0));
    case 'price-desc':
      return list.sort((a, b) => (stockData[b]?.price ?? 0) - (stockData[a]?.price ?? 0));
    case 'alpha':
      return list.sort((a, b) => a.localeCompare(b));
    default:
      return list;
  }
}

// Wire up sort buttons
document.querySelectorAll('.sort-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    currentSort = btn.dataset.sort;
    document.querySelectorAll('.sort-btn').forEach(b => {
      b.classList.toggle('active', b === btn);
      b.setAttribute('aria-checked', b === btn ? 'true' : 'false');
    });
    renderGrid();
  });
});

// =========================================================
//  PORTFOLIO SUMMARY STRIP
// =========================================================
function renderPortfolioSummary() {
  const el = document.getElementById('portfolio-summary');
  if (!el) return;
  const tickers = watchlist.filter(t => stockData[t]);
  if (tickers.length === 0) { el.innerHTML = ''; return; }
  const gainers = tickers.filter(t => stockData[t].change >= 0).length;
  const losers  = tickers.length - gainers;
  const topGainer = tickers.reduce((best, t) => {
    if (!best || stockData[t].pct > stockData[best].pct) return t;
    return best;
  }, null);
  const topLoser = tickers.reduce((worst, t) => {
    if (!worst || stockData[t].pct < stockData[worst].pct) return t;
    return worst;
  }, null);
  const tg = topGainer ? stockData[topGainer] : null;
  const tl = topLoser  ? stockData[topLoser]  : null;

  el.innerHTML = `
    <span class="ps-item ps-gainers">
      <span class="ps-dot ps-dot-up"></span>
      <span class="ps-val">${gainers}</span> gainer${gainers !== 1 ? 's' : ''}
    </span>
    <span class="ps-sep">·</span>
    <span class="ps-item ps-losers">
      <span class="ps-dot ps-dot-down"></span>
      <span class="ps-val">${losers}</span> loser${losers !== 1 ? 's' : ''}
    </span>
    ${tg ? `<span class="ps-sep">·</span><span class="ps-item ps-best">Best: <strong>${topGainer}</strong> <span style="color:var(--green)">+${tg.pct.toFixed(2)}%</span></span>` : ''}
    ${tl && losers > 0 ? `<span class="ps-sep">·</span><span class="ps-item ps-worst">Worst: <strong>${topLoser}</strong> <span style="color:var(--red)">${tl.pct.toFixed(2)}%</span></span>` : ''}
  `;
}

// =========================================================
//  RENDERING — Stock Card Grid
// =========================================================
function renderGrid() {
  renderPortfolioSummary();
  if (watchlist.length === 0) {
    grid.innerHTML = `<div class="empty-state"><h3>No stocks in your watchlist</h3><p>Use the search bar to add tickers.</p></div>`;
    return;
  }

  // Clean up existing sparkline charts
  Object.values(sparklineCharts).forEach(c => { try { c.remove(); } catch {} });
  sparklineCharts = {};

  grid.innerHTML = '';
  const sortedList = getSortedWatchlist();
  for (const ticker of sortedList) {
    const d = stockData[ticker];
    if (!d) continue;
    const up = isUp(d.change);
    const vol = typeof d.volume === 'string' ? d.volume : formatBigNumber(d.volume);
    const mcap = typeof d.cap === 'string' ? d.cap : formatBigNumber(d.cap);

    const card = document.createElement('div');
    card.className = 'stock-card';
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `${ticker} ${d.name} ${formatPrice(d.price)} ${up ? 'up' : 'down'} ${formatChange(d.change, d.pct)}. Press Enter to view chart.`);
    card.dataset.ticker = ticker;
    card.dataset.trend = up ? 'up' : 'down';
    // Day range bar (only when we have day high/low from live data or use today's sparkline range)
    const dayH = d.dayHigh || d.high52;
    const dayL = d.dayLow  || d.low52;
    const dayRangeBar = (dayH && dayL && dayH > dayL) ? buildRangeBar(d.price, dayL, dayH, 'card') : '';

    card.innerHTML = `
      <div class="card-top">
        <div>
          <div class="card-ticker">${ticker}</div>
          <div class="card-company">${d.name}</div>
        </div>
        <button class="card-remove" data-ticker="${ticker}" title="Remove">&times;</button>
      </div>
      <div class="card-price-row">
        <span class="card-price live-pulse">${formatPrice(d.price)}</span>
        <span class="card-change ${up ? 'up' : 'down'}">${trendArrowSVG(up)}${formatChange(d.change, d.pct)}</span>
      </div>
      ${dayRangeBar}
      <div class="card-sparkline" id="spark-${ticker}"></div>
      <div class="card-metrics">
        <div class="card-metric"><span class="card-metric-label">Vol</span><span class="card-metric-value">${vol}</span></div>
        <div class="card-metric"><span class="card-metric-label">Mkt Cap</span><span class="card-metric-value">${mcap}</span></div>
        <div class="card-metric"><span class="card-metric-label">52w H</span><span class="card-metric-value">${formatPrice(d.high52)}</span></div>
        <div class="card-metric"><span class="card-metric-label">52w L</span><span class="card-metric-value">${formatPrice(d.low52)}</span></div>
      </div>
      ${d.liveMetrics ? '<div class="card-live-badge" title="All metrics sourced live from Finnhub">&#11044; live data</div>' : ''}
    `;

    // Click card -> detail chart
    card.addEventListener('click', (e) => {
      if (e.target.classList.contains('card-remove')) return;
      openModal(ticker);
    });

    // Keyboard: Enter/Space -> open chart
    card.addEventListener('keydown', (e) => {
      if (e.target.classList.contains('card-remove')) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal(ticker);
      }
    });

    // Remove button
    card.querySelector('.card-remove').addEventListener('click', (e) => {
      e.stopPropagation();
      removeTicker(ticker);
    });

    grid.appendChild(card);
  }

  // Render sparklines after DOM paint
  requestAnimationFrame(() => {
    for (const ticker of sortedList) {
      renderSparkline(ticker);
    }
  });
}

function renderSparkline(ticker) {
  const el = document.getElementById(`spark-${ticker}`);
  if (!el || !window.LightweightCharts) return;
  el.innerHTML = '';
  const d = stockData[ticker];
  if (!d) return;
  const up = isUp(d.change);

  const chart = LightweightCharts.createChart(el, {
    width: el.clientWidth,
    height: 80,
    layout: { background: { type: 'solid', color: 'transparent' }, textColor: 'transparent' },
    grid: { vertLines: { visible: false }, horzLines: { visible: false } },
    crosshair: { mode: 0 },
    rightPriceScale: { visible: false },
    timeScale: { visible: false },
    handleScroll: false,
    handleScale: false,
  });

  const series = chart.addAreaSeries({
    lineColor: up ? '#00d672' : '#ff4757',
    topColor: up ? 'rgba(0,214,114,0.15)' : 'rgba(255,71,87,0.15)',
    bottomColor: 'transparent',
    lineWidth: 2,
    crosshairMarkerVisible: false,
    priceLineVisible: false,
    lastValueVisible: false,
  });
  // Fetch real historical data for sparkline (30 days)
  sparklineCharts[ticker] = chart;
  fetchCandleData(ticker, 30, 'sparkline').then(data => {
    if (data && data.length > 0) {
      series.setData(data);
      chart.timeScale().fitContent();
    }
  });
}

/**
 * Render a mini sparkline inside a display mode card.
 */
function renderDisplaySparkline(ticker) {
  const el = document.getElementById(`dspark-${ticker}`);
  if (!el || !window.LightweightCharts) return;
  el.innerHTML = '';
  const d = stockData[ticker];
  if (!d) return;
  const up = isUp(d.change);

  const chart = LightweightCharts.createChart(el, {
    width: el.clientWidth || 200,
    height: 56,
    layout: { background: { type: 'solid', color: 'transparent' }, textColor: 'transparent' },
    grid: { vertLines: { visible: false }, horzLines: { visible: false } },
    crosshair: { mode: 0 },
    rightPriceScale: { visible: false },
    timeScale: { visible: false },
    handleScroll: false,
    handleScale: false,
  });

  const series = chart.addAreaSeries({
    lineColor: up ? 'rgba(0,214,114,0.9)' : 'rgba(255,71,87,0.9)',
    topColor:    up ? 'rgba(0,214,114,0.25)' : 'rgba(255,71,87,0.25)',
    bottomColor: 'transparent',
    lineWidth: 2,
    crosshairMarkerVisible: false,
    priceLineVisible: false,
    lastValueVisible: false,
  });

  displaySparklineCharts[ticker] = chart;
  fetchCandleData(ticker, 30, 'sparkline').then(data => {
    if (data && data.length > 0) {
      series.setData(data);
      chart.timeScale().fitContent();
    }
  });
}

// =========================================================
//  MODAL / DETAIL CHART
// =========================================================
let modalChart = null;

let _lastFocusedElement = null;

async function openModal(ticker) {
  let d = stockData[ticker];
  if (!d) {
    // Data may not be loaded yet — try fetching on demand
    showToast(`Loading ${ticker} data...`);
    const fetched = await fetchStockData([ticker]);
    if (fetched[ticker]) {
      stockData[ticker] = fetched[ticker];
      d = stockData[ticker];
    } else {
      showToast(`Could not load data for ${ticker}`, true);
      return;
    }
  }
  const up = isUp(d.change);
  currentModalTicker = ticker;
  _lastFocusedElement = document.activeElement;

  $('#modal-ticker').textContent = ticker;
  $('#modal-company').textContent = d.name;

  const vol = typeof d.volume === 'string' ? d.volume : formatBigNumber(d.volume);
  const mcap = typeof d.cap === 'string' ? d.cap : formatBigNumber(d.cap);

  const metrics = [
    ['Price', formatPrice(d.price), ''],
    ['Day Change', formatChange(d.change, d.pct), up ? 'color:var(--green)' : 'color:var(--red)'],
    ['Volume', vol, ''],
    ['Mkt Cap', mcap, ''],
    ['52w High', formatPrice(d.high52), ''],
    ['52w Low', formatPrice(d.low52), ''],
  ];

  if (d.open) metrics.push(['Open', formatPrice(d.open), '']);
  if (d.prevClose) metrics.push(['Prev Close', formatPrice(d.prevClose), '']);

  $('#modal-metrics').innerHTML = metrics.map(([label, val, style]) => {
    const s = style ? `style="${style}"` : '';
    return `<div class="modal-metric"><div class="modal-metric-label">${label}</div><div class="modal-metric-value" ${s}>${val}</div></div>`;
  }).join('');

  // Reset timerange buttons — default to 3M (90 days) for meaningful chart view
  $$('.tr-btn').forEach(b => {
    const isActive = b.dataset.days === '90';
    b.classList.toggle('active', isActive);
    b.setAttribute('aria-checked', isActive ? 'true' : 'false');
  });

  renderModalChart(ticker, 90); // 3M default
  modal.classList.remove('hidden');

  // Focus trap: move focus to close button
  requestAnimationFrame(() => {
    $('#modal-close').focus();
  });
}

function renderModalChart(ticker, days) {
  const container = $('#chart-container');
  container.innerHTML = '';
  if (modalChart) { try { modalChart.remove(); } catch {} modalChart = null; }

  modalChart = LightweightCharts.createChart(container, {
    width: container.clientWidth,
    height: 350,
    layout: { background: { type: 'solid', color: '#111820' }, textColor: '#8b949e' },
    grid: { vertLines: { color: '#1a2030' }, horzLines: { color: '#1a2030' } },
    crosshair: {
      mode: 1,
      vertLine: { color: 'rgba(78,168,246,0.4)', width: 1, style: 2, labelBackgroundColor: '#253040' },
      horzLine: { color: 'rgba(78,168,246,0.4)', width: 1, style: 2, labelBackgroundColor: '#253040' },
    },
    rightPriceScale: { borderColor: '#253040' },
    timeScale: { borderColor: '#253040' },
  });

  const up = isUp(stockData[ticker]?.change || 0);
  const candleSeries = modalChart.addCandlestickSeries({
    upColor: '#00d672', downColor: '#ff4757',
    borderUpColor: '#00d672', borderDownColor: '#ff4757',
    wickUpColor: '#00d672', wickDownColor: '#ff4757',
  });

  // Volume histogram series — rendered on a separate scale overlay
  const volumeSeries = modalChart.addHistogramSeries({
    color: 'rgba(78,168,246,0.2)',
    priceFormat: { type: 'volume' },
    priceScaleId: 'volume',
    lastValueVisible: false,
    priceLineVisible: false,
  });
  modalChart.priceScale('volume').applyOptions({
    scaleMargins: { top: 0.80, bottom: 0 },
    visible: false,
  });

  // Fetch real historical candle data
  fetchCandleData(ticker, days, 'candle').then(data => {
    if (data && data.length > 0 && modalChart) {
      candleSeries.setData(data);
      // Feed volume data with directional color (up=green, down=red) at 20% opacity
      const volData = data
        .filter(d => d.volume > 0)
        .map(d => ({
          time: d.time,
          value: d.volume,
          color: d.close >= d.open ? 'rgba(0,214,114,0.20)' : 'rgba(255,71,87,0.20)',
        }));
      if (volData.length > 0) volumeSeries.setData(volData);
      modalChart.timeScale().fitContent();
      // --- Accessibility: generate sr-only text summary of the chart ---
      generateChartA11ySummary(ticker, days, data);
    }
  });

  // Crosshair tooltip for OHLC data
  const tooltip = document.getElementById('chart-tooltip');
  modalChart.subscribeCrosshairMove((param) => {
    if (!param || !param.time || !param.seriesData || param.seriesData.size === 0) {
      tooltip.style.display = 'none';
      return;
    }
    const d = param.seriesData.get(candleSeries);
    if (!d) { tooltip.style.display = 'none'; return; }
    const dateStr = typeof param.time === 'string' ? param.time :
      `${param.time.year}-${String(param.time.month).padStart(2,'0')}-${String(param.time.day).padStart(2,'0')}`;
    const change = d.close - d.open;
    const pct = d.open !== 0 ? ((change / d.open) * 100).toFixed(2) : '0.00';
    const color = change >= 0 ? 'var(--green)' : 'var(--red)';
    const sign = change >= 0 ? '+' : '';
    tooltip.innerHTML =
      `<div class="tt-date">${dateStr}</div>` +
      `<div class="tt-row"><span>O</span><span>${d.open.toFixed(2)}</span></div>` +
      `<div class="tt-row"><span>H</span><span>${d.high.toFixed(2)}</span></div>` +
      `<div class="tt-row"><span>L</span><span>${d.low.toFixed(2)}</span></div>` +
      `<div class="tt-row" style="color:${color}"><span>C</span><span>${d.close.toFixed(2)}</span></div>` +
      `<div class="tt-change" style="color:${color}">${sign}${change.toFixed(2)} (${sign}${pct}%)</div>`;
    tooltip.style.display = 'block';

    // Position tooltip near the cursor but within the modal
    const containerRect = container.getBoundingClientRect();
    const x = param.point.x;
    const tooltipWidth = 140;
    const left = x > containerRect.width / 2 ? x - tooltipWidth - 12 : x + 12;
    tooltip.style.left = left + 'px';
    tooltip.style.top = '8px';
  });

  // Resize handler
  const onResize = () => {
    if (modalChart) modalChart.applyOptions({ width: container.clientWidth });
  };
  window.addEventListener('resize', onResize);
  modal._resizeHandler = onResize;
}

/**
 * Generate an accessible screen-reader-only text summary of the chart.
 * Injected as a sr-only element inside #chart-wrap.
 */
function generateChartA11ySummary(ticker, days, data) {
  const wrap = document.getElementById('chart-wrap');
  if (!wrap || !data || data.length === 0) return;

  // Remove existing summary
  const existing = wrap.querySelector('.chart-a11y-summary');
  if (existing) existing.remove();

  const first = data[0];
  const last  = data[data.length - 1];
  const highs = data.map(d => d.high);
  const lows  = data.map(d => d.low);
  const periodHigh = Math.max(...highs).toFixed(2);
  const periodLow  = Math.min(...lows).toFixed(2);
  const overallChange = last.close - first.open;
  const overallPct    = first.open !== 0
    ? ((overallChange / first.open) * 100).toFixed(2)
    : '0.00';
  const dir    = overallChange >= 0 ? 'up' : 'down';
  const sign   = overallChange >= 0 ? '+' : '';
  const label  = days <= 5 ? '1-week' : days <= 30 ? '1-month' : days <= 90 ? '3-month' : days <= 180 ? '6-month' : '1-year';

  const summary = document.createElement('div');
  summary.className = 'chart-a11y-summary sr-only';
  summary.setAttribute('aria-live', 'polite');
  summary.textContent =
    `${ticker} ${label} chart: opened at $${first.open.toFixed(2)} on ${first.time}, ` +
    `closed at $${last.close.toFixed(2)} on ${last.time}. ` +
    `Period high $${periodHigh}, low $${periodLow}. ` +
    `Overall change ${sign}$${Math.abs(overallChange).toFixed(2)} (${sign}${overallPct}%), trend ${dir}.`;

  wrap.appendChild(summary);
}

function closeModal() {
  modal.classList.add('hidden');
  currentModalTicker = null;
  const tooltip = document.getElementById('chart-tooltip');
  if (tooltip) tooltip.style.display = 'none';
  if (modalChart) { try { modalChart.remove(); } catch {} modalChart = null; }
  if (modal._resizeHandler) {
    window.removeEventListener('resize', modal._resizeHandler);
  }
  // Return focus to the element that opened the modal
  if (_lastFocusedElement) {
    _lastFocusedElement.focus();
    _lastFocusedElement = null;
  }
}

$('#modal-close').addEventListener('click', closeModal);
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

// Focus trap inside modal
modal.addEventListener('keydown', (e) => {
  if (e.key !== 'Tab') return;
  const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  if (focusable.length === 0) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.shiftKey) {
    if (document.activeElement === first) { e.preventDefault(); last.focus(); }
  } else {
    if (document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});

// Time range buttons
$('#chart-timerange').addEventListener('click', (e) => {
  const btn = e.target.closest('.tr-btn');
  if (!btn || !currentModalTicker) return;
  $$('.tr-btn').forEach(b => {
    b.classList.remove('active');
    b.setAttribute('aria-checked', 'false');
  });
  btn.classList.add('active');
  btn.setAttribute('aria-checked', 'true');
  renderModalChart(currentModalTicker, parseInt(btn.dataset.days));
});

// =========================================================
//  DISPLAY MODE (Fullscreen, auto-rotate)
// =========================================================
let displayClockInterval = null;
let displayPage = 0;
const DISPLAY_PAGE_SIZE = 8;
let displaySparklineCharts = {};   // ticker -> chart instance for display mode

function enterDisplayMode() {
  displayIndex = 0;
  displayPage = 0;
  renderDisplayGrid();
  displayOverlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  // Try native fullscreen
  try {
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
  } catch {}

  updateDisplayClock();
  displayClockInterval = setInterval(updateDisplayClock, 1000);

  displayInterval = setInterval(() => {
    const pageSize = Math.min(watchlist.length - displayPage * DISPLAY_PAGE_SIZE, DISPLAY_PAGE_SIZE);
    displayIndex = (displayIndex + 1) % pageSize;
    highlightDisplayCard();
  }, DISPLAY_ROTATE_INTERVAL);
}

function exitDisplayMode() {
  displayOverlay.classList.add('hidden');
  document.body.style.overflow = '';
  if (displayInterval) { clearInterval(displayInterval); displayInterval = null; }
  if (displayClockInterval) { clearInterval(displayClockInterval); displayClockInterval = null; }
  // Clean up display sparklines
  Object.values(displaySparklineCharts).forEach(c => { try { c.remove(); } catch {} });
  displaySparklineCharts = {};

  // Exit fullscreen
  try {
    if (document.fullscreenElement) document.exitFullscreen();
    else if (document.webkitFullscreenElement) document.webkitExitFullscreen();
  } catch {}
}

function renderDisplayGrid() {
  const dg = $('#display-grid');
  dg.innerHTML = '';
  const totalPages = Math.ceil(watchlist.length / DISPLAY_PAGE_SIZE);
  const start = displayPage * DISPLAY_PAGE_SIZE;
  const shown = watchlist.slice(start, start + DISPLAY_PAGE_SIZE);

  // Show/hide pagination controls
  const pagination = $('#display-pagination');
  if (totalPages > 1) {
    pagination.style.display = 'flex';
    $('#display-page-label').textContent = `Page ${displayPage + 1} / ${totalPages}`;
    $('#display-prev-btn').disabled = displayPage === 0;
    $('#display-next-btn').disabled = displayPage >= totalPages - 1;
  } else {
    pagination.style.display = 'none';
  }

  for (let i = 0; i < shown.length; i++) {
    const ticker = shown[i];
    const d = stockData[ticker];
    if (!d) continue;
    const up = isUp(d.change);
    const vol = typeof d.volume === 'string' ? d.volume : formatBigNumber(d.volume);
    const mcap = typeof d.cap === 'string' ? d.cap : formatBigNumber(d.cap);

    // Day range bar for display card
    const dayH = d.dayHigh || null;
    const dayL = d.dayLow  || null;
    const dRangeBar = (dayH && dayL && dayH > dayL) ? buildRangeBar(d.price, dayL, dayH, 'd') : '';

    const card = document.createElement('div');
    card.className = `display-card ${i === 0 ? 'active' : ''}`;
    card.dataset.idx = i;
    card.dataset.trend = up ? 'up' : 'down';
    card.innerHTML = `
      <div class="d-ticker">${ticker}</div>
      <div class="d-company">${d.name}</div>
      <div class="d-price" style="color:${up ? 'var(--green)' : 'var(--red)'}">${formatPrice(d.price)}</div>
      <div class="d-change ${up ? 'up' : 'down'}">${trendArrowSVG(up)}${formatChange(d.change, d.pct)}</div>
      <div class="d-sparkline" id="dspark-${ticker}"></div>
      ${dRangeBar}
      <div class="d-metrics">
        <span>Vol&nbsp;${vol}</span>
        <span>&middot;</span>
        <span>Cap&nbsp;${mcap}</span>
      </div>
    `;
    dg.appendChild(card);
  }

  // Render sparklines inside display cards after DOM paint
  requestAnimationFrame(() => {
    // Clean up old display sparklines
    Object.values(displaySparklineCharts).forEach(c => { try { c.remove(); } catch {} });
    displaySparklineCharts = {};
    for (const ticker of shown) {
      renderDisplaySparkline(ticker);
    }
  });

  // Navigation dots
  const dots = $('#display-dots');
  dots.innerHTML = shown.map((_, i) =>
    `<div class="display-dot ${i === 0 ? 'active' : ''}" data-idx="${i}"></div>`
  ).join('');
}

function highlightDisplayCard() {
  const cards = displayOverlay.querySelectorAll('.display-card');
  const dots = displayOverlay.querySelectorAll('.display-dot');
  const len = cards.length;
  if (len === 0) return;
  const idx = displayIndex % len;
  cards.forEach((c, i) => c.classList.toggle('active', i === idx));
  dots.forEach((d, i) => d.classList.toggle('active', i === idx));
}

function updateDisplayClock() {
  const el = $('#display-clock');
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

$('#display-mode-btn').addEventListener('click', enterDisplayMode);
$('#exit-display-btn').addEventListener('click', exitDisplayMode);

// Display mode pagination
$('#display-prev-btn').addEventListener('click', () => {
  if (displayPage > 0) {
    displayPage--;
    displayIndex = 0;
    renderDisplayGrid();
    highlightDisplayCard();
  }
});
$('#display-next-btn').addEventListener('click', () => {
  const totalPages = Math.ceil(watchlist.length / DISPLAY_PAGE_SIZE);
  if (displayPage < totalPages - 1) {
    displayPage++;
    displayIndex = 0;
    renderDisplayGrid();
    highlightDisplayCard();
  }
});

// Fullscreen change event — if user exits via ESC/browser button
document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement && !displayOverlay.classList.contains('hidden')) {
    exitDisplayMode();
  }
});

// =========================================================
//  KEYBOARD SHORTCUTS
// =========================================================
document.addEventListener('keydown', (e) => {
  // ESC: close modal or display mode
  if (e.key === 'Escape') {
    if (!displayOverlay.classList.contains('hidden')) exitDisplayMode();
    else if (!modal.classList.contains('hidden')) closeModal();
    return;
  }
  // "/" to focus search (also open drawer if collapsed)
  if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
    if (document.activeElement !== searchInput) {
      e.preventDefault();
      if (headerSearch && !headerSearch.classList.contains('open')) {
        headerSearch.classList.add('open');
        if (searchToggleBtn) searchToggleBtn.classList.add('active');
      }
      searchInput.focus();
    }
    return;
  }
  // "f" for fullscreen display mode
  if (e.key === 'f' && document.activeElement !== searchInput && modal.classList.contains('hidden')) {
    enterDisplayMode();
    return;
  }
  // "r" to refresh
  if (e.key === 'r' && document.activeElement !== searchInput && modal.classList.contains('hidden')) {
    e.preventDefault();
    loadAndRender();
  }
  // Arrow keys in display mode — navigate cards
  if (!displayOverlay.classList.contains('hidden')) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const pageSize = Math.min(watchlist.length - displayPage * DISPLAY_PAGE_SIZE, DISPLAY_PAGE_SIZE);
      displayIndex = (displayIndex + 1) % pageSize;
      highlightDisplayCard();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const pageSize = Math.min(watchlist.length - displayPage * DISPLAY_PAGE_SIZE, DISPLAY_PAGE_SIZE);
      displayIndex = (displayIndex - 1 + pageSize) % pageSize;
      highlightDisplayCard();
    }
  }
});

// =========================================================
//  ACTIONS
// =========================================================
async function addTicker(ticker) {
  ticker = ticker.toUpperCase().replace(/[^A-Z0-9.]/g, '').trim();
  if (!ticker) return;
  if (watchlist.includes(ticker)) {
    showToast(`${ticker} is already in your watchlist`, true);
    return;
  }
  if (watchlist.length >= 20) {
    showToast('Watchlist is full (max 20)', true);
    return;
  }
  // Validate ticker — fetch data first, reject if unknown
  showToast(`Looking up ${ticker}...`);
  const data = await fetchStockData([ticker]);
  if (!data[ticker]) {
    showToast(`Ticker "${ticker}" not found. Check the symbol and try again.`, true);
    return;
  }
  stockData[ticker] = data[ticker];
  watchlist.unshift(ticker);
  saveWatchlist();
  showToast(`${ticker} added to watchlist`);
  renderGrid();
  updateMarketStatus();
}

function removeTicker(ticker) {
  watchlist = watchlist.filter(t => t !== ticker);
  delete stockData[ticker];
  if (sparklineCharts[ticker]) {
    try { sparklineCharts[ticker].remove(); } catch {}
    delete sparklineCharts[ticker];
  }
  saveWatchlist();
  renderGrid();
  showToast(`${ticker} removed`);
}

searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  hideAutocomplete();
  const val = searchInput.value.trim();
  if (val) {
    addTicker(val);
    searchInput.value = '';
  }
});

// =========================================================
//  SEARCH AUTOCOMPLETE — Finnhub /search endpoint
// =========================================================
const autocompleteDropdown = $('#search-autocomplete');
let acDebounceTimer = null;
let acHighlightIdx = -1;
let acResults = [];

async function searchAutocomplete(query) {
  if (!query || query.length < 1) { hideAutocomplete(); return; }
  try {
    const url = `${API_CONFIG.baseUrl}/search?q=${encodeURIComponent(query)}&token=${API_CONFIG.finnhubKey}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json && json.result && json.result.length > 0) {
      acResults = json.result
        .filter(r => r.type === 'Common Stock' || r.type === 'ETP' || r.type === 'ADR' || !r.type)
        .slice(0, 8)
        .map(r => ({ symbol: r.symbol, name: r.description || r.symbol }));
      if (acResults.length > 0) {
        showAutocomplete();
        return;
      }
    }
  } catch (err) {
    console.warn('Autocomplete search failed:', err.message);
  }
  hideAutocomplete();
}

function showAutocomplete() {
  acHighlightIdx = -1;
  autocompleteDropdown.innerHTML = acResults.map((r, i) =>
    `<div class="search-autocomplete-item" id="ac-option-${i}" role="option" aria-selected="false" data-idx="${i}" data-symbol="${r.symbol}">
      <span class="ac-symbol">${r.symbol}</span>
      <span class="ac-name">${r.name}</span>
    </div>`
  ).join('');
  autocompleteDropdown.classList.add('visible');
  searchInput.setAttribute('aria-expanded', 'true');
}

function hideAutocomplete() {
  autocompleteDropdown.classList.remove('visible');
  acResults = [];
  acHighlightIdx = -1;
  searchInput.setAttribute('aria-expanded', 'false');
  searchInput.setAttribute('aria-activedescendant', '');
}

function selectAutocompleteItem(symbol) {
  hideAutocomplete();
  searchInput.value = '';
  addTicker(symbol);
}

searchInput.addEventListener('input', () => {
  clearTimeout(acDebounceTimer);
  const val = searchInput.value.trim();
  if (!val) { hideAutocomplete(); return; }
  acDebounceTimer = setTimeout(() => searchAutocomplete(val), 250);
});

searchInput.addEventListener('keydown', (e) => {
  if (!autocompleteDropdown.classList.contains('visible')) return;
  const items = autocompleteDropdown.querySelectorAll('.search-autocomplete-item');
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    acHighlightIdx = Math.min(acHighlightIdx + 1, items.length - 1);
    items.forEach((el, i) => {
      el.classList.toggle('highlighted', i === acHighlightIdx);
      el.setAttribute('aria-selected', i === acHighlightIdx ? 'true' : 'false');
    });
    searchInput.setAttribute('aria-activedescendant', `ac-option-${acHighlightIdx}`);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    acHighlightIdx = Math.max(acHighlightIdx - 1, 0);
    items.forEach((el, i) => {
      el.classList.toggle('highlighted', i === acHighlightIdx);
      el.setAttribute('aria-selected', i === acHighlightIdx ? 'true' : 'false');
    });
    searchInput.setAttribute('aria-activedescendant', `ac-option-${acHighlightIdx}`);
  } else if (e.key === 'Enter' && acHighlightIdx >= 0 && acHighlightIdx < acResults.length) {
    e.preventDefault();
    e.stopPropagation();
    selectAutocompleteItem(acResults[acHighlightIdx].symbol);
  } else if (e.key === 'Escape') {
    hideAutocomplete();
  }
});

autocompleteDropdown.addEventListener('click', (e) => {
  const item = e.target.closest('.search-autocomplete-item');
  if (item) {
    selectAutocompleteItem(item.dataset.symbol);
  }
});

document.addEventListener('click', (e) => {
  if (!searchForm.contains(e.target)) hideAutocomplete();
});

searchInput.addEventListener('blur', () => {
  setTimeout(hideAutocomplete, 200);
});

$('#refresh-btn').addEventListener('click', () => {
  showToast('Refreshing...');
  loadAndRender();
});

// =========================================================
//  INIT
// =========================================================
async function loadAndRender() {
  watchlist = loadWatchlist();
  if (watchlist.length === 0) {
    watchlist = [...DEFAULT_TICKERS];
    saveWatchlist();
  }

  // Show loading
  grid.innerHTML = `<div class="empty-state"><div class="loading-spinner"></div><p style="margin-top:12px;color:var(--text-muted)">Loading market data...</p></div>`;

  const data = await fetchStockData(watchlist);
  // Filter out null entries (unknown tickers) and remove them from watchlist
  const invalidTickers = Object.keys(data).filter(t => data[t] === null);
  if (invalidTickers.length > 0) {
    invalidTickers.forEach(t => delete data[t]);
    watchlist = watchlist.filter(t => !invalidTickers.includes(t));
    saveWatchlist();
  }
  // Detect price changes for flash animations
  const priceChanges = {};
  for (const ticker of watchlist) {
    if (data[ticker] && stockData[ticker]) {
      const oldPrice = stockData[ticker].price;
      const newPrice = data[ticker].price;
      if (oldPrice !== newPrice) {
        priceChanges[ticker] = newPrice > oldPrice ? 'up' : 'down';
      }
    }
  }

  stockData = { ...stockData, ...data };
  renderGrid();
  updateMarketStatus();

  // Apply flash micro-animations to cards with changed prices
  for (const [ticker, dir] of Object.entries(priceChanges)) {
    const card = document.querySelector(`.stock-card[data-ticker="${ticker}"]`);
    if (!card) continue;
    card.classList.add(dir === 'up' ? 'flash-up' : 'flash-down');
    const priceEl = card.querySelector('.card-price');
    if (priceEl) priceEl.classList.add(dir === 'up' ? 'price-flash-up' : 'price-flash-down');
    setTimeout(() => {
      card.classList.remove('flash-up', 'flash-down');
      if (priceEl) priceEl.classList.remove('price-flash-up', 'price-flash-down');
    }, 1200);
  }

  // Update display mode if active
  if (!displayOverlay.classList.contains('hidden')) {
    renderDisplayGrid();
    highlightDisplayCard();
  }
}

// Start
loadAndRender();

// Auto-refresh every minute
refreshTimer = setInterval(() => loadAndRender(), REFRESH_INTERVAL);

// Update market status every 30 seconds
setInterval(updateMarketStatus, 30_000);

// =========================================================
//  TICKER TAPE — scrolling market indices banner (live ETF data)
// =========================================================

/**
 * Fetch live quotes for tape ETFs (SPY/DIA/QQQ/IWM) from Finnhub.
 * Returns array in same shape as MARKET_INDICES_FALLBACK for the 4 ETFs,
 * or null on failure so caller falls back to static data.
 */
async function fetchLiveTapeData() {
  try {
    const results = await Promise.all(
      TAPE_ETF_SYMBOLS.map(async (symbol) => {
        const url = `${API_CONFIG.baseUrl}/quote?symbol=${encodeURIComponent(symbol)}&token=${API_CONFIG.finnhubKey}`;
        const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const q = await res.json();
        if (!q || !q.c || q.c <= 0) throw new Error(`No data for ${symbol}`);
        return {
          symbol,
          label: TAPE_ETF_LABELS[symbol],
          price:  q.c,
          change: q.d  || 0,
          pct:    q.dp || 0,
          live:   true,
        };
      })
    );
    // Merge live ETF results with static non-fetchable items (VIX, DXY, Gold, Oil)
    const staticItems = MARKET_INDICES_FALLBACK.filter(i => !TAPE_ETF_SYMBOLS.includes(i.symbol));
    return [...results, ...staticItems];
  } catch (err) {
    console.warn('Live tape fetch failed, using static data:', err.message);
    return null;
  }
}

function renderTickerTape(indices) {
  const tape = document.getElementById('ticker-tape');
  if (!tape) return;

  // Build items HTML — duplicate for seamless loop
  const buildItems = () => indices.map(idx => {
    const up = idx.change >= 0;
    const sign = up ? '+' : '';
    const arrow = up ? '\u25B2' : '\u25BC';
    const liveIndicator = idx.live ? ' <span class="tape-live-dot">&#9679;</span>' : '';
    return `<div class="ticker-tape-item">
      <span class="tape-label">${idx.label}</span>
      <span class="tape-price">${idx.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
      <span class="tape-change ${up ? 'up' : 'down'}"><span class="tape-arrow">${arrow}</span> ${sign}${idx.pct.toFixed(2)}%</span>${liveIndicator}
    </div>`;
  }).join('');

  tape.innerHTML = buildItems() + buildItems();
}

async function refreshTape() {
  const live = await fetchLiveTapeData();
  _liveTapeIndices = live || MARKET_INDICES_FALLBACK;
  renderTickerTape(_liveTapeIndices);
}

refreshTape();
// Refresh ticker tape data every 60 seconds (align with main data refresh)
setInterval(refreshTape, 60_000);
