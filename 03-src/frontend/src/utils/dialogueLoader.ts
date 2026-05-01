import { NPCType, AssetType } from '../engine/types';
import type { Dialogue, DialogueChoice, NPCMood } from '../engine/types';
import { NPC_DATA } from '../engine/dialogueEngine';

// 对话数据接口
interface DialogueData {
  npcId: string;
  npcName: string;
  personality: string;
  dialogues: Record<NPCMood, Record<string, { text: string; choices?: DialogueChoice[] }>>;
}

// 对话数据（临时硬编码，后续改为从JSON文件加载）
const DIALOGUE_DATA: Record<NPCType, DialogueData> = {
  [NPCType.CORNELIS]: {
    npcId: 'CORNELIS',
    npcName: '科内利斯',
    personality: '老油条花商，冷静、理性、见多识广',
    dialogues: {
      calm: {
        '1': {
          text: '欢迎来到我的酒馆，年轻人。最近郁金香市场的热度确实很高，你要来一杯吗？',
          choices: [
            { text: '我想了解一下市场情况', action: 'skip' },
            { text: '来杯酒，顺便听听你的看法', action: 'skip' },
          ],
        },
        '2': {
          text: '价格又涨了...不过我总觉得有点不寻常。我见过太多这样的疯狂了。',
        },
        '3': {
          text: '今天的价格涨得有些过分了。你要小心点，不是每个人都能全身而退的。',
        },
        '4': {
          text: '这是...这太疯狂了。我从没见过这样的情况。你确定要继续吗？',
          choices: [
            { text: '再看看，或许还能涨', action: 'skip' },
            { text: '你说得对，我该考虑退出', action: 'skip' },
          ],
        },
      },
      excited: {
        '1': {
          text: '看来大家对郁金香的热情很高。我也涨了不少存货呢。',
        },
        '2': {
          text: '这个价格水平...很惊人。我已经卖掉了一部分。',
        },
      },
      cautious: {
        '3': {
          text: '老兄，价格已经很高了。我建议你考虑一下风险。',
        },
        '4': {
          text: '这种涨势不可持续。我强烈建议你至少卖掉一部分。',
        },
      },
      worried: {},
      panicked: {
        '5': {
          text: '该死，泡沫破裂了！所有人都慌了。你怎么样？',
          choices: [
            { text: '我卖得早，还不错', action: 'skip' },
            { text: '我...我损失了很多', action: 'skip' },
          ],
        },
      },
    },
  },
  [NPCType.ANNA]: {
    npcId: 'ANNA',
    npcName: '安娜',
    personality: '谨慎寡妇，保守、精明',
    dialogues: {
      calm: {
        '1': {
          text: '你好。今天的价格确实在涨，但我建议你不要投入太多。',
        },
      },
      excited: {},
      cautious: {
        '2': {
          text: '价格涨得很快，但太快了。我建议你只投入一小部分资金。',
        },
        '3': {
          text: '我已经卖掉了一些。这涨势太夸张了，风险太高。',
          choices: [
            { text: '你说得对，我该卖掉一些', action: 'trade', assetType: AssetType.TULIP_GOUDA, tradeType: 'sell' },
            { text: '我觉得还能涨', action: 'skip' },
          ],
        },
        '4': {
          text: '这太疯狂了。我现在只持有房产，那些至少有价值。你呢？',
        },
      },
      worried: {
        '5': {
          text: '我就知道...还好我卖得早。你呢？损失大吗？',
        },
      },
      panicked: {},
    },
  },
  [NPCType.HENDRIK]: {
    npcId: 'HENDRIK',
    npcName: '亨德里克',
    personality: '赌徒，狂热、贪婪、冲动',
    dialogues: {
      calm: {},
      excited: {
        '1': {
          text: '哈！你看价格了吗？郁金香简直是黄金！我昨天买入的今天涨了60%！',
          choices: [
            { text: '你真幸运', action: 'skip' },
            { text: '我想买一点', action: 'skip' },
          ],
        },
        '2': {
          text: '我发财了！我要买下整条街！你也应该加入我，这机会一生只有一次！',
          choices: [
            { text: '好，我买', action: 'trade', assetType: AssetType.TULIP_SEMPER, tradeType: 'buy' },
            { text: '我再想想', action: 'skip' },
          ],
        },
        '3': {
          text: '你看到了吗？Semper Augustus涨到2000了！我全部身家都押上了！你也应该这样！',
          choices: [
            { text: '好吧，我买一点', action: 'trade', assetType: AssetType.TULIP_SEMPER, tradeType: 'buy' },
            { text: '太冒险了', action: 'skip' },
          ],
        },
        '4': {
          text: '暴富！暴富！我要成为阿姆斯特丹最富有的人！',
        },
      },
      cautious: {},
      worried: {},
      panicked: {
        '5': {
          text: '不...不不可能...我的一切...全都完了...',
          choices: [
            { text: '太惨了', action: 'skip' },
          ],
        },
      },
    },
  },
  [NPCType.MARIA_HOST]: {
    npcId: 'MARIA_HOST',
    npcName: '玛丽亚',
    personality: '酒馆老板娘，热情、友善',
    dialogues: {
      calm: {
        '1': {
          text: '欢迎来到我的酒馆！今天来了很多人，都是谈论郁金香的。要来点什么？',
          choices: [
            { text: '我想打听一下郁金香市场', action: 'skip' },
            { text: '来杯啤酒吧', action: 'skip' },
          ],
        },
        '2': {
          text: '科内利斯又在喝酒了。他总是说价格太高了，可我觉得他就是嫉妒别人发财。',
        },
        '3': {
          text: '今天生意真好！这些买卖郁金香的人都很慷慨。',
        },
        '4': {
          text: '这气氛...有点不对劲。你们是不是知道些什么？',
        },
      },
      excited: {
        '1': {
          text: '看他们都在讨论！这酒馆从来没那么热闹过！',
        },
        '2': {
          text: '有人用一整块地换了一颗球茎！你能相信吗？',
        },
      },
      cautious: {},
      worried: {
        '4': {
          text: '科内利斯说得对...我感觉有点不安。',
        },
        '5': {
          text: '今天客人少了很多...他们去哪里了？',
        },
      },
      panicked: {},
    },
  },
  [NPCType.STRANGER]: {
    npcId: 'STRANGER',
    npcName: '神秘商人',
    personality: '神秘商人，神秘、精明',
    dialogues: {
      calm: {},
      excited: {
        '2': {
          text: '年轻人，我有特别的消息...有些人在大量出货。你感兴趣吗？',
          choices: [
            { text: '什么消息？', action: 'skip' },
            { text: '我不想听', action: 'skip' },
          ],
        },
        '3': {
          text: '如果你现在买，我可以给你很便宜的价格。要不要考虑一下？',
          choices: [
            { text: '好吧，我买点', action: 'trade', assetType: AssetType.TULIP_BLACK, tradeType: 'buy' },
            { text: '我还是算了', action: 'skip' },
          ],
        },
      },
      cautious: {
        '3': {
          text: '听说有人在哈勒姆那边不收球茎了...你有听说吗？',
        },
        '4': {
          text: '我建议你小心点。有些大人物正在撤离。',
        },
      },
      worried: {
        '4': {
          text: '我听说哈勒姆的拍卖没人竞价了...这不是好兆头。',
        },
        '5': {
          text: '看来我的直觉是对的。一切都要结束了。',
        },
      },
      panicked: {},
    },
  },
};

