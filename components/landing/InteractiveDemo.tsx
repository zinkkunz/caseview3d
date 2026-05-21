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

// [카메라 종속 실시간 추적 조명 - 3Shape CAD 판독 명암비의 본질]
// 모델을 360도 마우스로 돌리더라도 카메라 시선의 우상단에서 메인 평행광이 함께 회전 추적하여,
// 치아 경계선(Margin Line)과 교합 굴곡의 엣지 그림자가 항상 극도로 선명하고 일관되게 생성되도록 보장합니다.
function CameraTrackingLight() {
    const lightRef = useRef<THREE.DirectionalLight>(null);

    useFrame(({ camera }) => {
        if (lightRef.current) {
            // 카메라의 현재 쿼터니언을 적용해 로컬 우측 및 상측 방향 벡터 추출
            const rightVec = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
            const upVec = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion);

            // 카메라 좌표를 기준으로 우상단 오프셋을 더해 라이트 위치 실시간 갱신
            lightRef.current.position.copy(camera.position);
            lightRef.current.position.addScaledVector(rightVec, 2.0);
            lightRef.current.position.addScaledVector(upVec, 2.0);
        }
    });

    return (
        <directionalLight
            ref={lightRef}
            intensity={1.8} // 명암비 대비를 극대화하는 강한 강도 부여
            color="#ffffff"
            castShadow
            shadow-bias={-0.0005}
        />
    );
}

// 3D 치아 스캔 모델을 렌더링하는 내부 컴포넌트
function DemoModel({ url, onPointSelected }: { url: string; onPointSelected: (point: THREE.Vector3) => void }) {
    const geometry = useLoader(STLLoader, url);
    
    // [State Lock 아키텍처 - 영구 상태 잠금]
    // useMemo를 전면 폐기하고, useState 지연 초기화(Lazy Initialization)를 통해 컴포넌트 최초 마운트 시 단 1회만 기하학적 형상을 해석하여 상태값에 잠급니다.
    const [layout] = useState<LayoutState>(() => {
        // 노멀 연산 명시 (입체 명암 생성 보증)
        if (!geometry.attributes.normal) {
            geometry.computeVertexNormals();
        }

        // 3D 모델의 꼭짓점을 강제로 변형(center)시키지 않고, 바운딩 박스를 통해 중앙 오프셋 계산
        geometry.computeBoundingBox();
        const boundingBox = geometry.boundingBox;
        const center = new THREE.Vector3();
        if (boundingBox) {
            boundingBox.getCenter(center);
        }

        // 바운딩 스피어 반경을 기반으로 메시 자체의 스케일 팩터 산출
        geometry.computeBoundingSphere();
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
                {/* 3Shape 정품 CAD 뷰어 특유의 화사하고 입체 선명도가 압도적인 덴탈 석고(Stone) 질감 완벽 이식 */}
                {/* MeshPhongMaterial로 전환하여 엣지가 젖은 듯 정교하고 날카로운 반사 하이라이트막을 형성합니다. */}
                <meshPhongMaterial 
                    color="#D8C49F" // 3Shape 시그니처 덴탈 골드-베이지 옐로우 톤 적용
                    shininess={38}  // 빛번짐 없이 하이라이트가 작고 부드럽게 맺혀 외곽 곡선이 뚜렷해짐
                    specular="#EAD9BB" // 한 톤 더 밝고 따뜻한 골드 스펙큘러 조율로 화사함 극대화
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
                                gl={{ antialias: true }} 
                                camera={{ position: [0, 3.5, 4.5], fov: 45 }}
                                onPointerOver={() => setIsHovered(true)}
                                onPointerOut={() => setIsHovered(false)}
                                className="w-full h-full cursor-grab active:cursor-grabbing"
                            >
                                <color attach="background" args={['#f8fafc']} />
                                
                                {/* [3Shape 명품 CAD 뷰어 명암/선명도 수렴 극대 대비 조명 아키텍처] */}
                                {/* 1. 극도로 낮춘 주변광: 전체 뭉개짐을 피하고 입체 그림자 골을 깊게 형성 */}
                                <ambientLight intensity={0.15} />
                                
                                {/* 2. 상부 보조광: 모델 전체의 고른 수직 입체 볼륨 기본값 형성 */}
                                <directionalLight 
                                    position={[0, 10, 0]} 
                                    intensity={0.45} 
                                />
                                
                                {/* 3. 카메라 실시간 추적 조명: 회전해도 형태 경계가 날카롭게 가시화되는 CAD 최적화 핵심 */}
                                <CameraTrackingLight />
                                
                                <DemoModel url="/samples/demo-scan.stl" onPointSelected={handlePointSelected} />
                                <MeasurementOverlay points={points} />
                                
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


