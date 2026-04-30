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

export async function saveArchitecture(code: string, nodes : Node[], edges : Edge[], existingId?: string) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    if (existingId && existingId !== "new") {
      await prisma.workspace.update({
        where: { id: existingId },
        data: { code: code },

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