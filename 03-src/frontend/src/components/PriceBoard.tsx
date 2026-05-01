import { useGameStore, selectPrices, selectCurrentDay } from '../engine/gameState';
import { AssetType } from '../engine/types';

const ASSET_NAMES: Record<AssetType, { name: string; color: string }> = {
  [AssetType.TULIP_SEMPER]: { name: 'Semper Augustus', color: 'text-red-600' },
  [AssetType.TULIP_GOUDA]: { name: 'Gouda', color: 'text-yellow-600' },
  [AssetType.TULIP_VICEROY]: { name: 'Viceroy', color: 'text-purple-600' },
  [AssetType.TULIP_BLACK]: { name: 'Black Tulip', color: 'text-gray-800' },
  [AssetType.ESTATE]: { name: '房产契约', color: 'text-blue-600' },
  [AssetType.VOYAGE]: { name: '航海股份', color: 'text-cyan-600' },
};

interface PriceDisplay {
  assetType: AssetType;
  currentPrice: number;
  previousPrice: number;
}

function calculatePriceChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

function formatPrice(price: number): string {
  return `ƒ${price.toLocaleString()}`;
}

export function PriceBoard() {
  const prices = useGameStore(selectPrices);
  const currentDay = useGameStore(selectCurrentDay);

  // 获取郁金香资产
  const tulipAssets: PriceDisplay[] = [
    { assetType: AssetType.TULIP_SEMPER, currentPrice: prices[AssetType.TULIP_SEMPER], previousPrice: prices[AssetType.TULIP_SEMPER] * 0.9 },
    { assetType: AssetType.TULIP_GOUDA, currentPrice: prices[AssetType.TULIP_GOUDA], previousPrice: prices[AssetType.TULIP_GOUDA] * 0.9 },
    { assetType: AssetType.TULIP_VICEROY, currentPrice: prices[AssetType.TULIP_VICEROY], previousPrice: prices[AssetType.TULIP_VICEROY] * 0.9 },
    { assetType: AssetType.TULIP_BLACK, currentPrice: prices[AssetType.TULIP_BLACK], previousPrice: prices[AssetType.TULIP_BLACK] * 0.9 },
  ];

  return (
    <div className="bg-amber-950/90 rounded-lg p-4 border-4 border-amber-800 shadow-xl">
      {/* 标题 */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-bold text-amber-100">今日行情</h2>
        <span className="text-sm text-amber-300">Day {currentDay} / 5</span>
      </div>

      {/* 价格列表 */}
      <div className="space-y-2">
        {tulipAssets.map((item) => {
          const assetInfo = ASSET_NAMES[item.assetType];
          const changePercent = calculatePriceChange(item.currentPrice, item.previousPrice);
          const isPositive = changePercent >= 0;
          const changeColor = isPositive ? 'text-green-400' : 'text-red-400';

          return (
            <div
              key={item.assetType}
              className="flex justify-between items-center p-2 bg-amber-900/50 rounded border border-amber-700"
            >
              {/* 资产名称 */}
              <span className={`text-sm font-semibold ${assetInfo.color}`}>
                {assetInfo.name}
              </span>

              {/* 价格和涨跌幅 */}
              <div className="text-right">
                <div className="text-white font-bold">{formatPrice(item.currentPrice)}</div>
                <div className={`text-xs ${changeColor}`}>
                  {isPositive ? '+' : ''}{changePercent.toFixed(1)}%
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 装饰性粉笔字提示 */}
      {currentDay === 5 && (
        <div className="mt-4 p-2 bg-red-900/50 rounded border-2 border-red-700 text-center">
          <p className="text-red-200 text-sm font-bold animate-pulse">
            ⚠️ 市场崩盘！
          </p>
        </div>
      )}
    </div>
  );
}
