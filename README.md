# 离婚力量表网页端

本项目是“离婚力量表网页端”，包含公开前台测评页面和内部后台 MVP 两部分。

- 公开前台用于用户在线测评、查看结果页、提交联系方式并写入 Supabase。
- 内部后台 MVP 用于线索管理、单条详情查看、跟进字段维护、单条详细报告预览与导出。
- 当前仓库采用“根目录前台项目 + `apps/admin-mvp/` 后台子项目”的同仓库独立子项目路线。

当前项目已完成公开前台主流程、后台线索管理、后台单条详细报告、A4 网页端报告、移动端长图报告、PNG 导出与 PDF 导出的阶段性闭环。当前 EdgeOne 海外区后台部署仅用于开发者线上验收、临时演示和技术验证，不是正式上线环境。

---

## 当前功能状态

### 公开前台已实现功能

- Next.js 前台主流程。
- 系统分流题前置。
- 普通题随机。
- 选择后自动进入下一题。
- 动态满分计算。
- 结果分级展示。
- 短板维度识别。
- 动态维度雷达图，按子女 / 跨境分流动态展示 5 / 6 / 7 个维度。
- 结果页留资表单。
- `contact_name`、`contact_phone`、`contact_wechat` 与测评结果同次写入 Supabase。
- 前台正式写入 `dimension_scores`。
- 结果页可导出简要测评报告图片。
- GitHub Pages 测试部署已跑通，并已验证中国大陆网络可访问。

### 后台 MVP 已实现功能

后台子项目位于 `apps/admin-mvp/`，当前已实现：

- 最小登录鉴权。
- 后台线索列表页 `/leads`。
- 搜索 / 筛选。
- 提交时间区间筛选。
- 当前筛选结果 CSV 导出。
- 轻分页。
- 单条详情页 `/leads/[id]`。
- 核心后台字段编辑与保存。
- 建联补充字段维护。
- 单条详细报告页 `/leads/[id]/report`。

后台详情页当前支持维护的核心字段包括：

- `follow_up_status`
- `admin_note`
- `service_type`
- `assigned_to`
- `appointment_owner`
- `appointment_time`
- `client_age`
- `client_gender`
- `client_location`
- `asset_tier_level`
- `marital_dispute_summary`

### 单条详细报告已实现功能

后台单条详细报告模块当前位于 `/leads/[id]/report`，已实现：

- A4 网页端多页纸张式报告。
- 移动端 750px 单列长图报告。
- “预览报告”下拉菜单。
- “导出报告”下拉菜单。
- 网页端 A4 PNG 导出。
- 移动端长图 PNG 导出。
- PDF 导出。
- 报告 Logo、水印、图标、配色与页脚视觉增强。
- A4 报告末尾包含完整 Sandra 婚姻家事团队介绍附录。
- PDF 导出自动包含完整团队介绍附录。
- A4 PNG 导出自动包含完整团队介绍附录。
- 移动端长图报告末尾包含 Sandra 团队简版介绍。
- 移动端 PNG 导出包含简版团队介绍。

### 当前部署验证状态

公开前台：

- 当前通过 GitHub Pages 完成测试部署。
- 根项目配置为静态导出，GitHub Actions workflow 会构建并上传 `out/`。
- 当前定位是测试 / 验证入口，正式上线前仍需确认正式域名、备案、DNS、部署平台与中国大陆访问稳定性。

内部后台：

- 当前已部署至腾讯云 EdgeOne Pages 海外可用区并完成技术验证。
- EdgeOne 项目根目录：`apps/admin-mvp`
- 框架预设：`Next`
- 输出目录：`.next`
- 当前区域：全球可用区（不含中国大陆）
- 当前定位：开发者线上验收环境 / 临时演示环境 / 技术验证环境
- 当前不是正式上线环境，也不是大范围内部试用环境。

已完成的 EdgeOne 适配修复：

