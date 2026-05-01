import { NPCType } from './types';
import type { NPC } from './types';

// NPC数据
export const NPC_DATA: Record<NPCType, NPC> = {
  [NPCType.CORNELIS]: {
    id: NPCType.CORNELIS,
    name: '科内利斯',
    personality: '老油条花商，冷静、理性、见多识广',
    portraitUrl: '/images/cornelis.png',
    mood: 'calm',
  },
  [NPCType.ANNA]: {
    id: NPCType.ANNA,
    name: '安娜',
    personality: '谨慎寡妇，保守、精明',
    portraitUrl: '/images/anna.png',
    mood: 'cautious',
  },
  [NPCType.HENDRIK]: {
    id: NPCType.HENDRIK,
    name: '亨德里克',
    personality: '赌徒，狂热、贪婪、冲动',
    portraitUrl: '/images/hendrik.png',
    mood: 'excited',
  },
  [NPCType.MARIA_HOST]: {
    id: NPCType.MARIA_HOST,
    name: '玛丽亚',
    personality: '酒馆老板娘，热情、友善',
    portraitUrl: '/images/maria_host.png',
    mood: 'calm',
  },
  [NPCType.STRANGER]: {
    id: NPCType.STRANGER,
    name: '神秘商人',
    personality: '神秘商人，神秘、精明',
    portraitUrl: '/images/stranger.png',
    mood: 'calm',
  },
};

// 随机选择一个NPC
export function getRandomNPC(): NPC {
  const npcTypes = Object.values(NPCType);
  const randomIndex = Math.floor(Math.random() * npcTypes.length);
  const npcType = npcTypes[randomIndex];
  return NPC_DATA[npcType];
}
