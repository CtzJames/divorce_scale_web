import {
  ASSESSMENT_TYPE_FILTER_VALUES,
  DIVORCE_SCALE_ASSESSMENT_TYPE,
  LEGACY_DIVORCE_SCALE_ASSESSMENT_TYPE,
  NARCISSISM_RISK_ASSESSMENT_TYPE,
  SERVICE_INTENT_FILTER_VALUES,
  normalizeAssessmentTypeFilterValue,
  normalizeResultLevelFilterValue,
  resolveResultLevelFilter,
} from "./leadAssessment";
import { getSupabaseServerClient } from "./supabaseServer";

export const LEADS_PAGE_SIZE = 20;
export const LEADS_EXPORT_LIMIT = 1000;

const LEAD_COLUMNS = [
  "id",
  "assessment_type",
  "created_at",
  "contact_name",
  "contact_phone",
  "contact_wechat",
  "service_intent",
  "result_level",
  "result_label",
  "total_score",
  "dynamic_full_score",
  "score_rate",
  "dimension_scores",
  "result_payload",
  "child_gate_answer",
  "cross_border_gate_answer",
  "follow_up_status",
  "service_type",
  "assigned_to",
  "updated_at",
].join(",");

const LEAD_EXPORT_COLUMNS = [
  "assessment_type",
  "created_at",
  "contact_name",
  "contact_phone",
  "contact_wechat",
  "service_intent",
  "result_level",
  "result_label",
  "total_score",
  "dynamic_full_score",
  "score_rate",
  "dimension_scores",
  "result_payload",
  "child_gate_answer",
  "cross_border_gate_answer",
  "weaknesses",
  "follow_up_status",
  "service_type",
  "assigned_to",
  "appointment_owner",
  "appointment_time",
  "last_follow_up_at",
  "updated_at",
  "updated_by",
  "admin_note",
].join(",");

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function getSafeFilter(raw, fallback = "") {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (typeof value !== "string") return fallback;
  return value.trim();
}

function normalizeDateFilter(value) {
  if (!hasText(value)) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString();
}

function applyAssessmentTypeFilter(query, assessmentType) {
  const normalizedAssessmentType =
    normalizeAssessmentTypeFilterValue(assessmentType);

  if (normalizedAssessmentType === ASSESSMENT_TYPE_FILTER_VALUES.narcissism) {
    return query.eq("assessment_type", NARCISSISM_RISK_ASSESSMENT_TYPE);
  }

  if (normalizedAssessmentType === ASSESSMENT_TYPE_FILTER_VALUES.divorce) {
    return query.or(
      [
        "assessment_type.is.null",
        "assessment_type.eq.",
        `assessment_type.in.(${DIVORCE_SCALE_ASSESSMENT_TYPE},${LEGACY_DIVORCE_SCALE_ASSESSMENT_TYPE})`,
      ].join(",")
    );
  }

  return query;
}

export function normalizeLeadFilters(raw = {}) {
  const assessmentType = normalizeAssessmentTypeFilterValue(
    getSafeFilter(raw.assessmentType, "all") || "all"
  );

  const filters = {
    name: getSafeFilter(raw.name),
    phone: getSafeFilter(raw.phone),
    assessmentType,
    followUpStatus: getSafeFilter(raw.followUpStatus, "all") || "all",
    resultLevel: normalizeResultLevelFilterValue(
      getSafeFilter(raw.resultLevel, "all") || "all",
      assessmentType
    ),
    assignedTo: getSafeFilter(raw.assignedTo),
    serviceIntent: getSafeFilter(raw.serviceIntent, "all") || "all",
    serviceType: getSafeFilter(raw.serviceType, "all") || "all",
    createdFrom: getSafeFilter(raw.createdFrom),
    createdTo: getSafeFilter(raw.createdTo),
  };

  return filters;
}

export function normalizeLeadPage(rawPage) {
  const raw = Array.isArray(rawPage) ? rawPage[0] : rawPage;
  const page = Number.parseInt(raw ?? "1", 10);
  if (!Number.isFinite(page) || page < 1) return 1;
  return page;
}

