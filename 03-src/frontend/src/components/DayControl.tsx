import { useState } from 'react';
import { useGameStore, selectCurrentDay } from '../engine/gameState';

export function DayControl() {
  const currentDay = useGameStore(selectCurrentDay);
  const { advanceDay, setGamePhase } = useGameStore();
  const [isAdvancing, setIsAdvancing] = useState(false);

  const handleAdvanceDay = () => {
    if (currentDay >= 5) return;

    setIsAdvancing(true);

    // 昼夜过渡动画效果
    setTimeout(() => {
      const newState = advanceDay();

      // Day 5 自动进入结局
      if (newState.currentDay > 5 || currentDay === 5) {
        setTimeout(() => {
          setGamePhase('ending');
        }, 2000);
      }

      setIsAdvancing(false);
    }, 1000);
  };

  return (
    <div className="relative">
      {/* 昼夜过渡效果 */}
      {isAdvancing && (
        <div className="fixed inset-0 bg-black z-50 animate-pulse flex items-center justify-center">
          <div className="text-white text-4xl font-bold">🌙</div>
        </div>
      )}

      {/* 天数显示 */}
      <div className="flex items-center justify-center gap-4">
        <div className="bg-amber-900/90 px-6 py-3 rounded-lg border-2 border-amber-700 shadow-xl">
          <div className="flex items-center gap-3">
            {/* 沙漏图标 */}
            <div className="text-3xl">⏳</div>

            {/* 天数文本 */}
            <div className="text-center">
              <div className="text-amber-300 text-sm">当前天数</div>
              <div className="text-2xl font-bold text-white">
                Day {currentDay} / 5
              </div>
            </div>
          </div>
        </div>

        {/* 推进按钮 */}
        {currentDay < 5 && (
          <button
            onClick={handleAdvanceDay}
            disabled={isAdvancing}
            className={`bg-amber-600 hover:bg-amber-500 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg border-2 border-amber-400 shadow-xl font-bold text-lg transition-all hover:scale-105 active:scale-95 ${
              isAdvancing ? 'animate-pulse' : ''
            }`}
          >
            {isAdvancing ? '推进中...' : '推进到下一天'}
          </button>
        )}
      </div>

      {/* 进度条 */}
      <div className="mt-2 h-2 bg-amber-950 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-500"
          style={{ width: `${(currentDay / 5) * 100}%` }}
        />
      </div>
    </div>
  );
}
