import { useState, useMemo } from 'react';
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

  // 卖出模式下，只显示有持仓的资产
  const sellableAssets = useMemo(() => {
    return [...tulipAssets, AssetType.ESTATE, AssetType.VOYAGE].filter(
      (type) => (player.portfolio[type] || 0) > 0
    );
  }, [player.portfolio]);

  const handleAssetClick = (assetType: AssetType) => {
    setSelectedAsset(assetType);
    setQuantity(1);
  };

  const handleTradeTypeChange = (type: 'buy' | 'sell') => {
    setTradeType(type);
    setQuantity(1);
    // 切换到卖出时，如果当前选中资产无持仓，取消选中
    if (type === 'sell' && selectedAsset && (player.portfolio[selectedAsset] || 0) === 0) {
      setSelectedAsset(null);
    }
  };

  // 获取最大可操作数量
  const getMaxQuantity = (assetType: AssetType): number => {
    if (tradeType === 'buy') {
      return Math.floor(player.cash / (prices[assetType] || 1));
    }
    return player.portfolio[assetType] || 0;
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (!selectedAsset) return;
    const maxQty = getMaxQuantity(selectedAsset);
    setQuantity(Math.max(1, Math.min(newQuantity, maxQty)));
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

  // ─── 资产选择视图 ───
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

        {/* 买入/卖出切换标签 */}
        <div className="trade-tabs">
          <button
            onClick={() => handleTradeTypeChange('buy')}
            className={tradeType === 'buy' ? 'active buy' : ''}
          >
            买入
          </button>
          <button
            onClick={() => handleTradeTypeChange('sell')}
            className={tradeType === 'sell' ? 'active sell' : ''}
          >
            卖出
          </button>
        </div>

        {tradeType === 'buy' ? (
          <>
            {/* 郁金香品种卡片 */}
            <div className="trade-asset-grid">
              {tulipAssets.map((assetType) => {
                const info = ASSET_INFO[assetType];
                const price = prices[assetType];
                const canAfford = player.cash >= price;

                return (
                  <button
                    key={assetType}
                    onClick={() => handleAssetClick(assetType)}
                    className={`trade-asset-card ${!canAfford ? 'trade-card-disabled' : ''}`}
                    disabled={!canAfford}
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
                className={`trade-alt-asset estate ${player.cash < prices[AssetType.ESTATE] ? 'trade-card-disabled' : ''}`}
                disabled={player.cash < prices[AssetType.ESTATE]}
              >
                <div>房产契约</div>
                <span>ƒ{prices[AssetType.ESTATE].toLocaleString()}</span>
              </button>
              <button
                onClick={() => handleAssetClick(AssetType.VOYAGE)}
                className={`trade-alt-asset voyage ${player.cash < prices[AssetType.VOYAGE] ? 'trade-card-disabled' : ''}`}
                disabled={player.cash < prices[AssetType.VOYAGE]}
              >
                <div>航海股份</div>
                <span>ƒ{prices[AssetType.VOYAGE].toLocaleString()}</span>
              </button>
            </div>
          </>
        ) : (
          <>
            {/* 卖出模式：只显示有持仓的资产 */}
            {sellableAssets.length > 0 ? (
              <div className="trade-alt-list">
                {sellableAssets.map((assetType) => {
                  const info = ASSET_INFO[assetType];
                  const holding = player.portfolio[assetType] || 0;
                  const price = prices[assetType];

                  return (
                    <button
                      key={assetType}
                      onClick={() => handleAssetClick(assetType)}
                      className={`trade-alt-asset ${assetType === AssetType.ESTATE ? 'estate' : assetType === AssetType.VOYAGE ? 'voyage' : ''}`}
                    >
                      <div>{info.name}</div>
                      <span>持仓 {holding}份 · ƒ{price.toLocaleString()}/份</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="empty-holdings">暂无可卖出的资产</div>
            )}
          </>
        )}
      </div>
    );
  }

  // ─── 交易详情视图 ───
  const assetInfo = ASSET_INFO[selectedAsset];
  const totalPrice = calculateTotal();
  const holding = player.portfolio[selectedAsset] || 0;

  // 买入模式数量选项及禁用判断
  const buyQtyOptions = [1, 5, 10];
  const maxBuyQty = Math.floor(player.cash / prices[selectedAsset]);

  // 卖出模式数量选项及禁用判断
  const sellQtyOptions = [1, 5];

  const isDisabled = tradeType === 'buy'
    ? totalPrice > player.cash || maxBuyQty === 0
    : quantity > holding;

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
            onClick={() => handleTradeTypeChange('buy')}
            className={tradeType === 'buy' ? 'active buy' : ''}
          >
            买入
          </button>
          <button
            onClick={() => handleTradeTypeChange('sell')}
            className={tradeType === 'sell' ? 'active sell' : ''}
            disabled={holding === 0}
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
            {tradeType === 'buy' ? (
              <>
                {buyQtyOptions.map((qty) => {
                  const cantAfford = qty * prices[selectedAsset] > player.cash;
                  return (
                    <button
                      key={qty}
                      onClick={() => !cantAfford && handleQuantityChange(qty)}
                      className={`${quantity === qty ? 'active' : ''} ${cantAfford ? 'qty-disabled' : ''}`}
                      disabled={cantAfford}
                    >
                      {qty}
                    </button>
                  );
                })}
                <button
                  onClick={() => handleQuantityChange(maxBuyQty)}
                  className={quantity === maxBuyQty ? 'active' : ''}
                  disabled={maxBuyQty === 0}
                >
                  全仓
                </button>
              </>
            ) : (
              <>
                {sellQtyOptions.map((qty) => {
                  const exceedsHolding = qty > holding;
                  return (
                    <button
                      key={qty}
                      onClick={() => !exceedsHolding && handleQuantityChange(qty)}
                      className={`${quantity === qty ? 'active' : ''} ${exceedsHolding ? 'qty-disabled' : ''}`}
                      disabled={exceedsHolding}
                    >
                      {qty}
                    </button>
                  );
                })}
                <button
                  onClick={() => handleQuantityChange(holding)}
                  className={quantity === holding ? 'active' : ''}
                >
                  全部
                </button>
              </>
            )}
          </div>
        </div>

        {/* 预计花费/收益 + 剩余现金/卖出后现金 */}
        <div className="trade-stat trade-price-slate">
          <div className="ledger-label">
            {tradeType === 'buy' ? '预计花费' : '预计收入'}
          </div>
          <div className={`ledger-number ${tradeType === 'buy' ? 'price-down' : 'price-up'}`}>
            ƒ{totalPrice.toLocaleString()}
          </div>
          <div className="trade-help">
            {tradeType === 'buy' ? (
              <>剩余现金：ƒ{(player.cash - totalPrice).toLocaleString()}</>
            ) : (
              <>卖出后现金：ƒ{(player.cash + totalPrice).toLocaleString()}</>
            )}
          </div>
        </div>

        {/* 确认按钮 */}
        <button
          onClick={handleTrade}
          disabled={isDisabled}
          className={`game-button trade-submit ${
            tradeType === 'buy' ? 'game-button-primary' : 'game-button-sell'
          }`}
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
