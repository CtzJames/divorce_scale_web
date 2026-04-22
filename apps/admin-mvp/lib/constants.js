export const FOLLOW_UP_STATUS_OPTIONS = [
  { value: "all", label: "全部跟进状态" },
  { value: "new", label: "新提交" },
  { value: "to_follow", label: "待联系" },
  { value: "contacted", label: "已联系" },
  { value: "consulting", label: "咨询中" },
  { value: "converted", label: "已转化" },
  { value: "invalid", label: "无效线索" },
];

export const SERVICE_TYPE_OPTIONS = [
  { value: "all", label: "全部服务类型" },
  { value: "none", label: "未明确" },
  { value: "single_consultation", label: "单次咨询" },
  { value: "divorce_escorting", label: "离婚陪跑" },
  { value: "long_term_consultation", label: "长期咨询" },
  { value: "screening_service", label: "甄选服务" },
  { value: "litigation_representation", label: "诉讼代理" },
  { value: "agreement_support", label: "协议离婚协助" },
  { value: "cross_border_support", label: "跨境专项支持" },
  { value: "other", label: "其他" },
];

export const REPORT_VISIBILITY_OPTIONS = [
  { value: "hidden", label: "隐藏" },
  { value: "internal_only", label: "仅内部可见" },
  { value: "user_visible", label: "已开放给用户" },
];

export const ASSET_TIER_LEVEL_OPTIONS = [
  { value: "A5", label: "A5" },
  { value: "A5.5", label: "A5.5" },
  { value: "A6", label: "A6" },
  { value: "A6.5", label: "A6.5" },
  { value: "A7", label: "A7" },
  { value: "A7.5", label: "A7.5" },
  { value: "A8", label: "A8" },
  { value: "A8.5", label: "A8.5" },
  { value: "A9", label: "A9" },
  { value: "A9.5", label: "A9.5" },
  { value: "A10", label: "A10" },
  { value: "A10.5", label: "A10.5" },
  { value: "A11", label: "A11" },
];

export const RESULT_LEVEL_FILTER_OPTIONS = [
  { value: "all", label: "全部结果等级" },
  { value: "high", label: "准备充分" },
  { value: "medium", label: "准备一般" },
  { value: "low", label: "准备不足" },
];

export const RESULT_LEVEL_ALIASES = {
  high: "high",
  medium: "medium",
  mid: "medium",
  low: "low",
};

export const RESULT_LEVEL_QUERY_VALUES = {
  high: ["high"],
  medium: ["medium", "mid"],
  low: ["low"],
};

const followUpLabelMap = FOLLOW_UP_STATUS_OPTIONS.reduce((acc, item) => {
  if (item.value !== "all") acc[item.value] = item.label;
  return acc;
}, {});

const serviceTypeLabelMap = SERVICE_TYPE_OPTIONS.reduce((acc, item) => {
  if (item.value !== "all") acc[item.value] = item.label;
  return acc;
}, {});

const reportVisibilityLabelMap = REPORT_VISIBILITY_OPTIONS.reduce(
  (acc, item) => {
    acc[item.value] = item.label;
    return acc;
  },
  {}
);

const resultLevelLabelMap = RESULT_LEVEL_FILTER_OPTIONS.reduce((acc, item) => {
  if (item.value !== "all") acc[item.value] = item.label;
  return acc;
}, {});

export function getFollowUpStatusLabel(value) {
  if (!value) return "-";
  return followUpLabelMap[value] ?? value;
}

export function getServiceTypeLabel(value) {
  if (!value) return "-";
  return serviceTypeLabelMap[value] ?? value;
}

export function getReportVisibilityLabel(value) {
  if (!value) return "仅内部可见";
  return reportVisibilityLabelMap[value] ?? value;
}

export function normalizeResultLevel(value) {
  if (!value) return "";
  return RESULT_LEVEL_ALIASES[value] ?? value;
}

export function getResultLevelLabel(value) {
  const normalized = normalizeResultLevel(value);
  if (!normalized) return "-";
  return resultLevelLabelMap[normalized] ?? normalized;
}
