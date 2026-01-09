const fs = require('fs');
const path = 'vercel.json';
const content = fs.readFileSync(path);
if (content[0] === 0xEF && content[1] === 0xBB && content[2] === 0xBF) {
    fs.writeFileSync(path, content.slice(3));
    console.log('BOM removed');
} else {
    console.log('No BOM found');
}
