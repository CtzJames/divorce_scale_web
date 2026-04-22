# 离婚力量表后台 MVP 第一版字段清单 V1

## 1. 文档用途

本文件用于将《离婚力量表后台 MVP 范围与数据口径草案 V1》进一步压实为可执行的字段清单，供以下环节统一使用：

- Supabase 表结构核对；
- 后台 MVP 页面字段取用；
- Codex 最小改动方案评审；
- 后续字段说明与交接。

本文件当前默认基于：

- 主表仍为 `assessment_results`；
- 第一阶段以扩展现有主表为主，不拆出复杂多表；
- 后台 MVP 第一版目标是“能看、能筛、能改、能导”；
- 详细报告第一版仅内部可见，支持内部导出；
- 后台第一版仅做最小鉴权。

---

## 2. 字段清单使用原则

### 2.1 字段分层

当前字段统一按四层理解：

1. 前台测评结果字段
2. 用户留资字段
3. 后台跟进字段
4. 报告与扩展预留字段

### 2.2 字段命名原则

- 数据库字段统一使用英文 snake_case；
- 枚举值统一使用英文稳定代码；
- 页面展示时再映射中文名称；
- 第一版尽量避免使用仅供展示的冗余字段。

### 2.3 当前默认主表

第一版后台 MVP 默认仍以：

**`assessment_results`**

作为线索主表。

---

## 3. 字段总表

以下为第一版建议字段清单。

字段属性说明：

- 字段类型：指建议在 Supabase / Postgres 中采用的字段类型
- 来源：指主要由前台写入、后台维护，或系统自动生成
- 前台写入：指是否在当前前台提交链路中写入
- 后台可编辑：指是否应在后台 MVP 第一版允许人工编辑

---

## 4. 前台测评结果字段

### 4.1 `id`

- 字段含义：主键 ID
- 建议类型：`uuid`
- 来源：数据库自动生成
- 是否必填：是
- 默认值：数据库默认生成
- 前台写入：否
- 后台可编辑：否
- 备注：主记录唯一标识

### 4.2 `created_at`

- 字段含义：记录创建时间
- 建议类型：`timestamptz`
- 来源：数据库自动生成
- 是否必填：是
- 默认值：`now()`
- 前台写入：否或可省略
- 后台可编辑：否
- 备注：用于列表排序、筛选、导出

### 4.3 `total_score`

- 字段含义：有效题目实际总分
- 建议类型：`integer`
- 来源：前台计分结果
- 是否必填：是
- 前台写入：是
- 后台可编辑：否
- 备注：结果核心字段

### 4.4 `dynamic_full_score`

- 字段含义：按有效题目动态计算的满分
- 建议类型：`integer`
- 来源：前台计分结果
- 是否必填：是
- 前台写入：是
- 后台可编辑：否
- 备注：用于得分率换算

### 4.5 `score_rate`

- 字段含义：得分率
- 建议类型：`numeric(5,2)`
- 来源：前台计分结果
- 是否必填：是
- 前台写入：是
- 后台可编辑：否
- 备注：建议存数值，不存百分号文本

### 4.6 `result_level`

- 字段含义：结果等级
- 建议类型：`text`
- 来源：前台结果判断
- 是否必填：是
- 前台写入：是
- 后台可编辑：否
- 建议值：
  - `high`
  - `medium`
  - `low`
- 备注：页面展示时映射为“准备充分 / 准备一般 / 准备不足”

### 4.7 `result_label`

- 字段含义：结果等级中文标签
- 建议类型：`text`
- 来源：前台结果判断
- 是否必填：是
- 前台写入：是
- 后台可编辑：否
- 建议值：
  - `准备充分`
  - `准备一般`
  - `准备不足`
- 备注：用于导出与后台快速查看

### 4.8 `child_gate_answer`

- 字段含义：是否进入子女维度的系统分流结果
- 建议类型：`boolean`
- 来源：前台系统分流题
- 是否必填：是
- 前台写入：是
- 后台可编辑：否
- 建议值：
  - `true`：进入 D3
  - `false`：跳过 D3
- 备注：用于结果展示和后台筛选

### 4.9 `cross_border_gate_answer`

- 字段含义：是否进入跨境维度的系统分流结果
- 建议类型：`boolean`
- 来源：前台系统分流题
- 是否必填：是
- 前台写入：是
- 后台可编辑：否
- 建议值：
  - `true`：进入 D7
  - `false`：跳过 D7
- 备注：用于结果展示和后台筛选

