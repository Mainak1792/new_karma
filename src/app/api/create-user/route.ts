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

        console.log('Creating user in database:', { userId, email });

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (existingUser) {
            console.log('User already exists:', existingUser);
            return NextResponse.json({ user: existingUser });
        }

        // Create new user
        const user = await prisma.user.create({
            data: {
                id: userId,
                email: email,
            },
        });

        console.log('User created successfully:', user);
        return NextResponse.json({ user });
    } catch (error: any) {
        console.error('Error creating user:', error);
        return NextResponse.json(
            { error: error.message || "Failed to create user" },
            { status: 500 }
        );
    }
} 