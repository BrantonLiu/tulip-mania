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
    <div className="modal-backdrop">
      <div
        className="contract-modal"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23d4a574\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        }}
      >
        {/* 标题 */}
        <div className="contract-title">
          <h3>交易确认</h3>
        </div>

        {/* 羊皮纸内容 */}
        <div className="contract-body">
          {/* 装饰线 */}
          <div className="contract-rule" />

          {/* 合同内容 */}
          <div style={handwritingStyle}>
            <div className="contract-copy">
              <p className="contract-heading">交易合同</p>
              <p>
                本合同确认以下交易事项：
              </p>
            </div>

            <div className="contract-details">
              <div className="contract-grid">
                <div>
                  <span>交易类型：</span>
                  <strong>{tradeAction}</strong>
                </div>
                <div>
                  <span>数量：</span>
                  <strong>{quantity}</strong>
                </div>
                <div className="contract-wide">
                  <span>资产：</span>
                  <strong>{assetName}</strong>
                </div>
                <div className="contract-wide">
                  <span>金额：</span>
                  <strong className="contract-total">
                    ƒ{total.toLocaleString()}
                  </strong>
                </div>
              </div>
            </div>

            <div className="contract-meta">
              <p>日期：{today.toLocaleDateString('zh-CN')}</p>
              <p>地点：阿姆斯特丹酒馆</p>
            </div>

            <div className="contract-rule" />
          </div>

          {/* 按钮区域 */}
          <div className="contract-actions">
            {/* 取消按钮 */}
            <button
              onClick={onCancel}
              className="game-button game-button-muted"
            >
              取消
            </button>

            {/* 确认按钮（印章样式） */}
            <button
              onClick={onConfirm}
              className="game-button seal-button"
            >
              <span>确认</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
