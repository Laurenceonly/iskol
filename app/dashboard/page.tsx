import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/app-shell";

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
    .select("is_admin, status")
    .eq("id", user.id)
    .single();

  if (profile?.status === "suspended") {
    redirect("/auth/suspended");
  }

  if (profile?.is_admin) {
    redirect("/admin");
  }

  // Date
  const today = new Date();

  const dateLabel = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(today);

  const dayOfWeek = today.getDay();

  // Subject count
  const { count: subjectCount } = await supabase
    .from("subjects")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("archived", false);

  // Subjects
  const { data: subjects } = await supabase
    .from("subjects")
    .select(`
      id,
      name,
      code,
      instructor
    `)
    .eq("archived", false)
    .order("created_at", {
      ascending: false,
    })
    .limit(6);

  // Pending work count
  const { count: pendingCount } = await supabase
    .from("tasks")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("status", "pending");

  // Upcoming work
  const { data: tasks } = await supabase
    .from("tasks")
    .select(`
      id,
      title,
      type,
      due_date
    `)
    .eq("status", "pending")
    .order("due_date", {
      ascending: true,
      nullsFirst: false,
    })
    .limit(5);

  // Today's classes
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
    .eq("day_of_week", dayOfWeek)
    .order("start_time", {
      ascending: true,
    });

  const classesToday = schedules?.length ?? 0;

  return (
    <AppShell>
      {/* Header */}
      <header>
        <h1 className="text-[26px] font-semibold tracking-[-0.04em]">
          Dashboard
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          {dateLabel}
        </p>
      </header>

      {/* Summary */}
      <section className="mt-8 grid gap-3 sm:grid-cols-3">
        {/* Classes */}
        <Link
          href="/calendar"
          className="group rounded-[16px] border border-border bg-white p-5 transition-all duration-200 hover:border-[#173c2d]/25 hover:shadow-[0_8px_30px_rgba(20,40,28,0.05)] dark:bg-card"
        >
          <div className="flex items-start justify-between gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Classes today
            </p>

            <ArrowIcon className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
          </div>

          <p className="mt-5 text-[32px] font-semibold leading-none tracking-[-0.055em]">
            {classesToday}
          </p>

          <p className="mt-3 text-sm text-muted-foreground">
            {classesToday === 1
              ? "class scheduled"
              : "classes scheduled"}
          </p>
        </Link>

        {/* Pending */}
        <div className="rounded-[16px] border border-border bg-white p-5 dark:bg-card">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Pending work
          </p>

          <p className="mt-5 text-[32px] font-semibold leading-none tracking-[-0.055em]">
            {pendingCount ?? 0}
          </p>

          <p className="mt-3 text-sm text-muted-foreground">
            {(pendingCount ?? 0) === 1
              ? "item remaining"
              : "items remaining"}
          </p>
        </div>

        {/* Subject count */}
        <Link
          href="/subjects"
          className="group rounded-[16px] border border-border bg-white p-5 transition-all duration-200 hover:border-[#173c2d]/25 hover:shadow-[0_8px_30px_rgba(20,40,28,0.05)] dark:bg-card"
        >
          <div className="flex items-start justify-between gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Subjects
            </p>

            <ArrowIcon className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
          </div>

          <p className="mt-5 text-[32px] font-semibold leading-none tracking-[-0.055em]">
            {subjectCount ?? 0}
          </p>

          <p className="mt-3 text-sm text-muted-foreground">
            {(subjectCount ?? 0) === 1
              ? "active subject"
              : "active subjects"}
          </p>
        </Link>
      </section>

      {/* Today + Upcoming */}
      <section className="mt-12 grid gap-12 xl:grid-cols-[1.35fr_0.65fr]">
        {/* Today */}
        <div>
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h2 className="text-[19px] font-semibold tracking-[-0.03em]">
              Today
            </h2>

            <Link
              href="/calendar"
              className="text-sm font-medium text-primary transition hover:opacity-60"
            >
              Calendar
            </Link>
          </div>

          <div className="divide-y divide-border">
            {!schedules || schedules.length === 0 ? (
              <div className="py-9 text-sm text-muted-foreground">
                No classes scheduled today.
              </div>
            ) : (
              schedules.map((schedule) => {
                const subject = Array.isArray(schedule.subjects)
                  ? schedule.subjects[0]
                  : schedule.subjects;

                return (
                  <div
                    key={schedule.id}
                    className="grid gap-3 py-5 sm:grid-cols-[85px_1fr] sm:items-center"
                  >
                    <div>
                      <p className="text-sm font-semibold">
                        {formatTime(schedule.start_time)}
                      </p>

                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatTime(schedule.end_time)}
                      </p>
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-semibold tracking-[-0.02em]">
                        {subject?.name ?? "Subject"}
                      </p>

                      {(subject?.code || schedule.location) && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {[subject?.code, schedule.location]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Upcoming */}
        <div>
          <div className="border-b border-border pb-4">
            <h2 className="text-[19px] font-semibold tracking-[-0.03em]">
              Upcoming
            </h2>
          </div>

          <div className="divide-y divide-border">
            {!tasks || tasks.length === 0 ? (
              <div className="py-9 text-sm text-muted-foreground">
                Nothing due soon.
              </div>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between gap-5 py-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {task.title}
                    </p>

                    <p className="mt-1 text-xs capitalize text-muted-foreground">
                      {task.type}
                    </p>
                  </div>

                  {task.due_date && (
                    <p className="shrink-0 text-xs font-medium text-muted-foreground">
                      {new Date(task.due_date).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Subjects */}
      <section className="mt-12">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h2 className="text-[19px] font-semibold tracking-[-0.03em]">
            Subjects
          </h2>

          <Link
            href="/subjects"
            className="text-sm font-medium text-primary transition hover:opacity-60"
          >
            View all
          </Link>
        </div>

        {!subjects || subjects.length === 0 ? (
          <div className="py-10 text-sm text-muted-foreground">
            No subjects yet.
          </div>
        ) : (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {subjects.map((subject) => (
              <Link
                key={subject.id}
                href={`/subjects/${subject.id}`}
                className="group flex min-h-[145px] flex-col rounded-[16px] border border-border bg-white p-5 transition-all duration-200 hover:-translate-y-[1px] hover:border-[#173c2d]/25 hover:shadow-[0_8px_28px_rgba(20,40,28,0.05)] dark:bg-card"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    {subject.code && (
                      <p className="text-[11px] font-semibold uppercase tracking-[0.09em] text-primary">
                        {subject.code}
                      </p>
                    )}

                    <p
                      className={`truncate text-[16px] font-semibold tracking-[-0.025em] ${
                        subject.code ? "mt-2" : ""
                      }`}
                    >
                      {subject.name}
                    </p>
                  </div>

                  <ArrowIcon className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
                </div>

                <div className="mt-auto pt-5">
                  <p className="truncate text-sm text-muted-foreground">
                    {subject.instructor || "No instructor"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}

function formatTime(time: string) {
  const [hours, minutes] = time.split(":");
  const hour = Number(hours);

  const suffix = hour >= 12 ? "PM" : "AM";
  const twelveHour = hour % 12 || 12;

  return `${twelveHour}:${minutes} ${suffix}`;
}

function ArrowIcon({
  className,
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}