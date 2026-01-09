const fs = require('fs');
const path = 'package.json';
let content = fs.readFileSync(path, 'utf8');
if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
    fs.writeFileSync(path, content, 'utf8');
    console.log('BOM removed');
} else {
    console.log('No BOM found');
}
