// @vitest-environment happy-dom

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ContractModal } from '../ContractModal';
import { AssetType } from '../../engine/types';

describe('ContractModal', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.useFakeTimers();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('should present tulip trades as historical paper contracts', () => {
    act(() => {
      root.render(
        <ContractModal
          assetType={AssetType.TULIP_GOUDA}
          tradeType="buy"
          quantity={3}
          total={3135}
          onConfirm={() => {}}
          onCancel={() => {}}
        />
      );
    });

    const text = container.textContent ?? '';
    expect(text).toContain('远期合约签署');
    expect(text).toContain('签署买入合约');
    expect(text).toContain('Admirael van der Eijck');
    expect(text).toContain('冬季球根仍埋于地下');
  });
});
