import { describe, it, expect } from 'vitest';
import {
  advanceDay,
  initializeGameState,
  resetGameState,
  canAdvanceDay,
  getRemainingDays,
  GamePhase,
} from '../dayEngine';

describe('dayEngine', () => {
  describe('initializeGameState', () => {
    it('should initialize game with correct default values', () => {
      const state = initializeGameState(5);

      expect(state.currentDay).toBe(1);
      expect(state.maxDays).toBe(5);
      expect(state.gamePhase).toBe('intro');
      expect(state.player.cash).toBe(10000);
      expect(state.player.totalWealth).toBe(10000);
      expect(state.player.tradeHistory).toEqual([]);
      expect(state.prices).toBeDefined();
      expect(state.dialogue).toBeNull();
      expect(state.currentNPC).toBeNull();
      expect(state.ending).toBeNull();
    });

    it('should initialize with custom max days', () => {
      const state = initializeGameState(10);

      expect(state.maxDays).toBe(10);
    });
  });

  describe('advanceDay', () => {
    it('should advance from Day 1 to Day 2', () => {
      const initialState = initializeGameState(5);
      const newState = advanceDay(initialState);

      expect(newState.currentDay).toBe(2);
      expect(newState.player.totalWealth).toBeDefined();
      expect(newState.priceHistory).toBeDefined();
    });

    it('should update prices on day advance', () => {
      const initialState = initializeGameState(5);
      const initialPrices = { ...initialState.prices };
      const newState = advanceDay(initialState);

      expect(newState.prices).toBeDefined();
      // 价格应该有变化（除非Day 5暴跌后）
      if (initialState.currentDay < 5) {
        Object.keys(newState.prices).forEach(key => {
          const changed = newState.prices[key] !== initialPrices[key];
          expect(changed).toBe(true);
        });
      }
    });

    it('should set game phase to ending on last day', () => {
      let state = initializeGameState(5);
      state.currentDay = 4;
      state.gamePhase = 'trading';

      const newState = advanceDay(state);

      expect(newState.currentDay).toBe(5);
      expect(newState.gamePhase).toBe('ending');
    });

    it('should record price history', () => {
      const initialState = initializeGameState(5);
      const newState = advanceDay(initialState);

      Object.keys(newState.prices).forEach(key => {
        const history = newState.priceHistory[key];
        expect(history).toBeDefined();
        expect(history!.length).toBeGreaterThan(0);
      });
    });

    it('should update player wealth based on new prices', () => {
      const initialState = initializeGameState(5);
      const oldWealth = initialState.player.totalWealth;
      const newState = advanceDay(initialState);

      expect(newState.player.totalWealth).toBeDefined();
      // 如果有持仓，财富应该随价格变化
      if (Object.keys(newState.player.portfolio).length > 0) {
        expect(newState.player.totalWealth).not.toBe(oldWealth);
      }
    });

    it('should not advance beyond max days', () => {
      const initialState = initializeGameState(5);
      initialState.currentDay = 5;

      const newState = advanceDay(initialState);

      expect(newState.currentDay).toBe(5);
      expect(newState.gamePhase).toBe('ending');
    });
  });

  describe('resetGameState', () => {
    it('should reset to initial state', () => {
      const initialState = initializeGameState(5);
      initialState.currentDay = 3;
      initialState.player.cash = 5000;
      initialState.player.portfolio = { TULIP_SEMPER: 2 };

      const resetState = resetGameState(initialState);

      expect(resetState.currentDay).toBe(1);
      expect(resetState.player.cash).toBe(10000);
      expect(resetState.player.portfolio).toEqual({});
      expect(resetState.player.tradeHistory).toEqual([]);
      expect(resetState.gamePhase).toBe('intro');
    });
  });

  describe('canAdvanceDay', () => {
    it('should return true when can advance', () => {
      const state = initializeGameState(5);
      state.currentDay = 2;
      state.gamePhase = 'trading';

      expect(canAdvanceDay(state)).toBe(true);
    });

    it('should return false when at max days', () => {
      const state = initializeGameState(5);
      state.currentDay = 5;

      expect(canAdvanceDay(state)).toBe(false);
    });

    it('should return false when not in trading phase', () => {
      const state = initializeGameState(5);
      state.currentDay = 2;
      state.gamePhase = 'intro';

      expect(canAdvanceDay(state)).toBe(false);
    });

    it('should return false when in ending phase', () => {
      const state = initializeGameState(5);
      state.currentDay = 2;
      state.gamePhase = 'ending';

      expect(canAdvanceDay(state)).toBe(false);
    });
  });

  describe('getRemainingDays', () => {
    it('should calculate remaining days correctly', () => {
      const state = initializeGameState(5);
      state.currentDay = 1;

      expect(getRemainingDays(state)).toBe(4);

      state.currentDay = 3;
      expect(getRemainingDays(state)).toBe(2);

      state.currentDay = 5;
      expect(getRemainingDays(state)).toBe(0);
    });
  });
});
