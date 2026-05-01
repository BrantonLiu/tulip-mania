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
    <div className="relative w-full h-screen overflow-hidden">
      {/* 酒馆背景 */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/tavern.png')",
        }}
      >
        {/* 暖色调叠加层（烛光效果） */}
        <div className="absolute inset-0 bg-amber-900/30" />
      </div>

      {/* 主内容区域 */}
      <div className="relative z-10 flex flex-col h-full">
        {/* 顶部：天数控制 */}
        <div className="p-4">
          <DayControl />
        </div>

        {/* 中间：左侧对话区 + 右侧信息面板 */}
        <div className="flex-1 flex gap-4 px-4 pb-4 overflow-hidden">
          {/* 左侧对话区（60%） */}
          <div className="w-3/5 flex items-end pb-4">
            {dialogue && currentNPC && (
              <DialogueBox dialogue={dialogue} onChoiceSelect={handleChoiceSelect} />
            )}
          </div>

          {/* 右侧信息面板（40%） */}
          <div className="w-2/5 flex flex-col gap-4">
            {/* 价格看板 */}
            <div className="flex-shrink-0">
              <PriceBoard />
            </div>

            {/* 资产面板按钮 */}
            <div className="flex-1 flex items-end">
              <button
                onClick={() => setShowAssetPanel(!showAssetPanel)}
                className="w-full py-3 bg-amber-900/80 hover:bg-amber-900 text-amber-100 font-bold rounded-lg border-2 border-amber-600 transition-colors"
              >
                {showAssetPanel ? '隐藏资产' : '查看资产'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 交易面板（右侧弹出） */}
      {showTradePanel && <TradePanel onClose={handleCloseTradePanel} />}

      {/* 资产面板（右下角弹出） */}
      {showAssetPanel && <AssetPanel onClose={() => setShowAssetPanel(false)} />}
    </div>
  );
}
