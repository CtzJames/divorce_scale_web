import { RESULT_LEVEL_QUERY_VALUES } from "./constants";
import { getSupabaseServerClient } from "./supabaseServer";

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

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

export async function queryLeads(filters) {
  const supabase = getSupabaseServerClient();
  let query = supabase
    .from("assessment_results")
    .select(LEAD_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(200);

  if (hasText(filters.followUpStatus) && filters.followUpStatus !== "all") {
    query = query.eq("follow_up_status", filters.followUpStatus.trim());
  }

  if (hasText(filters.resultLevel) && filters.resultLevel !== "all") {
    const values = RESULT_LEVEL_QUERY_VALUES[filters.resultLevel] ?? [
      filters.resultLevel,
    ];
    query = query.in("result_level", values);
  }

  if (hasText(filters.assignedTo)) {
    query = query.ilike("assigned_to", `%${filters.assignedTo.trim()}%`);
  }

  if (hasText(filters.serviceType) && filters.serviceType !== "all") {
    query = query.contains("service_type", [filters.serviceType.trim()]);
  }

  if (hasText(filters.name)) {
    query = query.ilike("contact_name", `%${filters.name.trim()}%`);
  }

  if (hasText(filters.phone)) {
    query = query.ilike("contact_phone", `%${filters.phone.trim()}%`);
  }

  const { data, error } = await query;
  return {
    rows: data ?? [],
    error,
  };
}
