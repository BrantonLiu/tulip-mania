import { AssetType } from './types';
import type { PlayerState, TradeResult, TradeRecord } from './types';
import { randomBetween } from './priceEngine';

// 生成UUID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// 计算交易手续费（1%）
function calculateFee(amount: number): number {
  return Math.round(amount * 0.01);
}

// 计算滑点（大额交易触发）
function calculateSlippage(tradeValue: number, totalWealth: number): number {
  if (tradeValue > totalWealth * 0.3) {
    return randomBetween(-5, 5); // ±5% 滑点
  }
  return 0;
}

// 计算玩家总资产价值
function calculateTotalWealth(
  player: PlayerState,
  prices: Record<AssetType, number>
): number {
  const portfolioValue = Object.entries(player.portfolio).reduce(
    (sum, [type, qty]) => sum + prices[type as AssetType] * qty,
    0
  );
  return player.cash + portfolioValue;
}

// 买入资产
export function buyAsset(
  assetType: AssetType,
  quantity: number,
  prices: Record<AssetType, number>,
  player: PlayerState
): TradeResult {
  const price = prices[assetType];
  const totalCost = price * quantity;

  // 检查是否有足够现金
  if (player.cash < totalCost) {
    return { success: false, error: '现金不足', newPlayerState: player };
  }

  // 计算手续费 (1%)
  const fee = calculateFee(totalCost);
  const totalWithFee = totalCost + fee;

  if (player.cash < totalWithFee) {
    return { success: false, error: '现金不足（含手续费）', newPlayerState: player };
  }

  // 计算滑点（大额交易触发）
  const tradeValue = totalWithFee;
  const totalWealth = calculateTotalWealth(player, prices);
  const slippage = calculateSlippage(tradeValue, totalWealth);
  const actualPrice = price * (1 + slippage / 100);
  const actualTotal = actualPrice * quantity;
  const actualFee = calculateFee(actualTotal);
  const actualTotalWithFee = actualTotal + actualFee;

  // 再次检查现金是否足够（考虑滑点后）
  if (player.cash < actualTotalWithFee) {
    return { success: false, error: '现金不足（含滑点和手续费）', newPlayerState: player };
  }

  // 创建交易记录
  const tradeRecord: TradeRecord = {
    id: generateId(),
    day: 0, // 将在调用时设置
    assetType,
    action: 'buy',
    quantity,
    price: actualPrice,
    total: actualTotal,
    fee: actualFee,
  };

  // 更新玩家状态
  const newPlayerState: PlayerState = {
    ...player,
    cash: player.cash - actualTotalWithFee,
    portfolio: {
      ...player.portfolio,
      [assetType]: (player.portfolio[assetType] || 0) + quantity,
    },
    tradeHistory: [...player.tradeHistory, tradeRecord],
  };

  return { success: true, newPlayerState };
}

// 卖出资产
export function sellAsset(
  assetType: AssetType,
  quantity: number,
  prices: Record<AssetType, number>,
  player: PlayerState
): TradeResult {
  const currentHoldings = player.portfolio[assetType] || 0;

  // 检查是否有足够持仓
  if (currentHoldings < quantity) {
    return { success: false, error: '持仓不足', newPlayerState: player };
  }

  const price = prices[assetType];
  const totalRevenue = price * quantity;

  // 计算滑点
  const tradeValue = totalRevenue;
  const totalWealth = calculateTotalWealth(player, prices);
  const slippage = calculateSlippage(tradeValue, totalWealth);
  const actualPrice = price * (1 + slippage / 100);
  const actualTotal = actualPrice * quantity;
  const actualFee = calculateFee(actualTotal);
  const actualNetRevenue = actualTotal - actualFee;

  // 创建交易记录
  const tradeRecord: TradeRecord = {
    id: generateId(),
    day: 0, // 将在调用时设置
    assetType,
    action: 'sell',
    quantity,
    price: actualPrice,
    total: actualTotal,
    fee: actualFee,
  };

  // 更新玩家状态
  const newPlayerState: PlayerState = {
    ...player,
    cash: player.cash + actualNetRevenue,
    portfolio: {
      ...player.portfolio,
      [assetType]: currentHoldings - quantity,
    },
    tradeHistory: [...player.tradeHistory, tradeRecord],
  };

  return { success: true, newPlayerState };
}

// 更新玩家总资产价值
export function updatePlayerWealth(
  player: PlayerState,
  prices: Record<AssetType, number>
): PlayerState {
  const totalWealth = calculateTotalWealth(player, prices);

  return {
    ...player,
    totalWealth,
  };
}

// 初始化玩家状态
export function initializePlayer(initialCash: number = 500): PlayerState {
  return {
    cash: initialCash,
    portfolio: {
      [AssetType.TULIP_GOUDA]: 5,     // 花商自然持有的普通品种
      [AssetType.TULIP_VICEROY]: 2,   // 稍好品种
    } as Record<AssetType, number>,
    totalWealth: initialCash,
    tradeHistory: [],
  };
}
