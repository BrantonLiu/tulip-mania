import { NPCType } from '../engine/types';
import type { Dialogue, NPCMood, NPCDialogueData, DialogueNode } from '../engine/types';
import { AssetType } from '../engine/types';
import { BASE_PRICES } from '../engine/priceEngine';
import { NPC_DATA } from '../engine/dialogueEngine';
import { formatBeerPriceForDialogue, formatGuilders } from './formatters';

// 对话数据缓存
let dialogueCache: Record<NPCType, NPCDialogueData | null> = {
  [NPCType.CORNELIS]: null,
  [NPCType.ANNA]: null,
  [NPCType.HENDRIK]: null,
  [NPCType.MARIA_HOST]: null,
  [NPCType.STRANGER]: null,
};

// 加载状态
let loadPromise: Promise<void> | null = null;

// NPC ID到文件名的映射
const NPC_FILE_MAP: Record<NPCType, string> = {
  [NPCType.CORNELIS]: 'cornelis',
  [NPCType.ANNA]: 'anna',
  [NPCType.HENDRIK]: 'hendrik',
  [NPCType.MARIA_HOST]: 'maria_host',
  [NPCType.STRANGER]: 'stranger',
};

// 从JSON文件加载单个NPC的对话数据
async function loadNPCDialogue(npcType: NPCType): Promise<NPCDialogueData | null> {
  try {
    const fileName = NPC_FILE_MAP[npcType];
    const response = await fetch(`/data/dialogues/${fileName}.json`);
    if (!response.ok) {
      console.warn(`Failed to load dialogue for ${npcType}: ${response.statusText}`);
      return null;
    }
    const data = await response.json();
    return data as NPCDialogueData;
  } catch (error) {
    console.warn(`Error loading dialogue for ${npcType}:`, error);
    return null;
  }
}

// 预加载所有对话数据
export async function preloadAllDialogues(): Promise<void> {
  if (loadPromise) return loadPromise;

  const load = async () => {
    const promises = Object.values(NPCType).map((npcType) =>
      loadNPCDialogue(npcType).then((data) => {
        dialogueCache[npcType] = data;
      })
    );
    await Promise.all(promises);
  };

  loadPromise = load();
  return loadPromise;
}

// 获取单个NPC的对话数据（如果未加载则同步返回null）
function getCachedDialogue(npcType: NPCType): NPCDialogueData | null {
  return dialogueCache[npcType];
}

// 根据天数获取NPC的对话节点（第一个节点作为入口）
function getEntryNodeForDay(npcType: NPCType, day: number): DialogueNode | null {
  const data = getCachedDialogue(npcType);
  if (!data) return null;

  const dayKey = String(day);
  const dayDialogues = data.dialogues[dayKey];
  if (!dayDialogues || dayDialogues.length === 0) return null;

  // 返回第一个对话节点作为入口
  return dayDialogues[0];
}

// 根据节点ID获取特定对话节点
function getNodeById(npcType: NPCType, day: number, nodeId: string): DialogueNode | null {
  const data = getCachedDialogue(npcType);
  if (!data) return null;

  // 只搜索当天的对话（对话树不跨天）
  const dayKey = String(day);
  const dayDialogues = data.dialogues[dayKey];
  if (!dayDialogues) return null;

  return dayDialogues.find((node) => node.id === nodeId) || null;
}

// 将DialogueNode转换为Dialogue（运行时格式）
function nodeToDialogue(npcType: NPCType, node: DialogueNode, day: number, prices?: Record<string, number>): Dialogue {
  let text = node.text;

  // 动态插入价格数据
  if (prices) {
    text = interpolateDialogueText(text, prices, day);
  }

  // 处理选项文本和状态
  const processedChoices = node.choices?.map((choice) => {
    let newText = choice.text;
    // 为结束对话的选项添加标注
    if (choice.action === 'dismiss' && !choice.nextId) {
      newText = `${choice.text}（结束对话）`;
    }
    return {
      ...choice,
      text: newText,
    };
  });

  return {
    npcId: npcType,
    text,
    choices: processedChoices,
    mood: node.mood,
    currentNodeId: node.id,
  };
}

