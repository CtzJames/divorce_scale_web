import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LeadsFilters from "../../components/LeadsFilters";
import LeadsTable from "../../components/LeadsTable";
import { ADMIN_SESSION_COOKIE, isAuthorizedSessionValue } from "../../lib/auth";
import { queryLeads } from "../../lib/leadsQuery";
import { RESULT_LEVEL_ALIASES } from "../../lib/constants";

function getSafeFilter(raw, fallback = "") {
  if (typeof raw !== "string") return fallback;
  return raw.trim();
}

export default async function LeadsPage({ searchParams }) {
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!isAuthorizedSessionValue(sessionValue)) {
    redirect("/login");
  }

  const resolvedSearchParams =
    searchParams && typeof searchParams.then === "function"
      ? await searchParams
      : searchParams ?? {};

  const filters = {
    name: getSafeFilter(resolvedSearchParams?.name),
    phone: getSafeFilter(resolvedSearchParams?.phone),
    followUpStatus:
      getSafeFilter(resolvedSearchParams?.followUpStatus, "all") || "all",
    resultLevel:
      getSafeFilter(resolvedSearchParams?.resultLevel, "all") || "all",
    assignedTo: getSafeFilter(resolvedSearchParams?.assignedTo),
    serviceType:
      getSafeFilter(resolvedSearchParams?.serviceType, "all") || "all",
  };

  if (filters.resultLevel in RESULT_LEVEL_ALIASES) {
    filters.resultLevel = RESULT_LEVEL_ALIASES[filters.resultLevel];
  }

  const { rows, error } = await queryLeads(filters);

  return (
    <main className="page">
      <div className="container">
        <section className="panel">
          <div className="title-row">
            <div>
              <h1 className="title">后台线索列表（MVP）</h1>
              <p className="subtitle">
                第一轮仅含列表查看、最小筛选与搜索能力。
              </p>
            </div>
            <form action="/api/auth/logout" method="post">
              <button className="btn btn-danger" type="submit">
                退出登录
              </button>
            </form>
          </div>
        </section>

        <div style={{ height: 12 }} />

        <LeadsFilters filters={filters} />

        <div style={{ height: 12 }} />

        <section className="panel">
          <div className="muted">当前展示 {rows.length} 条记录（最多 200 条）。</div>
          {error ? (
            <div className="error">
              查询失败：{error.message || "请检查 Supabase 环境变量与权限配置。"}
            </div>
          ) : null}
          <LeadsTable rows={rows} />
        </section>
      </div>
    </main>
  );
}
