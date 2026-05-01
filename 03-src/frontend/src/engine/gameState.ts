import { create } from 'zustand';
import type {
  GameState,
  TradeResult,
  Ending,
} from './types';
import { AssetType, ItemType } from './types';
import { initializePrices } from './priceEngine';
import { buyAsset, sellAsset, initializePlayer } from './tradingEngine';
import { advanceDay, initializeGameState } from './dayEngine';

// 游戏Store接口（继承GameState并添加Actions）
interface GameStore extends GameState {
  // Actions
  setGamePhase: (phase: GameState['gamePhase']) => void;
  setPrice: (assetType: AssetType, price: number) => void;
  updatePrices: (newPrices: Record<AssetType, number>) => void;
  executeTrade: (
    assetType: AssetType,
    action: 'buy' | 'sell',
    quantity: number
  ) => TradeResult;
  advanceDay: () => GameState;
  selectDialogueChoice: (choiceIndex: number) => void;
  setDialogue: (dialogue: GameState['dialogue']) => void;
  setCurrentNPC: (npc: GameState['currentNPC']) => void;
  setEnding: (ending: Ending) => void;
  resetGame: () => void;
}

// 创建游戏Store
export const useGameStore = create<GameStore>((set, get) => ({
  // 初始状态
  currentDay: 1,
  maxDays: 5,
  prices: initializePrices(),
  priceHistory: Object.fromEntries(
    Object.values(AssetType).map(type => [type, [initializePrices()[type]]])
  ) as Record<AssetType, number[]>,
  player: initializePlayer(500),
  items: [
    {
      type: ItemType.BEER,
      name: '荷兰黑啤',
      quantity: 2,
      icon: '🍺',
      usable: true,
      description: '一杯浓郁的黑啤酒。在酒馆里跟人喝一杯，也许能听到些内幕消息...',
    },
  ],
  currentNPC: null,
  dialogue: null,
  gamePhase: 'intro',
  ending: null,

  // 设置游戏阶段
  setGamePhase: (phase) => set({ gamePhase: phase }),

  // 设置单个资产价格
  setPrice: (assetType, price) =>
    set((state) => ({
      prices: { ...state.prices, [assetType]: price },
    })),

  // 更新所有价格
  updatePrices: (newPrices) => set({ prices: newPrices }),

  // 执行交易
  executeTrade: (assetType, action, quantity) => {
    const state = get();
    const result =
      action === 'buy'
        ? buyAsset(assetType, quantity, state.prices, state.player)
        : sellAsset(assetType, quantity, state.prices, state.player);

    if (result.success) {
      // 只给最新一条记录设置天数，不覆盖历史记录
      const history = result.newPlayerState.tradeHistory;
      const updatedRecord = { ...history[history.length - 1], day: state.currentDay };
      const updatedTradeHistory = [...history.slice(0, -1), updatedRecord];

      set({
        player: {
          ...result.newPlayerState,
          tradeHistory: updatedTradeHistory,
        },
      });
    }

    return result;
  },

  // 推进到下一天
  advanceDay: () => {
    const state = get();
    const newState = advanceDay(state);
    set(newState);
    return newState;
  },

  // 选择对话选项
  selectDialogueChoice: (choiceIndex) => {
    const state = get();
    const choice = state.dialogue?.choices?.[choiceIndex];

    if (!choice) return;

    // 如果选择触发了交易
    if (choice.action === 'trade' && choice.assetType && choice.tradeType) {
      const quantity = 1; // 默认交易1份
      const assetType = choice.assetType as AssetType;
      get().executeTrade(assetType, choice.tradeType, quantity);
    }
  },

  // 设置对话
  setDialogue: (dialogue) => set({ dialogue }),

  // 设置当前NPC
  setCurrentNPC: (npc) => set({ currentNPC: npc }),

  // 设置结局
  setEnding: (ending) => set({ ending }),

  // 重置游戏
  resetGame: () => {
    const initialState = initializeGameState(5);
    set(initialState);
  },
}));

// 辅助函数：获取选择器
export const selectCurrentDay = (state: GameStore) => state.currentDay;
export const selectPrices = (state: GameStore) => state.prices;
export const selectPlayer = (state: GameStore) => state.player;
export const selectGamePhase = (state: GameStore) => state.gamePhase;
export const selectDialogue = (state: GameStore) => state.dialogue;
export const selectCurrentNPC = (state: GameStore) => state.currentNPC;
export const selectEnding = (state: GameStore) => state.ending;
