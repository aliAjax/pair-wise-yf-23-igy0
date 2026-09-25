# 舞台灯光编排模拟器

纯前端舞台灯光编排工具，支持灯具通道、场景 Cue、时间轴预览和演出方案导出，所有数据存在 IndexedDB。场景编辑页（`/cues`）已补成**色温校正台**：每盏灯记录额定色温与最近两次实测值，两次相差超过 120K 视为预热中、不生成稳定结果；Cue 设定目标色温与允许偏差后，关联灯具全部稳定且落在范围内才可发布，缺实测值或超差时点名灯具并挡住发布；调额定值只重算引用它的未发布 Cue，已发布记录保持快照不动。

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
- CueStatus: constants/CueStatus、types/CueStatus、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- ChannelMode: constants/ChannelMode、types/ChannelMode、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- WarmupStatus: constants/WarmupStatus、types/WarmupStatus、constants/statusText、utils/colorTemperature、components/common/WarmupBadge、pages/CuesPage 均有引用。
- 色温规则常量（120K 预热阈值、色温取值范围、默认目标/偏差）: constants/ColorTempRule，被 utils/colorTemperature、stores、constructors、pages/CuesPage 引用。

## 色温校正台业务规则

- 灯具（Fixture）新增 `rated_color_temp`（额定色温）与 `measured_temps`（最近两次实测值，最新在前，最多保留两条）。
- 预热判定：实测不足两次为“缺实测值”；两次相差超过 120K 为“预热中”，不生成稳定结果；否则取两次平均作为稳定结果。
- Cue 新增 `target_color_temp`、`tolerance_k`、`fixture_ids`、`calibration_results`（每盏关联灯具的额定值快照与校正量 = 目标 − 额定）。
- 发布拦截：任一关联灯具缺实测值、预热中或稳定结果超差，发布被挡住并在页面上点名灯具；全部通过才置为 READY 并冻结校正快照。
- 额定值联动：调整灯具额定色温只重算引用它的未发布 Cue 的校正快照，已发布 Cue 的记录不动。

## 为什么会牵一发动全身

实体字段、枚举、日志模板、错误消息、构造器、筛选器和展示组件被刻意拆散到多个目录；修改一个状态值通常需要同步类型、构造器、服务、控制器、store、页面、README 与数据库种子。

## License

MIT
