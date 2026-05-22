export const NARCISSISM_RISK_ASSESSMENT_TYPE = "spousal_narcissism_risk";
export const DIVORCE_SCALE_ASSESSMENT_TYPE = "divorce_readiness";
export const LEGACY_DIVORCE_SCALE_ASSESSMENT_TYPE = "divorce_scale";
export const UNKNOWN_ASSESSMENT_TYPE = "unknown";

export const ASSESSMENT_TYPE_FILTER_VALUES = {
  all: "all",
  divorce: DIVORCE_SCALE_ASSESSMENT_TYPE,
  narcissism: NARCISSISM_RISK_ASSESSMENT_TYPE,
};

export const ASSESSMENT_TYPE_FILTER_OPTIONS = [
  { value: ASSESSMENT_TYPE_FILTER_VALUES.all, label: "全部量表" },
  { value: ASSESSMENT_TYPE_FILTER_VALUES.divorce, label: "离婚力量表" },
  {
    value: ASSESSMENT_TYPE_FILTER_VALUES.narcissism,
    label: "配偶高自恋风险量表",
  },
];

export const SERVICE_INTENT_FILTER_VALUES = {
  all: "all",
  legal: "legal_support",
  psychological: "psychological_support",
  deepReport: "deep_report",
  professional: "professional_support",
  none: "none",
};

export const SERVICE_INTENT_FILTER_OPTIONS = [
  { value: SERVICE_INTENT_FILTER_VALUES.all, label: "全部意向" },
  { value: SERVICE_INTENT_FILTER_VALUES.legal, label: "需要法律支持" },
  { value: SERVICE_INTENT_FILTER_VALUES.psychological, label: "需要心理支持" },
  { value: SERVICE_INTENT_FILTER_VALUES.deepReport, label: "仅需深度报告" },
  {
    value: SERVICE_INTENT_FILTER_VALUES.professional,
    label: "需要专业支持（旧）",
  },
  { value: SERVICE_INTENT_FILTER_VALUES.none, label: "未选择" },
];

const ASSESSMENT_TYPE_LABELS = {
  [DIVORCE_SCALE_ASSESSMENT_TYPE]: "离婚力量表",
  [NARCISSISM_RISK_ASSESSMENT_TYPE]: "配偶高自恋风险量表",
  [UNKNOWN_ASSESSMENT_TYPE]: "未知量表",
};

const ASSESSMENT_TYPE_SHORT_LABELS = {
  [DIVORCE_SCALE_ASSESSMENT_TYPE]: "离婚力",
  [NARCISSISM_RISK_ASSESSMENT_TYPE]: "自恋风险",
  [UNKNOWN_ASSESSMENT_TYPE]: "未知量表",
};

const SERVICE_INTENT_LABELS = {
  legal_support: "需要法律支持",
  psychological_support: "需要心理支持",
  deep_report: "仅需深度报告",
  professional_support: "需要专业支持（旧）",
  none: "未选择",
};

const NARCISSISM_RESULT_LEVEL_LABELS = {
  low: "低风险",
  mild: "轻度风险",
  moderate: "中度风险",
  high: "高风险",
};

const NARCISSISM_DIMENSION_LABELS = {
  N1: "自我中心与关系特权",
  N2: "人设包装与反应升级",
  N3: "情感忽视与责任推脱",
  N4: "控制施压与关系操控",
  N5: "冲突升级与安全风险",
};

function isBlank(value) {
  return value === null || value === undefined || String(value).trim() === "";
}

function getRecordPayload(record) {
  const payload = record?.result_payload;
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return {};
  }
  return payload;
}

