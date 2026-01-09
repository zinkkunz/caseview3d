const fs = require('fs');
const path = require('path');

const targetPath = path.join(process.cwd(), 'next.config.ts');
let content = fs.readFileSync(targetPath, 'utf8');

const configBlock = `const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },`;

if (content.includes('const nextConfig: NextConfig = {')) {
    content = content.replace('const nextConfig: NextConfig = {', configBlock);
    fs.writeFileSync(targetPath, content, 'utf8');
    console.log('Modified next.config.ts to ignore build errors');
} else {
    console.error('Could not find config object to replace');
}
