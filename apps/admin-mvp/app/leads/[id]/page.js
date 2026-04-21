import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  getFollowUpStatusLabel,
} from "../../../lib/constants";
import {
  formatArrayValue,
  formatDateTime,
  formatGateAnswer,
  formatScoreRate,
  formatServiceTypes,
} from "../../../lib/format";
import {
  ADMIN_SESSION_COOKIE,
  getAdminCredentials,
  isAuthorizedSessionValue,
} from "../../../lib/auth";
import { getLeadDetail, updateLeadDetail } from "../../../lib/leadDetail";
import {
  ANSWER_DISPLAY_ORDER,
  LIKERT_LABELS,
  QUESTION_DISPLAY_MAP,
  calculateDimensionScoresFromAnswers,
  getDisplayScore,
} from "../../../lib/assessmentDisplay";
import LeadDetailForm from "../../../components/LeadDetailForm";

const DIMENSION_LABELS = {
  D1: "D1 心理准备",
  D2: "D2 经济准备",
  D3: "D3 亲权准备",
  D4: "D4 财权准备",
  D5: "D5 法律认知",
  D6: "D6 情感支持",
  D7: "D7 跨境准备",
};

async function saveLeadDetailAction(id, formData) {
  "use server";

  const cookieStore = await cookies();
  const sessionValue = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!isAuthorizedSessionValue(sessionValue)) {
    redirect(`/login?from=/leads/${id}`);
  }

  const operatorName = getAdminCredentials().username || "admin_mvp";
  const { error } = await updateLeadDetail(id, formData, operatorName);

  if (error) {
    redirect(`/leads/${id}?error=save_failed`);
  }

  redirect(`/leads/${id}?saved=1`);
}

function InfoItem({ label, value }) {
  return (
    <div className="info-item">
      <span>{label}</span>
      <strong>{value || "-"}</strong>
    </div>
  );
}

