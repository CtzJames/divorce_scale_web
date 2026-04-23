import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { formatRate } from "../lib/scoring.js";
import { WECOM_ASSISTANT_QR_PATH } from "../data/resultPageConfig.js";
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
    const [isContactFormOpen, setIsContactFormOpen] = useState(false);

    const handlePrimaryAction = () => {
        if (!isContactFormOpen && !hasSubmitted) {
            setIsContactFormOpen(true);
            return;
        }

        onSubmitResult();
    };

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

                <div className="result-main-card">
                    <div className="radar-section">
                        <h2>{"维度雷达图"}</h2>
                        <DimensionRadarChart dimensions={resultData.radarDimensions} />
                    </div>

                    <div className="result-export-actions">
                        <button
                            className="secondary-btn"
                            onClick={handleExportSimpleResultImage}
                            disabled={isExporting}
                        >
                            {isExporting ? "导出中..." : "下载简要测评报告"}
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
                </div>

                <div className="result-side-card">
                    <h2>{"提升离婚力"}</h2>
                    <div className="locked-advice-card">
                        <p className="locked-advice-text">
                            {resultData.personalizedAdviceText}
                        </p>
                    </div>

                    {(isContactFormOpen || hasSubmitted) && (
                        <>
                            <p className="result-submit-tip">
                                {
                                    "请填写您的信息以保存您的测评结果。后续可添加小助理微信，免费获取深度测评报告，解锁更多建议与行动指南。"
                                }
                            </p>
                            <div className="contact-form-wrap">
                                <div className="contact-form-grid">
                                    <label className="contact-form-field">
                                        <span>{"称呼（必填）"}</span>
                                        <input
                                            type="text"
                                            value={contactForm.contact_name}
                                            onChange={(e) =>
                                                onContactFieldChange(
                                                    "contact_name",
                                                    e.target.value
                                                )
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
                                                onContactFieldChange(
                                                    "contact_phone",
                                                    e.target.value
                                                )
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
                                                onContactFieldChange(
                                                    "contact_wechat",
                                                    e.target.value
                                                )
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
                        </>
                    )}
                    <div className="intro-actions">
                        <button
                            className="primary-btn"
                            onClick={handlePrimaryAction}
                            disabled={isSubmitting || hasSubmitted}
                        >
                            {hasSubmitted
                                ? "已提交"
                                : isSubmitting
                                ? "提交中..."
                                : isContactFormOpen
                                ? "保存结果并提交信息"
                                : "获取深度测评报告"}
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
                            {submitFeedback.type === "success"
                                ? "您的测评结果已成功提交，请添加小助理微信获取深度测评报告。"
                                : submitFeedback.message}
                        </p>
                    )}
                    {hasSubmitted && (
                        <div className="wecom-qr-panel">
                            <h3>{"添加小助理微信"}</h3>
                            <img
                                src={WECOM_ASSISTANT_QR_PATH}
                                alt="律所工作人员企业微信二维码"
                            />
                        </div>
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
