export default function IntroScreen({ onStart }) {
  return (
    <main className="page-shell">
      <section className="hero-card">
        <div className="hero-tag">离婚力量表网页端</div>
        <h1>离婚之前，先测一测你是否真的准备好了。</h1>
        <p>
          从心理承受、经济准备、法律认知、子女安排到跨境风险，系统评估您当前的离婚准备状态。测评结果可用于自我梳理，也可作为后续律师咨询的前置信息。
        </p>

        <div className="intro-actions">
          <button className="primary-btn" onClick={onStart}>
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