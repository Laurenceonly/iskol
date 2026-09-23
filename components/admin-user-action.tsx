"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminUserAction({
  userId,
  status,
}: {
  userId: string;
  status: string;
}) {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  async function handleStatusChange() {
    setLoading(true);

    const newStatus =
      status === "suspended" ? "active" : "suspended";

    const { error } = await supabase.rpc(
      "admin_set_user_status",
      {
        target_user_id: userId,
        new_status: newStatus,
      }
    );

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.refresh();
  }

  return (
    <button
      onClick={handleStatusChange}
      disabled={loading}
      className="text-sm font-medium text-[#176b52] disabled:opacity-50"
    >
      {loading
        ? "Updating..."
        : status === "suspended"
        ? "Reactivate"
        : "Suspend"}
    </button>
  );
}