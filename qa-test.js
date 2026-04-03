const { chromium } = require('playwright');
const path = require('path');

const SCREENSHOT_DIR = '/tmp/stock-watcher/qa-screenshots';
const URL = 'file:///tmp/stock-watcher/index.html';
const VIEWPORT = { width: 375, height: 812 }; // iPhone X mobile

const results = [];

function log(test, status, detail = '') {
  results.push({ test, status, detail });
  console.log(`[${status}] ${test}${detail ? ' — ' + detail : ''}`);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  // Navigate
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(3000); // let JS render

  // ── 1. Full-page screenshot ──
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-full-page-mobile.png'), fullPage: true });
  console.log('Screenshot: 01-full-page-mobile.png');

  // ── 2. Stock cards rendering ──
  try {
    const cards = await page.$$('.stock-card, [class*="card"], [class*="stock"]');
    if (cards.length > 0) {
      log('Stock cards rendering', 'PASS', `${cards.length} card(s) found`);
    } else {
      // Try broader selectors
      const anyCards = await page.$$('div[class]');
      const cardTexts = [];
      for (const c of anyCards.slice(0, 50)) {
        const cls = await c.getAttribute('class');
        if (cls && (cls.includes('card') || cls.includes('stock') || cls.includes('ticker'))) {
          cardTexts.push(cls);
        }
      }
      if (cardTexts.length > 0) {
        log('Stock cards rendering', 'PASS', `Found elements: ${cardTexts.join(', ')}`);
      } else {
        log('Stock cards rendering', 'WARN', 'No obvious card elements found — may need API data');
      }
    }
  } catch (e) {
    log('Stock cards rendering', 'FAIL', e.message);
  }

  // ── 3. Search bar + autocomplete ──
  try {
    const searchInput = await page.$('input[type="search"], input[type="text"], input[placeholder*="search" i], input[placeholder*="stock" i], input[placeholder*="ticker" i], #search, .search-input, [class*="search"] input');
    if (searchInput) {
      log('Search bar present', 'PASS');
      await searchInput.click();
      await searchInput.fill('AAPL');
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-search-autocomplete.png'), fullPage: false });
      console.log('Screenshot: 02-search-autocomplete.png');

      const autocomplete = await page.$$('[class*="autocomplete"], [class*="suggest"], [class*="dropdown"], [class*="result"], [role="listbox"], [role="option"], ul li');
      if (autocomplete.length > 0) {
        log('Search autocomplete', 'PASS', `${autocomplete.length} suggestion element(s)`);
        // Click first suggestion to add a card
        await autocomplete[0].click().catch(() => {});
        await page.waitForTimeout(1000);
      } else {
        log('Search autocomplete', 'WARN', 'No autocomplete dropdown visible — may need API or specific trigger');
      }
    } else {
      log('Search bar present', 'FAIL', 'No search input found');
    }
  } catch (e) {
    log('Search bar', 'FAIL', e.message);
  }

  // ── 4. Remove button on cards ──
  try {
    const removeBtns = await page.$$('[class*="remove"], [class*="delete"], [class*="close"], button[aria-label*="remove" i], .stock-card button, [class*="card"] button');
    if (removeBtns.length > 0) {
      log('Remove button on cards', 'PASS', `${removeBtns.length} remove button(s) found`);
    } else {
      log('Remove button on cards', 'WARN', 'No remove buttons visible — cards may need to be added first');
    }
  } catch (e) {
    log('Remove button', 'FAIL', e.message);
  }

  // Re-screenshot after search interaction
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03-after-search.png'), fullPage: true });

  // ── 5. Chart modal (click a card) ──
  try {
    const clickableCard = await page.$('.stock-card, [class*="card"][class*="stock"], [class*="ticker"]');
    if (clickableCard) {
      await clickableCard.click();
      await page.waitForTimeout(1500);
      const modal = await page.$('[class*="modal"], [class*="chart"], [class*="overlay"], [role="dialog"], dialog');
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04-chart-modal.png'), fullPage: false });
      console.log('Screenshot: 04-chart-modal.png');
      if (modal) {
        const isVisible = await modal.isVisible();
        log('Chart modal', isVisible ? 'PASS' : 'FAIL', isVisible ? 'Modal appeared on card click' : 'Modal element found but not visible');
      } else {
        log('Chart modal', 'WARN', 'No modal/chart overlay appeared on card click');
      }
      // Close modal if open
      const closeBtn = await page.$('[class*="modal"] [class*="close"], [class*="modal"] button, dialog button, [class*="overlay"] [class*="close"]');
      if (closeBtn) await closeBtn.click().catch(() => {});
      await page.waitForTimeout(500);
    } else {
      log('Chart modal', 'WARN', 'No card to click — need stock data loaded');
    }
  } catch (e) {
    log('Chart modal', 'FAIL', e.message);
  }

  // ── 6. Display mode button ──
  try {
    const displayBtn = await page.$('[class*="display"], [class*="fullscreen"], [class*="mode"], button:has-text("display"), button:has-text("mode"), button:has-text("fullscreen"), [class*="toggle"]');
    if (displayBtn) {
      log('Display mode button', 'PASS');
      await displayBtn.click().catch(() => {});
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05-display-mode.png'), fullPage: false });
      console.log('Screenshot: 05-display-mode.png');
      // Exit display mode
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    } else {
      // Check all buttons
      const allBtns = await page.$$('button');
      const btnTexts = [];
      for (const b of allBtns) {
        const t = await b.textContent();
        btnTexts.push(t.trim());
      }
      log('Display mode button', 'WARN', `No display mode button found. Buttons: [${btnTexts.join(', ')}]`);
    }
  } catch (e) {
    log('Display mode button', 'FAIL', e.message);
  }

  // ── 7. Keyboard shortcuts ──
  try {
    // Common shortcuts: Escape, /, Ctrl+F, etc.
    await page.keyboard.press('/');
    await page.waitForTimeout(500);
    const focused = await page.evaluate(() => document.activeElement?.tagName + '.' + (document.activeElement?.className || ''));
    const searchFocused = focused.toLowerCase().includes('input');
    log('Keyboard shortcut "/" focuses search', searchFocused ? 'PASS' : 'WARN', `Focused element: ${focused}`);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  } catch (e) {
    log('Keyboard shortcuts', 'FAIL', e.message);
  }

  // ── 8. Back-to-top ──
  try {
    // Scroll down first
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(800);
    const backToTop = await page.$('[class*="back-to-top"], [class*="scroll-top"], [class*="backtotop"], button[aria-label*="top" i], a[href="#top"], [class*="to-top"]');
    if (backToTop) {
      const isVis = await backToTop.isVisible();
      log('Back-to-top button', isVis ? 'PASS' : 'WARN', isVis ? 'Visible after scrolling' : 'Found but not visible');
      if (isVis) {
        await backToTop.click();
        await page.waitForTimeout(500);
      }
    } else {
      log('Back-to-top button', 'WARN', 'No back-to-top element found');
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
  } catch (e) {
    log('Back-to-top', 'FAIL', e.message);
  }

  // ── VISUAL / LAYOUT CHECKS ──

  // ── 9. Horizontal overflow ──
  try {
    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    log('No horizontal overflow', hasOverflow ? 'FAIL' : 'PASS', hasOverflow ? `scrollWidth(${await page.evaluate(() => document.documentElement.scrollWidth)}) > clientWidth(${await page.evaluate(() => document.documentElement.clientWidth)})` : 'Content fits within viewport');
  } catch (e) {
    log('Horizontal overflow check', 'FAIL', e.message);
  }

  // ── 10. Text clipping ──
  try {
    const clippedElements = await page.evaluate(() => {
      const els = document.querySelectorAll('*');
      const clipped = [];
      for (const el of els) {
        const style = getComputedStyle(el);
        if (style.overflow === 'hidden' && el.scrollWidth > el.clientWidth + 2) {
          clipped.push({ tag: el.tagName, class: el.className, text: el.textContent?.slice(0, 30) });
        }
      }
      return clipped;
    });
    if (clippedElements.length === 0) {
      log('No text clipping', 'PASS');
    } else {
      log('Text clipping detected', 'WARN', `${clippedElements.length} element(s): ${JSON.stringify(clippedElements.slice(0, 3))}`);
    }
  } catch (e) {
    log('Text clipping check', 'FAIL', e.message);
  }

  // ── 11. Center alignment ──
  try {
    const alignmentIssues = await page.evaluate(() => {
      const container = document.querySelector('main, .container, .app, #app, body > div');
      if (!container) return 'No main container found';
      const rect = container.getBoundingClientRect();
      const viewportW = window.innerWidth;
      const leftMargin = rect.left;
      const rightMargin = viewportW - rect.right;
      const diff = Math.abs(leftMargin - rightMargin);
      return { leftMargin: Math.round(leftMargin), rightMargin: Math.round(rightMargin), diff: Math.round(diff), centered: diff < 10 };
    });
    if (typeof alignmentIssues === 'string') {
      log('Center alignment', 'WARN', alignmentIssues);
    } else {
      log('Center alignment', alignmentIssues.centered ? 'PASS' : 'WARN',
        `Left: ${alignmentIssues.leftMargin}px, Right: ${alignmentIssues.rightMargin}px, Diff: ${alignmentIssues.diff}px`);
    }
  } catch (e) {
    log('Center alignment', 'FAIL', e.message);
  }

  // ── 12. Tap targets (44px minimum) ──
  try {
    const smallTargets = await page.evaluate(() => {
      const interactives = document.querySelectorAll('button, a, input, select, [role="button"], [onclick]');
      const small = [];
      for (const el of interactives) {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 44)) {
          small.push({
            tag: el.tagName,
            class: el.className?.toString().slice(0, 30),
            text: el.textContent?.slice(0, 20),
            w: Math.round(rect.width),
            h: Math.round(rect.height)
          });
        }
      }
      return small;
    });
    if (smallTargets.length === 0) {
      log('Tap targets >= 44px', 'PASS');
    } else {
      log('Tap targets < 44px', 'FAIL', `${smallTargets.length} element(s) too small: ${JSON.stringify(smallTargets.slice(0, 5))}`);
    }
  } catch (e) {
    log('Tap targets check', 'FAIL', e.message);
  }

  // ── 13. Contrast check (basic) ──
  try {
    const contrastIssues = await page.evaluate(() => {
      function luminance(r, g, b) {
        const [rs, gs, bs] = [r, g, b].map(c => {
          c = c / 255;
          return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
      }
      function parseColor(color) {
        const m = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (m) return [parseInt(m[1]), parseInt(m[2]), parseInt(m[3])];
        return null;
      }
      function contrastRatio(l1, l2) {
        const lighter = Math.max(l1, l2);
        const darker = Math.min(l1, l2);
        return (lighter + 0.05) / (darker + 0.05);
      }
      const textEls = document.querySelectorAll('p, span, h1, h2, h3, h4, h5, h6, a, button, label, li, td, th');
      const issues = [];
      for (const el of textEls) {
        const style = getComputedStyle(el);
        const fg = parseColor(style.color);
        const bg = parseColor(style.backgroundColor);
        if (fg && bg) {
          const fgL = luminance(...fg);
          const bgL = luminance(...bg);
          const ratio = contrastRatio(fgL, bgL);
          if (ratio < 4.5) {
            issues.push({ text: el.textContent?.slice(0, 25), ratio: ratio.toFixed(2), fg: style.color, bg: style.backgroundColor });
          }
        }
      }
      return issues;
    });
    if (contrastIssues.length === 0) {
      log('Contrast ratio >= 4.5:1', 'PASS');
    } else {
      log('Contrast issues', 'WARN', `${contrastIssues.length} element(s) below 4.5:1: ${JSON.stringify(contrastIssues.slice(0, 3))}`);
    }
  } catch (e) {
    log('Contrast check', 'FAIL', e.message);
  }

  // Final full-page screenshot
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06-final-state.png'), fullPage: true });
  console.log('Screenshot: 06-final-state.png');

  await browser.close();

  // ── SUMMARY ──
  console.log('\n══════════════════════════════════════');
  console.log('       QA REPORT — StockPulse        ');
  console.log('       Mobile 375px viewport          ');
  console.log('══════════════════════════════════════\n');
  for (const r of results) {
    const icon = r.status === 'PASS' ? 'PASS' : r.status === 'FAIL' ? 'FAIL' : 'WARN';
    console.log(`  [${icon}] ${r.test}`);
    if (r.detail) console.log(`         ${r.detail}`);
  }
  const passCount = results.filter(r => r.status === 'PASS').length;
  const failCount = results.filter(r => r.status === 'FAIL').length;
  const warnCount = results.filter(r => r.status === 'WARN').length;
  console.log(`\nTotals: ${passCount} PASS, ${failCount} FAIL, ${warnCount} WARN`);
})();
