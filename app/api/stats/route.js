import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Get total registered users
        const totalUsers = await prisma.person.count();

        // Get total check-ins all-time
        const totalCheckIns = await prisma.attendance.count();

        // Get today's check-ins
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayCheckIns = await prisma.attendance.count({
            where: {
                timestamp: {
                    gte: today,
                },
            },
        });

        // Get this week's check-ins
        const week = new Date();
        week.setDate(week.getDate() - 7);
        week.setHours(0, 0, 0, 0);
        const weekCheckIns = await prisma.attendance.count({
            where: {
                timestamp: {
                    gte: week,
                },
            },
        });

        // Get this month's check-ins
        const month = new Date();
        month.setDate(1);
        month.setHours(0, 0, 0, 0);
        const monthCheckIns = await prisma.attendance.count({
            where: {
                timestamp: {
                    gte: month,
                },
            },
        });

        // Get recent check-ins (last 10)
        const recentCheckIns = await prisma.attendance.findMany({
            orderBy: {
                timestamp: 'desc',
            },
            take: 10,
        });

        // Get daily trend for last 7 days
        const dailyTrend = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);

            const nextDay = new Date(date);
            nextDay.setDate(nextDay.getDate() + 1);

            const count = await prisma.attendance.count({
                where: {
                    timestamp: {
                        gte: date,
                        lt: nextDay,
                    },
                },
            });

            dailyTrend.push({
                date: date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }),
                count,
            });
        }

        // Get top users by check-in count
        const topUsersRaw = await prisma.attendance.groupBy({
            by: ['name'],
            _count: {
                name: true,
            },
            orderBy: {
                _count: {
                    name: 'desc',
                },
            },
            take: 5,
        });

        const topUsers = topUsersRaw.map((user) => ({
            name: user.name,
            count: user._count.name,
        }));

        return NextResponse.json({
            success: true,
            data: {
                totalUsers,
                totalCheckIns,
                todayCheckIns,
                weekCheckIns,
                monthCheckIns,
                recentCheckIns,
                dailyTrend,
                topUsers,
            },
        });
    } catch (error) {
        console.error('Error fetching statistics:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch statistics' },
            { status: 500 }
        );
    }
}
