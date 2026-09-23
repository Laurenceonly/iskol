"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import AuthShell from "@/components/auth-shell";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setMessage("");

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error } =
      await supabase.auth.updateUser({
        password,
      });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setSuccess(true);
  }

  return (
    <AuthShell mode="recovery">
      {success ? (
        <div>
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-lg font-semibold text-primary">
            ✓
          </div>

          <h1 className="mt-5 text-3xl font-semibold tracking-[-0.05em]">
            Password updated.
          </h1>

          <p className="mt-4 text-[15px] leading-7 text-muted-foreground">
            Your new password is ready to use.
          </p>

          <Link
            href="/auth/login"
            className="btn-primary mt-7"
          >
            Continue to sign in
          </Link>
        </div>
      ) : (
        <div>
          <p className="text-sm font-medium text-primary">
            New password
          </p>

          <h1 className="mt-3 text-[clamp(2.1rem,4vw,3.2rem)] font-semibold leading-none tracking-[-0.055em]">
            Choose something secure.
          </h1>

          <p className="mt-4 text-[15px] leading-6 text-muted-foreground">
            Enter your new ISKOL password.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-5"
          >
            <div>
              <label className="mb-2 block text-xs font-medium text-muted-foreground">
                New password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                minLength={6}
                required
                className="input-premium h-12"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-muted-foreground">
                Confirm password
              </label>

              <input
                type="password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                minLength={6}
                required
                className="input-premium h-12"
              />
            </div>

            {message && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary h-12 w-full"
            >
              {loading
                ? "Updating..."
                : "Update password"}
            </button>
          </form>
        </div>
      )}
    </AuthShell>
  );
}