import type { GameState } from './types';
import { AssetType } from './types';
import { calculateAllPrices, initializePrices } from './priceEngine';
import { updatePlayerWealth, initializePlayer } from './tradingEngine';
import { createStartingItems } from './itemEngine';

// 默认最大天数
export const DEFAULT_MAX_DAYS = 5;

// 推进到下一天
export function advanceDay(gameState: GameState): GameState {
  const { currentDay, prices, player, maxDays } = gameState;

  // 已在最后一天（Day 5），推进到结局
  if (currentDay >= maxDays) {
    return {
      ...gameState,
      gamePhase: 'ending',
    };
  }

  // 计算新价格（用 nextDay 决定涨跌：Day 1-4 上涨，Day 5 暴跌）
  const nextDay = currentDay + 1;
  const priceResults = calculateAllPrices(prices, nextDay);
  const newPrices = {} as Record<AssetType, number>;

  // 提取新价格
  Object.entries(priceResults).forEach(([assetType, result]) => {
    newPrices[assetType as AssetType] = result.newPrice;
  });

  // 记录价格历史
  const newPriceHistory = { ...gameState.priceHistory } as Record<AssetType, number[]>;
  Object.entries(newPrices).forEach(([assetType, price]) => {
    const type = assetType as AssetType;
    const history = newPriceHistory[type] || [];
    newPriceHistory[type] = [...history, price];
  });

  // 计算玩家总资产（新价格下）
  const updatedPlayer = updatePlayerWealth(player, newPrices);

  // Day 5 仍为交易日（玩家可在崩盘日交易），之后由 DayControl 触发结局
  return {
    ...gameState,
    currentDay: nextDay,
    prices: newPrices,
    priceHistory: newPriceHistory,
    player: updatedPlayer,
    gamePhase: 'trading',
  };
}

// 初始化游戏状态
export function initializeGameState(
  maxDays: number = DEFAULT_MAX_DAYS
): GameState {
  const initialPrices = initializePrices();

  return {
    currentDay: 1,
    maxDays,
    prices: initialPrices,
    priceHistory: Object.fromEntries(
      Object.values(AssetType).map(type => [type, [initialPrices[type]]])
    ) as Record<AssetType, number[]>,
    player: initializePlayer(2000, initialPrices),
    initialWealth: initializePlayer(2000, initialPrices).totalWealth,
    items: createStartingItems(),
    currentNPC: null,
    dialogue: null,
    gamePhase: 'intro',
    ending: null,
  };
}

// 重置游戏状态
export function resetGameState(gameState: GameState): GameState {
  const initialPrices = initializePrices();

  return {
    ...gameState,
    currentDay: 1,
    prices: initialPrices,
    priceHistory: Object.fromEntries(
      Object.values(AssetType).map(type => [type, [initialPrices[type]]])
    ) as Record<AssetType, number[]>,
    player: initializePlayer(2000, initialPrices),
    initialWealth: initializePlayer(2000, initialPrices).totalWealth,
    items: createStartingItems(),
    currentNPC: null,
    dialogue: null,
    gamePhase: 'intro',
    ending: null,
  };
}

// 检查是否可以推进到下一天
export function canAdvanceDay(gameState: GameState): boolean {
  return gameState.currentDay < gameState.maxDays && gameState.gamePhase === 'trading';
}

// 获取剩余天数
export function getRemainingDays(gameState: GameState): number {
  return gameState.maxDays - gameState.currentDay;
}
