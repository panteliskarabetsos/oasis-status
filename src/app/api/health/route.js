// app/api/health/route.js
export const runtime = "nodejs";

import { NextResponse } from "next/server";

const TIMEOUT_MS = Number(process.env.STATUS_TIMEOUT_MS ?? 8000);

// Define what to check (override with env if you like)
const TARGETS = [
  {
    key: "site",
    label: "Website",
    url: process.env.STATUS_CHECK_SITE ?? "https://youroasis.gr/",
    method: "GET",
  },
  {
    key: "app",
    label: "App (Homepage)",
    url: process.env.STATUS_CHECK_APP ?? "https://youroasis.gr/",
    method: "HEAD",
  },
  {
    key: "api",
    label: "Public API",
    url: process.env.STATUS_CHECK_API ?? "https://youroasis.gr/api/health", // change to a real health endpoint if you have one
    method: "GET",
  },
  // Example: Supabase REST edge (cheap HEAD)
  process.env.NEXT_PUBLIC_SUPABASE_URL
    ? {
        key: "supabase",
        label: "Supabase Edge",
        url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`,
        method: "HEAD",
      }
    : null,
].filter(Boolean);

async function check({ url, method = "GET" }) {
  const start = Date.now();
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method,
      signal: ctrl.signal,
      cache: "no-store",
      headers: { "User-Agent": "oasis-status/1.0" },
    });
    clearTimeout(to);
    return {
      ok: res.ok,
      status: res.status,
      latency: Date.now() - start,
    };
  } catch (e) {
    clearTimeout(to);
    return {
      ok: false,
      status: 0,
      error: e.name === "AbortError" ? "timeout" : e.message,
      latency: Date.now() - start,
    };
  }
}

export async function GET() {
  const results = await Promise.all(
    TARGETS.map(async (t) => {
      const r = await check(t);
      return { key: t.key, label: t.label, url: t.url, ...r };
    })
  );

  const allOk = results.every((r) => r.ok);
  const someOk = results.some((r) => r.ok);
  const overall = allOk ? "operational" : someOk ? "degraded" : "down";

  return NextResponse.json({
    updatedAt: new Date().toISOString(),
    overall,
    results,
  });
}
