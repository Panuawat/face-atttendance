import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { name } = await request.json();

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        // Check for recent check-in (within 1 minute)
        const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
        const recentCheckIn = await prisma.attendance.findFirst({
            where: {
                name: name,
                timestamp: {
                    gte: oneMinuteAgo,
                },
            },
        });

        if (recentCheckIn) {
            return NextResponse.json({ message: 'Already checked in recently', status: 'skipped' });
        }

        // Create new attendance record
        const attendance = await prisma.attendance.create({
            data: {
                name: name,
                status: 'present',
            },
        });

        return NextResponse.json({ message: 'Check-in successful', data: attendance, status: 'success' });
    } catch (error) {
        console.error('Check-in error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
