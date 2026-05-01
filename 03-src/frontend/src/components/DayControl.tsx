import { useState } from 'react';
import { useGameStore, selectCurrentDay } from '../engine/gameState';

export function DayControl() {
  const currentDay = useGameStore(selectCurrentDay);
  const { advanceDay, setGamePhase } = useGameStore();
  const [isAdvancing, setIsAdvancing] = useState(false);

  const handleAdvanceDay = () => {
    if (currentDay > 5) return;

    // Day 5: 直接进入结局（价格已由上一次 advanceDay 设为崩盘价）
    if (currentDay === 5) {
      setGamePhase('ending');
      return;
    }

    setIsAdvancing(true);

    // 昼夜过渡动画效果
    setTimeout(() => {
      advanceDay();
      setIsAdvancing(false);
    }, 1000);
  };

  return (
    <div className="relative">
      {/* 昼夜过渡效果 */}
      {isAdvancing && (
        <div className="day-transition">
          <div className="day-transition-mark">夜幕降临</div>
        </div>
      )}

      {/* 天数显示 */}
      <div className="day-control">
        <div className="day-badge">
          <div className="day-mark" aria-hidden="true" />

          {/* 天数文本 */}
          <div className="day-copy">
            <div className="day-label">当前天数</div>
            <div className="day-value">
              Day {currentDay} / 5
            </div>
          </div>
        </div>

        {/* 推进按钮 */}
        {currentDay < 5 && (
          <button
            onClick={handleAdvanceDay}
            disabled={isAdvancing}
            className={`game-button game-button-primary day-advance ${
              isAdvancing ? 'animate-pulse' : ''
            }`}
          >
            {isAdvancing ? '推进中...' : '推进到下一天'}
          </button>
        )}
        {currentDay === 5 && (
          <button
            onClick={handleAdvanceDay}
            className="game-button game-button-primary day-advance"
          >
            查看结局
          </button>
        )}
      </div>

      {/* 进度条 */}
      <div className="day-progress">
        <div
          className="day-progress-fill"
          style={{ width: `${(currentDay / 5) * 100}%` }}
        />
      </div>
    </div>
  );
}
