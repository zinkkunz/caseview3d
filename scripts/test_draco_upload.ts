import fs from 'fs';
import path from 'path';
import axios from 'axios';
import FormData from 'form-data';

async function testUpload() {
    try {
        // 1. Create a dummy STL file (if not exists)
        const testFilePath = path.join(__dirname, 'test_cube.stl');
        if (!fs.existsSync(testFilePath)) {
            // Minimal binary STL header (80 bytes) + count (4 bytes) + 0 triangles
            const buffer = Buffer.alloc(84);
            // Write 'test' to header
            buffer.write('test_cube', 0);
            fs.writeFileSync(testFilePath, buffer);
            console.log('Created dummy STL file');
        }

        // 2. Prepare FormData
        const form = new FormData();
        form.append('memo', 'Draco Compression Test');
        // form-data requires known length for some streams
        const fileStream = fs.createReadStream(testFilePath);
        form.append('scans', fileStream, 'test_cube.stl');

        // 3. Upload to API
        console.log('Uploading file...');
        // Note: This might fail if auth is strictly required and not mocked.
        // But for dev, we can try. 
        const response = await axios.post('http://localhost:3000/api/upload', form, {
            headers: {
                ...form.getHeaders()
            },
            validateStatus: () => true 
        });

        console.log('Upload Response Status:', response.status);
        console.log('Upload Response Data:', response.data);

    } catch (error: any) {
        console.error(' Error:', error.message);
    }
}

testUpload();
