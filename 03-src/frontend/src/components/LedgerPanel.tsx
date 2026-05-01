import { useGameStore, selectPrices, selectPlayer, selectInitialWealth } from '../engine/gameState';
import { AssetType } from '../engine/types';

const ASSET_NAMES: Record<AssetType, string> = {
  [AssetType.TULIP_SEMPER]: 'Semper Augustus',
  [AssetType.TULIP_GOUDA]: 'Gouda',
  [AssetType.TULIP_VICEROY]: 'Viceroy',
  [AssetType.TULIP_BLACK]: 'Black Tulip',
  [AssetType.ESTATE]: '房产契约',
  [AssetType.VOYAGE]: '航海股份',
};

interface LedgerPanelProps {
  onClose: () => void;
}

export function LedgerPanel({ onClose }: LedgerPanelProps) {
  const prices = useGameStore(selectPrices);
  const player = useGameStore(selectPlayer);

  // 计算总资产
  const portfolioValue = Object.entries(player.portfolio).reduce((total, [assetType, quantity]) => {
    return total + (prices[assetType as AssetType] || 0) * quantity;
  }, 0);

  const totalWealth = player.cash + portfolioValue;
  const initialWealth = useGameStore(selectInitialWealth);
  const todayPnL = totalWealth - initialWealth;
  const todayPnLPercent = ((todayPnL / initialWealth) * 100).toFixed(1);

  // 持仓列表
  const holdings = Object.entries(player.portfolio)
    .filter(([, quantity]) => quantity > 0)
    .map(([assetType, quantity]) => {
      const type = assetType as AssetType;
      const price = prices[type];
      const value = price * quantity;

      // 计算买入均价
      const buyTrades = player.tradeHistory.filter(
        (t) => t.assetType === type && t.action === 'buy'
      );
      const totalBuyCost = buyTrades.reduce((sum, t) => sum + t.total, 0);
      const totalBuyQty = buyTrades.reduce((sum, t) => sum + t.quantity, 0);
      const avgBuyPrice = totalBuyQty > 0 ? totalBuyCost / totalBuyQty : price;
      const pnlPercent = ((price - avgBuyPrice) / avgBuyPrice * 100).toFixed(1);

      return {
        type,
        name: ASSET_NAMES[type],
        quantity,
        avgBuyPrice: Math.round(avgBuyPrice),
        currentPrice: price,
        value,
        pnlPercent,
      };
    });

  // 交易历史（按天数分组）
  const historyEntries = [...player.tradeHistory].reverse();

  return (
    <div className="ledger-panel">
      {/* 标题栏 */}
      <div className="panel-header">
        <h2>我的账簿</h2>
        <button onClick={onClose} className="panel-close" aria-label="关闭账簿">×</button>
      </div>

      {/* 顶部：现金 + 今日盈亏 */}
      <div className="ledger-summary">
        <div className="ledger-summary-card">
          <div className="ledger-label">当前现金</div>
          <div className="ledger-number">ƒ{player.cash.toLocaleString()}</div>
        </div>
        <div className="ledger-summary-card">
          <div className="ledger-label">今日盈亏</div>
          <div className="ledger-number">
            {todayPnL >= 0 ? '+' : ''}{todayPnL.toLocaleString()}ƒ
          </div>
          <div className={todayPnL >= 0 ? 'ledger-delta-positive' : 'ledger-delta-negative'}>
            {todayPnL >= 0 ? '+' : ''}{todayPnLPercent}%
          </div>
        </div>
      </div>

      {/* 持仓列表 */}
      <div className="ledger-holdings">
        <div className="ledger-label">持仓列表</div>
        {holdings.length > 0 ? (
          holdings.map((h) => (
            <div key={h.type} className="ledger-holding-row">
              <div>
                <div className="ledger-holding-name">{h.name}</div>
                <div className="ledger-holding-detail">
                  {h.quantity}份 × 均价 ƒ{h.avgBuyPrice.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="ledger-holding-value">ƒ{h.value.toLocaleString()}</div>
                <div className={`ledger-holding-pnl ${parseFloat(h.pnlPercent) >= 0 ? 'price-up' : 'price-down'}`}>
                  {parseFloat(h.pnlPercent) >= 0 ? '+' : ''}{h.pnlPercent}%
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-holdings">暂无持仓</div>
        )}
      </div>

      {/* 交易历史 */}
      <div className="ledger-history">
        <div className="ledger-label">交易历史</div>
        {historyEntries.length > 0 ? (
          <div className="ledger-history-timeline">
            {historyEntries.map((record) => (
              <div key={record.id} className="ledger-history-entry">
                <span className="ledger-history-day">Day {record.day}</span>
                <span className={record.action === 'buy' ? 'ledger-history-action-buy' : 'ledger-history-action-sell'}>
                  {record.action === 'buy' ? '买入' : '卖出'}
                </span>
                <span>{record.quantity}份 {ASSET_NAMES[record.assetType]}</span>
                <span>@ ƒ{record.price.toLocaleString()}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-holdings">暂无交易记录</div>
        )}
      </div>

      {/* 总资产 */}
      <div className={`ledger-total ${todayPnL >= 0 ? 'ledger-total-profit' : 'ledger-total-loss'}`}>
        <div className="ledger-label">总资产</div>
        <div className="ledger-total-line">
          <span className={`ledger-total-number ${todayPnL < 0 ? 'ledger-negative' : ''}`}>
            ƒ{totalWealth.toLocaleString()}
          </span>
          <span className={`ledger-delta ${todayPnL >= 0 ? 'price-up' : 'price-down'}`}>
            {todayPnL >= 0 ? '+' : ''}{todayPnLPercent}%
          </span>
        </div>
      </div>
    </div>
  );
}
