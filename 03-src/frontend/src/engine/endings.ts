import type { Ending, PlayerState } from './types';
import { AssetType } from './types';
import { TULIP_ASSET_TYPES } from './assetCatalog';

interface EndingDef {
  condition: (wealth: number) => boolean;
  type: Ending['type'];
  title: string;
  description: string;
  colorClass: string;
  mark: string;
}

const ENDINGS: EndingDef[] = [
  {
    condition: (wealth) => wealth >= 20000,
    type: 'legendary',
    title: '传奇操盘手',
    description: '你在泡沫中全身而退还大赚一笔！你的投资智慧被传颂至今，成为了阿姆斯特丹商界的传奇人物。',
    colorClass: 'ending-legendary',
    mark: 'I',
  },
  {
    condition: (wealth) => wealth >= 10000,
    type: 'lucky',
    title: '幸运的旁观者',
    description: '你保住了本金，甚至还有些许收益。在这场疯狂的泡沫中，你保持了清醒，这是最难得的。',
    colorClass: 'ending-lucky',
    mark: 'II',
  },
  {
    condition: (wealth) => wealth >= 5000,
    type: 'wounded',
    title: '伤痕累累',
    description: '你损失了一部分资产，但还在游戏中。这场泡沫教会了你残酷的一课：贪婪是魔鬼。',
    colorClass: 'ending-wounded',
    mark: 'III',
  },
  {
    condition: () => true, // fallback
    type: 'bankrupt',
    title: '破产的花商',
    description: '你把账桌上的大半身家都赔进去了。但这场狂热本就只卷入少数商人与工匠，城市本身并没有随之停摆。',
    colorClass: 'ending-bankrupt',
    mark: 'IV',
  },
];

const GENIUS_DESCRIPTION =
  '你不仅全身而退，而且明智地转向了长期投资。\n\n随着后来荷兰经济的崛起，你的资产还在继续翻倍。VOC的股票在随后的几十年里稳步增长，运河房产的价值也水涨船高。而那些执迷于郁金香的人，只能在酒馆里追忆往昔。\n\n作者甚至想投胎当你的后人。';

/**
 * 检测是否触发隐藏结局"神来之笔"
 * 条件：Day5结束时持有0份郁金香 + 持有>0份房产或航海
 */
export function detectHiddenEnding(player: PlayerState): boolean {
  const hasTulips = TULIP_ASSET_TYPES.some(
    (t) => player.portfolio[t] > 0
  );
  const hasSafeAssets =
    player.portfolio[AssetType.ESTATE] > 0 ||
    player.portfolio[AssetType.VOYAGE] > 0;
  return !hasTulips && hasSafeAssets;
}

/**
 * 计算总财富
 */
function calculateTotalWealth(
  player: PlayerState,
  prices: Record<AssetType, number>
): number {
  const portfolioValue = Object.entries(player.portfolio).reduce(
    (sum, [type, qty]) => sum + prices[type as AssetType] * qty,
    0
  );
  return player.cash + portfolioValue;
}

/**
 * 根据持仓状态生成追加文案
 */
function getHoldingDescription(
  player: PlayerState,
  prices: Record<AssetType, number>,
  initialWealth: number
): string | null {
  const hasTulips = TULIP_ASSET_TYPES.some(
    (t) => player.portfolio[t] > 0
  );
  if (!hasTulips) return null;

  const totalWealth = calculateTotalWealth(player, prices);
  if (totalWealth > initialWealth) {
    return '你虽然在这几天资产翻倍，但后来郁金香的价格越来越低，你最终所剩无几了。';
  }
  return '你在这场操作中一败涂地，即便最后也不认输。后来郁金香的价格越来越低，你最终赔得分文不值。';
}

/**
 * 综合判定结局：先检测隐藏结局，再按财富阈值匹配，最后追加持仓文案
 */
export function determineEnding(
  player: PlayerState,
  prices: Record<AssetType, number>,
  initialWealth: number
): Ending {
  const totalWealth = calculateTotalWealth(player, prices);

  // 1. 检测隐藏结局
  if (detectHiddenEnding(player)) {
    return {
      type: 'genius',
      title: '神来之笔',
      description: GENIUS_DESCRIPTION,
      colorClass: 'ending-genius',
      mark: '*',
    };
  }

  // 2. 按财富阈值匹配
  const matched = ENDINGS.find((e) => e.condition(totalWealth)) || ENDINGS[3];

  // 3. 追加持仓感知文案
  const holdingNote = getHoldingDescription(player, prices, initialWealth);
  const description = holdingNote
    ? `${matched.description}\n\n${holdingNote}`
    : matched.description;

  return {
    type: matched.type,
    title: matched.title,
    description,
    colorClass: matched.colorClass,
    mark: matched.mark,
  };
}
