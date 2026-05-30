"use server"

import { prisma } from '@/lib/db';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { WorkspaceRole } from '@prisma/client';
import crypto from 'crypto';

/**
 * Generates a random share token for public sharing
 */
function generateShareToken(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Creates a shareable link for a workspace
 * @param workspaceId - The workspace to share
 * @param role - The role to grant (COLLABORATOR or READER)
 * @param expiresInDays - Optional: days until link expires (null = never expires)
 */
export async function createShareLink(
  workspaceId: string,
  role: WorkspaceRole = WorkspaceRole.READER,
  expiresInDays?: number
) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId }
    });

    if (!workspace || workspace.userId !== userId) {
      return { success: false, error: "Workspace not found or unauthorized" };
    }

    if (role === WorkspaceRole.OWNER) {
      return { success: false, error: "Cannot share as OWNER" };
    }

    const shareToken = generateShareToken();
    const expiresAt = expiresInDays 
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : null;

    const share = await prisma.workspaceShare.create({
      data: {
        workspaceId,
        shareToken,
        role,
        createdBy: userId,
        expiresAt
      }
    });

    return {
      success: true,
      shareToken: share.shareToken,
      shareUrl: `${process.env.NEXT_PUBLIC_APP_URL}/share/${shareToken}`,
      role: share.role,
      expiresAt: share.expiresAt
    };
  } catch (error) {
    console.error('Error creating share link:', error);
    return { success: false, error: "Failed to create share link" };
  }
}

/**
 * Invites a specific user as collaborator or reader by email
 * @param workspaceId - The workspace to share
 * @param inviteeEmail - The email of the user to invite
 * @param role - The role to grant
 */
export async function inviteUser(
  workspaceId: string,
  inviteeEmail: string,
  role: WorkspaceRole = WorkspaceRole.COLLABORATOR
) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId }
    });

    if (!workspace || workspace.userId !== userId) {
      return { success: false, error: "Workspace not found or unauthorized" };
    }

    const client = await clerkClient();
    const users = await client.users.getUserList({ emailAddress: [inviteeEmail] });
    
    if (users.data.length === 0) {
      return { success: false, error: "User not found on platform. They must sign up first." };
    }

    const inviteeId = users.data[0].id;

    if (inviteeId === userId) {
      return { success: false, error: "Cannot invite yourself" };
    }

    const existingShare = await prisma.workspaceShare.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: inviteeId
        }
      }
    });

    if (existingShare) {
      const updated = await prisma.workspaceShare.update({
        where: { id: existingShare.id },
        data: { role, updatedAt: new Date() }
      });
      return { success: true, message: "User role updated", share: updated };
    }

    const share = await prisma.workspaceShare.create({
      data: {
        workspaceId,
        userId: inviteeId,
        role,
        createdBy: userId
      }
    });

    return { success: true, message: "User invited successfully", share };
  } catch (error) {
    console.error('Error inviting user:', error);
    return { success: false, error: "Failed to invite user" };
  }
}

export async function getWorkspaceShares(workspaceId: string) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId }
    });

    if (!workspace || workspace.userId !== userId) {
      return { success: false, error: "Workspace not found or unauthorized" };
    }

    const shares = await prisma.workspaceShare.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' }
    });

    return { success: true, shares };
  } catch (error) {
    console.error('Error fetching shares:', error);
    return { success: false, error: "Failed to fetch shares" };
  }
}

export async function revokeShare(shareId: string) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const share = await prisma.workspaceShare.findUnique({
      where: { id: shareId },
      include: { workspace: true }
    });

    if (!share) {
      return { success: false, error: "Share not found" };
    }

    if (share.workspace.userId !== userId) {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.workspaceShare.delete({
      where: { id: shareId }
    });

    return { success: true, message: "Share revoked successfully" };
  } catch (error) {
    console.error('Error revoking share:', error);
    return { success: false, error: "Failed to revoke share" };
  }
}

export async function getAccessibleWorkspace(workspaceId: string, shareToken?: string) {
  try {
    const { userId } = await auth();

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
        role: WorkspaceRole.OWNER,
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
        canEdit: share.role === WorkspaceRole.COLLABORATOR
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
          canEdit: share.role === WorkspaceRole.COLLABORATOR
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

export async function updateShareRole(shareId: string, newRole: WorkspaceRole) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const share = await prisma.workspaceShare.findUnique({
      where: { id: shareId },
      include: { workspace: true }
    });

    if (!share || share.workspace.userId !== userId) {
      return { success: false, error: "Unauthorized" };
    }

    if (newRole === WorkspaceRole.OWNER) {
      return { success: false, error: "Cannot change role to OWNER" };
    }

    const updated = await prisma.workspaceShare.update({
      where: { id: shareId },
      data: { role: newRole, updatedAt: new Date() }
    });

    return { success: true, share: updated };
  } catch (error) {
    console.error('Error updating share role:', error);
    return { success: false, error: "Failed to update role" };
  }
}
