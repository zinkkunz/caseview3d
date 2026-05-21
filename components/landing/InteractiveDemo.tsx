'use client';

import { Canvas, useLoader, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import * as THREE from 'three';
import React, { useState, useRef, Suspense, useEffect, useMemo } from 'react';
import { Ruler, RotateCcw, HelpCircle, Eye } from 'lucide-react';

// --- 3D 뷰어 자체 샌드박싱용 에러 경계 컴포넌트 ---
interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback: (error: Error) => React.ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

class ThreeErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("[3D Viewer ErrorBoundary] Caught an error during R3F rendering:", error, errorInfo);
    }

    render() {
        if (this.state.hasError && this.state.error) {
            return this.props.fallback(this.state.error);
        }
        return this.props.children;
    }
}

interface LayoutState {
    modelScale: number;
    centerOffset: THREE.Vector3;
}

// --- 카메라 추적 3포인트 조명 (Scene.tsx의 ThreePointLighting과 동일한 아키텍처) ---
// group의 position/quaternion을 카메라에 실시간 동기화하여 어떤 각도에서도 형태 경계가 선명하게 유지됩니다.
function DemoThreePointLighting() {
    const groupRef = useRef<THREE.Group>(null);

    useFrame(({ camera }) => {
        if (groupRef.current) {
            // position/quaternion copy는 new THREE.Vector3() 할당이 없으므로 GC Zero 보증
            groupRef.current.position.copy(camera.position);
            groupRef.current.quaternion.copy(camera.quaternion);
        }
    });

    return (
        <group ref={groupRef}>
            <directionalLight position={[10, 10, 10]} intensity={1.0} castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0005} />
            <directionalLight position={[-10, 0, 10]} intensity={0.5} />
            <directionalLight position={[0, 10, -10]} intensity={0.5} />
        </group>
    );
}

