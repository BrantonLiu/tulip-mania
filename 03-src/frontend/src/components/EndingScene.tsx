import { useState } from 'react';
import { useGameStore, selectPlayer, selectPrices, selectInitialWealth, selectEnding } from '../engine/gameState';
import { AssetType } from '../engine/types';
import { formatGuilders } from '../utils/formatters';

export function EndingScene() {
  const player = useGameStore(selectPlayer);
  const prices = useGameStore(selectPrices);
  const ending = useGameStore(selectEnding);
  const { resetGame, setGamePhase } = useGameStore();
  const [bidSubmitted, setBidSubmitted] = useState(false);
  const [bidPrice, setBidPrice] = useState('');

  // 计算持仓价值（使用真实崩盘后价格）
  const portfolioValue = Object.entries(player.portfolio).reduce(
    (sum, [type, qty]) => sum + prices[type as AssetType] * qty,
    0
  );

  const totalWealth = player.cash + portfolioValue;
  const initialWealth = useGameStore(selectInitialWealth);

  // 如果没有 ending 数据（理论上不应发生），使用默认值
  const currentEnding = ending || {
    type: 'bankrupt' as const,
    title: '破产的花商',
    description: '你把账桌上的大半身家都赔进去了。',
    colorClass: 'ending-bankrupt',
    mark: 'IV',
  };

  const handlePlayAgain = () => {
    resetGame();
    setGamePhase('intro');
  };

  const handleViewHistory = () => {
    setGamePhase('history');
  };

  const handleBidSubmit = () => {
    if (!bidPrice.trim()) return;
    setBidSubmitted(true);
  };

  const canSubmit = bidPrice.trim() !== '';

  return (
    <div className="ending-scene">
      {/* 背景装饰 */}
      <div className="ending-background" />
      <div className="ending-veil" />

      {/* 内容 */}
      <div className="ending-content">
        {/* 结局标题 */}
        <div className="ending-title-block">
          <div className={`ending-mark ${currentEnding.colorClass}`}>{currentEnding.mark}</div>
          <h1 className={`ending-title ${currentEnding.colorClass}`}>
            {currentEnding.title}
          </h1>
        </div>

        {/* 结局描述 */}
        <div className={`ending-card ${currentEnding.colorClass}`}>
          {currentEnding.description.split('\n').map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>

        {/* 资产统计 */}
        <div className="ending-ledger">
          <h2>你的最终资产</h2>
          <div className="ending-stats">
            <div>
              <div className="ledger-label">现金</div>
              <div className="ledger-number">
                {formatGuilders(player.cash)}
              </div>
            </div>
            <div>
              <div className="ledger-label">持仓价值</div>
              <div className="ledger-number price-down">
                {formatGuilders(portfolioValue)}
              </div>
            </div>
            <div className="ending-total">
              <div className="ledger-label">总资产</div>
              <div className="ledger-total-number">
                {formatGuilders(totalWealth)}
              </div>
              <div className="ledger-delta">
                {totalWealth >= initialWealth ? (
                  <span className="price-up">
                    +{((totalWealth - initialWealth) / initialWealth * 100).toFixed(1)}% 相对初始
                  </span>
                ) : (
                  <span className="price-down">
                    {((totalWealth - initialWealth) / initialWealth * 100).toFixed(1)}% 相对初始
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 历史背景 */}
        <div className="history-note">
          <h2>历史上的今天</h2>
          <p>
            1637年2月初，哈勒姆的买家开始在拍卖席上消失，纸面合约价格随之迅速失灵。
            这场泡沫确实惨烈，但参与者主要是少数商人与工匠，荷兰黄金时代并未因此终结，阿姆斯特丹第二天照样开门做生意。
          </p>
        </div>

        {/* 按钮 */}
        <div className="ending-actions">
          <button
            onClick={handlePlayAgain}
            className="game-button game-button-primary"
          >
            再来一次
          </button>
          <button
            onClick={handleViewHistory}
            className="game-button game-button-secondary"
          >
            查看历史回响
          </button>
        </div>

        {/* 域名交易彩蛋 */}
        <div className="domain-trade-card">
          <div className="domain-trade-header">
            <span className="domain-trade-icon">&#9830;</span>
            <h3>交易此域名</h3>
          </div>
          <p className="domain-trade-desc">
            郁金香泡沫已破，但这个游戏本身也可以被"交易"。
            tulip-crash.pages.dev 现接受报价。
          </p>
          {bidSubmitted ? (
            <p className="domain-trade-thanks">
              报价已收到！我们会联系你。（也许吧。毕竟泡沫随时会破。）
            </p>
          ) : (
            <div className="domain-trade-form">
              <input
                type="text"
                placeholder="报价（USD）"
                className="domain-trade-input"
                value={bidPrice}
                onChange={(e) => setBidPrice(e.target.value)}
              />
              <button
                onClick={handleBidSubmit}
                disabled={!canSubmit}
                className="game-button domain-trade-btn"
              >
                提交报价
              </button>
            </div>
          )}
          <p className="domain-trade-note">
            仅供娱乐，不代表真实交易意图。
          </p>
        </div>
      </div>
    </div>
  );
}
