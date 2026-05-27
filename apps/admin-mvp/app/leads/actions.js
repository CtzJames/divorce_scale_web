"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, isAuthorizedSessionValue } from "../../lib/auth";
import { getSupabaseServerClient } from "../../lib/supabaseServer";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_BULK_DELETE_COUNT = 100;

function normalizeLeadIds(ids) {
  if (!Array.isArray(ids)) {
    return { ids: [], error: "删除参数格式不正确。" };
  }

  const uniqueIds = Array.from(
    new Set(
      ids
        .map((id) => (typeof id === "string" ? id.trim() : ""))
        .filter(Boolean)
    )
  );

  if (uniqueIds.length === 0) {
    return { ids: [], error: "请先勾选需要删除的记录。" };
  }

  if (uniqueIds.length > MAX_BULK_DELETE_COUNT) {
    return { ids: [], error: "单次删除记录数量过多，请缩小选择范围后重试。" };
  }

  const hasInvalidId = uniqueIds.some((id) => !UUID_PATTERN.test(id));
  if (hasInvalidId) {
    return { ids: [], error: "存在不合法的记录 ID，已取消删除。" };
  }

  return { ids: uniqueIds, error: "" };
}

export async function deleteLeadsAction(ids) {
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!isAuthorizedSessionValue(sessionValue)) {
    return { ok: false, error: "登录状态已失效，请重新登录后再操作。" };
  }

  const { ids: normalizedIds, error: validationError } = normalizeLeadIds(ids);
  if (validationError) {
    return { ok: false, error: validationError };
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("assessment_results")
    .delete()
    .in("id", normalizedIds)
    .select("id");

  if (error) {
    return {
      ok: false,
      error: error.message || "删除失败，请稍后重试。",
    };
  }

  revalidatePath("/leads");

  return {
    ok: true,
    deletedCount: data?.length ?? normalizedIds.length,
  };
}
