# Tulip Crash 1637 项目规则

## 项目概况

**郁金香崩盘 Tulip Crash 1637** — Galgame风格交易模拟器，重现1637年荷兰郁金香泡沫的崩塌时刻。

- 2分钟内完整体验主流程
- 5个NPC角色，通过对话推进天数
- 6种可交易资产（4种郁金香+房产契约+航海股份）
- 5个不同结局，根据玩家财富判定

## 目录结构

```
00-data/                    游戏数据（价格表、对话树、NPC数据）
├── historical-data.json    历史价格数据
└── dialogues/              NPC对话JSON（5个角色×5天）
01-research/                历史资料、设计参考（中英双语）
02-docs/                    项目文档
├── 00-PRD-05011330.md      v0 原始PRD
├── 01-技术文档-05011330.md  技术架构文档
├── 02-PRD-V2-05011652.md   v2 功能完善设计文档
├── 02-PRD-v3-05020026.md   v3 Bug修复+史实纠正
├── 03-PRD-v4-05020026.md   v4 加载体验+结算+彩蛋
└── 04-PRD-v5-05021648.md   v5 剩余需求汇总（当前迭代）
03-src/
├── frontend/               React前端
│   ├── src/
│   │   ├── components/     UI组件（TavernScene/TradePanel/EndingScene等）
│   │   ├── engine/         纯逻辑引擎（priceEngine/tradingEngine/dayEngine）
│   │   └── store/          Zustand状态管理
│   └── public/
│       ├── images/         美术素材（NPC立绘/背景/郁金香/海报）
│       └── data/           前端数据副本
└── scripts/                工具脚本
    ├── generate-art-v2.mjs     美术素材生成
    ├── generate-music.mjs      音乐生成
    └── generate-poster-titled.mjs  海报生成
orchestration/              编排层（调度日志）
├── dispatch-log-20260501.md
└── dispatch-log-20260502.md
```

## ⚠️ 开发流程硬约束（不可跳过）

**原则：文档先行，开发在后。**

流程：设计文档变更 → 开发 → 测试 → review（大版本） → commit & push

### 1. 调度日志
- 路径：`orchestration/dispatch-log-YYYYMMDD.md`
- 每次发任务前必须记录
- 格式：时间 | 阶段 | 任务 | 执行者 | 状态 | 备注

### 2. 文档先行
- 所有变更（包括规则本身）必须先更新文档，再写代码
- 新功能 → 先更新PRD/技术文档
- 架构变更 → 先更新技术文档
- 规则变更 → 先更新本文件

### 3. 工具链
- **开发**：Claude（ACP harness）
- **小版本review**：Codex（每个功能commit前必须review通过）
- **里程碑review**：Codex（里程碑全部功能完成后全量review）
- **难题兜底**：Codex协助解决Claude多次（≥3次）失败的问题

### 3.1 每个功能的开发流程（不可跳过）
1. 开发功能代码
2. 运行 `vitest` + `npm run build` 确认通过
3. **Codex review**（`codex review --uncommitted` 或指定commit范围）
4. 如果 review 通过 → commit
5. 如果 review 不通过 → 修复 → 重新 Codex review → 通过后 commit
6. 更新调度日志

### 3.2 里程碑完成流程
1. 所有功能 commit 完成后
2. **Codex 全量 review**（review 整个里程碑的改动）
3. 如果通过 → push 到 origin/main → 更新调度日志
4. 如果不通过 → 逐个修复 → 重新 review → 通过后 push

### 4. 里程碑编排
- 一次只给子agent一个里程碑，不批量
- 里程碑间由主agent编排、检查、记录调度日志
- 需用户审批的环节暂停等待

### 5. spawn子agent时
- 流程约束写在task prompt最前面
- 完成后报告，由主agent更新调度日志
- 遇阻碍记录，不自行绕过

## 命名规范

- 目录：`序号-内容`，序号两位数字，如 `00-data`、`01-research`
- 文档文件：`序号-名称-mmddhhmm`，如 `00-PRD-05011330.md`
- 序号从 00 开始递增

## 开发原则

1. **设计优先**：先完成设计文档再编码，所有功能和页面在动手前必须已有设计
2. **测试优先**：先写测试用例再写实现，测试覆盖单元测试和端到端测试
3. **核心逻辑与UI分离**：价格引擎、交易引擎、天数引擎等核心逻辑必须是纯函数，无UI依赖
4. **美术素材占位优先**：M0-M2阶段用纯色块+文字描述占位，M3阶段生成真实素材

## 项目文档

| 文档 | 文件 | 状态 |
|---|---|---|
| v0 PRD | `02-docs/00-PRD-05011330.md` | ✅ 已完成 |
| 技术文档 | `02-docs/01-技术文档-05011330.md` | ✅ 已完成 |
| v2 设计文档 | `02-docs/02-PRD-V2-05011652.md` | ✅ 已完成 |
| v3 PRD | `02-docs/02-PRD-v3-05020026.md` | ✅ 已完成 |
| v4 PRD | `02-docs/03-PRD-v4-05020026.md` | ✅ 已完成 |
| **v5 PRD（当前迭代）** | `02-docs/04-PRD-v5-05021648.md` | 🔄 进行中 |
| 调度日志 | `orchestration/dispatch-log-2026050*.md` | ✅ 已创建 |

## NPC角色

