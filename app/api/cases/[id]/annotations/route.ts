
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: caseId } = await params;
        const annotations = await prisma.annotation.findMany({
            where: { caseId },
            orderBy: { createdAt: 'asc' }
        });
        return NextResponse.json(annotations);
    } catch (error) {
        console.error('Failed to fetch annotations:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: caseId } = await params;
        const body = await request.json();
        const { x, y, z, nx, ny, nz, text, color } = body;

        if (x === undefined || y === undefined || z === undefined || !text) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const annotation = await prisma.annotation.create({
            data: {
                caseId,
                x: parseFloat(x),
                y: parseFloat(y),
                z: parseFloat(z),
                nx: parseFloat(nx || 0),
                ny: parseFloat(ny || 0),
                nz: parseFloat(nz || 0),
                text,
                color: color || "#ff0000"
            }
        });

        return NextResponse.json(annotation);
    } catch (error) {
        console.error('Failed to create annotation:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
