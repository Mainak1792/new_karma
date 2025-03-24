import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/prisma";

export async function POST(request: NextRequest) {
    try {
        const { userId, email } = await request.json();

        if (!userId || !email) {
            return NextResponse.json(
                { error: "User ID and email are required" },
                { status: 400 }
            );
        }

        console.log('Verifying user in database:', { userId, email });

        // Check if user exists
        let user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            // Create user if they don't exist
            try {
                user = await prisma.user.create({
                    data: {
                        id: userId,
                        email: email,
                    },
                });
                console.log('Created new user:', user);
            } catch (createError: any) {
                if (createError.code === 'P2002') {
                    // If unique constraint violation, try to fetch the user again
                    user = await prisma.user.findUnique({
                        where: { id: userId }
                    });
                    if (!user) {
                        throw new Error('Failed to create or find user');
                    }
                } else {
                    throw createError;
                }
            }
        }

        return NextResponse.json({ user });
    } catch (error: any) {
        console.error('Error in verify-user:', error);
        return NextResponse.json(
            { error: error.message || "Failed to verify/create user" },
            { status: 500 }
        );
    }
} 