import { prisma } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { Node, Edge } from 'reactflow';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/share/save
 * Allows collaborators to save changes to a shared workspace
 * Requires: workspaceId, shareToken (for public), code, nodes, edges
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const body = await request.json();
    const { workspaceId, shareToken, code, nodes, edges } = body;

    if (!workspaceId || !code) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId }
    });

    if (!workspace) {
      return NextResponse.json(
        { success: false, error: 'Workspace not found' },
        { status: 404 }
      );
    }

    // Check permissions
    let hasEditPermission = false;

    // Owner always has permission
    if (workspace.userId === userId) {
      hasEditPermission = true;
    } else if (shareToken) {
      // Check share token
      const share = await prisma.workspaceShare.findUnique({
        where: { shareToken }
      });

      if (share && share.workspaceId === workspaceId) {
        // Check if expired
        if (share.expiresAt && new Date() > share.expiresAt) {
          return NextResponse.json(
            { success: false, error: 'Share link has expired' },
            { status: 401 }
          );
        }

        hasEditPermission = share.role === 'COLLABORATOR';
      }
    } else if (userId) {
      // Check direct user invite
      const share = await prisma.workspaceShare.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId,
            userId
          }
        }
      });

      if (share && (!share.expiresAt || new Date() <= share.expiresAt)) {
        hasEditPermission = share.role === 'COLLABORATOR';
      }
    }

    if (!hasEditPermission) {
      return NextResponse.json(
        { success: false, error: 'Edit permission denied' },
        { status: 403 }
      );
    }

    // Update workspace
    await prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        code,
        canvas_nodes: JSON.stringify(nodes || []),
        canvas_edges: JSON.stringify(edges || []),
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Workspace updated successfully'
    });
  } catch (error) {
    console.error('Error saving shared workspace:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save changes' },
      { status: 500 }
    );
  }
}
