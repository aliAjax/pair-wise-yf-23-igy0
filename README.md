# 舞台灯光编排模拟器

纯前端舞台灯光编排工具，支持灯具通道、场景 Cue、时间轴预览和演出方案导出，所有数据存在 IndexedDB。编排页（`/cues`）已扩展为**色温校正台**：解决新旧灯混排后同场戏冷暖不一的问题。

## 色温校正台规则

- 每盏灯记录**额定色温**和**最近两次实测值**（只保留两条，新读数顶掉旧读数）。
- 两次实测相差**超过 120K** 视为仍在**预热中**，不生成稳定结果；恰好 120K 视为已稳定，结果取两次均值。
- Cue 可设置**目标色温**（留空时取关联灯具额定均值）和**允许偏差**；关联灯具全部稳定且落在偏差内才可**发布**。
- 缺实测值、预热中或超差时，页面逐一点名灯具并挡住发布。
- 调整额定色温只重算引用它的**未发布** Cue；已发布（READY / ARCHIVED）记录的校验快照冻结不动。
- 页面支持录入读数、查看预热状态（预热中 / 已稳定 / 缺实测值）和发布 Cue，数据持久化在 localStorage。

## 快速启动

```bash
cp .env.example .env && docker compose up -d
```

## 访问地址或 CLI 示例

前端：<http://localhost:20113>



## 本地开发方式

- 前端：`cd frontend && npm install && npm run dev`



## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | React 18 + TypeScript + Vite + Tailwind CSS + Redux Toolkit + IndexedDB |
| 后端 | - |
| 数据库 | 本地模拟数据 |
| 部署 | Docker Compose |

## 项目目录结构

```text
frontend/src/api, stores, types, constants, constructors, components/common, hooks, pages, router, utils, mocks
```

## 环境变量说明

- `COMPOSE_PROJECT_NAME`: Compose 项目名，默认 `stage-light`
- `FRONTEND_PORT`: 前端端口，默认 `20113`


## Docker 部署说明

- 根 Compose 文件不写 `version`，顶层 `name: stage-light`。
- 容器名均使用 `${COMPOSE_PROJECT_NAME:-stage-light}` 前缀。
- 数据库使用命名卷，避免绑定中文路径。
- 常见问题：端口占用时修改 `.env` 中端口后重启；需要重置数据时执行 `docker compose down -v`。

## 枚举/常量出现位置清单

- FixtureType: constants/FixtureType、types/FixtureType、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- CueStatus: constants/CueStatus、types/CueStatus、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用；`PUBLISHED_CUE_STATUSES`（READY / ARCHIVED）决定哪些 Cue 不参与色温重算。
- ChannelMode: constants/ChannelMode、types/ChannelMode、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- WarmupStatus（INSUFFICIENT_DATA / WARMING / STABLE）: constants/WarmupStatus、types/WarmupStatus、constants/statusText、utils/cctCalibration、hooks/useCctCalibration、pages/CuesPage、styles.css 徽章样式均有引用。
- CctCheckStatus（UNCHECKED / PASSED / BLOCKED）: constants/CctCheckStatus、types/CctCheckStatus、constants/statusText、utils/cctCalibration、api/CueScene、stores/CueSceneStore、pages/CuesPage 均有引用。
- 色温阈值集中在 `constants/cctConfig.ts`（120K 预热阈值、默认允许偏差、读数合法范围、保留读数条数），被 api、utils、页面共同引用。

## 为什么会牵一发动全身

实体字段、枚举、日志模板、错误消息、构造器、筛选器和展示组件被刻意拆散到多个目录；修改一个状态值通常需要同步类型、构造器、服务、控制器、store、页面、README 与数据库种子。

## License

MIT
