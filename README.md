# 离婚力量表网页端

## 项目简介

本项目用于将律所现有《离婚力测量量表》转化为可在线访问、可交互作答、可自动生成结果、可记录后台数据并具备基础留资能力的网页端产品。

当前版本定位为面向内部测试与小范围真实使用的 MVP，目标是在保留量表评估逻辑的前提下，提升测评完成率，并为后续律师咨询承接提供基础数据与联系方式线索。

---

## 当前已实现能力

### 前台测评流程

* Next.js 前台主流程已稳定
* 首页进入测评
* 系统分流题前置
* 普通题随机呈现
* 每题选择后自动进入下一题
* 保留“上一题”按钮
* 最后一题停留在“查看结果”按钮可点击状态
* 结果页展示总结果与短板维度
* 结果页新增动态维度雷达图（根据分流结果动态展示 5 / 6 / 7 维）
* 被系统整维跳过的维度不显示在雷达图与图例中

### 结果提交流程

* 结果页主按钮为“提交并保存结果”
* 页面内显示提交中 / 提交成功 / 提交失败状态
* 不再使用浏览器 `alert`
* 提交成功后按钮进入“已提交”状态
* 已完成基础防重复提交控制

### 留资能力

* 结果页直接显示轻量联系方式表单
* 当前表单字段：

  * `contact_name`（必填）
  * `contact_phone`（必填）
  * `contact_wechat`（选填）
* 测评结果与联系方式通过同一次 `insert` 一并写入 `assessment_results`（含 `contact_wechat`）
* 成功后输入框禁用，不允许重复提交

### 后台数据沉淀

* 已接入 Supabase
* 当前主表为 `assessment_results`
* 可在 Supabase Table Editor 中查看测评记录与联系方式

---

## 当前技术栈

### 前端

* Next.js（App Router）
* React
* CSS

### 数据与后台

* Supabase

### 部署

* GitHub Pages（免费部署）
* 大陆网络可访问
* 提交结果可正常传入 Supabase

### 代码管理

* Git
* GitHub

---

## 当前主要目录结构

```text
divorce_scale_web/
  app/
    globals.css
    layout.js
    page.js
  components/
    IntroScreen.js
    QuestionScreen.js
    ResultScreen.js
  data/
    questions.js
    resultCopy.js
  lib/
    buildSubmissionPayload.js
    scoring.js
    supabaseClient.js
  public/
  archive/
  package.json
  package-lock.json
  .env.local
  README.md
```

---

## 当前核心交互说明

### 1. 系统分流题

当前在正式计分题前固定展示两道系统分流题：

* 是否有未成年子女
* 是否涉及跨境婚姻因素

系统会据此决定是否纳入：

* D3 子女抚养与亲子关系处理
* D7 跨境婚姻特别事项

### 2. 题目顺序

* 系统分流题顺序固定
* 普通计分题每轮随机打乱
* 同一轮测评过程中题序固定不变
* 重新测评后重新随机

### 3. 结果页动作区

当前结果页动作区已优化为：

* 主按钮：提交并保存结果
* 次按钮：重新测评

并配有简短提示文案，引导用户先保存测评结果。

### 4. 结果页维度图

结果页当前采用动态维度雷达图：

* 根据用户分流结果动态展示 5 / 6 / 7 个维度
* 被系统整维跳过的维度不进入雷达图与图例

### 5. 留资方式

当前采用“一次性提交”路线：

* 用户在结果页填写称呼、联系电话与微信（微信选填）
* 点击“提交并保存结果”后
* 测评结果字段与联系方式字段一并写入 `assessment_results`

当前不采用“先提交结果、再根据返回 id 二次 update 联系方式”的方案。

---

## assessment_results 当前相关字段说明

当前表中与前台已接入逻辑直接相关的字段包括：

* `id`
* `created_at`
* `result_label`
* `answers`
* `total_score`
* `dynamic_full_score`
* `score_rate`
* `result_level`
* `child_gate_answer`
* `cross_border_gate_answer`
* `weaknesses`
* `submission_source`
* `contact_name`
* `contact_phone`
* `contact_wechat`
* `admin_note`
* `follow_up_status`

其中：

### 前台当前已使用

* `result_label`
* `answers`
* `total_score`
* `dynamic_full_score`
* `score_rate`
* `result_level`
* `child_gate_answer`
* `cross_border_gate_answer`
* `weaknesses`
* `submission_source`
* `contact_name`
* `contact_phone`
* `contact_wechat`

### 后台预留字段

* `admin_note`
* `follow_up_status`

`admin_note` 用于记录人工判断或跟进备注。
`follow_up_status` 用于标识线索当前处理阶段，例如：

* `new`
* `contacted`
* `closed`

当前这两个字段尚未接入前台逻辑。

---

## 本地开发

### 启动开发环境

```bash
npm run dev
```

### 生产构建检查

```bash
npm run build
```

> 注：在 Windows 环境下，若出现 `.next` 目录被占用导致的 `EPERM` 错误，通常属于本地进程/构建缓存占用问题，不一定是业务代码错误。可先停止 dev server，再清理 `.next` 后重试。

---

## 当前版本状态

当前版本已经具备：

* 可完成在线测评
* 可自动生成结果
* 可保存结果数据
* 可收集基础联系方式
* 可在后台沉淀待跟进线索

本项目当前已不再只是静态原型，而是一个具备基础测评与留资闭环的 MVP。

当前部署基线：

* GitHub Pages 免费部署已跑通
* 大陆网络可访问
* 提交结果可正常传入 Supabase

---

## 后续可继续优化方向

### 1. 结果页产品化打磨

* 优化留资区文案与成功提示
* 调整结果页模块层级与留白
* 优化移动端呈现

### 2. 后台可读性与跟进管理

* 规范 `follow_up_status` 使用方式
* 梳理 `admin_note` 记录规则
* 提升 Supabase 表格查看体验

### 3. 项目文档完善

* 环境变量说明
* 数据表创建与字段说明
* 部署步骤补充
* 当前版本交互行为说明补充

### 4. 后续增强能力

* 结果图下载与分享能力
* 更完整的管理员后台
* 导出功能
* 更精细的线索承接设计

---

## 当前建议开发顺序

基于当前项目状态，建议下一阶段优先考虑：

1. 文档与字段规范整理
2. 后台跟进字段使用规范化
3. 结果页留资区产品化优化
4. 后续再考虑后台页面、导出与结果图下载/分享能力

---

## 备注

当前仓库应以最新本地稳定版本、GitHub `main` 分支、Supabase 实际表结构与 GitHub Pages 线上版本为准。
