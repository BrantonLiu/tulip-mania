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
  worried: 'animate-bounce',
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
    <div className="flex items-start gap-4">
      {/* NPC立绘 */}
      <div className={`relative w-32 h-48 ${animationClass}`}>
        <img
          src={`/images/${imageFile}`}
          alt={name}
          className="w-full h-full object-cover rounded-lg border-2 border-amber-900 shadow-xl"
        />
        {/* 情绪指示器 */}
        <div className="absolute top-2 right-2 px-2 py-1 bg-white/90 rounded text-xs font-semibold border border-amber-900">
          {moodDesc}
        </div>
      </div>

      {/* NPC名称 */}
      <div className="flex flex-col justify-center">
        <h3 className="text-2xl font-bold text-amber-900">{name}</h3>
      </div>
    </div>
  );
}
