// @vitest-environment happy-dom

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TavernScene } from '../TavernScene';
import { useGameStore } from '../../engine/gameState';
import { NPC_DATA } from '../../engine/dialogueEngine';
import { BEER_PRICE } from '../../engine/itemEngine';
import { ItemType, NPCType } from '../../engine/types';

const getWelcomeDialogueMock = vi.fn();
const triggerNPCDialogueMock = vi.fn();
const getNextDialogueNodeMock = vi.fn();

vi.mock('../DialogueBox', () => ({
  DialogueBox: ({ dialogue, onChoiceSelect }: { dialogue: { choices?: Array<{ text: string }> }, onChoiceSelect: (index: number) => void }) => (
    <div>
      {dialogue.choices?.map((choice, index) => (
        <button
          key={`${choice.text}-${index}`}
          data-testid={`mock-choice-${index}`}
          onClick={() => onChoiceSelect(index)}
        >
          {choice.text}
        </button>
      ))}
    </div>
  ),
}));

vi.mock('../PriceBoard', () => ({ PriceBoard: () => <div /> }));
vi.mock('../TradePanel', () => ({ TradePanel: () => <div /> }));
vi.mock('../DayControl', () => ({ DayControl: () => <div /> }));
vi.mock('../NPCList', () => ({ NPCList: () => <div /> }));
vi.mock('../LedgerPanel', () => ({ LedgerPanel: () => <div /> }));
vi.mock('../InventoryPanel', () => ({ InventoryPanel: () => <div /> }));
vi.mock('../../utils/dialogueLoader', () => ({
  getWelcomeDialogue: (...args: unknown[]) => getWelcomeDialogueMock(...args),
  triggerNPCDialogue: (...args: unknown[]) => triggerNPCDialogueMock(...args),
  getNextDialogueNode: (...args: unknown[]) => getNextDialogueNodeMock(...args),
}));

describe('TavernScene', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.useFakeTimers();
    useGameStore.getState().resetGame();
    useGameStore.setState({
      currentDay: 1,
      gamePhase: 'trading',
      currentNPC: null,
      dialogue: null,
      ending: null,
    });

    getWelcomeDialogueMock.mockReset();
    triggerNPCDialogueMock.mockReset();
    getNextDialogueNodeMock.mockReset();

    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('should auto-show Maria welcome dialogue only on the first tavern entry', () => {
    const welcomeDialogue = {
      npcId: NPCType.MARIA_HOST,
      text: '欢迎来到酒馆',
      mood: 'calm' as const,
      choices: [{ text: '继续', action: 'dismiss' as const }],
    };
    getWelcomeDialogueMock.mockReturnValue({
      npc: NPC_DATA[NPCType.MARIA_HOST],
      dialogue: welcomeDialogue,
    });

    act(() => {
      root.render(<TavernScene />);
    });

    expect(getWelcomeDialogueMock).toHaveBeenCalledWith(
      NPCType.MARIA_HOST,
      1,
      'calm',
      expect.any(Object)
    );
    expect(useGameStore.getState().dialogue?.text).toBe('欢迎来到酒馆');
    expect(useGameStore.getState().currentNPC?.id).toBe(NPCType.MARIA_HOST);
  });

  it('should not auto-trigger any NPC dialogue on later trading days', () => {
    useGameStore.setState({
      currentDay: 2,
      gamePhase: 'trading',
      currentNPC: null,
      dialogue: null,
    });

    act(() => {
      root.render(<TavernScene />);
    });

    act(() => {
      vi.advanceTimersByTime(2500);
    });

    expect(triggerNPCDialogueMock).not.toHaveBeenCalled();
    expect(useGameStore.getState().dialogue).toBeNull();
    expect(useGameStore.getState().currentNPC).toBeNull();
  });

  it('should charge 2 guilders and add one beer when the Maria beer option is selected', () => {
    const initialCash = useGameStore.getState().player.cash;
    const initialBeerCount = useGameStore.getState().items.find((item) => item.type === ItemType.BEER)?.quantity ?? 0;

    getNextDialogueNodeMock.mockReturnValue({
      npcId: NPCType.MARIA_HOST,
      text: '这才像话。',
      mood: 'calm',
      currentNodeId: 'm1_3',
      choices: [{ text: '哈哈', action: 'dismiss' }],
    });

    useGameStore.setState({
      currentDay: 1,
      gamePhase: 'trading',
      currentNPC: NPC_DATA[NPCType.MARIA_HOST],
      dialogue: {
        npcId: NPCType.MARIA_HOST,
        text: '要来一杯吗？',
        mood: 'calm',
        currentNodeId: 'm1_1',
        choices: [
          {
            text: '来杯啤酒吧',
            action: 'buy_item',
            itemType: ItemType.BEER,
            itemPrice: BEER_PRICE,
            nextId: 'm1_3',
          },
        ],
      },
    });

    act(() => {
      root.render(<TavernScene />);
    });

    const choiceButton = container.querySelector('[data-testid="mock-choice-0"]');
    expect(choiceButton).not.toBeNull();

    act(() => {
      choiceButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    const state = useGameStore.getState();
    expect(state.player.cash).toBe(initialCash - BEER_PRICE);
    expect(state.items.find((item) => item.type === ItemType.BEER)?.quantity).toBe(initialBeerCount + 1);
    expect(state.dialogue?.text).toBe('这才像话。');
  });
});