// 在对话文本中动态插入价格数据
export function interpolateDialogueText(text: string, prices: Record<string, number>, _day: number = 1): string {
  const placeholderMap: Record<string, string> = {
    BEER_PRICE: formatBeerPriceForDialogue(),
    SEMPER_PRICE: formatGuilders(prices[AssetType.TULIP_SEMPER]).slice(1),
    GOUDA_PRICE: formatGuilders(prices[AssetType.TULIP_GOUDA]).slice(1),
    VICEROY_PRICE: formatGuilders(prices[AssetType.TULIP_VICEROY]).slice(1),
    BLACK_PRICE: formatGuilders(prices[AssetType.TULIP_BLACK]).slice(1),
    ESTATE_PRICE: formatGuilders(prices[AssetType.ESTATE]).slice(1),
    VOYAGE_PRICE: formatGuilders(prices[AssetType.VOYAGE]).slice(1),
    AVG_CHANGE: calculateAverageChange(prices),
  };

  return text.replace(/ƒ?\{([A-Z_]+)\}/g, (match, key: string) => {
    const value = placeholderMap[key];
    if (value === undefined) {
      return match;
    }

    if (key === 'BEER_PRICE') {
      return value;
    }

    return match.startsWith('ƒ') ? `ƒ${value}` : value;
  });
}

// 计算平均价格变化百分比
function calculateAverageChange(prices: Record<string, number>): string {
  let totalChange = 0;
  let count = 0;

  const tulipAssets = [
    AssetType.TULIP_SEMPER,
    AssetType.TULIP_GOUDA,
    AssetType.TULIP_VICEROY,
    AssetType.TULIP_BLACK,
  ];

  tulipAssets.forEach((assetType) => {
    const basePrice = BASE_PRICES[assetType];
    const currentPrice = prices[assetType];

    if (typeof currentPrice !== 'number' || basePrice === 0) {
      return;
    }

    const change = ((currentPrice - basePrice) / basePrice) * 100;
    totalChange += change;
    count++;
  });

  if (count === 0) return '0';
  return Math.round(totalChange / count).toString();
}

// 根据天数和NPC类型获取入口对话
export function getDialogueForDay(npcType: NPCType, day: number, _mood?: NPCMood, prices?: Record<string, number>): Dialogue | null {
  const entryNode = getEntryNodeForDay(npcType, day);
  if (!entryNode) return null;

  return nodeToDialogue(npcType, entryNode, day, prices);
}

// 根据当前对话和选择的nextId获取下一个对话节点
export function getNextDialogueNode(
  npcType: NPCType,
  day: number,
  _currentDialogue: Dialogue,
  nextId: string,
  prices?: Record<string, number>
): Dialogue | null {
  const nextNode = getNodeById(npcType, day, nextId);
  if (!nextNode) return null;

  return nodeToDialogue(npcType, nextNode, day, prices);
}

// Day4 各NPC的情绪分布（按角色性格）
const DAY_4_NPC_MOODS: Record<NPCType, NPCMood> = {
  [NPCType.HENDRIK]: 'excited',     // 赌徒，越涨越兴奋
  [NPCType.CORNELIS]: 'cautious',   // 老花商，开始感觉到不对劲
  [NPCType.ANNA]: 'worried',        // 谨慎寡妇，一直在担心
  [NPCType.MARIA_HOST]: 'calm',     // 老板娘，始终清醒
  [NPCType.STRANGER]: 'calm',       // 神秘商人，不动声色
};

// 根据天数和NPC类型计算情绪
export function calculateNPCMood(day: number, priceChangePercent: number, npcType?: NPCType): NPCMood {
  if (day === 5) {
    return 'panicked'; // Day 5 泡沫破裂
  }

  if (day === 4 && npcType) {
    return DAY_4_NPC_MOODS[npcType] || 'cautious';
  }

  if (day === 4) {
    return priceChangePercent > 100 ? 'excited' : 'worried';
  }

  if (day === 3) {
    return priceChangePercent > 80 ? 'excited' : 'cautious';
  }

  if (day === 2) {
    return priceChangePercent > 50 ? 'excited' : 'calm';
  }

  // Day 1
  return 'calm';
}

// 触发NPC对话
export function triggerNPCDialogue(
  day: number,
  _priceChangePercent: number,
  npcType?: NPCType,
  prices?: Record<string, number>
): { npc: typeof NPC_DATA[NPCType]; dialogue: Dialogue | null } {
  // 如果指定了NPC类型则使用它，否则随机选择
  const selectedType = npcType ?? Object.values(NPCType)[Math.floor(Math.random() * Object.values(NPCType).length)];

  const npc = NPC_DATA[selectedType];
  const dialogue = getDialogueForDay(selectedType, day, undefined, prices);

  return { npc, dialogue };
}

// 获取欢迎对话（Day 1）
export function getWelcomeDialogue(npcType?: NPCType, day: number = 1, mood?: NPCMood, prices?: Record<string, number>): { npc: typeof NPC_DATA[NPCType]; dialogue: Dialogue | null } {
  const selectedType = npcType ?? NPCType.MARIA_HOST;
  const npc = NPC_DATA[selectedType];
  const dialogue = getDialogueForDay(selectedType, day, mood, prices);

  return { npc, dialogue };
}
