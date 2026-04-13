import { formatRate } from "../lib/scoring.js";

export default function ResultScreen({
    resultData,
    onRestart,
    onSubmitResult,
    isSubmitting,
    hasSubmitted,
}) {
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
                        <button className="primary-btn" onClick={onRestart}>
                            重新测评
                        </button>

                        <button
                            className="secondary-btn"
                            onClick={onSubmitResult}
                            disabled={isSubmitting || hasSubmitted}
                        >
                            {hasSubmitted ? "已提交" : isSubmitting ? "提交中..." : "提交测评结果"}
                        </button>
                    </div>
                </div>
            </section>
        </main>
    );
}