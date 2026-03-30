"use server"

import { prisma } from '../lib/db';
import { auth } from '@clerk/nextjs/server';

export async function saveArchitecture(code: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Unauthorized: You must be logged in to save." };
    }

    const newWorkspace = await prisma.workspace.create({
      data: {
        userId: userId, 
        code: code,
      }
    });

    console.log("Successfully saved to database with ID:", newWorkspace.id);
    return { success: true, id: newWorkspace.id };

  } catch (error) {
    console.error("Database Save Error:", error);
    return { success: false, error: "Failed to save architecture" };
  }
}