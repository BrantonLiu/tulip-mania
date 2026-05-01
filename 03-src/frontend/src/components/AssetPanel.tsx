import { useState, useEffect, useRef } from 'react';
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
  const initialWealth = useGameStore(selectInitialWealth);

  // 数字滚动动画
  const [displayWealth, setDisplayWealth] = useState(totalWealth);
  const [isAnimating, setIsAnimating] = useState(false);
  const displayWealthRef = useRef(displayWealth);

  useEffect(() => {
    displayWealthRef.current = displayWealth;
  }, [displayWealth]);

  useEffect(() => {
    const duration = 1000; // 1秒动画
    const startValue = displayWealthRef.current;
    const endValue = totalWealth;
    let animationFrame: number | undefined;
    let cancelled = false;
    let startTime = 0;

    const animate = () => {
      if (cancelled) return;

      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // easeOutQuart 缓动函数
      const easeOut = 1 - Math.pow(1 - progress, 4);
      const currentValue = startValue + (endValue - startValue) * easeOut;

      setDisplayWealth(currentValue);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };

    animationFrame = requestAnimationFrame(() => {
      if (cancelled) return;
      startTime = Date.now();
      setIsAnimating(true);
      animate();
    });

    return () => {
      cancelled = true;
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [totalWealth]);

  return (
    <div className="asset-panel">
      {/* 标题栏 */}
      <div className="panel-header">
        <h2>我的账簿</h2>
        <button
          onClick={onClose}
          className="panel-close"
          aria-label="关闭资产面板"
        >
          ×
        </button>
      </div>

      {/* 现金余额 */}
      <div className="ledger-card">
        <div className="ledger-label">现金余额</div>
        <div className="ledger-number">
          ƒ{player.cash.toLocaleString()}
        </div>
      </div>

      {/* 持仓列表 */}
      <div className="ledger-section">
        <div className="ledger-label">持仓列表</div>
        <div className="holding-list">
          {Object.entries(player.portfolio)
            .filter(([, quantity]) => quantity > 0)
            .map(([assetType, quantity]) => {
              const type = assetType as AssetType;
              const name = ASSET_NAMES[type];
              const price = prices[type];
              const value = price * quantity;

              return (
                <div
                  key={assetType}
                  className="holding-row"
                >
                  <div className="holding-row-top">
                    <span>{name}</span>
                    <span>
                      {quantity} × ƒ{price.toLocaleString()}
                    </span>
                  </div>
                  <div className="holding-value">
                    市值：ƒ{value.toLocaleString()}
                  </div>
                </div>
              );
            })}
          {Object.values(player.portfolio).every(q => q === 0) && (
            <div className="empty-holdings">
              暂无持仓
            </div>
          )}
        </div>
      </div>

      {/* 总资产 */}
      <div
        className={`ledger-total ${
          isAnimating
            ? totalWealth >= initialWealth
              ? 'ledger-total-profit'
              : 'ledger-total-loss'
            : ''
        }`}
      >
        <div className="ledger-label">总资产</div>
        <div className="ledger-total-line">
          <span className={`ledger-total-number ${isAnimating && totalWealth < initialWealth ? 'ledger-negative' : ''}`}>
            ƒ{Math.floor(displayWealth).toLocaleString()}
          </span>
          {!isAnimating && (
            <span className="ledger-delta">
              {totalWealth >= initialWealth ? (
                <span className="price-up">+{((totalWealth - initialWealth) / initialWealth * 100).toFixed(1)}%</span>
              ) : (
                <span className="price-down">{((totalWealth - initialWealth) / initialWealth * 100).toFixed(1)}%</span>
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
