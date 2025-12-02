'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export default function Home() {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [faceMatcher, setFaceMatcher] = useState(null);
    const [status, setStatus] = useState('Loading models...');
    const [lastCheckIn, setLastCheckIn] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const faceApiRef = useRef(null);
    const scanIntervalRef = useRef(null);

    useEffect(() => {
        const loadModels = async () => {
            try {
                const faceapiModule = await import('face-api.js');
                const faceapi = faceapiModule.default || faceapiModule;
                faceApiRef.current = faceapi;

                const MODEL_URL = '/models';
                console.log('Loading models from', MODEL_URL);

                if (!faceapi.nets) {
                    throw new Error("faceapi.nets is undefined. Import failed.");
                }

                await Promise.all([
                    faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
                    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
                ]);
                setModelsLoaded(true);
                setStatus('Models loaded. Loading labeled images...');
            } catch (error) {
                console.error('Error loading models:', error);
                setStatus(`Error loading models: ${error.message}`);
            }
        };
        loadModels();
    }, []);

    useEffect(() => {
        if (modelsLoaded) {
            startVideo();
            loadLabeledImages();
        }
    }, [modelsLoaded]);

    // Cleanup interval on unmount
    useEffect(() => {
        return () => {
            if (scanIntervalRef.current) {
                clearInterval(scanIntervalRef.current);
            }
        };
    }, []);

    const startVideo = () => {
        navigator.mediaDevices
            .getUserMedia({ video: {} })
            .then((stream) => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            })
            .catch((err) => {
                console.error('Error opening video:', err);
                setStatus('Error accessing camera.');
            });
    };

    const loadLabeledImages = async () => {
        const faceapi = faceApiRef.current;
        if (!faceapi) return;

        try {
            // Fetch registered people from API
            const response = await fetch('/api/people');
            const result = await response.json();

            if (!result.success || result.data.length === 0) {
                setStatus('ไม่พบผู้ใช้ที่ลงทะเบียน กรุณาลงทะเบียนก่อน');
                return;
            }

            const labels = result.data.map(person => person.name);

            const labeledFaceDescriptors = await Promise.all(
                labels.map(async (label) => {
                    const descriptions = [];

                    // Try loading multiple images (up to 10)
                    for (let i = 1; i <= 10; i++) {
                        try {
                            const img = await faceapi.fetchImage(`/labeled_images/${label}/${i}.jpg`);
                            const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
                            if (detections) {
                                descriptions.push(detections.descriptor);
                            }
                        } catch (e) {
                            // Image doesn't exist, stop trying
                            break;
                        }
                    }

                    if (descriptions.length > 0) {
                        return new faceapi.LabeledFaceDescriptors(label, descriptions);
                    }
                    return null;
                })
            );

            const validDescriptors = labeledFaceDescriptors.filter(d => d !== null);
            if (validDescriptors.length > 0) {
                setFaceMatcher(new faceapi.FaceMatcher(validDescriptors, 0.6));
                setStatus('พร้อมสแกนใบหน้า - กดปุ่ม "เริ่มสแกน" เพื่อเริ่มต้น');
            } else {
                setStatus('ไม่สามารถโหลดข้อมูลใบหน้าได้');
            }
        } catch (error) {
            console.error('Error loading labeled images:', error);
            setStatus('เกิดข้อผิดพลาดในการโหลดข้อมูล');
        }
    };

    const startScanning = () => {
        const faceapi = faceApiRef.current;
        if (!faceapi || !faceMatcher) {
            alert('กรุณารอให้โหลดข้อมูลเสร็จก่อน');
            return;
        }

        setIsScanning(true);
        setStatus('🔍 กำลังสแกนใบหน้า...');

        scanIntervalRef.current = setInterval(async () => {
            if (!videoRef.current || !canvasRef.current) return;

            const displaySize = {
                width: videoRef.current.width,
                height: videoRef.current.height
            };

            faceapi.matchDimensions(canvasRef.current, displaySize);

            const detections = await faceapi.detectAllFaces(videoRef.current)
                .withFaceLandmarks()
                .withFaceDescriptors();

            const resizedDetections = faceapi.resizeResults(detections, displaySize);

            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor));

            results.forEach((result, i) => {
                const box = resizedDetections[i].detection.box;
                const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() });
                drawBox.draw(canvas);

                if (result.label !== 'unknown') {
                    checkIn(result.label);
                }
            });
        }, 1000);
    };

    const stopScanning = () => {
        if (scanIntervalRef.current) {
            clearInterval(scanIntervalRef.current);
            scanIntervalRef.current = null;
        }
        setIsScanning(false);
        setStatus('หยุดสแกนแล้ว - กดปุ่ม "เริ่มสแกน" เพื่อเริ่มใหม่');

        // Clear canvas
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
    };

    const checkIn = async (name) => {
        try {
            const res = await fetch('/api/check-in', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            });
            const data = await res.json();
            if (data.status === 'success') {
                console.log('Checked in:', name);
                setLastCheckIn(`${name} at ${new Date().toLocaleTimeString()}`);
            }
        } catch (e) {
            console.error('Check-in failed', e);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
            <h1 className="text-3xl font-bold mb-4">Face Attendance</h1>

            {/* Navigation Buttons */}
            <div className="flex gap-4 mb-4">
                <Link
                    href="/register"
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors"
                >
                    ➕ ลงทะเบียนคนใหม่
                </Link>
                <Link
                    href="/history"
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
                >
                    📊 ดูประวัติการเช็คชื่อ
                </Link>
            </div>

            <div className="mb-6 flex flex-col items-center gap-4">
                <p className="text-xl text-yellow-400 font-semibold">{status}</p>

                {!isScanning ? (
                    <button
                        onClick={startScanning}
                        disabled={!modelsLoaded || !faceMatcher}
                        className={`px-8 py-3 rounded-full font-bold text-lg shadow-lg transition-all transform hover:scale-105 ${modelsLoaded && faceMatcher
                                ? 'bg-green-500 hover:bg-green-600 text-white'
                                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        ▶ เริ่มสแกน
                    </button>
                ) : (
                    <button
                        onClick={stopScanning}
                        className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full font-bold text-lg shadow-lg transition-all transform hover:scale-105 animate-pulse"
                    >
                        ⏹ หยุดสแกน
                    </button>
                )}
            </div>

            {lastCheckIn && <p className="mb-4 text-green-400 text-lg font-mono">Last Check-in: {lastCheckIn}</p>}

            <div className="relative">
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    width="720"
                    height="560"
                    className="rounded-lg shadow-2xl border-4 border-gray-700"
                />
                <canvas
                    ref={canvasRef}
                    className="absolute top-0 left-0"
                />
            </div>
        </div>
    );
}
