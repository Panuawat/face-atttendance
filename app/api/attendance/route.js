import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        // Build query filters
        const where = {};

        // Search by name (case-insensitive)
        if (search) {
            where.name = {
                contains: search,
            };
        }

        // Filter by date range
        if (startDate || endDate) {
            where.timestamp = {};

            if (startDate) {
                // Start of the day
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                where.timestamp.gte = start;
            }

            if (endDate) {
                // End of the day
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                where.timestamp.lte = end;
            }
        }

        // Fetch attendance records with filters
        const attendanceRecords = await prisma.attendance.findMany({
            where,
            orderBy: {
                timestamp: 'desc', // Most recent first
            },
        });

        return NextResponse.json({
            success: true,
            count: attendanceRecords.length,
            data: attendanceRecords,
        });
    } catch (error) {
        console.error('Error fetching attendance records:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch attendance records' },
            { status: 500 }
        );
    }
}
