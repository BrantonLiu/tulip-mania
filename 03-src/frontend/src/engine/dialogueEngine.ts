import { NPCType, NPC, Dialogue, DialogueChoice, NPCMood, AssetType } from './types';
import { calculateAveragePriceChange } from './priceEngine';

// NPC数据
export const NPC_DATA: Record<NPCType, NPC> = {
  [NPCType.JAN]: {
    id: NPCType.JAN,
    name: 'Jan',
    personality: '冷静、理性、见多识广',
    portraitUrl: '', // M3阶段生成
    mood: 'calm',
  },
  [NPCType.WILLEM]: {
    id: NPCType.WILLEM,
    name: 'Willem',
    personality: '狂热、贪婪、冲动',
    portraitUrl: '', // M3阶段生成
    mood: 'excited',
  },
  [NPCType.MARIA]: {
    id: NPCType.MARIA,
    name: 'Maria',
    personality: '谨慎、保守、精明',
    portraitUrl: '', // M3阶段生成
    mood: 'cautious',
  },
  [NPCType.PIETER]: {
    id: NPCType.PIETER,
    name: 'Pieter',
    personality: '怀旧、感慨、有经验',
    portraitUrl: '', // M3阶段生成
    mood: 'calm',
  },
  [NPCType.LUCAS]: {
    id: NPCType.LUCAS,
    name: 'Lucas',
    personality: '好奇、多问、旁观者',
    portraitUrl: '', // M3阶段生成
    mood: 'calm',
  },
};

// 对话模板
interface DialogueTemplate {
  text: string;
  choices?: DialogueChoice[];
}

// 对话模板库（按NPC、情绪、天数分类）
const DIALOGUE_TEMPLATES: Record<NPCType, Record<NPCMood, Record<number, DialogueTemplate>>> = {
  [NPCType.JAN]: {
    calm: {
      1: {
        text: "欢迎来到我的酒馆，年轻人。最近郁金香市场的热度确实很高，你要来一杯吗？",
        choices: [
          { text: "我想了解一下市场情况", action: 'skip' },
          { text: "来杯酒，顺便听听你的看法", action: 'skip' },
        ],
      },
      2: {
        text: "价格又涨了...不过我总觉得有点不寻常。我见过太多这样的疯狂了。",
      },
      3: {
        text: "今天的价格涨得有些过分了。你要小心点，不是每个人都能全身而退的。",
      },
      4: {
        text: "这是...这太疯狂了。我从没见过这样的情况。你确定要继续吗？",
        choices: [
          { text: "再看看，或许还能涨", action: 'skip' },
          { text: "你说得对，我该考虑退出", action: 'skip' },
        ],
      },
    },
    excited: {
      1: {
        text: "看来大家对郁金香的热情很高。我也涨了不少存货呢。",
      },
      2: {
        text: "这个价格水平...很惊人。我已经卖掉了一部分。",
      },
    },
    cautious: {
      3: {
        text: "老兄，价格已经很高了。我建议你考虑一下风险。",
      },
      4: {
        text: "这种涨势不可持续。我强烈建议你至少卖掉一部分。",
      },
    },
    worried: {},
    panicked: {
      5: {
        text: "该死，泡沫破裂了！所有人都慌了。你怎么样？",
        choices: [
          { text: "我卖得早，还不错", action: 'skip' },
          { text: "我...我损失了很多", action: 'skip' },
        ],
      },
    },
  },
  [NPCType.WILLEM]: {
    calm: {},
    excited: {
      1: {
        text: "哈！你看价格了吗？郁金香简直是黄金！我昨天买入的今天涨了60%！",
        choices: [
          { text: "你真幸运", action: 'skip' },
          { text: "我想买一点", action: 'skip' },
        ],
      },
      2: {
        text: "我发财了！我要买下整条街！你也应该加入我，这机会一生只有一次！",
        choices: [
          { text: "好，我买", action: 'trade', assetType: AssetType.TULIP_SEMPER, tradeType: 'buy' },
          { text: "我再想想", action: 'skip' },
        ],
      },
      3: {
        text: "你看到了吗？Semper Augustus涨到2000了！我全部身家都押上了！你也应该这样！",
        choices: [
          { text: "好吧，我买一点", action: 'trade', assetType: AssetType.TULIP_SEMPER, tradeType: 'buy' },
          { text: "太冒险了", action: 'skip' },
        ],
      },
      4: {
        text: "暴富！暴富！我要成为阿姆斯特丹最富有的人！",
      },
    },
    cautious: {},
    worried: {},
    panicked: {
      5: {
        text: "不...不不可能...我的一切...全都完了...",
        choices: [
          { text: "太惨了", action: 'skip' },
        ],
      },
    },
  },
  [NPCType.MARIA]: {
    calm: {
      1: {
        text: "你好。今天的价格确实在涨，但我建议你不要投入太多。",
      },
    },
    excited: {},
    cautious: {
      2: {
        text: "价格涨得很快，但太快了。我建议你只投入一小部分资金。",
      },
      3: {
        text: "我已经卖掉了一些。这涨势太夸张了，风险太高。",
        choices: [
          { text: "你说得对，我该卖掉一些", action: 'trade', assetType: AssetType.TULIP_GOUDA, tradeType: 'sell' },
          { text: "我觉得还能涨", action: 'skip' },
        ],
      },
      4: {
        text: "这太疯狂了。我现在只持有房产，那些至少有价值。你呢？",
      },
    },
    worried: {
      5: {
        text: "我就知道...还好我卖得早。你呢？损失大吗？",
      },
    },
    panicked: {},
  },
  [NPCType.PIETER]: {
    calm: {
      1: {
        text: "年轻人，我想跟你讲个故事。1620年代，郁金香也曾掀起热潮...",
      },
      2: {
        text: "历史的教训值得铭记。泡沫终究会破裂，只是时间问题。",
      },
      3: {
        text: "我年轻时见过类似的事情。人们失去了一切...你要小心。",
      },
    },
    excited: {},
    cautious: {},
    worried: {
      4: {
        text: "这种疯狂让我想起了当年...希望你不要成为下一个受害者。",
      },
      5: {
        text: "泡沫破裂了。又一次。历史总是在重演...",
      },
    },
    panicked: {},
  },
  [NPCType.LUCAS]: {
    calm: {
      1: {
        text: "你是新来的？这里的人都在谈论郁金香。我也想试试看。",
      },
      2: {
        text: "涨了这么多...我应该早点买入的。你觉得现在还行吗？",
        choices: [
          { text: "当然，还能涨", action: 'skip' },
          { text: "小心点，风险很高", action: 'skip' },
        ],
      },
      3: {
        text: "我昨天买入了一些，今天又涨了！我是天才！",
      },
    },
    excited: {
      4: {
        text: "我要发财了！我要买个大房子，娶个好妻子！",
      },
    },
    cautious: {},
    worried: {},
    panicked: {
      5: {
        text: "不...我的钱...我明年的学费...",
      },
    },
  },
};

