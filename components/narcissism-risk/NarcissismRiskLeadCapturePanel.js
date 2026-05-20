import styles from "./narcissismRisk.module.css";

function getPrimaryButtonText(submitStatus) {
  if (submitStatus === "success") return "已提交";
  if (submitStatus === "submitting") return "提交中...";
  return "保存结果并提交信息";
}

export default function NarcissismRiskLeadCapturePanel({
  serviceIntent,
  serviceIntentOptions,
  contactForm,
  contactFeedback,
  submitStatus,
  submitFeedback,
  onServiceIntentChange,
  onSubmit,
  onRestart,
  onContactFieldChange,
}) {
  const isSubmitting = submitStatus === "submitting";
  const hasSubmitted = submitStatus === "success";
  const canSubmit = Boolean(
    contactForm.contact_name.trim() && contactForm.contact_phone.trim()
  );

  return (
    <section className={styles.leadPanel}>
      <div className={styles.leadHeader}>
        <div>
          <h2>获取后续支持</h2>
          <p>
            如果您正在经历来自伴侣的长期否定、操控、威胁、骚扰，或已经进入分居、离婚协商、财产分割、子女安排等阶段，希望获取深度测评报告或专业人士支持，可以留下您的联系方式，并选择您希望获得的后续服务类型。我们将根据您的测评结果与选择，为您提供相应的后续服务。
          </p>
        </div>
      </div>

      <div className={styles.leadFormBlock}>
        <div className={styles.leadFormGrid}>
          <label className={styles.leadFormField}>
            <span>您希望获得的帮助</span>
            <select
              value={serviceIntent}
              onChange={(event) => onServiceIntentChange(event.target.value)}
              disabled={isSubmitting || hasSubmitted}
            >
              {serviceIntentOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.leadFormField}>
            <span>称呼（必填）</span>
            <input
              type="text"
              value={contactForm.contact_name}
              onChange={(event) =>
                onContactFieldChange("contact_name", event.target.value)
              }
              placeholder="请输入您的称呼"
              disabled={isSubmitting || hasSubmitted}
            />
          </label>
          <label className={styles.leadFormField}>
            <span>联系电话（必填）</span>
            <input
              type="tel"
              value={contactForm.contact_phone}
              onChange={(event) =>
                onContactFieldChange("contact_phone", event.target.value)
              }
              placeholder="请输入便于联系的手机号"
              disabled={isSubmitting || hasSubmitted}
            />
          </label>
          <label className={styles.leadFormField}>
            <span>微信号（选填）</span>
            <input
              type="text"
              value={contactForm.contact_wechat}
              onChange={(event) =>
                onContactFieldChange("contact_wechat", event.target.value)
              }
              placeholder="可填写微信号，便于后续联系"
              disabled={isSubmitting || hasSubmitted}
            />
          </label>
        </div>
        {!hasSubmitted && !isSubmitting && !canSubmit && (
          <p className={styles.formHint}>请填写称呼和联系电话后提交。</p>
        )}
        {contactFeedback?.type === "error" && (
          <p className={`${styles.formFeedback} ${styles.formFeedbackError}`}>
            {contactFeedback.message}
          </p>
        )}
      </div>

      <div className={styles.leadActions}>
        <button
          type="button"
          className={styles.primaryButton}
          onClick={onSubmit}
          disabled={isSubmitting || hasSubmitted || !canSubmit}
        >
          {getPrimaryButtonText(submitStatus)}
        </button>
        <button type="button" className={styles.secondaryButton} onClick={onRestart}>
          重新测评
        </button>
      </div>

      {submitFeedback?.type && (
        <p
          className={`${styles.formFeedback} ${
            submitFeedback.type === "success"
              ? styles.formFeedbackSuccess
              : styles.formFeedbackError
          }`}
        >
          {submitFeedback.message}
        </p>
      )}

    </section>
  );
}
