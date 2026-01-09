const fs = require('fs');
const path = require('path');

const pPath = path.join(process.cwd(), 'package.json');
const pkg = JSON.parse(fs.readFileSync(pPath, 'utf8'));

pkg.dependencies.next = "15.1.0";
pkg.dependencies.react = "19.0.0";
pkg.dependencies["react-dom"] = "19.0.0";

fs.writeFileSync(pPath, JSON.stringify(pkg, null, 2), 'utf8');
console.log('Downgraded Next.js to 15.1.0');
