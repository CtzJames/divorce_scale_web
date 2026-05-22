import Link from "next/link";
import {
  getFollowUpStatusLabel,
  getResultLevelLabel,
} from "../lib/constants";
import {
  formatDateTime,
  formatGateAnswer,
  formatScoreRate,
  formatServiceTypes,
} from "../lib/format";
import {
  formatNarcissismAverageScore,
  formatNarcissismHighRiskStatus,
  getAssessmentTypeShortLabel,
  getLeadServiceIntentLabel,
  getNarcissismResultLevelLabel,
  isNarcissismRiskRecord,
} from "../lib/leadAssessment";

function getLeadResultLabel(item) {
  if (isNarcissismRiskRecord(item)) {
    return item.result_label || getNarcissismResultLevelLabel(item.result_level);
  }
  return item.result_label || getResultLevelLabel(item.result_level);
}

function formatLeadScore(item) {
  if (isNarcissismRiskRecord(item)) {
    return formatNarcissismAverageScore(item);
  }
  return formatScoreRate(item.score_rate);
}

function formatLeadGateAnswer(item, key) {
  if (isNarcissismRiskRecord(item)) return "-";
  return formatGateAnswer(item[key]);
}

export default function LeadsTable({ rows }) {
  if (!rows.length) {
    return <p className="empty">当前筛选条件下暂无记录。</p>;
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>提交时间</th>
            <th>量表</th>
            <th>姓名</th>
            <th>电话</th>
            <th>微信</th>
            <th>结果等级</th>
            <th>得分/平均分</th>
            <th>用户意向</th>
            <th>高风险触发</th>
            <th>子女</th>
            <th>跨境</th>
            <th>跟进状态</th>
            <th>服务类型</th>
            <th>负责人</th>
            <th>最近更新</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item) => (
            <tr key={item.id}>
              <td>{formatDateTime(item.created_at)}</td>
              <td>
                <span className="chip">{getAssessmentTypeShortLabel(item)}</span>
              </td>
              <td>{item.contact_name || "-"}</td>
              <td>{item.contact_phone || "-"}</td>
              <td>{item.contact_wechat || "-"}</td>
              <td>
                <span className="chip">
                  {getLeadResultLabel(item)}
                </span>
              </td>
              <td>{formatLeadScore(item)}</td>
              <td>{getLeadServiceIntentLabel(item)}</td>
              <td>{formatNarcissismHighRiskStatus(item)}</td>
              <td>{formatLeadGateAnswer(item, "child_gate_answer")}</td>
              <td>{formatLeadGateAnswer(item, "cross_border_gate_answer")}</td>
              <td>{getFollowUpStatusLabel(item.follow_up_status)}</td>
              <td>{formatServiceTypes(item.service_type)}</td>
              <td>{item.assigned_to || "-"}</td>
              <td>{formatDateTime(item.updated_at || item.created_at)}</td>
              <td>
                <Link className="btn btn-ghost" href={`/leads/${item.id}`}>
                  查看详情
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
