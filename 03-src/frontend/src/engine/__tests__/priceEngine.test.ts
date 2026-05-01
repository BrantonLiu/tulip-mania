import { describe, it, expect } from 'vitest';
import {
  calculateNextPrice,
  calculateAllPrices,
  calculateAveragePriceChange,
  initializePrices,
} from '../priceEngine';
import { AssetType } from '../types';

describe('priceEngine', () => {
  describe('initializePrices', () => {
    it('should return correct base prices', () => {
      const prices = initializePrices();

      expect(prices[AssetType.TULIP_SEMPER]).toBe(1000);
      expect(prices[AssetType.TULIP_GOUDA]).toBe(500);
      expect(prices[AssetType.TULIP_VICEROY]).toBe(300);
      expect(prices[AssetType.TULIP_BLACK]).toBe(800);
      expect(prices[AssetType.ESTATE]).toBe(2000);
      expect(prices[AssetType.VOYAGE]).toBe(1500);
    });
  });

  describe('calculateNextPrice', () => {
    it('should increase price on Day 1-4', () => {
      const currentPrice = 1000;

      for (let day = 1; day <= 4; day++) {
        const result = calculateNextPrice(currentPrice, day, AssetType.TULIP_SEMPER);

        expect(result.newPrice).toBeGreaterThan(currentPrice);
        expect(result.changePercent).toBeGreaterThan(0);
      }
    });

    it('should drastically drop price on Day 5', () => {
      const currentPrice = 1000;
      const result = calculateNextPrice(currentPrice, 5, AssetType.TULIP_SEMPER);

      expect(result.newPrice).toBeLessThan(currentPrice);
      expect(result.changePercent).toBeLessThan(-50);
      expect(result.volatility).toBe(0.5);
    });

    it('should handle Black Tulip special logic', () => {
      const currentPrice = 800;
      const result = calculateNextPrice(currentPrice, 2, AssetType.TULIP_BLACK);

      // Black Tulip应该有特殊波动
      expect(result.volatility).toBeDefined();
    });
  });

  describe('calculateAllPrices', () => {
    it('should calculate prices for all assets', () => {
      const currentPrices = initializePrices();
      const results = calculateAllPrices(currentPrices, 1);

      Object.values(AssetType).forEach(assetType => {
        expect(results[assetType]).toBeDefined();
        expect(results[assetType].newPrice).toBeGreaterThan(0);
      });
    });

    it('should drop all prices on Day 5', () => {
      const currentPrices = initializePrices();
      const results = calculateAllPrices(currentPrices, 5);

      Object.values(AssetType).forEach(assetType => {
        expect(results[assetType].newPrice).toBeLessThan(currentPrices[assetType]);
        expect(results[assetType].changePercent).toBeLessThan(0);
      });
    });
  });

  describe('calculateAveragePriceChange', () => {
    it('should calculate average change correctly', () => {
      const results = {
        [AssetType.TULIP_SEMPER]: { newPrice: 1500, changePercent: 50, volatility: 10 },
        [AssetType.TULIP_GOUDA]: { newPrice: 750, changePercent: 50, volatility: 10 },
        [AssetType.TULIP_VICEROY]: { newPrice: 450, changePercent: 50, volatility: 10 },
      };

      const avg = calculateAveragePriceChange(results);

      expect(avg).toBe(50);
    });

    it('should handle mixed positive and negative changes', () => {
      const results = {
        [AssetType.TULIP_SEMPER]: { newPrice: 1500, changePercent: 50, volatility: 10 },
        [AssetType.TULIP_GOUDA]: { newPrice: 500, changePercent: 0, volatility: 10 },
        [AssetType.TULIP_VICEROY]: { newPrice: 150, changePercent: -50, volatility: 10 },
      };

      const avg = calculateAveragePriceChange(results);

      expect(avg).toBeCloseTo(0, 1);
    });
  });
});
