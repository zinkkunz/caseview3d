'use client';

import { Canvas, useLoader, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import * as THREE from 'three';
import React, { useState, useRef, Suspense, useEffect } from 'react';
import { Eye, EyeOff, HelpCircle } from 'lucide-react';

// --- 에러 경계 컴포넌트 ---
interface ErrorBoundaryProps { children: React.ReactNode; fallback: (error: Error) => React.ReactNode; }
interface ErrorBoundaryState { hasError: boolean; error: Error | null; }
class ThreeErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) { super(props); this.state = { hasError: false, error: null }; }
    static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) { console.error("[3D Demo ErrorBoundary]", error, errorInfo); }
    render() { if (this.state.hasError && this.state.error) return this.props.fallback(this.state.error); return this.props.children; }
}

// --- 카메라 추적 3포인트 조명 (Scene.tsx와 동일, GC Zero 보증) ---
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
            <directionalLight position={[10, 10, 10]} intensity={0.65 * brightness} />
            <directionalLight position={[-10, 0, 10]} intensity={0.4 * brightness} />
            <directionalLight position={[0, 10, -10]} intensity={0.4 * brightness} />
        </group>
    );
}

interface LayoutState { modelScale: number; centerOffset: THREE.Vector3; }

// --- 핵심: 단일 STL 파일을 3개 역할로 재사용 ---
// useLoader는 URL별로 캐싱하므로 demo-scan.stl 1회 로드 후 세 컴포넌트가 동일 geometry 참조
// dispose={null}로 geometry 캐시 파괴 완전 차단
function DemoModel({
    color,
    opacity,
    yOffset = 0,
    scaleMultiplier = 1.0,
}: {
    color: string;
    opacity: number;
    yOffset?: number;
    scaleMultiplier?: number;
}) {
    // [핵심] 단일 URL — 기존에 검증된 작동 파일 사용
    const geometry = useLoader(STLLoader, '/samples/demo-scan.stl');

    // [State Lock] useState 지연 초기화: 최초 마운트 시 1회만 연산 후 영구 고정
    const [layout] = useState<LayoutState>(() => {
        if (!geometry.attributes.normal) geometry.computeVertexNormals();
        if (!geometry.boundingBox) geometry.computeBoundingBox();
        const center = new THREE.Vector3();
        geometry.boundingBox?.getCenter(center);
        if (!geometry.boundingSphere) geometry.computeBoundingSphere();
        const sphere = geometry.boundingSphere;
        let scale = 1;
        if (sphere && sphere.radius > 0) {
            scale = (2.8 / sphere.radius) * scaleMultiplier;
        }
        return { modelScale: scale, centerOffset: center.clone().multiplyScalar(-1) };
    });

    const isDesign = scaleMultiplier < 0.8;

    return (
        <group
            scale={[layout.modelScale, layout.modelScale, layout.modelScale]}
            position={[0, yOffset, 0]}
        >
            <mesh
                geometry={geometry}
                dispose={null} // [R3F 캐시 보호] geometry 자동 dispose() 영구 차단
                position={[layout.centerOffset.x, layout.centerOffset.y, layout.centerOffset.z]}
            >
                {/* PBR 재질: 실제 케이스 뷰어(Model.tsx)와 동일 */}
                <meshPhysicalMaterial
                    color={color}
                    metalness={0.0}
                    roughness={isDesign ? 0.5 : 0.6}
                    specularIntensity={isDesign ? 0.4 : 0.3}
                    clearcoat={isDesign ? 0.1 : 0.0}
                    clearcoatRoughness={isDesign ? 0.2 : 0.0}
                    envMapIntensity={isDesign ? 0.5 : 0.4}
                    transparent={opacity < 1}
                    opacity={opacity}
                    side={THREE.DoubleSide}
                />
            </mesh>
        </group>
    );
}

// 색상 기본값 (ViewerClient.tsx와 동기화)
const DEFAULT_SCAN_COLOR = '#C8B06A';
const DEFAULT_DESIGN_COLOR = '#DCDCDC';

const MODELS = [
    { key: 'maxilla',  label: '상악',    color: DEFAULT_SCAN_COLOR,   yOffset: 0.3,  scaleMultiplier: 1.0 },
    { key: 'mandible', label: '하악',    color: DEFAULT_SCAN_COLOR,   yOffset: -0.3, scaleMultiplier: 1.0 },
    { key: 'design',   label: '디자인',  color: DEFAULT_DESIGN_COLOR, yOffset: 0.0,  scaleMultiplier: 0.5 },
] as const;

