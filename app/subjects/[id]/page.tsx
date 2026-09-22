"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Subject = {
  id: string;
  name: string;
  code: string | null;
  instructor: string | null;
};

type Schedule = {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  location: string | null;
};

const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function SubjectDetailPage() {
  const params = useParams();
  const subjectId = params.id as string;

  const supabase = createClient();

  const [subject, setSubject] = useState<Subject | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  const [day, setDay] = useState("1");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSubject();
    loadSchedules();
  }, [subjectId]);

  async function loadSubject() {
    const { data, error } = await supabase
      .from("subjects")
      .select("id, name, code, instructor")
      .eq("id", subjectId)
      .single();

    if (!error && data) {
      setSubject(data);
    }
  }

  async function loadSchedules() {
    const { data, error } = await supabase
      .from("subject_schedules")
      .select("id, day_of_week, start_time, end_time, location")
      .eq("subject_id", subjectId)
      .order("day_of_week")
      .order("start_time");

    if (!error && data) {
      setSchedules(data);
    }
  }

  async function handleAddSchedule(e: React.FormEvent) {
    e.preventDefault();

    setMessage("");
    setLoading(true);

    const { error } = await supabase.from("subject_schedules").insert({
      subject_id: subjectId,
      day_of_week: Number(day),
      start_time: startTime,
      end_time: endTime,
      location: location || null,
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setStartTime("");
    setEndTime("");
    setLocation("");
    setMessage("Schedule added.");

    loadSchedules();
  }

  if (!subject) {
    return (
      <main className="min-h-screen bg-[#f5f6f3] p-6">
        <p className="text-sm text-neutral-500">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f6f3] px-5 py-8 text-[#181a18]">
      <div className="mx-auto max-w-5xl">
        <a
          href="/subjects"
          className="text-sm text-[#777b76] hover:text-[#176b52]"
        >
          ← Subjects
        </a>

        <header className="mt-6">
          <h1 className="text-3xl font-medium tracking-[-0.035em]">
            {subject.name}
          </h1>

          <div className="mt-2 flex gap-4 text-sm text-[#777b76]">
            {subject.code && <span>{subject.code}</span>}
            {subject.instructor && <span>{subject.instructor}</span>}
          </div>
        </header>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* Existing schedules */}
          <section>
            <h2 className="text-lg font-medium">Schedule</h2>

            <div className="mt-4 space-y-3">
              {schedules.length === 0 ? (
                <div className="rounded-[12px] border border-dashed border-[#d9dcd7] bg-white p-8 text-center">
                  <p className="text-sm text-[#777b76]">
                    No schedule yet.
                  </p>
                </div>
              ) : (
                schedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="rounded-[12px] border border-[#e2e4e0] bg-white p-5"
                  >
                    <p className="font-medium">
                      {days[schedule.day_of_week]}
                    </p>

                    <p className="mt-1 text-sm text-[#777b76]">
                      {schedule.start_time.slice(0, 5)} –{" "}
                      {schedule.end_time.slice(0, 5)}
                    </p>

                    {schedule.location && (
                      <p className="mt-2 text-sm text-[#777b76]">
                        {schedule.location}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Add schedule */}
          <aside>
            <div className="rounded-[14px] border border-[#e2e4e0] bg-white p-6">
              <h2 className="text-lg font-medium">
                Add schedule
              </h2>

              <form
                onSubmit={handleAddSchedule}
                className="mt-6 space-y-4"
              >
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Day
                  </label>

                  <select
                    value={day}
                    onChange={(e) => setDay(e.target.value)}
                    className="h-11 w-full rounded-[9px] border border-[#dedfdd] px-3 text-sm outline-none"
                  >
                    {days.map((name, index) => (
                      <option key={name} value={index}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Start time
                  </label>

                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="h-11 w-full rounded-[9px] border border-[#dedfdd] px-3 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    End time
                  </label>

                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="h-11 w-full rounded-[9px] border border-[#dedfdd] px-3 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Location
                  </label>

                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Room 204"
                    className="h-11 w-full rounded-[9px] border border-[#dedfdd] px-3.5 text-sm outline-none"
                  />
                </div>

                {message && (
                  <p className="text-sm text-[#666b66]">
                    {message}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="h-11 w-full rounded-[9px] bg-[#176b52] text-sm font-medium text-white disabled:opacity-50"
                >
                  {loading ? "Adding..." : "Add schedule"}
                </button>
              </form>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}