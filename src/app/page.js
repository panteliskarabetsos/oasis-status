// Server Component (no "use client" here)
export const dynamic = "force-static";
export const revalidate = 60;

import StatusClient from "./status-client";

export default function Page() {
  return <StatusClient />;
}
