import { describe, expect, it } from 'vitest';
import { interpolateDialogueText } from '../dialogueLoader';
import { AssetType } from '../../engine/types';

describe('dialogueLoader', () => {
  it('should replace runtime placeholders with historical price copy', () => {
    const text = '啤酒一杯 {BEER_PRICE}，Semper 已经到 ƒ{SEMPER_PRICE}，VOC 航海股份也不过 ƒ{VOYAGE_PRICE}。';
    const prices = {
      [AssetType.TULIP_SEMPER]: 678,
      [AssetType.TULIP_GOUDA]: 1045,
      [AssetType.TULIP_VICEROY]: 4200,
      [AssetType.TULIP_BLACK]: 380,
      [AssetType.ESTATE]: 500,
      [AssetType.VOYAGE]: 100,
    };

    expect(interpolateDialogueText(text, prices)).toBe(
      '啤酒一杯 2 stuivers，Semper 已经到 ƒ678，VOC 航海股份也不过 ƒ100。'
    );
  });
});
