Fix all bugs found in the previous code review. Read CLAUDE.md first, then fix these issues IN ORDER of severity:

## CRITICAL

1. Day 5 crash never triggers: The game goes to ending on Day 4. Fix the day advancement logic so Day 5 plays out with the crash, THEN goes to ending. In dayEngine.ts or wherever day advancement happens, make sure:
   - Day 1-4: normal trading with price increases
   - Day 5: prices crash (priceEngine already has the logic), player can still trade/sell during Day 5
   - After Day 5 trading is done, then advance to ending
   - Do NOT force portfolio value to zero in EndingScene. Let the real prices determine the outcome

## HIGH

2. Trading engine missing validation (tradingEngine.ts):
   - Reject quantity less than or equal to 0 (throw error with message about invalid quantity)
   - Reject non-integer quantities
   - For buy: check cash greater than or equal to totalPrice BEFORE executing
   - For sell: check holdings greater than or equal to quantity BEFORE executing
   - Return proper error messages in TradeResult

3. executeTrade in gameState.ts corrupts trade history days:
   - Do NOT remap all trade history days on every trade
   - The day should be set when the trade record is CREATED, not retroactively changed
   - Remove the .map() that overwrites tradeHistory days

4. NPC dialogue routing bug: When clicking an NPC in NPCList, the wrong NPC dialogue appears. Fix the NPC selection logic so clicking Cornelis shows Cornelis dialogue, etc.

5. Dialogue trade choices do not execute: When a dialogue choice has action trade, it should properly trigger the trade or open the trade panel pre-selected to that asset.

## MEDIUM

6. Fix initial totalWealth: Should be cash(500) + portfolio value (5*50 + 2*200 = 650) = 1150, not 500. Fix in tradingEngine.ts initializePlayer.

7. Fix PriceBoard fake change percentages: Instead of fabricating previousPrice as current times 0.9, use the actual priceHistory from the store to show real changes. If no history exists for Day 1, show dash dash or 0 percent.

8. Fix Black Tulip probability in priceEngine.ts: The else-if branch calls random() again, making odds 30/35/35 instead of 30/20/50. Fix by using a single random() call and checking ranges.

9. Fix all 8 failing unit tests: Update expected values to match new base prices (500/50/200/300/500/100), starting cash (500), and initial holdings (5 Gouda, 2 Viceroy).

10. Fix ESLint errors:
    - InventoryPanel.tsx: Replace useEffect+setState with useMemo for flashMap
    - TavernScene.tsx: Move day-change reset logic to the advanceDay action in gameState instead of useEffect
    - TradePanel.tsx: Add tulipAssets to useMemo dependency

## LOW

11. Clean up: Remove old NPC dialogue files (jan.json, willem.json, maria.json, pieter.json, lucas.json) from 00-data/dialogues/ since they are superseded by cornelis.json etc.

After ALL fixes, run these commands from 03-src/frontend/:
- npx tsc --noEmit
- npm run build  
- npm test
- npm run lint
All must pass. Fix any remaining issues until they do.

Commit all changes with message: fix: Codex review - critical bugs, validation, tests
