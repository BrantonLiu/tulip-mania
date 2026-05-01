import { useGameStore, selectGamePhase } from './engine/gameState';
import { IntroScene } from './components/IntroScene';
import { TavernScene } from './components/TavernScene';
import { EndingScene } from './components/EndingScene';
import './index.css';

function App() {
  const gamePhase = useGameStore(selectGamePhase);

  // 根据游戏阶段渲染不同场景
  const renderScene = () => {
    switch (gamePhase) {
      case 'intro':
        return <IntroScene />;
      case 'trading':
        return <TavernScene />;
      case 'ending':
        return <EndingScene />;
      default:
        return <IntroScene />;
    }
  };

  return (
    <div className="App">
      {renderScene()}
    </div>
  );
}

export default App
