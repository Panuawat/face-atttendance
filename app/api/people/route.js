import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET - ดึงรายชื่อผู้ใช้ทั้งหมด
export async function GET() {
    try {
        const people = await prisma.person.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json({
            success: true,
            data: people,
        });
    } catch (error) {
        console.error('Error fetching people:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to fetch people' },
            { status: 500 }
        );
    }
}
