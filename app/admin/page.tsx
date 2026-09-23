import { redirect } from "next/navigation";

import AppShell from "@/components/app-shell";
import AdminUserAction from "@/components/admin-user-action";
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


  const { data: analytics } =
    await supabase.rpc(
      "get_admin_analytics"
    );

  const { data: growth } =
    await supabase.rpc(
      "get_admin_growth"
    );

  const { data: users } =
    await supabase.rpc(
      "get_admin_users"
    );


  const monthlyGrowth =
    groupMonthlyGrowth(
      growth ?? []
    );


  return (
    <AppShell>

      <main className="mx-auto max-w-[1200px] space-y-8">

        {/* HEADER */}

        <header className="border-b border-border pb-5">
          <h1 className="text-[22px] font-semibold tracking-[-0.035em]">
            Admin
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            System overview
          </p>
        </header>



        {/* SUMMARY CARDS */}

        <section className="grid gap-3 sm:grid-cols-3">

          <MetricCard
            label="Users"
            value={
              analytics?.total_users ?? 0
            }
          />


          <MetricCard
            label="Subjects"
            value={
              analytics?.total_subjects ?? 0
            }
          />


          <MetricCard
            label="Notes"
            value={
              analytics?.total_notes ?? 0
            }
          />

        </section>



        {/* USER GROWTH */}

        <section className="rounded-[16px] border border-border bg-white dark:bg-card">

          <div className="border-b border-border px-5 py-4">

            <h2 className="text-[16px] font-semibold tracking-[-0.02em]">
              User growth
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              New registered users by month
            </p>

          </div>



          <div className="p-5">

            {monthlyGrowth.length === 0 ? (

              <div className="py-10 text-center text-sm text-muted-foreground">
                No growth data available.
              </div>

            ) : (

              <div className="flex h-[260px] items-end gap-4">

                {monthlyGrowth.map(
                  (item) => (

                    <div
                      key={item.month}
                      className="group flex flex-1 flex-col items-center gap-3"
                    >

                      <span className="text-xs text-muted-foreground opacity-0 transition group-hover:opacity-100">
                        {item.users}
                      </span>


                      <div className="flex h-[200px] w-full items-end rounded-[10px] bg-[#f1f5f2] p-1 dark:bg-white/5">

                        <div
                          className="w-full rounded-[8px] bg-[#173c2d] transition-all"
                          style={{
                            height: `${item.percent}%`,
                          }}
                        />

                      </div>


                      <span className="text-[11px] text-muted-foreground">
                        {item.month}
                      </span>

                    </div>

                  )
                )}

              </div>

            )}

          </div>

        </section>
                {/* ACCOUNTS */}

        <section className="rounded-[16px] border border-border bg-white dark:bg-card">

          <div className="flex items-center justify-between border-b border-border px-5 py-4">

            <h2 className="text-[16px] font-semibold tracking-[-0.02em]">
              Accounts
            </h2>

            <span className="text-sm text-muted-foreground">
              {users?.length ?? 0}
            </span>

          </div>



          {!users || users.length === 0 ? (

            <div className="py-10 text-center text-sm text-muted-foreground">
              No accounts available.
            </div>

          ) : (

            <div className="divide-y divide-border">

              {users.map(
                (
                  account: {
                    id: string;
                    display_name: string;
                    status: string;
                    created_at: string;
                  }
                ) => (

                  <div
                    key={account.id}
                    className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >

                    <div className="flex items-center gap-3">

                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#edf3ef] text-sm font-semibold text-[#173c2d] dark:bg-[#173426] dark:text-[#8fc0a4]">
                        {account.display_name
                          ?.charAt(0)
                          .toUpperCase() || "I"}
                      </div>


                      <div>

                        <p className="text-sm font-semibold">
                          {account.display_name}
                        </p>


                        <p className="mt-1 text-xs text-muted-foreground">
                          Joined{" "}
                          {new Date(
                            account.created_at
                          ).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </p>

                      </div>

                    </div>



                    <div className="flex items-center gap-3">

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                          account.status === "active"
                            ? "bg-[#edf3ef] text-[#173c2d] dark:bg-[#173426] dark:text-[#8fc0a4]"
                            : "bg-red-500/10 text-red-600 dark:text-red-400"
                        }`}
                      >
                        {account.status}
                      </span>


                      <AdminUserAction
                        userId={account.id}
                        status={account.status}
                      />

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </section>

      </main>

    </AppShell>
  );
}



/* -------------------------------------------------------------------------- */
/* METRIC CARD                                                                */
/* -------------------------------------------------------------------------- */

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-[16px] border border-border bg-white p-5 dark:bg-card">

      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
        {label}
      </p>


      <p className="mt-4 text-[32px] font-semibold tracking-[-0.05em]">
        {value}
      </p>

    </div>
  );
}



/* -------------------------------------------------------------------------- */
/* MONTHLY GROWTH                                                             */
/* -------------------------------------------------------------------------- */

function groupMonthlyGrowth(
  data: {
    signup_date: string;
    users: number;
  }[]
) {
  const map =
    new Map<string, number>();


  data.forEach((item) => {

    const date =
      new Date(item.signup_date);


    const month =
      date.toLocaleDateString(
        "en-US",
        {
          month: "short",
          year: "numeric",
        }
      );


    map.set(
      month,
      (map.get(month) ?? 0) +
        item.users
    );

  });


  const values =
    Array.from(
      map.entries()
    ).map(
      ([month, users]) => ({
        month,
        users,
      })
    );


  const max =
    Math.max(
      ...values.map(
        (item) =>
          item.users
      ),
      1
    );


  return values.map(
    (item) => ({
      ...item,
      percent:
        (item.users / max) * 100,
    })
  );
}