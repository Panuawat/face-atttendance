'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AttendanceHistory() {
    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Fetch attendance records
    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.append('search', searchQuery);
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);

            const response = await fetch(`/api/attendance?${params.toString()}`);
            const result = await response.json();

            if (result.success) {
                setAttendanceData(result.data);
            } else {
                console.error('Failed to fetch attendance');
            }
        } catch (error) {
            console.error('Error fetching attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch on mount and when filters change
    useEffect(() => {
        fetchAttendance();
    }, [searchQuery, startDate, endDate]);

    // Clear all filters
    const clearFilters = () => {
        setSearchQuery('');
        setStartDate('');
        setEndDate('');
    };

    // Format date and time
    const formatDateTime = (timestamp) => {
        const date = new Date(timestamp);
        return {
            date: date.toLocaleDateString('th-TH', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            }),
            time: date.toLocaleTimeString('th-TH', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            }),
        };
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            {/* Header */}
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-4xl font-bold">📊 ประวัติการเช็คชื่อ</h1>
                    <Link
                        href="/"
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
                    >
                        🎥 กลับไปหน้าแสกน
                    </Link>
                </div>

                {/* Filters */}
                <div className="bg-gray-800 rounded-lg p-6 mb-6 shadow-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Search */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                🔍 ค้นหาชื่อ
                            </label>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="พิมพ์ชื่อที่ต้องการค้นหา..."
                                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>

                        {/* Start Date */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                📅 จากวันที่
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>

                        {/* End Date */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                📅 ถึงวันที่
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Clear Filters Button */}
                    {(searchQuery || startDate || endDate) && (
                        <div className="mt-4">
                            <button
                                onClick={clearFilters}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                            >
                                ❌ ล้างตัวกรอง
                            </button>
                        </div>
                    )}
                </div>

                {/* Stats */}
                <div className="mb-4 text-lg">
                    <span className="text-gray-400">พบทั้งหมด:</span>{' '}
                    <span className="text-blue-400 font-bold">{attendanceData.length}</span>{' '}
                    รายการ
                </div>

                {/* Table */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        <p className="mt-4 text-gray-400">กำลังโหลดข้อมูล...</p>
                    </div>
                ) : attendanceData.length === 0 ? (
                    <div className="bg-gray-800 rounded-lg p-12 text-center">
                        <p className="text-2xl text-gray-400">😔 ไม่พบข้อมูลการเช็คชื่อ</p>
                        <p className="mt-2 text-gray-500">ลองปรับเปลี่ยนตัวกรองหรือค้นหาใหม่</p>
                    </div>
                ) : (
                    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold">ลำดับ</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold">ชื่อ</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold">วันที่</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold">เวลา</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold">สถานะ</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {attendanceData.map((record, index) => {
                                        const { date, time } = formatDateTime(record.timestamp);
                                        return (
                                            <tr
                                                key={record.id}
                                                className="hover:bg-gray-700 transition-colors"
                                            >
                                                <td className="px-6 py-4 text-gray-400">{index + 1}</td>
                                                <td className="px-6 py-4 font-semibold text-blue-400">
                                                    {record.name}
                                                </td>
                                                <td className="px-6 py-4">{date}</td>
                                                <td className="px-6 py-4">{time}</td>
                                                <td className="px-6 py-4">
                                                    <span className="px-3 py-1 bg-green-600 text-green-100 rounded-full text-sm font-medium">
                                                        ✓ {record.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
