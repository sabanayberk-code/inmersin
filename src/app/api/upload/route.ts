import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { optimizeImage } from "@/skills/ImageOptimizationSkill";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file received" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // Optimize Image
        let outputBuffer = buffer;
        let extension = path.extname(file.name);

        // Only optimize if it's an image
        if (file.type.startsWith("image/")) {
            try {
                const optimized = await optimizeImage({
                    buffer: buffer,
                    targetFormat: "webp",
                    quality: 80,
                    width: 1920
                });
                outputBuffer = optimized.buffer;
                extension = ".webp";
            } catch (e) {
                console.error("Image optimization failed, saving original:", e);
            }
        }

        // Sanitize filename: ASCII alphanumeric, - and _ only
        const sanitizedOriginalName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9-_]/g, "_");
        const uuid = randomUUID();
        const uniqueFilename = `${uuid}-${sanitizedOriginalName}${extension}`;

        // Create directory structure: public/uploads/YYYY/MM
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const relativePath = `/uploads/${year}/${month}`;
        const uploadDir = path.join(process.cwd(), "public", relativePath);

        console.log(`[Upload] Processing file: ${file.name} -> ${uniqueFilename}`);
        console.log(`[Upload] Optimization: ${file.size}b -> ${outputBuffer.length}b`);

        // Ensure directory exists
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (error) {
            console.error("Error creating directory:", error);
        }

        // Save file
        const finalPath = path.join(uploadDir, uniqueFilename);
        console.log(`[Upload] Saving to: ${finalPath}`);
        await writeFile(finalPath, outputBuffer);

        // Return public URL
        const publicUrl = `${relativePath}/${uniqueFilename}`;
        console.log(`[Upload] Public URL: ${publicUrl}`);

        return NextResponse.json({
            success: true,
            url: publicUrl
        });

    } catch (error) {
        console.error("Upload handler error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