### 4.10 `weaknesses`

- 字段含义：当前短板维度列表
- 建议类型：`text[]`
- 来源：前台结果计算
- 是否必填：否
- 前台写入：是
- 后台可编辑：否
- 建议值示例：
  - `['D2']`
  - `['D4','D5']`
- 备注：建议存维度代码，不直接存长文案

### 4.11 `dimension_scores`

- 字段含义：各维度平均分明细
- 建议类型：`jsonb`
- 来源：前台结果计算
- 是否必填：建议是
- 前台写入：建议是
- 后台可编辑：否
- 建议结构示例：

```json
{
  "D1": 3.67,
  "D2": 2.83,
  "D4": 3.2,
  "D5": 2.6,
  "D6": 3.0
}
```

- 备注：当前阶段详情页和内部详细报告都会用到，建议补入

### 4.12 `answers`

- 字段含义：原始作答结果
- 建议类型：`jsonb`
- 来源：前台答题提交
- 是否必填：是
- 前台写入：是
- 后台可编辑：否
- 备注：用于详情页查看、后续报告生成与问题追溯

### 4.13 `submission_source`

- 字段含义：提交来源
- 建议类型：`text`
- 来源：前台写入
- 是否必填：是
- 前台写入：是
- 后台可编辑：否
- 建议值示例：
  - `vercel`
  - `github_pages`
  - `gpstrt`
  - `zunerguangsh_sandra`
  - `manual_test`
- 备注：后续挂站后会变得更重要，建议提前规范

---

## 5. 用户留资字段

### 5.1 `contact_name`

- 字段含义：用户称呼 / 姓名
- 建议类型：`text`
- 来源：前台用户填写
- 是否必填：是
- 前台写入：是
- 后台可编辑：谨慎允许
- 备注：当前前台必填

### 5.2 `contact_phone`

- 字段含义：联系电话
- 建议类型：`text`
- 来源：前台用户填写
- 是否必填：是
- 前台写入：是
- 后台可编辑：谨慎允许
- 备注：当前前台必填

### 5.3 `contact_wechat`

- 字段含义：微信号
- 建议类型：`text`
- 来源：前台用户填写
- 是否必填：否
- 前台写入：是
- 后台可编辑：谨慎允许
- 备注：当前前台选填

---

## 6. 后台跟进字段

### 6.1 `follow_up_status`

- 字段含义：当前跟进状态
- 建议类型：`text`
- 来源：数据库默认值 + 后台维护
- 是否必填：是
- 默认值：`new`
- 前台写入：可不显式写入，由数据库默认值生成；如当前前台已写入，也应统一写 `new`
- 后台可编辑：是
- 建议值：
  - `new`
  - `to_follow`
  - `contacted`
  - `consulting`
  - `converted`
  - `invalid`
- 备注：后台筛选核心字段

### 6.2 `admin_note`

- 字段含义：内部备注
- 建议类型：`text`
- 来源：后台维护
- 是否必填：否
- 前台写入：否
- 后台可编辑：是
- 备注：用于最小协作记录，第一版先不拆日志表

### 6.3 `service_type`

- 字段含义：当前拟提供 / 已进入的服务类型
- 建议类型：`text[]`
- 来源：后台维护
- 是否必填：否
- 默认值：建议 `{'none'}` 或空数组，二选一后统一
- 前台写入：否
- 后台可编辑：是
- 建议值：
  - `none`
  - `single_consultation`
  - `divorce_escorting`
  - `long_term_consultation`
  - `screening_service`
  - `litigation_representation`
  - `agreement_support`
  - `cross_border_support`
  - `other`
- 备注：
  - 第一版按多选实现
  - 存英文稳定代码
  - 页面显示中文名称

### 6.4 `assigned_to`

- 字段含义：当前主要负责该线索推进的内部人员
- 建议类型：`text`
- 来源：后台维护
- 是否必填：否
- 前台写入：否
- 后台可编辑：是
- 备注：第一版先记录姓名 / 称呼，不绑用户表

### 6.5 `appointment_owner`

- 字段含义：当前负责约面 / 约通话 / 推进下一步沟通的人
- 建议类型：`text`
- 来源：后台维护
- 是否必填：否
- 前台写入：否
- 后台可编辑：是
- 备注：与 `assigned_to` 分开

### 6.6 `appointment_time`

- 字段含义：已确认的下一次正式沟通时间
- 建议类型：`timestamptz`
- 来源：后台维护
- 是否必填：否
- 前台写入：否
- 后台可编辑：是
- 备注：未约定时为空

