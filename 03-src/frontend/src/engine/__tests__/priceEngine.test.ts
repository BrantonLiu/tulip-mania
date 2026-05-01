import { describe, it, expect } from 'vitest';
import { initializePrices, calculateNextPrice, BASE_PRICES } from '../priceEngine';
import { AssetType } from '../types';

describe('priceEngine', () => {
  describe('initializePrices', () => {
    it('should return correct base prices', () => {
      const prices = initializePrices();

      expect(prices[AssetType.TULIP_SEMPER]).toBe(500);
      expect(prices[AssetType.TULIP_GOUDA]).toBe(50);
      expect(prices[AssetType.TULIP_VICEROY]).toBe(200);
      expect(prices[AssetType.TULIP_BLACK]).toBe(300);
      expect(prices[AssetType.ESTATE]).toBe(500);
      expect(prices[AssetType.VOYAGE]).toBe(100);
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
