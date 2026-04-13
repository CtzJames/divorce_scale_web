import { DIMENSION_META, LIKERT_OPTIONS } from "../data/questions.js";
import { RESULT_COPY } from "../data/resultCopy.js";
import { formatRate, getLevelKey, getScore } from "../lib/scoring.js";

export default function HomePage() {
  const demoRate = 73.5;
  const levelKey = getLevelKey(demoRate);
  const level = RESULT_COPY[levelKey];
  const demoScore = getScore(4, false);

  return (
    <main className="page-shell">
      <section className="hero-card">
        <div className="hero-tag">离婚力量表网页端</div>
        <h1>项目迁移第一步已完成</h1>
        <p>
          当前已经把结果文案、维度配置与基础计分函数从页面中拆分出来，进入了正式的模块化开发阶段。
        </p>

        <div style={{ marginTop: 24, lineHeight: 2 }}>
          <div>当前演示结果等级：{level.label}</div>
          <div>当前演示得分率：{formatRate(demoRate)}</div>
          <div>单题演示计分：{demoScore}</div>
          <div>当前维度数量：{Object.keys(DIMENSION_META).length}</div>
          <div>当前标准选项数量：{LIKERT_OPTIONS.length}</div>
        </div>
      </section>
    </main>
  );
}