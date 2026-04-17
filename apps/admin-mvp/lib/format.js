import { getServiceTypeLabel } from "./constants";

export function formatDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("zh-CN", { hour12: false });
}

export function formatScoreRate(value) {
  if (value === null || value === undefined || value === "") return "-";
  const num = Number(value);
  if (!Number.isFinite(num)) return String(value);
  return `${num.toFixed(1)}%`;
}

export function formatGateAnswer(value) {
  if (value === true || value === "yes") return "是";
  if (value === false || value === "no") return "否";
  return "-";
}

export function formatServiceTypes(value) {
  if (!value) return "-";
  if (Array.isArray(value) && value.length === 0) return "-";
  if (Array.isArray(value)) {
    return value.map((item) => getServiceTypeLabel(item)).join("、");
  }
  return getServiceTypeLabel(value);
}
