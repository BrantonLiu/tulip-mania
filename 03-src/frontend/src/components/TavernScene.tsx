import { useState, useEffect } from 'react';
import { useGameStore } from '../engine/gameState';
import { DialogueBox } from './DialogueBox';
import { PriceBoard } from './PriceBoard';
import { TradePanel } from './TradePanel';
import { DayControl } from './DayControl';
import { NPCList } from './NPCList';
import { LedgerPanel } from './LedgerPanel';
import { InventoryPanel } from './InventoryPanel';
import { getWelcomeDialogue, triggerNPCDialogue } from '../utils/dialogueLoader';

type ActivePanel = 'trade' | 'ledger' | 'inventory' | null;

export function TavernScene() {
  const { currentDay, currentNPC, dialogue, setDialogue, setCurrentNPC, gamePhase, selectDialogueChoice } = useGameStore();
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
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

  // 天数变化时重置面板状态
  useEffect(() => {
    setHasTriggeredNPCDialogue(false);
    setActivePanel(null);
  }, [currentDay]);

  const handleChoiceSelect = (choiceIndex: number) => {
    const choice = dialogue?.choices?.[choiceIndex];

    if (!choice) return;

    if (choice.action === 'trade' && choice.assetType && choice.tradeType) {
      // 对话中的交易选项：直接执行交易
      selectDialogueChoice(choiceIndex);
      setDialogue(null);
      setCurrentNPC(null);
    } else if (choice.action === 'trade') {
      // 通用交易选项：打开交易面板
      setActivePanel('trade');
      setDialogue(null);
      setCurrentNPC(null);
    } else {
      setDialogue(null);
      setCurrentNPC(null);
    }
  };

  const handleTabClick = (panel: 'trade' | 'ledger' | 'inventory') => {
    setActivePanel((prev) => prev === panel ? null : panel);
  };

  const handlePanelClose = () => {
    setActivePanel(null);
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

        {/* 左侧：NPC列表 */}
        <div className="npc-list-dock">
          <NPCList />
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

        {/* 底部互斥按钮栏 */}
        <div className="bottom-tab-bar">
          <button
            onClick={() => handleTabClick('trade')}
            className={activePanel === 'trade' ? 'active-tab' : ''}
          >
            交易市场
          </button>
          <button
            onClick={() => handleTabClick('ledger')}
            className={activePanel === 'ledger' ? 'active-tab' : ''}
          >
            我的账簿
          </button>
          <button
            onClick={() => handleTabClick('inventory')}
            className={activePanel === 'inventory' ? 'active-tab' : ''}
          >
            物品栏
          </button>
        </div>
      </div>

      {/* 面板内容 */}
      {activePanel === 'trade' && <TradePanel onClose={handlePanelClose} />}
      {activePanel === 'ledger' && <LedgerPanel onClose={handlePanelClose} />}
      {activePanel === 'inventory' && <InventoryPanel onClose={handlePanelClose} />}
    </div>
  );
}
