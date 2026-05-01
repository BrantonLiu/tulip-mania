import { useGameStore, selectPlayer, selectPrices, selectInitialWealth } from '../engine/gameState';
import { AssetType } from '../engine/types';
import { formatGuilders } from '../utils/formatters';

const ENDINGS = [
  {
    condition: (wealth: number) => wealth >= 20000,
    type: 'legendary' as const,
    title: '传奇操盘手',
    description: '你在泡沫中全身而退还大赚一笔！你的投资智慧被传颂至今，成为了阿姆斯特丹商界的传奇人物。',
    colorClass: 'ending-legendary',
    mark: 'I',
  },
  {
    condition: (wealth: number) => wealth >= 10000,
    type: 'lucky' as const,
    title: '幸运的旁观者',
    description: '你保住了本金，甚至还有些许收益。在这场疯狂的泡沫中，你保持了清醒，这是最难得的。',
    colorClass: 'ending-lucky',
    mark: 'II',
  },
  {
    condition: (wealth: number) => wealth >= 5000,
    type: 'wounded' as const,
    title: '伤痕累累',
    description: '你损失了一部分资产，但还在游戏中。这场泡沫教会了你残酷的一课：贪婪是魔鬼。',
    colorClass: 'ending-wounded',
    mark: 'III',
  },
  {
    condition: (wealth: number) => wealth < 5000,
    type: 'bankrupt' as const,
    title: '破产的花商',
    description: '你把账桌上的大半身家都赔进去了。但这场狂热本就只卷入少数商人与工匠，城市本身并没有随之停摆。',
    colorClass: 'ending-bankrupt',
    mark: 'IV',
  },
];

export function EndingScene() {
  const player = useGameStore(selectPlayer);
  const prices = useGameStore(selectPrices);
  const { resetGame, setGamePhase } = useGameStore();

  // 计算持仓价值（使用真实崩盘后价格）
  const portfolioValue = Object.entries(player.portfolio).reduce(
    (sum, [type, qty]) => sum + prices[type as AssetType] * qty,
    0
  );

  const totalWealth = player.cash + portfolioValue;
  const initialWealth = useGameStore(selectInitialWealth);

  // 找到匹配的结局
  const ending = ENDINGS.find((e) => e.condition(totalWealth)) || ENDINGS[3];

  const handlePlayAgain = () => {
    resetGame();
    setGamePhase('intro');
  };

  return (
    <div className="ending-scene">
      {/* 背景装饰 */}
      <div className="ending-background" />
      <div className="ending-veil" />

      {/* 内容 */}
      <div className="ending-content">
        {/* 结局标题 */}
        <div className="ending-title-block">
          <div className={`ending-mark ${ending.colorClass}`}>{ending.mark}</div>
          <h1 className={`ending-title ${ending.colorClass}`}>
            {ending.title}
          </h1>
        </div>

        {/* 结局描述 */}
        <div className={`ending-card ${ending.colorClass}`}>
          <p>
            {ending.description}
          </p>
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
        </div>
      </div>
    </div>
  );
}
