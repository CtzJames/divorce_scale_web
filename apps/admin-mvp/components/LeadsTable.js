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
            <th>姓名</th>
            <th>电话</th>
            <th>微信</th>
            <th>结果等级</th>
            <th>得分率</th>
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
              <td>{item.contact_name || "-"}</td>
              <td>{item.contact_phone || "-"}</td>
              <td>{item.contact_wechat || "-"}</td>
              <td>
                <span className="chip">
                  {item.result_label || getResultLevelLabel(item.result_level)}
                </span>
              </td>
              <td>{formatScoreRate(item.score_rate)}</td>
              <td>{formatGateAnswer(item.child_gate_answer)}</td>
              <td>{formatGateAnswer(item.cross_border_gate_answer)}</td>
              <td>{getFollowUpStatusLabel(item.follow_up_status)}</td>
              <td>{formatServiceTypes(item.service_type)}</td>
              <td>{item.assigned_to || "-"}</td>
              <td>{formatDateTime(item.updated_at || item.created_at)}</td>
              <td>
                <button type="button" className="btn btn-ghost" disabled>
                  查看详情（下一轮）
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
