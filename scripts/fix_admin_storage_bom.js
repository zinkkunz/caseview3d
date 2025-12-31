const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '../app/admin/storage/page.tsx');

if (fs.existsSync(targetFile)) {
    let content = fs.readFileSync(targetFile, 'utf8');
    if (content.charCodeAt(0) === 0xFEFF) {
        console.log(`BOM found in ${targetFile}. Removing...`);
        content = content.slice(1);
        fs.writeFileSync(targetFile, content, { encoding: 'utf8' });
        console.log('Success.');
    } else {
        console.log('No BOM found.');
    }
} else {
    console.error('File not found:', targetFile);
}
