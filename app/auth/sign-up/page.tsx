"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AuthShell from "@/components/auth-shell";

export default function SignUpPage() {
  const router = useRouter();
  const supabase = createClient();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignUp(e: FormEvent) {
    e.preventDefault();

    setMessage("");

    if (!acceptedTerms || !acceptedPrivacy) {
      setMessage(
        "Please accept the Terms of Use and Privacy Notice."
      );
      return;
    }

    if (!displayName.trim()) {
      setMessage("Please enter a codename.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirmed`,
        data: {
          display_name: displayName.trim(),
          terms_version: "1.0",
          privacy_notice_version: "1.0",
          terms_accepted_at: new Date().toISOString(),
          privacy_acknowledged_at: new Date().toISOString(),
        },
      },
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    if (data.user && !data.session) {
      router.push("/auth/check-email");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <AuthShell mode="signup">
      <div>


        <h1 className="mt-3 text-[clamp(2.15rem,4vw,3.25rem)] font-semibold leading-[1] tracking-[-0.055em]">
          Create your space.
        </h1>

        <p className="mt-4 text-[15px] leading-6 text-muted-foreground">
          Set up your ISKOL workspace.
        </p>

        <form
          onSubmit={handleSignUp}
          className="mt-7 space-y-4"
        >
          <div>
            <label className="mb-2 block text-xs font-medium text-muted-foreground">
              Codename
            </label>

            <input
              value={displayName}
              onChange={(e) =>
                setDisplayName(e.target.value)
              }
              placeholder="StudyFox"
              autoComplete="nickname"
              required
              className="input-premium h-11"
            />

            <p className="mt-1.5 text-[11px] text-muted-foreground">
              This is the name shown inside ISKOL.
            </p>
          </div>

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
              className="input-premium h-11"
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
              placeholder="Create a password"
              autoComplete="new-password"
              minLength={6}
              required
              className="input-premium h-11"
            />
          </div>

          <div className="space-y-2.5 pt-1">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) =>
                  setAcceptedTerms(e.target.checked)
                }
                className="mt-0.5 h-4 w-4 accent-[#1f4d3a]"
              />

              <span className="text-xs leading-5 text-muted-foreground">
                I agree to the{" "}
                <span className="font-medium text-foreground">
                  Terms of Use
                </span>
                .
              </span>
            </label>

            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={acceptedPrivacy}
                onChange={(e) =>
                  setAcceptedPrivacy(e.target.checked)
                }
                className="mt-0.5 h-4 w-4 accent-[#1f4d3a]"
              />

              <span className="text-xs leading-5 text-muted-foreground">
                I acknowledge the{" "}
                <span className="font-medium text-foreground">
                  Privacy Notice
                </span>
                .
              </span>
            </label>
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
            className="btn-primary h-12 w-full"
          >
            {loading
              ? "Creating..."
              : "Create account"}
          </button>
        </form>

        <p className="mt-5 text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="font-medium text-foreground transition-colors hover:text-primary"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
