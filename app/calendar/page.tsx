"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/app-shell";
import { createClient } from "@/lib/supabase/client";

type Schedule = {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  location: string | null;
  subjects:
    | {
        id: string;
        name: string;
        code: string | null;
      }
    | {
        id: string;
        name: string;
        code: string | null;
      }[]
    | null;
};

type ViewMode = "month" | "week";

const shortDayNames = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
];

const weekDayNames = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function CalendarPage() {
  const supabase = createClient();

  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  const [today, setToday] = useState<Date | null>(null);
  const [currentDate, setCurrentDate] = useState<Date | null>(null);

  const [view, setView] = useState<ViewMode>("month");

  useEffect(() => {
    const now = new Date();

    setToday(now);
    setCurrentDate(now);

    async function loadSchedules() {
      const { data } = await supabase
        .from("subject_schedules")
        .select(`
          id,
          day_of_week,
          start_time,
          end_time,
          location,
          subjects (
            id,
            name,
            code
          )
        `)
        .order("start_time", { ascending: true });

      setSchedules((data as Schedule[]) ?? []);
      setLoading(false);
    }

    loadSchedules();
  }, [supabase]);

  const monthDays = useMemo(() => {
    if (!currentDate) return [];

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);

    const mondayStart =
      firstDay.getDay() === 0
        ? 6
        : firstDay.getDay() - 1;

    const startDate = new Date(year, month, 1 - mondayStart);

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + index);

      return date;
    });
  }, [currentDate]);

  const weekDates = useMemo(() => {
    if (!currentDate) return [];

    const selected = new Date(currentDate);

    const day = selected.getDay();

    const difference =
      day === 0 ? -6 : 1 - day;

    const monday = new Date(selected);
    monday.setDate(selected.getDate() + difference);

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);

      return date;
    });
  }, [currentDate]);

  if (!today || !currentDate) {
    return (
      <AppShell>
        <div className="py-10 text-sm text-muted-foreground">
          Loading calendar...
        </div>
      </AppShell>
    );
  }

  const title =
    view === "month"
      ? currentDate.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })
      : getWeekTitle(weekDates);

  function goPrevious() {
    setCurrentDate((current) => {
      if (!current) return current;

      const next = new Date(current);

      if (view === "month") {
        return shiftMonth(next, -1);
      } else {
        next.setDate(next.getDate() - 7);
      }

      return next;
    });
  }

  function goNext() {
    setCurrentDate((current) => {
      if (!current) return current;

      const next = new Date(current);

      if (view === "month") {
        return shiftMonth(next, 1);
      } else {
        next.setDate(next.getDate() + 7);
      }

      return next;
    });
  }

  function goToday() {
    setCurrentDate(new Date());
  }

  return (
    <AppShell>
      {/* HEADER */}
      <header className="flex flex-col gap-6 border-b border-border pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-[26px] font-semibold tracking-[-0.04em]">
            Calendar
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            {title}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View */}
          <div className="flex rounded-[10px] bg-secondary p-1">
            <button
              type="button"
              onClick={() => setView("month")}
              className={`rounded-[7px] px-3 py-1.5 text-xs font-medium transition ${
                view === "month"
                  ? "bg-white text-foreground shadow-sm dark:bg-[#202722]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Month
            </button>

            <button
              type="button"
              onClick={() => setView("week")}
              className={`rounded-[7px] px-3 py-1.5 text-xs font-medium transition ${
                view === "week"
                  ? "bg-white text-foreground shadow-sm dark:bg-[#202722]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Week
            </button>
          </div>

          <button
            type="button"
            onClick={goToday}
            className="h-9 rounded-[9px] border border-border px-3 text-xs font-medium transition hover:bg-secondary"
          >
            Today
          </button>

          <div className="flex overflow-hidden rounded-[9px] border border-border">
            <button
              type="button"
              onClick={goPrevious}
              className="flex h-9 w-10 items-center justify-center border-r border-border transition hover:bg-secondary"
              aria-label="Previous"
            >
              <ChevronLeft />
            </button>

            <button
              type="button"
              onClick={goNext}
              className="flex h-9 w-10 items-center justify-center transition hover:bg-secondary"
              aria-label="Next"
            >
              <ChevronRight />
            </button>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="py-12 text-sm text-muted-foreground">
          Loading schedules...
        </div>
      ) : (
        <div className="mt-7 overflow-x-auto">
          <div className="min-w-[900px] overflow-hidden rounded-[14px] border border-border">
            {view === "month" ? (
              <MonthView
                currentDate={currentDate}
                today={today}
                days={monthDays}
                schedules={schedules}
              />
            ) : (
              <WeekView
                today={today}
                dates={weekDates}
                schedules={schedules}
              />
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}

function MonthView({
  currentDate,
  today,
  days,
  schedules,
}: {
  currentDate: Date;
  today: Date;
  days: Date[];
  schedules: Schedule[];
}) {
  return (
    <>
        {/* Week headings */}
        <div className="grid grid-cols-7 border-b border-border bg-[#f8f9f8] dark:bg-white/[0.025]">
          {shortDayNames.map((day) => (
            <div
              key={day}
              className="border-r border-border px-3 py-3 text-xs font-semibold text-muted-foreground last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar */}
        <div className="grid grid-cols-7">
          {days.map((date, index) => {
            const inCurrentMonth =
              date.getMonth() === currentDate.getMonth();

            const isToday = sameDay(date, today);

            const dayIndex = date.getDay();

            const daySchedules = schedules.filter(
              (schedule) =>
                schedule.day_of_week === dayIndex
            );

            return (
              <div
                key={date.toISOString()}
                className={`min-h-[145px] bg-white p-2.5 dark:bg-[#0f1411] ${
                  (index + 1) % 7 === 0 ? "" : "border-r border-border"
                } ${index < days.length - 7 ? "border-b border-border" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`flex h-7 min-w-7 items-center justify-center rounded-full px-1 text-xs font-medium ${
                      isToday
                        ? "bg-[#173c2d] text-white"
                        : inCurrentMonth
                          ? "text-foreground"
                          : "text-muted-foreground/45"
                    }`}
                  >
                    {date.getDate()}
                  </span>
                </div>

                <div className="mt-2 space-y-1.5">
                  {daySchedules.slice(0, 3).map((schedule) => {
                    const subject =
                      getSubject(schedule);

                    return (
                      <div
                        key={schedule.id}
                        className={`rounded-[7px] border border-[#dce8e0] bg-[#edf3ef] px-2 py-1.5 dark:border-[#274132] dark:bg-[#173426] ${
                          !inCurrentMonth
                            ? "opacity-40"
                            : ""
                        }`}
                      >
                        <p className="truncate text-[10px] font-semibold text-[#173c2d] dark:text-[#8fc0a4]">
                          {formatTime(schedule.start_time)}
                        </p>

                        <p className="mt-0.5 truncate text-[11px] font-medium text-[#24352a] dark:text-[#d9e5dc]">
                          {subject?.name ?? "Subject"}
                        </p>
                      </div>
                    );
                  })}

                  {daySchedules.length > 3 && (
                    <p className="px-1 text-[10px] text-muted-foreground">
                      +{daySchedules.length - 3} more
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
    </>
  );
}

function WeekView({
  today,
  dates,
  schedules,
}: {
  today: Date;
  dates: Date[];
  schedules: Schedule[];
}) {
  return (
    <div className="grid grid-cols-7">
      {dates.map((date, index) => {
        const daySchedules = schedules.filter(
          (schedule) => schedule.day_of_week === date.getDay()
        );
        const isToday = sameDay(date, today);

        return (
          <div
            key={date.toISOString()}
            className={`min-h-[520px] bg-white dark:bg-[#0f1411] ${
              index < 6 ? "border-r border-border" : ""
            }`}
          >
            <div
              className={`border-b border-border px-4 py-4 ${
                isToday ? "bg-[#f1f5f2] dark:bg-[#173426]/50" : ""
              }`}
            >
              <p className="text-xs font-medium text-muted-foreground">
                {weekDayNames[index]}
              </p>
              <p
                className={`mt-1 text-lg font-semibold ${
                  isToday ? "text-primary" : ""
                }`}
              >
                {date.getDate()}
              </p>
            </div>

            <div className="space-y-2 p-2">
              {daySchedules.length === 0 ? (
                <p className="px-2 py-3 text-xs text-muted-foreground/60">
                  &mdash;
                </p>
              ) : (
                daySchedules.map((schedule) => (
                  <ScheduleCard key={schedule.id} schedule={schedule} />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ScheduleCard({
  schedule,
}: {
  schedule: Schedule;
}) {
  const subject = getSubject(schedule);

  return (
    <div className="rounded-[9px] border border-[#dce8e0] bg-[#edf3ef] p-3 dark:border-[#274132] dark:bg-[#173426]">
      <p className="text-[11px] font-semibold text-[#173c2d] dark:text-[#8fc0a4]">
        {formatTime(schedule.start_time)}
      </p>

      <p className="mt-1 text-xs font-semibold leading-5 text-[#24352a] dark:text-[#e4ece6]">
        {subject?.name ?? "Subject"}
      </p>

      {schedule.location && (
        <p className="mt-1 text-[10px] text-[#65766a] dark:text-[#9bad9f]">
          {schedule.location}
        </p>
      )}
    </div>
  );
}

function getSubject(schedule: Schedule) {
  if (!schedule.subjects) return null;

  return Array.isArray(schedule.subjects)
    ? schedule.subjects[0]
    : schedule.subjects;
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatTime(time: string) {
  const [hours, minutes] = time.split(":");

  const hour = Number(hours);

  const suffix =
    hour >= 12 ? "PM" : "AM";

  const twelveHour =
    hour % 12 || 12;

  return `${twelveHour}:${minutes} ${suffix}`;
}

function getWeekTitle(dates: Date[]) {
  if (dates.length === 0) return "";

  const first = dates[0];
  const last = dates[6];

  if (
    first.getMonth() === last.getMonth()
  ) {
    return `${first.toLocaleDateString("en-US", {
      month: "long",
    })} ${first.getDate()}–${last.getDate()}, ${last.getFullYear()}`;
  }

  return `${first.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })} – ${last.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;
}

function ChevronLeft() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
    >
      <path
        d="m15 18-6-6 6-6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
    >
      <path
        d="m9 6 6 6-6 6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function shiftMonth(date: Date, offset: number) {
  const day = date.getDate();
  const target = new Date(date.getFullYear(), date.getMonth() + offset, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(day, lastDay));
  return target;
}
