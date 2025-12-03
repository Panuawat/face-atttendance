import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { unlink, rmdir, readdir } from 'fs/promises';
import path from 'path';

export async function DELETE(request, { params }) {
    try {
        const { id } = await params;
        const personId = parseInt(id);

        if (isNaN(personId)) {
            return NextResponse.json(
                { success: false, error: 'Invalid person ID' },
                { status: 400 }
            );
        }

        // Find the person first
        const person = await prisma.person.findUnique({
            where: { id: personId },
        });

        if (!person) {
            return NextResponse.json(
                { success: false, error: 'Person not found' },
                { status: 404 }
            );
        }

        const personName = person.name;

        // Delete all attendance records for this person
        await prisma.attendance.deleteMany({
            where: { name: personName },
        });

        // Delete the person from database
        await prisma.person.delete({
            where: { id: personId },
        });

        // Delete the photo directory
        const photoDir = path.join(process.cwd(), 'public', 'labeled_images', personName);

        try {
            // Read all files in the directory
            const files = await readdir(photoDir);

            // Delete each file
            for (const file of files) {
                const filePath = path.join(photoDir, file);
                await unlink(filePath);
            }

            // Delete the directory
            await rmdir(photoDir);
        } catch (fsError) {
            console.error('Error deleting files:', fsError);
            // Continue even if file deletion fails
        }

        return NextResponse.json({
            success: true,
            message: `Person ${personName} deleted successfully`,
        });
    } catch (error) {
        console.error('Error deleting person:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete person' },
            { status: 500 }
        );
    }
}
