import { useGameStore, selectPrices, selectCurrentDay } from '../engine/gameState';
import { AssetType } from '../engine/types';

const ASSET_NAMES: Record<AssetType, { name: string; colorClass: string; image?: string }> = {
  [AssetType.TULIP_SEMPER]: { name: 'Semper Augustus', colorClass: 'asset-semper', image: 'semper_augustus.png' },
  [AssetType.TULIP_GOUDA]: { name: 'Gouda', colorClass: 'asset-gouda', image: 'gouda.png' },
  [AssetType.TULIP_VICEROY]: { name: 'Viceroy', colorClass: 'asset-viceroy', image: 'viceroy.png' },
  [AssetType.TULIP_BLACK]: { name: 'Black Tulip', colorClass: 'asset-black', image: 'black_tulip.png' },
  [AssetType.ESTATE]: { name: '房产契约', colorClass: 'asset-estate' },
  [AssetType.VOYAGE]: { name: '航海股份', colorClass: 'asset-voyage' },
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
  const priceHistory = useGameStore((s) => s.priceHistory);

  // 从价格历史获取真实的前一天价格
  const tulipAssets: PriceDisplay[] = [
    AssetType.TULIP_SEMPER,
    AssetType.TULIP_GOUDA,
    AssetType.TULIP_VICEROY,
    AssetType.TULIP_BLACK,
  ].map((assetType) => {
    const history = priceHistory[assetType] || [];
    const currentPrice = prices[assetType];
    // 历史倒数第二条就是前一天的收盘价，如果只有一条则和当天相同
    const previousPrice = history.length >= 2 ? history[history.length - 2] : currentPrice;
    return { assetType, currentPrice, previousPrice };
  });

  return (
    <div className="price-board">
      {/* 标题 */}
      <div className="price-board-header">
        <h2>今日行情</h2>
      </div>

      {/* 价格列表 */}
      <div className="price-list">
        {tulipAssets.map((item) => {
          const assetInfo = ASSET_NAMES[item.assetType];
          const changePercent = calculatePriceChange(item.currentPrice, item.previousPrice);
          const isPositive = changePercent >= 0;
          const changeClass = isPositive ? 'price-up' : 'price-down';

          return (
            <div
              key={item.assetType}
              className="price-row"
            >
              {/* 资产名称 */}
              <div className="price-asset">
                {assetInfo.image && (
                  <img
                    src={`/images/${assetInfo.image}`}
                    alt={assetInfo.name}
                    className="price-asset-image"
                  />
                )}
                <span className={`price-name ${assetInfo.colorClass}`}>
                  {assetInfo.name}
                </span>
              </div>

              {/* 价格和涨跌幅 */}
              <div className="price-value">
                <div className="price-number">{formatPrice(item.currentPrice)}</div>
                {item.previousPrice !== item.currentPrice && (
                  <div className={`price-change ${changeClass}`}>
                    {isPositive ? '+' : ''}{changePercent.toFixed(1)}%
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 装饰性粉笔字提示 */}
      {currentDay === 5 && (
        <div className="market-warning">
          <p>
            市场崩盘
          </p>
        </div>
      )}
    </div>
  );
}