// 对话数据映射
const DIALOGUE_FILES: Record<NPCType, DialogueData> = DIALOGUE_DATA;

// 根据天数和NPC类型获取随机对话
export function getDialogueForDay(npcType: NPCType, day: number, mood: NPCMood): Dialogue | null {
  const dialogueData = DIALOGUE_FILES[npcType];
  if (!dialogueData) return null;

  const moodDialogues = dialogueData.dialogues[mood];
  if (!moodDialogues) return null;

  // 获取当天的所有对话
  const dayDialogues = Object.entries(moodDialogues).filter(([dayNum]) => {
    // 如果没有指定天数，可以随机选择
    if (!dayNum) return true;
    const num = parseInt(dayNum);
    // 只返回当天或之前的对话
    return num <= day;
  });

  if (dayDialogues.length === 0) return null;

  // 随机选择一个对话
  const [, dialogueTemplate] = dayDialogues[Math.floor(Math.random() * dayDialogues.length)];

  return {
    npcId: npcType,
    text: dialogueTemplate.text,
    choices: dialogueTemplate.choices,
    mood,
  };
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
  priceChangePercent: number,
  npcType?: NPCType
): { npc: typeof NPC_DATA[NPCType]; dialogue: Dialogue | null } {
  // 如果指定了NPC类型则使用它，否则随机选择
  const selectedType = npcType ?? Object.values(NPCType)[Math.floor(Math.random() * Object.values(NPCType).length)];

  const npc = NPC_DATA[selectedType];
  const mood = calculateNPCMood(day, priceChangePercent);
  const dialogue = getDialogueForDay(selectedType, day, mood);

  return { npc, dialogue };
}

// 获取欢迎对话（Day 1）
export function getWelcomeDialogue(): { npc: typeof NPC_DATA[NPCType]; dialogue: Dialogue } {
  const npc = NPC_DATA[NPCType.MARIA_HOST];
  const dialogue = getDialogueForDay(NPCType.MARIA_HOST, 1, 'calm')!;

  return { npc, dialogue };
}
