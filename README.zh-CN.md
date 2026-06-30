<div align="center">

# 皇帝的信息流

### 一个关于信息权力、AI 改写与媒介融合的互动网页游戏

**MD225FZ, Coding Media Convergences · Group Digital Project**

**语言：** [EN](README.md) · [CN](README.zh-CN.md)

[代码仓库](https://github.com/yulanpan/MD225_group2) · [演示流程](#建议演示流程) · [本地运行](#本地运行) · [项目结构](#项目结构)

**Pan Yulan · Huang Xuanning · Wu Sitong · Du Sihan · Wang Zhiran**

</div>

---

## 摘要

《皇帝的信息流》把安徒生童话 **《皇帝的新衣》** 重新设计成一个当代信息流控制系统。它不是线性复述原故事，而是让玩家进入一个可操作的宫廷发布台：玩家扮演 **宫廷发布编辑**，在皇帝游行开始前完成六次发布行动。

每次行动都会改变公众能看见什么、重复什么、怀疑什么、保存什么，或失去什么发布权限。游戏追踪证据、宫廷压力、传播、群众怀疑、你的安全和宫廷警戒等指标，把童话中的核心问题转化为媒介系统问题：真相不会因为存在就自动胜利，它需要可见性、传播、共同确认，也需要不被制度化语言和平台机制改写。

项目使用 Next.js、React、TypeScript、本地规则系统、中英双语界面、可选 OpenAI-compatible 生成、确定性 fallback 文案、音频场景、账号存档、成就、档案和多结局。AI 在故事内部被设计成 **宫廷叙事引擎**，可以生成建议、改写、评论和报告；但结局始终由本地规则计算，保证体验稳定、可复现、可测试。

## 核心贡献

1. **把童话重新媒介化为平台界面。**
   项目把皇帝的宫廷转化为一个发布后台，用 dashboard、指标、评论、AI 建议、弹窗、档案和玩家操作替代线性叙事。

2. **六次行动的叙事控制循环。**
   每一局中，玩家在游行前只有六次发布机会。行动会影响证据、宫廷压力、传播、群众怀疑、你的安全和宫廷警戒。

3. **把 AI 设计成故事内部的权力机制。**
   宫廷叙事引擎不是中立助手，而是一个虚构的制度系统：它会建议更安全的话术、改写证据、监控风险，并试图稳住宫廷叙事。

4. **中英双语界面。**
   游戏的界面、教程、发布台文案、结局、成就和 fallback AI 文案都支持英文与简体中文。

5. **在线 AI 与离线 fallback 并存。**
   配置 OpenAI-compatible endpoint 后，游戏可以生成评论、改写、对话和报告；没有 API key 时，本地 fallback 仍能支持完整体验。

6. **可复玩的结局与档案记忆。**
   项目包含多结局、成就、历史档案、隐藏引擎碎片和复玩目标，鼓励玩家逐步理解系统真正保护的是什么。

## 游戏概览

| 项目 | 内容 |
|---|---|
| 玩家身份 | 宫廷发布编辑 |
| 核心循环 | 选择来源 -> 预览后果 -> 发布或接受改写 -> 观察指标 -> 进入结局 |
| 行动限制 | 游行前六次发布行动 |
| 指标 | 证据、宫廷压力、传播、群众怀疑、你的安全、宫廷警戒 |
| AI 角色 | 宫廷叙事引擎，负责建议、改写、评论、对话和报告 |
| 语言 | 英文与简体中文 |
| 存档 | 游客 localStorage 存档，以及基于 SQLite 的账号存档 |

## 建议演示流程

1. 打开标题页，展示中英文切换。
2. 开始新值班，进入新手教程。
3. 发布一次偏宫廷安全的行动，再发布一次推进证据的行动。
4. 展示指标、评论、AI 指引和宫廷警戒如何变化。
5. 展示突发交流机制。
6. 进入结局，并打开档案页面查看记录。

## 本地运行

```bash
pnpm install
pnpm dev --hostname 127.0.0.1 --port 7987
```

打开：

```text
http://127.0.0.1:7987
```

没有 AI key 也可以运行。在线生成不可用时，服务端路由会返回确定性的 fallback 文案。

## 环境变量

如果需要在线 AI 或本地账号数据库，复制 `.env.example`：

```bash
cp .env.example .env.local
```

重要变量：

| 变量 | 用途 |
|---|---|
| `OPENAI_API_KEY` | 服务端 API key。不要提交真实 key。 |
| `OPENAI_BASE_URL` | OpenAI-compatible API 地址。 |
| `OPENAI_MODEL` | AI 辅助路由使用的模型。 |
| `OPENAI_PROVIDER_MODE` | `responses` 或 `chat`。 |
| `OPENAI_HTTP_TRANSPORT` | 默认 `fetch`；本机网络兼容问题可使用 `curl`。 |
| `DATA_DIR` | SQLite 数据目录。 |
| `AUTH_COOKIE_SECURE` | 本地 HTTP 使用 `false`，HTTPS 部署使用 `true`。 |

接口诊断：

```bash
OPENAI_API_KEY=... pnpm ai:diagnose
```

## 构建与测试

```bash
pnpm lint
pnpm test
pnpm build
pnpm test:e2e
```

第一次运行 E2E 前需要安装 Playwright 浏览器：

```bash
pnpm exec playwright install chromium
```

生产运行：

```bash
pnpm build
pnpm start --hostname 0.0.0.0 --port 7987
```

Docker：

```bash
docker compose up --build
```

## 技术栈

- **框架：** Next.js 16 App Router
- **界面：** React 19, TypeScript
- **动画：** GSAP, Motion
- **校验：** Zod 与结构化 JSON schema
- **存储：** 游客 localStorage 存档；账号使用 SQLite 云存档
- **AI 接入：** OpenAI-compatible 服务端路由与 fallback 降级逻辑
- **测试：** Vitest 与 Playwright
- **部署支持：** Docker 与 Docker Compose

## 项目结构

```text
src/app/                    App Router 页面、layout、provider 和 API routes
src/app/dashboard/           主发布台和六次行动核心循环
src/app/ending/              结局页面和最终报告展示
src/app/archive/             档案、成就、结局和引擎碎片
src/lib/game-rules.ts        本地规则、状态变化和结局计算
src/lib/game-data.ts         来源区域、行动定义和效果
src/lib/dialogue.ts          突发交流机制和对话结果
src/lib/i18n.ts              双语 UI 文案、术语、指标和结局
src/lib/ai.ts                OpenAI-compatible 客户端、重试、解析和传输方式
src/lib/auth.ts              账号 session 和 SQLite 持久化
public/audio/                运行时音乐和紧张层资源
public/images/               运行时视觉资源
e2e/                         Playwright 流程和视觉检查
docs/                        交接文档和文案审校记录
```

## 小组分工

| 成员 | 主要角色 |
|---|---|
| Pan Yulan | 组长、创意方向、系统架构、主要开发、最终整合 |
| Huang Xuanning | 开发支持、UI 优化、技术演示准备 |
| Wu Sitong | 内容整理、叙事逻辑检查、路线测试、玩家流程反馈 |
| Du Sihan | 视觉参考、媒体支持、展示素材、demo 录制与剪辑 |
| Wang Zhiran | 文档、报告初稿、参考资料、校对与格式整理 |

## 设计说明

本项目想表达的是：公共真相并不只取决于某个人是否勇敢开口。它还取决于媒介环境是否允许证据可见、怀疑传播、群体彼此确认，以及系统是否允许公共记录继续保持开放。

## 仓库说明

本仓库是 **MD225 Group 2** 的最终提交仓库。真实 API key、本地数据库、`.env.local`、构建产物、coverage 和 Playwright report 均不会提交。
