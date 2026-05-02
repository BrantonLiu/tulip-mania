import { useState, useEffect } from 'react';
import { useGameStore, selectGamePhase } from './engine/gameState';
import { LoadingScreen } from './components/LoadingScreen';
import { IntroScene } from './components/IntroScene';
import { TavernScene } from './components/TavernScene';
import { EndingScene } from './components/EndingScene';
import { HistoryScene } from './components/HistoryScene';
import { preloadAllDialogues } from './utils/dialogueLoader';
import './index.css';

function App() {
  const gamePhase = useGameStore(selectGamePhase);
  const [loaded, setLoaded] = useState(false);

  // 预加载所有对话数据
  useEffect(() => {
    preloadAllDialogues();
  }, []);

  // 根据游戏阶段渲染不同场景
  const renderScene = () => {
    switch (gamePhase) {
      case 'intro':
        return <IntroScene />;
      case 'trading':
        return <TavernScene />;
      case 'ending':
        return <EndingScene />;
      case 'history':
        return <HistoryScene />;
      default:
        return <IntroScene />;
    }
  };

  if (!loaded) {
    return (
      <div className="App">
        <LoadingScreen onComplete={() => setLoaded(true)} />
      </div>
    );
  }

  return (
    <div className="App">
      {renderScene()}
    </div>
  );
}

export default App
