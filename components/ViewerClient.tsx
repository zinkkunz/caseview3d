'use client';

import { useEffect, useState, useMemo, Suspense, useRef, useCallback } from 'react';
import { AlertCircle } from 'lucide-react';
import * as THREE from 'three';
import Scene from '@/components/Scene';
import Model from '@/components/Model';
import ViewerUI from '@/components/ViewerUI';
import Spinner from '@/components/Spinner';
import ErrorBoundary from '@/components/ErrorBoundary';
import GuideModal from '@/components/GuideModal';
import ExpiredLinkPage from '@/components/ExpiredLinkPage';
import AnnotationPin from '@/components/AnnotationPin';

interface Annotation {
    id: string;
    x: number;
    y: number;
    z: number;
    nx?: number;
    ny?: number;
    nz?: number;
    text: string;
    color?: string;
}

interface CaseData {
    id: string;
    memo?: string;
    files?: { path: string; type: string }[];
    createdAt: string;
}

interface FileItem {
    path: string;
    name: string;
    type: 'maxilla' | 'mandible' | 'design';
    originalType: 'scan' | 'design';
}

const DEFAULT_COLOR = '#C8B06A';        // 덴탈 골드 베이지 (사진 기준)
const DEFAULT_DESIGN_COLOR = '#DCDCDC'; // 라이트 그레이 보철 (사진 기준)
const DEFAULT_BG_COLOR = '#f5f5f4';