| ID | 中文名 | 身份 | 图片文件 |
|---|---|---|---|
| cornelis | 科内利斯 | 老油条花商，50岁，银发蓝眼 | cornelis.png |
| anna | 安娜 | 谨慎寡妇，35岁，紧张抱账本 | anna.png |
| hendrik | 亨德里克 | 赌徒，28岁，卖房梭哈 | hendrik.png |
| maria_host | 玛丽亚 | 老板娘，45岁，看透一切 | maria_host.png |
| stranger | 神秘商人 | 年龄不详，灰色眼睛 | stranger.png |

## 美术素材

| 类型 | 文件 | 尺寸 |
|---|---|---|
| 酒馆背景 | tavern.png | 1536x1024 |
| NPC立绘×5 | cornelis/anna/hendrik/maria_host/stranger.png | 1024x1536 |
| 郁金香×4 | semper_augustus/gouda/viceroy/black_tulip.png | 1024x1024 |
| 海报（带标题） | poster-titled.png | 1536x1024 |

路径：`03-src/frontend/public/images/`
清单：`03-src/frontend/public/images/manifest.json`
生成脚本：`03-src/scripts/generate-art-v2.mjs`

## 技术栈

| 层级 | 技术 |
|---|---|
| 前端框架 | React 19 + TypeScript |
| 构建工具 | Vite 6 |
| 样式方案 | TailwindCSS 4 |
| 状态管理 | Zustand |
| 测试 | Vitest + Playwright |
| 图片生成 | GPT-image-2 via 302AI |

## 302AI调用参数

- Endpoint: `https://api.302.ai/v1/images/generations`
- Model: `gpt-image-2`
- 支持的size: `1024x1024`, `1024x1536`, `1536x1024`（不支持自定义如1920x1080）
- 返回: `data[0].b64_json`

## 开发里程碑

| 里程碑 | 内容 | PRD版本 | 状态 |
|---|---|---|---|
| M0 | 项目骨架 + 设计文档 | v0 | ✅ 已完成 |
| M1 | 核心交易引擎（纯逻辑） | v0 | ✅ 已完成 |
| M2 | Galgame对话系统 | v0 | ✅ 已完成 |
| M3 | 美术素材生成 | v0 | ✅ 已完成（已审批通过） |
| M4 | 主界面集成 | v0 | ✅ 已完成 |
| M5 | 完整游戏流程 | v0 | ✅ 已完成 |
| M6 | Polish + 测试 | v0 | ✅ 已完成（构建成功） |
| V2 | 功能完善（对话系统/NPC列表/卖出/啤酒/面板互斥） | v2 | ✅ 已完成 |
| M7 | 紧急修复（对话变量/字体/合约制+史实纠正） | v3 | ✅ 已完成 |
| M10 | 加载页+Day5崩盘+动画优化+域名彩蛋 | v4 | ✅ 已完成 |
| M12 | 二次游玩跳过开场动画 | v4 | ✅ 已完成（FEAT-17） |
| **M13** | **结局与结算深度（隐藏结局/文案细化/历史板块）** | **v5** | **⏳ 待开发** |
| **M14** | **交互细节优化（买不起提示/啤酒记录/面板切换）** | **v5** | **⏳ 待开发** |
| **M15** | **视觉与动效打磨（资产图片/NPC信息/对话跳转/光标）** | **v5** | **⏳ 待开发** |
| **M16** | **增值功能（走势图/多结局追踪/音效BGM）** | **v5** | **⏳ 待开发** |

## ⚠️ 已知问题

1. v2-10（基于research文档校准对话与商品金额）状态为 Paused，未完成
2. v0 PRD 中 `00-PRD-05011330.md` 存在未解决的 git 冲突标记（HEAD/45af9b7），不影响运行但需清理
3. 房产契约和航海股份在交易面板中缺少对应图片（FEAT-04，v5 M15）

## 参考项目

HBTI项目在 `/Users/litangjuan/branton/coding/06-game-dev/HBTI/`

## 部署信息

| 项目 | 详情 |
|---|---|
| 平台 | Cloudflare Pages |
| 项目名称 | tulip-crash |
| 生产域名 | https://tulip-crash.pages.dev |
| 生产分支 | main |
| 构建命令 | `cd 03-src/frontend && npm run build` |
| 输出目录 | `03-src/frontend/dist` |
| 首次部署 | 2026-05-02 |
| 工具 | Wrangler 4.87.0 (全局安装) |

### 快速部署命令

```bash
# 从项目根目录执行：构建并部署到生产环境
cd 03-src/frontend && npm run build && wrangler pages deploy dist --project-name tulip-crash --commit-dirty=true
```

### 部署历史

| 日期 | 部署URL | 说明 |
|---|---|---|
| 2026-05-02 | https://tulip-crash.pages.dev | 新项目生产域名（迁移后） |
| 2026-05-02 | https://86913b2a.tulip-crash.pages.dev | 新项目首次生产部署（迁移后） |
| 2026-05-02 | https://78644fea.tulip-mania.pages.dev | 旧项目首次部署（迁移前） |
| 2026-05-02 | https://f8ad2839.tulip-mania.pages.dev | 旧项目生产部署（commit 6a7d111，迁移前） |

### Cloudflare Pages 项目配置

- **Framework preset**: None (手动构建)
- **Build command**: `cd 03-src/frontend && npm run build`
- **Build output directory**: `03-src/frontend/dist`
- **Root directory**: `/` (项目根)
- **Node.js version**: 自动检测

### 管理命令

```bash
# 查看项目列表
wrangler pages project list

# 查看部署历史
wrangler pages deployment list --project-name tulip-crash

# 回滚到指定部署
wrangler pages deployment rollback --project-name tulip-crash
```
