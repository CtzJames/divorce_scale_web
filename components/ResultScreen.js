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
                    <h2>{"\u4e0b\u4e00\u6b65\u66f4\u9002\u5408\u600e\u4e48\u505a"}</h2>
                    <p>{resultData.level.action}</p>
                    <p className="result-submit-tip">
                        {"\u63d0\u4ea4\u540e\u53ef\u4fdd\u5b58\u672c\u6b21\u6d4b\u8bc4\u7ed3\u679c\uff0c\u4fbf\u4e8e\u540e\u7eed\u67e5\u770b\u4e0e\u54a8\u8be2\u6c9f\u901a\u3002"}
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
                                : "\u63d0\u4ea4\u5e76\u4fdd\u5b58\u7ed3\u679c"}
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
                            {submitFeedback.message}
                        </p>
                    )}
                </div>
            </section>
        </main>
    );
}
