import { useState, useEffect } from 'react';
import { useGameStore } from '../engine/gameState';
import { DialogueBox } from './DialogueBox';
import { PriceBoard } from './PriceBoard';
import { TradePanel } from './TradePanel';
import { AssetPanel } from './AssetPanel';
import { DayControl } from './DayControl';
import { getWelcomeDialogue, triggerNPCDialogue } from '../utils/dialogueLoader';

export function TavernScene() {
  const { currentDay, currentNPC, dialogue, setDialogue, setCurrentNPC, gamePhase } = useGameStore();
  const [showTradePanel, setShowTradePanel] = useState(false);
  const [showAssetPanel, setShowAssetPanel] = useState(false);
  const [hasTriggeredNPCDialogue, setHasTriggeredNPCDialogue] = useState(false);

  // Day 1 触发欢迎对话
  useEffect(() => {
    if (currentDay === 1 && !dialogue && !currentNPC) {
      const { npc, dialogue: welcomeDialogue } = getWelcomeDialogue();
      setCurrentNPC(npc);
      setDialogue(welcomeDialogue);
    }
  }, [currentDay, dialogue, currentNPC, setCurrentNPC, setDialogue]);

  // 每天触发NPC对话（如果没有正在显示的对话）
  useEffect(() => {
    if (currentDay > 1 && !hasTriggeredNPCDialogue && !dialogue && !currentNPC && gamePhase === 'trading') {
      // 延迟2秒后触发NPC对话
      const timer = setTimeout(() => {
        const priceChangePercent = currentDay * 50; // 简化计算
        const { npc, dialogue: npcDialogue } = triggerNPCDialogue(currentDay, priceChangePercent);

        if (npcDialogue) {
          setCurrentNPC(npc);
          setDialogue(npcDialogue);
          setHasTriggeredNPCDialogue(true);
        }
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [currentDay, hasTriggeredNPCDialogue, dialogue, currentNPC, gamePhase, setCurrentNPC, setDialogue]);

  const handleChoiceSelect = (choiceIndex: number) => {
    const choice = dialogue?.choices?.[choiceIndex];

    if (!choice) return;

    if (choice.action === 'trade') {
      // 打开交易面板
      setShowTradePanel(true);
    } else {
      // 关闭对话
      setDialogue(null);
      setCurrentNPC(null);
    }
  };

  const handleCloseTradePanel = () => {
    setShowTradePanel(false);
  };

  return (
    <div className="tavern-scene">
      {/* 酒馆背景 */}
      <div className="tavern-background" />
      <div className="tavern-lighting" />

      {/* 主内容区域 */}
      <div className="tavern-layout">
        {/* 顶部：天数控制 */}
        <div className="day-dock">
          <DayControl />
        </div>

        {/* 价格看板 */}
        <div className="market-dock">
          <PriceBoard />
        </div>

        {/* 对话区 */}
        <div className="dialogue-dock">
          {dialogue && currentNPC && (
            <DialogueBox dialogue={dialogue} onChoiceSelect={handleChoiceSelect} />
          )}
        </div>

        <div className="action-dock">
          <button
            onClick={() => setShowTradePanel(true)}
            className="game-button game-button-primary"
          >
            交易市场
          </button>

          <button
            onClick={() => setShowAssetPanel(!showAssetPanel)}
            className="game-button game-button-secondary"
          >
            {showAssetPanel ? '收起账簿' : '查看账簿'}
          </button>
        </div>
      </div>

      {/* 交易面板（右侧弹出） */}
      {showTradePanel && <TradePanel onClose={handleCloseTradePanel} />}

      {/* 资产面板（右下角弹出） */}
      {showAssetPanel && <AssetPanel onClose={() => setShowAssetPanel(false)} />}
    </div>
  );
}
