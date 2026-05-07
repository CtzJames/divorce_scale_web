"use client";

import { useRef, useState } from "react";
import {
  BrainCircuit,
  Crown,
  ClipboardCheck,
  Coins,
  FileCheck2,
  Globe2,
  HeartCrack,
  LayoutGrid,
  Lightbulb,
  Lock,
  BarChart3,
  Scale,
  Target,
  UsersRound,
} from "lucide-react";
import { toPng } from "html-to-image";
import AdminDimensionRadarChart from "./AdminDimensionRadarChart";

const REPORT_HEADER_LOGO_SRC = "/assets/ZUNERGUANGLOGO01.png";
const REPORT_FOOTER_LOGO_SRC = "/assets/ZUNERGUANGLOGO02.png";
const HERO_WATERMARK_SRC = "/assets/report-watermark-hero.png";
const BOUNDARY_WATERMARK_SRC = "/assets/report-watermark-boundary.png";

const DIMENSION_META = {
  D1: {
    shortLabel: "心理",
    accent: "#5B6BFF",
    tint: "rgba(91, 107, 255, 0.12)",
    Icon: BrainCircuit,
  },
  D2: {
    shortLabel: "经济",
    accent: "#22B573",
    tint: "rgba(34, 181, 115, 0.12)",
    Icon: Coins,
  },
  D3: {
    shortLabel: "亲权",
    accent: "#13C2A3",
    tint: "rgba(19, 194, 163, 0.12)",
    Icon: UsersRound,
  },
  D4: {
    shortLabel: "财权",
    accent: "#F59E0B",
    tint: "rgba(245, 158, 11, 0.13)",
    Icon: Lock,
  },
  D5: {
    shortLabel: "知法",
    accent: "#3366CC",
    tint: "rgba(51, 102, 204, 0.12)",
    Icon: Scale,
  },
  D6: {
    shortLabel: "情感",
    accent: "#F06292",
    tint: "rgba(240, 98, 146, 0.13)",
    Icon: HeartCrack,
  },
  D7: {
    shortLabel: "域外",
    accent: "#8B5CF6",
    tint: "rgba(139, 92, 246, 0.13)",
    Icon: Globe2,
  },
};

function getDimensionScoreVisual(score) {
  const safeScore = Number(score);

  if (!Number.isFinite(safeScore)) {
    return {
      level: "mid",
      label: "中等",
      main: "#C58A2E",
      deep: "#A56F1F",
      soft: "#F6EBD8",
      text: "#A56F1F",
      border: "rgba(165, 111, 31, 0.22)",
    };
  }

  if (safeScore < 3) {
    return {
      level: "low",
      label: "待补强",
      main: "#C65A46",
      deep: "#9F4334",
      soft: "#F9EAE6",
      text: "#9F4334",
      border: "rgba(159, 67, 52, 0.22)",
    };
  }

  if (safeScore < 4) {
    return {
      level: "mid",
      label: "中等",
      main: "#C58A2E",
      deep: "#A56F1F",
      soft: "#F6EBD8",
      text: "#A56F1F",
      border: "rgba(165, 111, 31, 0.22)",
    };
  }

  if (safeScore < 4.5) {
    return {
      level: "good",
      label: "较高",
      main: "#4F8A6A",
      deep: "#3D6F54",
      soft: "#EAF4EE",
      text: "#3D6F54",
      border: "rgba(61, 111, 84, 0.22)",
    };
  }

  return {
    level: "high",
    label: "优势",
    main: "#3568B8",
    deep: "#244C8E",
    soft: "#EAF0FA",
    text: "#244C8E",
    border: "rgba(36, 76, 142, 0.22)",
  };
}

function formatScore(score) {
  return Number(score).toFixed(1);
}

