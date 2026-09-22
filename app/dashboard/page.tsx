import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/logout-button";

export const instant = false;

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, is_admin")
    .eq("id", user.id)
    .single();

  // Admin accounts go to admin dashboard
  if (profile?.is_admin) {
    redirect("/admin");
  }

  // Subjects
  const { data: subjects } = await supabase
    .from("subjects")
    .select("id, name, code, instructor")
    .eq("archived", false)
    .order("created_at", { ascending: false })
    .limit(6);

  // Upcoming tasks
  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, title, type, due_date, status")
    .eq("status", "pending")
    .order("due_date", { ascending: true })
    .limit(5);

  // Today's schedules
  const today = new Date().getDay();

  const { data: schedules } = await supabase
    .from("subject_schedules")
    .select(`
      id,
      start_time,
      end_time,
      location,
      subjects (
        id,
        name,
        code
      )
    `)
    .eq("day_of_week", today)
    .order("start_time", { ascending: true });

  const displayName = profile?.display_name ?? "Iskolar";

  return (
    <main className="min-h-screen bg-[#f5f6f3] text-[#181a18]">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-60 border-r border-[#e4e6e2] bg-white px-5 py-6 md:flex md:flex-col">
        <p className="px-2 text-lg font-semibold tracking-[-0.02em]">
          ISKOL
        </p>

        <nav className="mt-10 space-y-1">
          <NavLink href="/dashboard" label="Home" active />
          <NavLink href="/subjects" label="Subjects" />
          <NavLink href="/notes" label="Notes" />
          <NavLink href="/calendar" label="Calendar" />
          <NavLink href="/profile" label="Profile" />
        </nav>

        <div className="mt-auto px-3">
          <LogoutButton />
        </div>
      </aside>

      {/* Main content */}
      <section className="pb-24 md:ml-60 md:pb-0">
        <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 md:py-10">
          {/* Header */}
          <header className="flex items-start justify-between">
            <div>
              <p className="text-sm text-[#7a7e79]">
                Welcome back
              </p>

              <h1 className="mt-1 text-3xl font-medium tracking-[-0.035em]">
                {displayName}
              </h1>
            </div>

            <p className="text-lg font-semibold md:hidden">
              ISKOL
            </p>
          </header>

          {/* Today + Upcoming */}
          <div className="mt-10 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
            {/* Today */}
            <section>
              <h2 className="mb-4 text-lg font-medium">
                Today
              </h2>

              <div className="overflow-hidden rounded-[14px] border border-[#e2e4e0] bg-white">
                {!schedules || schedules.length === 0 ? (
                  <div className="px-6 py-14 text-center">
                    <p className="text-sm text-[#858985]">
                      No classes today.
                    </p>
                  </div>
                ) : (
                  schedules.map((schedule) => {
                    const subject = Array.isArray(schedule.subjects)
                      ? schedule.subjects[0]
                      : schedule.subjects;

                    return (
                      <div
                        key={schedule.id}
                        className="flex items-center justify-between border-b border-[#eeeeec] px-5 py-4 last:border-0"
                      >
                        <div>
                          <p className="font-medium">
                            {subject?.name ?? "Subject"}
                          </p>

                          {schedule.location && (
                            <p className="mt-1 text-sm text-[#7d817c]">
                              {schedule.location}
                            </p>
                          )}
                        </div>

                        <p className="text-sm text-[#666b66]">
                          {schedule.start_time.slice(0, 5)}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </section>

            {/* Upcoming */}
            <section>
              <h2 className="mb-4 text-lg font-medium">
                Upcoming
              </h2>

              <div className="overflow-hidden rounded-[14px] border border-[#e2e4e0] bg-white">
                {!tasks || tasks.length === 0 ? (
                  <div className="px-6 py-14 text-center">
                    <p className="text-sm text-[#858985]">
                      Nothing due soon.
                    </p>
                  </div>
                ) : (
                  tasks.map((task) => (
                    <div
                      key={task.id}
                      className="border-b border-[#eeeeec] px-5 py-4 last:border-0"
                    >
                      <p className="text-sm font-medium">
                        {task.title}
                      </p>

                      <div className="mt-1 flex items-center justify-between text-xs text-[#858985]">
                        <span className="capitalize">
                          {task.type}
                        </span>

                        {task.due_date && (
                          <span>
                            {new Date(
                              task.due_date
                            ).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          {/* Subjects */}
          <section className="mt-10">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-medium">
                Subjects
              </h2>

              <Link
                href="/subjects"
                className="text-sm font-medium text-[#176b52]"
              >
                View all
              </Link>
            </div>

            {!subjects || subjects.length === 0 ? (
              <div className="rounded-[14px] border border-dashed border-[#d9dcd7] bg-white px-6 py-12 text-center">
                <p className="text-sm text-[#858985]">
                  No subjects yet.
                </p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {subjects.map((subject) => (
                  <Link
                    key={subject.id}
                    href={`/subjects/${subject.id}`}
                    className="rounded-[12px] border border-[#e2e4e0] bg-white p-5 transition hover:border-[#cdd2cd]"
                  >
                    <p className="font-medium">
                      {subject.name}
                    </p>

                    {subject.code && (
                      <p className="mt-1 text-sm text-[#858985]">
                        {subject.code}
                      </p>
                    )}

                    {subject.instructor && (
                      <p className="mt-4 text-sm text-[#727772]">
                        {subject.instructor}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </section>

      {/* Mobile navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-[#e3e5e1] bg-white md:hidden">
        <div className="grid grid-cols-5">
          <MobileLink href="/dashboard" label="Home" active />
          <MobileLink href="/subjects" label="Subjects" />
          <MobileLink href="/notes" label="Notes" />
          <MobileLink href="/calendar" label="Calendar" />
          <MobileLink href="/profile" label="Profile" />
        </div>
      </nav>
    </main>
  );
}

function NavLink({
  href,
  label,
  active = false,
}: {
  href: string;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`block rounded-[8px] px-3 py-2.5 text-sm ${
        active
          ? "bg-[#eef3ef] font-medium text-[#176b52]"
          : "text-[#666b66] hover:bg-[#f5f6f3]"
      }`}
    >
      {label}
    </Link>
  );
}

function MobileLink({
  href,
  label,
  active = false,
}: {
  href: string;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`py-4 text-center text-xs ${
        active
          ? "font-medium text-[#176b52]"
          : "text-[#7c807b]"
      }`}
    >
      {label}
    </Link>
  );
}