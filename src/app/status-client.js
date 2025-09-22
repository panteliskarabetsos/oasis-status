// app/page.js
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

export const dynamic = "force-static"; // static shell
export const revalidate = 60; // but it fetches live data client-side

export default function Page() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [incidents, setIncidents] = useState([]);
  const [tick, setTick] = useState(0); // forces refresh

  // fetch health
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/health", { cache: "no-store" });
        const json = await res.json();
        if (alive) setHealth(json);
      } catch (e) {
        if (alive)
          setHealth({ overall: "down", results: [], error: String(e) });
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [tick]);

  // auto refresh every 30s
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 30000);
    return () => clearInterval(id);
  }, []);

  // load incidents (static file)
  useEffect(() => {
    fetch("/incidents.json", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((arr) => setIncidents(Array.isArray(arr) ? arr : []))
      .catch(() => setIncidents([]));
  }, []);

  const badge = useMemo(() => {
    if (!health) return { color: "bg-gray-400", text: "Loading…" };
    switch (health.overall) {
      case "operational":
        return {
          color: "bg-emerald-600",
          text: "All systems operational",
          Icon: CheckCircle,
        };
      case "degraded":
        return {
          color: "bg-amber-500",
          text: "Degraded performance",
          Icon: AlertTriangle,
        };
      default:
        return { color: "bg-red-600", text: "Major outage", Icon: XCircle };
    }
  }, [health]);

  const updatedAt = health?.updatedAt ? new Date(health.updatedAt) : null;
  const lastUpdatedText = updatedAt
    ? `Updated ${timeAgo(updatedAt)}`
    : loading
    ? "Checking…"
    : "—";

  return (
    <main className="min-h-screen bg-[#f4f1ec] flex items-center justify-center p-6">
      <div className="w-full max-w-4xl rounded-2xl border border-[#e8e4db] bg-white p-6 sm:p-8 shadow">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-serif text-[#5a4a3f]">
            System Status
          </h1>
          <button
            onClick={() => setTick((n) => n + 1)}
            className="inline-flex items-center gap-2 rounded-lg border border-[#e0dcd4] bg-[#fdfaf5] px-3 py-2 text-sm text-[#5a4a3f] hover:bg-[#f1ede7]"
            disabled={loading}
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Overall badge */}
        <div className="mt-4 rounded-xl border border-[#eee6da] bg-[#fcf9f4] p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex h-3 w-3 rounded-full ${badge.color}`}
            />
            <p className="text-[#5a4a3f] font-medium">{badge.text}</p>
          </div>
          <p className="text-xs text-[#7a6a58]">{lastUpdatedText}</p>
        </div>

        {/* Components */}
        <section className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(health?.results ?? (loading ? Array.from({ length: 3 }) : [])).map(
            (r, i) =>
              r ? <StatusCard key={r.key} r={r} /> : <StatusSkeleton key={i} />
          )}
        </section>

        {/* Incidents */}
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-[#5a4a3f]">
            Recent Incidents
          </h2>
          {incidents.length === 0 ? (
            <p className="mt-2 text-sm text-[#7a6a58]">
              No incidents reported.
            </p>
          ) : (
            <div className="mt-3 space-y-3">
              {incidents
                .slice()
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map((inc) => (
                  <Incident key={inc.id} inc={inc} />
                ))}
            </div>
          )}
        </section>

        {/* Footer */}
        <div className="mt-8 flex flex-wrap items-center gap-3 text-xs text-[#7a6a58]">
          <a
            href="/api/health"
            className="inline-flex items-center gap-1 rounded-full border border-[#e0dcd4] px-2.5 py-1 hover:bg-[#faf7f1]"
            target="_blank"
            rel="noopener noreferrer"
          >
            JSON <ExternalLink size={12} />
          </a>
          <span>Auto-refreshes every 30s.</span>
        </div>

        {/* If you later use a provider, you can embed below */}
        {/* <div className="mt-8 overflow-hidden rounded-xl border">
          <iframe
            src="https://YOUR-STATUS-PROVIDER-PAGE"
            title="Status Provider"
            className="w-full h-[70vh]"
            loading="lazy"
          />
        </div> */}
      </div>
    </main>
  );
}

function StatusCard({ r }) {
  const ok = r.ok;
  const color = ok ? "bg-emerald-600" : "bg-red-600";
  const pill = ok ? "Operational" : "Error";
  return (
    <div className="rounded-xl border border-[#eee6da] p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`inline-flex h-2.5 w-2.5 rounded-full ${color}`} />
          <div>
            <div className="text-sm font-semibold text-[#5a4a3f]">
              {r.label}
            </div>
            <div className="text-xs text-[#7a6a58] break-all">{r.url}</div>
          </div>
        </div>
        <span
          className={`text-[11px] rounded-full px-2 py-0.5 border ${
            ok
              ? "bg-[#eaf5ef] text-[#1b5e20] border-[#cfe7d1]"
              : "bg-[#fdecec] text-[#8b1f1f] border-[#f3caca]"
          }`}
        >
          {pill}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
        <Metric label="Latency" value={`${r.latency} ms`} />
        <Metric label="HTTP" value={r.status || "—"} />
        <Metric label="Details" value={r.error ? truncate(r.error, 28) : "—"} />
      </div>
    </div>
  );
}

function StatusSkeleton() {
  return (
    <div className="rounded-xl border border-[#eee6da] p-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[#e8e2d9]" />
          <div>
            <div className="h-3 w-28 rounded bg-[#eee6da]" />
            <div className="mt-1 h-2 w-44 rounded bg-[#f2ece4]" />
          </div>
        </div>
        <span className="h-5 w-20 rounded-full bg-[#f2ece4]" />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-[#eee6da] p-2">
            <div className="h-2 w-16 rounded bg-[#eee6da]" />
            <div className="mt-1 h-3 w-10 rounded bg-[#f2ece4]" />
          </div>
        ))}
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-lg border border-[#eee6da] p-2">
      <div className="text-[10px] uppercase tracking-wide text-[#7a6a58]">
        {label}
      </div>
      <div className="mt-0.5 text-sm text-[#5a4a3f]">{value}</div>
    </div>
  );
}

function Incident({ inc }) {
  const ongoing = !inc.resolvedAt;
  const impactColor =
    inc.impact === "major"
      ? "bg-red-600"
      : inc.impact === "minor"
      ? "bg-amber-500"
      : "bg-gray-400";
  return (
    <div className="rounded-xl border border-[#eee6da] p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex h-2.5 w-2.5 rounded-full ${impactColor}`}
          />
          <div className="text-sm font-semibold text-[#5a4a3f]">
            {inc.title}
          </div>
        </div>
        <span className="text-[11px] text-[#7a6a58]">
          {new Date(inc.createdAt).toLocaleString()}
          {ongoing
            ? " • ongoing"
            : ` • resolved ${timeAgo(new Date(inc.resolvedAt))}`}
        </span>
      </div>
      {Array.isArray(inc.updates) && inc.updates.length > 0 && (
        <ul className="mt-2 space-y-1 text-sm text-[#5a4a3f]">
          {inc.updates.map((u, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-[11px] text-[#7a6a58] w-28 shrink-0">
                {new Date(u.at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <span>{u.text}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function timeAgo(date) {
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}
function truncate(str, n) {
  str = String(str ?? "");
  return str.length > n ? str.slice(0, n - 1) + "…" : str;
}