function Section({ title, description, children }) {
  return (
    <section className="panel detail-section">
      <div className="section-head">
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

function DimensionScores({ value, answers }) {
  const dbScores =
    value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const hasDbScores = Object.keys(dbScores).length > 0;
  const fallbackScores = hasDbScores
    ? {}
    : calculateDimensionScoresFromAnswers(answers);
  const scores = hasDbScores ? dbScores : fallbackScores;
  const hasScores = Object.keys(scores).length > 0;
  const entries = Object.keys(DIMENSION_LABELS).map((key) => [
    key,
    scores[key],
  ]);

  return (
    <>
      {hasDbScores ? (
        null
      ) : hasScores ? (
        null
      ) : (
        <div className="notice soft">
          当前记录未写入维度平均分，且原始答案不足以补算。下方仍可查看已记录的原始答案。
        </div>
      )}
      <div className="dimension-list">
        {entries.map(([key, score]) => (
          <div className="dimension-row" key={key}>
            <span>{DIMENSION_LABELS[key] ?? key}</span>
            <strong>{score ?? "未记录"}</strong>
          </div>
        ))}
      </div>
    </>
  );
}

function normalizeAnswers(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];

  const orderedIds = [
    ...ANSWER_DISPLAY_ORDER.filter((questionId) =>
      Object.prototype.hasOwnProperty.call(value, questionId)
    ),
    ...Object.keys(value).filter(
      (questionId) => !ANSWER_DISPLAY_ORDER.includes(questionId)
    ),
  ];

  return orderedIds.map((questionId) => {
    const answer = value[questionId];
    const question = QUESTION_DISPLAY_MAP[questionId];
    const isSystemQuestion = Boolean(question?.system);
    const optionLabel = isSystemQuestion
      ? formatGateAnswer(answer)
      : LIKERT_LABELS.get(answer) ?? String(answer ?? "-");
    const score = isSystemQuestion
      ? "不计分"
      : getDisplayScore(answer, question?.reverse);

    return {
      questionId,
      dimension: question?.dimension
        ? DIMENSION_LABELS[question.dimension] ?? question.dimension
        : "系统分流",
      text: question?.text ?? "题干未匹配，请核对题库版本。",
      optionLabel,
      score: score === null || score === undefined ? "-" : score,
    };
  });
}

function AnswersTable({ answers }) {
  const rows = normalizeAnswers(answers);

  if (!rows.length) {
    return <p className="empty">暂无原始答案。</p>;
  }

  return (
    <div className="answers-wrap">
      <table className="answers-table">
        <thead>
          <tr>
            <th>题目编号</th>
            <th>维度 / 类型</th>
            <th>题干</th>
            <th>用户选择</th>
            <th>对应得分</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item) => (
            <tr key={item.questionId}>
              <td>{item.questionId}</td>
              <td>{item.dimension}</td>
              <td>{item.text}</td>
              <td>{item.optionLabel}</td>
              <td>{item.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function LeadDetailPage({ params, searchParams }) {
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!isAuthorizedSessionValue(sessionValue)) {
    redirect("/login");
  }

  const resolvedParams =
    params && typeof params.then === "function" ? await params : params ?? {};
  const resolvedSearchParams =
    searchParams && typeof searchParams.then === "function"
      ? await searchParams
      : searchParams ?? {};
  const id = resolvedParams.id;
  const { row, error } = await getLeadDetail(id);

  if (error || !row) {
    return (
      <main className="page">
        <div className="container">
          <section className="panel">
            <div className="title-row">
              <div>
                <h1 className="title">未找到线索</h1>
                <p className="subtitle">
                  该记录不存在，或当前 Supabase 查询失败。
                </p>
              </div>
              <Link className="btn btn-muted" href="/leads">
                返回列表
              </Link>
            </div>
            {error ? <div className="error">查询失败：{error.message}</div> : null}
          </section>
        </div>
      </main>
    );
  }

  const saveAction = saveLeadDetailAction.bind(null, row.id);

  return (
    <main className="page">
      <div className="container detail-container">
        <section className="panel">
          <div className="title-row">
            <div>
              <h1 className="title">
                线索详情：{row.contact_name || "未填写姓名"}
              </h1>
              <p className="subtitle">
                单条记录查看、核心跟进字段编辑与详细报告预留区。
              </p>
            </div>
            <div className="toolbar">
              <Link className="btn btn-muted" href="/leads">
                返回列表
              </Link>
              <form action="/api/auth/logout" method="post">
                <button className="btn btn-danger" type="submit">
                  退出登录
                </button>
              </form>
            </div>
          </div>

          {resolvedSearchParams.saved ? (
            <div className="notice success">已保存当前后台编辑信息。</div>
          ) : null}
          {resolvedSearchParams.error ? (
            <div className="notice error">保存失败，请稍后重试或检查字段权限。</div>
          ) : null}
        </section>

        <Section title="基础信息" description="联系方式本轮只读展示，不做纠错编辑。">
          <div className="info-grid">
            <InfoItem label="姓名" value={row.contact_name} />
            <InfoItem label="电话" value={row.contact_phone} />
            <InfoItem label="微信" value={row.contact_wechat} />
            <InfoItem label="提交时间" value={formatDateTime(row.created_at)} />
            <InfoItem label="提交来源" value={row.submission_source} />
          </div>
        </Section>

        <Section title="测评结果摘要" description="结果字段由前台写入，后台保持只读。">
          <div className="info-grid">
            <InfoItem label="结果等级" value={row.result_label || row.result_level} />
            <InfoItem label="得分率" value={formatScoreRate(row.score_rate)} />
            <InfoItem
              label="总分 / 动态满分"
              value={`${row.total_score ?? "-"} / ${row.dynamic_full_score ?? "-"}`}
            />
            <InfoItem label="短板维度" value={formatArrayValue(row.weaknesses)} />
            <InfoItem label="子女分流" value={formatGateAnswer(row.child_gate_answer)} />
            <InfoItem
              label="跨境分流"
              value={formatGateAnswer(row.cross_border_gate_answer)}
            />
          </div>
        </Section>

        <Section title="维度详情" description="旧数据缺少维度得分时会显示为空值状态。">
          <h3 className="subhead">维度平均分</h3>
          <DimensionScores value={row.dimension_scores} answers={row.answers} />

          <h3 className="subhead">原始答案</h3>
          <AnswersTable answers={row.answers} />
        </Section>

        <LeadDetailForm row={row} action={saveAction} />

        <section className="panel">
          <div className="info-grid">
            <InfoItem
              label="当前跟进状态"
              value={getFollowUpStatusLabel(row.follow_up_status)}
            />
            <InfoItem
              label="当前服务类型"
              value={formatServiceTypes(row.service_type)}
            />
            <InfoItem label="线索 ID" value={row.id} />
          </div>
        </section>
      </div>
    </main>
  );
}