// 3D 치아 스캔 모델을 렌더링하는 내부 컴포넌트
function DemoModel({ url, onPointSelected }: { url: string; onPointSelected: (point: THREE.Vector3) => void }) {
    const geometry = useLoader(STLLoader, url);
    
    // [State Lock 아키텍처 - 영구 상태 잠금 및 방어적 기하 계산]
    // useMemo를 전면 폐기하고, useState 지연 초기화(Lazy Initialization)를 통해 컴포넌트 최초 마운트 시 단 1회만 기하학적 형상을 해석하여 상태값에 잠급니다.
    const [layout] = useState<LayoutState>(() => {
        // 노멀 연산 명시 (입체 명암 생성 보증)
        if (!geometry.attributes.normal) {
            geometry.computeVertexNormals();
        }

        // 이미 바운딩 박스가 계산되어 있다면 중복 연산 배제하여 경합 방어
        if (!geometry.boundingBox) {
            geometry.computeBoundingBox();
        }
        const boundingBox = geometry.boundingBox;
        const center = new THREE.Vector3();
        if (boundingBox) {
            boundingBox.getCenter(center);
        }

        // 이미 바운딩 스피어가 계산되어 있다면 중복 연산 배제
        if (!geometry.boundingSphere) {
            geometry.computeBoundingSphere();
        }
        const sphere = geometry.boundingSphere;
        let scale = 1;
        if (sphere && sphere.radius > 0) {
            const targetRadius = 2.8;
            scale = targetRadius / sphere.radius;
        }

        console.log("[3D DemoModel State Lock Active Log]");
        console.log(" - Loaded scan vertices count:", geometry.attributes.position?.count);
        console.log(" - BoundingBox calculated center:", center);
        console.log(" - BoundingSphere calculated radius:", sphere?.radius);
        console.log(" - Derived Scale Factor (State Locked):", scale);

        return {
            modelScale: scale,
            centerOffset: center.clone().multiplyScalar(-1) // 원래 geometry 바운딩 박스 보존을 위해 클론 후 연산
        };
    });

    return (
        // [수학적/기하학적 샌드박싱]
        // mesh 내부의 position 이동(centerOffset)과 group의 scale 연산을 이중 레이어로 완벽 격리!
        // 영구적으로 고정 잠금된 layout 상태값을 원시 수치 배열 형태로 주입하여 Three.js 트랜스폼 행렬 오차 누적을 원천 격리합니다.
        <group scale={[layout.modelScale, layout.modelScale, layout.modelScale]}>
            <mesh 
                geometry={geometry} 
                dispose={null} // [R3F 캐시 보호] 컴포넌트 마운트 해제 시 geometry가 dispose()되어 캐시 붕괴 및 모델이 증발하는 현상 영구 예방
                // 원시 값 배열 [x, y, z] 형태로 직접 바인딩하여 리렌더링 시 R3F 인스턴스 오버라이트 차단
                position={[layout.centerOffset.x, layout.centerOffset.y, layout.centerOffset.z]} 
                castShadow 
                receiveShadow
                onClick={(e) => {
                    e.stopPropagation();
                    // Raycast 교차 좌표 전달 (월드 좌표계 그대로 전달)
                    if (e.point) {
                        onPointSelected(e.point.clone());
                    }
                }}
            >
                {/* 실제 케이스 뷰어(Model.tsx)와 동일한 PBR 덴탈 베이지 스캔 재질 적용 */}
                <meshPhysicalMaterial 
                    color="#E6C9A8"       // 덴탈 베이지 (실제 뷰어 기본색과 동일)
                    metalness={0.0}
                    roughness={0.6}       // 스캔 모델 특유의 반무광 질감
                    specularIntensity={0.3}
                    clearcoat={0.0}
                    clearcoatRoughness={0.0}
                    envMapIntensity={0.4}
                    side={THREE.DoubleSide}
                />
            </mesh>
        </group>
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

    const renderErrorFallback = (error: Error) => (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-red-50/20 dark:bg-red-950/10 text-center transition-all">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 mb-3 animate-bounce">
                <HelpCircle size={24} />
            </div>
            <h3 className="text-sm font-black text-gray-900 dark:text-white mb-1.5">
                3D 기공 데모 엔진 로딩 불가
            </h3>
            <p className="text-[11px] text-red-600 dark:text-red-400 max-w-sm font-semibold mb-4 bg-white dark:bg-gray-900 border border-red-100 dark:border-red-900/30 px-3 py-2 rounded-xl break-all">
                {error.message || "3D 모델 리소스를 가져오거나 WebGL 컨텍스트를 초기화할 수 없습니다."}
            </p>
            <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow-md transition-all active:scale-95"
            >
                새로고침하여 재시도
            </button>
        </div>
    );

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
                    <ThreeErrorBoundary fallback={renderErrorFallback}>
                        <Suspense fallback={
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                                <span className="w-8 h-8 rounded-full border-2 border-dashed border-blue-600 animate-spin"></span>
                                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest animate-pulse">Loading 3D Engine...</span>
                            </div>
                        }>
                            {/* camera 설정을 Canvas의 속성으로 초기 영구 고정하여 OrbitControls 시점 뒤틀림 원천 제어 */}
                            <Canvas 
                                shadows
                                gl={{ antialias: true }} 
                                camera={{ position: [0, 3.5, 4.5], fov: 45 }}
                                onPointerOver={() => setIsHovered(true)}
                                onPointerOut={() => setIsHovered(false)}
                                className="w-full h-full cursor-grab active:cursor-grabbing"
                            >
                                <color attach="background" args={['#f8fafc']} />
                                
                                {/* 실제 케이스 뷰어(Scene.tsx)와 동일한 카메라 추적 3포인트 조명 시스템 */}
                                <ambientLight intensity={0.2} />
                                <DemoThreePointLighting />
                                
                                <DemoModel url="/samples/demo-scan.stl" onPointSelected={handlePointSelected} />
                                <MeasurementOverlay points={points} />
                                
                                <OrbitControls 
                                    rotateSpeed={1.0}
                                    maxDistance={15}
                                    minDistance={2}
                                    makeDefault
                                />
                            </Canvas>
                        </Suspense>
                    </ThreeErrorBoundary>

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


