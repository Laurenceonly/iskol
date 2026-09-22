import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    redirect("/dashboard");
  }

  const { data: analytics, error } =
    await supabase.rpc("get_admin_analytics");

  if (error) {
    return (
      <main className="p-8">
        <p>Unable to load analytics.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f6f3] px-6 py-8 text-[#181a18]">
      <div className="mx-auto max-w-6xl">
        <a
          href="/dashboard"
          className="text-sm text-[#777b76]"
        >
          ← Dashboard
        </a>

        <h1 className="mt-4 text-3xl font-medium tracking-[-0.035em]">
          Admin
        </h1>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

          <Stat
            label="Total users"
            value={analytics?.total_users ?? 0}
          />

          <Stat
            label="Active this week"
            value={analytics?.active_users_7d ?? 0}
          />

          <Stat
            label="Subjects"
            value={analytics?.total_subjects ?? 0}
          />

          <Stat
            label="Notes"
            value={analytics?.total_notes ?? 0}
          />

          <Stat
            label="Tasks"
            value={analytics?.total_tasks ?? 0}
          />

        </div>
      </div>
    </main>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-[12px] border border-[#e2e4e0] bg-white p-5">
      <p className="text-sm text-[#7d817c]">
        {label}
      </p>

      <p className="mt-3 text-3xl font-medium tracking-[-0.04em]">
        {value}
      </p>
    </div>
  );
}