import { AssetType } from '../engine/types';

const ASSET_NAMES: Record<AssetType, string> = {
  [AssetType.TULIP_SEMPER]: 'Semper Augustus',
  [AssetType.TULIP_GOUDA]: 'Gouda',
  [AssetType.TULIP_VICEROY]: 'Viceroy',
  [AssetType.TULIP_BLACK]: 'Black Tulip',
  [AssetType.ESTATE]: '房产契约',
  [AssetType.VOYAGE]: '航海股份',
};

interface ContractModalProps {
  assetType: AssetType;
  tradeType: 'buy' | 'sell';
  quantity: number;
  total: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ContractModal({
  assetType,
  tradeType,
  quantity,
  total,
  onConfirm,
  onCancel,
}: ContractModalProps) {
  const assetName = ASSET_NAMES[assetType];
  const tradeAction = tradeType === 'buy' ? '买入' : '卖出';
  const today = new Date();

  // 手写体风格
  const handwritingStyle = {
    fontFamily: 'Brush Script MT, cursive',
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div
        className="bg-amber-100 rounded-lg shadow-2xl max-w-md w-full border-4 border-amber-800"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23d4a574\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        }}
      >
        {/* 标题 */}
        <div className="bg-amber-900 text-amber-100 p-3 text-center rounded-t-lg">
          <h3 className="text-xl font-bold">交易确认</h3>
        </div>

        {/* 羊皮纸内容 */}
        <div className="p-6">
          {/* 装饰线 */}
          <div className="border-b-2 border-amber-600 mb-4" />

          {/* 合同内容 */}
          <div style={handwritingStyle}>
            <div className="text-amber-900 mb-6">
              <p className="text-lg mb-2">交易合同</p>
              <p className="text-sm mb-4">
                本合同确认以下交易事项：
              </p>
            </div>

            <div className="bg-amber-50 p-4 rounded border-2 border-amber-300 mb-6">
              <div className="grid grid-cols-2 gap-3 text-amber-900">
                <div>
                  <span className="text-sm text-amber-700">交易类型：</span>
                  <span className="font-bold">{tradeAction}</span>
                </div>
                <div>
                  <span className="text-sm text-amber-700">数量：</span>
                  <span className="font-bold">{quantity}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-sm text-amber-700">资产：</span>
                  <span className="font-bold">{assetName}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-sm text-amber-700">金额：</span>
                  <span className="text-xl font-bold text-red-700">
                    ƒ{total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-sm text-amber-700 mb-4">
              <p>日期：{today.toLocaleDateString('zh-CN')}</p>
              <p>地点：阿姆斯特丹酒馆</p>
            </div>

            <div className="border-b-2 border-amber-600 mb-4" />
          </div>

          {/* 按钮区域 */}
          <div className="flex gap-4">
            {/* 取消按钮 */}
            <button
              onClick={onCancel}
              className="flex-1 py-3 px-4 rounded-lg font-bold text-lg transition-all bg-gray-500 hover:bg-gray-400 text-white"
            >
              取消
            </button>

            {/* 确认按钮（印章样式） */}
            <button
              onClick={onConfirm}
              className="flex-1 py-3 px-4 rounded-lg font-bold text-lg transition-all bg-red-800 hover:bg-red-700 text-white relative overflow-hidden"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border-4 border-red-500/50 flex items-center justify-center">
                  <span className="text-2xl">🔴</span>
                </div>
              </div>
              <span className="relative z-10">确认</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
