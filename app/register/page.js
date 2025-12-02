'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
    const router = useRouter();
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const faceApiRef = useRef(null);

    const [name, setName] = useState('');
    const [capturedImages, setCapturedImages] = useState([]);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [cameraReady, setCameraReady] = useState(false);
    const [status, setStatus] = useState('กำลังโหลดโมเดล...');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [faceDetected, setFaceDetected] = useState(false);

    // Load face-api models
    useEffect(() => {
        const loadModels = async () => {
            try {
                const faceapiModule = await import('face-api.js');
                const faceapi = faceapiModule.default || faceapiModule;
                faceApiRef.current = faceapi;

                const MODEL_URL = '/models';
                await Promise.all([
                    faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
                    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
                ]);

                setModelsLoaded(true);
                setStatus('เปิดกล้อง...');
            } catch (error) {
                console.error('Error loading models:', error);
                setStatus('เกิดข้อผิดพลาดในการโหลดโมเดล');
            }
        };
        loadModels();
    }, []);

    // Start camera when models are loaded
    useEffect(() => {
        if (modelsLoaded) {
            startCamera();
        }
    }, [modelsLoaded]);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 720, height: 560 }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setCameraReady(true);
                setStatus('พร้อมถ่ายรูป! ตรวจสอบว่าเห็นหน้าชัดเจน');
            }
        } catch (error) {
            console.error('Error accessing camera:', error);
            setStatus('ไม่สามารถเข้าถึงกล้องได้');
        }
    };

    // Detect faces continuously
    const handleVideoPlay = () => {
        const faceapi = faceApiRef.current;
        if (!faceapi) return;

        setInterval(async () => {
            if (!videoRef.current || !canvasRef.current) return;

            const displaySize = {
                width: videoRef.current.width,
                height: videoRef.current.height
            };

            faceapi.matchDimensions(canvasRef.current, displaySize);

            const detections = await faceapi.detectAllFaces(videoRef.current);
            const resizedDetections = faceapi.resizeResults(detections, displaySize);

            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw face boxes
            resizedDetections.forEach((detection) => {
                const box = detection.box;
                ctx.strokeStyle = '#00ff00';
                ctx.lineWidth = 3;
                ctx.strokeRect(box.x, box.y, box.width, box.height);
            });

            setFaceDetected(resizedDetections.length > 0);
        }, 100);
    };

    // Capture photo
    const capturePhoto = () => {
        if (!videoRef.current || !faceDetected) {
            alert('กรุณาตรวจสอบว่าเห็นหน้าชัดเจนก่อนถ่ายรูป');
            return;
        }

        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoRef.current, 0, 0);

        const imageData = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedImages([...capturedImages, imageData]);
        setStatus(`ถ่ายรูปแล้ว ${capturedImages.length + 1} รูป`);
    };

    // Remove photo
    const removePhoto = (index) => {
        const newImages = capturedImages.filter((_, i) => i !== index);
        setCapturedImages(newImages);
        setStatus(newImages.length > 0 ? `มี ${newImages.length} รูป` : 'พร้อมถ่ายรูป!');
    };

    // Submit registration
    const handleSubmit = async () => {
        if (!name.trim()) {
            alert('กรุณากรอกชื่อ');
            return;
        }

        if (capturedImages.length === 0) {
            alert('กรุณาถ่ายรูปอย่างน้อย 1 รูป');
            return;
        }

        setIsSubmitting(true);
        setStatus('กำลังลงทะเบียน...');

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name.trim(),
                    images: capturedImages,
                }),
            });

            const result = await response.json();

            if (result.success) {
                alert(`✅ ลงทะเบียน ${name} สำเร็จ!`);
                router.push('/');
            } else {
                alert(`❌ เกิดข้อผิดพลาด: ${result.error}`);
                setStatus('เกิดข้อผิดพลาด ลองใหม่อีกครั้ง');
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert('เกิดข้อผิดพลาดในการลงทะเบียน');
            setStatus('เกิดข้อผิดพลาด');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-4xl font-bold">➕ ลงทะเบียนคนใหม่</h1>
                    <Link
                        href="/"
                        className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors"
                    >
                        ❌ ยกเลิก
                    </Link>
                </div>

                {/* Status */}
                <div className="mb-6 text-center">
                    <p className="text-xl text-yellow-400">{status}</p>
                    {faceDetected && (
                        <p className="text-green-400 mt-2">✓ ตรวจพบใบหน้า</p>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left: Camera */}
                    <div>
                        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
                            <h2 className="text-2xl font-bold mb-4">📷 กล้อง</h2>
                            <div className="relative">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    muted
                                    width="720"
                                    height="560"
                                    onPlay={handleVideoPlay}
                                    className="rounded-lg w-full border-2 border-gray-700"
                                />
                                <canvas
                                    ref={canvasRef}
                                    className="absolute top-0 left-0 w-full h-full"
                                />
                            </div>

                            <button
                                onClick={capturePhoto}
                                disabled={!cameraReady || !faceDetected}
                                className={`mt-4 w-full px-6 py-4 rounded-lg font-bold text-lg transition-colors ${cameraReady && faceDetected
                                        ? 'bg-blue-600 hover:bg-blue-700'
                                        : 'bg-gray-600 cursor-not-allowed'
                                    }`}
                            >
                                📸 ถ่ายรูป
                            </button>
                        </div>
                    </div>

                    {/* Right: Form & Gallery */}
                    <div className="space-y-6">
                        {/* Name Input */}
                        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
                            <h2 className="text-2xl font-bold mb-4">👤 ข้อมูล</h2>
                            <label className="block mb-2 font-semibold">ชื่อ</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="กรอกชื่อ..."
                                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-lg"
                            />
                        </div>

                        {/* Captured Photos */}
                        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
                            <h2 className="text-2xl font-bold mb-4">
                                📸 รูปที่ถ่าย ({capturedImages.length})
                            </h2>
                            {capturedImages.length === 0 ? (
                                <p className="text-gray-400 text-center py-8">
                                    ยังไม่มีรูป<br />
                                    <span className="text-sm">แนะนำ: ถ่าย 3-5 รูปในท่าต่างๆ</span>
                                </p>
                            ) : (
                                <div className="grid grid-cols-2 gap-4">
                                    {capturedImages.map((img, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={img}
                                                alt={`Photo ${index + 1}`}
                                                className="rounded-lg w-full border-2 border-gray-600"
                                            />
                                            <button
                                                onClick={() => removePhoto(index)}
                                                className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                ✕
                                            </button>
                                            <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 px-2 py-1 rounded text-sm">
                                                รูปที่ {index + 1}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !name.trim() || capturedImages.length === 0}
                            className={`w-full px-6 py-4 rounded-lg font-bold text-lg transition-colors ${!isSubmitting && name.trim() && capturedImages.length > 0
                                    ? 'bg-green-600 hover:bg-green-700'
                                    : 'bg-gray-600 cursor-not-allowed'
                                }`}
                        >
                            {isSubmitting ? '⏳ กำลังลงทะเบียน...' : '✅ ลงทะเบียน'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
