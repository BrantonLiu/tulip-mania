import { useGameStore, selectCurrentDay } from '../engine/gameState';
import { AssetType } from '../engine/types';
import { ASSET_PRESENTATION, getContractActionLabel } from '../engine/assetCatalog';
import { formatGuilders } from '../utils/formatters';

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
  const currentDay = useGameStore(selectCurrentDay);
  const assetName = ASSET_PRESENTATION[assetType].name;
  const tradeAction = getContractActionLabel(tradeType);
  const contractDay = currentDay + 2;

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
          <h3>远期合约签署</h3>
        </div>

        {/* 羊皮纸内容 */}
        <div className="contract-body">
          {/* 装饰线 */}
          <div className="contract-rule" />

          {/* 合同内容 */}
          <div style={handwritingStyle}>
            <div className="contract-copy">
              <p className="contract-heading">纸面远期合约</p>
              <p>
                冬季球根仍埋于地下，本次成交记为纸面远期合约。
              </p>
            </div>

            <div className="contract-details">
              <div className="contract-grid">
                <div>
                  <span>合约动作：</span>
                  <strong>{tradeAction}</strong>
                </div>
                <div>
                  <span>份数：</span>
                  <strong>{quantity} 份</strong>
                </div>
                <div className="contract-wide">
                  <span>标的：</span>
                  <strong>{assetName}</strong>
                </div>
                <div className="contract-wide">
                  <span>签约金额：</span>
                  <strong className="contract-total">
                    {formatGuilders(total)}
                  </strong>
                </div>
              </div>
            </div>

            <div className="contract-meta">
              <p>签署日期：1637年2月{contractDay}日</p>
              <p>地点：阿姆斯特丹酒馆，烛火旁的账桌</p>
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
              <span>盖蜡封</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
