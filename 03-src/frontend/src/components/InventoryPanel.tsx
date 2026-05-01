import { useState, useEffect } from 'react';
import { useGameStore, selectPrices, selectPlayer } from '../engine/gameState';
import { AssetType } from '../engine/types';

const INVENTORY_ITEMS = [
  { type: AssetType.TULIP_SEMPER, name: 'Semper Augustus', image: '/images/semper_augustus.png' },
  { type: AssetType.TULIP_GOUDA, name: 'Gouda', image: '/images/gouda.png' },
  { type: AssetType.TULIP_VICEROY, name: 'Viceroy', image: '/images/viceroy.png' },
  { type: AssetType.TULIP_BLACK, name: 'Black Tulip', image: '/images/black_tulip.png' },
  { type: AssetType.ESTATE, name: '房产契约', image: '' },
  { type: AssetType.VOYAGE, name: '航海股份', image: '' },
];

interface InventoryPanelProps {
  onClose: () => void;
}

export function InventoryPanel({ onClose }: InventoryPanelProps) {
  const prices = useGameStore(selectPrices);
  const player = useGameStore(selectPlayer);
  const [flashMap, setFlashMap] = useState<Record<string, 'up' | 'down' | null>>({});

  // 监听价格变化，触发闪烁效果
  useEffect(() => {
    const flashes: Record<string, 'up' | 'down' | null> = {};
    for (const item of INVENTORY_ITEMS) {
      const qty = player.portfolio[item.type] || 0;
      if (qty > 0) {
        // 简化：根据当前价格与基础价格比较判断涨跌
        const basePrices: Record<AssetType, number> = {
          [AssetType.TULIP_SEMPER]: 1000,
          [AssetType.TULIP_GOUDA]: 500,
          [AssetType.TULIP_VICEROY]: 300,
          [AssetType.TULIP_BLACK]: 800,
          [AssetType.ESTATE]: 2000,
          [AssetType.VOYAGE]: 1500,
        };
        flashes[item.type] = prices[item.type] >= basePrices[item.type] ? 'up' : 'down';
      }
    }
    setFlashMap(flashes);
  }, [prices, player.portfolio]);

  return (
    <div className="inventory-panel">
      {/* 标题栏 */}
      <div className="panel-header">
        <h2>物品栏</h2>
        <button onClick={onClose} className="panel-close" aria-label="关闭物品栏">×</button>
      </div>

      {/* 物品卡片网格 */}
      <div className="inventory-grid">
        {INVENTORY_ITEMS.map((item) => {
          const qty = player.portfolio[item.type] || 0;
          const price = prices[item.type] || 0;
          const value = qty * price;
          const flash = flashMap[item.type];

          return (
            <div
              key={item.type}
              className={`inventory-card ${qty > 0 ? '' : 'inventory-card-empty'} ${
                flash === 'up' && qty > 0 ? 'inventory-flash-up' :
                flash === 'down' && qty > 0 ? 'inventory-flash-down' : ''
              }`}
            >
              {item.image ? (
                <img src={item.image} alt={item.name} className="inventory-card-image" />
              ) : (
                <div className="inventory-card-placeholder">
                  {item.type === AssetType.ESTATE ? '🏠' : '⛵'}
                </div>
              )}
              <div className="inventory-card-name">{item.name}</div>
              <div className="inventory-card-qty">{qty}</div>
              {qty > 0 && (
                <div className={`inventory-card-value ${flash === 'up' ? 'price-up' : flash === 'down' ? 'price-down' : ''}`}>
                  ƒ{value.toLocaleString()}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
