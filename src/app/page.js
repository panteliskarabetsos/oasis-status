// app/page.jsx
export const dynamic = "force-static";
export const revalidate = 60;

import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  ExternalLink,
} from "lucide-react";
import StatusControls from "./status-controls"; // client-only button

// Configure targets via env (or hard-code)
const TARGETS = [
  {
    id: "main",
    name: "Website",
    url: process.env.NEXT_PUBLIC_MAIN_URL || "https://youroasis.gr",
  },
  {
    id: "app",
    name: "App API",
    url: process.env.STATUS_API_URL || "https://youroasis.gr/api/health", // change to your health endpoint
  },
];

async function ping(url, timeoutMs = 5000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: "HEAD",
      signal: ctrl.signal,
      cache: "no-store",
    });
    return { ok: res.ok, status: res.status };
  } catch (e) {
    return { ok: false, status: 0, error: e?.name || "ERR" };
  } finally {
    clearTimeout(t);
  }
}

async function runChecks() {
  const results = await Promise.all(
    TARGETS.map(async (t) => {
      const r = await ping(t.url);
      return {
        ...t,
        ok: r.ok,
        status: r.status,
        error: r.error,
        checkedAt: new Date().toISOString(),
      };
    })
  );
  return results;
}

function Pill({ ok }) {
  const cls = ok
    ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
    : "bg-amber-100 text-amber-800 border border-amber-200";
  const Icon = ok ? CheckCircle : AlertTriangle;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs ${cls}`}
    >
      <Icon className="h-4 w-4" />
      {ok ? "All systems operational" : "Degraded performance"}
    </span>
  );
}

function Item({ name, url, ok, status, checkedAt }) {
  const Icon = ok ? CheckCircle : XCircle;
  const tone = ok ? "text-emerald-600" : "text-red-600";
  const dot = ok ? "bg-emerald-500" : "bg-red-500";
  return (
    <div className="rounded-xl border border-[#e8e4db] bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
          <div>
            <div className="font-medium text-[#5a4a3f]">{name}</div>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-1 text-xs text-[#7a6a58]"
            >
              {url}
              <ExternalLink className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100" />
            </a>
          </div>
        </div>
        <div className={`inline-flex items-center gap-1 text-sm ${tone}`}>
          <Icon className="h-4 w-4" />
          {ok ? "Operational" : `Down (${status || "ERR"})`}
        </div>
      </div>
      <div className="mt-2 text-[11px] text-[#7a6a58]">
        Checked: {new Date(checkedAt).toLocaleString()}
      </div>
    </div>
  );
}

export default async function Page() {
  const checks = await runChecks();
  const overallOk = checks.every((c) => c.ok);

  return (
    <main className="min-h-screen bg-[#f4f1ec] p-6">
      <div className="mx-auto w-full max-w-3xl rounded-2xl border border-[#e8e4db] bg-white p-6 sm:p-8 shadow">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-serif text-[#5a4a3f]">System Status</h1>
          <StatusControls />
        </div>

        <div className="mt-3">
          <Pill ok={overallOk} />
        </div>

        <div className="mt-6 grid gap-3">
          {checks.map((c) => (
            <Item key={c.id} {...c} />
          ))}
        </div>

        <p className="mt-6 text-xs text-[#7a6a58]">
          This page updates automatically every ~60s (ISR). Click “Refresh” to
          fetch now.
        </p>
      </div>
    </main>
  );
}
