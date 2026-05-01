import { useState, useEffect, useCallback } from 'react';

interface LoadingScreenProps {
  onComplete: () => void;
}

// 需要预加载的图片列表
const IMAGES_TO_PRELOAD = [
  '/images/poster-titled.png',
  '/images/tavern.png',
  '/images/cornelis.png',
  '/images/anna.png',
  '/images/hendrik.png',
  '/images/maria_host.png',
  '/images/stranger.png',
  '/images/semper_augustus.png',
  '/images/gouda.png',
  '/images/viceroy.png',
  '/images/black_tulip.png',
  '/images/estate.png',
  '/images/voyage.png',
];

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [statusText, setStatusText] = useState('加载字体...');

  useEffect(() => {
    let cancelled = false;
    let loadedCount = 0;
    const totalTasks = IMAGES_TO_PRELOAD.length + 1; // +1 for fonts

    const updateProgress = () => {
      if (cancelled) return;
      loadedCount++;
      setProgress(Math.min(Math.round((loadedCount / totalTasks) * 100), 100));
    };

    const loadAll = async () => {
      // 1. 等待字体加载（最多3秒，超时不阻塞）
      try {
        await Promise.race([
          document.fonts.ready,
          new Promise<void>((resolve) => setTimeout(resolve, 3000)),
        ]);
      } catch {
        // 字体加载失败不阻塞
      }
      if (cancelled) return;
      setStatusText('加载素材...');
      updateProgress();

      // 2. 预加载所有图片
      const imagePromises = IMAGES_TO_PRELOAD.map((src) => {
        return new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => {
            updateProgress();
            resolve();
          };
          img.onerror = () => {
            updateProgress();
            resolve();
          };
          img.src = src;
        });
      });

      await Promise.all(imagePromises);

      if (cancelled) return;
      setStatusText('准备就绪');
      setProgress(100);
      setReady(true);
    };

    loadAll();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleStart = useCallback(() => {
    onComplete();
  }, [onComplete]);

  return (
    <div className="loading-screen">
      {/* 海报背景 */}
      <div className="loading-backdrop" />
      <div className="loading-overlay" />

      {/* 内容 */}
      <div className="loading-content">
        <h1 className="loading-title">Tulip Mania</h1>
        <p className="loading-subtitle">1637</p>

        {/* 进度条 */}
        <div className="loading-bar-container">
          <div
            className="loading-bar-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="loading-status">{statusText}</p>

        {/* Start Game 按钮 */}
        <button
          onClick={handleStart}
          disabled={!ready}
          className={`loading-start-btn ${ready ? 'ready' : ''}`}
        >
          {ready ? 'Start Game' : 'Loading...'}
        </button>
      </div>
    </div>
  );
}
