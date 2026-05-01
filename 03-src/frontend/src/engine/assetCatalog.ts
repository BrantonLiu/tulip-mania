import { AssetType } from './types';

export interface AssetPresentation {
  name: string;
  image?: string;
  category: string;
  colorClass?: string;
}

export const TULIP_ASSET_TYPES: AssetType[] = [
  AssetType.TULIP_SEMPER,
  AssetType.TULIP_GOUDA,
  AssetType.TULIP_VICEROY,
  AssetType.TULIP_BLACK,
];

export const TRADEABLE_ASSET_TYPES: AssetType[] = [
  ...TULIP_ASSET_TYPES,
  AssetType.ESTATE,
  AssetType.VOYAGE,
];

export const ASSET_PRESENTATION: Record<AssetType, AssetPresentation> = {
  [AssetType.TULIP_SEMPER]: {
    name: 'Semper Augustus',
    image: 'semper_augustus.png',
    category: '郁金香纸约',
    colorClass: 'asset-semper',
  },
  [AssetType.TULIP_GOUDA]: {
    name: 'Admirael van der Eijck',
    image: 'gouda.png',
    category: '郁金香纸约',
    colorClass: 'asset-gouda',
  },
  [AssetType.TULIP_VICEROY]: {
    name: 'Viceroy',
    image: 'viceroy.png',
    category: '郁金香纸约',
    colorClass: 'asset-viceroy',
  },
  [AssetType.TULIP_BLACK]: {
    name: 'Prince van Astrijk',
    image: 'black_tulip.png',
    category: '深色郁金香纸约',
    colorClass: 'asset-black',
  },
  [AssetType.ESTATE]: {
    name: '房产契约',
    category: '不动产',
    colorClass: 'asset-estate',
  },
  [AssetType.VOYAGE]: {
    name: 'VOC 航海股份',
    category: '海贸投资',
    colorClass: 'asset-voyage',
  },
};

export function getTradeTabLabel(tradeType: 'buy' | 'sell'): string {
  return tradeType === 'buy' ? '签入合约' : '转让合约';
}

export function getTradeButtonLabel(tradeType: 'buy' | 'sell'): string {
  return tradeType === 'buy' ? '签署买入合约' : '确认转让合约';
}

export function getTradeHistoryLabel(tradeType: 'buy' | 'sell'): string {
  return tradeType === 'buy' ? '签入' : '转让';
}

export function getContractActionLabel(tradeType: 'buy' | 'sell'): string {
  return tradeType === 'buy' ? '签署买入合约' : '转让既有合约';
}
