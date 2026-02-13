import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file received" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = file.name.replaceAll(" ", "_");
        const uuid = randomUUID();
        const uniqueFilename = `${uuid}-${filename}`;

        // Create directory structure: public/uploads/YYYY/MM
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const relativePath = `/uploads/${year}/${month}`;
        const uploadDir = path.join(process.cwd(), "public", relativePath);

        // Ensure directory exists
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (error) {
            console.error("Error creating directory:", error);
        }

        // Save file
        const finalPath = path.join(uploadDir, uniqueFilename);
        await writeFile(finalPath, buffer);

        // Return public URL
        const publicUrl = `${relativePath}/${uniqueFilename}`;

        return NextResponse.json({
            success: true,
            url: publicUrl
        });

    } catch (error) {
        console.error("Upload handler error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
