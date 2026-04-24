"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import AdminDimensionRadarChart from "./AdminDimensionRadarChart";

function getLevelTheme(level) {
  if (level === "high") return "high";
  if (level === "low") return "low";
  return "mid";
}

export default function LeadReportPage({ report }) {
  const exportRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);
  const [feedback, setFeedback] = useState({ type: null, message: "" });
  const levelTheme = getLevelTheme(report.resultLevel);

  async function handleExportImage() {
    if (!exportRef.current || isExporting) return;

    setIsExporting(true);
    setFeedback({ type: null, message: "" });

    try {
      const dataUrl = await toPng(exportRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#f3f7fb",
      });

      const link = document.createElement("a");
      link.download = `lead-report-${report.id}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();

      setFeedback({ type: "success", message: "已导出详细解读报告图片。" });
    } catch (error) {
      console.error("Report export failed:", error);
      setFeedback({ type: "error", message: "导出失败，请稍后重试。" });
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="report-page-shell">
      <section className="panel report-toolbar-panel">
        <div>
          <h2 className="report-toolbar-title">用户测评详细解读报告</h2>
          <p className="subtitle">
            当前页为后台内部预览页，首版支持整页图片导出。
          </p>
        </div>
        <div className="toolbar">
          <button
            className="btn btn-primary"
            type="button"
            onClick={handleExportImage}
            disabled={isExporting}
          >
            {isExporting ? "导出中..." : "导出报告图片"}
          </button>
        </div>
      </section>

      {feedback.type ? (
        <div
          className={`notice ${feedback.type === "success" ? "success" : "error"}`}
        >
          {feedback.message}
        </div>
      ) : null}

      <article ref={exportRef} className="report-sheet">
        <section className="report-hero">
          <div className="report-hero-main">
            <p className="report-eyebrow">离婚力量表报告</p>
            <h1>测评结果详细解读报告</h1>
            <p className="report-summary">{report.totalResult.summary}</p>
          </div>
        </section>

        <section className="report-section">
          <div className="report-section-head">
            <h2>测评总结果概览</h2>
          </div>

          <div className="report-overview-grid">
            <div className={`report-overview-card highlight level-${levelTheme}`}>
              <span>结果等级</span>
              <strong>{report.totalResult.label}</strong>
            </div>
            <div className="report-overview-card">
              <span>总分</span>
              <strong>{report.totalScore}</strong>
            </div>
            <div className="report-overview-card">
              <span>动态满分</span>
              <strong>{report.dynamicFullScore}</strong>
            </div>
            <div className="report-overview-card">
              <span>得分率</span>
              <strong>{report.scoreRateText}</strong>
            </div>
          </div>
        </section>

        <section className="report-section">
          <div className="report-section-head">
            <h2>动态维度雷达图</h2>
            <p>仅展示本次测评实际纳入报告的维度；无子女跳过 D3，非跨境跳过 D7。</p>
          </div>
          <AdminDimensionRadarChart dimensions={report.dimensions} />
        </section>

        <section className="report-section">
          <div className="report-section-head">
            <h2>七维逐项详细解读</h2>
          </div>

          <div className="report-dimension-list">
            {report.dimensions.map((dimension) => (
              <section key={dimension.code} className="report-dimension-card">
                <div className="report-dimension-head">
                  <div>
                    <p className="report-dimension-code">{dimension.code}</p>
                    <h3>{dimension.name}</h3>
                  </div>
                  <div className="report-dimension-score">
                    <span>维度平均分</span>
                    <strong>{dimension.avg.toFixed(2)}</strong>
                  </div>
                </div>

                <p className="report-dimension-intro">{dimension.functionText}</p>

                <div className="report-dimension-block">
                  <h4>当前状态解读</h4>
                  <p>{dimension.analysis}</p>
                </div>

                <div className="report-dimension-block">
                  <h4>后续提升建议</h4>
                  <p>{dimension.advice}</p>
                </div>
              </section>
            ))}
          </div>
        </section>

        <section className="report-section report-footer-note">
          <div className="report-section-head">
            <h2>提示与边界说明</h2>
          </div>
          <ul className="report-boundary-list">
            <li>本报告仅用于提供结构化评估与准备方向参考，不构成正式法律、心理、医疗等专业意见。</li>
            <li>报告内容基于当前测评作答结果与既定题库口径生成，不能替代个案事实核查与专业面谈。</li>
            <li>涉及离婚推进、抚养权、财产处理、跨境身份等重大决策时，仍建议结合律师等专业人士意见综合判断。</li>
          </ul>
        </section>
      </article>
    </div>
  );
}
