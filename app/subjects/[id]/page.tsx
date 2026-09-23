"use client";

import Link from "next/link";
import {
  FormEvent,
  Suspense,
  useEffect,
  useState,
} from "react";
import { useParams } from "next/navigation";

import AppShell from "@/components/app-shell";
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
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 0, label: "Sunday" },
];

export default function SubjectPage() {
  return (
    <Suspense
      fallback={
        <AppShell>
          <p className="text-sm text-muted-foreground">
            Loading subject...
          </p>
        </AppShell>
      }
    >
      <SubjectPageContent />
    </Suspense>
  );
}

function SubjectPageContent() {
  const params = useParams();
  const subjectId = params.id as string;

  const [supabase] = useState(() => createClient());

  const [subject, setSubject] =
    useState<Subject | null>(null);

  const [schedules, setSchedules] =
    useState<Schedule[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [showModal, setShowModal] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [day, setDay] =
    useState(1);

  const [startTime, setStartTime] =
    useState("");

  const [endTime, setEndTime] =
    useState("");

  const [location, setLocation] =
    useState("");

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");

      const {
        data: subjectData,
        error: subjectError,
      } = await supabase
        .from("subjects")
        .select(`
          id,
          name,
          code,
          instructor
        `)
        .eq("id", subjectId)
        .single();

      if (subjectError) {
        setError(subjectError.message);
        setLoading(false);
        return;
      }

      const {
        data: scheduleData,
        error: scheduleError,
      } = await supabase
        .from("subject_schedules")
        .select(`
          id,
          day_of_week,
          start_time,
          end_time,
          location
        `)
        .eq("subject_id", subjectId)
        .order("day_of_week", {
          ascending: true,
        })
        .order("start_time", {
          ascending: true,
        });

      if (scheduleError) {
        setError(scheduleError.message);
      }

      setSubject(subjectData);
      setSchedules(scheduleData ?? []);
      setLoading(false);
    }

    load();
  }, [subjectId, supabase]);

  async function reloadSchedules() {
    const {
      data,
      error,
    } = await supabase
      .from("subject_schedules")
      .select(`
        id,
        day_of_week,
        start_time,
        end_time,
        location
      `)
      .eq("subject_id", subjectId)
      .order("day_of_week", {
        ascending: true,
      })
      .order("start_time", {
        ascending: true,
      });

    if (error) {
      setError(error.message);
      return;
    }

    setSchedules(data ?? []);
  }

  async function createSchedule(
    event: FormEvent
  ) {
    event.preventDefault();

    if (!startTime || !endTime) {
      return;
    }

    if (endTime <= startTime) {
      setError(
        "End time must be later than start time."
      );
      return;
    }

    setSaving(true);
    setError("");

    const { error } = await supabase
      .from("subject_schedules")
      .insert({
        subject_id: subjectId,
        day_of_week: day,
        start_time: startTime,
        end_time: endTime,
        location:
          location.trim() || null,
      });

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    closeModal();
    setSaving(false);

    await reloadSchedules();
  }

  function openModal() {
    setError("");
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setDay(1);
    setStartTime("");
    setEndTime("");
    setLocation("");
    setError("");
  }

  if (loading) {
    return (
      <AppShell>
        <p className="text-sm text-muted-foreground">
          Loading subject...
        </p>
      </AppShell>
    );
  }

  if (!subject) {
    return (
      <AppShell>
        <div className="py-8">
          <p className="text-sm text-red-600">
            {error || "Subject not found."}
          </p>

          <Link
            href="/subjects"
            className="mt-4 inline-flex text-sm font-medium text-primary"
          >
            Back to subjects
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      {/* Back */}
      <Link
        href="/subjects"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ChevronLeft />
        Subjects
      </Link>

      {/* Header */}
      <header className="mt-5 flex flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          {subject.code && (
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-primary">
              {subject.code}
            </p>
          )}

          <h1
            className={`text-[28px] font-semibold tracking-[-0.045em] ${
              subject.code
                ? "mt-2"
                : ""
            }`}
          >
            {subject.name}
          </h1>

          {subject.instructor && (
            <p className="mt-2 text-sm text-muted-foreground">
              {subject.instructor}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={openModal}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-[10px] bg-[#173c2d] px-4 text-sm font-semibold text-white transition hover:bg-[#123326]"
        >
          <PlusIcon />
          New schedule
        </button>
      </header>

      {/* Schedule */}
      <section className="pt-8">
        <div className="flex items-baseline gap-3 border-b border-border pb-4">
          <h2 className="text-[19px] font-semibold tracking-[-0.03em]">
            Schedule
          </h2>

          {schedules.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {schedules.length}
            </span>
          )}
        </div>

        {error && !showModal && (
          <p className="mt-4 text-sm text-red-600">
            {error}
          </p>
        )}

        {schedules.length === 0 ? (
          <div className="flex min-h-[280px] items-center justify-center">
            <div className="text-center">
              <CalendarIcon />

              <h3 className="mt-4 text-[16px] font-semibold">
                No schedule yet
              </h3>

              <p className="mt-2 text-sm text-muted-foreground">
                Class times will appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {days.map(
              (dayItem) => {
                const daySchedules =
                  schedules.filter(
                    (schedule) =>
                      schedule.day_of_week ===
                      dayItem.value
                  );

                if (
                  daySchedules.length === 0
                ) {
                  return null;
                }

                return (
                  <div
                    key={dayItem.value}
                    className="grid gap-4 py-5 sm:grid-cols-[140px_1fr]"
                  >
                    <p className="text-sm font-semibold">
                      {dayItem.label}
                    </p>

                    <div className="space-y-4">
                      {daySchedules.map(
                        (schedule) => (
                          <div
                            key={
                              schedule.id
                            }
                            className="flex flex-col gap-1"
                          >
                            <p className="text-sm font-medium">
                              {formatTime(
                                schedule.start_time
                              )}

                              <span className="mx-2 text-muted-foreground">
                                –
                              </span>

                              {formatTime(
                                schedule.end_time
                              )}
                            </p>

                            {schedule.location && (
                              <p className="text-xs text-muted-foreground">
                                {
                                  schedule.location
                                }
                              </p>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}
      </section>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/35 px-4 backdrop-blur-[2px]"
          onMouseDown={closeModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-schedule-title"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
            className="w-full max-w-[500px] rounded-[20px] border border-border bg-white p-6 shadow-[0_30px_90px_rgba(0,0,0,0.18)] dark:bg-[#151b17]"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between gap-5">
              <h2
                id="create-schedule-title"
                className="text-[20px] font-semibold tracking-[-0.035em]"
              >
                Create schedule
              </h2>

              <button
                type="button"
                onClick={closeModal}
                className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                aria-label="Close"
              >
                <CloseIcon />
              </button>
            </div>

            <form
              onSubmit={createSchedule}
              className="mt-7"
            >
              {/* Day */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Day
                </label>

                <select
                  value={day}
                  onChange={(event) =>
                    setDay(
                      Number(
                        event.target.value
                      )
                    )
                  }
                  className="input-premium"
                >
                  {days.map(
                    (item) => (
                      <option
                        key={
                          item.value
                        }
                        value={
                          item.value
                        }
                      >
                        {
                          item.label
                        }
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* Time */}
              <div className="mt-5 grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Starts
                  </label>

                  <input
                    type="time"
                    value={startTime}
                    onChange={(
                      event
                    ) =>
                      setStartTime(
                        event.target.value
                      )
                    }
                    className="input-premium"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Ends
                  </label>

                  <input
                    type="time"
                    value={endTime}
                    onChange={(
                      event
                    ) =>
                      setEndTime(
                        event.target.value
                      )
                    }
                    className="input-premium"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="mt-5">
                <label className="mb-2 block text-sm font-medium">
                  Location
                </label>

                <input
                  value={location}
                  onChange={(event) =>
                    setLocation(
                      event.target.value
                    )
                  }
                  placeholder="Room 204"
                  className="input-premium"
                />
              </div>

              {error && (
                <p className="mt-4 text-sm text-red-600">
                  {error}
                </p>
              )}

              {/* Actions */}
              <div className="mt-7 flex justify-end gap-2 border-t border-border pt-5">
                <button
                  type="button"
                  onClick={closeModal}
                  className="h-10 rounded-[10px] px-4 text-sm font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    saving ||
                    !startTime ||
                    !endTime
                  }
                  className="h-10 rounded-[10px] bg-[#173c2d] px-5 text-sm font-semibold text-white transition hover:bg-[#123326] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Creating..."
                    : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function formatTime(time: string) {
  const [hours, minutes] =
    time.split(":");

  const hour = Number(hours);

  const suffix =
    hour >= 12 ? "PM" : "AM";

  const twelveHour =
    hour % 12 || 12;

  return `${twelveHour}:${minutes} ${suffix}`;
}

/* -------------------------------------------------------------------------- */
/* Icons                                                                      */
/* -------------------------------------------------------------------------- */

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function ChevronLeft() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#edf3ef] text-[#173c2d] dark:bg-[#173426] dark:text-[#8fc0a4]">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <rect
          x="3.5"
          y="5.5"
          width="17"
          height="15"
          rx="2.5"
        />

        <path d="M7.5 3.5v4" />
        <path d="M16.5 3.5v4" />
        <path d="M3.5 9.5h17" />
      </svg>
    </div>
  );
}