import { ArchitectTerminal } from "@/components/architect-terminal";

export default function Page() {
  return (
    <main className="min-h-screen bg-black text-zinc-100 font-mono selection:bg-emerald-500/30 selection:text-emerald-200 flex items-center justify-center p-4 sm:p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05)_0%,transparent_100%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />
      
      <ArchitectTerminal />
    </main>
  );
}
