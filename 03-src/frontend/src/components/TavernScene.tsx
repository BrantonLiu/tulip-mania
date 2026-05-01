import { useState, useEffect } from 'react';
import { useGameStore, selectPrices } from '../engine/gameState';
import { NPCType } from '../engine/types';
import { DialogueBox } from './DialogueBox';
import { PriceBoard } from './PriceBoard';
import { TradePanel } from './TradePanel';
import { DayControl } from './DayControl';
import { NPCList } from './NPCList';
import { LedgerPanel } from './LedgerPanel';
import { InventoryPanel } from './InventoryPanel';
import { getWelcomeDialogue, getNextDialogueNode } from '../utils/dialogueLoader';

type ActivePanel = 'trade' | 'ledger' | 'inventory' | null;

export function TavernScene() {
  const { currentDay, currentNPC, dialogue, setDialogue, setCurrentNPC, selectDialogueChoice, purchaseItem } = useGameStore();
  const prices = useGameStore(selectPrices);
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const [visitedChoices, setVisitedChoices] = useState<Set<string>>(new Set());

  // Day 1 触发欢迎对话
  useEffect(() => {
    if (currentDay === 1 && !dialogue && !currentNPC) {
      const priceMap = prices as unknown as Record<string, number>;
      const { npc, dialogue: welcomeDialogue } = getWelcomeDialogue(NPCType.MARIA_HOST, 1, 'calm', priceMap);
      if (welcomeDialogue) {
        setCurrentNPC(npc);
        setDialogue(welcomeDialogue);
      }
    }
  }, [currentDay, dialogue, currentNPC, setCurrentNPC, setDialogue, prices]);

  // 天数变化时重置面板状态
  useEffect(() => {
    setActivePanel(null);
    setVisitedChoices(new Set());
  }, [currentDay]);

  const handleChoiceSelect = (choiceIndex: number) => {
    const choice = dialogue?.choices?.[choiceIndex];

    if (!choice) return;

    // 记录已点击的选项
    const choiceKey = `${dialogue?.currentNodeId || 'unknown'}-${choiceIndex}`;
    setVisitedChoices((prev) => new Set(prev).add(choiceKey));

    if (choice.action === 'buy_item' && choice.itemType) {
      const purchaseSucceeded = purchaseItem(
        choice.itemType,
        choice.itemQuantity ?? 1,
        choice.itemPrice
      );

      if (!purchaseSucceeded) {
        return;
      }
    }

    // 如果选择有nextId，导航到下一个对话节点
    if (choice.nextId && currentNPC) {
      const priceMap = prices as unknown as Record<string, number>;
      const nextDialogue = getNextDialogueNode(
        currentNPC.id,
        currentDay,
        dialogue,
        choice.nextId,
        priceMap
      );
      if (nextDialogue) {
        setDialogue(nextDialogue);
        return;
      }
    }

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
      // dismiss 或其他动作：关闭对话，不自动跳转
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
            <DialogueBox
              dialogue={dialogue}
              onChoiceSelect={handleChoiceSelect}
              visitedChoices={visitedChoices}
            />
          )}
        </div>

        {/* 底部互斥按钮栏 */}
        <div className="bottom-tab-bar">
          <button
            onClick={() => handleTabClick('trade')}
            className={activePanel === 'trade' ? 'active-tab' : ''}
          >
            合约市场
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
