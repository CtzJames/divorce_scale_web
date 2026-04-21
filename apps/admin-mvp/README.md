# admin-mvp

离婚力量表后台 MVP 第一轮独立子项目。

## 本轮范围

- 独立后台子项目初始化
- 最小登录鉴权
- 受保护的后台列表页
- 列表基础读表
- 列表最小筛选/搜索
- 单条记录详情页
- 核心后台字段编辑与保存

## 不在本轮范围

- CSV 导出
- 批量操作
- 复杂权限树
- 仪表盘图表
- 详细报告生成系统

## 环境变量

复制 `.env.example` 为 `.env.local` 并填写：

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`（仅服务端读取）
- `ADMIN_MVP_USERNAME`
- `ADMIN_MVP_PASSWORD`
- `ADMIN_MVP_SESSION_SECRET`

## 本地启动

```bash
cd apps/admin-mvp
npm install
npm run dev
```

默认访问 `http://localhost:3000`，会跳转到 `/login`。
