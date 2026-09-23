"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AuthShell from "@/components/auth-shell";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();

    setMessage("");
    setLoading(true);

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

    if (error) {
      setLoading(false);
      setMessage(error.message);
      return;
    }

    const { data: profile, error: profileError } =
      await supabase
        .from("profiles")
        .select("is_admin, status")
        .eq("id", data.user.id)
        .single();

    setLoading(false);

    if (profileError) {
      setMessage("Unable to load your account.");
      return;
    }

    if (profile?.status === "suspended") {
      router.push("/auth/suspended");
      router.refresh();
      return;
    }

    if (profile?.is_admin) {
      router.push("/admin");
    } else {
      router.push("/dashboard");
    }

    router.refresh();
  }

  return (
    <AuthShell mode="login">
      <div>

        <h1 className="mt-3 text-[clamp(2.15rem,4vw,3.25rem)] font-semibold leading-[1] tracking-[-0.055em]">
          Continue your work.
        </h1>

        <p className="mt-4 text-[15px] leading-6 text-muted-foreground">
          Sign in to your ISKOL workspace.
        </p>

        <form
          onSubmit={handleLogin}
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
              autoComplete="email"
              required
              className="input-premium h-12"
            />
          </div>

          <div>
  <label className="mb-2 block text-xs font-medium text-muted-foreground">
    Password
  </label>

  <input
    type="password"
    value={password}
    onChange={(e) =>
      setPassword(e.target.value)
    }
    placeholder="Enter your password"
    autoComplete="current-password"
    required
    className="input-premium h-12"
  />

  <div className="mt-2 text-right">
    <Link
      href="/auth/forgot-password"
      className="text-xs font-medium text-primary transition-opacity hover:opacity-70"
    >
      Forgot password?
    </Link>
  </div>
</div>

          {message && (
            <div className="rounded-xl border border-red-500/15 bg-red-500/[0.05] px-4 py-3">
              <p className="text-sm text-red-600 dark:text-red-400">
                {message}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary h-12 w-full text-[15px]"
          >
            {loading
              ? "Signing in..."
              : "Continue"}
          </button>
        </form>

        <p className="mt-6 text-sm text-muted-foreground">
          New to ISKOL?{" "}
          <Link
            href="/auth/sign-up"
            className="font-medium text-foreground transition-colors hover:text-primary"
          >
            Create an account
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