function toNumberOrNull(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function normalizeArrayValue(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [value];
}

function getNarcissismHighRiskItems(record) {
  const payload = getRecordPayload(record);
  const triggerItems =
    payload.high_risk_triggers ?? payload.high_risk_items ?? [];
  return normalizeArrayValue(triggerItems);
}

function formatHighRiskItem(item) {
  if (!item) return "";

  if (typeof item === "object" && !Array.isArray(item)) {
    const rawQuestionNo =
      item.question_no ?? item.questionNo ?? item.question_number;
    const questionNo = rawQuestionNo ? String(rawQuestionNo).trim() : "";
    const id = item.question_id ?? item.id ?? "";
    const label = questionNo || formatHighRiskItem(id);
    const text = item.question_text ?? item.text ?? "";

    if (!text) return label;
    const shortText = String(text).trim().slice(0, 40);
    return label ? `${label}：${shortText}` : shortText;
  }

  const text = String(item).trim();
  const questionNo = text.match(/Q0*(\d+)/i)?.[1];
  return questionNo ? String(Number(questionNo)) : text;
}

function getDimensionScores(record) {
  const payload = getRecordPayload(record);
  const directScores =
    record?.dimension_scores && typeof record.dimension_scores === "object"
      ? record.dimension_scores
      : payload.dimension_scores;

  if (directScores && typeof directScores === "object" && !Array.isArray(directScores)) {
    return directScores;
  }

  const details = payload.dimension_details;
  if (!details || typeof details !== "object" || Array.isArray(details)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(details)
      .map(([code, detail]) => [code, toNumberOrNull(detail?.score)])
      .filter(([, score]) => score !== null)
  );
}

export function getAssessmentTypeKey(record) {
  const value =
    typeof record === "string" || record === null || record === undefined
      ? record
      : record.assessment_type;

  if (value === NARCISSISM_RISK_ASSESSMENT_TYPE) {
    return NARCISSISM_RISK_ASSESSMENT_TYPE;
  }

  if (
    value === DIVORCE_SCALE_ASSESSMENT_TYPE ||
    value === LEGACY_DIVORCE_SCALE_ASSESSMENT_TYPE
  ) {
    return DIVORCE_SCALE_ASSESSMENT_TYPE;
  }

  if (isBlank(value)) {
    return DIVORCE_SCALE_ASSESSMENT_TYPE;
  }

  return UNKNOWN_ASSESSMENT_TYPE;
}

export function isNarcissismRiskRecord(record) {
  return getAssessmentTypeKey(record) === NARCISSISM_RISK_ASSESSMENT_TYPE;
}

export function getAssessmentTypeLabel(record) {
  return ASSESSMENT_TYPE_LABELS[getAssessmentTypeKey(record)];
}

export function getAssessmentTypeShortLabel(record) {
  return ASSESSMENT_TYPE_SHORT_LABELS[getAssessmentTypeKey(record)];
}

export function getServiceIntentLabel(value) {
  if (isBlank(value)) return "未选择";
  return SERVICE_INTENT_LABELS[String(value).trim()] ?? "未知意向";
}

export function getLeadServiceIntentValue(record) {
  if (!isBlank(record?.service_intent)) {
    return String(record.service_intent).trim();
  }

  const payload = getRecordPayload(record);
  if (!isBlank(payload.service_intent)) {
    return String(payload.service_intent).trim();
  }

  return "";
}

export function getLeadServiceIntentLabel(record) {
  return getServiceIntentLabel(getLeadServiceIntentValue(record));
}

export function getNarcissismResultLevelLabel(value) {
  if (isBlank(value)) return "-";
  return NARCISSISM_RESULT_LEVEL_LABELS[String(value).trim()] ?? String(value);
}

export function getNarcissismAverageScore(record) {
  if (!isNarcissismRiskRecord(record)) return null;

  const payload = getRecordPayload(record);
  const payloadAverage = toNumberOrNull(payload.average_score);
  if (payloadAverage !== null) return payloadAverage;

  const totalScore = toNumberOrNull(record?.total_score);
  const validAnswerCount = toNumberOrNull(payload.valid_answer_count);
  if (totalScore !== null && validAnswerCount && validAnswerCount > 0) {
    return totalScore / validAnswerCount;
  }

  const dynamicFullScore = toNumberOrNull(record?.dynamic_full_score);
  if (totalScore !== null && dynamicFullScore && dynamicFullScore > 0) {
    return totalScore / (dynamicFullScore / 5);
  }

  return null;
}

export function formatNarcissismAverageScore(record, emptyValue = "-") {
  const score = getNarcissismAverageScore(record);
  if (score === null) return emptyValue;
  return `${score.toFixed(2)} / 5`;
}

export function getNarcissismValidAnswerCount(record) {
  if (!isNarcissismRiskRecord(record)) return null;
  return toNumberOrNull(getRecordPayload(record).valid_answer_count);
}

export function getNarcissismNaAnswerCount(record) {
  if (!isNarcissismRiskRecord(record)) return null;
  return toNumberOrNull(getRecordPayload(record).na_answer_count);
}

export function getNarcissismLowValidity(record) {
  if (!isNarcissismRiskRecord(record)) return null;
  const payload = getRecordPayload(record);
  if (typeof payload.low_validity === "boolean") return payload.low_validity;
  if (typeof payload.low_validity === "string") {
    return payload.low_validity.toLowerCase() === "true";
  }
  return null;
}

export function formatNarcissismLowValidity(record, emptyValue = "-") {
  const value = getNarcissismLowValidity(record);
  if (value === null) return emptyValue;
  return value ? "是" : "否";
}

export function getNarcissismHighRiskTriggered(record) {
  if (!isNarcissismRiskRecord(record)) return null;

  const highRiskItems = getNarcissismHighRiskItems(record);
  if (highRiskItems.length > 0) return true;

  const payload = getRecordPayload(record);
  if (typeof payload.high_risk_triggered === "boolean") {
    return payload.high_risk_triggered;
  }
  if (typeof payload.high_risk_triggered === "string") {
    return payload.high_risk_triggered.toLowerCase() === "true";
  }

  return false;
}

export function formatNarcissismHighRiskStatus(record, emptyValue = "-") {
  const value = getNarcissismHighRiskTriggered(record);
  if (value === null) return emptyValue;
  return value ? "已触发" : "未触发";
}

export function getNarcissismHighRiskTriggerSummary(record, emptyValue = "-") {
  if (!isNarcissismRiskRecord(record)) return emptyValue;

  const summary = getNarcissismHighRiskItems(record)
    .map(formatHighRiskItem)
    .filter(Boolean)
    .join(",");

  return summary || emptyValue;
}

export function getNarcissismDimensionSummary(record, emptyValue = "-") {
  if (!isNarcissismRiskRecord(record)) return emptyValue;

  const payload = getRecordPayload(record);
  const primaryDimensions = normalizeArrayValue(payload.primary_risk_dimensions)
    .map((item) => {
      const code =
        typeof item === "object" && item !== null
          ? item.code ?? item.dimension_code ?? item.dimension
          : item;
      return NARCISSISM_DIMENSION_LABELS[code] ?? code;
    })
    .filter(Boolean);

  if (primaryDimensions.length > 0) {
    return primaryDimensions.join("、");
  }

  const scoredDimensions = Object.entries(getDimensionScores(record))
    .map(([code, score]) => ({
      code,
      score: toNumberOrNull(score),
    }))
    .filter((item) => item.score !== null)
    .sort((left, right) => right.score - left.score)
    .slice(0, 2)
    .map((item) => NARCISSISM_DIMENSION_LABELS[item.code] ?? item.code);

  return scoredDimensions.length > 0
    ? scoredDimensions.join("、")
    : emptyValue;
}
