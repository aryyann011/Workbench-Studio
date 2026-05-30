import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const body = await req.json();
    const { email, message, rating } = body;

    if (!message) {
      return NextResponse.json(
        { success: false, error: "Message is required." },
        { status: 400 }
      );
    }

    const feedback = await prisma.feedback.create({
      data: {
        userId: userId || null,
        email: email || null,
        message,
        rating: rating ? parseInt(rating, 10) : null,
      },
    });

    return NextResponse.json({ success: true, data: feedback }, { status: 201 });
  } catch (error) {
    console.error("Failed to submit feedback:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit feedback." },
      { status: 500 }
    );
  }
}