- 删除 `apps/admin-mvp/proxy.js`，避免动态详情页触发 EdgeOne middleware / proxy 错误。
- `/leads`、`/leads/[id]`、`/leads/[id]/report` 均加入 `export const dynamic = "force-dynamic"`。
- 退出登录跳转改为相对路径，避免跳转到 `https://localhost:9000/login`。
- `apps/admin-mvp/next.config.mjs` 配置 `experimental.serverActions.allowedOrigins`，允许当前 EdgeOne 公开域名执行 Server Actions。

### 当前尚未完成事项

- 正式前台域名尚未在项目方账号体系下最终确认。
- 正式后台域名尚未在项目方账号体系下最终确认。
- 项目方 production Supabase 项目尚需按正式上线要求准备。
- EdgeOne 中国大陆 / 全球含大陆可用区尚未完成正式环境实测。
- 正式部署环境下的前台、后台、PNG / PDF 导出、保存动作与访问稳定性仍需全量回归。
- 后台多人协作、报告持久化、报告审核定稿、用户端报告开放、批量画像统计等能力尚未实现。

---

## 项目结构

```text
divorce_scale_web/
  app/                         # 公开前台 App Router 页面
  components/                  # 公开前台组件
  data/                        # 题库、结果文案、结果页配置
  lib/                         # 前台计分、提交 payload、Supabase client
  public/
    assets/                    # 前台静态资源，如企业微信二维码、Logo
  apps/
    admin-mvp/
      app/                     # 后台 App Router 页面与 API routes
      components/              # 后台列表、详情、报告组件
      lib/                     # 后台鉴权、Supabase server、查询、报告文案映射
      public/
        assets/                # 后台报告 Logo、水印等资产
          report-icons/        # 报告维度相关图标资产
      next.config.mjs
      package.json
  docs/                        # 阶段交接、后台 MVP、字段口径、报告文案等底座文档
  next.config.mjs              # 前台静态导出与 GitHub Pages basePath 配置
  package.json                 # 前台项目依赖与脚本
  README.md
```

后台报告当前使用的主要品牌资产位于：

- `apps/admin-mvp/public/assets/ZUNERGUANGLOGO01.png`
- `apps/admin-mvp/public/assets/ZUNERGUANGLOGO02.png`
- `apps/admin-mvp/public/assets/report-watermark-hero.png`
- `apps/admin-mvp/public/assets/report-watermark-boundary.png`

---

## 技术栈

以下以当前 `package.json` 为准。

### 前台根项目

- Next.js `^16.2.3`
- React `^19.2.5`
- React DOM `^19.2.5`
- `@supabase/supabase-js` `^2.103.0`
- `html-to-image` `^1.11.13`

前台部署相关：

- `next.config.mjs` 配置 `output: "export"`。
- GitHub Actions 使用 GitHub Pages 部署静态产物 `out/`。

### 后台 `apps/admin-mvp`

- Next.js `^16.2.3`
- React `^19.2.5`
- React DOM `^19.2.5`
- `@supabase/supabase-js` `^2.103.0`
- `html-to-image` `^1.11.13`
- `jspdf` `^4.2.1`
- `lucide-react` `^1.14.0`

后台部署相关：

- 当前 EdgeOne Pages 用于后台技术验证。
- 后台需要 Next.js 服务端能力、Cookie、Route Handler、Server Actions 与动态路由。

---

## 本地开发启动方式

### 前台本地启动

根目录当前没有 `.env.example`。本地启动前需要自行在根目录创建 `.env.local`，只填写变量名对应的本地 / 测试环境值，不要提交该文件。

```bash
npm install
npm run dev
```

默认访问：

```text
http://localhost:3000
```

构建检查：

```bash
npm run build
```

### 后台本地启动

后台子项目已有 `apps/admin-mvp/.env.example`。本地启动前复制为 `apps/admin-mvp/.env.local` 并填写本地 / 测试环境值，不要提交真实密钥。

```bash
cd apps/admin-mvp
npm install
npm run dev
```

默认访问：

```text
http://localhost:3000/login
```