### 6.7 `last_follow_up_at`

- 字段含义：最近一次人工跟进时间
- 建议类型：`timestamptz`
- 来源：后台维护 / 系统更新
- 是否必填：否
- 前台写入：否
- 后台可编辑：建议系统同步更新，不建议人工自由改
- 备注：当状态、备注、服务类型等后台字段被修改时同步刷新

### 6.8 `updated_by`

- 字段含义：最近一次修改后台信息的人
- 建议类型：`text`
- 来源：后台维护 / 系统记录
- 是否必填：否
- 前台写入：否
- 后台可编辑：建议系统写入，不建议自由编辑
- 备注：第一版先记录姓名或登录身份标识

### 6.9 `updated_at`

- 字段含义：记录最近一次更新时间
- 建议类型：`timestamptz`
- 来源：系统自动更新时间
- 是否必填：建议是
- 前台写入：否
- 后台可编辑：否
- 备注：建议补入，列表页“最近更新时间”依赖此字段

### 6.10 建联补充信息字段（本轮新增）

以下字段用于管理员与客户建联后补充录入最小画像信息与争议摘要信息，仍然归属 `assessment_results` 主表，不拆新表，不参与前台测评逻辑，不进入列表页默认列与当前 CSV 导出。

Supabase 手动补字段建议：

```sql
alter table assessment_results
  add column if not exists client_age integer,
  add column if not exists client_gender text,
  add column if not exists client_location text,
  add column if not exists asset_tier_level text,
  add column if not exists marital_dispute_summary text;
```

#### 6.10.1 `client_age`

- 字段含义：客户当前年龄
- 建议类型：`integer`
- 来源：后台人工填写
- 是否必填：否
- 前台写入：否
- 后台可编辑：是
- 保存口径：空值、非数字、负数、非整数均按 `null` 处理；只接受非负整数

#### 6.10.2 `client_gender`

- 字段含义：客户性别
- 建议类型：`text`
- 来源：后台人工选择
- 是否必填：否
- 前台写入：否
- 后台可编辑：是
- 建议稳定值：
  - `male`：男
  - `female`：女

#### 6.10.3 `client_location`

- 字段含义：客户当前主要所在地
- 建议类型：`text`
- 来源：后台人工填写
- 是否必填：否
- 前台写入：否
- 后台可编辑：是
- 备注：文本输入，不做结构化地区拆分

#### 6.10.4 `asset_tier_level`

- 字段含义：客户资产阶层等级
- 建议类型：`text`
- 来源：后台人工选择
- 是否必填：否
- 前台写入：否
- 后台可编辑：是
- 候选值：`A5`、`A5.5`、`A6`、`A6.5`、`A7`、`A7.5`、`A8`、`A8.5`、`A9`、`A9.5`、`A10`、`A10.5`、`A11`
- 备注：按律所内部既定“资产阶层分级表”人工选择；本阶段不在系统内实现计算逻辑，不根据测评结果自动推断

#### 6.10.5 `marital_dispute_summary`

- 字段含义：当前核心婚姻争议摘要
- 建议类型：`text`
- 来源：后台人工填写
- 是否必填：否
- 前台写入：否
- 后台可编辑：是
- 备注：只记录当前案件核心争议本身，不替代 `admin_note`；`admin_note` 继续负责跟进过程、当前判断与下一步安排

---

## 7. 报告与扩展预留字段

### 7.1 `report_visibility`

- 字段含义：详细报告当前可见性
- 建议类型：`text`
- 来源：后台维护
- 是否必填：是
- 默认值：`internal_only`
- 前台写入：否
- 后台可编辑：是
- 建议值：
  - `hidden`
  - `internal_only`
  - `user_visible`
- 备注：当前第一版默认仅内部可见

### 7.2 `report_version`

- 字段含义：当前对应的详细报告版本号
- 建议类型：`text`
- 来源：后台维护 / 系统生成
- 是否必填：否
- 前台写入：否
- 后台可编辑：是
- 建议值示例：
  - `v1`
  - `v1.1`
  - `internal_rule_v1`
- 备注：便于模板演进管理

### 7.3 `report_generated_at`

- 字段含义：最近一次详细报告生成时间
- 建议类型：`timestamptz`
- 来源：系统生成
- 是否必填：否
- 前台写入：否
- 后台可编辑：否
- 备注：第一版可先预留

### 7.4 `report_content`

