"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import AuthShell from "@/components/auth-shell";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    const { error } =
      await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        }
      );

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setSent(true);
  }

  return (
    <AuthShell mode="recovery">
      {sent ? (
        <div>
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-lg font-semibold text-primary">
            ✓
          </div>

          <h1 className="mt-5 text-3xl font-semibold tracking-[-0.05em]">
            Check your inbox.
          </h1>

          <p className="mt-4 text-[15px] leading-7 text-muted-foreground">
            We sent a password reset link to{" "}
            <span className="font-medium text-foreground">
              {email}
            </span>
            .
          </p>

          <Link
            href="/auth/login"
            className="btn-secondary mt-7"
          >
            Back to sign in
          </Link>
        </div>
      ) : (
        <div>
          <p className="text-sm font-medium text-primary">
            Password recovery
          </p>

          <h1 className="mt-3 text-[clamp(2.1rem,4vw,3.2rem)] font-semibold leading-none tracking-[-0.055em]">
            Reset your password.
          </h1>

          <p className="mt-4 text-[15px] leading-6 text-muted-foreground">
            Enter the email connected to your ISKOL account.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-5"
          >
            <div>
              <label className="mb-2 block text-xs font-medium text-muted-foreground">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="you@example.com"
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
                ? "Sending..."
                : "Send reset link"}
            </button>
          </form>

          <Link
            href="/auth/login"
            className="mt-5 inline-block text-sm font-medium text-muted-foreground hover:text-primary"
          >
            ← Back to sign in
          </Link>
        </div>
      )}
    </AuthShell>
  );
}