如前台 dev server 已占用 3000，Next.js 可能会提示使用其他端口。

---

## 环境变量

不要在 README、代码、截图、commit message 或 issue 中写入真实环境变量值。

### 前台环境变量

根目录 `.env.local` 需要：

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

说明：

- 前台只使用 Supabase publishable key。
- 前台不应使用 `SUPABASE_SERVICE_ROLE_KEY`。
- 正式环境应使用项目方 production Supabase 项目的 publishable key，不使用个人测试项目 key。

### 后台环境变量

`apps/admin-mvp/.env.local` 需要：

```text
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_MVP_USERNAME=
ADMIN_MVP_PASSWORD=
ADMIN_MVP_SESSION_SECRET=
```

安全边界：

- `SUPABASE_SERVICE_ROLE_KEY` 只能用于后台服务端。
- `SUPABASE_SERVICE_ROLE_KEY` 不能写入前台项目。
- `SUPABASE_SERVICE_ROLE_KEY` 不能提交到 GitHub。
- `.env.local` 不得提交。
- 正式环境应使用项目方 production Supabase key，不使用个人测试项目 key。
- 后台密码和 session secret 不得出现在 README、docs、截图或 prompt 中。

---

## 报告导出能力说明

后台单条详细报告页当前支持两种预览形态和两类导出能力。

### 预览形态

- A4 网页端报告：多页纸张式报告，用于电脑端预览、内部审阅和 PDF 导出基础。
- 移动端长图报告：固定 750px 单列长图，用于手机阅读和图片化流转。

### PNG 导出

- “导出报告”下拉菜单包含“导出图片 PNG”。
- 当前预览为 A4 网页端报告时，导出 A4 网页端 PNG。
- 当前预览为移动端长图报告时，导出移动端长图 PNG。
- PNG 使用前端 `html-to-image` 生成。
- PNG 不写入数据库，不上传云存储。

### PDF 导出

- “导出报告”下拉菜单包含“导出 PDF”。
- PDF 采用前端生成方式。
- PDF 技术路线为 `html-to-image + jspdf`。
- PDF 基于 `.a4-report-page` 逐页生成。
- PDF 固定基于 A4 网页端报告生成；即使当前处于移动端预览，导出的 PDF 仍为 A4 报告。
- 不使用 `window.print`。
- 不使用 `@media print`。
- 不使用服务端 PDF。
- 不使用 Puppeteer / Playwright。

### 团队介绍附录

- A4 网页端报告末尾包含完整 Sandra 婚姻家事团队介绍附录。
- PDF 导出自动包含完整团队介绍附录。
- A4 PNG 导出自动包含完整团队介绍附录。
- 移动端长图报告末尾包含 Sandra 团队简版介绍。
- 移动端 PNG 导出包含简版团队介绍。
- 报告文案主档与团队介绍附录文案是两个不同来源，后续修改时不要混用。

---

## 部署状态与正式上线说明

### 当前测试 / 验收部署

公开前台：

- 当前通过 GitHub Pages 完成测试部署。
- 当前已验证中国大陆网络可访问。
- 当前可用于开发 / 测试阶段的公开前台入口。

内部后台：

- 当前通过腾讯云 EdgeOne Pages 海外可用区完成技术验证。
- 当前可用于开发者线上验收、临时演示和技术验证。
- 当前不应作为正式上线环境。
- 当前不应作为大范围内部试用环境。

### 正式上线推荐方向

正式上线必须保证：

- 中国大陆用户可稳定访问前台。
- 中国大陆内部管理员可稳定访问后台。
- 后台服务端密钥安全。
- 前台和后台可作为两个相对独立的 Web 应用部署与回归。

推荐在项目方账号体系下完成正式上线：

- 项目方 GitHub Organization 承接仓库。
- 项目方 Supabase Organization 新建 production 项目。
- 项目方腾讯云 / EdgeOne 账号新建正式部署项目。
- 使用已备案正式子域名。
- 由项目方技术同事确认正式域名、备案、DNS、部署区域和环境变量。
- 完成前台、后台、PNG / PDF 导出、保存动作、访问稳定性全量回归。

