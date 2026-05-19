import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/share/validate
 * Validates a share token and returns workspace metadata
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const shareToken = searchParams.get('token');

    if (!shareToken) {
      return NextResponse.json(
        { success: false, error: 'Share token required' },
        { status: 400 }
      );
    }

    const share = await prisma.workspaceShare.findUnique({
      where: { shareToken },
      include: { workspace: true }
    });

    if (!share) {
      return NextResponse.json(
        { success: false, error: 'Share link not found' },
        { status: 404 }
      );
    }

    // Check if expired
    if (share.expiresAt && new Date() > share.expiresAt) {
      return NextResponse.json(
        { success: false, error: 'Share link has expired' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      workspace: {
        id: share.workspace.id,
        name: share.workspace.name,
        code: share.workspace.code,
        canvas_nodes: share.workspace.canvas_nodes,
        canvas_edges: share.workspace.canvas_edges,
      },
      role: share.role,
      canEdit: share.role === 'COLLABORATOR',
      createdAt: share.createdAt,
      expiresAt: share.expiresAt
    });
  } catch (error) {
    console.error('Error validating share:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to validate share link' },
      { status: 500 }
    );
  }
}
