import { describe, it, expect } from 'vitest';
import {
  buyAsset,
  sellAsset,
  initializePlayer,
  updatePlayerWealth,
} from '../tradingEngine';
import { AssetType } from '../types';

const testPrices = {
  [AssetType.TULIP_SEMPER]: 500,
  [AssetType.TULIP_GOUDA]: 50,
  [AssetType.TULIP_VICEROY]: 200,
  [AssetType.TULIP_BLACK]: 300,
  [AssetType.ESTATE]: 500,
  [AssetType.VOYAGE]: 100,
};

describe('tradingEngine', () => {
  describe('initializePlayer', () => {
    it('should initialize player with correct initial state', () => {
      const player = initializePlayer(500, testPrices);

      expect(player.cash).toBe(500);
      expect(player.portfolio[AssetType.TULIP_GOUDA]).toBe(5);
      expect(player.portfolio[AssetType.TULIP_VICEROY]).toBe(2);
      expect(player.totalWealth).toBe(1150); // 500 + 5*50 + 2*200
      expect(player.tradeHistory).toEqual([]);
    });
  });

  describe('buyAsset', () => {
    it('should reduce cash and increase holdings', () => {
      const player = initializePlayer(500, testPrices);
      const result = buyAsset(AssetType.TULIP_GOUDA, 1, testPrices, player);

      expect(result.success).toBe(true);
      expect(result.newPlayerState.cash).toBe(449); // 500 - 50 - 1 fee
      expect(result.newPlayerState.portfolio[AssetType.TULIP_GOUDA]).toBe(6); // 5 + 1
    });

    it('should reject purchase when insufficient funds', () => {
      const player = initializePlayer(500, testPrices);
      const result = buyAsset(AssetType.TULIP_SEMPER, 2, testPrices, player); // 2*500=1000 > 500

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject zero or negative quantity', () => {
      const player = initializePlayer(500, testPrices);
      const result0 = buyAsset(AssetType.TULIP_GOUDA, 0, testPrices, player);
      const resultNeg = buyAsset(AssetType.TULIP_GOUDA, -1, testPrices, player);

      expect(result0.success).toBe(false);
      expect(resultNeg.success).toBe(false);
    });

    it('should accumulate portfolio holdings', () => {
      let player = initializePlayer(10000, testPrices);
      player = buyAsset(AssetType.TULIP_SEMPER, 2, testPrices, player).newPlayerState;
      player = buyAsset(AssetType.TULIP_SEMPER, 3, testPrices, player).newPlayerState;

      expect(player.portfolio[AssetType.TULIP_SEMPER]).toBe(5); // 0 + 2 + 3
    });

    it('should record trade in history', () => {
      const player = initializePlayer(500, testPrices);
      const result = buyAsset(AssetType.TULIP_GOUDA, 1, testPrices, player);

      expect(result.success).toBe(true);
      expect(result.newPlayerState.tradeHistory.length).toBe(1);
      expect(result.newPlayerState.tradeHistory[0].action).toBe('buy');
      expect(result.newPlayerState.tradeHistory[0].assetType).toBe(AssetType.TULIP_GOUDA);
    });
  });

  describe('sellAsset', () => {
    it('should increase cash and decrease holdings', () => {
      const player = initializePlayer(500, testPrices);
      const result = sellAsset(AssetType.TULIP_GOUDA, 1, testPrices, player);

      expect(result.success).toBe(true);
      expect(result.newPlayerState.cash).toBe(549); // 500 + 50 - 1 fee
      expect(result.newPlayerState.portfolio[AssetType.TULIP_GOUDA]).toBe(4); // 5 - 1
    });

    it('should reject selling more than holdings', () => {
      const player = initializePlayer(500, testPrices);
      const result = sellAsset(AssetType.TULIP_SEMPER, 1, testPrices, player); // 0 holdings

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reduce portfolio holdings', () => {
      let player = initializePlayer(500, testPrices);
      player = sellAsset(AssetType.TULIP_VICEROY, 1, testPrices, player).newPlayerState;

      expect(player.portfolio[AssetType.TULIP_VICEROY]).toBe(1); // 2 - 1
    });
  });

  describe('updatePlayerWealth', () => {
    it('should calculate total wealth correctly', () => {
      const player = initializePlayer(500, testPrices);
      // Cash(500) + Gouda(5*50=250) + Viceroy(2*200=400) + others(0) = 1150
      const updated = updatePlayerWealth(player, testPrices);
      const expectedTotal = 500 + 5 * 50 + 2 * 200;

      expect(updated.totalWealth).toBe(expectedTotal);
    });

    it('should handle zero holdings gracefully', () => {
      const player = {
        cash: 200,
        portfolio: {
          [AssetType.TULIP_SEMPER]: 0,
          [AssetType.TULIP_GOUDA]: 0,
          [AssetType.TULIP_VICEROY]: 0,
          [AssetType.TULIP_BLACK]: 0,
          [AssetType.ESTATE]: 0,
          [AssetType.VOYAGE]: 0,
        } as Record<AssetType, number>,
        totalWealth: 200,
        tradeHistory: [],
      };

      const updated = updatePlayerWealth(player, testPrices);

      expect(updated.totalWealth).toBe(200);
    });
  });
});
