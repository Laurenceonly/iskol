"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import AppShell from "@/components/app-shell";
import { createClient } from "@/lib/supabase/client";

type Note = {
  id: string;
  title: string;
  updated_at: string;
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

type Subject = {
  id: string;
  name: string;
  code: string | null;
};

export default function NotesPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [notes, setNotes] = useState<Note[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [subjectId, setSubjectId] = useState("");

  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");

      const [
        { data: notesData, error: notesError },
        { data: subjectsData, error: subjectsError },
      ] = await Promise.all([
        supabase
          .from("notes")
          .select(`
            id,
            title,
            updated_at,
            subjects (
              id,
              name,
              code
            )
          `)
          .eq("status", "active")
          .order("updated_at", {
            ascending: false,
          }),

        supabase
          .from("subjects")
          .select(`
            id,
            name,
            code
          `)
          .eq("archived", false)
          .order("name", {
            ascending: true,
          }),
      ]);

      if (notesError) {
        setError(notesError.message);
      } else {
        setNotes((notesData as Note[]) ?? []);
      }

      if (!subjectsError) {
        setSubjects(subjectsData ?? []);
      }

      setLoading(false);
    }

    load();
  }, [supabase]);

  async function createNote(event: FormEvent) {
    event.preventDefault();

    if (!title.trim()) {
      return;
    }

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

    const { data, error } = await supabase
      .from("notes")
      .insert({
        user_id: user.id,
        subject_id: subjectId || null,
        title: title.trim(),
        content: "",
        status: "active",
      })
      .select("id")
      .single();

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    closeModal();

    router.push(`/notes/${data.id}`);
  }

  function openModal() {
    setError("");
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setTitle("");
    setSubjectId("");
    setError("");
  }

  return (
    <AppShell>
      {/* Header */}
      <header className="flex items-center justify-between gap-5 border-b border-border pb-6">
        <div className="flex items-baseline gap-3">
          <h1 className="text-[26px] font-semibold tracking-[-0.04em]">
            Notes
          </h1>

          {!loading && notes.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {notes.length}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={openModal}
          className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-[#173c2d] px-4 text-sm font-semibold text-white transition hover:bg-[#123326]"
        >
          <PlusIcon />
          New note
        </button>
      </header>

      {/* Notes */}
      <section className="pt-8">
        {loading ? (
          <p className="text-sm text-muted-foreground">
            Loading notes...
          </p>
        ) : error && notes.length === 0 ? (
          <p className="text-sm text-red-600">
            {error}
          </p>
        ) : notes.length === 0 ? (
          <EmptyNotes />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
              />
            ))}
          </div>
        )}
      </section>

      {/* New Note Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/35 px-4 backdrop-blur-[2px]"
          onMouseDown={closeModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-note-title"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
            className="w-full max-w-[500px] rounded-[20px] border border-border bg-white p-6 shadow-[0_30px_90px_rgba(0,0,0,0.18)] dark:bg-[#151b17]"
          >
            {/* Modal header */}
            <div className="flex items-center justify-between gap-5">
              <h2
                id="create-note-title"
                className="text-[20px] font-semibold tracking-[-0.035em]"
              >
                Create note
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
              onSubmit={createNote}
              className="mt-7"
            >
              {/* Title */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Title
                </label>

                <input
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  placeholder="Lecture notes"
                  autoFocus
                  className="input-premium"
                />
              </div>

              {/* Subject */}
              <div className="mt-5">
                <label className="mb-2 block text-sm font-medium">
                  Subject
                </label>

                <select
                  value={subjectId}
                  onChange={(event) =>
                    setSubjectId(event.target.value)
                  }
                  className="input-premium"
                >
                  <option value="">
                    No subject
                  </option>

                  {subjects.map((subject) => (
                    <option
                      key={subject.id}
                      value={subject.id}
                    >
                      {subject.code
                        ? `${subject.code} — ${subject.name}`
                        : subject.name}
                    </option>
                  ))}
                </select>
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
                    !title.trim()
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
/* NOTE CARD                                                                  */
/* -------------------------------------------------------------------------- */

function NoteCard({
  note,
}: {
  note: Note;
}) {
  const subject = getSubject(note);

  return (
    <Link
      href={`/notes/${note.id}`}
      className="group flex min-h-[180px] flex-col rounded-[16px] border border-border bg-white p-5 transition-all duration-200 hover:-translate-y-[1px] hover:border-[#173c2d]/25 hover:shadow-[0_10px_35px_rgba(20,40,28,0.06)] dark:bg-card"
    >
      <div className="flex items-start justify-between gap-5">
        <div className="min-w-0">
          {subject && (
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-primary">
              {subject.code || subject.name}
            </p>
          )}

          <h2
            className={`line-clamp-2 text-[17px] font-semibold leading-6 tracking-[-0.03em] ${
              subject ? "mt-2" : ""
            }`}
          >
            {note.title}
          </h2>
        </div>

        <ArrowIcon className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
      </div>

      <div className="mt-auto pt-8">
        <p className="text-sm text-muted-foreground">
          Updated {formatDate(note.updated_at)}
        </p>
      </div>
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/* EMPTY STATE                                                                */
/* -------------------------------------------------------------------------- */

function EmptyNotes() {
  return (
    <div className="flex min-h-[340px] items-center justify-center">
      <div className="text-center">
        <NoteIcon />

        <h2 className="mt-4 text-[16px] font-semibold">
          No notes yet
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          Your notes will appear here.
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

function getSubject(note: Note) {
  if (!note.subjects) {
    return null;
  }

  return Array.isArray(note.subjects)
    ? note.subjects[0]
    : note.subjects;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  ).format(new Date(date));
}

/* -------------------------------------------------------------------------- */
/* ICONS                                                                      */
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

function NoteIcon() {
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
        <path d="M6.5 3.5h8L18.5 7v13.5h-12V3.5Z" />
        <path d="M14.5 3.5V7h4" />
        <path d="M9.5 11h6" />
        <path d="M9.5 15h6" />
      </svg>
    </div>
  );
}