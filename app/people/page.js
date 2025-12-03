'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PeoplePage() {
    const [people, setPeople] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const fetchPeople = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/people');
            const result = await response.json();

            if (result.success) {
                setPeople(result.data);
            } else {
                console.error('Failed to fetch people');
            }
        } catch (error) {
            console.error('Error fetching people:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPeople();
    }, []);

    const handleDelete = async (id, name) => {
        try {
            const response = await fetch(`/api/people/${id}`, {
                method: 'DELETE',
            });

            const result = await response.json();

            if (result.success) {
                alert(`✅ ลบ ${name} สำเร็จ`);
                // Refresh the list
                fetchPeople();
            } else {
                alert(`❌ เกิดข้อผิดพลาด: ${result.error}`);
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('เกิดข้อผิดพลาดในการลบ');
        } finally {
            setDeleteConfirm(null);
        }
    };

    const filteredPeople = people.filter((person) =>
        person.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-4xl font-bold">👥 จัดการผู้ใช้</h1>
                    <Link
                        href="/"
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
                    >
                        🏠 กลับหน้าแรก
                    </Link>
                </div>

                {/* Search */}
                <div className="mb-6">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="🔍 ค้นหาชื่อ..."
                        className="w-full max-w-md px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                </div>

                {/* Stats */}
                <div className="mb-6 text-lg">
                    <span className="text-gray-400">ผู้ใช้ทั้งหมด:</span>{' '}
                    <span className="text-blue-400 font-bold">{filteredPeople.length}</span>{' '}
                    {searchQuery && <span className="text-gray-500">(จากทั้งหมด {people.length})</span>}
                </div>

                {/* Content */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        <p className="mt-4 text-gray-400">กำลังโหลดข้อมูล...</p>
                    </div>
                ) : filteredPeople.length === 0 ? (
                    <div className="bg-gray-800 rounded-lg p-12 text-center">
                        <p className="text-2xl text-gray-400">😔 ไม่พบผู้ใช้</p>
                        <p className="mt-2 text-gray-500">
                            {searchQuery ? 'ลองค้นหาใหม่' : 'ยังไม่มีผู้ใช้ลงทะเบียน'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPeople.map((person) => (
                            <div
                                key={person.id}
                                className="bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow"
                            >
                                {/* Person Info */}
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-blue-400">
                                            {person.name}
                                        </h3>
                                        <p className="text-sm text-gray-400 mt-1">
                                            📅{' '}
                                            {new Date(person.createdAt).toLocaleDateString('th-TH', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                            })}
                                        </p>
                                    </div>
                                    <span className="px-3 py-1 bg-green-600 text-green-100 rounded-full text-sm font-medium">
                                        {person.photoCount} รูป
                                    </span>
                                </div>

                                {/* Photo Preview */}
                                <div className="mb-4">
                                    <div className="grid grid-cols-3 gap-2">
                                        {[1, 2, 3].map((i) => (
                                            <img
                                                key={i}
                                                src={`/labeled_images/${person.name}/${i}.jpg`}
                                                alt={`${person.name} photo ${i}`}
                                                className="w-full h-20 object-cover rounded border-2 border-gray-700"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Actions */}
                                <button
                                    onClick={() => setDeleteConfirm(person)}
                                    className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
                                >
                                    🗑️ ลบผู้ใช้
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {deleteConfirm && (
                    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                        <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full shadow-2xl">
                            <h2 className="text-2xl font-bold text-red-400 mb-4">
                                ⚠️ ยืนยันการลบ
                            </h2>
                            <p className="text-gray-300 mb-6">
                                คุณแน่ใจหรือไม่ว่าต้องการลบ{' '}
                                <span className="font-bold text-blue-400">{deleteConfirm.name}</span>?
                                <br />
                                <br />
                                การกระทำนี้จะลบ:
                                <ul className="list-disc list-inside mt-2 text-yellow-300">
                                    <li>ข้อมูลผู้ใช้</li>
                                    <li>รูปภาพทั้งหมด ({deleteConfirm.photoCount} รูป)</li>
                                    <li>ไม่สามารถกู้คืนได้</li>
                                </ul>
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold transition-colors"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    onClick={() => handleDelete(deleteConfirm.id, deleteConfirm.name)}
                                    className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors"
                                >
                                    ยืนยันลบ
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
