import { describe, expect, it } from 'vitest';
import { initializePlayer } from '../tradingEngine';
import { createStartingItems, purchaseItem, BEER_PRICE } from '../itemEngine';
import { initializePrices } from '../priceEngine';
import { ItemType } from '../types';

describe('itemEngine', () => {
  it('should deduct cash and add beer to inventory when purchasing beer', () => {
    const prices = initializePrices();
    const player = initializePlayer(2000, prices);
    const items = createStartingItems();

    const result = purchaseItem(ItemType.BEER, 1, BEER_PRICE, items, player);

    expect(result.success).toBe(true);
    expect(BEER_PRICE).toBe(0.1);
    expect(result.newPlayerState.cash).toBeCloseTo(1999.9);
    expect(result.newPlayerState.totalWealth).toBeCloseTo(player.totalWealth - BEER_PRICE);
    expect(result.newItems.find((item) => item.type === ItemType.BEER)?.quantity).toBe(3);
  });
});
