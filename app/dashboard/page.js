'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardPage() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/stats');
            const result = await response.json();

            if (result.success) {
                setStats(result.data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    <p className="mt-4 text-gray-400">กำลังโหลดข้อมูล...</p>
                </div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <p className="text-red-400">ไม่สามารถโหลดข้อมูลได้</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-4xl font-bold">📊 Dashboard</h1>
                    <Link
                        href="/"
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
                    >
                        🏠 กลับหน้าแรก
                    </Link>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                    <StatCard
                        icon="👥"
                        title="ผู้ใช้ทั้งหมด"
                        value={stats.totalUsers}
                        color="bg-blue-600"
                    />
                    <StatCard
                        icon="📊"
                        title="เช็คชื่อทั้งหมด"
                        value={stats.totalCheckIns}
                        color="bg-purple-600"
                    />
                    <StatCard
                        icon="📅"
                        title="วันนี้"
                        value={stats.todayCheckIns}
                        color="bg-green-600"
                    />
                    <StatCard
                        icon="📆"
                        title="สัปดาห์นี้"
                        value={stats.weekCheckIns}
                        color="bg-yellow-600"
                    />
                    <StatCard
                        icon="🗓️"
                        title="เดือนนี้"
                        value={stats.monthCheckIns}
                        color="bg-red-600"
                    />
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Daily Trend Chart */}
                    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
                        <h2 className="text-2xl font-bold mb-4">📈 แนวโน้ม 7 วันล่าสุด</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={stats.dailyTrend}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="date" stroke="#9CA3AF" />
                                <YAxis stroke="#9CA3AF" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1F2937',
                                        border: '1px solid #374151',
                                        borderRadius: '0.5rem',
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="count"
                                    stroke="#3B82F6"
                                    strokeWidth={2}
                                    dot={{ fill: '#3B82F6', r: 4 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Top Users Chart */}
                    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
                        <h2 className="text-2xl font-bold mb-4">🏆 Top 5 ผู้เข้าร่วมบ่อยที่สุด</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={stats.topUsers} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis type="number" stroke="#9CA3AF" />
                                <YAxis dataKey="name" type="category" stroke="#9CA3AF" width={100} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1F2937',
                                        border: '1px solid #374151',
                                        borderRadius: '0.5rem',
                                    }}
                                />
                                <Bar dataKey="count" fill="#10B981" radius={[0, 8, 8, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Check-ins */}
                <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
                    <h2 className="text-2xl font-bold mb-4">🔔 การเช็คชื่อล่าสุด</h2>
                    {stats.recentCheckIns.length === 0 ? (
                        <p className="text-gray-400 text-center py-8">ยังไม่มีข้อมูล</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-sm font-semibold">ลำดับ</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold">ชื่อ</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold">วันที่</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold">เวลา</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {stats.recentCheckIns.map((record, index) => {
                                        const date = new Date(record.timestamp);
                                        return (
                                            <tr key={record.id} className="hover:bg-gray-700 transition-colors">
                                                <td className="px-6 py-4 text-gray-400">{index + 1}</td>
                                                <td className="px-6 py-4 font-semibold text-blue-400">
                                                    {record.name}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {date.toLocaleDateString('th-TH', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                    })}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {date.toLocaleTimeString('th-TH', {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        second: '2-digit',
                                                    })}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon, title, value, color }) {
    return (
        <div className={`${color} rounded-lg p-6 shadow-lg`}>
            <div className="flex items-center justify-between mb-2">
                <span className="text-3xl">{icon}</span>
                <span className="text-4xl font-bold">{value}</span>
            </div>
            <p className="text-sm opacity-90">{title}</p>
        </div>
    );
}
