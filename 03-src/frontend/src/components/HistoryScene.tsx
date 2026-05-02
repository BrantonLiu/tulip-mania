import { useGameStore } from '../engine/gameState';

const FACT_CARDS = [
  {
    question: '泡沫到底有多大？',
    answer:
      '远没有传说中那么夸张。参与郁金香投机的实际人数仅有数百人，主要是商人和熟练手工艺人。整个交易规模比后世渲染的要小得多。',
  },
  {
    question: '真有人卖房吗？',
    answer:
      '极少数。大部分交易都是纸面合约（"风中交易" windhandel），真正的球根交割很少发生。所谓的"一栋房子换一颗球根"更多是后来的文学夸张。',
  },
  {
    question: '经济崩了吗？',
    answer:
      '并没有。荷兰黄金时代在泡沫之后继续繁荣了几十年。VOC（荷兰东印度公司）的股票持续上涨，阿姆斯特丹依然是欧洲的金融中心。这场泡沫的影响被后人严重夸大了。',
  },
  {
    question: '交易的是球根吗？',
    answer:
      '冬季交易的全部是纸面合约。真正的球根在地里，要等到夏天才能挖出来。人们交易的是"未来交付球根的承诺"——一种远期合约，而非实物本身。',
  },
  {
    question: '后来怎么样了？',
    answer:
      '1637年2月，哈勒姆的买家率先停止出价，市场信心一夜之间崩溃。各地召开了紧急会议试图解决合约纠纷，但法院最终将郁金香合约视为"赌博债务"，不予强制执行。大多数合约就此作废。',
  },
];

const RESEARCH_LINKS = {
  cn: [
    { title: '郁金香狂热经济史研究', file: '00-tulip-mania-economics-cn.md' },
    { title: '阿姆斯特丹日常生活', file: '01-amsterdam-daily-life-cn.md' },
    { title: '荷兰黄金时代文化', file: '02-dutch-golden-age-culture-cn.md' },
    { title: '郁金香品种与贸易', file: '03-tulip-varieties-and-trade-cn.md' },
    { title: '史料来源与学术争议', file: '04-sources-and-scholarship-cn.md' },
  ],
  en: [
    { title: 'Tulipmania Economics', file: '00-tulip-mania-economics.md' },
    { title: 'Amsterdam Daily Life', file: '01-amsterdam-daily-life.md' },
    { title: 'Dutch Golden Age Culture', file: '02-dutch-golden-age-culture.md' },
    { title: 'Tulip Varieties & Trade', file: '03-tulip-varieties-and-trade.md' },
    { title: 'Sources & Scholarship', file: '04-sources-and-scholarship.md' },
  ],
};

const RECOMMENDED_BOOKS = [
  {
    author: 'Anne Goldgar',
    title: 'Tulipmania',
    year: 2007,
    note: '颠覆传统叙事的学术经典，证明泡沫规模远比传说中小',
  },
  {
    author: 'Mike Dash',
    title: 'Tulipomania',
    year: 2001,
    note: '生动的叙事历史，兼顾学术严谨与可读性',
  },
];

const REPO_BASE = 'https://github.com/brantonx/tulip-crash/blob/main/01-research';

export function HistoryScene() {
  const { resetGame, setGamePhase } = useGameStore();

  const handlePlayAgain = () => {
    resetGame();
    setGamePhase('intro');
  };

  const handleBackToEnding = () => {
    setGamePhase('ending');
  };

  return (
    <div className="history-scene">
      <div className="history-background" />

      <div className="history-content">
        <h1 className="history-title">历史回响</h1>
        <p className="history-subtitle">
          游戏结束，但真实的历史才刚刚开始
        </p>

        {/* 核心事实卡片 */}
        <section className="history-section">
          <h2>你知道吗？</h2>
          <div className="history-cards">
            {FACT_CARDS.map((card, i) => (
              <div key={i} className="history-card">
                <h3>{card.question}</h3>
                <p>{card.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 调研报告链接 */}
        <section className="history-section">
          <h2>延伸阅读</h2>
          <div className="history-links-grid">
            <div className="history-links-column">
              <h3>中文</h3>
              {RESEARCH_LINKS.cn.map((link) => (
                <a
                  key={link.file}
                  href={`${REPO_BASE}/${link.file}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="history-link"
                >
                  {link.title}
                </a>
              ))}
            </div>
            <div className="history-links-column">
              <h3>English</h3>
              {RESEARCH_LINKS.en.map((link) => (
                <a
                  key={link.file}
                  href={`${REPO_BASE}/${link.file}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="history-link"
                >
                  {link.title}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* 推荐书目 */}
        <section className="history-section">
          <h2>推荐书目</h2>
          {RECOMMENDED_BOOKS.map((book) => (
            <div key={book.title} className="history-book">
              <div className="history-book-title">
                {book.author} — <em>{book.title}</em> ({book.year})
              </div>
              <div className="history-book-note">{book.note}</div>
            </div>
          ))}
        </section>

        {/* 操作按钮 */}
        <div className="history-actions">
          <button
            onClick={handlePlayAgain}
            className="game-button game-button-primary"
          >
            再来一次
          </button>
          <button
            onClick={handleBackToEnding}
            className="game-button game-button-secondary"
          >
            返回结局
          </button>
        </div>
      </div>
    </div>
  );
}
