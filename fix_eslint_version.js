const fs = require('fs');
const path = require('path');

const pPath = path.join(process.cwd(), 'package.json');
const pkg = JSON.parse(fs.readFileSync(pPath, 'utf8'));

if (pkg.devDependencies["eslint-config-next"] === "16.0.8") {
    pkg.devDependencies["eslint-config-next"] = "15.1.0";
    fs.writeFileSync(pPath, JSON.stringify(pkg, null, 2), 'utf8');
    console.log('Fixed eslint-config-next version');
} else {
    console.log('Version already fixed or different');
}
