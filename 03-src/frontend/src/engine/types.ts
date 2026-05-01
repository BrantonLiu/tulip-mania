// 资产类型枚举
export enum AssetType {
  TULIP_SEMPER = 'TULIP_SEMPER',    // 红色郁金香
  TULIP_GOUDA = 'TULIP_GOUDA',      // 黄色郁金香
  TULIP_VICEROY = 'TULIP_VICEROY',  // 紫色郁金香
  TULIP_BLACK = 'TULIP_BLACK',      // 黑色郁金香
  ESTATE = 'ESTATE',                // 房产契约
  VOYAGE = 'VOYAGE',                // 航海股份
}

// 资产接口
export interface Asset {
  type: AssetType;
  name: string;
  basePrice: number;        // 基础价格
  currentPrice: number;     // 当前价格
  volatility: number;       // 波动率 (0-1)
  category: 'tulip' | 'estate' | 'voyage';
}

// 交易记录
export interface TradeRecord {
  id: string;
  day: number;
  assetType: AssetType;
  action: 'buy' | 'sell';
  quantity: number;
  price: number;
  total: number;
  fee: number;
}

// 玩家状态
export interface PlayerState {
  cash: number;                          // 现金
  portfolio: Record<AssetType, number>;  // 持仓数量
  totalWealth: number;                   // 总资产价值
  tradeHistory: TradeRecord[];          // 交易历史
}

// NPC类型枚举
export enum NPCType {
  CORNELIS = 'CORNELIS',   // 老油条花商
  ANNA = 'ANNA',           // 谨慎寡妇
  HENDRIK = 'HENDRIK',     // 赌徒
  MARIA_HOST = 'MARIA_HOST', // 老板娘
  STRANGER = 'STRANGER',   // 神秘商人
}

// NPC情绪类型
export type NPCMood = 'calm' | 'excited' | 'cautious' | 'worried' | 'panicked';

// NPC接口
export interface NPC {
  id: NPCType;
  name: string;
  personality: string;
  portraitUrl: string;    // 立绘 URL（M3 阶段生成）
  mood: NPCMood;
}

// 对话选择
export interface DialogueChoice {
  text: string;
  action?: 'trade' | 'advance' | 'skip';
  nextDialogue?: string;
  assetType?: AssetType | string;      // 如果是交易，指定资产（允许字符串以兼容JSON）
  tradeType?: 'buy' | 'sell'; // 买入或卖出
}

// 对话
export interface Dialogue {
  npcId: NPCType;
  text: string;
  choices?: DialogueChoice[];
  mood: NPCMood;
}

// 游戏阶段
export type GamePhase = 'intro' | 'trading' | 'ending';

// 结局类型
export type EndingType = 'KING' | 'SMART' | 'NORMAL' | 'VICTIM' | 'BANKRUPT';

// 结局
export interface Ending {
  type: EndingType;
  title: string;
  description: string;
}

// 游戏状态
export interface GameState {
  currentDay: number;           // 当前天数 (1-5)
  maxDays: number;              // 最大天数
  prices: Record<AssetType, number>;      // 当前价格
  priceHistory: Record<AssetType, number[]>; // 价格历史
  player: PlayerState;          // 玩家状态
  currentNPC: NPC | null;       // 当前对话 NPC
  dialogue: Dialogue | null;    // 当前对话
  gamePhase: GamePhase;         // 游戏阶段
  ending: Ending | null;        // 结局（gamePhase=ending时）
}

// 交易结果
export interface TradeResult {
  success: boolean;
  error?: string;
  newPlayerState: PlayerState;
}

// 价格计算结果
export interface PriceCalculationResult {
  newPrice: number;
  changePercent: number;
  volatility: number;
}
