"use client";

import { useMemo, useState } from "react";
import {
  DIMENSION_META,
  FLOW,
  LIKERT_OPTIONS,
  QUESTIONS,
  QUESTION_MAP,
} from "../data/questions.js";
import { RESULT_COPY } from "../data/resultCopy.js";
import { formatRate, getLevelKey, getScore } from "../lib/scoring.js";

export default function HomePage() {
  const [step, setStep] = useState("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});

  const visibleQuestionIds = useMemo(() => {
    return FLOW.filter((id) => {
      if (id.startsWith("D3_") && answers.SYS_CHILD_GATE === "no") return false;
      if (id.startsWith("D7_") && answers.SYS_CROSS_BORDER_GATE === "no")
        return false;
      return true;
    });
  }, [answers]);

  const currentQuestionId = visibleQuestionIds[currentIndex];
  const currentQuestion = QUESTION_MAP[currentQuestionId];
  const currentAnswer = answers[currentQuestionId];
  const isLastQuestion = currentIndex === visibleQuestionIds.length - 1;

  const resultData = useMemo(() => {
    const skippedDimensions = {
      D3: answers.SYS_CHILD_GATE === "no",
      D7: answers.SYS_CROSS_BORDER_GATE === "no",
    };

    const dimensions = {};
    Object.keys(DIMENSION_META).forEach((code) => {
      dimensions[code] = {
        code,
        name: DIMENSION_META[code].name,
        total: 0,
        count: 0,
        avg: null,
        skipped: Boolean(skippedDimensions[code]),
      };
    });

    let totalScore = 0;
    let effectiveCount = 0;

    QUESTIONS.forEach((q) => {
      if (q.system) return;
      if (dimensions[q.dimension]?.skipped) return;

      const value = answers[q.id];
      const score = getScore(value, q.reverse);

      if (score === null) return;

      totalScore += score;
      effectiveCount += 1;
      dimensions[q.dimension].total += score;
      dimensions[q.dimension].count += 1;
    });

    Object.values(dimensions).forEach((item) => {
      if (!item.skipped && item.count > 0) {
        item.avg = item.total / item.count;
      }
    });

    const dynamicFullScore = effectiveCount * 5;
    const scoreRate =
      dynamicFullScore > 0 ? (totalScore / dynamicFullScore) * 100 : 0;
    const levelKey = getLevelKey(scoreRate);

    const validDimensions = Object.values(dimensions).filter(
      (item) => !item.skipped && item.avg !== null
    );

    let weaknesses = validDimensions
      .filter((item) => item.avg < 3)
      .sort((a, b) => a.avg - b.avg);

    if (weaknesses.length === 0) {
      weaknesses = [...validDimensions]
        .sort((a, b) => a.avg - b.avg)
        .slice(0, Math.min(2, validDimensions.length));
    }

    weaknesses = weaknesses.slice(0, 3).map((item) => ({
      ...item,
      hint: DIMENSION_META[item.code].hint,
      action: DIMENSION_META[item.code].action,
    }));

    return {
      totalScore,
      dynamicFullScore,
      scoreRate,
      levelKey,
      level: RESULT_COPY[levelKey],
      weaknesses,
    };
  }, [answers]);

  const handleStart = () => {
    setStep("question");
    setCurrentIndex(0);
  };

  const handleAnswer = (value) => {
    setAnswers((prev) => {
      const next = { ...prev, [currentQuestionId]: value };

      if (currentQuestionId === "SYS_CHILD_GATE" && value === "no") {
        ["D3_Q01", "D3_Q02", "D3_Q03", "D3_Q04"].forEach((id) => delete next[id]);
      }

      if (currentQuestionId === "SYS_CROSS_BORDER_GATE" && value === "no") {
        ["D7_Q01", "D7_Q02", "D7_Q03", "D7_Q04"].forEach((id) => delete next[id]);
      }

      return next;
    });
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    if (currentAnswer === undefined) return;

    if (isLastQuestion) {
      setStep("result");
      return;
    }

    setCurrentIndex((prev) =>
      Math.min(prev + 1, visibleQuestionIds.length - 1)
    );
  };

  const handleRestart = () => {
    setStep("intro");
    setCurrentIndex(0);
    setAnswers({});
  };

  const progress =
    visibleQuestionIds.length > 0
      ? ((currentIndex + 1) / visibleQuestionIds.length) * 100
      : 0;

  if (step === "intro") {
    return (
      <main className="page-shell">
        <section className="hero-card">
          <div className="hero-tag">离婚力量表网页端</div>
          <h1>离婚之前，先测一测你是否真的准备好了。</h1>
          <p>
            从心理承受、经济准备、法律认知、子女安排到跨境风险，系统评估您当前的离婚准备状态。测评结果可用于自我梳理，也可作为后续律师咨询的前置信息。
          </p>

          <div className="intro-actions">
            <button className="primary-btn" onClick={handleStart}>
              开始测评
            </button>
          </div>

          <div className="intro-meta">
            <span>测试时长：约 5–8 分钟</span>
            <span>按最近一个月的实际情况作答</span>
            <span>结果可生成图片保存</span>
            <span>仅用于个人评估与咨询参考</span>
          </div>
        </section>
      </main>
    );
  }

  if (step === "question" && currentQuestion) {
    return (
      <main className="page-shell">
        <section className="quiz-card">
          <div className="quiz-head">
            <div>
              <div className="hero-tag">
                {currentQuestion.system
                  ? "系统分流题 · 不计分"
                  : `当前维度 · ${DIMENSION_META[currentQuestion.dimension].name}`}
              </div>
              <h1 className="quiz-title">{currentQuestion.text}</h1>
              <p className="quiz-copy">
                请您根据自身真实情况如实作答。
                {currentQuestion.system
                  ? currentQuestion.helper
                  : "若题目与您无关，可直接选择“与本人情况无关”。"}
              </p>
            </div>
            <div className="counter-box">
              第 {currentIndex + 1} / {visibleQuestionIds.length} 题
            </div>
          </div>

          <div className="progress-wrap">
            <div
              className="progress-bar"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="option-list">
            {(currentQuestion.options || LIKERT_OPTIONS).map((item) => {
              const active = currentAnswer === item.value;
              return (
                <button
                  key={item.label}
                  className={`option-item ${active ? "active" : ""}`}
                  onClick={() => handleAnswer(item.value)}
                >
                  <span>{item.label}</span>
                  <span className="radio-dot" />
                </button>
              );
            })}
          </div>

          <div className="bottom-actions">
            <button
              className="secondary-btn"
              onClick={handlePrev}
              disabled={currentIndex === 0}
            >
              上一题
            </button>

            <button
              className="primary-btn"
              onClick={handleNext}
              disabled={currentAnswer === undefined}
            >
              {isLastQuestion ? "提交并查看结果" : "下一题"}
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <section className="result-layout">
        <div className={`result-hero theme-${resultData.levelKey}`}>
          <div className="result-label">您的离婚准备评估结果</div>
          <h1>{resultData.level.label}</h1>
          <p>{resultData.level.subtitle}</p>

          <div className="result-metrics">
            <div className="metric-card">
              <span>总分</span>
              <strong>{resultData.totalScore}</strong>
            </div>
            <div className="metric-card">
              <span>动态满分</span>
              <strong>{resultData.dynamicFullScore}</strong>
            </div>
            <div className="metric-card">
              <span>得分率</span>
              <strong>{formatRate(resultData.scoreRate)}</strong>
            </div>
          </div>
        </div>

        <div className="result-side-card">
          <h2>这意味着什么</h2>
          <p>{resultData.level.summary}</p>
        </div>

        <div className="result-main-card">
          <h2>您当前最需要优先处理的环节</h2>
          <div className="weakness-list">
            {resultData.weaknesses.map((item) => (
              <div key={item.code} className="weakness-item">
                <div className="weakness-head">
                  <strong>{item.name}</strong>
                  <span>均分 {item.avg.toFixed(1)}</span>
                </div>
                <p>{item.hint}</p>
                <p className="emphasis">{item.action}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="result-side-card">
          <h2>下一步更适合怎么做</h2>
          <p>{resultData.level.action}</p>
          <div className="intro-actions">
            <button className="primary-btn" onClick={handleRestart}>
              重新测评
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}