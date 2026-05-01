import { BEER_PRICE } from '../engine/itemEngine';

export function formatGuilders(amount: number): string {
  const hasFraction = !Number.isInteger(amount);
  return `ƒ${amount.toLocaleString('zh-CN', {
    minimumFractionDigits: hasFraction ? 1 : 0,
    maximumFractionDigits: hasFraction ? 1 : 0,
  })}`;
}

export function formatBeerPriceForDialogue(): string {
  const stuivers = Math.round(BEER_PRICE * 20);
  return `${stuivers} stuivers`;
}
