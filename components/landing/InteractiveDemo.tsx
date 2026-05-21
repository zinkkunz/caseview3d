'use client';

import { Canvas, useLoader } from '@react-three/fiber';
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

// 3D 치아 스캔 모델을 렌더링하는 내부 컴포넌트
function DemoModel({ url, onPointSelected }: { url: string; onPointSelected: (point: THREE.Vector3) => void }) {
    const geometry = useLoader(STLLoader, url);
    
    // geometry가 메모리에 캐싱되므로, 단 1회만 계산하여 렌더링에 매핑 (데이터 원본 훼손 100% 차단)
    const { modelScale, centerOffset } = useMemo(() => {
        if (!geometry) return { modelScale: 1, centerOffset: new THREE.Vector3() };

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

        console.log("[3D DemoModel Debug Log]");
        console.log(" - Loaded scan vertices count:", geometry.attributes.position?.count);
        console.log(" - BoundingBox calculated center:", center);
        console.log(" - BoundingSphere calculated radius:", sphere?.radius);
        console.log(" - Derived Scale Factor:", scale);

        return {
            modelScale: scale,
            centerOffset: center.clone().multiplyScalar(-1) // 원래 geometry 바운딩 박스 보존을 위해 클론 후 연산
        };
    }, [geometry]);

    return (
        // [수학적/기하학적 샌드박싱]
        // mesh 내부의 position 이동(centerOffset)과 group의 scale 연산을 이중 레이어로 완벽 격리!
        // 이로써 리액트 가상돔 리렌더링 및 호버 감지 주기에서도 Three.js 행렬이 뒤엉키거나 모델이 튕겨 나가는 것을 100% 원천 차단합니다.
        <group scale={[modelScale, modelScale, modelScale]}>
            <mesh 
                geometry={geometry} 
                // 원시 값 배열 [x, y, z] 형태로 직접 바인딩하여 리렌더링 시 R3F 인스턴스 오버라이트 차단
                position={[centerOffset.x, centerOffset.y, centerOffset.z]} 
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
                {/* 3Shape 명품 덴탈 CAD 뷰어 특유의 은은하고 고품격 있는 반무광 스톤(석고) 질감 구현 */}
                {/* meshStandardMaterial(PBR)에 거칠기(roughness={0.75})와 금속성 제거(metalness={0.05})를 적용하여 하얀 반사 빛번짐을 완벽 해소합니다. */}
                <meshStandardMaterial 
                    color="#E6D7BA" // 따뜻하고 차분한 3Shape 덴탈 베이지 석고 고유 색상 매칭
                    roughness={0.75} // 번쩍이지 않고 매우 보드랍게 입체 명암이 떨어지도록 높은 거칠기 부여
                    metalness={0.05} // 금속 광택 전면 배제
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
                                
                                {/* [3Shape 명품 CAD 뷰어 4방향 정밀 다중 입체 조명 시스템 셋업] */}
                                {/* 주변광 상향 조정으로 그늘 속에 파묻히는 잇몸 굴곡의 하단 명암 대비 보존 */}
                                <ambientLight intensity={0.8} />
                                
                                {/* 1. Key Light (정면 우상단): 잇몸 및 치조골 표면의 가장 결정적인 굴곡과 마진 라인 추출 */}
                                <directionalLight 
                                    position={[5, 6, 5]} 
                                    intensity={0.75} 
                                />
                                
                                {/* 2. Fill Light (정면 좌상단): 키 라이트로 인해 반대편에 발생하는 시꺼먼 그림자 완벽 제거 */}
                                <directionalLight 
                                    position={[-5, 5, 5]} 
                                    intensity={0.65} 
                                />
                                
                                {/* 3. Rear Light (후방 상단): 잇몸 뒤편 보철물 뒤쪽의 볼륨감과 입체 경계 확보 */}
                                <directionalLight 
                                    position={[0, 5, -5]} 
                                    intensity={0.45} 
                                />
                                
                                {/* 4. Bottom Light (하단): 잇몸 밑바닥과 앞니 밑그림자가 검게 뭉개지는 현상 차단 */}
                                <directionalLight 
                                    position={[0, -5, 0]} 
                                    intensity={0.35} 
                                />
                                
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


