import { Html } from '@react-three/drei';
import { useState, useRef, useEffect, useMemo } from 'react';
import { Trash2, Check, X } from 'lucide-react';
import * as THREE from 'three';

interface AnnotationPinProps {
    id: string;
    position: [number, number, number];
    normal?: [number, number, number];
    text: string;
    color?: string;
    onDelete?: (id: string) => void;
    isEditing?: boolean;
    onSave?: (text: string) => void;
    onCancel?: () => void;
}

export default function AnnotationPin({ 
    id, 
    position, 
    normal = [0, 1, 0],
    text, 
    color = '#ff0000', 
    onDelete, 
    isEditing = false,
    onSave,
    onCancel
}: AnnotationPinProps) {
    const [tempText, setTempText] = useState(text);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    // Calculate rotation to align the pin (pointing UP in local space) with the surface normal
    const rotation = useMemo(() => {
        const quaternion = new THREE.Quaternion();
        const up = new THREE.Vector3(0, 1, 0);
        const target = new THREE.Vector3(...normal).normalize();
        quaternion.setFromUnitVectors(up, target);
        
        const euler = new THREE.Euler().setFromQuaternion(quaternion);
        return [euler.x, euler.y, euler.z] as [number, number, number];
    }, [normal]);

    return (
        <group position={position} rotation={rotation}>
            {/* Real Pin Shape */}
            {/* Sphere Head */}
            <mesh position={[0, 4, 0]}>
                <sphereGeometry args={[0.8, 16, 16]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} />
            </mesh>
            {/* Needle Shaft */}
            <mesh position={[0, 2, 0]}>
                <cylinderGeometry args={[0.08, 0.08, 4, 8]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} />
            </mesh>
            {/* Tip Cone - Pointing DOWN in local space (Y-axis) */}
            {/* But our base orientation is pointing UP (+Y), so Tip is at origin [0,0,0] */}
            <mesh position={[0, 0.5, 0]} rotation={[Math.PI, 0, 0]}>
                <coneGeometry args={[0.2, 1, 8]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} />
            </mesh>

            {/* Label / Input UI */}
            {/* Using a fixed distance factor for visibility, but offset it along the normal */}
            <Html distanceFactor={40} position={[0, 5, 0]} center zIndexRange={[100, 0]}>
                <div className='flex flex-col items-center select-none'>
                    <div className='bg-white/98 backdrop-blur-md p-6 rounded-3xl shadow-2xl border-4 border-blue-500 min-w-[350px] max-w-[500px]'>
                        {isEditing ? (
                            <div className='flex flex-col gap-4'>
                                <textarea
                                    ref={inputRef}
                                    value={tempText}
                                    onChange={(e) => setTempText(e.target.value)}
                                    placeholder='메모를 입력하세요...'
                                    className='w-full text-3xl font-bold p-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-blue-500 outline-none text-gray-900'
                                    rows={3}
                                />
                                <div className='flex gap-3'>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onCancel?.(); }}
                                        className='flex-1 flex items-center justify-center gap-2 py-4 bg-gray-100 hover:bg-gray-200 rounded-2xl text-xl font-bold text-gray-600 transition-all'
                                    >
                                        <X size={24} /> 취소
                                    </button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onSave?.(tempText); }}
                                        className='flex-1 flex items-center justify-center gap-2 py-4 bg-blue-600 hover:bg-blue-700 rounded-2xl text-xl font-bold text-white shadow-lg shadow-blue-200 transition-all'
                                    >
                                        <Check size={24} /> 저장
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className='flex justify-between items-start gap-4'>
                                <p className='text-4xl font-black text-gray-900 leading-tight flex-1 break-words'>
                                    {text}
                                </p>
                                {onDelete && (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onDelete(id); }}
                                        className='p-3 hover:bg-red-50 text-red-500 rounded-xl transition-colors pointer-events-auto'
                                        title='삭제'
                                    >
                                        <Trash2 size={28} />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                    {/* Tail */}
                    <div className='w-6 h-6 bg-white border-r-4 border-b-4 border-blue-500 rotate-45 -mt-3 shadow-md' />
                </div>
            </Html>
        </group>
    );
}
