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

// Phong Material presets for 3Shape style rendering
const MAT = {
    // Used for Scans (Maxilla/Mandible) -> Matte with soft specular highlighting
    tooth: {
        shininess: 30,
        specular: '#777777',
    },
    // Used for Design (Crowns/Restorations) -> Sharper and glossier specular edge
    restoration: {
        shininess: 45,
        specular: '#bbbbbb',
    },
    scanModel: {
        shininess: 25,
        specular: '#666666',
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

    const defaultColor = type === 'design' ? '#d4d4d4' : '#E6C9A8';
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
        clipShadows: true
    };

    if (!geometry) return null;

    return (
        <mesh
            ref={meshRef}
            geometry={geometry}
            visible={visible}
            name={type}
            castShadow
            receiveShadow
            onPointerDown={onPointerDown}
        >
            {/* Phong Material */}
            <meshPhongMaterial {...materialProps} />
        </mesh>
    );
}
