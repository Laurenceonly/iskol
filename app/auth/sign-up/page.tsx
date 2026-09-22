"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SignUpPage() {
  const supabase = createClient();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (!termsAccepted || !privacyAccepted) {
      setMessage("Please accept the Terms and Privacy Notice.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
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

    setMessage("Check your email to verify your account.");
  }

  return (
    <main className="min-h-screen bg-[#f3f4f1] px-4 py-8 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center">
        <div className="grid w-full overflow-hidden rounded-[20px] border border-[#e3e5e1] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.06)] lg:grid-cols-2">

          {/* Left */}
          <section className="hidden min-h-[640px] bg-[#eef3ef] p-10 lg:flex lg:flex-col">
            <p className="text-lg font-semibold tracking-[-0.02em] text-[#161816]">
              ISKOL
            </p>

            <div className="my-auto">
              <h1 className="max-w-sm text-[42px] font-medium leading-[1.08] tracking-[-0.04em] text-[#161816]">
                Your semester,
                <br />
                organized.
              </h1>

              <div className="mt-10 rounded-[14px] border border-[#dfe3df] bg-white p-5">
                <div className="flex items-center justify-between border-b border-[#eceeeb] pb-4">
                  <div>
                    <p className="text-xs text-[#929690]">Next class</p>
                    <p className="mt-1 text-sm font-medium text-[#1d201d]">
                      Microbiology
                    </p>
                  </div>

                  <p className="text-sm text-[#666b66]">2:00 PM</p>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div>
                    <p className="text-xs text-[#929690]">Due tomorrow</p>
                    <p className="mt-1 text-sm font-medium text-[#1d201d]">
                      Laboratory Report
                    </p>
                  </div>

                  <span className="h-2 w-2 rounded-full bg-[#176b52]" />
                </div>
              </div>
            </div>
          </section>

          {/* Right */}
          <section className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-12">
            <div className="w-full max-w-sm">

              <div className="mb-8 lg:hidden">
                <p className="text-lg font-semibold tracking-[-0.02em]">
                  ISKOL
                </p>
              </div>

              <h2 className="text-3xl font-medium tracking-[-0.035em] text-[#161816]">
                Create your account
              </h2>

              <form onSubmit={handleSignUp} className="mt-8 space-y-5">

                {/* Codename */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#2a2d2a]">
                    Codename
                  </label>

                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="NightOwl27"
                    className="h-11 w-full rounded-[9px] border border-[#dedfdd] bg-white px-3.5 text-sm text-[#171917] outline-none transition placeholder:text-[#aaa] focus:border-[#176b52] focus:ring-2 focus:ring-[#176b52]/10"
                  />

                  <p className="mt-2 text-xs text-[#999d98]">
                    Shown inside ISKOL.
                  </p>
                </div>

                {/* Email */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#2a2d2a]">
                    Email
                  </label>

                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="h-11 w-full rounded-[9px] border border-[#dedfdd] bg-white px-3.5 text-sm text-[#171917] outline-none transition placeholder:text-[#aaa] focus:border-[#176b52] focus:ring-2 focus:ring-[#176b52]/10"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#2a2d2a]">
                    Password
                  </label>

                  <input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="h-11 w-full rounded-[9px] border border-[#dedfdd] bg-white px-3.5 text-sm text-[#171917] outline-none transition placeholder:text-[#aaa] focus:border-[#176b52] focus:ring-2 focus:ring-[#176b52]/10"
                  />
                </div>

                {/* Agreements */}
                <div className="space-y-3 pt-1">
                  <label className="flex cursor-pointer items-center gap-3 text-sm text-[#666b66]">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="h-4 w-4 accent-[#176b52]"
                    />

                    <span>
                      I agree to the{" "}
                      <button
                        type="button"
                        className="font-medium text-[#232623] underline underline-offset-4"
                      >
                        Terms of Use
                      </button>
                    </span>
                  </label>

                  <label className="flex cursor-pointer items-center gap-3 text-sm text-[#666b66]">
                    <input
                      type="checkbox"
                      checked={privacyAccepted}
                      onChange={(e) => setPrivacyAccepted(e.target.checked)}
                      className="h-4 w-4 accent-[#176b52]"
                    />

                    <span>
                      I have read the{" "}
                      <button
                        type="button"
                        className="font-medium text-[#232623] underline underline-offset-4"
                      >
                        Privacy Notice
                      </button>
                    </span>
                  </label>
                </div>

                {/* Message */}
                {message && (
                  <p className="text-sm text-[#666b66]">
                    {message}
                  </p>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="h-11 w-full rounded-[9px] bg-[#176b52] text-sm font-medium text-white transition hover:bg-[#125b45] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Creating account..." : "Create account"}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-[#777b76]">
                Already have an account?{" "}
                <a
                  href="/auth/login"
                  className="font-medium text-[#202320] hover:underline"
                >
                  Sign in
                </a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}