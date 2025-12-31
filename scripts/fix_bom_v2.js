const fs = require('fs');
const path = require('path');

// Point to the parent directory (project root)
const files = ['../package.json', '../next.config.ts'];

files.forEach(relativePath => {
  const filePath = path.join(__dirname, relativePath);
  console.log(`Checking file: ${filePath}`);
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    // Check for BOM
    if (content.charCodeAt(0) === 0xFEFF) {
      console.log(`BOM DETECTED in ${relativePath}! Removing...`);
      content = content.slice(1);
      fs.writeFileSync(filePath, content, { encoding: 'utf8' });
      console.log(' File rewritten without BOM.');
    } else {
      console.log(`No BOM found in ${relativePath}.`);
    }
  } else {
    console.error(` File not found: ${filePath}`);
  }
});
