const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, 'components/admin/Charts.tsx');
let content = fs.readFileSync(targetPath, 'utf8');

// Fix the possibly undefined percent
const oldStr = 'label={({ name, percent }) => ` ${name}: ${(percent * 100).toFixed(0)}%`}';
const newStr = 'label={({ name, percent }) => ` ${name}: ${((percent || 0) * 100).toFixed(0)}%`}';

if (content.includes(oldStr)) {
    content = content.replace(oldStr, newStr);
    fs.writeFileSync(targetPath, content, 'utf8');
    console.log('Fixed Charts.tsx');
} else {
    console.log('Pattern not found in Charts.tsx');
}