export default function ViewerClient({
    id,
    settings,
    isOwner = false,
    ownerPlan = 'FREE'
}: {
    id: string;
    settings: Record<string, string>;
    isOwner?: boolean;
    ownerPlan?: string;
}) {
    const [caseData, setCaseData] = useState<CaseData | null>(null);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [fileOpacities, setFileOpacities] = useState<Record<string, number>>({});
    const [brightness, setBrightness] = useState(1.0);
    const [globalColor, setGlobalColor] = useState(DEFAULT_COLOR);
    const [designColor, setDesignColor] = useState(DEFAULT_DESIGN_COLOR);
    const [backgroundColor, setBackgroundColor] = useState(DEFAULT_BG_COLOR);
    const [showOriginalColor, setShowOriginalColor] = useState(true);
    const [targetView, setTargetView] = useState<'front' | 'left' | 'right' | 'top' | 'bottom' | null>(null);
    const [showGuide, setShowGuide] = useState(false);

    const [isClippingEnabled, setIsClippingEnabled] = useState(false);
    const [clippingValue, setClippingValue] = useState(0); 
    const [measurementMode, setMeasurementMode] = useState(false);
    const [isGizmoEnabled, setIsGizmoEnabled] = useState(false);
    const [gizmoPlane, setGizmoPlane] = useState({ normal: new THREE.Vector3(0, -1, 0), constant: 0 });
    
    const [annotations, setAnnotations] = useState<Annotation[]>([]);
    const [annotationMode, setAnnotationMode] = useState(false);
    const [pendingAnnotation, setPendingAnnotation] = useState<THREE.Vector3 | null>(null);

    const [staticOffset, setStaticOffset] = useState<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
    const [isCentered, setIsCentered] = useState(false);
    const [loadedCount, setLoadedCount] = useState(0);
    const modelGroupRef = useRef<THREE.Group>(null);

    const clippingPlanes = useMemo(() => {
        if (!isClippingEnabled) return [];
        if (isGizmoEnabled) return [new THREE.Plane(gizmoPlane.normal, gizmoPlane.constant)];
        return [new THREE.Plane(new THREE.Vector3(0, -1, 0), clippingValue)];
    }, [isClippingEnabled, clippingValue, isGizmoEnabled, gizmoPlane]);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const res = await fetch(`/api/cases/${id}`);
                const data = await res.json();
                if (data.success && data.data) {
                    setCaseData(data.data);
                } else if (res.status === 410 || data.error === 'Link Expired') {
                    setError('Link Expired');
                } else {
                    setError(data.error || 'Case not found');
                }

                if (res.ok) {
                    const annRes = await fetch(`/api/cases/${id}/annotations`);
                    if (annRes.ok) setAnnotations(await annRes.json());
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoadingData(false);
            }
        };
        fetchAll();
    }, [id]);

    const fileList = useMemo<FileItem[]>(() => {
        if (!caseData) return [];
        const files: FileItem[] = [];
        if (caseData.files) {
            caseData.files.forEach((f, idx) => {
                files.push({
                    path: f.path,
                    name: f.path.split('/').pop() || `file-${idx}`,
                    type: f.type as any,
                    originalType: f.type === 'design' ? 'design' : 'scan'
                });
            });
        }
        return files;
    }, [caseData]);

    const handleModelLoaded = useCallback(() => {
        setLoadedCount(prev => prev + 1);
    }, []);

    useEffect(() => {
        if (fileList.length > 0 && loadedCount >= fileList.length && !isCentered && modelGroupRef.current) {
            const group = modelGroupRef.current;
            const box = new THREE.Box3().setFromObject(group);
            if (!box.isEmpty()) {
                const center = new THREE.Vector3();
                box.getCenter(center);
                const offset = new THREE.Vector3(-center.x, -center.y, -center.z);
                setStaticOffset(offset);
                setIsCentered(true);
            }
        }
    }, [loadedCount, fileList.length, isCentered]);

    const handleAddAnnotation = async (text: string) => {
        if (!pendingAnnotation) return;
        try {
            const res = await fetch(`/api/cases/${id}/annotations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    x: pendingAnnotation.x, 
                    y: pendingAnnotation.y, 
                    z: pendingAnnotation.z, 
                    nx: (pendingAnnotation as any).nx, 
                    ny: (pendingAnnotation as any).ny, 
                    nz: (pendingAnnotation as any).nz, 
                    text 
                })
            });
            const newAnn = await res.json();
            setAnnotations(prev => [...prev, newAnn]);
            setPendingAnnotation(null);
            setAnnotationMode(false);
        } catch (err) { console.error(err); }
    };

    const handleDeleteAnnotation = async (annId: string) => {
        if (!confirm('침을 정말 삭제하시겠습니까?')) return;
        try {
            await fetch(`/api/annotations/${annId}`, { method: 'DELETE' });
            setAnnotations(prev => prev.filter(a => a.id !== annId));
        } catch (err) { console.error(err); }
    };

    const handleFileOpacityChange = (filePath: string, opacity: number) => {
        setFileOpacities(prev => ({ ...prev, [filePath]: opacity }));
    };

    if (error === 'Link Expired') return <ExpiredLinkPage caseId={id}  />;
    
    if (error) return (
        <div className="flex flex-col items-center justify-center h-screen bg-slate-50 font-bold p-4 text-slate-500">
            <AlertCircle className="mb-4 text-red-500 w-12 h-12"/>
            <h2 className="text-xl mb-2">데이터를 불러올 수 없습니다.</h2>
            <p className="text-sm font-normal text-slate-400">{error}</p>
        </div>
    );

    const modelsReady = fileList.length > 0 && loadedCount >= fileList.length;

    return (
        <main className="w-full h-screen relative overflow-hidden" style={{ backgroundColor }}>
            <div className={`w-full h-full transition-opacity duration-700 ${modelsReady ? 'opacity-100' : 'opacity-0'}`}>
                <Suspense fallback={null}>
                    <ErrorBoundary>
                        <Scene 
                            brightness={brightness} 
                            targetView={targetView}
                            measurementMode={measurementMode}
                            clippingGizmoEnabled={isClippingEnabled && isGizmoEnabled}
                            onPlaneChange={(n, c) => setGizmoPlane({ normal: n, constant: c })}
                            initialClippingValue={clippingValue}
                        >
                            <group position={staticOffset}>
                                <group ref={modelGroupRef}>
                                    {fileList.map((file) => (
                                        <Model
                                            key={file.path}
                                            url={file.path}
                                            visible={fileOpacities[file.path] !== undefined ? fileOpacities[file.path] > 0 : true}
                                            opacity={fileOpacities[file.path] !== undefined ? fileOpacities[file.path] : 1.0}
                                            name={file.name}
                                            type={file.type as any}
                                            customColor={file.type === 'design' ? designColor : globalColor}
                                            showOriginalColor={showOriginalColor}
                                            clippingPlanes={clippingPlanes}
                                            onLoaded={handleModelLoaded}
                                            onPointerDown={(e) => {
                                                if (annotationMode && e.intersections.length > 0) {
                                                    e.stopPropagation();
                                                    const worldPoint = e.intersections[0].point.clone();
                                                    const localPoint = worldPoint.clone().sub(staticOffset);
                                                    const normal = e.intersections[0].face.normal.clone();
                                                    (localPoint as any).nx = normal.x;
                                                    (localPoint as any).ny = normal.y;
                                                    (localPoint as any).nz = normal.z;
                                                    setPendingAnnotation(localPoint);
                                                }
                                            }}
                                        />
                                    ))}
                                </group>

                                {pendingAnnotation && (
                                    <AnnotationPin
                                        id="pending"
                                        position={[pendingAnnotation.x, pendingAnnotation.y, pendingAnnotation.z]}
                                        normal={[ (pendingAnnotation as any).nx || 0, (pendingAnnotation as any).ny || 0, (pendingAnnotation as any).nz || 1 ]}
                                        text=""
                                        isEditing={true}
                                        onSave={(text) => text.trim() ? handleAddAnnotation(text.trim()) : setPendingAnnotation(null)}
                                        onCancel={() => setPendingAnnotation(null)}
                                    />
                                )}
                            
                                {annotations.map(ann => (
                                    <AnnotationPin
                                        key={ann.id}
                                        id={ann.id}
                                        position={[ann.x, ann.y, ann.z]}
                                        normal={[ann.nx || 0, ann.ny || 0, ann.nz || 1]}
                                        text={ann.text}
                                        color={ann.color}
                                        onDelete={handleDeleteAnnotation}
                                    />
                                ))}
                            </group>
                        </Scene>
                    </ErrorBoundary>
                </Suspense>
            </div>

            <ViewerUI
                settings={settings}
                files={fileList}
                fileOpacities={fileOpacities}
                onFileOpacityChange={handleFileOpacityChange}
                brightness={brightness}
                onBrightnessChange={setBrightness}
                globalColor={globalColor}
                onGlobalColorChange={(c: string) => setGlobalColor(c)}
                designColor={designColor}
                onDesignColorChange={(c: string) => setDesignColor(c)}
                backgroundColor={backgroundColor}
                onBackgroundColorChange={setBackgroundColor}
                showOriginalColor={showOriginalColor}
                onShowOriginalColorChange={setShowOriginalColor}
                onViewChange={setTargetView}
                isGuideOpen={showGuide}
                onOpenGuide={() => setShowGuide(true)}
                onCloseGuide={() => setShowGuide(false)}
                isClippingEnabled={isClippingEnabled}
                onToggleClipping={() => setIsClippingEnabled(!isClippingEnabled)}
                clippingValue={clippingValue}
                onClippingChange={setClippingValue}
                measurementMode={measurementMode}
                onToggleMeasurement={() => setMeasurementMode(!measurementMode)}
                isGizmoEnabled={isGizmoEnabled}
                onToggleGizmo={() => setIsGizmoEnabled(!isGizmoEnabled)}
                annotationMode={annotationMode}
                onToggleAnnotationMode={setAnnotationMode}
                pendingAnnotation={pendingAnnotation}
                onCancelAnnotation={() => setPendingAnnotation(null)}
                onSubmitAnnotation={handleAddAnnotation}
                hasPLY={fileList.some(f => f.path.toLowerCase().endsWith(".ply"))}
                caseId={id}
                ownerPlan={ownerPlan}
            />
            
            {!error && (!modelsReady || loadingData) && (
                <div className="absolute inset-0 flex items-center justify-center bg-stone-100/20 backdrop-blur-[2px] z-[40]">
                    <div className="flex flex-col items-center gap-6 p-10 bg-white/90 rounded-[40px] shadow-2xl border border-white/50 animate-in fade-in zoom-in duration-300">
                        <div className="relative">
                            <Spinner size={64}  />
                            {fileList.length > 0 && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-sm font-black text-blue-600">
                                        {Math.round((loadedCount / fileList.length) * 100)}%
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="text-center">
                            <h3 className="text-xl font-black text-slate-800 mb-1">데이터 최적화 로딩 중</h3>
                            <p className="text-slate-500 font-medium">STL 파일을 GLB로 초고속 렌더링 중입니다...</p>
                        </div>
                        {fileList.length > 0 && (
                            <div className="w-64 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-blue-500 transition-all duration-300" 
                                    style={{ width: `${(loadedCount / fileList.length) * 100}%` }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </main>
    );
}
