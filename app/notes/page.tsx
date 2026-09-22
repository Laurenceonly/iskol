"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Note = {
  id: string;
  title: string;
  content: string;
  status: string;
  created_at: string;
};

export default function NotesPage() {
  const supabase = createClient();

  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadNotes();
  }, []);

  async function loadNotes() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/auth/login";
      return;
    }

    const { data, error } = await supabase
      .from("notes")
      .select("id, title, content, status, created_at")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setNotes(data);
    }
  }

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/auth/login";
      return;
    }

    const { error } = await supabase.from("notes").insert({
      user_id: user.id,
      title,
      content,
      status: "active",
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setTitle("");
    setContent("");
    setMessage("Note saved.");

    await loadNotes();
  }

  return (
    <main className="min-h-screen bg-[#f5f6f3] px-5 py-8 text-[#181a18]">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/dashboard"
          className="text-sm text-[#777b76] hover:text-[#176b52]"
        >
          ← Dashboard
        </Link>

        <h1 className="mt-4 text-3xl font-medium tracking-[-0.035em]">
          Notes
        </h1>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* Notes list */}
          <section>
            {notes.length === 0 ? (
              <div className="rounded-[14px] border border-dashed border-[#d9dcd7] bg-white px-6 py-16 text-center">
                <p className="text-sm font-medium">
                  No notes yet
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {notes.map((note) => (
                  <Link
                    key={note.id}
                    href={`/notes/${note.id}`}
                    className="block rounded-[12px] border border-[#e2e4e0] bg-white p-5 transition hover:border-[#cfd5cf]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h2 className="font-medium">
                          {note.title}
                        </h2>

                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#717671]">
                          {note.content}
                        </p>
                      </div>

                      <span className="shrink-0 text-sm text-[#a0a49f]">
                        →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* New note */}
          <aside>
            <div className="rounded-[14px] border border-[#e2e4e0] bg-white p-6">
              <h2 className="text-lg font-medium">
                New note
              </h2>

              <form
                onSubmit={handleAddNote}
                className="mt-6 space-y-4"
              >
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Title
                  </label>

                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Lecture notes"
                    className="h-11 w-full rounded-[9px] border border-[#dedfdd] px-3.5 text-sm outline-none focus:border-[#176b52]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Note
                  </label>

                  <textarea
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={8}
                    placeholder="Start writing..."
                    className="w-full resize-none rounded-[9px] border border-[#dedfdd] p-3.5 text-sm outline-none focus:border-[#176b52]"
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
                  {loading ? "Saving..." : "Save note"}
                </button>
              </form>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}