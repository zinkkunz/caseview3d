const fs = require('fs');
const path = require('path');

const content = `import { NodeIO } from '@gltf-transform/core';
import { draco } from '@gltf-transform/functions';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';

export async function compressModel(fileBuffer: Buffer, fileName: string): Promise<Buffer> {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext !== 'stl' && ext !== 'ply') {
        throw new Error('Unsupported extension for compression: ' + ext);
    }

    // Use system temp directory for compatibility with read-only environments (e.g. Vercel)
    const tempDir = os.tmpdir();
    const sessionId = uuidv4();
    const inputPath = path.join(tempDir, \`\${sessionId}.\${ext}\`);
    const intermediateGlbPath = path.join(tempDir, \`\${sessionId}.glb\`);
    // Python script path - might not be accessible or executable in all cloud envs
    const pythonScriptPath = path.join(process.cwd(), 'utils', 'stl_to_glb.py');

    try {
        // [Safety Check 1] Check if we can write to temp dir
        try {
            fs.writeFileSync(inputPath, fileBuffer);
        } catch (writeErr) {
            console.warn('[Compression] Cannot write to temp dir, skipping compression:', writeErr);
            throw writeErr; // Immediate fallback
        }

        // [Safety Check 2] Check if Python logic is possible
        if (!fs.existsSync(pythonScriptPath)) {
            console.warn('[Compression] Python script not found, skipping compression.');
            throw new Error('Python script missing');
        }

        let pythonCommand = 'python';
        // Simple check if python3 exists (optional, but good for some envs)
        try {
            execSync('python3 --version', { stdio: 'ignore' });
            pythonCommand = 'python3';
        } catch (e) {
            // keep default 'python' or fail later
        }

        console.log(\`[Compression] Converting \${ext} to GLB via \${pythonCommand}...\`);
        
        try {
            execSync(\`\${pythonCommand} "\${pythonScriptPath}" "\${inputPath}" "\${intermediateGlbPath}"\`, { stdio: 'inherit' });
        } catch (pyErr) {
            console.error('[Compression] Python execution failed:', pyErr);
            throw new Error('Python execution failed');
        }

        if (!fs.existsSync(intermediateGlbPath)) {
            throw new Error('Python conversion failed to produce GLB file');
        }

        // 3. Apply Draco Compression using gltf-transform
        console.log(\`[Compression] Optimizing with Draco...\`);
        
        const io = new NodeIO()
            .registerExtensions(require('@gltf-transform/extensions'))
            .registerDependencies({
                'draco3d.decoder': await import('draco3d').then(m => m.default.createDecoderModule()),
                'draco3d.encoder': await import('draco3d').then(m => m.default.createEncoderModule()),
            });

        const document = await io.read(intermediateGlbPath);

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
        console.log(\`[Compression] Success! Original: \${fs.statSync(intermediateGlbPath).size} bytes -> Compressed: \${compressedBuffer.length} bytes\`);
        
        return Buffer.from(compressedBuffer);

    } catch (err) {
        // CRITICAL: Do NOT fail the upload if compression fails.
        // Log the error and re-throw so the caller knows to use the original file.
        // OR better yet, let's just logging it here is enough if the caller expects a throw to trigger fallback?
        // Let's check the caller (route.ts). 
        // route.ts catches error and logs "Compression failed ... utilizing original". 
        // So throwing here is the Correct behavior for fallback.
        console.error('[Compression] Pipeline failed, reverting to original file:', err);
        throw err; 
    } finally {
        // Attempt cleanup
        [inputPath, intermediateGlbPath].forEach(p => {
            try {
                if (fs.existsSync(p)) fs.unlinkSync(p);
            } catch (cleanupErr) {
                // Ignore cleanup errors
            }
        });
    }
}
`;

const filePath = path.join(process.cwd(), 'utils', 'compression.ts');
try {
    fs.writeFileSync(filePath, content, { encoding: 'utf8' });
    console.log('Successfully refactored compression.ts at ' + filePath);
} catch (err) {
    console.error('Error writing file:', err);
}
