'use client';

import { Canvas, useLoader, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import * as THREE from 'three';
import React, { useState, useRef, Suspense, useEffect } from 'react';
import { Eye, EyeOff, HelpCircle } from 'lucide-react';

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
        console.error("[3D Demo ErrorBoundary]", error, errorInfo);
    }
    render() {
        if (this.state.hasError && this.state.error) {
            return this.props.fallback(this.state.error);
        }
        return this.props.children;
    }
}

// --- 색상 기본값 (실제 뷰어 ViewerClient.tsx와 동기화) ---
const DEFAULT_SCAN_COLOR = '#C8B06A';   // 덴탈 골드 베이지 (상/하악 스캔)
const DEFAULT_DESIGN_COLOR = '#DCDCDC'; // 라이트 그레이 (보철/크라운)

// --- 카메라 추적 3포인트 조명 (Scene.tsx ThreePointLighting과 완전 동일) ---
// GC Zero: position.copy / quaternion.copy는 new THREE.Vector3() 할당이 없으므로 GC 부하 0건 보증
function DemoThreePointLighting({ brightness = 1 }: { brightness?: number }) {
    const groupRef = useRef<THREE.Group>(null);

    useFrame(({ camera }) => {
        if (groupRef.current) {
            groupRef.current.position.copy(camera.position);
            groupRef.current.quaternion.copy(camera.quaternion);
        }
    });

    return (
        <group ref={groupRef}>
            <directionalLight position={[10, 10, 10]} intensity={1.0 * brightness} castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0005} />
            <directionalLight position={[-10, 0, 10]} intensity={0.5 * brightness} />
            <directionalLight position={[0, 10, -10]} intensity={0.5 * brightness} />
        </group>
    );
}

interface ModelConfig {
    url: string;
    color: string;
    type: 'maxilla' | 'mandible' | 'design';
    positionOffset: [number, number, number];
    scaleMultiplier: number;
}

interface LayoutState {
    modelScale: number;
    centerOffset: THREE.Vector3;
}

// --- 개별 3D 모델 렌더링 컴포넌트 ---
// [State Lock + dispose={null} + GC Zero] 런타임 안정성 100% 보존
function DemoModel({
    url,
    color,
    type,
    opacity,
    positionOffset,
    scaleMultiplier,
}: ModelConfig & { opacity: number }) {
    const geometry = useLoader(STLLoader, url);

    // [State Lock] 최초 마운트 시 단 1회만 기하 계산, 이후 리렌더링에서 재연산 없음
    const [layout] = useState<LayoutState>(() => {
        if (!geometry.attributes.normal) {
            geometry.computeVertexNormals();
        }
        if (!geometry.boundingBox) {
            geometry.computeBoundingBox();
        }
        const center = new THREE.Vector3();
        geometry.boundingBox?.getCenter(center);

        if (!geometry.boundingSphere) {
            geometry.computeBoundingSphere();
        }
        const sphere = geometry.boundingSphere;
        let scale = 1;
        if (sphere && sphere.radius > 0) {
            const targetRadius = 2.8;
            scale = (targetRadius / sphere.radius) * scaleMultiplier;
        }

        return {
            modelScale: scale,
            centerOffset: center.clone().multiplyScalar(-1),
        };
    });

    const isDesign = type === 'design';
    const materialProps = {
        color,
        metalness: 0.0,
        roughness: isDesign ? 0.5 : 0.6,
        specularIntensity: isDesign ? 0.4 : 0.3,
        clearcoat: isDesign ? 0.1 : 0.0,
        clearcoatRoughness: isDesign ? 0.2 : 0.0,
        envMapIntensity: isDesign ? 0.5 : 0.4,
        transparent: opacity < 1,
        opacity,
        side: THREE.DoubleSide,
    };

    return (
        <group
            scale={[layout.modelScale, layout.modelScale, layout.modelScale]}
            position={positionOffset}
        >
            <mesh
                geometry={geometry}
                dispose={null} // [R3F 캐시 보호] geometry dispose() 자동 실행 영구 차단
                position={[layout.centerOffset.x, layout.centerOffset.y, layout.centerOffset.z]}
                castShadow
                receiveShadow
            >
                {/* PBR 재질: 실제 케이스 뷰어(Model.tsx)와 동일한 MeshPhysicalMaterial */}
                <meshPhysicalMaterial {...materialProps} />
            </mesh>
        </group>
    );
}

