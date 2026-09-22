"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ProfilePage() {
  const supabase = createClient();

  const [displayName, setDisplayName] = useState("");
  const [fullName, setFullName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [theme, setTheme] = useState("system");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/auth/login";
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select(
        "display_name, full_name, school_name, age_range, theme_preference"
      )
      .eq("id", user.id)
      .single();

    if (!error && data) {
      setDisplayName(data.display_name ?? "");
      setFullName(data.full_name ?? "");
      setSchoolName(data.school_name ?? "");
      setAgeRange(data.age_range ?? "");
      setTheme(data.theme_preference ?? "system");
    }

    setLoading(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/auth/login";
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName,
        full_name: fullName || null,
        school_name: schoolName || null,
        age_range: ageRange || null,
        theme_preference: theme,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    setSaving(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Profile updated.");
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
        <Link
          href="/dashboard"
          className="text-sm text-[#777b76] hover:text-[#176b52]"
        >
          ← Dashboard
        </Link>

        <h1 className="mt-4 text-3xl font-medium tracking-[-0.035em]">
          Profile
        </h1>

        <form
          onSubmit={handleSave}
          className="mt-10 rounded-[14px] border border-[#e2e4e0] bg-white p-6"
        >
          <div className="space-y-5">

            <div>
              <label className="mb-2 block text-sm font-medium">
                Codename
              </label>

              <input
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="h-11 w-full rounded-[9px] border border-[#dedfdd] px-3.5 text-sm outline-none focus:border-[#176b52]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Full name
                <span className="ml-2 text-xs font-normal text-[#999d98]">
                  Optional
                </span>
              </label>

              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-11 w-full rounded-[9px] border border-[#dedfdd] px-3.5 text-sm outline-none focus:border-[#176b52]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                School
                <span className="ml-2 text-xs font-normal text-[#999d98]">
                  Optional
                </span>
              </label>

              <input
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="h-11 w-full rounded-[9px] border border-[#dedfdd] px-3.5 text-sm outline-none focus:border-[#176b52]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Age range
                <span className="ml-2 text-xs font-normal text-[#999d98]">
                  Optional
                </span>
              </label>

              <select
                value={ageRange}
                onChange={(e) => setAgeRange(e.target.value)}
                className="h-11 w-full rounded-[9px] border border-[#dedfdd] px-3 text-sm outline-none"
              >
                <option value="">Prefer not to say</option>
                <option value="Under 16">Under 16</option>
                <option value="16-18">16–18</option>
                <option value="19-22">19–22</option>
                <option value="23+">23+</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Theme
              </label>

              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="h-11 w-full rounded-[9px] border border-[#dedfdd] px-3 text-sm outline-none"
              >
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
          </div>

          {message && (
            <p className="mt-5 text-sm text-[#666b66]">
              {message}
            </p>
          )}

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="rounded-[9px] bg-[#176b52] px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}