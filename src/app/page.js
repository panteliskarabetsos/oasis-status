export const dynamic = "force-static"; // serve statically
export const revalidate = 60; // (optional) ISR every 60s

export default function Page() {
  return (
    <main className="min-h-screen bg-[#f4f1ec] flex items-center justify-center p-6">
      <div className="w-full max-w-2xl rounded-2xl border border-[#e8e4db] bg-white p-8 shadow">
        <h1 className="text-2xl font-serif text-[#5a4a3f]">System Status</h1>
        <p className="mt-2 text-sm text-[#7a6a58]">All systems operational.</p>

        {/* Optional: embed provider page (Instatus, Better Stack, etc.) */}
        {/* <div className="mt-6 overflow-hidden rounded-xl border">
          <iframe
            src="https://YOUR-STATUS-PROVIDER-PAGE"
            title="Status"
            className="w-full h-[70vh]"
            loading="lazy"
          />
        </div> */}
      </div>
    </main>
  );
}
