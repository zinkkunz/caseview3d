const fs = require('fs');
const path = require('path');

const content = `'use client';

export default function CaseItem({ c }) {
    return (
        <div className="p-4 border">
            <h1>Minimal Case Item</h1>
            <p>{c.id}</p>
        </div>
    );
}
`;

const filePath = path.join(process.cwd(), 'components', 'CaseItem.tsx');
try {
    fs.writeFileSync(filePath, content, { encoding: 'utf8' });
    console.log('Successfully wrote minimal component to ' + filePath);
} catch (err) {
    console.error('Error writing file:', err);
}
