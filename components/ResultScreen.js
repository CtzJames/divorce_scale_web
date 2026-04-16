import { formatRate } from "../lib/scoring.js";
import DimensionRadarChart from "./DimensionRadarChart.js";

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
    const successFeedbackByLevel = {
        high: "已收到您的信息，测评结果已保存。后续可结合本次评估，进一步沟通正式推进前更值得优先确认的关键安排。",
        mid: "已收到您的信息，测评结果已保存。后续可结合本次评估，进一步沟通当前更值得优先补强的环节与推进顺序。",
        low: "已收到您的信息，测评结果已保存。后续可结合本次评估，进一步沟通当前需要优先梳理的风险点与准备方向。",
    };

    const resolvedSubmitFeedbackMessage =
        submitFeedback?.type === "success"
            ? successFeedbackByLevel[resultData.levelKey] ?? submitFeedback.message
            : submitFeedback?.message;

    return (
        <main className="page-shell">
            <section className="result-layout">
                <div className={`result-hero theme-${resultData.levelKey}`}>
                    <div className="result-label">{"\u60a8\u7684\u79bb\u5a5a\u51c6\u5907\u8bc4\u4f30\u7ed3\u679c"}</div>
                    <h1>{resultData.level.label}</h1>
                    <p>{resultData.level.subtitle}</p>

                    <div className="result-metrics">
                        <div className="metric-card">
                            <span>{"\u603b\u5206"}</span>
                            <strong>{resultData.totalScore}</strong>
                        </div>
                        <div className="metric-card">
                            <span>{"\u52a8\u6001\u6ee1\u5206"}</span>
                            <strong>{resultData.dynamicFullScore}</strong>
                        </div>
                        <div className="metric-card">
                            <span>{"\u5f97\u5206\u7387"}</span>
                            <strong>{formatRate(resultData.scoreRate)}</strong>
                        </div>
                    </div>
                </div>

                <div className="result-side-card">
                    <h2>{"\u8fd9\u610f\u5473\u7740\u4ec0\u4e48"}</h2>
                    <p>{resultData.level.summary}</p>
                </div>

                <div className="result-main-card">
                    <div className="radar-section">
                        <h2>{"\u7ef4\u5ea6\u96f7\u8fbe\u56fe"}</h2>
                        <DimensionRadarChart dimensions={resultData.radarDimensions} />
                    </div>

                    <h2>{"\u60a8\u5f53\u524d\u6700\u9700\u8981\u4f18\u5148\u5904\u7406\u7684\u73af\u8282"}</h2>
                    <div className="weakness-list">
                        {resultData.weaknesses.map((item) => (
                            <div key={item.code} className="weakness-item">
                                <div className="weakness-head">
                                    <strong>{item.name}</strong>
                                    <span>{"\u5747\u5206 "}{item.avg.toFixed(1)}</span>
                                </div>
                                <p>{item.hint}</p>
                                <p className="emphasis">{item.action}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="result-side-card">
                    <h2>{"\u4e0b\u4e00\u6b65\u5efa\u8bae\u4e0e\u6c9f\u901a\u5b89\u6392"}</h2>
                    <p>{resultData.level.action}</p>
                    <p className="result-submit-tip">
                        {"\u8fd9\u4efd\u6d4b\u8bc4\u53ef\u4ee5\u5e2e\u52a9\u60a8\u521d\u6b65\u8bc6\u522b\u5f53\u524d\u95ee\u9898\u3002\u82e5\u5e0c\u671b\u7ed3\u5408\u7ed3\u679c\u7ee7\u7eed\u6c9f\u901a\uff0c\u7559\u4e0b\u8054\u7cfb\u65b9\u5f0f\u540e\uff0c\u4fbf\u4e8e\u540e\u7eed\u8fdb\u4e00\u6b65\u4ea4\u6d41\u3002"}
                    </p>
                    <div className="contact-form-wrap">
                        <div className="contact-form-grid">
                            <label className="contact-form-field">
                                <span>{"\u79f0\u547c\uff08\u5fc5\u586b\uff09"}</span>
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
                                <span>{"\u8054\u7cfb\u7535\u8bdd\uff08\u5fc5\u586b\uff09"}</span>
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
                                <span>{"\u5fae\u4fe1\uff08\u9009\u586b\uff09"}</span>
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
                                ? "\u5df2\u63d0\u4ea4"
                                : isSubmitting
                                ? "\u63d0\u4ea4\u4e2d..."
                                : "\u4fdd\u5b58\u7ed3\u679c\u5e76\u63d0\u4ea4\u4fe1\u606f"}
                        </button>

                        <button className="secondary-btn" onClick={onRestart}>
                            {"\u91cd\u65b0\u6d4b\u8bc4"}
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
            </section>
        </main>
    );
}
