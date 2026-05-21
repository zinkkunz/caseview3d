'use client';

import { Canvas, useLoader, useThree } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import * as THREE from 'three';
import { useState, useRef, Suspense, useEffect } from 'react';
import { Ruler, RotateCcw, HelpCircle, Eye } from 'lucide-react';

// 3D 치아 스캔 모델을 렌더링하는 내부 컴포넌트
function DemoModel({ url, onPointSelected }: { url: string; onPointSelected: (point: THREE.Vector3) => void }) {
    const geometry = useLoader(STLLoader, url);
    const [modelScale, setModelScale] = useState<number>(1);
    
    // 노멀 연산 명시 (입체 명암 생성 보증)
    if (geometry && !geometry.attributes.normal) {
        geometry.computeVertexNormals();
    }

    // 모델을 캔버스 중앙 정렬 및 스케일 조정
    useEffect(() => {
        if (geometry) {
            geometry.center();
            geometry.computeBoundingSphere();
            const sphere = geometry.boundingSphere;
            if (sphere && sphere.radius > 0) {
                // 모델이 캔버스 크기에 알맞게 맞추어지도록 스케일 비율 계산
                const targetRadius = 2.8;
                const ratio = targetRadius / sphere.radius;
                setModelScale(ratio);
            }
        }
    }, [geometry]);

    return (
        <mesh 
            geometry={geometry} 
            scale={modelScale}
            castShadow 
            receiveShadow
            onClick={(e) => {
                e.stopPropagation();
                // Raycast 교차 좌표 전달
                if (e.point) {
                    onPointSelected(e.point.clone());
                }
            }}
        >
            <meshPhongMaterial 
                color="#E2E8F0" 
                shininess={45} 
                specular={new THREE.Color('#94A3B8')}
                side={THREE.DoubleSide} 
            />
        </mesh>
    );
}

// 핀 및 측정 선을 렌더링하는 컴포넌트
function MeasurementOverlay({ points }: { points: THREE.Vector3[] }) {
    return (
        <>
            {points.map((pt, idx) => (
                <mesh key={idx} position={pt}>
                    <sphereGeometry args={[0.08, 16, 16]} />
                    <meshBasicMaterial color="#0061FF" depthTest={false} />
                    <Html distanceFactor={5} position={[0, 0.15, 0]} center>
                        <div className="bg-[#0061FF] text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-lg uppercase tracking-wider select-none whitespace-nowrap">
                            Pin {idx + 1}
                        </div>
                    </Html>
                </mesh>
            ))}
            {points.length === 2 && (
                <LineBetweenPoints start={points[0]} end={points[1]} />
            )}
        </>
    );
}

// 두 핀 사이에 거리를 그리는 컴포넌트
function LineBetweenPoints({ start, end }: { start: THREE.Vector3; end: THREE.Vector3 }) {
    const pointsRef = useRef<THREE.BufferGeometry>(null);

    useEffect(() => {
        if (pointsRef.current) {
            pointsRef.current.setFromPoints([start, end]);
        }
    }, [start, end]);

    const distance = start.distanceTo(end) * 10; // 스케일 대조 실무 mm 환산 (보통 stl 1단위 = 1mm)
    const midPoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);

    return (
        <>
            <line>
                <bufferGeometry ref={pointsRef} />
                <lineBasicMaterial color="#0061FF" linewidth={2.5} depthTest={false} />
            </line>
            <Html position={midPoint} center distanceFactor={6}>
                <div className="bg-white dark:bg-gray-900 border border-blue-100 dark:border-gray-800 shadow-xl px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 select-none animate-bounce">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping"></span>
                    <span className="text-gray-900 dark:text-gray-100 text-xs font-black tracking-tight whitespace-nowrap">
                        {distance.toFixed(2)} mm
                    </span>
                </div>
            </Html>
        </>
    );
}

// 캔버스 조작 관리를 위한 내부 카메라 튜닝 컴포넌트
function SceneSettings() {
    const { camera } = useThree();
    useEffect(() => {
        camera.position.set(0, 4, 5);
        camera.lookAt(0, 0, 0);
    }, [camera]);
    return null;
}

