import { AssetType, PriceCalculationResult } from './types';

// 基础价格表
export const BASE_PRICES: Record<AssetType, number> = {
  [AssetType.TULIP_SEMPER]: 1000,
  [AssetType.TULIP_GOUDA]: 500,
  [AssetType.TULIP_VICEROY]: 300,
  [AssetType.TULIP_BLACK]: 800,
  [AssetType.ESTATE]: 2000,
  [AssetType.VOYAGE]: 1500,
};

// Day 1-4 的涨幅区间（百分比）
const DAY_INCREASE_RANGES: [number, number][] = [
  [50, 80],    // Day 1
  [80, 150],   // Day 2
  [100, 200],  // Day 3
  [150, 200],  // Day 4
];

// Day 5 的跌幅区间（百分比）
const DAY_5_DROP_RANGE: [number, number] = [80, 95];

// 随机数生成器（0-1）
export const random = (): number => Math.random();

// 随机整数 [min, max]
export const randomBetween = (min: number, max: number): number => {
  return Math.floor(random() * (max - min + 1)) + min;
};

// 计算下一天的价格
export function calculateNextPrice(
  currentPrice: number,
  day: number,
  assetType: AssetType
): PriceCalculationResult {
  let newPrice: number;
  let changePercent: number;
  let volatility = 0;

  if (day === 5) {
    // 泡沫破裂，大幅暴跌
    const dropPercent = randomBetween(DAY_5_DROP_RANGE[0], DAY_5_DROP_RANGE[1]);
    newPrice = currentPrice * (1 - dropPercent / 100);
    changePercent = -dropPercent;
    volatility = 0.5; // 高波动
  } else {
    // Day 1-4 正常上涨
    const [min, max] = DAY_INCREASE_RANGES[day - 1];
    const increasePercent = randomBetween(min, max);

    // 随机波动 ±20%
    volatility = randomBetween(-20, 20);

    // 黑色郁金香特殊逻辑
    let multiplier = 1;
    if (assetType === AssetType.TULIP_BLACK) {
      if (random() < 0.3) {
        multiplier = 2; // 30% 概率涨幅翻倍
      } else if (random() < 0.5) { // 20% 概率（0.2/0.5在第一个if后）
        multiplier = 0.5; // 20% 概率突然暴跌
      }
    }

    // 计算新价格
    newPrice = currentPrice * (1 + increasePercent / 100) * (1 + volatility / 100) * multiplier;
    changePercent = increasePercent + volatility;

    // 如果multiplier不为1，调整changePercent
    if (multiplier !== 1) {
      changePercent = (newPrice / currentPrice - 1) * 100;
    }
  }

  return {
    newPrice: Math.round(newPrice),
    changePercent: Math.round(changePercent * 100) / 100,
    volatility,
  };
}

// 计算所有资产的新价格
export function calculateAllPrices(
  currentPrices: Record<AssetType, number>,
  day: number
): Record<AssetType, PriceCalculationResult> {
  const results: Record<AssetType, PriceCalculationResult> = {};

  Object.values(AssetType).forEach(assetType => {
    results[assetType] = calculateNextPrice(
      currentPrices[assetType],
      day,
      assetType
    );
  });

  return results;
}

// 计算平均价格变化（百分比）
export function calculateAveragePriceChange(
  priceResults: Record<AssetType, PriceCalculationResult>
): number {
  const values = Object.values(priceResults);
  const sum = values.reduce((acc, curr) => acc + curr.changePercent, 0);
  return sum / values.length;
}

// 初始化价格表
export function initializePrices(): Record<AssetType, number> {
  return { ...BASE_PRICES };
}
