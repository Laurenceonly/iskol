"use client";

import Link from "next/link";
import {
  Suspense,
  useEffect,
  useState,
} from "react";
import { useParams } from "next/navigation";

import AppShell from "@/components/app-shell";
import { createClient } from "@/lib/supabase/client";

type Note = {
  id: string;
  title: string;
  content: string;
  subject_id: string | null;
  updated_at: string;
};

type Subject = {
  id: string;
  name: string;
  code: string | null;
};

export default function NotePage() {
  return (
    <Suspense
      fallback={
        <AppShell>
          <p className="text-sm text-muted-foreground">
            Loading note...
          </p>
        </AppShell>
      }
    >
      <NotePageContent />
    </Suspense>
  );
}

function NotePageContent() {
  const params = useParams();
  const noteId = params.id as string;

  const [supabase] = useState(() => createClient());

  const [note, setNote] =
    useState<Note | null>(null);

  const [subjects, setSubjects] =
    useState<Subject[]>([]);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [subjectId, setSubjectId] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");

      const [
        { data: noteData, error: noteError },
        { data: subjectData },
      ] = await Promise.all([
        supabase
          .from("notes")
          .select(`
            id,
            title,
            content,
            subject_id,
            updated_at
          `)
          .eq("id", noteId)
          .single(),

        supabase
          .from("subjects")
          .select(`
            id,
            name,
            code
          `)
          .eq("archived", false)
          .order("name"),
      ]);

      if (noteError) {
        setError(noteError.message);
        setLoading(false);
        return;
      }

      setNote(noteData);

      setTitle(noteData.title);
      setContent(noteData.content ?? "");
      setSubjectId(noteData.subject_id ?? "");

      setSubjects(subjectData ?? []);

      setLoading(false);
    }

    load();
  }, [noteId, supabase]);

  function markChanged() {
    setSaved(false);
  }

  async function saveNote() {
    if (!title.trim()) {
      setError("A title is required.");
      return;
    }

    setSaving(true);
    setError("");
    setSaved(false);

    const now = new Date().toISOString();

    const { error } = await supabase
      .from("notes")
      .update({
        title: title.trim(),
        content,
        subject_id: subjectId || null,
        updated_at: now,
      })
      .eq("id", noteId);

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    setNote((current) =>
      current
        ? {
            ...current,
            title: title.trim(),
            content,
            subject_id: subjectId || null,
            updated_at: now,
          }
        : current
    );

    setSaving(false);
    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 2000);
  }

  if (loading) {
    return (
      <AppShell>
        <p className="text-sm text-muted-foreground">
          Loading note...
        </p>
      </AppShell>
    );
  }

  if (!note) {
    return (
      <AppShell>
        <div className="py-8">
          <p className="text-sm text-red-600">
            {error || "Note not found."}
          </p>

          <Link
            href="/notes"
            className="mt-4 inline-flex text-sm font-medium text-primary"
          >
            Back to notes
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-[960px]">
        {/* Toolbar */}
        <header className="flex items-center justify-between gap-4 border-b border-border pb-5">
          <Link
            href="/notes"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <ChevronLeft />
            Notes
          </Link>

          <div className="flex items-center gap-3">
            {saved && (
              <span className="text-xs text-muted-foreground">
                Saved
              </span>
            )}

            <button
              type="button"
              onClick={saveNote}
              disabled={
                saving || !title.trim()
              }
              className="h-9 rounded-[9px] bg-[#173c2d] px-4 text-sm font-semibold text-white transition hover:bg-[#123326] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </header>

        {/* Note */}
        <article className="pt-8">
          {/* Title */}
          <input
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              markChanged();
            }}
            placeholder="Untitled"
            className="w-full border-none bg-transparent p-0 text-[32px] font-semibold tracking-[-0.045em] text-foreground outline-none placeholder:text-muted-foreground/40 md:text-[38px]"
          />

          {/* Subject */}
          <div className="mt-5 flex items-center gap-3 border-b border-border pb-6">
            <span className="text-xs font-medium text-muted-foreground">
              Subject
            </span>

            <select
              value={subjectId}
              onChange={(event) => {
                setSubjectId(event.target.value);
                markChanged();
              }}
              className="max-w-[260px] border-none bg-transparent text-sm font-medium text-foreground outline-none"
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
            <p className="mt-5 text-sm text-red-600">
              {error}
            </p>
          )}

          {/* Editor */}
          <textarea
            value={content}
            onChange={(event) => {
              setContent(event.target.value);
              markChanged();
            }}
            placeholder="Start writing..."
            className="mt-8 min-h-[60vh] w-full resize-none border-none bg-transparent p-0 text-[16px] leading-8 text-foreground outline-none placeholder:text-muted-foreground/40"
          />
        </article>
      </div>
    </AppShell>
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