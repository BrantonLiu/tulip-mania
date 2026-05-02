import { useState, useEffect } from 'react';
import { useGameStore } from '../engine/gameState';

const INTRO_TEXTS = [
  '1637年1月31日，荷兰，阿姆斯特丹',
  '最贵的郁金香球茎合约价格，足以购买运河边的一套房子',
  '你是一名远道而来的郁金香商人',
  '你将在这里驻留五天',
  '是搏一搏让资产翻倍',
  '还是静待泡沫破碎',
  '选择权在你，推开这扇酒馆的门吧',
];

const SEEN_KEY = 'tulip-crash-intro-seen';
const OLD_SEEN_KEY = 'tulip-mania-intro-seen';

function hasSeenIntro(): boolean {
  try {
    // 兼容旧版key（tulip-mania），如有则迁移到新key
    const oldValue = localStorage.getItem(OLD_SEEN_KEY);
    if (oldValue === 'true') {
      localStorage.setItem(SEEN_KEY, 'true');
      localStorage.removeItem(OLD_SEEN_KEY);
      return true;
    }
    return localStorage.getItem(SEEN_KEY) === 'true';
  } catch {
    return false;
  }
}

function markIntroSeen() {
  try {
    localStorage.setItem(SEEN_KEY, 'true');
  } catch {
    // localStorage 不可用也不阻塞
  }
}

export function IntroScene() {
  const { setGamePhase } = useGameStore();
  const skipAnimation = hasSeenIntro();
  const [currentText, setCurrentText] = useState(skipAnimation ? INTRO_TEXTS.length - 1 : 0);
  const [typedText, setTypedText] = useState(
    skipAnimation
      ? { textIndex: INTRO_TEXTS.length - 1, length: INTRO_TEXTS[INTRO_TEXTS.length - 1].length }
      : { textIndex: 0, length: 0 }
  );

  // 逐字显示效果
  useEffect(() => {
    if (skipAnimation || currentText >= INTRO_TEXTS.length) return;

    const text = INTRO_TEXTS[currentText];
    let index = 0;
    let typingTimer: number | undefined;
    let pauseTimer: number | undefined;
    let cancelled = false;

    const typeNextChar = () => {
      if (cancelled) return;

      if (index < text.length) {
        index++;
        setTypedText({ textIndex: currentText, length: index });
        typingTimer = window.setTimeout(typeNextChar, 72);
      } else {
        // 最后一句打完后标记已看过
        if (currentText === INTRO_TEXTS.length - 1) {
          markIntroSeen();
        }
        pauseTimer = window.setTimeout(() => {
          if (!cancelled && currentText < INTRO_TEXTS.length - 1) {
            setCurrentText((prev) => prev + 1);
          }
        }, 1400);
      }
    };

    typingTimer = window.setTimeout(typeNextChar, 220);

    return () => {
      cancelled = true;
      if (typingTimer) window.clearTimeout(typingTimer);
      if (pauseTimer) window.clearTimeout(pauseTimer);
    };
  }, [currentText, skipAnimation]);

  const handleEnterTavern = () => {
    markIntroSeen();
    setGamePhase('trading');
  };

  const displayText =
    typedText.textIndex === currentText
      ? INTRO_TEXTS[currentText].slice(0, typedText.length)
      : '';
  const isFinalTextComplete =
    currentText === INTRO_TEXTS.length - 1 && displayText === INTRO_TEXTS[currentText];

  return (
    <div className="intro-scene">
      <div className="intro-backdrop" />
      <div className="intro-vignette" />

      {/* 内容 */}
      <div className="intro-content">
        <div className="intro-kicker">Amsterdam, winter 1637</div>

        {/* 对话文本 */}
        <div className="intro-copy">
          {skipAnimation ? (
            <div className="intro-text-skip">
              {INTRO_TEXTS.map((text, i) => (
                <p key={i}>{text}</p>
              ))}
            </div>
          ) : (
            <p className="intro-text">
              {displayText}
              {!isFinalTextComplete && (
                <span className="typewriter-dot" aria-hidden="true" />
              )}
            </p>
          )}
        </div>

        {/* 进入按钮 */}
        {(isFinalTextComplete || skipAnimation) && (
          <button
            onClick={handleEnterTavern}
            className="game-button game-button-primary intro-enter"
          >
            推门进入
          </button>
        )}
      </div>
    </div>
  );
}
