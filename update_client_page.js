const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'app/ClientPage.tsx');

// Use a simplified version of the update that replaces the handleSubmit function
let content = fs.readFileSync(filePath, 'utf8');

const newHandleSubmit = `    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!formRef.current) return;
        const formData = new FormData(formRef.current);
        const scans = formData.getAll('scans') as File[];
        const designs = formData.getAll('designs') as File[];
        const allFiles = [...scans.filter(f => f.size > 0), ...designs.filter(f => f.size > 0)];
        const memo = formData.get('memo') as string;
        
        if (allFiles.length === 0) {
            alert('최소한 하나의 파일을 선택해주세요.');
            return;
        }
        
        setUploading(true);
        setUploadProgress(0);
        setStatusMessage('업로드 준비 중... (0%)');
        
        try {
            const uploadedFiles = [];
            let completedCount = 0;
            const totalCount = allFiles.length;

            const uploadFile = async (file: File, type: 'scan' | 'design') => {
                // 1. Get Presigned URL
                const presignRes = await fetch('/api/upload/presign', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ filename: file.name, contentType: file.type || 'application/octet-stream' })
                });
                
                if (!presignRes.ok) {
                    const err = await presignRes.json();
                    throw new Error(err.error || 'Presign failed');
                }
                
                const { url, key } = await presignRes.json();
                
                // 2. Upload to R2
                const uploadRes = await fetch(url, {
                    method: 'PUT',
                    body: file,
                    headers: { 'Content-Type': file.type || 'application/octet-stream' }
                });

                if (!uploadRes.ok) throw new Error('R2 Upload failed');

                completedCount++;
                const progress = Math.round((completedCount / totalCount) * 100);
                setUploadProgress(progress);
                setStatusMessage(\`파일 업로드 중... (\${completedCount}/\${totalCount})\`);

                return { key, type, size: file.size };
            };

            const scanPromises = scans.filter(f => f.size > 0).map(f => uploadFile(f, 'scan'));
            const designPromises = designs.filter(f => f.size > 0).map(f => uploadFile(f, 'design'));

            const results = await Promise.all([...scanPromises, ...designPromises]);

            // 3. Finalize Case
            setStatusMessage('데이터 저장 중...');
            const createRes = await fetch('/api/cases/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ files: results, memo })
            });

            if (createRes.ok) {
                const data = await createRes.json();
                setUploadProgress(100);
                setStatusMessage('완료!');
                setGeneratedLink(window.location.origin + '/viewer/' + data.caseId);
            } else {
                const errData = await createRes.json();
                if (createRes.status === 403) {
                     setUpgradeReason(errData.data?.reason || 'MAX_LINKS_EXCEEDED');
                     setShowUpgradeModal(true);
                } else {
                    throw new Error(errData.error || 'Case creation failed');
                }
            }

        } catch (error: any) {
            console.error('Upload flow error:', error);
            alert('업로드 실패: ' + (error.message || '알 수 없는 오류'));
        } finally {
            if (uploadProgress < 100) setUploading(false);
        }
    };`;

// Replace the existing handleSubmit logic
// We need to match the existing function body. Since multiline regex replacement is tricky,
// we'll try to match the start of the function and replace until the end of it, 
// or simpler: reading the file and replacing the known block if exact.
// But the indentation might vary.

// Let's use string replacement if we can identify unique markers.
const startMarker = "const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {";
// The existing function is quite long (lines 29-93).
// Finding the ending brace of the function is hard without a parser.
// However, we can use the fact that the next function `const handleCopy` starts later.

const endMarker = "const handleCopy = () => {";
const parts = content.split(startMarker);
if (parts.length === 2) {
    const afterPart = parts[1];
    const splitByNextFn = afterPart.split(endMarker);
    
    if (splitByNextFn.length === 2) {
        // We found the block to replace.
        // splitByNextFn[0] contains the old body + closing brace + some whitespace
        // We will reconstruct the file.
        const newContent = parts[0] + newHandleSubmit + "\n\n    " + endMarker + splitByNextFn[1];
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log('Updated ClientPage.tsx with new upload logic');
    } else {
        console.error('Could not find end marker handleCopy');
    }
} else {
    console.error('Could not find start marker handleSubmit');
}
