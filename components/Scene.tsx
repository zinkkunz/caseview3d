'use client';

import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Outline } from '@react-three/postprocessing';
import { Suspense, useRef, useEffect } from 'react';
import * as THREE from 'three';
import MeasurementTool from '@/components/MeasurementTool';
import ClippingGizmo from '@/components/ClippingGizmo';

interface SceneProps {
    children: React.ReactNode;
    brightness?: number;
    targetView?: 'front' | 'left' | 'right' | 'top' | 'bottom' | null;
    measurementMode?: boolean;
    clippingGizmoEnabled?: boolean;
    onPlaneChange?: (normal: THREE.Vector3, constant: number) => void;
    initialClippingValue?: number;
}

function ThreePointLighting({ brightness = 1 }: { brightness: number }) {
    const groupRef = useRef<THREE.Group>(null);
    const { camera } = useThree();

    useFrame(() => {
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

function ViewControl({ targetView }: { targetView: 'front' | 'left' | 'right' | 'top' | 'bottom' | null }) {
    const controlsRef = useRef<any>(null);

    useFrame(() => {
        if (targetView && controlsRef.current) {
            const controls = controlsRef.current;
            const distance = 160; // Increased distance to compensate for narrower fov (25)
            const target = new THREE.Vector3(0, 0, 0);

            switch (targetView) {
                case 'front': controls.object.position.set(0, 0, distance); break;
                case 'left': controls.object.position.set(-distance, 0, 0); break;
                case 'right': controls.object.position.set(distance, 0, 0); break;
                case 'top': controls.object.position.set(0, distance, 0); break;
                case 'bottom': controls.object.position.set(0, -distance, 0); break;
            }
            controls.target.copy(target);
            controls.update();
        }
    });

    return (
        <OrbitControls
            ref={controlsRef}
            makeDefault
            enableRotate={true}
            rotateSpeed={0.8}
            enableDamping={true}
            dampingFactor={0.05}
            screenSpacePanning={false}
            target={[0, 0, 0]}
            touches={{
                ONE: THREE.TOUCH.ROTATE,
                TWO: THREE.TOUCH.DOLLY_PAN
            }}
        />
    );
}

export default function Scene({ 
    children, 
    brightness = 1, 
    targetView, 
    measurementMode = false, 
    clippingGizmoEnabled = false, 
    onPlaneChange,
    initialClippingValue = 0
}: SceneProps) {
    return (
        <div className="w-full h-full relative">
            <Canvas
                shadows
                dpr={[1, 2]}
                camera={{ position: [0, 0, 160], fov: 25 }} // Adjusted default camera position and fov to 25 for minimal distortion
                gl={{ localClippingEnabled: true }}
                onCreated={({ gl }) => {
                    gl.setClearColor(0x000000, 0);
                }}
            >
                <Suspense fallback={null}>
                    <ambientLight intensity={0.2 * brightness} />
                    <ThreePointLighting brightness={brightness} />
                    {children}
                    <MeasurementTool enabled={measurementMode} />
                    <ClippingGizmo enabled={clippingGizmoEnabled} onPlaneChange={onPlaneChange || (() => {})} initialConstant={initialClippingValue} />
                    <EffectComposer autoClear={false}>
                        <Outline blur={false} edgeStrength={10} width={1000} visibleEdgeColor={0x444444} hiddenEdgeColor={0x444444} />
                    </EffectComposer>
                    <ViewControl targetView={targetView || null} />
                </Suspense>
            </Canvas>
        </div>
    );
}

