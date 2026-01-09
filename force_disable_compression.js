const fs = require('fs');
const path = require('path');

const targetPath = path.join(process.cwd(), 'app', 'api', 'upload', 'route.ts');
let content = fs.readFileSync(targetPath, 'utf8');

const toReplace = `                if (ext.toLowerCase() === '.stl' || ext.toLowerCase() === '.ply') {
                    const compressedBuffer = await compressModel(buffer, originalFileName);
                    fileToUpload = compressedBuffer as unknown as Buffer;
                    fileNameToUpload = \`\${baseFileName}.glb\`;
                    mimeType = 'model/gltf-binary';
                }`;

const replacement = `                // [DEBUG] Temporarily disable compression to isolate Cloud 500 cause
                // if (ext.toLowerCase() === '.stl' || ext.toLowerCase() === '.ply') {
                //     const compressedBuffer = await compressModel(buffer, originalFileName);
                //     fileToUpload = compressedBuffer as unknown as Buffer;
                //     fileNameToUpload = \`\${baseFileName}.glb\`;
                //     mimeType = 'model/gltf-binary';
                // }`;

if (content.includes(toReplace)) {
    content = content.replace(toReplace, replacement);
    fs.writeFileSync(targetPath, content, 'utf8');
    console.log('Successfully disabled compression in route.ts');
} else {
    // Try to find it with slightly different whitespace if exact match fails, or just log error
    // For now, let's assume exact match works as I copied it from view_file
    console.log('Target string not found, attempting loose match');
    // Regex version if needed? No, let's try exact first. 
    console.error('Could not find target code block to replace.');
    process.exit(1);
}