- 字段含义：内部详细报告正文或结构化内容
- 建议类型：`jsonb` 或 `text`
- 来源：后续内部报告模块
- 是否必填：否
- 前台写入：否
- 后台可编辑：后续判断
- 备注：
  - 第一版后台页面可先不启用
  - 若后续做内部详细报告，建议优先采用 `jsonb` 存结构化内容

---

## 8. 当前字段的页面使用建议

### 8.1 列表页建议字段

后台列表页建议默认显示：

- `created_at`
- `contact_name`
- `contact_phone`
- `contact_wechat`
- `result_label`
- `score_rate`
- `child_gate_answer`
- `cross_border_gate_answer`
- `follow_up_status`
- `service_type`
- `assigned_to`
- `updated_at`

### 8.2 详情页建议字段

详情页建议按模块展示：

#### 模块一：基础信息
- `contact_name`
- `contact_phone`
- `contact_wechat`
- `created_at`
- `submission_source`

#### 模块二：测评结果摘要
- `result_label`
- `score_rate`
- `total_score`
- `dynamic_full_score`
- `weaknesses`
- `child_gate_answer`
- `cross_border_gate_answer`

#### 模块三：维度详情
- `dimension_scores`
- `answers`

#### 模块四：后台跟进信息
- `follow_up_status`
- `service_type`
- `assigned_to`
- `appointment_owner`
- `appointment_time`
- `client_age`
- `client_gender`
- `client_location`
- `asset_tier_level`
- `marital_dispute_summary`
- `last_follow_up_at`
- `updated_by`
- `updated_at`

#### 模块五：内部备注
- `admin_note`

#### 模块六：报告预留
- `report_visibility`
- `report_version`
- `report_generated_at`

---

## 9. 第一版建议新增 / 核对字段清单

结合当前项目基线，建议优先核对并补充以下字段：

### 9.1 建议确认已存在且类型合理的字段

- `follow_up_status`
- `admin_note`
- `contact_name`
- `contact_phone`
- `contact_wechat`
- `submission_source`
- `answers`
- `weaknesses`

### 9.2 建议新增的高优先级字段

- `dimension_scores`
- `service_type`
- `assigned_to`
- `appointment_owner`
- `appointment_time`
- `last_follow_up_at`
- `updated_by`
- `updated_at`
- `report_visibility`
- `report_version`
- `report_generated_at`

### 9.3 建议暂不急于启用但可预留的字段

- `report_content`

---

## 10. 当前字段默认值建议

### 10.1 建议设置数据库默认值的字段

- `created_at` → `now()`
- `updated_at` → `now()`
- `follow_up_status` → `new`
- `report_visibility` → `internal_only`

### 10.2 建议允许为空的字段

- `contact_wechat`
- `admin_note`
- `service_type`（若不设默认空数组）
- `assigned_to`
- `appointment_owner`
- `appointment_time`
- `client_age`
- `client_gender`
- `client_location`
- `asset_tier_level`
- `marital_dispute_summary`
- `last_follow_up_at`
- `updated_by`
- `report_version`
- `report_generated_at`
- `report_content`

---

## 11. 字段级开发注意事项

### 11.1 不建议后台人工修改的字段

以下字段原则上只读：

- `total_score`
- `dynamic_full_score`
- `score_rate`
- `result_level`
- `result_label`
- `child_gate_answer`
- `cross_border_gate_answer`
- `weaknesses`
- `dimension_scores`
- `answers`
- `submission_source`

### 11.2 可编辑但应谨慎的字段

- `contact_name`
- `contact_phone`
- `contact_wechat`

这些字段只应用于纠错，不建议频繁覆盖用户原始留资。

### 11.3 后台核心编辑字段

后台 MVP 第一版真正的核心编辑字段应是：

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
- `report_visibility`
- `report_version`

---

## 12. 阶段性结论

当前后台 MVP 第一版字段清单的核心结论如下：

1. 第一版仍以 `assessment_results` 为线索主表；
2. 当前最重要的不是拆表，而是补齐后台管理字段；
3. `service_type` 第一版应采用 `text[]` 存储多选服务类型；
4. `assigned_to` 与 `appointment_owner` 应保持独立字段；
5. 详细报告相关字段先预留，并按“内部可见、内部导出”思路设计；
6. 后台页面第一版应围绕“列表、详情、编辑、导出”所需字段展开。

本文件可作为下一步：

- Supabase 真实表结构核对清单；
- Codex 最小改动方案输入依据；
- 后台页面取字段说明文档。
