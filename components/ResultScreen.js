import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { formatRate } from "../lib/scoring.js";
import DimensionRadarChart from "./DimensionRadarChart.js";
import SimpleResultExportCard from "./SimpleResultExportCard.js";

export default function ResultScreen({
    resultData,
    onRestart,
    onSubmitResult,
    isSubmitting,
    hasSubmitted,
    submitFeedback,
    contactForm,
    contactFeedback,
    onContactFieldChange,
}) {
    const exportCardRef = useRef(null);
    const [isExporting, setIsExporting] = useState(false);
    const [exportFeedback, setExportFeedback] = useState({
        type: null,
        message: "",
    });

    const successFeedbackByLevel = {
        high: "已收到您的信息，测评结果已保存。后续可结合本次评估，进一步沟通正式推进前更值得优先确认的关键安排。",
        mid: "已收到您的信息，测评结果已保存。后续可结合本次评估，进一步沟通当前更值得优先补强的环节与推进顺序。",
        low: "已收到您的信息，测评结果已保存。后续可结合本次评估，进一步沟通当前需要优先梳理的风险点与准备方向。",
    };

    const resolvedSubmitFeedbackMessage =
        submitFeedback?.type === "success"
            ? successFeedbackByLevel[resultData.levelKey] ?? submitFeedback.message
            : submitFeedback?.message;

    const handleExportSimpleResultImage = async () => {
        if (!exportCardRef.current || isExporting) return;

        setIsExporting(true);
        setExportFeedback({
            type: null,
            message: "",
        });

        try {
            const dataUrl = await toPng(exportCardRef.current, {
                cacheBust: true,
                pixelRatio: 2,
                backgroundColor: "#ffffff",
            });

            const fileName = `result-simple-${resultData.levelKey}-${Date.now()}.png`;
            const link = document.createElement("a");
            link.download = fileName;
            link.href = dataUrl;
            link.click();

            setExportFeedback({
                type: "success",
                message: "已生成简洁版结果图。",
            });
        } catch (error) {
            console.error("Export image failed:", error);
            setExportFeedback({
                type: "error",
                message: "导出失败，请稍后重试。",
            });
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <main className="page-shell">
            <section className="result-layout">
                <div className={`result-hero theme-${resultData.levelKey}`}>
                    <div className="result-label">{"您的离婚准备评估结果"}</div>
                    <h1>{resultData.level.label}</h1>
                    <p>{resultData.level.subtitle}</p>

                    <div className="result-metrics">
                        <div className="metric-card">
                            <span>{"总分"}</span>
                            <strong>{resultData.totalScore}</strong>
                        </div>
                        <div className="metric-card">
                            <span>{"动态满分"}</span>
                            <strong>{resultData.dynamicFullScore}</strong>
                        </div>
                        <div className="metric-card">
                            <span>{"得分率"}</span>
                            <strong>{formatRate(resultData.scoreRate)}</strong>
                        </div>
                    </div>
                </div>

                <div className="result-side-card">
                    <h2>{"这意味着什么"}</h2>
                    <p>{resultData.level.summary}</p>
                </div>

                <div className="result-main-card">
                    <div className="radar-section">
                        <h2>{"维度雷达图"}</h2>
                        <DimensionRadarChart dimensions={resultData.radarDimensions} />
                    </div>

                    <h2>{"您当前最需要优先处理的环节"}</h2>
                    <div className="weakness-list">
                        {resultData.weaknesses.map((item) => (
                            <div key={item.code} className="weakness-item">
                                <div className="weakness-head">
                                    <strong>{item.name}</strong>
                                    <span>{"均分 "}{item.avg.toFixed(1)}</span>
                                </div>
                                <p>{item.hint}</p>
                                <p className="emphasis">{item.action}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="result-side-card">
                    <h2>{"下一步建议与沟通安排"}</h2>
                    <p>{resultData.level.action}</p>

                    <div className="result-export-actions">
                        <button
                            className="secondary-btn"
                            onClick={handleExportSimpleResultImage}
                            disabled={isExporting}
                        >
                            {isExporting ? "导出中..." : "导出结果"}
                        </button>
                        {exportFeedback.type && (
                            <p
                                className={`submit-feedback ${
                                    exportFeedback.type === "success"
                                        ? "submit-feedback-success"
                                        : "submit-feedback-error"
                                }`}
                            >
                                {exportFeedback.message}
                            </p>
                        )}
                    </div>

                    <p className="result-submit-tip">
                        {"这份测评可以帮助您初步识别当前问题。若希望结合结果继续沟通，留下联系方式后，便于后续进一步交流。"}
                    </p>
                    <div className="contact-form-wrap">
                        <div className="contact-form-grid">
                            <label className="contact-form-field">
                                <span>{"称呼（必填）"}</span>
                                <input
                                    type="text"
                                    value={contactForm.contact_name}
                                    onChange={(e) =>
                                        onContactFieldChange("contact_name", e.target.value)
                                    }
                                    disabled={isSubmitting || hasSubmitted}
                                />
                            </label>
                            <label className="contact-form-field">
                                <span>{"联系电话（必填）"}</span>
                                <input
                                    type="tel"
                                    value={contactForm.contact_phone}
                                    onChange={(e) =>
                                        onContactFieldChange("contact_phone", e.target.value)
                                    }
                                    disabled={isSubmitting || hasSubmitted}
                                />
                            </label>
                            <label className="contact-form-field">
                                <span>{"微信（选填）"}</span>
                                <input
                                    type="text"
                                    value={contactForm.contact_wechat}
                                    onChange={(e) =>
                                        onContactFieldChange("contact_wechat", e.target.value)
                                    }
                                    disabled={isSubmitting || hasSubmitted}
                                />
                            </label>
                        </div>
                        {contactFeedback?.type && (
                            <p className="submit-feedback submit-feedback-error">
                                {contactFeedback.message}
                            </p>
                        )}
                    </div>
                    <div className="intro-actions">
                        <button
                            className="primary-btn"
                            onClick={onSubmitResult}
                            disabled={isSubmitting || hasSubmitted}
                        >
                            {hasSubmitted
                                ? "已提交"
                                : isSubmitting
                                ? "提交中..."
                                : "保存结果并提交信息"}
                        </button>

                        <button className="secondary-btn" onClick={onRestart}>
                            {"重新测评"}
                        </button>
                    </div>
                    {submitFeedback?.type && (
                        <p
                            className={`submit-feedback ${
                                submitFeedback.type === "success"
                                    ? "submit-feedback-success"
                                    : "submit-feedback-error"
                            }`}
                        >
                            {resolvedSubmitFeedbackMessage}
                        </p>
                    )}
                </div>

                <div className="export-hidden-wrap" aria-hidden="true">
                    <div ref={exportCardRef} className="export-capture-target">
                        <SimpleResultExportCard resultData={resultData} />
                    </div>
                </div>
            </section>
        </main>
    );
}
