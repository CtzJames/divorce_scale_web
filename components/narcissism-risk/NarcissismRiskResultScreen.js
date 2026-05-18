import {
  NARCISSISM_RISK_DIMENSION_ORDER,
  NARCISSISM_RISK_DIMENSIONS,
  NARCISSISM_RISK_QUESTION_COUNT,
} from "../../data/narcissismRiskQuestions.js";
import {
  NARCISSISM_RISK_DISCLAIMER_COPY,
  NARCISSISM_RISK_HIGH_RISK_COPY,
  NARCISSISM_RISK_LEVELS,
  NARCISSISM_RISK_VALIDITY_COPY,
} from "../../data/narcissismRiskResultCopy.js";
import NarcissismRiskRadarChart from "./NarcissismRiskRadarChart.js";
import styles from "./narcissismRisk.module.css";

const RESULT_HERO_CLASS = {
  low: styles.resultHeroLow,
  mild: styles.resultHeroMild,
  moderate: styles.resultHeroModerate,
  high: styles.resultHeroHigh,
};

const RISK_BADGE_CLASS = {
  low: styles.riskBadgeLow,
  mild: styles.riskBadgeMild,
  moderate: styles.riskBadgeModerate,
  high: styles.riskBadgeHigh,
};

function formatScore(value) {
  return Number.isFinite(value) ? value.toFixed(2) : "0.00";
}

function getDimensionValidityNotice(dimensionDetails) {
  if (!dimensionDetails) return null;

  const affectedDimensions = NARCISSISM_RISK_DIMENSION_ORDER.filter((code) => {
    const detail = dimensionDetails[code];
    return detail?.insufficient_validity || detail?.no_valid_answers;
  });

  if (affectedDimensions.length === 0) return null;

  const noValidDimensions = affectedDimensions.filter(
    (code) => dimensionDetails[code]?.no_valid_answers
  );
  const hasNoValidAnswers = noValidDimensions.length > 0;
  const affectedDimensionNames = affectedDimensions
    .map((code) => NARCISSISM_RISK_DIMENSIONS[code].shortName)
    .join("、");

  return {
    title: NARCISSISM_RISK_VALIDITY_COPY.dimensionLowValidity.title,
    body: hasNoValidAnswers
      ? "部分维度有效作答不足，相关维度暂无法形成稳定分数。"
      : NARCISSISM_RISK_VALIDITY_COPY.dimensionLowValidity.body,
    affectedDimensionNames,
    hasNoValidAnswers,
  };
}

export default function NarcissismRiskResultScreen({ scoringResult, onRestart }) {
  const levelCopy = NARCISSISM_RISK_LEVELS.find(
    (item) => item.level === scoringResult.result_level
  );
  const highRiskCopy = NARCISSISM_RISK_HIGH_RISK_COPY.triggered;
  const dimensionValidityNotice = getDimensionValidityNotice(
    scoringResult.dimension_details
  );
  const hasNaAnswers = scoringResult.na_answer_count > 0;

  const radarDimensions = NARCISSISM_RISK_DIMENSION_ORDER.map((code) => ({
    code,
    name: NARCISSISM_RISK_DIMENSIONS[code].name,
    shortName: NARCISSISM_RISK_DIMENSIONS[code].shortName,
    score: scoringResult.dimension_scores[code],
    detail: scoringResult.dimension_details?.[code],
  }));

  return (
    <main className={styles.pageShell}>
      <div className={styles.pageFrame}>
        <section className={styles.resultLayout}>
          <div
            className={`${styles.resultHero} ${
              RESULT_HERO_CLASS[scoringResult.result_level] ?? ""
            }`}
          >
            <div className={styles.resultTopline}>
              <span className={`${styles.topLabel} ${styles.resultTopLabel}`}>
                配偶高自恋特质与高冲突婚姻风险自测结果
              </span>
              <span
                className={`${styles.riskBadge} ${
                  RISK_BADGE_CLASS[scoringResult.result_level] ?? ""
                }`}
              >
                {scoringResult.result_label}
              </span>
            </div>
            <h1>{levelCopy?.shortLabel ?? scoringResult.result_label}</h1>
            <p className={styles.resultSummary}>
              {levelCopy?.summary ?? "本次测评结果已生成，请结合现实事件理解。"}
            </p>

            <div className={styles.metricGrid}>
              <div className={styles.metricItem}>
                <span>总平均分</span>
                <strong>{formatScore(scoringResult.average_score)} / 5</strong>
              </div>
              <div className={styles.metricItem}>
                <span>总分 / 动态满分</span>
                <strong>
                  {scoringResult.total_score} / {scoringResult.dynamic_full_score}
                </strong>
              </div>
              <div className={styles.metricItem}>
                <span>有效作答</span>
                <strong>
                  {scoringResult.valid_answer_count} / {NARCISSISM_RISK_QUESTION_COUNT}
                </strong>
              </div>
              <div className={styles.metricItem}>
                <span>高风险触发</span>
                <strong>{scoringResult.high_risk_triggered ? "是" : "否"}</strong>
              </div>
            </div>

            <p className={styles.directionText}>
              分数越高，代表相关高自恋互动特征与高冲突风险信号越明显。
              {hasNaAnswers
                ? ` 选择“与本人情况无关”的题目不计入总分和动态满分，本次共 ${scoringResult.na_answer_count} 题。`
                : ""}
            </p>
          </div>

          <div className={styles.sectionPanel}>
            <h2 className={styles.sectionTitle}>五维雷达图</h2>
            <p className={styles.bodyText}>
              雷达图用于呈现五类风险信号的相对分布。分数越高，代表该维度相关风险信号越明显；如某维度有效作答不足，雷达图仅供参考。
            </p>
            <div className={styles.radarWrap}>
              <NarcissismRiskRadarChart dimensions={radarDimensions} />
            </div>
            {dimensionValidityNotice && (
              <p className={styles.inlineValidityText}>
                部分维度有效作答不足，雷达图仅供参考。
              </p>
            )}
          </div>

          {scoringResult.low_validity && (
            <div className={styles.validityCard}>
              <h2>{NARCISSISM_RISK_VALIDITY_COPY.lowValidity.title}</h2>
              <p>{NARCISSISM_RISK_VALIDITY_COPY.lowValidity.body}</p>
            </div>
          )}

          {dimensionValidityNotice && (
            <div
              className={`${styles.validityCard} ${
                dimensionValidityNotice.hasNoValidAnswers
                  ? styles.validityCardStrong
                  : ""
              }`}
            >
              <h2>{dimensionValidityNotice.title}</h2>
              <p>{dimensionValidityNotice.body}</p>
              <p className={styles.validityMeta}>
                有效作答不足维度：{dimensionValidityNotice.affectedDimensionNames}
              </p>
            </div>
          )}

          {scoringResult.high_risk_triggered && (
            <div className={`${styles.riskCard} ${styles.riskCardTriggered}`}>
              <h2>{highRiskCopy.title}</h2>
              <p>{highRiskCopy.body}</p>
              {highRiskCopy.footer && (
                <p className={styles.riskFooter}>{highRiskCopy.footer}</p>
              )}
            </div>
          )}

          <div className={styles.resultActionPanel}>
            <button type="button" className={styles.secondaryButton} onClick={onRestart}>
              重新测评
            </button>
          </div>

          <div className={styles.disclaimerPanel}>
            <h2>免责声明</h2>
            <p>{NARCISSISM_RISK_DISCLAIMER_COPY.full}</p>
          </div>
        </section>
      </div>
    </main>
  );
}
