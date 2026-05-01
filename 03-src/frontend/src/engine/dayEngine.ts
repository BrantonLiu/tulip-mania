import type { GameState, GamePhase } from './types';
import { AssetType, ItemType } from './types';
import { calculateAllPrices, initializePrices } from './priceEngine';
import { updatePlayerWealth, initializePlayer } from './tradingEngine';

// 默认最大天数
export const DEFAULT_MAX_DAYS = 5;

// 推进到下一天
export function advanceDay(gameState: GameState): GameState {
  const { currentDay, prices, player, maxDays } = gameState;

  // 检查是否已到最大天数
  if (currentDay >= maxDays) {
    return {
      ...gameState,
      gamePhase: 'ending',
    };
  }

  // 计算新价格
  const priceResults = calculateAllPrices(prices, currentDay);
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

  // NPC和对话将由对话引擎生成（暂时留空，M2阶段实现）
  const nextDay = currentDay + 1;
  const gamePhase: GamePhase = nextDay === maxDays ? 'ending' : 'trading';

  // 返回新状态
  return {
    ...gameState,
    currentDay: nextDay,
    prices: newPrices,
    priceHistory: newPriceHistory,
    player: updatedPlayer,
    gamePhase,
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
    player: initializePlayer(500),
    items: [
      {
        type: ItemType.BEER,
        name: '荷兰黑啤',
        quantity: 2,
        icon: '🍺',
        usable: true,
        description: '一杯浓郁的黑啤酒。在酒馆里跟人喝一杯，也许能听到些内幕消息...',
      },
    ],
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
    player: initializePlayer(500),
    items: [
      {
        type: ItemType.BEER,
        name: '荷兰黑啤',
        quantity: 2,
        icon: '🍺',
        usable: true,
        description: '一杯浓郁的黑啤酒。在酒馆里跟人喝一杯，也许能听到些内幕消息...',
      },
    ],
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
