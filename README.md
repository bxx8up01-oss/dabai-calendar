# 大白日程 - 四象限日历管理

一个基于 React + Vite + Node.js 的全栈日程管理应用，支持四象限分类、倒计时、周报月报生成，并提供对外 API 供豆包等 AI 助手调用。

## 功能特性

- 📅 **日历视图**：月/周/日三种视图切换
- 🎯 **四象限看板**：重要且紧急 / 重要不紧急 / 紧急不重要 / 不紧急不重要
- 🏷️ **工作/生活板块**：事项分类管理
- ⏰ **倒计时功能**：重要事项倒计时提醒
- ✅ **任务完成标记**：一键标记完成
- 📊 **周报/月报**：自动生成统计报告，支持一键复制
- 🔌 **对外 API**：REST API 接口，支持豆包等 AI 助手调用创建日程
- 💾 **数据持久化**：PostgreSQL 数据库（Vercel Postgres）

## 技术栈

- **前端**：React 19 + Vite + Tailwind CSS 4 + React Router
- **后端**：Node.js + Vercel Serverless Functions
- **数据库**：PostgreSQL（生产）/ SQLite（本地开发）
- **图标**：Lucide React

## 快速部署到 Vercel

### 1. 准备工作

- 注册 [Vercel](https://vercel.com) 账号
- 注册 [GitHub](https://github.com) 账号（用于托管代码）

### 2. 上传代码到 GitHub

1. 在 GitHub 创建一个新仓库（如 `dabai-calendar`）
2. 将本项目所有文件上传到仓库

### 3. 在 Vercel 导入项目

1. 登录 Vercel，点击「Add New...」→「Project」
2. 选择刚才创建的 GitHub 仓库
3. 框架预设选择「Vite」
4. 点击「Deploy」开始部署

### 4. 添加数据库

1. 部署完成后，进入项目 →「Storage」→「Create Database」
2. 选择「Postgres」，创建数据库
3. 数据库会自动连接到项目，`DATABASE_URL` 环境变量会自动配置

### 5. 配置环境变量

1. 进入项目 →「Settings」→「Environment Variables」
2. 添加以下变量：
   - `API_KEY`：自定义一个密钥（用于 API 鉴权），例如 `dabai-calendar-2024-xxx`
3. 保存后重新部署

### 6. 验证部署

1. 访问部署后的域名
2. 打开「设置」页面，确认 API 密钥和接口地址显示正确
3. 测试接口：
   ```bash
   curl -X POST https://你的域名/api/tasks \
     -H "Content-Type: application/json" \
     -H "X-API-Key: 你的API密钥" \
     -d '{"title":"测试事项","date":"2024-01-15","startTime":"09:00","endTime":"10:00","category":"work","quadrant":"important_urgent"}'
   ```

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

本地开发默认使用 SQLite 数据库，数据存储在 `./data/calendar.db`。

## API 文档

### 鉴权

所有 `/api/tasks` 接口需要在请求头中携带 `X-API-Key`。

### 创建日程

```
POST /api/tasks
Content-Type: application/json
X-API-Key: 你的API密钥

{
  "title": "事项标题",
  "date": "2024-01-15",
  "startTime": "09:00",
  "endTime": "10:00",
  "category": "work",
  "quadrant": "important_urgent",
  "note": "备注",
  "isCountdown": false,
  "isCompleted": false
}
```

### 查询日程

```
GET /api/tasks?date=2024-01-15&category=work&completed=false
X-API-Key: 你的API密钥
```

### 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | string | 是 | 事项标题 |
| date | string | 是 | 日期，YYYY-MM-DD |
| startTime | string | 否 | 开始时间，HH:mm，默认 09:00 |
| endTime | string | 否 | 结束时间，HH:mm，默认 10:00 |
| category | string | 是 | 板块：work / life |
| quadrant | string | 否 | 四象限：important_urgent / important_not_urgent / not_important_urgent / not_important_not_urgent |
| note | string | 否 | 备注 |
| isCountdown | boolean | 否 | 是否倒计时 |
| isCompleted | boolean | 否 | 是否已完成 |

## 豆包自定义技能配置

1. 打开豆包 → 侧边栏「技能」→ 创建自定义技能
2. 技能描述：当用户说"记一下"、"安排"、"提醒我"等与日程相关的内容时，调用大白日程 API 创建日程
3. API 配置：
   - 请求方法：POST
   - 接口地址：`https://你的域名/api/tasks`
   - 请求头：`Content-Type: application/json`，`X-API-Key: 你的API密钥`
4. 配置参数提取规则，从用户语音中提取标题、日期、时间、板块、四象限等信息

## 项目结构

```
dabai-calendar/
├── api/
│   ├── [...path].ts        # API 入口（Vercel Serverless Function）
│   └── lib/
│       └── db.ts            # 数据库层（PostgreSQL/SQLite）
├── src/
│   ├── components/
│   │   ├── Layout.tsx       # 布局组件
│   │   ├── Header.tsx       # 顶部导航
│   │   └── EventDialog.tsx  # 添加/编辑事项弹窗
│   ├── contexts/
│   │   └── event-context.tsx # 事项状态管理
│   ├── data/
│   │   └── calendar.ts      # 类型定义和 mock 数据
│   ├── hooks/
│   │   ├── use-calendar-events.ts # 事项数据 hook
│   │   ├── use-view-pref.ts       # 视图偏好 hook
│   │   └── use-mobile.ts          # 移动端检测 hook
│   ├── lib/
│   │   └── utils.ts         # 工具函数
│   ├── pages/
│   │   ├── CalendarPage/    # 日历页
│   │   ├── QuadrantPage/    # 四象限看板
│   │   ├── ReportPage/      # 周报月报
│   │   ├── SettingsPage/    # 设置页
│   │   └── NotFoundPage/    # 404页
│   ├── App.tsx              # 应用入口
│   ├── main.tsx             # 渲染入口
│   └── index.css            # 全局样式
├── package.json
├── vercel.json              # Vercel 配置
├── vite.config.ts           # Vite 配置
├── tsconfig.json            # TypeScript 配置
└── README.md
```

## License

MIT
