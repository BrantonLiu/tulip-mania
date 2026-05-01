import { NPCType, NPCMood } from '../engine/types';

// NPC名称映射
const NPC_NAMES: Record<NPCType, string> = {
  [NPCType.JAN]: 'Jan',
  [NPCType.WILLEM]: 'Willem',
  [NPCType.MARIA]: 'Maria',
  [NPCType.PIETER]: 'Pieter',
  [NPCType.LUCAS]: 'Lucas',
};

// 情绪对应的颜色（占位，M3阶段用立绘代替）
const MOOD_COLORS: Record<NPCMood, string> = {
  calm: 'bg-blue-200',
  excited: 'bg-yellow-200',
  cautious: 'bg-green-200',
  worried: 'bg-orange-200',
  panicked: 'bg-red-200',
};

// 情绪对应的文字描述
const MOOD_DESCRIPTIONS: Record<NPCMood, string> = {
  calm: '平静',
  excited: '兴奋',
  cautious: '谨慎',
  worried: '担忧',
  panicked: '恐慌',
};

interface NPCPortraitProps {
  npcId: NPCType;
  mood: NPCMood;
}

export function NPCPortrait({ npcId, mood }: NPCPortraitProps) {
  const name = NPC_NAMES[npcId];
  const moodColor = MOOD_COLORS[mood];
  const moodDesc = MOOD_DESCRIPTIONS[mood];

  return (
    <div className="flex items-start gap-4">
      {/* NPC立绘占位 */}
      <div
        className={`w-24 h-24 rounded-lg ${moodColor} flex items-center justify-center border-2 border-amber-900`}
      >
        <span className="text-4xl">👤</span>
      </div>

      {/* NPC名称和情绪 */}
      <div className="flex flex-col">
        <h3 className="text-xl font-bold text-amber-900">{name}</h3>
        <span className="text-sm text-gray-600">({moodDesc})</span>
      </div>
    </div>
  );
}
