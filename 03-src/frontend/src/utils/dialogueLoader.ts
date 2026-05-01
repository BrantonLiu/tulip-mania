import { NPCType } from '../engine/types';
import type { Dialogue, NPCMood, NPCDialogueData, DialogueNode } from '../engine/types';
import { NPC_DATA } from '../engine/dialogueEngine';

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
    text = injectPriceData(text, prices, day);
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
function injectPriceData(text: string, prices: Record<string, number>, _day: number): string {
  let result = text;

  // 插入 Semper Augustus 价格
  if (prices.TULIP_SEMPER) {
    result = result.replace(/\{SEMPER_PRICE\}/g, `${prices.TULIP_SEMPER}`);
  }

  // 插入 Gouda 价格
  if (prices.TULIP_GOUDA) {
    result = result.replace(/\{GOUDA_PRICE\}/g, `${prices.TULIP_GOUDA}`);
  }

  // 插入 Viceroy 价格
  if (prices.TULIP_VICEROY) {
    result = result.replace(/\{VICEROY_PRICE\}/g, `${prices.TULIP_VICEROY}`);
  }

  // 插入 Black Tulip 价格
  if (prices.TULIP_BLACK) {
    result = result.replace(/\{BLACK_PRICE\}/g, `${prices.TULIP_BLACK}`);
  }

  // 插入平均涨幅百分比
  const avgChange = calculateAverageChange(prices);
  result = result.replace(/\{AVG_CHANGE\}/g, `${avgChange}`);

  return result;
}

// 计算平均价格变化百分比
function calculateAverageChange(prices: Record<string, number>): string {
  const values = Object.values(prices).filter((v) => typeof v === 'number');
  if (values.length === 0) return '0';

  // 简单计算：基于基准价格的变化
  const basePrices: Record<string, number> = {
    TULIP_SEMPER: 500,
    TULIP_GOUDA: 50,
    TULIP_VICEROY: 200,
    TULIP_BLACK: 300,
  };

  let totalChange = 0;
  let count = 0;

  for (const [key, currentPrice] of Object.entries(prices)) {
    if (basePrices[key]) {
      const change = ((currentPrice - basePrices[key]) / basePrices[key]) * 100;
      totalChange += change;
      count++;
    }
  }

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

// 根据价格变化计算情绪
export function calculateNPCMood(day: number, priceChangePercent: number): NPCMood {
  if (day === 5) {
    return 'panicked'; // Day 5 泡沫破裂
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
