import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request) {
    try {
        const { name, images } = await request.json();

        // Validation
        if (!name || !images || images.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Name and at least one image are required' },
                { status: 400 }
            );
        }

        // Check if person already exists
        const existingPerson = await prisma.person.findUnique({
            where: { name },
        });

        if (existingPerson) {
            return NextResponse.json(
                { success: false, error: 'Person with this name already exists' },
                { status: 409 }
            );
        }

        // Create directory for labeled images
        const labeledImagesDir = path.join(process.cwd(), 'public', 'labeled_images', name);
        await mkdir(labeledImagesDir, { recursive: true });

        // Save images
        for (let i = 0; i < images.length; i++) {
            const base64Data = images[i].replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');
            const filename = `${i + 1}.jpg`;
            const filepath = path.join(labeledImagesDir, filename);
            await writeFile(filepath, buffer);
        }

        // Save person to database
        const person = await prisma.person.create({
            data: {
                name,
                photoCount: images.length,
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Person registered successfully',
            data: person,
        });
    } catch (error) {
        console.error('Error registering person:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to register person' },
            { status: 500 }
        );
    }
}
