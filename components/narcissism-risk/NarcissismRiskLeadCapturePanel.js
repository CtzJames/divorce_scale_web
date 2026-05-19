import styles from "./narcissismRisk.module.css";

function getPrimaryButtonText({ isOpen, submitStatus }) {
  if (submitStatus === "success") return "已提交";
  if (submitStatus === "submitting") return "正在提交...";
  if (isOpen) return "保存结果并提交信息";
  return "获取风险梳理";
}

export default function NarcissismRiskLeadCapturePanel({
  isOpen,
  contactForm,
  contactFeedback,
  submitStatus,
  submitFeedback,
  onOpen,
  onSubmit,
  onRestart,
  onContactFieldChange,
}) {
  const isSubmitting = submitStatus === "submitting";
  const hasSubmitted = submitStatus === "success";
  const showForm = isOpen || hasSubmitted;

  const handlePrimaryAction = () => {
    if (!showForm && !hasSubmitted) {
      onOpen();
      return;
    }

    onSubmit();
  };

  return (
    <section className={styles.leadPanel}>
      <div className={styles.leadHeader}>
        <div>
          <h2>获取风险梳理</h2>
          <p>
            如果您正在经历长期否定、操控、威胁、骚扰，或已经进入分居、离婚协商、财产分割、子女安排等阶段，可以留下联系方式。后续可结合您的测评结果和具体情况，进一步梳理风险、证据与行动顺序。
          </p>
        </div>
      </div>

      {showForm && (
        <div className={styles.leadFormBlock}>
          <p className={styles.leadFormIntro}>
            请填写您的信息以保存本次测评结果。后续可结合您的具体情况，进一步获取风险梳理与咨询指引。
          </p>
          <div className={styles.leadFormGrid}>
            <label className={styles.leadFormField}>
              <span>称呼 / 姓名（必填）</span>
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
          {contactFeedback?.type === "error" && (
            <p className={`${styles.formFeedback} ${styles.formFeedbackError}`}>
              {contactFeedback.message}
            </p>
          )}
        </div>
      )}

      <div className={styles.leadActions}>
        <button
          type="button"
          className={styles.primaryButton}
          onClick={handlePrimaryAction}
          disabled={isSubmitting || hasSubmitted}
        >
          {getPrimaryButtonText({ isOpen: showForm, submitStatus })}
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