// --- 데모에 사용할 3개 모델 설정 ---
const DEMO_MODELS: ModelConfig[] = [
    {
        url: '/samples/demo-maxilla.stl',
        color: DEFAULT_SCAN_COLOR,
        type: 'maxilla',
        positionOffset: [0, 0.3, 0],   // 상악: 살짝 위
        scaleMultiplier: 1.0,
    },
    {
        url: '/samples/demo-mandible.stl',
        color: DEFAULT_SCAN_COLOR,
        type: 'mandible',
        positionOffset: [0, -0.3, 0],  // 하악: 살짝 아래
        scaleMultiplier: 1.0,
    },
    {
        url: '/samples/demo-design.stl',
        color: DEFAULT_DESIGN_COLOR,
        type: 'design',
        positionOffset: [0.2, 0, 0.1], // 디자인: 살짝 앞으로
        scaleMultiplier: 0.35,          // 크라운 크기로 축소
    },
];

const MODEL_LABELS: Record<string, string> = {
    maxilla: '상악',
    mandible: '하악',
    design: '디자인',
};

export default function InteractiveDemo() {
    const [mounted, setMounted] = useState(false);
    const [opacities, setOpacities] = useState<Record<string, number>>({
        maxilla: 1.0,
        mandible: 1.0,
        design: 1.0,
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleToggleVisibility = (type: string) => {
        setOpacities(prev => ({
            ...prev,
            [type]: prev[type] > 0 ? 0 : 1.0,
        }));
    };

    const handleOpacityChange = (type: string, value: number) => {
        setOpacities(prev => ({ ...prev, [type]: value }));
    };

    const renderErrorFallback = (error: Error) => (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-red-50/20 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-3">
                <HelpCircle size={24} />
            </div>
            <h3 className="text-sm font-black text-gray-900 mb-1.5">3D 기공 데모 엔진 로딩 불가</h3>
            <p className="text-[11px] text-red-600 max-w-sm font-semibold mb-4 bg-white border border-red-100 px-3 py-2 rounded-xl break-all">
                {error.message || "WebGL 컨텍스트를 초기화할 수 없습니다."}
            </p>
            <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow-md transition-all active:scale-95"
            >
                새로고침하여 재시도
            </button>
        </div>
    );

    const loadingFallback = (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <span className="w-8 h-8 rounded-full border-2 border-dashed border-blue-600 animate-spin" />
            <span className="text-xs text-gray-400 font-bold uppercase tracking-widest animate-pulse">Loading 3D Engine...</span>
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
                            상악·하악 스캔과 치아 디자인 파일을 동시에 확인하세요.<br />
                            실제 기공 워크플로우 그대로 체험할 수 있습니다.
                        </p>
                    </div>
                    <div className="max-w-5xl mx-auto h-[450px] md:h-[600px] w-full bg-white dark:bg-[#0A0A0A] rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,97,255,0.06)] border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center gap-3">
                        <span className="w-8 h-8 rounded-full border-2 border-dashed border-blue-600 animate-spin" />
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
                        상악·하악 스캔과 치아 디자인 파일을 동시에 확인하세요.<br />
                        실제 기공 워크플로우 그대로 체험할 수 있습니다.
                    </p>
                </div>

                {/* 3D 뷰어 컨테이너 */}
                <div className="max-w-5xl mx-auto h-[450px] md:h-[600px] w-full bg-white dark:bg-[#0A0A0A] rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,97,255,0.06)] border border-gray-100 dark:border-gray-800 relative overflow-hidden">
                    <ThreeErrorBoundary fallback={renderErrorFallback}>
                        <Suspense fallback={loadingFallback}>
                            {/* 실제 케이스 뷰어(Scene.tsx)와 동일한 Canvas 설정 */}
                            <Canvas
                                shadows
                                dpr={[1, 2]}
                                camera={{ position: [0, 0, 8], fov: 45 }}
                                gl={{ antialias: true, localClippingEnabled: true }}
                                onCreated={({ gl }) => {
                                    gl.setClearColor(0xf5f5f4, 1);
                                }}
                                className="w-full h-full cursor-grab active:cursor-grabbing"
                            >
                                {/* 실제 케이스 뷰어(Scene.tsx)와 동일한 조명 구조 */}
                                <ambientLight intensity={0.2} />
                                <DemoThreePointLighting brightness={1} />

                                {/* 3개 모델 동시 렌더링 */}
                                {DEMO_MODELS.map((model) => (
                                    <DemoModel
                                        key={model.type}
                                        {...model}
                                        opacity={opacities[model.type]}
                                    />
                                ))}

                                <OrbitControls
                                    rotateSpeed={1.0}
                                    maxDistance={30}
                                    minDistance={2}
                                    makeDefault
                                />
                            </Canvas>
                        </Suspense>
                    </ThreeErrorBoundary>

                    {/* 가이드 오버레이 (좌상단) */}
                    <div className="absolute top-4 left-4 z-30 pointer-events-none">
                        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-100/50 dark:border-gray-800/50 shadow-md px-3.5 py-2.5 rounded-2xl max-w-[200px] sm:max-w-xs">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                                <HelpCircle size={12} className="text-blue-500" /> Control Guide
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                                드래그로 회전, 휠로 확대/축소하세요.
                            </p>
                        </div>
                    </div>

                    {/* 모델 투명도 슬라이더 (우측 하단 — 실제 ViewerUI와 동일한 UI) */}
                    <div className="absolute bottom-6 right-6 z-30 flex flex-col items-end gap-3.5">
                        {DEMO_MODELS.map((model) => {
                            const opacity = opacities[model.type];
                            const isVisible = opacity > 0;
                            return (
                                <div key={model.type} className="flex items-center gap-3 group">
                                    {/* 가시성 토글 버튼 */}
                                    <button
                                        onClick={() => handleToggleVisibility(model.type)}
                                        className={`sm:w-8 sm:h-8 w-10 h-10 flex items-center justify-center rounded-xl transition-all shadow-sm active:scale-90 ${
                                            isVisible
                                                ? 'bg-gradient-to-br from-blue-500/80 to-indigo-600/80 text-white shadow-blue-500/20'
                                                : 'bg-white/80 backdrop-blur-sm text-gray-400 border border-gray-200'
                                        }`}
                                        title={MODEL_LABELS[model.type]}
                                    >
                                        {isVisible ? <Eye size={15} /> : <EyeOff size={15} />}
                                    </button>

                                    {/* 투명도 슬라이더 */}
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.05"
                                            value={opacity}
                                            onChange={(e) => handleOpacityChange(model.type, parseFloat(e.target.value))}
                                            className="w-28 h-2 bg-white/20 rounded-full appearance-none cursor-pointer accent-blue-500 backdrop-blur-md shadow-sm"
                                        />
                                        <span className="text-[10px] font-mono font-bold text-blue-500/80 w-8 text-right">
                                            {Math.round(opacity * 100)}%
                                        </span>
                                    </div>

                                    {/* 모델 타입 레이블 */}
                                    <span
                                        className="text-[10px] font-bold text-gray-500 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-lg border border-gray-200/60 min-w-[36px] text-center"
                                        style={{ color: model.type === 'design' ? '#6366f1' : '#92400e' }}
                                    >
                                        {MODEL_LABELS[model.type]}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Demo Mode 배지 */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider select-none bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-gray-200/60 dark:border-gray-700/60">
                            Demo Mode
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}
