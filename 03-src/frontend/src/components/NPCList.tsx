import { useGameStore, selectCurrentDay, selectPrices } from '../engine/gameState';
import { NPCType } from '../engine/types';
import { NPC_DATA } from '../engine/dialogueEngine';
import { triggerNPCDialogue } from '../utils/dialogueLoader';

interface NPCEntry {
  id: NPCType;
  name: string;
  image: string;
  status: string;
  alwaysPresent?: boolean;
}

const NPC_LIST: NPCEntry[] = [
  { id: NPCType.MARIA_HOST, name: '玛丽亚', image: '/images/maria_host.png', status: '再来杯啤酒吧' },
  { id: NPCType.CORNELIS, name: '科内利斯', image: '/images/cornelis.png', status: '今天又翻倍了！' },
  { id: NPCType.ANNA, name: '安娜', image: '/images/anna.png', status: '我在考虑要不要卖...' },
  { id: NPCType.HENDRIK, name: '亨德里克', image: '/images/hendrik.png', status: '全部梭哈！' },
  { id: NPCType.STRANGER, name: '神秘商人', image: '/images/stranger.png', status: '我有消息...', alwaysPresent: false },
];

export function NPCList() {
  const currentDay = useGameStore(selectCurrentDay);
  const prices = useGameStore(selectPrices);
  const { currentNPC, setDialogue, setCurrentNPC } = useGameStore();

  const handleNPCClick = (npc: NPCEntry) => {
    const npcData = NPC_DATA[npc.id];
    setCurrentNPC(npcData);

    // 触发对应NPC的对话（传入 npc.id 确保获取正确NPC的对话）
    const priceChangePercent = currentDay * 50;
    const priceMap = prices as unknown as Record<string, number>;
    const { dialogue: npcDialogue } = triggerNPCDialogue(currentDay, priceChangePercent, npc.id, priceMap);

    if (npcDialogue) {
      setDialogue(npcDialogue);
    }
  };

  // 神秘商人在某些天不在，但Day5一定在
  const isAvailable = (npc: NPCEntry) => {
    if (npc.alwaysPresent === undefined || npc.alwaysPresent) return true;
    // STRANGER: Day1-3随机出现，Day4-5一定在
    if (npc.id === NPCType.STRANGER) {
      return currentDay >= 4;
    }
    return true;
  };

  return (
    <div className="npc-list-panel">
      <div className="npc-list-header">
        <h2>在场人物</h2>
      </div>
      <div className="npc-list-items">
        {NPC_LIST.map((npc) => {
          const available = isAvailable(npc);
          const isActive = currentNPC?.id === npc.id;

          return (
            <button
              key={npc.id}
              onClick={() => available && handleNPCClick(npc)}
              disabled={!available}
              className={`npc-list-item ${isActive ? 'active' : ''} ${!available ? 'unavailable' : ''}`}
            >
              <img
                src={npc.image}
                alt={npc.name}
                className="npc-list-avatar"
              />
              <div className="npc-list-info">
                <span className="npc-list-name">{npc.name}</span>
                <span className="npc-list-status">{available ? npc.status : '今日不在'}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
