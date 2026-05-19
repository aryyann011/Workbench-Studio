"use server"

import { prisma } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import crypto from 'crypto';

/**
 * Creates a hash of a prompt for quick comparison
 */
function hashPrompt(prompt: string): string {
  return crypto.createHash('sha256').update(prompt).digest('hex');
}

/**
 * Calculates similarity between two strings (0-1)
 * Using simple character-based similarity
 */
function calculateSimilarity(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const maxLen = Math.max(len1, len2);

  if (maxLen === 0) return 1;

  let matches = 0;
  for (let i = 0; i < Math.min(len1, len2); i++) {
    if (str1[i] === str2[i]) matches++;
  }

  return matches / maxLen;
}

/**
 * Gets cached prompt results if similar prompt exists
 * Similarity threshold is 70% by default
 */
export async function getCachedPromptResult(
  promptText: string,
  similarityThreshold: number = 0.7
) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized", cached: false };

    const promptHash = hashPrompt(promptText);

    // First try exact match
    const exactMatch = await prisma.promptCache.findUnique({
      where: { promptHash }
    });

    if (exactMatch && exactMatch.userId === userId) {
      // Update usage stats
      await prisma.promptCache.update({
        where: { id: exactMatch.id },
        data: {
          usageCount: { increment: 1 },
          lastUsed: new Date()
        }
      });

      return {
        success: true,
        cached: true,
        type: 'EXACT',
        code: exactMatch.generatedCode,
        canvas_nodes: exactMatch.canvas_nodes,
        canvas_edges: exactMatch.canvas_edges
      };
    }

    // Look for similar prompts by the same user
    const allUserPrompts = await prisma.promptCache.findMany({
      where: { userId },
      orderBy: { lastUsed: 'desc' },
      take: 10 // Only check last 10 prompts for efficiency
    });

    for (const cached of allUserPrompts) {
      const similarity = calculateSimilarity(promptText, cached.promptText);

      if (similarity >= similarityThreshold) {
        // Update usage stats
        await prisma.promptCache.update({
          where: { id: cached.id },
          data: {
            usageCount: { increment: 1 },
            lastUsed: new Date()
          }
        });

        return {
          success: true,
          cached: true,
          type: 'SIMILAR',
          similarity: Math.round(similarity * 100),
          code: cached.generatedCode,
          canvas_nodes: cached.canvas_nodes,
          canvas_edges: cached.canvas_edges,
          originalPrompt: cached.promptText
        };
      }
    }

    return { success: true, cached: false };
  } catch (error) {
    console.error('Error fetching cached prompt:', error);
    return { success: false, error: "Failed to fetch cache", cached: false };
  }
}

/**
 * Saves a prompt result to cache
 */
export async function saveCachePromptResult(
  promptText: string,
  generatedCode: string,
  canvas_nodes?: any,
  canvas_edges?: any
) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const promptHash = hashPrompt(promptText);

    const cached = await prisma.promptCache.create({
      data: {
        userId,
        promptText,
        promptHash,
        generatedCode,
        canvas_nodes: canvas_nodes ? JSON.stringify(canvas_nodes) : undefined,
        canvas_edges: canvas_edges ? JSON.stringify(canvas_edges) : undefined
      }
    });

    return { success: true, cached };
  } catch (error) {
    // If duplicate hash, just ignore (exact match already exists)
    if ((error as any).code === 'P2002') {
      return { success: true, message: "Prompt already cached" };
    }
    console.error('Error saving cache:', error);
    return { success: false, error: "Failed to cache prompt" };
  }
}

/**
 * Gets user's prompt cache statistics
 */
export async function getPromptCacheStats() {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const stats = await prisma.promptCache.aggregate({
      where: { userId },
      _count: true,
      _sum: { usageCount: true }
    });

    const topPrompts = await prisma.promptCache.findMany({
      where: { userId },
      orderBy: { usageCount: 'desc' },
      take: 5,
      select: {
        id: true,
        promptText: true,
        usageCount: true,
        lastUsed: true
      }
    });

    return {
      success: true,
      stats: {
        totalCachedPrompts: stats._count,
        totalUsage: stats._sum.usageCount || 0,
        topPrompts
      }
    };
  } catch (error) {
    console.error('Error fetching cache stats:', error);
    return { success: false, error: "Failed to fetch stats" };
  }
}

/**
 * Clears old cache entries (older than 30 days and not recently used)
 */
export async function clearOldCache(daysOld: number = 30) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);

    const result = await prisma.promptCache.deleteMany({
      where: {
        userId,
        lastUsed: { lt: cutoffDate },
        usageCount: 1 // Only delete if used only once
      }
    });

    return {
      success: true,
      message: `Cleared ${result.count} old cache entries`
    };
  } catch (error) {
    console.error('Error clearing old cache:', error);
    return { success: false, error: "Failed to clear cache" };
  }
}
