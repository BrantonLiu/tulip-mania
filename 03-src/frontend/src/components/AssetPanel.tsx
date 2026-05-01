import { useState, useEffect } from 'react';
import { useGameStore, selectPrices, selectPlayer } from '../engine/gameState';
import { AssetType } from '../engine/types';

const ASSET_NAMES: Record<AssetType, string> = {
  [AssetType.TULIP_SEMPER]: 'Semper Augustus',
  [AssetType.TULIP_GOUDA]: 'Gouda',
  [AssetType.TULIP_VICEROY]: 'Viceroy',
  [AssetType.TULIP_BLACK]: 'Black Tulip',
  [AssetType.ESTATE]: '房产契约',
  [AssetType.VOYAGE]: '航海股份',
};

interface AssetPanelProps {
  onClose: () => void;
}

export function AssetPanel({ onClose }: AssetPanelProps) {
  const prices = useGameStore(selectPrices);
  const player = useGameStore(selectPlayer);

  // 计算总资产
  const portfolioValue = Object.entries(player.portfolio).reduce((total, [assetType, quantity]) => {
    return total + (prices[assetType as AssetType] || 0) * quantity;
  }, 0);

  const totalWealth = player.cash + portfolioValue;

  // 数字滚动动画
  const [displayWealth, setDisplayWealth] = useState(totalWealth);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    const duration = 1000; // 1秒动画
    const startValue = displayWealth;
    const endValue = totalWealth;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // easeOutQuart 缓动函数
      const easeOut = 1 - Math.pow(1 - progress, 4);
      const currentValue = startValue + (endValue - startValue) * easeOut;

      setDisplayWealth(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };

    animate();
  }, [totalWealth]);

  return (
    <div className="fixed bottom-0 right-0 w-96 max-h-[60vh] bg-amber-900/95 rounded-tl-lg border-t-4 border-l-4 border-amber-600 shadow-2xl p-4 overflow-y-auto">
      {/* 标题栏 */}
      <div className="flex justify-between items-center mb-4 pb-3 border-b-2 border-amber-700">
        <h2 className="text-xl font-bold text-amber-100">我的资产</h2>
        <button
          onClick={onClose}
          className="text-amber-300 hover:text-amber-100 text-2xl font-bold"
        >
          ×
        </button>
      </div>

      {/* 现金余额 */}
      <div className="bg-amber-800/50 p-4 rounded-lg mb-4">
        <div className="text-amber-300 text-sm mb-1">现金余额</div>
        <div className="text-2xl font-bold text-white">
          ƒ{player.cash.toLocaleString()}
        </div>
      </div>

      {/* 持仓列表 */}
      <div className="mb-4">
        <div className="text-amber-300 text-sm mb-2">持仓列表</div>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {Object.entries(player.portfolio)
            .filter(([_, quantity]) => quantity > 0)
            .map(([assetType, quantity]) => {
              const type = assetType as AssetType;
              const name = ASSET_NAMES[type];
              const price = prices[type];
              const value = price * quantity;

              return (
                <div
                  key={assetType}
                  className="bg-amber-800/50 p-3 rounded-lg border border-amber-700"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-white font-semibold">{name}</span>
                    <span className="text-amber-300 text-sm">
                      {quantity} × ƒ{price.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-right text-green-400 text-sm">
                    市值：ƒ{value.toLocaleString()}
                  </div>
                </div>
              );
            })}
          {Object.values(player.portfolio).every(q => q === 0) && (
            <div className="text-amber-400 text-center py-4">
              暂无持仓
            </div>
          )}
        </div>
      </div>

      {/* 总资产 */}
      <div
        className={`p-4 rounded-lg border-2 transition-all ${
          isAnimating
            ? totalWealth >= 10000
              ? 'bg-yellow-900/50 border-yellow-600'
              : 'bg-red-900/50 border-red-600'
            : 'bg-amber-800/50 border-amber-700'
        }`}
      >
        <div className="text-amber-300 text-sm mb-1">总资产</div>
        <div className="flex items-baseline gap-2">
          <span className={`text-3xl font-bold ${isAnimating && totalWealth < 10000 ? 'text-red-400' : 'text-white'}`}>
            ƒ{Math.floor(displayWealth).toLocaleString()}
          </span>
          {!isAnimating && (
            <span className="text-sm">
              {totalWealth >= 10000 ? (
                <span className="text-green-400">+{((totalWealth - 10000) / 10000 * 100).toFixed(1)}%</span>
              ) : (
                <span className="text-red-400">{((totalWealth - 10000) / 10000 * 100).toFixed(1)}%</span>
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