export default function InteractiveDemo() {
    const [mounted, setMounted] = useState(false);
    const [opacities, setOpacities] = useState<Record<string, number>>({
        maxilla: 1.0, mandible: 1.0, design: 1.0,
    });

    useEffect(() => { setMounted(true); }, []);

    const toggleVisibility = (key: string) =>
        setOpacities(prev => ({ ...prev, [key]: prev[key] > 0 ? 0 : 1.0 }));

    const changeOpacity = (key: string, val: number) =>
        setOpacities(prev => ({ ...prev, [key]: val }));

    const renderErrorFallback = (error: Error) => (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-3">
                <HelpCircle size={24} />
            </div>
            <p className="text-[11px] text-red-600 max-w-sm font-semibold bg-white border border-red-100 px-3 py-2 rounded-xl break-all">
                {error.message || "WebGL 초기화 실패"}
            </p>
            <button onClick={() => window.location.reload()} className="mt-3 px-4 py-2 bg-blue-600 text-white text-xs font-black rounded-xl">
                새로고침
            </button>
        </div>
    );

    const loadingUI = (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <span className="w-8 h-8 rounded-full border-2 border-dashed border-blue-600 animate-spin" />
            <span className="text-xs text-gray-400 font-bold uppercase tracking-widest animate-pulse">Loading 3D Engine...</span>
        </div>
    );

    const sectionCls = "py-16 bg-gray-50/50 dark:bg-black/30 border-y border-gray-100/50 dark:border-gray-800/50 transition-all";

    if (!mounted) return (
        <section id="interactive-demo" className={sectionCls}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10">
                    <div className="inline-block px-3 py-1 mb-3 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 text-[10px] font-bold tracking-wider uppercase animate-pulse">Interactive Live Preview</div>
                    <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">로그인 없이 즉시 체험하는 3D 뷰어</h2>
                    <p className="mt-3 text-sm text-gray-500 max-w-xl mx-auto font-light">상악·하악 스캔과 치아 디자인 파일을 동시에 확인하세요.</p>
                </div>
                <div className="max-w-5xl mx-auto h-[450px] md:h-[600px] w-full bg-white dark:bg-[#0A0A0A] rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,97,255,0.06)] border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center gap-3">
                    <span className="w-8 h-8 rounded-full border-2 border-dashed border-blue-600 animate-spin" />
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-widest animate-pulse">Loading 3D Engine...</span>
                </div>
            </div>
        </section>
    );

    return (
        <section id="interactive-demo" className={sectionCls}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10">
                    <div className="inline-block px-3 py-1 mb-3 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 text-[10px] font-bold tracking-wider uppercase">Interactive Live Preview</div>
                    <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">로그인 없이 즉시 체험하는 3D 뷰어</h2>
                    <p className="mt-3 text-sm text-gray-500 max-w-xl mx-auto font-light">상악·하악 스캔과 치아 디자인 파일을 동시에 확인하세요.</p>
                </div>

                <div className="max-w-5xl mx-auto h-[450px] md:h-[600px] w-full bg-white dark:bg-[#0A0A0A] rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,97,255,0.06)] border border-gray-100 dark:border-gray-800 relative overflow-hidden">
                    <ThreeErrorBoundary fallback={renderErrorFallback}>
                        <Suspense fallback={loadingUI}>
                            {/* 기존 검증 완료된 Canvas 설정값 사용 */}
                            <Canvas
                                gl={{ antialias: true }}
                                camera={{ position: [0, 3.5, 4.5], fov: 45 }}
                                className="w-full h-full cursor-grab active:cursor-grabbing"
                            >
                                {/* 기존 검증 완료된 배경색 설정 방식 */}
                                <color attach="background" args={['#f8fafc']} />

                                <ambientLight intensity={0.55} />
                                <DemoThreePointLighting brightness={1} />

                                {/* 3개 모델: 동일 STL URL로 geometry 캐시 공유 → 로딩 경합 없음 */}
                                {MODELS.map(m => (
                                    <DemoModel
                                        key={m.key}
                                        color={m.color}
                                        opacity={opacities[m.key]}
                                        yOffset={m.yOffset}
                                        scaleMultiplier={m.scaleMultiplier}
                                    />
                                ))}

                                <OrbitControls
                                    rotateSpeed={1.0}
                                    maxDistance={15}
                                    minDistance={2}
                                    makeDefault
                                />
                            </Canvas>
                        </Suspense>
                    </ThreeErrorBoundary>

                    {/* 가이드 (좌상단) */}
                    <div className="absolute top-4 left-4 z-30 pointer-events-none">
                        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-100/50 shadow-md px-3.5 py-2.5 rounded-2xl max-w-[200px]">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                                <HelpCircle size={12} className="text-blue-500" /> Control Guide
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">드래그로 회전, 휠로 확대/축소</p>
                        </div>
                    </div>

                    {/* 모델 슬라이더 (우측 하단 — 실제 ViewerUI와 동일한 UI) */}
                    <div className="absolute bottom-6 right-6 z-30 flex flex-col items-end gap-3.5">
                        {MODELS.map(m => {
                            const op = opacities[m.key];
                            return (
                                <div key={m.key} className="flex items-center gap-3">
                                    <button
                                        onClick={() => toggleVisibility(m.key)}
                                        className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all shadow-sm active:scale-90 ${op > 0 ? 'bg-gradient-to-br from-blue-500/80 to-indigo-600/80 text-white' : 'bg-white/80 text-gray-400 border border-gray-200'}`}
                                    >
                                        {op > 0 ? <Eye size={14} /> : <EyeOff size={14} />}
                                    </button>
                                    <input
                                        type="range" min="0" max="1" step="0.05"
                                        value={op}
                                        onChange={e => changeOpacity(m.key, parseFloat(e.target.value))}
                                        className="w-28 h-2 bg-white/20 rounded-full appearance-none cursor-pointer accent-blue-500 backdrop-blur-md shadow-sm"
                                    />
                                    <span className="text-[10px] font-mono font-bold text-blue-500/80 w-8 text-right">{Math.round(op * 100)}%</span>
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border bg-white/80 backdrop-blur-sm min-w-[38px] text-center ${m.key === 'design' ? 'text-indigo-600 border-indigo-200/60' : 'text-amber-800 border-amber-200/60'}`}>
                                        {m.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Demo Mode 배지 */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-gray-200/60 select-none">
                            Demo Mode
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}
