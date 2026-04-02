# Agent Rules

## CRITICAL — START WITH A TOOL CALL
- Your VERY FIRST action must be a tool call (e.g., Bash: git pull). Do NOT generate ANY text before your first tool call. No preamble. No planning. Just call a tool immediately.

## Shared Rules
- This is a STOCK MARKET WATCHER web app — modular dashboard with charts and display mode.
- MOBILE FIRST but also designed for full-screen monitor display mode.
- CENTER ALIGNMENT: All content must be consistently center-aligned on mobile.
- If unsure about a decision, text user via iMessage (chat_id 'any;-;+14847162152') AND add to QUESTIONS.md. Don't block.
- Only read the LAST 10 lines of CHANGELOG.md, not the whole file.
- Use targeted grep/read instead of reading entire files when possible.
- ALWAYS text user via iMessage after completing work.
- ALWAYS include the live site link: https://zed0minat0r.github.io/stock-watcher/
- Keep animations MINIMAL and tasteful — simplicity matters.
- DO NOT add content that requires a backend pipeline — use free APIs for live data.

## App Features
- Select specific stocks to watch (search + add)
- Real-time price data via free APIs (Yahoo Finance, Alpha Vantage, or similar)
- Charts (line/candlestick) for price history
- Display mode: full-screen monitor view with auto-rotating stats
- Dashboard: customizable grid of stock cards with key metrics
- Color-coded: green for up, red for down
