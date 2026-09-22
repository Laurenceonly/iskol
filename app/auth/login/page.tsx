"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
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
                Welcome back.
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
                Sign in
              </h2>

              <form onSubmit={handleLogin} className="mt-8 space-y-5">

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
                    className="h-11 w-full rounded-[9px] border border-[#dedfdd] bg-white px-3.5 text-sm outline-none transition focus:border-[#176b52] focus:ring-2 focus:ring-[#176b52]/10"
                  />
                </div>

                <div>
  <label className="mb-2 block text-sm font-medium text-[#2a2d2a]">
    Password
  </label>

  <input
    type="password"
    required
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    placeholder="Your password"
    className="h-11 w-full rounded-[9px] border border-[#dedfdd] bg-white px-3.5 text-sm outline-none transition focus:border-[#176b52] focus:ring-2 focus:ring-[#176b52]/10"
  />

  <div className="mt-2 text-right">
    <a
      href="/auth/forgot-password"
      className="text-xs font-medium text-[#176b52] hover:underline"
    >
      Forgot password?
    </a>
  </div>
</div>

                {message && (
                  <p className="text-sm text-[#666b66]">
                    {message}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="h-11 w-full rounded-[9px] bg-[#176b52] text-sm font-medium text-white transition hover:bg-[#125b45] disabled:opacity-50"
                >
                  {loading ? "Signing in..." : "Sign in"}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-[#777b76]">
                No account yet?{" "}
                <a
                  href="/auth/sign-up"
                  className="font-medium text-[#202320] hover:underline"
                >
                  Create one
                </a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}