import { ItemType } from './types';
import type { InventoryItem, PlayerState } from './types';

export const BEER_PRICE = 0.1;

const ITEM_DEFINITIONS: Record<ItemType, Omit<InventoryItem, 'quantity'>> = {
  [ItemType.BEER]: {
    type: ItemType.BEER,
    name: '荷兰黑啤',
    icon: '🍺',
    usable: true,
    description: '一杯浓郁的黑啤酒。在酒馆里跟人喝一杯，也许能听到些内幕消息...',
  },
};

const ITEM_PRICES: Record<ItemType, number> = {
  [ItemType.BEER]: BEER_PRICE,
};

export interface ItemPurchaseResult {
  success: boolean;
  error?: string;
  newItems: InventoryItem[];
  newPlayerState: PlayerState;
}

export function createInventoryItem(itemType: ItemType, quantity: number = 1): InventoryItem {
  return {
    ...ITEM_DEFINITIONS[itemType],
    quantity,
  };
}

export function createStartingItems(): InventoryItem[] {
  return [createInventoryItem(ItemType.BEER, 2)];
}

export function getItemUnitPrice(itemType: ItemType): number {
  return ITEM_PRICES[itemType];
}

export function purchaseItem(
  itemType: ItemType,
  quantity: number,
  unitPrice: number = getItemUnitPrice(itemType),
  items: InventoryItem[],
  player: PlayerState
): ItemPurchaseResult {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return {
      success: false,
      error: '购买数量必须为正整数',
      newItems: items,
      newPlayerState: player,
    };
  }

  const totalCost = unitPrice * quantity;
  if (player.cash < totalCost) {
    return {
      success: false,
      error: '现金不足',
      newItems: items,
      newPlayerState: player,
    };
  }

  const existingItem = items.find((item) => item.type === itemType);
  const newItems = existingItem
    ? items.map((item) =>
        item.type === itemType
          ? { ...item, quantity: item.quantity + quantity }
          : item
      )
    : [...items, createInventoryItem(itemType, quantity)];

  return {
    success: true,
    newItems,
    newPlayerState: {
      ...player,
      cash: player.cash - totalCost,
      totalWealth: player.totalWealth - totalCost,
    },
  };
}
