const fs = require('fs');
const path = require('path');

const files = ['package.json', 'next.config.ts'];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    // Strip BOM if present (charCodeAt(0) === 0xFEFF)
    if (content.charCodeAt(0) === 0xFEFF) {
      content = content.slice(1);
      console.log(`BOM removed from ${file}`);
    } else {
      console.log(`No BOM found in ${file}, but rewriting to be safe.`);
    }
    // Write back as plain UTF-8
    fs.writeFileSync(filePath, content, { encoding: 'utf8' });
  }
});
