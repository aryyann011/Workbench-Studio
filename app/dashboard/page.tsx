import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { FileCode2, Plus } from "lucide-react";
import Link from "next/link"; 
import { WorkspaceActions } from "../workspaceActions";
import { Workspace } from "@prisma/client";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) {
    return <div className="p-6 text-white text-sm">Please log in to view your workspaces.</div>;
  }

  const workspaces: Workspace[] = await prisma.workspace.findMany({
    where: { userId: userId },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="p-6 w-full max-w-6xl mx-auto h-full overflow-y-auto">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-0.5 text-white">Your Architectures</h1>
          <p className="text-xs text-slate-400">Manage and view your saved system designs.</p>
        </div>
        
        <Link 
          href="/dashboard/new" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-colors text-xs shadow-md shadow-blue-600/10"
        >
          <Plus className="w-3.5 h-3.5" />
          Create New
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-12">
        {workspaces.map((workspace) => (
          <Link 
            href={`/dashboard/${workspace.id}`} 
            key={workspace.id} 
            className="relative group flex flex-col p-4 border border-white/[0.06] rounded-xl bg-[#09090b] hover:border-blue-500/50 hover:bg-[#0c0c14] hover:shadow-[0_0_25px_rgba(59,130,246,0.12)] transition-all duration-300 cursor-pointer min-h-[132px] justify-between"
          >
            <WorkspaceActions workspaceId={workspace.id}/>
            
            <div className="flex items-center gap-2.5 mb-3 pr-16 text-left">
              <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-400 border border-blue-500/15 shrink-0">
                <FileCode2 className="w-4 h-4 text-blue-400" />
              </div>
              <h2 className="font-semibold text-[14px] truncate text-slate-100 group-hover:text-white transition-colors" title={workspace.name}>
                {workspace.name}
              </h2>
            </div>
            
            <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between text-[11px]">
              <span className="text-slate-500 group-hover:text-slate-400 transition-colors">
                Updated {workspace.updatedAt.toLocaleDateString()}
              </span>
              <span className="font-mono text-[9px] bg-white/5 border border-white/5 px-1.5 py-0.5 rounded text-slate-400">
                ID: {workspace.id.slice(0, 8)}...
              </span>
            </div>
          </Link>
        ))}

        <Link 
          href="/dashboard/new"
          className="flex flex-col items-center justify-center p-4 border border-dashed border-white/10 hover:border-blue-500/50 bg-white/[0.01] hover:bg-blue-500/[0.02] hover:shadow-[0_0_20px_rgba(59,130,246,0.05)] rounded-xl min-h-[132px] transition-all duration-300 group cursor-pointer"
        >
          <div className="p-2 bg-white/[0.02] group-hover:bg-blue-500/10 rounded-full border border-white/[0.04] group-hover:border-blue-500/20 text-slate-500 group-hover:text-blue-400 transition-all mb-2">
            <Plus className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-200 transition-all">Create New Design</span>
        </Link>
      </div>
    </div>
  );
}
