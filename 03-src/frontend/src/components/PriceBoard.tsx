import { useGameStore, selectPrices, selectCurrentDay } from '../engine/gameState';
import { ASSET_PRESENTATION, TULIP_ASSET_TYPES } from '../engine/assetCatalog';
import { AssetType } from '../engine/types';
import { formatGuilders } from '../utils/formatters';

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
  return formatGuilders(price);
}

export function PriceBoard() {
  const prices = useGameStore(selectPrices);
  const currentDay = useGameStore(selectCurrentDay);
  const priceHistory = useGameStore((s) => s.priceHistory);

  // 从价格历史获取真实的前一天价格
  const tulipAssets: PriceDisplay[] = TULIP_ASSET_TYPES.map((assetType) => {
    const history = priceHistory[assetType] || [];
    const currentPrice = prices[assetType];
    // 历史倒数第二条就是前一天的收盘价，如果只有一条则和当天相同
    const previousPrice = history.length >= 2 ? history[history.length - 2] : currentPrice;
    return { assetType, currentPrice, previousPrice };
  });

  const isCrashDay = currentDay === 5;

  return (
    <div className="price-board">
      {/* 标题 */}
      <div className="price-board-header">
        <h2>今日行情</h2>
        <span>纸面合约报价</span>
      </div>

      {/* Day5 崩盘横幅 */}
      {isCrashDay && (
        <div className="market-crash-banner">
          <p>市场冻结 —— 无人报价</p>
        </div>
      )}

      {/* 价格列表 */}
      <div className="price-list">
        {tulipAssets.map((item) => {
          const assetInfo = ASSET_PRESENTATION[item.assetType];
          const changePercent = calculatePriceChange(item.currentPrice, item.previousPrice);
          const isPositive = changePercent >= 0;
          const changeClass = isPositive ? 'price-up' : 'price-down';

          return (
            <div
              key={item.assetType}
              className={`price-row ${isCrashDay ? 'price-row-crash' : ''}`}
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
                <span className={`price-name ${assetInfo.colorClass ?? ''}`}>
                  {assetInfo.name}
                </span>
              </div>

              {/* 价格和涨跌幅 */}
              <div className="price-value">
                {isCrashDay ? (
                  <>
                    <div className="price-crash-group">
                      <span className="price-old">{formatPrice(item.previousPrice)}</span>
                      <span className="price-new-crash">{formatPrice(item.currentPrice)}</span>
                    </div>
                  </>
                ) : (
                  <div className="price-number">{formatPrice(item.currentPrice)}</div>
                )}
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
    </div>
  );
}