// 根据天数和价格变化计算情绪
function calculateMood(day: number, avgPriceChange: number): NPCMood {
  if (day === 5) {
    return 'panicked'; // 泡沫破裂
  }

  if (avgPriceChange > 150) {
    return 'excited'; // 暴涨
  } else if (avgPriceChange > 100) {
    return 'excited'; // 大涨
  } else if (avgPriceChange > 50) {
    return 'cautious'; // 温和上涨
  } else {
    return 'calm';
  }
}

// 填充对话中的变量
function fillDialogueVariables(
  text: string,
  prices: Record<AssetType, number>
): string {
  // 可以在这里填充价格等变量
  return text;
}

// 随机选择一个NPC
export function getRandomNPC(): NPC {
  const npcTypes = Object.values(NPCType);
  const randomIndex = Math.floor(Math.random() * npcTypes.length);
  const npcType = npcTypes[randomIndex];
  return NPC_DATA[npcType];
}

// 生成对话
export function generateDialogue(
  npc: NPC,
  day: number,
  prices: Record<AssetType, number>
): Dialogue {
  // 计算平均价格变化（相对于前一天，这里简化处理）
  // 实际应该从价格历史计算
  const avgPriceChange = day * 50 + Math.random() * 50; // 简化计算

  // 计算情绪
  const mood = calculateMood(day, avgPriceChange);

  // 获取对话模板
  const npcTemplates = DIALOGUE_TEMPLATES[npc.id];
  const moodTemplates = npcTemplates[mood] || npcTemplates.calm || {};
  const dayTemplates = moodTemplates[day] || moodTemplates[1] || {
    text: "今天的价格很有趣，不是吗？",
  };

  // 填充变量
  const text = fillDialogueVariables(dayTemplates.text, prices);

  // 创建对话
  const dialogue: Dialogue = {
    npcId: npc.id,
    text,
    choices: dayTemplates.choices,
    mood,
  };

  // 更新NPC情绪
  npc.mood = mood;

  return dialogue;
}
