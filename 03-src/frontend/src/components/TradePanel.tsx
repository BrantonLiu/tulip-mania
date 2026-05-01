import { useState } from 'react';
import { useGameStore, selectPrices, selectPlayer } from '../engine/gameState';
import { AssetType } from '../engine/types';
import { ContractModal } from './ContractModal';

const ASSET_INFO: Record<AssetType, { name: string; image: string; category: string }> = {
  [AssetType.TULIP_SEMPER]: { name: 'Semper Augustus', image: 'semper_augustus.png', category: '郁金香' },
  [AssetType.TULIP_GOUDA]: { name: 'Gouda', image: 'gouda.png', category: '郁金香' },
  [AssetType.TULIP_VICEROY]: { name: 'Viceroy', image: 'viceroy.png', category: '郁金香' },
  [AssetType.TULIP_BLACK]: { name: 'Black Tulip', image: 'black_tulip.png', category: '郁金香' },
  [AssetType.ESTATE]: { name: '房产契约', image: '', category: '房产' },
  [AssetType.VOYAGE]: { name: '航海股份', image: '', category: '投资' },
};

interface TradePanelProps {
  onClose: () => void;
}

export function TradePanel({ onClose }: TradePanelProps) {
  const prices = useGameStore(selectPrices);
  const player = useGameStore(selectPlayer);
  const { executeTrade } = useGameStore();

  const [selectedAsset, setSelectedAsset] = useState<AssetType | null>(null);
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState(1);
  const [showContractModal, setShowContractModal] = useState(false);

  // 郁金香资产列表
  const tulipAssets: AssetType[] = [
    AssetType.TULIP_SEMPER,
    AssetType.TULIP_GOUDA,
    AssetType.TULIP_VICEROY,
    AssetType.TULIP_BLACK,
  ];

  const handleAssetClick = (assetType: AssetType) => {
    setSelectedAsset(assetType);
  };

  const handleQuantityChange = (newQuantity: number) => {
    const maxQuantity = tradeType === 'buy'
      ? Math.floor(player.cash / (prices[selectedAsset!] || 0))
      : player.portfolio[selectedAsset!] || 0;
    setQuantity(Math.max(1, Math.min(newQuantity, maxQuantity)));
  };

  const handleTrade = () => {
    if (!selectedAsset) return;
    setShowContractModal(true);
  };

  const handleContractConfirm = () => {
    if (!selectedAsset) return;

    const result = executeTrade(selectedAsset, tradeType, quantity);
    if (result.success) {
      setShowContractModal(false);
      onClose();
    }
  };

  const calculateTotal = () => {
    if (!selectedAsset) return 0;
    return prices[selectedAsset] * quantity;
  };

  if (!selectedAsset) {
    return (
      <div className="trade-panel">
        {/* 标题栏 */}
        <div className="panel-header">
          <h2>交易市场</h2>
          <button
            onClick={onClose}
            className="panel-close"
            aria-label="关闭交易面板"
          >
            ×
          </button>
        </div>

        {/* 郁金香品种卡片 */}
        <div className="trade-asset-grid">
          {tulipAssets.map((assetType) => {
            const info = ASSET_INFO[assetType];
            const price = prices[assetType];

            return (
              <button
                key={assetType}
                onClick={() => handleAssetClick(assetType)}
                className="trade-asset-card"
              >
                {info.image && (
                  <img
                    src={`/images/${info.image}`}
                    alt={info.name}
                    className="trade-asset-image"
                  />
                )}
                <div className="trade-asset-name">{info.name}</div>
                <div className="trade-asset-price">ƒ{price.toLocaleString()}</div>
              </button>
            );
          })}
        </div>

        {/* 其他资产入口 */}
        <div className="trade-alt-list">
          <button
            onClick={() => handleAssetClick(AssetType.ESTATE)}
            className="trade-alt-asset estate"
          >
            <div>房产契约</div>
            <span>稳定的资产</span>
          </button>
          <button
            onClick={() => handleAssetClick(AssetType.VOYAGE)}
            className="trade-alt-asset voyage"
          >
            <div>航海股份</div>
            <span>高风险高回报</span>
          </button>
        </div>
      </div>
    );
  }

  const assetInfo = ASSET_INFO[selectedAsset];
  const totalPrice = calculateTotal();

  return (
    <>
      <div className="trade-panel">
        {/* 标题栏 */}
        <div className="panel-header">
          <button
            onClick={() => setSelectedAsset(null)}
            className="panel-back"
            aria-label="返回交易市场"
          >
            ←
          </button>
          <h2>{assetInfo.name}</h2>
          <button
            onClick={onClose}
            className="panel-close"
            aria-label="关闭交易面板"
          >
            ×
          </button>
        </div>

        {/* 交易类型切换 */}
        <div className="trade-tabs">
          <button
            onClick={() => { setTradeType('buy'); setQuantity(1); }}
            className={tradeType === 'buy' ? 'active buy' : ''}
          >
            买入
          </button>
          <button
            onClick={() => { setTradeType('sell'); setQuantity(1); }}
            className={tradeType === 'sell' ? 'active sell' : ''}
          >
            卖出
          </button>
        </div>

        {/* 资产图片 */}
        {assetInfo.image && (
          <figure className="trade-asset-showcase">
            <img
              src={`/images/${assetInfo.image}`}
              alt={assetInfo.name}
              className="trade-detail-image"
            />
            <figcaption>
              <span>{assetInfo.category}</span>
              <strong>{assetInfo.name}</strong>
            </figcaption>
          </figure>
        )}

        {/* 当前价格 */}
        <div className="trade-stat trade-price-slate">
          <div className="ledger-label">当前价格</div>
          <div className="ledger-number">ƒ{prices[selectedAsset].toLocaleString()}</div>
        </div>

        {/* 数量选择 */}
        <div className="trade-quantity">
          <div className="ledger-label">数量</div>
          <div className="quantity-options">
            {[1, 5, 10].map((qty) => (
              <button
                key={qty}
                onClick={() => handleQuantityChange(qty)}
                className={quantity === qty ? 'active' : ''}
              >
                {qty}
              </button>
            ))}
            <button
              onClick={() => {
                const maxQty = tradeType === 'buy'
                  ? Math.floor(player.cash / prices[selectedAsset])
                  : player.portfolio[selectedAsset] || 0;
                handleQuantityChange(maxQty);
              }}
            >
              全部
            </button>
          </div>
        </div>

        {/* 预计花费/收益 */}
        <div className="trade-stat trade-price-slate">
          <div className="ledger-label">
            {tradeType === 'buy' ? '预计花费' : '预计收益'}
          </div>
          <div className={`ledger-number ${tradeType === 'buy' ? 'price-down' : 'price-up'}`}>
            ƒ{totalPrice.toLocaleString()}
          </div>
          {tradeType === 'buy' && (
            <div className="trade-help">
              余额：ƒ{player.cash.toLocaleString()}
            </div>
          )}
          {tradeType === 'sell' && (
            <div className="trade-help">
              持仓：{player.portfolio[selectedAsset] || 0}
            </div>
          )}
        </div>

        {/* 确认按钮 */}
        <button
          onClick={handleTrade}
          disabled={tradeType === 'buy' && totalPrice > player.cash}
          className="game-button game-button-primary trade-submit"
        >
          {tradeType === 'buy' ? '确认买入' : '确认卖出'}
        </button>
      </div>

      {/* 合同确认弹窗 */}
      {showContractModal && selectedAsset && (
        <ContractModal
          assetType={selectedAsset}
          tradeType={tradeType}
          quantity={quantity}
          total={totalPrice}
          onConfirm={handleContractConfirm}
          onCancel={() => setShowContractModal(false)}
        />
      )}
    </>
  );
}
