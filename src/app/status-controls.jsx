// app/status-controls.jsx
"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { RefreshCw } from "lucide-react";

export default function StatusControls() {
  const router = useRouter();
  const [isPending, start] = useTransition();

  return (
    <button
      type="button"
      onClick={() => start(() => router.refresh())}
      className="inline-flex items-center gap-2 rounded-lg border border-[#e8e4db] bg-[#fdfaf5] px-3 py-1.5 text-sm text-[#5a4a3f] hover:bg-[#f4efe7]"
      disabled={isPending}
      aria-label="Refresh status"
    >
      <RefreshCw className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
      Refresh
    </button>
  );
}