export function buildLeadsSearchParams(filters, options = {}) {
  const { page, includePage = true } = options;
  const params = new URLSearchParams();

  const entries = [
    ["name", filters.name],
    ["phone", filters.phone],
    ["assessmentType", filters.assessmentType],
    ["followUpStatus", filters.followUpStatus],
    ["resultLevel", filters.resultLevel],
    ["assignedTo", filters.assignedTo],
    ["serviceIntent", filters.serviceIntent],
    ["serviceType", filters.serviceType],
    ["createdFrom", filters.createdFrom],
    ["createdTo", filters.createdTo],
  ];

  for (const [key, value] of entries) {
    if (!hasText(value)) continue;
    if (value === "all") continue;
    params.set(key, value);
  }

  if (includePage && page && page > 1) {
    params.set("page", String(page));
  }

  return params;
}

function applyLeadFilters(query, filters) {
  const supabase = getSupabaseServerClient();
  let nextQuery = query ?? supabase.from("assessment_results");
  const resultLevelFilter = resolveResultLevelFilter(
    filters.resultLevel,
    filters.assessmentType
  );

  if (resultLevelFilter) {
    nextQuery = applyAssessmentTypeFilter(
      nextQuery,
      resultLevelFilter.assessmentType
    ).in("result_level", resultLevelFilter.resultLevels);
  } else if (
    hasText(filters.assessmentType) &&
    filters.assessmentType !== ASSESSMENT_TYPE_FILTER_VALUES.all
  ) {
    nextQuery = applyAssessmentTypeFilter(nextQuery, filters.assessmentType);
  }

  if (hasText(filters.followUpStatus) && filters.followUpStatus !== "all") {
    nextQuery = nextQuery.eq("follow_up_status", filters.followUpStatus.trim());
  }

  if (hasText(filters.assignedTo)) {
    nextQuery = nextQuery.ilike("assigned_to", `%${filters.assignedTo.trim()}%`);
  }

  if (
    hasText(filters.serviceIntent) &&
    filters.serviceIntent !== SERVICE_INTENT_FILTER_VALUES.all
  ) {
    if (filters.serviceIntent === SERVICE_INTENT_FILTER_VALUES.none) {
      nextQuery = nextQuery.or("service_intent.is.null,service_intent.eq.");
    } else {
      nextQuery = nextQuery.eq("service_intent", filters.serviceIntent.trim());
    }
  }

  if (hasText(filters.serviceType) && filters.serviceType !== "all") {
    nextQuery = nextQuery.contains("service_type", [filters.serviceType.trim()]);
  }

  const createdFrom = normalizeDateFilter(filters.createdFrom);
  if (createdFrom) {
    nextQuery = nextQuery.gte("created_at", createdFrom);
  }

  const createdTo = normalizeDateFilter(filters.createdTo);
  if (createdTo) {
    nextQuery = nextQuery.lte("created_at", createdTo);
  }

  if (hasText(filters.name)) {
    nextQuery = nextQuery.ilike("contact_name", `%${filters.name.trim()}%`);
  }

  if (hasText(filters.phone)) {
    nextQuery = nextQuery.ilike("contact_phone", `%${filters.phone.trim()}%`);
  }

  return nextQuery;
}

export async function queryLeads(filters, options = {}) {
  const page = normalizeLeadPage(options.page);
  const pageSize = options.pageSize ?? LEADS_PAGE_SIZE;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const supabase = getSupabaseServerClient();
  let query = supabase
    .from("assessment_results")
    .select(LEAD_COLUMNS, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  query = applyLeadFilters(query, filters);

  const { data, error, count } = await query;
  return {
    rows: data ?? [],
    count: count ?? 0,
    page,
    pageSize,
    error,
  };
}

export async function queryLeadsForExport(filters) {
  const supabase = getSupabaseServerClient();
  let query = supabase
    .from("assessment_results")
    .select(LEAD_EXPORT_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(LEADS_EXPORT_LIMIT);

  query = applyLeadFilters(query, filters);

  const { data, error } = await query;
  return {
    rows: data ?? [],
    error,
  };
}
