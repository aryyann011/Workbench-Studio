import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { FileCode2, Plus, Trash } from "lucide-react";
import Link from "next/link"; 
import { deleteArchitecture } from "@/actions/workspace";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) {
    return <div>Please log in to view your workspaces.</div>;
  }

  const workspaces = await prisma.workspace.findMany({
    where: { userId: userId },
    orderBy: { updatedAt: "desc" },
  });

  const deleteTheFile = async(id : string) => {
    if(!id){
      console.log("Invalid id")
      return;
    }

    const res = await deleteArchitecture(id)

    if(res.success){
      alert("File deleted successfully")
    }
  }

  return (
    <div className="p-8 w-full max-w-6xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Your Architectures</h1>
          <p className="text-muted-foreground">Manage and view your saved system designs.</p>
        </div>
        
        <Link 
          href="/dashboard/new" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-semibold flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create New
        </Link>
      </div>

      {workspaces.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg border-border text-center">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <FileCode2 className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No architectures yet</h3>
          <p className="text-muted-foreground max-w-sm mt-2">
            Click Create New to generate your first system design.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workspaces.map((workspace) => (
            <Link 
              href={`/dashboard/${workspace.id}`} 
              key={workspace.id} 
              className="group flex flex-col p-6 border border-border rounded-xl bg-card hover:border-primary/50 transition-colors cursor-pointer"
            >
              {/* <div className="absolute left-132 top-48" onClick={() => deleteTheFile(workspace.id)}>
                <Trash className="text-red-500"/>
              </div> */}
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <FileCode2 className="w-5 h-5" />
                </div>
                <h2 className="font-semibold text-lg truncate" title={workspace.name}>
                  {workspace.name}
                </h2>
              </div>
              
              <div className="mt-auto pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                <span>Updated {workspace.updatedAt.toLocaleDateString()}</span>
                <span className="font-mono text-[10px] bg-muted px-2 py-1 rounded">
                  ID: {workspace.id.slice(0, 8)}...
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}