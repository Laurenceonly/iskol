"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const supabase = createClient();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    router.push("/auth/login");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#f3f4f1] px-4 py-8 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center">
        <div className="w-full rounded-[20px] border border-[#e3e5e1] bg-white p-8 shadow-[0_12px_40px_rgba(0,0,0,0.06)]">

          <p className="text-lg font-semibold tracking-[-0.02em]">
            ISKOL
          </p>

          <h1 className="mt-10 text-3xl font-medium tracking-[-0.035em] text-[#161816]">
            Set new password
          </h1>

          <form onSubmit={handleReset} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#2a2d2a]">
                New password
              </label>

              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="h-11 w-full rounded-[9px] border border-[#dedfdd] px-3.5 text-sm outline-none transition focus:border-[#176b52] focus:ring-2 focus:ring-[#176b52]/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#2a2d2a]">
                Confirm password
              </label>

              <input
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your password"
                className="h-11 w-full rounded-[9px] border border-[#dedfdd] px-3.5 text-sm outline-none transition focus:border-[#176b52] focus:ring-2 focus:ring-[#176b52]/10"
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
              className="h-11 w-full rounded-[9px] bg-[#176b52] text-sm font-medium text-white transition hover:bg-[#125b45] disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update password"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}