"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function NoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();

  const noteId = params.id as string;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadNote();
  }, [noteId]);

  async function loadNote() {
    const { data, error } = await supabase
      .from("notes")
      .select("title, content")
      .eq("id", noteId)
      .single();

    if (error || !data) {
      setMessage("Note not found.");
      setLoading(false);
      return;
    }

    setTitle(data.title);
    setContent(data.content);
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");

    const { error } = await supabase
      .from("notes")
      .update({
        title,
        content,
        updated_at: new Date().toISOString(),
      })
      .eq("id", noteId);

    setSaving(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Saved.");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f5f6f3] p-6">
        <p className="text-sm text-neutral-500">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f6f3] px-5 py-8 text-[#181a18]">
      <div className="mx-auto max-w-3xl">
        <button
          onClick={() => router.push("/notes")}
          className="text-sm text-[#777b76] hover:text-[#176b52]"
        >
          ← Notes
        </button>

        <div className="mt-8">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-transparent text-3xl font-medium tracking-[-0.035em] outline-none"
          />

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing..."
            className="mt-8 min-h-[500px] w-full resize-none bg-transparent text-[15px] leading-7 outline-none"
          />

          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-[#777b76]">
              {message}
            </p>

            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-[9px] bg-[#176b52] px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}