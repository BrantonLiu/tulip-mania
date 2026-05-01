import { useState, useEffect } from 'react';
import type { Dialogue } from '../engine/types';
import { NPCPortrait } from './NPCPortrait';

interface DialogueBoxProps {
  dialogue: Dialogue;
  onChoiceSelect: (choiceIndex: number) => void;
}

export function DialogueBox({ dialogue, onChoiceSelect }: DialogueBoxProps) {
  const [typingState, setTypingState] = useState({
    sourceText: dialogue.text,
    length: 0,
  });

  // 逐字显示文本
  useEffect(() => {
    let index = 0;
    const text = dialogue.text;
    let timer: number | undefined;
    let cancelled = false;

    if (!text) {
      return;
    }

    const typeNextChar = () => {
      if (cancelled) return;

      if (index < text.length) {
        index++;
        setTypingState({ sourceText: text, length: index });
        timer = window.setTimeout(typeNextChar, 30);
      }
    };

    timer = window.setTimeout(typeNextChar, 120);

    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [dialogue.text]);

  const handleChoiceClick = (index: number) => {
    if (showChoices) {
      onChoiceSelect(index);
    }
  };

  const isCurrentText = typingState.sourceText === dialogue.text;
  const displayedText = isCurrentText
    ? dialogue.text.slice(0, typingState.length)
    : '';
  const isTyping = !isCurrentText || typingState.length < dialogue.text.length;
  const showChoices = isCurrentText && typingState.length >= dialogue.text.length;

  return (
    <div className="dialogue-shell">
      {/* NPC立绘 */}
      <NPCPortrait npcId={dialogue.npcId} mood={dialogue.mood} />

      <div className="dialogue-content">
        {/* 对话文本 */}
        <div className="dialogue-text-wrap">
          <p className="dialogue-text">
            {displayedText}
            {isTyping && <span className="typewriter-caret typewriter-caret-dark" aria-hidden="true" />}
          </p>
        </div>

        {/* 选择分支 */}
        {showChoices && dialogue.choices && dialogue.choices.length > 0 && (
          <div className="dialogue-choices">
            {dialogue.choices.map((choice, index) => (
              <button
                key={index}
                onClick={() => handleChoiceClick(index)}
                className="dialogue-choice"
              >
                {choice.text}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
