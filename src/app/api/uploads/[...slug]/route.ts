import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

const mimeTypes: Record<string, string> = {
    ".webp": "image/webp",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".avif": "image/avif",
    ".svg": "image/svg+xml"
};

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ slug: string[] }> }
) {
    try {
        const { slug } = await context.params;
        const filePath = path.join(process.cwd(), "public", "uploads", ...slug);

        try {
            const buffer = await readFile(filePath);
            const ext = path.extname(filePath).toLowerCase();
            const contentType = mimeTypes[ext] || "application/octet-stream";

            return new NextResponse(buffer, {
                headers: {
                    "Content-Type": contentType,
                    "Cache-Control": "public, max-age=31536000, immutable"
                }
            });
        } catch (e: any) {
            if (e.code === 'ENOENT') {
                return new NextResponse("Not Found", { status: 404 });
            }
            throw e;
        }
    } catch (error) {
        console.error("Uploads API Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
