# UI Design Summary

## Principles
- Consistent two-line player cards: first line = player name; second line = info (status, bid, or score), left-aligned across all flows.
- Compact vertical rhythm: reduced spacing below main title, round header, and flow breadcrumb.
- Clear visual hierarchy: round header (.round-info) above flow breadcrumb, then content.
- Mobile-first, responsive controls with fixed bottom bars where needed, while reserving body padding to avoid overlap.

## Global Components
- Main title: small header bar with rules button on the right.
- Round info (.round-info): compact padded panel; shows current round, cards per player, and trump suit.
- Flow breadcrumb (.game-flow): indicates current step, compact margin.

## Player Cards
- Shared base styles (.player-bidding-card, .player-result, .player-score): rounded corners, light border, internal padding, left-aligned text.
- Bidding:
  - Status text only:  請叫牌 / 已叫牌 / 等待叫牌中.
  - Bottom keypad appears fixed; body adds padding to prevent overlap.
  - Total bids indicator placed above keypad row; confirm button label is 確定 until all bids done.
- Results:
  - Left: name + second line 已叫牌: X 墩.
  - Right: actual tricks with vertical / triangle controls to minimize height.
  - Actual tricks number turns red when it differs from the bid; black when equal.
  - Default actual tricks initialized to the players bid on entering Results.
- Current Scores:
  - Left: name + second line 上局X + 今局Y.
  - Right: total score, large and bold.
  - Removed big container white background; retain individual card white/gray surface and border only.

## Fixed Bottom Bars
- Bidding keypad: two-row wrapper (top total indicator; bottom numeric keys + confirm). Uses with-bottom-gap body class to reserve space (padding-bottom: 140px).
- Results action bar: fixed bottom with 計算分數 centered.
- Scores action bar: fixed bottom with three buttons in one row (danger/secondary/primary), responsive with equal flex.

## Spacing Adjustments
- Reduced padding/margins:
  - .bidding-phase top padding  10px.
  - .round-info padding  12px, margin-bottom  12px.
  - .game-flow margin-bottom  12px.

## Accessibility & Feedback
- Disabled states for triangle controls when limits reached (0 or currentTricks).
- Button hover styles; disabled opacity reduced.

## Files Touched
- index.html: CSS updates (spacing, colors, fixed bars), structure (keypad wrapper), score container background adjustments.
- js/game.js: logic for totals, keypad display/reserved space, results default values, color mismatch class, triangle controls, and label updates.
