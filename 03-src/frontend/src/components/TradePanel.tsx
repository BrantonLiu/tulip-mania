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
      <div className="fixed right-0 top-1/2 -translate-y-1/2 w-96 max-h-[80vh] bg-amber-900/95 rounded-l-lg border-l-4 border-amber-600 shadow-2xl p-4 overflow-y-auto">
        {/* 标题栏 */}
        <div className="flex justify-between items-center mb-4 pb-3 border-b-2 border-amber-700">
          <h2 className="text-xl font-bold text-amber-100">交易市场</h2>
          <button
            onClick={onClose}
            className="text-amber-300 hover:text-amber-100 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* 郁金香品种卡片 */}
        <div className="grid grid-cols-2 gap-3">
          {tulipAssets.map((assetType) => {
            const info = ASSET_INFO[assetType];
            const price = prices[assetType];

            return (
              <button
                key={assetType}
                onClick={() => handleAssetClick(assetType)}
                className="bg-amber-800/50 hover:bg-amber-800 p-3 rounded-lg border-2 border-amber-600 transition-all hover:scale-105"
              >
                {info.image && (
                  <img
                    src={`/images/${info.image}`}
                    alt={info.name}
                    className="w-16 h-16 mx-auto object-cover rounded mb-2"
                  />
                )}
                <div className="text-white font-bold text-sm">{info.name}</div>
                <div className="text-amber-300 text-xs">ƒ{price.toLocaleString()}</div>
              </button>
            );
          })}
        </div>

        {/* 其他资产入口 */}
        <div className="mt-4 space-y-2">
          <button
            onClick={() => handleAssetClick(AssetType.ESTATE)}
            className="w-full bg-blue-900/50 hover:bg-blue-900 p-3 rounded-lg border-2 border-blue-600 text-left"
          >
            <div className="text-white font-bold">房产契约</div>
            <div className="text-blue-300 text-xs">稳定的资产</div>
          </button>
          <button
            onClick={() => handleAssetClick(AssetType.VOYAGE)}
            className="w-full bg-cyan-900/50 hover:bg-cyan-900 p-3 rounded-lg border-2 border-cyan-600 text-left"
          >
            <div className="text-white font-bold">航海股份</div>
            <div className="text-cyan-300 text-xs">高风险高回报</div>
          </button>
        </div>
      </div>
    );
  }

  const assetInfo = ASSET_INFO[selectedAsset];
  const totalPrice = calculateTotal();

  return (
    <>
      <div className="fixed right-0 top-1/2 -translate-y-1/2 w-96 max-h-[80vh] bg-amber-900/95 rounded-l-lg border-l-4 border-amber-600 shadow-2xl p-4 overflow-y-auto">
        {/* 标题栏 */}
        <div className="flex justify-between items-center mb-4 pb-3 border-b-2 border-amber-700">
          <button
            onClick={() => setSelectedAsset(null)}
            className="text-amber-300 hover:text-amber-100 text-xl"
          >
            ←
          </button>
          <h2 className="text-xl font-bold text-amber-100">{assetInfo.name}</h2>
          <button
            onClick={onClose}
            className="text-amber-300 hover:text-amber-100 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* 交易类型切换 */}
        <div className="flex mb-4 bg-amber-800/50 rounded-lg p-1">
          <button
            onClick={() => { setTradeType('buy'); setQuantity(1); }}
            className={`flex-1 py-2 px-4 rounded-md font-bold transition-colors ${
              tradeType === 'buy'
                ? 'bg-green-700 text-white'
                : 'text-amber-200 hover:bg-amber-700/50'
            }`}
          >
            买入
          </button>
          <button
            onClick={() => { setTradeType('sell'); setQuantity(1); }}
            className={`flex-1 py-2 px-4 rounded-md font-bold transition-colors ${
              tradeType === 'sell'
                ? 'bg-red-700 text-white'
                : 'text-amber-200 hover:bg-amber-700/50'
            }`}
          >
            卖出
          </button>
        </div>

        {/* 资产图片 */}
        {assetInfo.image && (
          <img
            src={`/images/${assetInfo.image}`}
            alt={assetInfo.name}
            className="w-full h-40 object-contain bg-amber-800/30 rounded-lg mb-4"
          />
        )}

        {/* 当前价格 */}
        <div className="bg-amber-800/50 p-3 rounded-lg mb-4">
          <div className="text-amber-300 text-sm mb-1">当前价格</div>
          <div className="text-2xl font-bold text-white">ƒ{prices[selectedAsset].toLocaleString()}</div>
        </div>

        {/* 数量选择 */}
        <div className="mb-4">
          <div className="text-amber-300 text-sm mb-2">数量</div>
          <div className="flex gap-2">
            {[1, 5, 10].map((qty) => (
              <button
                key={qty}
                onClick={() => handleQuantityChange(qty)}
                className={`flex-1 py-2 px-3 rounded border-2 transition-colors ${
                  quantity === qty
                    ? 'bg-amber-600 text-white border-amber-400'
                    : 'bg-amber-800/50 text-amber-200 border-amber-700 hover:bg-amber-700'
                }`}
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
              className="flex-1 py-2 px-3 rounded border-2 bg-amber-800/50 text-amber-200 border-amber-700 hover:bg-amber-700"
            >
              全部
            </button>
          </div>
        </div>

        {/* 预计花费/收益 */}
        <div className="bg-amber-800/50 p-3 rounded-lg mb-4">
          <div className="text-amber-300 text-sm mb-1">
            {tradeType === 'buy' ? '预计花费' : '预计收益'}
          </div>
          <div className={`text-2xl font-bold ${tradeType === 'buy' ? 'text-red-400' : 'text-green-400'}`}>
            ƒ{totalPrice.toLocaleString()}
          </div>
          {tradeType === 'buy' && (
            <div className="text-amber-400 text-xs mt-1">
              余额：ƒ{player.cash.toLocaleString()}
            </div>
          )}
          {tradeType === 'sell' && (
            <div className="text-amber-400 text-xs mt-1">
              持仓：{player.portfolio[selectedAsset] || 0}
            </div>
          )}
        </div>

        {/* 确认按钮 */}
        <button
          onClick={handleTrade}
          disabled={tradeType === 'buy' && totalPrice > player.cash}
          className={`w-full py-3 rounded-lg font-bold text-lg transition-all ${
            tradeType === 'buy' && totalPrice > player.cash
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-amber-600 hover:bg-amber-500 text-white hover:scale-105'
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
