import {
  ASSET_TIER_LEVEL_OPTIONS,
  FOLLOW_UP_STATUS_OPTIONS,
  REPORT_VISIBILITY_OPTIONS,
  SERVICE_TYPE_OPTIONS,
} from "./constants";
import { getSupabaseServerClient } from "./supabaseServer";

const LEAD_DETAIL_COLUMNS = [
  "id",
  "created_at",
  "contact_name",
  "contact_phone",
  "contact_wechat",
  "submission_source",
  "total_score",
  "dynamic_full_score",
  "score_rate",
  "result_level",
  "result_label",
  "child_gate_answer",
  "cross_border_gate_answer",
  "weaknesses",
  "dimension_scores",
  "answers",
  "follow_up_status",
  "admin_note",
  "service_type",
  "assigned_to",
  "appointment_owner",
  "appointment_time",
  "client_age",
  "client_gender",
  "client_location",
  "asset_tier_level",
  "marital_dispute_summary",
  "last_follow_up_at",
  "updated_by",
  "updated_at",
  "report_visibility",
  "report_version",
  "report_generated_at",
].join(",");

const VALID_FOLLOW_UP_STATUS = new Set(
  FOLLOW_UP_STATUS_OPTIONS.filter((item) => item.value !== "all").map(
    (item) => item.value
  )
);

const VALID_SERVICE_TYPES = new Set(
  SERVICE_TYPE_OPTIONS.filter((item) => item.value !== "all").map(
    (item) => item.value
  )
);

const VALID_REPORT_VISIBILITY = new Set(
  REPORT_VISIBILITY_OPTIONS.map((item) => item.value)
);

const VALID_CLIENT_GENDER = new Set(["male", "female"]);

const VALID_ASSET_TIER_LEVEL = new Set(
  ASSET_TIER_LEVEL_OPTIONS.map((item) => item.value)
);

function cleanText(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function normalizeServiceTypes(values) {
  const selected = values
    .map((value) => value.trim())
    .filter((value) => VALID_SERVICE_TYPES.has(value));

  if (selected.length === 0 || selected.includes("none")) {
    return ["none"];
  }

  return Array.from(new Set(selected));
}

function normalizeTimestamp(value) {
  const text = cleanText(value);
  if (!text) return null;

  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function normalizeNonNegativeInteger(value) {
  const text = cleanText(value);
  if (!text || !/^\d+$/.test(text)) return null;

  const number = Number(text);
  if (!Number.isSafeInteger(number) || number < 0) return null;
  return number;
}

function normalizeClientGender(value) {
  const text = cleanText(value);
  if (!text) return null;
  return VALID_CLIENT_GENDER.has(text) ? text : null;
}

function normalizeAssetTierLevel(value) {
  const text = cleanText(value);
  if (!text) return null;
  return VALID_ASSET_TIER_LEVEL.has(text) ? text : null;
}

export async function getLeadDetail(id) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("assessment_results")
    .select(LEAD_DETAIL_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  return {
    row: data,
    error,
  };
}

export async function updateLeadDetail(id, formData, operatorName) {
  const followUpStatus = cleanText(formData.get("follow_up_status")) ?? "new";
  const reportVisibility =
    cleanText(formData.get("report_visibility")) ?? "internal_only";
  const now = new Date().toISOString();

  const payload = {
    follow_up_status: VALID_FOLLOW_UP_STATUS.has(followUpStatus)
      ? followUpStatus
      : "new",
    service_type: normalizeServiceTypes(formData.getAll("service_type")),
    assigned_to: cleanText(formData.get("assigned_to")),
    appointment_owner: cleanText(formData.get("appointment_owner")),
    appointment_time: normalizeTimestamp(formData.get("appointment_time")),
    client_age: normalizeNonNegativeInteger(formData.get("client_age")),
    client_gender: normalizeClientGender(formData.get("client_gender")),
    client_location: cleanText(formData.get("client_location")),
    asset_tier_level: normalizeAssetTierLevel(
      formData.get("asset_tier_level")
    ),
    marital_dispute_summary: cleanText(
      formData.get("marital_dispute_summary")
    ),
    admin_note: cleanText(formData.get("admin_note")),
    report_visibility: VALID_REPORT_VISIBILITY.has(reportVisibility)
      ? reportVisibility
      : "internal_only",
    report_version: cleanText(formData.get("report_version")),
    last_follow_up_at: now,
    updated_at: now,
    updated_by: cleanText(operatorName) ?? "admin_mvp",
  };

  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from("assessment_results")
    .update(payload)
    .eq("id", id);

  return { error };
}
