"use server"

import { prisma } from '../lib/db';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { Edge, Node } from 'reactflow';


export async function getWorkspace(id: string) {
  const { userId } = await auth();
  if (!userId) return null;

  try {
    return await prisma.workspace.findUnique({
      where: { id: id, userId: userId }
    });
  } catch (error) {
    return null;
  }
}


export async function getAccessibleWorkspace(
  workspaceId: string,
  shareToken?: string
) {
  const { userId } = await auth();

  try {
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId }
    });

    if (!workspace) {
      return { success: false, error: "Workspace not found", canAccess: false };
    }

    if (workspace.userId === userId) {
      return {
        success: true,
        workspace,
        role: 'OWNER',
        canAccess: true,
        canEdit: true
      };
    }

    if (shareToken) {
      const share = await prisma.workspaceShare.findUnique({
        where: { shareToken }
      });

      if (!share || share.workspaceId !== workspaceId) {
        return { success: false, error: "Invalid share link", canAccess: false };
      }

      if (share.expiresAt && new Date() > share.expiresAt) {
        return { success: false, error: "Share link has expired", canAccess: false };
      }

      return {
        success: true,
        workspace,
        role: share.role,
        canAccess: true,
        canEdit: share.role === 'COLLABORATOR'
      };
    }

    if (userId) {
      const share = await prisma.workspaceShare.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId,
            userId
          }
        }
      });

      if (share && (!share.expiresAt || new Date() <= share.expiresAt)) {
        return {
          success: true,
          workspace,
          role: share.role,
          canAccess: true,
          canEdit: share.role === 'COLLABORATOR'
        };
      }
    }

    return {
      success: false,
      error: "Access denied",
      canAccess: false
    };
  } catch (error) {
    console.error('Error accessing workspace:', error);
    return { success: false, error: "Failed to access workspace", canAccess: false };
  }
}

export async function deleteArchitecture(Id : string){
  try {
    const {userId} = await auth();
    if(!userId) return { success : false, error : "Unauthorized"};

    await prisma.workspace.deleteMany({
      where: {
        id: Id,
        userId : userId
      }
    });
    revalidatePath("/dashboard")

    return {success : true}
  } catch (error) {
    return {success : false,  error : "failed to delete the file"}
  }
}

export async function saveArchitecture(code: string, nodes : Node[], edges : Edge[], existingId?: string, shareToken?: string) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    if (existingId && existingId !== "new") {
      const workspace = await prisma.workspace.findUnique({
        where: { id: existingId }
      });

      if (!workspace) {
        return { success: false, error: "Workspace not found" };
      }

      const isOwner = workspace.userId === userId;
      
      let canEdit = isOwner;

      if (!isOwner && shareToken) {
        const share = await prisma.workspaceShare.findUnique({
          where: { shareToken }
        });
        canEdit = share?.role === 'COLLABORATOR' && (!share.expiresAt || new Date() <= share.expiresAt);
      } else if (!isOwner && userId) {
        const share = await prisma.workspaceShare.findUnique({
          where: {
            workspaceId_userId: {
              workspaceId: existingId,
              userId
            }
          }
        });
        canEdit = share?.role === 'COLLABORATOR' && (!share.expiresAt || new Date() <= share.expiresAt);
      }

      if (!canEdit) {
        return { success: false, error: "Edit permission denied" };
      }

      await prisma.workspace.update({
        where: { id: existingId },
        data: { 
          code: code,
          canvas_nodes: JSON.stringify(nodes),
          canvas_edges: JSON.stringify(edges),
          updatedAt: new Date()
        },
      });
      return { success: true, id: existingId };
    }
    
    const newWorkspace = await prisma.workspace.create({
      data: { userId: userId, code: code, canvas_nodes : JSON.stringify(nodes), canvas_edges : JSON.stringify(edges) }
    });
    return { success: true, id: newWorkspace.id };

  } catch (error) {
    return { success: false, error: "Failed to save architecture" };
  }
}