function getProgressWidth(scoreRateText) {
  const value = Number.parseFloat(scoreRateText);
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

function getScoreRateStatus(scoreRateText) {
  const value = Number.parseFloat(scoreRateText);
  if (!Number.isFinite(value)) return "结果待补充";
  if (value < 60) return "需重点补强";
  if (value < 70) return "中等（建议尽快优化）";
  if (value < 80) return "良好（建议持续优化）";
  return "优势（建议保持并巩固）";
}

function getOverallScoreVisual(scoreRateText) {
  const value = Number.parseFloat(scoreRateText);

  if (!Number.isFinite(value)) {
    return {
      theme: "mid",
      main: "#C58A2E",
      deep: "#A56F1F",
      soft: "#F6EBD8",
      text: "#A56F1F",
      border: "rgba(165, 111, 31, 0.22)",
      gradient: "linear-gradient(135deg, #A56F1F 0%, #C58A2E 100%)",
      track: "rgba(197, 138, 46, 0.18)",
    };
  }

  if (value < 60) {
    return {
      theme: "low",
      main: "#C65A46",
      deep: "#9F4334",
      soft: "#F9EAE6",
      text: "#9F4334",
      border: "rgba(159, 67, 52, 0.22)",
      gradient: "linear-gradient(135deg, #9F4334 0%, #C65A46 100%)",
      track: "rgba(198, 90, 70, 0.18)",
    };
  }

  if (value < 80) {
    return {
      theme: "mid",
      main: "#C58A2E",
      deep: "#A56F1F",
      soft: "#F6EBD8",
      text: "#A56F1F",
      border: "rgba(165, 111, 31, 0.22)",
      gradient: "linear-gradient(135deg, #A56F1F 0%, #C58A2E 100%)",
      track: "rgba(197, 138, 46, 0.18)",
    };
  }

  if (value < 90) {
    return {
      theme: "good",
      main: "#4F8A6A",
      deep: "#3D6F54",
      soft: "#EAF4EE",
      text: "#3D6F54",
      border: "rgba(61, 111, 84, 0.22)",
      gradient: "linear-gradient(135deg, #3D6F54 0%, #4F8A6A 100%)",
      track: "rgba(79, 138, 106, 0.18)",
    };
  }

  return {
    theme: "high",
    main: "#3568B8",
    deep: "#244C8E",
    soft: "#EAF0FA",
    text: "#244C8E",
    border: "rgba(36, 76, 142, 0.22)",
    gradient: "linear-gradient(135deg, #244C8E 0%, #3568B8 100%)",
    track: "rgba(53, 104, 184, 0.18)",
  };
}

function getPriorityDimensions(dimensions) {
  return [...dimensions]
    .sort((a, b) => a.avg - b.avg)
    .slice(0, Math.min(2, dimensions.length))
    .map((item) => item.shortName || item.code)
    .join("、");
}

function getExecutiveSummary(level) {
  if (level === "high") {
    return "整体基础较强，建议保持优势并持续巩固关键准备。";
  }

  if (level === "low") {
    return "当前短板较为集中，建议优先补强关键维度后再稳步推进。";
  }

  return "具备较好基础，建议针对短板进行结构性补强，稳步推进。";
}

async function waitForImages(container) {
  const images = Array.from(container.querySelectorAll("img"));
  if (images.length === 0) return;

  await Promise.all(
    images.map((image) => {
      if (image.complete && image.naturalWidth > 0) {
        return Promise.resolve();
      }

      if (typeof image.decode === "function") {
        return image.decode().catch(() => undefined);
      }

      return new Promise((resolve) => {
        image.addEventListener("load", resolve, { once: true });
        image.addEventListener("error", resolve, { once: true });
      });
    })
  );
}

function LogoLockup({ compact = false, src }) {
  return (
    <div className={`report-logo-lockup${compact ? " compact" : ""}`}>
      <img
        src={src}
        alt="尊而光律师事务所"
        className="report-logo-image"
        crossOrigin="anonymous"
      />
      <div className="report-logo-text">
        <strong>尊而光律师事务所</strong>
        <span>PRIDE&BRIGHT LAWYERS</span>
      </div>
    </div>
  );
}

function StatIcon({ kind, className = "", style }) {
  const icons = {
    result: <Crown size={24} strokeWidth={2} />,
    score: <ClipboardCheck size={24} strokeWidth={2} />,
    total: <BarChart3 size={24} strokeWidth={2} />,
    dimension: <LayoutGrid size={24} strokeWidth={2} />,
    priority: <Target size={24} strokeWidth={2} />,
    tip: <Lightbulb size={20} strokeWidth={2} />,
  };

  return (
    <span className={`report-mini-icon ${className}`.trim()} style={style}>
      {icons[kind] || <ClipboardCheck size={24} strokeWidth={2} />}
    </span>
  );
}

function ScorePill({ score }) {
  const meta = getDimensionScoreVisual(score);
  return (
    <div className="report-score-pill" style={{ color: meta.main }}>
      <strong>{Number(score).toFixed(2)}</strong>
      <span
        className="report-score-tag"
        style={{
          color: meta.text,
          backgroundColor: meta.soft,
          borderColor: meta.border,
        }}
      >
        {meta.label}
      </span>
    </div>
  );
}

function DimensionIcon({ code }) {
  const meta = DIMENSION_META[code] || DIMENSION_META.D1;
  const Icon = meta.Icon || BrainCircuit;
  return (
    <span
      className="dimension-icon-badge"
      style={{ backgroundColor: meta.tint, color: meta.accent }}
      aria-hidden="true"
    >
      <Icon size={24} strokeWidth={2.1} />
    </span>
  );
}

function DimensionIdentity({ dimension }) {
  const meta = DIMENSION_META[dimension.code] || DIMENSION_META.D1;

  return (
    <div className="report-dimension-identity">
      <div className="report-dimension-identity-top">
        <div className="report-dimension-identity-badge">
          <DimensionIcon code={dimension.code} />
          <span
            className="report-dimension-code-tag"
            style={{
              color: meta.accent,
              backgroundColor: meta.tint,
              borderColor: `${meta.accent}33`,
            }}
          >
            {dimension.code}
          </span>
        </div>
        <div className="report-dimension-identity-copy">
          <h3>{dimension.name}</h3>
          <p>{dimension.functionText}</p>
        </div>
      </div>
    </div>
  );
}

export default function LeadReportPage({ report }) {
  const exportRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);
  const [feedback, setFeedback] = useState({ type: null, message: "" });
  const scoreRateValue = getProgressWidth(report.scoreRateText);
  const priorityDimensions = getPriorityDimensions(report.dimensions);
  const overallVisual = getOverallScoreVisual(report.scoreRateText);

  async function handleExportImage() {
    if (!exportRef.current || isExporting) return;

    setIsExporting(true);
    setFeedback({ type: null, message: "" });

    try {
      await waitForImages(exportRef.current);

      const dataUrl = await toPng(exportRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#f4f7fb",
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
          <p className="subtitle">当前页为后台内部预览页，支持固定版心报告图片导出。</p>
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
          <div className="report-hero-brand">
            <LogoLockup src={REPORT_HEADER_LOGO_SRC} />
            <div className="report-hero-meta">
              <span className="report-chip">内部资料</span>
              <span className="report-chip report-chip-muted">仅限内部使用</span>
              <p>报告生成时间：{report.reportGeneratedAtText || "-"}</p>
            </div>
          </div>

          <img
            src={HERO_WATERMARK_SRC}
            alt=""
            aria-hidden="true"
            className="report-hero-watermark"
          />

          <div className="report-hero-main">
            <h1>测评结果详细解读报告</h1>
            <h2>离婚准备度综合评估</h2>
            <p className="report-summary">
              本报告基于对您在心理、经济、亲权、财权、知法、情感与域外七个维度的评估，
              结合当前阶段个体情况，形成离婚准备度综合评估结果与针对性建议，
              为您制定下一步行动计划、优化决策与风险防控提供参考。
            </p>
          </div>
        </section>

        <section className="report-summary-board">
          <div
            className="report-result-card"
            style={{ background: overallVisual.gradient }}
          >
            <div className="report-result-card-mark">
              <StatIcon kind="result" className="report-result-icon" />
            </div>
            <span>您的综合评估结果</span>
            <strong>{report.totalResult.label}</strong>
            <p>{getExecutiveSummary(report.resultLevel)}</p>
          </div>

          <div className="report-rate-card">
            <span className="report-card-kicker">综合得分率</span>
            <strong style={{ color: overallVisual.main }}>{report.scoreRateText}</strong>
            <div
              className="report-progress-track"
              style={{ backgroundColor: overallVisual.track }}
            >
              <div
                className="report-progress-bar"
                style={{
                  width: `${scoreRateValue}%`,
                  background: `linear-gradient(90deg, ${overallVisual.deep} 0%, ${overallVisual.main} 100%)`,
                }}
              />
            </div>
            <p style={{ color: overallVisual.text }}>{getScoreRateStatus(report.scoreRateText)}</p>
          </div>

          <div className="report-metrics-grid">
            <div className="report-metric-card">
              <StatIcon kind="score" />
              <span>总分</span>
              <strong>{report.totalScore}</strong>
            </div>
            <div className="report-metric-card">
              <StatIcon kind="total" />
              <span>动态满分</span>
              <strong>{report.dynamicFullScore}</strong>
            </div>
            <div className="report-metric-card">
              <StatIcon kind="dimension" />
              <span>纳入维度</span>
              <strong>{report.dimensions.length} 项</strong>
            </div>
            <div className="report-metric-card">
              <StatIcon kind="priority" />
              <span>优先补强维度</span>
              <strong>{priorityDimensions || "-"}</strong>
            </div>
          </div>
        </section>

        <div className="report-tip-bar">
          <StatIcon kind="tip" className="report-tip-icon" />
          <p>
            <strong>总体评价：</strong>
            {report.totalResult.summary}
          </p>
        </div>

        <section className="report-section">
          <div className="report-section-title">
            <i />
            <h2>维度结构概览</h2>
          </div>

          <div className="report-structure-grid">
            <div className="report-radar-panel">
              <AdminDimensionRadarChart dimensions={report.dimensions} />
            </div>

            <div className="report-dimension-overview-grid">
            {report.dimensions.map((dimension) => {
              const meta = DIMENSION_META[dimension.code] || DIMENSION_META.D1;
              const scoreMeta = getDimensionScoreVisual(dimension.avg);

                return (
                  <section key={dimension.code} className="dimension-overview-card">
                    <div className="dimension-overview-head">
                      <DimensionIcon code={dimension.code} />
                      <div>
                        <h3>{meta.shortLabel}</h3>
                        <p>平均得分</p>
                      </div>
                    </div>
                    <div className="dimension-overview-score">
                      <strong style={{ color: scoreMeta.main }}>
                        {formatScore(dimension.avg)}
                      </strong>
                      <span>/5</span>
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        </section>

        <section className="report-section">
          <div className="report-section-title">
            <i />
            <h2>七维度详细解读</h2>
          </div>

          <div className="report-dimension-list">
            {report.dimensions.map((dimension) => {
              return (
                <section key={dimension.code} className="report-dimension-card">
                  <DimensionIdentity dimension={dimension} />

                  <div className="report-dimension-content">
                    <h4>当前状态解读</h4>
                    <p>{dimension.analysis}</p>
                  </div>

                  <div className="report-dimension-content">
                    <h4>后续提升建议</h4>
                    <p>{dimension.advice}</p>
                  </div>

                  <div className="report-dimension-score-box">
                    <ScorePill score={dimension.avg} />
                  </div>
                </section>
              );
            })}
          </div>
        </section>

        <section className="report-boundary-panel">
          <div className="report-boundary-head">
            <span className="report-boundary-icon">
              <FileCheck2 aria-hidden="true" strokeWidth={2} />
            </span>
            <div>
              <h2>报告使用边界</h2>
              <ul className="report-boundary-list">
                <li>本报告仅用于提供结构化评估与准备方向参考，不构成正式法律意见或诉讼策略。</li>
                <li>报告内容基于当前测评作答生成，可能受个人情况变化和补充信息影响。</li>
                <li>涉及离婚诉讼、抚养权、财产处理、跨境身份等重大决策时，仍建议结合律师等专业人士意见综合判断。</li>
              </ul>
            </div>
          </div>
          <img
            src={BOUNDARY_WATERMARK_SRC}
            alt=""
            aria-hidden="true"
            className="report-boundary-watermark"
          />
        </section>

        <footer className="report-footer">
          <LogoLockup compact src={REPORT_FOOTER_LOGO_SRC} />
          <p className="report-footer-slogan">诚而信，尊而光</p>
        </footer>
      </article>
    </div>
  );
}
