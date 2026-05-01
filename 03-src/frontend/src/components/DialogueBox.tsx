import { useState, useEffect } from 'react';
import { Dialogue } from '../engine/types';
import { NPCPortrait } from './NPCPortrait';

interface DialogueBoxProps {
  dialogue: Dialogue;
  onChoiceSelect: (choiceIndex: number) => void;
}

export function DialogueBox({ dialogue, onChoiceSelect }: DialogueBoxProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [showChoices, setShowChoices] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // 逐字显示文本
  useEffect(() => {
    setDisplayedText('');
    setShowChoices(false);
    setIsTyping(true);

    let index = 0;
    const text = dialogue.text;

    const typeNextChar = () => {
      if (index < text.length) {
        setDisplayedText((prev) => prev + text[index]);
        index++;
        setTimeout(typeNextChar, 50); // 每50ms显示一个字符
      } else {
        setIsTyping(false);
        setShowChoices(true);
      }
    };

    typeNextChar();

    return () => {
      // 清理定时器
    };
  }, [dialogue.text]);

  const handleChoiceClick = (index: number) => {
    if (showChoices) {
      onChoiceSelect(index);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-6 bg-white/90 rounded-lg shadow-lg border-2 border-amber-900">
      {/* NPC立绘 */}
      <NPCPortrait npcId={dialogue.npcId} mood={dialogue.mood} />

      {/* 对话文本 */}
      <div className="min-h-[80px] flex items-center">
        <p className="text-gray-800 text-lg leading-relaxed">
          {displayedText}
          {isTyping && <span className="inline-block w-2 h-5 ml-1 bg-gray-800 animate-pulse">|</span>}
        </p>
      </div>

      {/* 选择分支 */}
      {showChoices && dialogue.choices && dialogue.choices.length > 0 && (
        <div className="flex flex-col gap-2 mt-4">
          {dialogue.choices.map((choice, index) => (
            <button
              key={index}
              onClick={() => handleChoiceClick(index)}
              className="px-4 py-2 bg-amber-100 hover:bg-amber-200 border border-amber-900 rounded-md text-left transition-colors"
            >
              {choice.text}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