export default function InteractiveDemo() {
    const [mounted, setMounted] = useState(false);
    const [isRulerActive, setIsRulerActive] = useState(false);
    const [points, setPoints] = useState<THREE.Vector3[]>([]);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // 핀 꽂기 로직 (최대 2개)
    const handlePointSelected = (point: THREE.Vector3) => {
        if (!isRulerActive) return;
        
        setPoints((prev) => {
            if (prev.length >= 2) {
                return [point]; // 3번째 클릭 시 리셋 후 첫 핀으로 설정
            }
            return [...prev, point];
        });
    };

    const resetMeasurement = () => {
        setPoints([]);
    };

    if (!mounted) {
        return (
            <section 
                id="interactive-demo"
                className="py-16 bg-gray-50/50 dark:bg-black/30 border-y border-gray-100/50 dark:border-gray-800/50 transition-all"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10">
                        <div className="inline-block px-3 py-1 mb-3 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold tracking-wider uppercase animate-pulse">
                            Interactive Live Preview
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                            로그인 없이 즉시 체험하는 3D 뷰어
                        </h2>
                        <p className="mt-3 text-sm md:text-base text-gray-500 max-w-xl mx-auto font-light leading-relaxed">
                            화면 속 잇몸 스캔 데이터를 직접 돌려보고 측정해 보세요.<br />
                            당사의 압도적인 웹 3D 렌더링 퍼포먼스를 즉각 체감할 수 있습니다.
                        </p>
                    </div>

                    <div className="max-w-5xl mx-auto h-[450px] md:h-[600px] w-full bg-white dark:bg-[#0A0A0A] rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,97,255,0.06)] border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center gap-3">
                        <span className="w-8 h-8 rounded-full border-2 border-dashed border-blue-600 animate-spin"></span>
                        <span className="text-xs text-gray-400 font-bold uppercase tracking-widest animate-pulse">Loading 3D Engine...</span>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section 
            id="interactive-demo"
            className="py-16 bg-gray-50/50 dark:bg-black/30 border-y border-gray-100/50 dark:border-gray-800/50 transition-all"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10">
                    <div className="inline-block px-3 py-1 mb-3 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold tracking-wider uppercase">
                        Interactive Live Preview
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                        로그인 없이 즉시 체험하는 3D 뷰어
                    </h2>
                    <p className="mt-3 text-sm md:text-base text-gray-500 max-w-xl mx-auto font-light leading-relaxed">
                        화면 속 잇몸 스캔 데이터를 직접 돌려보고 측정해 보세요.<br />
                        당사의 압도적인 웹 3D 렌더링 퍼포먼스를 즉각 체감할 수 있습니다.
                    </p>
                </div>

                {/* 3D 뷰어 데모 컨테이너 */}
                <div className="max-w-5xl mx-auto h-[450px] md:h-[600px] w-full bg-white dark:bg-[#0A0A0A] rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,97,255,0.06)] border border-gray-100 dark:border-gray-800 relative overflow-hidden group">
                    <Suspense fallback={
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                            <span className="w-8 h-8 rounded-full border-2 border-dashed border-blue-600 animate-spin"></span>
                            <span className="text-xs text-gray-400 font-bold uppercase tracking-widest animate-pulse">Loading 3D Engine...</span>
                        </div>
                    }>
                        <Canvas 
                            shadows 
                            gl={{ antialias: true }} 
                            onPointerOver={() => setIsHovered(true)}
                            onPointerOut={() => setIsHovered(false)}
                            className="w-full h-full cursor-grab active:cursor-grabbing"
                        >
                            <color attach="background" args={['#f8fafc']} />
                            <ambientLight intensity={0.7} />
                            <directionalLight 
                                position={[5, 10, 5]} 
                                intensity={1.2} 
                                castShadow 
                                shadow-mapSize={[2048, 2048]} 
                            />
                            <pointLight position={[-5, 5, -5]} intensity={0.6} />
                            
                            <DemoModel url="/samples/demo-scan.stl" onPointSelected={handlePointSelected} />
                            <MeasurementOverlay points={points} />
                            <SceneSettings />
                            
                            <OrbitControls 
                                enableDamping 
                                dampingFactor={0.06} 
                                rotateSpeed={0.8}
                                maxDistance={15}
                                minDistance={2}
                                makeDefault
                            />
                        </Canvas>
                    </Suspense>

                    {/* 오버레이 가이드 및 조작 패널 */}
                    <div className="absolute top-4 left-4 z-30 pointer-events-none flex flex-col gap-2">
                        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-100/50 dark:border-gray-800/50 shadow-md px-3.5 py-2.5 rounded-2xl max-w-[200px] sm:max-w-xs transition-opacity duration-300">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                                <HelpCircle size={12} className="text-blue-500" /> Control Guide
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                                {isRulerActive 
                                    ? "치아 모델 표면을 2곳 클릭하면 두 점 사이의 거리가 mm 단위로 계산됩니다."
                                    : "마우스나 손가락 드래그로 회전하고 휠로 확대/축소해 보세요."
                                }
                            </p>
                        </div>
                    </div>

                    {/* 조작 액션 툴바 */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-100/50 dark:border-gray-800/50 shadow-[0_16px_32px_-8px_rgba(0,0,0,0.06)] px-4 py-3 rounded-2xl pointer-events-auto">
                        <button
                            onClick={() => {
                                setIsRulerActive(!isRulerActive);
                                resetMeasurement();
                            }}
                            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
                                isRulerActive 
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none" 
                                    : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`}
                        >
                            <Ruler size={14} />
                            <span>측정 {isRulerActive ? "ON" : "OFF"}</span>
                        </button>
                        
                        {(points.length > 0) && (
                            <button
                                onClick={resetMeasurement}
                                className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-500 hover:text-gray-950 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                title="측정 초기화"
                            >
                                <RotateCcw size={14} />
                            </button>
                        )}
                        
                        <div className="w-[1px] h-4 bg-gray-100 dark:bg-gray-800"></div>

                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider select-none whitespace-nowrap">
                            Demo Mode
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}
