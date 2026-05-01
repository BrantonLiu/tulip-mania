# Tulip Mania 1637 项目规则

## 项目概况

**郁金香狂潮 Tulip Mania 1637** — Galgame风格交易模拟器，重现1637年荷兰郁金香泡沫。

- 2分钟内完整体验主流程
- 5个NPC角色，通过对话推进天数
- 6种可交易资产（4种郁金香+房产契约+航海股份）
- 5个不同结局，根据玩家财富判定

## 目录结构

```
00-data/          游戏数据（价格表、对话树、NPC数据）
01-research/      历史资料、设计参考
02-docs/          项目文档（PRD、技术文档、开发日志）
03-src/
├── frontend/     React前端
└── scripts/      工具脚本（图片生成等）
04-tests/         Playwright测试
```

## 命名规范

- 目录：`序号-内容`，序号两位数字，如 `00-data`、`01-research`
- 文档文件：`序号-名称-mmddhhmm`，如 `00-PRD-05011330.md`
- 序号从 00 开始递增

## 开发原则

1. **设计优先**：先完成设计文档再编码，所有功能和页面在动手前必须已有设计
2. **测试优先**：先写测试用例再写实现，测试覆盖单元测试和端到端测试
3. **核心逻辑与UI分离**：价格引擎、交易引擎、天数引擎等核心逻辑必须是纯函数，无UI依赖
4. **美术素材占位优先**：M0-M2阶段用纯色块+文字描述占位，M3阶段生成真实素材

## 项目文档（开发前必须确认）

| 文档 | 文件 | 状态 |
|---|---|---|
| PRD | `02-docs/00-PRD-05011330.md` | ✅ 已完成 |
| 技术文档 | `02-docs/01-技术文档-05011330.md` | ✅ 已完成 |
| 开发日志 | `02-docs/开发日志.md` | 待创建 |
| 测试文档 | `02-docs/测试文档.md` | 待创建 |

## 数据资产（待填充）

| 文件 | 位置 | 说明 |
|---|---|---|
| NPC数据 | `00-data/npcs.json` | 5个NPC的完整数据 |
| 对话数据 | `00-data/dialogues/` | 每个NPC的对话树 |
| 价格表 | `00-data/price-table.json` | 各资产的基础价格和波动参数 |

## 美术素材（M3阶段生成）

| 资源类型 | 位置 | 说明 |
|---|---|---|
| 酒馆背景 | `00-data/art/` | 17世纪荷兰酒馆场景 |
| NPC立绘 | `00-data/art/` | 5个NPC的立绘 |
| 郁金香品种 | `00-data/art/` | 4种郁金香的原画 |

## 开发里程碑

| 里程碑 | 内容 | 状态 |
|---|---|---|
| M0 | 项目骨架 + 设计文档 | 🔄 进行中 |
| M1 | 核心交易引擎（纯逻辑） | ⏳ 待开始 |
| M2 | Galgame对话系统 | ⏳ 待开始 |
| M3 | 美术素材生成（暂停等审批） | ⏳ 待开始 |
| M4 | 主界面集成 | ⏳ 待开始 |
| M5 | 完整游戏流程 | ⏳ 待开始 |
| M6 | Polish + 测试 | ⏳ 待开始 |

## 技术栈

| 层级 | 技术 |
|---|---|
| 前端框架 | React 19 + TypeScript |
| 构建工具 | Vite 6 |
| 样式方案 | TailwindCSS 4 |
| 状态管理 | Zustand |
| 测试 | Vitest + Playwright |

## 关键约束

- **M3不执行图片生成**：只写脚本和prompt，等用户审批
- 美术占位用纯色块+文字描述即可
- 优先保证交易体验的完整性
- 黑客松demo，不做后端，纯前端实现

## 参考项目

HBTI项目在 `/Users/litangjuan/branton/coding/06-game-dev/HBTI/`，参考其：
- CLAUDE.md 的开发原则
- 目录结构
- 302AI图片生成脚本

## 当前阶段

正在执行 M1：核心交易引擎（纯逻辑，无UI）

任务清单：
- ⏳ types.ts — 类型定义（资产、交易、玩家状态）
- ⏳ priceEngine.ts — 价格引擎
- ⏳ tradingEngine.ts — 买卖逻辑
- ⏳ gameState.ts — 游戏状态管理（Zustand store）
- ⏳ dayEngine.ts — 天数推进
- ⏳ 写单元测试（Vitest）

## 开发日志

### 2026-05-01 13:35 - M0完成

✅ **M0全部完成**：项目骨架 + 设计文档

完成内容：
1. ✅ 创建目录结构
2. ✅ 写PRD文档（02-docs/00-PRD-05011330.md）
3. ✅ 写技术文档（02-docs/01-技术文档-05011330.md）
4. ✅ 写CLAUDE.md
5. ✅ 初始化Vite + React + TypeScript项目
6. ✅ 配置TailwindCSS 4
7. ✅ 配置Playwright
8. ✅ 初始化git

安装的依赖：
- zustand（状态管理）
- tailwindcss @tailwindcss/vite（样式）
- @playwright/test（E2E测试）
- vitest（单元测试）

已提交git（commit: M0完成：项目骨架+设计文档）

---

### 2026-05-01 13:30 - M0开始

创建了项目目录结构：
- 00-data/{dialogues,art-prompts}
- 01-research
- 02-docs
- 03-src/{frontend,scripts}
- 04-tests

完成了M0的前4项任务：
- ✅ PRD文档（02-docs/00-PRD-05011330.md）
- ✅ 技术文档（02-docs/01-技术文档-05011330.md）
- ✅ CLAUDE.md

正在继续M0的剩余任务：初始化Vite项目、配置TailwindCSS、配置Playwright、初始化git。
