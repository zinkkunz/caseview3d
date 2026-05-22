'use client';

import { useLoader } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei'; // Added useGLTF
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import * as THREE from 'three';
import { useEffect, useRef } from 'react';

interface ModelProps {
    url: string;
    visible: boolean;
    opacity: number;
    name: string;
    type: 'maxilla' | 'mandible' | 'design';
    customColor?: string;
    showOriginalColor?: boolean;
    onLoaded?: (mesh: THREE.Mesh) => void;
    useVertexColors?: boolean;
    clippingPlanes?: THREE.Plane[];
    onPointerDown?: (event: any) => void;
}

// Swapped material presets as requested
const MAT = {
    // Used for Scans (Maxilla/Mandible) -> Now Matte
    tooth: {
        metalness: 0.0,
        roughness: 0.6,
        specularIntensity: 0.3,
        clearcoat: 0.0,
        clearcoatRoughness: 0.0,
        envMapIntensity: 0.4,
    },
    // Used for Design (Crowns) -> Now Glossier
    restoration: {
        metalness: 0.0,
        roughness: 0.5,
        specularIntensity: 0.4,
        clearcoat: 0.1,
        clearcoatRoughness: 0.2,
        envMapIntensity: 0.5,
    },
    scanModel: {
        metalness: 0.0,
        roughness: 0.5,
        specularIntensity: 0.3,
        clearcoat: 0.0,
        clearcoatRoughness: 0.0,
        envMapIntensity: 0.3,
    }
} as const;

export default function Model({
    url,
    visible,
    opacity,
    type,
    customColor,
    showOriginalColor,
    onLoaded,
    useVertexColors,
    clippingPlanes,
    onPointerDown
}: ModelProps) {
    const cleanUrl = url.split('?')[0];
    const ext = cleanUrl.split('.').pop()?.toLowerCase();
    const isPLY = ext === 'ply';
    const isGLB = ext === 'glb' || ext === 'gltf';

    // Conditional Loader Logic
    let geometry: THREE.BufferGeometry | undefined;
    let gltfScene: THREE.Group | undefined;

    if (isGLB) {
        // Use useGLTF from drei which handles Draco automatically and more robustly
        // It shares the Draco decoder instance globally to avoid spawning too many workers
        const gltf = useGLTF(url); // Auto-draco handling
        gltfScene = gltf.scene;

        // Extract geometry from the first mesh in GLTF
        gltfScene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                if (!geometry) {
                    geometry = (child as THREE.Mesh).geometry;
                }
            }
        });

    } else {
        const Loader = isPLY ? PLYLoader : STLLoader;
        geometry = useLoader(Loader, url);
    }

    // Explicitly compute normals if missing (crucial for PBR)
    if (geometry && !geometry.attributes.normal) {
        geometry.computeVertexNormals();
    }

    const meshRef = useRef<THREE.Mesh>(null);

    // Notify parent when Mesh is ready
    useEffect(() => {
        if (meshRef.current && onLoaded) {
            onLoaded(meshRef.current);
        }
    }, [geometry, onLoaded]);

    const defaultColor = type === 'design' ? '#DCDCDC' : '#C8B06A'; // 사진 기준: 덴탈 골드 베이지 / 라이트 그레이
    const finalColor = customColor || defaultColor;

    // Determine material preset based on type
    const isDesign = type === 'design';
    const preset = isDesign ? MAT.restoration : MAT.tooth;

    const materialProps = {
        color: showOriginalColor && isPLY ? undefined : finalColor,
        ...preset,
        transparent: opacity < 1,
        opacity: opacity,
        vertexColors: (showOriginalColor && isPLY) || useVertexColors,
        side: THREE.DoubleSide,
        clippingPlanes: clippingPlanes && clippingPlanes.length > 0 ? clippingPlanes : null,
    };

    if (!geometry) return null;

    return (
        <mesh
            ref={meshRef}
            geometry={geometry}
            visible={visible}
            onPointerDown={onPointerDown}
        >
            {/* PBR Material */}
            <meshPhysicalMaterial {...materialProps} />
        </mesh>
    );
}
