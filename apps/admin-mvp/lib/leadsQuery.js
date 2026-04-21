import {
  RESULT_LEVEL_ALIASES,
  RESULT_LEVEL_QUERY_VALUES,
} from "./constants";
import { getSupabaseServerClient } from "./supabaseServer";

export const LEADS_PAGE_SIZE = 20;
export const LEADS_EXPORT_LIMIT = 1000;

const LEAD_COLUMNS = [
  "id",
  "created_at",
  "contact_name",
  "contact_phone",
  "contact_wechat",
  "result_level",
  "result_label",
  "score_rate",
  "child_gate_answer",
  "cross_border_gate_answer",
  "follow_up_status",
  "service_type",
  "assigned_to",
  "updated_at",
].join(",");

const LEAD_EXPORT_COLUMNS = [
  "created_at",
  "contact_name",
  "contact_phone",
  "contact_wechat",
  "result_level",
  "result_label",
  "score_rate",
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

export function normalizeLeadFilters(raw = {}) {
  const filters = {
    name: getSafeFilter(raw.name),
    phone: getSafeFilter(raw.phone),
    followUpStatus: getSafeFilter(raw.followUpStatus, "all") || "all",
    resultLevel: getSafeFilter(raw.resultLevel, "all") || "all",
    assignedTo: getSafeFilter(raw.assignedTo),
    serviceType: getSafeFilter(raw.serviceType, "all") || "all",
    createdFrom: getSafeFilter(raw.createdFrom),
    createdTo: getSafeFilter(raw.createdTo),
  };

  if (filters.resultLevel in RESULT_LEVEL_ALIASES) {
    filters.resultLevel = RESULT_LEVEL_ALIASES[filters.resultLevel];
  }

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
    ["followUpStatus", filters.followUpStatus],
    ["resultLevel", filters.resultLevel],
    ["assignedTo", filters.assignedTo],
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

  if (hasText(filters.followUpStatus) && filters.followUpStatus !== "all") {
    nextQuery = nextQuery.eq("follow_up_status", filters.followUpStatus.trim());
  }

  if (hasText(filters.resultLevel) && filters.resultLevel !== "all") {
    const values = RESULT_LEVEL_QUERY_VALUES[filters.resultLevel] ?? [
      filters.resultLevel,
    ];
    nextQuery = nextQuery.in("result_level", values);
  }

  if (hasText(filters.assignedTo)) {
    nextQuery = nextQuery.ilike("assigned_to", `%${filters.assignedTo.trim()}%`);
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
