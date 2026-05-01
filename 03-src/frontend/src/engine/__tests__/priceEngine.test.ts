import { describe, it, expect } from 'vitest';
import { initializePrices, calculateNextPrice, BASE_PRICES } from '../priceEngine';
import { AssetType } from '../types';

describe('priceEngine', () => {
  describe('initializePrices', () => {
    it('should initialize tulips within jitter range and keep stable assets at base prices', () => {
      const prices = initializePrices();

      const tulipTypes = [
        AssetType.TULIP_SEMPER,
        AssetType.TULIP_GOUDA,
        AssetType.TULIP_VICEROY,
        AssetType.TULIP_BLACK,
      ];

      tulipTypes.forEach((assetType) => {
        const basePrice = BASE_PRICES[assetType];
        expect(prices[assetType]).toBeGreaterThanOrEqual(Math.round(basePrice * 0.85));
        expect(prices[assetType]).toBeLessThanOrEqual(Math.round(basePrice * 1.15));
      });

      expect(prices[AssetType.ESTATE]).toBe(BASE_PRICES[AssetType.ESTATE]);
      expect(prices[AssetType.VOYAGE]).toBe(BASE_PRICES[AssetType.VOYAGE]);
    });
  });

  describe('calculateNextPrice', () => {
    it('should return a positive price for Day 1-4', () => {
      const result = calculateNextPrice(500, 1, AssetType.TULIP_SEMPER);
      expect(result.newPrice).toBeGreaterThan(0);
    });

    it('should generally increase prices on Day 1-4', () => {
      let increases = 0;
      for (let i = 0; i < 20; i++) {
        const result = calculateNextPrice(100, 2, AssetType.TULIP_GOUDA);
        if (result.newPrice > 100) increases++;
      }
      expect(increases).toBeGreaterThan(10);
    });

    it('should crash prices on Day 5', () => {
      let crashed = 0;
      for (let i = 0; i < 20; i++) {
        const result = calculateNextPrice(1000, 5, AssetType.TULIP_SEMPER);
        if (result.newPrice < 500) crashed++;
      }
      expect(crashed).toBeGreaterThan(15);
    });

    it('should never return negative prices', () => {
      for (let day = 1; day <= 5; day++) {
        const result = calculateNextPrice(100, day, AssetType.TULIP_GOUDA);
        expect(result.newPrice).toBeGreaterThan(0);
      }
    });
  });

  describe('BASE_PRICES', () => {
    it('should have all asset types', () => {
      expect(BASE_PRICES).toHaveProperty(AssetType.TULIP_SEMPER);
      expect(BASE_PRICES).toHaveProperty(AssetType.TULIP_GOUDA);
      expect(BASE_PRICES).toHaveProperty(AssetType.TULIP_VICEROY);
      expect(BASE_PRICES).toHaveProperty(AssetType.TULIP_BLACK);
      expect(BASE_PRICES).toHaveProperty(AssetType.ESTATE);
      expect(BASE_PRICES).toHaveProperty(AssetType.VOYAGE);
    });
  });
});
