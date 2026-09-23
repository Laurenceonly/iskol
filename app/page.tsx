import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin, status")
    .eq("id", user.id)
    .single();

  if (profile?.status === "suspended") {
    redirect("/auth/suspended");
  }

  if (profile?.is_admin) {
    redirect("/admin");
  }

  redirect("/dashboard");
}