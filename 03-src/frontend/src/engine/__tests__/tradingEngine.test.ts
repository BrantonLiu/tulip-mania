import { describe, it, expect } from 'vitest';
import {
  buyAsset,
  sellAsset,
  updatePlayerWealth,
  initializePlayer,
} from '../tradingEngine';
import { AssetType } from '../types';

describe('tradingEngine', () => {
  const testPrices = {
    [AssetType.TULIP_SEMPER]: 1000,
    [AssetType.TULIP_GOUDA]: 500,
    [AssetType.TULIP_VICEROY]: 300,
    [AssetType.TULIP_BLACK]: 800,
    [AssetType.ESTATE]: 2000,
    [AssetType.VOYAGE]: 1500,
  };

  describe('initializePlayer', () => {
    it('should initialize player with correct initial state', () => {
      const player = initializePlayer(10000);

      expect(player.cash).toBe(10000);
      expect(player.totalWealth).toBe(10000);
      expect(player.portfolio).toEqual({});
      expect(player.tradeHistory).toEqual([]);
    });
  });

  describe('buyAsset', () => {
    it('should buy asset successfully', () => {
      const player = initializePlayer(10000);
      const result = buyAsset(AssetType.TULIP_SEMPER, 1, testPrices, player);

      expect(result.success).toBe(true);
      expect(result.newPlayerState.cash).toBeLessThan(10000);
      expect(result.newPlayerState.portfolio[AssetType.TULIP_SEMPER]).toBe(1);
      expect(result.newPlayerState.tradeHistory.length).toBe(1);
    });

    it('should fail when insufficient cash', () => {
      const player = initializePlayer(100);
      const result = buyAsset(AssetType.TULIP_SEMPER, 1, testPrices, player);

      expect(result.success).toBe(false);
      expect(result.error).toContain('现金不足');
      expect(result.newPlayerState).toEqual(player);
    });

    it('should apply 1% fee', () => {
      const player = initializePlayer(5000); // 增加初始资金以避免滑点
      const result = buyAsset(AssetType.TULIP_SEMPER, 1, testPrices, player);

      expect(result.success).toBe(true);
      const expectedFee = 1000 * 0.01;
      const spent = player.cash - result.newPlayerState.cash;
      expect(spent).toBeCloseTo(1000 + expectedFee, 0);
    });

    it('should accumulate portfolio holdings', () => {
      const player = initializePlayer(3000);
      const firstBuy = buyAsset(AssetType.TULIP_GOUDA, 1, testPrices, player);

      expect(firstBuy.newPlayerState.portfolio[AssetType.TULIP_GOUDA]).toBe(1);

      const secondBuy = buyAsset(AssetType.TULIP_GOUDA, 2, testPrices, firstBuy.newPlayerState);
      expect(secondBuy.newPlayerState.portfolio[AssetType.TULIP_GOUDA]).toBe(3);
    });
  });

  describe('sellAsset', () => {
    it('should sell asset successfully', () => {
      const player = initializePlayer(10000);
      const buyResult = buyAsset(AssetType.TULIP_SEMPER, 1, testPrices, player);
      const sellResult = sellAsset(AssetType.TULIP_SEMPER, 1, testPrices, buyResult.newPlayerState);

      expect(sellResult.success).toBe(true);
      expect(sellResult.newPlayerState.portfolio[AssetType.TULIP_SEMPER]).toBe(0);
      expect(sellResult.newPlayerState.cash).toBeGreaterThan(buyResult.newPlayerState.cash);
      expect(sellResult.newPlayerState.tradeHistory.length).toBe(2);
    });

    it('should fail when insufficient holdings', () => {
      const player = initializePlayer(10000);
      const result = sellAsset(AssetType.TULIP_SEMPER, 1, testPrices, player);

      expect(result.success).toBe(false);
      expect(result.error).toContain('持仓不足');
      expect(result.newPlayerState).toEqual(player);
    });

    it('should apply 1% fee on sell', () => {
      const player = initializePlayer(5000); // 增加初始资金以避免滑点
      const buyResult = buyAsset(AssetType.TULIP_SEMPER, 1, testPrices, player);
      const sellResult = sellAsset(AssetType.TULIP_SEMPER, 1, testPrices, buyResult.newPlayerState);

      expect(sellResult.success).toBe(true);
      const expectedFee = 1000 * 0.01;
      const received = sellResult.newPlayerState.cash - buyResult.newPlayerState.cash;
      expect(received).toBeCloseTo(1000 - expectedFee, 0);
    });

    it('should reduce portfolio holdings', () => {
      const player = initializePlayer(5000);
      const buyResult = buyAsset(AssetType.TULIP_GOUDA, 5, testPrices, player);
      const sellResult = sellAsset(AssetType.TULIP_GOUDA, 3, testPrices, buyResult.newPlayerState);

      expect(sellResult.success).toBe(true);
      expect(sellResult.newPlayerState.portfolio[AssetType.TULIP_GOUDA]).toBe(2);
    });
  });

  describe('updatePlayerWealth', () => {
    it('should calculate total wealth correctly', () => {
      const player = initializePlayer(10000);
      const buy1 = buyAsset(AssetType.TULIP_SEMPER, 2, testPrices, player);
      const buy2 = buyAsset(AssetType.TULIP_GOUDA, 5, testPrices, buy1.newPlayerState);

      const updated = updatePlayerWealth(buy2.newPlayerState, testPrices);

      const portfolioValue =
        2 * testPrices[AssetType.TULIP_SEMPER] +
        5 * testPrices[AssetType.TULIP_GOUDA];
      const expectedTotal = updated.cash + portfolioValue;

      expect(updated.totalWealth).toBe(expectedTotal);
    });

    it('should handle empty portfolio', () => {
      const player = initializePlayer(10000);
      const updated = updatePlayerWealth(player, testPrices);

      expect(updated.totalWealth).toBe(10000);
    });
  });
});