当前个人账号环境只应作为 dev / test / 迁移参考，不应作为正式生产环境。

---

## 已知限制 / 尚未完成事项

- 后台当前仍是最小鉴权。
- 暂无多账号。
- 暂无真实 `updated_by`。
- 暂无操作日志。
- 暂无保存冲突检测。
- 暂无角色权限。
- 暂无字段级权限。
- 暂无报告导出权限控制。
- 暂无 `report_content` 持久化。
- 暂无报告内容快照。
- 暂无报告审核定稿。
- 暂无报告版本比对。
- 暂无报告文件云端存储。
- 暂无用户端详细报告开放。
- 暂无批量用户画像 / 统计 / 内容赋能分析报告。
- 暂无批量生成报告。
- 当前个人账号测试环境不应作为正式生产环境。

---

## 开发协作注意事项

- 不要提交 `.env.local`。
- 不要提交真实密钥。
- 不要把 Supabase service role key 放到前台。
- 不要在 README、docs、截图、prompt 或 issue 中暴露真实 key、后台密码、session secret。
- 报告文案主档与团队介绍附录文案应区分维护。
- 不要把单条详细报告与批量用户画像报告混淆。
- 修改报告导出功能时必须回归 A4 PNG、移动端 PNG 和 PDF。
- 修改报告 A4 DOM 结构时必须确认 `.a4-report-page` 仍可被 PDF 导出逻辑逐页读取。
- 修改 EdgeOne 正式域名或后台访问域名时，要检查 `apps/admin-mvp/next.config.mjs` 中的 `experimental.serverActions.allowedOrigins`。
- 涉及部署、鉴权、数据结构、报告持久化、多账号系统的大功能建议新开 Codex 线程，小步验收。
- 不建议在功能开发中混入 `npm audit fix --force`，依赖安全维护应单独评估和回归。

---

## 常用验收清单

前台：

- 完成一次测评流程。
- 确认系统分流题、普通题随机、自动下一题正常。
- 确认结果页分级、短板维度、动态雷达图正常。
- 提交 `contact_name`、`contact_phone`、`contact_wechat`。
- 确认 Supabase 同次写入测评结果、联系方式和 `dimension_scores`。
- 确认简要测评报告图片导出正常。

后台：

- 登录 `/login`。
- 打开 `/leads` 列表。
- 验证搜索、筛选、时间区间筛选。
- 验证 CSV 导出。
- 打开 `/leads/[id]` 详情页。
- 保存详情页后台字段。
- 打开 `/leads/[id]/report`。
- 预览 A4 网页端报告。
- 预览移动端长图报告。
- 导出 A4 PNG。
- 导出移动端 PNG。
- 导出 PDF。
- 退出登录。
- 未登录访问后台页面时应跳回 `/login`。

部署后线上回归：

- 前台访问、测评、提交、写库。
- 后台登录、列表、详情页保存。
- A4 报告预览。
- 移动端报告预览。
- A4 PNG 导出。
- 移动端 PNG 导出。
- PDF 导出。
- 静态资源、Logo、水印、二维码加载。
- 自定义域名或 EdgeOne 域名下的 Server Actions 保存动作。

---

## 参考文档

当前 README 基于仓库代码与 `docs/` 中最新可用底座文档整理，重点参考：

- `docs/项目当前状态交接摘要_阶段更新版_0512.md`
- `docs/离婚力量表后台mvp范围与数据口径草案V2.md`
- `docs/离婚力量表后台mvp第一版页面清单与开发顺序V2.md`
- `docs/离婚力量表后台mvp第一版字段清单V2.md`
- `docs/离婚力测量量表解读文案主档V2.md`
- `docs/Sandra婚姻家事团队介绍附录V1.md`

若后续补充正式部署上线、账号资产移交、权限收口或验收清单的独立文档，应同步更新本 README 的部署与协作章节。
