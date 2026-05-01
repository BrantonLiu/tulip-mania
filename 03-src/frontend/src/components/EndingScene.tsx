import { useGameStore, selectPlayer } from '../engine/gameState';

const ENDINGS = [
  {
    condition: (wealth: number) => wealth >= 20000,
    type: 'legendary' as const,
    title: '传奇操盘手',
    description: '你在泡沫中全身而退还大赚一笔！你的投资智慧被传颂至今，成为了阿姆斯特丹商界的传奇人物。',
    color: 'bg-yellow-900',
    emoji: '👑',
  },
  {
    condition: (wealth: number) => wealth >= 10000,
    type: 'lucky' as const,
    title: '幸运的旁观者',
    description: '你保住了本金，甚至还有些许收益。在这场疯狂的泡沫中，你保持了清醒，这是最难得的。',
    color: 'bg-blue-900',
    emoji: '🎯',
  },
  {
    condition: (wealth: number) => wealth >= 5000,
    type: 'wounded' as const,
    title: '伤痕累累',
    description: '你损失了一部分资产，但还在游戏中。这场泡沫教会了你残酷的一课：贪婪是魔鬼。',
    color: 'bg-orange-900',
    emoji: '🤕',
  },
  {
    condition: (wealth: number) => wealth < 5000,
    type: 'bankrupt' as const,
    title: '破产的花商',
    description: '你把一切都输了...但你不是唯一的一个。成千上万的荷兰人也和你一样，在泡沫破裂中失去了一切。',
    color: 'bg-red-900',
    emoji: '💀',
  },
];

export function EndingScene() {
  const player = useGameStore(selectPlayer);
  const { resetGame, setGamePhase } = useGameStore();

  // 计算总资产
  const portfolioValue = Object.entries(player.portfolio).reduce((total, [_, quantity]) => {
    // 泡沫破裂后，所有资产价值归零
    return total + 0 * quantity;
  }, 0);

  const totalWealth = player.cash + portfolioValue;

  // 找到匹配的结局
  const ending = ENDINGS.find((e) => e.condition(totalWealth)) || ENDINGS[3];

  const handlePlayAgain = () => {
    resetGame();
    setGamePhase('intro');
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black flex items-center justify-center">
      {/* 背景装饰 */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/tavern.png')", filter: 'blur(8px)' }}
        />
      </div>

      {/* 内容 */}
      <div className="relative z-10 max-w-2xl w-full px-8 py-12">
        {/* 结局标题 */}
        <div className="text-center mb-8">
          <div className="text-8xl mb-4">{ending.emoji}</div>
          <h1
            className={`text-4xl md:text-5xl font-bold text-white mb-2 ${ending.color} px-8 py-4 rounded-lg inline-block`}
            style={{
              fontFamily: "'Playfair Display', 'Noto Serif SC', serif",
              textShadow: '2px 2px 8px rgba(0,0,0,0.5)',
            }}
          >
            {ending.title}
          </h1>
        </div>

        {/* 结局描述 */}
        <div className={`${ending.color} bg-opacity-80 rounded-lg p-6 mb-6 border-2 border-opacity-50 border-amber-400`}>
          <p className="text-white text-lg leading-relaxed text-center">
            {ending.description}
          </p>
        </div>

        {/* 资产统计 */}
        <div className="bg-amber-900/90 rounded-lg p-6 mb-8 border-2 border-amber-700">
          <h2 className="text-xl font-bold text-amber-100 mb-4 text-center">你的最终资产</h2>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-amber-300 text-sm mb-1">现金</div>
              <div className="text-2xl font-bold text-white">
                ƒ{player.cash.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-amber-300 text-sm mb-1">持仓价值</div>
              <div className="text-2xl font-bold text-red-400">
                ƒ{portfolioValue.toLocaleString()}
              </div>
            </div>
            <div className="col-span-2 pt-4 border-t border-amber-700">
              <div className="text-amber-300 text-sm mb-1">总资产</div>
              <div className="text-3xl font-bold text-amber-100">
                ƒ{totalWealth.toLocaleString()}
              </div>
              <div className="text-sm mt-1">
                {totalWealth >= 10000 ? (
                  <span className="text-green-400">
                    +{((totalWealth - 10000) / 10000 * 100).toFixed(1)}% 相对初始
                  </span>
                ) : (
                  <span className="text-red-400">
                    {((totalWealth - 10000) / 10000 * 100).toFixed(1)}% 相对初始
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 历史背景 */}
        <div className="bg-gray-900/80 rounded-lg p-6 mb-8 border border-gray-700">
          <h2 className="text-xl font-bold text-gray-100 mb-3 text-center">历史上的今天</h2>
          <p className="text-gray-300 text-sm leading-relaxed text-center">
            1637年2月3日，荷兰郁金香泡沫达到顶峰，随后在哈勒姆的一次拍卖会上，买家突然消失。
            泡沫迅速破裂，成千上万的人在一夜之间破产。这是人类历史上第一次资产泡沫事件。
          </p>
        </div>

        {/* 按钮 */}
        <div className="text-center">
          <button
            onClick={handlePlayAgain}
            className="px-12 py-4 bg-amber-600 hover:bg-amber-500 text-white text-xl font-bold rounded-lg border-4 border-amber-400 shadow-2xl transition-all hover:scale-105 active:scale-95"
            style={{
              fontFamily: "'Playfair Display', serif",
            }}
          >
            再来一次
          </button>
        </div>
      </div>
    </div>
  );
}
