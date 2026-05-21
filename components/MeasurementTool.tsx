'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';

interface MeasurementToolProps {
    enabled: boolean;
}

export default function MeasurementTool({ enabled }: MeasurementToolProps) {
    const { camera, scene, raycaster, mouse, gl } = useThree();
    const [points, setPoints] = useState<THREE.Vector3[]>([]);
    const [hoverPoint, setHoverPoint] = useState<THREE.Vector3 | null>(null);

    // Reset points when disabled
    useEffect(() => {
        if (!enabled) {
            setPoints([]);
            setHoverPoint(null);
        }
    }, [enabled]);

    const startPointerPos = useRef<{ x: number; y: number } | null>(null);

    const handlePointerDown = useCallback((event: PointerEvent) => {
        if (!enabled) return;
        startPointerPos.current = { x: event.clientX, y: event.clientY };
    }, [enabled]);

    const handlePointerUp = useCallback((event: PointerEvent) => {
        if (!enabled || !startPointerPos.current) return;

        // Calculate drag distance to separate rotation from point selection
        const dx = event.clientX - startPointerPos.current.x;
        const dy = event.clientY - startPointerPos.current.y;
        const distance = Math.hypot(dx, dy);
        
        // Reset start position
        startPointerPos.current = null;

        // If dragged more than 4px, treat it as camera orbit/rotation, not a point selection
        if (distance > 4) return;

        // Update raycaster with current mouse position
        raycaster.setFromCamera(mouse, camera);
        
        // Find dental model meshes specifically in the scene to avoid clicking guide spheres, lines, or annotations
        const targetMeshes: THREE.Object3D[] = [];
        scene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh && child.name && ['maxilla', 'mandible', 'design'].includes(child.name)) {
                targetMeshes.push(child);
            }
        });

        // Find intersections only with target dental models
        const intersects = raycaster.intersectObjects(targetMeshes, true);
        const validIntersect = intersects[0]; // Nearest intersection

        if (validIntersect) {
            const newPoint = validIntersect.point.clone();
            setPoints(prev => {
                if (prev.length >= 2) return [newPoint];
                return [...prev, newPoint];
            });
        }
    }, [enabled, camera, scene, raycaster, mouse]);

    // Track mouse for hover preview (only with actual dental meshes)
    useEffect(() => {
        const handleMouseMove = () => {
            if (!enabled) return;
            raycaster.setFromCamera(mouse, camera);
            
            const targetMeshes: THREE.Object3D[] = [];
            scene.traverse((child) => {
                if ((child as THREE.Mesh).isMesh && child.name && ['maxilla', 'mandible', 'design'].includes(child.name)) {
                    targetMeshes.push(child);
                }
            });

            const intersects = raycaster.intersectObjects(targetMeshes, true);
            const validIntersect = intersects[0];
            setHoverPoint(validIntersect ? validIntersect.point : null);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [enabled, camera, scene, raycaster, mouse]);

    // Attach/Detach pointer down and up listeners
    useEffect(() => {
        const el = gl.domElement;
        if (enabled) {
            el.addEventListener('pointerdown', handlePointerDown);
            el.addEventListener('pointerup', handlePointerUp);
            el.style.cursor = 'crosshair';
        } else {
            el.removeEventListener('pointerdown', handlePointerDown);
            el.removeEventListener('pointerup', handlePointerUp);
            el.style.cursor = 'auto';
        }
        return () => {
            el.removeEventListener('pointerdown', handlePointerDown);
            el.removeEventListener('pointerup', handlePointerUp);
        };
    }, [enabled, gl, handlePointerDown, handlePointerUp]);

    const distance = useMemo(() => {
        if (points.length === 2) {
            return points[0].distanceTo(points[1]).toFixed(2);
        }
        return null;
    }, [points]);

    return (
        <group overflow-visible>
            {/* Start Point */}
            {points[0] && (
                <mesh position={points[0]}>
                    <sphereGeometry args={[0.5, 16, 16]} />
                    <meshBasicMaterial color="#ef4444" depthTest={false} transparent opacity={0.8} />
                </mesh>
            )}

            {/* End Point */}
            {points[1] && (
                <mesh position={points[1]}>
                    <sphereGeometry args={[0.5, 16, 16]} />
                    <meshBasicMaterial color="#ef4444" depthTest={false} transparent opacity={0.8} />
                </mesh>
            )}

            {/* Measurement Line */}
            {points.length === 2 && (
                <group>
                    <line>
                        <bufferGeometry attach="geometry">
                            <bufferAttribute
                                attach="attributes-position"
                                args={[new Float32Array([
                                    points[0].x, points[0].y, points[0].z,
                                    points[1].x, points[1].y, points[1].z
                                ]), 3]}
                            />
                        </bufferGeometry>
                        <lineBasicMaterial attach="material" color="#ef4444" linewidth={2} depthTest={false} transparent opacity={0.5} />
                    </line>
                    
                    {/* Label */}
                    <Html position={points[0].clone().lerp(points[1], 0.5)} center distanceFactor={40}>
                        <div className="bg-red-500 text-white px-2 py-1 rounded text-[10px] font-black shadow-lg flex items-center gap-1">
                            {distance} <span className="text-[8px] font-light">mm</span>
                        </div>
                    </Html>
                </group>
            )}

            {/* Hover Cursor */}
            {hoverPoint && points.length < 2 && (
                <mesh position={hoverPoint}>
                    <sphereGeometry args={[0.3, 16, 16]} />
                    <meshBasicMaterial color="#ef4444" transparent opacity={0.4} depthTest={false} />
                </mesh>
            )}
        </group>
    );
}
