"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type ActionResult = { error?: string; success?: string; id?: string };
export async function signIn(
  _prev: ActionResult,
  form: FormData,
): Promise<ActionResult> {
  const email = String(form.get("email") || "").trim();
  const password = String(form.get("password") || "");
  if (!email || !password) return { error: "Enter your email and password." };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "Invalid credentials. Please try again." };
  const { data: isAdmin, error: roleError } = await supabase.rpc("is_admin");
  if (roleError || !isAdmin) {
    await supabase.auth.signOut();
    return { error: "This account does not have admin access." };
  }
  return { success: "Signed in" };
}
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
function optionalUrl(value: string): string | null {
  if (!value.trim()) return null;
  try {
    const u = new URL(value);
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;
    return u.toString();
  } catch {
    return null;
  }
}
function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 90);
}
export async function saveEvent(
  _prev: ActionResult,
  form: FormData,
): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const id = String(form.get("id") || "").trim();
  const title = String(form.get("title") || "").trim();
  const date = String(form.get("event_date") || "").trim();
  const start = String(form.get("start_time") || "").trim();
  const end = String(form.get("end_time") || "").trim();
  const ticket = String(form.get("ticket_url") || "").trim();
  const image = String(form.get("image_url") || "").trim();
  const priceText = String(form.get("price_min") || "").trim();
  const slugInput = String(form.get("slug") || "").trim();
  const slug = slugify(slugInput || title);
  if (!title || !date || !slug)
    return { error: "Event title and date are required." };
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    Number.isNaN(new Date(`${date}T00:00:00Z`).getTime())
  )
    return { error: "Enter a valid date." };
  if ((ticket && !optionalUrl(ticket)) || (image && !optionalUrl(image)))
    return {
      error: "Image and ticket links must start with https:// or http://.",
    };
  if (
    priceText &&
    (!Number.isFinite(Number(priceText)) || Number(priceText) < 0)
  )
    return { error: "Enter a valid nonnegative price." };
  const category = String(form.get("category") || "Experiences");
  if (!["Music", "Nightlife", "Arts", "Food", "Experiences"].includes(category))
    return { error: "Invalid category." };
  const record = {
    title,
    slug,
    description: String(form.get("description") || "").trim() || null,
    category,
    venue: String(form.get("venue") || "").trim() || null,
    address: String(form.get("address") || "").trim() || null,
    city: String(form.get("city") || "Lagos").trim() || "Lagos",
    event_date: date,
    start_time: start || null,
    end_time: end || null,
    price_min: priceText === "" ? null : Number(priceText),
    currency: "NGN",
    image_url: optionalUrl(image),
    ticket_url: optionalUrl(ticket),
    organizer: String(form.get("organizer") || "").trim() || null,
    source: "admin",
    is_published: form.get("is_published") === "on",
  };
  const query = id
    ? supabase.from("events").update(record).eq("id", id)
    : supabase.from("events").insert(record);
  const { data, error } = await query.select("id").single();
  if (error)
    return {
      error:
        error.code === "23505"
          ? "That URL slug is already in use. Choose another."
          : error.message,
    };
  revalidatePath("/events");
  revalidatePath("/");
  return { success: "Event saved successfully", id: data.id };
}
export async function setPublished(
  id: string,
  published: boolean,
): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from("events")
    .update({ is_published: published })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/events");
  revalidatePath("/");
  return { success: published ? "Event published" : "Event moved to drafts" };
}

export async function deleteEvent(
  id: string
): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();

    const { data, error } = await supabase
      .from("events")
      .delete()
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("Delete event failed:", error);
      return { error: error.message };
    }

    if (!data) {
      return {
        error:
          "No event was deleted. Check admin permissions and database policies.",
      };
    }

    revalidatePath("/events");
    revalidatePath("/");

    return { success: "Event deleted successfully" };
  } catch (error) {
    console.error("Delete event exception:", error);

    return {
      error:
        error instanceof Error
          ? error.message
          : "Unable to delete the event.",
    };
  }
}
