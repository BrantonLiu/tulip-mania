import { useGameStore, selectPrices, selectPlayer, selectInitialWealth } from '../engine/gameState';
import {
  ASSET_PRESENTATION,
  getTradeHistoryLabel,
} from '../engine/assetCatalog';
import { AssetType } from '../engine/types';
import { formatGuilders } from '../utils/formatters';

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
        name: ASSET_PRESENTATION[type].name,
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
          <div className="ledger-number">{formatGuilders(player.cash)}</div>
        </div>
        <div className="ledger-summary-card">
          <div className="ledger-label">今日盈亏</div>
          <div className="ledger-number">
            {todayPnL >= 0 ? '+' : '-'}{formatGuilders(Math.abs(todayPnL))}
          </div>
          <div className={todayPnL >= 0 ? 'ledger-delta-positive' : 'ledger-delta-negative'}>
            {todayPnL >= 0 ? '+' : ''}{todayPnLPercent}%
          </div>
        </div>
      </div>

      {/* 持仓列表 */}
      <div className="ledger-holdings">
        <div className="ledger-label">合约持仓</div>
        {holdings.length > 0 ? (
          holdings.map((h) => (
            <div key={h.type} className="ledger-holding-row">
              <div>
                <div className="ledger-holding-name">{h.name}</div>
                <div className="ledger-holding-detail">
                  {h.quantity} 份 × 均价 {formatGuilders(h.avgBuyPrice)}
                </div>
              </div>
              <div>
                <div className="ledger-holding-value">{formatGuilders(h.value)}</div>
                <div className={`ledger-holding-pnl ${parseFloat(h.pnlPercent) >= 0 ? 'price-up' : 'price-down'}`}>
                  {parseFloat(h.pnlPercent) >= 0 ? '+' : ''}{h.pnlPercent}%
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-holdings">暂无合约持仓</div>
        )}
      </div>

      {/* 交易历史 */}
      <div className="ledger-history">
        <div className="ledger-label">合约往来</div>
        {historyEntries.length > 0 ? (
          <div className="ledger-history-timeline">
            {historyEntries.map((record) => (
              <div key={record.id} className="ledger-history-entry">
                {record.action === 'consume' ? (
                  <>
                    <span className="ledger-history-day">酒馆消费</span>
                    <span className="ledger-history-action-consume">消费</span>
                    <span>{record.itemName || '啤酒'} ×{record.quantity}</span>
                    <span className="price-down">-{formatGuilders(record.total)}</span>
                  </>
                ) : (
                  <>
                    <span className="ledger-history-day">Day {record.day}</span>
                    <span className={record.action === 'buy' ? 'ledger-history-action-buy' : 'ledger-history-action-sell'}>
                      {getTradeHistoryLabel(record.action)}
                    </span>
                    <span>{record.quantity}份 {ASSET_PRESENTATION[record.assetType].name}</span>
                    <span>@ {formatGuilders(record.price)}</span>
                  </>
                )}
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
            {formatGuilders(totalWealth)}
          </span>
          <span className={`ledger-delta ${todayPnL >= 0 ? 'price-up' : 'price-down'}`}>
            {todayPnL >= 0 ? '+' : ''}{todayPnLPercent}%
          </span>
        </div>
      </div>
    </div>
  );
}
