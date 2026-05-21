'use client';

import { useRef, useEffect } from 'react';
import { TransformControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface ClippingGizmoProps {
    enabled: boolean;
    onPlaneChange: (normal: THREE.Vector3, constant: number) => void;
    initialConstant?: number;
}

export default function ClippingGizmo({ 
    enabled, 
    onPlaneChange,
    initialConstant = 0
}: ClippingGizmoProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const { controls } = useThree() as any;

    // Initial positioning
    useEffect(() => {
        if (meshRef.current) {
            // Default: horizontal plane looking UP
            meshRef.current.position.set(0, initialConstant, 0);
            meshRef.current.rotation.set(-Math.PI / 2, 0, 0);
        }
    }, [initialConstant]);

    const handleTransform = () => {
        if (!meshRef.current) return;

        // Calculate the plane from the mesh
        // The default plane mesh normal is (0,0,1) in its local space
        const normal = new THREE.Vector3(0, 0, 1);
        normal.applyQuaternion(meshRef.current.quaternion).normalize();
        
        // Plane equation: normal . p = constant
        // Note: For THREE.Plane, the constant is negative distance from origin
        // but here we just pass it along
        const constant = normal.dot(meshRef.current.position);
        
        onPlaneChange(normal, constant);
    };

    const handleDraggingChange = (event: any) => {
        if (controls) {
            // Disable OrbitControls while dragging the gizmo
            controls.enabled = !event.value;
        }
    };

    if (!enabled) return null;

    return (
        <group>
            {/* The visual helper plane */}
            <mesh ref={meshRef} visible={enabled}>
                <planeGeometry args={[100, 100]} />
                <meshBasicMaterial 
                    color="#6366f1" 
                    transparent 
                    opacity={0.15} 
                    side={THREE.DoubleSide} 
                    depthTest={false}
                />
            </mesh>
            
            <TransformControls 
                object={meshRef.current || undefined} 
                mode="translate" 
                onObjectChange={handleTransform}
                onDraggingChange={handleDraggingChange}
                size={0.9}
            />
        </group>
    );
}
