"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Subject = {
  id: string;
  name: string;
  code: string | null;
  instructor: string | null;
};

export default function SubjectsPage() {
  const supabase = createClient();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [instructor, setInstructor] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadSubjects();
  }, []);

  async function loadSubjects() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/auth/login";
      return;
    }

    const { data, error } = await supabase
      .from("subjects")
      .select("id, name, code, instructor")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setSubjects(data);
    }
  }

  async function handleAddSubject(e: React.FormEvent) {
    e.preventDefault();

    setMessage("");
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/auth/login";
      return;
    }

    const { error } = await supabase.from("subjects").insert({
      user_id: user.id,
      name,
      code: code || null,
      instructor: instructor || null,
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setName("");
    setCode("");
    setInstructor("");
    setMessage("Subject added.");

    await loadSubjects();
  }

  return (
    <main className="min-h-screen bg-[#f5f6f3] px-5 py-8 text-[#181a18]">
      <div className="mx-auto max-w-5xl">
        <header>
          <Link
            href="/dashboard"
            className="text-sm text-[#7b807a] hover:text-[#176b52]"
          >
            ← Dashboard
          </Link>

          <h1 className="mt-4 text-3xl font-medium tracking-[-0.035em]">
            Subjects
          </h1>
        </header>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* Subject list */}
          <section>
            {subjects.length === 0 ? (
              <div className="rounded-[14px] border border-dashed border-[#d9dcd7] bg-white px-6 py-16 text-center">
                <p className="text-sm font-medium">No subjects yet</p>

                <p className="mt-1 text-sm text-[#898d88]">
                  Add your first subject.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {subjects.map((subject) => (
                  <Link
                    key={subject.id}
                    href={`/subjects/${subject.id}`}
                    className="block rounded-[12px] border border-[#e2e4e0] bg-white p-5 transition hover:border-[#cfd5cf]"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="font-medium">
                          {subject.name}
                        </h2>

                        {subject.code && (
                          <p className="mt-1 text-sm text-[#838783]">
                            {subject.code}
                          </p>
                        )}
                      </div>

                      <span className="text-sm text-[#a0a49f]">
                        →
                      </span>
                    </div>

                    {subject.instructor && (
                      <p className="mt-4 text-sm text-[#727772]">
                        {subject.instructor}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Add subject */}
          <aside>
            <div className="rounded-[14px] border border-[#e2e4e0] bg-white p-6">
              <h2 className="text-lg font-medium">
                Add subject
              </h2>

              <form
                onSubmit={handleAddSubject}
                className="mt-6 space-y-4"
              >
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Subject name
                  </label>

                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Microbiology"
                    className="h-11 w-full rounded-[9px] border border-[#dedfdd] px-3.5 text-sm outline-none focus:border-[#176b52] focus:ring-2 focus:ring-[#176b52]/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Code
                  </label>

                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="MICRO101"
                    className="h-11 w-full rounded-[9px] border border-[#dedfdd] px-3.5 text-sm outline-none focus:border-[#176b52] focus:ring-2 focus:ring-[#176b52]/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Instructor
                  </label>

                  <input
                    type="text"
                    value={instructor}
                    onChange={(e) => setInstructor(e.target.value)}
                    placeholder="Dr. Santos"
                    className="h-11 w-full rounded-[9px] border border-[#dedfdd] px-3.5 text-sm outline-none focus:border-[#176b52] focus:ring-2 focus:ring-[#176b52]/10"
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
                  className="h-11 w-full rounded-[9px] bg-[#176b52] text-sm font-medium text-white hover:bg-[#125b45] disabled:opacity-50"
                >
                  {loading ? "Adding..." : "Add subject"}
                </button>
              </form>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}