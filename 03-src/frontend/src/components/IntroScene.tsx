import { useState, useEffect } from 'react';
import { useGameStore } from '../engine/gameState';

export function IntroScene() {
  const { setGamePhase } = useGameStore();
  const [currentText, setCurrentText] = useState(0);
  const [displayText, setDisplayText] = useState('');

  const introTexts = [
    '1637年2月3日，荷兰，阿姆斯特丹',
    '一颗郁金香球茎的价格，可以买下一栋运河旁的豪宅',
    '明天，一切都将改变',
    '但今晚...你还在酒馆里',
  ];

  // 逐字显示效果
  useEffect(() => {
    if (currentText >= introTexts.length) return;

    const text = introTexts[currentText];
    let index = 0;

    setDisplayText('');

    const typeNextChar = () => {
      if (index < text.length) {
        setDisplayText((prev) => prev + text[index]);
        index++;
        setTimeout(typeNextChar, 80); // 每80ms显示一个字符
      } else {
        // 显示完成后，等待2秒再显示下一条
        setTimeout(() => {
          if (currentText < introTexts.length - 1) {
            setCurrentText((prev) => prev + 1);
          }
        }, 2000);
      }
    };

    typeNextChar();

    return () => {
      // 清理定时器
    };
  }, [currentText]);

  const handleEnterTavern = () => {
    setGamePhase('trading');
  };

  return (
    <div
      className="relative w-full h-screen flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: "url('/images/tavern.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'blur(4px) brightness(0.7)',
      }}
    >
      {/* 黑色叠加层 */}
      <div className="absolute inset-0 bg-black/60" />

      {/* 内容 */}
      <div className="relative z-10 text-center max-w-2xl px-8">
        {/* 对话文本 */}
        <div className="mb-12">
          <p
            className="text-3xl md:text-4xl text-white font-serif leading-relaxed"
            style={{
              fontFamily: "'Playfair Display', 'Noto Serif SC', serif",
              textShadow: '2px 2px 8px rgba(0,0,0,0.8)',
            }}
          >
            {displayText}
            {currentText < introTexts.length && (
              <span className="inline-block w-3 h-6 ml-2 bg-white animate-pulse">|</span>
            )}
          </p>
        </div>

        {/* 进入按钮 */}
        {currentText >= introTexts.length - 1 && (
          <button
            onClick={handleEnterTavern}
            className="px-12 py-4 bg-amber-600 hover:bg-amber-500 text-white text-xl font-bold rounded-lg border-4 border-amber-400 shadow-2xl transition-all hover:scale-105 active:scale-95"
            style={{
              fontFamily: "'Playfair Display', serif",
            }}
          >
            进入酒馆
          </button>
        )}
      </div>

      {/* 底部装饰 */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-600 to-transparent" />
    </div>
  );
}
