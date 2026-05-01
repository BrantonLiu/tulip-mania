import { NPCType } from '../engine/types';
import type { NPCMood } from '../engine/types';

// NPC名称映射
const NPC_NAMES: Record<NPCType, string> = {
  [NPCType.CORNELIS]: '科内利斯',
  [NPCType.ANNA]: '安娜',
  [NPCType.HENDRIK]: '亨德里克',
  [NPCType.MARIA_HOST]: '玛丽亚',
  [NPCType.STRANGER]: '神秘商人',
};

// NPC图片文件名映射（小写，下划线）
const NPC_IMAGES: Record<NPCType, string> = {
  [NPCType.CORNELIS]: 'cornelis.png',
  [NPCType.ANNA]: 'anna.png',
  [NPCType.HENDRIK]: 'hendrik.png',
  [NPCType.MARIA_HOST]: 'maria_host.png',
  [NPCType.STRANGER]: 'stranger.png',
};

// 情绪对应的文字描述
const MOOD_DESCRIPTIONS: Record<NPCMood, string> = {
  calm: '平静',
  excited: '兴奋',
  cautious: '谨慎',
  worried: '担忧',
  panicked: '恐慌',
};

// 情绪对应的动画类
const MOOD_ANIMATIONS: Record<NPCMood, string> = {
  calm: 'animate-none',
  excited: 'animate-pulse',
  cautious: 'animate-none',
  worried: 'animate-worry',
  panicked: 'animate-shake',
};

interface NPCPortraitProps {
  npcId: NPCType;
  mood: NPCMood;
}

export function NPCPortrait({ npcId, mood }: NPCPortraitProps) {
  const name = NPC_NAMES[npcId];
  const imageFile = NPC_IMAGES[npcId];
  const moodDesc = MOOD_DESCRIPTIONS[mood];
  const animationClass = MOOD_ANIMATIONS[mood];

  return (
    <div className="npc-portrait">
      {/* NPC立绘 */}
      <div className={`npc-portrait-frame ${animationClass}`}>
        <img
          src={`/images/${imageFile}`}
          alt={name}
          className="npc-portrait-image"
        />
        {/* 情绪指示器 */}
        <div className="npc-mood-badge">
          {moodDesc}
        </div>
      </div>

      {/* NPC名称 */}
      <h3 className="npc-name">{name}</h3>
    </div>
  );
}
