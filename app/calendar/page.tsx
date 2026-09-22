"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function dbDayToIndex(day: number) {
  if (day === 0) return 6;
  return day - 1;
}

export default function CalendarPage() {
  const supabase = createClient();
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  useEffect(() => {
    loadSchedules();
  }, []);

  async function loadSchedules() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/auth/login";
      return;
    }

    const { data, error } = await supabase
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
      .order("day_of_week")
      .order("start_time");

    if (!error && data) {
      setSchedules(data as Schedule[]);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f6f3] px-5 py-8 text-[#181a18]">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/dashboard"
          className="text-sm text-[#777b76] hover:text-[#176b52]"
        >
          ← Dashboard
        </Link>

        <h1 className="mt-4 text-3xl font-medium tracking-[-0.035em]">
          Weekly timetable
        </h1>

        <div className="mt-10 overflow-x-auto">
          <div className="grid min-w-[900px] grid-cols-7 gap-3">
            {days.map((day, index) => {
              const daySchedules = schedules.filter(
                (schedule) => dbDayToIndex(schedule.day_of_week) === index
              );

              return (
                <section key={day}>
                  <div className="mb-3 text-sm font-medium">
                    {day}
                  </div>

                  <div className="min-h-[420px] rounded-[12px] border border-[#e2e4e0] bg-white p-3">
                    {daySchedules.length === 0 ? (
                      <p className="py-4 text-center text-xs text-[#a0a49f]">
                        No classes
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {daySchedules.map((schedule) => {
                          const subject = Array.isArray(schedule.subjects)
                            ? schedule.subjects[0]
                            : schedule.subjects;

                          return (
                            <div
                              key={schedule.id}
                              className="rounded-[9px] border border-[#e4e6e2] bg-[#f8f9f7] p-3"
                            >
                              <p className="text-sm font-medium">
                                {subject?.name ?? "Subject"}
                              </p>

                              {subject?.code && (
                                <p className="mt-1 text-xs text-[#8a8e89]">
                                  {subject.code}
                                </p>
                              )}

                              <p className="mt-3 text-xs text-[#666b66]">
                                {schedule.start_time.slice(0, 5)} –{" "}
                                {schedule.end_time.slice(0, 5)}
                              </p>

                              {schedule.location && (
                                <p className="mt-1 text-xs text-[#8a8e89]">
                                  {schedule.location}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}