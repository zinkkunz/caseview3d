import { NodeIO } from '@gltf-transform/core';
import { draco } from '@gltf-transform/functions';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const TMP_DIR = path.join(process.cwd(), 'tmp-conversion');

if (!fs.existsSync(TMP_DIR)) {
    fs.mkdirSync(TMP_DIR, { recursive: true });
}

export async function compressModel(fileBuffer: Buffer, fileName: string): Promise<Buffer> {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext !== 'stl' && ext !== 'ply') {
        throw new Error('Unsupported extension for compression: ' + ext);
    }

    const sessionId = uuidv4();
    const inputPath = path.join(TMP_DIR, `${sessionId}.${ext}`);
    const intermediateGlbPath = path.join(TMP_DIR, `${sessionId}.glb`);
    const pythonScriptPath = path.join(process.cwd(), 'utils', 'stl_to_glb.py');

    try {
        // 1. Write original buffer to temporary file
        fs.writeFileSync(inputPath, fileBuffer);

        // 2. Call Python script for STL -> GLB conversion
        console.log(`[Compression] Converting ${ext} to GLB via Python...`);
        execSync(`python "${pythonScriptPath}" "${inputPath}" "${intermediateGlbPath}"`, { stdio: 'inherit' });

        if (!fs.existsSync(intermediateGlbPath)) {
            throw new Error('Python conversion failed to produce GLB file');
        }

        // 3. Apply Draco Compression using gltf-transform
        console.log(`[Compression] Optimizing with Draco...`);
        
        // Initialize NodeIO with KHR_draco_mesh_compression support
        const io = new NodeIO()
            .registerExtensions(require('@gltf-transform/extensions'))
            .registerDependencies({
                'draco3d.decoder': await import('draco3d').then(m => m.default.createDecoderModule()),
                'draco3d.encoder': await import('draco3d').then(m => m.default.createEncoderModule()),
            });

        const document = await io.read(intermediateGlbPath);

        // Apply Draco compression
        await document.transform(
            draco({
                method: 'edgebreaker',
                quantizePosition: 14,
                quantizeNormal: 10,
                quantizeTexcoord: 12,
                quantizeColor: 8,
                quantizeGeneric: 8,
            })
        );

        const compressedBuffer = await io.writeBinary(document);
        console.log(`[Compression] Success! Original: ${fs.statSync(intermediateGlbPath).size} bytes -> Compressed: ${compressedBuffer.length} bytes`);
        
        return Buffer.from(compressedBuffer);

    } catch (err) {
        console.error('[Compression] Pipeline failed:', err);
        throw err;
    } finally {
        // Cleanup temporary files
        [inputPath, intermediateGlbPath].forEach(p => {
            if (fs.existsSync(p)) fs.unlinkSync(p);
        });
    }
}

