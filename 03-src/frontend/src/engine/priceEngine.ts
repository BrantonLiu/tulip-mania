import { AssetType } from './types';
import type { PriceCalculationResult } from './types';

// 基础价格表（基于1637年荷兰郁金香泡沫历史数据）
export const BASE_PRICES: Record<AssetType, number> = {
  [AssetType.TULIP_SEMPER]: 500,    // Semper Augustus，最贵品种
  [AssetType.TULIP_GOUDA]: 50,      // 普通品种
  [AssetType.TULIP_VICEROY]: 200,   // 中等品种
  [AssetType.TULIP_BLACK]: 300,     // 稀有品种
  [AssetType.ESTATE]: 500,          // 一套工匠房
  [AssetType.VOYAGE]: 100,          // VOC股票
};

// Day 1-4 郁金香涨幅区间（百分比）—— 泡沫膨胀
const TULIP_INCREASE_RANGES: [number, number][] = [
  [50, 80],    // Day 1
  [80, 150],   // Day 2
  [100, 200],  // Day 3
  [150, 200],  // Day 4
];

// Day 1-4 非郁金香资产（房产、航海）涨幅区间 —— 稳健增长，不受泡沫影响
const SAFE_INCREASE_RANGES: [number, number][] = [
  [3, 8],      // Day 1
  [3, 8],      // Day 2
  [5, 12],     // Day 3
  [5, 12],     // Day 4
];

// Day 5 郁金香跌幅区间（百分比）
const DAY_5_TULIP_DROP_RANGE: [number, number] = [80, 95];

// Day 5 非郁金香资产（房产、航海）小幅波动区间
const DAY_5_SAFE_DROP_RANGE: [number, number] = [5, 15];

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
  let volatility: number;

  if (day === 5) {
    // 郁金香品种暴跌；非郁金香资产（房产、航海）仅小幅下跌
    const isTulip = assetType.startsWith('TULIP_');
    const dropRange = isTulip ? DAY_5_TULIP_DROP_RANGE : DAY_5_SAFE_DROP_RANGE;
    const dropPercent = randomBetween(dropRange[0], dropRange[1]);
    newPrice = currentPrice * (1 - dropPercent / 100);
    changePercent = -dropPercent;
    volatility = isTulip ? 0.5 : 0.1;
  } else {
    // Day 1-4：郁金香跟随泡沫暴涨，非郁金香资产稳健增长
    const isTulip = assetType.startsWith('TULIP_');
    const ranges = isTulip ? TULIP_INCREASE_RANGES : SAFE_INCREASE_RANGES;
    const [min, max] = ranges[day - 1];
    const increasePercent = randomBetween(min, max);

    // 随机波动：郁金香 ±20%，非郁金香 ±5%
    volatility = randomBetween(isTulip ? -20 : -5, isTulip ? 20 : 5);

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
  const results: Record<AssetType, PriceCalculationResult> = {} as Record<AssetType, PriceCalculationResult>;

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

// 初始化价格表（带随机波动，让每种资产的初始价格有差异）
export function initializePrices(): Record<AssetType, number> {
  const prices = {} as Record<AssetType, number>;
  for (const [asset, base] of Object.entries(BASE_PRICES)) {
    // 郁金香品种：±15% 随机波动
    if (asset.startsWith('TULIP_')) {
      const jitter = randomBetween(-15, 15);
      prices[asset as AssetType] = Math.round(base * (1 + jitter / 100));
    } else {
      prices[asset as AssetType] = base;
    }
  }
  return prices;
}
