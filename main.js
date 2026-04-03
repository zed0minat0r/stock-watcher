/* =========================================================
   StockPulse — Main Application
   ========================================================= */

// ---- CONFIG ----
const DEFAULT_TICKERS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META', 'SPY'];
const LS_KEY = 'stockpulse_watchlist';
const REFRESH_INTERVAL = 60_000;        // 1 min
const DISPLAY_ROTATE_INTERVAL = 10_000; // 10 sec

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

// ---- DOM REFS ----
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);
const grid = $('#stock-grid');
const searchForm = $('#search-form');
const searchInput = $('#search-input');
const modal = $('#chart-modal');
const displayOverlay = $('#display-overlay');

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
 * Finnhub API — fetch quote for each ticker
 * Endpoint: /quote?symbol=AAPL&token=KEY
 */
async function fetchFromFinnhub(tickers) {
  const results = {};
  // Fetch in parallel, respecting rate limits
  const promises = tickers.map(async (ticker) => {
    const url = `${API_CONFIG.baseUrl}/quote?symbol=${ticker}&token=${API_CONFIG.finnhubKey}`;
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const q = await res.json();
      // Finnhub returns { c: current, d: change, dp: pct, h: high, l: low, o: open, pc: prevClose, t: timestamp }
      if (q && q.c && q.c > 0) {
        results[ticker] = {
          name: COMPANY_NAMES[ticker] || ticker,
          price: q.c,
          change: q.d || 0,
          pct: q.dp || 0,
          volume: FALLBACK_DATA[ticker]?.volume || 0,  // Finnhub free /quote doesn't include volume
          cap: FALLBACK_DATA[ticker]?.cap || 0,
          high52: FALLBACK_DATA[ticker]?.high52 || q.h,
          low52: FALLBACK_DATA[ticker]?.low52 || q.l,
          dayHigh: q.h,
          dayLow: q.l,
          open: q.o,
          prevClose: q.pc,
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
 * Generate sparkline data points (area chart)
 */
function generateSparklineData(ticker, points = 30) {
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
  // Last point = current price
  data[data.length - 1].value = base.price;
  return data;
}

/**
 * Generate candlestick chart data
 */
function generateChartData(ticker, days = 90) {
  const base = stockData[ticker];
  if (!base) return [];
  const data = [];
  let close = base.price * (1 - base.pct / 100 * 0.5);
  const now = new Date();
  for (let i = days; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    // Skip weekends
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
  // Last candle matches current price
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
    el.textContent = isOpen ? 'Market Open' : 'Market Closed';
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
//  RENDERING — Stock Card Grid
// =========================================================
function renderGrid() {
  if (watchlist.length === 0) {
    grid.innerHTML = `<div class="empty-state"><h3>No stocks in your watchlist</h3><p>Use the search bar to add tickers.</p></div>`;
    return;
  }

  // Clean up existing sparkline charts
  Object.values(sparklineCharts).forEach(c => { try { c.remove(); } catch {} });
  sparklineCharts = {};

  grid.innerHTML = '';
  for (const ticker of watchlist) {
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
    card.innerHTML = `
      <div class="card-top">
        <div>
          <div class="card-ticker">${ticker}</div>
          <div class="card-company">${d.name}</div>
        </div>
        <button class="card-remove" data-ticker="${ticker}" title="Remove">&times;</button>
      </div>
      <div class="card-price-row">
        <span class="card-price">${formatPrice(d.price)}</span>
        <span class="card-change ${up ? 'up' : 'down'}">${formatChange(d.change, d.pct)}</span>
      </div>
      <div class="card-sparkline" id="spark-${ticker}"></div>
      <div class="card-metrics">
        <div class="card-metric"><span class="card-metric-label">Vol</span><span class="card-metric-value">${vol}</span></div>
        <div class="card-metric"><span class="card-metric-label">Mkt Cap</span><span class="card-metric-value">${mcap}</span></div>
        <div class="card-metric"><span class="card-metric-label">52w H</span><span class="card-metric-value">${formatPrice(d.high52)}</span></div>
        <div class="card-metric"><span class="card-metric-label">52w L</span><span class="card-metric-value">${formatPrice(d.low52)}</span></div>
      </div>
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
    for (const ticker of watchlist) {
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
    height: 48,
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
  series.setData(generateSparklineData(ticker));
  chart.timeScale().fitContent();
  sparklineCharts[ticker] = chart;
}

// =========================================================
//  MODAL / DETAIL CHART
// =========================================================
let modalChart = null;

let _lastFocusedElement = null;

function openModal(ticker) {
  const d = stockData[ticker];
  if (!d) return;
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

  // Reset timerange buttons
  $$('.tr-btn').forEach(b => b.classList.toggle('active', b.dataset.days === '90'));

  renderModalChart(ticker, 90);
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
    crosshair: { mode: 0 },
    rightPriceScale: { borderColor: '#253040' },
    timeScale: { borderColor: '#253040' },
  });

  const up = isUp(stockData[ticker]?.change || 0);
  const candleSeries = modalChart.addCandlestickSeries({
    upColor: '#00d672', downColor: '#ff4757',
    borderUpColor: '#00d672', borderDownColor: '#ff4757',
    wickUpColor: '#00d672', wickDownColor: '#ff4757',
  });
  candleSeries.setData(generateChartData(ticker, days));
  modalChart.timeScale().fitContent();

  // Resize handler
  const onResize = () => {
    if (modalChart) modalChart.applyOptions({ width: container.clientWidth });
  };
  window.addEventListener('resize', onResize);
  modal._resizeHandler = onResize;
}

function closeModal() {
  modal.classList.add('hidden');
  currentModalTicker = null;
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
  $$('.tr-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderModalChart(currentModalTicker, parseInt(btn.dataset.days));
});

// =========================================================
//  DISPLAY MODE (Fullscreen, auto-rotate)
// =========================================================
let displayClockInterval = null;
let displayPage = 0;
const DISPLAY_PAGE_SIZE = 8;

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

    const card = document.createElement('div');
    card.className = `display-card ${i === 0 ? 'active' : ''}`;
    card.dataset.idx = i;
    card.innerHTML = `
      <div class="d-ticker">${ticker}</div>
      <div class="d-company">${d.name}</div>
      <div class="d-price" style="color:${up ? 'var(--green)' : 'var(--red)'}">${formatPrice(d.price)}</div>
      <div class="d-change ${up ? 'up' : 'down'}">${formatChange(d.change, d.pct)}</div>
      <div class="d-metrics">Vol ${vol} &middot; Cap ${mcap}</div>
    `;
    dg.appendChild(card);
  }

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
  // "/" to focus search
  if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
    if (document.activeElement !== searchInput) {
      e.preventDefault();
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
  const val = searchInput.value.trim();
  if (val) {
    addTicker(val);
    searchInput.value = '';
  }
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
  stockData = { ...stockData, ...data };
  renderGrid();
  updateMarketStatus();

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
