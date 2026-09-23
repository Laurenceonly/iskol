"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import AppShell from "@/components/app-shell";
import { createClient } from "@/lib/supabase/client";

type Subject = {
  id: string;
  name: string;
  code: string | null;
  instructor: string | null;
  created_at: string;
};

export default function SubjectsPage() {
  const supabase = createClient();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [instructor, setInstructor] = useState("");

  const [error, setError] = useState("");

  useEffect(() => {
    loadSubjects();
  }, []);

  async function loadSubjects() {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("subjects")
      .select("id, name, code, instructor, created_at")
      .eq("archived", false)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      setError(error.message);
    } else {
      setSubjects(data ?? []);
    }

    setLoading(false);
  }

  async function handleCreate(event: FormEvent) {
    event.preventDefault();

    if (!name.trim()) return;

    setSaving(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You are not signed in.");
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("subjects")
      .insert({
        user_id: user.id,
        name: name.trim(),
        code: code.trim() || null,
        instructor: instructor.trim() || null,
      });

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    closeModal();
    setSaving(false);

    await loadSubjects();
  }

  function closeModal() {
    setShowModal(false);
    setName("");
    setCode("");
    setInstructor("");
    setError("");
  }

  return (
    <AppShell>
      {/* Header */}
      <header className="flex items-center justify-between gap-5 border-b border-border pb-6">
        <div className="flex items-baseline gap-3">
          <h1 className="text-[26px] font-semibold tracking-[-0.04em]">
            Subjects
          </h1>

          {!loading && subjects.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {subjects.length}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-[#173c2d] px-4 text-sm font-semibold text-white transition hover:bg-[#123326]"
        >
          <PlusIcon />
          New subject
        </button>
      </header>

      {/* Subjects */}
      <section className="pt-8">
        {loading ? (
          <p className="text-sm text-muted-foreground">
            Loading subjects...
          </p>
        ) : error && subjects.length === 0 ? (
          <p className="text-sm text-red-600">
            {error}
          </p>
        ) : subjects.length === 0 ? (
          <EmptySubjects />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {subjects.map((subject) => (
              <SubjectCard
                key={subject.id}
                subject={subject}
              />
            ))}
          </div>
        )}
      </section>

      {/* Create Subject Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/35 px-4 backdrop-blur-[2px]"
          onMouseDown={closeModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-subject-title"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
            className="w-full max-w-[520px] rounded-[20px] border border-border bg-white p-6 shadow-[0_30px_90px_rgba(0,0,0,0.18)] dark:bg-[#151b17]"
          >
            {/* Modal header */}
            <div className="flex items-start justify-between gap-5">
              <h2
                id="create-subject-title"
                className="text-[20px] font-semibold tracking-[-0.035em]"
              >
                Create subject
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

            {/* Form */}
            <form
              onSubmit={handleCreate}
              className="mt-7"
            >
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Subject name
                </label>

                <input
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="Microbiology"
                  autoFocus
                  className="input-premium"
                />
              </div>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Code
                  </label>

                  <input
                    value={code}
                    onChange={(event) =>
                      setCode(event.target.value)
                    }
                    placeholder="MICRO 101"
                    className="input-premium"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Instructor
                  </label>

                  <input
                    value={instructor}
                    onChange={(event) =>
                      setInstructor(event.target.value)
                    }
                    placeholder="Prof. Santos"
                    className="input-premium"
                  />
                </div>
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
                    saving || !name.trim()
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

function SubjectCard({
  subject,
}: {
  subject: Subject;
}) {
  return (
    <Link
      href={`/subjects/${subject.id}`}
      className="group flex min-h-[180px] flex-col rounded-[16px] border border-border bg-white p-5 transition-all duration-200 hover:-translate-y-[1px] hover:border-[#173c2d]/25 hover:shadow-[0_10px_35px_rgba(20,40,28,0.06)] dark:bg-card"
    >
      <div className="flex items-start justify-between gap-5">
        <div className="min-w-0">
          {subject.code && (
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-primary">
              {subject.code}
            </p>
          )}

          <h2
            className={`truncate text-[17px] font-semibold tracking-[-0.03em] ${
              subject.code ? "mt-2" : ""
            }`}
          >
            {subject.name}
          </h2>
        </div>

        <ArrowIcon className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
      </div>

      <div className="mt-auto pt-8">
        <p className="truncate text-sm text-muted-foreground">
          {subject.instructor ||
            "No instructor"}
        </p>
      </div>
    </Link>
  );
}

function EmptySubjects() {
  return (
    <div className="flex min-h-[340px] items-center justify-center">
      <div className="text-center">
        <BookIcon />

        <h2 className="mt-4 text-[16px] font-semibold">
          No subjects yet
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          Your subjects will appear here.
        </p>
      </div>
    </div>
  );
}

/* Icons */

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

function BookIcon() {
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
        <path d="M5 4.5h11.5A2.5 2.5 0 0 1 19 7v12.5H7.5A2.5 2.5 0 0 1 5 17V4.5Z" />
        <path d="M5 17a2.5 2.5 0 0 1 2.5-2.5H19" />
      </svg>
    </div>
  );
}