const fs = require('fs');
const path = require('path');

const targetPath = path.join(process.cwd(), 'app', 'api', 'upload', 'route.ts');
let content = fs.readFileSync(targetPath, 'utf8');

// Loose check to remove the import line
if (content.includes("import { compressModel }")) {
    content = content.replace(/import { compressModel } from '@\/utils\/compression';[\r\n]*/, '// import { compressModel } from \'@/utils/compression\';\n');
    fs.writeFileSync(targetPath, content, 'utf8');
    console.log('Successfully commented out compressModel import');
} else {
    console.log('Import not found or already removed');
}
