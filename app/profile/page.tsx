"use client";

import { FormEvent, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import AppShell from "@/components/app-shell";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  display_name: string;
  full_name: string | null;
  school_name: string | null;
  age_range: string | null;
  theme_preference: "system" | "light" | "dark";
};

export default function ProfilePage() {
  const supabase = createClient();
  const { setTheme } = useTheme();

  const [displayName, setDisplayName] = useState("");
  const [fullName, setFullName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [themePreference, setThemePreference] =
    useState<"system" | "light" | "dark">("system");

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    setEmail(user.email ?? "");

    const { data } = await supabase
      .from("profiles")
      .select(
        "display_name, full_name, school_name, age_range, theme_preference"
      )
      .eq("id", user.id)
      .single();

    if (data) {
      const profile = data as Profile;

      setDisplayName(profile.display_name ?? "");
      setFullName(profile.full_name ?? "");
      setSchoolName(profile.school_name ?? "");
      setAgeRange(profile.age_range ?? "");
      setThemePreference(profile.theme_preference ?? "system");

      setTheme(profile.theme_preference ?? "system");
    }

    setLoading(false);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();

    if (!displayName.trim()) return;

    setSaving(true);
    setSaved(false);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName.trim(),
        full_name: fullName.trim() || null,
        school_name: schoolName.trim() || null,
        age_range: ageRange || null,
        theme_preference: themePreference,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    setTheme(themePreference);

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 1800);
  }

  function handleThemeChange(
    value: "system" | "light" | "dark"
  ) {
    setThemePreference(value);
    setTheme(value);
  }

  if (loading) {
    return (
      <AppShell>
        <div className="flex min-h-[70vh] items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Loading profile...
          </p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <header className="flex items-center justify-between">
  <h1 className="text-[26px] font-semibold tracking-[-0.04em]">
    Profile
  </h1>
</header>

      <form
        onSubmit={handleSave}
        className="mt-10 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]"
      >
        {/* Main profile settings */}
        <section className="surface overflow-hidden">
          <div className="border-b border-border px-5 py-4 sm:px-6">
            <h2 className="section-title">
              Profile details
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Your codename is what appears inside ISKOL.
            </p>
          </div>

          <div className="space-y-6 p-5 sm:p-6">
            <Field
              label="Codename"
              description="Shown throughout your ISKOL workspace."
            >
              <input
                value={displayName}
                onChange={(e) =>
                  setDisplayName(e.target.value)
                }
                placeholder="Your codename"
                className="input-premium"
                required
              />
            </Field>

            <Field
              label="Full name"
              description="Optional. This does not need to appear publicly."
            >
              <input
                value={fullName}
                onChange={(e) =>
                  setFullName(e.target.value)
                }
                placeholder="Optional"
                className="input-premium"
              />
            </Field>

            <Field
              label="School"
              description="Optional."
            >
              <input
                value={schoolName}
                onChange={(e) =>
                  setSchoolName(e.target.value)
                }
                placeholder="School or university"
                className="input-premium"
              />
            </Field>

            <Field
              label="Age range"
              description="Optional."
            >
              <select
                value={ageRange}
                onChange={(e) =>
                  setAgeRange(e.target.value)
                }
                className="input-premium"
              >
                <option value="">
                  Prefer not to say
                </option>
                <option value="Under 16">
                  Under 16
                </option>
                <option value="16–18">
                  16–18
                </option>
                <option value="19–22">
                  19–22
                </option>
                <option value="23+">
                  23+
                </option>
              </select>
            </Field>
          </div>
        </section>

        {/* Right column */}
        <aside className="space-y-6">
          {/* Account */}
          <section className="surface p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Account
            </p>

            <div className="mt-5">
              <p className="text-xs text-muted-foreground">
                Email
              </p>

              <p className="mt-1 break-all text-sm font-medium">
                {email || "No email available"}
              </p>
            </div>

            <p className="mt-4 text-xs leading-5 text-muted-foreground">
              Your email is used for sign-in, verification,
              and account recovery.
            </p>
          </section>

          {/* Appearance */}
          <section className="surface overflow-hidden">
            <div className="border-b border-border px-5 py-4">
              <h2 className="section-title">
                Appearance
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Choose how ISKOL looks on this device.
              </p>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-3 rounded-xl border border-border bg-secondary/45 p-1">
                <ThemeButton
                  label="System"
                  value="system"
                  current={themePreference}
                  onClick={handleThemeChange}
                />

                <ThemeButton
                  label="Light"
                  value="light"
                  current={themePreference}
                  onClick={handleThemeChange}
                />

                <ThemeButton
                  label="Dark"
                  value="dark"
                  current={themePreference}
                  onClick={handleThemeChange}
                />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-border bg-[#f7f8f5] p-4">
                  <div className="h-2 w-16 rounded-full bg-[#1f4d3a]" />
                  <div className="mt-3 h-2 w-24 rounded-full bg-[#dfe5e0]" />
                  <div className="mt-2 h-2 w-20 rounded-full bg-[#e8ece9]" />

                  <p className="mt-5 text-xs font-medium text-[#182019]">
                    Light
                  </p>
                </div>

                <div className="rounded-xl border border-[#29322c] bg-[#0f1411] p-4">
                  <div className="h-2 w-16 rounded-full bg-[#5e9d78]" />
                  <div className="mt-3 h-2 w-24 rounded-full bg-[#263029]" />
                  <div className="mt-2 h-2 w-20 rounded-full bg-[#202821]" />

                  <p className="mt-5 text-xs font-medium text-[#f4f6f4]">
                    Dark
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Privacy */}
          <section className="rounded-[var(--radius)] border border-primary/15 bg-accent p-6">
            <p className="text-sm font-semibold text-accent-foreground">
              Privacy-first by design
            </p>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Your notes, schedules, and study content are
              part of your private workspace.
            </p>
          </section>
        </aside>

        {/* Save bar */}
        <div className="xl:col-span-2">
          <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-end">
            {saved && (
              <p className="text-sm font-medium text-primary">
                Changes saved.
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="btn-primary min-w-[130px]"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>
      </form>
    </AppShell>
  );
}

function Field({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-3 lg:grid-cols-[190px_1fr] lg:items-start">
      <div>
        <p className="text-sm font-medium">
          {label}
        </p>

        {description && (
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      <div>
        {children}
      </div>
    </div>
  );
}

function ThemeButton({
  label,
  value,
  current,
  onClick,
}: {
  label: string;
  value: "system" | "light" | "dark";
  current: "system" | "light" | "dark";
  onClick: (
    value: "system" | "light" | "dark"
  ) => void;
}) {
  const active = current === value;

  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      className={`rounded-lg px-3 py-2.5 text-sm font-medium transition ${
        active
          ? "bg-card text-primary shadow-sm"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}