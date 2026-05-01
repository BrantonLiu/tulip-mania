import { useState, useEffect } from 'react';
import { useGameStore, selectItems, selectPrices, selectPlayer } from '../engine/gameState';
import { ASSET_PRESENTATION } from '../engine/assetCatalog';
import { BASE_PRICES } from '../engine/priceEngine';
import { AssetType, ItemType } from '../engine/types';
import { BEER_PRICE } from '../engine/itemEngine';
import { formatBeerPriceForDialogue, formatGuilders } from '../utils/formatters';

const INVENTORY_ITEMS = [
  { type: AssetType.TULIP_SEMPER, name: ASSET_PRESENTATION[AssetType.TULIP_SEMPER].name, image: '/images/semper_augustus.png' },
  { type: AssetType.TULIP_GOUDA, name: ASSET_PRESENTATION[AssetType.TULIP_GOUDA].name, image: '/images/gouda.png' },
  { type: AssetType.TULIP_VICEROY, name: ASSET_PRESENTATION[AssetType.TULIP_VICEROY].name, image: '/images/viceroy.png' },
  { type: AssetType.TULIP_BLACK, name: ASSET_PRESENTATION[AssetType.TULIP_BLACK].name, image: '/images/black_tulip.png' },
  { type: AssetType.ESTATE, name: ASSET_PRESENTATION[AssetType.ESTATE].name, image: '/images/estate.png' },
  { type: AssetType.VOYAGE, name: ASSET_PRESENTATION[AssetType.VOYAGE].name, image: '/images/voyage.png' },
];

const ITEM_META: Record<ItemType, { costLabel: string; image?: string }> = {
  [ItemType.BEER]: {
    costLabel: `入手价 ${formatBeerPriceForDialogue()}（${formatGuilders(BEER_PRICE)}）`,
  },
};

interface InventoryPanelProps {
  onClose: () => void;
}

export function InventoryPanel({ onClose }: InventoryPanelProps) {
  const prices = useGameStore(selectPrices);
  const player = useGameStore(selectPlayer);
  const items = useGameStore(selectItems);
  const [flashMap, setFlashMap] = useState<Record<string, 'up' | 'down' | null>>({});

  // 监听价格变化，触发闪烁效果
  useEffect(() => {
    const flashes: Record<string, 'up' | 'down' | null> = {};
    for (const item of INVENTORY_ITEMS) {
      const qty = player.portfolio[item.type] || 0;
      if (qty > 0) {
        // 简化：根据当前价格与基础价格比较判断涨跌
        flashes[item.type] = prices[item.type] >= BASE_PRICES[item.type] ? 'up' : 'down';
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
      <div className="inventory-section-title">合约持仓</div>
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
                  {formatGuilders(value)}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="inventory-section-title">随身物品</div>
      <div className="inventory-grid">
        {items.map((item) => {
          const meta = ITEM_META[item.type];

          return (
            <div key={item.type} className="inventory-card">
              {meta?.image ? (
                <img src={meta.image} alt={item.name} className="inventory-card-image" />
              ) : (
                <div className="inventory-card-placeholder">{item.icon}</div>
              )}
              <div className="inventory-card-name">{item.name}</div>
              <div className="inventory-card-qty">{item.quantity}</div>
              <div className="inventory-card-value">{meta?.costLabel ?? item.description}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
